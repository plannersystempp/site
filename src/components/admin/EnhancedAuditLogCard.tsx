import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  User, 
  Database, 
  Calendar, 
  FileEdit, 
  FilePlus, 
  FileX,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface AuditLogCardProps {
  log: {
    id: string;
    user_id: string | null;
    action: string;
    table_name: string;
    record_id: string | null;
    old_values: any;
    new_values: any;
    created_at: string;
  };
  userName?: string;
}

const getActionIcon = (action: string) => {
  switch (action.toUpperCase()) {
    case 'INSERT':
      return <FilePlus className="h-4 w-4" />;
    case 'UPDATE':
      return <FileEdit className="h-4 w-4" />;
    case 'DELETE':
      return <FileX className="h-4 w-4" />;
    default:
      return <Database className="h-4 w-4" />;
  }
};

const getActionColor = (action: string) => {
  switch (action.toUpperCase()) {
    case 'INSERT':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'UPDATE':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'DELETE':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    default:
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
};

const DiffViewer = ({ oldValue, newValue, fieldName }: { oldValue: any; newValue: any; fieldName: string }) => {
  const oldStr = oldValue !== undefined && oldValue !== null ? String(oldValue) : '';
  const newStr = newValue !== undefined && newValue !== null ? String(newValue) : '';
  
  if (oldStr === newStr) return null;

  return (
    <div className="space-y-1 p-3 bg-muted/30 rounded-md border">
      <div className="text-xs font-medium text-muted-foreground mb-2">{fieldName}</div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="space-y-1">
          <div className="text-red-500 font-medium">Antes:</div>
          <div className="p-2 bg-red-500/5 border border-red-500/20 rounded line-through">
            {oldStr || <span className="text-muted-foreground italic">vazio</span>}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-green-500 font-medium">Depois:</div>
          <div className="p-2 bg-green-500/5 border border-green-500/20 rounded">
            {newStr || <span className="text-muted-foreground italic">vazio</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export function EnhancedAuditLogCard({ log, userName }: AuditLogCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const hasChanges = log.old_values || log.new_values;
  const changedFields = hasChanges ? Object.keys({ ...log.old_values, ...log.new_values }) : [];

  return (
    <Card className="hover:shadow-md transition-shadow border-l-4" style={{
      borderLeftColor: log.action.toUpperCase() === 'INSERT' ? 'hsl(142 76% 36%)' : 
                       log.action.toUpperCase() === 'UPDATE' ? 'hsl(221 83% 53%)' :
                       log.action.toUpperCase() === 'DELETE' ? 'hsl(0 84% 60%)' : 
                       'hsl(var(--muted))'
    }}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className={`p-2 rounded-lg border ${getActionColor(log.action)}`}>
              {getActionIcon(log.action)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="font-mono text-xs">
                  {log.action.toUpperCase()}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {log.table_name}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {userName || 'Sistema'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
                {log.record_id && (
                  <span className="font-mono text-[10px]">
                    ID: {log.record_id.substring(0, 8)}...
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {hasChanges && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="shrink-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      {isExpanded && hasChanges && (
        <CardContent className="pt-0 space-y-2">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            {changedFields.length} campo(s) alterado(s):
          </div>
          {changedFields.map((field) => (
            <DiffViewer
              key={field}
              fieldName={field}
              oldValue={log.old_values?.[field]}
              newValue={log.new_values?.[field]}
            />
          ))}
        </CardContent>
      )}
    </Card>
  );
}
