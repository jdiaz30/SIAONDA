import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getProductos,
  getProducto,
  getCamposProducto,
  getCostoProducto,
  getCategorias
} from '../controllers/productos.controller';

const router = Router();
router.use(authenticate);

router.get('/categorias', getCategorias);
router.get('/', getProductos);
router.get('/:id', getProducto);
router.get('/:id/campos', getCamposProducto);
router.get('/:id/costo', getCostoProducto);

export default router;
