import React, { useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';
import { ProgressBar } from 'primereact/progressbar';
import { Tooltip } from 'primereact/tooltip';
import { Tag } from 'primereact/tag';
import { FaRegImages } from 'react-icons/fa';
import { AiOutlineCloseCircle, AiOutlineCloudUpload } from 'react-icons/ai';
import { Button } from 'primereact/button';

export const ActionCarregaImagem = ({
  selectedImage,   
  setSelectedImage,
  codImgProd,
  setCodImgProd,
  currentFile,
  setCurrentFile
}) => {
  const toast = useRef(null);
  const [totalSize, setTotalSize] = useState(0);
  const fileUploadRef = useRef(null);


  const encodeImageFileAsURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = function () {
        const imageBase64Stringsep = reader.result;
        
        const arquivo = file.name;
        const split = arquivo.split('.');
        const extensao = split[split.length - 1];
        const nome = arquivo.replace('.' + extensao, '');
        const tamanho = (file.size / 1024).toFixed(2);
        const tamanhomax = 2000;

        if (tamanho > tamanhomax) {
          toast.current.show({
            severity: 'error',
            summary: 'Erro',
            detail: 'Tamanho da Imagem excede a 2 Mb!',
            life: 2000
          });

          setSelectedImage(null);
          setCodImgProd('');
          setCurrentFile(null);
          fileUploadRef.current.clear();
          
          reject(new Error('Tamanho excedido'));
          return;
        } else {
          const base64String = reader.result.replace("data:", "").replace(/^.+,/, "");
          
          setSelectedImage(imageBase64Stringsep);
          setCodImgProd(imageBase64Stringsep);
          setCurrentFile(file);
          
          resolve({
            imageBase64: imageBase64Stringsep,
            base64String: base64String,
            nome: nome,
            extensao: extensao,
            tamanho: tamanho
          });
        }
      };

      reader.onerror = function (error) {
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  };

  const onTemplateSelect = async (e) => {
    let files = e.files;

    // Verificar se já existe uma imagem e mostrar aviso
    if (selectedImage && files.length > 0) {
      toast.current.show({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Remova a imagem atual antes de adicionar outra',
        life: 3000
      });
      
      // Limpar a seleção atual do FileUpload
      fileUploadRef.current.clear();
      return;
    }

    // Processar a primeira imagem selecionada
    if (files.length > 0) {
      try {
        const file = files[0];
        setTotalSize(file.size || 0);
        
        const result = await encodeImageFileAsURL(file);
        console.log('Imagem processada:', result);
        
        toast.current.show({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Imagem carregada com sucesso!',
          life: 2000
        });
      } catch (error) {
        console.error('Erro ao processar imagem:', error);
      }
    }
  };

  const onTemplateUpload = (e) => {
    toast.current.show({ 
      severity: 'success', 
      summary: 'Sucesso', 
      detail: 'Imagem Carregada com Sucesso!' 
    });
  };

  const onTemplateRemove = (file, callback) => {
    setTotalSize(0);
    setSelectedImage(null);
    setCodImgProd('');
    setCurrentFile(null);
    callback();
    
    toast.current.show({
      severity: 'info',
      summary: 'Info',
      detail: 'Imagem removida',
      life: 2000
    });
  };

  const onTemplateClear = () => {
    setTotalSize(0);
    setSelectedImage(null);
    setCodImgProd('');
    setCurrentFile(null);
  };

  const customBeforeUpload = () => {
    // Impedir upload automático se já existir uma imagem
    if (selectedImage) {
      toast.current.show({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Remova a imagem atual antes de adicionar outra',
        life: 3000
      });
      return false;
    }
    return true;
  };

  const headerTemplate = (options) => {
    const { className, chooseButton, uploadButton, cancelButton } = options;
    const value = totalSize / 20000; // Ajustado para 2MB
    const formatedValue = fileUploadRef && fileUploadRef.current ? fileUploadRef.current.formatSize(totalSize) : '0 B';

    return (
      <div className={className} style={{ backgroundColor: 'transparent', display: 'flex', alignItems: 'center' }}>
        {chooseButton}
        {/* {uploadButton} */}

        <div onClick={() => onTemplateClear()}>
          {cancelButton}
        </div>
        <div className="flex align-items-center gap-3 ml-auto">
          <span>{formatedValue} / 2 MB</span>
          <ProgressBar value={value} showValue={false} style={{ width: '10rem', height: '12px' }}></ProgressBar>
        </div>
      </div>
    );
  };

  const itemTemplate = (file, props) => {
    return (
      <div className="flex align-items-center flex-wrap">
        <div className="flex align-items-center" style={{ width: '40%' }}>
          <img 
            alt={file.name} 
            role="presentation" 
            src={file.objectURL} 
            width={100} 
            style={{ maxHeight: '100px', objectFit: 'contain' }}
          />
          <span className="flex flex-column text-left ml-3">
            {file.name}
            <small>{new Date().toLocaleDateString()}</small>
            <small>Tamanho: {(file.size / 1024).toFixed(2)} KB</small>
          </span>
        </div>
        <Tag value={props.formatSize} severity="warning" className="px-3 py-2" style={{ marginRight: '1rem'}} />
        <Button 
          type="button" 
          icon={<AiOutlineCloseCircle size={25}/>} 
          className="p-button-outlined p-button-rounded p-button-danger ml-auto" 
          onClick={() => onTemplateRemove(file, props.onRemove)} 
        />
      </div>
    );
  };

  const emptyTemplate = () => {
    return (
      <div className="flex align-items-center flex-column" style={{ width: '100%', height: '100%', textAlign: 'center' }}>
        <FaRegImages size={200} className="pi pi-image mt-3 p-5" style={{ fontSize: '5em', borderRadius: '50%', backgroundColor: '#f9fafb', color: '#e5e7eb' }}></FaRegImages>
        <p style={{ fontSize: '1.2em', color: 'var(--text-color-secondary)' }} className="my-5">
          {selectedImage ? 'Imagem já carregada' : 'Selecione uma Imagem para o Produto'}
        </p>
      </div>
    );
  };

  // Template para visualização da imagem carregada
  const imagePreviewTemplate = () => {
    if (!selectedImage) return null;

    return (
      <div className="mt-3 p-3 border-round" style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}>
        <div className="flex justify-content-between align-items-center mb-2">
          <h4 className="m-0">Pré-visualização da Imagem:</h4>
          <Button
            icon={<AiOutlineCloseCircle size={20} />}
            className="p-button-text p-button-danger"
            tooltip="Remover imagem"
            tooltipOptions={{ position: 'top' }}
            onClick={() => {
              setSelectedImage(null);
              setCodImgProd('');
              setCurrentFile(null);
              setTotalSize(0);
              fileUploadRef.current.clear();
            }}
          />
        </div>
        <div id="myImg" className="flex justify-content-center align-items-center p-3">
          <img 
            src={selectedImage} 
            alt="Preview" 
            style={{ maxWidth: '60%', maxHeight: '300px', objectFit: 'contain' }}
          />
        </div>
        {currentFile && (
          <div className="mt-2 text-center">
            <small className="text-muted">
              Nome: {currentFile.name} | Tamanho: {(currentFile.size / 1024).toFixed(2)} KB
            </small>
          </div>
        )}
        {codImgProd && (
          <div className="mt-2">
            <small className="text-muted">
              Base64 (início): {codImgProd.substring(0, 50)}...
            </small>
          </div>
        )}
      </div>
    );
  };

  const chooseOptions = { 
    icon: <FaRegImages size={25} />,  
    label: 'Selecionar', 
    className: 'custom-choose-btn p-button p-button-outlined',
    disabled: !!selectedImage // Desabilita o botão se já tiver imagem
  };
  
  const uploadOptions = { 
    icon: <AiOutlineCloudUpload size={25}/>, 
    label: 'Enviar', 
    className: 'custom-upload-btn p-button-success p-button-rounded p-button-outlined' 
  };
  
  const cancelOptions = { 
    icon: <AiOutlineCloseCircle size={25}/>, 
    className: 'custom-cancel-btn p-button-danger p-button-rounded p-button-outlined', 
    label: 'Limpar Imagem',
    onClick: () => {
      // Lógica específica para limpeza
      onTemplateClear();
      fileUploadRef.current.clear();
    }
  };

  return (
    <div className="panel">
      <div style={{ backgroundColor: 'panel-hdr', container: 'custom-swal' }}>
        <Toast ref={toast}></Toast>

        <Tooltip target=".custom-choose-btn" content="Selecionar Imagem" position="top" />
        <Tooltip target=".custom-upload-btn" content="Enviar Imagens" position="top" />
        <Tooltip target=".custom-cancel-btn" content="Limpar" position="right" />

        <FileUpload 
          ref={fileUploadRef} 
          name="demo[]" 
          url="/api/upload" 
          multiple={false} // Apenas um arquivo
          accept="image/*" 
          maxFileSize={2000000} // 2MB
          onUpload={onTemplateUpload} 
          onSelect={onTemplateSelect} 
          onError={onTemplateClear} 
          onClear={onTemplateClear}
          headerTemplate={headerTemplate} 
          itemTemplate={itemTemplate} 
          emptyTemplate={emptyTemplate}
          chooseOptions={chooseOptions} 
          uploadOptions={uploadOptions} 
          cancelOptions={cancelOptions}
          auto={false} // Upload manual
          disabled={!!selectedImage} // Desabilita se já tiver imagem
        />

        {/* {imagePreviewTemplate()} */}

        {/* Campo oculto para armazenar o base64 */}
        <input 
          type="hidden" 
          value={codImgProd} 
          onChange={(e) => setCodImgProd(e.target.value)}
        />
      </div>
    </div>
  );
};