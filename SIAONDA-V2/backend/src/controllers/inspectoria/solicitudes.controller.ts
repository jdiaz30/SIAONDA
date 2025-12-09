import { AuthRequest } from '../../middleware/auth';
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { generarCertificadoIRCPDF } from '../../utils/generarCertificadoIRC';

const prisma = new PrismaClient();

/**
 * Generar código único para solicitud (SOL-INSP-YYYY-NNNN)
 */
const generarCodigoSolicitud = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const prefix = `SOL-INSP-${year}-`;

  // Buscar la última solicitud del año
  const ultimaSolicitud = await prisma.solicitudRegistroInspeccion.findFirst({
    where: {
      codigo: {
        startsWith: prefix
      }
    },
    orderBy: { codigo: 'desc' }
  });

  let numero = 1;
  if (ultimaSolicitud) {
    const ultimoNumero = parseInt(ultimaSolicitud.codigo.split('-').pop() || '0');
    numero = ultimoNumero + 1;
  }

  return `${prefix}${numero.toString().padStart(4, '0')}`;
};

/**
 * PASO 1 - AuU RECEPCIÓN: Crear nueva solicitud
 */
export const crearSolicitud = async (req: AuthRequest, res: Response) => {
  try {
    const {
      empresaId,
      tipoSolicitud, // 'REGISTRO_NUEVO' o 'RENOVACION'
      rnc,
      nombreEmpresa,
      nombreComercial,
      categoriaIrcId
    } = req.body;

    const usuarioId = req.usuario?.id || 1;

    // Validar si es renovación, debe existir la empresa
    if (tipoSolicitud === 'RENOVACION' && !empresaId) {
      return res.status(400).json({
        success: false,
        message: 'Para renovación debe proporcionar el ID de la empresa'
      });
    }

    // Si es registro nuevo, verificar que no exista el RNC
    if (tipoSolicitud === 'REGISTRO_NUEVO') {
      const empresaExistente = await prisma.empresaInspeccionada.findUnique({
        where: { rnc: rnc.replace(/-/g, '') }
      });

      if (empresaExistente) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una empresa con este RNC. Use tipo RENOVACION.',
          empresaId: empresaExistente.id
        });
      }
    }

    // Generar código único
    const codigo = await generarCodigoSolicitud();

    // Crear solicitud con estado PENDIENTE (id: 1)
    const solicitud = await prisma.solicitudRegistroInspeccion.create({
      data: {
        codigo,
        empresaId,
        tipoSolicitud,
        rnc: rnc.replace(/-/g, ''),
        nombreEmpresa,
        nombreComercial,
        categoriaIrcId,
        estadoId: 1, // PENDIENTE
        recibidoPorId: usuarioId,
        fechaRecepcion: new Date()
      },
      include: {
        empresa: {
          include: {
            categoriaIrc: true,
            provincia: true
          }
        },
        categoriaIrc: true,
        estado: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Solicitud creada exitosamente',
      data: solicitud
    });
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear solicitud',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * PASO 2 - INSPECTORÍA VALIDACIÓN: Validar documentos
 */
export const validarSolicitud = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { aprobada, motivo } = req.body;
    const usuarioId = req.usuario?.id || 1;

    const solicitud = await prisma.solicitudRegistroInspeccion.findUnique({
      where: { id: Number(id) },
      include: { categoriaIrc: true }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    if (solicitud.estadoId !== 1) { // Debe estar en PENDIENTE
      return res.status(400).json({
        success: false,
        message: 'La solicitud no está en estado PENDIENTE'
      });
    }

    if (aprobada) {
      // 1. Buscar o crear empresa en EmpresaInspeccionada
      let empresaId = solicitud.empresaId;

      if (!empresaId) {
        // Buscar si ya existe una empresa con ese RNC
        const empresaExistente = await prisma.empresaInspeccionada.findFirst({
          where: { rnc: solicitud.rnc }
        });

        if (empresaExistente) {
          // Si existe, asociarla a la solicitud
          empresaId = empresaExistente.id;
        } else {
          // Si no existe, crear nueva empresa
          const fechaVenc = new Date();
          fechaVenc.setFullYear(fechaVenc.getFullYear() + 1);

          const nuevaEmpresa = await prisma.empresaInspeccionada.create({
            data: {
              nombreEmpresa: solicitud.nombreEmpresa || '',
              nombreComercial: solicitud.nombreComercial,
              rnc: solicitud.rnc,
              direccion: 'Pendiente de actualizar',
              telefono: 'N/A',
              email: 'pendiente@onda.gov.do',
              categoriaIrcId: solicitud.categoriaIrcId,
              tipoPersona: 'MORAL',
              descripcionActividades: 'Importador/Distribuidor de obras protegidas',
              registrado: false, // Se marcará como true al asentar
              fechaRegistro: new Date(),
              fechaVencimiento: fechaVenc,
              statusId: 1, // ACTIVA
              creadoPorId: usuarioId
            }
          });
          empresaId = nuevaEmpresa.id;
        }
      }

      // 2. VALIDADA - Generar factura automáticamente
      const precio = Number(solicitud.categoriaIrc.precio);

      // Crear factura
      const factura = await prisma.factura.create({
        data: {
          codigo: `FACT-INSP-${Date.now()}`, // TODO: Mejorar generación de código
          clienteId: 1, // TODO: Obtener del cliente real
          estadoId: 1, // Abierta
          subtotal: precio,
          itbis: precio * 0.18, // 18% ITBIS
          total: precio * 1.18,
          metodoPago: null
        }
      });

      // 3. Actualizar solicitud con empresa y factura
      const solicitudActualizada = await prisma.solicitudRegistroInspeccion.update({
        where: { id: Number(id) },
        data: {
          estadoId: 2, // VALIDADA
          validadoPorId: usuarioId,
          fechaValidacion: new Date(),
          facturaId: factura.id,
          empresaId: empresaId // Asociar empresa
        },
        include: {
          estado: true,
          factura: true,
          categoriaIrc: true,
          empresa: true
        }
      });

      return res.json({
        success: true,
        message: 'Solicitud validada y factura generada',
        data: solicitudActualizada
      });
    } else {
      // RECHAZADA
      const solicitudActualizada = await prisma.solicitudRegistroInspeccion.update({
        where: { id: Number(id) },
        data: {
          estadoId: 8, // RECHAZADA
          validadoPorId: usuarioId,
          fechaValidacion: new Date(),
          observaciones: motivo
        },
        include: {
          estado: true
        }
      });

      return res.json({
        success: true,
        message: 'Solicitud rechazada',
        data: solicitudActualizada
      });
    }
  } catch (error) {
    console.error('Error al validar solicitud:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al validar solicitud',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * PASO 3 - CAJA PAGO: Webhook cuando se paga la factura
 */
export const marcarComoPagada = async (req: AuthRequest, res: Response) => {
  try {
    const { facturaId } = req.body;

    // Buscar solicitud por facturaId
    const solicitud = await prisma.solicitudRegistroInspeccion.findFirst({
      where: { facturaId: Number(facturaId) }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró solicitud asociada a esta factura'
      });
    }

    if (solicitud.estadoId !== 2) { // Debe estar en VALIDADA
      return res.status(400).json({
        success: false,
        message: 'La solicitud no está en estado VALIDADA'
      });
    }

    // Actualizar a PAGADA
    const solicitudActualizada = await prisma.solicitudRegistroInspeccion.update({
      where: { id: solicitud.id },
      data: {
        estadoId: 3, // PAGADA
        fechaPago: new Date()
      },
      include: {
        estado: true,
        factura: true
      }
    });

    return res.json({
      success: true,
      message: 'Solicitud marcada como pagada',
      data: solicitudActualizada
    });
  } catch (error) {
    console.error('Error al marcar solicitud como pagada:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al marcar solicitud como pagada',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * PASO 4 - INSPECTORÍA ASENTAMIENTO: Introducir número de libro y hoja, generar número de registro
 */
export const asentarSolicitud = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { numeroLibro, numeroHoja } = req.body;
    const usuarioId = req.usuario?.id || 1;

    if (!numeroLibro || !numeroHoja) {
      return res.status(400).json({
        success: false,
        message: 'El número de libro y número de hoja son requeridos'
      });
    }

    const solicitud = await prisma.solicitudRegistroInspeccion.findUnique({
      where: { id: Number(id) },
      include: {
        formulario: true
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    if (solicitud.estadoId !== 3) { // Debe estar en PAGADA
      return res.status(400).json({
        success: false,
        message: 'La solicitud no está en estado PAGADA'
      });
    }

    // Verificar que tenga formulario asociado
    if (!solicitud.formulario) {
      return res.status(400).json({
        success: false,
        message: 'La solicitud no tiene formulario asociado'
      });
    }

    // Usar el código del formulario como número de registro
    // Formato del formulario: 00000003/11/2025 (8 dígitos / mes / año)
    const numeroRegistro = solicitud.formulario.codigo;

    // Verificar que el número de registro no esté en uso (por seguridad)
    const registroExistente = await prisma.solicitudRegistroInspeccion.findFirst({
      where: {
        numeroRegistro,
        id: { not: Number(id) }
      }
    });

    if (registroExistente) {
      return res.status(400).json({
        success: false,
        message: 'Este número de registro ya está en uso. Contacte al administrador.'
      });
    }

    // Crear o actualizar la empresa asociada
    let empresaId = solicitud.empresaId;

    // Obtener campos del formulario
    const formCampos = await prisma.formularioProductoCampo.findMany({
      where: {
        formularioProducto: {
          formularioId: solicitud.formulario.id
        }
      },
      include: {
        campo: true
      }
    });

    const getCampoValue = (campoNombre: string) => {
      const campo = formCampos.find(c => c.campo.campo === campoNombre);
      return campo?.valor || null;
    };

    // Obtener el ID del status "ACTIVA"
    const statusActiva = await prisma.statusInspeccion.findFirst({
      where: { nombre: 'ACTIVA' }
    });

    if (!statusActiva) {
      return res.status(500).json({
        success: false,
        message: 'No se encontró el status ACTIVA. Ejecuta el seed de la base de datos.'
      });
    }

    const fechaVenc = new Date();
    fechaVenc.setFullYear(fechaVenc.getFullYear() + 1);

    if (solicitud.tipoSolicitud === 'REGISTRO_NUEVO') {
      if (!empresaId) {
        console.log('🔵 Intentando crear empresa IRC...');
        console.log(`   Nombre: ${solicitud.nombreEmpresa}`);
        console.log(`   RNC: ${solicitud.rnc}`);
        console.log(`   Categoría IRC ID: ${solicitud.categoriaIrcId}`);
        console.log(`   Status ID: ${statusActiva.id}`);

        try {
          // Buscar provincia por nombre (el formulario guarda el nombre, no el ID)
          const provinciaNombre = getCampoValue('provincia');
          let provinciaId: number | null = null;

          if (provinciaNombre) {
            const provincia = await prisma.provincia.findFirst({
              where: { nombre: provinciaNombre }
            });
            provinciaId = provincia?.id || null;
            console.log(`   Provincia: ${provinciaNombre} -> ID: ${provinciaId}`);
          }

          // CREAR nueva empresa desde los datos del formulario
          const empresaCreada = await prisma.empresaInspeccionada.create({
            data: {
              nombreEmpresa: solicitud.nombreEmpresa!,
              nombreComercial: solicitud.nombreComercial || null,
              rnc: solicitud.rnc,
              direccion: getCampoValue('direccion') || 'N/A',
              telefono: getCampoValue('telefono') || 'N/A',
              fax: getCampoValue('fax'),
              email: getCampoValue('email') || 'N/A',
              paginaWeb: getCampoValue('paginaWeb'),
              categoriaIrcId: solicitud.categoriaIrcId,
              tipoPersona: getCampoValue('tipoPersona') || 'MORAL',
              nombrePropietario: getCampoValue('nombrePropietario'),
              cedulaPropietario: getCampoValue('cedulaPropietario'),
              descripcionActividades: getCampoValue('descripcionActividades') || 'N/A',
              provinciaId,
              personaContacto: getCampoValue('representanteLegal'),
              statusId: statusActiva.id,
              creadoPorId: usuarioId,
              registrado: true,
              existeEnSistema: true,
              fechaRegistro: new Date(),
              fechaVencimiento: fechaVenc
            }
          });
          empresaId = empresaCreada.id;

          console.log(`✅ Empresa IRC creada exitosamente: ${empresaCreada.nombreEmpresa} (ID: ${empresaCreada.id})`);
        } catch (error) {
          console.error('❌ ERROR al crear empresa IRC:', error);
          throw error;
        }
      } else {
        // Si ya existe, solo marcar como registrada
        await prisma.empresaInspeccionada.update({
          where: { id: empresaId },
          data: {
            registrado: true,
            existeEnSistema: true,
            fechaRegistro: new Date(),
            fechaVencimiento: fechaVenc,
            statusId: statusActiva.id
          }
        });
      }
    } else if (solicitud.tipoSolicitud === 'RENOVACION') {
      if (!empresaId) {
        // Buscar empresa por RNC
        const empresaExistente = await prisma.empresaInspeccionada.findFirst({
          where: { rnc: solicitud.rnc }
        });

        if (empresaExistente) {
          empresaId = empresaExistente.id;
        } else {
          return res.status(400).json({
            success: false,
            message: 'No se encontró la empresa para renovar. Debe existir un registro previo.'
          });
        }
      }

      // Actualizar fecha de renovación y vencimiento
      await prisma.empresaInspeccionada.update({
        where: { id: empresaId },
        data: {
          fechaRenovacion: new Date(),
          fechaVencimiento: fechaVenc,
          statusId: statusActiva.id
        }
      });

      console.log(`✅ Empresa IRC renovada: ID ${empresaId}`);
    }

    // Actualizar a ASENTADA y vincular la empresa
    const solicitudActualizada = await prisma.solicitudRegistroInspeccion.update({
      where: { id: Number(id) },
      data: {
        empresaId, // Vincular la empresa creada/actualizada
        numeroRegistro,
        numeroLibro,
        numeroHoja,
        estadoId: 4, // ASENTADA
        asentadoPorId: usuarioId,
        fechaAsentamiento: new Date()
      },
      include: {
        estado: true,
        empresa: {
          include: {
            categoriaIrc: true,
            provincia: true,
            status: true
          }
        }
      }
    });

    return res.json({
      success: true,
      message: 'Registro asentado exitosamente',
      data: {
        ...solicitudActualizada,
        numeroRegistroGenerado: numeroRegistro
      }
    });
  } catch (error) {
    console.error('Error al asentar solicitud:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al asentar solicitud',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * DEVOLVER SOLICITUD A AuU: Para corrección de errores
 */
export const devolverSolicitudAuU = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;
    const usuarioId = req.usuario?.id || 1;

    if (!motivo || motivo.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debe especificar el motivo de la devolución'
      });
    }

    const solicitud = await prisma.solicitudRegistroInspeccion.findUnique({
      where: { id: Number(id) },
      include: { estado: true }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    // Solo se puede devolver si está en estado PAGADA (3)
    if (solicitud.estadoId !== 3) {
      return res.status(400).json({
        success: false,
        message: `No se puede devolver una solicitud en estado ${solicitud.estado.nombre}`
      });
    }

    // Buscar o crear estado DEVUELTA
    let estadoDevuelta = await prisma.estadoSolicitudInspeccion.findFirst({
      where: { nombre: 'DEVUELTA' }
    });

    // Si no existe, crearlo
    if (!estadoDevuelta) {
      estadoDevuelta = await prisma.estadoSolicitudInspeccion.create({
        data: {
          nombre: 'DEVUELTA',
          descripcion: 'Solicitud devuelta a AuU para correcciones',
          orden: 8
        }
      });
    }

    // Actualizar solicitud
    const solicitudActualizada = await prisma.solicitudRegistroInspeccion.update({
      where: { id: Number(id) },
      data: {
        estadoId: estadoDevuelta.id,
        observaciones: `DEVUELTA POR PARALEGAL: ${motivo}\n\n${solicitud.observaciones || ''}`
      },
      include: {
        estado: true,
        categoriaIrc: true
      }
    });

    return res.json({
      success: true,
      message: 'Solicitud devuelta a AuU para correcciones',
      data: solicitudActualizada
    });
  } catch (error) {
    console.error('Error al devolver solicitud:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al devolver solicitud',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * PASO 5 - GENERACIÓN CERTIFICADO: Generar PDF del certificado
 */
export const generarCertificado = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario?.id || 1;

    const solicitud: any = await prisma.solicitudRegistroInspeccion.findUnique({
      where: { id: Number(id) },
      include: {
        empresa: true,
        categoriaIrc: true,
        factura: true,
        formulario: {
          include: {
            productos: {
              include: {
                campos: {
                  include: {
                    campo: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    // Permitir regenerar si está en ASENTADA (4) o PENDIENTE_FIRMA (5)
    if (solicitud.estadoId !== 4 && solicitud.estadoId !== 5) {
      return res.status(400).json({
        success: false,
        message: 'La solicitud no está en estado ASENTADA o PENDIENTE_FIRMA'
      });
    }

    if (!solicitud.numeroRegistro) {
      return res.status(400).json({
        success: false,
        message: 'La solicitud no tiene número de registro asignado'
      });
    }

    // Verificar que la solicitud tenga empresa vinculada
    // (la empresa se crea en el paso de asentamiento)
    const empresaId = solicitud.empresaId;

    if (!empresaId) {
      return res.status(400).json({
        success: false,
        message: 'La solicitud no tiene empresa vinculada. Debe asentarse primero para crear la empresa.'
      });
    }

    // Usar el número de registro como número de certificado (ya tiene formato correcto)
    const numeroCertificado = solicitud.numeroRegistro;
    const year = new Date().getFullYear();

    // Calcular fecha de vencimiento (1 año después)
    const fechaVencimiento = new Date();
    fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1);

    // Extraer datos de los campos del formulario IRC
    // Los campos están en formulario.productos[0].campos pero sin nombres, solo valores por índice
    const formCampos = solicitud?.formulario?.productos?.[0]?.campos || [];

    // Mapeo de índices basado en el orden del formulario IRC
    const getCampoByIndex = (index: number) => formCampos[index]?.valor || undefined;

    // Índices según el formulario IRC:
    const tipoSolicitud = getCampoByIndex(0);      // REGISTRO_NUEVO / RENOVACION
    const nombreEmpresa = getCampoByIndex(1);      // Nombre empresa
    const nombreComercial = getCampoByIndex(2);    // Nombre comercial
    const rnc = getCampoByIndex(3);                // RNC
    const categoriaIrc = getCampoByIndex(4);       // Categoría
    const fechaInicioOp = getCampoByIndex(5);      // Fecha inicio operaciones
    const principalesClientes = getCampoByIndex(6); // Principales clientes
    const direccion = getCampoByIndex(7);          // Dirección
    const provincia = getCampoByIndex(8);          // Provincia
    const sector = getCampoByIndex(9);             // Sector
    const telefono = getCampoByIndex(10);          // Teléfono principal
    const telefono2 = getCampoByIndex(11);         // Teléfono secundario
    const email = getCampoByIndex(12);             // Email
    const representante = getCampoByIndex(13);     // Representante legal
    const cedulaRep = getCampoByIndex(14);         // Cédula representante
    const tipoPersona = getCampoByIndex(15);       // FISICA / MORAL
    const descripcionAct = getCampoByIndex(16);    // Descripción actividades

    console.log('=== DATOS EXTRAÍDOS ===');
    console.log('Dirección:', direccion);
    console.log('Teléfono:', telefono);
    console.log('Representante:', representante);
    console.log('TipoPersona:', tipoPersona);
    console.log('Descripción:', descripcionAct);
    console.log('======================');

    // Preparar datos para el certificado usando los valores extraídos por índice
    const datosCertificado = {
      numeroRegistro: solicitud.numeroRegistro!,
      numeroLibro: solicitud.numeroLibro || 'N/A',
      numeroHoja: solicitud.numeroHoja || 'N/A',
      fechaInscripcion: solicitud.fechaAsentamiento || new Date(),
      fechaVencimiento,
      tipoSolicitud: solicitud.tipoSolicitud || 'PRIMERA_VEZ',
      empresa: {
        nombreEmpresa: nombreEmpresa || solicitud.nombreEmpresa || 'N/A',
        nombreComercial: nombreComercial,
        rnc: rnc || solicitud.rnc || 'N/A',
        tipoPersona: tipoPersona,
        categoriaIrc: categoriaIrc || solicitud.categoriaIrc?.nombre,
        descripcionActividades: descripcionAct,
        fechaInicioOperaciones: fechaInicioOp,
        principalesClientes: principalesClientes,
        // Ubicación
        direccion: direccion,
        sector: sector,
        provincia: provincia,
        telefono: telefono,
        telefonoSecundario: telefono2,
        correoElectronico: email,
        // Representante Legal
        representanteLegal: representante,
        cedulaRepresentante: cedulaRep,
        // Persona Moral (si aplica, estarían en índices posteriores)
        presidenteNombre: undefined,
        presidenteCedula: undefined,
        presidenteDomicilio: undefined,
        presidenteTelefono: undefined,
        presidenteCelular: undefined,
        presidenteEmail: undefined,
        vicepresidente: undefined,
        secretario: undefined,
        tesorero: undefined,
        administrador: undefined,
        domicilioConsejo: undefined,
        telefonoConsejo: undefined,
        fechaConstitucion: undefined,
        // Persona Física
        nombrePropietario: getCampoByIndex(17), // Ajustar índices según estructura
        cedulaPropietario: getCampoByIndex(18),
        domicilioPropietario: getCampoByIndex(19),
        telefonoPropietario: getCampoByIndex(20),
        celularPropietario: getCampoByIndex(21),
        emailPropietario: getCampoByIndex(22),
        nombreAdministrador: getCampoByIndex(23),
        cedulaAdministrador: getCampoByIndex(24),
        telefonoAdministrador: getCampoByIndex(25),
        fechaInicioActividades: getCampoByIndex(26)
      }
    };

    // Generar ruta del PDF
    const nombreArchivo = `${numeroCertificado.replace(/\//g, '-')}.pdf`;
    const rutaRelativa = `/uploads/certificados/inspeccion/${year}`;
    const rutaPdf = `${rutaRelativa}/${nombreArchivo}`;
    const rutaAbsoluta = path.join(__dirname, '../../../public', rutaPdf);

    // Generar el PDF (sobrescribe si ya existe)
    await generarCertificadoIRCPDF(datosCertificado, rutaAbsoluta);

    let certificado;
    let mensaje = '';

    // Si ya tiene certificado, actualizarlo; si no, crearlo
    if (solicitud.certificadoId) {
      // REGENERAR: Actualizar certificado existente
      certificado = await prisma.certificadoInspeccion.update({
        where: { id: solicitud.certificadoId },
        data: {
          fechaVencimiento,
          rutaPdf,
          fechaEmision: new Date() // Actualizar fecha de emisión
        }
      });
      mensaje = 'Certificado regenerado exitosamente.';
    } else {
      // GENERAR: Crear nuevo certificado
      certificado = await prisma.certificadoInspeccion.create({
        data: {
          empresaId: empresaId!,
          numeroCertificado,
          numeroRegistro: solicitud.numeroRegistro,
          numeroLibro: solicitud.numeroLibro || null,
          numeroHoja: solicitud.numeroHoja || null,
          facturaId: solicitud.facturaId!,
          fechaVencimiento,
          rutaPdf,
          emitidoPorId: usuarioId
        }
      });
      mensaje = 'Certificado generado exitosamente. Pendiente de firma.';
    }

    // Actualizar solicitud a PENDIENTE_FIRMA solo si estaba en ASENTADA
    const updateData: any = {
      certificadoId: certificado.id
    };

    if (solicitud.estadoId === 4) {
      updateData.estadoId = 5; // PENDIENTE_FIRMA
    }

    const solicitudActualizada = await prisma.solicitudRegistroInspeccion.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        estado: true,
        certificado: true
      }
    });

    return res.json({
      success: true,
      message: mensaje,
      data: {
        solicitud: solicitudActualizada,
        certificado,
        rutaPdf
      }
    });
  } catch (error) {
    console.error('Error al generar certificado:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al generar certificado',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * PASO 7 - AuU ENTREGA: Marcar certificado como entregado
 */
export const entregarCertificado = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const solicitud = await prisma.solicitudRegistroInspeccion.findUnique({
      where: { id: Number(id) },
      include: {
        empresa: true,
        certificado: true
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    // Debe estar en estado FIRMADA (estado 6)
    if (solicitud.estadoId !== 6) {
      return res.status(400).json({
        success: false,
        message: 'La solicitud debe estar en estado FIRMADA para poder entregarla'
      });
    }

    // Actualizar solicitud a ENTREGADA (estado 7)
    const solicitudActualizada = await prisma.solicitudRegistroInspeccion.update({
      where: { id: Number(id) },
      data: {
        estadoId: 7, // ENTREGADA
        fechaEntrega: new Date()
      },
      include: {
        estado: true,
        certificado: true,
        empresa: true
      }
    });

    // Actualizar empresa según tipo de solicitud
    if (solicitud.empresaId) {
      const fechaVencimiento = new Date();
      fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1);

      const updateData: any = {
        registrado: true,
        fechaVencimiento
      };

      if (solicitud.tipoSolicitud === 'REGISTRO_NUEVO') {
        updateData.fechaRegistro = new Date();
      } else if (solicitud.tipoSolicitud === 'RENOVACION') {
        updateData.fechaUltimaRenovacion = new Date();
      }

      await prisma.empresaInspeccionada.update({
        where: { id: solicitud.empresaId },
        data: updateData
      });
    }

    return res.json({
      success: true,
      message: 'Certificado entregado exitosamente. Proceso completado.',
      data: solicitudActualizada
    });
  } catch (error) {
    console.error('Error al entregar certificado:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al entregar certificado',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Listar solicitudes con filtros
 */
export const listarSolicitudes = async (req: AuthRequest, res: Response) => {
  try {
    const { estadoId, tipoSolicitud, empresaId, page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (estadoId) {
      // Permitir múltiples estados separados por coma (ej: "4,5")
      const estadosStr = String(estadoId);
      if (estadosStr.includes(',')) {
        const estados = estadosStr.split(',').map(e => Number(e.trim()));
        where.estadoId = { in: estados };
      } else {
        where.estadoId = Number(estadoId);
      }
    }

    if (tipoSolicitud) {
      where.tipoSolicitud = String(tipoSolicitud);
    }

    if (empresaId) {
      where.empresaId = Number(empresaId);
    }

    const [solicitudes, total] = await Promise.all([
      prisma.solicitudRegistroInspeccion.findMany({
        where,
        include: {
          empresa: {
            include: {
              categoriaIrc: true
            }
          },
          categoriaIrc: true,
          estado: true,
          factura: {
            include: {
              estado: true
            }
          },
          formulario: {
            select: {
              id: true,
              codigo: true,
              productos: {
                include: {
                  campos: {
                    include: {
                      campo: true
                    }
                  }
                }
              }
            }
          },
          recibidoPor: {
            select: {
              id: true,
              nombrecompleto: true
            }
          },
          certificado: {
            select: {
              id: true,
              numeroCertificado: true,
              rutaPdf: true,
              fechaEmision: true
            }
          }
        },
        orderBy: { creadoEn: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.solicitudRegistroInspeccion.count({ where })
    ]);

    return res.json({
      success: true,
      data: solicitudes,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error al listar solicitudes:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al listar solicitudes',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener solicitud por ID
 */
export const obtenerSolicitud = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const solicitud = await prisma.solicitudRegistroInspeccion.findUnique({
      where: { id: Number(id) },
      include: {
        empresa: {
          include: {
            categoriaIrc: true,
            provincia: true,
            consejoAdministracion: true,
            principalesClientes: true
          }
        },
        categoriaIrc: true,
        estado: true,
        factura: {
          include: {
            estado: true
          }
        },
        certificado: true,
        recibidoPor: { select: { id: true, nombrecompleto: true } },
        validadoPor: { select: { id: true, nombrecompleto: true } },
        asentadoPor: { select: { id: true, nombrecompleto: true } },
        firmadoPor: { select: { id: true, nombrecompleto: true } },
        entregadoPor: { select: { id: true, nombrecompleto: true } }
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    return res.json({
      success: true,
      data: solicitud
    });
  } catch (error) {
    console.error('Error al obtener solicitud:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener solicitud',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * PASO 6 - FIRMA: Marcar certificado como firmado (Registro)
 */
export const firmarCertificado = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const solicitud = await prisma.solicitudRegistroInspeccion.findUnique({
      where: { id: Number(id) },
      include: { estado: true, certificado: true }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    // Validar que esté en estado PENDIENTE_FIRMA (estado 5)
    if (solicitud.estadoId !== 5) {
      return res.status(400).json({
        success: false,
        message: 'La solicitud debe estar en estado PENDIENTE_FIRMA para firmar'
      });
    }

    if (!solicitud.certificadoId) {
      return res.status(400).json({
        success: false,
        message: 'La solicitud no tiene un certificado generado'
      });
    }

    // Verificar que se haya subido un archivo
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Debe subir el certificado firmado (archivo PDF)'
      });
    }

    // Ruta del certificado firmado subido
    const rutaPdfFirmado = `/uploads/certificados/${req.file.filename}`;

    // Actualizar certificado con la ruta del PDF firmado y fecha de firma
    await prisma.certificadoInspeccion.update({
      where: { id: solicitud.certificadoId },
      data: {
        rutaPdfFirmado,
        fechaFirma: new Date()
      }
    });

    // Actualizar solicitud a FIRMADA (estado 6)
    const solicitudActualizada = await prisma.solicitudRegistroInspeccion.update({
      where: { id: Number(id) },
      data: {
        estadoId: 6 // FIRMADA
      },
      include: {
        empresa: {
          include: {
            categoriaIrc: true
          }
        },
        estado: true,
        certificado: true
      }
    });

    return res.json({
      success: true,
      data: solicitudActualizada,
      message: 'Certificado firmado cargado exitosamente. Listo para entrega.'
    });
  } catch (error) {
    console.error('Error al firmar certificado:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al firmar certificado',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener certificados pendientes de firma
 */
export const obtenerCertificadosPendientesFirma = async (req: AuthRequest, res: Response) => {
  try {
    const certificados = await prisma.certificadoInspeccion.findMany({
      where: {
        solicitud: {
          estadoId: 6 // Estado CERTIFICADO_GENERADO
        }
      },
      include: {
        solicitud: {
          include: {
            empresa: {
              include: {
                categoriaIrc: true
              }
            }
          }
        }
      },
      orderBy: { creadoEn: 'desc' }
    });

    return res.json({
      success: true,
      data: certificados
    });
  } catch (error) {
    console.error('Error al obtener certificados pendientes:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener certificados pendientes',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * MANTENIMIENTO: Crear empresas faltantes de solicitudes ya asentadas
 * Útil para migrar solicitudes asentadas antes de implementar la creación automática
 */
export const crearEmpresasFaltantes = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.usuario?.id || 1;

    // Buscar solicitudes ASENTADAS o superiores que no tienen empresa
    const solicitudesSinEmpresa = await prisma.solicitudRegistroInspeccion.findMany({
      where: {
        empresaId: null,
        estadoId: { gte: 4 } // ASENTADA o superior
      },
      include: {
        formulario: {
          include: {
            productos: {
              include: {
                campos: {
                  include: {
                    campo: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (solicitudesSinEmpresa.length === 0) {
      return res.json({
        success: true,
        message: 'No hay solicitudes pendientes de crear empresa',
        data: { procesadas: 0, creadas: 0, actualizadas: 0, errores: 0 }
      });
    }

    // Obtener status ACTIVA
    const statusActiva = await prisma.statusInspeccion.findFirst({
      where: { nombre: 'ACTIVA' }
    });

    if (!statusActiva) {
      return res.status(500).json({
        success: false,
        message: 'No se encontró el status ACTIVA. Ejecuta el seed de la base de datos.'
      });
    }

    let creadas = 0;
    let actualizadas = 0;
    let errores = 0;
    const resultados = [];

    for (const solicitud of solicitudesSinEmpresa) {
      try {
        const formCampos = solicitud?.formulario?.productos?.[0]?.campos || [];
        const getCampoValue = (campoNombre: string) => {
          const campo = formCampos.find(c => c.campo.campo === campoNombre);
          return campo?.valor || null;
        };

        const fechaVenc = new Date();
        fechaVenc.setFullYear(fechaVenc.getFullYear() + 1);

        let empresaId: number | null = null;

        if (solicitud.tipoSolicitud === 'REGISTRO_NUEVO') {
          // Verificar si ya existe por RNC
          const empresaExistente = await prisma.empresaInspeccionada.findFirst({
            where: { rnc: solicitud.rnc }
          });

          if (empresaExistente) {
            empresaId = empresaExistente.id;
            actualizadas++;
            resultados.push({
              solicitud: solicitud.codigo,
              accion: 'vinculada',
              empresa: empresaExistente.nombreEmpresa
            });
          } else {
            // Crear nueva empresa
            const empresaCreada = await prisma.empresaInspeccionada.create({
              data: {
                nombreEmpresa: solicitud.nombreEmpresa!,
                nombreComercial: solicitud.nombreComercial || null,
                rnc: solicitud.rnc,
                direccion: getCampoValue('direccion') || 'N/A',
                telefono: getCampoValue('telefono') || 'N/A',
                fax: getCampoValue('fax'),
                email: getCampoValue('email') || 'N/A',
                paginaWeb: getCampoValue('paginaWeb'),
                categoriaIrcId: solicitud.categoriaIrcId,
                tipoPersona: getCampoValue('tipoPersona') || 'MORAL',
                nombrePropietario: getCampoValue('nombrePropietario'),
                cedulaPropietario: getCampoValue('cedulaPropietario'),
                descripcionActividades: getCampoValue('descripcionActividades') || 'N/A',
                provinciaId: getCampoValue('provincia') ? parseInt(getCampoValue('provincia')!) : null,
                personaContacto: getCampoValue('representanteLegal'),
                statusId: statusActiva.id,
                creadoPorId: usuarioId,
                registrado: true,
                existeEnSistema: true,
                fechaRegistro: solicitud.fechaAsentamiento || new Date(),
                fechaVencimiento: fechaVenc
              }
            });
            empresaId = empresaCreada.id;
            creadas++;
            resultados.push({
              solicitud: solicitud.codigo,
              accion: 'creada',
              empresa: empresaCreada.nombreEmpresa
            });
          }
        } else if (solicitud.tipoSolicitud === 'RENOVACION') {
          // Buscar empresa por RNC
          const empresaExistente = await prisma.empresaInspeccionada.findFirst({
            where: { rnc: solicitud.rnc }
          });

          if (empresaExistente) {
            empresaId = empresaExistente.id;
            // Actualizar renovación
            await prisma.empresaInspeccionada.update({
              where: { id: empresaId },
              data: {
                fechaRenovacion: solicitud.fechaAsentamiento || new Date(),
                fechaVencimiento: fechaVenc,
                statusId: statusActiva.id
              }
            });
            actualizadas++;
            resultados.push({
              solicitud: solicitud.codigo,
              accion: 'renovada',
              empresa: empresaExistente.nombreEmpresa
            });
          } else {
            errores++;
            resultados.push({
              solicitud: solicitud.codigo,
              accion: 'error',
              mensaje: 'No se encontró empresa para renovar'
            });
          }
        }

        // Vincular empresa a la solicitud
        if (empresaId) {
          await prisma.solicitudRegistroInspeccion.update({
            where: { id: solicitud.id },
            data: { empresaId }
          });
        }
      } catch (error) {
        errores++;
        resultados.push({
          solicitud: solicitud.codigo,
          accion: 'error',
          mensaje: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    }

    return res.json({
      success: true,
      message: 'Proceso de creación de empresas completado',
      data: {
        procesadas: solicitudesSinEmpresa.length,
        creadas,
        actualizadas,
        errores,
        detalles: resultados
      }
    });
  } catch (error) {
    console.error('Error al crear empresas faltantes:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear empresas faltantes',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};
