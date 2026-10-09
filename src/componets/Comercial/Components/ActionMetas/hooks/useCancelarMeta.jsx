import Swal from "sweetalert2";
import { get, put } from "../../../../../api/funcRequest";
import { useState } from "react";
import { registrarLogAuditoria } from "../../../../../services/auditLog";


const formatarDataParaEnvio = (data) => {
    const [dia, mes, ano] = data.split('-');
    return `${ano}-${mes}-${dia} 00:00:00`;
};

export const useCancelarMeta = ({ usuarioLogado, optionsModulos, handleClick }) => {
    const [dadosMetas, setDadosMetas] = useState([])

    const handleCancelar = async (row, status) => {
        
        if (optionsModulos[0]?.ALTERAR == 'False') {
            Swal.fire({
                icon: "error",
                title: "Permissão Negada!",
                html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão Para Cancelar uma meta.`,
                customClass: {
                    container: 'custom-swal'
                }
            });
            return;
        }
        
        
        
        try {
            const responseExistente = await get(`meta-vendas?dataPesquisaInicio=${row?.DTMETAINICIO}&dataPesquisaFim=${row?.DTMETAFIM}&idMarca=${row?.IDGRUPOEMPRESA}`)
            const metaExistente = responseExistente.data || [];
            setDadosMetas(metaExistente)
            
            if (!metaExistente.length) { 
                await Swal.fire({ 
                    icon: "warning", 
                    title: "Nenhuma meta encontrada!", 
                    text: "Não existem metas para serem canceladas.", 
                    customClass: { container: 'custom-swal' } 
                }); 
                return; 
            }

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

            const total = metaExistente.length;
            let enviados = 0;
            let falhas = 0;
            const idsCancelados = [];

            Swal.fire({
                title: 'Cancelando Metas...',
                html: `Enviando <b>0</b> de <b>${total}</b>`,
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                customClass: { container: 'custom-swal' },
                didOpen: () => Swal.showLoading()
            });

            for (const meta of metaExistente) {
                const dados = {
                    IDMETASLOJA: parseInt(meta?.IDMETASLOJA),
                    IDGRUPOEMPRESA: parseInt(meta?.IDGRUPOEMPRESA),
                    DSMOTIVOCANCELAMENTO: motivoCancelamento,
                    DTMETAINICIO: formatarDataParaEnvio(meta?.DTMETAINICIO),
                    DTMETAFIM: formatarDataParaEnvio(meta?.DTMETAFIM),
                    STATIVO: 'False',
                };

                try {
                    await put("/delete-meta/:id", dados);
                    enviados++;
                    idsCancelados.push(dados.IDMETASLOJA);
                } catch (err) {
                    console.error(err);
                    falhas++;
                }

                Swal.update({
                    html: `Enviando <b>${enviados + falhas}</b> de <b>${total}</b>`
                });
            }

            if (idsCancelados.length) {
                await registrarLogAuditoria({
                    idFuncionario: usuarioLogado?.id,
                    pathFuncao: 'COMERCIAL/DESATIVANDO META DE VENDAS',
                    dados: { IDMETASLOJA: idsCancelados }
                });
            }

            await Swal.fire({
                icon: falhas ? "warning" : "success",
                title: falhas ? "Concluído com falhas!" : "Sucesso!",
                html: `Foram canceladas <b>${enviados}</b> de <b>${total}</b> metas.${falhas ? `<br/><b>${falhas}</b> falharam.` : ''}`,
                customClass: {
                    container: 'custom-swal'
                }
            });

            handleClick();
            return { enviados, falhas, total };
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