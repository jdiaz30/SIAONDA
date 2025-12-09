import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getEstadisticasDashboard,
  getFormularios,
  getFormulariosDevueltos,
  getFormulariosEnRevision,
  getCertificadosPendientes,
  enviarARegistro,
  corregirYReenviar,
  registrarEntrega,
  getHistorial,
} from '../controllers/aau.controller';

const router = Router();

// Todas las rutas de AaU requieren autenticación
router.use(authenticate);

// Estadísticas
router.get('/estadisticas/dashboard', getEstadisticasDashboard);

// Consultas de formularios
router.get('/formularios', getFormularios);
router.get('/formularios/devueltos', getFormulariosDevueltos);
router.get('/formularios/en-revision', getFormulariosEnRevision);
router.get('/formularios/pendientes-entrega', getCertificadosPendientes);

// Acciones sobre formularios
router.post('/formularios/:id/enviar-registro', enviarARegistro);
router.post('/formularios/:id/corregir-reenviar', corregirYReenviar);
router.post('/formularios/:id/entregar', registrarEntrega);

// Historial
router.get('/formularios/:id/historial', getHistorial);

export default router;
