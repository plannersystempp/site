import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DatabaseBackupTab } from '@/components/admin/DatabaseBackupTab';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Mock do Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}));

// Mock do toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

// Mock do navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined)
  }
});

// Mock do URL e Blob para download
Object.assign(global, {
  URL: {
    createObjectURL: vi.fn(() => 'mock-url'),
    revokeObjectURL: vi.fn()
  },
  Blob: vi.fn().mockImplementation((content, options) => ({
    content,
    options
  }))
});

describe('DatabaseBackupTab', () => {
  let mockToast: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockToast = vi.fn();
    vi.mocked(useToast).mockReturnValue({ toast: mockToast });
  });

  it('deve renderizar o componente corretamente', () => {
    render(<DatabaseBackupTab />);
    
    expect(screen.getByText('Backup do Banco de Dados')).toBeInTheDocument();
    expect(screen.getByText('Criar Backup Completo')).toBeInTheDocument();
    expect(screen.getByText('Faz backup de todas as tabelas do banco de dados')).toBeInTheDocument();
  });

  it('deve criar backup com sucesso', async () => {
    const mockBackupData = {
      success: true,
      backup: {
        metadata: {
          timestamp: new Date().toISOString(),
          userId: 'user-123',
          userEmail: 'admin@example.com',
          totalTables: 10,
          successfulTables: 10,
          failedTables: 0,
          databaseSize: 1024 * 1024 // 1MB
        },
        data: { 
          users: { data: [], count: 0 },
          teams: { data: [], count: 0 }
        },
        version: '1.0',
        format: 'planner-system-backup'
      }
    };

    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
      data: mockBackupData,
      error: null
    } as any);

    render(<DatabaseBackupTab />);
    
    const createButton = screen.getByText('Criar Backup');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(supabase.functions.invoke).toHaveBeenCalledWith('database-backup');
      expect(mockToast).toHaveBeenCalledWith({
        title: "✅ Backup criado com sucesso!",
        description: "Backup com 10 tabelas concluído.",
      });
    });

    // Verifica se o card de último backup aparece
    expect(screen.getByText('Último Backup Realizado')).toBeInTheDocument();
    expect(screen.getByText('Baixar Backup')).toBeInTheDocument();
    expect(screen.getByText('Copiar JSON')).toBeInTheDocument();
  });

  it('deve mostrar erro quando falha ao criar backup', async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
      data: null,
      error: { message: 'Erro de conexão' }
    } as any);

    render(<DatabaseBackupTab />);
    
    const createButton = screen.getByText('Criar Backup');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "❌ Erro ao criar backup",
        description: "Erro de conexão",
        variant: "destructive",
      });
    });
  });

  it('deve fazer download do backup', async () => {
    const mockBackupData = {
      success: true,
      backup: {
        metadata: {
          timestamp: new Date().toISOString(),
          userId: 'user-123',
          userEmail: 'admin@example.com',
          totalTables: 10,
          successfulTables: 10,
          failedTables: 0,
          databaseSize: 1024
        },
        data: { 
          users: { data: [], count: 0 },
          teams: { data: [], count: 0 }
        },
        version: '1.0',
        format: 'planner-system-backup'
      }
    };

    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
      data: mockBackupData,
      error: null
    } as any);

    // Mock do createElement e appendChild
    const mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
      style: {}
    };
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);

    render(<DatabaseBackupTab />);
    
    // Criar backup primeiro
    const createButton = screen.getByText('Criar Backup');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('Baixar Backup')).toBeInTheDocument();
    });

    // Agora fazer download
    const downloadButton = screen.getByText('Baixar Backup');
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(mockLink.download).toContain('backup-plannersystem-');
      expect(mockLink.download).toContain('.json');
      expect(mockLink.click).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
      expect(removeChildSpy).toHaveBeenCalledWith(mockLink);
    });
  });

  it('deve copiar JSON para clipboard', async () => {
    const mockBackupData = {
      success: true,
      backup: {
        metadata: {
          timestamp: new Date().toISOString(),
          userId: 'user-123',
          userEmail: 'admin@example.com',
          totalTables: 10,
          successfulTables: 10,
          failedTables: 0,
          databaseSize: 1024
        },
        data: { 
          users: { data: [], count: 0 },
          teams: { data: [], count: 0 }
        },
        version: '1.0',
        format: 'planner-system-backup'
      }
    };

    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
      data: mockBackupData,
      error: null
    } as any);

    render(<DatabaseBackupTab />);
    
    // Criar backup primeiro
    const createButton = screen.getByText('Criar Backup');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('Copiar JSON')).toBeInTheDocument();
    });

    // Agora copiar JSON
    const copyButton = screen.getByText('Copiar JSON');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        JSON.stringify(mockBackupData.backup, null, 2)
      );
      expect(mockToast).toHaveBeenCalledWith({
        title: "📋 JSON copiado!",
        description: "O JSON foi copiado para a área de transferência.",
      });
    });
  });

  it('deve mostrar alerta quando há tabelas com falha', async () => {
    const mockBackupData = {
      success: true,
      backup: {
        metadata: {
          timestamp: new Date().toISOString(),
          userId: 'user-123',
          userEmail: 'admin@example.com',
          totalTables: 10,
          successfulTables: 8,
          failedTables: 2,
          databaseSize: 1024
        },
        data: { 
          users: { data: [], count: 0 },
          teams: { data: [], count: 0 }
        },
        version: '1.0',
        format: 'planner-system-backup'
      }
    };

    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
      data: mockBackupData,
      error: null
    } as any);

    render(<DatabaseBackupTab />);
    
    const createButton = screen.getByText('Criar Backup');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('2 tabela(s) falharam durante o backup')).toBeInTheDocument();
    });
  });

  it('deve formatar tamanho do arquivo corretamente', async () => {
    const mockBackupData = {
      success: true,
      backup: {
        metadata: {
          timestamp: new Date().toISOString(),
          userId: 'user-123',
          userEmail: 'admin@example.com',
          totalTables: 10,
          successfulTables: 10,
          failedTables: 0,
          databaseSize: 1048576 // 1MB em bytes
        },
        data: { 
          users: { data: [], count: 0 },
          teams: { data: [], count: 0 }
        },
        version: '1.0',
        format: 'planner-system-backup'
      }
    };

    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
      data: mockBackupData,
      error: null
    } as any);

    render(<DatabaseBackupTab />);
    
    const createButton = screen.getByText('Criar Backup');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('1 MB')).toBeInTheDocument();
    });
  });
});