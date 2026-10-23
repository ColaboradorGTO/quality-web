import React, { useState } from 'react';
import { ListaPendencias } from './actionListaPendencias';
import { FooterModal } from '../../../../Modais/FooterModal/footerModal';
import { ButtonTypeModal } from '../../../../Buttons/ButtonTypeModal';
import { useEnviarMalote } from '../hooks/useEnviarMalote';

export const FormularioDetalheMalote = ({
  optionsModulos,
  usuarioLogado,
  dadosDetalhesMalote,
  dadosPendenciasMalotes,
  salvarDadosMalotes,
  handleClick,
  handleClose
}) => {

  const {
    observacaoLoja,
    setObservacaoLoja,
    reenviarMalote

  } = useEnviarMalote({
    salvarDadosMalotes,
    dadosDetalhesMalote,
    optionsModulos,
    usuarioLogado,
    handleClose,
    handleClick
  })

  const {
    NOFANTASIA,
    IDMALOTE,
    DATAMOVIMENTOCAIXA,
    NOFUNCIONARIOCRIACAO,
    DATAHORACRIACAO,
    NOFUNCIONARIOENVIO,
    DATAHORAENVIADO,
    NOFUNCIONARIOREENVIO,
    DATAHORAREENVIADO,
    NOFUNCIONARIORECEPCAO,
    DATAHORARECEBIDO,
    NOFUNCIONARIOCONFERENCIA,
    DATAHORACONFERIDO,
    NOFUNCIONARIODEVOLUCAO,
    DATAHORADEVOLVIDO,
    STATUSMALOTE,
    OBSERVACAOADMINISTRATIVO,
    OBSERVACAOLOJA,
    PENDENCIAS
  } = dadosDetalhesMalote[0] || {};


  let classStatus = 'text-danger';
  let msgStatus = STATUSMALOTE || '';


  if (STATUSMALOTE === 'Enviado' || STATUSMALOTE === 'Reenviado') {
    classStatus = 'text-info';
    msgStatus += ' e Aguardando Recebimento...';
  } else if (STATUSMALOTE === 'Recepcionado') {
    classStatus = 'text-info';
    msgStatus += ' e Aguardando Conferência...';
  } else if (STATUSMALOTE === 'Conferido') {
    classStatus = 'text-success';
  }


  const showConferencia = STATUSMALOTE === 'Conferido' || STATUSMALOTE === 'Enviado';
  const showDevolucao = !!DATAHORADEVOLVIDO;
  const showReenviado = !!DATAHORAREENVIADO;
  const showPendencias = PENDENCIAS?.length > 0 || STATUSMALOTE === 'Devolvido' || STATUSMALOTE !== 'Conferido';
  const isReadOnly = STATUSMALOTE !== 'Devolvido';

  const enviarDadosMalote = (idMalote) => {

  };

  return (
    <div className="modal-detalhes-malote">
      <h6 className="text-dark fw-900">Empresa: <span className="text-dark fw-500">{NOFANTASIA}</span></h6>
      <h6 className="text-dark fw-900">Data Movimento Caixa: <span className="text-dark fw-500">{DATAMOVIMENTOCAIXA}</span></h6>
      <h6 className="text-dark fw-900">Id. Malote: <span className="text-dark fw-500">{IDMALOTE}</span></h6>
      <h6 className="text-dark fw-900">Usuário Criação: <span className="text-dark fw-500">{NOFUNCIONARIOCRIACAO}</span></h6>
      <h6 className="text-dark fw-900">Data Criação: <span className="text-dark fw-500">{DATAHORACRIACAO}</span></h6>
      <h6 className="text-dark fw-900">Usuário Envio: <span className="text-dark fw-500">{NOFUNCIONARIOENVIO || ''}</span></h6>
      <h6 className="text-dark fw-900">Data Envio: <span className="text-dark fw-500">{DATAHORAENVIADO || ''}</span></h6>
      <h6 className="text-dark fw-900">Usuário Recepção: <span className="text-dark fw-500">{NOFUNCIONARIORECEPCAO || ''}</span></h6>
      <h6 className="text-dark fw-900">Data Recepção: <span className="text-dark fw-500">{DATAHORARECEBIDO || ''}</span></h6>

      {showConferencia && (
        <>
          <h6 className="text-dark fw-900">Usuário Conferência: <span className="text-dark fw-500">{NOFUNCIONARIOCONFERENCIA || ''}</span></h6>
          <h6 className="text-dark fw-900">Data Conferência: <span className="text-dark fw-500">{DATAHORACONFERIDO || ''}</span></h6>
        </>
      )}

      {showDevolucao && (
        <>
          <h6 className="text-dark fw-900">Usuário Devolução: <span className="text-dark fw-500">{NOFUNCIONARIODEVOLUCAO || ''}</span></h6>
          <h6 className="text-dark fw-900">Data Devolução: <span className="text-dark fw-500">{DATAHORADEVOLVIDO || ''}</span></h6>
        </>
      )}

      {showReenviado && (
        <>
          <h6 className="text-dark fw-900">Usuário Reenvio: <span className="text-dark fw-500">{NOFUNCIONARIOREENVIO || ''}</span></h6>
          <h6 className="text-dark fw-900">Data Reenvio: <span className="text-dark fw-500">{DATAHORAREENVIADO || ''}</span></h6>
        </>
      )}

      <h6 className="text-dark fw-900">
        Status: <span className={`${classStatus} fw-500`}>{msgStatus}</span>
      </h6>

      {showPendencias && dadosPendenciasMalotes?.length > 0 && (
        <ListaPendencias dadosPendenciasMalotes={dadosPendenciasMalotes} />
      )}


      <div className="mt-3">
        <label className="text-dark fw-900 h6" htmlFor="observacaoLojaMalote">
          Observações Loja:
        </label>
        <textarea
          id="observacaoLojaMalote"
          className="form-control text-uppercase fw-700"
          style={{ resize: 'none' }}
          rows={OBSERVACAOLOJA?.length > 0 ? 5 : 1}
          value={OBSERVACAOLOJA || observacaoLoja}
          readOnly={dadosDetalhesMalote[0]?.STATUSMALOTE !== 'Devolvido'}
          onChange={(e) => setObservacaoLoja(e.target.value)}
          placeholder="..."
        />
      </div>

      <div className="mt-3">
        <label className="text-dark fw-900 h6" htmlFor="observacaoFinanceiroMalote">
          Observações Financeiro:
        </label>
        <textarea
          id="observacaoFinanceiroMalote"
          className="form-control text-uppercase fw-700"
          style={{ resize: 'none' }}
          rows={OBSERVACAOADMINISTRATIVO?.length > 0 ? 5 : 1}
          value={OBSERVACAOADMINISTRATIVO || ''}
          readOnly
          placeholder="..."
        />
      </div>

{/*       <button
        id="btnReenviarMalote"
        className="btn btn-primary mt-3"
        style={{ display: STATUSMALOTE === 'Devolvido' ? 'block' : 'none' }}
        onClick={() => reenviarMalote()}
      >
        Reenviar Malote
      </button>
 */}
      <FooterModal
        ButtonTypeConfirmar={ButtonTypeModal}
        textButtonConfirmar={"Reenviar Malote"}
        onClickButtonConfirmar={reenviarMalote}
        corConfirmar="primary"
        styleConfirmar={{ display: STATUSMALOTE === 'Devolvido' ? 'block' : 'none' }}

        ButtonTypeFechar={ButtonTypeModal}
        textButtonFechar={"Fechar"}
        onClickButtonFechar={handleClose}
        corFechar="secondary"
        
      />
    </div>
  );
};