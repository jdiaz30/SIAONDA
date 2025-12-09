import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  crearSolicitud,
  validarSolicitud,
  marcarComoPagada,
  asentarSolicitud,
  devolverSolicitudAuU,
  generarCertificado,
  firmarCertificado,
  entregarCertificado,
  listarSolicitudes,
  obtenerSolicitud,
  obtenerCertificadosPendientesFirma,
  crearEmpresasFaltantes
} from '../../controllers/inspectoria/solicitudes.controller';

// Configuración de multer para carga de certificados firmados
const certificadosDir = path.join(__dirname, '../../../public/uploads/certificados');
if (!fs.existsSync(certificadosDir)) {
  fs.mkdirSync(certificadosDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, certificadosDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `cert-firmado-${uniqueSuffix}.pdf`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB máximo
  }
});

const router = Router();

// Listar y obtener
router.get('/', listarSolicitudes);
router.get('/:id', obtenerSolicitud);

// PASO 1 - Crear solicitud (AuU)
router.post('/', crearSolicitud);

// PASO 2 - Validar documentos (Inspectoría)
router.put('/:id/validar', validarSolicitud);

// PASO 3 - Marcar como pagada (Webhook desde Cajas)
router.post('/webhook/pago', marcarComoPagada);

// PASO 4 - Asentar (Paralegal - introducir número de asiento)
router.put('/:id/asentar', asentarSolicitud);

// PASO 4B - Devolver a AuU (Paralegal - si detecta errores)
router.put('/:id/devolver', devolverSolicitudAuU);

// PASO 5 - Generar certificado (Paralegal)
router.post('/:id/generar-certificado', generarCertificado);

// PASO 6 - Cargar certificado firmado (Paralegal)
router.put('/:id/firmar', upload.single('certificado'), firmarCertificado);

// PASO 7 - Entregar certificado (AuU)
router.post('/:id/entregar', entregarCertificado);

// MANTENIMIENTO - Crear empresas de solicitudes ya asentadas
router.post('/mantenimiento/crear-empresas-faltantes', crearEmpresasFaltantes);

export default router;
