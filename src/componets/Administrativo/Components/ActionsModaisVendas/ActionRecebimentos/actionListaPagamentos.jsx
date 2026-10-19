import { useRef, useState } from "react";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../../../Tables/headerTable";
import { formatMoeda } from "../../../../../utils/formatMoeda";
import { toFloat } from "../../../../../utils/toFloat";

export const ActionListaPagamentos = ({ dadosDetalheRecebimentos, dados }) => {
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const dataTableRef = useRef();


    const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
    };

    const handlePrint = useReactToPrint({
        content: () => dataTableRef.current,
        documentTitle: 'Relação de Produtos ',
    });
    const exportToPDFProduto = () => {
        const doc = new jsPDF();
        doc.autoTable({
            head: [['Pagamento', 'Parcelas', 'NSU_CTF', 'Autorizador', 'Valor Recebido', 'Valor Liquido']],
            body: dadosPagamentos.map(item => [
                item.contador,
                item.DSTIPOPAGAMENTO,
                item.NOTEF,
                item.NOAUTORIZADOR,
                item.NUAUTORIZACAO,
                item.NPARCELAS,
                formatMoeda(item.VALORRECEBIDO),
                formatMoeda(item.VALORLIQUIDO)

            ]),
            horizontalPageBreak: true,
            horizontalPageBreakBehaviour: 'immediately'
        });
        doc.save('relacao_pagamento.pdf');
    };

    const exportToExcelProduto = () => {
        const worksheet = XLSX.utils.json_to_sheet(dadosPagamentos);
        const workbook = XLSX.utils.book_new();
        const header = ['Pagamento', 'Parcelas', 'NSU_CTF', 'Autorizador', 'Valor Recebido', 'Valor Liquido'];
        worksheet['!cols'] = [
            { wpx: 100, caption: 'Pagamento' },
            { wpx: 100, caption: 'Parcelas' },
            { wpx: 250, caption: 'NSU_CTF' },
            { wpx: 100, caption: 'Autorizador' },
            { wpx: 100, caption: 'Valor Recebido' },
            { wpx: 100, caption: 'Valor Liquido' }
        ];
        XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Relação de Pagamentos');
        XLSX.writeFile(workbook, 'relacao_pagamentos.xlsx');
    }


    const dadosPagamentos = dadosDetalheRecebimentos?.flatMap((item) =>

        item.vendaPagamento.map((pagamento) => ({

            DSTIPOPAGAMENTO: pagamento.pag.DSTIPOPAGAMENTO,
            NPARCELAS: pagamento.pag.NPARCELAS,
            NUOPERACAO: pagamento.pag.NUOPERACAO,
            NUAUTORIZACAO: pagamento.pag.NUAUTORIZACAO,
            VALORRECEBIDO: pagamento.pag.VALORRECEBIDO
        }))
    );

    const colunasPagPos = [
        {
            field: 'DSTIPOPAGAMENTO',
            header: 'Pagamento',
            body: row => <th>{row.DSTIPOPAGAMENTO}</th>,
            sortable: true,
        },
        {
            field: 'NPARCELAS',
            header: 'Parcelas',
            body: row => <th>{toFloat(row.NPARCELAS)}</th>,
            sortable: true,
        },
        {
            field: 'NUOPERACAO',
            header: 'NSU_CTF',
            body: row => <th>{toFloat(row.NUOPERACAO)}</th>,
            sortable: true,
        },
        {
            field: 'NUAUTORIZACAO',
            header: 'Autorização',
            body: row => <th>{row.NUAUTORIZACAO}</th>,
            sortable: true,
        },
        {
            field: 'VALORRECEBIDO',
            header: 'Vr. Recebido',
            body: row => <th>{formatMoeda(row.VALORRECEBIDO)}</th>,
            sortable: true,
        },
    ]

    return (
        <div className="panel">
            <div className="panel-hdr">
                <h2>{`Lista de Pagamentos da Venda `}</h2>
            </div>
            <div>
                <HeaderTable
                    globalFilterValue={globalFilterValue}
                    onGlobalFilterChange={onGlobalFilterChange}
                    handlePrint={handlePrint}
                    exportToExcel={exportToExcelProduto}
                    exportToPDF={exportToPDFProduto}
                />
            </div>
            <div className="card mt-4" ref={dataTableRef}>

                <DataTable
                    title="Vendas por Loja"
                    value={dadosPagamentos}
                    size="small"
                    sortOrder={-1}
                    showGridlines
                    stripedRows
                    emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
                >
                    {colunasPagPos.map(coluna => (
                        <Column
                            key={coluna.field}
                            field={coluna.field}
                            header={coluna.header}
                            body={coluna.body}
                            footer={coluna.footer}
                            sortable={coluna.sortable}
                            headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '1rem' }}
                            footerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}
                            bodyStyle={{ fontSize: '1rem' }}

                        />
                    ))}
                </DataTable>
            </div>
        </div>
    )
}