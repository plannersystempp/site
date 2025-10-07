-- Política para permitir que membros da equipe vejam perfis de outros membros
CREATE POLICY "Team members can view team profiles OR super admin" 
ON public.user_profiles 
FOR SELECT 
USING (
  auth.uid() = user_id OR  -- Próprio perfil
  is_super_admin() OR      -- Super admin
  EXISTS (
    SELECT 1 
    FROM public.team_members tm1 
    JOIN public.team_members tm2 ON tm1.team_id = tm2.team_id 
    WHERE tm1.user_id = auth.uid() 
    AND tm2.user_id = user_profiles.user_id 
    AND tm1.status = 'approved' 
    AND tm2.status = 'approved'
  )  -- Membros da mesma equipe
);