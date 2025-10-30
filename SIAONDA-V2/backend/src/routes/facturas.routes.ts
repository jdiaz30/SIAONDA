import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getFacturas,
  getFactura,
  createFactura,
  pagarFactura,
  anularFactura,
  getEstadosFactura,
  getReporteVentas,
  deleteFactura
} from '../controllers/facturas.controller';

const router = Router();
router.use(authenticate);

// Catálogos y reportes
router.get('/estados', getEstadosFactura);
router.get('/reporte/ventas', getReporteVentas);

// CRUD principal
router.get('/', getFacturas);
router.get('/:id', getFactura);
router.post('/', createFactura);
router.delete('/:id', deleteFactura);

// Operaciones especiales
router.put('/:id/pagar', pagarFactura);
router.put('/:id/anular', anularFactura);

export default router;
