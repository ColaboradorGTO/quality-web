import { Fragment, useEffect, useRef, useState } from "react";
import Modal from 'react-bootstrap/Modal';
import { HeaderModal } from "../../../Modais/HeaderModal/HeaderModal";
import { ButtonTypeModal } from "../../../Buttons/ButtonTypeModal";
import { FooterModal } from "../../../Modais/FooterModal/footerModal";
import { getDataHoraAtual } from "../../../../utils/horaAtual";
import { dataHoraFormatada } from "../../../../utils/dataFormatada";
import { ReactBarcode } from 'react-jsbarcode';
import { useReactToPrint } from "react-to-print";
import jsPDF from 'jspdf'; // Importa o jsPDF
import './styles.css';
import Swal from "sweetalert2";

export const ActionImprimirVoucherModal = ({ show, handleClose, dadosImprimirVoucher }) => {
  const [dataHoje, setDataHoje] = useState('');
  const [layout, setLayout] = useState('layout-normal'); // Estado para o layout
  useEffect(() => {
    const dataAtual = getDataHoraAtual();
    setDataHoje(dataAtual);
  }, [])

  const dataTableRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'voucher',
  });

 /*  const handleExportPDF = () => {
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
  }; */

  const handleExportPDF = async () => {
    const elemento = dataTableRef.current;

    if (!elemento) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    const margem = 10;
    const larguraUtil = doc.internal.pageSize.getWidth() - (margem * 2);

    await doc.html(elemento, {
      x: margem,
      y: margem,
      width: larguraUtil,
      windowWidth: elemento.scrollWidth,
      autoPaging: 'text',
      html2canvas: {
        backgroundColor: '#ffffff',
        useCORS: true,
      },
      callback: (pdf) => {
        pdf.save("voucher.pdf");
      },
    });
  };

  const dados = dadosImprimirVoucher.map((item) => {
    return {
      EMPORIGEM: item.voucher.EMPORIGEM,
      RAZAOEMPORIGEM: item.voucher.RAZAOEMPORIGEM,
      CNPJEMPORIGEM: item.voucher.CNPJEMPORIGEM,
      ENDEMPORIGEM: item.voucher.ENDEMPORIGEM,
      BAIRROEMPORIGEM: item.voucher.BAIRROEMPORIGEM,
      CIDADEEMPORIGEM: item.voucher.CIDADEEMPORIGEM,
      SGUFEMPORIGEM: item.voucher.SGUFEMPORIGEM,
      DTINVOUCHER: item.voucher.DTINVOUCHER,
      VRVOUCHER: item.voucher.VRVOUCHER,
      NUVOUCHER: item.voucher.NUVOUCHER,
      DSNOMERAZAOSOCIAL: item.voucher.DSNOMERAZAOSOCIAL,
      NUCPFCNPJ: item.voucher.NUCPFCNPJ,
      IDCAIXAORIGEM: item.voucher.IDCAIXAORIGEM,
      IDVENDEDOR: item.voucher.IDVENDEDOR,
      IDNFEDEVOLUCAO: item.voucher.IDNFEDEVOLUCAO,
    };
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
      preConfirm: () => {
        return new Promise((resolve) => {
          // Chama a função de alternar layout e imprime
          toggleLayout(); // Alterna o layout
          setTimeout(() => {
            handlePrint(); // Abre a página de impressão após alterar o layout
            resolve(); // Resolve a promessa para fechar o Swal
          }, 500); // Tempo para garantir que o layout foi alternado
        });
      }
    }).then((result) => {
      if (result.value) {
        toggleLayout(); // Alterna o layout
        setTimeout(() => {
          handlePrint(); // Abre a página de impressão após alterar o layout
          resolve(); // Resolve a promessa para fechar o Swal
        }, 500)
      } else if (result.dismiss === 'cancel') {
        toggleLayout(); // Alterna o layout
        setTimeout(() => {
          handlePrint(); // Abre a página de impressão após alterar o layout
          resolve(); // Resolve a promessa para fechar o Swal
        }, 500)
      }
    });
  };



  return (
    <Fragment>
      <Modal show={show} onHide={handleClose} size="lg" className="modal fade" tabIndex={-1} role="dialog" aria-hidden="true">
        <div style={{ padding: "10px" }}>
          <HeaderModal title={"Voucher"} handleClose={handleClose} />

          <Modal.Body>
            <div ref={dataTableRef} className={layout}> {/* Aplicando a classe de layout */}
              <p className="center" style={{ margin: "0px", textAlign: "center", fontWeight: 700 }}>
                {dados[0]?.EMPORIGEM}
              </p>
              <p style={{ margin: "0px", textAlign: "center" }}>
                {dados[0]?.RAZAOEMPORIGEM}
              </p>
              <p style={{ margin: "0px", textAlign: "center", fontWeight: 700 }}>
                CNPJ Nº {dados[0]?.CNPJEMPORIGEM}
              </p>
              <p style={{ marginBottom: "5px", marginTop: "10px" }}>
                <b>{dados[0]?.ENDEMPORIGEM}</b>
                <br />
                <b>{dados[0]?.BAIRROEMPORIGEM}</b>
                <br />
                <b>{dados[0]?.CIDADEEMPORIGEM} - {dados[0]?.SGUFEMPORIGEM}</b>
              </p>
              <p style={{ marginBottom: "0px" }}>{dataHoje.replace('-', '/').replace('-', '/')}</p>
              <p style={{ textAlign: "center", fontWeight: 700, fontSize: "20px" }}>
                ** COMPROVANTE NÃO FISCAL **
              </p>

              <hr style={{ border: "1px dashed" }} />
              
              <p style={{ margin: "0px", textAlign: "center", fontSize: "16px" }}>
                ORDEM DE TROCA
                <br />
                CUPOM VALE TROCA
              </p>

              <p style={{ margin: "0px" }}>
                DATA DA OPERAÇÃO.....: {dataHoraFormatada(dados[0]?.DTINVOUCHER)}
              </p>
              <p style={{ margin: "0px" }}>
                CAIXA..............................: {parseFloat(dados[0]?.IDCAIXAORIGEM)}
              </p>
              <p style={{ margin: "0px" }}>
                VENDEDOR.....................: {dados[0]?.IDVENDEDOR}
              </p>

              <p style={{ margin: "0px", padding: "0px" }}>
                Nº VALE TROCA..............: <b>{dados[0]?.NUVOUCHER}</b>
              </p>

              <p style={{ margin: "0px" }}>
                NOME: <b>{dados[0]?.DSNOMERAZAOSOCIAL}</b>
              </p>
              <p style={{ margin: "0px" }}>
                CPF/CNPJ: <b>{dados[0]?.NUCPFCNPJ}</b>
              </p>

              <hr style={{ border: "1px dashed" }} />

              <p style={{ margin: "0px", textAlign: "center", fontSize: "16px" }}>
                VALE TROCA DE <b>{dados[0]?.VRVOUCHER}</b>
              </p>

              <hr style={{ border: "1px dashed" }} />

              <div style={{ display: "flex", justifyContent: "center" }}>
                <ReactBarcode value={dados[0]?.NUVOUCHER} options={{ format: 'code128' }} renderer="canvas" />
              </div>

              <hr style={{ border: "1px dashed" }} />

              <p style={{ margin: "0px" }}>Este vale troca é pessoal e instranferível.</p>
              <p style={{ margin: "0px" }}>
                Para sua utilização será solicitado a apresentação de
                documento de identidade e CPF.
              </p>
              <p style={{ margin: "0px" }}>
                Não poderá ser utilizado para pagamento de prestações e
                compras de produtos FINANCEIROS.
              </p>
              <p style={{ margin: "0px" }}>
                As lojas do GRUPO GTO não se responsabilizam pela perda ou
                extravio deste vale troca.
              </p>
              <p style={{ margin: "0px" }}>
                Este comprovante é impresso em papel termossensível.
              </p>
              <p style={{ margin: "0px" }}>
                Não exponha o papel à luz solar, fontes de calor e umidade
                excessiva.
              </p>

              <hr style={{ border: "1px dashed" }} />

              <p style={{ margin: "0px" }}>
                <b>Válido por 30 dias.</b>
              </p>
            </div>
          </Modal.Body>

          <FooterModal
            ButtonTypeConfirmar={ButtonTypeModal}
            textButtonConfirmar={"Fechar"}
            onClickButtonConfirmar={handleClose}
            corConfirmar={"secondary"}

            ButtonTypeCadastrar={ButtonTypeModal}
            textButtonCadastrar={"PDF"}
            onClickButtonCadastrar={handleExportPDF}
            corCadastrar="danger"


            ButtonTypeFechar={ButtonTypeModal}
            textButtonFechar={"Imprimir"}
            onClickButtonFechar={handleImprimir}
            corFechar="primary"
          />
        </div>
      </Modal>
    </Fragment>
  );
};
