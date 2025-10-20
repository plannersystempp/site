-- Fix previous function conflict by dropping and recreating with consistent signature
-- 1) Drop existing function if present
DROP FUNCTION IF EXISTS public.sync_personnel_photos();

-- 2) Recreate with RETURNS integer
CREATE OR REPLACE FUNCTION public.sync_personnel_photos()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  v_updated integer;
BEGIN
  -- Allow only super admins to run
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  WITH latest AS (
    SELECT DISTINCT ON (split_part(name, '_', 1))
           split_part(name, '_', 1) AS pid,
           name
    FROM storage.objects
    WHERE bucket_id = 'personnel-photos'
    ORDER BY split_part(name, '_', 1), created_at DESC
  )
  UPDATE public.personnel p
     SET photo_url = 'https://atogozlqfwxztjyycjoy.supabase.co/storage/v1/object/public/personnel-photos/' || l.name
  FROM latest l
  WHERE p.id::text = l.pid
    AND (p.photo_url IS NULL OR p.photo_url = '');

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_personnel_photos() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_personnel_photos() TO authenticated;

-- 3) Ensure a one-time backfill is applied (idempotent)
WITH latest AS (
  SELECT DISTINCT ON (split_part(name, '_', 1))
         split_part(name, '_', 1) AS pid,
         name
  FROM storage.objects
  WHERE bucket_id = 'personnel-photos'
  ORDER BY split_part(name, '_', 1), created_at DESC
)
UPDATE public.personnel p
SET photo_url = 'https://atogozlqfwxztjyycjoy.supabase.co/storage/v1/object/public/personnel-photos/' || l.name
FROM latest l
WHERE p.id::text = l.pid
  AND (p.photo_url IS NULL OR p.photo_url = '');
