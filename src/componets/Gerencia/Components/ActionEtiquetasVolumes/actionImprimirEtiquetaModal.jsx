import { Fragment, useRef } from "react";
import './styles.css';
import { formatMoeda } from "../../../../utils/formatMoeda";
import { ReactBarcode } from 'react-jsbarcode';
import { ButtonTypeModal } from "../../../Buttons/ButtonTypeModal";
import { MdOutlineLocalPrintshop } from "react-icons/md";
import { isValidEAN13 } from "../../../../utils/isValidEAN13";
import { enviarZPLParaImpressora } from "../../../../utils/labelPrinterService";
import Swal from "sweetalert2";
import Modal from 'react-bootstrap/Modal';
import { HeaderModal } from "../../../Modais/HeaderModal/HeaderModal";
import { FooterModal } from "../../../Modais/FooterModal/footerModal";
import { AiOutlineCloseCircle } from "react-icons/ai";

const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const ActionImprimirEtiquetaModal = ({ show, handleClose, dadosAcumuladorEtiquetas }) => {
  const dataTableRef = useRef();


 const handlePrintZPL = async () => {
    try {
      let etiquetasZPL = '';
      const zplResetConfiguracao = `
        ^XA
        ^MD0
        ~SD07
        ^JUS
        ^XZ
      `;

      for (let itemIndex = 0; itemIndex < dadosAcumuladorEtiquetas.length; itemIndex++) {
        let {
          tipoSelecionado: titulo,
          empresaOrigem,
          empresaDestino,
          numeroOR,
          numeroOT,
          descricao,
          categoria,
          solicitanteSelecionado,
          quantidade
        } = dadosAcumuladorEtiquetas[itemIndex]

        const empresaDestinoSelecionada = titulo == 'DEVOLUÇÃO' ? " 0101 - TO - CD (DEPÓSITO)" : empresaDestino?.label;
        
        const qtd = Number(quantidade) || 1;

        for (let i = 0; i < qtd; i++) {

          etiquetasZPL += `
          ^XA~TA000~JSN^LT0^MNW^MTT^PON^PMN^LH0,0^JMA^PR2,2~SD15^JUS^LRN^CI0^XZ
          ^XA
          ^MMT
          ^FWR
          ^PW700
          ^LL980
          ^LS0
          ^CI28
          
          ^FO560,0
          ^GB150,1000,150^FS

          ^FO550,${titulo == 'REMANEJAMENTO' ? '120' : '250'}
          ^FR
          ^CF0,100
          ^FD${titulo}^FS

          ^CF0,60
          ^FO430,20^FB480,2,1,L,0^FDOR: ${numeroOR}^FS
          ^FO430,520^FB480,2,1,L,0^FDOT: ${numeroOT}^FS

          ^CF0,45
          ^FO420,20^FDDESCRICAO: ${descricao}^FS

          ^FO360,20^FDCATEGORIA: ${categoria}^FS

          ${solicitanteSelecionado && `^FO300,20^FDSOLICITANTE: ${solicitanteSelecionado}^FS`}

          ^FO180,20^FB980,2,1,L,0^FDREMETENTE: ${empresaOrigem}^FS

          ^FO80,20^FB980,2,1,L,0^FDDESTINATÁRIO: ${empresaDestinoSelecionada}^FS

          ^CF0,40
          ^FO40,550^FDQTD: ${i + 1}/${qtd}^FS

          ^XZ
        `;
        }
      }


      await enviarZPLParaImpressora(`${etiquetasZPL}\n${zplResetConfiguracao}`);


    } catch (error) {

      console.error(error);
    }
  }

    const etiquetas = dadosAcumuladorEtiquetas.flatMap((item) => {
    const quantidade = Number(item.quantidade) || 1;
    
    
    return Array.from({ length: quantidade }, (_, i) => ({
      titulo: item.tipoSelecionado,
      descricao: item.descricao,
      categoria: item.categoria,
      numeroOR: item.numeroOR || 'N/A',
      numeroOT: item.numeroOT || 'N/A',
      empresaDestino: item.tipoSelecionado == 'DEVOLUÇÃO' ? " 0101 - TO - CD (DEPÓSITO)" : item.empresaDestino,
      empresaOrigem: item.empresaOrigem,
      solicitante: item.solicitanteSelecionado,
      quantidade,
      copiaAtual: i + 1
    }))
  });
  const etiquetasPorPagina = chunkArray(etiquetas, 3);
  const totalPaginas = etiquetasPorPagina.length;

  return (
    <Fragment>
      <Modal
        show={show}
        onHide={handleClose}
        size="xl"
        className="modal fade"
        role="dialog"
        >
      <Modal.Body>
          <header className="row" style={{ justifyContent: "space-between", marginLeft: "30px" }}>
            <div>
              <h1 className="title-modal">Etiquetas</h1>

            </div>

            <div className="d-flex gap-2">
              <div style={{ paddingBottom: '20px', paddingRight: '10px' }}>

                <ButtonTypeModal
                  textButton={"Fechar"}
                  onClickButtonType={handleClose}
                  cor={"danger"}
                  Icon={AiOutlineCloseCircle}

                  iconSize={20}
                />
              </div>
              <div >

                <ButtonTypeModal
                  textButton={"Imprimir"}
                  onClickButtonType={handlePrintZPL}
                  cor={"info"}
                  Icon={MdOutlineLocalPrintshop}
                  iconSize={20}
                />
              </div>
            </div>
          </header>

          <div ref={dataTableRef}>
            {etiquetasPorPagina.map((pagina, pageIndex) => (
              // <div key={pageIndex} className="etiqueta-page" style={{ display: 'block', margin: '30px' }}>
              <div key={pageIndex} className="" style={{ display: 'block', margin: '0px' }}>
                {pagina.map((etiqueta, etiquetaIndex) => (
                  <div className="etiqueta-page-remanejamento" style={{ marginBottom: '30px', width: '100%' }} key={etiquetaIndex}>
                    <div className="card border-dark w-100 p-0">
                      <div className="text-center pt-1">
                        <h1 className="title-etiqueta d-inline bg-dark text-white pt-2 pl-3 pb-1 pr-3 fw-900">
                          {etiqueta?.titulo}
                        </h1>
                      </div>

                      <div className="d-flex flex-column justify-content-between px-2 py-2 m-1">
                        <div className="d-flex justify-content-between mb-2 fw-900">
                          <div className="title-desc-etiqueta">
                            <span><u>OR:</u></span>
                            <span style={{ textTransform: "uppercase" }}><u> {etiqueta?.numeroOR} </u></span>
                          </div>
                          <div className="title-desc-etiqueta">
                            <span><u>OT:</u></span>
                            <span style={{ textTransform: "uppercase" }}><u> {etiqueta?.numeroOT} </u></span>
                          </div>
                        </div>

                        <div className="title-desc-etiqueta mb-2 fw-900">
                          <span><u>DESCRIÇÃO:</u></span>
                          <span style={{ textTransform: "uppercase" }}> {etiqueta?.descricao}</span>
                        </div>

                        <div className="title-desc-etiqueta mb-2 fw-900">
                          <span><u>CATEGORIA:</u></span>
                          <span style={{ textTransform: "uppercase" }}> {etiqueta?.categoria}</span>
                        </div>

                        <div
                          className="title-desc-etiqueta mb-2 fw-900"
                          style={{ display: etiqueta?.solicitante === '' ? 'none' : undefined }}
                        >
                          <span><u>SOLICITANTE:</u></span>
                          <span style={{ textTransform: "uppercase" }}> {etiqueta?.solicitante} </span>
                        </div>

                        <div className="title-desc-etiqueta mb-2 fw-900">
                          <span><u>REMETENTE:</u></span>
                          <span style={{ textTransform: "uppercase" }}> {etiqueta?.empresaOrigem}</span>
                        </div>

                        <div className="d-flex justify-content-start mb-1 fw-900">
                          <div className="title-desc-etiqueta">
                            <span><u>DESTINATÁRIO:</u></span>
                            <span style={{ textTransform: "uppercase" }}><u> {etiqueta?.empresaDestino}</u></span>
                          </div>
                        </div>
                        <div className="d-flex justify-content-end align-items-end mb-1 fw-900">
                          <div className="title-desc-etiqueta">
                            <span><u>QTD: </u></span>
                            <span><u> {` ${etiqueta?.copiaAtual}/${etiqueta?.quantidade}`}</u></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Modal.Body>

        <FooterModal
          ButtonTypeFechar={ButtonTypeModal}
          textButtonFechar={"Fechar"}
          onClickButtonFechar={handleClose}
          corFechar="secondary"
        />
      </Modal>
    </Fragment>
  );
};
