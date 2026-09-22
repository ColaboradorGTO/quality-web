import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { ButtonType } from "../../Buttons/ButtonType";
import { ActionMainPromocao } from "../../Actions/ActionMainPromocao";
import { InputFieldAction } from "../../Buttons/InputAction";
import { InputSelectActionPromocao } from "../../Inputs/InputSelectActionPromocao";
import { MultSelectAction } from "../../Select/MultSelectAction";
import { GrDocumentCsv, GrFormView, GrView } from "react-icons/gr";
import { IoIosSend } from "react-icons/io";
import { useUpdatePromocaoAtiva } from "./hook/useUpdatePromocao";
import { ActionProdutoDestinoModal } from "./ActionProdutosDestino/actionProdutoDestinoModal";
import { ActionProdutoOrigemModal } from "./ActionProdutosOrigem/actionProdutoOrigemModal";
import { AiFillBackward } from "react-icons/ai";
import { ActionDocumentacaoAtualizar } from "./ActionDocumentacao/documentacaoAtualizar";
import { ActionProdutoModalPromocao } from "./ActionProdutosDaPromocao/actionProdutoModalPromocao";
import { ActionEmpresasModalPromocao } from "./ActionEmpresasDaPromocao/actionEmpresasModalPromocao";
import { ActionProdutoModalPromocaoSelecionado } from "./ActionProdutosDaPromocaoSelecionado/actionProdutoModalPromocaoSelecionado";
import { ActionProdutoModalPromocaoSelecionadoDestino } from "./ActionProdutosDaPromocaoSelecionado/actionProdutoModalPromocaoSelecionaDestino";
import { MenuTreeSelect } from "../../Inputs/menuTreeSelect";
import { InputFieldActionRadio } from "../../Buttons/InputActionRadio";
import { FaDownload } from "react-icons/fa";



