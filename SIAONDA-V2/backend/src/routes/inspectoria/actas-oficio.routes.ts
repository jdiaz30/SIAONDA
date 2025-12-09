import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { upload } from '../../middleware/upload';
import * as actasController from '../../controllers/inspectoria/actas-oficio.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// CRUD de actas
router.post('/', upload.single('pdfActa'), actasController.registrarActa);
router.get('/viaje/:viajeId', actasController.listarActasDeViaje);
router.get('/:id', actasController.obtenerActa);
router.put('/:id', upload.single('pdfActa'), actasController.editarActa);

// Acciones sobre actas
router.post('/:id/generar-caso', actasController.generarCasoDesdeActa);

export default router;
