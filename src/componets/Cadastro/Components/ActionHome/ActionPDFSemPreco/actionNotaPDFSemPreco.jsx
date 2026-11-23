import { Fragment } from "react"
import { toFloat } from "../../../../../utils/toFloat"
import { formatMoeda } from "../../../../../utils/formatMoeda"
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { ActionListaDetalheSempreco } from "./actionListaDetalheSempreco";

export const ActionNotaPDFSemPreco = ({ dadosPedidoSemPreco, dadosDetalhePedido }) => {

    const styles = StyleSheet.create({
        page: { 
            fontSize: 16,
            backgroundColor: '#fff',
        },
        section: { marginBottom: 10 },
        title: {
            fontFamily: 'Verdana', 
            fontSize: 18,
            marginBottom: 10 
        },
    });
    
    console.log(dadosPedidoSemPreco, 'dadosPedidoSemPreco')
    const stOutlet = dadosPedidoSemPreco?.STOUTLET === "True";
    
    const dadosArray = Array.isArray(dadosPedidoSemPreco) 
        ? dadosPedidoSemPreco 
        : [dadosPedidoSemPreco || dadosPedidoSemPreco];
    
    const logosEmpresas = [
        '../img/tesoura.png',      // posição 0 -> IDSUBGRUPOPEDIDO = 1
        '../img/magazine.png',     // posição 1 -> IDSUBGRUPOPEDIDO = 2
        '../img/yorus.png',        // posição 2 -> IDSUBGRUPOPEDIDO = 3
        '../img/freecenter.png',   // posição 3 -> IDSUBGRUPOPEDIDO = 4
        '../img/outlet.png'        // posição 4 -> quando stOutlet = true
    ];
    
    const dados = dadosArray?.map((item, index) => {
        let dsTipoFretePedido = '';
        let dsTipoFiscalPedido = '';
        let dsTipoArquivoPedido = '';
        let dsTipoEnviar = '';
        let logoPedido = '';
        
        if (index === 0) {
            if (stOutlet) {
                logoPedido = logosEmpresas[4]; // logoOutlet
            } else {
                logoPedido = logosEmpresas[item.IDSUBGRUPOPEDIDO - 1];
            }
        }

        const objTpFrete = {
            'PAGO': 'PAGO - CIF',
            'APAGAR': 'APAGAR - FOB'
        };

        const objTpFiscal = {
            'N': 'Lucro Presumido',
            'S': 'Simples Nacional'
        };

        const objTpEnviar = {
            'NE': 'NÃO ENVIAR',
            'ET': 'ETIQUETA',
            'AR': 'ARQUIVO'
        };

        dsTipoFretePedido = objTpFrete[item.TPFRETE] || item.TPFRETE;
        dsTipoFiscalPedido = objTpFiscal[item.TPFISCAL] || 'Lucro Real';  
        dsTipoEnviar = objTpEnviar[item.TPARQUIVO] || item.TPARQUIVO;

        return {
            IDPEDIDO: item.IDPEDIDO,
            IDGRUPOPEDIDO: item.IDGRUPOPEDIDO,
            IDSUBGRUPOPEDIDO: item.IDSUBGRUPOPEDIDO,
            NOFANTASIA: item.NOFANTASIA,
            IDCOMPRADOR: item.IDCOMPRADOR,
            NOMECOMPRADOR: item.NOMECOMPRADOR,
            IDCONDICAOPAGAMENTO: item.IDCONDICAOPAGAMENTO,
            DSCONDICAOPAG: item.DSCONDICAOPAG,
            IDFORNECEDOR: item.IDFORNECEDOR,
            NOFORNECEDOR: item.NOFORNECEDOR,
            NOFANTASIAFORNECEDOR: item.NOFANTASIAFORNECEDOR,
            EEMAILFATURAMENTO: item.EEMAILFATURAMENTO,
            NUTELFATURAMENTO: item.NUTELFATURAMENTO,
            EEMAILCOBRANCA: item.EEMAILCOBRANCA,
            NUTELCOBRANCA: item.NUTELCOBRANCA,
            EEMAILFINANCEIRO: item.EEMAILFINANCEIRO,
            NUTELFINANCEIRO: item.NUTELFINANCEIRO,
            EEMAILCOMPRAS: item.EEMAILCOMPRAS,
            NUTELCOMPRAS: item.NUTELCOMPRAS,
            EEMAILCADASTRO: item.EEMAILCADASTRO,
            NUTELCADASTRO: item.NUTELCADASTRO,
            CNPJFORN: item.CNPJFORN,
            INSCESTFORN: item.INSCESTFORN,
            EMAILFORN: item.EMAILFORN,
            FONEFORN: item.FONEFORN,
            ENDFORN: item.ENDFORN,
            NUMEROFORN: item.NUMEROFORN,
            COMPFORN: item.COMPFORN,
            BAIRROFORN: item.BAIRROFORN,
            CIDADEFORN: item.CIDADEFORN,
            UFFORN: item.UFFORN,
            CEPFORN: item.CEPFORN,
            IDTRANSPORTADORA: item.IDTRANSPORTADORA,
            NOMETRANSPORTADORA: item.NOMETRANSPORTADORA,
            IDANDAMENTO: item.IDANDAMENTO,
            DSANDAMENTO: item.DSANDAMENTO,
            MODPEDIDO: item.MODPEDIDO,
            NOVENDEDOR: item.NOVENDEDOR,
            EEMAILVENDEDOR: item.EEMAILVENDEDOR,
            DTPEDIDOFORMATADA: item.DTPEDIDOFORMATADA,
            DTPEDIDO: item.DTPEDIDO,
            DTPREVENTREGAFORMATADA: item.DTPREVENTREGAFORMATADA,
            DTENTREGAFORMATADA2: item.DTENTREGAFORMATADA2,
            TPFRETE: item.TPFRETE,
            OBSPEDIDO: item.OBSPEDIDO,
            OBSPEDIDO2: item.OBSPEDIDO2,
            DTFECHAMENTOPEDIDO: item.DTFECHAMENTOPEDIDO,
            DTCADASTRO: item.DTCADASTRO,
            STDISTRIBUIDO: item.STDISTRIBUIDO,
            STAGRUPAPRODUTO: item.STAGRUPAPRODUTO,
            NUTOTALITENS: item.NUTOTALITENS,
            QTDTOTPRODUTOS: item.QTDTOTPRODUTOS,
            VRTOTALBRUTO: item.VRTOTALBRUTO,
            VRTOTALLIQUIDO: item.VRTOTALLIQUIDO,
            DESCPERC01: item.DESCPERC01,
            DESCPERC02: item.DESCPERC02,
            DESCPERC03: item.DESCPERC03,
            PERCCOMISSAO: item.PERCCOMISSAO,
            TPFISCAL: item.TPFISCAL,
            STCANCELADO: item.STCANCELADO,
            TPARQUIVO: item.TPARQUIVO,
            FABRICANTE: item.FABRICANTE,
            CONTATOS: item.CONTATOS,
            dsTipoFretePedido: dsTipoFretePedido,
            dsTipoFiscalPedido: dsTipoFiscalPedido,
            dsTipoEnviar: dsTipoEnviar,
            logoPedido: logoPedido
        }
    })

   
    if (!dados || dados.length === 0) {
        return (
            <Fragment>
                <div>Nenhum dado encontrado para exibir o pedido.</div>
            </Fragment>
        );
    }

    const dadoPrincipal = dados[0];

    return (
        <Fragment>
            <div style={styles.page}>

                <table width="100%" className="bordasimples">
                    <tbody>
                        <tr>
                            <td rowspan="2" width="200" align="center" id="marcapedido">
                                <img src={dadoPrincipal?.logoPedido} style={{ width: '200px', height: '100px', border: 'none' }} />
                            </td>
                            <td rowspan="2" width="200" align="center" >
                                <p style={{fontFamily: 'Verdana', fontSize: '1rem', padding: '0px' }}> PEDIDO DE COMPRAS<br />{dadoPrincipal?.MODPEDIDO}</p>
                                <p style={{fontFamily: 'Verdana', fontSize: '1rem',  }}>Nº: <b>{dadoPrincipal?.IDPEDIDO}</b></p></td>
                            <td align="center" style={{fontFamily: 'Verdana', fontSize: '13px' }}>
                                Fabricante: <br />
                                <b><p style={{fontFamily: 'Verdana', fontSize: '13px',  }}>{dadoPrincipal?.FABRICANTE}</p></b>
                            </td>
                        </tr>
                        <tr>
                            <td style={{fontFamily: 'Verdana', fontSize: '13px' }}>
                                Razão Social Fornecedor: <br />
                                <p style={{fontFamily: 'Verdana', fontSize: '13px',  }}>{dadoPrincipal?.NOFORNECEDOR}</p>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table width="100%" className="bordasimples">
                    <tbody>
                        <tr
                        
                        >
                            <td rowspan="2" width="400" 
                                style={{
                                    fontFamily: 'Verdana', 
                                    fontSize: '9px', 
                                    fontWeight: 400, 
                                    color: '#666',
                                    padding: '0px',
                                    margin: '0px',                                     
                                }}
                            >
                                 <p style={{margin: '0px', padding: '0px' }}>
                                    
                                    {dadoPrincipal?.CONTATOS?.map((contato, index) => (
                                        <span key={index}>{contato} <br /></span>
                                    ))}
                                </p>
                            </td>
                            <td width="200" className="tdPdf" >CNPJ: <br />
                                <p className="tdPdf">{dadoPrincipal?.CNPJFORN}</p>
                            </td>
                            <td className="tdPdf" >Email: <br />
                                <p className="tdPdf">{dadoPrincipal?.EMAILFORN}</p>
                            </td>
                            <td width="100" className="tdPdf" >Tel: <br />
                                <p className="tdPdf">{dadoPrincipal?.FONEFORN}</p>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2" width="200" className="tdPdf">INSC EST: <br />
                                <p className="tdPdf">{dadoPrincipal?.INSCESTFORN}</p>
                            </td>
                            <td className="tdPdf">Cel: <br />
                                <p className="tdPdf">{dadoPrincipal?.FONEFORN}</p>
                            </td>
                        </tr>
                    </tbody>
                </table>


                <table width="100%" className="bordasimples">
                    <tbody>
                        <tr>
                            <td width="200" className="tdPdf">Data do Pedido: <br />
                                <p className="tdPdf">{dadoPrincipal?.DTPEDIDO}</p>
                            </td>
                            <td width="200" className="tdPdf">Data da Entrega: <br />
                                <p className="tdPdf">{dadoPrincipal?.DTENTREGAFORMATADA2}</p>
                            </td>
                            <td className="tdPdf">Endereço: <br /><p className="tdPdf">{dadoPrincipal?.ENDFORN}</p> </td>
                            <td className="tdPdf">Complemento: <br /><p className="tdPdf">{dadoPrincipal?.COMPFORN}</p> <strong></strong> </td>
                        </tr>
                    </tbody>
                </table>

                <table width="100%" className="bordasimples">
                    <tbody>
                        <tr>
                            <td width="400" className="tdPdf">
                                Comprador: <br /><p className="tdPdf">{dadoPrincipal?.NOMECOMPRADOR}</p>
                            </td>
                            <td className="tdPdf">N°: <br />
                                <p className="tdPdf">{dadoPrincipal?.NUMEROFORN}</p>
                            </td>
                            <td className="tdPdf">Bairro: <br /><p className="tdPdf">{dadoPrincipal?.BAIRROFORN}</p>
                            </td>
                            <td className="tdPdf">Transportadora/Telefone: <br /><p className="tdPdf">{dadoPrincipal?.NOMETRANSPORTADORA} - </p>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table width="100%" className="bordasimples">
                    <tbody>
                        <tr>
                            <td width="400" className="tdPdf">
                                Vendedor: <br /><p className="tdPdf">{dadoPrincipal?.NOVENDEDOR}</p>
                            </td>

                            <td width="400" className="tdPdf">
                                Cidade: <br /><p className="tdPdf">{dadoPrincipal?.CIDADEFORN}</p>
                            </td>
                            <td className="tdPdf">Desc. I (%): <br /><p className="tdPdf">{formatMoeda(toFloat(dadoPrincipal?.DESCPERC01))}</p>
                            </td>
                            <td className="tdPdf">Desc. II(%): <br /><p className="tdPdf">{formatMoeda(toFloat(dadoPrincipal?.DESCPERC02))}</p>
                            </td>
                            <td className="tdPdf">Desc. III(%): <br /><p className="tdPdf">{formatMoeda(toFloat(dadoPrincipal?.DESCPERC03))}</p>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table width="100%" className="bordasimples">
                    <tbody><tr>
                        <td width="400" className="tdPdf">
                            Cond. Pagamento: <br /><p className="tdPdf" >{dadoPrincipal?.DSCONDICAOPAG}</p>
                        </td>

                        <td className="tdPdf">
                            CEP: <br /><p className="tdPdf">{dadoPrincipal?.CEPFORN}</p>
                        </td>
                        <td className="tdPdf">
                            UF: <br /><p className="tdPdf">{dadoPrincipal?.UFFORN}</p>
                        </td>
                        <td className="tdPdf">
                            Frete: <br />
                            <p className="tdPdf">
                                {dadoPrincipal?.dsTipoFretePedido}
                            </p>
                        </td>
                    </tr>
                    </tbody>
                </table>

                <table width="100%" className="bordasimples">
                    <tbody>
                        <tr>
                            <td width="400" className="tdPdf" >
                                Observações: <p style={{fontFamily: 'Verdana', fontSize: '9px', margin: '0px', padding: '0px'}}>{dadoPrincipal?.OBSPEDIDO} - {dadoPrincipal?.OBSPEDIDO2} </p>
                            </td>
                            <td className="tdPdf" >
                                Fiscal: <p className="tdPdf" >{dadoPrincipal?.dsTipoFiscalPedido}</p>
                            </td>
                            <td className="tdPdf" >
                                Enviar: <p className="tdPdf" >{dadoPrincipal?.dsTipoEnviar} </p>
                            </td>
                            <td className="tdPdf" >
                                Tipo: <p className="tdPdf" >{dadoPrincipal?.MODPEDIDO} </p>
                            </td>
                            <td className="tdPdf" >
                                Comissão: <p className="tdPdf" >{formatMoeda(toFloat(dadoPrincipal?.PERCCOMISSAO))} </p>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <ActionListaDetalheSempreco dadosDetalhePedido={dadosDetalhePedido} />
           
            </div>
        </Fragment>
    )
}