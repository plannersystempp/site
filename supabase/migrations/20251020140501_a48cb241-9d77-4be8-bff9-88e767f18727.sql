-- Backfill automático de photo_url para personnel com fotos órfãs no storage
WITH latest_photos AS (
  SELECT DISTINCT ON (split_part(name, '_', 1))
    split_part(name, '_', 1) AS personnel_id_text,
    name,
    created_at
  FROM storage.objects
  WHERE bucket_id = 'personnel-photos'
    AND name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_'
  ORDER BY split_part(name, '_', 1), created_at DESC
)
UPDATE public.personnel p
SET photo_url = 'https://atogozlqfwxztjyycjoy.supabase.co/storage/v1/object/public/personnel-photos/' || lp.name
FROM latest_photos lp
WHERE p.photo_url IS NULL
  AND p.id::text = lp.personnel_id_text;

-- Criar função RPC para sincronização manual de fotos
CREATE OR REPLACE FUNCTION public.sync_personnel_photos()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated_count INTEGER := 0;
BEGIN
  -- Verifica se é superadmin
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Apenas superadmins podem sincronizar fotos';
  END IF;

  -- Executa o backfill
  WITH latest_photos AS (
    SELECT DISTINCT ON (split_part(name, '_', 1))
      split_part(name, '_', 1) AS personnel_id_text,
      name,
      created_at
    FROM storage.objects
    WHERE bucket_id = 'personnel-photos'
      AND name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_'
    ORDER BY split_part(name, '_', 1), created_at DESC
  )
  UPDATE public.personnel p
  SET photo_url = 'https://atogozlqfwxztjyycjoy.supabase.co/storage/v1/object/public/personnel-photos/' || lp.name
  FROM latest_photos lp
  WHERE p.photo_url IS NULL
    AND p.id::text = lp.personnel_id_text;
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  -- Log da ação
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    new_values
  ) VALUES (
    auth.uid(),
    'SYNC_PERSONNEL_PHOTOS',
    'personnel',
    jsonb_build_object('updated_count', v_updated_count)
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'updated_count', v_updated_count,
    'message', format('Sincronizadas %s fotos com sucesso', v_updated_count)
  );
END;
$$;