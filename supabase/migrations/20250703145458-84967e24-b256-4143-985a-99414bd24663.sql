
-- Criar tabela para logs de auditoria
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Política para permitir que admins vejam todos os logs
CREATE POLICY "Admins can view all audit logs" 
ON public.audit_logs 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'coordenador') 
    AND is_approved = true
  )
);

-- Política para permitir que usuários vejam apenas seus próprios logs
CREATE POLICY "Users can view their own audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (user_id = auth.uid());

-- Política para permitir inserção de logs (necessário para auditoria)
CREATE POLICY "Allow audit log insertion" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (user_id = auth.uid());