export const ActionEditarPromocaoAtiva = ({ dadosPromocao, handleClickIncluir, actionEditarVisivel, setActionEditarVisivel }) => {

  const {
    mecanicaSelecionada,
    setMecanicaSelecionada,
    aplicacaoDestinoSelecionada,
    setAplicacaoDestinoSelecionada,
    tipoDescontoSelecionado,
    setTipoDescontoSelecionado,
    fornecedorSelecionado,
    setFornecedorSelecionado,
    subGrupoSelecionado,
    setSubGrupoSelecionado,
    grupoSelecionado,
    setGrupoSelecionado,
    marcaSelecionada,
    setMarcaSelecionada,
    empresaSelecionada,
    setEmpresaSelecionada,
    empresasSelecionadas,
    setEmpresasSelecionadas,
    // empresasFiltradas,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
    qtdInicio,
    setQtdInicio,
    qtdFim,
    setQtdFim,
    vrDesconto,
    setVrDesconto,
    porcentoDesconto,
    setPorcentoDesconto,
    valorInicio,
    setValorInicio,
    valorFim,
    setValorFim,
    produtoOrigem,
    setProdutoOrigem,
    fileProdutoOrigem,
    setFileProdutoOrigem,
    produtoDestino,
    setProdutoDestino,
    fileProdutoDestino,
    setFileProdutoDestino,
    descricao,
    setDescricao,
    precoProduto,
    setPrecoProduto,
    statusSelecionado,
    setStatusSelecionado,
    statusProdutoDestino,
    setStatusProdutoDestino,
    statusProdutoOrigem,
    setStatusProdutoOrigem,
    dadosFornecedorProduto,
    dadosGrupo,
    dadosSubGrupo,
    optionsMarcas,
    optionsEmpresas,
    optionsMecanica,
    optionsMecanicaCompleta,
    dadosMecanicas,
    mecanicaSelecionadaEdicao,
    setMecanicaSelecionadaEdicao,
    handleFileUpload,
    mostrarProdutosSelecionados,
    dadosPromocoesAtivas,
    modalVisivel,
    setModalVisivel,
    handleSalvarMecanica,
    onSubmit,
    optionsProdutosPromocoes,
    optionsEmpresasPromocoes,
    optionsStatus,
    mostrarProdutosPromocao,
    handlePesquisarProdutoDestino,
    handlePesquisarProdutoOrigem,
    modalProdutoDestino,
    setModalProdutoDestino,
    modalProdutoOrigem,
    setModalProdutoOrigem,
    modalProdutoDaPromocao,
    setModalProdutoDaPromocao,
    dadosProdutosPesquisa,
    modalDocumentacao,
    setModalDocumentacao,
    mostrarProdutosPromocaoAtiva,
    dadosProdutosPromocaoDaPromocao,
    setDadosProdutosPromocaoDaPromocao,
    produtoDestinoSelecionado,
    setProdutoDestinoSelecionado,
    produtoOrigemSelecionado,
    setProdutoOrigemSelecionado,
    novoProdutoDestino,
    setNovoProdutoDestino,
    novoProdutoOrigem,
    setNovoProdutoOrigem,
    setModalPodutoSelecionadoDestino,
    setModalPodutoSelecionadoOrigem,
    modalPodutoSelecionadoDestino,
    modalPodutoSelecionadoOrigem,
    modalEmpresasPromocao,
    setModalEmpresasPromocao,
    refetchProdutosPromocoes,
    dadosEmpresasPromocoes,
    setDadosEmpresasPromocoes,
    mostrarProdutosSelecionadosOrigem,
    mostrarProdutosSelecionadosDestino,
    refetchEmpresasPromocoes,
    refetchEmpresasPromocoess,
    isCheckedGrupo,
    setIsCheckedGrupo,
    isCheckedProduto,
    setIsCheckedProduto,
    subGrupoDestino,
    setSubGrupoDestino,
    subGrupoOrigem,
    setSubGrupoOrigem,
    grupoSelecionadoOrigem, 
    setGrupoSelecionadoOrigem,
    grupoSelecionadoDestino,
    setGrupoSelecionadoDestino,
    downloadPlanilhaModelo,
    onSubmitEstrutura
  } = useUpdatePromocaoAtiva({ dadosPromocao });

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

  const handleChangeMecanica = useCallback((selectedValue) => {
    const selectedOption = optionsMecanicaCompleta?.find(option => option.value == selectedValue);


    if (selectedOption) {
      setMecanicaSelecionada(selectedOption.value);
      setMecanicaSelecionadaEdicao(selectedOption.label)
      setAplicacaoDestinoSelecionada(selectedOption.aplicacaoDestino);
      setTipoDescontoSelecionado(selectedOption.tipoDesconto);
    } else {
      console.log('Nenhuma opção encontrada para o valor:', selectedValue);
    }
  }, []);

  // const handleChangeMecanica = useCallback((selectedValue) => {
  //   const selectedOption = dadosMecanicas.find(option => option.ID == selectedValue);

  //   if (selectedOption) {
  //     setMecanicaSelecionada(selectedOption.ID);
  //     setMecanicaSelecionadaEdicao(selectedOption.DESCRICAO)
  //     setAplicacaoDestinoSelecionada(selectedOption.APLICAODESTINO);
  //     setTipoDescontoSelecionado(selectedOption.TIPODESCONTO);
  //   } else {
  //     console.log('Nenhuma opção encontrada para o valor:', selectedValue);
  //   }
  // }, [mecanicaSelecionada, mecanicaSelecionadaEdicao, setMecanicaSelecionada, setAplicacaoDestinoSelecionada, setTipoDescontoSelecionado,]);

  useEffect(() => {
    if (tipoDescontoSelecionado == 0) {
      setVrDesconto(0);
      setValorInicio(0);
      if (!dadosPromocao[0]?.FATORPROMOVLR) {
        setVrDesconto(0);
      }
      if (!dadosPromocao[0]?.FATORPROMOPERC) {
        setPorcentoDesconto(0);
      }
    } else if (tipoDescontoSelecionado == 1) {
      if (!dadosPromocao[0]?.FATORPROMOPERC) {
        setPorcentoDesconto(0);
      }
      setPrecoProduto(0);
      setValorInicio(0);
    } else if (tipoDescontoSelecionado == 2) {
      setVrDesconto(0);
      setPrecoProduto(0);
      setValorInicio(0);
    }

  }, [mecanicaSelecionada, tipoDescontoSelecionado, setPrecoProduto, setVrDesconto, setValorInicio, setPorcentoDesconto]);

  const handleCadastrar = () => {
    onSubmit();
  }

  // const mecanicaInicial = useMemo(() => {
  //   if (dadosPromocao && dadosPromocao[0] && optionsMecanica.length > 0) {
  //     const promocao = dadosPromocao[0];
  //     const mecanicaEncontrada = optionsMecanica.find(mecanica =>
  //       mecanica.aplicacaoDestino == promocao.TPAPARTIRDE &&
  //       mecanica.mecanica == promocao.TPAPLICADOA &&
  //       mecanica.tipoDesconto == promocao.TPFATORPROMO
  //     );

  //     return mecanicaEncontrada ? mecanicaEncontrada.value : null;
  //   }
  //   return null;
  // }, [dadosPromocao]);


  // const mecanicaCorrespondente = useMemo(() => {
  //   if (mecanicaInicial && dadosMecanicas.length > 0) {
  //     const mecanica = dadosMecanicas.find(m => {
  //       const mecanicaOriginal = optionsMecanica.find(opt => opt.value === mecanicaInicial);
  //       return mecanicaOriginal &&
  //         m.MECANICA === mecanicaOriginal.mecanica &&
  //         m.APLICACAODESTINO === mecanicaOriginal.aplicacaoDestino &&
  //         m.TIPODESCONTO === mecanicaOriginal.tipoDesconto;
  //     });

  //     if (mecanica) {
  //       if (!mecanicaSelecionada) {
  //         setMecanicaSelecionada(mecanica.ID);
  //         setMecanicaSelecionadaEdicao(mecanica.DESCRICAO);
  //         setAplicacaoDestinoSelecionada(mecanica.APLICACAODESTINO);
  //         setTipoDescontoSelecionado(mecanica.TIPODESCONTO);
  //       }
  //       return mecanica;
  //     }
  //   }
  //   return null;
  // }, [mecanicaInicial, dadosMecanicas, optionsMecanica]);

  // const valorSelecionado = useMemo(() => {
  //   if (mecanicaSelecionada && dadosMecanicas.length > 0) {
  //     const mecanica = dadosMecanicas.find(item => item.ID === mecanicaSelecionada);
  //     return mecanica ? {
  //       value: mecanica.ID,
  //       label: mecanica.DESCRICAO,
  //       APLICAODESTINO: mecanica.APLICACAODESTINO,
  //       TIPODESCONTO: mecanica.TIPODESCONTO
  //     } : null;
  //   }
  //   return null;
  // }, [mecanicaSelecionada, dadosMecanicas]);

  // useEffect(() => {
  //   if (mecanicaCorrespondente) {
  //     setMecanicaSelecionada(mecanicaCorrespondente.ID);
  //     setMecanicaSelecionadaEdicao(mecanicaCorrespondente.DESCRICAO);
  //     setAplicacaoDestinoSelecionada(mecanicaCorrespondente.APLICACAODESTINO);
  //     setTipoDescontoSelecionado(mecanicaCorrespondente.TIPODESCONTO);
  //   }

  // }, [mecanicaCorrespondente]);

  const mecanicaInicial = useMemo(() => {
    if (dadosPromocao && dadosPromocao[0] && optionsMecanicaCompleta.length > 0) {
      const promocao = dadosPromocao[0];
      const mecanicaEncontrada = optionsMecanicaCompleta.find(mecanica =>
        mecanica.aplicacaoDestino == promocao.TPAPARTIRDE &&
        mecanica.mecanica == promocao.TPAPLICADOA &&
        mecanica.tipoDesconto == promocao.TPFATORPROMO
      );

      return mecanicaEncontrada ? mecanicaEncontrada.value : null;
    }
    return null;
  }, [dadosPromocao]);

  const mecanicaCorrespondente = useMemo(() => {
    if (mecanicaInicial && optionsMecanicaCompleta.length > 0) {
      const mecanica = optionsMecanicaCompleta.find(m => {
        const mecanicaOriginal = optionsMecanicaCompleta.find(opt => opt.value === mecanicaInicial);

        return mecanicaOriginal &&
          m.mecanica === mecanicaOriginal.mecanica &&
          m.aplicacaoDestino === mecanicaOriginal.aplicacaoDestino &&
          m.tipoDesconto === mecanicaOriginal.tipoDesconto;
      });


      if (mecanica) {
        if (!mecanicaSelecionada) {
          setMecanicaSelecionada(mecanica.value);
          setMecanicaSelecionadaEdicao(mecanica.label);
          setAplicacaoDestinoSelecionada(mecanica.aplicacaoDestino);
          setTipoDescontoSelecionado(mecanica.tipoDesconto);
        }

        return mecanica;
      }

    }
    return null;
  }, [mecanicaInicial, dadosMecanicas, optionsMecanica]);

  const valorSelecionado = useMemo(() => {
    if (mecanicaSelecionada && optionsMecanicaCompleta.length > 0) {
      const mecanica = optionsMecanicaCompleta.find(item => item.value === mecanicaSelecionada);

      return mecanica ? {
        value: mecanica.value,
        label:` ${mecanica.value} - ${mecanica.label}`,
        APLICAODESTINO: mecanica.aplicacaoDestino,
        TIPODESCONTO: mecanica.tipoDesconto
      } : null;
    }

    return null;
  }, [mecanicaSelecionada, optionsMecanicaCompleta]);

  useEffect(() => {
    if (mecanicaCorrespondente) {
      setMecanicaSelecionada(mecanicaCorrespondente.value);
      setMecanicaSelecionadaEdicao(mecanicaCorrespondente.label);
      setAplicacaoDestinoSelecionada(mecanicaCorrespondente.aplicacaoDestino);
      setTipoDescontoSelecionado(mecanicaCorrespondente.tipoDesconto);
    }

  }, [mecanicaCorrespondente]);

  const handlePorcentoDesconto = (value) => {
    if (isNaN(value) || value == "" || typeof value !== "number") {
      setPorcentoDesconto(0);
      return;
    }
    const val = Math.max(0, Math.min(Number(value), 99));
    setPorcentoDesconto(val);
  }

  const empresasFiltradas = useMemo(() => {
    const empresasArray = Array.isArray(optionsEmpresas) ? optionsEmpresas : [];

    let filtradas = empresasArray;
    if (marcaSelecionada && marcaSelecionada !== "all") {
      if (Array.isArray(marcaSelecionada)) {
        filtradas = empresasArray.filter(empresa =>
          marcaSelecionada.map(String).includes(String(empresa.IDGRUPOEMPRESARIAL))

        );

      } else {
        filtradas = empresasArray.filter(empresa =>
          String(empresa.IDGRUPOEMPRESARIAL) === String(marcaSelecionada)
        );

      }
    }

    if (dadosEmpresasPromocoes?.length > 0) {
      const idsEmpresasPromocao = dadosEmpresasPromocoes.map(emp => emp.IDEMPRESA);
      return filtradas.map(emp => ({
        ...emp,
        selected: idsEmpresasPromocao.includes(emp.IDEMPRESA),
        status: emp.STATIVO
      }));
    }


    return filtradas.map(emp => ({
      ...emp,
      status: emp.STATIVO
    }));
  }, [optionsEmpresas, marcaSelecionada, dadosEmpresasPromocoes]);

  useEffect(() => {
    if (dadosEmpresasPromocoes?.length > 0 && empresasSelecionadas.length === 0) {
      const defaults = dadosEmpresasPromocoes.map(emp => ({
        value: emp.IDEMPRESA,
        label: emp.NOFANTASIA,
        status: emp.STATIVO,
        isFixed: true
      }));
      setEmpresasSelecionadas(defaults);

    } else {
      setEmpresasSelecionadas([]);
    }
  }, [dadosEmpresasPromocoes, setEmpresasSelecionadas]);

  const mostrarDocumentacao = useCallback(() => {
    setModalDocumentacao(true);
  }, []);

  const handleCadastrarEstrutura = () => {
    onSubmitEstrutura();
  }

  const [treeData, setTreeData] = useState([]);
  const [selectedNodesOrigem, setSelectedNodesOrigem] = useState({});
  const [selectedNodesDestino, setSelectedNodesDestino] = useState({});
  const [carregouInicial, setCarregouInicial] = useState(false);

  useEffect(() => {
    if (!dadosSubGrupo?.length) return;

    const gruposMap = new Map();

    dadosSubGrupo.forEach(subgrupo => {
      const grupoId = subgrupo.IDGRUPOESTRUTURA;

      if (!gruposMap.has(grupoId)) {
        gruposMap.set(grupoId, {
          key: `grupo_${grupoId}`,
          label: subgrupo.DSGRUPOESTRUTURA,
          children: [],
        });
      }

      gruposMap.get(grupoId).children.push({
        key: `subgrupo_${subgrupo.IDSUBGRUPOESTRUTURA}`,
        label: subgrupo.DSSUBGRUPOESTRUTURA,
        data: subgrupo
      });
    });

    setTreeData(Array.from(gruposMap.values()));

  }, [dadosSubGrupo]);

  useEffect(() => {
    if (!optionsProdutosPromocoes?.length || carregouInicial) return;

    const dados = optionsProdutosPromocoes[0];

    const destinoApi = dados?.empresaPromocaoDestino
      ?.map(item => Number(item?.det?.IDSUBGRUPOEMDESTINO))
      ?.filter(Boolean) || [];

    const origemApi = dados?.empresaPromocaoOrigem
      ?.map(item => Number(item?.det?.IDSUBGRUPOEMORIGEM))
      ?.filter(Boolean) || [];

    const destinoConvertido = destinoApi.map(String);
    const origemConvertido = origemApi.map(String);

    setSubGrupoDestino(destinoConvertido);
    setSubGrupoOrigem(origemConvertido);

    setCarregouInicial(true); // 🔥 trava o useEffect

  }, [optionsProdutosPromocoes, dadosSubGrupo, carregouInicial]);
  
  useEffect(() => {
    if (!treeData.length) return;

    const selectionDestino = {};
    const selectionOrigem = {};

    // Função para encontrar o grupo pai de um subgrupo
    const encontrarGrupoPai = (subgrupoId) => {
      const subgrupo = dadosSubGrupo?.find(sg => String(sg.IDSUBGRUPOESTRUTURA) === String(subgrupoId));
      return subgrupo?.IDGRUPOESTRUTURA;
    };

    // Set para armazenar grupos únicos que devem ser selecionados
    const gruposDestinoParaSelecionar = new Set();
    const gruposOrigemParaSelecionar = new Set();

    // Selecionar subgrupos e identificar grupos pais para DESTINO
    subGrupoDestino.forEach(id => {
      selectionDestino[`subgrupo_${id}`] = {
        checked: true
      };
      
      const grupoPai = encontrarGrupoPai(id);
      if (grupoPai) {
        gruposDestinoParaSelecionar.add(grupoPai);
      }
    });

    // Selecionar subgrupos e identificar grupos pais para ORIGEM
    subGrupoOrigem.forEach(id => {
      selectionOrigem[`subgrupo_${id}`] = {
        checked: true
      };
      
      const grupoPai = encontrarGrupoPai(id);
      if (grupoPai) {
        gruposOrigemParaSelecionar.add(grupoPai);
      }
    });

    // Selecionar os grupos pais identificados para DESTINO
    gruposDestinoParaSelecionar.forEach(grupoId => {
      selectionDestino[`grupo_${grupoId}`] = {
        checked: true
      };
    });

    // Selecionar os grupos pais identificados para ORIGEM
    gruposOrigemParaSelecionar.forEach(grupoId => {
      selectionOrigem[`grupo_${grupoId}`] = {
        checked: true
      };
    });

    setSelectedNodesDestino(selectionDestino);
    setSelectedNodesOrigem(selectionOrigem);

  }, [treeData, subGrupoDestino, subGrupoOrigem, dadosSubGrupo]);

  const handleTreeSelectDestinoChange = (e) => {
    setSelectedNodesDestino(e.value);

    const subgrupos = Object.keys(e.value)
      .filter(key => key.startsWith("subgrupo_"))
      .map(key => key.replace("subgrupo_", ""));

    setSubGrupoDestino(subgrupos); // 🔥 ESSENCIAL
  };

  const handleTreeSelectOrigemChange = (e) => {
    setSelectedNodesOrigem(e.value);
    const subgrupos = Object.keys(e.value)
      .filter(key => key.startsWith("subgrupo_"))      .map(key => key.replace("subgrupo_", ""));
    setSubGrupoOrigem(subgrupos); // 🔥 ESSENCIAL
  };

  return (
    <Fragment>

      <ActionMainPromocao
        linkComponentAnterior={["Home"]}
        linkComponent={["Cadastro de Promoções"]}
        title="Atualizar Promoção"

        InputSelectMecanicaComponent={InputSelectActionPromocao}
        labelSelectMecanica={"Mecanica"}
        optionsMecanica={dadosMecanicas.map((item) => ({
          value: item.ID,
          label: item.DESCRICAO,
          APLICACAODESTINO: item.APLICACAODESTINO,
          TIPODESCONTO: item.TIPODESCONTO
        }))}
        onChangeSelectMecanica={(e) => handleChangeMecanica(e.value)}
        styleMecanica={customStyles}
        defaultValueSelectMecanica={valorSelecionado}
        valueSelectMecanica={valorSelecionado}
        readOnlyMecanica={true}

        InputFieldQTDInicioComponent={InputFieldAction}
        labelInputQTDInicio={"QTD Aparti de"}
        valueInputFieldQTDInicio={qtdInicio}
        onChangeInputFieldQTDInicio={(e) => setQtdInicio(e.target.value)}
        readOnlyQTDInicio={true}
        // readOnlyQTDInicio={mecanicaSelecionada == 1 ? true : false}


        InputFieldQTDFimComponent={InputFieldAction}
        labelInputQTDFim={"Vr Apartir de"}
        valueInputFieldQTDFim={valorInicio}
        onChangeInputFieldQTDFim={(e) => setValorInicio(Number(e.target.value))}
        readOnlyQTDFim={true}
        // readOnlyQTDFim={mecanicaSelecionada == 1 ? false : true}

        InputFieldDescontoComponent1={InputFieldAction}
        labelInputFieldDesconto1={"Vr Desconto "}
        valueInputFieldDesconto1={vrDesconto}
        onChangeInputFieldDesconto1={(e) => setVrDesconto(Number(e.target.value))}
        readOnlyDesconto1={true}
        // readOnlyDesconto1={tipoDescontoSelecionado == 1 ? false : true}

        InputFieldDescontoComponent2={InputFieldAction}
        labelInputFieldDesconto2={"Desconto %"}
        valueInputFieldDesconto2={porcentoDesconto}
        onChangeInputFieldDesconto2={(e) => handlePorcentoDesconto(Number(e.target.value))}
        readOnlyDesconto2={true}
        // readOnlyDesconto2={tipoDescontoSelecionado == 2 ? false : true}

        InputFieldVrInicio={InputFieldAction}
        labelInputFieldVrInicio={"Vr Desconto Final"}
        valueInputFieldVrInicio={precoProduto}
        onChangeInputFieldVrInicio={(e) => {
          const valor = e.target.value.replace(/,/g, '.');
          setPrecoProduto(valor);
        }}
        readOnlyVrInicio={true}
        // readOnlyVrInicio={tipoDescontoSelecionado == 0 ? false : true}


        InputFieldDTInicioComponent={InputFieldAction}
        labelInputDTInicio={"Data Inicio"}
        valueInputFieldDTInicio={dataInicio}
        onChangeInputFieldDTInicio={(e) => setDataInicio(e.target.value)}
        readOnlyDTInicio={true}

        InputFieldDTFimComponent={InputFieldAction}
        labelInputDTFim={"Data Fim"}
        valueInputFieldDTFim={dataFim}
        onChangeInputFieldDTFim={(e) => setDataFim(e.target.value)}
        // readOnlyDTFim={true}

        InputFieldDescription={InputFieldAction}
        labelInputFieldDescription={"Descrição"}
        valueInputFielDescription={descricao}
        onChangeInputFieldDescription={(e) => setDescricao(e.target.value)}
        styleDescription={{ textTransform: "uppercase" }}
        readOnlyDescription={true}


        InputSelectMarcasComponent={InputSelectActionPromocao}
        labelSelectMarcas={"Marca"}
        optionsMarcas={[
          { value: "all", label: "Selecionar Todas" },
          ...(Array.isArray(optionsMarcas)
            ? optionsMarcas.map((marca) => ({
              value: marca.IDGRUPOEMPRESARIAL,
              label: marca.DSGRUPOEMPRESARIAL
            }))
            : [])
        ]}
        onChangeSelectMarcas={(e) => {
          if (e.value === "all") {
            const allValues = optionsMarcas?.map((marca) => String(marca.IDGRUPOEMPRESARIAL));
            setMarcaSelecionada(allValues);
          } else {
            setMarcaSelecionada(String(e.value));
          }
        }}
        defaultValueSelectMarca={marcaSelecionada}
        // valueSelectMarca={marcaSelecionada}

        InputSelectStatus={InputSelectActionPromocao}
        labelSelectStatus={"Status"}
        optionsStatus={optionsStatus.map((status) => ({
          value: status.value,
          label: status.label,
        }))}
        // valueSelectStatus={statusSelecionado}
        onChangeSelectStatus={(e) => setStatusSelecionado(e.value)}
        valueSelectStatus={optionsStatus.find(option => option.value == statusSelecionado)}

        InputSelectEmpresaComponentAync={MultSelectAction}
        labelSelectEmpresaAsync={"Empresa"}
        optionsEmpresasAsync={[
          { value: "all", label: "Selecionar Todas" },
          ...empresasFiltradas
            ?.filter((empresa) => empresa.status == 'True')
            .map((empresa) => ({
              value: empresa.IDEMPRESA,
              label: empresa.NOFANTASIA
            }))
        ]}
        onChangeSelectEmpresaAsync={(selectedOptions, actionMeta) => {
          if (
            actionMeta &&
            (actionMeta.action === 'remove-value' || actionMeta.action === 'pop-value')
          ) {
            if (actionMeta.removedValue && actionMeta.removedValue.isFixed) {
              return; // Não faz nada se tentar remover uma fixa
            }
          }
          // Ao limpar, mantém só as fixas
          if (actionMeta && actionMeta.action === 'clear') {
            selectedOptions = (empresasSelecionadas || []).filter(opt => opt.isFixed);
          }


          if (!selectedOptions || selectedOptions.length === 0) {
            setEmpresasSelecionadas([]);
            return;
          }
          if (selectedOptions.some((option) => option.value === "all")) {
            const allOptions = empresasFiltradas.map((empresa) => ({
              value: empresa.IDEMPRESA,
              label: empresa.NOFANTASIA,
              isFixed: empresasSelecionadas?.find(e => e.value === empresa.IDEMPRESA)?.isFixed
            }));
            setEmpresasSelecionadas(allOptions);
          } else {
            setEmpresasSelecionadas(selectedOptions);
          }
        }}
        valueSelectEmpresaAsync={empresasSelecionadas || []}


        ButtonTypeEmpresa={ButtonType}
        linkNomeEmpresa={"Visualizar Empresas"}
        onButtonClickEmpresa={() => {
          // mostrarEmpresasPromocao()
          // refetchEmpresasPromocoess();
          setModalEmpresasPromocao(true);
        }}
        corEmpresa={"primary"}
        IconEmpresa={GrView}

        labelSelectSubGrupoOrigemAsync={"Sub Grupo Origem"}
        MenuTreeSelectOrigemComponent={MenuTreeSelect}
        valueTreeSelectOrigem={selectedNodesOrigem}
        onChangeTreeSelectOrigem={handleTreeSelectOrigemChange}
        optionsTreeSelectOrigem={treeData}
        placeholderTreeSelectOrigem={"Selecione"}

        labelSelectSubGrupoDestinoAsync={"Sub Grupo Destino"}
        MenuTreeSelectDestinoComponent={MenuTreeSelect}
        valueTreeSelectDestino={selectedNodesDestino}
        onChangeTreeSelectDestino={handleTreeSelectDestinoChange}
        optionsTreeSelectDestino={treeData}
        placeholderTreeSelectDestino={"Selecione"}


        InputGrupoEstrutura={InputFieldActionRadio}
        labelInputGrupoEstrutura={"Estrutura Mercadológica"}
        valueInputGrupoEstrutura={isCheckedGrupo}
        onChangeInputGrupoEstrutura={(e) => {
          if (e.checked) {
            setIsCheckedGrupo(true);
            setIsCheckedProduto(false); // Desmarca o outro
          } else {
            setIsCheckedGrupo(false);
          }
        }}
        readOnlyGrupoEstrutura={isCheckedGrupo ? false : true}

        InputProduto={InputFieldActionRadio}
        labelInputProduto={"Por Produtos"}
        valueInputProduto={isCheckedProduto}
        onChangeInputProduto={(e) => {
          if (e.checked) {
            setIsCheckedProduto(true);
            setIsCheckedGrupo(false); // Desmarca o outro
          } else {
            setIsCheckedProduto(false);
          }
        }}
        readOnlyProduto={isCheckedProduto ? false : true}

        styleProduto={{ display: isCheckedGrupo ? 'none' : 'block' }}
        styleEstrutura={{ display: isCheckedProduto ? 'none' : 'block' }}

        InputFieldProdutoOigem={InputFieldAction}
        labelInputFieldProdutoOigem={"Produto Origem"}
        valueInputFieldProdutoOigem={produtoOrigem}
        onChangeInputFieldProdutoOigem={(e) => setProdutoOrigem(e.target.value)}
        readOnlyProdutoOigem={fileProdutoOrigem.length > 0 ? true : false}

        ButtonTypeProdutoPesquisadoOrigem={ButtonType}
        linkNomeProdutoPesquisadoOrigem={"Visualizar Produto Pesquisado Origem"}
        onButtonClickProdutoPesquisadoOrigem={handlePesquisarProdutoOrigem}
        corProdutoPesquisadoOrigem={"warning"}
        IconProdutoPesquisadoOrigem={GrView}


        InputFileProdutoOigem={InputFieldAction}
        labelInputFileProdutoOigem={"Produto Origem"}
        acceptFileProdutoOigem=".csv, .xls, .xlsx"
        onChangeInputFileProdutoOigem={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0], true);
            setProdutoOrigem('');
          } else {
            setFileProdutoOrigem([]);
          }
        }}
        readOnlyFileProdutoOigem={produtoOrigem.length > 0 ? true : false}

        ButtonTypeCancelar={ButtonType}
        linkCancelar={"Visualizar Produtos Selecionados Origem"}
        // onButtonClickCancelar={() => {
        //   mostrarProdutosSelecionadosOrigem('origem');
        // }}

        onButtonClickCancelar={() => {
          mostrarProdutosSelecionadosOrigem('origem');
          setProdutoOrigem(''); // Limpa o campo Produto Origem
        }}
        corCancelar={"danger"}
        IconCancelar={GrView}


        InputFieldProdutoDestino={InputFieldAction}
        labelInputFieldProdutoDestino={"Produto Destino"}
        valueInputFieldProdutoDestino={produtoDestino}
        onChangeInputFieldProdutoDestino={(e) => setProdutoDestino(e.target.value)}
        // valueInputFieldProdutoDestino={novoProdutoDestino.join(', ')} // Mostra todos IDs separados por vírgula
        // onChangeInputFieldProdutoDestino={(e) => setNovoProdutoDestino(e.target.value.split(',').map(s => s.trim()))}
        // onChangeInputFieldProdutoDestino={(e) => {
        //   const value = e.target.value;
        //   setProdutoDestino(value ? [value] : []);
        // }}
        readOnlyProdutoDestino={fileProdutoDestino.length > 0 ? true : false}

        ButtonTypeProdutoPesquisadoDestino={ButtonType}
        linkNomeProdutoPesquisadoDestino={"Visualizar Produto Pesquisado Destino"}
        onButtonClickProdutoPesquisadoDestino={handlePesquisarProdutoDestino}
        corProdutoPesquisadoDestino={"secondary"}
        IconProdutoPesquisadoDestino={GrView}


        InputFileProdutoDestino={InputFieldAction}
        labelInputFileProdutoDestino={"Produto Destino"}
        acceptFileProdutoDestino=".csv, .xls, .xlsx"
        onChangeInputFileProdutoDestino={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0], false);
            setProdutoDestino('')
          } else {
            setFileProdutoDestino([]);
          }
        }}
        readOnlyFileProdutoDestino={produtoDestino.length > 0 ? true : false}

        ButtonTypeCadastro={ButtonType}
        linkNome={"Visualizar Produtos Selecionados Destino"}
        onButtonClickCadastro={() => {
          mostrarProdutosSelecionadosDestino('destino');
          setProdutoDestino(''); // Limpa o campo Produto Destino
        }}
        corCadastro={"success"}
        IconCadastro={GrView}

        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Atualizar Promoção Ativa"}
        onButtonClickSearch={handleCadastrar}
        corSearch={"primary"}
        IconSearch={IoIosSend}
        styleButtonSearch={isCheckedProduto ? false : true}

        ButtonTypePedido={ButtonType}
        linkPedido={"Atualizar Promoção Mercadologica"}
        onButtonClickPedido={handleCadastrarEstrutura}
        corPedido={"info"}
        IconPedido={IoIosSend}
        disabledBTBPedido={isCheckedGrupo ? false : true}

        ButtonTypeVisualizarProduto={ButtonType}
        linkNomeVisualizarProduto={"Visualizar Produtos da Promoção Ativa"}
        onButtonClickVisualizarProduto={() => {
          mostrarProdutosPromocaoAtiva();
        }}
        corVisualizarProduto={"info"}
        IconVisualizarProduto={GrView}
        readOnlyVisualizarProduto={isCheckedGrupo ? true : false}

        
        ButtonTypeTXT={ButtonType}
        linkTXT={"Documentação"}
        onButtonClickTXT={mostrarDocumentacao}
        corTXT={"success"}
        IconTXT={GrFormView}

        ButtonTypeRetornar={ButtonType}
        linkRetornar={"Voltar para Pesquisa"}
        corRetornar={"danger"}
        onButtonClickRetornar={handleClickIncluir}
        IconRetornar={AiFillBackward}

        ButtonTypeDownload={ButtonType}
        linkDownload={"Baixar Planilha"}
        corDownload={"success"}
        onButtonClickDownload={downloadPlanilhaModelo}
        IconDownload={FaDownload}
      />

      <ActionProdutoDestinoModal
        show={modalProdutoDestino}
        handleClose={() => setModalProdutoDestino(false)}
        dadosProdutosPesquisa={dadosProdutosPesquisa}
        novoProdutoDestino={novoProdutoDestino}
        setNovoProdutoDestino={setNovoProdutoDestino}
        setProdutoDestino={setProdutoDestino}
      />

      <ActionProdutoOrigemModal
        show={modalProdutoOrigem}
        handleClose={() => setModalProdutoOrigem(false)}
        dadosProdutosPesquisa={dadosProdutosPesquisa}
        novoProdutoOrigem={novoProdutoOrigem}
        setNovoProdutoOrigem={setNovoProdutoOrigem}
        setProdutoOrigem={setProdutoOrigem}
      />

      <ActionDocumentacaoAtualizar
        show={modalDocumentacao}
        handleClose={() => setModalDocumentacao(false)}
      />

      <ActionProdutoModalPromocao
        show={modalProdutoDaPromocao}
        handleClose={() => setModalProdutoDaPromocao(false)}
        dadosProdutosPromocaoDaPromocao={dadosProdutosPromocaoDaPromocao}
        produtoDestinoSelecionado={produtoDestinoSelecionado}
        setProdutoDestinoSelecionado={setProdutoDestinoSelecionado}
        produtoOrigemSelecionado={produtoOrigemSelecionado}
        setProdutoOrigemSelecionado={setProdutoOrigemSelecionado}
        setProdutoDestino={setProdutoDestino}
        refetchProdutosPromocoes={refetchProdutosPromocoes}
      />

      <ActionEmpresasModalPromocao
        show={modalEmpresasPromocao}
        handleClose={() => setModalEmpresasPromocao(false)}
        refetchEmpresasPromocoes={refetchEmpresasPromocoes}
        dadosEmpresasPromocoes={dadosEmpresasPromocoes}
      />

      <ActionProdutoModalPromocaoSelecionado
        show={modalPodutoSelecionadoOrigem}
        handleClose={() => setModalPodutoSelecionadoOrigem(false)}
        produtoOrigemSelecionado={produtoOrigemSelecionado}
        setProdutoOrigemSelecionado={setProdutoOrigemSelecionado}
        novoProdutoOrigem={novoProdutoOrigem}
        setNovoProdutoOrigem={setNovoProdutoOrigem}
        fileProdutoOrigem={fileProdutoOrigem}
        setFileProdutoOrigem={setFileProdutoOrigem}
      />

      <ActionProdutoModalPromocaoSelecionadoDestino
        show={modalPodutoSelecionadoDestino}
        handleClose={() => setModalPodutoSelecionadoDestino(false)}
        produtoDestinoSelecionado={produtoDestinoSelecionado}
        setProdutoDestinoSelecionado={setProdutoDestinoSelecionado}
        novoProdutoDestino={novoProdutoDestino}
        setNovoProdutoDestino={setNovoProdutoDestino}
        fileProdutoDestino={fileProdutoDestino}
        setFileProdutoDestino={setFileProdutoDestino}
      />

    </Fragment>
  )
}