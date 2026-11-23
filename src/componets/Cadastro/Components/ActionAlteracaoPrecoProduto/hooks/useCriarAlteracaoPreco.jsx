import { useState } from "react";
import Swal from "sweetalert2";
import * as XLSX from 'xlsx';

export const useCriarAlteracaoPreco = ({
    optionsModulos,
    usuarioLogado
}) => {
    const [dadosPreVisualizacao, setDadosPreVisualizacao] = useState([]);
    const [showPreVisualizacao, setShowPreVisualizacao] = useState(false);
    const [dadosNovoAlteracaoPreco, setDadosNovoAlteracaoPreco] = useState([])

    const msgAviso = (title, text) => Swal.fire({
        icon: 'warning',
        title,
        text,
        customClass: {
            container: 'custom-swal',
        }
    });

    const lerArquivoTemplate = (arquivo) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                    const dadosTemplate = [];
                    let verificaTemplate = true;
                    let tpAlteracao;
                    let memoGrupoLoja;
                    let numLinha = '';
                    let plural = '';
                    let idsProds = '';
                    let msgTitleAviso = 'Template Vazio!';
                    let msgTextAviso = 'Verifique o Template e Tente importar novamente!';

                    for (let i = 0; i < jsonData.length; i++) {
                        if (i === 0) {
                            if (
                                jsonData[i][0]?.trim() !== 'Lista de Preço' ||
                                jsonData[i][1]?.trim() !== 'Loja' ||
                                jsonData[i][2]?.trim() !== 'Id Produto' ||
                                jsonData[i][3]?.trim() !== 'Descrição do Produto' ||
                                jsonData[i][4]?.trim() !== 'Código de Barras' ||
                                jsonData[i][5]?.trim() !== 'Preço Antigo' ||
                                jsonData[i][6]?.trim() !== 'Preço Novo'
                            ) {
                                msgTitleAviso = 'Template inválido';
                                msgTextAviso = 'Exporte um novo template pelo sistema e tente novamente';
                                verificaTemplate = false;
                                break;
                            }
                            continue;
                        }

                        const IDLISTAPRECO = jsonData[i][0] ? Number(String(jsonData[i][0]).replace(/\D/g, '')) : '';
                        const IDEMPRESA = jsonData[i][1] ? Number(String(jsonData[i][1]).replace(/\D/g, '')) : '';
                        const IDPRODUTO = jsonData[i][2] ? String(jsonData[i][2]).trim() : null;
                        const DSNOME = jsonData[i][3] ? String(jsonData[i][3]).trim() : null;
                        const CODBARRAS = jsonData[i][4] ? String(jsonData[i][4]).trim() : null;
                        const PRECO_VENDA_ANTIGO = jsonData[i][5] ? Number(('' + jsonData[i][5]).replace(/,(?=.*,\D*$)/g, '').replace(',', '.')) : null;
                        const PRECO_VENDA = jsonData[i][6] ? Number(('' + jsonData[i][6]).replace(/,(?=.*,\D*$)/g, '').replace(',', '.')) : null;

                        if (i === 1) {
                            if (IDLISTAPRECO) {
                                tpAlteracao = 'LISTAPRECO';
                                memoGrupoLoja = IDLISTAPRECO;
                            } else {
                                tpAlteracao = 'LOJA';
                                memoGrupoLoja = IDEMPRESA;
                            }
                        }

                        plural = numLinha?.length > 2 ? 's' : '';

                        if ((!IDEMPRESA && !IDLISTAPRECO) && (!IDPRODUTO && !PRECO_VENDA)) {
                            continue;
                        } else if (!IDEMPRESA && !IDLISTAPRECO) {
                            numLinha += i + 1 + ', ';
                            msgTitleAviso = 'LISTA E GRUPO VAZIOS, Preencha Um Deles No Arquivo!';
                            msgTextAviso = `O${plural} erro${plural} est${plural ? 'ão' : 'á'} na${plural} linha${plural}: ${numLinha}`;
                            verificaTemplate = false;
                        } else if (!IDPRODUTO || !PRECO_VENDA) {
                            numLinha += i + 1 + ', ';
                            msgTitleAviso = 'ID PRODUTO ou PREÇO DE VENDA VAZIOS OU INCORRETOS, Preencha os Campos No Arquivo e Tente Novamente!';
                            msgTextAviso = `O${plural} erro${plural} est${plural ? 'ão' : 'á'} na${plural} linha${plural}: ${numLinha}`;
                            verificaTemplate = false;
                            // mesma condição do fluxo legado (tpAlteracao nunca vale 'GRUPO'; mantido para paridade de comportamento)
                        } else if (tpAlteracao === 'GRUPO' && IDLISTAPRECO !== memoGrupoLoja) {
                            numLinha += i + 1 + ', ';
                            msgTitleAviso = 'TEMPLATE PREENCHIDO COM MAIS DE UM GRUPO EMPRESARIAL, Preencha Somente Com 1 Grupo Empresarial No Arquivo!';
                            msgTextAviso = `O${plural} erro${plural} est${plural ? 'ão' : 'á'} na${plural} linha${plural}: ${numLinha}`;
                            verificaTemplate = false;
                        } else if (tpAlteracao === 'LOJA' && IDEMPRESA !== memoGrupoLoja) {
                            numLinha += i + 1 + ', ';
                            msgTitleAviso = 'TEMPLATE PREENCHIDO COM MAIS DE UMA LISTA LOJA, Preencha Somente Com 1 Lista No Arquivo!';
                            msgTextAviso = `O${plural} erro${plural} est${plural ? 'ão' : 'á'} na${plural} linha${plural}: ${numLinha}`;
                            verificaTemplate = false;
                        } else if (IDEMPRESA && IDLISTAPRECO) {
                            numLinha += i + 1 + ', ';
                            msgTitleAviso = 'LISTA E GRUPO PREENCHIDOS, Preencha Somente Um No Arquivo!';
                            msgTextAviso = `O${plural} erro${plural} est${plural ? 'ão' : 'á'} na${plural} linha${plural}: ${numLinha}`;
                            verificaTemplate = false;
                        } else if (PRECO_VENDA_ANTIGO && PRECO_VENDA_ANTIGO === PRECO_VENDA) {
                            idsProds += IDPRODUTO + ', ';
                            numLinha += i + 1 + ', ';
                            msgTitleAviso = `O${plural} Produto${plural} de ID${plural}:(${idsProds})  da${plural} Linha${plural}: (${numLinha}) Est${plural ? 'ão' : 'á'} com o${plural} Preço${plural} Inalterado${plural}!`;
                            msgTextAviso = `O${plural} erro${plural} est${plural ? 'ão' : 'á'} na${plural} linha${plural}: ${numLinha}`;
                        } else if ((IDEMPRESA || IDLISTAPRECO) && IDPRODUTO && PRECO_VENDA) {
                            dadosTemplate.push({
                                IDLISTAPRECO,
                                IDEMPRESA,
                                IDPRODUTO,
                                DSNOME,
                                CODBARRAS,
                                PRECO_VENDA_ANTIGO,
                                PRECO_VENDA
                            });
                        }
                    }

                    if (dadosTemplate.length > 0 && verificaTemplate) {
                        resolve(dadosTemplate);
                    } else {
                        reject({ tipo: 'validacao', title: msgTitleAviso, text: msgTextAviso });
                    }
                } catch (error) {
                    reject({ tipo: 'leitura', error });
                }
            };

            reader.onerror = () => reject({ tipo: 'leitura', error: new Error('Erro ao ler o arquivo') });
            reader.readAsArrayBuffer(arquivo);
        });
    };

    const solicitarAgendamento = async (dadosTemplate) => {
        const dataHoje = new Date();
        const dataHojeFormatada = dataHoje.toLocaleString('sv', { year: 'numeric', month: '2-digit', day: '2-digit' });

        const resultado = await Swal.fire({
            title: 'Quando será executada a Alteração de Preços?',
            html: `
                <div class="text-dark h5">
                    <div class="d-flex pl-6 mb-2">
                        <div class="custom-control custom-checkbox">
                            <input id="checkAgendImediato" type="checkbox" class="custom-control-input">
                            <label class="custom-control-label" for="checkAgendImediato"></label>
                            <label class="form-label">Alterar Imediatamente</label>
                        </div>
                    </div>
                    <div class="d-flex pl-6 mb-2">
                        <div class="custom-control custom-checkbox">
                            <input id="checkAgendAmanha" type="checkbox" class="custom-control-input">
                            <label class="custom-control-label" for="checkAgendAmanha"></label>
                            <label class="form-label">Alterar Somente Amanhã</label>
                        </div>
                    </div>
                    <div class="d-flex pl-6 mb-0">
                        <div class="custom-control custom-checkbox">
                            <input id="checkAgendPersonalizado" type="checkbox" class="custom-control-input">
                            <label class="custom-control-label" for="checkAgendPersonalizado"></label>
                            <label class="form-label">Agendar</label>
                        </div>
                    </div>
                    <div id="agendPersonalizado" class="flex-column text-left pl-6 d-none">
                        <input id="dtAgendAlteracao" type="date" class="form-control fw-900 w-75" value="${dataHojeFormatada}"/>
                    </div>
                </div>
            `,
            width: '20rem',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Sair',
            cancelButtonColor: '#3085d6',
            allowOutsideClick: false,
            allowEscapeKey: false,
            backdrop: true,
            didOpen: () => {
                const container = Swal.getHtmlContainer();
                const checkImediato = container.querySelector('#checkAgendImediato');
                const checkAmanha = container.querySelector('#checkAgendAmanha');
                const checkPersonalizado = container.querySelector('#checkAgendPersonalizado');
                const campoPersonalizado = container.querySelector('#agendPersonalizado');

                const desmarcarOutros = (atual) => {
                    [checkImediato, checkAmanha, checkPersonalizado].forEach((check) => {
                        if (check !== atual) check.checked = false;
                    });
                    campoPersonalizado.classList.toggle('d-none', !checkPersonalizado.checked);
                };

                checkImediato.addEventListener('change', () => desmarcarOutros(checkImediato));
                checkAmanha.addEventListener('change', () => desmarcarOutros(checkAmanha));
                checkPersonalizado.addEventListener('change', () => desmarcarOutros(checkPersonalizado));
            },
            preConfirm: () => {
                const container = Swal.getHtmlContainer();
                const checkPersonalizado = container.querySelector('#checkAgendPersonalizado');
                const dataDigitada = container.querySelector('#dtAgendAlteracao').value;

                const agendamentoImediato = container.querySelector('#checkAgendImediato').checked ? 'imediato' : '';
                const agendamentoPadrao = container.querySelector('#checkAgendAmanha').checked ? 'padrao' : '';
                const agendamentoPersonalizado = checkPersonalizado.checked ? dataDigitada : '';
                const tpAgendamentoPadraoOuImediato = agendamentoImediato || agendamentoPadrao;

                let dataHoraAtual = new Date();
                dataHoraAtual = new Date(dataHoraAtual.getFullYear(), dataHoraAtual.getMonth(), dataHoraAtual.getUTCDate());

                if (checkPersonalizado.checked) {
                    let dataHoraDigitada = new Date(dataDigitada);
                    dataHoraDigitada = new Date(dataHoraDigitada.getFullYear(), dataHoraDigitada.getMonth(), dataHoraDigitada.getUTCDate());

                    if (dataHoraDigitada <= dataHoraAtual) {
                        Swal.showValidationMessage('A data de agendamento não pode ser igual e nem menor que a data atual');
                        return false;
                    }
                }

                if (checkPersonalizado.checked && !agendamentoPersonalizado) {
                    Swal.showValidationMessage('Selecione uma data valida para Agendar!');
                    return false;
                }

                if (!agendamentoImediato && !agendamentoPadrao && !agendamentoPersonalizado) {
                    Swal.showValidationMessage('Selecione uma das opções de Agendamento!');
                    return false;
                }

                return dadosTemplate.map((item) => ({
                    ...item,
                    STAGENDAMENTOPADRAO: tpAgendamentoPadraoOuImediato === 'padrao',
                    STAGENDAMENTOIMEDIATO: tpAgendamentoPadraoOuImediato === 'imediato',
                    STAGENDAMENTOPERSONALIZADO: !tpAgendamentoPadraoOuImediato,
                    DTAGENDAMENTOPERSONALIZADO: !tpAgendamentoPadraoOuImediato && agendamentoPersonalizado
                }));
            }
        });

        return resultado.isConfirmed ? resultado.value : null;
    };

    const handleImportarArquivo = async () => {
        if (optionsModulos[0]?.CRIAR == 'False') {
            Swal.fire({
                icon: 'warning',
                title: 'Acesso Negado',
                html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para criar alterações de preço.`,
                confirmButtonText: 'OK',
                customClass: {
                    container: 'custom-swal',
                }
            });
            return;
        }

        const { value: file } = await Swal.fire({
            title: 'Importar Template de Alteração de Preços',
            text: 'Selecione o arquivo .xls ou .xlsx exportado pelo sistema',
            input: 'file',
            inputAttributes: {
                accept: '.xls, .xlsx',
                'aria-label': 'Selecione o arquivo de alteração de preço'
            },
            showCancelButton: true,
            confirmButtonText: 'Importar',
            cancelButtonText: 'Fechar',
            confirmButtonColor: '#28a745',
            customClass: {
                container: 'custom-swal',
            }
        });

        if (!file) {
            return;
        }

        const extensaoArquivo = file.name.split('.').pop().toLowerCase();

        if (extensaoArquivo !== 'xls' && extensaoArquivo !== 'xlsx') {
            msgAviso('Arquivo Inválido!', 'Selecione um arquivo .xlsx ou .xls válido!');
            return;
        }

        try {
            const dadosTemplate = await lerArquivoTemplate(file);
            const dadosComAgendamento = await solicitarAgendamento(dadosTemplate);

            if (!dadosComAgendamento) {
                return;
            }

            setDadosPreVisualizacao(dadosComAgendamento);
            setShowPreVisualizacao(true);
        } catch (erro) {
            if (erro?.tipo === 'validacao') {
                msgAviso(erro.title, erro.text);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro ao ler o Arquivo, tente novamente!',
                    text: 'O arquivo pode estar em um formato inválido, favor exporte o template novamente e edite os dados',
                    customClass: {
                        container: 'custom-swal',
                    }
                });
                console.error(erro.error || erro);
            }
        }
    };

    const excluirProdutoPreVisualizacao = (idProduto) => {
        setDadosPreVisualizacao((dadosAtuais) => {
            const dadosAtualizados = dadosAtuais.filter((item) => item.IDPRODUTO !== idProduto);

            if (!dadosAtualizados.length) {
                setShowPreVisualizacao(false);
            }

            return dadosAtualizados;
        });

        Swal.fire({
            position: 'center',
            icon: 'success',
            title: `Produto "${idProduto}" excluído da Alteração!`,
            showConfirmButton: false,
            timer: 3000,
            customClass: {
                container: 'custom-swal',
            }
        });
    };

    const fecharPreVisualizacao = () => {
        setShowPreVisualizacao(false);
        setDadosPreVisualizacao([]);
    };

    const confirmarAlteracaoPrecos = async () => {
        if (!dadosPreVisualizacao.length) return;

        const IDUSER = usuarioLogado?.id;

        const dadosProd = dadosPreVisualizacao.map((item) => ({
            IDPRODUTO: item.IDPRODUTO,
            IDEMPRESA: item.IDEMPRESA || null,
            IDLISTAPRECO: !item.IDEMPRESA ? item.IDLISTAPRECO : null,
            PRECOVENDAANTIGO: null,
            PRECOVENDANOVO: Number(item.PRECO_VENDA),
            IDUSER,
            STAGENDAMENTOPADRAO: item.STAGENDAMENTOPADRAO,
            STAGENDAMENTOIMEDIATO: item.STAGENDAMENTOIMEDIATO,
            STAGENDAMENTOPERSONALIZADO: item.STAGENDAMENTOPERSONALIZADO,
            DTAGENDAMENTOPERSONALIZADO: item.DTAGENDAMENTOPERSONALIZADO
        }));

        try {

            const response = await post('/alteracao-preco-produto', dadosProd);
            const IDRESUMOALTERACAOPRECO = response.IDRESUMOALTERACAOPRECO;
            const ultimaAlteracao = await get(`/alteracoes-de-precos-resumo?idResumoAlteracao=${IDRESUMOALTERACAOPRECO}`);
            setDadosAlteracaoPreco(ultimaAlteracao.data);

            const textDados = JSON.stringify(dadosProd)
            let textFuncao = 'CADASTRO/CRIAR ALTERACAO DE PRECO';
            const ipUsuario = await getIPUsuario();
            const createtLog = {
                IDFUNCIONARIO: String(usuarioLogado.id),
                PATHFUNCAO: textFuncao,
                DADOS: textDados,
                IP: ipUsuario || 'Indisponível'
            }

            Swal.fire({
                icon: 'info',
                title: 'Importação validada!',
                text: 'Os dados foram validados, mas o envio ao backend ainda não está disponível (endpoint de criação pendente).',
                customClass: {
                    container: 'custom-swal',
                }
            });

            await post('/log-web', createtLog)

            return response.data;
        } catch (erro) {
            const textDados = JSON.stringify(dadosProd)
            let textFuncao = 'ERRO AO CADASTRAR ALTERACAO DE PRECO';
            const ipUsuario = await getIPUsuario();
            const createtLog = {
                IDFUNCIONARIO: String(usuarioLogado.id),
                PATHFUNCAO: textFuncao,
                DADOS: textDados,
                IP: ipUsuario || 'Indisponível'
            }
            await post('/log-web', createtLog)
            Swal.fire({
                icon: 'error',
                title: 'Erro ao Salvar os Preços, Tente Novamente',
                customClass: {
                    container: 'custom-swal',
                }
            });
            console.error(erro);
            return erro;
        }
    };

    return {
        handleImportarArquivo,
        dadosPreVisualizacao,
        showPreVisualizacao,
        excluirProdutoPreVisualizacao,
        fecharPreVisualizacao,
        confirmarAlteracaoPrecos
    }
}
