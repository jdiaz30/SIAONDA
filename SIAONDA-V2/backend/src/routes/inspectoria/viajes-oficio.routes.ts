import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { upload } from '../../middleware/upload';
import * as viajesController from '../../controllers/inspectoria/viajes-oficio.controller';

const router = Router();

router.use(authenticate);

// CRUD de viajes
router.post('/', viajesController.crearViaje);
router.post('/nuevo', viajesController.crearViaje); // <-- RUTA AGREGADA
router.get('/', viajesController.listarViajes);
router.get('/:id', viajesController.obtenerViaje);

// Acciones sobre viajes
router.put('/:id/cerrar', upload.single('informeGeneral'), viajesController.cerrarViaje);
router.put('/:id/cancelar', viajesController.cancelarViaje);

export default router;