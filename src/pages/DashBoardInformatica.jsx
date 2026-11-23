import React, { Fragment, useEffect, useState, Suspense, lazy } from "react"
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "../componets/Sidebar/SidebarContext";
import { MenuSidebarAdmin } from "../componets/Sidebar/sidebar";
import { HeaderMain } from "../componets/Header";
import { MenuButton } from "../componets/Buttons/menuButton";
import { FooterMain } from "../componets/Footer";
import { get } from "../api/funcRequest";
import { useQuery } from "react-query";

const InformaticaActionHome = lazy(() => import("../componets/Informatica/Components/ActionHome/informaticaActionHome").then(module => ({ default: module.InformaticaActionHome })));
const ActionPesquisaVendas = lazy(() => import("../componets/Informatica/Components/ActionListaVendas/actionPequisaVendas").then(module => ({ default: module.ActionPesquisaVendas })));
const ActionPesquisaFuncionarios = lazy(() => import("../componets/Informatica/Components/ActionFuncionarios/actionPesquisaFuncionarios").then(module => ({ default: module.ActionPesquisaFuncionarios })));
const ActionPesquisaProdutosPreco = lazy(() => import("../componets/Informatica/Components/ActionProdutoPreco/actionPesquisaProdutosPreco").then(module => ({ default: module.ActionPesquisaProdutosPreco })));
const ActionPesquisaVendasAlloc = lazy(() => import("../componets/Informatica/Components/ActionVendasAlloc/actionPesquisaVendasAlloc").then(module => ({ default: module.ActionPesquisaVendasAlloc })));
const ActionPesquisaVendasContigencia = lazy(() => import("../componets/Informatica/Components/ActionVendasContigencia/actionPesquisaVendasContigencia").then(module => ({ default: module.ActionPesquisaVendasContigencia })));
const ActionPesquisaCliente = lazy(() => import("../componets/Informatica/Components/ActionCliente/actionPesquisaCliente").then(module => ({ default: module.ActionPesquisaCliente })));
const ActionPesquisaExportarDadosCSVCredSystem = lazy(() => import("../componets/Informatica/Components/ActionExportarDadosCSV/actionPesquisaExportarDadosCSVCredSystem").then(module => ({ default: module.ActionPesquisaExportarDadosCSVCredSystem })));
const ActionPesquisaLinkRelatorioBi = lazy(() => import("../componets/Informatica/Components/ActionLinkRelatorioBI/actionPesquisaLinkRelatorioBI").then(module => ({ default: module.ActionPesquisaLinkRelatorioBi })));
const ActionPesquisaRelatorioBI = lazy(() => import("../componets/Informatica/Components/ActionRelatorioBI/actionPesquisaRelatorioBI").then(module => ({ default: module.ActionPesquisaRelatorioBI })));
const ActionPesquisaDuplicarPermissao = lazy(() => import("../componets/Informatica/Components/ActionPermissao/actionPesquisaPerfilPermissao").then(module => ({ default: module.ActionPesquisaPerfilPermissao })));
const ActionPesquisEmpresa = lazy(() => import("../componets/Informatica/Components/ActionPesquisaEmpresas/actionPesquisaEmpresa").then(module => ({ default: module.ActionPesquisEmpresa })));
const ActionPesquisaNfce = lazy(() => import("../componets/Informatica/Components/ActionValidaVendasContigencia/actionPesquisaNfce").then(module => ({ default: module.ActionPesquisaNfce })));
const ActionPesquisaCriarMenuFilho = lazy(() => import("../componets/Informatica/Components/ActionCriarMenuFilho/actionPesquisaCriarMenuFIlho").then(module => ({ default: module.ActionPesquisaCriarMenuFilho })));
const ActionPesquisaPermissao = lazy(() => import("../componets/Informatica/Components/ActionCriarPermissao/actionPesquisaPermissao").then(module => ({ default: module.ActionPesquisaPermissao })));

