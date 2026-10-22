import React, { Fragment, useEffect, useState, Suspense, lazy } from "react"
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "../componets/Sidebar/SidebarContext";
import { MenuSidebarAdmin } from "../componets/Sidebar/sidebar";
import { HeaderMain } from "../componets/Header";
import { MenuButton } from "../componets/Buttons/menuButton";
import { FooterMain } from "../componets/Footer";
import { get } from "../api/funcRequest";
import { useQuery } from "react-query";

const ActionPesquisaCriarAdiantamento = lazy(() => import("../componets/ProvisaoFinanceira/ActionAdiantamento/Solicitar/actionPesquisaCriarAdiantamento").then(module => ({default: module.ActionPesquisaCriarAdiantamento })));

export const DashBoardProvisaoFinanceira = () => {
  const [actionVisivel, setActionVisivel] = useState(true);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const storedModule = localStorage.getItem('moduloselecionado');
  const selectedModule = JSON.parse(storedModule);
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
    'menus-usuario',
    async () => {
      const response = await get(`/menus-usuario?idUsuario=${usuarioLogado?.id}&idModulo=${selectedModule?.id}`);
      
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
    case "/provisaoFinanceiro/ActionPesquisaCriarAdiantamento":
      component = <ActionPesquisaCriarAdiantamento usuarioLogado={usuarioLogado} />;
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
                        {actionVisivel && !componentToShow && (<ActionPesquisaCriarAdiantamento usuarioLogado={usuarioLogado}  />)}

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
