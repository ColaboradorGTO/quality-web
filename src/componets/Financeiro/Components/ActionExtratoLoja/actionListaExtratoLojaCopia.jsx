import { Fragment, useRef, useState } from "react";;
import { toFloat } from "../../../../utils/toFloat";
import { formatMoeda } from "../../../../utils/formatMoeda";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../../Tables/headerTable";
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { CiEdit } from "react-icons/ci";
import { BsTrash3 } from "react-icons/bs";
import { FaCheck } from "react-icons/fa";
import { useUpdateStatusConferido } from "./hooks/useUpdateStatusConferido";
import { ModalEditarDepositoDaLoja } from "./ActionEditarDeposito/modalEditarDepositoDaLoja";
import { get } from "../../../../api/funcRequest";
import { useUpdateStatusDeposito } from "./hooks/useUpdateStatusDeposito";
import Swal from "sweetalert2";
import { FaLockOpen } from "react-icons/fa6";
import { ButtonType } from "../../../Buttons/ButtonType";
import { MdAdd } from "react-icons/md";
import { ModalCadastroDeDepositoDaLoja } from "./ActionCadastroDeposito/modalCadastroDeDepositoDaLoja";
import { ModalAjusteExtratoModal } from "./ActionCadastroAjuste/actionCadastroAjusteExtratoModal";

