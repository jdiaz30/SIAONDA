import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { upload, handleMulterError } from '../middleware/upload';
import {
  getFormularios,
  getFormulario,
  createFormulario,
  createFormularioObra,
  updateFormulario,
  asentarFormulario,
  getEstadosFormulario,
  deleteFormulario,
  uploadArchivos,
  deleteArchivo
} from '../controllers/formularios.controller';

const router = Router();
router.use(authenticate);

router.get('/estados', getEstadosFormulario);
router.get('/', getFormularios);
router.get('/:id', getFormulario);
router.post('/', createFormulario);
router.post('/obras', createFormularioObra); // Nuevo endpoint para obras
router.put('/:id', updateFormulario);
router.post('/:id/asentar', asentarFormulario);
router.delete('/:id', deleteFormulario);

// Upload de archivos
router.post('/:id/archivos', upload.array('archivos', 10), handleMulterError, uploadArchivos);
router.delete('/:id/archivos/:archivoId', deleteArchivo);

export default router;
