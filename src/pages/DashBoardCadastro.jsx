import React, { Fragment, useEffect, useState,Suspense, lazy, } from "react"
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "../componets/Sidebar/SidebarContext";
import { MenuSidebarAdmin } from "../componets/Sidebar/sidebar";
import { HeaderMain } from "../componets/Header";
import { MenuButton } from "../componets/Buttons/menuButton";
import { FooterMain } from "../componets/Footer";
import { get } from "../api/funcRequest";
import { useQuery } from "react-query";

const ActionPesquisaHome = lazy(() => import("../componets/Cadastro/Components/ActionHome/actionPesquisaHome").then(module => ({ default: module.ActionPesquisaHome })));
const ActionPesquisaProdutosAvulso = lazy(() => import("../componets/Cadastro/Components/ActionProdutosAvulso/actionPesquisaProdutosAvulso").then(module => ({ default: module.ActionPesquisaProdutosAvulso })));
const ActionPesquisaEstilos = lazy(() => import("../componets/Cadastro/Components/ActionEstilos/actionPesquisaEstilos").then(module => ({ default: module.ActionPesquisaEstilos })));
const ActionPesquisaNFE = lazy(() => import("../componets/Cadastro/Components/ActionNotasFiscais/actionPesquisaNotasNFE").then(module => ({ default: module.ActionPesquisaNFE })));
const ActionPesquisaPreco = lazy(() => import("../componets/Cadastro/Components/ActionListaPreco/actionPesquisaPreco").then(module => ({ default: module.ActionPesquisaPreco })));
const ActionPesquisaAlteracaoPreco = lazy(() => import("../componets/Cadastro/Components/ActionAlteracaoPrecoProduto/actionPesquisaAlteracaoPreco").then(module => ({ default: module.ActionPesquisaAlteracaoPreco })));
const ActionPesquisaProdutoEtiqueta = lazy(() => import("../componets/Cadastro/Components/ActionProdutoEtiqueta/actionPesquisaProdutoEtiqueta").then(module => ({ default: module.ActionPesquisaProdutoEtiqueta })));

export const DashBoardCadastro = () => {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const storedModule = localStorage.getItem('moduloselecionado');
  const selectedModule = JSON.parse(storedModule);
  const [resumoVisivel, setResumoVisivel] = useState(true);
  const [componentToShow, setComponentToShow] = useState("");
  const [menuSelected, setMenuSelected] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    const usuarioArmazenado = localStorage.getItem('usuario');
    if (usuarioArmazenado) {
      const parsedUsuario = JSON.parse(usuarioArmazenado);
      setUsuarioLogado(parsedUsuario);
    }
  }, []);

  useEffect(() => {
    const storedMenuFilho = JSON.parse(localStorage.getItem('menufilhoSelecionado'));

    if (storedMenuFilho) {
      setMenuSelected(selectedModule);
    }

  }, [usuarioLogado]);


  const { data: optionsModulosPage = [], error: errorModulos, isLoading: isLoadingModulos, refetch: refetchModulos } = useQuery(
    ['menus-usuario', usuarioLogado, selectedModule],
    async () => {
   
      const response = await get(`/menus-usuario?idUsuario=${usuarioLogado?.id}&idModulo=${selectedModule?.ID}`);
      return response.data;
    },
    { enabled: Boolean(usuarioLogado?.id), staleTime: 5 * 60 * 1000, }
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
    menu => menu.URL === "/cadastro/ActionPesquisaHome"
  );

  let component = null;

  // case "/cadastro/ReceberNFePedido":
  //   component = <CadastroActionProdutosAvulso />;
  //   break;
  switch (componentToShow) {
    case "/cadastro/ActionPesquisaHome":
      component = < ActionPesquisaHome usuarioLogado={usuarioLogado} menuFilhoAtual={menuFilhoResumo} />;
      break;
    case "/cadastro/ActionPesquisaProdutosAvulso":
      component = <ActionPesquisaProdutosAvulso usuarioLogado={usuarioLogado} />;
      break;
    case "/cadastro/ActionPesquisaEstilo":
      component = <ActionPesquisaEstilos usuarioLogado={usuarioLogado} />;
      break;
    case "/cadastro/CadastroActionCadEditNFE":
      component = <ActionPesquisaNFE usuarioLogado={usuarioLogado} />;
      break;
    case "/cadastro/ActionPesquisaProdutoEtiqueta":
      component = <ActionPesquisaProdutoEtiqueta usuarioLogado={usuarioLogado} />;
      break;

    case "/cadastro/ActionPesquisaAlteracaoPreco":
      component = <ActionPesquisaAlteracaoPreco usuarioLogado={usuarioLogado} />;
      break;
    case "/cadastro/ActionPesquisaPreco":
      component = <ActionPesquisaPreco usuarioLogado={usuarioLogado} />;
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
                <HeaderMain optionsModulosPage={optionsModulosPage}/>

                <main id="js-page-content" role="main" className="page-content">
                  <div className="row">
                    <div className="col-xl-12">
                      <div id="panel-1" className="panel">
                        <div className="panel-container show">
                          <div className="panel-content">
                            <Suspense fallback={<div>Loading...</div>}>
                            {resumoVisivel && !componentToShow && (

                              <ActionPesquisaHome usuarioLogado={usuarioLogado} menuFilhoAtual={menuFilhoResumo}/>
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