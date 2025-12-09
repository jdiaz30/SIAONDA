import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const prisma = new PrismaClient();
const unlinkAsync = promisify(fs.unlink);

// Configuración de multer para archivos grandes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../../uploads/formularios');

    // Crear directorio si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generar nombre único: timestamp-random-original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext)
      .replace(/[^a-z0-9]/gi, '_')
      .substring(0, 50);

    cb(null, `${uniqueSuffix}-${baseName}${ext}`);
  }
});

// Filtro de tipos de archivo permitidos
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Permitir la mayoría de tipos de archivos comunes para obras
  const allowedMimes = [
    // Documentos
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',

    // Imágenes
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
    'image/tiff',
    'image/svg+xml',

    // Audio
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/mp4',
    'audio/aac',
    'audio/flac',
    'audio/x-ms-wma',

    // Video
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-ms-wmv',
    'video/webm',
    'video/ogg',

    // Archivos comprimidos
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/gzip',

    // CAD y diseño
    'application/dwg',
    'application/dxf',
    'image/vnd.adobe.photoshop',
    'application/postscript'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`));
  }
};

// Configurar multer con límite de 15GB
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024 * 1024 // 15GB en bytes
  }
});

// Subir archivo a un formulario
export const uploadArchivo = async (req: AuthRequest, res: Response) => {
  try {
    const { formularioId, formularioProductoId, campoId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No se recibió ningún archivo'
      });
    }

    if (!formularioId) {
      // Eliminar archivo subido si falta formularioId
      await unlinkAsync(file.path);
      return res.status(400).json({
        success: false,
        message: 'formularioId es requerido'
      });
    }

    // Verificar que el formulario existe
    const formulario = await prisma.formulario.findUnique({
      where: { id: Number(formularioId) }
    });

    if (!formulario) {
      await unlinkAsync(file.path);
      return res.status(404).json({
        success: false,
        message: 'Formulario no encontrado'
      });
    }

    // Crear registro del archivo
    const archivo = await prisma.formularioArchivo.create({
      data: {
        formularioId: Number(formularioId),
        formularioProductoId: formularioProductoId ? Number(formularioProductoId) : null,
        campoId: campoId ? Number(campoId) : null,
        nombreOriginal: file.originalname,
        nombreSistema: file.filename,
        ruta: file.path,
        tamano: BigInt(file.size),
        mimeType: file.mimetype
      }
    });

    // Convertir BigInt a string para JSON
    const archivoResponse = {
      ...archivo,
      tamano: archivo.tamano.toString()
    };

    res.status(201).json({
      success: true,
      message: 'Archivo subido exitosamente',
      data: archivoResponse
    });
  } catch (error: any) {
    console.error('Error al subir archivo:', error);

    // Eliminar archivo si hubo error
    if (req.file) {
      try {
        await unlinkAsync(req.file.path);
      } catch (unlinkError) {
        console.error('Error al eliminar archivo:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Error al subir archivo'
    });
  }
};

// Obtener archivos de un formulario
export const getArchivosByFormulario = async (req: AuthRequest, res: Response) => {
  try {
    const { formularioId } = req.params;

    const archivos = await prisma.formularioArchivo.findMany({
      where: {
        formularioId: Number(formularioId)
      },
      include: {
        campo: {
          select: {
            campo: true,
            titulo: true
          }
        },
        formularioProducto: {
          select: {
            id: true,
            producto: {
              select: {
                nombre: true
              }
            }
          }
        }
      },
      orderBy: {
        creadoEn: 'desc'
      }
    });

    // Convertir BigInt a string
    const archivosResponse = archivos.map(archivo => ({
      ...archivo,
      tamano: archivo.tamano.toString()
    }));

    res.json({
      success: true,
      data: archivosResponse
    });
  } catch (error) {
    console.error('Error al obtener archivos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener archivos'
    });
  }
};

// Descargar archivo
export const descargarArchivo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const archivo = await prisma.formularioArchivo.findUnique({
      where: { id: Number(id) }
    });

    if (!archivo) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }

    // Verificar que el archivo existe en el sistema
    if (!fs.existsSync(archivo.ruta)) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado en el sistema de archivos'
      });
    }

    // Enviar archivo
    res.download(archivo.ruta, archivo.nombreOriginal);
  } catch (error) {
    console.error('Error al descargar archivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al descargar archivo'
    });
  }
};

// Ver/preview archivo
export const verArchivo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const archivo = await prisma.formularioArchivo.findUnique({
      where: { id: Number(id) }
    });

    if (!archivo) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }

    // Verificar que el archivo existe
    if (!fs.existsSync(archivo.ruta)) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado en el sistema de archivos'
      });
    }

    // Enviar archivo para visualización en navegador
    res.setHeader('Content-Type', archivo.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${archivo.nombreOriginal}"`);

    const fileStream = fs.createReadStream(archivo.ruta);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error al ver archivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al ver archivo'
    });
  }
};

// Eliminar archivo
export const deleteArchivo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const archivo = await prisma.formularioArchivo.findUnique({
      where: { id: Number(id) },
      include: {
        formulario: {
          include: {
            estado: true
          }
        }
      }
    });

    if (!archivo) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }

    // Solo permitir eliminar archivos de formularios en estado Pendiente
    if (archivo.formulario.estado.nombre !== 'Pendiente') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden eliminar archivos de formularios en estado Pendiente'
      });
    }

    // Eliminar archivo físico
    if (fs.existsSync(archivo.ruta)) {
      await unlinkAsync(archivo.ruta);
    }

    // Eliminar registro de base de datos
    await prisma.formularioArchivo.delete({
      where: { id: Number(id) }
    });

    res.json({
      success: true,
      message: 'Archivo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar archivo'
    });
  }
};
