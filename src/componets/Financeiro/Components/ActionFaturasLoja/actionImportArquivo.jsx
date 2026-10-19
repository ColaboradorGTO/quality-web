import { Fragment, useState, useRef } from "react";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../../Tables/headerTable";

import { ButtonType } from "../../../Buttons/ButtonType";
import { IoMdReturnLeft } from "react-icons/io";
import { toFloat } from "../../../../utils/toFloat";

export const ActionImportArquivo = ({ 
    dadosVendaMarcaPeriodo,
    actionArquivo,
    setActionArquivo,
    actionMain,
    setActionMain
}) => {
    const [tableData, setTableData] = useState([]);
    const [showTable, setShowTable] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useRef(null);
    const fileUploadRef = useRef(null);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const dataTableRef = useRef();



    // Função para mascarar valor (equivalente ao mascaraValor)
    const mascaraValor = (valor) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(parseFloat(valor));
    };

    // Função para processar o arquivo
    const processFile = (file) => {
        setLoading(true);

        const reader = new FileReader();
        reader.readAsText(file, "UTF-8");

        reader.onload = function () {
            try {
                const text = this.result;
                const lines = text.split('\n');
                let contadorFatura = 0;
                const dataRetornoFat = [];

                let vrConcRecebidoFatura = 0;
                let vrConcRecebidoFaturaPIX = 0;
                let vrConcFaturaTotal = 0;
                let CodEmpFatura = '';
                let NoEmpFatura = '';
                
                for (let i = 1; i < lines.length - 1; i++) {
                    contadorFatura++;
                    const dadoslinha = lines[i].split(";");
                    let encontrouCorrespondencia = false;
                    
                    for (let j = 0; j < dadosVendaMarcaPeriodo?.length; j++) {
                        const item = dadosVendaMarcaPeriodo[j];
                        

                        if ((item['VRFATURA'] > 0 || item['VRFATURAPIX'] > 0) &&
                            item['CODEMPRESA'] === dadoslinha[3]) {

                            vrConcRecebidoFatura = item['VRFATURA'];
                            vrConcRecebidoFaturaPIX = item['VRFATURAPIX'];
                            CodEmpFatura = item['CODEMPRESA'];
                            NoEmpFatura = item['NOFANTASIA'];
                            vrConcFaturaTotal = Number(vrConcRecebidoFatura) + Number(vrConcRecebidoFaturaPIX);
                            encontrouCorrespondencia = true;
                            break;
                        }
                    }

                    if (!encontrouCorrespondencia) {
                        console.log(`Não encontrou correspondência para CODEMPRESA: ${dadoslinha[3]} - Usando dados da última correspondência encontrada`);
                    }

                    const vrFatTotalArq = Number(dadoslinha[5]?.replace(/\./g, "").replace(",", "."));

                    let QtdDiverg = 0;
                    let obsdiverg = '';
                    let statusColor = '';

                    if (vrFatTotalArq === vrConcFaturaTotal) {
                        QtdDiverg = 0;
                        obsdiverg = 'SEM DIVERGENCIA';
                        statusColor = 'blue';
                    } else if (vrFatTotalArq > vrConcFaturaTotal) {
                        QtdDiverg = parseFloat(vrFatTotalArq) - parseFloat(vrConcFaturaTotal.toFixed(2));
                        obsdiverg = 'FATURA COM DIVERGENCIA - RECEBIDO A MENOR';
                        statusColor = 'red';
                    } else {
                        QtdDiverg = vrConcFaturaTotal - vrFatTotalArq;
                        obsdiverg = 'FATURA COM DIVERGENCIA - ARQUIVO A MENOR';
                        statusColor = 'red';
                    }

                    dataRetornoFat.push({
                        id: contadorFatura,
                        contador: contadorFatura,
                        data: dadoslinha[0],
                        codEstabelecimento: dadoslinha[3],
                        empresa: NoEmpFatura,
                        valorRecebido: toFloat(vrConcFaturaTotal.toFixed(2)),
                        valorArquivo: toFloat(Number(dadoslinha[5]?.replace(/\./g, "").replace(",", ".")).toFixed(2)),
                        valorDivergente: QtdDiverg.toFixed(0),
                        observacao: obsdiverg,
                        statusColor: statusColor
                    });
                }

                setTableData(dataRetornoFat);
                setShowTable(true);
                setLoading(false);

                toast.current.show({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: `Arquivo processado com ${dataRetornoFat.length} registros`,
                    life: 3000
                });

            } catch (error) {
                console.error("Erro ao processar arquivo:", error);
                setLoading(false);
                toast.current.show({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao processar o arquivo',
                    life: 3000
                });
            }
        };

        reader.onerror = function (evt) {
            console.error("Erro ao ler o arquivo", evt);
            setLoading(false);
            toast.current.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao ler o arquivo',
                life: 3000
            });
        };
    };


    const onUpload = (event) => {
        const file = event.files[0];
        if (file) {
            processFile(file);
        }
    };


    const formatDecimal = (valor) =>
        Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const thStyle ={  border: '1px solid #000', width: "5px", textAlign: "center", fontSize: "12px" };
    const tdStyle = { border: '1px solid #000', padding: '6px' };

    const customUpload = (event) => {
        onUpload(event);
        fileUploadRef.current.clear();
    };

    const handleClickVoltar = () => {
        setActionArquivo(false);
        setActionMain(true);
    };

    return (
        <Fragment>
            <Toast ref={toast} />

            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginTop: "2rem",
                padding: "1rem",
                // backgroundColor: "transparent"
            }}>
                <h1>Selecione o Arquivo para a Importação</h1>

                <div style={{ marginBottom: "2rem", width: "100%", display: "flex", justifyContent: "space-between" }}>
                

                    <div>
                      
                        <FileUpload
                            ref={fileUploadRef}
                            mode="basic"
                            name="file"
                            accept=".txt,.csv, .xlsx,"
                            customUpload={true}
                            uploadHandler={customUpload}
                            auto={true}
                            chooseLabel="Escolher Arquivo"
                            className="p-d-block"
                            disabled={loading}
                        />
                    </div>
                    <div>

                        <ButtonType 
                            textButton={'Voltar'}
                            cor={"danger"}
                            onClickButtonType={handleClickVoltar}
                            Icon={IoMdReturnLeft}
                        />
                    </div>
                </div>

              
                {loading && (
                    <div style={{ marginBottom: "2rem" }}>
                        <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                        <p>Processando arquivo...</p>
                    </div>
                )}

                {showTable && (
                    <Fragment>

                        <div style={{ width: "100%", marginTop: "2rem" }} ref={dataTableRef}>
                            <table style={{ width: '100%',  fontSize: '12px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ ...thStyle, width: '5%' }}>#</th>
                                        <th style={{ ...thStyle, width: '10%' }}>Data</th>
                                        <th style={{ ...thStyle, width: '15%' }}>Cod. Estabelecimento</th>
                                        <th style={{ ...thStyle, width: '20%' }}>Empresa</th>
                                        <th style={{ ...thStyle, width: '10%' }}>Valor Recebido</th>
                                        <th style={{ ...thStyle, width: '10%' }}>Valor Arquivo</th>
                                        <th style={{ ...thStyle, width: '10%' }}>Valor Divergente</th>
                                        <th style={{ ...thStyle, width: '20%' }}>Obs</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} style={{ ...tdStyle, textAlign: 'center' }}>
                                                Nenhum resultado encontrado
                                            </td>
                                        </tr>
                                    ) : (
                                        tableData.map((row, index) => (
                                            <tr key={row.id} style={{ backgroundColor: index % 2 ? '#f9f9f9' : 'transparent' }}>
                                                <td style={{ ...tdStyle, textAlign: 'center' }}>{row.contador}</td>
                                                <td style={{ ...tdStyle, textAlign: 'center' }}>{row.data}</td>
                                                <td style={{ ...tdStyle, textAlign: 'center' }}>{row.codEstabelecimento}</td>
                                                <td style={{ ...tdStyle, textAlign: 'center' }}>{row.empresa}</td>
                                                <td style={{ ...tdStyle, textAlign: 'right' }}>{formatDecimal(row.valorRecebido)}</td>
                                                <td style={{ ...tdStyle, textAlign: 'right' }}>{formatDecimal(row.valorArquivo)}</td>
                                                <td style={{ ...tdStyle, textAlign: 'right', color: row.statusColor, fontWeight: 'bold' }}>
                                                    {row.valorDivergente}
                                                </td>
                                                <td style={{ ...tdStyle, textAlign: 'center', color: row.statusColor, fontWeight: 'bold' }}>
                                                    {row.observacao}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Fragment>
                )}
            </div>
        </Fragment>
    );
}