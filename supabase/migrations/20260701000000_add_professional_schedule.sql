-- Create professional_schedules table
CREATE TABLE IF NOT EXISTS public.professional_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_professional_day_slot UNIQUE (professional_id, day_of_week, start_time, end_time),
  CONSTRAINT start_before_end CHECK (start_time < end_time)
);

-- Enable RLS
ALTER TABLE public.professional_schedules ENABLE ROW LEVEL SECURITY;

-- Policies for professional_schedules
CREATE POLICY "Allow public read access to professional_schedules"
  ON public.professional_schedules FOR SELECT
  USING (true);

CREATE POLICY "Allow professional to insert their own schedules"
  ON public.professional_schedules FOR INSERT
  WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Allow professional to update their own schedules"
  ON public.professional_schedules FOR UPDATE
  USING (auth.uid() = professional_id)
  WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Allow professional to delete their own schedules"
  ON public.professional_schedules FOR DELETE
  USING (auth.uid() = professional_id);

-- Create trigger for updated_at
CREATE OR REPLACE TRIGGER set_professional_schedules_updated_at
  BEFORE UPDATE ON public.professional_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
