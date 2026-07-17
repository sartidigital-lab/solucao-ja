-- Least-privilege API grants. Row-level security remains the authorization
-- layer; these grants only expose the operations required by the application.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT ON TABLE public.profiles, public.professionals, public.categories,
  public.services, public.reviews, public.portfolio_images,
  public.professional_schedules TO anon, authenticated;

GRANT UPDATE ON TABLE public.profiles, public.professionals TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.services, public.portfolio_images,
  public.favorites, public.professional_schedules TO authenticated;
GRANT SELECT ON TABLE public.favorites, public.bookings, public.payments TO authenticated;
GRANT INSERT ON TABLE public.bookings, public.reviews, public.payments TO authenticated;
GRANT UPDATE ON TABLE public.bookings TO authenticated;

-- The service role is server-only and is used for verified integrations.
GRANT ALL PRIVILEGES ON TABLE public.profiles, public.professionals,
  public.categories, public.services, public.bookings, public.reviews,
  public.portfolio_images, public.favorites, public.payments,
  public.professional_schedules TO service_role;

GRANT EXECUTE ON FUNCTION public.search_professionals(
  double precision, double precision, double precision, uuid, text, boolean
) TO anon, authenticated, service_role;
