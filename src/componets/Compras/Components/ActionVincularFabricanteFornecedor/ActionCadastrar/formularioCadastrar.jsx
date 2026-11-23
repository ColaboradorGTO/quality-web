import { Fragment } from "react"
import { FooterModal } from "../../../../../Modais/FooterModal/footerModal"
import Select from 'react-select';
import { InputFieldModal } from "../../../../Buttons/InputFieldModal";
import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal";
import { useCadastrarVinculoFabricanteFornecedor } from "../hooks/useCadastrarViculoFabricanteFornecedor";


export const FormularioCadastrar = ({handleClose}) => {
    const {
        statusSelecionado,
        fabricanteSelecionado,
        fornecedorSelecionado,
        setFabricanteSelecionado,
        setFornecedorSelecionado,
        optionsStatus,
        setStatusSelecionado,
        dadosFabricantes,
        handleCadastrar
    } = useCadastrarVinculoFabricanteFornecedor()
    return (
        <Fragment>
               <form onSubmit={handleCadastrar}>
                <div className="form-group">
                    <div className="row">

                        <div className="col-sm-6 col-xl-4">

                            <InputFieldModal
                                label={"Fornecedor *"}
                                type={"text"}
                                nome={"nomeFabricante"}
                                readOnly={true}
                                value={fabricanteSelecionado}
                                onChangeModal={(e) => setFabricanteSelecionado(e.target.value)}
                            />
                          
                        </div>
                        <div className="col-sm-6 col-xl-6">
                            <label htmlFor="fornecedor">Fornecedor *</label>
                            <Select
                                className="basic-single"
                                classNamePrefix="select"
                                options={dadosFabricantes.map((item) => {
                                    return {
                                        value: item.IDFORNECEDOR,
                                        label: `${item.IDFABRICANTE} - ${item.DSFABRICANTE}`
                                    }
                                })}
                                value={fornecedorSelecionado}
                                onChange={(e) => setFornecedorSelecionado(e)}
                            />

                        </div>
                        <div className="col-sm-6 col-xl-2">
                            <label htmlFor="situacao">Situação *</label>
                            <Select
                                options={optionsStatus.map((item) => {
                                    return {
                                        value: item.value,
                                        label: item.label
                                    }
                                })}
                                value={statusSelecionado}
                                onChange={(e) => setStatusSelecionado(e)}
                            />
                          
                        </div>
                    </div>
                </div>

            </form>

            <FooterModal
                ButtonTypeFechar={ButtonTypeModal}
                onClickButtonFechar={handleClose}
                textButtonFechar={"Fechar"}
                corFechar={"secondary"}

                ButtonTypeCadastrar={ButtonTypeModal}
                onClickButtonCadastrar={handleCadastrar}
                textButtonCadastrar={"Salvar"}
                corCadastrar={"success"}
                loadingTextCadastrar={"Cadastrando..."}
                autoLoadingCadastrar={true}
            />
        </Fragment>
    )
}