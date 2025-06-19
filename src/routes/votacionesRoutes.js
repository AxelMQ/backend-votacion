import express from 'express';
import {
  crearVotacion,
  listarVotaciones,
  obtenerVotacion,
  actualizarVotacion,
  eliminarVotacion,
  agregarCandidato,
  quitarCandidato,
  obtenerCandidatos,
  agregarParticipante,
  quitarParticipante,
  obtenerParticipantes,
  cambiarEstadoVotacion,
  obtenerVotacionCompleta,
  puedeVotar
} from '../controllers/votacionesControllers.js';

const router = express.Router();

// CRUD votaciones
router.post('/', crearVotacion);
router.get('/', listarVotaciones);
router.get('/:id', obtenerVotacion);
router.put('/:id', actualizarVotacion);
router.delete('/:id', eliminarVotacion);

// Cambiar solo el estado
router.patch('/:id/estado', cambiarEstadoVotacion);

// Candidatos en votación
router.post('/candidato', agregarCandidato);
router.delete('/candidato', quitarCandidato);
router.get('/:votacion_id/candidatos', obtenerCandidatos);

// Participantes en votación
router.post('/participante', agregarParticipante);
router.delete('/participante', quitarParticipante);
router.get('/:votacion_id/participantes', obtenerParticipantes);

router.get('/:id/completa', obtenerVotacionCompleta);

router.get('/:id/puede-votar/:estudiante_id', puedeVotar);

export default router;