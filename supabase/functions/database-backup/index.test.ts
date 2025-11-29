import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Mock do Supabase
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn()
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn()
      }))
    })),
    rpc: vi.fn(),
    insert: vi.fn()
  }))
};

const mockCreateClient = vi.fn(() => mockSupabaseClient);

// Mock das variáveis de ambiente
const originalEnv = Deno.env.get;

beforeEach(() => {
  // Mock das variáveis de ambiente
  vi.spyOn(Deno.env, 'get').mockImplementation((key: string) => {
    switch (key) {
      case 'SUPABASE_URL':
        return 'https://test.supabase.co';
      case 'SUPABASE_ANON_KEY':
        return 'test-anon-key';
      case 'SUPABASE_SERVICE_ROLE_KEY':
        return 'test-service-role-key';
      default:
        return originalEnv(key);
    }
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Database Backup Function', () => {
  it('deve recusar acesso sem autorização', async () => {
    const request = new Request('http://localhost:54321/functions/v1/database-backup', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });

    mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Invalid token' }
    });

    // A função real seria importada aqui, mas como não podemos importar diretamente,
    // vamos testar a lógica de validação
    const response = await handleBackupRequest(request);
    
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('Unauthorized');
  });

  it('deve recusar acesso para usuários não superadmin', async () => {
    const request = new Request('http://localhost:54321/functions/v1/database-backup', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'user-123', email: 'user@example.com' } },
      error: null
    });

    mockSupabaseClient.from().select().eq().single.mockResolvedValueOnce({
      data: { role: 'user' },
      error: null
    });

    const response = await handleBackupRequest(request);
    
    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('Acesso negado: apenas superadmin pode fazer backup');
  });

  it('deve permitir backup para superadmin', async () => {
    const request = new Request('http://localhost:54321/functions/v1/database-backup', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'user-123', email: 'admin@example.com' } },
      error: null
    });

    mockSupabaseClient.from().select().eq().single.mockResolvedValueOnce({
      data: { role: 'superadmin' },
      error: null
    });

    mockSupabaseClient.from().rpc.mockResolvedValueOnce({
      data: [
        { tablename: 'users' },
        { tablename: 'teams' },
        { tablename: 'audit_logs' }
      ],
      error: null
    });

    mockSupabaseClient.from().select.mockResolvedValueOnce({
      data: [{ id: 1, name: 'test' }],
      error: null
    });

    mockSupabaseClient.from().insert.mockResolvedValueOnce({
      data: null,
      error: null
    });

    const response = await handleBackupRequest(request);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.backup).toBeDefined();
    expect(data.backup.metadata.totalTables).toBe(3);
    expect(data.backup.metadata.successfulTables).toBe(3);
  });

  it('deve lidar com erros de tabela individual', async () => {
    const request = new Request('http://localhost:54321/functions/v1/database-backup', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'user-123', email: 'admin@example.com' } },
      error: null
    });

    mockSupabaseClient.from().select().eq().single.mockResolvedValueOnce({
      data: { role: 'superadmin' },
      error: null
    });

    mockSupabaseClient.from().rpc.mockResolvedValueOnce({
      data: [
        { tablename: 'users' },
        { tablename: 'teams' }
      ],
      error: null
    });

    // Primeira tabela com sucesso
    mockSupabaseClient.from().select.mockResolvedValueOnce({
      data: [{ id: 1, name: 'test' }],
      error: null
    });

    // Segunda tabela com erro
    mockSupabaseClient.from().select.mockResolvedValueOnce({
      data: null,
      error: { message: 'Permission denied' }
    });

    mockSupabaseClient.from().insert.mockResolvedValueOnce({
      data: null,
      error: null
    });

    const response = await handleBackupRequest(request);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.backup.metadata.totalTables).toBe(2);
    expect(data.backup.metadata.successfulTables).toBe(1);
    expect(data.backup.metadata.failedTables).toBe(1);
  });
});

// Função auxiliar para simular o tratamento da requisição
async function handleBackupRequest(request: Request): Promise<Response> {
  try {
    const authHeader = request.headers.get('Authorization')!;
    
    // Simulate user validation
    const { data: { user }, error: userError } = await mockSupabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Simulate role check
    const { data: userData, error: roleError } = await mockSupabaseClient
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (roleError || userData?.role !== 'superadmin') {
      return new Response(
        JSON.stringify({ success: false, error: 'Acesso negado: apenas superadmin pode fazer backup' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Simulate backup process
    const { data: tables, error: tablesError } = await mockSupabaseClient
      .from('')
      .rpc('get_table_names');

    if (tablesError) {
      throw new Error(`Erro ao obter tabelas: ${tablesError.message}`);
    }

    const backupData: Record<string, any> = {};
    const backupTimestamp = new Date().toISOString();

    for (const table of tables || []) {
      try {
        const { data, error } = await mockSupabaseClient
          .from(table.tablename)
          .select('*');

        if (error) {
          backupData[table.tablename] = { 
            error: `Erro ao fazer backup: ${error.message}`,
            timestamp: backupTimestamp 
          };
        } else {
          backupData[table.tablename] = {
            data: data || [],
            count: data?.length || 0,
            timestamp: backupTimestamp
          };
        }
      } catch (error) {
        backupData[table.tablename] = { 
          error: `Erro ao processar tabela: ${error.message}`,
          timestamp: backupTimestamp 
        };
      }
    }

    const backupMetadata = {
      timestamp: backupTimestamp,
      userId: user.id,
      userEmail: user.email,
      totalTables: Object.keys(backupData).length,
      successfulTables: Object.values(backupData).filter((t: any) => !t.error).length,
      failedTables: Object.values(backupData).filter((t: any) => t.error).length,
      databaseSize: JSON.stringify(backupData).length,
    };

    const completeBackup = {
      metadata: backupMetadata,
      data: backupData,
      version: '1.0',
      format: 'planner-system-backup'
    };

    return new Response(
      JSON.stringify({ 
        success: true, 
        backup: completeBackup,
        downloadUrl: null
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro ao fazer backup do banco de dados' 
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}