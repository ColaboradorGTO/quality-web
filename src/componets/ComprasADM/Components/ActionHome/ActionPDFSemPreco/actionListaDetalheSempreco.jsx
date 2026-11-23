import { Fragment, useMemo } from "react"
import { toFloat } from "../../../../../utils/toFloat";
import { formatMoeda } from "../../../../../utils/formatMoeda";
import "./styles.css";
import { maskValorEmInteiro } from "../../../../../utils/mascaraValor";

export const ActionListaDetalheSempreco = ({ dadosDetalhePedido }) => {

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


  const { dadosAgrupados, totalGeral } = useMemo(() => {
    const grupos = {};
    let totalVrGeral = 0;
    let totalQtdGeral = 0;
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
      const qtdTotal = toFloat(detpedido?.QTDTOTAL);


      totalVrGeral += vrTotal;
      totalQtdGeral += qtdTotal;


      if (!grupos[grupoChave]) {
        grupos[grupoChave] = {
          nome: grupoChave,
          itens: [],
          subtotalVr: 0,
          subtotalQtd: 0
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
        VRTOTALDETALHEPEDIDO: vrTotal,
        DadosCxTecido,
        txtCxTec,
        gradeCompleta: processarGradeCompleta(detalhegrade), // CORRIGIDO: processar toda a grade
        grupoChave
      };

      grupos[grupoChave].itens.push(itemProcessado);
      grupos[grupoChave].subtotalVr += vrTotal;
      grupos[grupoChave].subtotalQtd += qtdTotal;
    });

    return {
      dadosAgrupados: Object.values(grupos),
      totalGeral: { totalVrGeral, totalQtdGeral }
    };
  }, [dadosDetalhePedido]);

  return (
    <Fragment>
      <div className="mt-4" style={{ fontFamily: 'Verdana, sans-serif' }}>
        <table
          id="dt-basic-detalhe-pedido-grade"
          className="bordasimples tbprint dataTable no-footer"
          role="grid"
          style={{ width: "100%", fontFamily: 'Verdana, sans-serif' }}
        >
          <thead>
            <tr role="row">
              <th className="thTable" rowSpan="1" colSpan="1">
                #
              </th>
              <th className="thTable" rowSpan="1" colSpan="1">
                <b>Qtd</b>
              </th>
              <th className="thTable" rowSpan="1" colSpan="1">
                <b>Unid</b>
              </th>
              <th className="thTable" rowSpan="1" colSpan="1">
                <b>Referência</b>
              </th>
              <th className="thTableDescricao" rowSpan="1" colSpan="1">
                <b>Descrição</b>
              </th>
              <th className="thTable" rowSpan="1" colSpan="1">
                <b>Tecido</b>
              </th>
              <th className="thTable" rowSpan="1" colSpan="1">
                <b>Cor</b>
              </th>
              <th className="thTable" rowSpan="1" colSpan="1">
                <b>Local Exp</b>
              </th>
              <th className="thTable" rowSpan="1" colSpan="1">
                <b>Estilo</b>
              </th>
              <th className="thTable" rowSpan="1" colSpan="1">
                <b>R. Social</b>
              </th>
              <th className="thTable" rowSpan="1" colSpan="1">
                <b>Obs</b>
              </th>
              <th className="thTable" rowSpan="1" colSpan="1">
                <b>Grade</b>
              </th>
              <th className="thTable" rowSpan="1" colSpan="1">
                <b>Vr Unit</b>
              </th>
              <th className="thTable" rowSpan="1" colSpan="1">
                <b>Total</b>
              </th>
            </tr>
          </thead>

          <tbody className="table-product" style={{}}>
            {dadosAgrupados.map((grupo, grupoIndex) => (
              <Fragment key={grupoIndex}>
                {/* Header do Grupo */}
                <tr className="group">
                  <td colSpan="14" style={{ padding: "5px" }}>
                    <label style={{ textAlign: "left", color: "blue", fontSize: "12px", lineHeight: "18px", fontWeight: 500, fontFamily: 'Verdana' }}>
                      <strong>{grupo.nome}</strong>
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
                    <td className="tdCount">{item.contador}</td>
                    <td className="td">{item.QTDTOTAL}</td>
                    <td className="td">{item.DSSIGLA}</td>
                    <td className="td">{item.NUREF}</td>
                    <td className="td">{item.DSPRODUTO}</td>
                    <td className="td">{item.DadosCxTecido}</td>
                    <td className="td">{item.DSCOR}</td>
                    <td className="td">{item.DSLOCALEXPOSICAO}</td>
                    <td className="td">{item.DSESTILO}</td>
                    <td className="td">{item.STREDESOCIAL}</td>
                    <td className="td">{item.OBSPRODUTO}</td>
                    <td className="td">
                      <div style={{ display: "flex" }} dangerouslySetInnerHTML={{ __html: item.gradeCompleta }} />
                    </td>
                    <td className="td">{formatMoeda(item.VRUNITLIQDETALHEPEDIDO)}</td>
                    <td className="td">{formatMoeda(item.VRTOTALDETALHEPEDIDO)}</td>
                  </tr>
                ))}
                <tr className="group">
                  <td colSpan="15" style={{ textAlign: "right", padding: "5px" }}>
                    <label >
                      <strong style={{ textAlign: "right", color: "blue", fontSize: "12px", lineHeight: "18px", fontWeight: 500 }}>{formatMoeda(grupo.subtotalVr)}</strong>
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
                  fontFamily: 'Verdana'
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
                  fontFamily: 'Verdana'
                }}
                colSpan={2}
              >
                <b>{maskValorEmInteiro(totalGeral.totalQtdGeral)}</b>
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
                  fontFamily: 'Verdana',

                }}
                colSpan={10}
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
                  fontFamily: 'Verdana'
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
                  <b>{maskValorEmInteiro(totalGeral.totalQtdGeral)}</b>
                </th>
              </tr>
              <tr>
                <th style={{ textAlign: "left", fontSize: "14px" }}>Valor Total Compra : </th>
                <th style={{ textAlign: "right", fontSize: "14px", paddingLeft: "10px" }}>
                  <b>{formatMoeda(totalGeral.totalVrGeral)}</b>
                </th>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Fragment>
  )
}
