import React, { Fragment, useRef, useState } from 'react';
import { ListaPendencias } from './actionListaPendencias';
import Select from 'react-select';
import { useFetchData } from '../../../../hooks/useFetchData';
import { useReactToPrint } from "react-to-print";
import { FooterModal } from '../../../Modais/FooterModal/footerModal';
import { ButtonTypeModal } from '../../../Buttons/ButtonTypeModal';
import './styles.css'

export const FormularioDetalheMalote = ({ dadosDetalhesMalote, dadosPendenciasMalotes, handleClose }) => {
  const [historicoSelecionado, setHistoricoSelecionado] = useState('');
  const [imprimir, setImprimir] = useState(false);
  const { data: optionsHistoricos = [] } = useFetchData('historicos-malotes', '/historicos-malotes');
  const dataTableRef = useRef();
  
  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Detalhes do Malote',
  });

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


  const showConferencia = STATUSMALOTE == 'Conferido' || STATUSMALOTE == 'Enviado';
  const showDevolucao = !!DATAHORADEVOLVIDO;
  const showReenviado = !!DATAHORAREENVIADO;
  const showPendencias = PENDENCIAS?.length > 0 || STATUSMALOTE == 'Devolvido' || STATUSMALOTE !== 'Conferido';
  const isReadOnly = STATUSMALOTE !== 'Devolvido';
  
  const enviarDadosMalote = (idMalote) => {

 
  };

  const defaultOption = {
    value: IDMALOTE,
    label: `ATUAL - ${STATUSMALOTE}`,
  };

  const selectOptions = [
    defaultOption,
    ...optionsHistoricos.map(item => ({
      value: item.IDHISTORICOMALOTE,
      label: `${item.DATAHOTAALTERACAO} - ${item.STATUSMALOTE}`
    }))
  ];

  
  return (
    <Fragment>
      <div>

        <div style={{ width: '30%' }}>
          <label htmlFor="" style={{ fontWeight: 900, fontSize: '16px', }}>Histórico:</label>
          <Select
            options={selectOptions}
            value={selectOptions.find(opt => opt.value === historicoSelecionado) || defaultOption}
            onChange={(e) => setHistoricoSelecionado(e.value)}
          />

        </div>

        <div className="modal-detalhes-malote" style={{ marginTop: '20px' }}>
          <header ref={dataTableRef} style={{fontSize: '16px', fontWeight: 900,}}>
            <div className="header-print">
                <h1 className="title-print m-5" htmlFor="statusMalote">
                    Detalhes do Malote 
                </h1>
            </div>
            <p style={{margin: '0px', fontSize: '16px', fontWeight: 900, color: '#505050'}} className="text-p fw-900">Empresa: <span className='span-print' style={{fontWeight: 500,}}>{NOFANTASIA}</span></p>
            <p style={{margin: '0px', fontSize: '16px', fontWeight: 900,}} className="text-p">Data Movimento Caixa: <span className='span-print' style={{fontWeight: 500,}}>{DATAMOVIMENTOCAIXA}</span></p>
            <p style={{margin: '0px', fontSize: '16px', fontWeight: 900,}} className="text-p">Id. Malote: <span className='span-print' style={{fontWeight: 500,}}>{IDMALOTE}</span></p>
            <p style={{margin: '0px', fontSize: '16px', fontWeight: 900,}} className="text-p">Usuário Criação: <span className='span-print' style={{fontWeight: 500,}}>{NOFUNCIONARIOCRIACAO}</span></p>
            <p style={{margin: '0px', fontSize: '16px', fontWeight: 900,}} className="text-p">Data Criação: <span className='span-print' style={{fontWeight: 500,}}>{DATAHORACRIACAO}</span></p>
            <p style={{margin: '0px', fontSize: '16px', fontWeight: 900,}} className="text-p">Usuário Envio: <span className='span-print' style={{fontWeight: 500,}}>{NOFUNCIONARIOENVIO || ''}</span></p>
            <p style={{margin: '0px', fontSize: '16px', fontWeight: 900,}} className="text-p">Data Envio: <span className='span-print' style={{fontWeight: 500,}}>{DATAHORAENVIADO || ''}</span></p>
            <p style={{margin: '0px', fontSize: '16px', fontWeight: 900,}} className="text-p">Usuário Recepção: <span className='span-print' style={{fontWeight: 500,}}>{NOFUNCIONARIORECEPCAO || ''}</span></p>
            <p style={{margin: '0px', fontSize: '16px', fontWeight: 900,}} className="text-p">Data Recepção: <span className='span-print' style={{fontWeight: 500,}}>{DATAHORARECEBIDO || ''}</span></p>
            {showConferencia && (
              <>
                <p style={{margin: '0px', fontSize: '16px', fontWeight: 900,}} className="text-p">Usuário Conferência: <span className="span-print" style={{fontWeight: 500,}}>{NOFUNCIONARIOCONFERENCIA || ''}</span></p>
                <p style={{margin: '0px', fontSize: '16px', fontWeight: 900,}} className="text-p">Data Conferência: <span className="span-print" style={{fontWeight: 500,}}>{DATAHORACONFERIDO || ''}</span></p>
              </>
            )}

            {showDevolucao && (
              <>
                <p style={{margin: '0px', fontSize: '16px', fontWeight: 900,}} className="text-p">Usuário Devolução: <span className="span-print" style={{fontWeight: 500,}}>{NOFUNCIONARIODEVOLUCAO || ''}</span></p>
                <p style={{margin: '0px', fontSize: '16px', fontWeight: 900,}} className="text-p">Data Devolução: <span className="span-print" style={{fontWeight: 500,}}>{DATAHORADEVOLVIDO || ''}</span></p>
              </>
            )}

            {showReenviado && (
              <>
                <p style={{margin: '0px', fontSize: '16px', fontWeight: 900,}} className="text-p">Usuário Reenvio: <span className="span-print" style={{fontWeight: 500,}}>{NOFUNCIONARIOREENVIO || ''}</span></p>
                <p style={{margin: '0px', fontSize: '16px', fontWeight: 900,}} className="text-p">Data Reenvio: <span className="span-print" style={{fontWeight: 500,}}>{DATAHORAREENVIADO || ''}</span></p>
              </>
            )}

            <p style={{margin: '0px', fontSize: '16px', fontWeight: 900,}} className="text-p">
              Status: <span className={`${classStatus} span-print fw-500`}>{msgStatus}</span>
            </p>          

            <div>
              <p className="imprimir-somente" htmlFor="statusMalote">
                Pendências: 
                <span className="span-print" style={{fontWeight: 500,}}> Não Há Pendências</span>
              </p>
            
            </div>
            <div>
              <p className="imprimir-somente" htmlFor="statusMalote">
                Observações Financeiro:  
                <span className="span-print" style={{fontWeight: 500,}}>   Não há Observações</span>
              </p>
            
            </div>
            
          </header>


          <div>

            {showPendencias && dadosPendenciasMalotes?.length > 0 && (
              <ListaPendencias dadosPendenciasMalotes={dadosPendenciasMalotes} />
            )}
          </div>

        

          <div className="mt-3">
            <label className="text-dark fw-900 h6" htmlFor="observacaoLojaMalote">
              Observações Loja:
            </label>
            <textarea
              id="observacaoLojaMalote"
              className="form-control text-uppercase fw-700"
              style={{ resize: 'none' }}
              rows={OBSERVACAOLOJA?.length > 0 ? 5 : 1}
              value={OBSERVACAOLOJA || ''}
              readOnly={isReadOnly}
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

          {STATUSMALOTE === 'Devolvido' && (
            <button
              id="btnReenviarMalote"
              className="btn btn-primary mt-3"
              onClick={() => enviarDadosMalote(IDMALOTE)}
            >
              Reenviar Malote
            </button>
          )}
        </div>
      </div>

      <FooterModal
        ButtonTypeCadastrar={ButtonTypeModal}
        textButtonCadastrar={"Imprimir"}
        onClickButtonCadastrar={handlePrint}
        corCadastrar="primary"

        ButtonTypeFechar={ButtonTypeModal}
        textButtonFechar={"Fechar"}
        onClickButtonFechar={handleClose}
        corFechar="secondary"
      />
    </Fragment>
  );
};