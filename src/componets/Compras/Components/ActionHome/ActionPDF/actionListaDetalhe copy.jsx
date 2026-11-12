import { Fragment } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { toFloat } from "../../../../../utils/toFloat";
import { formatMoeda } from "../../../../../utils/formatMoeda";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";

//  ERRO RETORNAR AQUI PARA FAZER A TABELA DA FORMA CORRETA
export const ActionListaDetalhe = ({ dadosDetalhePedido }) => {


  const dados = dadosDetalhePedido.map((item, index) => {
    let contador = index + 1;

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

      DSTAMANHO: item.detalheGrade?.DSTAMANHO,
      INDICETAMANHO: item.detalheGrade?.INDICETAMANHO,
      contador
    }
  });

  const calcularTotal = (field) => {
    return dados.reduce((total, item) => total + toFloat(item[field]), 0);
  };

  const calcularTotalVrDetalhePedido = () => {
    const total = calcularTotal('VRTOTALDETALHEPEDIDO');
    console.log(total, 'total')
    return total;
  }

  const calcularQtdTotalPedido = () => {
    const total = calcularTotal('QTDTOTAL');
    return total;
  }

  const colunasPedidos = [

    {
      field: 'contador',
      header: '#',
      body: row => <th style={{width: '10px'}}>{row.contador}</th>,
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
      
            <th style={{alignContent: 'center'}} >{row.STECOMMERCE == 'True' ? 'SIM' : 'NÃO'}</th>
       
        )
      },
      sortable: true,
    },
    {
      field: 'STREDESOCIAL',
      header: 'Ecomm.',
      body: row => <th > {row.STREDESOCIAL == 'True' ? 'SIM' : 'NÃO'}</th>,
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
      body: row => <th >{row.DSTAMANHO} - {row.INDICETAMANHO}</th>,
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
      <tr className="font-bold" style={{ fontWeight: 600, fontSize: '12px', color: 'blue', margin: '1px', padding: '0px' }}>
        {rowData.DSSUBGRUPOESTRUTURA}
      </tr>
    );
  };


  const footerGroup = (
    <ColumnGroup>

      <Row>
        <Column footer="Qtd Total" colSpan={1} footerStyle={{ color: '#212529', border: '1px solid #000', fontSize: '0.625rem', textAlign: 'initial', margin: '0px', padding: '0px' }} />
        <Column footer={calcularQtdTotalPedido()} colSpan={1} footerStyle={{ color: '#212529', border: '1px solid #000', fontSize: '0.8rem' }} />
        <Column footer={"Valor Total"} colSpan={12} footerStyle={{ color: '#212529', border: '1px solid #000', fontSize: '0.8rem', textAlign: 'end' }} />
        <Column footer={formatMoeda(calcularTotalVrDetalhePedido())} colSpan={1} footerStyle={{ color: '#212529', border: '1px solid #000', fontSize: '0.8rem' }} />

      </Row>
    </ColumnGroup>
  )

  return (
    <Fragment>

      <div className="card mt-4">

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
          emptyMessage={<div className="" style={{border: '1px solid #000'}}></div>}
        >
          {colunasPedidos.map(coluna => (
            <Column
              key={coluna.field}
              field={coluna.field}
              header={coluna.header}
              body={coluna.body}
              footer={coluna.footer}
              // sortable={coluna.sortable}
              headerStyle={{
                textAlign: 'center', 
                fontWeight: '700',
                color: '#666', 
                backgroundColor: 'white', 
                border: '1px solid #000', 
                fontSize: '0.75rem', 
                margin: '0px', 
                // padding: '0px' 
              }}
              footerStyle={{ color: 'white', backgroundColor: 'white', border: '1px solid #000', fontSize: '0.625rem' }}
              bodyStyle={{  fontSize: '9px', backgroundColor: 'white', border: '1px solid #000', textAlign: 'center', alignContent: 'center', alignItems: 'center' }}

            />
          ))}
        </DataTable>
      </div>
    </Fragment>
  )
}