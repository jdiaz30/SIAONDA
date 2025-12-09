import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../../middleware/auth';

const prisma = new PrismaClient();

/**
 * Generar código único para caso (CASO-INSP-YYYY-NNNN)
 */
const generarCodigoCaso = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const prefix = `CASO-INSP-${year}-`;

  const ultimoCaso = await prisma.casoInspeccion.findFirst({
    where: { codigo: { startsWith: prefix } },
    orderBy: { codigo: 'desc' }
  });

  let numero = 1;
  if (ultimoCaso) {
    const ultimoNumero = parseInt(ultimoCaso.codigo.split('-').pop() || '0');
    numero = ultimoNumero + 1;
  }

  return `${prefix}${numero.toString().padStart(4, '0')}`;
};

/**
 * Calcular días hábiles (excluyendo sábados y domingos)
 */
const agregarDiasHabiles = (fecha: Date, dias: number): Date => {
  const resultado = new Date(fecha);
  let diasAgregados = 0;

  while (diasAgregados < dias) {
    resultado.setDate(resultado.getDate() + 1);
    const diaSemana = resultado.getDay();
    if (diaSemana !== 0 && diaSemana !== 6) {
      diasAgregados++;
    }
  }

  return resultado;
};

/**
 * Crear caso de inspección (manual)
 */
