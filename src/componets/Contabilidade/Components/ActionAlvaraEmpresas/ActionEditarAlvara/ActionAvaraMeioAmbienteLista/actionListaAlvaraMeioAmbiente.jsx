import React, { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../../../../Tables/headerTable";
import { ButtonTable } from "../../../../../ButtonsTabela/ButtonTable";
import { FaPencilAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import { get } from "../../../../../../api/funcRequest";
import { FaPlus, FaRegEye } from "react-icons/fa6";
import { ActionCadastrarAlvaraModal } from "./ActionCadastrarAlvaraModal/actionCadastrarAlvaraModal";
import { ActionVisualizarDetalhesAlvaraModal } from "./ActionVisualizarAlvaraModal/actionVisualizarDetalhesAlvaraModal";
import { ActionEditarDetalhesAlvaraModal } from "./ActionEditarAlvaraModal/actionEditarDetalhesAlvaraModal";
import { formatarDataParaBR } from "../../../../../../utils/dataFormatada";
import { useQuery } from "react-query";

export const ActionListaAlvaraMeioAmbiente = ({
    dadosAlvaraEmpresaSelecionada,
    optionsModulos,
    usuarioLogado,
    refetchAlvaraEmpresa,
    refetchAlvaraSelecionado
}) => {

    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [rowSelection, setRowSelection] = useState(null);
    const [modalCadastrarAlvaraEmpresa, setModalCadastrarAlvaraEmpresa] = useState(false);
    const [modalVisualizarAlvaraEmpresa, setModalVisualizarAlvaraEmpresa] = useState(false);
    const [modalEditarAlvaraEmpresa, setModalEditarAlvaraEmpresa] = useState(false);
    const [idVinculoAlvara, setIdVinculoAlvara] = useState(null);
    const dataTableRef = useRef();


    const { data: dadosAlvaraSelecionado = [], refetch: refetchVinculoAlvara, isLoading: isLoadingVinculoAlvara } = useQuery(
        ['vinculo-alvara', idVinculoAlvara],
        async () => {
            const response = await get(
                `/vinculo-alvaras-empresa?idFilial=${idVinculoAlvara}`
            );
            return response.data;
        },
        { enabled: !!idVinculoAlvara }
    );


    const handlePrint = useReactToPrint({
        content: () => dataTableRef.current,
        documentTitle: 'Lista de Alvaras',
    });

    const exportToPDF = () => {
        const doc = new jsPDF({ orientation: "landscape" });

        doc.autoTable({
            head: [[
                "#",
                "Dt.Inicio",
                "Dt.Fim",
                "Status",
            ]],
            body: (dados || []).map((item) => [
                item?.CONTADOR,
                item?.DTINICIOCOMPETENCIAALVARA,
                item?.DTFIMCOMPETENCIAALVARA,
                item?.STATIVO,
            ]),
            horizontalPageBreak: true,
            horizontalPageBreakBehaviour: "immediately",
            styles: { fontSize: 8 },
            headStyles: { fontSize: 8 },
        });

        doc.save("alvaras_empresas.pdf");
    };

    const exportToExcel = () => {
        const workbook = XLSX.utils.book_new();

        const header = [
            "#",
            "Dt.Inicio",
            "Dt.Fim",
            "Status",
        ];

        const data = (dados || []).map(item => [
            item?.CONTADOR,
            item?.DTINICIOCOMPETENCIAALVARA,
            item?.DTFIMCOMPETENCIAALVARA,
            item?.STATIVO,
        ]);

        const worksheet = XLSX.utils.aoa_to_sheet([header, ...data]);

        worksheet["!cols"] = [
            { wpx: 80 },
            { wpx: 220 },
            { wpx: 150 },
            { wpx: 120 },
        ];

        XLSX.utils.book_append_sheet(workbook, worksheet, "Alvarás Empresas");
        XLSX.writeFile(workbook, "alvaras_empresas.xlsx");
    };

    const dados = dadosAlvaraEmpresaSelecionada
        .flatMap((empresa) => {
            return empresa.LISTA_ALVARAS
                .filter(alvara => alvara.IDALVARA === 2)
                .flatMap(alvara =>
                    alvara.ITEMS.map(item => ({
                        IDVINCULO: item.IDVINCULO,
                        IDEMPRESA: item.IDEMPRESA,
                        DATA_INICIO: item.DTINICIOCOMPETENCIAALVARA,
                        DATA_FIM: item.DTFIMCOMPETENCIAALVARA,
                        STATIVO: item.STATIVO === "True" ? "Ativo" : "Inativo",
                    }))
                );
        })
        .map((item, index) => ({
            ...item,
            CONTADOR: index + 1,
        }));

    const colunasEmpresasAlvaras = [
        {
            field: 'CONTADOR',
            header: '#',
            body: row => <th> {row.CONTADOR} </th>,
            sortable: true,
        },
        {
            field: 'DATA_INICIO',
            header: 'Dt.Inicio',
            body: row => <th> {formatarDataParaBR(row.DATA_INICIO)} </th>,
            sortable: true,
        },
        {
            field: 'DATA_FIM',
            header: 'Dt.Fim',
            body: row => <th> {formatarDataParaBR(row.DATA_FIM)} </th>,
            sortable: true,
        },
        {
            field: 'STATIVO',
            header: 'Status',
            body: row => <th style={{ color: row.STATIVO == 'Ativo' ? 'blue' : 'red' }}>{row.STATIVO}</th>,
            sortable: true,
        },
        {
            field: 'ARQUIVOALVARA',
            header: 'Opções',
            body: (row) => (
                <div style={{ display: "flex", gap: "8px" }}>
                    <ButtonTable
                        titleButton="Visualizar Detalhes do Alvará"
                        cor="info"
                        Icon={FaRegEye}
                        onClickButton={() => handleClickVisualizarAlvara(row)}
                        iconSize={18}
                        width="35px"
                        height="35px"
                        lineHeight={1.3}
                    />

                    <ButtonTable
                        titleButton="Editar Alvará da Loja"
                        cor="warning"
                        Icon={FaPencilAlt}
                        onClickButton={() => handleClickEditarAlvara(row)}
                        iconSize={18}
                        width="35px"
                        height="35px"
                        lineHeight={1.3}
                    />
                </div>
            ),
            sortable: true,
        }
    ]

    const handleClickEditarAlvara = (row) => {
        if (optionsModulos[0]?.ALTERAR !== 'True') {
            Swal.fire({
                icon: 'error',
                title: 'Atenção!',
                text: 'Você não tem permissão para editar alvará.',
                confirmButtonColor: '#7352A5',
                customClass: {
                    container: 'custom-swal',
                },
            });
            return;
        }

        setIdVinculoAlvara(row.IDVINCULO);
        setModalEditarAlvaraEmpresa(true);
    };

    const handleClickVisualizarAlvara = (row) => {
        if (optionsModulos[0]?.ALTERAR === 'True') {
            if (row && row.IDVINCULO) {
                handleViualizarAlvara(row.IDVINCULO);
            }
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Atenção!',
                text: 'Você não tem permissão para editar alvará.',
                confirmButtonColor: '#7352A5',
                customClass: {
                    container: 'custom-swal',
                },
            });
        }
    };

    const handleViualizarAlvara = async (IDVINCULO) => {
        setIdVinculoAlvara(IDVINCULO);
        setModalVisualizarAlvaraEmpresa(true);

    };

    const handleClickCadastrarAlvara = () => {
        if (optionsModulos[0]?.ALTERAR === 'True') {
            setModalCadastrarAlvaraEmpresa(true);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Atenção!',
                text: 'Você não tem permissão para cadastrar alvará.',
                confirmButtonColor: '#7352A5',
                customClass: {
                    container: 'custom-swal',
                },
            });
        }
    };

    return (
        <Fragment>
            <div className="panel">
                <div className="panel-hdr m-3">

                    <h2>ALVARÁS - MEIO AMBIENTE (LICENÇA AMBIENTAL)</h2>

                </div>
                <div style={{ marginBottom: "0.5rem" }}>
              
                    <div style={{ marginTop: "1rem", marginLeft: "0.8rem" }}>
                        <ButtonTable
                            titleButton="Adicionar Alvará"
                            className="btn btn-outline-success d-flex align-items-center justify-content-center gap-4"
                            Icon={FaPlus}
                            textButton="Add Alvará"
                            onClickButton={handleClickCadastrarAlvara}
                            iconSize={18}
                            width="110px"
                            height="37px"
                            flexDirection="row"
                        />
                    </div>
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
                        cellMemo={false}
                        showGridlines
                        stripedRows
                        emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
                    >
                        {colunasEmpresasAlvaras.map(coluna => (

                            <Column
                                key={coluna.field}
                                field={coluna.field}
                                header={coluna.header}
                                body={coluna.body}
                                footer={coluna.footer}
                                sortable={coluna.sortable}
                                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '1rem' }}
                                footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}
                                bodyStyle={{ fontSize: '1rem' }}

                            />
                        ))}
                    </DataTable>
                </div>
            </div>
            <ActionCadastrarAlvaraModal
                show={modalCadastrarAlvaraEmpresa}
                handleClose={() => setModalCadastrarAlvaraEmpresa(false)}
                dadosAlvaraSelecionado={dadosAlvaraEmpresaSelecionada}
                optionsModulos={optionsModulos}
                usuarioLogado={usuarioLogado}
                refetchAlvaraEmpresa={refetchAlvaraEmpresa}
                refetchAlvaraSelecionado={refetchAlvaraSelecionado}
                idAlvaraSelecionado={2}
            />

            <ActionVisualizarDetalhesAlvaraModal
                show={modalVisualizarAlvaraEmpresa}
                handleClose={() => setModalVisualizarAlvaraEmpresa(false)}
                dadosAlvaraSelecionado={dadosAlvaraSelecionado}
                optionsModulos={optionsModulos}
                usuarioLogado={usuarioLogado}
                refetchAlvaraEmpresa={refetchAlvaraEmpresa}
            />

            <ActionEditarDetalhesAlvaraModal
                show={modalEditarAlvaraEmpresa}
                handleClose={() => setModalEditarAlvaraEmpresa(false)}
                dadosAlvaraSelecionado={dadosAlvaraSelecionado}
                optionsModulos={optionsModulos}
                usuarioLogado={usuarioLogado}
                refetchAlvaraEmpresa={refetchAlvaraEmpresa}
                refetchAlvaraSelecionado={refetchAlvaraSelecionado}
                refetchVinculoAlvara={refetchVinculoAlvara}
            />

        </Fragment>
    )
}    
