-- Security hardening: roles, mutable business state and payment creation.

-- Only the trusted app_metadata claim may authorize an administrator. The trigger
-- below writes the same vetted role to app_metadata at signup.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- Backfill existing accounts once, before application authorization switches to
-- app_metadata. Future role changes must be performed with the Admin API.
UPDATE auth.users AS u
SET raw_app_meta_data = COALESCE(u.raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object('role', p.role)
FROM public.profiles AS p
WHERE p.id = u.id
  AND p.role IN ('client', 'professional', 'admin')
  AND COALESCE(u.raw_app_meta_data ->> 'role', '') IS DISTINCT FROM p.role;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role text;
    v_full_name text;
    v_phone text;
    v_city text;
    v_bairro text;
    v_bio text;
    v_cpf_cnpj text;
BEGIN
    -- user_metadata is user-controlled. It may select the public onboarding
    -- path (client/professional), but can never grant administration.
    v_role := CASE
      WHEN new.raw_user_meta_data ->> 'role' = 'professional' THEN 'professional'
      ELSE 'client'
    END;
    v_full_name := coalesce(
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'name',
        split_part(new.email, '@', 1)
    );
    v_phone := new.raw_user_meta_data->>'phone';
    v_city := new.raw_user_meta_data->>'city';
    v_bairro := new.raw_user_meta_data->>'bairro';
    v_bio := new.raw_user_meta_data->>'bio';
    v_cpf_cnpj := new.raw_user_meta_data->>'cpf_cnpj';

    INSERT INTO public.profiles (id, role, full_name, phone, avatar_url, city, bairro)
    VALUES (new.id, v_role, v_full_name, v_phone, new.raw_user_meta_data->>'avatar_url', v_city, v_bairro);

    IF v_role = 'professional' THEN
        INSERT INTO public.professionals (id, bio, cpf_cnpj, attendance_type)
        VALUES (new.id, v_bio, v_cpf_cnpj, 'home');
    END IF;

    UPDATE auth.users
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb)
      || jsonb_build_object('role', v_role)
    WHERE id = new.id;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'O papel da conta só pode ser alterado pela administração.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trigger_prevent_profile_role_change ON public.profiles;
CREATE TRIGGER trigger_prevent_profile_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_change();

CREATE OR REPLACE FUNCTION public.protect_professional_system_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF (select auth.uid()) = OLD.id
     AND current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role'
     AND (
       NEW.is_verified IS DISTINCT FROM OLD.is_verified OR
       NEW.verification_status IS DISTINCT FROM OLD.verification_status OR
       NEW.subscription_plan IS DISTINCT FROM OLD.subscription_plan OR
       NEW.avg_rating IS DISTINCT FROM OLD.avg_rating OR
       NEW.total_reviews IS DISTINCT FROM OLD.total_reviews
     ) THEN
    RAISE EXCEPTION 'Campos de verificação, plano e avaliações são gerenciados pela plataforma.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trigger_protect_professional_system_fields ON public.professionals;
CREATE TRIGGER trigger_protect_professional_system_fields
  BEFORE UPDATE ON public.professionals
  FOR EACH ROW EXECUTE FUNCTION public.protect_professional_system_fields();

-- Do not use user_metadata in authorization policies.
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can update professionals" ON public.professionals;
DROP POLICY IF EXISTS "Admins can delete professionals" ON public.professionals;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

CREATE POLICY "Admins can insert categories" ON public.categories
  FOR INSERT TO authenticated WITH CHECK ((select public.is_admin()));
CREATE POLICY "Admins can update categories" ON public.categories
  FOR UPDATE TO authenticated USING ((select public.is_admin())) WITH CHECK ((select public.is_admin()));
CREATE POLICY "Admins can delete categories" ON public.categories
  FOR DELETE TO authenticated USING ((select public.is_admin()));
CREATE POLICY "Admins can update professionals" ON public.professionals
  FOR UPDATE TO authenticated USING ((select public.is_admin())) WITH CHECK ((select public.is_admin()));
