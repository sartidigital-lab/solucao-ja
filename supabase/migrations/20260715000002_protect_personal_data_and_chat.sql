-- Profiles and professional records contain phone, document and precise location.
-- They are visible only to their owner or to a confirmed booking counterparty.
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Users can view their own or booked counterparty profile" ON public.profiles
  FOR SELECT TO authenticated USING (
    (select auth.uid()) = id
    OR EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE (b.client_id = (select auth.uid()) AND b.professional_id = profiles.id)
         OR (b.professional_id = (select auth.uid()) AND b.client_id = profiles.id)
    )
  );

DROP POLICY IF EXISTS "Professionals profiles are viewable by everyone" ON public.professionals;
CREATE POLICY "Users can view their own or booked professional" ON public.professionals
  FOR SELECT TO authenticated USING (
    (select auth.uid()) = id
    OR EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.professional_id = professionals.id
        AND b.client_id = (select auth.uid())
    )
  );

REVOKE SELECT ON TABLE public.profiles, public.professionals FROM anon;

-- Search is executed server-side with the service role. Its public response
-- never includes a telephone number or an exact coordinate.
REVOKE EXECUTE ON FUNCTION public.search_professionals(
  double precision, double precision, double precision, uuid, text, boolean
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_professionals(
  double precision, double precision, double precision, uuid, text, boolean
) TO service_role;

CREATE OR REPLACE FUNCTION public.search_professionals(
  client_lat double precision, client_lng double precision, max_radius_meters double precision,
  search_category_id uuid DEFAULT NULL, search_query text DEFAULT NULL,
  only_available_now boolean DEFAULT false
)
RETURNS TABLE (
  id uuid, full_name text, phone text, avatar_url text, city text, bairro text,
  bio text, attendance_type text, is_verified boolean, is_available_now boolean,
  avg_rating numeric, total_reviews bigint, distance_meters double precision,
  category_name text, services_list jsonb, subscription_plan text,
  latitude double precision, longitude double precision
)
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM (
    SELECT DISTINCT ON (p.id)
      p.id, pr.full_name::text, NULL::text, pr.avatar_url::text, pr.city::text, pr.bairro::text,
      p.bio::text, p.attendance_type::text, p.is_verified, p.is_available_now,
      p.avg_rating::numeric, p.total_reviews::bigint,
      ST_Distance(p.location, ST_SetSRID(ST_MakePoint(client_lng, client_lat), 4326)::geography),
      COALESCE(c.name::text, ''),
      COALESCE((SELECT jsonb_agg(jsonb_build_object('id', s.id, 'name', s.name, 'price', s.price, 'duration_minutes', s.duration_minutes))
        FROM public.services s WHERE s.professional_id = p.id), '[]'::jsonb),
      COALESCE(p.subscription_plan::text, 'gratuito'),
      ROUND(ST_Y(p.location::geometry)::numeric, 2)::double precision,
      ROUND(ST_X(p.location::geometry)::numeric, 2)::double precision
    FROM public.professionals p
    JOIN public.profiles pr ON pr.id = p.id
    LEFT JOIN public.services s_outer ON s_outer.professional_id = p.id
    LEFT JOIN public.categories c ON c.id = s_outer.category_id
    WHERE ST_DWithin(p.location, ST_SetSRID(ST_MakePoint(client_lng, client_lat), 4326)::geography, max_radius_meters)
      AND (NOT only_available_now OR p.is_available_now)
      AND (search_category_id IS NULL OR s_outer.category_id = search_category_id)
      AND (search_query IS NULL OR pr.full_name ILIKE '%' || search_query || '%' OR p.bio ILIKE '%' || search_query || '%' OR s_outer.name ILIKE '%' || search_query || '%' OR c.name ILIKE '%' || search_query || '%')
    ORDER BY p.id
  ) matches
  ORDER BY CASE WHEN matches.subscription_plan = 'destaque' THEN 0 WHEN matches.subscription_plan = 'profissional' THEN 1 ELSE 2 END,
    matches.distance_meters;
END;
$$;

DROP POLICY IF EXISTS "Users can create rooms they are part of" ON public.chat_rooms;
CREATE POLICY "Clients can start a chat with a professional" ON public.chat_rooms
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = client_id);

DROP POLICY IF EXISTS "Members can update messages in their room" ON public.chat_messages;
CREATE POLICY "Recipients can mark messages read" ON public.chat_messages
  FOR UPDATE TO authenticated USING (
    sender_id <> (select auth.uid())
    AND EXISTS (SELECT 1 FROM public.chat_rooms r WHERE r.id = chat_messages.room_id
      AND (r.client_id = (select auth.uid()) OR r.professional_id = (select auth.uid())))
  ) WITH CHECK (
    sender_id <> (select auth.uid())
    AND EXISTS (SELECT 1 FROM public.chat_rooms r WHERE r.id = chat_messages.room_id
      AND (r.client_id = (select auth.uid()) OR r.professional_id = (select auth.uid())))
  );

CREATE OR REPLACE FUNCTION public.enforce_chat_message_update()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.room_id IS DISTINCT FROM OLD.room_id
     OR NEW.sender_id IS DISTINCT FROM OLD.sender_id
     OR NEW.content IS DISTINCT FROM OLD.content
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
     OR OLD.is_read OR NOT NEW.is_read THEN
    RAISE EXCEPTION 'Mensagens não podem ser alteradas; apenas o destinatário pode marcá-las como lidas.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_enforce_chat_message_update ON public.chat_messages;
CREATE TRIGGER trigger_enforce_chat_message_update
  BEFORE UPDATE ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.enforce_chat_message_update();
