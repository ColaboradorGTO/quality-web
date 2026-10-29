import { Fragment } from "react"
import { Controller, useForm } from "react-hook-form";
import Select from 'react-select';
import { FooterModal } from "../../../../Modais/FooterModal/footerModal";
import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal";
import { AlertError } from "../../../../Inputs/alertError"
import FormField from "../../../../Formularios/FormField";
import { useCadastrarNcmExcecao } from "../hook/useCadastrarNcmExcecao";
import { schema } from "./SchemaCadastrarNCM";

export const FormularioCadastrar = ({ handleClose, usuarioLogado, optionsModulos, refetchNcmExcecao }) => {
    const { handleSubmit, formState: { errors }, clearErrors, control, setError, setValue } = useForm({
        mode: "onChange"
    });

    const {
        IdNcmExcecao,
        setIdNcmExcecao,
        NcmNumero,
        setNcmNumero,
        Ex,
        setEx,
        Tipo,
        setTipo,
        Descricao,
        setDescricao,
        ImpNacional,
        setImpNacional,
        ImpImportacaoFederal,
        setImpImportacaoFederal,
        ImpEstadual,
        setImpEstadual,
        ImpMunicipal,
        setImpMunicipal,
        DtInicioVigencia,
        setDtInicioVigencia,
        DtFimVigencia,
        setDtFimVigencia,
        PwChave,
        setPwChave,
        NuVersao,
        setNuVersao,
        Fonte,
        setFonte,
        SgUf,
        setSgUf,
        PercIbpt,
        setPercIbpt,
        setIpUsuario,
        onSubmit,
    } = useCadastrarNcmExcecao({ handleClose, usuarioLogado, optionsModulos, refetchNcmExcecao });


    const uf = [
        { value: 'DF', label: 'DF' },
        { value: 'GO', label: 'GO' },
        { value: 'MG', label: 'MG' },
    ]

    const handleValidatedSubmit = async () => {
        try {
            const dadosParaValidar = {
                numNcmExcecao: NcmNumero,
                ex: Ex,
                tipo: Tipo,
                DsNcm: Descricao,
                impNacional: ImpNacional,
                ImpImportacaoFederal: ImpImportacaoFederal,
                ImpEstadual: ImpEstadual,
                impMunicipal: ImpMunicipal,
                InicioVigencia: DtInicioVigencia,
                FimVigencia: DtFimVigencia,
                chave: PwChave,
                numVersao: NuVersao,
                fonte: Fonte,
                uf: SgUf,
                PERCIBPT: PercIbpt,

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
            console.log(`Erro de validação:\n${errorMessages.join('\n')}`);
        }
    }

    return (
        <Fragment>
            <form onSubmit={handleSubmit(handleValidatedSubmit)}>
                <div className="row">

                    <div className="col-sm-4 col-xl-6">

                        <Controller
                            name="numNcmExcecao"
                            control={control}
                            render={({ field }) => (
                                <FormField
                                    name="numNcmExcecao"
                                    label={"Número NCM"}
                                    type="text"
                                    errors={errors}
                                    clearErrors={clearErrors}
                                    value={NcmNumero}
                                    onChange={(e) => setNcmNumero(e.target.value)}
                                />
                            )}
                        />
                    </div>

                    <div className="col-sm-4 col-xl-2">
                        <Controller
                            name="ex"
                            control={control}
                            render={({ field }) => (
                                <FormField
                                    name="ex"
                                    label={"EX"}
                                    type="text"
                                    errors={errors}
                                    clearErrors={clearErrors}
                                    value={Ex}
                                    onChange={(e) => setEx(e.target.value)}
                                />
                            )}
                        />
                    </div>

                    <div className="col-sm-4 col-xl-4">
                        <Controller
                            name="tipo"
                            control={control}
                            render={({ field }) => (
                                <FormField
                                    name="tipo"
                                    label={"Tipo"}
                                    type="text"
                                    errors={errors}
                                    clearErrors={clearErrors}
                                    value={Tipo}
                                    onChange={(e) => setTipo(e.target.value)}
                                />
                            )}
                        />
                    </div>

                </div>

                <div className="row mt-3">
                    <div className="col-sm-4 col-xl-4">
                        <Controller
                            name="dscNcmExcecao"
                            control={control}
                            render={({ field }) => (
                                <FormField
                                    name="DsNcm"
                                    label={"Descrição NCM "}
                                    type="text"
                                    errors={errors}
                                    clearErrors={clearErrors}
                                    value={Descricao}
                                    onChange={(e) => setDescricao(e.target.value)}
                                />
                            )}
                        />
                    </div>

                    <div className="col-sm-4 col-xl-4">
                        <Controller
                            name="impNacional"
                            control={control}
                            render={({ field }) => (
                                <FormField
                                    name="impNacional"
                                    label={"Imposto Nacional"}
                                    type="text"
                                    errors={errors}
                                    clearErrors={clearErrors}
                                    value={ImpNacional}
                                    onChange={(e) => setImpNacional(e.target.value)}
                                />
                            )}
                        />
                    </div>

                    <div className="col-sm-4 col-xl-4">
                        <Controller
                            name="ImpImportacaoFederal"
                            control={control}
                            render={({ field }) => (
                                <FormField
                                    name="ImpImportacaoFederal"
                                    label={"Imposto Importação Federal"}
                                    type="text"
                                    errors={errors}
                                    clearErrors={clearErrors}
                                    value={ImpImportacaoFederal}
                                    onChange={(e) => setImpImportacaoFederal(e.target.value)}
                                />
                            )}
                        />
                    </div>
                </div>

                <div className="row mt-3">
                    <div className="col-sm-4 col-xl-4">
                        <Controller
                            name="ImpEstadual"
                            control={control}
                            render={({ field }) => (
                                <FormField
                                    name="ImpEstadual"
                                    label={"Imposto Estadual"}
                                    type="text"
                                    errors={errors}
                                    clearErrors={clearErrors}
                                    value={ImpEstadual}
                                    onChange={(e) => setImpEstadual(e.target.value)}
                                />
                            )}
                        />
                    </div>

                    <div className="col-sm-4 col-xl-4">
                        <Controller
                            name="impMunicipal"
                            control={control}
                            render={({ field }) => (
                                <FormField
                                    name="impMunicipal"
                                    label={"Imposto Municipal"}
                                    type="text"
                                    errors={errors}
                                    clearErrors={clearErrors}
                                    value={ImpMunicipal}
                                    onChange={(e) => setImpMunicipal(e.target.value)}
                                />
                            )}
                        />
                    </div>

                    <div className="col-sm-4 col-xl-4">
                        <Controller
                            name="InicioVigencia"
                            control={control}
                            render={({ field }) => (
                                <FormField
                                    name="InicioVigencia"
                                    label={"inicio da vigência"}
                                    type="date"
                                    errors={errors}
                                    clearErrors={clearErrors}
                                    value={DtInicioVigencia}
                                    onChange={(e) => setDtInicioVigencia(e.target.value)}
                                />
                            )}
                        />
                    </div>

                </div>

                <div className="row mt-3">
                    <div className="col-sm-4 col-xl-4">
                        <Controller
                            name="FimVigencia"
                            control={control}
                            render={({ field }) => (
                                <FormField
                                    name="FimVigencia"
                                    label={"Fim da vigência"}
                                    type="date"
                                    errors={errors}
                                    clearErrors={clearErrors}
                                    value={DtFimVigencia}
                                    onChange={(e) => setDtFimVigencia(e.target.value)}
                                />
                            )}
                        />
                    </div>

                    <div className="col-sm-4 col-xl-4">
                        <Controller
                            name="chave"
                            control={control}
                            render={({ field }) => (
                                <FormField
                                    name="chave"
                                    label={"Chave"}
                                    type="text"
                                    errors={errors}
                                    clearErrors={clearErrors}
                                    value={PwChave}
                                    onChange={(e) => setPwChave(e.target.value)}
                                />
                            )}
                        />
                    </div>

                    <div className="col-sm-4 col-xl-4">
                        <Controller
                            name="numVersao"
                            control={control}
                            render={({ field }) => (
                                <FormField
                                    name="numVersao"
                                    label={"Número Versão"}
                                    type="text"
                                    errors={errors}
                                    clearErrors={clearErrors}
                                    value={NuVersao}
                                    onChange={(e) => setNuVersao(e.target.value)}
                                />
                            )}
                        />
                    </div>
                </div>

                <div className="row mt-3">
                    <div className="col-sm-4 col-xl-5">
                        <Controller
                            name="fonte"
                            control={control}
                            render={({ field }) => (
                                <FormField
                                    name="fonte"
                                    label={"Fonte"}
                                    type="text"
                                    errors={errors}
                                    clearErrors={clearErrors}
                                    value={Fonte}
                                    onChange={(e) => setFonte(e.target.value)}
                                />
                            )}
                        />
                    </div>

                    <div className="col-sm-4 col-xl-3">
                        <label className="form-label" htmlFor="UF">UF</label>
                        <Select
                            className="basic-single"
                            classNamePrefix={"select"}
                            name="uf"
                            options={uf.map((item) => ({
                                value: item.value,
                                label: item.label
                            }))}
                            value={SgUf}
                            onChange={(selected) => {
                                setSgUf(selected)
                                clearErrors("uf");
                            }}
                            isClearable={true}
                            isSearchable={true}
                        />

                        {errors.uf && (
                            <AlertError
                                error={errors.uf}
                                onClose={clearErrors}
                                fieldName="uf"
                            />
                        )}
                    </div>

                    <div className="col-sm-4 col-xl-4">
                        <Controller
                            name="PERCIBPT"
                            control={control}
                            render={({ field }) => (
                                <FormField
                                    name="PERCIBPT"
                                    label={"PERCIBPT"}
                                    type="text"
                                    errors={errors}
                                    clearErrors={clearErrors}
                                    value={PercIbpt}
                                    onChange={(e) => setPercIbpt(e.target.value)}
                                />
                            )}
                        />
                    </div>
                </div>

                <FooterModal
                    ButtonTypeFechar={ButtonTypeModal}
                    textButtonFechar={"Fechar"}
                    onClickButtonFechar={handleClose}
                    corFechar="secondary"

                    ButtonTypeConfirmar={ButtonTypeModal}
                    textButtonConfirmar={"Cadastrar"}
                    onClickButtonConfirmar={handleSubmit(handleValidatedSubmit)}
                    corConfirmar="success"
                    autoLoadingConfirmar={true}
                    loadingTextConfirmar={"Cadastrando..."}
                />
            </form>
        </Fragment>
    )
}