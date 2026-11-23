import React, { Fragment, Suspense, lazy, useEffect, useState } from "react"
import { SidebarProvider } from "../componets/Sidebar/SidebarContext";
import { MenuSidebarAdmin } from "../componets/Sidebar/sidebar";
import { MenuButton } from "../componets/Buttons/menuButton";
import { FooterMain } from "../componets/Footer";
import { HeaderMain } from "../componets/Header";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { get } from "../api/funcRequest";

const ActionPesquisaFaturamentoOT = lazy(() => import("../componets/Expedicao/Components/ActionFaturamentoOT/actionPesquisaFaturamentoOT").then(module => ({ default: module.ActionPesquisaFaturamentoOT })));
const ActionPesquisaOrdemTransferencia = lazy(() => import("../componets/ConferenciaCega/Components/ActionOrdemTransferencia/actionPesquisaOrdemTransferencia").then(module => ({ default: module.ActionPesquisaOrdemTransferencia })));
const ActionPesquisaStatusDivergencia = lazy(() => import("../componets/ConferenciaCega/Components/ActionStatusDivergencia/actionPesquisaStatusDivergencia").then(module => ({ default: module.ActionPesquisaStatusDivergencia })));
const ActionPesquisaOrdemTransferenciaDeposito = lazy(() => import("../componets/ConferenciaCega/Components/ActionOrdemTransferenciaDeposito/actionPesquisaOrdemTransferenciaDeposito").then(module => ({ default: module.ActionPesquisaOrdemTransferenciaDeposito })));

export const DashBoardConferenciaCega = () => {
  const [resumoVisivel, setResumoVisivel] = useState(true);
  const [componentToShow, setComponentToShow] = useState("");
  const [usuarioLogado, setUsuarioLogado] = useState(null)
  const storedModule = localStorage.getItem('moduloselecionado');
  const selectedModule = JSON.parse(storedModule);
  
  function handleShowComponent(componentName) {
    setComponentToShow(componentName);
  }

  const navigate = useNavigate();

  useEffect(() => {
    const usuarioArmazenado = localStorage.getItem('usuario');

    if (usuarioArmazenado) {
      try {
        const parsedUsuario = JSON.parse(usuarioArmazenado);
        setUsuarioLogado(parsedUsuario);

      } catch (error) {
        console.error('Erro ao parsear o usuário do localStorage:', error);
      }
    } else {

      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {

  }, [usuarioLogado]);

  const { data: optionsModulosPage = [], error: errorModulos, isLoading: isLoadingModulos, refetch: refetchModulos } = useQuery(
    'menus-usuario',
    async () => {
      const response = await get(`/menus-usuario?idUsuario=${usuarioLogado?.id}&idModulo=${selectedModule?.ID}`);
      
      return response.data;
    },
    { enabled: Boolean(usuarioLogado?.id), staleTime: 5 * 60 * 1000, }
  );

  const menuFilhoResumo = selectedModule?.menuPai?.menuFilho?.find(
    menu => menu.URL === "/conferenciaCega/ActionPesquisaOrdemTransferencia"
  );

  let component = null;

  switch (componentToShow) {
    case "/conferenciaCega/ActionPesquisaOrdemTransferencia":
      component = <ActionPesquisaOrdemTransferencia usuarioLogado={usuarioLogado} menuFilhoAtual={menuFilhoResumo} />;
      break;
    case "/conferenciaCega/ActionPesquisaFaturamentoOT":
      component = <ActionPesquisaFaturamentoOT usuarioLogado={usuarioLogado} />
      break;
    case "/conferenciaCega/ActionPesquisaStatusDivergencia":
      component = <ActionPesquisaStatusDivergencia usuarioLogado={usuarioLogado}/>
      break;
    case "/conferenciaCega/ListaOrdemTransferenciaDeposito":
      component = <ActionPesquisaOrdemTransferenciaDeposito usuarioLogado={usuarioLogado} />
      break;
    default:
      break;
  }
  return (

    <Fragment>
      {usuarioLogado && (
        <SidebarProvider>

          <div className="page-wrapper">
            <div className="page-inner">
              <MenuSidebarAdmin
                componentToShow={componentToShow}
                handleShowComponent={handleShowComponent}
              />
              <div className="page-content-wrapper">
                <HeaderMain optionsModulosPage={optionsModulosPage} />

                <main id="js-page-content" role="main" className="page-content">
                  <div className="row">
                    <div className="col-xl-12">
                      <div id="panel-1" className="panel">
                        <div className="panel-container show">
                          <div className="panel-content">
                            <Suspense fallback={<div>Loading...</div>}>
                              {resumoVisivel && !componentToShow && (
                                <ActionPesquisaOrdemTransferencia  usuarioLogado={usuarioLogado} menuFilhoAtual={menuFilhoResumo}/>
                            
                              )}
                              {componentToShow && component}
                            </Suspense>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </main>

                <Fragment>
                  <MenuButton />
                  <FooterMain />
                </Fragment>
              </div>
            </div>
          </div>
        </SidebarProvider>
      )}

    </Fragment>
  )
}