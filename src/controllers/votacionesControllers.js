import Votacion from '../models/Votacion.js';

// Crear una nueva votación
export const crearVotacion = async (req, res) => {
  try {
    const { nombre, descripcion, fecha, hora_inicio, hora_fin } = req.body;
    if (!nombre || !fecha || !hora_inicio || !hora_fin) {
      return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
    }
    const nueva = await Votacion.create({ nombre, descripcion, fecha, hora_inicio, hora_fin });
    res.status(201).json({ success: true, data: nueva });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear votación', error: error.message });
  }
};

// Obtener todas las votaciones
export const listarVotaciones = async (req, res) => {
  try {
    const votaciones = await Votacion.getAll();
    res.json({ success: true, data: votaciones });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener votaciones' });
  }
};

// Obtener una votación por ID
export const obtenerVotacion = async (req, res) => {
  try {
    const { id } = req.params;
    const votacion = await Votacion.findById(id);
    if (!votacion) {
      return res.status(404).json({ success: false, message: 'Votación no encontrada' });
    }
    res.json({ success: true, data: votacion });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener votación' });
  }
};

// Actualizar una votación
export const actualizarVotacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, fecha, hora_inicio, hora_fin, estado } = req.body;
    const actualizada = await Votacion.update(id, { nombre, descripcion, fecha, hora_inicio, hora_fin, estado });
    res.json({ success: true, data: actualizada });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar votación' });
  }
};

// Eliminar una votación
export const eliminarVotacion = async (req, res) => {
  try {
    const { id } = req.params;
    await Votacion.delete(id);
    res.json({ success: true, message: 'Votación eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar votación' });
  }
};

// Asociar candidato a votación
export const agregarCandidato = async (req, res) => {
  try {
    const { votacion_id, candidato_id } = req.body;
    await Votacion.addCandidato(votacion_id, candidato_id);
    res.json({ success: true, message: 'Candidato agregado a la votación' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al agregar candidato' });
  }
};

// Quitar candidato de votación
export const quitarCandidato = async (req, res) => {
  try {
    const { votacion_id, candidato_id } = req.body;
    await Votacion.removeCandidato(votacion_id, candidato_id);
    res.json({ success: true, message: 'Candidato quitado de la votación' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al quitar candidato' });
  }
};

// Obtener candidatos de una votación
export const obtenerCandidatos = async (req, res) => {
  try {
    const { votacion_id } = req.params;
    const candidatos = await Votacion.getCandidatos(votacion_id);
    res.json({ success: true, data: candidatos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener candidatos' });
  }
};

// Asociar participante a votación
export const agregarParticipante = async (req, res) => {
  try {
    const { votacion_id, estudiante_id } = req.body;
    await Votacion.addParticipante(votacion_id, estudiante_id);
    res.json({ success: true, message: 'Participante agregado a la votación' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al agregar participante' });
  }
};

// Quitar participante de votación
export const quitarParticipante = async (req, res) => {
  try {
    const { votacion_id, estudiante_id } = req.body;
    await Votacion.removeParticipante(votacion_id, estudiante_id);
    res.json({ success: true, message: 'Participante quitado de la votación' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al quitar participante' });
  }
};

// Obtener participantes de una votación
export const obtenerParticipantes = async (req, res) => {
  try {
    const { votacion_id } = req.params;
    const participantes = await Votacion.getParticipantes(votacion_id);
    res.json({ success: true, data: participantes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener participantes' });
  }
};

// Cambiar solo el estado de una votación
export const cambiarEstadoVotacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    if (!['pendiente', 'en_progreso', 'finalizada', 'cancelada'].includes(estado)) {
      return res.status(400).json({ success: false, message: 'Estado inválido' });
    }
    const actualizada = await Votacion.update_b(id, { estado });
    res.json({ success: true, data: actualizada });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al cambiar estado de la votación' });
  }
};

export const obtenerVotacionCompleta = async (req, res) => {
  try {
    const { id } = req.params;
    const votacion = await Votacion.findById(id);
    if (!votacion) {
      return res.status(404).json({ success: false, message: 'Votación no encontrada' });
    }
    const candidatos = await Votacion.getCandidatos(id);
    const participantes = await Votacion.getParticipantes(id);

    res.json({
      success: true,
      data: {
        ...votacion,
        candidatos,
        participantes
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener la información completa de la votación' });
  }
};

export const puedeVotar = async (req, res) => {
  try {
    const { id, estudiante_id } = req.params;
    // Busca si el estudiante está en la tabla votacion_participantes
    const participantes = await Votacion.getParticipantes(id);
    const habilitado = participantes.some(p => p.id === parseInt(estudiante_id));
    res.json({ success: true, puedeVotar: habilitado });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al verificar elegibilidad' });
  }
};