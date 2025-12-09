import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import catalogosRoutes from './catalogos.routes';
import empresasRoutes from './empresas.routes';
import solicitudesRoutes from './solicitudes.routes';
import casosRoutes from './casos.routes';
import dashboardRoutes from './dashboard.routes';
import certificadosRoutes from './certificados.routes';
import viajesOficioRoutes from './viajes-oficio.routes';
import actasOficioRoutes from './actas-oficio.routes';

const router = Router();

// Todas las rutas de inspectoría requieren autenticación
router.use(authenticate);

// Montar rutas de Inspectoría
router.use('/catalogos', catalogosRoutes);
router.use('/empresas', empresasRoutes);
router.use('/solicitudes', solicitudesRoutes);
router.use('/casos', casosRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/certificados', certificadosRoutes);

// Nuevo flujo de inspecciones
router.use('/viajes-oficio', viajesOficioRoutes);
router.use('/actas-oficio', actasOficioRoutes);

export default router;
