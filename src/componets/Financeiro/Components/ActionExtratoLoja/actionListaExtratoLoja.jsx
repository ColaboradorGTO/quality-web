
import { Fragment, useEffect, useState } from "react";;
import { Accordion } from "react-bootstrap";
import { toFloat } from "../../../../utils/toFloat";
import { formatMoeda } from "../../../../utils/formatMoeda";
import { FaCheck, FaLockOpen } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import { MdAdd } from "react-icons/md";
import { ButtonType } from "../../../Buttons/ButtonType";
import { ModalCadastroDeDepositoDaLoja } from "./ActionCadastroDeposito/modalCadastroDeDepositoDaLoja";
import { ModalAjusteExtratoModal } from "./ActionCadastroAjuste/actionCadastroAjusteExtratoModal";
import { BsTrash3 } from "react-icons/bs";
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";

export const ActionListaExtratoLoja = ({
  dadosExtratoLojaPeriodo,
  optionsModulos,
  usuarioLogado,
  empresaSelecionada,
}) => {

  const [modalCadastro, setModalCadastro] = useState(false)
  const [modalAjuste, setModalAjuste] = useState(false)
  const [saldoAnterior, setSaldoAnterior] = useState(0);
  const [saldoAtual, setSaldoAtual] = useState(0); 

  useEffect(() => {
    if (dadosExtratoLojaPeriodo.length > 0) {
      const venda = toFloat(dadosExtratoLojaPeriodo[0]?.primeiraVendaSaldo.SALDO);
      const totalQuebra = toFloat(dadosExtratoLojaPeriodo[0]?.primeiraVendaSaldo.TOTALQUEBRA);
      const saldoInicial = venda + totalQuebra;
      setSaldoAnterior(saldoInicial);
      setSaldoAtual(saldoInicial); 
    }
  }, [dadosExtratoLojaPeriodo]);

  const renderButtons = (item) => {
  if (
    item.STCANCELADO === "False" &&
    (item.STCONFERIDO === "False" ||
      item.STCONFERIDO === null ||
      item.STCONFERIDO === "")
  ) {
    return (
      <Fragment>
        <ButtonTable
          titleButton={"Confirmar Conferência"}
          cor={"success"}
          Icon={FaCheck}
          IconSize={20}
          onClickButton={() => console.log("Confirmar Conferência")}
        />
        <ButtonTable
          titleButton={"Cancelar Depósito"}
          cor={"danger"}
          Icon={BsTrash3}
          IconSize={20}
          onClickButton={() => console.log("Cancelar Depósito")}
        />
        <ButtonTable
          titleButton={"Editar Depósito"}
          cor={"warning"}
          Icon={CiEdit}
          IconSize={20}
          onClickButton={() => console.log("Editar Depósito")}
        />
      </Fragment>
    );
  } else if (item.STCANCELADO === "False" && item.STCONFERIDO === "True") {
    return <td></td>;
  } else if (
    item.STCANCELADO === "True" &&
    (item.STCONFERIDO === "False" ||
      item.STCONFERIDO === null ||
      item.STCONFERIDO === "")
  ) {
    return (
      <ButtonTable
        titleButton={"Confirmar Conferência"}
        cor={"success"}
        Icon={FaCheck}
        IconSize={20}
        onClickButton={() => console.log("Confirmar Conferência")}
      />
    );
  } else if (item.STCANCELADO === "True" && item.STCONFERIDO === "True") {
    return <td></td>;
  }
  };

  const renderizarLinhasExtrato = () => {
    let saldoCalculado = saldoAnterior; // Usa variável local para cálculos
    const linhasTotais = [];

    dadosExtratoLojaPeriodo.forEach((ret, i) => {
      const linhas = [];

      // Espaçamento entre objetos (igual ao jQuery)
      if (i > 0) {
        linhas.push(
          <tr key={`espaco-${i}-1`}>
            <td colSpan="9"></td>
          </tr>,
          <tr key={`espaco-${i}-2`}>
            <td colSpan="9"></td>
          </tr>
        );
      }

      // Venda (igual ao jQuery)
      const valorVenda = toFloat(ret.venda?.VRRECDINHEIRO || 0);
      saldoCalculado += valorVenda;
      linhas.push(
        <tr className="table-success" key={`venda-${i}`}>
          <td style={{ fontSize: '12px' }}>{ret.venda?.DTHORAFECHAMENTOFORMATADA}</td>
          <td style={{ fontSize: '12px' }}>Mov. Dinheiro do Caixa {ret.venda?.DTHORAFECHAMENTOFORMATADA}</td>
          <td style={{ fontSize: '12px' }}>Vendas Dinheiro</td>
          <td></td>
          <td style={{ textAlign: 'right', fontSize: '12px' }}><b>0,00</b></td>
          <td style={{ textAlign: 'right', fontSize: '12px' }}><b>{formatMoeda(valorVenda)}</b></td>
          <td style={{ textAlign: 'right', fontSize: '12px' }}><b>{formatMoeda(saldoCalculado)}</b></td>
          <td style={{ textAlign: 'right', fontSize: '12px' }}></td>
          <td style={{ textAlign: 'right', fontSize: '12px' }}></td>
        </tr>
      );

      // Faturas (igual ao jQuery)
      if (ret.totalFaturas?.length > 0) {
        const valorFatura = toFloat(ret.totalFaturas[0]?.VRRECEBIDO || 0);
        saldoCalculado += valorFatura;
        linhas.push(
          <tr className="table-success" key={`fatura-${i}`}>
            <td style={{ fontSize: '12px' }}>{ret.totalFaturas[0]?.DTPROCESSAMENTOFORMATADA}</td>
            <td style={{ fontSize: '12px' }}>Mov. Fatura {ret.totalFaturas[0]?.DTPROCESSAMENTOFORMATADA}</td>
            <td style={{ fontSize: '12px' }}>Recebimento de Faturas</td>
            <td></td>
            <td style={{ textAlign: 'right', fontSize: '12px' }}><b>0,00</b></td>
            <td style={{ textAlign: 'right', fontSize: '12px' }}><b>{formatMoeda(valorFatura)}</b></td>
            <td style={{ textAlign: 'right', fontSize: '12px' }}><b>{formatMoeda(saldoCalculado)}</b></td>
            <td style={{ textAlign: 'right', fontSize: '12px' }}></td>
            <td style={{ textAlign: 'right', fontSize: '12px' }}></td>
          </tr>
        );
      }

      // Despesas (igual ao jQuery)
      ret.despesas?.forEach((despesa, j) => {
        const valorDespesa = toFloat(despesa.VRDESPESA || 0);
        saldoCalculado -= valorDespesa;
        linhas.push(
          <tr className="table-danger" key={`despesa-${i}-${j}`}>
            <td style={{ fontSize: '12px' }}>{despesa.DTDESPESAFORMATADA}</td>
            <td style={{ fontSize: '12px' }}>{despesa.DSHISTORIO}</td>
            <td style={{ fontSize: '12px' }}>{despesa.DSPAGOA}</td>
            <td style={{ textAlign: 'center', fontSize: '12px' }}>{despesa.DSCATEGORIA}</td>
            <td style={{ textAlign: 'right', fontSize: '12px' }} className="txt-color-red">
              <b>{formatMoeda(valorDespesa)}</b>
            </td>
            <td style={{ textAlign: 'right', fontSize: '12px' }}><b>0,00</b></td>
            <td style={{ textAlign: 'right', fontSize: '12px' }}><b>{formatMoeda(saldoCalculado)}</b></td>
            <td style={{ textAlign: 'right', fontSize: '12px' }}></td>
            <td style={{ textAlign: 'right', fontSize: '12px' }}></td>
          </tr>
        );
      });

      // Adiantamentos (igual ao jQuery)
      ret.adiantamentos?.forEach((adiantamento, j) => {
        const valorAdiantamento = toFloat(adiantamento.VRVALORDESCONTO || 0);
        saldoCalculado -= valorAdiantamento;
        linhas.push(
          <tr className="table-danger" key={`adiantamento-${i}-${j}`}>
            <td style={{ fontSize: '12px' }}>{adiantamento.DTLANCAMENTOADIANTAMENTO}</td>
            <td style={{ fontSize: '12px' }}>Adiantamento de Salário</td>
            <td style={{ fontSize: '12px' }}>{adiantamento.NOFUNCIONARIO}</td>
            <td style={{ textAlign: 'center', fontSize: '12px' }}>{adiantamento.DSMOTIVO}</td>
            <td style={{ textAlign: 'right', fontSize: '12px' }} className="txt-color-red">
              <b>{formatMoeda(valorAdiantamento)}</b>
            </td>
            <td style={{ textAlign: 'right', fontSize: '12px' }}><b>0,00</b></td>
            <td style={{ textAlign: 'right', fontSize: '12px' }}><b>{formatMoeda(saldoCalculado)}</b></td>
            <td style={{ textAlign: 'right', fontSize: '12px' }}></td>
            <td style={{ textAlign: 'right', fontSize: '12px' }}></td>
          </tr>
        );
      });

      // Quebra de Caixa (cálculo idêntico ao jQuery)
      ret.quebracaixa?.forEach((quebra, j) => {
        const totalDinheiroInformado = toFloat(quebra.VRAJUSTDINHEIRO) > 0
          ? toFloat(quebra.VRAJUSTDINHEIRO)
          : toFloat(quebra.VRRECDINHEIRO);
        const totalQuebraCaixa = totalDinheiroInformado - toFloat(quebra.VRFISICODINHEIRO);
        saldoCalculado += totalQuebraCaixa;

        linhas.push(
          <tr className="table-primary" key={`quebra-${i}-${j}`}>
            <td style={{ fontSize: '12px' }}>{quebra.DTMOVCAIXA}</td>
            <td style={{ fontSize: '12px' }}>Quebra Caixa Mov.: {quebra.IDMOV}</td>
            <td colSpan="2" style={{ fontSize: '12px' }}>Operador: {quebra.FUNCIONARIOMOV}</td>
            <td style={{ textAlign: 'right', fontSize: '12px' }} className="txt-color-blue">
              <b>{totalQuebraCaixa > 0 ? '0,00' : formatMoeda(Math.abs(totalQuebraCaixa))}</b>
            </td>
            <td style={{ textAlign: 'right', fontSize: '12px' }} className="txt-color-blue">
              <b>{totalQuebraCaixa > 0 ? formatMoeda(totalQuebraCaixa) : '0,00'}</b>
            </td>
            <td style={{ textAlign: 'right', fontSize: '12px' }} className="txt-color-blue">
              <b>{formatMoeda(saldoCalculado)}</b>
            </td>
            <td style={{ textAlign: 'right', fontSize: '12px' }}></td>
            <td style={{ textAlign: 'right', fontSize: '12px' }}></td>
          </tr>
        );
      });

      // Depósitos (cálculo idêntico ao jQuery)
      ret.totalDepositos?.forEach((deposito, j) => {
        const valorDeposito = toFloat(deposito.VRDEPOSITO || 0);
        saldoCalculado -= valorDeposito;

        let tagDepositoConferidoBotao = (
          <td style={{ textAlign: 'center', fontSize: '12px' }}>
            <label style={{ color: deposito.STCONFERIDO === 'False' || !deposito.STCONFERIDO ? 'red' : 'blue' }}>
              {deposito.STCONFERIDO === 'False' || !deposito.STCONFERIDO ? 'Sem Conferir' : 'Conferido'}
            </label>
          </td>
        );

        let tagDepositoAtivoBotao = <td></td>;

        if (deposito.STCANCELADO === 'False' && 
            (deposito.STCONFERIDO === 'False' || !deposito.STCONFERIDO)) {
          tagDepositoAtivoBotao = (
            <td>
                {renderButtons(deposito)}
            </td>
          );
        }

        linhas.push(
          <tr className="table-warning" key={`deposito-${i}-${j}`}>
            <td style={{ fontSize: '12px' }}><b>{deposito.DTDEPOSITOFORMATADA}</b></td>
            <td style={{ fontSize: '12px' }}><b>{deposito.FUNCIONARIO} Dep. Dinh {deposito.DTDEPOSITOFORMATADA}</b></td>
            <td colSpan="2" style={{ fontSize: '12px' }}><b>{deposito.DSBANCO} - {deposito.NUDOCDEPOSITO}</b></td>
            <td style={{ textAlign: 'right', fontSize: '12px' }} className="txt-color-red">
              <b>{formatMoeda(valorDeposito)}</b>
            </td>
            <td style={{ textAlign: 'right', fontSize: '12px' }}><b>0,00</b></td>
            <td style={{ textAlign: 'right', fontSize: '12px' }} className="txt-color-red">
              <b>{formatMoeda(saldoCalculado)}</b>
            </td>
            {tagDepositoConferidoBotao}
            {tagDepositoAtivoBotao}
          </tr>
        );
      });

      // Ajustes de Extrato (cálculo idêntico ao jQuery)
      ret.ajusteextrato?.forEach((ajuste, j) => {
        const valorDebito = toFloat(ajuste.VRDEBITO || 0);
        const valorCredito = toFloat(ajuste.VRCREDITO || 0);

        if (ajuste.STCANCELADO === 'False') {
          if (valorCredito > 0) {
            saldoCalculado -= valorCredito;
          } else {
            saldoCalculado += valorDebito;
          }
        }

        let tagAjusteSituacaoBotao = (
          <td style={{ textAlign: 'center', fontSize: '12px' }}>
            <label style={{ color: ajuste.STCANCELADO === 'False' ? 'blue' : 'red' }}>
              {ajuste.STCANCELADO === 'False' ? 'Ativo' : 'Cancelado'}
            </label>
          </td>
        );

        let tagAjusteAtivoBotao = <td></td>;

        if (ajuste.STCANCELADO === 'False') {
          tagAjusteAtivoBotao = (
            <td style={{ textAlign: 'center', fontSize: '12px' }}>
              {/* Botão de cancelar ajuste */}
            </td>
          );
        }

        linhas.push(
          <tr className="table-secondary" key={`ajuste-${i}-${j}`}>
            <td style={{ fontSize: '12px' }}><b>{ajuste.DTCADASTROFORMATADA}</b></td>
            <td style={{ fontSize: '12px' }}><b>{ajuste.HISTORICO}</b></td>
            <td colSpan="2" style={{ fontSize: '12px' }}><b>Ajuste de Extrato</b></td>
            <td style={{ textAlign: 'right', fontSize: '12px' }} className="txt-color-red">
              <b>{formatMoeda(valorDebito)}</b>
            </td>
            <td style={{ textAlign: 'right', fontSize: '12px' }} className="txt-color-red">
              <b>{formatMoeda(valorCredito)}</b>
            </td>
            <td style={{ textAlign: 'right', fontSize: '12px' }} className="txt-color-red">
              <b>{formatMoeda(saldoCalculado)}</b>
            </td>
            {tagAjusteSituacaoBotao}
            {tagAjusteAtivoBotao}
          </tr>
        );
      });

      linhasTotais.push(...linhas);
    });

    // Atualiza o estado com o saldo final
    if (saldoCalculado !== saldoAtual) {
      setSaldoAtual(saldoCalculado);
    }

    return linhasTotais;
  };


  return (
    <Fragment>
      <div className="row">
        <Accordion defaultActiveKey="0" className="col-xl-12">
          <Accordion.Item eventKey="0" id="panel-1" className="panel">
            <header>
              <div style={{ padding: "10px" }}>

                <h1 style={{ textAlign: 'center', color: '#7a59ad' }}>INFORMATIVO</h1>
              </div>

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
            </header>
            <div className="panel-hdr">
              <h2>Lista de Extrato do Dia</h2>
            </div>

            <table id="dt-buttons-saldoconta" class="table table-bordered table-responsive-lg table-striped w-100" width="100%">
              <thead>

                <tr>
                </tr>
                <tr>
                  <td colSpan="5"><b>Saldos a partir do dia 11 de dezembro de 2020</b></td>
                </tr>

              </thead>
              <tbody>

                <tr class="table-primary">
                  <td colspan="4" style={{ textAlign: "right", fontSize: "12px" }}><b>Saldo Anterior</b></td>
                  
                  <td style={{ textAlign: "right", fontSize: "12px" }}><b> {formatMoeda(saldoAnterior)}</b></td>
                  {/* <td style={{ textAlign: "right", fontSize: "12px" }}><b> {`${formatMoeda(dados[0]?.saldoAnterior2)}`}</b></td> */}
                </tr>

                <tr>
                  <td colspan="5"></td>
                </tr>

                <tr>
                  <td colspan="5"></td>
                </tr>
              </tbody>
            </table>
            <Accordion.Body className="panel-container show">


              <Fragment>
                <table className="table table-bordered table-responsive-lg table-striped w-100">
                <tbody className="bg-primary-700 w-100">
                  <tr>
                    <th>Dt. Lançamento</th>
                    <th>Histórico</th>
                    <th>Pago A</th>
                    <th>Despesa</th>
                    <th>Débito</th>
                    <th>Crédito</th>
                    <th>Saldo</th>
                    <th>Situação</th>
                    <th>Opção</th>
                  </tr>
                </tbody>
                  <tbody>
                    
                  {renderizarLinhasExtrato()}
                  </tbody>
                </table>
              </Fragment>            
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>
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
      />
    </Fragment>
  );
};