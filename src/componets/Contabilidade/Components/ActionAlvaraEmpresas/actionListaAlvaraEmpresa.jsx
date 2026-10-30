import React, { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../../Tables/headerTable";
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { FaRegFileAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import { mascaraCNPJ } from "../../../../utils/mascaraCNPJ";
import { ActionAlvaraEmpresaModal } from "./ActionEditarAlvara/actionAlvaraEmpresaModal";
import { formatarDataParaBR } from "../../../../utils/dataFormatada";

export const ActionListaAlvaras = ({
    dadosAlvaraEmpresa,
    tipoAvaraAplicado,
    optionsModulos,
    usuarioLogado,
    refetchAlvaraEmpresa,
    refetchAlvaraSelecionado,
    dadosAlvaraEmpresaSelecionada,
    setIdEmpresaSelecionada,
}) => {

    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [rowSelection, setRowSelection] = useState(null);
    const [modalAlvaraEmpresa, setModalAlvaraEmpresa] = useState(false);
    const dataTableRef = useRef();

    const onGlobalFilterChange = (e) => {
        setGlobalFilterValue(e.target.value);
    };

    const handlePrint = useReactToPrint({
        content: () => dataTableRef.current,
        documentTitle: 'Lista de Alvaras',
    });

    const exportToPDF = () => {
        const doc = new jsPDF({ orientation: "landscape" });

        doc.autoTable({
            head: [[
                "Nº Filial",
                "Fantasia",
                "CNPJ",
                "I.E",
                "I.M",
                "Endereço",
                "Município/UF",
                "Situação",
                "St.Bombeiro",
                "Dt.Fim Bombeiro",
                "St.Meio Ambiente",
                "Dt.Fim Meio Ambiente",
                "St.Vigilância Sanitária",
                "Dt.Fim Vigilância Sanitária",
                "St.Prefeitura",
                "Dt.Fim Prefeitura"
            ]],
            body: (dados || []).map((item) => [
                item.IDEMPRESA ?? "",
                item.NOFANTASIA ?? "",
                item.NUCNPJ ?? "",
                item.NUINSCESTADUAL ?? "",
                item.NUINSCMUNICIPAL ?? "",
                item.EENDERECO ?? "",
                item.MUNICIPIO ?? "",
                item.STATIVO ?? "",

                item.STATIVOBOMBEIRO ?? "",
                item.DTFIMALVARABOMBEIRO ?? "",

                item.STATIVOMEIOAMBIENTE ?? "",
                item.DTFIMALVARAMEIOAMBIENTE ?? "",

                item.STATIVOVIGILANCIASANITARIA ?? "",
                item.DTFIMALVARAVIGILANCIASANITARIA ?? "",

                item.STATIVOPREFEITURA ?? "",
                item.DTFIMALVARAPREFEITURA ?? ""
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
            "Nº Filial",
            "Fantasia",
            "CNPJ",
            "I.E",
            "I.M",
            "Endereço",
            "Município/UF",
            "Situação",
            "St.Bombeiro",
            "Dt.Fim Bombeiro",
            "St.Meio Ambiente",
            "Dt.Fim Meio Ambiente",
            "St.Vigilância Sanitária",
            "Dt.Fim Vigilância Sanitária",
            "St.Prefeitura",
            "Dt.Fim Prefeitura"
        ];

        const data = (dados || []).map(item => [
            item.IDEMPRESA ?? "",
            item.NOFANTASIA ?? "",
            item.NUCNPJ ?? "",
            item.NUINSCESTADUAL ?? "",
            item.NUINSCMUNICIPAL ?? "",
            item.EENDERECO ?? "",
            item.MUNICIPIO ?? "",
            item.STATIVO ?? "",
            item.STATIVOBOMBEIRO ?? "",
            item.DTFIMALVARABOMBEIRO ?? "",
            item.STATIVOMEIOAMBIENTE ?? "",
            item.DTFIMALVARAMEIOAMBIENTE ?? "",
            item.STATIVOVIGILANCIASANITARIA ?? "",
            item.DTFIMALVARAVIGILANCIASANITARIA ?? "",
            item.STATIVOPREFEITURA ?? "",
            item.DTFIMALVARAPREFEITURA ?? ""
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
            { wpx: 140 }
        ];

        XLSX.utils.book_append_sheet(workbook, worksheet, "Alvarás Empresas");
        XLSX.writeFile(workbook, "alvaras_empresas.xlsx");
    };

    const getTextoStatusAlvara = (alvara) => {
        const status = alvara?.DESCRICAOSTATUS;
        return status && String(status).trim().length ? status : "Não Iniciado";
    };

    const getBadgeClassAlvara = (status, dtFim) => {
        const negacao = ["Indeferido", "Cancelado", "Vencido", "Inativo"];
        const hoje = new Date();

        if (dtFim) {
            const dataFim = new Date(`${dtFim}T00:00:00`);
            if (!isNaN(dataFim) && dataFim < hoje) return "bg-danger";
        }

        if (negacao.includes(status)) return "bg-danger";
        if (status === "Não Iniciado") return "bg-warning";
        if (status === "Concluído") return "bg-success";
        if (status === "Emitido - Aprovado") return "bg-success";
        return "bg-info";
    };
    const isStatusNegacao = (status, dtFim) => {
        const negacao = ["Indeferido", "Cancelado", "Vencido", "Inativo"];
        const hoje = new Date();

        if (dtFim) {
            const dataFim = new Date(`${dtFim}T00:00:00`);
            if (!isNaN(dataFim) && dataFim < hoje) return true;
        }

        return negacao.includes(status);
    };

    const dados = dadosAlvaraEmpresa?.map((item) => {
        const bombeiro = item?.LISTA_ALVARAS?.find(a => a.IDALVARA === 1);
        const meio = item?.LISTA_ALVARAS?.find(a => a.IDALVARA === 2);
        const vigilancia = item?.LISTA_ALVARAS?.find(a => a.IDALVARA === 3);
        const prefeitura = item?.LISTA_ALVARAS?.find(a => a.IDALVARA === 4);

        const stBombeiro = getTextoStatusAlvara(bombeiro);
        const stMeio = getTextoStatusAlvara(meio);
        const stVigi = getTextoStatusAlvara(vigilancia);
        const stPref = getTextoStatusAlvara(prefeitura);

        return {
            IDEMPRESA: item.IDEMPRESA,
            NOFANTASIA: item.NOFANTASIA,
            NUCNPJ: item.NUCNPJ,
            NUINSCESTADUAL: item.NUINSCESTADUAL,
            NUINSCMUNICIPAL: item.NUINSCMUNICIPAL,
            EENDERECO: item.EENDERECO,
            MUNICIPIO: `${item.ECIDADE} / ${item.SGUF}`,
            STATIVO: item.STATIVO === "True" ? "Ativo" : "Inativo",

            STATIVOBOMBEIRO: stBombeiro,
            STATIVOBOMBEIRO_BADGE: getBadgeClassAlvara(stBombeiro, bombeiro?.DTFIMCOMPETENCIAALVARA),
            DTFIMALVARABOMBEIRO: bombeiro?.DTFIMCOMPETENCIAALVARA || "",

            STATIVOMEIOAMBIENTE: stMeio,
            STATIVOMEIOAMBIENTE_BADGE: getBadgeClassAlvara(stMeio, meio?.DTFIMCOMPETENCIAALVARA),
            DTFIMALVARAMEIOAMBIENTE: meio?.DTFIMCOMPETENCIAALVARA || "",

            STATIVOVIGILANCIASANITARIA: stVigi,
            STATIVOVIGILANCIASANITARIA_BADGE: getBadgeClassAlvara(stVigi, vigilancia?.DTFIMCOMPETENCIAALVARA),
            DTFIMALVARAVIGILANCIASANITARIA: vigilancia?.DTFIMCOMPETENCIAALVARA || "",

            STATIVOPREFEITURA: stPref,
            STATIVOPREFEITURA_BADGE: getBadgeClassAlvara(stPref, prefeitura?.DTFIMCOMPETENCIAALVARA),
            DTFIMALVARAPREFEITURA: prefeitura?.DTFIMCOMPETENCIAALVARA || "",

            ARQUIVOALVARA: prefeitura?.ARQUIVOALVARA,
        };
    });
    const colunasEmpresasAlvaras = [
        {
            field: 'IDEMPRESA',
            header: 'Nº Filial',
            body: row => <th> {row.IDEMPRESA} </th>,
            sortable: true,
        },
        {
            field: 'NOFANTASIA',
            header: 'Fantasia',
            body: row => <p style={{ width: '200px', fontWeight: 600 }}> {row.NOFANTASIA} </p>,
            sortable: true,
        },
        {
            field: 'NUCNPJ',
            header: 'cnpj',
            body: row => <th> {mascaraCNPJ(row.NUCNPJ)} </th>,
            sortable: true,
        },
        {
            field: 'NUINSCESTADUAL',
            header: 'I.E',
            body: row => <th>{row.NUINSCESTADUAL}</th>,
            sortable: true,
        },
        {
            field: 'NUINSCMUNICIPAL',
            header: 'I.M',
            body: row => <th>{row.NUINSCMUNICIPAL}</th>,
            sortable: true,
        },
        {
            field: 'EENDERECO',
            header: 'Endereço',
            body: row => <th>{row.EENDERECO}</th>,
            sortable: true,
        },
        {
            field: 'MUNICIPIO',
            header: 'Municipio/UF',
            body: row => <th>{row.MUNICIPIO}</th>,
            sortable: true,
        },
        {
            field: 'STATIVO',
            header: 'Situação',
            body: row => <th>{row.STATIVO}</th>,
            sortable: true,
        },
        ...(tipoAvaraAplicado === '' || tipoAvaraAplicado == 1 ? [
            {
                field: 'STATIVOBOMBEIRO',
                header: 'St.Bombeiro',
                body: row => <th className={`badge text-white ${row.STATIVOBOMBEIRO_BADGE}`}
                    style={{
                        backgroundColor: "#198754",
                        color: "#fff",
                        padding: "3px 8px",
                        borderRadius: "3px",
                        fontSize: "12px",
                        fontWeight: "bold"
                    }}
                >
                    {row.STATIVOBOMBEIRO == "concluido" ? "Emitido - Aprovado" : row.STATIVOBOMBEIRO}
                </th>,
                sortable: true,
            },
            {
                field: 'DTFIMALVARABOMBEIRO',
                header: 'Dt.Fim Bombeiro',
                body: row => <th className={isStatusNegacao(row.STATIVOBOMBEIRO, row.DTFIMALVARABOMBEIRO) ? "text-danger" : ""}>
                    {formatarDataParaBR(row.DTFIMALVARABOMBEIRO)}
                </th>,
                sortable: true,
            },
        ] : []),
        ...(tipoAvaraAplicado === '' || tipoAvaraAplicado == 2 ? [
            {
                field: 'STATIVOMEIOAMBIENTE',
                header: 'St.Meio Ambiente',
                body: row => <th className={`badge text-white ${row.STATIVOMEIOAMBIENTE_BADGE}`}
                    style={{
                        backgroundColor: "#198754",
                        color: "#fff",
                        padding: "3px 8px",
                        borderRadius: "3px",
                        fontSize: "12px",
                        fontWeight: "bold"
                    }}>
                    {row.STATIVOMEIOAMBIENTE == "Concluído" ? "Emitido - Aprovado" : row.STATIVOMEIOAMBIENTE}
                </th>,
                sortable: true,
            },
            {
                field: 'DTFIMALVARAMEIOAMBIENTE',
                header: 'St.Fim Meio Ambiente',
                body: row => <th className={isStatusNegacao(row.STATIVOMEIOAMBIENTE, row.DTFIMALVARAMEIOAMBIENTE) ? "text-danger" : ""}>
                    {formatarDataParaBR(row.DTFIMALVARAMEIOAMBIENTE)}</th>,
                sortable: true,
            },
        ] : []),
        ...(tipoAvaraAplicado === '' || tipoAvaraAplicado == 3 ? [
            {
                field: 'STATIVOVIGILANCIASANITARIA',
                header: 'St.Vigilância Sanitaria',
                body: row => <th className={`badge text-white ${row.STATIVOVIGILANCIASANITARIA_BADGE}`}
                    style={{
                        backgroundColor: "#198754",
                        color: "#fff",
                        padding: "3px 8px",
                        borderRadius: "3px",
                        fontSize: "12px",
                        fontWeight: "bold"
                    }}
                >
                    {row.STATIVOVIGILANCIASANITARIA == "Concluído" ? "Emitido - Aprovado" : row.STATIVOVIGILANCIASANITARIA}
                </th>,
                sortable: true,
            },
            {
                field: 'DTFIMALVARAVIGILANCIASANITARIA',
                header: 'Dt.Fim Vigilância Sanitaria',
                body: row => <th className={isStatusNegacao(row.STATIVOVIGILANCIASANITARIA, row.DTFIMALVARAVIGILANCIASANITARIA) ? "text-danger" : ""}>
                    {formatarDataParaBR(row.DTFIMALVARAVIGILANCIASANITARIA)}</th>,
                sortable: true,
            },
        ] : []),
        ...(tipoAvaraAplicado === '' || tipoAvaraAplicado == 4 ? [
            {
                field: 'STATIVOPREFEITURA',
                header: 'St.Prefeitura',
                body: row => <th className={`badge text-white ${row.STATIVOPREFEITURA_BADGE}`}
                    style={{
                        backgroundColor: "#198754",
                        color: "#fff",
                        padding: "3px 8px",
                        borderRadius: "3px",
                        fontSize: "12px",
                        fontWeight: "bold"
                    }}>
                    {row.STATIVOPREFEITURA == "Concluído" ? "Emitido - Aprovado" : row.STATIVOPREFEITURA}

                </th>,
                sortable: true,
            },
            {
                field: 'DTFIMALVARAPREFEITURA',
                header: 'Dt.Fim Prefeitura',
                body: row => <th className={isStatusNegacao(row.STATIVOPREFEITURA, row.DTFIMALVARAPREFEITURA) ? "text-danger" : ""}>
                    {formatarDataParaBR(row.DTFIMALVARAPREFEITURA)}</th>,
                sortable: true,
            },
        ] : []),
        {
            field: 'ARQUIVOALVARA',
            header: 'Opções',
            body: row => (
                <ButtonTable
                    titleButton="Editar Alvarás da Loja"
                    cor="info"
                    Icon={FaRegFileAlt}
                    onClickButton={() => handleClickAjusteAlvara(row)}
                    textButton={"Alvára"}
                    iconSize={18}
                    width="60px"
                    height="50px"
                    lineHeight={1.3}
                />
            ),
            sortable: true,
        }
    ]

    const handleClickAjusteAlvara = (row) => {
        if (optionsModulos[0]?.ALTERAR !== 'True') {
            Swal.fire({
                icon: 'error',
                title: 'Atenção!',
                html: `${usuarioLogado?.NOFUNCIONARIO} <br /> Você não tem permissão para editar alvará.`,
                confirmButtonColor: '#7352A5',
                customClass: {
                    container: 'custom-swal',
                },
            });
            return;
        }

        setIdEmpresaSelecionada(row.IDEMPRESA);
        setModalAlvaraEmpresa(true);
    };

    return (

        <Fragment>

            <div className="panel">
                <div className="panel-hdr mb-4">

                    <h2>Lista de Empresas</h2>

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
                        cellMemo={false}
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
                                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}
                                footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}
                                bodyStyle={{ fontSize: '0.8rem' }}

                            />
                        ))}
                    </DataTable>
                </div>
            </div>
            <ActionAlvaraEmpresaModal
                show={modalAlvaraEmpresa}
                handleClose={() => setModalAlvaraEmpresa(false)}
                dadosAlvaraEmpresaSelecionada={dadosAlvaraEmpresaSelecionada}
                usuarioLogado={usuarioLogado}
                optionsModulos={optionsModulos}
                refetchAlvaraEmpresa={refetchAlvaraEmpresa}
                refetchAlvaraSelecionado={refetchAlvaraSelecionado}
            />

        </Fragment>
    )
}