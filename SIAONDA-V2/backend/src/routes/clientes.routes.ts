import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import {
  getClientes,
  getCliente,
  createCliente,
  updateCliente,
  deleteCliente,
  buscarClientes,
  buscarPorIdentificacion,
  getTiposCliente,
  getNacionalidades,
  uploadArchivo,
  deleteArchivo
} from '../controllers/clientes.controller';

const router = Router();
router.use(authenticate);

// Rutas de catálogos
router.get('/tipos', getTiposCliente);
router.get('/nacionalidades', getNacionalidades);

// Búsqueda especial
router.get('/buscar', buscarClientes); // Nueva ruta para búsqueda general
router.get('/buscar/identificacion/:identificacion', buscarPorIdentificacion);

// CRUD principal
router.get('/', getClientes);
router.get('/:id', getCliente);
router.post('/', createCliente);
router.put('/:id', updateCliente);
router.delete('/:id', deleteCliente);

// Archivos
router.post('/:id/archivos', upload.single('archivo'), uploadArchivo);
router.delete('/:id/archivos/:archivoId', deleteArchivo);

export default router;
