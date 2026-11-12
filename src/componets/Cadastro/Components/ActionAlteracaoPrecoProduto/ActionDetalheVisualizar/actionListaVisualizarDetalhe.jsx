import { useRef, useState, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import HeaderTable from "../../../../Tables/headerTable";
import { toFloat } from "../../../../../utils/toFloat";
import { formatMoeda } from "../../../../../utils/formatMoeda";
import { ButtonTable } from "../../../../ButtonsTabela/ButtonTable";
import { FaCheck } from "react-icons/fa6";
import { FaTimes } from "react-icons/fa";

export const ActionListaVisualizarDetalhe = ({ dadosVisualizarDetalhe }) => {
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [selectedIds, setSelectedIds] = useState({});
    const [selectAll, setSelectAll] = useState(false);
    const [editingPrices, setEditingPrices] = useState([]);
    const [rowSelection, setRowSelection] = useState(null);
    const [selectAllChecked, setSelectAllChecked] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [produtosSelecionados, setProdutosSelecionados] = useState([]);
    const dataTableRef = useRef();


    const onGlobalFilterChange = (e) => {
        setGlobalFilterValue(e.target.value);
    };

    const handlePrint = useReactToPrint({
        content: () => dataTableRef.current,
        documentTitle: 'Lista de Alteração Preço',
    });

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.autoTable({
            head: [['Nº', 'ID Produto', 'Descrição', 'Código Barras', 'Preço Anterior', 'Preço Novo', 'Estoque']],
            body: dados.map(item => [
                item.contador,
                item.IDPRODUTO,
                item.DSNOME,
                item.NUCODBARRAS,
                formatMoeda(item.PRECOVENDAANTERIOR),
                formatMoeda(item.PRECOVENDANOVO),
                toFloat(item.quantidadeEstoque),
            ]),
            horizontalPageBreak: true,
            horizontalPageBreakBehaviour: 'immediately'
        });
        doc.save('lista_alteracao_preco_detalhes.pdf');
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(dados.map(item => ({
            'Nº': item.contador,
            'ID Produto': item.IDPRODUTO,
            'Descrição': item.DSNOME,
            'Código Barras': item.NUCODBARRAS,
            'Dt. Cadastro': item.DTCADASTRO,
            'Preço Anterior': item.PRECOVENDAANTERIOR,
            'Preço Novo': item.PRECOVENDANOVO,
            'Estoque': item.quantidadeEstoque,
            'Status': item.STATIVO ? 'ATIVA' : 'INATIVA'
        })));
        const workbook = XLSX.utils.book_new();
        const header = ['Nº', 'ID Produto', 'Descrição', 'Código Barras', 'Dt. Cadastro', 'Preço Anterior', 'Preço Novo', 'Estoque', 'Status'];
        worksheet['!cols'] = [
            { wpx: 70, caption: 'Nº' },
            { wpx: 100, caption: 'ID Produto' },
            { wpx: 300, caption: 'Descrição' },
            { wpx: 150, caption: 'Código Barras' },
            { wpx: 120, caption: 'Dt. Cadastro' },
            { wpx: 120, caption: 'Preço Anterior' },
            { wpx: 120, caption: 'Preço Novo' },
            { wpx: 100, caption: 'Estoque' },
            { wpx: 100, caption: 'Status' },
        ];
        XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Detalhes Alteração Preço');
        XLSX.writeFile(workbook, 'lista_alteracao_preco_detalhes.xlsx');
    };


    const dados = dadosVisualizarDetalhe.flatMap((item, index) => {
        const dadosAlteracao = item?.alteracaoPreco;
        const stExecutado = dadosAlteracao?.STEXECUTADO !== 'False';
        const stCancelado = dadosAlteracao?.STCANCELADO !== 'False'; 
        const authEdit = !stExecutado && !stCancelado;
        // Verifica se existe alteracaoPreco e detalheAlteracao
        if (!item?.alteracaoPreco?.detalheAlteracao) {
            return [];
        }

        // Mapeia todos os produtos do detalheAlteracao
        return item.alteracaoPreco.detalheAlteracao.map((detalhe, produtoIndex) => {
            let contador = (index * 1000) + (produtoIndex + 1); // Contador único para cada produto
            let status = 'ATIVO'; 
            return {
                contador,
                IDRESUMOALTERACAOPRECOPRODUTO: detalhe.produto?.IDRESUMOALTERACAOPRECOPRODUTO,
                AGENDAMENTOALTERACAO: item?.alteracaoPreco?.AGENDAMENTOALTERACAO,
                IDPRODUTO: detalhe.produto?.IDPRODUTO,
                DTCADASTRO: detalhe.produto?.DTCADASTRO,
                DSNOME: detalhe.produto?.DSNOME,
                NUCODBARRAS: detalhe.produto?.NUCODBARRAS,
                STATIVO: detalhe.produto?.STATIVO === 'True',
                PRECOVENDAANTERIOR: toFloat(detalhe.produto?.PRECOVENDAANTERIOR),
                PRECOVENDANOVO: toFloat(detalhe.produto?.PRECOVENDANOVO),
                QTDESTOQUEAOCADASTRAR: detalhe.produto?.QTDESTOQUEAOCADASTRAR,
                QTDESTOQUEATUAL: detalhe.produto?.QTDESTOQUEATUAL,
                // Lógica para quantidade de estoque baseada no status de execução
                quantidadeEstoque: !stExecutado ? detalhe.produto?.QTDESTOQUEAOCADASTRAR : detalhe.produto?.QTDESTOQUEATUAL, 
                status,
                stExecutado,
                stCancelado, 
                authEdit,
                stProd: detalhe.produto?.STATIVO === 'True',
                idDetalheAlteracao: detalhe.produto?.IDDETALHEALTERACAOPRECOPRODUTO,
                idResumoAlteracao: detalhe.produto?.IDRESUMOALTERACAOPRECOPRODUTO,
            }
        });
    });

    useEffect(() => {
        const itensSelecionaveis = dados.filter(item => item.stDisabled !== 'disabled');

        const dadosPaginaAtual = dados.slice(first, first + rows);
        const itensSelecionaveisPaginaAtual = dadosPaginaAtual.filter(item => item.stDisabled !== 'disabled');

        if (selectedItems.length === 0) {
            setSelectAllChecked(false);
        } else if (
            selectedItems.length === itensSelecionaveis.length ||
            (selectedItems.length === itensSelecionaveisPaginaAtual.length &&
            itensSelecionaveisPaginaAtual.length > 0 &&
            itensSelecionaveisPaginaAtual.every(item =>
                selectedItems.some(selected => selected.IDPRODUTO === item.IDPRODUTO)
            ))
        ) {
            setSelectAllChecked(true);
        } else {
            setSelectAllChecked(false);
        }

    }, [selectedItems, dados, first, rows]);

    const onSelectAllChange = (checked) => {
        if (checked) {
        Swal.fire({
            icon: 'question',
            title: 'Selecione o modo de seleção',
            text: 'Deseja selecionar todos da tabela ou somente o que está em tela?',
            showConfirmButton: true,
            showCancelButton: true,
            showCloseButton: true,
            customClass: { container: 'custom-swal' },
            confirmButtonText: 'Todos os registros',
            cancelButtonText: 'Apenas o que está tela',
            cancelButtonColor: '#2196F3',
            allowOutsideClick: false,
        }).then((result) => {
    
            if (result.isConfirmed) {
            const itensSelecionaveis = dados.filter(item => item.stDisabled !== 'disabled');
            setBtnVisivel(true);
            setSelectedItems([...itensSelecionaveis]);
            setSelectedIds(itensSelecionaveis.map(item => item.IDPRODUTO));
            setProdutosSelecionados(itensSelecionaveis.map(item => ({ ...item, quantidade: 1 })));
            setSelectAll(true);
    
            } else if (result.dismiss === Swal.DismissReason.cancel) {
            const itensSelecionaveisPaginaAtual = dados.slice(first, first + rows).filter(item => item.stDisabled !== 'disabled');
            setBtnVisivel(true);
            setSelectedItems([...itensSelecionaveisPaginaAtual]);
            setSelectedIds(itensSelecionaveisPaginaAtual.map(item => item.IDPRODUTO));
            setProdutosSelecionados(itensSelecionaveisPaginaAtual.map(item => ({ ...item, quantidade: 1 })));
            setSelectAll(true);
    
            } else {
            setBtnVisivel(false);
            setSelectedItems([]);
            setSelectedIds([]);
            setProdutosSelecionados([]);
            setSelectAll(false);
            }
        });
        } else {
        setBtnVisivel(false);
        setSelectedItems([]);
        setSelectedIds([]);
        setProdutosSelecionados([]);
        setSelectAll(false);
        }
    }
      
    const colunasDetalhes = [
        {
            field: 'contador',
            header: 'Nº',
            body: row => <th>{row.contador}</th>,
            sortable: true,
        },
        {
            field: 'selecao',
            header: (
                <div>
                    <label>{selectAllChecked ? 'Desmarcar Todos' : 'Marcar Todos'}</label>
                    <input
                        type="checkbox"
                        checked={selectAllChecked}
                        onChange={(e) => onSelectAllChange(e.target.checked)}
                    />
                </div>
            ),
            body: row => {
                // Só mostra se pode editar e produto está ativo
                if (!row.authEdit || !row.stProd) return null;
                
                return (
                    <div className="custom-control custom-checkbox">
                        <input 
                            type="checkbox"
                            // checked={selectedIds?.includes(row.idDetalheAlteracao)}
                            onChange={(e) => {
                                const isChecked = e.target.checked;
                                const updatedSelectedIds = e.target.checked
                                    ? [...selectedIds, row.idDetalheAlteracao]
                                    : selectedIds.filter(id => id !== row.idDetalheAlteracao);
                                setSelectedIds(updatedSelectedIds);
                                setSelectAllChecked(updatedSelectedIds.length === dados.length);
                                setProdutosSelecionados(isChecked ? [...produtosSelecionados, row] : produtosSelecionados.filter(item => item.idDetalheAlteracao !== row.idDetalheAlteracao));
                                handleSelectProduct(row.idDetalheAlteracao, e.target.checked)
                                //disabled={row.authEdit || 'disabled'}
                            }}
                        />
                    </div>
                );
            },
            sortable: false,
            // Só aparece se não foi executado nem cancelado
            style: { display: dados.some(d => d.authEdit) ? 'table-cell' : 'none' }
        },
        {
            field: 'DTCADASTRO',
            header: 'Dt. Cadastro',
            body: row => <th>{row.DTCADASTRO}</th>,
            sortable: true,
        },
        {
            field: 'IDPRODUTO',
            header: 'ID Produto',
            body: row => {
                return (
                    <th>{row.IDPRODUTO}</th>
                )
            },
            sortable: true,
        },
        {
            field: 'DSNOME',
            header: 'Descriçao Produto',
            body: row => {
                return (
                    <th>{row.DSNOME}</th>
                )
            },
            sortable: true,
        },
        {
            field: 'NUCODBARRAS',
            header: 'Cod. Barras',
            body: row => {
                return (
                    <th>{row.NUCODBARRAS}</th>
                )
            },
            sortable: true,
        },
        {
            field: 'PRECOVENDAANTERIOR',
            header: 'Preço Antigo',
            body: row => {
                return (
                    <th>{formatMoeda(row.PRECOVENDAANTERIOR)}</th>
                )
            },
            sortable: true,
        },
        {
            field: 'PRECOVENDANOVO',
            header: 'Preço Novo',
            body: row => {
                // Se pode editar e produto ativo = input editável
                if (row.authEdit && row.stProd) {
                    return (
                        <input
                            type="text"
                            value={editingPrices[`${row.idResumoAlteracao}_${row.idDetalheAlteracao}`] || row.PRECOVENDANOVO}
                            onChange={(e) => handlePriceChange(row, e.target.value)}
                            onFocus={() => handleSelectProduct(row.idDetalheAlteracao, true)}
                            style={{ width: '80px', textAlign: 'center' }}
                            className="form-control"
                        />
                    );
                }
                
                // Senão = label simples
                return <th>{formatMoeda(row.PRECOVENDANOVO)}</th>;
            },
            sortable: true,
        },
        {
            field: 'quantidadeEstoque',
            header: 'Estoque',
            body: row => {
                return (
                    <th>{toFloat(row.quantidadeEstoque)}</th>
                )
            },
            sortable: true,
        },
        {
            field: 'STATIVO',
            header: 'Status',
            body: row => {
                let className = '';
                let texto = '';
                
                if (row.stCancelado) {
                    return <th style={{ color: '#fd3995', fontWeight: 900 }}>CANCELADO</th>;
                } else if (row.stExecutado) {
                    return <th style={{ color: '#1dc9b7', fontWeight: 900 }}>ALTERADO</th>;
                } else if (row.stProd) {
                    return <th style={{ color: '#2196f3', fontWeight: 900 }}>ATIVO</th>;
                } else {
                    return <th style={{ color: '#fd3995', fontWeight: 900 }}>CANCELADO</th>;
                }
            
            },
            sortable: true,
        },
        {
            field: 'opcoes',
            header: 'Opções',
            body: row => {
                if (row.stCancelado) return null;
                
                const hasChanges = editingPrices[`${row.idResumoAlteracao}_${row.idDetalheAlteracao}`] !== row.PRECOVENDANOVO;
                
                return (
                    <div style={{ width: '100px', display: 'flex' }}>
                        <div className="mr-1">

                            {row.authEdit && row.stProd && hasChanges && (
                                <ButtonTable
                                    titleButton={"Confirmar Alteração"}
                                    cor={"warning"}
                                    Icon={FaCheck}
                                    iconSize={22}
                                    iconColor={"#fff"}
                                    onClickButton={() => handleConfirmPriceChange(row)}
                                    width="30px"
                                    height="30px"
                                />
                            )}
                        </div>
                        
                        <div className="mr-1">

                            {row.authEdit && row.stProd && (

                                <ButtonTable
                                    titleButton={"Desativar Produto"}
                                    cor={"danger"}
                                    Icon={FaTimes}
                                    iconSize={22}
                                    iconColor={"#fff"}
                                    onClickButton={() => handleDeactivateProduct(row)}
                                    width="30px"
                                    height="30px"
                                />
                            )}
                        </div>
                        
                        <div className="mr-1">

                            {row.authEdit && !row.stProd && (
                
                                <ButtonTable
                                    titleButton={"Ativar Produto"}
                                    cor={"success"}
                                    Icon={FaCheck}
                                    iconSize={22}
                                    iconColor={"#fff"}
                                    onClickButton={() => handleActivateProduct(row)}
                                    width="30px"
                                    height="30px"
                                />
                            )}
                        </div>
                    </div>
                );
            },
            sortable: false,
            style: { display: dados.some(d => d.authEdit) ? 'table-cell' : 'none' }
        }
    ]

    return (
        <div className="panel">
            <div className="panel-hdr">
                <h2>Lista de Produtos</h2>
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
            
            {dados.some(d => d.authEdit && d.stProd) && (
                <div className="mb-3 ml-4">
                    <div className="custom-control custom-checkbox">
                        <input 
                            type="checkbox"
                            checked={selectAll}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            id="selectAll"
                        />
                        <label htmlFor="selectAll">Marcar Todos</label>
                    </div>
                </div>
            )}
            <div className="card" ref={dataTableRef}>

                <DataTable
                    scrollable 
                    scrollHeight="600px"
                    title="Vendas por Loja"
                    value={dados}
                    globalFilter={globalFilterValue}
                    size="small"
                    selectionMode="single"
                    selection={rowSelection}
                    onSelectionChange={(e) => setRowSelection(e.value)}
                    sortOrder={-1}
                    paginator={true}
                    rows={100}
                    rowsPerPageOptions={[10, 20, 50, 100, dados.length]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
                    filterDisplay="menu"
                    showGridlines
                    stripedRows
                    emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado </div>}
                >
                    {colunasDetalhes.map(coluna => (
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
    )
}