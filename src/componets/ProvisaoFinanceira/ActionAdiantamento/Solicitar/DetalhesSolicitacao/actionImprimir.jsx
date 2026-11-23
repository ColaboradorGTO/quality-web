import { Fragment } from "react";
import { useEditarAdiantamento } from "../hooks/useEditarAdiantamento";
import { formatMoeda } from "../../../../../utils/formatMoeda";
import { mascaraCNPJ } from "../../../../../utils/mascaraCNPJ";
import { dataFormatada } from "../../../../../utils/dataFormatada";


export const ActionImprimir = ({ dadosDetalheAdiantamento, dataTableRef }) => {

    const {
        departamento,
        dataSolicitacao,
        razaoSocial,
        cnpj,
        possuiNota,
        cnpjFaturado,
        vrAdiantamento,
        descricao,
        empresaSelecionada,
        razaoSocialFaturamento,
        proposta,
        tipoBeneficiario,
        cpfBeneficiario,
        nomeBeneficiario,
        rgBeneficiario,
        emailBeneficiario,
        cepBeneficiario,
        enderecoBeneficiario,
        telefoneBeneficiario,
        dtNascimentoBeneficiario,
        tipoDespesa,
        nomeFavorecido,
        formaPagamento,
        chavePix,
        banco,
        agencia,
        conta,
        digitoConta,
        unidadeNegocio,
        centroCusto,
        dtPagamento,
    } = useEditarAdiantamento({ dadosDetalheAdiantamento });

    const estiloTitulo = { marginTop: "15px", marginBottom: "5px", fontSize: '22px' };
    const estiloLinha = { margin: "0px 0px 4px 0px", fontSize: '16px' };

    return (
        <Fragment>

            <div ref={dataTableRef} style={{ padding: "20px", color: "#000" }}>

                <h3 style={{ textAlign: "center", marginBottom: "15px" }}>Solicitação de Pagamento</h3>

                <h4 style={estiloTitulo}>Solicitante</h4>
                <hr style={{ marginTop: "0px" }} />
                <p style={estiloLinha}><b>Nome e Matrícula:</b> {dadosDetalheAdiantamento[0]?.NOMESOLICITANTE || ""} - {dadosDetalheAdiantamento[0]?.MATRICULASOLICITANTE || ""}</p>
                <p style={estiloLinha}><b>Departamento:</b> {departamento}</p>
                <p style={estiloLinha}><b>Data:</b> {dataFormatada(dataSolicitacao)}</p>

                <h4 style={estiloTitulo}>Filial a ser Faturada</h4>
                <hr style={{ marginTop: "0px" }} />
                <p style={estiloLinha}><b>Filial a ser faturada (GTO):</b> {empresaSelecionada?.label}</p>
                <p style={estiloLinha}><b>CNPJ a ser faturado:</b> {mascaraCNPJ(cnpj)}</p>
                <p style={estiloLinha}><b>Razão Social:</b> {razaoSocial}</p>

                <h4 style={estiloTitulo}>Dados do Beneficiário</h4>
                <hr style={{ marginTop: "0px" }} />
                <p style={estiloLinha}><b>Tipo de Beneficiário:</b> {tipoBeneficiario?.label}</p>
                <p style={estiloLinha}><b>CNPJ:</b> {cnpjFaturado}</p>
                <p style={estiloLinha}><b>Razão Social:</b> {razaoSocialFaturamento}</p>
                <p style={estiloLinha}><b>CPF:</b> {cpfBeneficiario}</p>
                <p style={estiloLinha}><b>Nome Completo:</b> {nomeBeneficiario}</p>
                <p style={estiloLinha}><b>RG / Identidade:</b> {rgBeneficiario}</p>
                <p style={estiloLinha}><b>Data de Nascimento:</b> {dataFormatada(dtNascimentoBeneficiario)}</p>
                <p style={estiloLinha}><b>Telefone:</b> {telefoneBeneficiario}</p>
                <p style={estiloLinha}><b>E-mail:</b> {emailBeneficiario}</p>
                <p style={estiloLinha}><b>CEP:</b> {cepBeneficiario}</p>
                <p style={estiloLinha}><b>Endereço:</b> {enderecoBeneficiario}</p>

                <h4 style={estiloTitulo}>Dados do Pagamento</h4>
                <hr style={{ marginTop: "0px" }} />
                <p style={estiloLinha}><b>Tipo de Despesa:</b> {tipoDespesa?.label}</p>
                <p style={estiloLinha}><b>Nome do Beneficiário:</b> {nomeFavorecido}</p>
                <p style={estiloLinha}><b>Forma de Pagamento:</b> {formaPagamento?.label}</p>
                <p style={estiloLinha}><b>Data para Pagamento:</b> {dataFormatada(dtPagamento)}</p>
                <p style={estiloLinha}><b>Chave PIX:</b> {chavePix}</p>
                <p style={estiloLinha}><b>Banco:</b> {banco?.label}</p>
                <p style={estiloLinha}><b>Agência:</b> {agencia}</p>
                <p style={estiloLinha}><b>Conta:</b> {conta}</p>
                <p style={estiloLinha}><b>Dígito da Conta:</b> {digitoConta}</p>
                <p style={estiloLinha}><b>Valor a ser Pago:</b> {formatMoeda(vrAdiantamento)}</p>
                <p style={estiloLinha}><b>Unidade de Negócio:</b> {unidadeNegocio}</p>
                <p style={estiloLinha}><b>Centro de Custo:</b> {centroCusto}</p>
                <p style={estiloLinha}><b>Descrição do Produto ou Serviço:</b> {descricao}</p>
                <p style={estiloLinha}><b>Possui Nota Fiscal:</b> {possuiNota?.label}</p>
                <p style={estiloLinha}><b>Orçamento / Proposta:</b> {proposta}</p>

            </div>

        </Fragment>
    );
};
