import { Fragment, useState } from "react"
import { InputField } from "../../../Buttons/Input"
import { ActionMain } from "../../../Actions/actionMain"
import { get } from "../../../../api/funcRequest"
import { ButtonType } from "../../../Buttons/ButtonType"
import { MdOutlineLocalPrintshop } from "react-icons/md"
import { useQuery } from "react-query"
import { InputSelectAction } from "../../../Inputs/InputSelectAction"
import { ActionImprimirEtiquetaModal } from "./actionImprimirEtiquetaModal"
import { useEffect } from "react"
import Swal from "sweetalert2"

export const ActionPesquisaEtiquetasVolumes = ({ usuarioLogado }) => {
  const [tipoSelecionado, setTipoSelecionado] = useState('DEVOLUÇÃO');
  const [numeroOR, setNumeroOR] = useState(0);
  const [numeroOT, setNumeroOT] = useState(0);
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [empresaDestinoSelecionada, setEmpresaDestinoSelecionada] = useState('0101 - TO - CD (Depósito)');
  const [solicitanteSelecionado, setSolicitanteSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState(0);
  const [modalImprimir, setModalImprimir] = useState(false);
  const [dadosAcumuladorEtiquetas, setDadosAcumuladorEtiquetas] = useState([]);
 
  const { data: dadosEmpresas = [], error: errorEmpresas, isLoading: isLoadingEmpresas, refetch } = useQuery(
    'empresas',
    async () => {
      const response = await get(`/empresas`);

      return response.data;
    },
    { enabled: true, staleTime: 60 * 60 * 1000, }
  );


    const handleImprimir = () => {
     if(tipoSelecionado == 'REMANEJAMENTO' && (empresaDestinoSelecionada == null || empresaDestinoSelecionada == undefined || empresaDestinoSelecionada == '')){ 
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Selecione a empresa destino novamente para remanejamento.',
      })
      return;
    } 
    const dados = [{
      tipoSelecionado,
      numeroOR,
      numeroOT,
      descricao,
      categoria,
      empresaOrigem: usuarioLogado.NOFANTASIA,
      empresaDestino: empresaDestinoSelecionada || '0101 - TO - CD (Depósito)',
      solicitanteSelecionado,
      quantidade: quantidade
    }];
    setDadosAcumuladorEtiquetas(dados);
    setModalImprimir(true);
  }

  const options = [
    { value: 'DEVOLUÇÃO', label: 'DEVOLUÇÃO' },
    { value: 'REMANEJAMENTO', label: 'REMANEJAMENTO' },
  ]

  const optionsSolicitante = [
    { value: 'VM', label: 'VM' },
    { value: 'Supervisão', label: 'Supervisão ' },
    { value: 'Compras', label: 'Compras' },
    { value: 'Diretoria', label: 'Diretoria' },
  ]

/*   useEffect(() => {
    if (tipoSelecionado === 'DEVOLUÇÃO') {
      setSolicitanteSelecionado('');
      setEmpresaDestinoSelecionada('');
    }
  }, [tipoSelecionado, setSolicitanteSelecionado, setEmpresaDestinoSelecionada])
   */

  const handleChangeTipoSelecionado = (e) => {
    setTipoSelecionado(e.value);
    if (e.value == 'DEVOLUÇÃO') {
      setSolicitanteSelecionado('');
      setEmpresaDestinoSelecionada('');
    }
  }

  return (

    <Fragment>
      <ActionMain
        linkComponentAnterior={["Home"]}
        linkComponent={["Etiquetas Volumes"]}
        title="Etiquetas Volumes"
        subTitle={usuarioLogado?.NOFANTASIA}

        InputSelectEmpresaComponent={InputSelectAction}
        labelSelectEmpresa={"Tipo"}
        optionsEmpresas={options.map((item) => ({
          value: item.value,
          label: item.label,
        }))}
        valueSelectEmpresa={tipoSelecionado}
        defaultValueSelectEmpresa={{ value: 'DEVOLUÇÃO', label: 'DEVOLUÇÃO' }}
        onChangeSelectEmpresa={handleChangeTipoSelecionado}

        InputSelectGrupoComponent={InputSelectAction}
        labelSelectGrupo={"Solicitante"}
        optionsGrupos={[
          { value: '', label: 'Selecione' },
          ...optionsSolicitante.map((item) => ({
            value: item.value,
            label: item.label,
          }))
        ]}
        valueSelectGrupo={solicitanteSelecionado}
        onChangeSelectGrupo={(e) => setSolicitanteSelecionado(e.value)}
        isDisabledGrupo={tipoSelecionado == 'DEVOLUÇÃO'}
        stylesGrupo={tipoSelecionado == 'REMANEJAMENTO'}

        InputSelectSubGrupoComponent={InputSelectAction}
        labelSelectSubGrupo={"Empresa Destino"}
        optionsSubGrupos={[
          { value: '101', label: '0101 - TO - CD (Depósito)' },
          ...dadosEmpresas.map((item) => ({
            value: item.NOFANTASIA,
            label: item.NOFANTASIA,
          }))
        ]}
        valueSelectSubGrupo={empresaDestinoSelecionada}
        defaultValueSelectSubGrupo={{ value: '101', label: '0101 - TO - CD (Depósito)' }}
        onChangeSelectSubGrupo={(e) => setEmpresaDestinoSelecionada(e.value)}
        styleSubGrupo={tipoSelecionado == 'DEVOLUÇÃO'}

        InputSelectMarcasComponent={InputSelectAction}
        labelSelectMarcas={"Empresa Origem"}
        defaultValueSelectMarca={{ value: usuarioLogado?.NOFANTASIA, label: usuarioLogado?.NOFANTASIA }}
        isDisabledMarca={true}

        InputFieldORComponent={InputField}
        labelInputFieldOR={"Nº OR "}
        valueInputFieldOR={numeroOR}
        onChangeInputFieldOR={(e) => setNumeroOR(e.target.value)}

        InputFieldOTComponent={InputField}
        labelInputFieldOT={"Nº OT "}
        valueInputFieldOT={numeroOT}
        onChangeInputFieldOT={(e) => setNumeroOT(e.target.value)}

        InputFieldNumeroNFComponent={InputField}
        labelInputFieldNumeroNF={"Descrição"}
        valueInputFieldNumeroNF={descricao}
        onChangeInputFieldNumeroNF={(e) => setDescricao(e.target.value.toUpperCase())}
        placeHolderInputFieldNumeroNF={"Descrição"}

        InputFieldDescricaoComponent={InputField}
        labelInputFieldDescricao={"Categoria"}
        valueInputFieldDescricao={categoria}
        onChangeInputFieldDescricao={(e) => setCategoria(e.target.value.toUpperCase())}
        placeHolderInputFieldDescricao={"Categoria"}

        InputFieldQuantidadeComponent={InputField}
        labelInputFieldQuantidade={"volumes "}
        valueInputQuantidade={quantidade}
        onChangeInputQuantidade={(e) => setQuantidade(e.target.value)}
        placeHolderInputFieldQuantidade={"volumes"}
        readOnlyQuantidade={false}

        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Imprimir Etiqueta"}
        onButtonClickSearch={handleImprimir}
        corSearch={"primary"}
        IconSearch={MdOutlineLocalPrintshop}

      />
      <ActionImprimirEtiquetaModal
        show={modalImprimir}
        handleClose={() => setModalImprimir(false)}
        dadosAcumuladorEtiquetas={dadosAcumuladorEtiquetas}
        tipoSelecionado={tipoSelecionado}
        usuarioLogado={usuarioLogado}
        />

    </Fragment>
  )
}