import { Fragment, useEffect, useState } from "react"
import { get } from "../../../../api/funcRequest";
import { ActionMain } from "../../../Actions/actionMain";
import { InputField } from "../../../Buttons/Input";
import { InputSelectAction } from "../../../Inputs/InputSelectAction";
import { getDataAtual } from "../../../../utils/dataAtual";
import { ActionListaVendasXML } from "./actionListaVendasXML";
import { ButtonType } from "../../../Buttons/ButtonType";
import { useQuery } from "react-query";
import { animacaoCarregamento, fecharAnimacaoCarregamento, foiCancelado } from "../../../../utils/animationCarregamento";
import { AiOutlineDownload, AiOutlineSearch } from "react-icons/ai";
import Swal from "sweetalert2";
import { useFetchData } from "../../../../hooks/useFetchData";
import JSZip from 'jszip';

export const ActionPesquisaVendasXML = ({ usuarioLogado }) => {
  const [tabelaVisivel, setTabelaVisivel] = useState(false);
  const [marcaSelecionada, setMarcaSelecionada] = useState('');
  const [empresaSelecionada, setEmpresaSelecionada] = useState('');
  const [statusSelecionado, setStatusSelecionado] = useState('')
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('');
  const [dataPesquisaFim, setDataPesquisaFim] = useState('');
  const [menuFilhoAtual, setMenuFilhoAtual] = useState(null);

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
    { enabled: Boolean(usuarioLogado?.id), staleTime: 60 * 60 * 1000,}
  );

  useEffect(() => {
    const dataInical = getDataAtual();
    const dataFinal = getDataAtual();
    setDataPesquisaInicio(dataInical);
    setDataPesquisaFim(dataFinal);

  }, [])

  const { data: marcas = [], error: errorMarcas, isLoading: isLoadingMarcas } = useFetchData('marcasLista', '/marcasLista');
  const { data: empresas = [], error: errorEmpresas, isLoading: isLoadingEmpresas, refetch: refetchEmpresas } = useQuery(
    ['todas-empresas', marcaSelecionada],
    async () => {
      const response = await get(`/todas-empresas?idSubGrupoEmpresa=${marcaSelecionada}`);

      return response.data;
    },
    { staleTime: 60 * 60 * 1000 }
  );

  const fetchListaVendasContigencia = async () => {
    let stContigencia = ''
    let stCancelado = ''
    let allData = [];
    switch (statusSelecionado) {
      case 'AUTORIZADA':
        stContigencia = 'False',
          stCancelado = 'False'
          break;
      case 'CONTINGÊNCIA':
        stContigencia = 'True',
        stCancelado = 'False'
        break;
        case 'CANCELADO':
          stContigencia = '',
          stCancelado = 'True'
        break;
      case '':
      default:
        stContigencia = '';
        stCancelado = '';
        break
    }
    const urlBase = `/venda-xml?idMarca=${marcaSelecionada}&idEmpresa=${empresaSelecionada}&stContigencia=${stContigencia}&stCancelado=${stCancelado}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`;
    let urlApi = urlBase.includes('?') ? urlBase : urlBase + '?';
    urlApi = urlApi.replace('&page=1', '').replace('page=1', '');
    try {


      const controller = new AbortController();
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

  const { data: dadosVendasXML = [], error: errorVendas, isLoading: isLoadingVendas, refetch: refetchVendasContigencia } = useQuery(
    ['venda-xml', ],
    () => fetchListaVendasContigencia(),
    { enabled: false,  }
  );

  const xmlData = dadosVendasXML[0]?.XML_FORMATADO;

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

  const handleDownloadXML = async () => {
    const vendasData = await fetchListaVendasContigencia();

    if (vendasData?.length) {

      const xmlBlob = new Blob([vendasData[0]?.XML_FORMATADO], { type: 'text/xml' });
      const downloadUrl = URL.createObjectURL(xmlBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `venda_${vendasData[0]?.IDVENDA}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const retornoDownloadXmlEmLote = async (dadosVendas) => {
    try {
      const { data } = dadosVendas || [];
      let listaVendasSemXML = '';
      let contador = 0;

      if (data?.length) {
        animacaoCarregamento('Gerando arquivo...', true);

        const periodo = `${new Date(dataPesquisaInicio).toLocaleDateString('pt-BR')}_A_${new Date(dataPesquisaFim).toLocaleDateString('pt-BR')}`;
        const zip = new JSZip();

        for (let venda of data) {
          const { IDVENDA, XML_FORMATADO } = venda;

          if (XML_FORMATADO?.length) {
            const parsedXml = new DOMParser().parseFromString(XML_FORMATADO, 'text/xml');
            const nomeArquivo = parsedXml.getElementsByTagName('infNFe')[0]?.getAttribute('Id');

            if (nomeArquivo) {
              const serializedXml = new XMLSerializer().serializeToString(parsedXml);
              zip.file(`${nomeArquivo}.xml`, serializedXml);
            }
          } else {
            listaVendasSemXML += `${IDVENDA}, `;
            contador++;
          }
        }

        const totalGerado = data.length - contador;
        const zipBlob = await zip.generateAsync({ type: 'blob' });

        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `XML_VENDAS_${periodo.replace(/\//g, '-')}.zip`;

        if (contador > 0) {
          await Swal.fire({
            icon: 'warning',
            title: 'Atenção',
            html: `Arquivo gerado, porém não foi possível gerar o XML das seguintes vendas: (${listaVendasSemXML}).<br><br>
            Total de vendas: ${data.length}.<br>
            XMLs gerados: ${totalGerado}.<br>
            Faltando: ${contador}.`,
          });
        } else {
          await Swal.fire({
            icon: 'success',
            title: 'Sucesso',
            text: `Arquivo gerado com sucesso! Total de ${totalGerado} XML's gerados.`,
          });
        }

        a.click();
        URL.revokeObjectURL(url);
      } else {
        await Swal.fire({
          icon: 'warning',
          title: 'Nenhum XML encontrado',
          text: 'Nenhum XML disponível para download.',
        });
      }
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Ocorreu um erro ao gerar o arquivo.',
      });
    } finally {
      fecharAnimacaoCarregamento();
    }
  };

  const handleDownloadXmlEmLote = async () => {
    if (dadosVendasXML?.length) {
      await retornoDownloadXmlEmLote({ data: dadosVendasXML });
    } else {
      await Swal.fire({
        icon: 'warning',
        title: 'Nenhuma venda disponível',
        text: 'Certifique-se de que há vendas para processar.',
      });
    }
  };

  const handleChangeMarca = (e) => {
    setMarcaSelecionada(e.value)
  }

  const handleChangeEmpresa = (e) => {
    setEmpresaSelecionada(e.value)
  }

  const handleClick = () => {
    refetchVendasContigencia()
    setTabelaVisivel(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleClick();
    }
  };

  const optionsStatus = [
    { value: '', label: 'Todas', color: 'grey' },
    { value: 'AUTORIZADA', label: 'Autorizadas', color: 'green' },
    { value: 'CONTINGÊNCIA', label: 'Em Contingência', color: 'orange' },
    { value: 'CANCELADO', label: 'Canceladas', color: 'red' },
  ]

  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      color: state.data.color,
    }),
    singleValue: (provided, state) => ({
      ...provided,
      color: state.data.color,
    }),
  };

  return (

    <Fragment>

      <ActionMain
        linkComponentAnterior={["Home"]}
        linkComponent={["Lista de Vendas"]}
        title=" Vendas Em Contingência"
        subTitle="Nome da Loja"

        InputFieldDTInicioComponent={InputField}
        labelInputFieldDTInicio={"Data Início"}
        valueInputFieldDTInicio={dataPesquisaInicio}
        onChangeInputFieldDTInicio={e => setDataPesquisaInicio(e.target.value)}
        onKeyDownInputFieldDTInicio={handleKeyPress}


        InputFieldDTFimComponent={InputField}
        labelInputFieldDTFim={"Data Fim"}
        valueInputFieldDTFim={dataPesquisaFim}
        onChangeInputFieldDTFim={e => setDataPesquisaFim(e.target.value)}
        onKeyDownInputFieldDTFim={handleKeyPress}

        InputSelectMarcasComponent={InputSelectAction}
        optionsMarcas={[
          { value: "", label: "Selecione a Marca" },
          ...marcas.map((marca) => ({
            value: marca.IDGRUPOEMPRESARIAL,
            label: marca.DSGRUPOEMPRESARIAL
          }))
        ]}
        labelSelectMarcas={"Marcas"}
        valueSelectMarca={marcaSelecionada}
        onChangeSelectMarcas={handleChangeMarca}

        InputSelectEmpresaComponent={InputSelectAction}
        optionsEmpresas={[
          { value: "", label: "Selecione a Loja" },
          ...empresas.map((marca) => ({
            value: marca.IDEMPRESA,
            label: marca.NOFANTASIA
          }))
        ]}
        labelSelectEmpresa={"Filial"}
        valueSelectEmpresa={empresaSelecionada}
        onChangeSelectEmpresa={handleChangeEmpresa}

        InputSelectSituacaoComponent={InputSelectAction}
        labelSelectSituacao={"Situação"}
        optionsSituacao={optionsStatus}
        valueSelectSituacao={statusSelecionado}
        onChangeSelectSituacao={(e) => setStatusSelecionado(e.value)}
        styleSituacao={customStyles}


        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Atualizar Dados"}
        onButtonClickSearch={handleClick}
        IconSearch={AiOutlineSearch}
        corSearch={"primary"}

        ButtonTypeCadastro={ButtonType}
        linkNome={"Download XML"}
        corCadastro={"success"}
        IconCadastro={AiOutlineDownload}
        onButtonClickCadastro={handleDownloadXmlEmLote}


      />


      {tabelaVisivel &&
        <ActionListaVendasXML
          dadosVendasXML={dadosVendasXML} 
          usuarioLogado={usuarioLogado}
          optionsModulos={optionsModulos}
        />
      }

    </Fragment>
  )
}

