import { Fragment } from "react";
import { FooterModal } from "../../../../Modais/FooterModal/footerModal";
import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal";
import { useCadastrarNcmImportacao } from "../hook/useCadastrarNcmImportacao";

export const FormularioImportar = ({
    handleClose,
    usuarioLogado,
    refetchNcmExcecao,
    optionsModulos
}) => {

    const {
        handleDragOver,
        handleDragLeave,
        handleDrop,
        arquivo,
        resultado,
        handleFileChange,
        dragging,
        inputRef,
        baixarModelo,
        prontoParaImportar,
        onImportarArquivo
    } = useCadastrarNcmImportacao({
        handleClose,
        usuarioLogado,
        refetchNcmExcecao,
        optionsModulos
    });

    const dropZoneClass = () => {

        if (dragging) return "drop-zone dragging";
        if (resultado?.erro) return "drop-zone error";
        if (arquivo) return "drop-zone has-file";
        return "drop-zone";
    };

    return (
        <Fragment>

            <div
                className={dropZoneClass()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (
                        e.key === "Enter" ||
                        e.key === " "
                    ) {

                        inputRef.current?.click();
                    }
                }}

                style={{
                    border: `2px dashed ${dragging
                            ? "#0d6efd"
                            : resultado?.erro
                                ? "#dc3545"
                                : arquivo
                                    ? "#198754"
                                    : "#ced4da"
                        }`,

                    borderRadius: "8px",
                    padding: "4rem",
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: dragging
                        ? "#e7f1ff"
                        : resultado?.erro
                            ? "#fff5f5"
                            : arquivo
                                ? "#f0fff4"
                                : "#f8f9fa",

                    transition: "all 0.2s ease",
                }}
            >

                <input
                    type="file"
                    accept=".csv,.xls,.xlsx"
                    ref={inputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                />

                {arquivo ? (
                    <>
                        <p className="mb-1 fw-semibold text-success">
                            {arquivo.name}
                        </p>

                        <p className="text-muted">
                            Clique ou arraste para substituir o arquivo
                        </p>
                    </>
                ) : (
                    <>
                        <h2 className="mb-1 fw-semibold">
                            Arraste o arquivo CSV,
                            XLS ou XLSX aqui
                        </h2>

                        <p className="text-muted">
                            ou clique para selecionar
                        </p>
                    </>
                )}

                {resultado?.erro && (
                    <p className="mt-2 mb-0 text-danger fw-semibold">
                        {resultado.erro}
                    </p>
                )}
            </div>

            <FooterModal
            
                ButtonTypeConfirmar={ButtonTypeModal}
                textButtonConfirmar={"Confirmar Importação"}
                onClickButtonConfirmar={onImportarArquivo}
                corConfirmar="success"
                styleConfirmar={prontoParaImportar == false ? { display: "none" } : {display: "block"}}
               
                ButtonTypeCadastrar={ButtonTypeModal}
                textButtonCadastrar={"Baixar modelo"}
                onClickButtonCadastrar={baixarModelo}
                corCadastrar="info"

                ButtonTypeFechar={ButtonTypeModal}
                textButtonFechar={"Fechar"}
                onClickButtonFechar={handleClose}
                corFechar="secondary"
            />
        </Fragment>
    );
};