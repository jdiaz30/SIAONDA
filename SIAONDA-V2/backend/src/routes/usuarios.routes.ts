import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getUsuarios,
  getUsuario,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  cambiarContrasena
} from '../controllers/usuarios.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Solo administradores pueden gestionar usuarios
router.get('/', authorize('Administrador'), getUsuarios);
router.get('/:id', authorize('Administrador'), getUsuario);
router.post('/', authorize('Administrador'), createUsuario);
router.put('/:id', authorize('Administrador'), updateUsuario);
router.delete('/:id', authorize('Administrador'), deleteUsuario);

// Cualquier usuario puede cambiar su propia contraseña
router.post('/cambiar-contrasena', cambiarContrasena);

export default router;
