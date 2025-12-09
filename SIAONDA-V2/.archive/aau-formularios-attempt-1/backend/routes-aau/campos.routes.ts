import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import {
  getCamposByProducto,
  getTiposCampos,
  getCamposGlobales,
  createCampo,
  updateCampo,
  deleteCampo
} from '../../controllers/aau/campos.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/aau/campos/tipos - Obtener tipos de campos
router.get('/tipos', getTiposCampos);

// GET /api/aau/campos/globales - Obtener campos globales
router.get('/globales', getCamposGlobales);

// GET /api/aau/campos/producto/:productoId - Obtener campos por producto
router.get('/producto/:productoId', getCamposByProducto);

// POST /api/aau/campos - Crear nuevo campo (admin)
router.post('/', createCampo);

// PUT /api/aau/campos/:id - Actualizar campo
router.put('/:id', updateCampo);

// DELETE /api/aau/campos/:id - Eliminar campo
router.delete('/:id', deleteCampo);

export default router;
