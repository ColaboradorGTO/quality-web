import { useState } from "react";
import Swal from "sweetalert2";
import { get, post  } from "../../../../../api/funcRequest";
import { useQuery } from "react-query";
import { registrarLogAuditoria } from "../../../../../services/auditLog";

export const useCadastrarEstilos = ({ handleClose, handleClick, usuarioLogado, optionsModulos }) => {
    const [descricao, setDescricao] = useState('')
    const [statusSelecionado, setStatusSelecionado] = useState([])
    const [subGrupoSelecionado, setSubGrupoSelecionado] = useState("")

    const { data: dadosGrupoEstrutura = [], error: errorGrupoEstrutura, isLoading: isLoadingGrupoEstrutura, refetch: refetchGrupoEstrutura } = useQuery(
        'grupoEstrutura',
        async () => {
            const response = await get(`/grupoEstrutura`);

            return response.data;
        },
        { enabled: true, staleTime: 60 * 60 * 1000, }
    );


    const onSubmit = async () => {

        if(optionsModulos[0]?.CRIAR == 'False') {
            Swal.fire({
                title: 'Erro!',
                html: `${usuarioLogado?.NOFUNCIONARIO}, <br/> Você não tem permissão para cadastrar o Estilo!`,
                icon: 'error',
                customClass: {
                    container: 'custom-swal',
                },
            });
            return;
        }

        const putData = {
            DSESTILO: descricao,
            IDESTILO: null,
            IDGRUPOESTRUTURAANTIGA: null,
            IDVINCESTILOSESTRUTURA: null,
            IDGRUPOESTRUTURA: Number(subGrupoSelecionado?.value),
            STATIVO: statusSelecionado?.value,
        }
        try {

            const response = await post('/criarlistaEstilos', putData)
   
            await registrarLogAuditoria({
                idFuncionario: usuarioLogado?.id,
                pathFuncao: 'CADASTRO / CADASTRANDO ESTILOS',
                dados: putData
            })

            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: 'Cadastrado com sucesso!',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                }
            })
            handleClick();
            handleClose();
            return response.data;
        } catch (error) {
            
            await registrarLogAuditoria({
                idFuncionario: usuarioLogado?.id,
                pathFuncao: 'CADASTRO / ERRO AO CADASTRAR ESTILOS',
                dados: putData
            })

            Swal.fire({
                position:   'center',
                icon: 'error',
                title: 'Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            console.error('Erro ao cadastrar estilo:', error);
            return;
        }
    }

    return {
        descricao,
        setDescricao,
        statusSelecionado,
        setStatusSelecionado,
        subGrupoSelecionado,
        setSubGrupoSelecionado,
        dadosGrupoEstrutura,
        onSubmit
    };
};