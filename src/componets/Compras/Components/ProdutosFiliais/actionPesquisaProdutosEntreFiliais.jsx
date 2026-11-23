import { Fragment, useState } from "react"
import { InputField } from "../../../Buttons/Input"
import { ActionMain } from "../../../Actions/actionMain"
import { AiOutlineSearch } from "react-icons/ai"
import { InputSelectAction } from "../../../Inputs/InputSelectAction"
import { ActionListaProdutos } from "./actionListaProdutos"
import { ButtonType } from "../../../Buttons/ButtonType"
import { get } from "../../../../api/funcRequest"
import { useQuery } from "react-query"
import { animacaoCarregamento, fecharAnimacaoCarregamento } from "../../../../utils/animationCarregamento"
import Swal from "sweetalert2"


export const ActionPesquisaProdutosEntreFiliais = () => {
  const [empresaOrigem, setEmpresaOrigem] = useState('')
  const [empresaDestino, setEmpresaDestino] = useState('')
  const [descricaoProduto, setDescricaoProduto] = useState('')
  const [codBarrasProduto, setCodBarrasProduto] = useState('')
  const [idProduto, setIDProduto] = useState('')
  
  const { data: optionsEmpresas = [], error: errorEmpresas, isLoading: isLoadingEmpresas, refetch } = useQuery(
    'empresas',
    async () => {
    const response = await get(`/empresas`);

    return response.data;
    },
    { enabled: true, staleTime: 60 * 60 * 1000 }
 );

  const fetchProdutos = async () => {
     const urlBase = `/produtos-entre-filiais?idFilialOrigem=${empresaOrigem}&idFilialDestino=${empresaDestino}&idProduto=${idProduto}&descricaoProduto=${descricaoProduto}&codBarras=${codBarrasProduto}`;
     let urlApi = urlBase.includes('?') ? urlBase : urlBase + '?';
     urlApi = urlApi.replace('&page=1', '').replace('page=1', '');
 
     try {
       animacaoCarregamento('Carregando dados...', true);
 
       const primeiraPagina = 1;
       const primeiraResposta = await get(`${urlApi}&page=${primeiraPagina}`);
       const page = primeiraResposta.page || primeiraPagina;
       const pageSize = primeiraResposta.pageSize || 1000;
       const totalRows = primeiraResposta.rows || primeiraResposta.data?.length || 0;
       const totalPages = Math.ceil(totalRows / pageSize);
 
       let allData = [...(primeiraResposta.data || [])];
 
       if (totalPages > 1) {
         for (let currentPage = 2; currentPage <= totalPages; currentPage++) {
           animacaoCarregamento(`Página ${currentPage} de ${totalPages}`, true);
           const responsePage = await get(`${urlApi}&page=${currentPage}`);
           allData.push(...(responsePage.data || []));
         }
       }
 
       return allData;
     } catch (error) {
       console.error('Erro ao buscar dados da api:', error);
       throw error;
     } finally {
       fecharAnimacaoCarregamento();
     }
 
   };

   const { data: dadosProdutos = [], error: errorProdutos, isLoading: isLoadingProdutos, refetch: refetchProdutos } = useQuery(
     ['produtos-entre-filiais',],
     () => fetchProdutos(),
     { enabled: false, }
   );


  const handleClick = () => {
    if(empresaOrigem === '' || empresaDestino === '') {
      Swal.fire({
        title: 'Atenção!',
        text: `É obrigatório selecionar as duas Filiais para realizar a pesquisa de Produtos entre Filiais!`,
        icon: 'warning',
        customClass: {
          container: 'custom-swal',
        },

      })
      return
    } else if(descricaoProduto === '' && codBarrasProduto === '' && idProduto === '') {
        Swal.fire({
          title: 'Atenção!',
          text: `Preencha a informação do produto e tente novamente!`,
          icon: 'warning',
          customClass: {
            container: 'custom-swal',
          },
        })
      return
    } else {
        refetchProdutos()
    }
  }



  return (

    <Fragment>

      <ActionMain
        linkComponentAnterior={["Home"]}
        linkComponent={[""]}
        title="Lista de Produtos"
        subTitle="Nome da Loja"

        InputSelectEmpresaComponent={InputSelectAction}
        labelSelectEmpresa={"Filial Origem"}
        optionsEmpresas={[
          {value: '', label: 'Selecionar Empresa'},
          ...optionsEmpresas.map((item) => {
            return {
              value: item.IDEMPRESA,
              label: item.NOFANTASIA
            }
          })
        ]}
        valueSelectEmpresa={empresaOrigem}
        onChangeSelectEmpresa={(e) => setEmpresaOrigem(e.value)}

        InputSelectGrupoComponent={InputSelectAction}
        labelSelectGrupo={"Filial Destino"}
        optionsGrupos={[
            {value: '', label: 'Selecionar Empresa'},
            ...optionsEmpresas.map((item) => {
              return {
                value: item.IDEMPRESA,
                label: item.NOFANTASIA
              }
            })
        ]}
        valueSelectGrupo={empresaDestino}
        onChangeSelectGrupo={(e) => setEmpresaDestino(e.value)}

        InputFieldComponent={InputField}
        labelInputField={"Cód.Barras "}
        valueInputField={codBarrasProduto}
        onChangeInputField={(e) => setCodBarrasProduto(e.target.value)}
        placeHolderInputFieldComponent={"Cód.Barras / Nome Produto"}

        InputFieldNumeroNFComponent={InputField}
        labelInputFieldNumeroNF={"Id. Produto"}
        valueInputFieldNumeroNF={idProduto}
        onChangeInputFieldNumeroNF={(e) => setIDProduto(e.target.value)}
        placeHolderInputFieldNumeroNF={"Id. Produto"}

        InputFieldDescricaoComponent={InputField}
        labelInputFieldDescricao={"Descrição"}
        valueInputFieldDescricao={descricaoProduto}
        onChangeInputFieldDescricao={(e) => setDescricaoProduto(e.target.value)}
        placeHolderInputFieldDescricao={"Descrição do Produto"}

        
        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Pesquisar"}
        onButtonClickSearch={handleClick}
        corSearch={"primary"}
        IconSearch={AiOutlineSearch}
      />

      <ActionListaProdutos dadosProdutos={dadosProdutos} />
    </Fragment>
  )
}