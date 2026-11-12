import { Fragment, useRef } from "react"
import { Modal } from "react-bootstrap"
import { HeaderModal } from "../../../../Modais/HeaderModal/HeaderModal";
import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal";
import { FooterModal } from "../../../../Modais/FooterModal/footerModal";
import { ActionNotaPDF } from "./actionNotaPDF";
import { useReactToPrint } from "react-to-print";
import { Dialog } from 'primereact/dialog';

export const ActionPDFPedido = ({ show, handleClose, dadosPedido, dadosDetalhePedido }) => {

  const dataTableRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Nota Fiscal de Pedido',
  });

  const headerElement = (
    <div className="inline-flex align-items-center justify-content-center gap-2">
      <ButtonTypeModal
        onClickButtonType={() => handlePrint()}
        textButton={"Imprimir PDF"}
        cor={"info"}
      // Icon={}
      />
    </div>
  );

  return (
    <Fragment>
      <Dialog
        visible={show}
        onHide={handleClose}
        header={headerElement}
        maximizable
        modal
        fullscreen={true}
        style={{
          backgroundColor: '#fff',
          color: "#000",
          width: "75vw",
          height: "100vh",
          padding: "2rem",
        }}
      >

        <div ref={dataTableRef} style={{ marginTop: "1rem" }}>

          <ActionNotaPDF dadosPedido={dadosPedido} dadosDetalhePedido={dadosDetalhePedido} />

          <div className="row" style={{
            marginTop: "3.1rem",

            textAlign: "center",
            width: '100%',
            justifyContent: "center",
            display: "flex",
          }} >

            <div style={{ width: '50%' }} >
              <hr size="1" style={{ border: "1px dashed black", width: "300px" }} />
              <p style={{ fontSize: "14px" }}> Assinatura Vendedor  </p>
            </div>
            <div style={{ width: '50%' }} >
              <hr size="1" style={{ border: "1px dashed black", width: "300px" }} />
              <p style={{ fontSize: "14px" }}> Assinatura Comprador </p>
            </div>

          </div>
        </div>

        <FooterModal
          ButtonTypeFechar={ButtonTypeModal}
          onClickButtonFechar={handleClose}
          textButtonFechar={"Fechar"}
          corFechar={"secondary"}

          ButtonTypeCadastrar={ButtonTypeModal}
          onClickButtonCadastrar={() => handlePrint()}
          textButtonCadastrar={"Imprimir"}
          corCadastrar={"info"}
          loadingTextCadastrar={"Cadastrando..."}
          autoLoadingCadastrar={true}
        />
      </Dialog>
    </Fragment>
  )
}