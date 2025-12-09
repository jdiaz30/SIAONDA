import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getCajas,
  getCaja,
  abrirCaja,
  cerrarCaja,
  generarReporteCierre,
  getCajaActiva,
  getEstadosCaja,
  deleteCaja,
  getSolicitudesPendientes,
  cobrarSolicitud
} from '../controllers/cajas.controller';

const router = Router();
router.use(authenticate);

// Catálogos y operaciones especiales
router.get('/estados', getEstadosCaja);
router.get('/usuario/activa', getCajaActiva);

// Solicitudes IRC - Integración con Caja
router.get('/solicitudes-pendientes', getSolicitudesPendientes);
router.post('/cobrar-solicitud/:id', cobrarSolicitud);

// CRUD principal
router.get('/', getCajas);
router.get('/:id', getCaja);
router.delete('/:id', deleteCaja);

// Operaciones de apertura/cierre
router.post('/abrir', abrirCaja);
router.post('/:id/cerrar', cerrarCaja);
router.get('/:id/reporte', generarReporteCierre);

export default router;
