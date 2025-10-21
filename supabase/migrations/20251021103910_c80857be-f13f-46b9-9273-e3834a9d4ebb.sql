-- Tabela principal de reportes de erro
CREATE TABLE IF NOT EXISTS public.error_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_number TEXT UNIQUE NOT NULL,
  
  -- Relações
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  
  -- Informações do Usuário (captura manual)
  what_trying_to_do TEXT NOT NULL,
  what_happened TEXT NOT NULL,
  steps_to_reproduce TEXT,
  urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
  
  -- Dados Técnicos Automáticos (JSONB para flexibilidade)
  technical_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Screenshot e Anotações
  screenshot_url TEXT,
  screenshot_annotations JSONB,
  
  -- Metadados e Status
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'investigating', 'resolved', 'wont_fix', 'duplicate')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_notes TEXT,
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_error_reports_user_id ON public.error_reports(user_id);
CREATE INDEX idx_error_reports_team_id ON public.error_reports(team_id);
CREATE INDEX idx_error_reports_status ON public.error_reports(status);
CREATE INDEX idx_error_reports_created_at ON public.error_reports(created_at DESC);
CREATE INDEX idx_error_reports_report_number ON public.error_reports(report_number);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_error_reports_updated_at
  BEFORE UPDATE ON public.error_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para gerar número único do reporte
CREATE OR REPLACE FUNCTION generate_error_report_number()
RETURNS TEXT AS $$
DECLARE
  v_number TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    v_number := 'ER-' || LPAD(floor(random() * 99999 + 1)::TEXT, 5, '0');
    SELECT EXISTS(SELECT 1 FROM public.error_reports WHERE report_number = v_number) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;
  RETURN v_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para auto-gerar report_number
CREATE OR REPLACE FUNCTION set_error_report_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.report_number IS NULL THEN
    NEW.report_number := generate_error_report_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_error_report
  BEFORE INSERT ON public.error_reports
  FOR EACH ROW
  EXECUTE FUNCTION set_error_report_number();

-- RLS Policies
ALTER TABLE public.error_reports ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver seus próprios reportes
CREATE POLICY "Users can view own error reports"
  ON public.error_reports FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem criar reportes
CREATE POLICY "Users can create error reports"
  ON public.error_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins da equipe podem ver todos os reportes da equipe
CREATE POLICY "Team admins can view team error reports"
  ON public.error_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = error_reports.team_id
        AND tm.user_id = auth.uid()
        AND tm.role = 'admin'
        AND tm.status = 'approved'
    )
  );

-- Superadmins podem ver e modificar todos os reportes
CREATE POLICY "Superadmins can manage all error reports"
  ON public.error_reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid()
        AND up.role = 'superadmin'
    )
  );

COMMENT ON TABLE public.error_reports IS 'Armazena reportes de erros enviados pelos usuários do sistema';