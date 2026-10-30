import Swal from "sweetalert2";
import { get, post } from "../../../../../api/funcRequest";
import { registrarLogAuditoria } from "../../../../../services/auditLog";
import { useState } from "react";
import { useEffect } from "react";
import { useQuery } from "react-query";



export const useCadastrarMetaColaborador = ({ 
    usuarioLogado, 
    optionsModulos,
    dadosDetalhe,
    secaoMeta
}) => {
    const [secao, setSecao] = useState(secaoMeta || '')
    const [data, setData] = useState('')
    const [vrMeta, setVrMeta] = useState('')
    const [percentualMeta, setPercentualMeta] = useState('')
    const [colaboradorMeta, setColaboradorMeta] = useState('')
    const [qtdColaboradorMeta, setQtdColaboradorMeta] = useState('')
    const [vrColaboradorMeta, setVrColaboradorMeta] = useState('')
    const [percentualColaboradorMeta, setPercentualColaboradorMeta] = useState('')
    const [colaboradorSelecionado, setColaboradorSelecionado] = useState([])

    const { data: dadosMetasColaborador = [], error: errorDadosMetasColaborador, isLoading, refetch: refetchMetas } = useQuery(
        ['metas-colaborador', dadosDetalhe, secaoMeta ],
        async () => {
          const response = await get(`/metas-colaborador?idEmpresa=${dadosDetalhe[0]?.IDEMPRESA}&idMetaLoja=${dadosDetalhe[0]?.IDMETASLOJA}&noSecaoMetaLoja=${encodeURIComponent(secaoMeta || 'CALÇADOS')}`);
    
          return response.data;
        },
        { enabled: Boolean(dadosDetalhe[0]?.IDEMPRESA) }
    );
 
    useEffect(() => {
        
        if(dadosMetasColaborador && dadosMetasColaborador?.length > 0) {
            setQtdColaboradorMeta(dadosMetasColaborador?.length)
            setVrColaboradorMeta(dadosMetasColaborador[0]?.metasColaborador?.['VRMETACOLABORADOR'])
            setPercentualColaboradorMeta(dadosMetasColaborador[0]?.metasColaborador?.['PERCMETACOLABORADOR'])
        } else {
            setQtdColaboradorMeta(0)
            setVrColaboradorMeta(0)
            setPercentualColaboradorMeta(0)
        }
    }, [dadosMetasColaborador])

    const { data: dadosColaborador = [], error: errorDadosColaborador, isLoading: isLoadingColaborador, refetch: refetchColaborador } = useQuery(
        ['funcionario-metas', dadosDetalhe ],
        async () => {
          const response = await get(`/funcionario-metas?idEmpresa=${dadosDetalhe[0]?.IDEMPRESA}&status=True&dsFuncao=True`);
    
          return response.data;
        },
        { enabled: Boolean(dadosDetalhe[0]?.IDEMPRESA), }
    );

    console.log(dadosDetalhe[0], 'dados')
    useEffect(() => {
        setSecao(secaoMeta || '')
        if(dadosDetalhe && dadosDetalhe.length > 0) {
            // setPercentualColaboradorMeta(dadosDetalhe[0]?.PERCVENDACALCADOS)
            // setVrColaboradorMeta(dadosDetalhe[0]?.VRMETAVENDACALCADOS)
            setVrMeta(
                dadosDetalhe[0]?.VRMETAVENDACALCADOS || 
                dadosDetalhe[0]?.VRTOTALMETAFEM || 
                dadosDetalhe[0]?.VRTOTALMETAMASC || 
                dadosDetalhe[0]?.VRTOTALMETAINFAN ||
                dadosDetalhe[0]?.VRTOTALMETACMB
            )
            setPercentualMeta(
                dadosDetalhe[0]?.PERCVENDACALCADOS || 
                dadosDetalhe[0]?.PERCTOTALVENDAFEM || 
                dadosDetalhe[0]?.PERCTOTALMETAMASC ||
                dadosDetalhe[0]?.PERCTOTALMETAINFANT ||
                dadosDetalhe[0]?.PERCTOTALMETACMB
            
            )
            setData(`${dadosDetalhe[0]?.DTMETAINICIO} a ${dadosDetalhe[0]?.DTMETAFIM}`)
        }
    },[] )

    const handleClickFuncionario = async () => {
        refetchColaborador()
    }
   
    const onSubmit = async (periodo, dadosLinhas, metas) => {
        if (optionsModulos[0]?.ALTERAR == 'False') {
            Swal.fire({
                icon: "error",
                title: "Permissão Negada!",
                html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão.`,
                customClass: {
                    container: 'custom-swal'
                },
                timer: 6000
            });
            return;
        }
     


        try {
            const confirmacao = await Swal.fire({
                title: "Certeza que Deseja Finalizar o Cadastro?",
                text: "Você não poderá reverter esta ação!",
                icon: "warning",
                showCancelButton: true,
                buttonsStyling: false,
                customClass: {
                    confirmButton: "btn btn-primary btn-lg pl-1",
                    cancelButton: "btn btn-danger btn-lg mr-1",
                    loader: 'custom-loader',
                    container: 'custom-swal'
                },
            });

            if (!confirmacao.isConfirmed) return;

            Swal.fire({
                title: 'Cadastrando',
                allowOutsideClick: false,
                customClass: {
                    container: 'custom-swal'
                },
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const dados = {
                IDMETASLOJA: parseInt(dadosDetalhe[0]?.IDMETASLOJA),
                DTMETAINICIO: dadosDetalhe[0]?.DTINIMETA,
                DTMETAFIM: dadosDetalhe[0]?.DTFIMMETA,
                IDEMPRESA: parseInt(dadosDetalhe[0]?.IDEMPRESA),
                METASDETALHE: colaboradorSelecionado.map(id => ({ IDColab: id })),
                NOSECAO: secaoMeta,
                VRMETAVENDAGERAL: parseFloat(vrMeta),
                PERCMETAVENDAGERAL: parseFloat(percentualMeta),
                VRMETACOLABORADOR: parseFloat(vrColaboradorMeta),
                PERCMETACOLABORADOR: parseFloat(percentualColaboradorMeta),
                STATIVO: 'True',
            };

            await registrarLogAuditoria({
                idFuncionario: usuarioLogado?.id,
                pathFuncao: 'COMERCIAL/CADASTRO METAS COLABORADOR',
                dados: dados
            });

            // const response = await post("/cadastrar-met", dados);
            const response = await post("/cadastrar-metas-colaborador", dados);

            Swal.close();

            await Swal.fire({
                icon: 'success',
                title: 'Sucesso',
                text: 'Meta Criada com Sucesso',
                customClass: { container: 'custom-swal' }
            });

            handleClick();

            return response?.data;
        } catch (error) {
            Swal.close();
            console.error(error);
            const dados = {
                IDGRUPOEMPRESA: parseInt(periodo?.IDGRUPOEMPRESA),
                IDFUNCIONARIO: parseInt(usuarioLogado?.id),
                DTMETAINICIO: periodo?.DTMETAINICIO,
                DTMETAFIM: periodo?.DTMETAFIM,
                METASDETALHE: montarMetasDetalhe(dadosLinhas, metas),
                STATIVO: 'True',
                STSALVO: 'True'
            };

            await registrarLogAuditoria({
                idFuncionario: usuarioLogado?.id,
                pathFuncao: 'COMERCIAL/ERRO AO CADASTRAR META DE VENDAS',
                dados: dados
            });

            Swal.fire({
                icon: "error",
                title: "Erro!",
                text: `Erro ao cadastrar a meta`,
                customClass: {
                    container: 'custom-swal'
                }
            });
        }
    };


    return { 
        secao,
        setSecao,
        data, 
        setData,
        vrMeta, 
        setVrMeta,
        percentualMeta, 
        setPercentualMeta,
        colaboradorMeta, 
        setColaboradorMeta,
        qtdColaboradorMeta, 
        setQtdColaboradorMeta,
        vrColaboradorMeta, 
        setVrColaboradorMeta,
        percentualColaboradorMeta, 
        setPercentualColaboradorMeta,
        colaboradorSelecionado, 
        setColaboradorSelecionado,
        dadosMetasColaborador,
        dadosColaborador,
        handleClickFuncionario,
        refetchColaborador,
        onSubmit 
    };

}
/*
[
    {
        "IDEMPRESA": 1,
        "IDMETASLOJA": 1,
        "DTMETAINICIO": "2024-02-20T03:00:00.000Z",
        "DTMETAFIM": "2024-02-20T03:00:00.000Z",
        "NOSECAO": "CALÇADOS",
        "VRMETAVENDAGERAL": 1788.59,
        "PERCMETAVENDAGERAL": 12.8,
        "VRMETACOLABORADOR": 447.148,
        "PERCMETACOLABORADOR": 3.2,
        "METASDETALHE": [
            {
                "IDColab": 30638
            },
            {
                "IDColab": 30639
            }
        ],
        "STATIVO": "True"
    }
] */