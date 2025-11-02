import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchResult {
  type: 'user' | 'team' | 'error';
  id: string;
  title: string;
  subtitle?: string;
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (tab: string, id?: string) => void;
}

export function GlobalSearch({ open, onOpenChange, onNavigate }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const searchAll = async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const searchTerm = `%${debouncedQuery}%`;
        
        // Buscar usuários
        const { data: users } = await supabase
          .from('user_profiles')
          .select('user_id, name, email')
          .or(`name.ilike.${searchTerm},email.ilike.${searchTerm}`)
          .limit(5);

        // Buscar equipes
        const { data: teams } = await supabase
          .from('teams')
          .select('id, name, cnpj')
          .or(`name.ilike.${searchTerm},cnpj.ilike.${searchTerm}`)
          .limit(5);

        // Buscar reportes de erro
        const { data: errors } = await supabase
          .from('error_reports')
          .select('id, report_number, what_trying_to_do')
          .or(`report_number.ilike.${searchTerm},what_trying_to_do.ilike.${searchTerm}`)
          .limit(5);

        const allResults: SearchResult[] = [
          ...(users || []).map(u => ({
            type: 'user' as const,
            id: u.user_id,
            title: u.name,
            subtitle: u.email,
          })),
          ...(teams || []).map(t => ({
            type: 'team' as const,
            id: t.id,
            title: t.name,
            subtitle: t.cnpj || undefined,
          })),
          ...(errors || []).map(e => ({
            type: 'error' as const,
            id: e.id,
            title: e.report_number,
            subtitle: e.what_trying_to_do,
          })),
        ];

        setResults(allResults);
      } catch (error) {
        console.error('Erro na busca global:', error);
      } finally {
        setIsLoading(false);
      }
    };

    searchAll();
  }, [debouncedQuery]);

  const handleSelect = (result: SearchResult) => {
    const tabMap = {
      user: 'users',
      team: 'teams',
      error: 'errors',
    };
    onNavigate(tabMap[result.type], result.id);
    onOpenChange(false);
    setQuery('');
  };

  const getTypeBadge = (type: SearchResult['type']) => {
    const config = {
      user: { label: 'Usuário', className: 'bg-blue-500' },
      team: { label: 'Equipe', className: 'bg-green-500' },
      error: { label: 'Erro', className: 'bg-red-500' },
    };
    return config[type];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Busca Global
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Input
            placeholder="Buscar usuários, equipes, reportes... (Cmd+K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="text-base"
          />

          {isLoading && (
            <div className="text-center text-sm text-muted-foreground py-8">
              Buscando...
            </div>
          )}

          {!isLoading && results.length === 0 && debouncedQuery.length >= 2 && (
            <div className="text-center text-sm text-muted-foreground py-8">
              Nenhum resultado encontrado
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((result) => {
                const badge = getTypeBadge(result.type);
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors border"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{result.title}</div>
                        {result.subtitle && (
                          <div className="text-sm text-muted-foreground truncate">
                            {result.subtitle}
                          </div>
                        )}
                      </div>
                      <Badge className={badge.className}>
                        {badge.label}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
