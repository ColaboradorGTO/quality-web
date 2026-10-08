import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import { GrFormView } from "react-icons/gr";
import { AiOutlineDelete } from "react-icons/ai";
import { FaBalanceScale, FaRegSave } from "react-icons/fa";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import 'jspdf-autotable';
import HeaderTable from "../../../Tables/headerTable";
import { get } from "../../../../api/funcRequest";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import  "./styles.css";
import { formatMoeda } from "../../../../utils/formatMoeda";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useCadastrarMeta } from "./hooks/useCadastrarMeta";

export const ActionListaCriarMetasDetalhadas = ({
  dadosMetasEstrutura,
  marcaSelecionada,
  dataPesquisaInicio,
  dataPesquisaFim,
  usuarioLogado,
  optionsModulos,
  handleClick,
}) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();
  
  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Lista Metas Detalhada',
  });

  const formatPercent = (value) => `${parseFloat(value || 0)}%`;

  const groupHeaders = [
    { title: 'VENDAS / META GERAL', span: 5, fill: '#7a59ad', text: '#FFFFFF' },
    { title: 'CALCADOS', span: 4, fill: '#FFDB8E', text: '#000000' },
    { title: 'SELECAO FEMININA', span: 12, fill: '#FE85BE', text: '#000000' },
    { title: 'SELECAO MASCULINA', span: 12, fill: '#6AB8F7', text: '#000000' },
    { title: 'SELECAO INFANTIL', span: 12, fill: '#4DE5D5', text: '#000000' },
    { title: 'CMB', span: 4, fill: '#7a59ad', text: '#000000' },
    { title: 'OUTROS', span: 2, fill: '#FE85BE', text: '#000000' },
    { title: 'TOTAL', span: 1, fill: '#FFDB8E', text: '#000000' },
  ];

  const exportColumns = [
    { field: 'contador', header: '#', fill: '#7a59ad', text: '#FFFFFF', value: (item) => item.contador },
    { field: 'NOFANTASIA', header: 'EMPRESA', fill: '#7a59ad', text: '#FFFFFF', value: (item) => item.NOFANTASIA },
    { field: 'VRVENDAGERAL', header: 'Venda', fill: '#7a59ad', text: '#FFFFFF', value: (item) => formatMoeda(item.VRVENDAGERAL) },
    { field: 'PERCMETAVENDAGERAL', header: '% Meta', fill: '#7a59ad', text: '#FFFFFF', value: (item) => formatPercent(item.PERCMETAVENDAGERAL) },
    { field: 'VRMETAVENDAGERAL', header: 'Vr Meta', fill: '#7a59ad', text: '#FFFFFF', value: (item) => formatMoeda(item.VRMETAVENDAGERAL) },

    { field: 'VRVENDACALCADOS', header: 'Geral', fill: '#FFDB8E', text: '#000000', value: (item) => formatMoeda(item.VRVENDACALCADOS) },
    { field: 'PERCVENDACALCADOS', header: '%', fill: '#FFDB8E', text: '#000000', value: (item) => formatPercent(item.PERCVENDACALCADOS) },
    { field: 'VRMETAVENDACALCADOS', header: 'Vr Meta', fill: '#ffca5b', text: '#000000', value: (item) => formatMoeda(item.VRMETAVENDACALCADOS) },
    { field: 'PERCMETAVENDACALCADOS', header: '%', fill: '#ffca5b', text: '#000000', value: (item) => formatPercent(item.PERCMETAVENDACALCADOS) },

    { field: 'VRVENDAFEMVERINV', header: 'Verao/Inverno', fill: '#FE85BE', text: '#000000', value: (item) => formatMoeda(item.VRVENDAFEMVERINV) },
    { field: 'PERCVENDAFEMVERINV', header: '%', fill: '#FE85BE', text: '#000000', value: (item) => formatPercent(item.PERCVENDAFEMVERINV) },
    { field: 'VRMETAVENDAFEMVERINV', header: 'Vr Meta', fill: '#fd52a3', text: '#FFFFFF', value: (item) => formatMoeda(item.VRMETAVENDAFEMVERINV) },
    { field: 'PERCMETAVENDAFEMVERINV', header: '*', fill: '#fd52a3', text: '#FFFFFF', value: (item) => formatPercent(item.PERCMETAVENDAFEMVERINV) },
    { field: 'VRVENDAFEMPCINTIMA', header: 'Peca Intima', fill: '#FE85BE', text: '#000000', value: (item) => formatMoeda(item.VRVENDAFEMPCINTIMA) },
    { field: 'PERCVENDAFEMPCINTIMA', header: '%', fill: '#FE85BE', text: '#000000', value: (item) => formatPercent(item.PERCVENDAFEMPCINTIMA) },
    { field: 'VRMETAVENDAFEMPCINTIMA', header: 'Vr Meta', fill: '#fd52a3', text: '#FFFFFF', value: (item) => formatMoeda(item.VRMETAVENDAFEMPCINTIMA) },
    { field: 'PERCMETAVENDAFEMPCINTIMA', header: '*', fill: '#fd52a3', text: '#FFFFFF', value: (item) => formatPercent(item.PERCMETAVENDAFEMPCINTIMA) },
    { field: 'VRVENDAFEMACESSORIOS', header: 'Acessorios', fill: '#FE85BE', text: '#000000', value: (item) => formatMoeda(item.VRVENDAFEMACESSORIOS) },
    { field: 'PERCVENDAFEMACESSORIOS', header: '%', fill: '#FE85BE', text: '#000000', value: (item) => formatPercent(item.PERCVENDAFEMACESSORIOS) },
    { field: 'VRMETAVENDAFEMACESSORIOS', header: 'Vr Meta', fill: '#fd52a3', text: '#FFFFFF', value: (item) => formatMoeda(item.VRMETAVENDAFEMACESSORIOS) },
    { field: 'PERCMETAVENDAFEMACESSORIOS', header: '*', fill: '#fd52a3', text: '#FFFFFF', value: (item) => formatPercent(item.PERCMETAVENDAFEMACESSORIOS) },

    { field: 'VRVENDAMASCVERINV', header: 'Verao/Inverno', fill: '#6AB8F7', text: '#000000', value: (item) => formatMoeda(item.VRVENDAMASCVERINV) },
    { field: 'PERCVENDAMASCVERINV', header: '%', fill: '#6AB8F7', text: '#000000', value: (item) => formatPercent(item.PERCVENDAMASCVERINV) },
    { field: 'VRMETAVENDAMASCVERINV', header: 'Vr Meta', fill: '#39A1F4', text: '#FFFFFF', value: (item) => formatMoeda(item.VRMETAVENDAMASCVERINV) },
    { field: 'PERCMETAVENDAMASCVERINV', header: '%', fill: '#39A1F4', text: '#FFFFFF', value: (item) => formatPercent(item.PERCMETAVENDAMASCVERINV) },
    { field: 'VRVENDAMASCPCINTIMA', header: 'Peca Intima', fill: '#6AB8F7', text: '#000000', value: (item) => formatMoeda(item.VRVENDAMASCPCINTIMA) },
    { field: 'PERCVENDAMASCPCINTIMA', header: '%', fill: '#6AB8F7', text: '#000000', value: (item) => formatPercent(item.PERCVENDAMASCPCINTIMA) },
    { field: 'VRMETAVENDAMASCPCINTIMA', header: 'Vr Meta', fill: '#39A1F4', text: '#FFFFFF', value: (item) => formatMoeda(item.VRMETAVENDAMASCPCINTIMA) },
    { field: 'PERCMETAVENDAMASCPCINTIMA', header: '%', fill: '#39A1F4', text: '#FFFFFF', value: (item) => formatPercent(item.PERCMETAVENDAMASCPCINTIMA) },
    { field: 'VRVENDAMASCACESSORIOS', header: 'Acessorios', fill: '#6AB8F7', text: '#000000', value: (item) => formatMoeda(item.VRVENDAMASCACESSORIOS) },
    { field: 'PERCVENDAMASCACESSORIOS', header: '%', fill: '#6AB8F7', text: '#000000', value: (item) => formatPercent(item.PERCVENDAMASCACESSORIOS) },
    { field: 'VRMETAVENDAMASCACESSORIOS', header: 'Vr Meta', fill: '#39A1F4', text: '#FFFFFF', value: (item) => formatMoeda(item.VRMETAVENDAMASCACESSORIOS) },
    { field: 'PERCMETAVENDAMASCACESSORIOS', header: '%', fill: '#39A1F4', text: '#FFFFFF', value: (item) => formatPercent(item.PERCMETAVENDAMASCACESSORIOS) },

    { field: 'VRVENDAINFANTVERINV', header: 'Verao/Inverno', fill: '#4DE5D5', text: '#000000', value: (item) => formatMoeda(item.VRVENDAINFANTVERINV) },
    { field: 'PERCVENDAINFANTVERINV', header: '%', fill: '#4DE5D5', text: '#000000', value: (item) => formatPercent(item.PERCVENDAINFANTVERINV) },
    { field: 'VRMETAVENDAINFANTVERINV', header: 'Vr Meta', fill: '#21DFCB', text: '#000000', value: (item) => formatMoeda(item.VRMETAVENDAINFANTVERINV) },
    { field: 'PERCMETAVENDAINFANTVERINV', header: '%', fill: '#21DFCB', text: '#000000', value: (item) => formatPercent(item.PERCMETAVENDAINFANTVERINV) },
    { field: 'VRVENDAINFANTPCINTIMA', header: 'Peca Intima', fill: '#4DE5D5', text: '#000000', value: (item) => formatMoeda(item.VRVENDAINFANTPCINTIMA) },
    { field: 'PERCVENDAINFANTPCINTIMA', header: '%', fill: '#4DE5D5', text: '#000000', value: (item) => formatPercent(item.PERCVENDAINFANTPCINTIMA) },
    { field: 'VRMETAVENDAINFANTPCINTIMA', header: 'Vr Meta', fill: '#21DFCB', text: '#000000', value: (item) => formatMoeda(item.VRMETAVENDAINFANTPCINTIMA) },
    { field: 'PERCMETAVENDAINFANTPCINTIMA', header: '%', fill: '#21DFCB', text: '#000000', value: (item) => formatPercent(item.PERCMETAVENDAINFANTPCINTIMA) },
    { field: 'VRVENDAINFANTACESSORIOS', header: 'Acessorios', fill: '#4DE5D5', text: '#000000', value: (item) => formatMoeda(item.VRVENDAINFANTACESSORIOS) },
    { field: 'PERCVENDAINFANTACESSORIOS', header: '%', fill: '#4DE5D5', text: '#000000', value: (item) => formatPercent(item.PERCVENDAINFANTACESSORIOS) },
    { field: 'VRMETAVENDAINFANTACESSORIOS', header: 'Vr Meta', fill: '#21DFCB', text: '#000000', value: (item) => formatMoeda(item.VRMETAVENDAINFANTACESSORIOS) },
    { field: 'PERCMETAVENDAINFANTACESSORIOS', header: '%', fill: '#21DFCB', text: '#000000', value: (item) => formatPercent(item.PERCMETAVENDAINFANTACESSORIOS) },

    { field: 'VRVENDACMB', header: 'CMB', fill: '#B19DCE', text: '#000000', value: (item) => formatMoeda(item.VRVENDACMB) },
    { field: 'PERCVENDACMB', header: '%', fill: '#B19DCE', text: '#000000', value: (item) => formatPercent(item.PERCVENDACMB) },
    { field: 'VRMETAVENDACMB', header: 'Vr Meta', fill: '#7a59ad', text: '#FFFFFF', value: (item) => formatMoeda(item.VRMETAVENDACMB) },
    { field: 'PERCMETAVENDACMB', header: '%', fill: '#7a59ad', text: '#FFFFFF', value: (item) => formatPercent(item.PERCMETAVENDACMB) },

    { field: 'VRMETAVENDAOUTROS', header: 'Outros', fill: '#FE85BE', text: '#000000', value: (item) => formatMoeda(item.VRMETAVENDAOUTROS) },
    { field: 'PERCMETAVENDAOUTROS', header: '%', fill: '#FE85BE', text: '#000000', value: (item) => formatPercent(item.PERCMETAVENDAOUTROS) },

    { field: 'PERCTOTALVENDA', header: '%', fill: '#FFCA5B', text: '#000000', value: (item) => formatPercent(item.PERCTOTALVENDA) },
  ];

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a3' });

    const headerRows = [
      groupHeaders.map((group) => ({
        content: group.title,
        colSpan: group.span,
        styles: {
          halign: 'center',
          valign: 'middle',
          fillColor: group.fill,
          textColor: group.text,
          fontStyle: 'bold',
          fontSize: 8,
        },
      })),
      exportColumns.map((column) => ({
        content: column.header,
        styles: {
          halign: 'center',
          fillColor: column.fill,
          textColor: column.text,
          fontStyle: 'bold',
          fontSize: 7,
        },
      })),
    ];

    const bodyRows = dados.map((item) => exportColumns.map((column) => column.value(item)));

    doc.autoTable({
      head: headerRows,
      body: bodyRows,
      startY: 10,
      theme: "plain",
      styles: { fontSize: 6, cellPadding: 2, lineColor: [210, 210, 210], lineWidth: 0.2 },
      headStyles: { lineColor: [233, 233, 233], lineWidth: 0.2 },
      bodyStyles: { textColor: [33, 37, 41] },
      horizontalPageBreak: true,
      horizontalPageBreakRepeat: [0, 1],
      didParseCell: (data) => {
        if (data.section === 'body') {
          data.cell.styles.halign = data.column.index <= 1 ? 'left' : 'right';
        }
      },
    });

    doc.save("metas_detalhadas.pdf");
  };


  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Metas Detalhadas");

    const toArgb = (hex) => `FF${hex.replace('#', '').toUpperCase()}`;

    let start = 1;
    groupHeaders.forEach((group) => {
      const end = start + group.span - 1;
      worksheet.mergeCells(1, start, 1, end);
      const cell = worksheet.getCell(1, start);
      cell.value = group.title;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: toArgb(group.fill) } };
      cell.font = { color: { argb: toArgb(group.text) }, bold: true, size: 10 };
      start = end + 1;
    });

    const headerRow = worksheet.getRow(2);
    headerRow.values = exportColumns.map((column) => column.header);
    headerRow.eachCell((cell, colNumber) => {
      const column = exportColumns[colNumber - 1];
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: toArgb(column.fill) } };
      cell.font = { color: { argb: toArgb(column.text) }, bold: true, size: 9 };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE9E9E9' } },
        left: { style: 'thin', color: { argb: 'FFE9E9E9' } },
        bottom: { style: 'thin', color: { argb: 'FFE9E9E9' } },
        right: { style: 'thin', color: { argb: 'FFE9E9E9' } },
      };
    });

    dados.forEach((item) => {
      const row = worksheet.addRow(exportColumns.map((column) => column.value(item)));
      row.eachCell((cell, colNumber) => {
        cell.alignment = { horizontal: colNumber <= 2 ? 'left' : 'right', vertical: 'middle' };
      });
    });

    worksheet.columns = exportColumns.map((column, index) => ({
      width: index === 1 ? 30 : 14,
      key: column.field,
    }));

    worksheet.views = [{ state: 'frozen', ySplit: 2 }];

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "metas_detalhadas.xlsx");
  };

  const somarPorGrupo = (lista, chaveItem, chaveGrupo, chaveValor, grupos) => {
    const totais = {};
    grupos.forEach((grupo) => { totais[grupo] = 0; });

    (lista || []).forEach((registro) => {
      const dadosGrupo = registro[chaveItem];
      const grupo = dadosGrupo?.[chaveGrupo];
      const valor = parseFloat(dadosGrupo?.[chaveValor]) || 0;

      if (grupos.includes(grupo)) {
        totais[grupo] += valor;
      }
    });

    return totais;
  };

  const somarTotal = (lista, chaveItem, chaveValor) => {
    return (lista || []).reduce((acc, registro) => {
      return acc + (parseFloat(registro[chaveItem]?.[chaveValor]) || 0);
    }, 0);
  };

  const calcularPercentual = (valor, vrVendaMeta) => {
    if (!vrVendaMeta) return 0;
    return (valor * 100) / vrVendaMeta;
  };

  const dados = useMemo(() => dadosMetasEstrutura.map((item, index) => {
    const contador = index + 1;

    const vrVendaMeta = parseFloat(item.vendaTotalMarca?.VRTOTALLIQUIDO) || 0;

    const feminina = somarPorGrupo(item.vendasecaofeminina, 'venda-feminina', 'GRUPOFEMININO', 'VRTOTALLIQUIDOFEMININO', ['Verão', 'Inverno', 'Acessórios', 'Peças Íntimas']);
    const VrVendaFEMVeraoInverno = feminina['Verão'] + feminina['Inverno'];
    const VrVendaFEMPCIntimas = feminina['Peças Íntimas'];
    const VrVendaFEMAcessorios = feminina['Acessórios'];

    const masculina = somarPorGrupo(item.vendasecaomasculina, 'venda-masculina', 'GRUPOMASCULINO', 'VRTOTALLIQUIDOMASCULINO', ['Verão', 'Inverno', 'Acessórios', 'Peças Íntimas']);
    const VrVendaMASCVeraoInverno = masculina['Verão'] + masculina['Inverno'];
    const VrVendaMASCPCIntimas = masculina['Peças Íntimas'];
    const VrVendaMASCAcessorios = masculina['Acessórios'];

    const infantil = somarPorGrupo(item.vendasecaoinfantil, 'venda-infantil', 'GRUPOINFANTIL', 'VRTOTALLIQUIDOINFANTIL', ['Verão', 'Inverno', 'Acessórios', 'Peças Íntimas']);
    const VrVendaINFANTVeraoInverno = infantil['Verão'] + infantil['Inverno'];
    const VrVendaINFANTPCIntimas = infantil['Peças Íntimas'];
    const VrVendaINFANTAcessorios = infantil['Acessórios'];

    const vrVendaCALCADOMeta = somarTotal(item.vendasecaocalcados, 'venda-calcados', 'VRTOTALLIQUIDOCALC');
    const VrVendaCMB = somarTotal(item.vendasecaocmb, 'venda-cmb', 'VRTOTALLIQUIDOCMB');
    const vrVendaOUTROSMeta = somarTotal(item.vendasecaooutros, 'venda-outros', 'VRTOTALLIQUIDOPUTROS');

    const percVendaFEMVeraoInverno = calcularPercentual(VrVendaFEMVeraoInverno, vrVendaMeta);
    const percVendaFEMPCIntimas = calcularPercentual(VrVendaFEMPCIntimas, vrVendaMeta);
    const percVendaFEMAcessorios = calcularPercentual(VrVendaFEMAcessorios, vrVendaMeta);

    const percVendaMASCVeraoInverno = calcularPercentual(VrVendaMASCVeraoInverno, vrVendaMeta);
    const percVendaMASCPCIntimas = calcularPercentual(VrVendaMASCPCIntimas, vrVendaMeta);
    const percVendaMASCAcessorios = calcularPercentual(VrVendaMASCAcessorios, vrVendaMeta);

    const percVendaINFANTVeraoInverno = calcularPercentual(VrVendaINFANTVeraoInverno, vrVendaMeta);
    const percVendaINFANTPCIntimas = calcularPercentual(VrVendaINFANTPCIntimas, vrVendaMeta);
    const percVendaINFANTAcessorios = calcularPercentual(VrVendaINFANTAcessorios, vrVendaMeta);

    const percVendaCALCADO = calcularPercentual(vrVendaCALCADOMeta, vrVendaMeta);
    const percVendaOUTROS = calcularPercentual(vrVendaOUTROSMeta, vrVendaMeta);
    const percVendaCMB = calcularPercentual(VrVendaCMB, vrVendaMeta);

    const percTotalVenda = percVendaCALCADO + percVendaFEMVeraoInverno + percVendaFEMPCIntimas + percVendaFEMAcessorios
      + percVendaMASCVeraoInverno + percVendaMASCPCIntimas + percVendaMASCAcessorios
      + percVendaINFANTVeraoInverno + percVendaINFANTPCIntimas + percVendaINFANTAcessorios
      + percVendaCMB + percVendaOUTROS;

    return {
      contador,
      IDEMPRESA: item.vendaTotalMarca?.IDEMPRESA,
      NOFANTASIA: item.vendaTotalMarca?.NOFANTASIA,
      VRTOTALLIQUIDO: item.vendaTotalMarca?.VRTOTALLIQUIDO,

      IDMETASLOJA: item.IDMETASLOJA,
      DTMETAINICIO: item.DTMETAINICIO,
      DTMETAFIM: item.DTMETAFIM,

      VRVENDAGERAL: vrVendaMeta,
      PERCMETAVENDAGERAL: 0,
      VRMETAVENDAGERAL: 0,

      VRVENDACALCADOS: vrVendaCALCADOMeta,
      PERCVENDACALCADOS: percVendaCALCADO,
      VRMETAVENDACALCADOS: 0,
      PERCMETAVENDACALCADOS: 0,

      VRVENDAFEMVERINV: VrVendaFEMVeraoInverno,
      PERCVENDAFEMVERINV: percVendaFEMVeraoInverno,
      VRMETAVENDAFEMVERINV: 0,
      PERCMETAVENDAFEMVERINV: 0,
      VRVENDAFEMPCINTIMA: VrVendaFEMPCIntimas,
      PERCVENDAFEMPCINTIMA: percVendaFEMPCIntimas,
      VRMETAVENDAFEMPCINTIMA: 0,
      PERCMETAVENDAFEMPCINTIMA: 0,
      VRVENDAFEMACESSORIOS: VrVendaFEMAcessorios,
      PERCVENDAFEMACESSORIOS: percVendaFEMAcessorios,
      VRMETAVENDAFEMACESSORIOS: 0,
      PERCMETAVENDAFEMACESSORIOS: 0,

      VRVENDAMASCVERINV: VrVendaMASCVeraoInverno,
      PERCVENDAMASCVERINV: percVendaMASCVeraoInverno,
      VRMETAVENDAMASCVERINV: 0,
      PERCMETAVENDAMASCVERINV: 0,
      VRVENDAMASCPCINTIMA: VrVendaMASCPCIntimas,
      PERCVENDAMASCPCINTIMA: percVendaMASCPCIntimas,
      VRMETAVENDAMASCPCINTIMA: 0,
      PERCMETAVENDAMASCPCINTIMA: 0,
      VRVENDAMASCACESSORIOS: VrVendaMASCAcessorios,
      PERCVENDAMASCACESSORIOS: percVendaMASCAcessorios,
      VRMETAVENDAMASCACESSORIOS: 0,
      PERCMETAVENDAMASCACESSORIOS: 0,

      VRVENDAINFANTVERINV: VrVendaINFANTVeraoInverno,
      PERCVENDAINFANTVERINV: percVendaINFANTVeraoInverno,
      VRMETAVENDAINFANTVERINV: 0,
      PERCMETAVENDAINFANTVERINV: 0,
      VRVENDAINFANTPCINTIMA: VrVendaINFANTPCIntimas,
      PERCVENDAINFANTPCINTIMA: percVendaINFANTPCIntimas,
      VRMETAVENDAINFANTPCINTIMA: 0,
      PERCMETAVENDAINFANTPCINTIMA: 0,
      VRVENDAINFANTACESSORIOS: VrVendaINFANTAcessorios,
      PERCVENDAINFANTACESSORIOS: percVendaINFANTAcessorios,
      VRMETAVENDAINFANTACESSORIOS: 0,
      PERCMETAVENDAINFANTACESSORIOS: 0,

      VRVENDACMB: VrVendaCMB,
      PERCVENDACMB: percVendaCMB,
      VRMETAVENDACMB: 0,
      PERCMETAVENDACMB: 0,

      VRMETAVENDAOUTROS: vrVendaOUTROSMeta,
      PERCMETAVENDAOUTROS: percVendaOUTROS,

      PERCTOTALVENDA: percTotalVenda,
      VRTOTALVENDAVESTUARIO: item.VRTOTALVENDAVESTUARIO,
      VRTOTALMETAVESTUARIO: item.VRTOTALMETAVESTUARIO,

      STATIVO: item.STATIVO,
    };
  }), [dadosMetasEstrutura]);

  const conversor = (valor) => {
    if (valor === undefined || valor === null) return NaN;
    const texto = String(valor).trim();
    if (texto === '') return NaN;
    const virgulaSeparaDecimais = texto.match(/(,)\d{2}$/);
    const numero = virgulaSeparaDecimais
      ? texto.replace(/\./g, '').replace(',', '.')
      : texto.replace(',', '');
    return parseFloat(numero);
  };

  const mascaraValor = (valor) => {
    let v = String(valor).replace(/\D/g, '');
    v = v.replace(/(\d{1})(\d{17})$/, '$1.$2');
    v = v.replace(/(\d{1})(\d{14})$/, '$1.$2');
    v = v.replace(/(\d{1})(\d{11})$/, '$1.$2');
    v = v.replace(/(\d{1})(\d{8})$/, '$1.$2');
    v = v.replace(/(\d{1})(\d{5})$/, '$1.$2');
    v = v.replace(/(\d{1})(\d{2})$/, '$1,$2');
    return v;
  };

  const formatoPtBr = (valor) => {
    const numero = Number(valor);
    return (isNaN(numero) ? 0 : numero).toLocaleString('pt-br', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const mascaraMoedaDigitando = (valorAtual) => {
    const digitos = valorAtual.replace(/[^\d]+/g, '').split('').reverse().join('');
    const mascara = '##.###.###,##'.split('').reverse().join('');
    let resultado = '';
    for (let x = 0, y = 0; x < mascara.length && y < digitos.length;) {
      if (mascara.charAt(x) !== '#') {
        resultado += mascara.charAt(x);
        x += 1;
      } else {
        resultado += digitos.charAt(y);
        y += 1;
        x += 1;
      }
    }
    return resultado.split('').reverse().join('');
  };

  const CATEGORIAS_META = [
    { key: 'Calcado', percVendaField: 'PERCVENDACALCADOS' },
    { key: 'FemVeraoInv', percVendaField: 'PERCVENDAFEMVERINV' },
    { key: 'FemIntimo', percVendaField: 'PERCVENDAFEMPCINTIMA' },
    { key: 'FemAcess', percVendaField: 'PERCVENDAFEMACESSORIOS' },
    { key: 'MascVeraoInv', percVendaField: 'PERCVENDAMASCVERINV' },
    { key: 'MascIntimo', percVendaField: 'PERCVENDAMASCPCINTIMA' },
    { key: 'MascAcess', percVendaField: 'PERCVENDAMASCACESSORIOS' },
    { key: 'InfantVeraoInv', percVendaField: 'PERCVENDAINFANTVERINV' },
    { key: 'InfantIntimo', percVendaField: 'PERCVENDAINFANTPCINTIMA' },
    { key: 'InfantAcess', percVendaField: 'PERCVENDAINFANTACESSORIOS' },
    { key: 'CMB', percVendaField: 'PERCVENDACMB' },
  ];

  const criarMetaInicial = (row) => ({
    pcMetaGeral: '0',
    vrMeta: '0',
    vrMetaCalcado: '0',
    pcMetaCalcado: '0',
    vrMetaFemVeraoInv: '0',
    pcMetaFemVeraoInv: '0',
    vrMetaFemIntimo: '0',
    pcMetaFemIntimo: '0',
    vrMetaFemAcess: '0',
    pcMetaFemAcess: '0',
    vrMetaMascVeraoInv: '0',
    pcMetaMascVeraoInv: '0',
    vrMetaMascIntimo: '0',
    pcMetaMascIntimo: '0',
    vrMetaMascAcess: '0',
    pcMetaMascAcess: '0',
    vrMetaInfantVeraoInv: '0',
    pcMetaInfantVeraoInv: '0',
    vrMetaInfantIntimo: '0',
    pcMetaInfantIntimo: '0',
    vrMetaInfantAcess: '0',
    pcMetaInfantAcess: '0',
    vrMetaCMB: '0',
    pcMetaCMB: '0',
    pcTotal: mascaraValor(Number(row.PERCTOTALVENDA || 0).toFixed(2)),
  });

  const metasIniciais = useMemo(() => {
    const estado = {};
    dados.forEach((row) => {
      estado[row.contador] = criarMetaInicial(row);
    });
    return estado;
  }, [dados]);

  const [metas, setMetas] = useState(metasIniciais);

  useEffect(() => {
    setMetas(metasIniciais);
  }, [metasIniciais]);

  const { handleCadastrar } = useCadastrarMeta({ usuarioLogado, optionsModulos, handleClick });

  const handleSalvarMetas = () => {
    const periodo = {
      marcaSelecionada,
      DTMETAINICIO: dataPesquisaInicio || dados[0]?.DTMETAINICIO,
      DTMETAFIM: dataPesquisaFim || dados[0]?.DTMETAFIM,
    };
    
    handleCadastrar(periodo, dados, metas);
  };

  const valorFocoRef = useRef({});

  const registrarFoco = (contador, campo) => {
    valorFocoRef.current[`${contador}_${campo}`] = metas[contador]?.[campo] ?? '0';
  };

  const valorMudouDesdeFoco = (contador, campo) => {
    const chave = `${contador}_${campo}`;
    const valorInicial = conversor(valorFocoRef.current[chave]);
    const valorAtual = conversor(metas[contador]?.[campo]);
    delete valorFocoRef.current[chave];
    const inicial = isNaN(valorInicial) ? 0 : valorInicial;
    const atual = isNaN(valorAtual) ? 0 : valorAtual;
    return inicial !== atual;
  };

  const atualizarCampoMeta = (contador, campo, valorDigitado) => {
    const valorMascarado = mascaraMoedaDigitando(valorDigitado);
    setMetas((atual) => ({
      ...atual,
      [contador]: {
        ...atual[contador],
        [campo]: valorMascarado,
      },
    }));
  };

  const recalcularTotalPercentual = (rowMeta) => {
    const total = CATEGORIAS_META.reduce((acc, { key }) => {
      const valor = conversor(rowMeta[`pcMeta${key}`]);
      return acc + (isNaN(valor) ? 0 : valor);
    }, 0);
    return mascaraValor(total.toFixed(2));
  };

  const atualizarMetasCascata = (rowDados, rowMeta) => {
    const vrMeta = conversor(rowMeta.vrMeta);
    const novoEstado = { ...rowMeta };
    let totalPercentual = 0;

    CATEGORIAS_META.forEach(({ key, percVendaField }) => {
      const percVenda = parseFloat(String(rowDados[percVendaField]).replace(',', '.')) || 0;
      const novoValor = parseFloat(vrMeta) * (percVenda / 100);
      let novoPerc = (parseFloat(novoValor) * 100) / parseFloat(vrMeta);
      if (isNaN(novoPerc)) novoPerc = 0;

      novoEstado[`vrMeta${key}`] = mascaraValor(novoValor.toFixed(2));
      novoEstado[`pcMeta${key}`] = mascaraValor(novoPerc.toFixed(2));

      totalPercentual += novoPerc;
    });

    novoEstado.pcTotal = mascaraValor(totalPercentual.toFixed(2));

    return novoEstado;
  };

  const handleBlurPcMetaGeral = (contador, rowDados) => {
    if (!valorMudouDesdeFoco(contador, 'pcMetaGeral')) return;
    setMetas((atual) => {
      const rowMeta = atual[contador];
      const vrMetaVenda = parseFloat(rowDados.VRVENDAGERAL) || 0;
      let pcMeta = conversor(rowMeta.pcMetaGeral);

      if (isNaN(pcMeta)) {
        alert('O Percentual não pode ser vazio');
        pcMeta = 0;
      }

      const novoValorMeta = (vrMetaVenda * (pcMeta / 100)) + vrMetaVenda;

      const rowMetaAtualizado = {
        ...rowMeta,
        pcMetaGeral: isNaN(conversor(rowMeta.pcMetaGeral)) ? '0' : rowMeta.pcMetaGeral,
        vrMeta: mascaraValor(novoValorMeta.toFixed(2)),
      };

      return {
        ...atual,
        [contador]: atualizarMetasCascata(rowDados, rowMetaAtualizado),
      };
    });
  };

  const handleBlurVrMetaGeral = (contador, rowDados) => {
    if (!valorMudouDesdeFoco(contador, 'vrMeta')) return;
    setMetas((atual) => {
      const rowMeta = atual[contador];
      const vrMetaVenda = parseFloat(rowDados.VRVENDAGERAL) || 0;
      let vrMeta = conversor(rowMeta.vrMeta);

      if (isNaN(vrMeta)) {
        alert('O Valor não pode ser vazio');
        vrMeta = 0;
      }

      const novoPercMeta = ((vrMeta * 100) / vrMetaVenda) - 100;

      const rowMetaAtualizado = {
        ...rowMeta,
        vrMeta: isNaN(conversor(rowMeta.vrMeta)) ? '0' : rowMeta.vrMeta,
        pcMetaGeral: mascaraValor((isNaN(novoPercMeta) ? 0 : novoPercMeta).toFixed(2)),
      };

      return {
        ...atual,
        [contador]: atualizarMetasCascata(rowDados, rowMetaAtualizado),
      };
    });
  };

  const handleBlurValorMetaCategoria = (contador, key) => {
    if (!valorMudouDesdeFoco(contador, `vrMeta${key}`)) return;
    setMetas((atual) => {
      const rowMeta = atual[contador];
      const vrMeta = conversor(rowMeta.vrMeta);
      const vrMetaCategoria = conversor(rowMeta[`vrMeta${key}`]);

      const novoPerc = (vrMetaCategoria * 100) / vrMeta;

      const rowMetaAtualizado = {
        ...rowMeta,
        [`pcMeta${key}`]: formatoPtBr(isNaN(novoPerc) ? 0 : novoPerc),
      };

      rowMetaAtualizado.pcTotal = recalcularTotalPercentual(rowMetaAtualizado);

      return {
        ...atual,
        [contador]: rowMetaAtualizado,
      };
    });
  };

  const handleBlurPercentMetaCategoria = (contador, key) => {
    if (!valorMudouDesdeFoco(contador, `pcMeta${key}`)) return;
    setMetas((atual) => {
      const rowMeta = atual[contador];
      const vrMeta = conversor(rowMeta.vrMeta);
      const percMetaCategoria = conversor(rowMeta[`pcMeta${key}`]);

      const novoValor = Math.trunc(isNaN(vrMeta) ? 0 : vrMeta) * (percMetaCategoria / 100);

      const rowMetaAtualizado = {
        ...rowMeta,
        [`vrMeta${key}`]: formatoPtBr(isNaN(novoValor) ? 0 : novoValor),
      };

      rowMetaAtualizado.pcTotal = recalcularTotalPercentual(rowMetaAtualizado);

      return {
        ...atual,
        [contador]: rowMetaAtualizado,
      };
    });
  };

  const renderReadonlyMoeda = (valor, color) => (
    <input
      type="text"
      className="form-control"
      readOnly
      style={{
        width: '100px', 
        ...(color ? { color } : {})
      }}
      value={mascaraValor(Number(valor || 0).toFixed(2))}
    />
  );

  const renderReadonlyPercent = (valor, color) => (
    <input
    type="text"
    className="form-control"
    readOnly
    style={{
      width: '100px', 
      ...(color ? { color } : {})
    }}
    value={mascaraValor(Number(valor || 0).toFixed(2))}
/>
  );

  const renderReadonlyTexto = (valor) => (
    <input 
      type="text" 
      className="form-control" 
      readOnly 
      value={valor ?? ''} 
      style={{
        width: '100px'
      }}  
    />
  );

  const renderEditableValor = (row, key, onBlurHandler) => (
    <input
      type="text"
      className="form-control"
      value={metas[row.contador]?.[`vrMeta${key}`] ?? '0'}
      onFocus={() => registrarFoco(row.contador, `vrMeta${key}`)}
      onChange={(e) => atualizarCampoMeta(row.contador, `vrMeta${key}`, e.target.value)}
      onBlur={() => onBlurHandler(row.contador, key)}
      style={{
        width: '100px'
      }}
    />
  );

  const renderEditablePercent = (row, key, onBlurHandler) => (
    <input
      type="text"
      className="form-control"
      value={metas[row.contador]?.[`pcMeta${key}`] ?? '0'}
      onFocus={() => registrarFoco(row.contador, `pcMeta${key}`)}
      onChange={(e) => atualizarCampoMeta(row.contador, `pcMeta${key}`, e.target.value)}
      onBlur={() => onBlurHandler(row.contador, key)}
      style={{
        width: '100px'
      }}
    />
  );

  const headerGrupo = (
    <ColumnGroup  >
      <Row>
        <Column  
          colSpan="5" 
          headerStyle={{ fontSize: '1rem', textAlign: 'center', justifyContent: 'center', backgroundColor: "#7a59ad", color: 'white' }} 
          headerClassName="grupo-meta-geral"
          header="VENDAS / META GERAL" 
        />
        <Column  
          colSpan="4" 
          headerStyle={{ fontSize: '1rem', textAlign: 'center', justifyContent: 'center', backgroundColor: "#FFDB8E", color: 'black' }} 
          headerClassName="grupo-meta-geral"
          header="CALÇADOS" 
        />
        <Column  
          colSpan="12"
          headerStyle={{ fontSize: '1rem', textAlign: 'center', justifyContent: 'center', backgroundColor: "#FE85BE", color: 'black' }}
          headerClassName="grupo-meta-geral" 
          header="SELEÇÃO FEMININA" 
        />
        <Column  
          colSpan="12"
          headerStyle={{ fontSize: '1rem', textAlign: 'center', justifyContent: 'center', backgroundColor: "#6AB8F7", color: 'black' }}
          headerClassName="grupo-meta-geral" 
          header="SELEÇÃO MASCULINA" 
        />
        <Column  
          colSpan="12"
          headerStyle={{ fontSize: '1rem', textAlign: 'center', justifyContent: 'center', backgroundColor: "#4DE5D5", color: 'black' }}
          headerClassName="grupo-meta-geral" 
          header="SELEÇÃO INFANTIL" 
        />
        <Column  
          colSpan="4"
          headerStyle={{ fontSize: '1rem', textAlign: 'center', justifyContent: 'center', backgroundColor: "#7a59ad", color: 'black' }}
          headerClassName="grupo-meta-geral" 
          header="CMB" 
        />
        <Column  
          colSpan="2"
          headerStyle={{ fontSize: '1rem', textAlign: 'center', justifyContent: 'center', backgroundColor: "#FE85BE", color: 'black' }}
          headerClassName="grupo-meta-geral" 
          header="OUTROS" 
        />
        <Column  
          colSpan="1"
          headerStyle={{ fontSize: '1rem', textAlign: 'center', justifyContent: 'center', backgroundColor: "#FFDB8E", color: 'black' }}
          headerClassName="grupo-meta-geral" 
          header="TOTAL" 
        />
      </Row>
     

      <Row>
        <Column 
          field="contador" 
          header="#" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}   
        />
        <Column 
          field="NOFANTASIA" 
          header="EMPRESA" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem', width: '150px' }}
        />
        <Column 
          field="VRVENDAGERAL" 
          header="Venda" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}  
        />
        <Column 
          field="PERCMETAVENDAGERAL" 
          header="% Meta" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}
        />
        <Column 
          field="VRMETAVENDAGERAL" 
          header="Vr Meta" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}  
        />
        

        <Column 
          field="VRVENDACALCADOS" 
          header="Geral" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#FFDB8E", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}  
        />
        <Column 
          field="PERCVENDACALCADOS" 
          header="%"
          sortable={true}
          style={{color: 'black', backgroundColor: "#FFDB8E", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}  
        />
        <Column 
          field="VRMETAVENDACALCADOS" 
          header="Vr Meta" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#ffca5b", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}
        />
         <Column 
          field="PERCMETAVENDACALCADOS" 
          header="%"
          sortable={true}
          style={{color: 'black', backgroundColor: "#ffca5b", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}  
        />

        <Column 
          field="VRVENDAFEMVERINV" 
          header="Verão/Inverno" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#FE85BE", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />

        <Column 
          field="PERCVENDAFEMVERINV" 
          header="%" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#FE85BE", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}  
        />
        <Column 
          field="VRMETAVENDAFEMVERINV" 
          header="Vr Meta" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#fd52a3", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}  
        />
        <Column 
          field="PERCMETAVENDAFEMVERINV" 
          header="*" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#fd52a3", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}  
        />
        <Column 
          field="VRVENDAFEMPCINTIMA" 
          header="Peça Intima" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#FE85BE", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}  
        />
        <Column 
          field="PERCVENDAFEMPCINTIMA" 
          header="%" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#FE85BE", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}  
        />
        <Column 
          field="VRMETAVENDAFEMPCINTIMA" 
          header="Vr Meta" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#fd52a3", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}  
        />
        <Column 
          field="PERCMETAVENDAFEMPCINTIMA" 
          header="*" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#fd52a3", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}  
        />
        <Column 
          field="VRVENDAFEMACESSORIOS" 
          header="Acessórios" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#FE85BE", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}  
        />
        <Column 
          field="PERCVENDAFEMACESSORIOS" 
          header="%" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#FE85BE", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}  
        />
         <Column 
          field="VRMETAVENDAFEMACESSORIOS" 
          header="Vr Meta" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#fd52a3", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}  
        />
        <Column 
          field="PERCMETAVENDAFEMACESSORIOS" 
          header="*" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#fd52a3", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}  
        />


        <Column 
          field="VRVENDAMASCVERINV" 
          header="Verão/Inverno" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#6AB8F7", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />
        <Column 
          field="PERCVENDAMASCVERINV" 
          header="%" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#6AB8F7", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />
        <Column 
          field="VRMETAVENDAMASCVERINV" 
          header="Vr Meta" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#39A1F4", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />
        <Column 
          field="PERCMETAVENDAMASCVERINV" 
          header="%" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#39A1F4", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />
        <Column 
          field="VRVENDAMASCPCINTIMA" 
          header="Peça Intima" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#6AB8F7", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />
        <Column 
          field="PERCVENDAMASCPCINTIMA" 
          header="%" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#6AB8F7", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />
        <Column 
          field="VRMETAVENDAMASCPCINTIMA" 
          header="Vr Meta" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#39A1F4", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />
        <Column 
          field="PERCMETAVENDAMASCPCINTIMA" 
          header="%" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#39A1F4", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />
        <Column 
          field="VRVENDAMASCACESSORIOS" 
          header="Acessórios" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#6AB8F7", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />
        <Column 
          field="PERCVENDAMASCACESSORIOS" 
          header="%" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#6AB8F7", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />
        <Column 
          field="VRMETAVENDAMASCACESSORIOS" 
          header="Vr Meta" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#39A1F4", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />
        <Column 
          field="PERCMETAVENDAMASCACESSORIOS" 
          header="%" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#39A1F4", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />


        <Column 
          field="VRVENDAINFANTVERINV" 
          header="Verão/Inverno" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#4DE5D5", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />

        <Column 
          field="PERCVENDAINFANTVERINV" 
          header="%" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#4DE5D5", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />
        <Column 
          field="VRMETAVENDAINFANTVERINV" 
          header="Vr Meta" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#21DFCB", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />
        <Column 
          field="PERCMETAVENDAINFANTVERINV" 
          header="%" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#21DFCB", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />
        <Column 
          field="VRVENDAINFANTPCINTIMA" 
          header="Peça Intima" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#4DE5D5", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />
        <Column 
          field="PERCVENDAINFANTPCINTIMA" 
          header="%" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#4DE5D5", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />
        <Column 
          field="VRMETAVENDAINFANTPCINTIMA" 
          header="Vr Meta" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#21DFCB", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />
        <Column 
          field="PERCMETAVENDAINFANTPCINTIMA" 
          header="%" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#21DFCB", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />
        <Column 
          field="VRVENDAINFANTACESSORIOS" 
          header="Acessórios" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#4DE5D5", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />
        <Column 
          field="PERCVENDAINFANTACESSORIOS" 
          header="%" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#4DE5D5", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />
        <Column 
          field="VRMETAVENDAINFANTACESSORIOS" 
          header="Vr Meta" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#21DFCB", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />
        <Column 
          field="PERCMETAVENDAINFANTACESSORIOS" 
          header="%" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#21DFCB", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />


        <Column 
          field="VRVENDACMB" 
          header="CMB" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#B19DCE", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />
        <Column 
          field="PERCVENDACMB" 
          header="%" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#B19DCE", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />
        <Column 
          field="VRMETAVENDACMB" 
          header="Vr Meta" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />
        <Column 
          field="PERCMETAVENDACMB" 
          header="%" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />
     
     
        <Column 
          field="VRMETAVENDAOUTROS" 
          header="Outros" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#FE85BE", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />
        <Column 
          field="PERCMETAVENDAOUTROS" 
          header="%" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#FE85BE", border: '1px solid #e9e9e9', fontSize: '0.8rem', width: '100px' }} 
        />
        
        <Column 
          field="PERCTOTALVENDA" 
          header="%" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#FFCA5B", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />
      </Row>
    </ColumnGroup>
  )

  return (

    <Fragment>
      <div className="panel" >
        <div className="panel-hdr">
          <h2>{`Criar Metas Detalhadas`}</h2>
          <ButtonTable
            onClickButton={handleSalvarMetas}
            titleButton="Incluir Todas as Metas das Lojas"
            textButton="Salvar Metas"
            cor="success"
            // Icon={FaRegSave}
            // iconSize={20}
            tipo="button"
            width="100px"
            height="40px"
          />
        </div>

        <div style={{ marginTop: "1rem", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <HeaderTable
            globalFilterValue={globalFilterValue}
            onGlobalFilterChange={onGlobalFilterChange}
            handlePrint={handlePrint}
            exportToExcel={exportToExcel}
            exportToPDF={exportToPDF}
          />

        </div>
        <div className="card" ref={dataTableRef}>

          <DataTable
            title="Lista Metas Resumida do Período"
            value={dados}
            size="small"
            headerColumnGroup={headerGrupo}
            globalFilter={globalFilterValue}
            sortOrder={-1}
            paginator={true}
            rows={dados.length}
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            rowsPerPageOptions={[10, 20, 50, dados.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            showGridlines
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
            cellMemo={false}
            >
              <Column field="contador" header="#" body={row => <label style={{color: '#2196F3', fontSize: '11px'}}>{row.contador}</label>} sortable={true} />
              <Column field="NOFANTASIA" header="Empresa" body={row => <p style={{width: '200px', fontSize: '0.8rem'}}>{row.NOFANTASIA}</p>} sortable={true} />
              <Column field="VRVENDAGERAL" header="Venda" body={row => renderReadonlyMoeda(row.VRVENDAGERAL)} sortable={true} />
              <Column field="PERCMETAVENDAGERAL" header="% Meta" body={row => (
                <input
                  type="text"
                  className="form-control"
                  value={metas[row.contador]?.pcMetaGeral ?? '0'}
                  onFocus={() => registrarFoco(row.contador, 'pcMetaGeral')}
                  onChange={(e) => atualizarCampoMeta(row.contador, 'pcMetaGeral', e.target.value)}
                  onBlur={() => handleBlurPcMetaGeral(row.contador, row)}
                  style={{
                    width: '100px'
                  }}
                />
              )} sortable={false} />
              <Column field="VRMETAVENDAGERAL" header="Vr Meta" body={row => (
                <input
                  type="text"
                  className="form-control"
                  value={metas[row.contador]?.vrMeta ?? '0'}
                  onFocus={() => registrarFoco(row.contador, 'vrMeta')}
                  onChange={(e) => atualizarCampoMeta(row.contador, 'vrMeta', e.target.value)}
                  onBlur={() => handleBlurVrMetaGeral(row.contador, row)}
                  style={{
                    width: '100px'
                  }}
                />
              )} sortable={false} />

              <Column field="VRVENDACALCADOS" header="Geral" body={row => renderReadonlyMoeda(row.VRVENDACALCADOS, '#FFA500')} sortable={true} />
              <Column field="PERCVENDACALCADOS" header="%" body={row => renderReadonlyPercent(row.PERCVENDACALCADOS, '#FFA500')} sortable={true} />
              <Column field="VRMETAVENDACALCADOS" header="Vr Meta" body={row => renderEditableValor(row, 'Calcado', handleBlurValorMetaCategoria)} sortable={false} />
              <Column field="PERCMETAVENDACALCADOS" header="%" body={row => renderEditablePercent(row, 'Calcado', handleBlurPercentMetaCategoria)} sortable={false} />

              <Column field="VRVENDAFEMVERINV" header="Verão/Inverno" body={row => renderReadonlyMoeda(row.VRVENDAFEMVERINV, '#FE85BE')} sortable={true} />
              <Column field="PERCVENDAFEMVERINV" header="%" body={row => renderReadonlyPercent(row.PERCVENDAFEMVERINV, '#FE85BE')} sortable={true} />
              <Column field="VRMETAVENDAFEMVERINV" header="Vr Meta" body={row => renderEditableValor(row, 'FemVeraoInv', handleBlurValorMetaCategoria)} sortable={false} />
              <Column field="PERCMETAVENDAFEMVERINV" header="%" body={row => renderEditablePercent(row, 'FemVeraoInv', handleBlurPercentMetaCategoria)} sortable={false} />
              <Column field="VRVENDAFEMPCINTIMA" header="Peça Intima" body={row => renderReadonlyMoeda(row.VRVENDAFEMPCINTIMA, '#FE85BE')} sortable={true} />
              <Column field="PERCVENDAFEMPCINTIMA" header="%" body={row => renderReadonlyPercent(row.PERCVENDAFEMPCINTIMA, '#FE85BE')} sortable={true} />
              <Column field="VRMETAVENDAFEMPCINTIMA" header="Vr Meta" body={row => renderEditableValor(row, 'FemIntimo', handleBlurValorMetaCategoria)} sortable={false} />
              <Column field="PERCMETAVENDAFEMPCINTIMA" header="%" body={row => renderEditablePercent(row, 'FemIntimo', handleBlurPercentMetaCategoria)} sortable={false} />
              <Column field="VRVENDAFEMACESSORIOS" header="Acessórios" body={row => renderReadonlyMoeda(row.VRVENDAFEMACESSORIOS, '#FE85BE')} sortable={true} />
              <Column field="PERCVENDAFEMACESSORIOS" header="%" body={row => renderReadonlyPercent(row.PERCVENDAFEMACESSORIOS, '#FE85BE')} sortable={true} />
              <Column field="VRMETAVENDAFEMACESSORIOS" header="Vr Meta" body={row => renderEditableValor(row, 'FemAcess', handleBlurValorMetaCategoria)} sortable={false} />
              <Column field="PERCMETAVENDAFEMACESSORIOS" header="%" body={row => renderEditablePercent(row, 'FemAcess', handleBlurPercentMetaCategoria)} sortable={false} />

              <Column field="VRVENDAMASCVERINV" header="Verão/Inverno" body={row => renderReadonlyMoeda(row.VRVENDAMASCVERINV, '#6AB8F7')} sortable={true} />
              <Column field="PERCVENDAMASCVERINV" header="%" body={row => renderReadonlyPercent(row.PERCVENDAMASCVERINV, '#6AB8F7')} sortable={true} />
              <Column field="VRMETAVENDAMASCVERINV" header="Vr Meta" body={row => renderEditableValor(row, 'MascVeraoInv', handleBlurValorMetaCategoria)} sortable={false} />
              <Column field="PERCMETAVENDAMASCVERINV" header="%" body={row => renderEditablePercent(row, 'MascVeraoInv', handleBlurPercentMetaCategoria)} sortable={false} />
              <Column field="VRVENDAMASCPCINTIMA" header="Peça Intima" body={row => renderReadonlyMoeda(row.VRVENDAMASCPCINTIMA, '#6AB8F7')} sortable={true} />
              <Column field="PERCVENDAMASCPCINTIMA" header="%" body={row => renderReadonlyPercent(row.PERCVENDAMASCPCINTIMA, '#6AB8F7')} sortable={true} />
              <Column field="VRMETAVENDAMASCPCINTIMA" header="Vr Meta" body={row => renderEditableValor(row, 'MascIntimo', handleBlurValorMetaCategoria)} sortable={false} />
              <Column field="PERCMETAVENDAMASCPCINTIMA" header="%" body={row => renderEditablePercent(row, 'MascIntimo', handleBlurPercentMetaCategoria)} sortable={false} />
              <Column field="VRVENDAMASCACESSORIOS" header="Acessórios" body={row => renderReadonlyMoeda(row.VRVENDAMASCACESSORIOS, '#6AB8F7')} sortable={true} />
              <Column field="PERCVENDAMASCACESSORIOS" header="%" body={row => renderReadonlyPercent(row.PERCVENDAMASCACESSORIOS, '#6AB8F7')} sortable={true} />
              <Column field="VRMETAVENDAMASCACESSORIOS" header="Vr Meta" body={row => renderEditableValor(row, 'MascAcess', handleBlurValorMetaCategoria)} sortable={false} />
              <Column field="PERCMETAVENDAMASCACESSORIOS" header="%" body={row => renderEditablePercent(row, 'MascAcess', handleBlurPercentMetaCategoria)} sortable={false} />

              <Column field="VRVENDAINFANTVERINV" header="Verão/Inverno" body={row => renderReadonlyMoeda(row.VRVENDAINFANTVERINV, '#3cb371')} sortable={true} />
              <Column field="PERCVENDAINFANTVERINV" header="%" body={row => renderReadonlyPercent(row.PERCVENDAINFANTVERINV, '#3cb371')} sortable={true} />
              <Column field="VRMETAVENDAINFANTVERINV" header="Vr Meta" body={row => renderEditableValor(row, 'InfantVeraoInv', handleBlurValorMetaCategoria)} sortable={false} />
              <Column field="PERCMETAVENDAINFANTVERINV" header="%" body={row => renderEditablePercent(row, 'InfantVeraoInv', handleBlurPercentMetaCategoria)} sortable={false} />
              <Column field="VRVENDAINFANTPCINTIMA" header="Peça Intima" body={row => renderReadonlyMoeda(row.VRVENDAINFANTPCINTIMA, '#3cb371')} sortable={true} />
              <Column field="PERCVENDAINFANTPCINTIMA" header="%" body={row => renderReadonlyPercent(row.PERCVENDAINFANTPCINTIMA, '#3cb371')} sortable={true} />
              <Column field="VRMETAVENDAINFANTPCINTIMA" header="Vr Meta" body={row => renderEditableValor(row, 'InfantIntimo', handleBlurValorMetaCategoria)} sortable={false} />
              <Column field="PERCMETAVENDAINFANTPCINTIMA" header="%" body={row => renderEditablePercent(row, 'InfantIntimo', handleBlurPercentMetaCategoria)} sortable={false} />
              <Column field="VRVENDAINFANTACESSORIOS" header="Acessórios" body={row => renderReadonlyMoeda(row.VRVENDAINFANTACESSORIOS, '#3cb371')} sortable={true} />
              <Column field="PERCVENDAINFANTACESSORIOS" header="%" body={row => renderReadonlyPercent(row.PERCVENDAINFANTACESSORIOS, '#3cb371')} sortable={true} />
              <Column field="VRMETAVENDAINFANTACESSORIOS" header="Vr Meta" body={row => renderEditableValor(row, 'InfantAcess', handleBlurValorMetaCategoria)} sortable={false} />
              <Column field="PERCMETAVENDAINFANTACESSORIOS" header="%" body={row => renderEditablePercent(row, 'InfantAcess', handleBlurPercentMetaCategoria)} sortable={false} />

              <Column field="VRVENDACMB" header="CMB" body={row => renderReadonlyMoeda(row.VRVENDACMB, '#6a5acd')} sortable={true} />
              <Column field="PERCVENDACMB" header="%" body={row => renderReadonlyPercent(row.PERCVENDACMB, '#6a5acd')} sortable={true} />
              <Column field="VRMETAVENDACMB" header="Vr Meta" body={row => renderEditableValor(row, 'CMB', handleBlurValorMetaCategoria)} sortable={false} />
              <Column field="PERCMETAVENDACMB" header="%" body={row => renderEditablePercent(row, 'CMB', handleBlurPercentMetaCategoria)} sortable={false} />

              <Column field="VRMETAVENDAOUTROS" header="Outros" body={row => renderReadonlyMoeda(row.VRMETAVENDAOUTROS, '#FE85BE')} sortable={true} />
              <Column field="PERCMETAVENDAOUTROS" header="%" body={row => renderReadonlyPercent(row.PERCMETAVENDAOUTROS, '#FE85BE')} style={{width: '100px'}} sortable={true} />

              <Column field="PERCTOTALVENDA" header="%" body={row => (
                <input 
                  type="text" 
                  className="form-control" 
                  readOnly 
                  style={{
                    color: '#FFA500',
                    width: '100px'
                  }} 
                  value={metas[row.contador]?.pcTotal ?? '0'} 
                />
              )} sortable={false} />
             
            </DataTable>
        </div>
      </div>
    </Fragment>
  )
}