export const crearCaso = async (req: AuthRequest, res: Response) => {
  try {
    const {
      empresaId,
      tipoCaso,
      origenCaso,
      denuncianteNombre,
      denuncianteTelefono,
      denuncianteEmail,
      detallesDenuncia,
      prioridad = 'MEDIA'
    } = req.body;

    const usuarioId = req.usuario?.id || 1;

    const empresa = await prisma.empresaInspeccionada.findUnique({
      where: { id: Number(empresaId) }
    });

    if (!empresa) {
      return res.status(404).json({
        success: false,
        message: 'Empresa no encontrada'
      });
    }

    const codigo = await generarCodigoCaso();

    const caso = await prisma.casoInspeccion.create({
      data: {
        codigo,
        empresaId: Number(empresaId),
        tipoCaso,
        origenCaso,
        estadoCasoId: 1, 
        statusId: 2, 
        prioridad,
        asignadoPorId: usuarioId,
        denuncianteNombre,
        denuncianteTelefono,
        denuncianteEmail,
        detallesDenuncia
      },
      include: {
        empresa: {
          include: {
            categoriaIrc: true
          }
        },
        estadoCaso: true,
        status: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Caso de inspección creado exitosamente',
      data: caso
    });
  } catch (error) {
    console.error('Error al crear caso:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear caso',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Asignar inspector a un caso
 */
export const asignarInspector = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { inspectorId, prioridad } = req.body;
    const usuarioId = req.usuario?.id || 1;

    const caso = await prisma.casoInspeccion.findUnique({
      where: { id: Number(id) }
    });

    if (!caso) {
      return res.status(404).json({
        success: false,
        message: 'Caso no encontrado'
      });
    }

    if (caso.estadoCasoId !== 1) { 
      return res.status(400).json({
        success: false,
        message: 'El caso no está en estado PENDIENTE_ASIGNACION'
      });
    }

    const casoActualizado = await prisma.casoInspeccion.update({
      where: { id: Number(id) },
      data: {
        inspectorAsignadoId: Number(inspectorId),
        asignadoPorId: usuarioId,
        fechaAsignacion: new Date(),
        estadoCasoId: 2, 
        prioridad: prioridad || caso.prioridad
      },
      include: {
        empresa: true,
        inspectorAsignado: {
          select: {
            id: true,
            nombrecompleto: true,
            correo: true
          }
        },
        estadoCaso: true
      }
    });

    return res.json({
      success: true,
      message: 'Inspector asignado exitosamente',
      data: casoActualizado
    });
  } catch (error) {
    console.error('Error al asignar inspector:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al asignar inspector',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Reportar 1ra visita (Acta de Inspección)
 */
export const reportarPrimeraVisita = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      fechaVisita,
      horaVisita,
      cumplimiento,
      hallazgos,
      infracciones,
      plazoCorreccion = 10,
      evidenciaFotografica,
      documentosAdjuntos
    } = req.body;

    const usuarioId = req.usuario?.id || 1;

    const caso = await prisma.casoInspeccion.findUnique({
      where: { id: Number(id) },
      include: { empresa: true }
    });

    if (!caso) {
      return res.status(404).json({
        success: false,
        message: 'Caso no encontrado'
      });
    }

    if (caso.estadoCasoId !== 2) { 
      return res.status(400).json({
        success: false,
        message: 'El caso no está en estado ASIGNADO'
      });
    }

    const year = new Date().getFullYear();
    const numeroActa = `ACTA-${year}-${String(Date.now()).slice(-6)}`;

    const rutaPdf = `/uploads/actas/inspeccion/${year}/${numeroActa}.pdf`;

    const acta = await prisma.actaInspeccion.create({
      data: {
        numeroActa,
        tipoActa: 'INSPECCION',
        empresaId: caso.empresaId,
        fechaVisita: new Date(fechaVisita),
        horaVisita,
        inspectorId: usuarioId,
        cumplimiento,
        hallazgos,
        infracciones,
        plazoCorreccion: cumplimiento === false ? plazoCorreccion : null,
        fechaLimite: cumplimiento === false ? agregarDiasHabiles(new Date(fechaVisita), plazoCorreccion) : null,
        evidenciaFotografica: JSON.stringify(evidenciaFotografica || []),
        documentosAdjuntos: JSON.stringify(documentosAdjuntos || []),
        rutaPdf
      }
    });

    let nuevoEstado = 5; 
    let resolucion = 'RESUELTO_CORRECCION';

    if (cumplimiento === false) {
      nuevoEstado = 3; 
      resolucion = '';
    }

    const casoActualizado = await prisma.casoInspeccion.update({
      where: { id: Number(id) },
      data: {
        fechaPrimeraVisita: new Date(fechaVisita),
        actaInspeccionId: acta.id,
        plazoCorreccionDias: cumplimiento === false ? plazoCorreccion : null,
        fechaLimiteCorreccion: acta.fechaLimite,
        estadoCasoId: nuevoEstado,
        statusId: cumplimiento === false ? 4 : 1, 
        resolucion: cumplimiento === true ? resolucion : null,
        fechaCierre: cumplimiento === true ? new Date() : null,
        cerradoPorId: cumplimiento === true ? usuarioId : null
      },
      include: {
        empresa: true,
        actaInspeccion: true,
        estadoCaso: true,
        status: true
      }
    });

    await prisma.empresaInspeccionada.update({
      where: { id: caso.empresaId },
      data: {
        statusId: cumplimiento === false ? 4 : 1, 
        fechaNotificacion: cumplimiento === false ? new Date() : null
      }
    });

    return res.json({
      success: true,
      message: cumplimiento === false
        ? `1ra visita registrada. Empresa notificada - ${plazoCorreccion} días hábiles para corregir.`
        : '1ra visita registrada. Empresa cumple con requisitos. Caso cerrado.',
      data: {
        caso: casoActualizado,
        acta
      }
    });
  } catch (error) {
    console.error('Error al reportar 1ra visita:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al reportar 1ra visita',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Reportar 2da visita (Acta de Infracción)
 */
export const reportarSegundaVisita = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      fechaVisita,
      horaVisita,
      corrigioInfracciones,
      hallazgos,
      infracciones,
      evidenciaFotografica,
      documentosAdjuntos
    } = req.body;

    const usuarioId = req.usuario?.id || 1;

    const caso = await prisma.casoInspeccion.findUnique({
      where: { id: Number(id) },
      include: { empresa: true }
    });

    if (!caso) {
      return res.status(404).json({
        success: false,
        message: 'Caso no encontrado'
      });
    }

    if (![3, 4].includes(caso.estadoCasoId)) {
      return res.status(400).json({
        success: false,
        message: 'El caso no está en estado válido para 2da visita'
      });
    }

    const year = new Date().getFullYear();
    const numeroActa = `ACTA-INF-${year}-${String(Date.now()).slice(-6)}`;

    const rutaPdf = `/uploads/actas/infraccion/${year}/${numeroActa}.pdf`;

    const acta = await prisma.actaInspeccion.create({
      data: {
        numeroActa,
        tipoActa: 'INFRACCION',
        empresaId: caso.empresaId,
        fechaVisita: new Date(fechaVisita),
        horaVisita,
        inspectorId: usuarioId,
        cumplimiento: corrigioInfracciones,
        hallazgos,
        infracciones,
        evidenciaFotografica: JSON.stringify(evidenciaFotografica || []),
        documentosAdjuntos: JSON.stringify(documentosAdjuntos || []),
        rutaPdf
      }
    });

    let nuevoEstado = 5; 
    let resolucion = 'RESUELTO_CORRECCION';
    let motivoCierre = 'Empresa corrigió infracciones en 2da visita';

    if (!corrigioInfracciones) {
      nuevoEstado = 4; 
      resolucion = '';
      motivoCierre = '';
    }

    const casoActualizado = await prisma.casoInspeccion.update({
      where: { id: Number(id) },
      data: {
        fechaSegundaVisita: new Date(fechaVisita),
        actaInfraccionId: acta.id,
        estadoCasoId: nuevoEstado,
        statusId: corrigioInfracciones ? 1 : 7, 
        resolucion: corrigioInfracciones ? resolucion : null,
        fechaCierre: corrigioInfracciones ? new Date() : null,
        cerradoPorId: corrigioInfracciones ? usuarioId : null,
        motivoCierre: corrigioInfracciones ? motivoCierre : null
      },
      include: {
        empresa: true,
        actaInspeccion: true,
        actaInfraccion: true,
        estadoCaso: true,
        status: true
      }
    });

    await prisma.empresaInspeccionada.update({
      where: { id: caso.empresaId },
      data: {
        statusId: corrigioInfracciones ? 1 : 7, 
        fechaActaInfraccion: new Date(),
        estadoJuridicoId: corrigioInfracciones ? 1 : 2 
      }
    });

    return res.json({
      success: true,
      message: corrigioInfracciones
        ? '2da visita registrada. Empresa corrigió infracciones. Caso cerrado.'
        : '2da visita registrada. Empresa NO corrigió infracciones. Pendiente tramitar a Jurídico.',
      data: {
        caso: casoActualizado,
        acta
      }
    });
  } catch (error) {
    console.error('Error al reportar 2da visita:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al reportar 2da visita',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Tramitar caso a Departamento Jurídico
 */
export const tramitarAJuridico = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { observaciones } = req.body;
    const usuarioId = req.usuario?.id || 1;

    const caso = await prisma.casoInspeccion.findUnique({
      where: { id: Number(id) },
      include: {
        empresa: true,
        actaInspeccion: true,
        actaInfraccion: true
      }
    });

    if (!caso) {
      return res.status(404).json({
        success: false,
        message: 'Caso no encontrado'
      });
    }

    if (caso.estadoCasoId !== 4) { 
      return res.status(400).json({
        success: false,
        message: 'El caso no está en estado REACTIVADO'
      });
    }

    if (!caso.actaInfraccionId) {
      return res.status(400).json({
        success: false,
        message: 'El caso no tiene acta de infracción registrada'
      });
    }

    const casoActualizado = await prisma.casoInspeccion.update({
      where: { id: Number(id) },
      data: {
        estadoCasoId: 6, 
        resolucion: 'TRAMITADO_JURIDICO',
        fechaCierre: new Date(),
        cerradoPorId: usuarioId,
        motivoCierre: 'Empresa no corrigió infracciones - Remitido a Dep. Jurídico',
        observaciones: observaciones || caso.observaciones
      },
      include: {
        empresa: true,
        estadoCaso: true
      }
    });

    await prisma.empresaInspeccionada.update({
      where: { id: caso.empresaId },
      data: {
        estadoJuridicoId: 3, 
        statusExternoId: 7 
      }
    });

    return res.json({
      success: true,
      message: 'Caso tramitado a Departamento Jurídico exitosamente',
      data: casoActualizado
    });
  } catch (error) {
    console.error('Error al tramitar caso a jurídico:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al tramitar caso a jurídico',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Cerrar caso automáticamente por pago (Webhook desde Cajas)
 */
export const cerrarPorPago = async (req: AuthRequest, res: Response) => {
  try {
    const { empresaId } = req.body;

    const caso = await prisma.casoInspeccion.findFirst({
      where: {
        empresaId: Number(empresaId),
        estadoCasoId: { in: [1, 2, 3, 4] }, 
        fechaCierre: null
      }
    });

    if (!caso) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró caso abierto para esta empresa'
      });
    }

    const casoActualizado = await prisma.casoInspeccion.update({
      where: { id: caso.id },
      data: {
        estadoCasoId: 5, 
        resolucion: 'RESUELTO_PAGO',
        fechaCierre: new Date(),
        motivoCierre: 'Empresa realizó pago de renovación - Caso cerrado automáticamente'
      },
      include: {
        empresa: true,
        estadoCaso: true
      }
    });

    await prisma.empresaInspeccionada.update({
      where: { id: Number(empresaId) },
      data: {
        statusId: 1, 
        conclusionId: 1, 
        statusExternoId: 5 
      }
    });

    return res.json({
      success: true,
      message: 'Caso cerrado automáticamente por pago',
      data: casoActualizado
    });
  } catch (error) {
    console.error('Error al cerrar caso por pago:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al cerrar caso por pago',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Listar casos con filtros
 */
export const listarCasos = async (req: AuthRequest, res: Response) => {
  try {
    const {
      tipoCaso,
      estadoCasoId,
      inspectorId,
      empresaId,
      enPlazoGracia,
      page = 1,
      limit = 20
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (tipoCaso) where.tipoCaso = String(tipoCaso);
    
    // Corrección para asegurar que los IDs sean números válidos
    const numericEstadoId = Number(estadoCasoId);
    if (!isNaN(numericEstadoId) && estadoCasoId) {
      where.estadoCasoId = numericEstadoId;
    }
    
    const numericInspectorId = Number(inspectorId);
    if (!isNaN(numericInspectorId) && inspectorId) {
      where.inspectorAsignadoId = numericInspectorId;
    }
    
    const numericEmpresaId = Number(empresaId);
    if (!isNaN(numericEmpresaId) && empresaId) {
      where.empresaId = numericEmpresaId;
    }
    
    if (enPlazoGracia === 'true') where.estadoCasoId = 3; 

    const [casos, total] = await Promise.all([
      prisma.casoInspeccion.findMany({
        where,
        include: {
          empresa: {
            include: {
              categoriaIrc: true
            }
          },
          estadoCaso: true,
          status: true,
          inspectorAsignado: {
            select: {
              id: true,
              nombrecompleto: true
            }
          }
        },
        orderBy: { creadoEn: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.casoInspeccion.count({ where })
    ]);

    return res.json({
      success: true,
      data: casos,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error al listar casos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al listar casos',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtener caso por ID
 */
export const obtenerCaso = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const caso = await prisma.casoInspeccion.findUnique({
      where: { id: Number(id) },
      include: {
        empresa: {
          include: {
            categoriaIrc: true,
            provincia: true
          }
        },
        estadoCaso: true,
        status: true,
        asignadoPor: { select: { id: true, nombrecompleto: true } },
        inspectorAsignado: { select: { id: true, nombrecompleto: true } },
        actaInspeccion: true,
        actaInfraccion: true,
        factura: {
          include: {
            estado: true
          }
        },
        operativo: true
      }
    });

    if (!caso) {
      return res.status(404).json({
        success: false,
        message: 'Caso no encontrado'
      });
    }

    return res.json({
      success: true,
      data: caso
    });
  } catch (error) {
    console.error('Error al obtener caso:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener caso',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};