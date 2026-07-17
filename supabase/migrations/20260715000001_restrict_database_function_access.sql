-- Trigger functions are internal implementation details, not Data API RPCs.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_review_changes() FROM PUBLIC, anon, authenticated;

ALTER FUNCTION public.handle_updated_at() SET search_path = public;
ALTER FUNCTION public.handle_review_changes() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public, auth;
ALTER FUNCTION public.is_admin() SET search_path = public;

-- Public search already has policies on every source table, so it can respect
-- those policies instead of bypassing them as SECURITY DEFINER.
ALTER FUNCTION public.search_professionals(
  double precision, double precision, double precision, uuid, text, boolean
) SECURITY INVOKER SET search_path = public, extensions;
