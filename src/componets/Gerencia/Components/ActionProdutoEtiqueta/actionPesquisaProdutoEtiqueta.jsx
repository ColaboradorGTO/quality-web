import { Fragment, useEffect, useState } from "react"
import { InputField } from "../../../Buttons/Input"
import { ActionMain } from "../../../Actions/actionMain"
import { get } from "../../../../api/funcRequest"
import { AiOutlineSearch } from "react-icons/ai"
import { ActionListaProdutoEtiqueta } from "./actionListaProdutoEtiqueta"
import { ButtonType } from "../../../Buttons/ButtonType"
import { MdOutlineLocalPrintshop } from "react-icons/md"
import { GoDownload } from "react-icons/go"
import { BsTrash3 } from "react-icons/bs"
import { useQuery } from "react-query"
import Swal from "sweetalert2"
import { animacaoCarregamento, fecharAnimacaoCarregamento, foiCancelado } from "../../../../utils/animationCarregamento"

export const ActionPesquisaProdutoEtiqueta = ({ usuarioLogado }) => {
  const [descricaoProduto, setDescricaoProduto] = useState('')
  const [codBarrasProduto, setCodBarrasProduto] = useState('')
  const [idProduto, setIDProduto] = useState('')
  const [empresaSelecionada, setEmpresaSelecionada] = useState('');
  const [btnVisivel, setBtnVisivel] = useState(false);
  const [modalImprimir, setModalImprimir] = useState(false);
  const [produtosSelecionados, setProdutosSelecionados] = useState([]);
  const [dadosAcumuladorEtiquetas, setDadosAcumuladorEtiquetas] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [copia, setCopia] = useState(1);

  const { data: dadosListaPrecos = [], error: errorListaPrecos, isLoading: isLoadingListaPrecos, refetch } = useQuery(
    'listas-de-precos-sap',
    async () => {
      const response = await get(`/listas-de-precos-sap`);

      return response.data;
    },
    { enabled: true, staleTime: 60 * 60 * 1000, }
  );

  useEffect(() => {
    if (dadosListaPrecos && usuarioLogado?.IDEMPRESA) {
      const empresa = dadosListaPrecos.find(
        item => item.listaPreco?.IDEMPRESA === usuarioLogado.IDEMPRESA
      );
      if (empresa) {
        setEmpresaSelecionada(empresa.listaPreco?.IDRESUMOLISTAPRECO);
      }
    }
  }, [dadosListaPrecos, usuarioLogado]);


const fetchListaPrecosSap = async () => {
    const urlBase = `/lista-produtos-etiqueta-sap?idLista=${empresaSelecionada}&idProduto=${idProduto}&descricao=${descricaoProduto}&codBarras=${codBarrasProduto}`;
    let urlApi = urlBase.includes('?') ? urlBase : urlBase + '?';
    urlApi = urlApi.replace('&page=1', '').replace('page=1', '');

    const controller = new AbortController();
    let allData = [];

    try {
      animacaoCarregamento('Carregando dados...', true, true, () => controller.abort());

      const primeiraPagina = 1;
      const primeiraResposta = await get(`${urlApi}&page=${primeiraPagina}`, { signal: controller.signal });
      const page = primeiraResposta.page || primeiraPagina;
      const pageSize = primeiraResposta.pageSize || 1000;
      const totalRows = primeiraResposta.rows || primeiraResposta.data?.length || 0;
      const totalPages = Math.ceil(totalRows / pageSize);

      allData = [...(primeiraResposta.data || [])];

      if (totalPages > 1) {
        for (let currentPage = 2; currentPage <= totalPages; currentPage++) {
          if (foiCancelado()) break;
          animacaoCarregamento(`Página ${currentPage} de ${totalPages}`, true, true);
          const responsePage = await get(`${urlApi}&page=${currentPage}`, { signal: controller.signal });
          allData.push(...(responsePage.data || []));
        }
      }

      return allData;
    } catch (error) {
      if (error.code === 'ERR_CANCELED') {
        return allData;
      }
      console.error('Erro ao buscar dados:', error);
      throw error;
    } finally {
      fecharAnimacaoCarregamento();
    }
  };


  const { data: dadosListaPrecosSap = [], error: errorMalotes, isLoading: isLoadingMalotes, refetch: refetchListaPrecosSap } = useQuery(
    ['lista-produtos-etiqueta-sap',],
    () => fetchListaPrecosSap(),
    { enabled: false, staleTime: 60 * 60 * 1000, }
  );

  const handleClick = () => {
    if (codBarrasProduto === '' && descricaoProduto === '' && idProduto === '') {
      Swal.fire({
        title: '<span style="font-size: 18px;">Digite o Identificador, Descrição ou Código de Barras do Produto!</span>',
        html: '<span style="font-size: 16px;">Digite o Identificador, Descrição ou Código de Barras do Produto!</span>',
        icon: 'warning',
      })
    } else {
      refetchListaPrecosSap();

    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleClick();
    }
  };

  const handleCancelar = async (isChecked) => {
    const result = await Swal.fire({
      icon: 'question',
      title: `Deseja Limpar as Etiquetas Guardadas?`,
      text: `Esta ação não poderá ser desfeita!`,
      showCloseButton: true,
      showCancelButton: true,
      cancelButtonColor: '#FD1381',
      confirmButtonColor: '#7352A5',
      confirmButtonText: 'Sim, Limpar!',
      cancelButtonText: 'Não, Voltar!',
      customClass: {
        container: 'custom-swal',
      },
    });

    if (!result.isConfirmed) {
      return;
    }
    setSelectAll(isChecked);
    const updatedSelectedIds = isChecked ? [] : [];
    setSelectedIds(updatedSelectedIds);
    setProdutosSelecionados([]);
    setDadosAcumuladorEtiquetas([]);
    Swal.fire({
      icon: 'success',
      title: 'Cancelado com sucesso',
      showConfirmButton: false,
      timer: 1500
    })
  }

  const handleImprimir = () => {
    setModalImprimir(true);
  }

  const handleAcumuladorEtiquetas = async () => {
    if (produtosSelecionados.length > 0) {
      try {
        setDadosAcumuladorEtiquetas((prev) => {
          let listaAtualizada = [...prev];

          produtosSelecionados.forEach((produto) => {
            const indexExistente = listaAtualizada.findIndex(
              (item) => item.IDPRODUTO === produto.IDPRODUTO
            );

            if (indexExistente !== -1) {
              listaAtualizada[indexExistente] = {
                ...listaAtualizada[indexExistente],
                quantidade: produto.quantidade,
              };
            } else {
              listaAtualizada.push({
                quantidade: produto.quantidade,
                NUCODBARRAS: produto.NUCODBARRAS,
                DSNOME: produto.DSNOME,
                TAMANHO: produto.TAMANHO,
                PRECOVENDA: produto.PRECOVENDA,
                DSESTILO: produto.DSESTILO,
                DSLISTAPRECO: produto.DSLISTAPRECO,
                DSLOCALEXPOSICAO: produto.DSLOCALEXPOSICAO,
                IDPRODUTO: produto.IDPRODUTO,
                MARCA: produto.MARCA,
              });
            }
          });

          return listaAtualizada;
        });

        Swal.fire({
          icon: "success",
          title: "Dados Salvos",
          text: "Os dados foram adicionados à lista!",
        });

      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Valor Inválido",
          text: "O valor deve ser maior que 0 para imprimir etiquetas!",
        });
      }
    }
  };


  return (

    <Fragment>
      <ActionMain
        linkComponentAnterior={["Home"]}
        linkComponent={[""]}
        title="Etiquetagem"
        subTitle={usuarioLogado?.NOFANTASIA}

        InputFieldCodBarraComponent={InputField}
        labelInputFieldCodBarra={"Lista de Preços"}
        valueInputFieldCodBarra={usuarioLogado?.NOFANTASIA}
        isDisabledCodBarra={true}

        InputFieldComponent={InputField}
        labelInputField={"Cód.Barras "}
        valueInputField={codBarrasProduto}
        onKeyDownInputField={handleKeyPress}
        onChangeInputField={(e) => setCodBarrasProduto(e.target.value)}
        placeHolderInputFieldComponent={"Cód.Barras / Nome Produto"}

        InputFieldNumeroNFComponent={InputField}
        labelInputFieldNumeroNF={"Id. Produto"}
        valueInputFieldNumeroNF={idProduto}
        onChangeInputFieldNumeroNF={(e) => setIDProduto(e.target.value)}
        onKeyDownInputFieldNumeroNF={handleKeyPress}
        placeHolderInputFieldNumeroNF={"Id. Produto"}

        InputFieldDescricaoComponent={InputField}
        labelInputFieldDescricao={"Descrição"}
        valueInputFieldDescricao={descricaoProduto}
        onChangeInputFieldDescricao={(e) => setDescricaoProduto(e.target.value)}
        onKeyDownInputFieldDescricao={handleKeyPress}
        placeHolderInputFieldDescricao={"Descrição do Produto"}

        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Pesquisar"}
        onButtonClickSearch={handleClick}
        corSearch={"primary"}
        IconSearch={AiOutlineSearch}

        ButtonTypeCadastro={ButtonType}
        linkNome={'Guardar'}
        onButtonClickCadastro={handleAcumuladorEtiquetas}
        corCadastro={"success"}
        IconCadastro={GoDownload}
        styleCadastro={{ display: btnVisivel ? 'block' : 'none' }}

        ButtonTypeCancelar={ButtonType}
        onButtonClickCancelar={handleImprimir}
        linkCancelar={"Imprimir"}
        corCancelar={"info"}
        IconCancelar={MdOutlineLocalPrintshop}
        styleCancelar={{ display: btnVisivel || dadosAcumuladorEtiquetas.length > 0 ? 'block' : 'none' }}

        ButtonTypeVendasEstrutura={ButtonType}
        onButtonClickVendasEstrutura={handleCancelar}
        linkNomeVendasEstrutura={"Cancelar"}
        corVendasEstrutura={"danger"}
        iconVendasEstrutura={BsTrash3}
        styleVendasEstrutura={{ display: dadosAcumuladorEtiquetas.length > 0 ? 'block' : 'none' }}
      />

      <ActionListaProdutoEtiqueta
        dadosListaPrecosSap={dadosListaPrecosSap}
        btnVisivel={btnVisivel}
        setBtnVisivel={setBtnVisivel}
        setModalImprimir={setModalImprimir}
        modalImprimir={modalImprimir}
        produtosSelecionados={produtosSelecionados}
        setProdutosSelecionados={setProdutosSelecionados}
        dadosAcumuladorEtiquetas={dadosAcumuladorEtiquetas}

        setDadosAcumuladorEtiquetas={setDadosAcumuladorEtiquetas}
        selectAll={selectAll}
        setSelectAll={setSelectAll}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        copia={copia}
        setCopia={setCopia}
      />
    </Fragment>
  )
}