import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Project } from '../types';

interface ReportStats {
  total: number;
  concluidos: number;
  potencia: number;
  valor: number;
}

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatDate = (dateStr: string) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');

const STATUS_LABEL: Record<string, string> = {
  'Concluído': 'Concluído',
  'Em andamento': 'Em andamento',
  Aguardando: 'Aguardando',
};

export function useExportPDF() {
  const exportReport = (projects: Project[], stats: ReportStats, year: number | 'Todos') => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const now = new Date().toLocaleDateString('pt-BR');

    doc.setFillColor(245, 166, 35); // #F5A623
    doc.rect(0, 0, pageWidth, 18, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Solar Management', 12, 12);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const subtitle = year === 'Todos' ? 'Relatório geral de projetos' : `Relatório de projetos — ${year}`;
    doc.text(subtitle, 12, 17);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(`Gerado em ${now}`, pageWidth - 12, 12, { align: 'right' });

    const cardY = 24;
    const cardW = (pageWidth - 24 - 9) / 4;
    const cards = [
      { label: 'Total de projetos', value: String(stats.total) },
      { label: 'Concluídos', value: String(stats.concluidos) },
      { label: 'Potência instalada', value: `${stats.potencia.toFixed(1)} kWp` },
      { label: 'Valor total estimado', value: formatCurrency(stats.valor) },
    ];

    cards.forEach((card, i) => {
      const x = 12 + i * (cardW + 3);
      doc.setDrawColor(220, 220, 220);
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(x, cardY, cardW, 18, 2, 2, 'FD');

      doc.setTextColor(100, 100, 100);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text(card.label, x + cardW / 2, cardY + 6, { align: 'center' });

      doc.setTextColor(30, 30, 30);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(card.value, x + cardW / 2, cardY + 13, { align: 'center' });
    });

    const statusY = cardY + 22;
    const statusCounts = {
      'Concluído': projects.filter((p) => p.status === 'Concluído').length,
      'Em andamento': projects.filter((p) => p.status === 'Em andamento').length,
      Aguardando: projects.filter((p) => p.status === 'Aguardando').length,
    };
    const statusColors: Record<string, [number, number, number]> = {
      'Concluído': [46, 204, 113],
      'Em andamento': [108, 99, 255],
      Aguardando: [245, 166, 35],
    };

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text('DISTRIBUIÇÃO POR STATUS', 12, statusY + 4);

    let statusX = 12;
    Object.entries(statusCounts).forEach(([status, count]) => {
      const [r, g, b] = statusColors[status];
      doc.setFillColor(r, g, b);
      doc.circle(statusX + 2, statusY + 9, 1.5, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      doc.text(`${STATUS_LABEL[status]}: ${count}`, statusX + 5, statusY + 10);
      statusX += 48;
    });

    autoTable(doc, {
      startY: statusY + 16,
      head: [['Cliente', 'Cidade', 'Status', 'Potência (kWp)', 'Valor estimado', 'Responsável', 'Início']],
      body: projects.map((p) => [
        p.clientName,
        p.city,
        '',
        p.installedPower.toFixed(2),
        formatCurrency(p.estimatedValue),
        p.responsible,
        formatDate(p.startDate),
      ]),
      headStyles: {
        fillColor: [28, 28, 46], // #1C1C2E
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'left',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [50, 50, 50],
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      columnStyles: {
        2: { cellWidth: 30 },
      },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 2) {
          const status = projects[data.row.index]?.status;
          if (status) {
            const [r, g, b] = statusColors[status];
            data.doc.setTextColor(r, g, b);
            data.doc.setFont('helvetica', 'bold');
            data.doc.text(
              STATUS_LABEL[status],
              data.cell.x + 2,
              data.cell.y + data.cell.height / 2 + 1,
            );
          }
        }
      },
      margin: { left: 12, right: 12 },
    });

    const totalPages = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(160, 160, 160);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Página ${i} de ${totalPages} — Solar Management`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 5,
        { align: 'center' },
      );
    }

    const filename = year === 'Todos' ? 'relatorio-projetos.pdf' : `relatorio-projetos-${year}.pdf`;
    doc.save(filename);
  };

  return { exportReport };
}
