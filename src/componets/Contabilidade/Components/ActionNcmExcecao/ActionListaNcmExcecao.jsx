import React, { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../../Tables/headerTable";
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import Swal from "sweetalert2";
import { formatarDataParaBR, } from "../../../../utils/dataFormatada";
import { GrEdit } from "react-icons/gr";
import { ActionEditarNcm } from "./ActionEditar/actionEditarNcm";
import { get } from "../../../../api/funcRequest";

export const ActionListaNcmExcecao = ({
    optionsModulos,
    usuarioLogado,
    refetchNcmExcecao,
    dadosNcmExcecao,
}) => {

    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [rowSelection, setRowSelection] = useState(null);
    const [dadosAtualizarNcm, setDadosAtualizarNcm] = useState([]);
    const [modalAtualizarNcm, setModalAtualizarNcm] = useState(false);
    const [modalAlvaraEmpresa, setModalAlvaraEmpresa] = useState(false);
    const dataTableRef = useRef();

    const onGlobalFilterChange = (e) => {
        setGlobalFilterValue(e.target.value);
    };

    const handlePrint = useReactToPrint({
        content: () => dataTableRef.current,
        documentTitle: 'NCM Exceção',
    });

    const exportToPDF = () => {
        const doc = new jsPDF({ orientation: "landscape" });

        doc.autoTable({
            head: [[
                "IDNCMEXCECAO",
                "NUNCM",
                "EX",
                "TIPO",
                "DSNCM",
                "IMPNACIONAL",
                "IMPIMPORTACAOFEDERAL",
                "IMPESTADUAL",
                "IMPMUNICIPAL",
                "DTINICIOVIGENCIA",
                "DTFIMVIGENCIA",
                "PWCHAVE",
                "NUVERSAO",
                "FONTE",
                "SGUF",
                "PERCIBPT",
            ]],
            body: (dados || []).map((item) => [
                item.IDNCMEXCECAO ?? "",
                item.NUNCM ?? "",
                item.EX ?? "",
                item.TIPO ?? "",
                item.DSNCM ?? "",
                item.IMPNACIONAL ?? "",
                item.IMPIMPORTACAOFEDERAL ?? "",
                item.IMPESTADUAL ?? "",
                item.IMPMUNICIPAL ?? "",
                item.DTINICIOVIGENCIA ?? "",
                item.DTFIMVIGENCIA ?? "",
                item.PWCHAVE ?? "",
                item.NUVERSAO ?? "",
                item.FONTE ?? "",
                item.SGUF ?? "",
                item.PERCIBPT ?? ""
            ]),
            horizontalPageBreak: true,
            horizontalPageBreakBehaviour: "immediately",
            styles: { fontSize: 8 },
            headStyles: { fontSize: 8 },
        });

        doc.save("nmc_excecao.pdf");
    };

    const exportToExcel = () => {
        const workbook = XLSX.utils.book_new();

        const header = [
            "IDNCMEXCECAO",
            "NUNCM",
            "EX",
            "TIPO",
            "DSNCM",
            "IMPNACIONAL",
            "IMPIMPORTACAOFEDERAL",
            "IMPESTADUAL",
            "IMPMUNICIPAL",
            "DTINICIOVIGENCIA",
            "DTFIMVIGENCIA",
            "PWCHAVE",
            "NUVERSAO",
            "FONTE",
            "SGUF",
            "PERCIBPT",
        ];

        const data = (dados || []).map(item => [
            item.IDNCMEXCECAO ?? "",
            item.NUNCM ?? "",
            item.EX ?? "",
            item.TIPO ?? "",
            item.DSNCM ?? "",
            item.IMPNACIONAL ?? "",
            item.IMPIMPORTACAOFEDERAL ?? "",
            item.IMPESTADUAL ?? "",
            item.IMPMUNICIPAL ?? "",
            item.DTINICIOVIGENCIA ?? "",
            item.DTFIMVIGENCIA ?? "",
            item.PWCHAVE ?? "",
            item.NUVERSAO ?? "",
            item.FONTE ?? "",
            item.SGUF ?? "",
            item.PERCIBPT ?? ""
        ]);

        const worksheet = XLSX.utils.aoa_to_sheet([header, ...data]);

        worksheet["!cols"] = [
            { wpx: 80 },
            { wpx: 220 },
            { wpx: 150 },
            { wpx: 120 },
            { wpx: 100 },
            { wpx: 250 },
            { wpx: 150 },
            { wpx: 100 },
            { wpx: 120 },
            { wpx: 120 },
            { wpx: 150 },
            { wpx: 150 },
            { wpx: 170 },
            { wpx: 170 },
            { wpx: 140 },
            { wpx: 140 },

        ];

        XLSX.utils.book_append_sheet(workbook, worksheet, "NCM Exceção");
        XLSX.writeFile(workbook, "ncm_excecao.xlsx");
    };

    const dados = dadosNcmExcecao?.map((item) => {
        return {
            IDNCMEXCECAO: item.IDNCMEXCECAO,
            NUNCM: item.NUNCM,
            EX: item.EX,
            TIPO: item.TIPO,
            DSNCM: item.DSNCM ,
            IMPNACIONAL: item.IMPNACIONAL,
            IMPIMPORTACAOFEDERAL: item.IMPIMPORTACAOFEDERAL,
            IMPESTADUAL: item.IMPESTADUAL,
            IMPMUNICIPAL: item.IMPMUNICIPAL,
            DATAINICIOVIGENCIA: item.DTINICIOVIGENCIA,
            DATAFIMVIGENCIA: item.DTFIMVIGENCIA,
            PWCHAVE: item.PWCHAVE,
            NUVERSAO: item.NUVERSAO,
            FONTE: item.FONTE,
            SGUF: item.SGUF,
            PERCIBPT: item.PERCIBPT,
        };
    });
const colunasNcmExcecao = [
    {
        field: 'IDNCMEXCECAO',
        header: 'ID NCM Exceção',
        body: row => <th> {row.IDNCMEXCECAO} </th>,
        sortable: true,
    },
    {
        field: 'NUNCM',
        header: 'Número NCM',
        body: row => <th>{row.NUNCM}</th>,
        sortable: true,
    },
    {
        field: 'EX',
        header: 'EX',
        body: row => <th>{row.EX}</th>,
        sortable: true,
    },
    {
        field: 'TIPO',
        header: 'Tipo',
        body: row => <th>{row.TIPO}</th>,
        sortable: true,
    },
    {
        field: 'DSNCM',
        header: 'Descrição NCM',
        body: row => <th>{row.DSNCM}</th>,
        sortable: true,
    },
    {
        field: 'IMPNACIONAL',
        header: 'Impostos Nacionais',
        body: row => <th>{row.IMPNACIONAL}</th>,
        sortable: true,
    },
    {
        field: 'IMPIMPORTACAOFEDERAL',
        header: 'Imposto de Importação Federal',
        body: row => <th>{row.IMPIMPORTACAOFEDERAL}</th>,
        sortable: true,
    },
    {
        field: 'IMPESTADUAL',
        header: 'Impostos Estaduais',
        body: row => <th>{row.IMPESTADUAL}</th>,
        sortable: true,
    },
    {
        field: 'IMPMUNICIPAL',
        header: 'Impostos Municipais',
        body: row => <th>{row.IMPMUNICIPAL}</th>,
        sortable: true,
    },
    {
        field: 'DTINICIOVIGENCIA',
        header: 'Início Vigência',
        body: row => <th>{formatarDataParaBR(row.DATAINICIOVIGENCIA)}</th>,
        sortable: true,
    },
    {
        field: 'DATAVIGENCIA',
        header: 'Fim Vigência',
        body: row => <th>{formatarDataParaBR(row.DATAFIMVIGENCIA)}</th>,
        sortable: true,
    },
    {
        field: 'PWCHAVE',
        header: 'Chave',
        body: row => <th>{row.PWCHAVE}</th>,
        sortable: true,
    },
    {
        field: 'NUVERSAO',
        header: 'Nº Versão',
        body: row => <th>{row.NUVERSAO}</th>,
        sortable: true,
    },
    {
        field: 'FONTE',
        header: 'Fonte',
        body: row => <th>{row.FONTE}</th>,
        sortable: true,
    },
    {
        field: 'SGUF',
        header: 'UF',
        body: row => <th>{row.SGUF}</th>,
        sortable: true,
    },
    {
        field: 'PERCIBPT',
        header: '% IBPT',
        body: row => <th>{row.PERCIBPT}</th>,
        sortable: true,
    },
    {
        field: 'OPCOES',
        header: 'Opções',
        body: row => (
            <ButtonTable
                titleButton="Editar NCM Exceção"
                cor="info"
                Icon={GrEdit}
                onClickButton={() => handleClickEdit(row)}
                iconSize={16}
                width="31px"
                height="31px"
            />
        ),
        sortable: true,
    }
]

    const handleEdit = async (IDNCMEXCECAO) => {
        try {
            const response = await get(`/ncm-excecao?idNcmExcecao=${IDNCMEXCECAO}`)
            if (response.data && response.data.length > 0) {
                setDadosAtualizarNcm(response.data)
                setModalAtualizarNcm(true);
            } else {
                Swal.fire({
                    title: 'Erro',
                    text: 'Dados não encontrados.',
                    icon: 'error',
                    timer: 3000,
                    customClass: {
                        container: 'custom-swal',
                    }
                })
                return;
            }
        } catch (error) {
            console.error('Erro ao buscar detalhes da venda: ', error);
        }
    };


    const handleClickEdit = (row) => {
        if (optionsModulos[0]?.ALTERAR == 'True') {
            if (row && row.IDNCMEXCECAO) {
                handleEdit(row.IDNCMEXCECAO);
            }
        } else {
            Swal.fire({
                title: 'Acesso Negado',
                text: 'Você não tem permissão para acessar esta funcionalidade.',
                icon: 'warning',
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                }
            })
        }
    };

    return (

        <Fragment>

            <div className="panel">
                <div className="panel-hdr mb-4">

                    <h2>Lista de NCM Exceçãos</h2>

                </div>
                <div style={{ marginBottom: "1rem" }}>
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
                        value={dados}
                        size="small"
                        globalFilter={globalFilterValue}
                        sortOrder={-1}
                        paginator={true}
                        rows={10}
                        selectionMode="single"
                        selection={rowSelection}
                        onSelectionChange={(e) => setRowSelection(e.value)}
                        rowsPerPageOptions={[10, 20, 50, 100, dados.length]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
                        filterDisplay="menu"
                        showGridlines
                        stripedRows
                        emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
                    >
                        {colunasNcmExcecao.map(coluna => (

                            <Column
                                key={coluna.field}
                                field={coluna.field}
                                header={coluna.header}
                                body={coluna.body}
                                footer={coluna.footer}
                                sortable={coluna.sortable}
                                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}
                                footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}
                                bodyStyle={{ fontSize: '0.8rem' }}

                            />
                        ))}
                    </DataTable>
                </div>
            </div>
              <ActionEditarNcm
                show={modalAtualizarNcm}
                handleClose={() => setModalAtualizarNcm(false)}
                dadosAtualizarNcm={dadosAtualizarNcm}
                usuarioLogado={usuarioLogado}
                optionsModulos={optionsModulos}
                refetchNcmExcecao={refetchNcmExcecao}
            /> 

        </Fragment>
    )
}