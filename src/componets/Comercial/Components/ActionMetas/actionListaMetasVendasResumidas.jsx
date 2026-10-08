import { Fragment, useRef, useState } from "react"
import { GrFormView } from "react-icons/gr";
import { AiOutlineDelete } from "react-icons/ai";
import { FaBalanceScale } from "react-icons/fa";
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

export const ActionListaMetasVendasResumidas = ({ 
  dadosVendasResumida,
}) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Lista Vendas Metas',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Cabeçalho agrupado
    const headerRows = [
      [
        { content: "VENDAS / META GERAL", colSpan: 5, styles: { halign: "center", fillColor: "#7a59ad", textColor: "white", fontSize: 10 } },
        { content: "CALÇADOS", colSpan: 2, styles: { halign: "center", fillColor: "#FFDB8E", textColor: "black", fontSize: 10 } },
        { content: "VESTUÁRIO", colSpan: 2, styles: { halign: "center", fillColor: "#FE85BE", textColor: "black", fontSize: 10 } },
      ],
      [
        { content: "#", styles: { fillColor: "#7a59ad", textColor: "white", fontSize: 10 } },
        { content: "Empresa", styles: { fillColor: "#7a59ad", textColor: "white", fontSize: 10 } },
        { content: "Venda", styles: { fillColor: "#7a59ad", textColor: "white", fontSize: 10 } },
        { content: "% Meta", styles: { fillColor: "#7a59ad", textColor: "white", fontSize: 10 } },
        { content: "Vr Meta", styles: { fillColor: "#7a59ad", textColor: "white", fontSize: 10 } },
        { content: "Geral", styles: { fillColor: "#FFDB8E", textColor: "black", fontSize: 10 } },
        { content: "Vr Meta", styles: { fillColor: "#FFDB8E", textColor: "black", fontSize: 10 } },
        { content: "Geral", styles: { fillColor: "#FE85BE", textColor: "black", fontSize: 10 } },
        { content: "Vr Meta", styles: { fillColor: "#FE85BE", textColor: "black", fontSize: 10 } },
      ],
    ];

    // Dados da tabela
    const bodyRows = dados.map((item) => [
      item.contador,
      item.NOFANTASIA,
      formatMoeda(item.VRVENDAGERAL),
      `${parseFloat(item.PERCMETAVENDAGERAL)}%`,
      formatMoeda(item.VRMETAVENDAGERAL),
      formatMoeda(item.VRVENDACALCADOS),
      formatMoeda(item.VRMETAVENDACALCADOS),
      formatMoeda(item.VRTOTALVENDAVESTUARIO),
      formatMoeda(item.VRTOTALMETAVESTUARIO),
    ]);

    // Configuração da tabela
    doc.autoTable({
      head: headerRows,
      body: bodyRows,
      startY: 10,
      theme: "plain",
      styles: { fontSize: 6, cellPadding: 1 },
      columnStyles: {
        0: { halign: "center" },
        1: { halign: "left" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right", },
        6: { halign: "right", },
        7: { halign: "right",  },
        8: { halign: "right",},
      },
    });

    doc.save("marcas_vendas_metas.pdf");
  };


  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Metas Vendas");

    // Cabeçalho agrupado (3 linhas)
    worksheet.mergeCells("A1:E1");
    worksheet.getCell("A1").value = "VENDAS / META GERAL";
    worksheet.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "7a59ad" } };
    worksheet.getCell("A1").font = { color: { argb: "FFFFFF" }, bold: true };

    worksheet.mergeCells("F1:G1");
    worksheet.getCell("F1").value = "CALÇADOS";
    worksheet.getCell("F1").alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getCell("F1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDB8E" } };
    worksheet.getCell("F1").font = { color: { argb: "000000" }, bold: true };

    worksheet.mergeCells("H1:I1");
    worksheet.getCell("H1").value = "VESTUÁRIO";
    worksheet.getCell("H1").alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getCell("H1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FE85BE" } };
    worksheet.getCell("H1").font = { color: { argb: "000000" }, bold: true };

    // Segunda linha de cabeçalho
    worksheet.getRow(2).values = [
      "#", "EMPRESA", "Venda", "% Meta", "Vr Meta",
      "Geral", "Vr Meta",
      "Geral", "Vr Meta"
    ];
    worksheet.getRow(2).eachCell((cell, colNumber) => {
      cell.alignment = { horizontal: "center" };
      cell.font = { bold: true };
      if (colNumber <= 5) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "7a59ad" } };
        cell.font = { color: { argb: "FFFFFF" }, bold: true };
      } else if (colNumber <= 7) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDB8E" } };
        cell.font = { color: { argb: "000000" }, bold: true };
      } else {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FE85BE" } };
        cell.font = { color: { argb: "000000" }, bold: true };
      }
    });

    // Dados
    dados.forEach((item, idx) => {
      worksheet.addRow([
        item.contador,
        item.NOFANTASIA,
        item.VRVENDAGERAL,
        item.PERCMETAVENDAGERAL,
        item.VRMETAVENDAGERAL,
        item.VRVENDACALCADOS,
        item.VRMETAVENDACALCADOS,
        item.VRTOTALVENDAVESTUARIO,
        item.VRTOTALMETAVESTUARIO
      ]);
    });

    // Ajuste de largura das colunas
    worksheet.columns.forEach((col) => {
      col.width = 18;
    });


    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "marcas_vendas_metas.xlsx");
  };

  const dados = dadosVendasResumida.map((item, index) => {
    let contador = index + 1;

    return {
      contador,
      NOFANTASIA: item.NOFANTASIA,
      VRVENDAGERAL: item.VRVENDAGERAL,
      PERCMETAVENDAGERAL: item.PERCMETAVENDAGERAL,
      VRMETAVENDAGERAL: item.VRMETAVENDAGERAL,
      VRVENDACALCADOS: item.VRVENDACALCADOS,
      VRMETAVENDACALCADOS: item.VRMETAVENDACALCADOS,
      VRTOTALVENDAVESTUARIO: item.VRTOTALVENDAVESTUARIO,
      VRTOTALMETAVESTUARIO: item.VRTOTALMETAVESTUARIO,

      DTMETAINICIO: item.DTMETAINICIO,
      DTMETAFIM: item.DTMETAFIM,
      STATIVO: item.STATIVO,
    };
  });

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
          colSpan="2" 
          headerStyle={{ fontSize: '1rem', textAlign: 'center', justifyContent: 'center', backgroundColor: "#FFDB8E", color: 'black' }} 
          headerClassName="grupo-meta-geral"
          header="CALÇADOS" 
            
        />
        <Column  
          colSpan="2"
          headerStyle={{ fontSize: '1rem', textAlign: 'center', justifyContent: 'center', backgroundColor: "#FE85BE", color: 'black' }}
          headerClassName="grupo-meta-geral" 
          header="VESTUÁRIO" 
         
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
          field="VRMETAVENDACALCADOS" 
          header="Vr Meta" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#ffca5b", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}
        />
        <Column 
          field="VRTOTALVENDAVESTUARIO" 
          header="Geral" 
          sortable={true} 
          style={{color: 'black', backgroundColor: "#FE85BE", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} 
        />
        <Column 
          field="VRTOTALMETAVESTUARIO" 
          header="Vr Meta" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#fd52a3", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}  
        />
      </Row>
    </ColumnGroup>
  )
  
  return (

    <Fragment>
      <div className="panel" >
        <div className="panel-hdr">
          <h2>{`Lista Metas Resumida do Período: ${dados[0]?.DTMETAINICIO} a ${dados[0]?.DTMETAFIM}`}</h2>
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
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
            
            >
              <Column field="contador" header="#" body={row => <th>{row.contador}</th>} sortable={true} />
              <Column field="NOFANTASIA" header="Empresa" body={row => <th>{row.NOFANTASIA}</th>} sortable={true} />
              <Column field="VRVENDAGERAL" header="VR VENDIDO" body={row => <th>{formatMoeda(row.VRVENDAGERAL)}</th>} sortable={true} />
              <Column field="PERCMETAVENDAGERAL" header="% META" body={row => <th>{parseFloat(row.PERCMETAVENDAGERAL)}%</th>} sortable={true} />
              <Column field="VRMETAVENDAGERAL" header="VR META" body={row => <th>{formatMoeda(row.VRMETAVENDAGERAL)}</th>} sortable={true} />
              <Column field="VRVENDACALCADOS" header="VR VENDIDO" body={row => <th style={{color: '#FFA500'}}>{formatMoeda(row.VRVENDACALCADOS)}</th>} sortable={true} />
              <Column field="VRMETAVENDACALCADOS" header="VR META" body={row => <th style={{color: '#FFA500'}}>{formatMoeda(row.VRMETAVENDACALCADOS)}</th>} sortable={true} />
              <Column field="VRTOTALVENDAVESTUARIO" header="VR VENDIDO" body={row => <th style={{color: '#EE82EE'}}>{formatMoeda(row.VRTOTALVENDAVESTUARIO)}</th>} sortable={true} />
              <Column field="VRTOTALMETAVESTUARIO" header="VR META" body={row => <th style={{color: '#EE82EE'}}>{formatMoeda(row.VRTOTALMETAVESTUARIO)}</th>} sortable={true} />
            </DataTable>
        </div>
      </div>
    </Fragment>
  )
}