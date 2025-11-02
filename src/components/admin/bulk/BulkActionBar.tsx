import { CheckCircle2, XCircle, Trash2, Mail, Tag, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onApprove?: () => void;
  onDisapprove?: () => void;
  onDelete?: () => void;
  onNotify?: () => void;
  onChangeRole?: () => void;
  onExport?: () => void;
}

export function BulkActionBar({
  selectedCount,
  onClearSelection,
  onApprove,
  onDisapprove,
  onDelete,
  onNotify,
  onChangeRole,
  onExport,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-primary text-primary-foreground rounded-full shadow-lg px-6 py-3 flex items-center gap-4">
        <span className="font-medium">
          {selectedCount} {selectedCount === 1 ? 'item selecionado' : 'itens selecionados'}
        </span>
        
        <div className="h-6 w-px bg-primary-foreground/20" />
        
        <div className="flex items-center gap-2">
          {onApprove && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onApprove}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Aprovar
            </Button>
          )}
          
          {onDisapprove && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDisapprove}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reprovar
            </Button>
          )}
          
          {onChangeRole && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onChangeRole}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <Tag className="h-4 w-4 mr-2" />
              Alterar Role
            </Button>
          )}
          
          {onNotify && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onNotify}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <Mail className="h-4 w-4 mr-2" />
              Notificar
            </Button>
          )}
          
          {onExport && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onExport}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          )}
          
          {onDelete && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Deletar
            </Button>
          )}
        </div>

        <div className="h-6 w-px bg-primary-foreground/20" />
        
        <Button
          size="sm"
          variant="ghost"
          onClick={onClearSelection}
          className="text-primary-foreground hover:bg-primary-foreground/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
