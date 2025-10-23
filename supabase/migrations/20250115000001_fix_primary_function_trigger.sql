-- Fix primary function trigger conflict during personnel deletion
-- The issue is that the trigger tries to promote a new primary function
-- when personnel is being deleted, but all functions should be deleted via CASCADE

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS ensure_primary_function_trigger ON public.personnel_functions;
DROP FUNCTION IF EXISTS public.ensure_primary_function();

-- Recreate the function with improved logic to handle personnel deletion
CREATE OR REPLACE FUNCTION public.ensure_primary_function()
RETURNS TRIGGER AS $$
DECLARE
  v_next_function_id UUID;
  v_personnel_exists BOOLEAN;
BEGIN
  -- If inserting and no primary function exists for this personnel, make this one primary
  IF TG_OP = 'INSERT' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.personnel_functions 
      WHERE personnel_id = NEW.personnel_id AND is_primary = true
    ) THEN
      NEW.is_primary = true;
    END IF;
    RETURN NEW;
  END IF;
  
  -- If deleting a primary function, check if personnel still exists
  IF TG_OP = 'DELETE' AND OLD.is_primary = true THEN
    -- Check if the personnel record still exists (not being deleted)
    SELECT EXISTS(
      SELECT 1 FROM public.personnel 
      WHERE id = OLD.personnel_id
    ) INTO v_personnel_exists;
    
    -- Only promote another function if personnel still exists
    IF v_personnel_exists THEN
      SELECT function_id INTO v_next_function_id
      FROM public.personnel_functions
      WHERE personnel_id = OLD.personnel_id 
        AND function_id != OLD.function_id
      ORDER BY created_at ASC
      LIMIT 1;
      
      IF v_next_function_id IS NOT NULL THEN
        UPDATE public.personnel_functions
        SET is_primary = true
        WHERE personnel_id = OLD.personnel_id 
          AND function_id = v_next_function_id;
      END IF;
    END IF;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the trigger
CREATE TRIGGER ensure_primary_function_trigger
BEFORE INSERT OR DELETE ON public.personnel_functions
FOR EACH ROW
EXECUTE FUNCTION ensure_primary_function();

-- Add comment explaining the fix
COMMENT ON FUNCTION public.ensure_primary_function() IS 
'Ensures each personnel has exactly one primary function. Fixed to handle personnel deletion properly by checking if personnel record still exists before promoting new primary function.';