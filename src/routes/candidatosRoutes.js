import express from 'express';
import { registerCandidato, getCandidatos } from '../controllers/candidatosControllers.js';
import upload from '../config/multerConfig.js';

const router = express.Router();

router.post('/register', upload.single('foto'), registerCandidato);
router.get('/', getCandidatos);

export default router;