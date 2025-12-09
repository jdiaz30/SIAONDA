import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import {
  upload,
  uploadArchivo,
  getArchivosByFormulario,
  descargarArchivo,
  verArchivo,
  deleteArchivo
} from '../../controllers/aau/archivos.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// POST /api/aau/archivos/upload - Subir archivo (hasta 15GB)
router.post('/upload', upload.single('archivo'), uploadArchivo);

// GET /api/aau/archivos/formulario/:formularioId - Obtener archivos de un formulario
router.get('/formulario/:formularioId', getArchivosByFormulario);

// GET /api/aau/archivos/:id/descargar - Descargar archivo
router.get('/:id/descargar', descargarArchivo);

// GET /api/aau/archivos/:id/ver - Ver/preview archivo
router.get('/:id/ver', verArchivo);

// DELETE /api/aau/archivos/:id - Eliminar archivo
router.delete('/:id', deleteArchivo);

export default router;
