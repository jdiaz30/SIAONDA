import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as dashboardController from '../controllers/dashboard.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Obtener estadísticas del dashboard
router.get('/stats', dashboardController.getStats);

export default router;
