import { Fragment } from "react"
import Select from 'react-select';
import { InputFieldModal } from "../../../../Buttons/InputFieldModal";
import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal";
import { useEditarVinculoFabricanteFornecedor } from "../hooks/useEditarViculoFabricanteFornecedor";
import { FooterModal } from "../../../../Modais/FooterModal/footerModal";


export const FormularioEditar = ({
    handleClose, 
    dadosDetalheFornecedorFabricante,
    usuarioLogado,
    optionsModulos,
    handleClick
}) => {
    const {
        statusSelecionado,
        fabricante,
        fornecedorSelecionado,
        setFornecedorSelecionado,
        optionsStatus,
        setStatusSelecionado,
        setFabricante,
        dadosFabricantes,
        handleEditar,
    } = useEditarVinculoFabricanteFornecedor({dadosDetalheFornecedorFabricante, usuarioLogado, optionsModulos, handleClick, handleClose});

    return (
        <Fragment>
            <form onSubmit={handleEditar}>
                <div className="form-group">
                    <div className="row">

                        <div className="col-sm-6 col-lg-4 col-xl-4">

                            <InputFieldModal
                                label={"Fornecedor *"}
                                type={"text"}
                                nome={"nomeFabricante"}
                                readOnly={true}
                                value={fabricante}
                                onChangeModal={(e) => setFabricante(e.target.value)}
                            />
                          
                        </div>
                        <div className="col-sm-6 col-lg-4 col-xl-4">
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
                        <div className="col-sm-6 col-lg-4 col-xl-4">
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
                    <div className="row">

                    </div>
                </div>

            </form>

            <FooterModal
                ButtonTypeFechar={ButtonTypeModal}
                onClickButtonFechar={handleClose}
                textButtonFechar={"Fechar"}
                corFechar={"secondary"}

                ButtonTypeCadastrar={ButtonTypeModal}
                onClickButtonCadastrar={handleEditar}
                textButtonCadastrar={"Salvar"}
                corCadastrar={"success"}
                loadingTextCadastrar={"Cadastrando..."}
                autoLoadingCadastrar={true}
            />
        </Fragment>
    )
}