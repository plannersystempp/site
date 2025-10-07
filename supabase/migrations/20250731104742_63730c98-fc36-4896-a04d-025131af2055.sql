-- FUNÇÃO PARA LIDAR COM CONFIGURAÇÃO DE NOVOS USUÁRIOS
CREATE OR REPLACE FUNCTION public.handle_new_user_setup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com privilégios elevados para poder inserir nas tabelas
AS $$
DECLARE
  team_id_var UUID;
BEGIN
  -- Verifica se o usuário está criando uma nova empresa (com base nos metadados enviados do frontend)
  IF (NEW.raw_user_meta_data->>'isCreatingCompany')::boolean = true THEN
    
    -- Insere a nova equipe na tabela 'teams'
    INSERT INTO public.teams (name, cnpj, owner_id, invite_code)
    VALUES (
      NEW.raw_user_meta_data->>'companyName',
      NEW.raw_user_meta_data->>'companyCnpj',
      NEW.id,
      substring(md5(random()::text) from 1 for 8) -- Gera código de convite
    ) RETURNING id INTO team_id_var;
    
    -- Insere o novo usuário como 'admin' e 'approved' na tabela de membros da equipe
    INSERT INTO public.team_members (team_id, user_id, role, status)
    VALUES (
      team_id_var,
      NEW.id,
      'admin',
      'approved'
    );

    -- Atualiza o perfil do usuário para admin aprovado
    INSERT INTO public.user_profiles (user_id, email, name, role, is_approved)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'name',
      'admin', -- Admin da empresa
      true     -- Admin é automaticamente aprovado
    )
    ON CONFLICT (user_id) DO UPDATE SET
      role = 'admin',
      is_approved = true;

  ELSE
    -- Para usuários regulares ou coordenadores
    INSERT INTO public.user_profiles (user_id, email, name, role, is_approved)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'name',
      'user', -- Papel padrão inicial
      false   -- Usuários regulares começam não aprovados
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Remove qualquer gatilho antigo com o mesmo nome para evitar erros
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Cria o novo gatilho
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_setup();