CREATE POLICY "Admins can delete professionals" ON public.professionals
  FOR DELETE TO authenticated USING ((select public.is_admin()));
CREATE POLICY "Admins can update profiles" ON public.profiles
  FOR UPDATE TO authenticated USING ((select public.is_admin())) WITH CHECK ((select public.is_admin()));
CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE TO authenticated USING ((select public.is_admin()));

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Professionals can update their own details" ON public.professionals;
CREATE POLICY "Professionals can update their own details" ON public.professionals
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE OR REPLACE FUNCTION public.enforce_booking_transition()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid := (select auth.uid());
  v_is_service boolean := current_setting('request.jwt.claim.role', true) = 'service_role';
BEGIN
  IF v_is_service THEN
    RETURN NEW;
  END IF;

  IF v_user_id = OLD.client_id THEN
    IF NEW.client_id IS DISTINCT FROM OLD.client_id
       OR NEW.professional_id IS DISTINCT FROM OLD.professional_id
       OR NEW.service_id IS DISTINCT FROM OLD.service_id
       OR NEW.scheduled_at IS DISTINCT FROM OLD.scheduled_at
       OR NEW.duration_minutes IS DISTINCT FROM OLD.duration_minutes
       OR NEW.price IS DISTINCT FROM OLD.price
       OR NEW.deposit_amount IS DISTINCT FROM OLD.deposit_amount
       OR NEW.deposit_status IS DISTINCT FROM OLD.deposit_status
       OR NEW.address IS DISTINCT FROM OLD.address
       OR NEW.notes IS DISTINCT FROM OLD.notes
       OR NEW.status <> 'cancelled'
       OR OLD.status NOT IN ('pending_confirmation', 'awaiting_deposit', 'confirmed') THEN
      RAISE EXCEPTION 'O cliente só pode cancelar um agendamento ativo.';
    END IF;
  ELSIF v_user_id = OLD.professional_id THEN
    IF NEW.client_id IS DISTINCT FROM OLD.client_id
       OR NEW.professional_id IS DISTINCT FROM OLD.professional_id
       OR NEW.service_id IS DISTINCT FROM OLD.service_id
       OR NEW.scheduled_at IS DISTINCT FROM OLD.scheduled_at
       OR NEW.duration_minutes IS DISTINCT FROM OLD.duration_minutes
       OR NEW.price IS DISTINCT FROM OLD.price
       OR NEW.deposit_amount IS DISTINCT FROM OLD.deposit_amount
       OR NEW.deposit_status IS DISTINCT FROM OLD.deposit_status
       OR NEW.address IS DISTINCT FROM OLD.address
       OR NEW.notes IS DISTINCT FROM OLD.notes
       OR NOT (
         (OLD.status = 'pending_confirmation' AND NEW.status IN ('confirmed', 'cancelled')) OR
         (OLD.status = 'awaiting_deposit' AND NEW.status = 'cancelled') OR
         (OLD.status = 'confirmed' AND NEW.status IN ('completed', 'cancelled'))
       ) THEN
      RAISE EXCEPTION 'Transição de agendamento não permitida.';
    END IF;
  ELSE
    RAISE EXCEPTION 'Não autorizado a atualizar este agendamento.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trigger_enforce_booking_transition ON public.bookings;
CREATE TRIGGER trigger_enforce_booking_transition
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.enforce_booking_transition();

DROP POLICY IF EXISTS "Parties can update booking details" ON public.bookings;
CREATE POLICY "Parties can update booking details" ON public.bookings
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = client_id OR (select auth.uid()) = professional_id)
  WITH CHECK ((select auth.uid()) = client_id OR (select auth.uid()) = professional_id);

-- Clients may create only their own pending payment row. Approval is reserved
-- for a verified Mercado Pago webhook authenticated with the service role.
CREATE POLICY "Clients can create pending payments" ON public.payments
  FOR INSERT TO authenticated
  WITH CHECK (
    status = 'pending'
    AND EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = payments.booking_id
        AND bookings.client_id = (select auth.uid())
        AND bookings.deposit_amount = payments.amount
        AND bookings.deposit_status = 'pending'
    )
  );
