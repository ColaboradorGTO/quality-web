import { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import 'jspdf-autotable';
import HeaderTable from "../../../Tables/headerTable";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import  "./styles.css";
import { formatMoeda } from "../../../../utils/formatMoeda";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { ButtonType } from "../../../Buttons/ButtonType";
import { get } from "../../../../api/funcRequest";
import { ActionMetasCalcadosModal } from "./MetasCalcado/actionMetasCalcadosModal";
import Swal from "sweetalert2";

export const ActionListaMetasDetalhadas = ({ 
  dadosDetalheMeta,
  usuarioLogado,
  optionsModulos
}) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const [modalCalcados, setModalCalcados] = useState(null)
  const [dadosDetalhe, setDadosDetalhe] = useState([])
  const [secaoSelecionada, setSecaoSelecionada] = useState('')

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
    { title: 'VENDAS / META GERAL', span: 4, fill: '#7a59ad', text: '#FFFFFF' },
    { title: 'CALCADOS', span: 2, fill: '#FFDB8E', text: '#000000' },
    { title: 'SELECAO FEMININA', span: 6, fill: '#FE85BE', text: '#000000' },
    { title: 'SELECAO MASCULINA', span: 6, fill: '#6AB8F7', text: '#000000' },
    { title: 'SELECAO INFANTIL', span: 6, fill: '#4DE5D5', text: '#000000' },
    { title: 'CMB', span: 2, fill: '#7a59ad', text: '#FFFFFF' },
    { title: 'OUTROS', span: 2, fill: '#FE85BE', text: '#000000' },
    { title: 'TOTAL', span: 1, fill: '#FFDB8E', text: '#000000' },
  ];

  const moeda = (field) => (item) => formatMoeda(item[field]);
  const percent = (field) => (item) => formatPercent(item[field]);

  // Mesmas colunas (e ordem) exibidas na tabela
  const exportColumns = [
    { header: '#', fill: '#7a59ad', text: '#FFFFFF', value: (item) => item.contador },
    { header: 'EMPRESA', fill: '#7a59ad', text: '#FFFFFF', value: (item) => item.NOFANTASIA },
    { header: 'Data Meta', fill: '#7a59ad', text: '#FFFFFF', value: (item) => item.dataMeta },
    { header: 'Vr Meta', fill: '#7a59ad', text: '#FFFFFF', value: moeda('VRMETAVENDAGERAL') },

    { header: 'Vr Meta', fill: '#ffca5b', text: '#000000', value: moeda('VRMETAVENDACALCADOS') },
    { header: '%', fill: '#ffca5b', text: '#000000', value: percent('PERCMETAVENDACALCADOS') },

    { header: 'Verao/Inverno', fill: '#FE85BE', text: '#000000', value: moeda('VRMETAVENDAFEMVERINV') },
    { header: '%', fill: '#FE85BE', text: '#000000', value: percent('PERCMETAVENDAFEMVERINV') },
    { header: 'Peca Intima', fill: '#FE85BE', text: '#000000', value: moeda('VRMETAVENDAFEMPCINTIMA') },
    { header: '%', fill: '#FE85BE', text: '#000000', value: percent('PERCMETAVENDAFEMPCINTIMA') },
    { header: 'Acessorios', fill: '#FE85BE', text: '#000000', value: moeda('VRMETAVENDAFEMACESSORIOS') },
    { header: '%', fill: '#FE85BE', text: '#000000', value: percent('PERCMETAVENDAFEMACESSORIOS') },

    { header: 'Verao/Inverno', fill: '#6AB8F7', text: '#000000', value: moeda('VRMETAVENDAMASCVERINV') },
    { header: '%', fill: '#6AB8F7', text: '#000000', value: percent('PERCVENDAMASCVERINV') },
    { header: 'Peca Intima', fill: '#6AB8F7', text: '#000000', value: moeda('VRMETAVENDAMASCPCINTIMA') },
    { header: '%', fill: '#6AB8F7', text: '#000000', value: percent('PERCMETAVENDAMASCPCINTIMA') },
    { header: 'Acessorios', fill: '#6AB8F7', text: '#000000', value: moeda('VRMETAVENDAMASCACESSORIOS') },
    { header: '%', fill: '#6AB8F7', text: '#000000', value: percent('PERCVENDAMASCACESSORIOS') },

    { header: 'Verao/Inverno', fill: '#4DE5D5', text: '#000000', value: moeda('VRMETAVENDAINFANTVERINV') },
    { header: '%', fill: '#4DE5D5', text: '#000000', value: percent('PERCMETAVENDAINFANTVERINV') },
    { header: 'Peca Intima', fill: '#4DE5D5', text: '#000000', value: moeda('VRMETAVENDAINFANTPCINTIMA') },
    { header: '%', fill: '#4DE5D5', text: '#000000', value: percent('PERCMETAVENDAINFANTPCINTIMA') },
    { header: 'Acessorios', fill: '#4DE5D5', text: '#000000', value: moeda('VRMETAVENDAINFANTACESSORIOS') },
    { header: '%', fill: '#4DE5D5', text: '#000000', value: percent('PERCMETAVENDAINFANTACESSORIOS') },

    { header: 'Vr Meta', fill: '#7a59ad', text: '#FFFFFF', value: moeda('VRMETAVENDACMB') },
    { header: '%', fill: '#7a59ad', text: '#FFFFFF', value: percent('PERCMETAVENDACMB') },

    { header: 'Vr Meta', fill: '#FE85BE', text: '#000000', value: moeda('VRMETAVENDAOUTROS') },
    { header: '%', fill: '#FE85BE', text: '#000000', value: percent('PERCMETAVENDAOUTROS') },

    { header: '%', fill: '#FFCA5B', text: '#000000', value: percent('PERCTOTALVENDA') },
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
    }));

    worksheet.views = [{ state: 'frozen', ySplit: 2 }];

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "metas_detalhadas.xlsx");
  };

  const dados = dadosDetalheMeta?.map((item, index) => {
    let contador = index + 1;
    let dataMeta = item.DTMETAINICIO + ' a ' + item.DTMETAFIM;
    return {
      contador,
      IDMETASLOJA: item.IDMETASLOJA,
      DTMETAINICIO: item.DTMETAINICIO,
      DTMETAFIM: item.DTMETAFIM,
      NOFANTASIA: item.NOFANTASIA,
      VRVENDAGERAL: item.VRVENDAGERAL,
      PERCMETAVENDAGERAL: item.PERCMETAVENDAGERAL,
      VRMETAVENDAGERAL: item.VRMETAVENDAGERAL,
      VRVENDACALCADOS: item.VRVENDACALCADOS,
      PERCVENDACALCADOS: item.PERCVENDACALCADOS,
      VRMETAVENDACALCADOS: item.VRMETAVENDACALCADOS,
      PERCMETAVENDACALCADOS: item.PERCMETAVENDACALCADOS,

      VRVENDAFEMVERINV: item.VRVENDAFEMVERINV,
      PERCVENDAFEMVERINV: item.PERCVENDAFEMVERINV,
      VRMETAVENDAFEMVERINV: item.VRMETAVENDAFEMVERINV,
      PERCMETAVENDAFEMVERINV: item.PERCMETAVENDAFEMVERINV,
      VRVENDAFEMPCINTIMA: item.VRVENDAFEMPCINTIMA,
      PERCVENDAFEMPCINTIMA: item.PERCVENDAFEMPCINTIMA,
      VRMETAVENDAFEMPCINTIMA: item.VRMETAVENDAFEMPCINTIMA,
      PERCMETAVENDAFEMPCINTIMA: item.PERCMETAVENDAFEMPCINTIMA,
      VRVENDAFEMACESSORIOS: item.VRVENDAFEMACESSORIOS,
      PERCVENDAFEMACESSORIOS: item.PERCVENDAFEMACESSORIOS,
      VRMETAVENDAFEMACESSORIOS: item.VRMETAVENDAFEMACESSORIOS,
      PERCMETAVENDAFEMACESSORIOS: item.PERCMETAVENDAFEMACESSORIOS,

      VRVENDAMASCVERINV: item.VRVENDAMASCVERINV,
      PERCVENDAMASCVERINV: item.PERCVENDAMASCVERINV,
      VRMETAVENDAMASCVERINV: item.VRMETAVENDAMASCVERINV,
      PERCMETAVENDAMASCVERINV: item.PERCMETAVENDAMASCVERINV,
      VRVENDAMASCPCINTIMA: item.VRVENDAMASCPCINTIMA,
      PERCVENDAMASCPCINTIMA: item.PERCVENDAMASCPCINTIMA,
      VRMETAVENDAMASCPCINTIMA: item.VRMETAVENDAMASCPCINTIMA,
      PERCMETAVENDAMASCPCINTIMA: item.PERCMETAVENDAMASCPCINTIMA,
      VRVENDAMASCACESSORIOS: item.VRVENDAMASCACESSORIOS,
      PERCVENDAMASCACESSORIOS: item.PERCVENDAMASCACESSORIOS,
      VRMETAVENDAMASCACESSORIOS: item.VRMETAVENDAMASCACESSORIOS,
      PERCMETAVENDAMASCACESSORIOS: item.PERCMETAVENDAMASCACESSORIOS,

      VRVENDAINFANTVERINV: item.VRVENDAINFANTVERINV,
      PERCVENDAINFANTVERINV: item.PERCVENDAINFANTVERINV,
      VRMETAVENDAINFANTVERINV: item.VRMETAVENDAINFANTVERINV,
      PERCMETAVENDAINFANTVERINV: item.PERCMETAVENDAINFANTVERINV,
      VRVENDAINFANTPCINTIMA: item.VRVENDAINFANTPCINTIMA,
      PERCVENDAINFANTPCINTIMA: item.PERCVENDAINFANTPCINTIMA,
      VRMETAVENDAINFANTPCINTIMA: item.VRMETAVENDAINFANTPCINTIMA,
      PERCMETAVENDAINFANTPCINTIMA: item.PERCMETAVENDAINFANTPCINTIMA,
      VRVENDAINFANTACESSORIOS: item.VRVENDAINFANTACESSORIOS,
      PERCVENDAINFANTACESSORIOS: item.PERCVENDAINFANTACESSORIOS,
      VRMETAVENDAINFANTACESSORIOS: item.VRMETAVENDAINFANTACESSORIOS,
      PERCMETAVENDAINFANTACESSORIOS: item.PERCMETAVENDAINFANTACESSORIOS,

      VRVENDACMB: item.VRVENDACMB,
      PERCVENDACMB: item.PERCVENDACMB,
      VRMETAVENDACMB: item.VRMETAVENDACMB,
      PERCMETAVENDACMB: item.PERCMETAVENDACMB,

      VRMETAVENDAOUTROS: item.VRMETAVENDAOUTROS,
      PERCMETAVENDAOUTROS: item.PERCMETAVENDAOUTROS,

      PERCTOTALVENDA: item.PERCTOTALVENDA,
      VRTOTALVENDAVESTUARIO: item.VRTOTALVENDAVESTUARIO,
      VRTOTALMETAVESTUARIO: item.VRTOTALMETAVESTUARIO,

      STATIVO: item.STATIVO,
      dataMeta
    };
  });

  const headerGrupo = (
    <ColumnGroup  >
      <Row>
        <Column  
          colSpan="4" 
          headerStyle={{ fontSize: '1rem', textAlign: 'center', justifyContent: 'center', backgroundColor: "#7a59ad", color: 'white' }} 
          headerClassName="grupo-meta-geral"
          header="VENDAS / META GERAL" 
        />
        <Column  
          colSpan="2" 
          headerStyle={{ fontSize: '1rem', textAlign: 'center', justifyContent: 'center', backgroundColor: "#FFDB8E", color: 'black' }} 
          headerClassName="grupo-meta-geral"
          header="CALÇADOS" 
        />
        <Column  
          colSpan="6"
          headerStyle={{ fontSize: '1rem', textAlign: 'center', justifyContent: 'center', backgroundColor: "#FE85BE", color: 'black' }}
          headerClassName="grupo-meta-geral" 
          header="SELEÇÃO FEMININA" 
        />
        <Column  
          colSpan="6"
          headerStyle={{ fontSize: '1rem', textAlign: 'center', justifyContent: 'center', backgroundColor: "#6AB8F7", color: 'black' }}
          headerClassName="grupo-meta-geral" 
          header="SELEÇÃO MASCULINA" 
        />
        <Column  
          colSpan="6"
          headerStyle={{ fontSize: '1rem', textAlign: 'center', justifyContent: 'center', backgroundColor: "#4DE5D5", color: 'black' }}
          headerClassName="grupo-meta-geral" 
          header="SELEÇÃO INFANTIL" 
        />
        <Column  
          colSpan="2"
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
          style={{color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}
        />
        <Column 
          field="VRVENDAGERAL" 
          header="Data Meta" 
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
          field="VRMETAVENDAFEMVERINV" 
          header="Verão/Inverno" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#FE85BE", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />

        <Column 
          field="PERCMETAVENDAFEMVERINV" 
          header="%" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#FE85BE", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}  
        />

        <Column 
          field="VRMETAVENDAFEMPCINTIMA" 
          header="Peça Intima" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#FE85BE", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}  
        />
        <Column 
          field="PERCMETAVENDAFEMPCINTIMA" 
          header="%" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#FE85BE", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}  
        />

        <Column 
          field="VRMETAVENDAFEMACESSORIOS" 
          header="Acessórios" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#FE85BE", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}  
        />
        <Column 
          field="PERCMETAVENDAFEMACESSORIOS" 
          header="%" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#FE85BE", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}  
        />

        <Column 
          field="VRMETAVENDAMASCVERINV" 
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
          field="VRMETAVENDAMASCPCINTIMA" 
          header="Peça Intíma" 
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
          field="PERCVENDAMASCACESSORIOS" 
          header="Acesórios" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#6AB8F7", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />
        <Column 
          field="VRMETAVENDAMASCACESSORIOS" 
          header="%" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#39A1F4", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />
 

        <Column 
          field="VRMETAVENDAINFANTVERINV" 
          header="Verão/Inverno" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#4DE5D5", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />

        <Column 
          field="PERCMETAVENDAINFANTVERINV" 
          header="%" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#4DE5D5", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />

        <Column 
          field="VRMETAVENDAINFANTPCINTIMA" 
          header="Peça Intima" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#4DE5D5", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />

  
        <Column 
          field="PERCMETAVENDAINFANTPCINTIMA" 
          header="%" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#4DE5D5", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />
        <Column 
          field="VRMETAVENDAINFANTACESSORIOS" 
          header="Acessórios" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#4DE5D5", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />
        <Column 
          field="PERCMETAVENDAINFANTACESSORIOS" 
          header="%" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#21DFCB", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />

 
        <Column 
          field="VRMETAVENDACMB" 
          header="CMB" 
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
          style={{color: 'black', backgroundColor: "#FE85BE", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
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

  const handleCalcado = async (IDMETASLOJA, secao) => {
    try {
      const response = await get(`/meta-secao-calcado?idMeta=${IDMETASLOJA}`);
      if (response.data && response.data.length > 0) {
        setDadosDetalhe(response.data);
        setSecaoSelecionada(secao);
        setModalCalcados(true);
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Atenção',
          text: 'Não tem dados cadastrados nesta seção',
          timer: 5000,
        })
        return;
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da venda: ', error);
    }
  };

  const handleClickCalcado = (dados, secao) => {
    if(optionsModulos[0].ALTERAR == 'True') {
      if (dados && dados[0]?.IDMETASLOJA) {
        handleCalcado(dados[0]?.IDMETASLOJA, secao);
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Atenção!',
        text: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para acessar tela.`,
        confirmButtonColor: '#7352A5',
        timer: 5000,
        customClass: {
          container: 'custom-swal',
        },
      });
    } 
  };

  const handleFeminino = async (IDMETASLOJA, secao) => {
    try {
      const response = await get(`/meta-secao-feminino?idMeta=${IDMETASLOJA}`);
      if (response.data && response.data.length > 0) {
        setDadosDetalhe(response.data);
        setSecaoSelecionada(secao);
        setModalCalcados(true);
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Atenção',
          text: 'Não tem dados cadastrados nesta seção',
          timer: 5000,
        })
        return;
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da venda: ', error);
    }
  };

  const handleClickFeminino = (dados, secao) => {
    if(optionsModulos[0].ALTERAR == 'True') {
      if (dados && dados[0]?.IDMETASLOJA) {
        handleFeminino(dados[0]?.IDMETASLOJA, secao);
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Atenção!',
        text: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para acessar tela.`,
        confirmButtonColor: '#7352A5',
        timer: 5000,
        customClass: {
          container: 'custom-swal',
        },
      });
    } 
  };

  const handleMasculino = async (IDMETASLOJA, secao) => {
    try {
      const response = await get(`/meta-secao-masculino?idMeta=${IDMETASLOJA}`);
      if (response.data && response.data.length > 0) {
        setDadosDetalhe(response.data);
        setSecaoSelecionada(secao);
        setModalCalcados(true);
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Atenção',
          text: 'Não tem dados cadastrados nesta seção',
          timer: 5000,
        })
        return;
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da venda: ', error);
    }
  };

  const handleClickMasculino = (dados, secao) => {
    if(optionsModulos[0].ALTERAR == 'True') {
      if (dados && dados[0]?.IDMETASLOJA) {
        handleMasculino(dados[0]?.IDMETASLOJA, secao);
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Atenção!',
        text: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para acessar tela.`,
        confirmButtonColor: '#7352A5',
        timer: 5000,
        customClass: {
          container: 'custom-swal',
        },
      });
    } 
  };

  const handleInfantil = async (IDMETASLOJA, secao) => {
    try {
      const response = await get(`/meta-secao-masculino?idMeta=${IDMETASLOJA}`);
      if (response.data && response.data.length > 0) {
        setDadosDetalhe(response.data);
        setSecaoSelecionada(secao);
        setModalCalcados(true);
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Atenção',
          text: 'Não tem dados cadastrados nesta seção',
          timer: 5000,
        })
        return;
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da venda: ', error);
    }
  };

  const handleClickInfantil = (dados, secao) => {
    if(optionsModulos[0].ALTERAR == 'True') {
      if (dados && dados[0]?.IDMETASLOJA) {
        handleInfantil(dados[0]?.IDMETASLOJA, secao);
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Atenção!',
        text: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para acessar tela.`,
        confirmButtonColor: '#7352A5',
        timer: 5000,
        customClass: {
          container: 'custom-swal',
        },
      });
    } 
  };
  
  const handleCMB = async (IDMETASLOJA, secao) => {
    try {
      const response = await get(`/meta-secao-cmb?idMeta=${IDMETASLOJA}`);
      if (response.data && response.data.length > 0) {
        setDadosDetalhe(response.data);
        setSecaoSelecionada(secao);
        setModalCalcados(true);
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Atenção',
          text: 'Não tem dados cadastrados nesta seção',
          timer: 5000,
        })
        return;
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da venda: ', error);
    }
  };

  const handleClickCMB = (dados, secao) => {
    if(optionsModulos[0].ALTERAR == 'True') {
      if (dados && dados[0]?.IDMETASLOJA) {
        handleCMB(dados[0]?.IDMETASLOJA, secao);
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Atenção!',
        text: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para acessar tela.`,
        confirmButtonColor: '#7352A5',
        timer: 5000,
        customClass: {
          container: 'custom-swal',
        },
      });
    } 
  };

  return (

    <Fragment>
      <div className="panel" >
        <div className="panel-hdr">
          <h2>{`Detalhes da Meta`}</h2>
        </div>
        <div className="row pr-3" style={{justifyContent: 'right'}}>
          <ButtonType 
            onClickButtonType={() => handleClickCalcado(dados, 'CALÇADOS')}
            textButton={"Cadastrar Metas Calcados"}
            cor={"success"}
          />
          <ButtonType 
            onClickButtonType={() => handleClickFeminino(dados, 'FEMININO')}
            textButton={"Cadastrar Metas Feminino"}
            cor={"warning"}
          />
          <ButtonType 
            onClickButtonType={() => handleClickMasculino(dados, 'MASCULINO')}
            textButton={"Cadastrar Metas Masculino"}
            cor={"primary"}
          />
          <ButtonType 
            onClickButtonType={() => handleClickInfantil(dados, 'INFANTIL')}
            textButton={"Cadastrar Metas Infantil"}
            cor={"danger"}
          />
          <ButtonType 
            onClickButtonType={() => handleClickCMB(dados, 'CMB')}
            textButton={"Cadastrar Metas CMB"}
            cor={"success"}
          />

        </div>
        <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
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
            cellMemo={false}
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
            
            >
              <Column field="contador" header="#" body={row => <th>{row.contador}</th>} sortable={true} />
              <Column field="NOFANTASIA" header="Empresa" body={row => <p style={{fontWeight: 600, width: '250px'}} >{row.NOFANTASIA}</p>} sortable={true} />
              <Column field="dataMeta" header="Data Meta" body={row => <th>{row.dataMeta}</th>} sortable={true} />
              <Column field="VRMETAVENDAGERAL" header="Vr Meta" body={row => <th>{formatMoeda(row.VRMETAVENDAGERAL)}</th>} sortable={true} />
            
              <Column field="VRMETAVENDACALCADOS" header="Vr Meta" body={row => <th style={{color: '#FFA500'}}>{formatMoeda(row.VRMETAVENDACALCADOS)}</th>} sortable={true} />
              <Column field="PERCMETAVENDACALCADOS" header="%" body={row => <th style={{color: '#FFA500'}}>{parseFloat(row.PERCMETAVENDACALCADOS)}%</th>} sortable={true} />
             
              <Column field="VRMETAVENDAFEMVERINV" header="Vr Meta" body={row => <th style={{color: '#FE85BE'}}>{formatMoeda(row.VRMETAVENDAFEMVERINV)}</th>} sortable={true} />
              <Column field="PERCMETAVENDAFEMVERINV" header="%" body={row => <th style={{color: '#FE85BE'}}>{parseFloat(row.PERCMETAVENDAFEMVERINV)}%</th>} sortable={true} />
              <Column field="VRMETAVENDAFEMPCINTIMA" header="Vr Meta" body={row => <th style={{color: '#FE85BE'}}>{formatMoeda(row.VRMETAVENDAFEMPCINTIMA)}</th>} sortable={true} />
              <Column field="PERCMETAVENDAFEMPCINTIMA" header="%" body={row => <th style={{color: '#FE85BE'}}>{parseFloat(row.PERCMETAVENDAFEMPCINTIMA)}%</th>} sortable={true} />          
              <Column field="VRMETAVENDAFEMACESSORIOS" header="Vr Meta" body={row => <th style={{color: '#FE85BE'}}>{formatMoeda(row.VRMETAVENDAFEMACESSORIOS)}</th>} sortable={true} />
              <Column field="PERCMETAVENDAFEMACESSORIOS" header="%" body={row => <th style={{color: '#FE85BE'}}>{parseFloat(row.PERCMETAVENDAFEMACESSORIOS)}%</th>} sortable={true} />
           
              <Column field="VRMETAVENDAMASCVERINV" header="Verão/Inverno" body={row => <th style={{color: '#6AB8F7'}}>{formatMoeda(row.VRMETAVENDAMASCVERINV)}</th>} sortable={true} />
              <Column field="PERCVENDAMASCVERINV" header="%" body={row => <th style={{color: '#6AB8F7'}}>{parseFloat(row.PERCVENDAMASCVERINV)}%</th>} sortable={true} />
              <Column field="VRMETAVENDAMASCPCINTIMA" header="Vr Meta" body={row => <th style={{color: '#6AB8F7'}}>{formatMoeda(row.VRMETAVENDAMASCPCINTIMA)}</th>} sortable={true} />
              <Column field="PERCMETAVENDAMASCPCINTIMA" header="%" body={row => <th style={{color: '#6AB8F7'}}>{parseFloat(row.PERCMETAVENDAMASCPCINTIMA)}%</th>} sortable={true} />
              <Column field="VRMETAVENDAMASCACESSORIOS" header="Vr Meta" body={row => <th style={{color: '#39A1F4'}}>{formatMoeda(row.VRMETAVENDAMASCACESSORIOS)}</th>} sortable={true} />
              <Column field="PERCVENDAMASCACESSORIOS" header="%" body={row => <th style={{color: '#6AB8F7'}}>{parseFloat(row.PERCVENDAMASCACESSORIOS)}%</th>} sortable={true} />
        
              <Column field="VRMETAVENDAINFANTVERINV" header="Verão/Inverno" body={row => <th style={{color: '#3cb371'}}>{formatMoeda(row.VRMETAVENDAINFANTVERINV)}</th>} sortable={true} />
              <Column field="PERCMETAVENDAINFANTVERINV" header="%" body={row => <th style={{color: '#3cb371'}}>{parseFloat(row.PERCMETAVENDAINFANTVERINV)}%</th>} sortable={true} />
              <Column field="VRMETAVENDAINFANTPCINTIMA" header="Peça Intima" body={row => <th style={{color: '#3cb371'}}>{formatMoeda(row.VRMETAVENDAINFANTPCINTIMA)}</th>} sortable={true} />
              <Column field="PERCMETAVENDAINFANTPCINTIMA" header="%" body={row => <th style={{color: '#3cb371'}}>{parseFloat(row.PERCMETAVENDAINFANTPCINTIMA)}%</th>} sortable={true} />
              <Column field="VRMETAVENDAINFANTACESSORIOS" header="Acessórios" body={row => <th style={{color: '#3cb371'}}>{formatMoeda(row.VRMETAVENDAINFANTACESSORIOS)}</th>} sortable={true} />
              <Column field="PERCMETAVENDAINFANTACESSORIOS" header="%" body={row => <th style={{color: '#3cb371'}}>{parseFloat(row.PERCMETAVENDAINFANTACESSORIOS)}%</th>} sortable={true} />
        
              <Column field="VRMETAVENDACMB" header="Vr Meta" body={row => <th style={{color: '#6a5acd'}}>{formatMoeda(row.VRMETAVENDACMB)}</th>} sortable={true} />
              <Column field="PERCMETAVENDACMB" header="%" body={row => <th style={{color: '#6a5acd'}}>{parseFloat(row.PERCMETAVENDACMB)}%</th>} sortable={true} />
           
              <Column field="VRMETAVENDAOUTROS" header="Vr Meta" body={row => <th style={{color: '#FE85BE'}}>{formatMoeda(row.VRMETAVENDAOUTROS)}</th>} sortable={true} />
              <Column field="PERCMETAVENDAOUTROS" header="%" body={row => <th style={{color: '#FE85BE'}}>{parseFloat(row.PERCMETAVENDAOUTROS)}%</th>} sortable={true} />
            
              <Column field="PERCTOTALVENDA" header="%" body={row => <th style={{color: '#FFA500'}}>{parseFloat(row.PERCTOTALVENDA)}%</th>} sortable={true} />
             
            </DataTable>
        </div>
      </div>

      <ActionMetasCalcadosModal 
        show={modalCalcados}
        handleClose={() => setModalCalcados(false)}
        dadosDetalhe={dadosDetalhe}
        secao={secaoSelecionada}
        usuarioLogado={usuarioLogado}
        optionsModulos={optionsModulos}
      />
    </Fragment>
  )
}