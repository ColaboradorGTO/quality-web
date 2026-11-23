import { Fragment, useMemo } from "react"
import { toFloat } from "../../../../../utils/toFloat";
import { formatMoeda } from "../../../../../utils/formatMoeda";
import "./styles.css";


export const ActionListaDetalhe = ({ dadosDetalhePedido }) => {

  const processarGradeCompleta = (detalhegrade) => {
    if (!detalhegrade || !Array.isArray(detalhegrade)) return '';
    
    const tablegrade = detalhegrade.map(({ DSTAMANHO, INDICETAMANHO }) => 
      `<div style="display: inline-block; text-align: center; margin: 0 2px; font-size: 8px; width: 4.5%; font-family: 'Verdana, sans-serif';">
        ${DSTAMANHO}<br/><b>${INDICETAMANHO}</b>
      </div>`
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
    });

    return {
      dadosAgrupados: Object.values(grupos),
      totalGeral: { totalVrGeral, totalQtdGeral }
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
                Referência
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
                Local Exp
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
                    <label style={{  padding: "5px" }} >
                      <strong style={{textAlign: "left", color: "blue", fontSize: "12px", lineHeight: "18px", fontWeight: 900, fontFamily: 'Verdana' }}>{grupo.nome}</strong>
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
                      <div dangerouslySetInnerHTML={{ __html: item.gradeCompleta }} />
                    </td>
                    <td className="td">{formatMoeda(item.VRUNITLIQDETALHEPEDIDO)}</td>
                    <td className="td">{formatMoeda(item.VRVENDADETALHEPEDIDO)}</td>
                    <td className="td">{formatMoeda(item.VRTOTALDETALHEPEDIDO)}</td>
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
          <div style={{width: "100%", display: "flex", justifyContent: "flex-end", marginTop: "15px"}}>

          </div>
            <tbody style={{border: "solid 1px #000", fontFamily: 'Verdana'}}>
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
      </div>
    </Fragment>
  )
}