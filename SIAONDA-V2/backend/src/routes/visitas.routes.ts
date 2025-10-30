import { Router } from 'express';
import {
  getVisitas,
  getVisita,
  createVisita,
  updateVisita,
  registrarSalida,
  deleteVisita
} from '../controllers/visitas.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

router.get('/', getVisitas);
router.get('/:id', getVisita);
router.post('/', createVisita);
router.put('/:id', updateVisita);
router.post('/:id/registrar-salida', registrarSalida);
router.delete('/:id', deleteVisita);

export default router;
