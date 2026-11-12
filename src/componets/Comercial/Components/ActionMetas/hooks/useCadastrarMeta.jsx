import Swal from "sweetalert2";
import { post } from "../../../../../api/funcRequest";
import { registrarLogAuditoria } from "../../../../../services/auditLog";

const conversor = (valor) => {
    if (valor === undefined || valor === null) return 0;
    const texto = String(valor).trim();
    if (texto === '') return 0;
    const virgulaSeparaDecimais = texto.match(/(,)\d{2}$/);
    const numero = virgulaSeparaDecimais
        ? texto.replace(/\./g, '').replace(',', '.')
        : texto.replace(',', '');
    const resultado = parseFloat(numero);
    return isNaN(resultado) ? 0 : resultado;
};

const montarMetasDetalhe = (dadosLinhas, metas) => {
    return (dadosLinhas || []).map((row) => {
        const rowMeta = metas?.[row.contador] || {};
        const metaValor = (campo) => conversor(rowMeta[campo]);

        return {
            IDEmpresaMeta: parseInt(row?.IDEMPRESA),
            VRMetaVenda: parseFloat(row?.VRVENDAGERAL) || 0,
            PCMetaVenda: metaValor('pcMetaGeral'),
            VRMeta: metaValor('vrMeta'),

            VRVendaCalcado: parseFloat(row?.VRVENDACALCADOS) || 0,
            PCVendaCalcado: parseFloat(row?.PERCVENDACALCADOS) || 0,
            VRMetaCalcado: metaValor('vrMetaCalcado'),
            PCMetaCalcado: metaValor('pcMetaCalcado'),

            VRVendaFemVeraoInv: parseFloat(row?.VRVENDAFEMVERINV) || 0,
            PCVendaFemVeraoInv: parseFloat(row?.PERCVENDAFEMVERINV) || 0,
            VRMetaFemVeraoInv: metaValor('vrMetaFemVeraoInv'),
            PCMetaFemVeraoInv: metaValor('pcMetaFemVeraoInv'),

            VRVendaFemIntimo: parseFloat(row?.VRVENDAFEMPCINTIMA) || 0,
            PCVendaFemIntimo: parseFloat(row?.PERCVENDAFEMPCINTIMA) || 0,
            VRMetaFemIntimo: metaValor('vrMetaFemIntimo'),
            PCMetaFemIntimo: metaValor('pcMetaFemIntimo'),

            VRVendaFemAcess: parseFloat(row?.VRVENDAFEMACESSORIOS) || 0,
            PCVendaFemAcess: parseFloat(row?.PERCVENDAFEMACESSORIOS) || 0,
            VRMetaFemAcess: metaValor('vrMetaFemAcess'),
            PCMetaFemAcess: metaValor('pcMetaFemAcess'),

            VRVendaMascVeraoInv: parseFloat(row?.VRVENDAMASCVERINV) || 0,
            PCVendaMascVeraoInv: parseFloat(row?.PERCVENDAMASCVERINV) || 0,
            VRMetaMascVeraoInv: metaValor('vrMetaMascVeraoInv'),
            PCMetaMascVeraoInv: metaValor('pcMetaMascVeraoInv'),

            VRVendaMascIntimo: parseFloat(row?.VRVENDAMASCPCINTIMA) || 0,
            PCVendaMascIntimo: parseFloat(row?.PERCVENDAMASCPCINTIMA) || 0,
            VRMetaMascIntimo: metaValor('vrMetaMascIntimo'),
            PCMetaMascIntimo: metaValor('pcMetaMascIntimo'),

            VRVendaMascAcess: parseFloat(row?.VRVENDAMASCACESSORIOS) || 0,
            PCVendaMascAcess: parseFloat(row?.PERCVENDAMASCACESSORIOS) || 0,
            VRMetaMascAcess: metaValor('vrMetaMascAcess'),
            PCMetaMascAcess: metaValor('pcMetaMascAcess'),

            VRVendaInfantVeraoInv: parseFloat(row?.VRVENDAINFANTVERINV) || 0,
            PCVendaInfantVeraoInv: parseFloat(row?.PERCVENDAINFANTVERINV) || 0,
            VRMetaInfantVeraoInv: metaValor('vrMetaInfantVeraoInv'),
            PCMetaInfantVeraoInv: metaValor('pcMetaInfantVeraoInv'),

            VRVendaInfantIntimo: parseFloat(row?.VRVENDAINFANTPCINTIMA) || 0,
            PCVendaInfantIntimo: parseFloat(row?.PERCVENDAINFANTPCINTIMA) || 0,
            VRMetaInfantIntimo: metaValor('vrMetaInfantIntimo'),
            PCMetaInfantIntimo: metaValor('pcMetaInfantIntimo'),

            VRVendaInfantAcess: parseFloat(row?.VRVENDAINFANTACESSORIOS) || 0,
            PCVendaInfantAcess: parseFloat(row?.PERCVENDAINFANTACESSORIOS) || 0,
            VRMetaInfantAcess: metaValor('vrMetaInfantAcess'),
            PCMetaInfantAcess: metaValor('pcMetaInfantAcess'),

            VRVendaCMB: parseFloat(row?.VRVENDACMB) || 0,
            PCVendaCMB: parseFloat(row?.PERCVENDACMB) || 0,
            VRMetaCMB: metaValor('vrMetaCMB'),
            PCMetaCMB: metaValor('pcMetaCMB'),

            VRVendaOUTROS: parseFloat(row?.VRMETAVENDAOUTROS) || 0,
            PCVendaOUTROS: parseFloat(row?.PERCMETAVENDAOUTROS) || 0,

            PCTotal: metaValor('pcTotal'),
        };
    });
};

export const useCadastrarMeta = ({ usuarioLogado, optionsModulos, handleClick }) => {

    const handleCadastrar = async (periodo, dadosLinhas, metas) => {
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

        if (!periodo?.DTMETAINICIO || !periodo?.DTMETAFIM) {
            Swal.fire({
                icon: "warning",
                title: "Escolha um período",
                showConfirmButton: false,
                timer: 2000
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
                    loader: 'custom-loader'
                },
            });

            if (!confirmacao.isConfirmed) return;

            Swal.fire({
                title: 'Cadastrando',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

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
                pathFuncao: 'COMERCIAL/CADASTRO META DE VENDAS',
                dados: dados
            });

            const response = await post("/cadastrar-metas-lojas", dados);

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


    return { handleCadastrar };

}
