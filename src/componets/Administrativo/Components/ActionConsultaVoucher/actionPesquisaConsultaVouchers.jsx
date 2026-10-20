import React, { Fragment, useState, useEffect } from "react"
import { get } from "../../../../api/funcRequest";
import { ActionMain } from "../../../Actions/actionMain";
import { InputField } from "../../../Buttons/Input";
import { ButtonType } from "../../../Buttons/ButtonType";
import { AiOutlineSearch } from "react-icons/ai";
import { ActionListaConsultaVouchers } from "./actionListaConsultaVouchers";
import { getDataAtual } from "../../../../utils/dataAtual";
import { InputSelectAction } from "../../../Inputs/InputSelectAction";
import { useQuery } from "react-query";
import { animacaoCarregamento, fecharAnimacaoCarregamento, foiCancelado } from "../../../../utils/animationCarregamento";

export const ActionPesquisaConsultaVouchers = ({ usuarioLogado }) => {
  const [tabelaVisivel, setTabelaVisivel] = useState(false);
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('')
  const [dataPesquisaFim, setDataPesquisaFim] = useState('')
  const [numeroVoucher, setNumeroVoucher] = useState(0);
  const [empresaSelecionada, setEmpresaSelecionada] = useState('');
  const [empresaSelecionadaNome, setEmpresaSelecionadaNome] = useState('');
  const [marcaSelecionada, setMarcaSelecionada] = useState('')
  const [menuFilhoAtual, setMenuFilhoAtual] = useState(null);

  useEffect(() => {
    const dataInicial = getDataAtual()
    const dataFinal = getDataAtual()
    setDataPesquisaInicio(dataInicial)
    setDataPesquisaFim(dataFinal)
  }, []);

  useEffect(() => {
    const menuSalvo = localStorage.getItem('menuFilhoSelecionado');
    if (menuSalvo) {
      const menuParsed = JSON.parse(menuSalvo);
      setMenuFilhoAtual(menuParsed);
    }
  }, []);

  const { data: optionsModulos = [], error: errorModulos, isLoading: isLoadingModulos, refetch: refetchModulos } = useQuery(
    ['menus-usuario-excecao', menuFilhoAtual?.ID],
    async () => {
      const response = await get(`/menus-usuario-excecao?idUsuario=${usuarioLogado?.id}&idMenuFilho=${menuFilhoAtual?.ID}`);

      return response.data;
    },
    { enabled: Boolean(usuarioLogado?.id), staleTime: 60 * 60 * 1000, }
  );

  const { data: optionsMarcas = [], error: errorMarcas, isLoading: isLoadingMarcas, refetch: refetchMarcas } = useQuery(
    'marcasLista',
    async () => {
      const response = await get(`/marcasLista`);
      return response.data;
    },
    { enabled: true, staleTime: 60 * 60 * 1000 }
  );

  const { data: optionsEmpresas = [], error: errorEmpresas, isLoading: isLoadingEmpresas, refetch: refetchEmpresas } = useQuery(
    'listaEmpresaComercial',
    async () => {
      const response = await get(`/listaEmpresaComercial?idMarca=${marcaSelecionada}`);

      return response.data;
    },
    { enabled: Boolean(marcaSelecionada), staleTime: 60 * 60 * 1000, }
  );

  const fetchListaVouchers = async () => {
    const numeroVoucherFormatado = String(numeroVoucher ?? '').trim();
    const partesVoucher = numeroVoucherFormatado.split('-');

    const voucher = partesVoucher.length > 2
      ? partesVoucher.join('-')
      : numeroVoucherFormatado.replace(/[^0-9]/g, '');

    const idEmpresa = voucher ? '' : empresaSelecionada;
    const dtInicio = voucher ? '' : dataPesquisaInicio;
    const dtFim = voucher ? '' : dataPesquisaFim;

    const params = new URLSearchParams({
      dataPesquisaInicio: dtInicio,
      dataPesquisaFim: dtFim,
      dadosVoucher: voucher,
      subgrupoEmpresa: marcaSelecionada,
      idEmpresa,
      pageSize: '20000',
    });

    const controller = new AbortController();
    let allData = [];

    try {
      animacaoCarregamento(
        'Carregando dados, aguarde...',
        true,
        true,
        () => controller.abort()
      );

      const response = await get(
        `/voucher-completo?${params.toString()}`,
        { signal: controller.signal }
      );

      const resultado = response?.data ?? response;

      if (Array.isArray(resultado)) {
        allData = resultado;
      } else if (Array.isArray(resultado?.data)) {
        allData = resultado.data;
      }

      return allData;

    } catch (error) {
      if (
        error.code === 'ERR_CANCELED' ||
        error.name === 'CanceledError' ||
        foiCancelado()
      ) {
        return allData;
      }

      console.error('Erro ao buscar vouchers:', error);
      throw error;

    } finally {
      fecharAnimacaoCarregamento();
    }
  };

  const { data: dadosVoucher = [], error: errorVendasMarca, isLoading: isLoadingVendasMarca, refetch: refetchDetalheVoucherDados } = useQuery(
    ['voucher-completo',],
    () => fetchListaVouchers(),
    { enabled: false, }
  );

  const handleSelectGrupo = (e) => {
    setMarcaSelecionada(e.value);
  };

  const handleChangeEmpresa = (e) => {
    if (e.value === '') {
      setEmpresaSelecionada('');
    } else {
      const empresa = optionsEmpresas.find((item) => item.IDEMPRESA === e.value);
      setEmpresaSelecionada(e.value);
      setEmpresaSelecionadaNome(empresa.NOFANTASIA);
    }
  }

  const handleClick = async () => {
    const voucherDigitado = String(numeroVoucher ?? '').trim();
    const partesVoucher = voucherDigitado.split('-');

    const voucherFormatado = partesVoucher.length > 2
      ? partesVoucher.join('-')
      : voucherDigitado.replace(/[^0-9]/g, '');

    setNumeroVoucher(voucherFormatado);

    if (!voucherFormatado) {
      const dtInicioTime = new Date(dataPesquisaInicio);
      const dtFimTime = new Date(dataPesquisaFim);

      if (
        !dataPesquisaInicio ||
        Number.isNaN(dtInicioTime.getTime())
      ) {
        await Swal.fire({
          icon: 'error',
          title: 'Data INÍCIO inválida!',
        });

        return;
      }

      if (
        !dataPesquisaFim ||
        Number.isNaN(dtFimTime.getTime())
      ) {
        await Swal.fire({
          icon: 'error',
          title: 'Data FIM inválida!',
        });

        return;
      }

      if (dtInicioTime.getTime() > dtFimTime.getTime()) {
        await Swal.fire({
          icon: 'error',
          title: 'Data de início deve ser menor que a data de fim!',
        });

        return;
      }
    }

    try {
      setTabelaVisivel(true);
      await refetchDetalheVoucherDados();
    } catch (error) {
      console.error('Erro ao pesquisar vouchers:', error);

      await Swal.fire({
        icon: 'error',
        title: 'Erro ao pesquisar vouchers!',
        text: 'Não foi possível carregar os dados.',
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleClick();
    }
  };

  return (

    <Fragment>

      <ActionMain
        linkComponentAnterior={["Home"]}
        linkComponent={["Vouchers"]}
        title="Vouchers - Detalhado"
        subTitle={empresaSelecionadaNome}

        InputFieldDTInicioComponent={InputField}
        valueInputFieldDTInicio={dataPesquisaInicio}
        labelInputFieldDTInicio={"Data Início"}
        onChangeInputFieldDTInicio={(e) => setDataPesquisaInicio(e.target.value)}
        onKeyDownInputFieldDTInicio={handleKeyPress}

        InputFieldDTFimComponent={InputField}
        labelInputFieldDTFim={"Data Fim"}
        valueInputFieldDTFim={dataPesquisaFim}
        onChangeInputFieldDTFim={(e) => setDataPesquisaFim(e.target.value)}
        onKeyDownInputFieldDTFim={handleKeyPress}

        InputSelectMarcasComponent={InputSelectAction}
        labelSelectMarcas={"Marca"}
        optionsMarcas={[
          { value: '0', label: 'Selecionar Marca' },
          ...optionsMarcas.map((marca) => {
            return {
              value: marca.IDGRUPOEMPRESARIAL,
              label: marca.DSGRUPOEMPRESARIAL,
            }
          })
        ]}
        valueSelectMarca={marcaSelecionada}
        onChangeSelectMarcas={handleSelectGrupo}

        InputSelectEmpresaComponent={InputSelectAction}
        labelSelectEmpresa={"Lojas"}
        optionsEmpresas={[
          { value: '', label: 'Todas' },
          ...optionsEmpresas.map((empresa) => ({
            value: empresa.IDEMPRESA,
            label: empresa.NOFANTASIA,
          }))
        ]}
        valueSelectEmpresa={empresaSelecionada}
        onChangeSelectEmpresa={handleChangeEmpresa}

        InputFieldNumeroVoucherComponent={InputField}
        labelInputFieldNumeroVoucher={"Voucher - Nº Venda ou CPF/CNPJ"}
        onChangeInputFieldNumeroVoucher={(e) => setNumeroVoucher(e.target.value)}
        valueInputFieldNumeroVoucher={numeroVoucher}
        onKeyDownInputFieldNumeroVoucher={handleKeyPress}

        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Pesquisar"}
        onButtonClickSearch={handleClick}
        corSearch={"primary"}
        IconSearch={AiOutlineSearch}
      />

      <ActionListaConsultaVouchers
        dadosVoucher={dadosVoucher}
        usuarioLogado={usuarioLogado}
        optionsModulos={optionsModulos}
        handleClick={handleClick}
      />
    </Fragment>
  )
}