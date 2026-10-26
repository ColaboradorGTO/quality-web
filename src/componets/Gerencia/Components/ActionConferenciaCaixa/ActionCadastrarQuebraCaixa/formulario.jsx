import { Fragment } from "react"
import { HeaderModal } from "../../../../Modais/HeaderModal/HeaderModal";
import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal";
import { FooterModal } from "../../../../Modais/FooterModal/footerModal";
import { Controller, useForm } from "react-hook-form";
import { useCadastroQuebraCaixa } from "../hook/useCadastrarQuebraCaixa";
import FormField from "../../../../Formularios/FormField";
import { schema } from "./schemaCadastrarQuebraCaixa";
import { formatarMoeda } from "../../../../../utils/formatMoeda";

export const Formulario = ({ show, handleClose, dadosDetelheCaixa, usuarioLogado, optionsModulos, refetchCaixaMovimento }) => {
    const { handleSubmit, formState: { errors }, clearErrors, control, setError, register } = useForm({
        mode: "onChange"
    });
    const {
        onSubmit,
        empresa,
        setEmpresa,
        motivoAjuste,
        setMotivoAjuste,
        dataLancamento,
        dataAtualFormatada,
        setDataAtualFormatada,
        dinheiroInformado,
        setDinheiroInformado,
        dinheiroAjuste,
        setDinheiroAjuste,
        dadosQuebraCaixasModal,
        setDadosQuebraCaixasModal,
        modalVisivelImprimir,
        setModalVisivelImprimir,
        modalQuebraVisivel,
        setModalQuebraVisivel,
        dados,
        operador,
        setOperador,
        setDataLancamento,
        dataTableRef
    } = useCadastroQuebraCaixa({ show, handleClose, dadosDetelheCaixa, usuarioLogado, optionsModulos, refetchCaixaMovimento });

    const handleValidatedSubmit = async () => {
        try {

            const dadosParaValidar = {
                Empresa: usuarioLogado?.NOFANTASIA,
                operador: usuarioLogado?.NOFUNCIONARIO,
                historicoDigitado: motivoAjuste,
                dataLancamento: dados?.[0]?.DTHORAFECHAMENTOCAIXA,
                dinheiroInformado: dadosDetelheCaixa?.[0]?.TOTALFECHAMENTOVRQUEBRACAIXA,
                dinheiroAjuste: dinheiroAjuste
            };

            await schema.validate(dadosParaValidar, { abortEarly: false });
            await onSubmit();

        } catch (validationError) {
            console.error('❌ Erro de validação:', validationError);

            clearErrors();

            if (validationError.inner && validationError.inner.length > 0) {
                validationError.inner.forEach(error => {
                    if (error.path) {
                        setError(error.path, {
                            type: 'manual',
                            message: error.message
                        });
                    }
                });
            }

            const errorMessages = validationError.errors || [validationError.message];
            //console.log(`Erro de validação:\n${errorMessages.join('\n')}`);
        }
    };
    return (
        <Fragment>
            {modalQuebraVisivel && (
                <form onSubmit={handleSubmit(handleValidatedSubmit)} >

                    <div class="form-group">
                        <div class="row">

                            <div class="col-sm-6 col-xl-16">
                                <Controller
                                    name="Empresa"
                                    control={control}
                                    render={({ field }) => (
                                        <FormField
                                            label={"Empresa"}
                                            name="Empresa"
                                            type="text"
                                            readOnly={true}
                                            value={usuarioLogado?.NOFANTASIA}
                                            onChange={(e) => setEmpresa(e.target.value)}
                                            errors={errors}
                                            clearErrors={clearErrors}
                                        />
                                    )}
                                />
                            </div>
                            <div class="col-sm-6 col-xl-16">
                                <Controller
                                    name="operador"
                                    control={control}
                                    render={({ field }) => (
                                        <FormField
                                            label={"Operador do Caixa"}
                                            name="operador"
                                            type="text"
                                            readOnly={true}
                                            value={usuarioLogado?.NOFUNCIONARIO}
                                            onChange={(e) => setOperador(e.target.value)}
                                            errors={errors}
                                            clearErrors={clearErrors}
                                        />
                                    )}
                                />

                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="row">
                            <div class="col-sm-6 col-xl-12">
                                <Controller
                                    name="historicoDigitado"
                                    control={control}
                                    render={({ field }) => (
                                        <FormField
                                            label={"Histórico"}
                                            name="historicoDigitado"
                                            type="text"
                                            readOnly={false}
                                            value={motivoAjuste}
                                            onChange={(e) => setMotivoAjuste(e.target.value)}
                                            errors={errors}
                                            clearErrors={clearErrors}
                                        />
                                    )}
                                />
                            </div>

                        </div>
                    </div>
                    <div class="form-group">
                        <div class="row">

                            <div class="col-sm-6 col-xl-4">
                                <Controller
                                    name="dataLancamento"
                                    control={control}
                                    render={({ field }) => (
                                        <FormField
                                            label={"Data Lançamento"}
                                            name="dataLancamento"
                                            type="datetime"
                                            readOnly={true}
                                            value={dados[0]?.DTHORAFECHAMENTOCAIXA}
                                            onChange={(e) => setDataLancamento(e.target.value)}
                                            errors={errors}
                                            clearErrors={clearErrors}
                                        />
                                    )}
                                />
                            </div>
                            <div class="col-sm-6 col-xl-4">
                                <Controller
                                    name="dinheiroInformado"
                                    control={control}
                                    render={({ field }) => (
                                        <FormField
                                            label={"Valor Quebra Sistema"}
                                            name="dinheiroInformado"
                                            type="text"
                                            readOnly={true}
                                            value={dados[0]?.VrQuebraSistema}
                                            onChange={(e) => setDinheiroInformado(e.target.value)}
                                            errors={errors}
                                            clearErrors={clearErrors}
                                        />
                                    )}
                                />
                            </div>
                            <div class="col-sm-6 col-xl-4">
                                <Controller
                                    name="dinheiroAjuste"
                                    control={control}
                                    render={({ field }) => (
                                        <FormField
                                            label={"Valor Quebra Ajustado"}
                                            name="dinheiroAjuste"
                                            type="text"
                                            readOnly={true}
                                            value={dinheiroAjuste}
                                            onChange={(e) => setDinheiroAjuste(formatarMoeda(e.target.value))}
                                            errors={errors}
                                            clearErrors={clearErrors}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </form>
            )}

            {modalVisivelImprimir && dadosQuebraCaixasModal.map((item) => {

                if (usuarioLogado.id == item.IDFUNCIONARIO) {
                    return (
                        <Fragment>

                            <HeaderModal
                                title={"Impressão de Recibos"}
                                subTitle={"Imprimir Quebra de Caixa"}
                                handleClose={handleClose}
                            />

                            <div ref={dataTableRef}>
                                <div style={{ justifyContent: "center", }}>
                                    <div className="col-sm-12">
                                        <h3 style={{ textAlign: "center", marginBottom: "30px" }}>AUTORIZAÇÃO DE DESCONTO EM FOLHA DE PAGAMENTO POR QUEBRA DE CAIXA</h3>
                                    </div>
                                    <div className="col-sm-12" >
                                        <p style={{ fontSize: "13px" }}>
                                            Valor da Quebra:<b> R$ {item.VRQUEBRASISTEMA} - </b>Referente:<b>   {item.DSCAIXA}   - </b>Movimento:<b>  {item.IDMOVIMENTOCAIXA} </b>
                                        </p>
                                    </div>

                                    <div className="col-sm-12" >
                                        <p style={{ fontSize: "13px" }}>Pelo presente instrumento, Eu  ,<b> {item.NOMEOPERADOR}</b>, brasileiro(a), função {item.DSFUNCAO}, inscrito(a) no CPF sob o nº <p> <b> {item.CPFOPERADOR} </b>,</p>
                                            colaborador(a) da empresa GTO COM. ATAC. DE CONFEC. E CALÇ. LTDA., inscrita no CNPJ nº.<b>  {item.NUCNPJ} </b>, com sede na {item.EENDERECO} - {item.EBAIRRO} - {item.ECIDADE} - {item.SGUF},
                                            <b>AUTORIZO</b> a empresa a efetuar o desconto até o limite total do meu adicional de quebra de caixa, em meu salário, através da folha de pagamento, dos valores faltantes no meu caixa, seguindo assim os ditames legais do Art. 462, §1º da CLT e CCT vigentes.</p>
                                    </div>

                                    <div className="col-sm-12" ><p style={{ fontSize: "13px" }}> Motivo: <b style={{ textTransform: 'uppercase' }}>{item.TXTHISTORICO}</b>  </p></div>

                                    <div className="col-sm-12"><p style={{ fontSize: "13px" }}> Brasília, <b> {dataAtualFormatada} </b>. </p> </div>
                                    <div style={{ textAlign: "center" }} >
                                        <div className="col-sm-12" >--------------------------------------------------------------------------------------------------------------------</div>
                                        <div className="col-sm-12" ><p style={{ fontSize: "13px" }}> {item.NOMEOPERADOR} - CPF: {item.CPFOPERADOR}  </p> </div>

                                        <div className="col-sm-12">--------------------------------------------------------------------------------------------------------------------</div>
                                        <div className="col-sm-12" > <p style={{ fontSize: "13px" }}>{item.NOFANTASIA} - {item.NOMEGERENTE} </p></div>

                                    </div>
                                </div>
                            </div>

                        </Fragment>
                    )
                } else {
                    return (
                        <Fragment>
                            <HeaderModal
                                title={"Impressão de Recibos"}
                                subTitle={"Imprimir Desconto em Folha"}
                                handleClose={handleClose}
                            />
                            <div ref={dataTableRef}>
                                <div style={{ justifyContent: "center", }}>
                                    <div className="col-sm-12">
                                        <h3 style={{ textAlign: "center", marginBottom: "30px" }}>DESCONTO AUTORIZADO EM FOLHA DE PAGAMENTO</h3>
                                    </div>
                                    <div className="col-sm-12" >
                                        <p style={{ fontSize: "13px" }}>
                                            Valor da Quebra:<b> R$ {item.VRQUEBRASISTEMA} - </b>Referente:<b>   {item.DSCAIXA}   - </b>Movimento:<b>  {item.IDMOVIMENTOCAIXA} </b>
                                        </p>
                                    </div>

                                    <div className="col-sm-12" >
                                        <p style={{ fontSize: "13px" }}>Pelo presente instrumento, Eu  ,<b> {item.NOMEOPERADOR}</b>, brasileiro(a), função {item.DSFUNCAO}, inscrito(a) no CPF sob o nº <p> <b> {item.CPFOPERADOR} </b>,</p>
                                            colaborador(a) da empresa GTO COM. ATAC. DE CONFEC. E CALÇ. LTDA., inscrita no CNPJ nº.<b>  {item.NUCNPJ} </b>, com sede na {item.EENDERECO} - {item.EBAIRRO} - {item.ECIDADE} - {item.SGUF},
                                            <b> AUTORIZO </b> a empresa a efetuar o desconto acima especificado em meu salário, através da folha de pagamento.</p>
                                    </div>

                                    <div className="col-sm-12" ><p style={{ fontSize: "13px" }}> Motivo: <b style={{ textTransform: 'uppercase' }}>{item.TXTHISTORICO}</b>  </p></div>

                                    <div className="col-sm-12"><p style={{ fontSize: "13px" }}> Brasília, <b> {dataAtualFormatada} </b>. </p> </div>
                                    <div style={{ textAlign: "center" }} >
                                        <div className="col-sm-12" >--------------------------------------------------------------------------------------------------------------------</div>
                                        <div className="col-sm-12" ><p style={{ fontSize: "13px" }}> {item.NOMEOPERADOR} - CPF: {item.CPFOPERADOR}  </p> </div>

                                        <div className="col-sm-12">--------------------------------------------------------------------------------------------------------------------</div>
                                        <div className="col-sm-12" > <p style={{ fontSize: "13px" }}>{item.NOFANTASIA} - {item.NOMEGERENTE} </p></div>

                                    </div>
                                </div>
                            </div>

                        </Fragment>
                    )
                }
            })}

            <FooterModal
                ButtonTypeCadastrar={ButtonTypeModal}
                onClickButtonCadastrar={handleSubmit(handleValidatedSubmit)}
                tipoBtnCadastrar={"submit"}
                textButtonCadastrar={"Cadastrar Quebra Caixa"}
                corCadastrar="success"
                autoLoadingCadastrar={true}
                loadingTextCadastrar={"Cadastrando..."}

                ButtonTypeFechar={ButtonTypeModal}
                textButtonFechar={"Fechar"}
                onClickButtonFechar={handleClose}
                corFechar="secondary"
            />
        </Fragment>
    )
}