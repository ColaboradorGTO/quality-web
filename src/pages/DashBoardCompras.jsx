import React, { Fragment, useEffect, useState, Suspense, lazy, } from "react"
import { useNavigate } from "react-router-dom"
import { FooterMain } from "../componets/Footer";
import { MenuButton } from "../componets/Buttons/menuButton";
import { HeaderMain } from "../componets/Header";
import { MenuSidebarAdmin } from "../componets/Sidebar/sidebar";
import { SidebarProvider } from "../componets/Sidebar/SidebarContext";
import { get } from "../api/funcRequest";
import { useQuery } from "react-query";
const ActionPesquisaHome = lazy(() => import("../componets/Compras/Components/ActionHome/actionPesquisaHome").then(module => ({ default: module.ActionPesquisaHome })));
// const ComprasActionListaDistribuicaoMercadoria = lazy(() => import("../componets/Compras/comprasActionListaDistribuicaoMercadoria").then(module => ({ default: module.ComprasActionListaDistribuicaoMercadoria })));
const ActionPDFPedidoResumido = lazy(() => import("../componets/Compras/Components/ActionHome/comprasActionPDFPedidoResumido").then(module => ({ default: module.ActionPDFPedidoResumido })));
const ActionPDFPedidoDetalhado = lazy(() => import("../componets/Compras/Components/ActionHome/comprasActionPDFPedidoDetalhado").then(module => ({ default: module.ActionPDFPedidoDetalhado })));
const ActionPesquisaProduto = lazy(() => import("../componets/Compras/Components/ActionImagemProduto/ActionPesquisaProduto").then(module => ({ default: module.ActionPesquisaProduto })));
const ActionPesquisaNovoPedido = lazy(() => import("../componets/Compras/Components/ActionNovoPedido/actionPesquisaNovoPedido").then(module => ({ default: module.ActionPesquisaNovoPedido })));
const ActionPesquisaFornecedor = lazy(() => import("../componets/Compras/Components/ActionFonecedores/actionPesquisaFornecedor").then(module => ({ default: module.ActionPesquisaFornecedor })));
const ActionPesquisaFabricante = lazy(() => import("../componets/Compras/Components/ActionFabricantes/actionPesquisaFabricante").then(module => ({ default: module.ActionPesquisaFabricante })));
const ActionPesquisaTransportador = lazy(() => import("../componets/Compras/Components/ActionTransportador/actionPesquisaTransportador").then(module => ({ default: module.ActionPesquisaTransportador })));
const ActionPesquisaCondicaoPagamento = lazy(() => import("../componets/Compras/Components/ActionCondicaoPagamentos/actionPesquisaCondicaoPagamento").then(module => ({ default: module.ActionPesquisaCondicaoPagamento })));
const ActionPesquisaCategoriaPedido = lazy(() => import("../componets/Compras/Components/ActionCategoriaPedido/actionPesquisaCategoriaPedido").then(module => ({ default: module.ActionPesquisaCategoriaPedido })));
const ActionPesquisaGrupoEstrutura = lazy(() => import("../componets/Compras/Components/ActionGrupoEstrutura/actionPesquisaGrupoEstrutura").then(module => ({ default: module.ActionPesquisaGrupoEstrutura })));
const ActionPesquisaSubGrupoEstrutura = lazy(() => import("../componets/Compras/Components/ActionSubGrupoEstrutura/actionPesquisaSubGrupoEstrutura").then(module => ({ default: module.ActionPesquisaSubGrupoEstrutura })));
const ActionPesquisaUnidadeMedida = lazy(() => import("../componets/Compras/Components/ActionUnidadeMedida/actionPesquisaUnidadeMedida").then(module => ({ default: module.ActionPesquisaUnidadeMedida })));
const ActionPesquisaCores = lazy(() => import("../componets/Compras/Components/ActionCores/actionPesquisaCores").then(module => ({ default: module.ActionPesquisaCores })));
const ActionPesquisaEstilos = lazy(() => import("../componets/Compras/Components/ActionEstilos/actionPesquisaEstilos").then(module => ({ default: module.ActionPesquisaEstilos })));
const ActionPesquisaTiposTecidos = lazy(() => import("../componets/Compras/Components/ActionTipoTecidos/actionPesquisaTipoTecidos").then(module => ({ default: module.ActionPesquisaTiposTecidos })));
const ActionPesquisaProdutosEntreFiliais = lazy(() => import("../componets/Compras/Components/ProdutosFiliais/actionPesquisaProdutosEntreFiliais").then(module => ({ default: module.ActionPesquisaProdutosEntreFiliais })));
const ActionPesquisaProdutosPorPedido = lazy(() => import("../componets/Compras/Components/ProdutosPorPedido/actionPesquisaProdutosPedidos").then(module => ({ default: module.ActionPesquisaProdutosPorPedido })));


