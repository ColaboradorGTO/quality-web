import { Fragment, useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ButtonTable } from '../../../ButtonsTabela/ButtonTable';
import { GrView } from 'react-icons/gr';
import { get } from '../../../../api/funcRequest';
import { ActionDetalhePedidoModal } from './actionDetalhePedidoModal';
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from '../../../Tables/headerTable';
import Swal from 'sweetalert2';
import axios from 'axios';

export const ActionListaPedidoCompra = ({
  show,
  usuarioLogado,
  optionsModulos,
  dadosPedidosCompra,
  setSelectedItens 
}) => {
  const [rowClick, setRowClick] = useState(true);
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [modalDetalhePedido, setModalDetalhePedido] = useState(false);
  const [dadosDetalhePedido, setDadosDetalhePedido] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const dataTableRef = useRef();

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Histórico da Distribuição',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº Pedido', 'Empresa']],
      body: dados.map(item => [
        item.IDPEDIDOCOMPRA,
        item.EMPRESA
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('historico_distribuicao_compras.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº Pedido', 'Empresa'];
    worksheet['!cols'] = [
      { wpx: 100, caption: 'Nº Pedido' },
      { wpx: 150, caption: 'Empresa' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Histórico da Distribuição');
    XLSX.writeFile(workbook, 'historico_distribuicao_compras.xlsx');
  };

  const dados = dadosPedidosCompra.map((item, index) => {
    return {
      IDPEDIDOCOMPRA: item.IDPEDIDOCOMPRA,
      EMPRESA: item.EMPRESA
    }
  });

  const colunasPedidos = [
    {
      field: 'IDPEDIDOCOMPRA',
      header: 'Nº Pedido',
      body: row => <th>{row.IDPEDIDOCOMPRA}</th>,
      sortable: true,
    },
    {
      field: 'EMPRESA',
      header: 'Empresa',
      body: row => <th>{row.EMPRESA}</th>,
      sortable: true,
    },
    {
      field: 'IDPEDIDOCOMPRA',
      header: 'Opções',
      body: (row) => {
        return (
          <div className="p-1 " style={{ display: "flex" }}>
            <div className="p-1">
              <ButtonTable
                Icon={GrView}
                cor={"primary"}
                iconColor={"white"}
                iconSize={20}
                onClickButton={() => handleClickDetalhar(row)}
                titleButton={"Visualizar Detalhes do Pedido"}
                width="30px"
                height="30px"
              />
            </div>
            <div className="custom-control custom-checkbox p-1">
              <input
                type="checkbox"
                checked={selectedId === row.IDPEDIDOCOMPRA}
                onChange={(e) => {
                  setSelectedId(e.target.checked ? row.IDPEDIDOCOMPRA : null);
                  setSelectedItens(row.IDPEDIDOCOMPRA);
                }}
                selectionMode="single"
              />
            </div>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    if (!show) {
      setSelectedId(null);
    }
  }, [show]);

  const handleClickDetalhar = (row) => {
    if (row && row.IDPEDIDOCOMPRA) {
      handleDetalhar(row.IDPEDIDOCOMPRA);
    }
  };

  const handleDetalhar = async (IDPEDIDOCOMPRA) => {
    try {
      const response = await get(`/detalhe-distribuicao-compras?idPedido=${IDPEDIDOCOMPRA}`);
      if (response.data && response.data.length > 0) {
        setDadosDetalhePedido(response.data);
        setModalDetalhePedido(true);
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Sem detalhes',
          text: 'Não foram encontrados detalhes para este pedido.',
        })
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Fragment>
      <div className="panel" >
        <div className="panel-hdr">
          <h2>Histórico da Distribuição de Compras </h2>
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
            title="Histórico da Distribuição de Compras"
            value={dados}
            size="small"
            selectionMode={rowClick ? null : 'checkbox'}
            selection={empresaSelecionada}
            onSelectionChange={e => setEmpresaSelecionada(e.value)}
            sortOrder={-1}
            paginator={true}
            rows={10}
            rowsPerPageOptions={[10, 20, 30, 40, 50, 100, dados.length]}
            showGridlines
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
          >
            {colunasPedidos.map(coluna => (
              <Column
                key={coluna.field}
                field={coluna.field}
                header={coluna.header}
                selectionMode={coluna.selectionMode}
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

      <ActionDetalhePedidoModal
        show={modalDetalhePedido}
        handleClose={() => setModalDetalhePedido(false)}
        dadosDetalhePedido={dadosDetalhePedido}
      />

      {/* <ActionListaDistribuicaoSugestoesHistorico
        dadosSugestoesHistorico={dadosSugestoesHistorico}
      /> */}


    </Fragment>
  );
};