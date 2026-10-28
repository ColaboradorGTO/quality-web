import React, { Fragment, useRef, useState } from 'react';
import { ListaPendencias } from './actionListaPendencias';
import Select from 'react-select';
import { useReactToPrint } from "react-to-print";
import { FooterModal } from '../../../Modais/FooterModal/footerModal';
import { ButtonTypeModal } from '../../../Buttons/ButtonTypeModal';
import '../ActionDetalheMalote/styles.css';
import { useConferirMalote } from '../hooks/useConferirMalote';
import { get } from '../../../../api/funcRequest';
import { useQuery } from 'react-query';

export const FormularioConferirMalote = ({ 
  dadosConferirMalote, 
  dadosPendenciasMalotes,
  handleClose,
  handleClick, 
  optionsModulos, 
  usuarioLogado 
}) => {
  const maloteAtual = dadosConferirMalote[0] || {};
  const idMalote = maloteAtual.IDMALOTE;
  const [historicoSelecionado, setHistoricoSelecionado] = useState(`idMalote_${idMalote}`);
  const [tipoHistorico, idHistorico] = historicoSelecionado.split('_');
  const isHistorico = tipoHistorico === 'idHistorico';

  const { data: optionsHistoricos = [] } = useQuery(
    ['historicos-malotes', idMalote],
    async () => {
      const response = await get(`/historicos-malotes?idMalote=${idMalote}`);
      return response.data;
    },
    { enabled: !!idMalote, staleTime: 60 * 60 * 1000, }
  );

  const { data: dadosHistorico } = useQuery(
    ['historico-malote', idHistorico],
    async () => {
      const response = await get(`/historicos-malotes?idHistoricoMalote=${idHistorico}`);
      return response.data;
    },
    { enabled: isHistorico, staleTime: 60 * 60 * 1000, }
  );

  const [salvarDadosMalotes, setSalvarDadosMalotes] = useState([dadosConferirMalote[0]]);
  const [checkedItems, setCheckedItems] = useState(
    () => (maloteAtual.PENDENCIAS || []).map(({ IDPENDENCIA }) => IDPENDENCIA)
  );
  const dataTableRef = useRef();
  const {
    observacaoFinanceiro,
    setObservacaoFinanceiro,
    observacaoLoja,
    setObservacaoLoja,
    onSalvarMalote
  } = useConferirMalote({ salvarDadosMalotes, checkedItems, handleClick, handleClose, optionsModulos, usuarioLogado});
  
  
  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Detalhes do Malote',
  });

  const registroHistorico = Array.isArray(dadosHistorico) ? dadosHistorico[0] : dadosHistorico?.data?.[0];
  // Enquanto o histórico carrega, mantém os dados do malote atual
  const dadosExibidos = isHistorico && registroHistorico ? registroHistorico : maloteAtual;

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
  } = dadosExibidos;

  let classStatus = 'text-danger';
  let msgStatus = STATUSMALOTE || '';

  if (STATUSMALOTE == 'Criacao') {
    classStatus = 'text-info';
  } else if (STATUSMALOTE == 'Enviado' || STATUSMALOTE == 'Reenviado') {
    classStatus = 'text-info';
    msgStatus += ' e Aguardando Recebimento...';
  } else if (STATUSMALOTE == 'Recepcionado') {
    classStatus = 'text-info';
    msgStatus += ' e Aguardando Conferência...';
  } else if (STATUSMALOTE == 'Conferido') {
    classStatus = 'text-success';
  }

  // Só o malote atual, e apenas Recepcionado, pode ser conferido/devolvido
  const isRecepcionado = !isHistorico && STATUSMALOTE === 'Recepcionado';
  const isReadOnly = !isRecepcionado;
  const showDevolucao = !!DATAHORADEVOLVIDO || (!isHistorico && STATUSMALOTE === 'Devolvido');
  const showReenviado = !!DATAHORAREENVIADO;

  const pendenciasMarcadas = isRecepcionado
    ? checkedItems
    : (PENDENCIAS || []).map(({ IDPENDENCIA }) => IDPENDENCIA);
  const textoPendenciasImpressao = (dadosPendenciasMalotes || [])
    .filter(({ IDPENDENCIA }) => pendenciasMarcadas.includes(IDPENDENCIA))
    .map(({ TXTPENDENCIA }) => TXTPENDENCIA)
    .join(', ');
  const observacaoFinanceiroExibida = isRecepcionado ? observacaoFinanceiro : (OBSERVACAOADMINISTRATIVO || '');
  const rowsObsFinanceiro = (isRecepcionado || OBSERVACAOADMINISTRATIVO?.length > 0) ? 5 : 1;

  const selectOptions = [
    ...optionsHistoricos.map(item => ({
      value: `idHistorico_${item.IDHISTORICOMALOTE}`,
      label: `${item.DATAHOTAALTERACAO} - ${item.STATUSMALOTE}`
    })),
    {
      value: `idMalote_${idMalote}`,
      label: `ATUAL - ${maloteAtual.STATUSMALOTE}`,
    }
  ];

  const handleCheckboxChange = (id, isChecked) => {
    if (isChecked) {
      setCheckedItems((prev) => [...prev, id]); // Adiciona o ID à lista
    } else {
      setCheckedItems((prev) => prev.filter((item) => item !== id)); // Remove o ID da lista
    }
  };
  return (
    <Fragment>
      <form>

        <div style={{ width: '30%' }}>
          <label htmlFor="" style={{ fontWeight: 900, fontSize: '16px', }}>Histórico:</label>
          <Select
            options={selectOptions}
            value={selectOptions.find(opt => opt.value === historicoSelecionado)}
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
            
              <>
                <p style={{margin: '0px', fontSize: '16px', fontWeight: 900,}} className="text-p">Usuário Conferência: <span className="span-print" style={{fontWeight: 500,}}>{NOFUNCIONARIOCONFERENCIA || ''}</span></p>
                <p style={{margin: '0px', fontSize: '16px', fontWeight: 900,}} className="text-p">Data Conferência: <span className="span-print" style={{fontWeight: 500,}}>{DATAHORACONFERIDO || ''}</span></p>
              </>
    
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
                <span className="span-print" style={{fontWeight: 500,}}> {textoPendenciasImpressao || 'Não Há Pendências'}</span>
              </p>
            
            </div>
            <div>
              <p className="imprimir-somente" htmlFor="statusMalote">
                Observações Financeiro:  
                <span className="span-print" style={{fontWeight: 500,}}>   {observacaoFinanceiroExibida || 'Não há Observações'}</span>
              </p>
            
            </div>
            
          </header>

          <div>

            {dadosPendenciasMalotes?.length > 0 && (
              <ListaPendencias 
                dadosPendenciasMalotes={dadosPendenciasMalotes} 
                checkedItems={pendenciasMarcadas}
                onChange={handleCheckboxChange}
                isReadOnly={isReadOnly}
              />
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
              // readOnly={isReadOnly}
              readOnly={true}
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
              rows={rowsObsFinanceiro}
              value={observacaoFinanceiroExibida}
              onChange={(e) => setObservacaoFinanceiro(e.target.value)}
              readOnly={isReadOnly}
              placeholder="..."
            />
          </div>
        </div>
       
  
        <FooterModal
          ButtonTypeCadastrar={ButtonTypeModal}
          textButtonCadastrar={"Imprimir"}
          onClickButtonCadastrar={handlePrint}
          corCadastrar="primary"
          loadingTextCadastrar={"Cadastrando..."}
          autoLoadingCadastrar={true}
          tipoBtnCadastrar={"button"}
          
          ButtonTypeFechar={isRecepcionado ? ButtonTypeModal : undefined}
          textButtonFechar={"Finalizar"}
          onClickButtonFechar={() => onSalvarMalote('Conferência')}
          corFechar="success"

          ButtonTypeConfirmar={isRecepcionado ? ButtonTypeModal : undefined}
          textButtonConfirmar={"Devolver"}
          onClickButtonConfirmar={() => onSalvarMalote('Devolução')}
          corConfirmar="danger"

          ButtonTypeCancelar={ButtonTypeModal}
          textButtonCancelar={"Fechar"}
          onClickButtonCancelar={handleClose}
          corCancelar="secondary"
        />
       
      </form>

    </Fragment>
  );
};