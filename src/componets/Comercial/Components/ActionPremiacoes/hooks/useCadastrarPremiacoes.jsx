import React, { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import { getDataAtual } from "../../../../../utils/dataAtual";
import { get, post } from "../../../../../api/funcRequest";
import { removerFormatacaoMoeda } from "../../../../../utils/formatMoeda";
import { useQuery } from "react-query";
import { registrarLogAuditoria } from "../../../../../services/auditLog";

export const useCadastrarPremiacoes = ({ handleClose, usuarioLogado, optionsModulos, marcaSelecionada }) => {
  const [grupoEmpresarial, setGrupoEmpresarial] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [funcaoSelecionada, setFuncaoSelecionada] = useState('');
  const [indicadorSelecionado, setIndicadorSelecionado] = useState('');
  const [apuracaoSelecionada, setApuracaoSelecionada] = useState('');
  const [valorBonusSenior, setValorBonusSenior] = useState('0');
  const [valorBonusPleno, setValorBonusPleno] = useState('0');
  const [valorBonusJunior, setValorBonusJunior] = useState('0');
  const [valorBonusTodos, setValorBonusTodos] = useState('0');


  useEffect(() => {
    const dataAtual = getDataAtual();
    setDataInicio(dataAtual);
    setDataFim(dataAtual);
  }, [])


  const { data: dadosPremiacaoCadastrada = [], error: errorPremiacaoCadastrada, isLoading: isLoadingPremiacaoCadastrada, refetch: refetchPremiacaoCadastrada } = useQuery(
    ['lista-premiacao-cadastrada'],
    async () => {
      const response = await get(`/lista-premiacao-cadastrada?idSubGrupo=${marcaSelecionada?.value}&dataPesquisaInicio=${dataInicio}&dataPesquisaFim=${dataFim}`);

      return response.data;
    },
    { enabled: true, staleTime: 5 * 60 * 1000, }
  );

  const onSubmit = async (e) => {

    if (optionsModulos[0]?.CRIAR == 'False') {
      Swal.fire({
        title: 'Acesso Negado',
        html: `${usuarioLogado?.NOFUNCIONARIO} <br/> não tem permissão para realizar esta ação!`,
        icon: 'error',
        confirmButtonText: 'Ok',
        timer: 6000,
        customClass: {
          container: 'custom-swal',
        }
      })
      return;
    }

    const postData = {
      DTPREMIOINICIO: dataInicio,
      DTPREMIOFIM: dataFim,
      IDSUBGRUPOEMPRESARIAL: parseInt(marcaSelecionada?.value),
      NOFUNCAO: funcaoSelecionada?.value,
      NOINDICADOR: indicadorSelecionado?.value,
      TPAPURACAO: apuracaoSelecionada?.value,
      VRBONUSSENIOR: parseFloat(removerFormatacaoMoeda(valorBonusSenior)),
      VRBONUSPLENO: parseFloat(removerFormatacaoMoeda(valorBonusPleno)),
      VRBONUSJUNIOR: parseFloat(removerFormatacaoMoeda(valorBonusJunior)),
      VRBONUSTODOS: parseFloat(removerFormatacaoMoeda(valorBonusTodos)),
      STATIVO: 'True'
    }

    try {
      const response = await post('/cadastra-premiacoes', postData)

      Swal.fire({
        title: 'Atualização',
        text: 'Atualização Realizada com Sucesso',
        icon: 'success',
        timer: 5000,
        customClass: {
          container: 'custom-swal',
        }
      })

      await registrarLogAuditoria({
        idFuncionario: usuarioLogado?.id,
        pathFuncao: 'COMERCIAL / CADASTRO DE PREMIAÇÕES',
        dados: postData
      });

      refetchPremiacaoCadastrada(); 
      handleClose()
      return response.data;
    } catch (error) {
      await registrarLogAuditoria({
        idFuncionario: usuarioLogado?.id,
        pathFuncao: 'COMERCIAL / ERRO AO CADASTRAR PREMIAÇÕES',
        dados: postData
      });

      Swal.fire({
        title: 'Erro ao Cadastrar',
        text: 'Erro ao Tentar Cadastrar Premiações',
        icon: 'error',
        timer: 3000,
        customClass: {
          container: 'custom-swal',
        }
      })
      console.error('Erro ao parsear o usuário do localStorage:', error);
      return;
    }
  }

  return {
    grupoEmpresarial,
    setGrupoEmpresarial,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
    funcaoSelecionada,
    setFuncaoSelecionada,
    indicadorSelecionado,
    setIndicadorSelecionado,
    apuracaoSelecionada,
    setApuracaoSelecionada,
    valorBonusSenior,
    setValorBonusSenior,
    valorBonusPleno,
    setValorBonusPleno,
    valorBonusJunior,
    setValorBonusJunior,
    valorBonusTodos,
    setValorBonusTodos,
    dadosPremiacaoCadastrada,
    onSubmit
  }
}