import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import Swal from 'sweetalert2';
import { get, put } from "../../../../../api/funcRequest";
import { getDataAtual } from "../../../../../utils/dataAtual";
import { removerFormatacaoMoeda } from "../../../../../utils/formatMoeda";
import { registrarLogAuditoria } from "../../../../../services/auditLog";

export const useAjusteDespesa = ({ dadosDespesasLojaDetalhe, usuarioLogado, handleClose, optionsModulos, handleClick }) => {
  const [dataDespesa, setDataDespesa] = useState('');
  const [horarioAtual, setHorarioAtual] = useState('');
  const [despesaSelecionada, setDespesaSelecionada] = useState(null);
  const [dsHistorio, setDsHistorio] = useState('');
  const [dsPagoA, setDsPagoA] = useState('');
  const [vrDespesa, setVrDespesa] = useState('');
  const [tpNota, setTpNota] = useState('');
  const [nuNotaFiscal, setNuNotaFiscal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [empresa, setEmpresa] = useState('')

  const { data: dadosReceitaDespesa = [], error: errorDespesasLoja, isLoading: isLoadingDespesasLoja } = useQuery(
    'categoria-receita-despesa',
    async () => {
      const response = await get(`/categoria-receita-despesa`);
      return response.data;
    },
    { staleTime: 60 * 60 * 1000, cacheTime: 5 * 60 * 1000 }
  );

  useEffect(() => {
    const currentDate = new Date();
    const formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setHorarioAtual(formattedTime);
    const dataAtual = getDataAtual();
    setDataDespesa(dataAtual);
  }, []);

  useEffect(() => {
    if (dadosDespesasLojaDetalhe) {
      setDespesaSelecionada({ value: dadosDespesasLojaDetalhe[0]?.IDCATEGORIARECEITADESPESA, label: `${dadosDespesasLojaDetalhe[0]?.DSCATEGORIARECDESP} `});
      setDsHistorio(dadosDespesasLojaDetalhe[0]?.DSHISTORICO);
      setDsPagoA(dadosDespesasLojaDetalhe[0]?.DSPAGOA);
      setEmpresa(dadosDespesasLojaDetalhe[0]?.NOFANTASIA)
      setDataDespesa(dadosDespesasLojaDetalhe[0]?.DTDESPESAUPDATE)
      const tpNotaMapeado = dadosDespesasLojaDetalhe[0]?.TPNOTA == '2' ? 'NFCe' : 'NFe';
      setTpNota({ value: tpNotaMapeado, label: tpNotaMapeado });
      setNuNotaFiscal(dadosDespesasLojaDetalhe[0]?.NUNOTAFISCAL);
      setVrDespesa(dadosDespesasLojaDetalhe[0]?.VRDESPESA);
    }
  }, [dadosDespesasLojaDetalhe]);

  const onSubmit = async () => {
    if(optionsModulos[0]?.ALTERAR == 'False') {
      Swal.fire({
        icon: 'warning',
        title: 'Atenção',
        html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para Editar Despesas.`,
        icon: 'warning',
        timer: 3000,
        customClass: {
          container: 'custom-swal',
        }
      });
      return;
    }

    const postData = {
      IDDESPESASLOJA: parseInt(dadosDespesasLojaDetalhe[0]?.IDDESPESASLOJA),
      IDCATEGORIARECEITADESPESA: parseInt(despesaSelecionada?.value),
      VRDESPESA: removerFormatacaoMoeda(vrDespesa),
      DSPAGOA: dsPagoA,
      DSHISTORIO: dsHistorio,
      TPNOTA: tpNota?.value,
      NUNOTAFISCAL: nuNotaFiscal,
      IDUSRCACELAMENTO: parseInt(usuarioLogado.id),
      DSMOTIVOCANCELAMENTO: 'Despesa Editada',
      DTDESPESA: dataDespesa + ' ' + horarioAtual,
    }

    try {
      
      const response = await put('/editar-despesa/:id', postData)
      await registrarLogAuditoria({
        idFuncionario: usuarioLogado?.id,
        pathFuncao: 'FINANCEIRO/EDIÇÃO DE DESPESA',
        dados: postData
      })
      
      Swal.fire({
        title: 'Sucesso',
        text: 'Despesa alterada com Sucesso',
        icon: 'success',
        timer: 3000,
        customClass: {
          container: 'custom-swal',
        }
      })

      handleClose();
      handleClick()
      return response.data;
  } catch (error) {
    await registrarLogAuditoria({
        idFuncionario: usuarioLogado?.id,
        pathFuncao: 'FINANCEIRO/ERRO AO EDITAR DESPESA',
        dados: postData
    })
      
    Swal.fire({
      title: 'Erro',
      text: 'Erro ao Tentar Editar Despesa',
      icon: 'error',
      timer: 5000,
      customClass: {
        container: 'custom-swal',
      }
    })
    return;
  } 
}

  const Options = [
    { id: 0, value: "NFCe", label: "NFCe" },
    { id: 1, value: "NFe", label: "NFe" },
  ]

  return {
    empresa,
    setEmpresa,
    despesaSelecionada,
    dsHistorio,
    dsPagoA,
    vrDespesa,
    tpNota,
    nuNotaFiscal,
    usuarioLogado,
    isSubmitting,
    horarioAtual,
    setHorarioAtual,
    dataDespesa,
    setDataDespesa,
    setVrDespesa,
    setDespesaSelecionada,
    setDsHistorio,
    setDsPagoA,
    setTpNota,
    Options,
    dadosReceitaDespesa,
    onSubmit,
  }
}