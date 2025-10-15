-- Criar bucket público para fotos de pessoal
INSERT INTO storage.buckets (id, name, public)
VALUES ('personnel-photos', 'personnel-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy: Apenas membros da equipe autenticados podem fazer upload
CREATE POLICY "Team members can upload personnel photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'personnel-photos' AND
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.user_id = auth.uid() AND tm.status = 'approved'
  )
);

-- RLS Policy: Qualquer pessoa autenticada pode visualizar fotos (bucket é público)
CREATE POLICY "Authenticated users can view personnel photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'personnel-photos');

-- RLS Policy: Apenas admins podem deletar fotos
CREATE POLICY "Only admins can delete personnel photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'personnel-photos' AND
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.user_id = auth.uid() AND up.role IN ('admin', 'superadmin')
  )
);

-- RLS Policy: Apenas admins podem atualizar fotos
CREATE POLICY "Only admins can update personnel photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'personnel-photos' AND
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.user_id = auth.uid() AND up.role IN ('admin', 'superadmin')
  )
);