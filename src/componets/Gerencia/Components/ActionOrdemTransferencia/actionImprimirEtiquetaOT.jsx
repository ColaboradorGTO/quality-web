import { Fragment, useEffect, useRef, useState } from "react";
import Modal from 'react-bootstrap/Modal';
import { ReactBarcode } from 'react-jsbarcode';
import { useReactToPrint } from "react-to-print";
import jsPDF from 'jspdf';

import Swal from "sweetalert2";
import { ButtonTypeModal } from "../../../Buttons/ButtonTypeModal";
import { FooterModal } from "../../../Modais/FooterModal/footerModal";
import { HeaderModal } from "../../../Modais/HeaderModal/HeaderModal";



export const ActionImprimirEtiquetaOT = ({ show, handleClose, dadosImprimirOT, usuarioLogado }) => {
  const [layout, setLayout] = useState('layout-normal');


  const dataTableRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'voucher',
  });

  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(10);
    doc.setFont('helvetica');

    doc.html(dataTableRef.current, {
      callback: function (doc) {
        doc.save("voucher.pdf");
      },
      x: 10,
      y: 10,
      html2canvas: {
        scale: 0.3
      }
    });
  };

  const dados = (dadosImprimirOT || []).flatMap((item) => {
    if (
      dadosImprimirOT.length > 1 &&
      item.NUMEROVOLUME &&
      item.NUTOTALVOLUMES &&
      dadosImprimirOT.length === Number(item.NUTOTALVOLUMES)
    ) {
      return [{
        IDRESUMOOT: item.IDRESUMOOT,
        EMPRESAORIGEM: item.EMPRESAORIGEM,
        EMPRESADESTINO: item.EMPRESADESTINO,
        DATAEXPEDICAOFORMATADA: item.DATAEXPEDICAOFORMATADA,
        NUTOTALVOLUMES: Number(item.NUTOTALVOLUMES),
        NUMEROVOLUME: Number(item.NUMEROVOLUME),
        TPVOLUME: item.TPVOLUME,
        CODIGOBARRAS: item.CODIGOBARRAS || (item.IDRESUMOOT ? `${item.IDRESUMOOT}${item.NUMEROVOLUME}` : ''),
      }];
    }

    const totalVolumes = Math.max(
      1,
      parseInt(item.NUMEROVOLUME, 10) || 0,
      parseInt(item.numeroVolume, 10) || 0,
      parseInt(item.NUTOTALVOLUMES, 10) || 0,
      parseInt(item.nutotalvolumes, 10) || 0,
      parseInt(item.QTDVOLUME, 10) || 0,
      parseInt(item.qtdVolume, 10) || 0
    );

    return Array.from({ length: totalVolumes }, (_, index) => {
      const numeroVolumeAtual = index + 1;
      return {
        IDRESUMOOT: item.IDRESUMOOT,
        EMPRESAORIGEM: item.EMPRESAORIGEM,
        EMPRESADESTINO: item.EMPRESADESTINO,
        DATAEXPEDICAOFORMATADA: item.DATAEXPEDICAOFORMATADA,
        NUTOTALVOLUMES: totalVolumes,
        NUMEROVOLUME: numeroVolumeAtual,
        TPVOLUME: item.TPVOLUME,
        CODIGOBARRAS: item.CODIGOBARRAS || (item.IDRESUMOOT ? `${item.IDRESUMOOT}${numeroVolumeAtual}` : ''),
      };
    });
  });



  const toggleLayout = () => {
    setLayout(layout === 'layout-normal' ? 'layout-cupom' : 'layout-normal');
  };

  const handleImprimir = (NUVOUCHER) => {

    Swal.fire({
      icon: 'question',
      title: 'Escolha o Formato Desejado?',
      showCloseButton: true,
      showCancelButton: true,
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'CUPOM',
      cancelButtonText: 'NORMAL',
      customClass: {
        container: 'custom-swal',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        setLayout('layout-cupom');
        setTimeout(() => {
          handlePrint();
        }, 500);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        setLayout('layout-normal');
        setTimeout(() => {
          handlePrint();
        }, 500);
      }
    });
  };



  return (
    <Fragment>
      <Modal show={show} onHide={handleClose} size="lg" className="modal fade" tabIndex={-1} role="dialog" aria-hidden="true">

        <HeaderModal title={"Etiqueta"} handleClose={handleClose} />


        <Modal.Body>
          <div ref={dataTableRef} className={layout}>
            {dados.map((item, index) => (
              <Fragment key={index}>
                <div
                  style={{
                    // border: '1px solid',
                    marginTop: '10px',
                    padding: '10px',
                    boxShadow: '0px 0px 0.5cm rgba(0, 0, 0, 0.5)',
                    backgroundImage: 'url("/img/svg/pattern-1.svg")',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    pageBreakAfter: 'always',
                    breakAfter: 'page',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '100%',
                      padding: '10px 0',
                      boxSizing: 'border-box',
                    }}
                  >
                    {item?.CODIGOBARRAS ? (
                      <ReactBarcode
                        value={String(item.CODIGOBARRAS)}
                        options={{
                          format: 'code128',
                          width: 5,
                          height: 100,
                          displayValue: true,
                        }}
                        renderer="svg"
                      />
                    ) : null}
                  </div>

                  <div style={{ padding: '10px' }}>
                    <p style={{ fontSize: '18px' }}>
                      <strong>Origem: </strong>
                      {item?.EMPRESAORIGEM}
                    </p>

                    <p style={{ fontSize: '18px' }}>
                      <strong>Destino: </strong>
                      {item?.EMPRESADESTINO}
                    </p>

                    <p style={{ fontSize: '18px' }}>
                      <strong>Nº da OT: </strong>
                      {item?.IDRESUMOOT}
                    </p>

                    <p style={{ fontSize: '18px' }}>
                      <strong>Data da OT: </strong>
                      {item?.DATAEXPEDICAOFORMATADA}
                    </p>

                    <p style={{ fontSize: '18px' }}>
                      <strong>Volume: </strong>
                      {item?.NUMEROVOLUME}/{item?.NUTOTALVOLUMES}
                    </p>

                    {/*      <p style={{ fontSize: '18px' }}>
                      <strong>{item?.TPVOLUME}</strong>
                    </p> */}

                  </div>
                </div>
              </Fragment>
            ))}
          </div>
        </Modal.Body>


        <FooterModal
          ButtonTypeConfirmar={ButtonTypeModal}
          textButtonConfirmar={"Fechar"}
          onClickButtonConfirmar={handleClose}
          corConfirmar={"secondary"}

          ButtonTypeFechar={ButtonTypeModal}
          textButtonFechar={"Imprimir"}
          onClickButtonFechar={handleImprimir}
          corFechar="primary"
        />

      </Modal >
    </Fragment >
  );
};
