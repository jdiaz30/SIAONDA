import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import {
  getFormularios,
  getFormularioById,
  createFormulario,
  updateEstadoFormulario,
  deleteFormulario,
  getEstadisticas
} from '../../controllers/aau/formularios.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/aau/formularios - Listar formularios con filtros
router.get('/', getFormularios);

// GET /api/aau/formularios/estadisticas - Obtener estadísticas
router.get('/estadisticas', getEstadisticas);

// GET /api/aau/formularios/:id - Obtener formulario por ID
router.get('/:id', getFormularioById);

// POST /api/aau/formularios - Crear nuevo formulario
router.post('/', createFormulario);

// PUT /api/aau/formularios/:id/estado - Actualizar estado
router.put('/:id/estado', updateEstadoFormulario);

// DELETE /api/aau/formularios/:id - Eliminar formulario (solo Pendiente)
router.delete('/:id', deleteFormulario);

export default router;
