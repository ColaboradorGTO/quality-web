import { Fragment } from "react"
import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal"
import { FooterModal } from "../../../../Modais/FooterModal/footerModal"
import { InputFieldModal } from "../../../../Buttons/InputFieldModal"
import { useCreateAjusteExtrato } from "../hooks/useCreateAjusteExtrato"
import { useForm } from "react-hook-form"

export const Formulario = ({ 
    show, 
    handleClose, 
    optionsModulos, 
    usuarioLogado, 
    empresaSelecionada,
    handleClick 
}) => {
    const { register, handleSubmit, errors } = useForm();
    const  {
        dataMovimento,
        horaMovimento,
        dsHistorico,
        vrDebito,
        vrCredito,
        setVrDebito,
        setVrCredito,
        setDsHistorico,
        setDataMovimento,
        setHoraMovimento,
        submit,
    } = useCreateAjusteExtrato({ show, handleClose, optionsModulos, usuarioLogado, empresaSelecionada, handleClick })
    return (
        <Fragment>
            <form onSubmit={handleSubmit(submit)}>


                <div class="form-group">
                    <div className="row">

                        <div class="col-sm-6 col-xl-6">
                            <InputFieldModal
                                className="form-control input"
                                readOnly={true}
                                label="Empresa"
                                value={empresaSelecionada}
                                // onChangeModal={(e) => setEmpresa(e.target.value)}
                            />

                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <div class="row">
                        <div class="col-sm-6 col-xl-6">

                            <InputFieldModal
                                type="date"
                                className="form-control input"
                                readOnly={true}
                                label="Data Depósito"
                                value={dataMovimento}
                                onChangeModal={(e) => setDataMovimento(e.target.value)}
                            />
                        </div>
                        <div class="col-sm-6 col-xl-4">
                            <InputFieldModal
                                type="time-local"
                                className="form-control input"
                                readOnly={true}
                                label="Hora Depósito"
                                value={horaMovimento}
                                onChangeModal={(e) => setHoraMovimento(e.target.value)}
                            />
                        </div>

                    </div>
                </div>
                <div class="form-group">
                    <div class="row">
                        <div class="col-sm-6 col-xl-4">

                            <InputFieldModal
                                type="text"
                                className="form-control input"

                                label="Histórico"
                                value={dsHistorico}
                                onChangeModal={(e) => setDsHistorico(e.target.value)}
                            />
                        </div>
                        <div class="col-sm-6 col-xl-4">
                            <InputFieldModal
                                type="text"
                                className="form-control input"
                                placeholder={"R$ 0,00"}
                                label="Valor Crédito"
                                value={vrCredito}
                                onChangeModal={(e) => setVrCredito(e.target.value)}
                            />
                        </div>
                        <div class="col-sm-6 col-xl-4">
                            <InputFieldModal
                                type="text"
                                className="form-control input"
                                label="Valor Débito"
                                placeholder={"R$ 0,00"}
                                value={vrDebito}
                                onChangeModal={(e) => setVrDebito(e.target.value)}
                            />
                        </div>

                    </div>
                </div>


                <FooterModal
                    ButtonTypeFechar={ButtonTypeModal}
                    onClickButtonFechar={handleClose}
                    textButtonFechar={"Fechar"}
                    corFechar={"secondary"}

                    ButtonTypeCadastrar={ButtonTypeModal}
                    onClickButtonCadastrar={submit}
                    textButtonCadastrar={"Cadastrar Ajuste"}
                    corCadastrar={"success"}
                />

            </form>
        </Fragment>
    )
}