-- Função para obter nomes das tabelas do schema público
CREATE OR REPLACE FUNCTION get_table_names()
RETURNS TABLE(tablename text) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT table_name::text
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name NOT LIKE 'pg_%'
    AND table_name NOT LIKE 'sql_%'
    ORDER BY table_name;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_table_names() TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_names() TO service_role;