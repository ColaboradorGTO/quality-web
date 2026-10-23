import { Fragment } from "react";
import Modal from 'react-bootstrap/Modal';
import { ButtonTypeModal } from "../../../Buttons/ButtonTypeModal";
import { FooterModal } from "../../../Modais/FooterModal/footerModal";
import { HeaderModal } from "../../../Modais/HeaderModal/HeaderModal";
import { toFloat } from "../../../../utils/toFloat";


export const ActionObservacaoOT = ({ show, handleClose, dadosObservacaoOT }) => {

  const dados = dadosObservacaoOT.map((item) => {
    let Mensagem = '';

    if (item.ERRORLOGSAP !== '') {
      Mensagem = item.ERRORLOGSAP;
    } else if (item.ERRORLOGSAP === '' && item.IDSTATUSOT === 1) {
      Mensagem = 'Aguardando a Empresa Origem Finalizar a OT!';
    } else if (item.ERRORLOGSAP === '' && item.IDSTATUSOT === 2) {
      Mensagem = 'OT Cancelada!';
    } else if (item.ERRORLOGSAP === '' && item.IDSTATUSOT === 3) {
      Mensagem = 'Aguardando Faturamento e Emissão da Nota Fiscal!';
    } else if (item.ERRORLOGSAP === '' && item.IDSTATUSOT === 4) {
      Mensagem = 'OT Finalizada com Sucesso!';
    } else if (item.ERRORLOGSAP === '' && item.IDSTATUSOT === 5) {
      Mensagem = 'OT Aberta com Divergência!';
    } else if (item.ERRORLOGSAP === '' && item.IDSTATUSOT === 6) {
      Mensagem = 'OT em Análise de Divergência!';
    } else if (item.ERRORLOGSAP === '' && item.IDSTATUSOT === 7) {
      Mensagem = 'OT Finalizada com Divergência!';
    } else if (item.ERRORLOGSAP === '' && item.IDSTATUSOT === 8) {
      Mensagem = 'Emissão da Nota Fiscal Realizada, OT Aguardando Conferência!';
    } else if (item.ERRORLOGSAP === '' && item.IDSTATUSOT === 9) {
      Mensagem = 'Faturamento Realizado, Aguardando Emissão da Nota Fiscal!';
    }
    return {
      IDRESUMOOT: item.IDRESUMOOT,
      IDSAPORIGEM: item.IDSAPORIGEM,
      IDSAPDESTINO: item.IDSAPDESTINO,
      ERRORLOGSAP: item.ERRORLOGSAP,
      CHAVESEFAZ: item.CHAVESEFAZ,
      MSGSEFAZ: item.MSGSEFAZ,
      CODIGORETORNOSEFAZ: item.CODIGORETORNOSEFAZ,
      NUMERONOTASEFAZ: item.NUMERONOTASEFAZ,
      IDSTATUSOT: item.IDSTATUSOT,

      DESCRICAOOT: item.DESCRICAOOT,
      Mensagem: Mensagem
    };
  });


  return (
    <Fragment>
      <Modal
        show={show}
        onHide={handleClose}
        size="xl"
        className="modal fade"
        tabIndex={-1}
        role="dialog"
        aria-hidden="true"
      >

        <HeaderModal
          title={"Observação da Ordem de Transferência"}
          handleClose={handleClose}
        />

        <Modal.Body>
          <header>
            <h5>Ordem de Transferência Nº {toFloat(dados[0]?.IDRESUMOOT)}</h5>
          </header>
          <table class="table table-hover table-striped w-100 table-sm">
            <tr>
              <th colspan="4">DADOS DA ORDEM DE TRANSFERÊNCIA</th>
            </tr>
            <tr>
              <th width="20%">Status da OT</th>
              <td style={{ border: 'none' }} colspan="3"> {dados[0]?.DESCRICAOOT}</td>
            </tr>
            <tr>
              <th width="20%">Id SAP Origem</th>
              <td style={{ border: 'none' }} width="30%"> {dados[0]?.IDSAPORIGEM}</td>
              <th width="20%">Id SAP Destino</th>
              <td style={{ border: 'none' }} >{toFloat(dados[0]?.IDSAPDESTINO)}</td>
            </tr>
            <tr><td style={{ border: 'none' }} colspan="4"></td></tr>
            <tr>
              <th colspan="4">DADOS DA NOTA FISCAL</th>
            </tr>
            <tr>
              <th width="20%">Número da NF-e</th>
              <td style={{ border: 'none' }} width="30%">{dados[0]?.NUMERONOTASEFAZ}</td>
              <th width="20%">Status da NF-e</th>
              <td style={{ border: 'none' }} >{toFloat(dados[0]?.CODIGORETORNOSEFAZ)}</td>
            </tr>
            <tr>
              <th width="20%">Chave da NF-e</th>
              <td style={{ border: 'none' }} colspan="3">{dados[0]?.CHAVESEFAZ}</td>
            </tr>
            <tr>
              <th style={{ border: 'none' }} width="20%">Motivo da NF-e</th>
              <td style={{ border: 'none' }} colspan="3">{dados[0]?.MSGSEFAZ}</td>
            </tr>



            <tr style={{ border: 'none' }}>
              <th style={{ border: 'none' }} width="20%">Status SAP</th>
              <th style={{ border: 'none' }} colspan="4">{dados[0]?.Mensagem}</th>
            </tr>
          </table>


        </Modal.Body>

        <FooterModal
          ButtonTypeConfirmar={ButtonTypeModal}
          textButtonConfirmar={"Fechar"}
          onClickButtonConfirmar={handleClose}
          corConfirmar={"secondary"}
        />

      </Modal >
    </Fragment >
  );
};
