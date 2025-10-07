import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, User, Calendar, Building2, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AuditLogEntry {
  id: string;
  user_name: string | null;
  user_email: string | null;
  team_name: string | null;
  action: string;
  table_name: string;
  entity_name: string | null;
  record_id: string | null;
  old_values: any;
  new_values: any;
  changed_fields: any;
  action_summary: string;
  created_at: string;
}

interface EnhancedAuditLogCardProps {
  logs: AuditLogEntry[];
  loading: boolean;
  onRefresh: () => void;
}

const getActionColor = (action: string): string => {
  switch (action) {
    case 'INSERT':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    case 'UPDATE':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    case 'DELETE':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  }
};

const formatChangeValue = (value: any): string => {
  if (value === null) return 'null';
  if (value === undefined) return 'indefinido';
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (typeof value === 'string') return value;
  return String(value);
};

export function EnhancedAuditLogCard({ logs, loading, onRefresh }: EnhancedAuditLogCardProps) {
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  const toggleExpanded = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Logs de Auditoria
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhum log de auditoria encontrado.
          </p>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => {
              const isExpanded = expandedLogs.has(log.id);
              
              return (
                <Collapsible key={log.id}>
                  <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <CollapsibleTrigger 
                      className="w-full text-left"
                      onClick={() => toggleExpanded(log.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <Badge className={getActionColor(log.action)}>
                            {log.action_summary}
                          </Badge>
                          <span className="font-medium">
                            {log.entity_name || log.table_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(log.created_at), { 
                            addSuffix: true,
                            locale: ptBR 
                          })}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {log.user_name || log.user_email || 'Sistema'}
                        </div>
                        {log.team_name && (
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {log.team_name}
                          </div>
                        )}
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="mt-4 pt-4 border-t">
                      <div className="space-y-3">
                        {/* Changed Fields Summary */}
                        {log.changed_fields && Array.isArray(log.changed_fields) && log.changed_fields.length > 0 && (
                          <div>
                            <h5 className="font-medium text-sm mb-2">Alterações:</h5>
                            <div className="space-y-2">
                              {log.changed_fields.map((field: any, index: number) => (
                                <div key={index} className="bg-muted/50 rounded p-3">
                                  <div className="font-medium text-sm mb-1">
                                    {field.field_label}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="text-red-600 dark:text-red-400">
                                      {formatChangeValue(field.old_value)}
                                    </span>
                                    <span className="text-muted-foreground">→</span>
                                    <span className="text-green-600 dark:text-green-400">
                                      {formatChangeValue(field.new_value)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Additional Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Tabela:</span>
                            <span className="ml-2">{log.table_name}</span>
                          </div>
                          {log.record_id && (
                            <div>
                              <span className="font-medium">ID do Registro:</span>
                              <span className="ml-2 font-mono text-xs">
                                {log.record_id.substring(0, 8)}...
                              </span>
                            </div>
                          )}
                          <div className="col-span-2">
                            <span className="font-medium">Data/Hora:</span>
                            <span className="ml-2">
                              {new Date(log.created_at).toLocaleString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}