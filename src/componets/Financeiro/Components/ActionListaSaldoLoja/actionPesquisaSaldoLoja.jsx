import { Fragment, useEffect, useState } from "react";
import { ActionMain } from "../../../Actions/actionMain";
import { InputField } from "../../../Buttons/Input";
import { ButtonType } from "../../../Buttons/ButtonType";
import { calcularDataUmDiaMenos, getDataAtual } from "../../../../utils/dataAtual";
import { InputSelectAction } from "../../../Inputs/InputSelectAction";
import { ActionListaSaldoLoja } from "./actionListaSaldoLoja";
import { get } from "../../../../api/funcRequest";
import { AiOutlineSearch } from "react-icons/ai";
import { useQuery } from 'react-query';
import { useFetchData } from "../../../../hooks/useFetchData";
import Swal from "sweetalert2";

export const ActionPesquisaSaldoLoja = () => {
  const [tabelaVisivel, setTabelaVisivel] = useState(false);
  const [clickContador, setClickContador] = useState(0);
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('');
  const [marcaSelecionada, setMarcaSelecionada] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(1000);

  useEffect(() => {
    const dataInicial = getDataAtual();
    setDataPesquisaInicio(dataInicial);
  }, []);

  const { data: optionsMarcas = [], error: errorMarcas, isLoading: isLoadingMarcas } = useFetchData('marcasLista', '/marcasLista');

  const getListaSaldoExtratoLoja = async () => {
    try {
      const dataPesquisaFinal = calcularDataUmDiaMenos(dataPesquisaInicio);
      const urlApi = `/saldo-loja-por-grupo?idGrupoEmpresarial=${marcaSelecionada}&dataPesquisa=${dataPesquisaFinal}`;
      const response = await get(urlApi);

      if (response.data.length && response.data.length === pageSize) {
        let allData = [...response.data];

        async function fetchNextPage(currentPage) {
          try {
            currentPage++;
            const responseNextPage = await get(`${urlApi}&page=${currentPage}`);
            if (responseNextPage.length) {
              allData.push(...responseNextPage.data);
              return fetchNextPage(currentPage);
            } else {
              return allData;
            }
          } catch (error) {
            console.error('Erro ao buscar próxima página:', error);
            throw error;
          }
        }

        await fetchNextPage(currentPage);
        return allData;
      } else {
        return response.data;
      }
    } catch (error) {
      console.error('Erro ao buscar dados faturas loja:', error);
      throw error;
    }
  };

  const { data: dadosSaldoExtratos = [], error: erroQuebra, isLoading: isLoadingQuebra, refetch: refetchListaSaldoExtratoLoja } = useQuery(
    'saldo-loja-por-grupo',
    () => getListaSaldoExtratoLoja(),
    { enabled: false, staleTime: 5 * 60 * 1000 }
  );

  const handleSelectMarca = (e) => {
    setMarcaSelecionada(e.value);
  };

  const handleClick = () => {
    if (marcaSelecionada === '') {
      Swal.fire({
        title: 'Atenção!',
        text: `É necessário selecionar uma marca!`,
        icon: 'warning',
        customClass: {
          container: 'custom-swal',
        },
      })
      return;
    }
    setClickContador(prevContador => prevContador + 1);
    if (clickContador % 2 === 0) {
      setTabelaVisivel(true);
      setCurrentPage(1);
      refetchListaSaldoExtratoLoja();
    }
  };

  return (
    <Fragment>
      <ActionMain
        linkComponentAnterior={["Home"]}
        linkComponent={["Saldo de Contas Correntes das Lojas"]}
        title="Saldo de Contas Correntes das Lojas"
        subTitle="Nome da Loja"
        InputFieldDTInicioComponent={InputField}
        labelInputFieldDTInicio={"Data Início"}
        valueInputFieldDTInicio={dataPesquisaInicio}
        onChangeInputFieldDTInicio={(e) => setDataPesquisaInicio(e.target.value)}

        InputSelectMarcasComponent={InputSelectAction}
        labelSelectMarcas={"Por Marca"}
        optionsMarcas={[
          ...optionsMarcas?.map((empresa) => ({
            value: empresa.IDGRUPOEMPRESARIAL,
            label: empresa.DSGRUPOEMPRESARIAL,
          }))
        ]}
        valueSelectMarcas={marcaSelecionada}
        onChangeSelectMarcas={handleSelectMarca}

        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Pesquisar"}
        onButtonClickSearch={handleClick}
        corSearch={"primary"}
        IconSearch={AiOutlineSearch}
      />

      {tabelaVisivel && (
        <div className="mt-4 ">
          <ActionListaSaldoLoja dadosSaldoExtratos={dadosSaldoExtratos} />
        </div>
      )}
    </Fragment>
  );
};