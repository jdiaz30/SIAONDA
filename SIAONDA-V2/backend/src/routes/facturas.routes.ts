import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getFacturas,
  getFactura,
  createFactura,
  createFacturaDesdeFormulario,
  pagarFactura,
  anularFactura,
  getEstadosFactura,
  getMetodosPago,
  getReporteVentas,
  deleteFactura,
  imprimirFactura
} from '../controllers/facturas.controller';

const router = Router();

// Ruta pública (sin autenticación) - para impresión
router.get('/:id/imprimir', imprimirFactura);

// Todas las demás rutas requieren autenticación
router.use(authenticate);

// Catálogos y reportes
router.get('/estados', getEstadosFactura);
router.get('/metodos-pago', getMetodosPago);
router.get('/reporte/ventas', getReporteVentas);

// CRUD principal
router.get('/', getFacturas);
router.get('/:id', getFactura);
router.post('/', createFactura);
router.post('/desde-formulario', createFacturaDesdeFormulario);
router.delete('/:id', deleteFactura);

// Operaciones especiales
router.put('/:id/pagar', pagarFactura);
router.put('/:id/anular', anularFactura);

export default router;
