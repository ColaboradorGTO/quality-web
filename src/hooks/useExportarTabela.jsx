import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const useExportarTabela = ({ dados, colunas, nomeArquivo, tituloDocumento, nomePlanilha }) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const dataTableRef = useRef();

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: tituloDocumento || nomeArquivo,
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [colunas.map(coluna => coluna.header)],
      body: dados.map(item => colunas.map(coluna => coluna.value(item))),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save(`${nomeArquivo}.pdf`);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      dados.map(item => Object.fromEntries(colunas.map(coluna => [coluna.header, coluna.value(item)])))
    );

    const workbook = XLSX.utils.book_new();
    const header = colunas.map(coluna => coluna.header);

    worksheet['!cols'] = colunas.map(coluna => ({ wpx: coluna.width || 100 }));

    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, nomePlanilha || nomeArquivo);
    XLSX.writeFile(workbook, `${nomeArquivo}.xlsx`);
  };

  return {
    globalFilterValue,
    onGlobalFilterChange,
    dataTableRef,
    handlePrint,
    exportToPDF,
    exportToExcel,
  };
};
