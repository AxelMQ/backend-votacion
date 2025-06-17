import express from 'express';
import {
  registerEstudiante,
  getEstudiantes,
  getEstudianteByCarnet
} from '../controllers/estudiantesController.js';

const router = express.Router();

// POST /api/estudiantes/register
router.post('/register', registerEstudiante);

// GET /api/estudiantes
router.get('/', getEstudiantes);

// GET /api/estudiantes/:carnet
router.get('/:carnet', getEstudianteByCarnet);

export default router;