import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { get, put } from "../../../../../api/funcRequest";
import { useQuery } from "react-query";
import { registrarLogAuditoria } from "../../../../../services/auditLog";


export const useEditarEstilos = ({dadosDetalheEstilos, handleClose, handleClick, usuarioLogado, optionsModulos}) => {
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

    useEffect(() => {
        if (dadosDetalheEstilos) {
            setDescricao(dadosDetalheEstilos[0]?.DS_ESTILOS || '')
            setStatusSelecionado({ value: dadosDetalheEstilos[0]?.STATIVO, label: dadosDetalheEstilos[0]?.STATIVO == 'True' ? 'ATIVO' : 'INATIVO' })
            setSubGrupoSelecionado({ value: dadosDetalheEstilos[0]?.ID_GRUPOESTILOS, label: `${dadosDetalheEstilos[0]?.COD_GRUPOESTILOS} - ${dadosDetalheEstilos[0]?.DS_GRUPOESTILOS}` })
        }
    }, [dadosDetalheEstilos])

    const onSubmit = async () => {
        if(optionsModulos[0]?.ALTERAR == 'False') {
            Swal.fire({
                title: 'Erro!',
                html: `${usuarioLogado?.NOFUNCIONARIO}, <br/> Você não tem permissão para alterar o Estilo!`,
                icon: 'error',
                customClass: {
                    container: 'custom-swal',
                },

            });
            return;
        }

        const postData = {
            IDVINCESTILOSESTRUTURA: parseInt(dadosDetalheEstilos[0]?.IDVINCESTILOSESTRUTURA),
            IDGRUPOESTRUTURAANTIGA: parseInt(dadosDetalheEstilos[0]?.ID_GRUPOESTILOS),
            IDESTILO: parseInt(dadosDetalheEstilos[0]?.ID_ESTILOS),
            DSESTILO: descricao,
            IDGRUPOESTRUTURA: subGrupoSelecionado.value,
            STATIVO: statusSelecionado.value,
        }
        
        try {
            const response = await put('/listaEstilos/:id', postData)

            await registrarLogAuditoria({
                idFuncionario: usuarioLogado?.id,
                pathFuncao: 'CADASTRO / ATUALIZANDO ESTILOS',
                dados: postData
            })
            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: 'Atualizado com sucesso!',
                showConfirmButton: false,
                timer: 5000,
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
                pathFuncao: 'CADASTRO / ERRO AO ATUALIZAR ESTILOS',
                dados: postData
            })

            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            console.error('Erro ao alterar estilo:', error);
            
            handleClick();
            handleClose();
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
        usuarioLogado,
        dadosGrupoEstrutura,
        onSubmit
    };
}; 