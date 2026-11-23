import React, { Fragment, useEffect, useState, Suspense, lazy } from "react"
import { useNavigate } from "react-router-dom"
import { SidebarProvider } from "../componets/Sidebar/SidebarContext";
import { MenuSidebarAdmin } from "../componets/Sidebar/sidebar";
import { HeaderMain } from "../componets/Header";
import { MenuButton } from "../componets/Buttons/menuButton";
import { FooterMain } from "../componets/Footer";
import { useQuery } from "react-query";
import { get } from "../api/funcRequest";
const ActionPesquisaFaturamentoOT = lazy(() => import("../componets/Expedicao/Components/ActionFaturamentoOT/actionPesquisaFaturamentoOT").then(module => ({ default: module.ActionPesquisaFaturamentoOT })));
const ActionPesquisaOT = lazy(() => import("../componets/Expedicao/Components/ActionExpedicaoOrdemTransferencia/ActionPesquisaOT").then(module => ({ default: module.ActionPesquisaOT })));
const ActionStatusDivergencia = lazy(() => import("../componets/Expedicao/Components/ActionStatusDivergencia/actionPesquisaStatusDivergencia").then(module => ({ default: module.ActionStatusDivergencia })));

export const DashBoardExpedicao = () => {
  const [actionVisivel, setActionVisivel] = useState(true);
  const [usuarioLogado, setUsuarioLogado] = useState(null)
  const [componentToShow, setComponentToShow] = useState("");
  const storedModule = localStorage.getItem('moduloselecionado');
  const selectedModule = JSON.parse(storedModule);
  const navigate = useNavigate();

  function handleShowComponent(componentName) {
    setComponentToShow(componentName);
  }

  useEffect(() => {
    const usuarioArmazenado = localStorage.getItem('usuario');

    if (usuarioArmazenado) {
      try {
        const parsedUsuario = JSON.parse(usuarioArmazenado);
        setUsuarioLogado(parsedUsuario);
        // console.log(parsedUsuario, 'dashboardAdministrativo');
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
    menu => menu.URL === "/expedicao/ActionPesquisaOT"
  );

  let component = null;

  switch (componentToShow) {
    case "/expedicao/ActionPesquisaOT":
      component = <ActionPesquisaOT usuarioLogado={usuarioLogado} menuFilhoAtual={menuFilhoResumo} />;
      break;
    case "/expedicao/ActionPesquisaFaturamentoOT":
      component = <ActionPesquisaFaturamentoOT usuarioLogado={usuarioLogado} />
      break;
    case "/expedicao/ExpedicaoActionStatusDivergencia":
      component = <ActionStatusDivergencia usuarioLogado={usuarioLogado} />
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
                              {actionVisivel && !componentToShow && <ActionPesquisaOT menuFilhoAtual={menuFilhoResumo} />}
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