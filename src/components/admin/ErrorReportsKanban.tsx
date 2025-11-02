import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  User,
  MessageSquare,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ErrorReport {
  id: string;
  report_number: string;
  status: string;
  urgency: string;
  what_trying_to_do: string;
  what_happened: string;
  created_at: string;
  assigned_to: string | null;
  admin_notes: string | null;
  user_id: string | null;
  team_id: string | null;
}

const CANNED_RESPONSES = [
  {
    label: "Investigando",
    text: "Obrigado pelo reporte! Estamos investigando o problema e retornaremos em breve."
  },
  {
    label: "Comportamento Esperado",
    text: "Este comportamento é esperado pelo sistema. Vou explicar como funciona:"
  },
  {
    label: "Corrigido",
    text: "Este problema foi identificado e corrigido na última atualização do sistema."
  },
  {
    label: "Mais Informações",
    text: "Para nos ajudar a resolver este problema, você poderia fornecer mais detalhes sobre:"
  }
];

const statusConfig = {
  new: {
    label: "Novo",
    icon: AlertCircle,
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  in_progress: {
    label: "Investigando",
    icon: Clock,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10"
  },
  resolved: {
    label: "Resolvido",
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-500/10"
  },
  closed: {
    label: "Fechado",
    icon: XCircle,
    color: "text-gray-500",
    bg: "bg-gray-500/10"
  }
};

const urgencyConfig = {
  low: { label: "Baixa", color: "bg-gray-500" },
  medium: { label: "Média", color: "bg-blue-500" },
  high: { label: "Alta", color: "bg-orange-500" },
  critical: { label: "Crítica", color: "bg-red-500" }
};

export function ErrorReportsKanban() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<ErrorReport | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [assignedTo, setAssignedTo] = useState<string | null>(null);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['error-reports-kanban'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('error_reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ErrorReport[];
    },
    refetchInterval: 30000
  });

  const { data: superAdmins = [] } = useQuery({
    queryKey: ['super-admins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_id, name, email')
        .eq('role', 'superadmin');
      
      if (error) throw error;
      return data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ reportId, status }: { reportId: string; status: string }) => {
      const { error } = await supabase
        .from('error_reports')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', reportId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['error-reports-kanban'] });
      toast({ title: "Status atualizado com sucesso!" });
    },
    onError: () => {
      toast({ 
        title: "Erro ao atualizar status",
        variant: "destructive"
      });
    }
  });

  const updateReportMutation = useMutation({
    mutationFn: async ({ 
      reportId, 
      adminNotes, 
      assignedTo 
    }: { 
      reportId: string; 
      adminNotes?: string; 
      assignedTo?: string | null;
    }) => {
      const updates: any = { updated_at: new Date().toISOString() };
      if (adminNotes !== undefined) updates.admin_notes = adminNotes;
      if (assignedTo !== undefined) updates.assigned_to = assignedTo;

      const { error } = await supabase
        .from('error_reports')
        .update(updates)
        .eq('id', reportId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['error-reports-kanban'] });
      toast({ title: "Reporte atualizado!" });
      setSelectedReport(null);
    },
    onError: () => {
      toast({ 
        title: "Erro ao atualizar reporte",
        variant: "destructive"
      });
    }
  });

  const groupedReports = {
    new: reports.filter(r => r.status === 'new'),
    in_progress: reports.filter(r => r.status === 'in_progress'),
    resolved: reports.filter(r => r.status === 'resolved'),
    closed: reports.filter(r => r.status === 'closed')
  };

  const handleDragStart = (e: React.DragEvent, reportId: string) => {
    e.dataTransfer.setData('reportId', reportId);
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const reportId = e.dataTransfer.getData('reportId');
    if (reportId) {
      updateStatusMutation.mutate({ reportId, status: newStatus });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const insertCannedResponse = (text: string) => {
    setAdminNotes(prev => prev ? `${prev}\n\n${text}` : text);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([status, config]) => {
          const Icon = config.icon;
          const reportList = groupedReports[status as keyof typeof groupedReports];
          
          return (
            <div
              key={status}
              onDrop={(e) => handleDrop(e, status)}
              onDragOver={handleDragOver}
              className="space-y-2"
            >
              <div className={`flex items-center justify-between p-3 rounded-lg border ${config.bg}`}>
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${config.color}`} />
                  <span className="font-semibold text-sm">{config.label}</span>
                </div>
                <Badge variant="secondary" className="rounded-full">
                  {reportList.length}
                </Badge>
              </div>

              <ScrollArea className="h-[600px]">
                <div className="space-y-2 pr-4">
                  {reportList.map(report => (
                    <Dialog key={report.id}>
                      <DialogTrigger asChild>
                        <Card
                          draggable
                          onDragStart={(e) => handleDragStart(e, report.id)}
                          className="cursor-move hover:shadow-md transition-shadow"
                          onClick={() => {
                            setSelectedReport(report);
                            setAdminNotes(report.admin_notes || "");
                            setAssignedTo(report.assigned_to);
                          }}
                        >
                          <CardHeader className="p-3 pb-2">
                            <div className="flex items-start justify-between gap-2">
                              <Badge 
                                variant="outline" 
                                className="font-mono text-[10px] shrink-0"
                              >
                                #{report.report_number}
                              </Badge>
                              <Badge 
                                className={`${urgencyConfig[report.urgency as keyof typeof urgencyConfig]?.color} text-white text-[10px]`}
                              >
                                {urgencyConfig[report.urgency as keyof typeof urgencyConfig]?.label}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            <p className="text-xs font-medium line-clamp-2 mb-2">
                              {report.what_trying_to_do}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                              {report.what_happened}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(report.created_at), "dd/MM/yyyy", { locale: ptBR })}
                            </div>
                            {report.assigned_to && (
                              <div className="flex items-center gap-1 mt-1 text-[10px] text-blue-500">
                                <User className="h-3 w-3" />
                                Atribuído
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </DialogTrigger>

                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Reporte #{report.report_number}
                          </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">O que estava tentando fazer:</label>
                            <p className="text-sm text-muted-foreground mt-1">{report.what_trying_to_do}</p>
                          </div>

                          <div>
                            <label className="text-sm font-medium">O que aconteceu:</label>
                            <p className="text-sm text-muted-foreground mt-1">{report.what_happened}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium block mb-2">Atribuir para:</label>
                              <Select value={assignedTo || ""} onValueChange={setAssignedTo}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Não atribuído" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="">Não atribuído</SelectItem>
                                  {superAdmins.map((admin) => (
                                    <SelectItem key={admin.user_id} value={admin.user_id}>
                                      {admin.name || admin.email}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className="text-sm font-medium block mb-2">Status:</label>
                              <Select 
                                value={report.status} 
                                onValueChange={(value) => updateStatusMutation.mutate({ reportId: report.id, status: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(statusConfig).map(([key, config]) => (
                                    <SelectItem key={key} value={key}>
                                      {config.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium block mb-2">Respostas Rápidas:</label>
                            <div className="flex flex-wrap gap-2">
                              {CANNED_RESPONSES.map((response) => (
                                <Button
                                  key={response.label}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => insertCannedResponse(response.text)}
                                >
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  {response.label}
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium block mb-2">Notas do Admin:</label>
                            <Textarea
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              placeholder="Adicione suas notas aqui..."
                              className="min-h-[120px]"
                            />
                          </div>

                          <Button
                            onClick={() => updateReportMutation.mutate({
                              reportId: report.id,
                              adminNotes,
                              assignedTo
                            })}
                            className="w-full"
                          >
                            Salvar Alterações
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </ScrollArea>
            </div>
          );
        })}
      </div>
    </div>
  );
}
