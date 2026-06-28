-- Enable extensions
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS unaccent SCHEMA extensions;

-- Function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Profiles Table
CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    role text NOT NULL CHECK (role IN ('client', 'professional', 'admin')),
    full_name text NOT NULL,
    phone text,
    avatar_url text,
    city text,
    bairro text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trigger_update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. Professionals Table
CREATE TABLE public.professionals (
    id uuid REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    bio text,
    location geography(Point, 4326),
    service_area_radius_km numeric DEFAULT 10 NOT NULL,
    attendance_type text NOT NULL CHECK (attendance_type IN ('home', 'salon', 'both')),
    avg_service_time_minutes integer DEFAULT 60 NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    is_available_now boolean DEFAULT true NOT NULL,
    cpf_cnpj text UNIQUE,
    verification_status text DEFAULT 'pending' NOT NULL CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    deposit_policy text DEFAULT 'no_deposit' NOT NULL CHECK (deposit_policy IN ('no_deposit', 'fixed_amount', 'percentage')),
    deposit_fixed_amount numeric DEFAULT 0 NOT NULL,
    subscription_plan text DEFAULT 'free' NOT NULL,
    avg_rating numeric DEFAULT 0 NOT NULL,
    total_reviews integer DEFAULT 0 NOT NULL,
    slug text UNIQUE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Geospatial GiST index for fast proximity search
CREATE INDEX idx_professionals_location ON public.professionals USING gist (location);

ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trigger_update_professionals_updated_at
    BEFORE UPDATE ON public.professionals
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. Categories Table
CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    slug text NOT NULL UNIQUE,
    description text,
    icon text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 4. Services Table
CREATE TABLE public.services (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id uuid REFERENCES public.professionals(id) ON DELETE CASCADE NOT NULL,
    category_id uuid REFERENCES public.categories(id) ON DELETE RESTRICT NOT NULL,
    name text NOT NULL,
    description text,
    price numeric NOT NULL CHECK (price >= 0),
    duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trigger_update_services_updated_at
    BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. Bookings Table
CREATE TABLE public.bookings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id uuid REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
    professional_id uuid REFERENCES public.professionals(id) ON DELETE RESTRICT NOT NULL,
    service_id uuid REFERENCES public.services(id) ON DELETE RESTRICT NOT NULL,
    status text DEFAULT 'pending_confirmation' NOT NULL CHECK (status IN ('pending_confirmation', 'awaiting_deposit', 'confirmed', 'completed', 'cancelled')),
    scheduled_at timestamp with time zone NOT NULL,
    duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
    price numeric NOT NULL CHECK (price >= 0),
    deposit_amount numeric DEFAULT 0 NOT NULL CHECK (deposit_amount >= 0),
    deposit_status text DEFAULT 'none' NOT NULL CHECK (deposit_status IN ('pending', 'paid', 'refunded', 'none')),
    address text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trigger_update_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 6. Reviews Table
CREATE TABLE public.reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL UNIQUE,
    client_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    professional_id uuid REFERENCES public.professionals(id) ON DELETE CASCADE NOT NULL,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 7. Portfolio Images Table
CREATE TABLE public.portfolio_images (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id uuid REFERENCES public.professionals(id) ON DELETE CASCADE NOT NULL,
    image_url text NOT NULL,
    title text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.portfolio_images ENABLE ROW LEVEL SECURITY;

-- 8. Favorites Table
CREATE TABLE public.favorites (
    client_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    professional_id uuid REFERENCES public.professionals(id) ON DELETE CASCADE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (client_id, professional_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- 9. Payments Table
CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    amount numeric NOT NULL CHECK (amount >= 0),
    status text NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'refunded')),
    payment_method text NOT NULL,
    mercado_pago_payment_id text UNIQUE,
    mercado_pago_preference_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trigger_update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger function for creating public.profiles upon signup on auth.users
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
    -- Extract role, full_name and phone from metadata with fallbacks
    v_role := coalesce(new.raw_user_meta_data->>'role', 'client');
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

    -- Insert into public.profiles
    INSERT INTO public.profiles (id, role, full_name, phone, avatar_url, city, bairro)
    VALUES (
        new.id,
        v_role,
        v_full_name,
        v_phone,
        new.raw_user_meta_data->>'avatar_url',
        v_city,
        v_bairro
    );

    -- If professional, also create matching record in public.professionals
    IF v_role = 'professional' THEN
        INSERT INTO public.professionals (id, bio, cpf_cnpj, attendance_type)
        VALUES (new.id, v_bio, v_cpf_cnpj, 'home'); -- default type
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the profile sync on auth.users signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger function to update professional rating averages automatically on review changes
CREATE OR REPLACE FUNCTION public.handle_review_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_professional_id uuid;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_professional_id := OLD.professional_id;
    ELSE
        v_professional_id := NEW.professional_id;
    END IF;

    UPDATE public.professionals
    SET 
        avg_rating = coalesce((SELECT avg(rating)::numeric(3,2) FROM public.reviews WHERE professional_id = v_professional_id), 0),
        total_reviews = (SELECT count(*)::integer FROM public.reviews WHERE professional_id = v_professional_id)
    WHERE id = v_professional_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_professional_rating
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.handle_review_changes();


-- RLS Policies

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Professionals Policies
CREATE POLICY "Professionals profiles are viewable by everyone" ON public.professionals
    FOR SELECT USING (true);

CREATE POLICY "Professionals can update their own details" ON public.professionals
    FOR UPDATE USING (auth.uid() = id);

-- Categories Policies
CREATE POLICY "Categories are viewable by everyone" ON public.categories
    FOR SELECT USING (true);

-- Services Policies
CREATE POLICY "Services are viewable by everyone" ON public.services
    FOR SELECT USING (true);

CREATE POLICY "Professionals can manage their own services" ON public.services
    FOR ALL USING (auth.uid() = professional_id);

-- Bookings Policies
CREATE POLICY "Clients can view their own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Professionals can view their own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = professional_id);

CREATE POLICY "Clients can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Parties can update booking details" ON public.bookings
    FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = professional_id);

-- Reviews Policies
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Clients can create reviews for their bookings" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Portfolio Images Policies
CREATE POLICY "Portfolio images are viewable by everyone" ON public.portfolio_images
    FOR SELECT USING (true);

CREATE POLICY "Professionals can manage their own portfolio images" ON public.portfolio_images
    FOR ALL USING (auth.uid() = professional_id);

-- Favorites Policies
CREATE POLICY "Clients can manage their own favorites" ON public.favorites
    FOR ALL USING (auth.uid() = client_id);

-- Payments Policies
CREATE POLICY "Clients can view their own payments" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bookings
            WHERE bookings.id = payments.booking_id AND bookings.client_id = auth.uid()
        )
    );

CREATE POLICY "Professionals can view their own payments" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bookings
            WHERE bookings.id = payments.booking_id AND bookings.professional_id = auth.uid()
        )
    );
