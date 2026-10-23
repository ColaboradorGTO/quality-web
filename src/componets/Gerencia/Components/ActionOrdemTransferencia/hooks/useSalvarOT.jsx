import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { get, post } from "../../../../../api/funcRequest";
import { useQuery } from "react-query";
import axios from "axios";
import { toFloat } from "../../../../../utils/toFloat";

export const useSalvarOT = ({ handleClick, handleClose, optionsModulos, usuarioLogado }) => {
  const [empresaOrigem, setEmpresaOrigem] = useState('')
  const [empresaDestino, setEmpresaDestino] = useState('')
  const [produto, setProduto] = useState('')
  const [ipUsuario, setIpUsuario] = useState('');
  const [dadosProdutosTabela, setDadosProdutosTabela] = useState([]);
  const [produtoSalvo, setProdutoSalvo] = useState([]);


  const getIPUsuario = async () => {
    let usuarioIP = null;

    try {
      const { data: ipWhoisData } = await axios.get("https://ifconfig.me/ip");
      usuarioIP = ipWhoisData?.ip;
    } catch (error) {
      console.error("Erro ao buscar IP via ipwho.is:", error);
    }

    if (!usuarioIP) {
      try {
        const { data: ipifyData } = await axios.get("https://api.ipify.org?format=json");
        usuarioIP = ipifyData?.ip;
      } catch (error) {
        console.error("Erro ao buscar IP via ipify.org:", error);
      }
    }
    setIpUsuario(usuarioIP);
    return usuarioIP;
  };

  const { data: dadosEmpresa = [], error: errorMarcas, isLoading: isLoadingMarcas } = useQuery(
    'empresas',
    async () => {
      const response = await get(`/empresas`);
      return response.data;
    },
    { staleTime: 5 * 60 * 1000 }
  );


  const { data: dadosProdutos = [], isLoading: isLoadingProdutos } = useQuery(
    ['listaProdutos', produto, usuarioLogado?.IDEMPRESA],
    async () => {

      const response = await get(`/listaProdutos?idEmpresa=${usuarioLogado?.IDEMPRESA}&idProduto=${produto}&page=1 `);

      setDadosProdutosTabela(prev => {
        const novos = [...prev];

        response.data.forEach(novo => {
          const index = novos.findIndex(p => p.IDPRODUTO === novo.IDPRODUTO);

          if (index >= 0) {
            novos[index] = {
              ...novos[index],
              QUANTIDADE: (novos[index].QUANTIDADE || 1) + 1
            };
          } else {
            novos.push({
              ...novo,
              QUANTIDADE: 1
            });
          }
        });

        return novos;
      });
      setProduto("");
      return response.data;
    },
    { enabled: !!(produto.length > 8 && empresaDestino?.value && usuarioLogado?.IDEMPRESA) }
  );

  useEffect(() => {
    if (produto.length > 4 && empresaDestino <= 0) {
      Swal.fire({
        title: 'A Loja de Origem e Destino devem ser Preenchidas!',
        icon: 'info',
        confirmButtonText: 'Ok',
        customClass: {
          container: 'custom-swal',
        }
      });
      setProduto("");
      return;
    }
  }, [produto, empresaDestino]);

  /*  useEffect(() => {
     if (produto.length > 4 && empresaDestino <= 0) {
       Swal.fire({
         title: 'A Loja de Origem e Destino devem ser Preenchidas!',
         icon: 'info',
         confirmButtonText: 'Ok',
         customClass: {
           container: 'custom-swal',
         }
       });
       // setProduto(""); 
       return;
     }
   }, [dadosProdutos, produto]); */

  /*   useEffect(() => {
      if (produto.length > 5) {
  
        refetchProdutos();
      }
    }, [dadosProdutos, produto]);
   */

  const onSubmit = async () => {
    if (optionsModulos[0]?.CRIAR == 'False') {
      Swal.fire({
        title: 'Erro!',
        text: `${usuarioLogado?.NOFUNCIONARIO},\nVocê não tem permissão para criar a OT!`,
        icon: 'error',
        customClass: {
          container: 'custom-swal',
        }
      });
      return;
    }
    try {

      var nCtTotalItens = 0;
      var nQtdTotalItens = 0;
      var dVlrTotalVenda = 0;
      var dVlrTotalCusto = 0;

      const dadosdetalheot = dadosProdutosTabela.map((item) => {
        const nQtdProduto = Number(item.QUANTIDADE);
        const nVlrVenda = parseFloat(item.PRECOVENDA);
        const nVlrCusto = parseFloat(item.PRECOCUSTO);

        nCtTotalItens++;
        nQtdTotalItens = nQtdTotalItens + toFloat(nQtdProduto);
        dVlrTotalVenda = dVlrTotalVenda + (toFloat(nQtdProduto) * toFloat(nVlrVenda));
        dVlrTotalCusto = dVlrTotalCusto + (toFloat(nQtdProduto) * toFloat(nVlrCusto));

        return {
          IDPRODUTO: item.IDPRODUTO,
          QTDEXPEDICAO: nQtdProduto,
          QTDRECEPCAO: 0,
          QTDDIFERENCA: 0,
          QTDAJUSTE: 0,
          VLRUNITVENDA: nVlrVenda,
          VLRUNITCUSTO: nVlrCusto,
          STCONFERIDO: 'False',
          IDUSRAJUSTE: 0,
          STATIVO: 'True',
          STFALTA: 'False',
          STSOBRA: 'False'
        };
      });

      const postData = {
        IDRESUMOOT: parseInt(0),
        IDEMPRESAORIGEM: usuarioLogado?.IDEMPRESA,
        IDEMPRESADESTINO: parseInt(empresaDestino?.value),
        IDOPERADOREXPEDICAO: usuarioLogado?.id,
        NUTOTALITENS: nCtTotalItens,
        QTDTOTALITENS: nQtdTotalItens,
        QTDTOTALITENSRECEPCIONADO: 0,
        QTDTOTALITENSDIVERGENCIA: 0,
        NUTOTALVOLUMES: 0,
        TPVOLUME: "",
        VRTOTALCUSTO: dVlrTotalCusto,
        VRTOTALVENDA: dVlrTotalVenda,
        DTRECEPCAO: "",
        IDOPERADORRECEPTOR: 0,
        DSOBSERVACAO: "",
        IDUSRCANCELAMENTO: 0,
        IDSTDIVERGENCIA: 0,
        OBSDIVERGENCIA: "",
        STEMISSAONFE: "False",
        NUMERONFE: "",
        STENTRADAINVENTARIO: "False",
        QTDCONFERENCIA: 0,
        IDSTATUSOT: 1,
        IDUSRAJUSTE: 0,
        DTAJUSTE: "",
        QTDTOTALITENSAJUSTE: 0,
        DATAEXPEDICAO: "",
        DTULTALTERACAO: "",
        dadosdetalheot: dadosdetalheot,
      };

      const response = await post('/criar-resumo-ordem-transferencia', postData);

      const textDados = JSON.stringify(postData);
      let textoFuncao = 'EXPEDICAO/OT CRIADA COM SUCESSO';
      const ipUsuario = await getIPUsuario();

      const createData = {
        IDFUNCIONARIO: String(usuarioLogado?.id),
        PATHFUNCAO: textoFuncao,
        DADOS: textDados,
        IP: ipUsuario || "INDISPONÍVEL"
      };

      await post('/log-web', createData)

      await Swal.fire({
        title: 'Cadastro',
        text: 'OT cadastrada com Sucesso',
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: {
          container: 'custom-swal',
        },

      });


      handleClose();
      handleClick();
      return response.data;
    } catch (error) {
      var nCtTotalItens = 0;
      var nQtdTotalItens = 0;
      var dVlrTotalVenda = 0;
      var dVlrTotalCusto = 0;

      const dadosdetalheot = dadosProdutosTabela.map((item) => {
        const nQtdProduto = 1;
        const nVlrVenda = parseFloat(item.PRECOVENDA);
        const nVlrCusto = parseFloat(item.PRECOCUSTO);

        nCtTotalItens++;
        nQtdTotalItens = nQtdTotalItens + toFloat(nQtdProduto);
        dVlrTotalVenda = dVlrTotalVenda + (toFloat(nQtdProduto) * toFloat(nVlrVenda));
        dVlrTotalCusto = dVlrTotalCusto + (toFloat(nQtdProduto) * toFloat(nVlrCusto));

        return {
          IDPRODUTO: item.IDPRODUTO,
          QTDEXPEDICAO: nQtdProduto,
          QTDRECEPCAO: 0,
          QTDDIFERENCA: 0,
          QTDAJUSTE: 0,
          VLRUNITVENDA: nVlrVenda,
          VLRUNITCUSTO: nVlrCusto,
          STCONFERIDO: 'False',
          IDUSRAJUSTE: 0,
          STATIVO: 'True',
          STFALTA: 'False',
          STSOBRA: 'False'
        };
      });

      const postData = {
        IDRESUMOOT: parseInt(0),
        IDEMPRESAORIGEM: usuarioLogado?.IDEMPRESA,
        IDEMPRESADESTINO: parseInt(empresaDestino?.value),
        IDOPERADOREXPEDICAO: usuarioLogado?.id,
        NUTOTALITENS: nCtTotalItens,
        QTDTOTALITENS: nQtdTotalItens,
        QTDTOTALITENSRECEPCIONADO: 0,
        QTDTOTALITENSDIVERGENCIA: 0,
        NUTOTALVOLUMES: 0,
        TPVOLUME: "",
        VRTOTALCUSTO: dVlrTotalCusto,
        VRTOTALVENDA: dVlrTotalVenda,
        DTRECEPCAO: "",
        IDOPERADORRECEPTOR: 0,
        DSOBSERVACAO: "",
        IDUSRCANCELAMENTO: 0,
        IDSTDIVERGENCIA: 0,
        OBSDIVERGENCIA: "",
        STEMISSAONFE: "False",
        NUMERONFE: "",
        STENTRADAINVENTARIO: "False",
        QTDCONFERENCIA: 0,
        IDSTATUSOT: 1,
        IDUSRAJUSTE: 0,
        DTAJUSTE: "",
        QTDTOTALITENSAJUSTE: 0,
        DATAEXPEDICAO: "",
        DTULTALTERACAO: "",
        dadosdetalheot: dadosdetalheot,
      };


      const textDados = JSON.stringify(postData);
      let textoFuncao = 'EXPEDICAO/ERRO AO CRIAR OT COM SUCESSO';
      const ipUsuario = await getIPUsuario();

      const createData = {
        IDFUNCIONARIO: String(usuarioLogado?.id),
        PATHFUNCAO: textoFuncao,
        DADOS: textDados,
        IP: ipUsuario || "INDISPONÍVEL"
      };

      const responsePost = await post('/log-web', createData)

      Swal.fire({
        title: 'Erro',
        text: 'Ocorreu um erro ao Salvar a OT.',
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: {
          container: 'custom-swal',
        },
      });


      return responsePost.data;

    }
  };

  return {
    empresaOrigem,
    setEmpresaOrigem,
    empresaDestino,
    setEmpresaDestino,
    produto,
    setProduto,
    dadosEmpresa,
    dadosProdutosTabela,
    setDadosProdutosTabela,
    produtoSalvo,
    setProdutoSalvo,
    onSubmit,
  };
};
