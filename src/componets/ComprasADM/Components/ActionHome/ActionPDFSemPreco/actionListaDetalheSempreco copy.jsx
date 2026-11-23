import { Fragment } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { toFloat } from "../../../../../utils/toFloat";
import { formatMoeda } from "../../../../../utils/formatMoeda";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";


export const ActionListaDetalheSempreco = ({ dadosDetalhePedido }) => {


  const dados = dadosDetalhePedido.map((item, index) => {
    let contador = index + 1;
    let txtCxTec = item.detpedido?.DSTIPOTECIDO == 'CALCADOS' ? 'Caixas' : 'Tecido';
    let DadosCxTecido = item.detpedido?.DSTIPOTECIDO == 'CALCADOS' ? item.detpedido?.NUCAIXA : item.detpedido?.DSTIPOTECIDO
    console.log(item.detalhegrade, 'item.detalhegrade?.DSTAMANHO')
    return {
      QTDTOTAL: item.detpedido?.QTDTOTAL,
      DSSIGLA: item.detpedido?.DSSIGLA,
      NUREF: item.detpedido?.NUREF,
      DSPRODUTO: item.detpedido?.DSPRODUTO,
      DSCOR: item.detpedido?.DSCOR,
      DSLOCALEXPOSICAO: item.detpedido?.DSLOCALEXPOSICAO,
      DSESTILO: item.detpedido?.DSESTILO,
      STECOMMERCE: item.detpedido?.STECOMMERCE,
      STREDESOCIAL: item.detpedido?.STREDESOCIAL,
      OBSPRODUTO: item.detpedido?.OBSPRODUTO,
      VRUNITLIQDETALHEPEDIDO: item.detpedido?.VRUNITLIQDETALHEPEDIDO,
      VRVENDADETALHEPEDIDO: item.detpedido?.VRVENDADETALHEPEDIDO,
      VRTOTALDETALHEPEDIDO: toFloat(item.detpedido?.VRTOTALDETALHEPEDIDO),
      IDPEDIDO: item.detpedido?.IDPEDIDO,
      IDDETPEDIDO: item.detpedido?.IDDETPEDIDO,
      DSCATEGORIAPEDIDO: item.detpedido?.DSCATEGORIAPEDIDO,
      DSSUBGRUPOESTRUTURA: item.detpedido?.DSSUBGRUPOESTRUTURA,
      DSGRUPOESTRUTURA: item.detpedido?.DSGRUPOESTRUTURA,
      DSTIPOTECIDO: item.detpedido?.DSTIPOTECIDO,
      NUCAIXA: item.detpedido?.NUCAIXA,
      DSTAMANHO: item.detalhegrade[0]?.DSTAMANHO,
      INDICETAMANHO: item.detalhegrade[0]?.INDICETAMANHO,

      txtCxTec,
      DadosCxTecido,
      contador
    }
  });

  const calcularTotal = (field) => {
    return dados.reduce((total, item) => total + toFloat(item[field]), 0);
  };

  const calcularTotalVrDetalhePedido = () => {
    const total = calcularTotal('VRTOTALDETALHEPEDIDO');

    return total;
  }

  const calcularQtdTotalPedido = () => {
    const total = calcularTotal('QTDTOTAL');
    return total;
  }

  // Determinar o header baseado no primeiro item dos dados
  const headerCxTecido = dados.length > 0 ? dados[0].txtCxTec : 'Caixa/Tecido';

  const colunasPedidos = [

    {
      field: 'contador',
      header: '#',
      body: row => <th
        style={{
          textAlign: 'center',
          padding: '1px',
          margin: '0px',
          height: '20px',
          width: '20px',
        }}>
        {row.contador}
      </th>,
      sortable: true,
    },
    {
      field: 'QTDTOTAL',
      header: 'Qtd',
      body: row => <th>{row.QTDTOTAL}</th>,
      sortable: true,
    },
    {
      field: 'DSSIGLA',
      header: 'Unid',
      body: row => <th>{row.DSSIGLA}</th>,
      sortable: true,
    },
    {
      field: 'NUREF',
      header: 'Referência',
      body: row => <th>{row.NUREF}</th>,
      sortable: true,
    },
    {
      field: 'DSPRODUTO',
      header: 'Descrição',
      body: row => <th>{row.DSPRODUTO}</th>,
      footer: 'Total ',
      sortable: true,
    },
    {
      field: 'txtCxTec',
      header: headerCxTecido,
      body: row => <th>{row.DadosCxTecido}</th>,
      footer: 'Total ',
      sortable: true,
    },
    {
      field: 'DSCOR',
      header: 'Cor',
      body: row => <th>{row.DSCOR}</th>,

      sortable: true,
    },
    {
      field: 'DSLOCALEXPOSICAO',
      header: 'Local Exp',
      body: row => <th>{row.DSLOCALEXPOSICAO}</th>,
      sortable: true,
    },
    {
      field: 'DSESTILO',
      header: 'Estilo',
      body: row => <th>{row.DSESTILO}</th>,
      sortable: true,
    },
    {
      field: 'STECOMMERCE',
      header: 'R.Social',
      body: row => {
        return (

          <th style={{ alignContent: 'center' }} >{row.STECOMMERCE == 'True' ? 'SIM' : 'NÃO'}</th>

        )
      },
      sortable: true,
    },
    {
      field: 'OBSPRODUTO',
      header: 'Obs',
      body: row => <th >{row.OBSPRODUTO} </th>,
      sortable: true,
    },
    {
      field: 'DSTAMANHO',
      header: 'Grade',
      body: row => <th >{row.DSTAMANHO}  <br /> {row.INDICETAMANHO}</th>,
      sortable: true,
    },
    {
      field: 'VRUNITLIQDETALHEPEDIDO',
      header: 'Vr Unit',
      body: row => <th >{formatMoeda(row.VRUNITLIQDETALHEPEDIDO)}</th>,
      sortable: true,
    },
    {
      field: 'VRVENDADETALHEPEDIDO',
      header: 'Vr Venda',
      body: row => <th >{formatMoeda(row.VRVENDADETALHEPEDIDO)}</th>,
      sortable: true,
    },
    {
      field: 'VRTOTALDETALHEPEDIDO',
      header: 'Total',
      body: row => <th >{formatMoeda(row.VRTOTALDETALHEPEDIDO)} </th>,
      sortable: true,
    },
  ]

  const HeaderTemplate = (rowData) => {
    return (
      <div style={{ border: '1px solid #000' }}>

        <tr classNameName="font-bold" style={{ fontWeight: 600, fontSize: '12px', color: 'blue', margin: '1px', padding: '0px' }}>
          {rowData.DSGRUPOESTRUTURA} / {rowData.DSSUBGRUPOESTRUTURA}
        </tr>
      </div>
    );
  };


  const footerGroup = (
    <ColumnGroup>

      <Row style={{}}>
        <Column footer="Qtd Total" colSpan={1} footerStyle={{ color: '#212529', border: '1px solid #000', fontSize: '0.625rem', textAlign: 'initial', margin: '0px', padding: '0px' }} />
        <Column footer={calcularQtdTotalPedido()} colSpan={1} footerStyle={{ color: '#212529', border: '1px solid #000', fontSize: '0.8rem' }} />
        <Column footer={"Valor Total"} colSpan={12} footerStyle={{ color: '#212529', border: '1px solid #000', fontSize: '0.8rem', textAlign: 'end' }} />
        <Column footer={formatMoeda(calcularTotalVrDetalhePedido())} colSpan={1} footerStyle={{ color: '#212529', border: '1px solid #000', fontSize: '0.8rem' }} />

      </Row>
    </ColumnGroup>
  )

  return (
    <Fragment>

      <div classNameName="card mt-4">

        <DataTable
          title="Vendas por Loja"
          value={dados}
          size="small"
          sortOrder={-1}
          rowGroupMode="subheader"
          groupRowsBy="DSSUBGRUPOESTRUTURA"
          sortMode="single"
          scrollable
          rowGroupHeaderTemplate={HeaderTemplate}
          footerColumnGroup={footerGroup}
          rows={10}
          rowsPerPageOptions={[5, 10, 20, 50]}
          showGridlines
          stripedRows
          emptyMessage={<div classNameName="dataTables_empty" style={{ border: '1px solid #000' }}></div>}
        >
          {colunasPedidos.map(coluna => (
            <Column
              key={coluna.field}
              field={coluna.field}
              header={coluna.header}
              body={coluna.body}
              footer={coluna.footer}
              headerStyle={{
                textAlign: 'center',
                fontWeight: '700',
                color: '#666',
                backgroundColor: 'white',
                border: '1px solid #000',
                fontSize: '0.75rem',
                margin: '0px'

              }}
              footerStyle={{ color: 'white', backgroundColor: 'white', border: '1px solid #000', fontSize: '0.625rem' }}
              bodyStyle={{
                fontSize: '11px',
                backgroundColor: 'white',
                border: '1px solid #000',
                textAlign: 'center',
                alignContent: 'center',
                alignItems: 'center',
                padding: '1px',
                margin: '0px'
              }}

            />
          ))}
        </DataTable>

        <table
          id="dt-basic-detalhe-pedido-grade"
          className="bordasimples tbprint dataTable no-footer"
          role="grid"
          style={{ width: "100%" }}
        >
          <thead>
            <tr role="row">
              <th className="sorting_disabled text-center" style={{ border: "solid 1px #000", width: "0px", textalign: "center", fontSize: "12px" }} rowspan="1" colspan="1">#</th>
              <th className="sorting_disabled text-center" style={{ border: "solid 1px #000", width: "0px", textalign: "center", fontSize: "12px" }} rowspan="1" colspan="1">
                <b>Qtd</b>
              </th>
              <th className="sorting_disabled text-center" style={{ border: "solid 1px #000", width: "0px", textalign: "center", fontSize: "12px" }} rowspan="1" colspan="1">
                <b>Unid</b>
              </th>
              <th className="sorting_disabled text-center" style={{ border: "solid 1px #000", width: "0px", textalign: "center", fontSize: "12px" }} rowspan="1" colspan="1">
                <b>Descrição</b>
              </th>
              <th className="sorting_disabled text-center" style={{ border: "solid 1px #000", width: "0px", textalign: "center", fontSize: "12px" }} rowspan="1" colspan="1">
                <b>Tecido</b>
              </th>
              <th className="sorting_disabled text-center" style={{ border: "solid 1px #000", width: "0px", textalign: "center", fontSize: "12px" }} rowspan="1" colspan="1">
                <b>Cor</b>
              </th>
              <th className="sorting_disabled text-center" style={{ border: "solid 1px #000", width: "0px", textalign: "center", fontSize: "12px" }} rowspan="1" colspan="1">
                <b>Local Exp</b>
              </th>
              <th className="sorting_disabled text-center" style={{ border: "solid 1px #000", width: "0px", textalign: "center", fontSize: "12px" }} rowspan="1" colspan="1">
                <b>Estilo</b>
              </th>
              <th className="sorting_disabled text-center" style={{ border: "solid 1px #000", width: "0px", textalign: "center", fontSize: "12px" }} rowspan="1" colspan="1">
                <b>R. Social</b>
              </th>
              <th 
                className="sorting_disabled text-center" 
                style={{ border: "solid 1px #000", width: "0px", textalign: "center", fontSize: "12px" }} 
                rowspan="1" 
                colspan="1"
              >
                <b>Obs</b>
              </th>
              <th 
              className="sorting_disabled text-center" style={{ border: "solid 1px #000", width: "0px", textalign: "center", fontSize: "12px" }} rowspan="1" colspan="1">
                <b>Grade</b>
              </th>
              <th 
                className="sorting_disabled text-center" 
                style={{ border: "solid 1px #000", width: "0px", textalign: "center", fontSize: "12px" }} 
                rowspan="1" 
                colspan="1"
              >
                <b>Vr Unit</b>
              </th>
              <th 
                className="sorting_disabled text-center" 
                style={{ border: "solid 1px #000", width: "0px", textalign: "center", fontSize: "12px" }} 
                rowspan="1" 
                colspan="1"
              >
                <b>Total</b>
              </th>
            </tr>
          </thead>

          <tbody id="resultadoPedidosListaImprimir">
            {dados.map((item, index) => (
              <>
                <tr className="group">
                  <td colspan="14">
                      <label style={{ color: "blue", fontSize: "12px" }}>
                        <strong>{item.DSGRUPOESTRUTURA} / {item.DSSUBGRUPOESTRUTURA}</strong>
                      </label>
                  </td>
                </tr>
                <tr role="row" className={index % 2 === 0 ? "even" : "odd"}>
                  <td className=" text-center">{item.contador}</td>
                  <td className=" text-center">{item.QTDTOTAL}</td>
                  <td className=" text-center">{item.DSSIGLA}</td>
                  <td className=" text-center">{item.DSPRODUTO}</td>
                  <td className=" text-center">{item.DadosCxTecido}</td>
                  <td className=" text-center">{item.DSCOR}</td>
                  <td className=" text-center">{item.DSLOCALEXPOSICAO}</td>
                  <td className=" text-center">{item.DSESTILO}</td>
                  <td className=" text-center">{item.STECOMMERCE == 'True' ? 'SIM' : 'NÃO'}</td>
                  <td className=" text-center">{item.OBSPRODUTO}</td>
                  <td className=" text-center">{item.DSTAMANHO}  <br /> {item.INDICETAMANHO}</td>
                  <td className=" text-center">{formatMoeda(item.VRUNITLIQDETALHEPEDIDO)}</td>
                  <td className=" text-center">{formatMoeda(item.VRTOTALDETALHEPEDIDO)}</td>
                </tr>
              </>
            ))}
          
          </tbody>

        </table>
      </div>
    </Fragment>
  )
}