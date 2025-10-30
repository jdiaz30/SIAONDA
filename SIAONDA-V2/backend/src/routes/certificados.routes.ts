import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getCertificados,
  getCertificado,
  createCertificado,
  generarPDF,
  actualizarEstado,
  entregarCertificado,
  getEstadosCertificado,
  deleteCertificado
} from '../controllers/certificados.controller';

const router = Router();
router.use(authenticate);

// Catálogos
router.get('/estados', getEstadosCertificado);

// CRUD principal
router.get('/', getCertificados);
router.get('/:id', getCertificado);
router.post('/', createCertificado);
router.delete('/:id', deleteCertificado);

// Operaciones especiales
router.post('/:id/generar-pdf', generarPDF);
router.put('/:id/estado', actualizarEstado);
router.post('/:id/entregar', entregarCertificado);

export default router;
