import { Fragment } from "react";
import Modal from 'react-bootstrap/Modal';
import XMLViewer from 'react-xml-viewer';
import Swal from 'sweetalert2';
import { FooterModal } from "../../../Modais/FooterModal/footerModal";
import { ButtonTypeModal } from "../../../Buttons/ButtonTypeModal";
import { HeaderModal } from "../../../Modais/HeaderModal/HeaderModal";
import { ScrollPanel } from 'primereact/scrollpanel';
import axiosInstance from "../../../../api/api";


export const ActionVendaXMLModal = ({ show, handleClose, dadosDetalheVendasXML }) => {

  const xmlData = dadosDetalheVendasXML[0]?.XML_FORMATADO;

  const gerarDanfeViaApi = async () => {
    try {
      const baseURL = axiosInstance.defaults.baseURL;

      const idVenda = dadosDetalheVendasXML[0]?.IDVENDA;
      const xmlData = dadosDetalheVendasXML[0]?.XML_FORMATADO;

      const response = await axiosInstance.post(
        `${baseURL}/gerar-danfe`,
        { xml: xmlData, idVenda, consulta: '' },
        {
          responseType: 'arraybuffer',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/pdf'
          },
          timeout: 80000
        }
      );

      if (!response.data || response.data.byteLength === 0) {
        throw new Error('Resposta da API vazia');
      }

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      window.open(url, '_blank');

      Swal.fire({
        title: 'Sucesso!',
        text: 'DANFE gerado com sucesso.',
        icon: 'success',
        customClass: {
          container: 'custom-swal',
        },
      });

    } catch (error) {
      console.error('Erro detalhado:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });

      Swal.fire({
        title: 'Falha na geração',
        text: error.message || 'Erro ao gerar DANFE',
        icon: 'error',
        customClass: {
          container: 'custom-swal',
        },
      });
    }
  };

  const handleGerarDanfe = () => {
    gerarDanfeViaApi();
  };

  const handleCopyXML = () => {
    if (xmlData) {
      navigator.clipboard.writeText(xmlData).then(() => {
        Swal.fire({
          icon: 'success',
          title: 'XML copiado com sucesso!',
          text: 'XML copiado com sucesso!',
          timer: 3000,
          showConfirmButton: false,
          customClass: {
            container: 'custom-swal',
          },
        });

      }).catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Não foi possível copiar o XML',
          customClass: {
            container: 'custom-swal',
          },
        });

      });
    }
  };

  const handleOpenNewTab = () => {
    const xmlBlob = new Blob([xmlData], { type: 'text/xml' });
    const newTabUrl = URL.createObjectURL(xmlBlob);
    window.open(newTabUrl, '_blank');
  };


  const handleDownloadXML = () => {
    const xmlBlob = new Blob([xmlData], { type: 'text/xml' });
    const downloadUrl = URL.createObjectURL(xmlBlob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `venda_${dadosDetalheVendasXML[0]?.IDVENDA}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Fragment>
      <Modal
        show={show}
        onHide={handleClose}
        size="lg"
        className="modal fade"
        tabIndex={-1}
        role="dialog"
        aria-hidden="true"
      >
        <div className="" role="document">
          <HeaderModal
            title={"XML Venda Nº " + dadosDetalheVendasXML[0]?.IDVENDA}
            handleClose={handleClose}
          />

          <Modal.Body>
            <ScrollPanel style={{ width: '100%', height: '400px', border: '1px solid #000' }}>

              {xmlData ? (
                <XMLViewer xml={xmlData} />
              ) : (
                <p>XML não disponível</p>
              )}
            </ScrollPanel>
          </Modal.Body>
 

          <FooterModal
            ButtonTypeFechar={ButtonTypeModal}
            textButtonFechar={"Abrir XML em Nova Aba"}
            onClickButtonFechar={handleOpenNewTab}
            corFechar={"info"}

            ButtonTypeCadastrar={ButtonTypeModal}
            textButtonCadastrar={"Copiar XML"}
            onClickButtonCadastrar={handleCopyXML}
            corCadastrar={"primary"}

            ButtonTypeConfirmar={ButtonTypeModal}
            textButtonConfirmar={"Download"}
            onClickButtonConfirmar={handleDownloadXML}
            corConfirmar={"success"}

            ButtonTypeCancelar={ButtonTypeModal}
            textButtonCancelar={"PDF"}
            onClickButtonCancelar={handleGerarDanfe}
            corCancelar={"danger"}
          />

        </div>
      </Modal>
    </Fragment>
  );
};
