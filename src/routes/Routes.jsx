import { Routes, Route, Navigate } from "react-router-dom";
import { Fragment, useEffect, useState, Suspense, lazy } from "react";
import AuthProvider, { useAuth } from "../Providers/AuthContext";
import { Home } from "../pages/Home";

// 🚀 Lazy Loading - só carrega quando o usuário acessa
const DashBoardAdministrativo = lazy(() => import("../pages/DashBoardAdministrativo").then(module => ({ default: module.DashBoardAdministrativo })));
const DashBoardFinanceiro = lazy(() => import("../pages/DashBoardFinanceiro").then(module => ({ default: module.DashBoardFinanceiro })));
const DashBoardVoucher = lazy(() => import("../pages/DashBoardVoucher").then(module => ({ default: module.DashBoardVoucher })));
const DashBoardMalotes = lazy(() => import("../pages/DashBoardMalotes").then(module => ({ default: module.DashBoardMalotes })));
const DashBoardRecursosHumanos = lazy(() => import("../pages/DashBoardRecursosHumanos").then(module => ({ default: module.DashBoardRecursosHumanos })));
const DashBoardPromocao = lazy(() => import("../pages/DashBoardPromocao").then(module => ({ default: module.DashBoardPromocao })));
const DashBoardComercial = lazy(() => import("../pages/DashBoardComercial").then(module => ({ default: module.DashBoardComercial })));
const DashBoardInformatica = lazy(() => import("../pages/DashBoardInformatica").then(module => ({ default: module.DashBoardInformatica })));
const ModuloTeste = lazy(() => import("../pages/ModuloTeste").then(module => ({ default: module.ModuloTeste })));
const Permissoes = lazy(() => import("../pages/Permissoes").then(module => ({ default: module.Permissoes })));
const DashBoardContabilidade = lazy(() => import("../pages/DashBoardContabilidade").then(module => ({ default: module.DashBoardContabilidade })));
const DashBoardMarketing = lazy(() => import("../pages/DashBoardMarketing").then(module => ({ default: module.DashBoardMarketing })));
const DashBoardGerencia = lazy(() => import("../pages/DashBoardGerencia").then(module => ({ default: module.DashBoardGerencia })));
const DashBoardEtiquetagem = lazy(() => import("../pages/DashBoardEtiquetagem").then(module => ({ default: module.DashBoardEtiquetagem })));
const DashBoardConferenciaCega = lazy(() => import("../pages/DashBoardConferenciaCega").then(module => ({ default: module.DashBoardConferenciaCega })));


const DashBoardCompras = lazy(() => import("../pages/DashBoardCompras").then(module => ({ default: module.DashBoardCompras })));
const DashBoardCadastro = lazy(() => import("../pages/DashBoardCadastro").then(module => ({ default: module.DashBoardCadastro })));
const DashBoardComprasDM = lazy(() => import("../pages/DashBoardComprasDm").then(module => ({ default: module.DashBoardComprasDM })));
const DashBoardExpedicao = lazy(() => import("../pages/DashBoardExpedicao").then(module => ({ default: module.DashBoardExpedicao })));

const DashBoardMenus = lazy(() => import("../pages/DashBoardMenus").then(module => ({ default: module.DashBoardMenus })));

// Componente de Loading
const PageLoader = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Carregando...</span>
    </div>
  </div>
);

export const RoutesMain = () => {
  const [componentToShow, setComponentToShow] = useState("");
  const [usuarioLogado, setUsuarioLogado] = useState(null);
   const { usuarioAutenticado } = useAuth();

  useEffect(() => {
    const usuarioArmazenado = localStorage.getItem('usuario');
    if (usuarioArmazenado) {
      const parsedUsuario = JSON.parse(usuarioArmazenado);
      setUsuarioLogado(parsedUsuario);
    }
  }, []);

 /*  useEffect(() => {

  }, [usuarioLogado]); */

 

  const handleShowComponent = (componentName) => {
    setComponentToShow(componentName);
  };

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/modulo" element={usuarioAutenticado ? <ModuloTeste  /> : <Navigate to="/"  />} />
        <Route path="/DashBoardFinanceiro" element={<DashBoardFinanceiro componentToShow={componentToShow} handleShowComponent={handleShowComponent}   />  } />
        <Route path="/DashBoardAdministrativo" element={<DashBoardAdministrativo componentToShow={componentToShow} handleShowComponent={handleShowComponent}  />  } />
        <Route path="/DashBoardGerencia" element={<DashBoardGerencia componentToShow={componentToShow} handleShowComponent={handleShowComponent}  /> } />
        <Route path="/DashBoardInformatica" element={<DashBoardInformatica componentToShow={componentToShow} handleShowComponent={handleShowComponent}   />  } />
        <Route path="/DashBoardContabilidade" element={ <DashBoardContabilidade componentToShow={componentToShow} handleShowComponent={handleShowComponent}  /> } />
        <Route path="/DashBoardRecursosHumanos" element={ <DashBoardRecursosHumanos componentToShow={componentToShow} handleShowComponent={handleShowComponent}  />  } />
        <Route path="/DashBoardPromocao" element={<DashBoardPromocao componentToShow={componentToShow} handleShowComponent={handleShowComponent}  /> }  />
        <Route path="/DashBoardMarketing" element={ <DashBoardMarketing componentToShow={componentToShow} handleShowComponent={handleShowComponent}  /> } />
        <Route path="/DashBoardPermissoes" element={<Permissoes  />  } />
        <Route path="/DashBoardMalotes" element={<DashBoardMalotes componentToShow={componentToShow} handleShowComponent={handleShowComponent}   /> } />  
        <Route path="/DashBoardVouchers" element={<DashBoardVoucher componentToShow={componentToShow} handleShowComponent={handleShowComponent}  /> } />
        <Route path="/DashBoardMenus" element={<DashBoardMenus componentToShow={componentToShow} handleShowComponent={handleShowComponent}  /> } />
        <Route path="/DashBoardCompras" element={<DashBoardCompras componentToShow={componentToShow} handleShowComponent={handleShowComponent}  /> } />
        <Route path="/DashBoardComprasAdm" element={<DashBoardComprasDM componentToShow={componentToShow} handleShowComponent={handleShowComponent}  /> } />
        <Route path="/DashBoardExpedicao" element={usuarioLogado ? <DashBoardExpedicao componentToShow={componentToShow} handleShowComponent={handleShowComponent}  /> : <Navigate to="/"/> } />
        <Route path="/DashBoardConferenciaCega" element={usuarioLogado ? <DashBoardConferenciaCega componentToShow={componentToShow} handleShowComponent={handleShowComponent}  /> : <Navigate to="/"/>} />
        <Route path="/DashBoardCadastro" element={<DashBoardCadastro componentToShow={componentToShow} handleShowComponent={handleShowComponent}  /> } />
        <Route path="/DashBoardComercial" element={<DashBoardComercial componentToShow={componentToShow} handleShowComponent={handleShowComponent}  /> } />
        <Route path="/DashBoardEtiquetagem" element={<DashBoardEtiquetagem componentToShow={componentToShow} handleShowComponent={handleShowComponent}  /> } />
      </Routes>
    </Suspense>
  );
};