export const DashBoardInformatica = () => {
  const [actionVisivel, setActionVisivel] = useState(true);
  const [componentToShow, setComponentToShow] = useState("");
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const storedModule = localStorage.getItem('moduloselecionado');
  const selectedModule = JSON.parse(storedModule);

  useEffect(() => {
    const usuarioArmazenado = localStorage.getItem('usuario');
    if (usuarioArmazenado) {
      const parsedUsuario = JSON.parse(usuarioArmazenado);
      setUsuarioLogado(parsedUsuario);
    }
  }, []);

  useEffect(() => {

  }, [usuarioLogado]);

  const { data: optionsModulosPage = [], error: errorModulos, isLoading: isLoadingModulos, refetch: refetchModulos } = useQuery(
    ['menus-usuario', usuarioLogado?.id, selectedModule?.ID],
    async () => {
      const response = await get(`/menus-usuario?idUsuario=${usuarioLogado?.id}&idModulo=${selectedModule?.ID}`);

      return response.data;
    },
    { enabled: Boolean(usuarioLogado?.id), staleTime: 60 * 60 * 1000, }
  );

  function handleShowComponent(componentName) {
    const menuFilhoSelecionado = selectedModule.menuPai.menuFilho.find(
      menu => menu.URL === componentName
    );

    if (menuFilhoSelecionado) {
      // Salvar todas as informações do menu selecionado no localStorage
      localStorage.setItem('menuFilhoSelecionado', JSON.stringify({
        ID: menuFilhoSelecionado.ID,
        DSNOME: menuFilhoSelecionado.DSNOME,
        URL: menuFilhoSelecionado.URL,
        ALTERAR: menuFilhoSelecionado.ALTERAR,
        CRIAR: menuFilhoSelecionado.CRIAR,
        VISUALIZAR: menuFilhoSelecionado.VISUALIZAR,
        N1: menuFilhoSelecionado.N1,
        N2: menuFilhoSelecionado.N2,
        N3: menuFilhoSelecionado.N3,
        N4: menuFilhoSelecionado.N4,
        ADMINISTRADOR: menuFilhoSelecionado.ADMINISTRADOR
      }));
    }

    setComponentToShow(componentName);
  }
  
  const menuFilhoResumo = selectedModule?.menuPai?.menuFilho?.find(
    menu => menu.URL === "/informatica/InformaticaActionHome"
  );
  
  const permissaoUsuario = selectedModule.menuPai.menuFilho;
  const {
    ID,
  } = permissaoUsuario.map(item => ({
    ID: item.ID,
  })).reduce((acc, curr) => {
    return { ...acc, ...curr };
  }, {});

  let component = null;

  switch (componentToShow) {
    case "/informatica/InformaticaActionHome":
      component = <InformaticaActionHome usuarioLogado={usuarioLogado} menuFilhoAtual={menuFilhoResumo} />;
      break;
    case "/informatica/ActionPesquisaVendas":
      component = <ActionPesquisaVendas />;
      break;
    case "/informatica/ActionPesquisaFuncionarios":
      component = <ActionPesquisaFuncionarios usuarioLogado={usuarioLogado} ID={ID} />;
      break;
    case "/informatica/ActionPesquisaProdutosPreco":
      component = <ActionPesquisaProdutosPreco />;
      break;
    case "/informatica/ActionPesquisaVendasAlloc":
      component = <ActionPesquisaVendasAlloc />;
      break;
    case "/informatica/ActionPesquisaVendasContigencia":
      component = <ActionPesquisaVendasContigencia />;
      break;
    case "/informatica/ActionPesquisaCliente":
      component = <ActionPesquisaCliente />;
      break;
    case "/informatica/ActionPesquisaExportarDadosCSVCredSystem":
      component = <ActionPesquisaExportarDadosCSVCredSystem usuarioLogado={usuarioLogado} ID={ID} />;
      break;
    case "/informatica/ActionPesquisaRelatorioBI":
      component = <ActionPesquisaRelatorioBI usuarioLogado={usuarioLogado} ID={ID} />;
      break;
    case "/informatica/ActionPesquisaLinkRelatorioBi":
      component = <ActionPesquisaLinkRelatorioBi usuarioLogado={usuarioLogado} ID={ID} />;
      break;
    case "/informatica/ActionPesquisaDuplicarPermissao":
      component = <ActionPesquisaDuplicarPermissao usuarioLogado={usuarioLogado} ID={ID} />;
      break;
    case "/informatica/ActionPesquisaEmpresas":
      component = <ActionPesquisEmpresa usuarioLogado={usuarioLogado} ID={ID} />;
      break;
    case "/informatica/ActionPesquisaNfce":
      component = <ActionPesquisaNfce usuarioLogado={usuarioLogado} ID={ID} />;
      break;
    case "/informatica/CriacaoMenuFilho":
      component = <ActionPesquisaCriarMenuFilho usuarioLogado={usuarioLogado} ID={ID} refetchModulos={refetchModulos} />;
      break;
    case "/informatica/ActionPesquisaPermissao":
      component = <ActionPesquisaPermissao usuarioLogado={usuarioLogado} ID={ID} />;
      break;
    default:
      component = null;
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
                              {actionVisivel && !componentToShow && (<InformaticaActionHome usuarioLogado={usuarioLogado} ID={ID} menuFilhoAtual={menuFilhoResumo} />)}

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
