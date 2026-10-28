import { useNavigate, } from "react-router-dom";
import React, { Fragment, useEffect, useState, Suspense, lazy, } from "react"
import { HeaderMain } from "../componets/Header";
import { MenuButton } from "../componets/Buttons/menuButton";
import { FooterMain } from "../componets/Footer";
import { SidebarProvider } from "../componets/Sidebar/SidebarContext";
import { MenuSidebarAdmin } from "../componets/Sidebar/sidebar"; 
import { get } from "../api/funcRequest";
import { useQuery } from "react-query";
 
const ResumoDashBoardFinaneiro = lazy(() => import('../componets/Financeiro/Components/ResumoFinanceiro/ResumoDashBoardFinanceiro').then(module => ({ default: module.ResumoDashBoardFinaneiro })));
const ActionPesquisaVendasLoja = lazy(() => import('../componets/Financeiro/Components/ActionVendasLoja/actionPesquisaVendasLoja').then(module => ({ default: module.ActionPesquisaVendasLoja })));
const ActionPesquisaVendasMarca = lazy(() => import('../componets/Financeiro/Components/ActionListaVendasMarca/actionPesquisaVendasMarca').then(module => ({ default: module.ActionPesquisaVendasMarca })));
const ActionPesquisaVendasDigital = lazy(() => import('../componets/Financeiro/Components/ActionVendasDigital/actionPesquisaVendasDigital').then(module => ({ default: module.ActionPesquisaVendasDigital })));
const ActionPesquisaVendasPix = lazy(() => import('../componets/Financeiro/Components/ActionListaVendasPix/actionPesquisaVendasPix').then(module => ({ default: module.ActionPesquisaVendasPix })));
const ActionPesquisaVendasConciliacao = lazy(() => import('../componets/Financeiro/Components/ActionVendasConciliacao/actionPesquisaVendasConciliacao').then(module => ({ default: module.ActionPesquisaVendasConciliacao })));
const ActionPesquisaDepositosLoja = lazy(() => import('../componets/Financeiro/Components/ActionDepositoLoja/actionPesquisaDepositosLoja').then(module => ({ default: module.ActionPesquisaDepositosLoja })));
const ActionPesquisaDespesaLoja = lazy(() => import('../componets/Financeiro/Components/ActionListaDespesasLoja/actionPesquisaDespesaLoja').then(module => ({ default: module.ActionPesquisaDespesaLoja })));
const ActionPesquisaFaturasLoja = lazy(() => import('../componets/Financeiro/Components/ActionFaturasLoja/actionPesquisaFaturasLoja').then(module => ({ default: module.ActionPesquisaFaturasLoja })));
const ActionPesquisaRecebimentosLoja = lazy(() => import('../componets/Financeiro/Components/ActionRecebimentosLoja/actionPesquisaRecebimentosLoja').then(module => ({ default: module.ActionPesquisaRecebimentosLoja })));
const ActionPesquisaQuebraCaixaLoja = lazy(() => import('../componets/Financeiro/Components/ActionQuebraCaixaLoja/actionPesquisaQuebraCaixaLoja').then(module => ({ default: module.ActionPesquisaQuebraCaixaLoja })));
const ActionPesquisaAdiantamentoSalarioLoja = lazy(() => import('../componets/Financeiro/Components/ActionAdiantamentoSalarioLoja/actionPesquisaAdiantamentoSalarioLoja').then(module => ({ default: module.ActionPesquisaAdiantamentoSalarioLoja })));
const ActionPesquisaMapaCaixa = lazy(() => import('../componets/Financeiro/Components/ActionMapaCaixa/actionPesquisaMapaCaixa').then(module => ({ default: module.ActionPesquisaMapaCaixa })));
const ActionPesquisaExtratoLoja = lazy(() => import('../componets/Financeiro/Components/ActionExtratoLoja/actionPesquisaExtratoLoja').then(module => ({ default: module.ActionPesquisaExtratoLoja })));
const ActionPesquisaSaldoLoja = lazy(() => import('../componets/Financeiro/Components/ActionListaSaldoLoja/actionPesquisaSaldoLoja').then(module => ({ default: module.ActionPesquisaSaldoLoja })));
const ActionPesquisaConciliarBanco = lazy(() => import('../componets/Financeiro/Components/ActionPesquisaConciliarBanco/actionPesquisaConciliarBanco').then(module => ({ default: module.ActionPesquisaConciliarBanco })));
const ActionPesquisaRemessaVenda = lazy(() => import('../componets/Financeiro/Components/ActionRemessaVenda/actionPesquisaRemessaVenda').then(module => ({ default: module.ActionPesquisaRemessaVenda })));
const ActionPesquisaCaixaStatus = lazy(() => import('../componets/Financeiro/Components/ActionCaixaStatus/actionPesquisaCaixaStatus').then(module => ({ default: module.ActionPesquisaCaixaStatus })));
const ActionPesquisaDescontoVendas = lazy(() => import('../componets/Financeiro/Components/ActionPesquisaDescontoVendas/actionPesquisaDescontoVendas').then(module => ({ default: module.ActionPesquisaDescontoVendas })));
const ActionPesquisaExtratoMovimentoBonificacao = lazy(() => import('../componets/Financeiro/Components/ActionMovimentosBonificação/actionPesquisaExtratoMovimentoBonificacao').then(module => ({ default: module.ActionPesquisaExtratoMovimentoBonificacao })));
const ActionPesquisaPedidoCompra = lazy(() => import('../componets/Financeiro/Components/ActionPedidosCompra/actionPesquisaPedidoCompra').then(module => ({ default: module.ActionPesquisaPedidoCompra })));
const ActionPesquisaConciliacaoBancosDTW = lazy(() => import('../componets/Financeiro/Components/ActionPesquisaConciliacaoBancosDTW/actionPesquisaConciliacaoBancosDTW').then(module => ({ default: module.ActionPesquisaConciliacaoBancosDTW })));
const ActionPesquisaVendasPixDTW = lazy(() => import('../componets/Financeiro/Components/ActionListaVendasFaturaPixDTW/actionPesquisaVendasPixDTW').then(module => ({ default: module.ActionPesquisaVendasPixDTW })));
const ActionPesquisaFaturasVendasPixDTW = lazy(() => import('../componets/Financeiro/Components/ActionFaturaVendasPixDTW/actionPesquisaFaturasPixDTW').then(module => ({ default: module.ActionPesquisaFaturasVendasPixDTW })));
const ActionPesquisaEmpresas = lazy(() => import('../componets/Financeiro/Components/ActionEmpresas/actionPesquisaEmpresas').then(module => ({ default: module.ActionPesquisaEmpresas })));
const ActionPesquisaMotivoDevolucao = lazy(() => import('../componets/Financeiro/Components/ActionMotivoDevolucao/actionPesquisaMotivoDevolucao').then(module => ({ default: module.ActionPesquisaMotivoDevolucao })));
const ActionPesquisaConferenciaMalote = lazy(() => import('../componets/Financeiro/Components/ActionConferenciaMalote/actionPesquisaConferenciaMalote').then(module => ({ default: module.ActionPesquisaConferenciaMalote })));
const ActionPesquisaContas = lazy(() => import('../componets/Financeiro/Components/ActionContas/actionPesquisaContas').then(module => ({ default: module.ActionPesquisaContas })));
const ActionPesquisaFaturasConsolidadas = lazy(() => import('../componets/Financeiro/Components/ActionFaturasConsolidadas/actionPesquisaFaturasConsolidadas').then(module => ({ default: module.ActionPesquisaFaturasConsolidadas })));
const ActionPesquisaQuebraCaixaIntegracao = lazy(() => import('../componets/Financeiro/Components/ActionQuebraCaixaIntegracao/actionPesquisaQuebraCaixaIntegracao').then(module => ({ default: module.ActionPesquisaQuebraCaixaIntegracao })));
const ActionPesquisaCriarAdiantamento = lazy(() => import('../componets/Financeiro/Components/ActionAdiantamento/Solicitar/actionPesquisaCriarAdiantamento').then(module => ({ default: module.ActionPesquisaCriarAdiantamento })));
const ActionPesquisaAdiantamento = lazy(() => import('../componets/Financeiro/Components/ActionAdiantamento/Acompanhar/actionPesquisaAdiantamento').then(module => ({ default: module.ActionPesquisaAdiantamento })));


