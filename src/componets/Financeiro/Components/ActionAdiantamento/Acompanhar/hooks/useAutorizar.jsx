import { useState } from "react";
import { get, put } from "../../../../../../api/funcRequest";
import Swal from "sweetalert2";
import { registrarLogAuditoria } from "../../../../../../services/auditLog";


export const useAutorizar = ({
    optionsModulos,
    usuarioLogado,
    handleClick,
    
}) => {
   
    const handleAutorizar = async (IDADIANTAMENTO) => {
  
        if (optionsModulos[0]?.CRIAR == 'False') {
            Swal.fire({
                position: 'center',
                icon: 'error',
                html: `${usuarioLogado?.NOFUNCIONARIO} <br> Você não tem permissão para registrar um pagamento.`,
                showConfirmButton: true,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            return;
        }

        const confirmacao = await Swal.fire({
            position: 'center',
            icon: 'question',
            title: 'Confirmar autorização',
            text: 'Deseja realmente autorizar este adiantamento?',
            showCancelButton: true,
            confirmButtonText: 'Enviar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            reverseButtons: true,
            customClass: {
                container: 'custom-swal',
            },
        });

        if (!confirmacao.isConfirmed) {
            return;
        }

        let detalhe = null;
        try {
            const responseDetalhe = await get(`/lista-adiantamento-departamento?idAdiantamento=${IDADIANTAMENTO}`);
            detalhe = responseDetalhe?.data?.[0];
        } catch (error) {
            console.error('Erro ao buscar detalhes do adiantamento:', error);
        }
   
        if (!detalhe) {
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Detalhes do adiantamento não encontrados.',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            return;
        }

        const postData = {
            IDADIANTAMENTO: detalhe?.IDADIANTAMENTO,
            STATUS: 'AUTORIZADO',
            DEPARTAMENTO: detalhe?.DEPARTAMENTO,
            IDEMPRESA: detalhe?.IDEMPRESA,
            NUCNPJEMPRESA: detalhe?.NUCNPJEMPRESA,
            CNPJFATURAMENTO: detalhe?.CNPJFATURAMENTO,
            RAZAOSOCIALFATURAMENTO: detalhe?.RAZAOSOCIALFATURAMENTO,
            VRSOLICITADO: parseFloat(detalhe?.VRSOLICITADO),
            DESCRICAO: detalhe?.DESCRICAO,
            POSSUINOTAFISCAL: detalhe?.POSSUINOTAFISCAL,
            ANEXOORCAMENTO: detalhe?.ANEXOORCAMENTO,
            ANEXONOTAFISCAL: detalhe?.ANEXONOTAFISCAL,
            DSJUSTIFICATIVA: detalhe?.DSJUSTIFICATIVA,
            IDUSUARIOALTERACAO: usuarioLogado?.id,
            RAZAOSOCIALEMPRESA: detalhe?.RAZAOSOCIALEMPRESA,
            TPBENEFICIARIO: detalhe?.TPBENEFICIARIO,
            NUCPFBENEFICIARIO: detalhe?.NUCPFBENEFICIARIO,
            NOBENEFICIARIO: detalhe?.NOBENEFICIARIO,
            NURGBENEFICIARIO: detalhe?.NURGBENEFICIARIO,
            EMAILBENEFICIARIO: detalhe?.EMAILBENEFICIARIO,
            NUCEPBENEFICIARIO: detalhe?.NUCEPBENEFICIARIO,
            ENDERECOBENEFICIARIO: detalhe?.ENDERECOBENEFICIARIO,
            TELEFONEBENEFICIARIO: detalhe?.TELEFONEBENEFICIARIO,
            DTNASCIMENTOBENEFICIARIO: detalhe?.DTNASCIMENTOBENEFICIARIO,
            TPDESPESA: detalhe?.TPDESPESA,
            NOFAVORECIDO: detalhe?.NOFAVORECIDO,
            FORMAPAGAMENTO: detalhe?.FORMAPAGAMENTO,
            CHAVEPIX: detalhe?.CHAVEPIX,
            IDBANCO: detalhe?.IDBANCO,
            NUAGENCIA: detalhe?.NUAGENCIA,
            NUCONTA: detalhe?.NUCONTA,
            NUDIGITOCONTA: detalhe?.NUDIGITOCONTA,
            UNIDADENEGOCIO: detalhe?.UNIDADENEGOCIO,
            CENTROCUSTO: detalhe?.CENTROCUSTO,
            DTPAGAMENTO: detalhe?.DTPAGAMENTO,
            STATIVO: 'True',
        }

        try {

            const response = await put(`/adiantamento-departamento/:id`, postData)
 
            await registrarLogAuditoria({
                idFuncionario: usuarioLogado.id,
                pathFuncao: 'FINANCEIRO/AUTORIZADO PAGAMENTO',
                dados: postData
            });

            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Autorizado com sucesso!',
                showConfirmButton: false,
                timer: 5000,
                customClass: {
                    container: 'custom-swal',
                },
            })

            handleClick?.();
            
            return response.data;

        } catch (error) {
            const responsePost = await registrarLogAuditoria({
                idFuncionario: usuarioLogado.id,
                pathFuncao: 'FINANCEIRO/ERRO AO AUTORIZAR',
                dados: postData
            });

            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Ocorreu um erro ao anexar nota fiscal. Por favor, tente novamente.',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            console.error('Erro ao registrar pagamento:', error);
            return responsePost?.data;
        }
    }

    return {
        handleAutorizar
    }
}
