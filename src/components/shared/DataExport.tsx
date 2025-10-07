
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { useEnhancedData } from '@/contexts/EnhancedDataContext';
import { useToast } from '@/hooks/use-toast';

export const DataExport: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [exporting, setExporting] = useState(false);
  const { events, personnel, assignments, workLogs } = useEnhancedData();
  const { toast } = useToast();

  const dataMap = {
    events: events,
    personnel: personnel,
    assignments: assignments,
    workLogs: workLogs
  };

  const tableLabels = {
    events: 'Eventos',
    personnel: 'Pessoal',
    assignments: 'Alocações',
    workLogs: 'Registros de Trabalho'
  };

  const exportToCSV = async (tableName: string) => {
    if (!selectedTable) return;

    setExporting(true);
    try {
      const data = dataMap[tableName as keyof typeof dataMap];
      
      if (!data || data.length === 0) {
        toast({
          title: "Aviso",
          description: "Nenhum dado encontrado para exportar",
          variant: "destructive"
        });
        return;
      }

      // Converter dados para CSV
      const headers = Object.keys(data[0]).join(',');
      const csvContent = data.map(row => 
        Object.values(row).map(value => 
          typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        ).join(',')
      ).join('\n');

      const csv = `${headers}\n${csvContent}`;
      
      // Download do arquivo
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${tableName}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Sucesso",
        description: "Dados exportados com sucesso",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Erro",
        description: "Falha ao exportar dados",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  const exportToJSON = async (tableName: string) => {
    if (!selectedTable) return;

    setExporting(true);
    try {
      const data = dataMap[tableName as keyof typeof dataMap];
      
      if (!data || data.length === 0) {
        toast({
          title: "Aviso",
          description: "Nenhum dado encontrado para exportar",
          variant: "destructive"
        });
        return;
      }

      const jsonContent = JSON.stringify(data, null, 2);
      
      // Download do arquivo
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${tableName}_${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Sucesso",
        description: "Dados exportados com sucesso",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Erro",
        description: "Falha ao exportar dados",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Exportação de Dados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Selecione os dados para exportar:
          </label>
          <Select value={selectedTable} onValueChange={setSelectedTable}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha uma tabela" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(tableLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedTable && (
          <div className="flex gap-2">
            <Button
              onClick={() => exportToCSV(selectedTable)}
              disabled={exporting}
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Exportar CSV
            </Button>
            
            <Button
              variant="outline"
              onClick={() => exportToJSON(selectedTable)}
              disabled={exporting}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Exportar JSON
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
