import Swal from "sweetalert2";
import { get, post } from "../../../../../api/funcRequest";
import axios from "axios";
import { useState } from "react";
import { useQuery } from "react-query";

export const useCadastrarImagemProduto = ({usuarioLogado, optionsModulos}) => {
    const [ipUsuario, setIpUsuario] = useState(null);
    const [referencia, setReferencia] = useState('');
    const [numeroPedido, setNumeroPedido] = useState('');
    const [novoProduto, setNovoProduto] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [codImgProd, setCodImgProd] = useState('');
    const [currentFile, setCurrentFile] = useState(null);

    const { data: dadosDetalheProdutos = [], error: errorImagens, isLoading: isLoadingImagens } = useQuery(
        ['produtos-imagens', referencia],
        async () => {
            const response = await get(`/produtos-imagens?numeroRefProduto=${referencia}`);
            return response.data;
        },
        { enabled: Boolean(referencia.length > 2), staleTime: 60 * 60 * 1000, cacheTime: 60 * 60 * 1000 }
    );

    const getIPUsuario = async () => {
        let usuarioIP = null;

        try {
            const { data: ipWhoisData } = await axios.get("https://ifconfig.me/ip");
            usuarioIP = ipWhoisData?.ip;
        } catch (error) {
            console.error("Erro ao buscar IP via ifconfig.me:", error);
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

  
    const onSubmit = async () => {
        if (optionsModulos[0]?.CRIAR == 'False') {
            Swal.fire({
                title: 'Erro!',
                html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para cadastrar imagens de produtos!`,
                icon: 'error',
                customClass: {
                    container: 'custom-swal',
                },
            });
            return;
        }

        if(novoProduto.length === 0){ 
            Swal.fire({
                title: 'Erro!',
                html: `Nenhum produto selecionado para cadastrar a imagem!`,
                icon: 'error',
                customClass: {
                    container: 'custom-swal',
                },

            })
            return;
        }

        const postData = {
            IDRESUMOPEDIDO: parseInt(numeroPedido),
            NUREF: referencia,
            IMAGEM: codImgProd,
            STATIVO: 'True',
            IDPRODIMAGEM: novoProduto.map(item => ({
                IDProduto: String(item.IDPRODUTO),
                IDForProduto: parseInt(item.IDFORNECEDOR),
                IDFabProduto: parseInt(item.IDFABRICANTE),
                IDSubEstrutProduto: parseInt(item.IDSUBGRUPO),
            }))
        }

        try {

            const response = await post('/cadastrar-imagem-produto', postData)


            const textDados = JSON.stringify(postData)
            let textFuncao = 'COMPRASADM/CADASTRAR IMAGEM PRODUTO';
            const ipUsuario = await getIPUsuario();
            const createtLog = {
                IDFUNCIONARIO: String(usuarioLogado.id),
                PATHFUNCAO: textFuncao,
                DADOS: textDados,
                IP: ipUsuario || 'Indisponível'
            }

            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Atualizado com sucesso!',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                }
            })
            await post('/log-web', createtLog)


            return response.data;
        } catch (error) {
            const textDados = JSON.stringify(postData)
            let textFuncao = 'COMPRASADM/ERRO AO CADASTRAR IMAGEM PRODUTO';
            const ipUsuario = await getIPUsuario();
            const createtLog = {
                IDFUNCIONARIO: String(usuarioLogado.id),
                PATHFUNCAO: textFuncao,
                DADOS: textDados,
                IP: ipUsuario || 'Indisponível' 
            }
            await post('/log-web', createtLog)
            Swal.fire({
                position: 'top-end',
                icon: 'error',
                title: 'Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            console.error('Erro ao cadastrar imagem do produto:', error);
        }
    }
    return {
        referencia,
        setReferencia,
        numeroPedido,
        setNumeroPedido,
        dadosDetalheProdutos,
        novoProduto,
        setNovoProduto,
        selectedImage,
        setSelectedImage,
        codImgProd,
        setCodImgProd,
        currentFile,
        setCurrentFile,
        onSubmit
    }
}