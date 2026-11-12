import { Fragment, useEffect, useState } from "react"
import { Modal } from "react-bootstrap"
import { HeaderModal } from "../../../../Modais/HeaderModal/HeaderModal"
import { FooterModal } from "../../../../Modais/FooterModal/footerModal"
import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal"
import { InputFieldModal } from "../../../../Buttons/InputFieldModal"
import { useFetchData } from "../../../../../hooks/useFetchData"
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import Select from 'react-select';
// import { FormularioEditarItemPedido } from "./formularioEditarItemPedido"

export const ActionProdutoPedidoModal = ({ show, handleClose, dadosItemPedido }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [quantidade, setQuantidade] = useState(0);
  const [qtdCaixas, setQtdCaixas] = useState(0);
  const [referencia, setReferencia] = useState('');
  const [descricaoProduto, setDescricaoProduto] = useState('');
  const [categoriaProduto, setCategoriaProduto] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [fabricante, setFabricante] = useState('');
  const [unidade, setUnidade] = useState('');
  const [cor, setCor] = useState('');
  const [tipoTecido, setTipoTecido] = useState('');
  const [estrutura, setEstrutura] = useState('');
  const [estilo, setEstilo] = useState('');
  const [categorias, setCategorias] = useState('');
  const [localExposicao, setLocalExposicao] = useState('');
  const [ecommerce, setEcommerce] = useState('');
  const [redeSocial, setRedeSocial] = useState('');
  const [vrCusto, setVrCusto] = useState(0);
  const [vrVenda, setVrVenda] = useState(0);


  useEffect(() => {
    if (dadosItemPedido && dadosItemPedido.length > 0) {
      const idCategoriaPedido = dadosItemPedido[0].IDCATEGORIAPEDIDO;
      let TPCategPedidoEDIT1 = '';

      if (idCategoriaPedido <= 5) {
        TPCategPedidoEDIT1 = 'VESTUARIO';
      } else if (idCategoriaPedido >= 6 && idCategoriaPedido !== 12 && idCategoriaPedido !== 13) {
        TPCategPedidoEDIT1 = 'CALCADOS';
      } else if (idCategoriaPedido === 12) {
        TPCategPedidoEDIT1 = 'ARTIGOS';
      } else if (idCategoriaPedido === 13) {
        TPCategPedidoEDIT1 = 'ACESSORIOS';
      }

      setQuantidade(dadosItemPedido[0].QTDTOTAL);
      setQtdCaixas(dadosItemPedido[0].NUCAIXA);
      setReferencia(dadosItemPedido[0].NUREF);
      setDescricaoProduto(dadosItemPedido[0].DSPRODUTO);
      setCategoriaProduto({ value: TPCategPedidoEDIT1, label: TPCategPedidoEDIT1 });
      setFornecedor(dadosItemPedido[0].NORAZAOSOCIAL);
      setFabricante(dadosItemPedido[0].IDFABRICANTE + ' - ' + dadosItemPedido[0].DSFABRICANTE);
      setUnidade({ value: dadosItemPedido[0].DSSIGLA, label: dadosItemPedido[0].DSSIGLA });
      setCor({ value: dadosItemPedido[0].DSCOR, label: dadosItemPedido[0].DSCOR });
      setTipoTecido({ value: dadosItemPedido[0].DSTIPOTECIDO, label: dadosItemPedido[0].DSTIPOTECIDO });
      setEstrutura(dadosItemPedido[0].DSSUBGRUPOESTRUTURA);
      setEstilo(dadosItemPedido[0].DSESTILO);
      setCategorias({ value: dadosItemPedido[0].CATEGORIAPROD, label: `${dadosItemPedido[0].CATEGORIAPROD} - ${dadosItemPedido[0].DSCATEGORIAPROD} - ${dadosItemPedido[0].TPCATEGORIAPROD}` });
      setLocalExposicao({ value: dadosItemPedido[0].DSLOCALEXPOSICAO, label: dadosItemPedido[0].DSLOCALEXPOSICAO });
      setEcommerce({ value: dadosItemPedido[0].STECOMMERCE === 'True' ? 'True' : 'False', label: dadosItemPedido[0].STECOMMERCE === 'True' ? 'SIM' : 'NÃO' });
      setRedeSocial({ value: dadosItemPedido[0].STREDESOCIAL === 'True' ? 'True' : 'False', label: dadosItemPedido[0].STREDESOCIAL === 'True' ? 'SIM' : 'NÃO' });
      setVrCusto(dadosItemPedido[0].VRUNITLIQDETALHEPEDIDO);
      setVrVenda(dadosItemPedido[0].VRVENDADETALHEPEDIDO);
    }
  }, [dadosItemPedido])
  const { data: dadosUnidadeMedida = [] } = useFetchData('unidadeMedida', '/unidadeMedida');
  const { data: dadosCores = [] } = useFetchData('listaCores', '/listaCores');
  const { data: dadosTipoTecido = [] } = useFetchData('tipo-tecido', '/tipo-tecido');
  const { data: dadosCategorias = [] } = useFetchData('categoriasProdutos', '/categoriasProdutos');
  const { data: dadosLocalExposicao = [] } = useFetchData('localExposicao', '/localExposicao');

  const groupedCores = dadosCores.reduce((acc, item) => {
    const group = item.DS_GRUPOCOR || "Outras Cores"; // Use um campo como agrupador
    const option = { value: item.ID_COR, label: item.DS_COR };

    const groupIndex = acc.findIndex((g) => g.label === group);
    if (groupIndex !== -1) {
      acc[groupIndex].options.push(option);
    } else {
      acc.push({ label: group, options: [option] });
    }
    return acc;
  }, []);


  const ooptionsTipoPedido = [
    { value: 'VESTUARIO', label: 'VESTUARIO' },
    { value: 'CALCADOS', label: 'CALÇADOS' },
    { value: 'ARTIGOS', label: 'ARTIGOS' },
    { value: 'ACESSORIOS', label: 'ACESSÓRIOS' },
  ]

  const optionsEcommerce = [
    { value: 'True', label: 'SIM' },
    { value: 'False', label: 'NÃO' }
  ]
  return (

    <Fragment>
      <Modal
        show={show}
        onHide={handleClose}
        class="modal-content"
        size="xl"
        centered
      >

        <HeaderModal
          title={"Itens do Pedido"}
          subTitle={`Alteração de Itens do Pedido Nº`}
          handleClose={handleClose}
        />


        <Modal.Body>
          {/* <FormularioEditarItemPedido dadosItemPedido={dadosItemPedido} handleClose={handleClose}/> */}
        </Modal.Body>
      </Modal>
    </Fragment>
  )
}