export const ActionListaExtratoContaCorrenteLoja = ({
  dadosExtratoLojaPeriodo,
  usuarioLogado,
  optionsModulos,
  handleClick,
  empresaSelecionada,
}) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [modalEditar, setModalEditar] = useState(false);
  const [modalCadastro, setModalCadastro] = useState(false)
  const [modalAjuste, setModalAjuste] = useState(false)
  const [dadosDeposito, setDadosDeposito] = useState([]);
  const dataTableRef = useRef();

  const {
    handleSubmit
  } = useUpdateStatusConferido({ optionsModulos, usuarioLogado, handleClick })

  const {
    handleCancelar
  } = useUpdateStatusDeposito({ optionsModulos, usuarioLogado, handleClick })


  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Extrato de conta Corrente',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Dt.Lanç', 'Histórico', 'Pago A', 'Despesa', 'Débito', 'Crédito', 'Saldo']],
      body: processarDadosExtrato().map(item => [
        item.dtLancamento,
        item.historico,
        item.pagoA,
        formatMoeda(item.despesa),
        formatMoeda(item.debito),
        formatMoeda(item.credito),
        formatMoeda(item.saldo)
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('extrato_conta_corrente.pdf');
  };

  const exportToExcel = () => {
    const dados = processarDadosExtrato().map(item => ({
      'Dt.Lanç': item.dtLancamento,
      'Histórico': item.historico,
      'Pago A': item.pagoA,
      'Despesa': item.despesa,
      'Débito': formatMoeda(item.debito),
      'Crédito': formatMoeda(item.credito),
      'Saldo': formatMoeda(item.saldo)
    }));
    const worksheet = XLSX.utils.json_to_sheet(dados, { header: ['Dt.Lanç', 'Histórico', 'Pago A', 'Despesa', 'Débito', 'Crédito', 'Saldo'] });
    const workbook = XLSX.utils.book_new();
    worksheet['!cols'] = [
      { wpx: 100 },
      { wpx: 250 },
      { wpx: 100 },
      { wpx: 100 },
      { wpx: 100 },
      { wpx: 100 },
      { wpx: 100 }
    ];
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Extrato');
    XLSX.writeFile(workbook, 'extrato_conta_corrente.xlsx');
  }

  let saldoAnterior = 0;
  const venda = dadosExtratoLojaPeriodo[0]?.primeiraVendaSaldo.SALDO;
  const totalQuebra = dadosExtratoLojaPeriodo[0]?.primeiraVendaSaldo.TOTALQUEBRA;
  saldoAnterior = toFloat(venda) + toFloat(totalQuebra);

  const processarDadosExtrato = () => {
    let saldoAtual = saldoAnterior;
    const dadosProcessados = [];


    dadosExtratoLojaPeriodo.forEach((ret, i) => {

      if (i > 0) {
        // Primeira linha de espaço
        dadosProcessados.push({
          id: `espaco-${i}-1`,
          tipo: 'espaco',
          dtLancamento: '',
          historico: '',
          pagoA: '',
          despesa: '',
          debito: '',
          credito: '',
          saldo: '',
          situacao: '',
          opcao: '',
          className: 'linha-espaco'
        });


      }

      // Vendas Dinheiro
      saldoAtual += toFloat(ret['venda']['VRRECDINHEIRO']);
      dadosProcessados.push({
        id: `venda-${i}`,
        tipo: 'venda',
        dtLancamento: ret['venda']['DTHORAFECHAMENTOFORMATADA'],
        historico: `Mov. Dinheiro do Caixa ${ret['venda']['DTHORAFECHAMENTOFORMATADA']}`,
        pagoA: 'Vendas Dinheiro',
        despesa: '',
        debito: 0,
        credito: toFloat(ret['venda']['VRRECDINHEIRO']),
        saldo: saldoAtual,
        situacao: '',
        opcao: '',
        className: 'table-success'
      });

      // Faturas
      if (ret['totalFaturas'].length > 0) {
        saldoAtual += toFloat(ret['totalFaturas'][0]['VRRECEBIDO']);
        dadosProcessados.push({
          id: `fatura-${i}`,
          tipo: 'fatura',
          dtLancamento: ret['totalFaturas'][0]['DTPROCESSAMENTOFORMATADA'],
          historico: `Mov. Fatura ${ret['totalFaturas'][0]['DTPROCESSAMENTOFORMATADA']}`,
          pagoA: 'Recebimento de Faturas',
          despesa: '',
          debito: 0,
          credito: toFloat(ret['totalFaturas'][0]['VRRECEBIDO']),
          saldo: saldoAtual,
          situacao: '',
          opcao: '',
          className: 'table-success'
        });
      }

      // Despesas
      ret['despesas'].forEach((despesa, j) => {
        saldoAtual -= toFloat(despesa['VRDESPESA']);
        dadosProcessados.push({
          id: `despesa-${i}-${j}`,
          tipo: 'despesa',
          dtLancamento: despesa['DTDESPESAFORMATADA'],
          historico: despesa['DSHISTORIO'],
          pagoA: despesa['DSPAGOA'],
          despesa: despesa['DSCATEGORIA'],
          debito: Math.abs(toFloat(despesa['VRDESPESA'])),
          credito: 0,
          saldo: saldoAtual,
          situacao: '',
          opcao: '',
          className: 'table-danger'
        });
      });

      // Adiantamentos
      ret['adiantamentos'].forEach((adiantamento, j) => {
        saldoAtual -= toFloat(adiantamento['VRVALORDESCONTO']);
        dadosProcessados.push({
          id: `adiantamento-${i}-${j}`,
          tipo: 'adiantamento',
          dtLancamento: adiantamento['DTLANCAMENTOADIANTAMENTO'],
          historico: 'Adiantamento de Salário',
          pagoA: adiantamento['NOFUNCIONARIO'],
          despesa: adiantamento['DSMOTIVO'],
          debito: Math.abs(toFloat(adiantamento['VRVALORDESCONTO'])),
          credito: 0,
          saldo: saldoAtual,
          situacao: '',
          opcao: '',
          className: 'table-danger'
        });
      });

      // Quebra Caixa
      ret['quebracaixa'].forEach((quebra, j) => {
        const totalDinheiroInformado = toFloat(quebra['VRAJUSTDINHEIRO']) > 0
          ? toFloat(quebra['VRAJUSTDINHEIRO'])
          : toFloat(quebra['VRRECDINHEIRO']);

        const totalQuebraCaixa = totalDinheiroInformado - toFloat(quebra['VRFISICODINHEIRO']);
        saldoAtual += totalQuebraCaixa;

        dadosProcessados.push({
          id: `quebra-${i}-${j}`,
          tipo: 'quebra',
          dtLancamento: quebra['DTMOVCAIXA'],
          historico: `Quebra Caixa Mov.: ${quebra['IDMOV']}`,
          pagoA: `Operador: ${quebra['FUNCIONARIOMOV']}`,
          despesa: '',
          debito: totalQuebraCaixa > 0 ? 0 : Math.abs(totalQuebraCaixa),
          credito: totalQuebraCaixa > 0 ? totalQuebraCaixa : 0,
          saldo: saldoAtual,
          situacao: '',
          opcao: '',
          className: 'table-primary'
        });
      });


      ret['totalDepositos'].forEach((deposito, j) => {

        saldoAtual -= toFloat(deposito['VRDEPOSITO']);
        const depositoProcessado = {
          id: `deposito-${i}-${j}`,
          tipo: 'deposito',
          dtLancamento: deposito['DTDEPOSITOFORMATADA'],
          historico: `${deposito['FUNCIONARIO']} Dep. Dinh ${deposito['DTDEPOSITOFORMATADA']}`,
          pagoA: `${deposito['DSBANCO']} - ${deposito['NUDOCDEPOSITO']}`,
          despesa: '',
          debito: Math.abs(toFloat(deposito['VRDEPOSITO'])),
          credito: 0,
          saldo: saldoAtual,
          situacao: deposito['STCONFERIDO'] === 'False' || !deposito['STCONFERIDO'] ? 'Sem Conferir' : 'Conferido',
          opcao: '',
          className: 'table-warning',
          dadosOriginais: deposito, // ✅ Dados originais completos
          STCANCELADO: deposito['STCANCELADO'],
          STCONFERIDO: deposito['STCONFERIDO'],
          IDDEPOSITOLOJA: deposito['IDDEPOSITOLOJA'] // ✅ ID para os botões
        };

        dadosProcessados.push(depositoProcessado);
      });

      // Ajustes
      ret['ajusteextrato'].forEach((ajuste, j) => {
        if (ajuste['STCANCELADO'] === 'False') {
          if (toFloat(ajuste['VRCREDITO']) > 0) {
            saldoAtual -= toFloat(ajuste['VRCREDITO']);
          } else {
            saldoAtual += toFloat(ajuste['VRDEBITO']);
          }
        }

        dadosProcessados.push({
          id: `ajuste-${i}-${j}`,
          tipo: 'ajuste',
          dtLancamento: ajuste['DTCADASTROFORMATADA'],
          historico: ajuste['HISTORICO'],
          pagoA: 'Ajuste de Extrato',
          despesa: '',
          debito: Math.abs(toFloat(ajuste['VRDEBITO'])),
          credito: toFloat(ajuste['VRCREDITO']),
          saldo: saldoAtual,
          situacao: ajuste['STCANCELADO'] === 'False' ? 'Ativo' : 'Cancelado',
          opcao: '',
          className: 'table-secondary'
        });
      });
    });

    return dadosProcessados;
  };


  const rowClassName = (rowData) => {
    if (rowData.tipo === 'espaco') {
      return <span>&nbsp;</span>;
    }
    return rowData.className || '';
  };

  const colunasEstoqueAtual = [
    {
      field: 'dtLancamento',
      header: 'Dt. Lançamento',
      body: row => {
        if (row.tipo === 'espaco') {
          return <th style={{}}>&nbsp;</th>;
        }
        return <th style={{}}>{row.dtLancamento}</th>;
      },
      sortable: true
    },
    {
      field: 'historico',
      header: 'Histórico',
      body: row => {
        if (row.tipo === 'espaco') {
          return <th style={{}}>&nbsp;</th>;
        }
        return <th style={{}}>{row.historico}</th>;
      },
      sortable: true
    },
    {
      field: 'pagoA',
      header: 'Pago A',
      body: row => {
        if (row.tipo === 'espaco') {
          return <th style={{}}>&nbsp;</th>;
        }
        return <th style={{}}>{row.pagoA}</th>;
      },
      sortable: true
    },
    {
      field: 'despesa',
      header: 'Despesa',
      body: row => {
        if (row.tipo === 'espaco') {
          return <th style={{}}>&nbsp;</th>;
        }
        return <th style={{}}>{row.despesa}</th>;
      },
      sortable: true
    },
    {
      field: 'debito',
      header: 'Débito',
      body: row => {
        if (row.tipo === 'espaco') {
          return <th style={{}}>&nbsp;</th>;
        }
        return <th style={{}}>{formatMoeda(row.debito)}</th>;
      },
      sortable: true,
      style: { textAlign: 'right' }
    },
    {
      field: 'credito',
      header: 'Crédito',
      body: row => {
        if (row.tipo === 'espaco') {
          return <th style={{}}>&nbsp;</th>;
        }
        return <th style={{}}>{formatMoeda(row.credito)}</th>;
      },
      sortable: true,
      style: { textAlign: 'right' }
    },
    {
      field: 'saldo',
      header: 'Saldo',
      body: row => {
        if (row.tipo === 'espaco') {
          return <th style={{}}>&nbsp;</th>;
        }
        return <th style={{}}>{formatMoeda(row.saldo)}</th>;
      },
      sortable: true,
      style: { textAlign: 'right' }
    },
    {
      field: 'situacao',
      header: 'Situação',
      body: row => {
        if (row.tipo === 'espaco') {
          return <th style={{}}>&nbsp;</th>;
        }
        return <th style={{ color: row.situacao === 'Conferido' ? 'blue' : 'red' }}>{row.situacao}</th>;
      },
      sortable: true,
      style: { textAlign: 'center' }
    },
    {
      field: 'Opções',
      header: 'Opções',
      body: row => {
        if (row.STCANCELADO === "False" && (row.STCONFERIDO === "False" || row.STCONFERIDO === null || row.STCONFERIDO === "")
        ) {
          return (
            <div style={{ display: 'flex', justifyContent: 'center', width: "150px" }}>
              <div style={{ padding: '10px' }}>

                <ButtonTable
                  titleButton={"Confirmar Conferência"}
                  cor={"success"}
                  Icon={FaCheck}
                  IconSize={20}
                  onClickButton={() => handleSubmit(row.IDDEPOSITOLOJA)}
                  width="30px"
                  height="30px"
                />
              </div>
              <div style={{ padding: '10px' }}>

                <ButtonTable
                  titleButton={"Cancelar Depósito"}
                  cor={"danger"}
                  Icon={BsTrash3}
                  IconSize={20}
                  onClickButton={() => handleCancelar(row.IDDEPOSITOLOJA)}
                  width="30px"
                  height="30px"
                />
              </div>

              <div style={{ padding: '10px' }}>

                <ButtonTable
                  titleButton={"Editar Depósito"}
                  cor={"warning"}
                  Icon={CiEdit}
                  IconSize={20}
                  onClickButton={() => handleClickEdit(row)}
                  width="30px"
                  height="30px"
                />
              </div>
            </div>
          );
        } else if (row.STCANCELADO === "False" && row.STCONFERIDO === "True") {
          return <td></td>;
        } else if (row.STCANCELADO === "True" && (row.STCONFERIDO === "False" || row.STCONFERIDO === null || row.STCONFERIDO === "")) {
          return (
            <ButtonTable
              titleButton={"Confirmar Conferência"}
              cor={"success"}
              Icon={FaCheck}
              IconSize={20}
              onClickButton={() => handleSubmit(row.IDDEPOSITOLOJA)}
              width="30px"
              height="30px"
            />
          );
        } else if (row.STCANCELADO === "True" && row.STCONFERIDO === "True") {
          return <td></td>;
        }
      },
      sortable: true
    },
  ]

  const handleEdit = async (IDDEPOSITOLOJA) => {
    try {
      const response = await get(`/deposito-loja?idDeposito=${IDDEPOSITOLOJA}`);
      if (response.data && response.data.length > 0) {
        setDadosDeposito(response.data);
        setModalEditar(true);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Detalhes do depósito não encontrados.',
          customClass: {
            container: 'custom-swal',
          },
          showConfirmButton: false,
          timer: 3000,
        });

        return;
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da venda: ', error);
    }
  };


  const handleClickEdit = (row) => {
    if (optionsModulos[0]?.ALTERAR == 'True') {

      if (row && row.IDDEPOSITOLOJA) {
        handleEdit(row.IDDEPOSITOLOJA);
      }
    } else {
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: `Você não tem permissão para alterar!`,
        customClass: {
          container: 'custom-swal',
        },
        showConfirmButton: false,
        timer: 3000,
      });
    }

  };

  return (
    <Fragment>

      <div className="panel">
        <div className="panel-hdr">
          <h2>Extrato de Conta Corrente</h2>
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
            value={processarDadosExtrato()}
            size="small"
            showGridlines
            stripedRows
            rowClassName={rowClassName}
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
            globalFilter={globalFilterValue}
            header={
              <table className="table table-bordered  table-responsive-lg table-striped w-100">

                <thead style={{ width: '100%' }}>
                  <tr>
                    <th>Informativo</th>
                  </tr>

                  <div style={{ display: 'flex', marginBottom: '20px' }}>

                    <ButtonType
                      type="button"
                      className="btn btn-success"
                      title="Extrato Loja"
                      onClickButtonType={() => setModalCadastro(true)}
                      textButton="Cadastrar Depósitos"
                      Icon={MdAdd}
                      iconSize={18}
                      style={{ marginRight: '10px' }}
                    />
                    <ButtonType
                      type="button"
                      className="btn btn-danger"
                      title="Extrato Loja"
                      onClickButtonType={() => setModalAjuste(true)}
                      textButton="Ajustar Extrato"
                      Icon={CiEdit}
                      iconSize={18}
                    />


                    <ButtonType
                      type="button"
                      className="btn btn-success "
                      title="Extrato Loja"
                      onClick={() => { }}
                      textButton="Bloquear Data Depósito"
                      Icon={FaLockOpen}
                      iconSize={18}
                    />

                  </div>
                  <tr>
                    <td colspan="9"><b >Extrato a partir do dia 11 de dezembro de 2020</b ></td>
                  </tr>
                </thead>
                <tbody>
                  <tr class="table-primary" style={{ width: '100%' }}>
                    <td colspan="4" style={{ textAlign: "right", fontSize: "12px" }}><b>Saldo Anterior</b></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td style={{ textAlign: "right", fontSize: "12px" }}><b> {`${formatMoeda(saldoAnterior)}`}</b></td>
                    <td colSpan={2}></td>
                  </tr>

                  <tr>
                    <td colspan="9"></td>
                  </tr>

                  <tr>
                    <td colspan="9"></td>
                  </tr>
                </tbody>
              </table>
            }
          >
            {colunasEstoqueAtual.map((coluna, index) => (
              <Column
                key={coluna.field}
                field={coluna.field}
                header={coluna.header}
                body={coluna.body}
                footer={coluna.footer}
                sortable={coluna.sortable}
                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '1rem' }}
                footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}
                bodyStyle={{ fontSize: '1rem', fontWeight: 900 }}
              />
            ))}
          </DataTable>
        </div>
      </div>

      <ModalEditarDepositoDaLoja
        show={modalEditar}
        handleClose={() => setModalEditar(false)}
        optionsModulos={optionsModulos}
        usuarioLogado={usuarioLogado}
        dadosDeposito={dadosDeposito}
        handleClick={handleClick}
      />

      <ModalCadastroDeDepositoDaLoja
          show={modalCadastro}
          handleClose={() => setModalCadastro(false)}
          optionsModulos={optionsModulos}
          usuarioLogado={usuarioLogado}
          empresaSelecionada={empresaSelecionada}
          handleClick={handleClick}
        />
  
        <ModalAjusteExtratoModal
          show={modalAjuste}
          handleClose={() => setModalAjuste(false)}
          optionsModulos={optionsModulos}
          usuarioLogado={usuarioLogado}
          empresaSelecionada={empresaSelecionada}
          handleClick={handleClick}
        />
    </Fragment>

  );
};