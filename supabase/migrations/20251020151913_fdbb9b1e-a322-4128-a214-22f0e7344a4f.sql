-- Migration: Fix shirt_size validation to handle empty strings
-- This migration adds a trigger to automatically convert empty strings to NULL
-- for the shirt_size column in the personnel table, preventing constraint violations.

-- 1) Create trigger function to sanitize shirt_size
CREATE OR REPLACE FUNCTION public.sanitize_personnel_shirt_size()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Convert empty string to NULL for shirt_size
  IF NEW.shirt_size = '' THEN
    NEW.shirt_size := NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 2) Create trigger on personnel table
DROP TRIGGER IF EXISTS before_personnel_shirt_size_sanitize ON public.personnel;

CREATE TRIGGER before_personnel_shirt_size_sanitize
  BEFORE INSERT OR UPDATE OF shirt_size ON public.personnel
  FOR EACH ROW
  EXECUTE FUNCTION public.sanitize_personnel_shirt_size();

-- 3) One-time cleanup: Convert existing empty strings to NULL
UPDATE public.personnel
SET shirt_size = NULL
WHERE shirt_size = '';

-- 4) Add comment for documentation
COMMENT ON FUNCTION public.sanitize_personnel_shirt_size() IS 
  'Automatically converts empty strings to NULL for shirt_size to prevent check constraint violations';

COMMENT ON TRIGGER before_personnel_shirt_size_sanitize ON public.personnel IS
  'Ensures shirt_size is NULL instead of empty string before insert/update';