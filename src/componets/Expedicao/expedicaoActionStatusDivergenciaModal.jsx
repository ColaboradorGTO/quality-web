import { Fragment, useState } from "react"
import { HeaderModal } from "../Modais/HeaderModal/HeaderModal"
import { InputFieldModal } from "../Buttons/InputFieldModal"
import Modal from 'react-bootstrap/Modal';
import { FooterModal } from "../Modais/FooterModal/footerModal";
import { ButtonTypeModal } from "../Buttons/ButtonTypeModal";
import { useForm } from "react-hook-form";
import AsyncSelect from 'react-select/async';
import { put } from "../../api/funcRequest";
import Swal from 'sweetalert2';

export const ExpedicaoActionStatusDivergenciaModal = ({ show, handleClose }) => {
  const { register, handleSubmit, errors } = useForm();
  const [descricao, setDescricao] = useState('')
  const [statusSelecionada, setStatusSelecionada] = useState(null)

  const alterarSD = async (data) => {
    let postData = {
      IDSTATUSDIVERGENCIA,
      DESCRICAODIVERGENCIA,
      STATIVO: statusSelecionada
    }

    const response = await put('/updateStatusDivergencia', postData)
      .then(response => {
        console.log(response, 'despesa cadastrada com sucesso front end!')
      })

    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: 'Atualizada com sucesso!',
      showConfirmButton: false,
      timer: 1500
    })

      .catch(error => {
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: 'Erro ao atualizar!',
          showConfirmButton: false,
          timer: 1500
        });

        console.log(error)
      })

  }

  const loadOptions = (inputValue, callback) => {
    setTimeout(() => {
      const options = [
        { value: 'Ativo', label: 'Ativo' },
        { value: 'Inativo', label: 'Inativo' }
      ];
      callback(options);
    }, 1000);
  };

  const handleChangeStatus = (e) => {
    const value = e.target.value;
    if (value === 'Ativo') {
      setStatusSelecionada(true);
    } else if (value === 'Inativo') {
      setStatusSelecionada(false);
    }
  };

  const handleChangeDescricao = (e) => {
    const value = e.target.value;
    if (value) {
      setDescricao(true);
    }
  };

  return (

    <Fragment>
      <Modal
        show={show}
        onHide={handleClose}
        size="xl"
      >
        <HeaderModal
          title="Status de Divergência"
          subTitle="Cadastrar ou Atualizar informações de Status de Divergência"
          handleClose={handleClose}
        />
        <Modal.Body>

          <form onSubmit >
            <div className="row" data-select2-id="736">
              <div className="col-sm-6 col-xl-6">
                <InputFieldModal
                  label={"Descrição"}
                  type="text"
                  value={descricao}
                  onChange={handleChangeDescricao}
                  placeholder={"OUTROS"}
                />
              </div>
              <div className="col-sm-6 col-xl-6" >
                <label htmlFor="">Status</label>
                <AsyncSelect
                  cacheOptions
                  loadOptions={loadOptions}
                  value={statusSelecionada}
                  onChange={handleChangeStatus}
                  defaultOptions
                  isSearchable
                />
              </div>
            </div>

          </form>

        </Modal.Body>

        <FooterModal
          ButtonTypeCadastrar={ButtonTypeModal}
          onClickButtonCadastrar
          textButtonCadastrar={"Atualizar"}

          ButtonTypeFechar={ButtonTypeModal}
          onClickButtonFechar={handleClose}
          textButtonFechar={"Fechar"}

        />

      </Modal>
    </Fragment>
  )
}