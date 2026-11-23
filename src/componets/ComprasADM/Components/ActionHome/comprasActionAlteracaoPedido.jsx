import { Fragment, useState } from "react"
import { ResultadoResumo } from "../../../ResultadoResumo/ResultadoResumo"
import { InputField } from "../../../Buttons/Input"
import { InputSelectAction } from "../../../Inputs/InputSelectAction"
import { ButtonType } from "../../../Buttons/ButtonType"


export const ComprasActionAlteracaoPedido = () => {
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('');
  const [dataPesquisaFim, setDataPesquisaFim] = useState('');

  const options = [
    { id: 1, value: "teste1" },
    { id: 2, value: "teste2" },
    { id: 3, value: "teste3" },
  ]
  return (

    <Fragment>
      <ResultadoResumo
        valorVendas="R$ 0,00"
        nomeVendas="Valor Bruto Pedido"
        valorTicketMedio="R$ 0,00"
        nomeTicketMedio="Valor Líquido Pedido"
        numeroCliente="0"
        nomeClient="QTD Produtos"
      />

      <ActionMain
        linkComponentAnterior={["Home"]}
        linkComponent={["Novo Pedido"]}
        title="Alteração - Pedido Nº"
        subTitle="Nome da Loja"

        InputFieldDTInicioComponent={InputField}
        labelInputFieldDTInicio={"Data Pedido"}
        valueInputFieldDTInicio={dataPesquisaInicio}
        onChangeInputFieldDTInicio={e => setDataPesquisaInicio(e.target.value)}        

        labelInputFieldDTFim={"Data Entrega"}
        InputFieldDTFimComponent={InputField}
        valueInputFieldDTFim={dataPesquisaFim}
        onChangeInputFieldDTFim={e => setDataPesquisaFim(e.target.value)}

        InputSelectCompradorComponent={InputSelectAction}
        labelSelectComprador={"Comprador"}
        optionsCompradores={options}

        InputSelectMarcasComponent={InputSelectAction}
        labelSelectMarcas={"Marca"}
        optionsMarcas={options}

        InputSelectFornecedorComponent={InputSelectAction}
        labelSelectFornecedor={"Lista Fornecedores"}
        optionsFornecedores={options}

        InputSelectFiscalComponent={InputSelectAction}
        labelSelectFiscal={"Fiscal"}
        optionsFiscal={options}

        InputSelectEnviarComponent={InputSelectAction}
        labelSelectEnviar={"Enviar"}
        optionsSelectEnviar={options}

        InputSelectCondicoesPagamentos={InputSelectAction}
        labelSelectCondicoesPagamentos={"Condições de Pagamento"}
        optionsCondicoesPagamentos={options}

        InputFieldObsFornecedor={InputField}
        labelInputFieldObsFornecedor={"Observação do Fornecedor - Max. 450 caracteres"}


        InputFieldObsInterna={InputField}
        labelInputFieldObsInterna={"Observação Interna - Max. 450 caracteres"}

        InputSelectTipoPedido={InputSelectAction}
        labelSelectTipoPedido={"Tipo de Pedido"}
        optionsTipoPedido={options}

        InputFieldVendedor={InputField}
        labelInputFieldVendedor={"Vendedor"}

        InputFieldEmailVendedor={InputField}
        labelInputFieldEmailVendedor={"Email do Vendedor"}

        InputFieldDescontoComponent1={InputField}
        labelInputFieldDesconto1={"Desconto I(%)"}

        InputFieldDescontoComponent2={InputField}
        labelInputFieldDesconto2={"Desconto II(%)"}

        InputFieldDescontoComponent3={InputField}
        labelInputFieldDesconto3={"Desconto III(%)"}

        InputFieldTotalLiq={InputField}
        labelInputFieldTotalLiq={"Total Liquido"}

        InputFieldComissao={InputField}
        labelInputFieldComissao={"Comissão"}


        InputSelectTransportadora={InputSelectAction}
        labelSelectTransportadora={"Transportadora"}
        optionsSelectTransportadora={options}

        InputSelectFreteComponent={InputSelectAction}
        labelSelectFrete={"Tipo Frete"}
        optionsFrete={options}




        ButtonTypeSalvar={ButtonType}
        linkNome={"Incluir Itens"}
        onButtonClickSalvar

        ButtonTypeCancelar={ButtonType}
        linkCancelar={"Fechar Pedido"}
        onButtonClickCancelar

        ButtonTypeCadastro={ButtonType}
        linkNomeModal={"Novo Pedido"}
        onButtonClickCadastro

      />
    </Fragment>
  )
}