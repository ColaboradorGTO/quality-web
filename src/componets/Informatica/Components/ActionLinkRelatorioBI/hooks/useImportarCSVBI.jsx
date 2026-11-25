import Swal from "sweetalert2";
import { get, post } from "../../../../../api/funcRequest";
import axios from "axios";
import { useState } from "react";
import * as XLSX from 'xlsx';
import { useQuery } from "react-query";


export const useImportarCSVBI = ({ optionsModulos, handleClose, usuarioLogado }) => {
    const [relatorioSelecionado, setRelatorioSelecionado] = useState(null);
    const [ipUsuario, setIpUsuario] = useState('');
    const [file, setFile] = useState(null);


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

    const { data: dadosBI = [], error: errorListaBI, isLoading: isLoadingBI, refetch } = useQuery(
        'relatorioInformaticaBI?status=True',
        async () => {
            const response = await get(`/relatorioInformaticaBI?status=True`);
            return response.data;
        },
        { staleTime: 60 * 60 * 1000, cacheTime: 60 * 60 * 1000 }
    );


    const processFile = async (file) => {

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    let data = [];
                    if (file.name.endsWith('.csv')) {
                        const content = e.target.result;
                        const lines = content.split('\n');
                        for (let i = 0; i < lines.length; i++) {
                            const line = lines[i];
                            // Pula a primeira linha se for cabeçalho
                            if (i === 0 && (line.toLowerCase().includes('idempresa') || line.toLowerCase().includes('link'))) {
                                continue;
                            }
                            const [idEmpresa, link, stAtivo] = line.split(',');
                            if (link && link.trim() && idEmpresa && idEmpresa.trim()) {
                                data.push({
                                    IDEMPRESA: idEmpresa.toString().trim(),
                                    LINK: link.toString().trim(),
                                    STATIVO: stAtivo ? stAtivo.toString().trim() : 'True'
                                });
                            }
                        }
                    } else if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
                        const workbook = XLSX.read(e.target.result, { type: 'array' });
                        const sheet = workbook.Sheets[workbook.SheetNames[0]];
                        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                        for (let i = 0; i < rows.length; i++) {
                            const row = rows[i];
                            // Pula a primeira linha se for cabeçalho
                            if (i === 0 && row[1] && (row[1].toString().toLowerCase().includes('link') || row[0].toString().toLowerCase().includes('idempresa'))) {
                                continue;
                            }
                            if (row[1] && row[1].toString().trim() && row[0] && row[0].toString().trim()) {
                                data.push({
                                    IDEMPRESA: row[0].toString().trim(),
                                    LINK: row[1].toString().trim(),
                                    STATIVO: row[2] ? row[2].toString().trim() : 'True'
                                });
                            }
                        }
                    }

                    resolve(data);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
            if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
                reader.readAsArrayBuffer(file);
            } else {
                reader.readAsText(file);
            }
        });
    };

    const onSubmitArquivo = async (e) => {

        if (optionsModulos[0]?.CRIAR == 'False') {
            Swal.fire({
                icon: 'warning',
                title: 'Acesso Negado',
                html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para criar novos relatórios.`,
                confirmButtonText: 'OK',
                customClass: {
                    container: 'custom-swal',
                }
            });
            return;

        }

       if (!file) {
            Swal.fire({
                icon: 'warning',
                title: 'Selecione um arquivo CSV ou XLSX!',
                customClass: {
                    container: 'custom-swal',
                },
            });
            return;
        }

         if (!relatorioSelecionado?.value) {
            Swal.fire({
                icon: 'warning',
                title: 'Selecione um relatório!',
                customClass: {
                    container: 'custom-swal',
                },
            });
            return;
        }

        try {
            const dadosArquivo = await processFile(file);

            if (!dadosArquivo.length) {
                Swal.fire({ icon: 'warning', title: 'Arquivo vazio ou inválido!', customClass: { container: 'custom-swal' } });
                return;
            }
            for (const item of dadosArquivo) {
                const postData = {
                    IDRELATORIOBI: parseInt(relatorioSelecionado?.value),
                    IDEMPRESA: parseInt(item.IDEMPRESA),
                    LINK: item.LINK,
                    STATIVO: item.STATIVO,
                };

                await post('/criarlinkRelatorioBI', postData);

            }


            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Dados importados com sucesso!',
                showConfirmButton: false,
                customClass: {
                    container: 'custom-swal',
                },
                timer: 5000
            });
            handleClose();
        } catch (err) {
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Erro ao importar arquivo!',
                showConfirmButton: false,
                customClass: {
                    container: 'custom-swal',
                },
                timer: 5000
            });
            console.error(err);
        }
    };



    return {
        relatorioSelecionado,
        setRelatorioSelecionado,
        dadosBI,
        file,
        setFile,
        onSubmitArquivo,
    };
}