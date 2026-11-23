import Swal from "sweetalert2"
import { useEffect, useState } from "react"
import { get, put } from "../../../../../api/funcRequest"
import { situacao } from "../../../../../../parceiro.json"
import { useQuery } from "react-query"
import { registrarLogAuditoria } from "../../../../../services/auditLog"

export const useEditarListaPrecos = ({ optionsModulos, usuarioLogado, dadosListaLoja, handleClose, refetchListaPreco }) => {
  const [descricao, setDescricao] = useState('')
  const [statusSelecionado, setStatusSelecionado] = useState([])
  const [empresaSelecionada, setEmpresaSelecionada] = useState([]);
  const [nomeListaPreco, setNomeListaPreco] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);

  const { data: dadosEmpresas = [], error: errorEmpresas, isLoading: isLoadingEmpresas, refetch: refetchEmpresas } = useQuery(
    ['empresas'],
    async () => {
      const response = await get(`/empresas`);

      return response.data;
    },
    { enabled: true, staleTime: 60 * 60 * 1000, }
  );

  useEffect(() => {
    if (dadosListaLoja && dadosListaLoja.length > 0) {
      const empresas = dadosListaLoja[0]?.detalheLista?.map(detalhe => ({
        IDEMPRESA: detalhe.loja?.IDEMPRESA,
        NOFANTASIA: detalhe.loja?.NOFANTASIA,
        STATIVO: detalhe.loja?.STATIVO,
        IDGRUPOEMPRESARIAL: detalhe.loja?.IDGRUPOEMPRESARIAL,
      })) || [];

      const empresaIds = empresas.map(empresa => empresa.IDEMPRESA);

      setEmpresaSelecionada(empresas);
      setSelectedIds(empresaIds);

      if (dadosEmpresas.length > 0 && empresaIds.length === dadosEmpresas.length) {
        setSelectAllChecked(true);
      }
    }
  }, [dadosListaLoja, dadosEmpresas]);

  useEffect(() => {
    if (dadosListaLoja && dadosListaLoja.length > 0) {
      setStatusSelecionado({ value: dadosListaLoja[0]?.listaPreco.STATIVO == 'True' ? 'True' : 'False', label: dadosListaLoja[0]?.listaPreco.STATIVO == 'True' ? 'ATIVO' : 'INATIVO' })
      setNomeListaPreco(dadosListaLoja[0]?.listaPreco.NOMELISTA)
    }
  }, [dadosListaLoja])

  const onSubmit = async () => {

    if (optionsModulos[0]?.ALTERAR == 'False') {
      Swal.fire({
        icon: 'info',
        title: 'Acesso Negado!',
        html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para alterar Lista de Preços!`,
        timer: 5000,
        customClass: {
          container: 'custom-swal',
        },
      });
      return;
    }

    const IDRESUMOLISTAPRECO = Number(dadosListaLoja[0]?.listaPreco.IDRESUMOLISTAPRECO);
    const NOMELISTA = nomeListaPreco;
    const IDUSERALTERACAO = usuarioLogado?.id;
    const STATIVO = statusSelecionado?.value;

    let dadosDetalheLista = [];

    if (empresaSelecionada && empresaSelecionada.length > 0) {
      empresaSelecionada.forEach((empresa) => {
        const detalheExistente = dadosListaLoja?.find(item =>
          item.detalheLista?.some(detalhe => detalhe.IDEMPRESA === empresa.IDEMPRESA)
        );

        const IDDETALHELISTAPRECO = detalheExistente?.detalheLista?.find(
          detalhe => detalhe.IDEMPRESA === empresa.IDEMPRESA
        )?.IDDETALHELISTAPRECO || null;

        const IDGRUPOEMPRESARIAL = empresa.IDGRUPOEMPRESARIAL ? Number(empresa.IDGRUPOEMPRESARIAL) : null;
        const IDEMPRESA = empresa.IDEMPRESA ? Number(empresa.IDEMPRESA) : null;
        const STATIVOLOJA = empresa.STATIVO;

        dadosDetalheLista.push({
          IDDETALHELISTAPRECO: IDDETALHELISTAPRECO ? Number(IDDETALHELISTAPRECO) : null,
          IDRESUMOLISTAPRECO,
          IDGRUPOEMPRESARIAL,
          IDEMPRESA,
          STATIVO: STATIVOLOJA
        });
      });
    }

    const dadosLista = {
      IDRESUMOLISTAPRECO,
      NOMELISTA,
      IDUSERCRIACAO: dadosListaLoja[0]?.listaPreco.IDUSERCRIACAO,
      IDUSERALTERACAO: usuarioLogado?.id,
      STATIVO,
      lojas: dadosDetalheLista
    };


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
      const response = await put('/lista-de-preco/:id', dadosLista);

      await registrarLogAuditoria({
        idFuncionario: usuarioLogado?.id,
        pathFuncao: 'CADASTRO / ALTERAÇÃO DE LISTA DE PREÇOS',
        dados: dadosLista
      })

      Swal.fire({
        icon: 'success',
        title: 'Sucesso',
        text: 'Lista de preço atualizada com sucesso!',
        timer: 5000,
        customClass: {
          container: 'custom-swal',
        },
      })

      handleClose();
      refetchListaPreco();
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar lista de preço:', error);

      await registrarLogAuditoria({
        idFuncionario: usuarioLogado?.id,
        pathFuncao: 'CADASTRO / ERRO AO ALTERAR DE LISTA DE PREÇOS',
        dados: dadosLista
      })
      
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Erro ao atualizar a lista de preço, tente novamente!',
        customClass: {
          container: 'custom-swal',
        },
      });
      return;
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
    situacao,
    dadosEmpresas,
    selectedIds,
    setSelectedIds,
    selectAllChecked,
    setSelectAllChecked,
    onSubmit,
  }
}