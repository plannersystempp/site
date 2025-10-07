-- Fix security issue: Add SET search_path to the seed function
CREATE OR REPLACE FUNCTION public.seed_default_functions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
$$;