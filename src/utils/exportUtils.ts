import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    throw new Error('Nenhum dado para exportar');
  }

  // Extrair cabeçalhos
  const headers = Object.keys(data[0]).join(',');
  
  // Converter dados para CSV
  const csvContent = data.map(row => 
    Object.values(row).map(value => {
      // Tratar valores nulos ou indefinidos
      if (value === null || value === undefined) return '';
      
      // Escapar aspas duplas e envolver strings em aspas se necessário
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',')
  ).join('\n');

  const csv = `${headers}\n${csvContent}`;
  
  // Criar e baixar arquivo
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToPDF = (data: any[], headers: string[], title: string, filename: string) => {
  if (!data || data.length === 0) {
    throw new Error('Nenhum dado para exportar');
  }

  const pdf = new jsPDF();
  
  // Adicionar título
  pdf.setFontSize(16);
  pdf.text(title, 20, 20);
  
  // Adicionar data de geração
  pdf.setFontSize(10);
  pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);
  
  // Preparar dados para a tabela
  const tableData = data.map(row => 
    headers.map(header => {
      const value = row[header];
      return value === null || value === undefined ? '' : String(value);
    })
  );
  
  // Gerar tabela
  autoTable(pdf, {
    head: [headers],
    body: tableData,
    startY: 40,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });
  
  // Salvar arquivo
  pdf.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
};