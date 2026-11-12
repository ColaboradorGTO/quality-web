import { Fragment, useMemo } from "react"
import { toFloat } from "../../../../../utils/toFloat";
import { formatMoeda } from "../../../../../utils/formatMoeda";
import "./styles.css";


export const ActionListaDetalhe = ({ dadosDetalhePedido }) => {

  const processarGradeCompleta = (detalhegrade) => {
    if (!detalhegrade || !Array.isArray(detalhegrade)) return '';

    const tablegrade = detalhegrade.map(({ DSTAMANHO, INDICETAMANHO }) =>
      `
      <table width="100%" class="rowGradeTable">
        <tbody >
          <tr style="display: table-row; margin: 0; padding: 1px; font-family: 'Verdana';">
            <td align="center" style="font-size: 08px;" width="4.5%">
              ${DSTAMANHO}<br/><b>${INDICETAMANHO}</b>
            </td>
          </tr>
        </tbody>
      </table>
      `
    ).join('');

    return tablegrade;
  };


  const { dadosAgrupados, totalGeral, totalVendas } = useMemo(() => {
    const grupos = {};
    let totalVrGeral = 0;
    let totalQtdGeral = 0;
    let totalVrVendaPedidosImprimir = 0; 
    let totalVrLucroPedidoImprimir = 0;  
    let totalPercLucroImprimir = 0;   
    let contadorGeral = 0;

    dadosDetalhePedido.forEach((item) => {
      const detpedido = item.detpedido;
      const detalhegrade = item.detalhegrade;


      const grupoChave = `${detpedido?.DSGRUPOESTRUTURA} / ${detpedido?.DSSUBGRUPOESTRUTURA}`;


      const TpModPedido = detpedido?.DSCATEGORIAPEDIDO;
      const txtCxTec = TpModPedido === 'CALCADOS' ? 'Caixas' : 'Tecido';
      const DadosCxTecido = TpModPedido === 'CALCADOS' ?
        Math.round(detpedido?.NUCAIXA || 0) :
        detpedido?.DSTIPOTECIDO;

      contadorGeral++;
      const vrTotal = toFloat(detpedido?.VRTOTALDETALHEPEDIDO);
      const vrVenda = toFloat(detpedido?.VRVENDADETALHEPEDIDO);
      const qtdTotal = toFloat(detpedido?.QTDTOTAL);
      

      totalVrGeral += vrTotal;
      totalQtdGeral += qtdTotal;
      totalVrVendaPedidosImprimir += (qtdTotal * vrVenda)

      if (!grupos[grupoChave]) {
        grupos[grupoChave] = {
          nome: grupoChave,
          itens: [],
          subtotalVr: 0,
          subtotalQtd: 0,
          subtotalVenda: 0
        };
      }


      const itemProcessado = {
        contador: contadorGeral,
        QTDTOTAL: qtdTotal,
        DSSIGLA: detpedido?.DSSIGLA,
        NUREF: detpedido?.NUREF,
        DSPRODUTO: detpedido?.DSPRODUTO,
        DSCOR: detpedido?.DSCOR,
        DSLOCALEXPOSICAO: detpedido?.DSLOCALEXPOSICAO,
        DSESTILO: detpedido?.DSESTILO,
        STREDESOCIAL: detpedido?.STREDESOCIAL === 'True' ? 'SIM' : 'NÃO', // CORRIGIDO: usar STREDESOCIAL
        OBSPRODUTO: detpedido?.OBSPRODUTO,
        VRUNITLIQDETALHEPEDIDO: toFloat(detpedido?.VRUNITLIQDETALHEPEDIDO),
        VRVENDADETALHEPEDIDO: toFloat(detpedido?.VRVENDADETALHEPEDIDO),
        VRTOTALDETALHEPEDIDO: vrTotal,
        DadosCxTecido,
        txtCxTec,
        gradeCompleta: processarGradeCompleta(detalhegrade), // CORRIGIDO: processar toda a grade
        grupoChave
      };

      grupos[grupoChave].itens.push(itemProcessado);
      grupos[grupoChave].subtotalVr += vrTotal;
      grupos[grupoChave].subtotalQtd += qtdTotal;
      grupos[grupoChave].subtotalVenda += (qtdTotal * vrVenda);
    });
    totalVrLucroPedidoImprimir = toFloat(totalVrVendaPedidosImprimir) - toFloat(totalVrGeral);
    totalPercLucroImprimir = ((toFloat(totalVrVendaPedidosImprimir) * 100) / toFloat(totalVrGeral)) - 100;
    return {
      dadosAgrupados: Object.values(grupos),
      totalGeral: { totalVrGeral, totalQtdGeral },
      totalVendas: { totalVrVendaPedidosImprimir, totalVrLucroPedidoImprimir, totalPercLucroImprimir }
    };
  }, [dadosDetalhePedido]);

  return (
    <Fragment>
      <div className="mt-4" style={{ fontFamily: 'Verdana' }}>
        <table
          id="dt-basic-detalhe-pedido-grade"
          className="bordasimples tbprint dataTable no-footer"
          role="grid"
          style={{ width: "100%", fontFamily: 'Verdana' }}
        >
          <thead>
            <tr role="row">
              <th className="thTable">
                #
              </th>
              <th className="thTable">
                Qtd
              </th>
              <th className="thTable">
                Unid
              </th>
              <th className="thTable">
                Ref.
              </th>
              <th className="thTableDescricao">
                Descrição
              </th>
              <th className="thTable">
                Tecido
              </th>
              <th className="thTable">
                Cor
              </th>
              <th className="thTable">
                L. Exp
              </th>
              <th className="thTable">
                Estilo
              </th>
              <th className="thTable">
                R. Social
              </th>
              <th className="thTable">
                Obs
              </th>
              <th className="thTable">
                Grade
              </th>
              <th className="thTable">
                Vr Unit
              </th>
              <th className="thTable">
                Vr Venda
              </th>
              <th className="thTable">
                Total
              </th>
            </tr>
          </thead>

          <tbody className="table-product" style={{}}>
            {dadosAgrupados.map((grupo, grupoIndex) => (
              <Fragment key={grupoIndex}>
                {/* Header do Grupo */}
                <tr className="group">
                  <td colSpan="15" >
                    <label style={{ padding: "5px" }} >
                      <strong style={{ textAlign: "left", color: "blue", fontSize: "12px", lineHeight: "18px", fontWeight: 900, fontFamily: 'Verdana' }}>{grupo.nome}</strong>
                    </label>
                  </td>
                </tr>

                {/* Itens do Grupo */}
                {grupo.itens.map((item, itemIndex) => (
                  <tr
                    key={itemIndex}
                    role="row"
                    className={itemIndex % 2 === 0 ? "even" : "odd"}
                  >
                    <td className="tdCount" >{item.contador}</td>
                    <td className="td text-center">{item.QTDTOTAL}</td>
                    <td className="td text-center">{item.DSSIGLA}</td>
                    <td className="td text-center">{item.NUREF}</td>
                    <td className="td text-center">{item.DSPRODUTO}</td>
                    <td className="td text-center">{item.DadosCxTecido}</td>
                    <td className="td text-center">{item.DSCOR}</td>
                    <td className="td text-center">{item.DSLOCALEXPOSICAO}</td>
                    <td className="td text-center" >{item.DSESTILO}</td>
                    <td className="td text-center">{item.STREDESOCIAL}</td>
                    <td className="td text-center">{item.OBSPRODUTO}</td>
                    <td className="td" style={{ width: "10%" }}>
                      <div style={{ display: "flex" }} dangerouslySetInnerHTML={{ __html: item.gradeCompleta }} />
                    </td>
                    <td className="td text-right">{formatMoeda(item.VRUNITLIQDETALHEPEDIDO)}</td>
                    <td className="td text-right">{formatMoeda(item.VRVENDADETALHEPEDIDO)}</td>
                    <td className="td text-right">{formatMoeda(item.VRTOTALDETALHEPEDIDO)}</td>
                  </tr>
                ))}

                <tr className="group">
                  <td colSpan="15" style={{ textAlign: "right", padding: "5px" }}>
                    <label >
                      <strong style={{ textAlign: "right", color: "blue", fontSize: "12px", lineHeight: "18px", fontWeight: 900 }}>{formatMoeda(grupo.subtotalVr)}</strong>
                    </label>
                  </td>
                </tr>
              </Fragment>
            ))}
          </tbody>

          {/* Total Geral */}
          <div style={{ width: "100%", display: "flex", justifyContent: "flex-end", marginTop: "15px" }}>

          </div>
          <tbody style={{ border: "solid 1px #000", fontFamily: 'Verdana' }}>
            <tr >
              <td
                className="pr-2"
                align="center"
                style={{
                  fontWeight: 700,
                  color: "#666",
                  border: "solid 1px #000",
                  textAlign: "left",
                  fontSize: "14px",
                  lineHeight: "15px",
                }}
                colSpan={1}
              >
                Qtd Total
              </td>
              <td
                align="center"
                style={{
                  fontWeight: 700,
                  color: "#666",
                  border: "solid 1px #000",
                  textAlign: "center",
                  fontSize: "12px",
                  lineHeight: "15px",
                }}
                colSpan={2}
              >
                <b>{Math.round(totalGeral.totalQtdGeral)}</b>
              </td>
              <td
                className="pr-2 "
                align="center"
                style={{
                  fontWeight: 700,
                  color: "#666",
                  border: "solid 1px #000",
                  textAlign: "end",
                  fontSize: "12px",
                  lineHeight: "15px",

                }}
                colSpan={11}
              >
                <p><b>Valor Total </b></p>
              </td>
              <td
                align="center"
                style={{
                  fontWeight: 700,
                  color: "#666",
                  border: "solid 1px #000",
                  textAlign: "end",
                  fontSize: "14px",
                  lineHeight: "15px",
                }}
                colSpan={1}
              >
                {formatMoeda(totalGeral.totalVrGeral)}
              </td>
            </tr>
          </tbody>

        </table>

        <div style={{ width: "100% !important" }}>
          <table className="semborda">
            <tbody>
              <tr>
                <th style={{ textAlign: "left", fontSize: "14px" }}>QTD Produtos : </th>
                <th style={{ textAlign: "right", fontSize: "14px" }}>
                  <b>{Math.round(totalGeral.totalQtdGeral)}</b>
                </th>
              </tr>
              <tr>
                <th style={{ textAlign: "left", fontSize: "14px" }}>Valor Total Compra : </th>
                <th style={{ textAlign: "right", fontSize: "14px", paddingLeft: "10px" }}>
                  <b>{formatMoeda(totalGeral.totalVrGeral)}</b>
                </th>
              </tr>
              <tr>
                <th style={{ textAlign: "left", fontSize: "14px" }}>Valor Total Venda : </th>
                <th style={{ textAlign: "right", fontSize: "14px" }}>
                  {/* ✅ 23. Variáveis corretas calculadas */}
                  <b>{formatMoeda(totalVendas.totalVrVendaPedidosImprimir)}</b>
                </th>
              </tr>
              <tr>
                <th style={{ textAlign: "left", fontSize: "14px" }}>Valor Total Lucro : </th>
                <th style={{ textAlign: "right", fontSize: "14px" }}>
                  <b>{formatMoeda(totalVendas.totalVrLucroPedidoImprimir)}</b>
                </th>
              </tr>
              <tr>
                <th style={{ textAlign: "left", fontSize: "14px" }}>% Total Lucro : </th>
                <th style={{ textAlign: "right", fontSize: "14px" }}>
                  <b>{formatMoeda(totalVendas.totalPercLucroImprimir)}</b>
                </th>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Fragment>
  )
}