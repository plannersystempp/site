-- Corrigir funções sem search_path definido
CREATE OR REPLACE FUNCTION public.seed_default_functions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Insere as funções da Área Técnica
  INSERT INTO public.functions (team_id, name, description) VALUES
  (NEW.id, 'Coordenador Técnico', 'Supervisiona todas as equipes técnicas (som, luz, vídeo). Garante a integração e o funcionamento correto de todos os equipamentos.'),
  (NEW.id, 'Técnico de Som', 'Responsável pela montagem, operação e desmontagem de todo o sistema de som (P.A., monitores, microfones, mesa de som).'),
  (NEW.id, 'Técnico de Luz', 'Opera a mesa de iluminação, programa as cenas e efeitos de luz, e cuida da montagem dos equipamentos de iluminação.'),
  (NEW.id, 'Técnico de Vídeo / VJ', 'Controla a exibição de vídeos, projeções, painéis de LED e câmeras durante o evento.'),
  (NEW.id, 'Roadie / Carregador', 'Auxilia na carga, descarga e montagem de equipamentos pesados de palco, som e luz. Essencial para a logística técnica.'),
  (NEW.id, 'Técnico de Palco', 'Organiza o palco, posiciona instrumentos, microfones e equipamentos, e dá suporte aos artistas e palestrantes durante o evento.'),
  (NEW.id, 'Eletricista', 'Responsável pela distribuição de energia elétrica para todos os equipamentos do evento, garantindo a segurança da instalação.'),
  (NEW.id, 'Geradorista', 'Opera e monitora os geradores de energia, garantindo o fornecimento contínuo de eletricidade.');

  -- Insere as funções da Área de Produção e Execução
  INSERT INTO public.functions (team_id, name, description) VALUES
  (NEW.id, 'Produtor Executivo', 'Gerente geral do evento, responsável pelo orçamento, contratações principais e tomada de decisões estratégicas.'),
  (NEW.id, 'Coordenador de Produção', 'Braço direito do produtor, coordena as diferentes frentes de trabalho (técnica, logística, atendimento) no local do evento.'),
  (NEW.id, 'Assistente de Produção', 'Dá suporte geral à equipe de produção, resolvendo problemas, fazendo compras de última hora e auxiliando em diversas tarefas.'),
  (NEW.id, 'Diretor de Palco', 'Comanda o cronograma e o fluxo de atividades no palco (entrada e saída de artistas, mudanças de cenário, anúncios).'),
  (NEW.id, 'Camarim / Hospitality', 'Responsável por cuidar dos artistas e palestrantes, garantindo que seus camarins estejam prontos e suas necessidades atendidas.');

  -- Insere as funções da Área de Logística e Operações
  INSERT INTO public.functions (team_id, name, description) VALUES
  (NEW.id, 'Coordenador de Logística', 'Gerencia o transporte de equipamentos e pessoas, montagem e desmontagem de estruturas, e a organização geral do espaço.'),
  (NEW.id, 'Montador', 'Realiza a montagem de estruturas como palcos, tendas, stands, cenografia e mobiliário.'),
  (NEW.id, 'Segurança', 'Controla o acesso, monitora o público para garantir a segurança de todos e atua em situações de emergência.'),
  (NEW.id, 'Brigadista / Socorrista', 'Profissional treinado para prestar os primeiros socorros em caso de acidentes ou emergências médicas.'),
  (NEW.id, 'Limpeza', 'Mantém a limpeza e a organização dos banheiros, áreas comuns e espaço geral do evento antes, durante e após a sua realização.');

  -- Insere as funções da Área de Atendimento e Público
  INSERT INTO public.functions (team_id, name, description) VALUES
  (NEW.id, 'Coordenador de Atendimento', 'Lidera as equipes de recepção, credenciamento e bilheteria, garantindo um bom atendimento ao público.'),
  (NEW.id, 'Recepcionista', 'Recepciona os convidados, fornece informações, orienta sobre a localização de áreas e gerencia listas de convidados.'),
  (NEW.id, 'Credenciamento', 'Responsável pela entrega de credenciais, pulseiras ou outros itens de identificação para o público e staff.'),
  (NEW.id, 'Bilheteria / Caixa', 'Opera a venda de ingressos, produtos ou fichas de consumo no local do evento.'),
  (NEW.id, 'Garçom / Copeira', 'Serve comidas e bebidas ao público, artistas ou equipe, e mantém a área de A&B (Alimentos e Bebidas) organizada.'),
  (NEW.id, 'Barman / Bartender', 'Prepara e serve drinks e bebidas no bar do evento.');
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user_setup()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.check_work_days_overlap()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Verificar se existe alguma alocação da mesma pessoa no mesmo evento
  -- com pelo menos um dia de trabalho em comum
  IF EXISTS (
    SELECT 1 
    FROM public.personnel_allocations 
    WHERE personnel_id = NEW.personnel_id 
    AND event_id = NEW.event_id 
    AND id != COALESCE(NEW.id, gen_random_uuid())  -- Usa um UUID aleatório se NEW.id for NULL
    AND work_days && NEW.work_days  -- Operador de sobreposição de arrays
  ) THEN
    RAISE EXCEPTION 'Esta pessoa já está alocada neste evento para alguns dos dias selecionados.';
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.enforce_user_profile_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  current_user_role text;
BEGIN
  -- Get current user's role
  SELECT role INTO current_user_role 
  FROM public.user_profiles 
  WHERE user_id = auth.uid() AND is_approved = true;
  
  -- Prevent non-admin users from changing role or approval status
  IF (OLD.role != NEW.role OR OLD.is_approved != NEW.is_approved) THEN
    -- Only admins and superadmins can change roles/approval
    IF current_user_role NOT IN ('admin', 'superadmin') THEN
      RAISE EXCEPTION 'Only administrators can modify user roles or approval status';
    END IF;
    
    -- Prevent admins from creating/modifying superadmin roles
    IF current_user_role = 'admin' AND NEW.role = 'superadmin' THEN
      RAISE EXCEPTION 'Admins cannot create or modify superadmin roles';
    END IF;
    
    -- Log the change
    INSERT INTO public.audit_logs (
      user_id, 
      action, 
      table_name, 
      record_id, 
      old_values, 
      new_values
    ) VALUES (
      auth.uid(),
      'PROFILE_ROLE_UPDATE',
      'user_profiles',
      NEW.id::text,
      jsonb_build_object('role', OLD.role, 'is_approved', OLD.is_approved),
      jsonb_build_object('role', NEW.role, 'is_approved', NEW.is_approved)
    );
  END IF;
  
  RETURN NEW;
END;
$function$;