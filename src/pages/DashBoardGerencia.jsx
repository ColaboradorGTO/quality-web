import React, { Fragment, useEffect, useState, Suspense, lazy } from "react"
import { MenuSidebarAdmin } from "../componets/Sidebar/sidebar";
import { HeaderMain } from "../componets/Header";
import { MenuButton } from "../componets/Buttons/menuButton";
import { FooterMain } from "../componets/Footer";
import { SidebarProvider } from "../componets/Sidebar/SidebarContext";
import { useFetchData } from "../hooks/useFetchData";
import { useQuery } from "react-query";
import { get } from "../api/funcRequest";

const ResumoDashBoardGerencia = lazy(() => import("../componets/Gerencia/ResumoGerencia/ResumoDashBoardGerencia").then(module => ({ default: module.ResumoDashBoardGerencia })));
const ActionPesquisaProdutosQuality = lazy(() => import("../componets/Gerencia/Components/ActionProdutosQuality/actionPesquisaProdutosQuality").then(module => ({ default: module.ActionPesquisaProdutosQuality })));
const ActionPesquisaProdutosSap = lazy(() => import("../componets/Gerencia/Components/ActionProdutosSAP/actionPesquisaProdutosSap").then(module => ({ default: module.ActionPesquisaProdutosSap })));
const ActionPesquisaAdiantamentoSalarioLoja = lazy(() => import("../componets/Gerencia/Components/ActionAdiantamentoSalario/actionPesquisaAdiantamentoSalarioLoja").then(module => ({ default: module.ActionPesquisaAdiantamentoSalarioLoja })));
const ActionPesquisaDepositoLoja = lazy(() => import("../componets/Gerencia/Components/ActionDepositoLoja/actionPesquisaDepositoLoja").then(module => ({ default: module.ActionPesquisaDepositoLoja })));
const ActionPesquisaDespesaLoja = lazy(() => import("../componets/Gerencia/Components/ActionDespesas/actionPesquisaDespesasLoja").then(module => ({ default: module.ActionPesquisaDespesaLoja })));
const ActionPesquisaValeTransporte = lazy(() => import("../componets/Gerencia/Components/ActionValeTransporte/actionPesquisaValeTransporte").then(module => ({ default: module.ActionPesquisaValeTransporte })));
const ActionPesquisaConferenciaCaixa = lazy(() => import("../componets/Gerencia/Components/ActionConferenciaCaixa/actionPesquisaConferenciaCaixa").then(module => ({ default: module.ActionPesquisaConferenciaCaixa })));
const ActionPesquisaFaturaLoja = lazy(() => import("../componets/Gerencia/Components/ActionFaturas/actionPesquisaFaturaLoja").then(module => ({ default: module.ActionPesquisaFaturaLoja })));
const ActionPesquisaCreateVoucher = lazy(() => import("../componets/Gerencia/Components/ActionCreateVoucher/actionPesquisaCreateVoucher").then(module => ({ default: module.ActionPesquisaCreateVoucher })));
const ActionPesquisaVoucherEmitido = lazy(() => import("../componets/Gerencia/Components/ActionVoucher/actionPesquisaVoucheEmitidosr").then(module => ({ default: module.ActionPesquisaVoucherEmitido })));
const ActionPesquisaQuebraCaixa = lazy(() => import("../componets/Gerencia/Components/ActionQuebraCaixaLoja/actionPesquisaQuebraCaixa").then(module => ({ default: module.ActionPesquisaQuebraCaixa })));
const ActionPesquisaOT = lazy(() => import("../componets/Gerencia/Components/ActionOrdemTransferencia/ActionPesquisaOT").then(module => ({ default: module.ActionPesquisaOT })));
const ActionPesquisaAlteracaoPreco = lazy(() => import("../componets/Gerencia/Components/ActionAlteracaoPreco/actionPesquisaAlteracaoPreco").then(module => ({ default: module.ActionPesquisaAlteracaoPreco })));
const ActionPesquisaClientesVendas = lazy(() => import("../componets/Gerencia/Components/ActionClientesVendas/actionPesquisaClientesVendas").then(module => ({ default: module.ActionPesquisaClientesVendas })));
const ActionPesquisaExtratoContaCorenteLoja = lazy(() => import("../componets/Gerencia/Components/ActionExtratoDeContaCorrente/actionPesquisaExtratoContaCorrenteLoja").then(module => ({ default: module.ActionPesquisaExtratoContaCorenteLoja })));
const ActionPesquisaVendasLojas = lazy(() => import("../componets/Gerencia/Components/ActionVendasLojas/actionPesquisaVendasLojas").then(module => ({ default: module.ActionPesquisaVendasLojas })));
const ActionPesquisaVendasVendedor = lazy(() => import("../componets/Gerencia/Components/ActionVendasVendedor/actionPesquisaVendasVendedor").then(module => ({ default: module.ActionPesquisaVendasVendedor })));
const ActionPesquisaVendasEstrutura = lazy(() => import("../componets/Gerencia/Components/ActionEstruturaMercadologica/actionPesquisaVendasEstrutura").then(module => ({ default: module.ActionPesquisaVendasEstrutura })));
const ActionPesquisaVendasDescontoFuncionario = lazy(() => import("../componets/Gerencia/Components/ActionDescontoFuncionario/actionPesquisaVendasDescontoFuncionario").then(module => ({ default: module.ActionPesquisaVendasDescontoFuncionario })));
const ActionPesquisaEstoqueLoja = lazy(() => import("../componets/Gerencia/Components/ActionEstoqueLoja/actionPesquisaEstoqueLoja").then(module => ({ default: module.ActionPesquisaEstoqueLoja })));
const ActionPesquisaBalancoLoja = lazy(() => import("../componets/Gerencia/Components/ActionBalancoPorLoja/actionPesquisaBalancoLoja").then(module => ({ default: module.ActionPesquisaBalancoLoja })));
const ActionPesquisaEmpresas = lazy(() => import("../componets/Gerencia/Components/ActionEmpresas/actionPesquisaEmpresas").then(module => ({ default: module.ActionPesquisaEmpresas })));
const ActionPesquisaConferenciaMalote = lazy(() => import("../componets/Gerencia/Components/ActionConferenciaMalote/actionPesquisaConferenciaMalote").then(module => ({ default: module.ActionPesquisaConferenciaMalote })));
const ActionPesquisaProdutoEtiqueta = lazy(() => import("../componets/Gerencia/Components/ActionProdutoEtiqueta/actionPesquisaProdutoEtiqueta").then(module => ({ default: module.ActionPesquisaProdutoEtiqueta })));
const ActionPesquisaEtiquetaRemarcacao = lazy(() => import("../componets/Gerencia/Components/ActionEtiquetaRemarcacao/actionPesquisaEtiquetaRemarcacao").then(module => ({ default: module.ActionPesquisaEtiquetaRemarcacao })));
const ActionPesquisaRecebimentosLoja = lazy(() => import("../componets/Gerencia/Components/ActionListaRecebimentosLoja/actionPesquisaRecebimentosLoja").then(module => ({ default: module.ActionPesquisaRecebimentosLoja })));
const ActionRelatorioBI = lazy(() => import("../componets/Gerencia/Components/ActionBI/actionRelatorioBI").then(module => ({ default: module.ActionRelatorioBI })));
const ActionPesquisaEtiquetasVolumes = lazy(() => import("../componets/Gerencia/Components/ActionEtiquetasVolumes/actionPesquisaEtiquetasVolumes").then(module => ({ default: module.ActionPesquisaEtiquetasVolumes })));
const ActionPesquisaVendaVoucher = lazy(() => import("../componets/Gerencia/Components/ActionVendaVoucher/actionPesquisaVendaVoucher").then(module => ({ default: module.ActionPesquisaVendaVoucher })));
const ActionPesquisaVendasDigitais = lazy(() => import("../componets/Gerencia/Components/ActionVendasDigitais/actionPesquisaVendasDigitais").then(module => ({ default: module.ActionPesquisaVendasDigitais })));
const ActionPesquisaMetas = lazy(() => import("../componets/Gerencia/Components/ActionMetas/actionPesquisaMetas").then(module => ({ default: module.ActionPesquisaMetas })));

