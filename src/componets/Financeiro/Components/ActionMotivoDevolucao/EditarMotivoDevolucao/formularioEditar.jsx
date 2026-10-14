import { Fragment } from "react"
import { InputFieldModal } from "../../../../Buttons/InputFieldModal"
import Select from 'react-select';
import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal";
import { FooterModal } from "../../../../Modais/FooterModal/footerModal";
import { useEditarMotivoDevolucao } from "../hooks/useEditarMotivoDevolucao";
import { useForm } from "react-hook-form";

export const FomularioEditar = ({ dadosDetalheMotivoDevolucao, optionsModulos, usuarioLogado, handleClose, handleClick }) => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const {
        statusSelecionado,
        setStatusSelecionado,
        dataCriacao,
        setDataCriacao,
        horaAlteracao,
        setHoraAlteracao,
        idMotivo,
        setIdMotivo,
        motivo,
        setMotivo,
        onSubmit,
        optionsStatus
    } = useEditarMotivoDevolucao({ dadosDetalheMotivoDevolucao, optionsModulos, usuarioLogado, handleClick, handleClose })

    return (
        <Fragment>
            <form onSubmit={handleSubmit(onSubmit)}>

                <div className="form-group">
                    <div className="row">
                        <div className="col-sm-6 col-xl-6">
                            <InputFieldModal
                                label={"Data e Hora Criação"}
                                type="text"
                                readOnly={true}
                                value={dataCriacao}
                                onChangeModal={(e) => setDataCriacao(e.target.value)}

                            />
                        </div>
                        <div className="col-sm-6 col-xl-6">
                            <InputFieldModal
                                label={"Data e Hora Alteração"}
                                type="text"
                                readOnly={true}
                                value={horaAlteracao}
                            />
                        </div>

                    </div>
                    <div className="row mt-4">

                        <div className="col-sm-6 col-xl-6">

                            <label> Status Motivo </label>
                            <Select
                                options={optionsStatus.map((item) => {
                                    return {

                                        value: item.value,
                                        label: item.label
                                    }
                                })}
                                value={optionsStatus.find(option => option.value === statusSelecionado.value)}
                                onChange={(option) => setStatusSelecionado(option.value)}
                            />
                        </div>
                        <div className="col-sm-4 col-xl-4">
                            <InputFieldModal
                                label={"ID Motivo"}
                                type="text"
                                readOnly={true}
                                value={idMotivo}
                            />

                        </div>

                    </div>
                    <div className="row mt-4">
                        <div className="col-sm-6 col-xl-6">
                            <InputFieldModal
                                label={"Motivo Devolução"}
                                type="text"
                                value={motivo}
                                onChangeModal={(e) => setMotivo(e.target.value)}
                            // {...register("motivo", { required: true, minLength: 8 })}
                            />
                            {/* {errors.motivo && <span className="text-danger">Motivo de Devolução deve ter no mínimo 8 caracteres!</span>} */}
                        </div>

                    </div>
                </div>
                <FooterModal
                    ButtonTypeCadastrar={ButtonTypeModal}
                    onClickButtonCadastrar={handleSubmit(onSubmit)}
                    textButtonCadastrar={"Atualizar"}
                    corCadastrar={"success"}

                    ButtonTypeFechar={ButtonTypeModal}
                    onClickButtonFechar={handleClose}
                    textButtonFechar={"Cancelar e Fechar"}
                    corFechar={"secondary"}
                />
            </form>
        </Fragment>
    )
}