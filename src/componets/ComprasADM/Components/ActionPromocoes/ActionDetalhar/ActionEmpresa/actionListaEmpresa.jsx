import { Fragment, useRef, useState } from "react"
import { FaRegTrashAlt } from "react-icons/fa";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { ButtonTable } from "../../../../../ButtonsTabela/ButtonTable";
import HeaderTable from "../../../../../Tables/headerTable";
import { FaCheck } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import { useIncluirEmpresaPromocao } from "./hooks/useIncluirEmpresaPromocao";


export const ActionListaEmpresaPromocao = ({ 
    dadosListaPromocaoEmpresa,
    usuarioLogado, 
    optionsModulos,
    handleClose 
}) => {
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [rowSelection, setRowSelection] = useState(null);
    const dataTableRef = useRef();  
    const { handleAtivar, handleDesativar } = useIncluirEmpresaPromocao({usuarioLogado, optionsModulos, handleClose})

    const onGlobalFilterChange = (e) => {
        setGlobalFilterValue(e.target.value);
    };

    const handlePrint = useReactToPrint({
        content: () => dataTableRef.current,
        documentTitle: 'Lista Empresas Promoções',
    });

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.autoTable({
            head: [['Nº', 'Empresa', 'Situação']],
            body: dados.map(item => [
                item.contador,
                item.NOFANTASIA,
                item.STATIVO == 'True' ? 'ATIVO' : 'INATIVO',
            ]),
            horizontalPageBreak: true,
            horizontalPageBreakBehaviour: 'immediately'
        });
        doc.save('lsita_empresas_promocoes.pdf');
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(dados);
        const workbook = XLSX.utils.book_new();
        const header = ['Nº', 'Empresa', 'Situação'];
        worksheet['!cols'] = [
            { wpx: 70, caption: 'Nº' },
            { wpx: 200, caption: 'Empresa' },
            { wpx: 100, caption: 'Situação' },
        ];
        XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista Empresas Promoções');
        XLSX.writeFile(workbook, 'lista_empresas_promocoes.xlsx');
    };

  
    const dados = dadosListaPromocaoEmpresa.map((item, index) => {
        let contador = index + 1;

        return {
            contador,
            NOFANTASIA: item.NOFANTASIA,
            STATIVO: item.STATIVO,
            IDEMPRESAPROMOCAOMARKETING: item.IDEMPRESAPROMOCAOMARKETING,
            IDRESUMOPROMOCAOMARKETING: item.IDRESUMOPROMOCAOMARKETING,

            IDEMPRESA: item.IDEMPRESA,
        }
    });

    const colunasPromocaoEmpresa = [
        {
            field: 'contador',
            header: '#',
            body: row => <th>{row.contador}</th>,
            sortable: true,
            width: '10%'
        },
        {
            field: 'NOFANTASIA',
            header: 'Empresa',
            body: row => <th>{row.NOFANTASIA}</th>,
            sortable: true,

        },
        {
            field: 'STATIVO',
            header: 'Situação',
            body: (row) => (
                <th style={{ color: row.STATIVO == 'True' ? 'blue' : 'red' }}>

                    {row.STATIVO == 'True' ? 'ATIVO' : 'INATIVO'}
                </th>
            )
        },
       {
            field: 'IDEMPRESA',
            header: 'Opções',
            body: row => {
            if (row.STATIVO === 'True') {
                return (
                    <ButtonTable
                        titleButton={"Desativar Empresa"}
                        cor={"danger"}
                        Icon={IoMdClose}
                        iconSize={22}
                        onClickButton={() => handleDesativar(row)}
                        width="40px"
                        height="40px"
                        disabledBTN={row.STATIVO === 'False'}
                    />
                );
            } else {
                return (
                    <ButtonTable
                        titleButton={"Ativar Empresa"}
                        cor={"success"}
                        Icon={FaCheck}
                        iconSize={22}
                        onClickButton={() => handleAtivar(row)}
                        width="40px"
                        height="40px"
                        disabledBTN={row.STATIVO === 'True'}
                    />
                );
            }
            },
            sortable: true
        },

    ]

    return (

        <Fragment>

            <div className="panel" >
                <div className="panel-hdr">
                    <h2>Lista das Empresas Promoções </h2>
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
                        title="Lista das Empresas Promoções"
                        value={dados}
                        size="small"
                        selectionMode="single"
                        selection={rowSelection}
                        onSelectionChange={(e) => setRowSelection(e.value)}
                        sortOrder={-1}
                        paginator={true}
                        rows={10}
                        rowsPerPageOptions={[10, 20, 50, 100, dados.length]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
                        filterDisplay="menu"
                        showGridlines
                        stripedRows
                        emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado </div>}
                    >
                        {colunasPromocaoEmpresa.map(coluna => (
                            <Column
                                key={coluna.field}
                                field={coluna.field}
                                header={coluna.header}

                                body={coluna.body}
                                footer={coluna.footer}
                                sortable={coluna.sortable}
                                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '1rem' }}
                                footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }}
                                bodyStyle={{ fontSize: '1rem' }}

                            />
                        ))}
                    </DataTable>
                </div>
            </div>
        </Fragment>
    )
}
