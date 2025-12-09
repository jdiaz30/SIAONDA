import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import * as denunciasController from '../controllers/denuncias.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// CRUD de denuncias
router.post(
  '/',
  upload.fields([
    { name: 'cedulaDenunciante', maxCount: 1 },
    { name: 'comunicacion', maxCount: 1 }
  ]),
  denunciasController.registrarDenuncia
);
router.get('/', denunciasController.listarDenuncias);
router.get('/:id', denunciasController.obtenerDenuncia);

// Acciones sobre denuncias
router.put('/:id/asociar-factura', denunciasController.asociarFactura);
router.put('/:id/asignar-inspector', denunciasController.asignarInspector);

export default router;
