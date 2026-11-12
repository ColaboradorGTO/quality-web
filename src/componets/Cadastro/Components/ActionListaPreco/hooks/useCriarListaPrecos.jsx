import Swal from "sweetalert2"
import { useEffect, useState } from "react"
import { get, post } from "../../../../../api/funcRequest"
import { situacao } from "../../../../../../parceiro.json"
import { useQuery } from "react-query"
import { getDataAtual } from "../../../../../utils/dataAtual"
import { registrarLogAuditoria } from "../../../../../services/auditLog"


export const useCriarListaPrecos = ({optionsModulos, usuarioLogado, dadosListaPreco, handleClose, refetchListaPreco }) => {
  const [descricao, setDescricao] = useState('')
  const [statusSelecionado, setStatusSelecionado] = useState({ value: 'True', label: 'ATIVO' })
  const [empresaSelecionada, setEmpresaSelecionada] = useState([]);
  const [nomeListaPreco, setNomeListaPreco] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [dataCriacao, setDataCriacao] = useState('');

  useEffect(() => {
    const dataAtual = getDataAtual();
    setDataCriacao(dataAtual);
  }, [])

  const { data: dadosEmpresas = [], error: errorEmpresas, isLoading: isLoadingEmpresas, refetch: refetchEmpresas } = useQuery(
    ['empresas'],
    async () => {
      const response = await get(`/empresas`);

      return response.data;
    },
    { enabled: true, staleTime: 60 * 60 * 1000, }
  );
  
  const onSubmit = async () => {

    if (optionsModulos[0]?.CRIAR == 'False') {
      Swal.fire({
        icon: 'info',
        title: 'Acesso Negado!',
        html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para criar Lista de Preços!`,
        timer: 5000,
        customClass: {
          container: 'custom-swal',
        },
      });
      return;
    }

    
    const NOMELISTA = nomeListaPreco;
    const IDUSERCRIACAO = usuarioLogado?.id; 
    const STATIVO = statusSelecionado?.value;
    let dadosDetalheLista = [];

    if (empresaSelecionada && empresaSelecionada.length > 0) {
      empresaSelecionada.forEach((empresa) => {
        const IDGRUPOEMPRESARIAL = empresa.IDGRUPOEMPRESARIAL ? Number(empresa.IDGRUPOEMPRESARIAL) : null;
        const IDEMPRESA = empresa.IDEMPRESA ? Number(empresa.IDEMPRESA) : null;
        const STATIVOLOJA = empresa.STATIVO;

        dadosDetalheLista.push({
          IDDETALHELISTAPRECO: null,
          IDRESUMOLISTAPRECO: null,
          IDGRUPOEMPRESARIAL,
          IDEMPRESA,
          STATIVO: STATIVOLOJA
        });
      });
    }

    const dadosLista = {
      IDRESUMOLISTAPRECO: null,
      NOMELISTA,
      IDUSERCRIACAO,
      IDUSERALTERACAO: null,
      STATIVO,
      lojas: dadosDetalheLista
    };

    if (!dadosLista?.NOMELISTA.length || dadosLista?.NOMELISTA.length < 10) {
      Swal.fire({
        icon: 'warning',
        title: 'Atenção',
        text: 'Lista Sem Nome ou Nome Muito Curto, favor adicionar o nome da lista e tentar novamente!',
        timer: 10000,
        showConfirmButton: true,
        customClass: {
          container: 'custom-swal',
        },
      });
      return;
    }
   
    if (!dadosDetalheLista.length) {
      Swal.fire({
        icon: 'warning',
        title: 'Atenção', 
        text: 'Lista Sem Lojas Selecionadas, favor selecionar as lojas e tentar novamente!',
        timer: 10000,
        showConfirmButton: true,
        customClass: {
          container: 'custom-swal',
        },
      });
      return;
    }

    try {

      const response = await post('/criar-lista-de-preco', dadosLista);

      await Swal.fire({
        icon: 'success',
        title: 'Sucesso!',
        text: response.msg,
        customClass: {
          container: 'custom-swal',
        }
      });

      handleClose();
      refetchListaPreco();


      await registrarLogAuditoria({
        idFuncionario: usuarioLogado?.id,
        pathFuncao: 'CADASTRO /CRIAÇÃO DE LISTA DE PREÇOS',
        dados: dadosLista
      })

      setNomeListaPreco('');
      setEmpresaSelecionada([]);
      setSelectedIds([]);
      setSelectAllChecked(false);
      setStatusSelecionado({ value: 'True', label: 'ATIVO' });

      return response.data;
    } catch (error) {
      console.error('Erro ao criar lista de preço:', error);

      await registrarLogAuditoria({
        idFuncionario: usuarioLogado?.id,
        pathFuncao: 'CADASTRO /ERRO AO CRIAR LISTA DE PREÇOS',
        dados: dadosLista
      })

      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Erro ao criar a lista de preço, tente novamente!',
        customClass: {
          container: 'custom-swal',
        },
      });
    }
  }


  return {
    descricao,
    setDescricao,
    statusSelecionado,
    setStatusSelecionado,
    empresaSelecionada,
    setEmpresaSelecionada,
    nomeListaPreco,
    setNomeListaPreco,
    dataCriacao,
    setDataCriacao,
    situacao,
    dadosEmpresas,
    selectedIds,
    setSelectedIds,
    selectAllChecked,
    setSelectAllChecked,
    onSubmit,
  }
}