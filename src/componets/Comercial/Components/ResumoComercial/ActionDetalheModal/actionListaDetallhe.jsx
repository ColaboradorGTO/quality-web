import { Column } from "primereact/column";
import { formatMoeda } from "../../../../../utils/formatMoeda";
import { toFloat } from "../../../../../utils/toFloat";
import { DataTable } from "primereact/datatable";
import HeaderTable from "../../../../Tables/headerTable";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Fragment, useRef, useState } from "react";

export const ActionListaDetalhe = ({ dadosDetalheFechamento }) => {
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const dataTableRef = useRef();

    const onGlobalFilterChange = (e) => {
        setGlobalFilterValue(e.target.value);
    };

    const handlePrint = useReactToPrint({
        content: () => dataTableRef.current,
        documentTitle: 'Detalhe Fechamento',
    });

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.autoTable({
            head: [['Caixa', 'Operador', 'Receb. DIN', 'Receb. CART', 'Receb. POS', 'Receb. FAT', 'Inf. DIN', 'Inf. CART', 'Inf. POS', 'Inf. FAT', 'Quebra']],
            body: dadosFechamento.map(item => [
                item.DSCAIXA,
                item.NOFUNCIONARIO,
                formatMoeda(item.VALORTOTALDINHEIRO),
                formatMoeda(item.VALORTOTALCARTAO),
                formatMoeda(item.VALORTOTALPOS),
                formatMoeda(item.VALORTOTALFATURA),
                formatMoeda(item.totalDinheiroInformado),
                formatMoeda(item.CARTAO),
                formatMoeda(item.POS),
                formatMoeda(item.FATURA),
                item.totalQuebraCaixa

            ]),
            horizontalPageBreak: true,
            horizontalPageBreakBehaviour: 'immediately'
        });
        doc.save('detalhe_fechamneto.pdf');
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(dadosExcel);
        const workbook = XLSX.utils.book_new();
        const header = ['Caixa', 'Operador', 'Receb. DIN', 'Receb. CART', 'Receb. POS', 'Receb. FAT', 'Inf. DIN', 'Inf. CART', 'Inf. POS', 'Inf. FAT', 'Quebra'];
        worksheet['!cols'] = [
            { wpx: 100, caption: 'Caixa' },
            { wpx: 100, caption: 'Operador' },
            { wpx: 100, caption: 'Receb. DIN' },
            { wpx: 100, caption: 'Receb. CART' },
            { wpx: 100, caption: 'Receb. POS' },
            { wpx: 100, caption: 'Receb. FAT' },
            { wpx: 100, caption: 'Inf. DIN' },
            { wpx: 100, caption: 'Inf. CART' },
            { wpx: 100, caption: 'Inf. POS' },
            { wpx: 100, caption: 'Inf. FAT' },
            { wpx: 100, caption: 'Quebra' }

        ];
        XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Detalhe Fechamento');
        XLSX.writeFile(workbook, 'detalhe_fechamento.xlsx');
    };

    const calcularTotalDisponivel = (item) => {

        return (
            toFloat(item.VALORTOTALDINHEIRO) +
            toFloat(item.VALORTOTALFATURA) -
            toFloat(item.VALORTOTALDESPESA) +
            toFloat(item.VALORTOTALADIANTAMENTOSALARIAL)
        )
    }

    const calcularTotalDespesasAdiantamento = (item) => {

        return (
            toFloat(item.VALORTOTALDESPESA) +
            toFloat(item.VALORTOTALADIANTAMENTOSALARIAL)
        );
    }

    const calcularTotalQuebraCaixa = (item) => {
        const dinheiroAjuste = toFloat(item.VALORINFORMADO?.DINHEIROAJUSTE);
        const dinheiroInformado = toFloat(item.VALORINFORMADO?.DINHEIRO);
        const dinheiroRecebido = toFloat(item.VALORTOTALDINHEIRO);

        const valorInformado = dinheiroAjuste > 0
            ? dinheiroAjuste
            : dinheiroInformado;

        return valorInformado - dinheiroRecebido;
    };

    const dadosExcel = dadosDetalheFechamento.map((item) => {

        const totalDinheiroInformado =
            toFloat(item.VALORINFORMADO?.DINHEIROAJUSTE) > 0
                ? toFloat(item.VALORINFORMADO.DINHEIROAJUSTE)
                : toFloat(item.VALORINFORMADO?.DINHEIRO);

        return {
            DSCAIXA: item.DSCAIXA,
            NOFUNCIONARIO: item.NOFUNCIONARIO,
            VALORTOTALDINHEIRO: item.VALORTOTALDINHEIRO,
            VALORTOTALCARTAO: item.VALORTOTALCARTAO,
            VALORTOTALPOS: item.VALORTOTALPOS,
            VALORTOTALFATURA: item.VALORTOTALFATURA,
            totalDinheiroInformado,
            CARTAO: item.VALORINFORMADO.CARTAO,
            POS: item.VALORINFORMADO.POS,
            FATURA: item.VALORINFORMADO.FATURA,
            totalQuebraCaixa: calcularTotalQuebraCaixa(item)
        };
    });

  
    const dadosFechamento = dadosDetalheFechamento.map((item) => {

        const totalDinheiroInformado =
            toFloat(item.VALORINFORMADO?.DINHEIROAJUSTE) > 0
                ? toFloat(item.VALORINFORMADO.DINHEIROAJUSTE)
                : toFloat(item.VALORINFORMADO?.DINHEIRO);

        const totalQuebraCaixa = calcularTotalQuebraCaixa(item);

        const quebraCaixa = item.VALORTOTALDINHEIRO;

        const totalDespesasAdiantamento = calcularTotalDespesasAdiantamento(item);
        const totalDisponivel = calcularTotalDisponivel(item);

        return {
            DSCAIXA: item.DSCAIXA,
            IDCAIXAWEB: item.IDCAIXAWEB,
            IDEMPRESA: item.IDEMPRESA,
            IDMOVIMENTOCAIXAWEB: item.IDMOVIMENTOCAIXAWEB,
            NOFANTASIA: item.NOFANTASIA,
            NOFUNCIONARIO: item.NOFUNCIONARIO,

            DINHEIRO: item.VALORINFORMADO.DINHEIRO,
            DINHEIROAJUSTE: item.VALORINFORMADO.DINHEIROAJUSTE,
            CARTAO: item.VALORINFORMADO.CARTAO,
            POS: item.VALORINFORMADO.POS,
            FATURA: item.VALORINFORMADO.FATURA,

            VALORTOTALADIANTAMENTOSALARIAL: item.VALORTOTALADIANTAMENTOSALARIAL,
            VALORTOTALCARTAO: item.VALORTOTALCARTAO,
            VALORTOTALCONVENIO: item.VALORTOTALCONVENIO,
            VALORTOTALDESPESA: item.VALORTOTALDESPESA,
            VALORTOTALDINHEIRO: item.VALORTOTALDINHEIRO,
            VALORTOTALFATURA: item.VALORTOTALFATURA,
            VALORTOTALPOS: item.VALORTOTALPOS,
            VALORTOTALVOUCHER: item.VALORTOTALVOUCHER,

            totalQuebraCaixa,
            quebraCaixa,
            totalDinheiroInformado,

            VRDEPOSITO: item.DEPOSITOS[0]?.VRDEPOSITO,
            NUDOCDEPOSITO: item.DEPOSITOS[0]?.NUDOCDEPOSITO,
            DSHISTORIO: item.DEPOSITOS[0]?.DSHISTORIO,

            totalDespesasAdiantamento: formatMoeda(totalDespesasAdiantamento),
            totalDisponivel
        };
    });

    const calcularTotalDinheiroColuna = () => {
        let total = 0;
        for (let venda of dadosFechamento) {
            total += parseFloat(venda.VALORTOTALDINHEIRO);
        }
        return total;
    }
    const calcularTotalCartaoColuna = () => {
        let total = 0;
        for (let venda of dadosFechamento) {
            total += parseFloat(venda.VALORTOTALCARTAO);
        }
        return total;
    }
    const calcularTotalPosColuna = () => {
        let total = 0;
        for (let venda of dadosFechamento) {
            total += parseFloat(venda.VALORTOTALPOS);
        }
        return total;
    }
    const calcularTotalFaturaColuna = () => {
        let total = 0;
        for (let venda of dadosFechamento) {
            total += parseFloat(venda.VALORTOTALFATURA);
        }
        return total;
    }

    const calcularTotalDinheiroInformado = () => {
        let total = 0;
        for (let venda of dadosFechamento ? dadosFechamento : []) {
            total += parseFloat(venda?.totalDinheiroInformado);
        }
        return total;
    }

    const calcularTotalCartao = () => {
        let total = 0;
        for (let venda of dadosFechamento) {
            total += parseFloat(venda.CARTAO);
        }
        return total;
    }
    const calcularTotalPos = () => {
        let total = 0;
        for (let venda of dadosFechamento) {
            total += parseFloat(venda.POS);
        }
        return total;
    }
    const calcularTotalFatura = () => {
        let total = 0;
        for (let venda of dadosFechamento) {
            total += parseFloat(venda.FATURA);
        }
        return total;
    }

    const calcularTotalQuebra = () => {
        return dadosFechamento.reduce((total, venda) => {
            return total + toFloat(venda.totalQuebraCaixa);
        }, 0);
    };

    const colunasFechamento = [
        {
            field: 'DSCAIXA',
            header: 'Caixa',
            body: (row) => <th >{row.DSCAIXA}</th>,
            sortable: true
        },
        {
            field: 'NOFUNCIONARIO',
            header: 'Operador',
            body: (row) => <th >{row.NOFUNCIONARIO}</th>,
            sortable: true,
            footer: <th style={{ fontSize: '1.2rem' }}>Total</th>
        },
        {
            field: 'VALORTOTALDINHEIRO',
            header: 'Receb. DIN',
            body: (row) => <th style={{ color: 'blue' }}>{formatMoeda(row.VALORTOTALDINHEIRO)}</th>,
            sortable: true,
            footer: <th style={{ color: 'blue' }}>{formatMoeda(calcularTotalDinheiroColuna())}</th>
        },
        {
            field: 'VALORTOTALCARTAO',
            header: 'Receb. CART',
            body: (row) => <th style={{ color: 'blue' }}>{formatMoeda(row.VALORTOTALCARTAO)}</th>,
            sortable: true,
            footer: <th style={{ color: 'blue' }}>{formatMoeda(calcularTotalCartaoColuna())}</th>
        },
        {
            field: 'VALORTOTALPOS',
            header: 'Receb. POS',
            body: (row) => <th style={{ color: 'blue' }}>{formatMoeda(row.VALORTOTALPOS)}</th>,
            sortable: true,
            footer: <th style={{ color: 'blue' }}>{formatMoeda(calcularTotalPosColuna())}</th>
        },
        {
            field: 'VALORTOTALFATURA',
            header: 'Receb. FAT',
            body: (row) => <th style={{ color: 'blue' }}>{formatMoeda(row.VALORTOTALFATURA)}</th>,
            sortable: true,
            footer: <th style={{ color: 'blue' }}>{formatMoeda(calcularTotalFaturaColuna())}</th>
        },
        {
            field: 'totalDinheiroInformado',
            header: 'Inf. DIN',
            body: (row) => <th style={{ color: 'green' }}>{formatMoeda(row.totalDinheiroInformado)}</th>,
            sortable: true,
            footer: <th style={{ color: 'green' }}>{formatMoeda(calcularTotalDinheiroInformado())}</th>
        },
        {
            field: 'CARTAO',
            header: 'Inf. CART',
            body: (row) => <th style={{ color: 'green' }}>{formatMoeda(row.CARTAO)}</th>,
            sortable: true,
            footer: <th style={{ color: 'green' }}>{formatMoeda(calcularTotalCartao())}</th>
        },
        {
            field: 'POS',
            header: 'Inf. POS',
            body: (row) => <th style={{ color: 'green' }}>{formatMoeda(row.POS)}</th>,
            sortable: true,
            footer: <th style={{ color: 'green' }}>{formatMoeda(calcularTotalPos())}</th>
        },
        {
            field: 'FATURA',
            header: 'Inf. FAT',
            body: (row) => <th style={{ color: 'green' }}>{formatMoeda(row.FATURA)}</th>,
            sortable: true,
            footer: <th style={{ color: 'green' }}>{formatMoeda(calcularTotalFatura())}</th>
        },
        {
            field: 'totalQuebraCaixa',
            header: 'Quebra',

            body: (row) => {
                const valor = toFloat(row.totalQuebraCaixa);

                return (
                    <th style={{
                        color: valor > 0 ? 'blue' : valor <= 0 ? 'red' : 'black'
                    }}>
                        {valor > 0 ? '+' : valor <= 0 ? '-' : ''}
                        {' '}
                        {formatMoeda(Math.abs(valor))}
                    </th>
                );
            },

            sortable: true,

            footer: () => {
                const valor = calcularTotalQuebra();

                return (
                    <th style={{
                        color: valor > 0 ? 'blue' : valor <= 0 ? 'red' : 'black'
                    }}>
                        {valor > 0 ? '+' : valor <= 0 ? '-' : ''}
                        {' '}
                        {formatMoeda(Math.abs(valor))}
                    </th>
                );
            }
        },
    ]

    return (
        <div className="panel">
            <div className="panel-hdr">
                <h2>Lista de Vendas</h2>
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
                    title="Detalhe Fechamento"
                    value={dadosFechamento}
                    size="small"
                    globalFilter={globalFilterValue}
                    sortOrder={-1}
                    // paginator={true}
                    rows={10}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
                    filterDisplay="menu"
                    showGridlines
                    cellMemo={false}
                    stripedRows
                    emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
                >
                    {colunasFechamento.map(coluna => (
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

            {dadosFechamento.length > 0 && (
                <Fragment >
                    <div
                        style={{
                            textAlign: "center",
                            marginTop: "20px",
                        }}>
                        <h2 style={{ fontWeight: 700 }}>Relação de Depósitos</h2>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            textAlign: "center",
                            marginTop: "20px",
                            justifyContent: "space-around",

                            width: "100%",
                        }}>

                        <div className="col-sm-4 col-xl-2" >
                            <span style={{ fontSize: "15px", fontWeight: 400 }}>Valor Depositado (R$) </span>
                            <p style={{ fontSize: "16px", fontWeight: 600 }}>{formatMoeda(toFloat(dadosFechamento[0]?.VRDEPOSITO))} </p>
                        </div>

                        <div className="col-sm-4 col-xl-2">
                            <span style={{ fontSize: "16px", fontWeight: 400 }}>

                                Histórico
                                <p style={{ fontSize: "16px", fontWeight: 600 }}>

                                    {dadosFechamento[0]?.DSHISTORIO}
                                </p>
                            </span>
                        </div>

                        <div className="col-sm-4 col-xl-2">
                            <span style={{ fontSize: "16px", fontWeight: 400 }}>

                                Documento:
                            </span>
                            <p style={{ fontSize: "16px", fontWeight: 600 }}>

                                {toFloat(dadosFechamento[0]?.NUDOCDEPOSITO)}
                            </p>
                        </div>

                    </div>

                </Fragment>
            )}
        </div>
    )
}