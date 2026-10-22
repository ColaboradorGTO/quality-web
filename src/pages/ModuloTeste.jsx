import React, { Fragment, useEffect, useState } from "react";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { CardModulos } from "../componets/CardsModulos";
import { useQuery } from "react-query";
import { get } from "../api/funcRequest";

// Use import para garantir que o Webpack/Vite inclua as imagens no build
import administrativoImg from '../../public/img/icons/administrativo.png';
import gerenciaImg from '../../public/img/icons/gerencia.png';
import informaticaImg from '../../public/img/icons/informatica.png';
import financeiroImg from '../../public/img/icons/financeiro.png';
import comercialImg from '../../public/img/icons/comercial.png';
import comprasImg from '../../public/img/icons/compras.png';
import contabilidadeImg from '../../public/img/icons/contabilidade.png';
import marketingImg from '../../public/img/icons/marketing.png';
import rhImg from '../../public/img/icons/rh.png';
import expedicaoImg from '../../public/img/icons/expedicao.png';
import conferenciaCegaImg from '../../public/img/icons/conferenciaCega.png';
import cadastroImg from '../../public/img/icons/cadastro.png';
import etiquetaImg from '../../public/img/icons/etiqueta.png';
import resumoVendasImg from '../../public/img/icons/resumoVendas.png';
import voucherImg from '../../public/img/icons/voucher.png';
import maloteImg from '../../public/img/icons/malote.png';
import permissoesImg from '../../public/img/icons/permissoes.png';
import promocaoImg from '../../public/img/icons/promocao.png';
import provisaoFinanceiraImg from '../../public/img/icons/previsao-financeira.png';

export const ModuloTeste = () => {
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduloSelecionado, setModuloSelecionado] = useState(null);
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  useEffect(() => {
    const usuarioArmazenado = localStorage.getItem('usuario');
    if (usuarioArmazenado) {
      const parsedUsuario = JSON.parse(usuarioArmazenado);
      setUsuarioLogado(parsedUsuario);
    }
  }, []);

 
  const navigate = useNavigate();
  const { data: optionsModulosPage = [], error: errorFuncionarios, isLoading: isLoadingFuncionarios, refetch: refetchFuncionarios } = useQuery(
    'menus-usuario',
    async () => {
      const response = await get(`/menus-usuario?idUsuario=${usuarioLogado?.id}`);
      
      return response.data;
    },
    { enabled: Boolean(usuarioLogado?.id), staleTime: 60 * 60 * 1000, }
  );
  
 
  useEffect(() => {
    const storedModule = JSON.parse(localStorage.getItem('moduloselecionado'));
    if (storedModule) {
      setSelectedModule(storedModule);
    }
  }, [usuarioLogado, navigate]);  

  const selecioneModulo = (event, moduloURL) => {
    event.preventDefault();
    
    const modulos = optionsModulosPage[0]?.modulos || [];
    const moduloEncontrado = modulos.find(modulo => modulo.DSMODULO === moduloURL);

    if (moduloEncontrado) {
      localStorage.setItem('moduloselecionado', JSON.stringify(moduloEncontrado));
      setSelectedModule(moduloEncontrado);
      setModuloSelecionado(moduloEncontrado);
      navigate(`/${moduloEncontrado.DSMODULO}`);
    }
  };

  const modulosDisponiveis = optionsModulosPage[0]?.modulos || [];
  useEffect(() => {
    if (moduloSelecionado) {
      refetchMenus();
    }
  }, [moduloSelecionado]);

  const imageMap = {
    1: administrativoImg,
    2: gerenciaImg,
    3: informaticaImg,
    4: financeiroImg,
    5: comercialImg,
    6: comprasImg,
    7: contabilidadeImg,
    8: marketingImg,
    9: rhImg,
    10: comprasImg,
    11: expedicaoImg,
    12: conferenciaCegaImg,
    13: cadastroImg,
    14: etiquetaImg,
    15: resumoVendasImg,
    16: voucherImg,
    17: maloteImg,
    18: permissoesImg,
    19: promocaoImg,
    20: provisaoFinanceiraImg
  };


  const isModuleSelected = selectedModule && window.location.pathname === selectedModule.DSMODULO;

  return (
    <Fragment>
      <main className="page-content page-inner bg-brand-gradient overflow-hidden" style={{ overflow: "hidden" }}>
        <div className="row mt-4">
          <div className="col-lg-6 col-xl-6 order-lg-1 order-xl-1 mt-6">
            <div className="mb-g rounded-top">
              <div className="row">
                <div className="col-12 mt-4">
                  <div className="text-center">
                    <h1 className="mb-0" style={{ color: "#fff", fontWeight: 600, lineHeight: "25px", letterSpacing: "1px" }}>
                      Seja Bem-Vindo ao
                    </h1>
                  </div>
                  <div className="text-center py-3 d-flex justify-content-center">
                    <a href="#" className="page-logo-link press-scale-down d-flex align-items-center">
                      <img src="img/logo.png" alt="SmartAdmin WebApp" aria-roledescription="logo" />
                      <span className="page-logo-text mr-1">Softquality SAP</span>
                    </a>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex flex-column align-items-center justify-content-center p-4">
                    <img src="img/demo/avatars/avatar-m.png" className="rounded-circle shadow-2 img-thumbnail" alt="" />
                    <h5 className="mb-0 text-center mt-3" style={{ color: "#fff", fontWeight: 600, lineHeight: "25px", letterSpacing: "1px", textTransform: "uppercase" }}>
                      {usuarioLogado?.NOFUNCIONARIO}
                      <small className="text-muted mb-0">{usuarioLogado?.NOFANTASIA}</small>
                    </h5>
                  </div>
                </div>
                <div className="col-12">
                  <h3 style={{ color: "#fff", textAlign: 'center' }}>
                    Software de Gestão Unificada <br />
                    Sistema de Gerenciamento e Controle integrado com o ERP SAP.
                  </h3>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6 col-xl-6 order-lg-1 order-xl-1">
            <div className="mb-g">
              <div className="row">
                <div className="m-2">
                  <div className="text-left">
                    <a href="/"  className="btn font-weight-bold" style={{ color: "#fff", fontSize: "22px" }}>
                      <IoMdArrowBack size={40} />
                    </a>
                  </div>
                </div>
                <div className="">
                  <div className="p-3">
                    <h1 className="mb-0" style={{ color: "#fff", fontSize: "32px" }}>
                      Selecione o Modulo
                    </h1>
                  </div>
                </div>
              </div>
              <div className="row">
              {modulosDisponiveis.map((modulo) => (
                <Fragment key={modulo.id}>
                
                  <CardModulos
                    src={imageMap[modulo.ID] || 'path/to/default-image.png'}
                    alt={modulo.alt}
                    nome={modulo.DSMODULO}
                    isSelected={isModuleSelected && modulo.url === selectedModule.url}
                    handleClick={(event) => selecioneModulo(event, modulo.DSMODULO)}
                  />
                </Fragment>
              ))}
              </div>
          
            </div>
          </div>
        </div>
      </main>
    </Fragment>
  );
};