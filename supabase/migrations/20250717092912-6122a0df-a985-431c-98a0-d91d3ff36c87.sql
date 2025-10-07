-- Inserir perfil para o usuário admin se não existir
INSERT INTO public.user_profiles (user_id, email, name, role, is_approved)
VALUES (
  'fa84536a-b619-442e-a822-98a92740a2b6',
  'admin@exemplo.com', 
  'Administrador',
  'admin',
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  is_approved = EXCLUDED.is_approved;