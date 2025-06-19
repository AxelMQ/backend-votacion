import Voto from '../models/Voto.js';

// Registrar un voto
export const registrarVoto = async (req, res) => {
  try {
    const { votacion_id, estudiante_id, candidato_id } = req.body;
    if (!votacion_id || !estudiante_id || !candidato_id) {
      return res.status(400).json({ success: false, message: 'Faltan datos para votar' });
    }
    await Voto.registrarVoto({ votacion_id, estudiante_id, candidato_id });
    res.json({ success: true, message: 'Voto registrado correctamente' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Obtener todos los votos de una votación
export const obtenerVotosPorVotacion = async (req, res) => {
  try {
    const { votacion_id } = req.params;
    const votos = await Voto.obtenerVotosPorVotacion(votacion_id);
    res.json({ success: true, data: votos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener votos' });
  }
};

// Obtener el voto de un estudiante en una votación
export const obtenerVotoDeEstudiante = async (req, res) => {
  try {
    const { votacion_id, estudiante_id } = req.params;
    const voto = await Voto.obtenerVotoDeEstudiante(votacion_id, estudiante_id);
    res.json({ success: true, data: voto });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener el voto' });
  }
};

export const yaVoto = async (req, res) => {
  try {
    const { votacion_id, estudiante_id } = req.params;
    const voto = await Voto.obtenerVotoDeEstudiante(votacion_id, estudiante_id);
    res.json({ success: true, yaVoto: !!voto });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al verificar si ya votó' });
  }
};