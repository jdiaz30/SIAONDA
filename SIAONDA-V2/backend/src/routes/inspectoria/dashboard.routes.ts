import { Router } from 'express';
import {
  getDashboard,
  getEstadisticasMes,
  getEmpresasPorProvincia,
  getCasosPorTipo,
  getRenovacionesDelMes,
  getIngresosPorCategoria,
  getEmpresasConInfracciones,
  getEmpresasEnProcesoJuridico
} from '../../controllers/inspectoria/dashboard.controller';

const router = Router();

// Dashboard principal
router.get('/', getDashboard);

// Estadísticas
router.get('/estadisticas-mes', getEstadisticasMes);

// Reportes
router.get('/reportes/empresas-por-provincia', getEmpresasPorProvincia);
router.get('/reportes/casos-por-tipo', getCasosPorTipo);
router.get('/reportes/renovaciones-mes', getRenovacionesDelMes);
router.get('/reportes/ingresos-categoria', getIngresosPorCategoria);
router.get('/reportes/empresas-infracciones', getEmpresasConInfracciones);
router.get('/reportes/empresas-proceso-juridico', getEmpresasEnProcesoJuridico);

export default router;
