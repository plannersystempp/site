-- Corrigir o backfill removendo a constraint unique em functions_name_key temporariamente
-- e depois adicionando as funções para equipes que não têm funções

-- Primeiro, remover a constraint unique se existir
ALTER TABLE public.functions DROP CONSTRAINT IF EXISTS functions_name_key;

-- Agora inserir as funções padrão para equipes que não têm funções
INSERT INTO public.functions (team_id, name, description)
SELECT
    t.id,
    f.name,
    f.description
FROM
    public.teams t
CROSS JOIN (
    VALUES
        ('Coordenador Técnico', 'Supervisiona todas as equipes técnicas (som, luz, vídeo). Garante a integração e o funcionamento correto de todos os equipamentos.'),
        ('Técnico de Som', 'Responsável pela montagem, operação e desmontagem de todo o sistema de som (P.A., monitores, microfones, mesa de som).'),
        ('Técnico de Luz', 'Opera a mesa de iluminação, programa as cenas e efeitos de luz, e cuida da montagem dos equipamentos de iluminação.'),
        ('Técnico de Vídeo / VJ', 'Controla a exibição de vídeos, projeções, painéis de LED e câmeras durante o evento.'),
        ('Roadie / Carregador', 'Auxilia na carga, descarga e montagem de equipamentos pesados de palco, som e luz. Essencial para a logística técnica.'),
        ('Técnico de Palco', 'Organiza o palco, posiciona instrumentos, microfones e equipamentos, e dá suporte aos artistas e palestrantes durante o evento.'),
        ('Eletricista', 'Responsável pela distribuição de energia elétrica para todos os equipamentos do evento, garantindo a segurança da instalação.'),
        ('Geradorista', 'Opera e monitora os geradores de energia, garantindo o fornecimento contínuo de eletricidade.'),
        ('Produtor Executivo', 'Gerente geral do evento, responsável pelo orçamento, contratações principais e tomada de decisões estratégicas.'),
        ('Coordenador de Produção', 'Braço direito do produtor, coordena as diferentes frentes de trabalho (técnica, logística, atendimento) no local do evento.'),
        ('Assistente de Produção', 'Dá suporte geral à equipe de produção, resolvendo problemas, fazendo compras de última hora e auxiliando em diversas tarefas.'),
        ('Diretor de Palco', 'Comanda o cronograma e o fluxo de atividades no palco (entrada e saída de artistas, mudanças de cenário, anúncios).'),
        ('Camarim / Hospitality', 'Responsável por cuidar dos artistas e palestrantes, garantindo que seus camarins estejam prontos e suas necessidades atendidas.'),
        ('Coordenador de Logística', 'Gerencia o transporte de equipamentos e pessoas, montagem e desmontagem de estruturas, e a organização geral do espaço.'),
        ('Montador', 'Realiza a montagem de estruturas como palcos, tendas, stands, cenografia e mobiliário.'),
        ('Segurança', 'Controla o acesso, monitora o público para garantir a segurança de todos e atua em situações de emergência.'),
        ('Brigadista / Socorrista', 'Profissional treinado para prestar os primeiros socorros em caso de acidentes ou emergências médicas.'),
        ('Limpeza', 'Mantém a limpeza e a organização dos banheiros, áreas comuns e espaço geral do evento antes, durante e após a sua realização.'),
        ('Coordenador de Atendimento', 'Lidera as equipes de recepção, credenciamento e bilheteria, garantindo um bom atendimento ao público.'),
        ('Recepcionista', 'Recepciona os convidados, fornece informações, orienta sobre a localização de áreas e gerencia listas de convidados.'),
        ('Credenciamento', 'Responsável pela entrega de credenciais, pulseiras ou outros itens de identificação para o público e staff.'),
        ('Bilheteria / Caixa', 'Opera a venda de ingressos, produtos ou fichas de consumo no local do evento.'),
        ('Garçom / Copeira', 'Serve comidas e bebidas ao público, artistas ou equipe, e mantém a área de A&B (Alimentos e Bebidas) organizada.'),
        ('Barman / Bartender', 'Prepara e serve drinks e bebidas no bar do evento.')
) AS f(name, description)
WHERE
    NOT EXISTS (
        SELECT 1
        FROM public.functions func
        WHERE func.team_id = t.id
    );