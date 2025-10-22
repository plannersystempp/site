-- Habilitar Realtime para a tabela personnel
-- Garante que toda a linha é capturada em atualizações
ALTER TABLE public.personnel REPLICA IDENTITY FULL;

-- Adicionar tabela à publicação de realtime do Supabase
ALTER PUBLICATION supabase_realtime ADD TABLE public.personnel;