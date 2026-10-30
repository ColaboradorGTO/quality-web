import Swal from "sweetalert2";
import { get, put } from "../../../../../api/funcRequest";
import { useState } from "react";
import { registrarLogAuditoria } from "../../../../../services/auditLog";


const formatarDataParaEnvio = (data) => {
    const [dia, mes, ano] = data.split('-');
    return `${ano}-${mes}-${dia} 00:00:00`;
};

export const useCancelarMetaColaborador = ({ usuarioLogado, optionsModulos, handleClick }) => {
    const [dadosMetas, setDadosMetas] = useState([])

    const handleCancelar = async (row, status) => {
      
        if (optionsModulos[0]?.ALTERAR == 'False') {
            Swal.fire({
                icon: "error",
                title: "Permissão Negada!",
                html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão.`,
                customClass: {
                    container: 'custom-swal'
                }
            });
            return;
        }
        
        
        try {

            let motivoCancelamento = '';
 
            const confirmacao = await Swal.fire({
                title: `Certeza que Deseja Cancelar essa Meta`,
                text: "Você não poderá reverter esta ação!",
                icon: "warning",
                showCancelButton: true,
                buttonsStyling: false,
                customClass: {
                    confirmButton: "btn btn-primary btn-lg mr-2",
                    cancelButton: "btn btn-danger btn-lg ",
                    loader: 'custom-loader'
                },
            });

            if (!confirmacao.isConfirmed) return;

            
            const { value: motivo, isConfirmed } = await Swal.fire({
                icon: 'question',
                title: `Motivo do Cancelamento?`,
                input: 'text',
                inputLabel: 'Motivo do Cancelamento da Meta?',
                inputPlaceholder: 'Motivo do Cancelamento da Meta?',
                inputAttributes: {
                    style: 'text-transform: uppercase'
                },
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Confirmar',
                cancelButtonText: 'Voltar',
                showLoaderOnConfirm: true,

                inputValidator: (value) => {
                    const motivo = value?.trim();

                    if (!motivo) {
                        return 'Coloque o Motivo para Cancelar a Meta!';
                    }

                    if (motivo.length < 10) {
                        return 'Motivo Muito Curto, mínimo 10 caracteres!';
                    }
                }
            });

            if (!isConfirmed || !motivo) return;

            motivoCancelamento = motivo.trim();

              console.log(row, 'row')
            const dados = {
                IDMETASLOJA: parseInt(row?.IDMETASLOJA),
                IDMETASCOLABORADOR: parseInt(row?.IDMETASCOLABORADOR),
                DSMOTIVOCANCELAMENTO: motivoCancelamento,
                NOSECAO: row.NOSECAO,
                STATIVO: 'False',
            };

            const response = await put("/delete-meta-colaborador/:id", dados);
            
            await registrarLogAuditoria({
                idFuncionario: usuarioLogado?.id,
                pathFuncao: 'COMERCIAL/DESATIVANDO META DE VENDAS',
                dados: dados
            });
            
      

            await Swal.fire({
                icon: "success",
                title: "Sucesso!",
                html: `Meta Cancelado com sucesso`,
                customClass: {
                    container: 'custom-swal'
                }
            });

            handleClick();
            return response.data;
        } catch (error) {
            Swal.close();

            console.error(error);

            Swal.fire({
                icon: "error",
                title: "Erro!",
                text: `Erro ao cancelar a meta`,
                customClass: {
                    container: 'custom-swal'
                }
            });
        }
    };


    return { handleCancelar };
}