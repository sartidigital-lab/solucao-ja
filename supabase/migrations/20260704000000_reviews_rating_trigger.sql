-- Function to update professional ratings
CREATE OR REPLACE FUNCTION public.handle_update_professional_ratings()
RETURNS TRIGGER AS $$
DECLARE
  v_avg_rating NUMERIC;
  v_total_reviews INTEGER;
BEGIN
  -- Calculate new stats for the professional
  SELECT COALESCE(AVG(rating), 0), COUNT(id)
  INTO v_avg_rating, v_total_reviews
  FROM public.reviews
  WHERE professional_id = NEW.professional_id;

  -- Update professional table
  UPDATE public.professionals
  SET 
    avg_rating = v_avg_rating,
    total_reviews = v_total_reviews,
    updated_at = now()
  WHERE id = NEW.professional_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on reviews insert/update
CREATE OR REPLACE TRIGGER on_review_inserted_updated
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_update_professional_ratings();

-- Function to handle deletes
CREATE OR REPLACE FUNCTION public.handle_delete_professional_ratings()
RETURNS TRIGGER AS $$
DECLARE
  v_avg_rating NUMERIC;
  v_total_reviews INTEGER;
BEGIN
  SELECT COALESCE(AVG(rating), 0), COUNT(id)
  INTO v_avg_rating, v_total_reviews
  FROM public.reviews
  WHERE professional_id = OLD.professional_id;

  UPDATE public.professionals
  SET 
    avg_rating = v_avg_rating,
    total_reviews = v_total_reviews,
    updated_at = now()
  WHERE id = OLD.professional_id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_review_deleted
  AFTER DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_delete_professional_ratings();
