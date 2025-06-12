const express = require('express');
const router = express.Router();

// Array temporal para almacenar votaciones
let votaciones = [];
let votos = [];

// 1. Ruta para crear una nueva votación
router.post('/crear-votacion', (req, res) => {
  const { nombre, descripcion, fechaInicio, fechaFin, candidatosIds } = req.body;

  if (!nombre || !fechaInicio || !fechaFin || !candidatosIds) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  const nuevaVotacion = {
    id: uuidv4(),
    nombre,
    descripcion: descripcion || '',
    fechaInicio,
    fechaFin,
    candidatosIds,
    estado: 'pendiente', // pendiente | en-progreso | finalizada
    fechaCreacion: new Date().toISOString()
  };

  votaciones.push(nuevaVotacion);
  res.status(201).json(nuevaVotacion);
});

// 2. Ruta para iniciar una votación
router.put('/iniciar-votacion/:id', (req, res) => {
  const votacion = votaciones.find(v => v.id === req.params.id);
  
  if (!votacion) {
    return res.status(404).json({ error: 'Votación no encontrada' });
  }

  votacion.estado = 'en-progreso';
  res.json(votacion);
});

// 3. Ruta para registrar un voto
router.post('/registrar-voto', (req, res) => {
  const { votacionId, candidatoId, votanteId } = req.body;

  // Validaciones
  const votacion = votaciones.find(v => v.id === votacionId);
  if (!votacion || votacion.estado !== 'en-progreso') {
    return res.status(400).json({ error: 'Votación no disponible' });
  }

  if (!votacion.candidatosIds.includes(candidatoId)) {
    return res.status(400).json({ error: 'Candidato no válido para esta votación' });
  }

  // Verificar si el votante ya votó
  if (votos.some(v => v.votanteId === votanteId && v.votacionId === votacionId)) {
    return res.status(400).json({ error: 'Este votante ya participó en la votación' });
  }

  const nuevoVoto = {
    id: uuidv4(),
    votacionId,
    candidatoId,
    votanteId,
    fechaVoto: new Date().toISOString()
  };

  votos.push(nuevoVoto);
  res.status(201).json(nuevoVoto);
});

// 4. Ruta para obtener resultados
router.get('/resultados/:votacionId', (req, res) => {
  const votosVotacion = votos.filter(v => v.votacionId === req.params.votacionId);
  
  // Agrupar votos por candidato
  const resultados = votosVotacion.reduce((acc, voto) => {
    acc[voto.candidatoId] = (acc[voto.candidatoId] || 0) + 1;
    return acc;
  }, {});

  res.json({
    totalVotos: votosVotacion.length,
    resultados
  });
});

module.exports = router;