import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DashboardRegistroPage from './pages/DashboardRegistroPage';
import UsuariosPage from './pages/UsuariosPage';
import ClientesPage from './pages/clientes/ClientesPage';
import ClienteFormPage from './pages/clientes/ClienteFormPage';
import ClienteDetailPage from './pages/clientes/ClienteDetailPage';
import FormulariosPage from './pages/formularios/FormulariosPage';
import FormularioFormPage from './pages/formularios/FormularioFormPage';
import FormularioDetallePage from './pages/formularios/FormularioDetallePage';
import FormularioIRCPage from './pages/formularios/FormularioIRCPage';
import CertificadosPage from './pages/CertificadosPage';
import FacturasPage from './pages/FacturasPage';
import CajasPage from './pages/cajas/CajasPage';
import CajaOperacionPage from './pages/cajas/CajaOperacionPage';
import SolicitudesIRCPage from './pages/cajas/SolicitudesIRCPage';
import DashboardInspectoriaPage from './pages/inspectoria/DashboardInspectoriaPage';
import EmpresasPage from './pages/inspectoria/EmpresasPage';
import EmpresaFormPage from './pages/inspectoria/EmpresaFormPage';
import EmpresaDetailPage from './pages/inspectoria/EmpresaDetailPage';
import EmpresaEditIRCPage from './pages/inspectoria/EmpresaEditIRCPage';
import EmpresasVencidasPage from './pages/inspectoria/EmpresasVencidasPage';
import SolicitudesPage from './pages/inspectoria/SolicitudesPage';
import SolicitudFormPage from './pages/inspectoria/SolicitudFormPage';
import SolicitudWorkflowPage from './pages/inspectoria/SolicitudWorkflowPage';
import CasosPage from './pages/inspectoria/CasosPage';
import CasoFormPage from './pages/inspectoria/CasoFormPage';
import CasoDetailPage from './pages/inspectoria/CasoDetailPage';
import RegistrosAsentamientoPage from './pages/inspectoria/RegistrosAsentamientoPage';
import CertificadosPendientesInspectoriaPage from './pages/inspectoria/CertificadosPendientesPage';
import CertificadosPendientesPage from './pages/CertificadosPendientesPage';

import ViajesOficioPage from './pages/inspectoria/ViajesOficioPage';
import ViajeOficioFormPage from './pages/inspectoria/ViajeOficioFormPage';
import ViajeOficioDetallePage from './pages/inspectoria/ViajeOficioDetallePage';
import ActaOficioFormPage from './pages/inspectoria/ActaOficioFormPage';
import ActasListPage from './pages/inspectoria/ActasListPage';
import ActaOficioEditPage from './pages/inspectoria/ActaOficioEditPage';
import CasosJuridicosPage from './pages/juridico/CasosJuridicosPage';
import DashboardAauPage from './pages/aau/DashboardAauPage';
import FormulariosListPage from './pages/aau/FormulariosListPage';
import FormulariosDevueltosPage from './pages/aau/FormulariosDevueltosPage';
import NuevoRegistroObraPage from './pages/aau/NuevoRegistroObraPage';
import MainLayout from './layouts/MainLayout';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />

        {isAuthenticated ? (
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/registro" element={<DashboardRegistroPage />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/clientes/nuevo" element={<ClienteFormPage />} />
            <Route path="/clientes/:id" element={<ClienteDetailPage />} />
            <Route path="/clientes/:id/editar" element={<ClienteFormPage />} />
            <Route path="/formularios" element={<FormulariosPage />} />
            <Route path="/formularios/nuevo" element={<FormularioFormPage />} />
            <Route path="/formularios/irc/nuevo" element={<FormularioIRCPage />} />
            <Route path="/formularios/irc/:id/editar" element={<FormularioIRCPage />} />
            <Route path="/formularios/:id" element={<FormularioDetallePage />} />
            <Route path="/formularios/:id/editar" element={<FormularioFormPage />} />
            <Route path="/certificados" element={<CertificadosPage />} />
            <Route path="/facturas" element={<FacturasPage />} />
            <Route path="/cajas" element={<CajasPage />} />
            <Route path="/cajas/operaciones" element={<CajaOperacionPage />} />
            <Route path="/cajas/solicitudes-irc" element={<SolicitudesIRCPage />} />
            <Route path="/inspectoria" element={<DashboardInspectoriaPage />} />
            <Route path="/inspectoria/empresas" element={<EmpresasPage />} />
            <Route path="/inspectoria/empresas/vencidas" element={<EmpresasVencidasPage />} />
            <Route path="/inspectoria/empresas/nueva" element={<EmpresaFormPage />} />
            <Route path="/inspectoria/empresas/:id" element={<EmpresaDetailPage />} />
            <Route path="/inspectoria/empresas/:id/editar" element={<EmpresaEditIRCPage />} />
            <Route path="/inspectoria/solicitudes" element={<SolicitudesPage />} />
            <Route path="/inspectoria/solicitudes/pagadas" element={<RegistrosAsentamientoPage />} />
            <Route path="/inspectoria/solicitudes/certificados-pendientes" element={<CertificadosPendientesInspectoriaPage />} />
            <Route path="/inspectoria/solicitudes/nueva" element={<SolicitudFormPage />} />
            <Route path="/inspectoria/solicitudes/:id" element={<SolicitudWorkflowPage />} />
            <Route path="/inspectoria/casos" element={<CasosPage />} />
            <Route path="/inspectoria/casos/nuevo" element={<CasoFormPage />} />
            <Route path="/inspectoria/casos/:id" element={<CasoDetailPage />} />

            {/* Nuevo flujo de inspecciones */}
            <Route path="/inspectoria/viajes-oficio" element={<ViajesOficioPage />} />
            <Route path="/inspectoria/viajes-oficio/nuevo" element={<ViajeOficioFormPage />} />
            <Route path="/inspectoria/viajes-oficio/:id" element={<ViajeOficioDetallePage />} />
            <Route path="/inspectoria/actas-oficio/registrar" element={<ActaOficioFormPage />} />
            <Route path="/inspectoria/viajes-oficio/:viajeId/actas" element={<ActasListPage />} />
            <Route path="/inspectoria/actas-oficio/:actaId/editar" element={<ActaOficioEditPage />} />

            <Route path="/certificados-pendientes" element={<CertificadosPendientesPage />} />

            {/* Rutas de Atención al Usuario */}
            <Route path="/aau" element={<DashboardAauPage />} />
            <Route path="/aau/formularios" element={<FormulariosListPage />} />
            <Route path="/aau/formularios/devueltos" element={<FormulariosDevueltosPage />} />
            <Route path="/aau/formularios/nuevo" element={<NuevoRegistroObraPage />} />

            {/* Rutas de Jurídico */}
            <Route path="/juridico" element={<CasosJuridicosPage />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
