DROP FUNCTION IF EXISTS public.search_professionals(double precision, double precision, double precision, uuid, text, boolean);

CREATE OR REPLACE FUNCTION public.search_professionals(
  client_lat double precision,
  client_lng double precision,
  max_radius_meters double precision,
  search_category_id uuid DEFAULT NULL,
  search_query text DEFAULT NULL,
  only_available_now boolean DEFAULT false
)
RETURNS TABLE (
  id uuid,
  full_name text,
  phone text,
  avatar_url text,
  city text,
  bairro text,
  bio text,
  attendance_type text,
  is_verified boolean,
  is_available_now boolean,
  avg_rating numeric,
  total_reviews bigint,
  distance_meters double precision,
  category_name text,
  services_list jsonb,
  subscription_plan text
) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM (
    SELECT DISTINCT ON (p_inner.id)
      p_inner.id,
      pr_inner.full_name::text,
      pr_inner.phone::text,
      pr_inner.avatar_url::text,
      pr_inner.city::text,
      pr_inner.bairro::text,
      p_inner.bio::text,
      p_inner.attendance_type::text,
      p_inner.is_verified,
      p_inner.is_available_now,
      p_inner.avg_rating::numeric,
      p_inner.total_reviews::bigint,
      ST_Distance(p_inner.location, ST_SetSRID(ST_MakePoint(client_lng, client_lat), 4326)::geography) AS distance_meters,
      COALESCE(cat_inner.name::text, '') AS category_name,
      COALESCE(
        (
          SELECT jsonb_agg(jsonb_build_object(
            'id', s_inner.id,
            'name', s_inner.name,
            'price', s_inner.price,
            'duration_minutes', s_inner.duration_minutes
          ))
          FROM public.services s_inner
          WHERE s_inner.professional_id = p_inner.id
        ),
        '[]'::jsonb
      ) AS services_list,
      COALESCE(p_inner.subscription_plan::text, 'gratuito') AS subscription_plan
    FROM public.professionals p_inner
    JOIN public.profiles pr_inner ON pr_inner.id = p_inner.id
    LEFT JOIN public.services s_outer ON s_outer.professional_id = p_inner.id
    LEFT JOIN public.categories cat_inner ON cat_inner.id = s_outer.category_id
    WHERE 
      ST_DWithin(p_inner.location, ST_SetSRID(ST_MakePoint(client_lng, client_lat), 4326)::geography, max_radius_meters)
      AND (NOT only_available_now OR p_inner.is_available_now = true)
      AND (search_category_id IS NULL OR s_outer.category_id = search_category_id)
      AND (
        search_query IS NULL 
        OR pr_inner.full_name ILIKE '%' || search_query || '%'
        OR p_inner.bio ILIKE '%' || search_query || '%'
        OR s_outer.name ILIKE '%' || search_query || '%'
        OR cat_inner.name ILIKE '%' || search_query || '%'
      )
    ORDER BY p_inner.id
  ) sub
  ORDER BY 
    (CASE 
      WHEN sub.subscription_plan = 'destaque' THEN 0 
      WHEN sub.subscription_plan = 'profissional' THEN 1 
      ELSE 2 
    END) ASC, 
    sub.distance_meters ASC;
END;
$$ LANGUAGE plpgsql;