export const DashBoardCompras = () => {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [homeVisivel, setHomeVisivel] = useState(true);
  const [componentToShow, setComponentToShow] = useState("");
  const storedModule = localStorage.getItem('moduloselecionado');
  const selectedModule = JSON.parse(storedModule);
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

  function handleShowComponent(componentName) {
    setComponentToShow(componentName);
  }

  const { data: optionsModulosPage = [], error: errorModulos, isLoading: isLoadingModulos, refetch: refetchModulos } = useQuery(
    'menus-usuario',
    async () => {
      const response = await get(`/menus-usuario?idUsuario=${usuarioLogado?.id}&idModulo=${selectedModule?.ID}`);

      return response.data;
    },
    { enabled: Boolean(usuarioLogado?.id), staleTime: 5 * 60 * 1000, }
  );

  const menuFilhoResumo = selectedModule?.menuPai?.menuFilho?.find(
    menu => menu.URL === "/compras/ActionPesquisaHome"
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
    case "/compras/ActionPesquisaHome":
      component = <ActionPesquisaHome usuarioLogado={usuarioLogado} ID={ID} menuFilhoAtual={menuFilhoResumo} />
      break;
    case "/compras/ActionPesquisaNovoPedido":
      component = <ActionPesquisaNovoPedido usuarioLogado={usuarioLogado} ID={ID} />;
      break;
    case "/compras/ActionPesquisaProduto":
      component = <ActionPesquisaProduto usuarioLogado={usuarioLogado} ID={ID} />;
      break;
    case "/compras/ComprasActionListaDistribuicaoMercadoria":
      component = <ComprasActionListaDistribuicaoMercadoria />;
      break;
    case "/compras/ActionPesquisaFornecedor":
      component = <ActionPesquisaFornecedor usuarioLogado={usuarioLogado} ID={ID} />;
      break;
    case "/compras/ActionPesquisaFabricante":
      component = <ActionPesquisaFabricante usuarioLogado={usuarioLogado} ID={ID} />;
      break;

    case "/compras/ActionPesquisaTransportador":
      component = <ActionPesquisaTransportador usuarioLogado={usuarioLogado} ID={ID} />;
      break;

    case "/compras/ActionPesquisaCondicaoPagamento":
      component = <ActionPesquisaCondicaoPagamento usuarioLogado={usuarioLogado} ID={ID} />;
      break;
    case "/compras/ActionPesquisaCategoriaPedido":
      component = <ActionPesquisaCategoriaPedido usuarioLogado={usuarioLogado} ID={ID} />;
      break;
    case "/compras/ActionPesquisaGrupoEstrutura":
      component = <ActionPesquisaGrupoEstrutura usuarioLogado={usuarioLogado} ID={ID} />;
      break;
    case "/compras/ActionPesquisaSubGrupoEstrutura":
      component = <ActionPesquisaSubGrupoEstrutura usuarioLogado={usuarioLogado} ID={ID} />;
      break;
    case "/compras/ActionPesquisaUnidadeMedida":
      component = <ActionPesquisaUnidadeMedida usuarioLogado={usuarioLogado} ID={ID} />;
      break;
    case "/compras/ActionPesquisaCores":
      component = <ActionPesquisaCores usuarioLogado={usuarioLogado} ID={ID} />;
      break;
    case "/compras/ActionPesquisaEstilos":
      component = <ActionPesquisaEstilos usuarioLogado={usuarioLogado} ID={ID} />;
      break;
    case "/compras/ActionPesquisaTiposTecidos":
      component = <ActionPesquisaTiposTecidos usuarioLogado={usuarioLogado} ID={ID} />;
      break;
    case "/compras/ActionPDFPedidoResumido":
      component = <ActionPDFPedidoResumido />
      break;
    case "/compras/ActionPDFPedidoDetalhado":
      component = <ActionPDFPedidoDetalhado />
      break;
    case "/compras/ActionPesquisaProdutosEntreFiliais":
      component = <ActionPesquisaProdutosEntreFiliais />
      break;
    case "/compras/ActionPesquisaProdutosPorPedido":
      component = <ActionPesquisaProdutosPorPedido />
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
                              {homeVisivel && !componentToShow && (

                                <ActionPesquisaHome menuFilhoAtual={menuFilhoResumo} />
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
