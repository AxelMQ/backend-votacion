import express from 'express';
import {
  registrarVoto,
  obtenerVotosPorVotacion,
  obtenerVotoDeEstudiante,
  yaVoto
} from '../controllers/votosController.js';

const router = express.Router();

router.post('/', registrarVoto);
router.get('/votacion/:votacion_id', obtenerVotosPorVotacion);
router.get('/votacion/:votacion_id/estudiante/:estudiante_id', obtenerVotoDeEstudiante);

router.get('/votacion/:votacion_id/estudiante/:estudiante_id/ya-voto', yaVoto);

export default router;