export const DashBoardFinanceiro = () => {
  const [resumoVisivel, setResumoVisivel] = useState(true);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [componentToShow, setComponentToShow] = useState("");
  const storedModule = localStorage.getItem('moduloselecionado');
  const selectedModule = JSON.parse(storedModule);
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

  const { data: optionsModulosPage = [], error: errorModulos, isLoading: isLoadingModulos, refetch: refetchModulos } = useQuery(
    'menus-usuario',
    async () => {
      const response = await get(`/menus-usuario?idUsuario=${usuarioLogado?.id}&idModulo=${selectedModule?.ID}`);
      
      return response.data;
    },
    { enabled: Boolean(usuarioLogado?.id), staleTime: 5 * 60 * 1000, }
  );

  const menuFilhoResumo = selectedModule?.menuPai?.menuFilho?.find(
    menu => menu.URL === "/financeiro/ResumoDashBoardFinaneiro"
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
    case "/financeiro/ResumoDashBoardFinaneiro":
      component = <ResumoDashBoardFinaneiro usuarioLogado={usuarioLogado}  menuFilhoAtual={menuFilhoResumo} />
      break;
    case "/financeiro/ActionPesquisaVendasLoja":
      component = <ActionPesquisaVendasLoja />
      break;
    case "/financeiro/ActionPesquisaVendasMarca":
      component = <ActionPesquisaVendasMarca />
      break;
    case "/financeiro/ActionPesquisaVendasDigital":
      component = <ActionPesquisaVendasDigital />
      break;
    case "/financeiro/ActionPesquisaVendasPix":
      component = <ActionPesquisaVendasPix usuarioLogado={usuarioLogado}  />
      break;
    case "/financeiro/ActionPesquisaVendasConciliacao":
      component = <ActionPesquisaVendasConciliacao />
      break;
    case "/financeiro/ActionPesquisaDepositosLoja":
      component = <ActionPesquisaDepositosLoja />
      break;
    case "/financeiro/ActionPesquisaDespesaLoja":
      component = <ActionPesquisaDespesaLoja usuarioLogado={usuarioLogado}  />
      break;
    case "/financeiro/ActionPesquisaRecebimentosLoja":
      component = <ActionPesquisaRecebimentosLoja />
      break;
    case "/financeiro/ActionPesquisaQuebraCaixaLoja":
      component = <ActionPesquisaQuebraCaixaLoja usuarioLogado={usuarioLogado}  />
      break;
    case "/financeiro/ActionPesquisaAdiantamentoSalarioLoja":
      component = <ActionPesquisaAdiantamentoSalarioLoja usuarioLogado={usuarioLogado}  />
      break;
    case "/financeiro/ActionPesquisaMapaCaixa":
      component = <ActionPesquisaMapaCaixa usuarioLogado={usuarioLogado}  />
      break;
    case "/financeiro/ActionPesquisaExtratoLoja":
      component = <ActionPesquisaExtratoLoja usuarioLogado={usuarioLogado}  />
      break;
    case "/financeiro/ActionPesquisaConciliarBanco":
      component = <ActionPesquisaConciliarBanco usuarioLogado={usuarioLogado} />
      break;
    case "/financeiro/ActionPesquisaRemessaVenda":
      component = <ActionPesquisaRemessaVenda  usuarioLogado={usuarioLogado}  />
      break;
    case "/financeiro/ActionPesquisaCaixaStatus":
      component = <ActionPesquisaCaixaStatus usuarioLogado={usuarioLogado}  />
      break;
    case "/financeiro/ActionPesquisaDescontoVendas":
      component = <ActionPesquisaDescontoVendas />
      break;
    case "/financeiro/ActionPesquisaExtratoMovimentoBonificacao":
      component = <ActionPesquisaExtratoMovimentoBonificacao usuarioLogado={usuarioLogado}  />
      break;
    case "/financeiro/ActionPesquisaPedidoCompra":
      component = <ActionPesquisaPedidoCompra />
      break;
    case "/financeiro/ActionPesquisaConciliacaoBancosDTW":
      component = <ActionPesquisaConciliacaoBancosDTW  usuarioLogado={usuarioLogado}  />
      break;
    case "/financeiro/ActionPesquisaVendasPixDTW":
      component = <ActionPesquisaVendasPixDTW  usuarioLogado={usuarioLogado}  />
      break;
    case "/financeiro/ActionPesquisaFaturasVendasPixDTW":
      component = <ActionPesquisaFaturasVendasPixDTW usuarioLogado={usuarioLogado}  />
      break;
    case "/financeiro/ActionPesquisaFaturasLoja":
      component = <ActionPesquisaFaturasLoja usuarioLogado={usuarioLogado}  />
      break;
    case "/financeiro/ActionPesquisaConferenciaMalote":
      component = <ActionPesquisaConferenciaMalote usuarioLogado={usuarioLogado}  />
      break;
    case "/financeiro/ActionPesquisaSaldoLoja":
      component = <ActionPesquisaSaldoLoja />
      break;
    case "/financeiro/ActionPesquisaEmpresas":
      component = <ActionPesquisaEmpresas usuarioLogado={usuarioLogado}  />
      break;
    case "/financeiro/ActionPesquisaMotivoDevolucao":
      component = <ActionPesquisaMotivoDevolucao usuarioLogado={usuarioLogado}  />
      break;
    case "/financeiro/ActionPesquisaContas":
      component = <ActionPesquisaContas usuarioLogado={usuarioLogado}  />
      break;
    case "/financeiro/ActionPesquisaFaturasConsolidadas":
      component = <ActionPesquisaFaturasConsolidadas usuarioLogado={usuarioLogado}  />
      break;
    case "/financeiro/ActionPesquisaQuebraCaixaIntegracao":
      component = <ActionPesquisaQuebraCaixaIntegracao usuarioLogado={usuarioLogado}  />
      break;
    case "/financeiro/ActionPesquisaCriarAdiantamento":
      component = <ActionPesquisaCriarAdiantamento usuarioLogado={usuarioLogado} />
      break;
    case "/financeiro/ActionPesquisaAcompanharAdiantamentoFinanceiro":
      component = <ActionPesquisaAdiantamento usuarioLogado={usuarioLogado} />
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

                          <Suspense fallback={<div>Carregando...</div>}>
                            {resumoVisivel && !componentToShow && <ResumoDashBoardFinaneiro menuFilhoAtual={menuFilhoResumo} />}
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