export const DashBoardGerencia = () => {
  const storedModule = localStorage.getItem('moduloselecionado');
  const selectedModule = JSON.parse(storedModule);
  const [menuSelected, setMenuSelected] = useState(null);
  const [menuFilhoSelecionado, setMenuFilhoSelecionado] = useState(null);

  const [resumoVisivel, setResumoVisivel] = useState(true);
  const [componentToShow, setComponentToShow] = useState("");
  const [usuarioLogado, setUsuarioLogado] = useState(null);

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

  const { data: optionsEmpresas = [] } = useFetchData('empresas', '/empresas');
  const { data: optionsModulosPage = [], error: errorModulos, isLoading: isLoadingModulos, refetch: refetchModulos } = useQuery(
    ['menus-usuario', selectedModule],
    async () => {
      const response = await get(`/menus-usuario?idUsuario=${usuarioLogado?.id}&idModulo=${selectedModule?.ID}`);

      return response.data;
    },
    { enabled: Boolean(usuarioLogado?.id), staleTime: 5 * 60 * 1000, }
  );

  const menuFilhoResumo = selectedModule?.menuPai?.menuFilho?.find(
    menu => menu.URL === "/gerencia/ResumoDashBoardGerencia"
  );

  const permissaoUsuario = selectedModule.menuPai.menuFilho;
  const {
    ID,
    IDPERFIL
  } = permissaoUsuario.map(item => ({
    ID: item.ID,
    IDPERFIL: item.IDPERFIL,
  })).reduce((acc, curr) => {

    return { ...acc, ...curr };
  }, {});


  let component = null;

  switch (componentToShow) {
    case "/gerencia/ResumoDashBoardGerencia":
      component = <ResumoDashBoardGerencia usuarioLogado={usuarioLogado} menuFilhoAtual={menuFilhoResumo} />;
      break;
    case "/gerencia/ActionPesquisaProdutoEtiqueta":
      component = <ActionPesquisaProdutoEtiqueta usuarioLogado={usuarioLogado} optionsEmpresas={optionsEmpresas} />;
      break;
    case "/gerencia/ActionPesquisaEtiquetaRemarcacao":
      component = <ActionPesquisaEtiquetaRemarcacao usuarioLogado={usuarioLogado} optionsEmpresas={optionsEmpresas} />;
      break;
    case "/gerencia/ActionPesquisaProdutosQuality":
      component = <ActionPesquisaProdutosQuality usuarioLogado={usuarioLogado} optionsEmpresas={optionsEmpresas} />;
      break;
    case "/gerencia/ActionPesquisaProdutosSap":
      component = <ActionPesquisaProdutosSap usuarioLogado={usuarioLogado} optionsEmpresas={optionsEmpresas} />;
      break;
    case "/gerencia/ActionPesquisaAdiantamentoSalarioLoja":
      component = <ActionPesquisaAdiantamentoSalarioLoja usuarioLogado={usuarioLogado} optionsEmpresas={optionsEmpresas} />
      break;
    case "/gerencia/ActionPesquisaDepositoLoja":
      component = <ActionPesquisaDepositoLoja usuarioLogado={usuarioLogado} optionsEmpresas={optionsEmpresas} />
      break;
    case "/gerencia/ActionPesquisaDespesaLoja":
      component = <ActionPesquisaDespesaLoja usuarioLogado={usuarioLogado} optionsEmpresas={optionsEmpresas} />
      break;
    case "/gerencia/ActionPesquisaValeTransporte":
      component = <ActionPesquisaValeTransporte usuarioLogado={usuarioLogado} />
      break;
    case "/gerencia/ActionPesquisaConferenciaCaixa":
      component = <ActionPesquisaConferenciaCaixa usuarioLogado={usuarioLogado} optionsEmpresas={optionsEmpresas} />
      break;
    case "/gerencia/ActionPesquisaFaturaLoja":
      component = <ActionPesquisaFaturaLoja usuarioLogado={usuarioLogado} optionsEmpresas={optionsEmpresas} />
      break;
    case "/gerencia/ActionPesquisaCreateVoucher":
      component = <ActionPesquisaCreateVoucher usuarioLogado={usuarioLogado} optionsEmpresas={optionsEmpresas} />
      break;
    case "/gerencia/ActionPesquisaVoucherEmitido":
      component = <ActionPesquisaVoucherEmitido usuarioLogado={usuarioLogado} />
      break;
    case "/gerencia/ActionPesquisaQuebraCaixa":
      component = <ActionPesquisaQuebraCaixa usuarioLogado={usuarioLogado} optionsEmpresas={optionsEmpresas} />
      break;
    case "/gerencia/ActionPesquisaConferenciaMalote":
      component = <ActionPesquisaConferenciaMalote usuarioLogado={usuarioLogado} />
      break;
    case "/gerencia/ActionPesquisaOT":
      component = <ActionPesquisaOT usuarioLogado={usuarioLogado} />
      break;
    case "/gerencia/ActionExtratoDeContasCorrenteLoja":
      component = <ActionPesquisaExtratoContaCorenteLoja usuarioLogado={usuarioLogado} optionsEmpresas={optionsEmpresas} />
      break;
    case "/gerencia/ActionPesquisaRecebimentosLoja":
      component = <ActionPesquisaRecebimentosLoja usuarioLogado={usuarioLogado} />
      break;
    case "/gerencia/ActionPesquisaVendasLojas":
      component = <ActionPesquisaVendasLojas usuarioLogado={usuarioLogado} optionsEmpresas={optionsEmpresas} />
      break;
    case "/gerencia/ActionPesquisaVendasVendedor":
      component = <ActionPesquisaVendasVendedor usuarioLogado={usuarioLogado} optionsEmpresas={optionsEmpresas} />
      break;
    case "/gerencia/ActionPesquisaVendasEstrutura":
      component = <ActionPesquisaVendasEstrutura usuarioLogado={usuarioLogado} optionsEmpresas={optionsEmpresas} />
      break;
    case "/gerencia/ActionPesquisaEstoqueLoja":
      component = <ActionPesquisaEstoqueLoja usuarioLogado={usuarioLogado} optionsEmpresas={optionsEmpresas} />
      break;
    case "/gerencia/ActionRelatorioBI":
      component = <ActionRelatorioBI usuarioLogado={usuarioLogado} />
      break;
    case "/gerencia/ActionPesquisaAlteracaoPreco":
      component = <ActionPesquisaAlteracaoPreco usuarioLogado={usuarioLogado} />
      break;
    case "/gerencia/ActionPesquisaEmpresas":
      component = <ActionPesquisaEmpresas usuarioLogado={usuarioLogado} optionsEmpresas={optionsEmpresas} />
      break;
    case "/gerencia/ActionPesquisaClientesVendas":
      component = <ActionPesquisaClientesVendas usuarioLogado={usuarioLogado} optionsEmpresas={optionsEmpresas} />
      break;
    case "/gerencia/ActionPesquisaVendasDescontoFuncionario":
      component = <ActionPesquisaVendasDescontoFuncionario usuarioLogado={usuarioLogado} optionsEmpresas={optionsEmpresas} />
      break;
    case "/gerencia/ActionPesquisaBalancoLoja":
      component = <ActionPesquisaBalancoLoja usuarioLogado={usuarioLogado} optionsEmpresas={optionsEmpresas} />
      break;
    case "/gerencia/ActionPesquisaVendaVoucher":
      component = <ActionPesquisaVendaVoucher usuarioLogado={usuarioLogado} />
      break;
    case "/gerencia/ActionPesquisaEtiquetasVolumes":
      component = <ActionPesquisaEtiquetasVolumes usuarioLogado={usuarioLogado} />
      break;
    case "/gerencia/ActionPesquisaVendasDigitais":
      component = <ActionPesquisaVendasDigitais usuarioLogado={usuarioLogado} optionsEmpresas={optionsEmpresas} />
      break;
    case "/gerencia/ActionPesquisaMetas":
      component = <ActionPesquisaMetas usuarioLogado={usuarioLogado} optionsEmpresas={optionsEmpresas} />
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
                              {resumoVisivel && !componentToShow && (
                                <ResumoDashBoardGerencia usuarioLogado={usuarioLogado} menuFilhoAtual={menuFilhoResumo} />
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
