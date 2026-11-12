import { Fragment, useRef } from "react"
import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal";
import { FooterModal } from "../../../../Modais/FooterModal/footerModal";
import { ActionNotaPDFSemPreco } from "./actionNotaPDFSemPreco";
import { useReactToPrint } from "react-to-print";
import { Dialog } from 'primereact/dialog';


export const ActionPDFPedidoSemPreco = ({ show, handleClose, dadosPedidoSemPreco, dadosDetalhePedido }) => {

  const dataTableRef = useRef(null);

   const handlePrint = useReactToPrint({
     content: () => dataTableRef.current,
     documentTitle: `Pedido`,
    
     pageStyle: `
       <style>
              *{
                margin: 0;
                padding: 0;
                background: #000;
              }

              @page {
                size: portrait;
                margin: 0;
                padding: 0;
              }
        
              @media print {
                    .print-div-table{ width: 100%; };
                    .hidden-print {
                      display: none !important;
                    }
                }
                #dt-basic-detalhe-pedido-grade{
                    text-align: center;
                }
                
                #dt-basic-detalhe-pedido-grade{
                    text-align: center;
                }
                
                .group{text-align: left !important;}
                
              table.bordasimples {border-collapse: collapse !important;font-size: 10px !important;}
              table.bordasimples tr th {border:solid 1px #000 !important; padding:0px; margin:0px;font-size: 10px !important;}
              table.bordasimples tr td {border:solid 1px #000 !important; padding:0px; margin:0px;font-size: 10px !important;}
              table.semborda td {border:solid 1px #000 !important; padding:0px; margin:0px;font-size: 10px !important;}
            
              table{
                font-family: verdana;
                font-size: 16px;
                margin: 0;
                padding: 0;
            
              }
            </style>
     `
   
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

        <div ref={dataTableRef} style={{ padding: "10px", width: "100%", }}>

          <ActionNotaPDFSemPreco dadosPedidoSemPreco={dadosPedidoSemPreco} dadosDetalhePedido={dadosDetalhePedido} />
          
          <div className="row" style={{ 
              marginTop: "3.1rem", 
            
              textAlign: "center", 
              width: '100%',
              justifyContent: "center", 
              display: "flex",
          }} >

            <div style={{  width: '50%'}} >
              <hr size="1" style={{border: "1px dashed black", width: "300px"}} />
              <p style={{ fontSize: "14px" }}> Assinatura Vendedor  </p> 
            </div>
            <div style={{  width: '50%' }} >
              <hr size="1" style={{border: "1px dashed black", width: "300px"}} />
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