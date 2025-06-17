import Candidato from '../models/Candidato.js';
import upload from '../config/multerConfig.js';
import fs from 'fs';

export const registerCandidato = async (req, res) => {
  try {
    const { carnet, nombre, apellido, propuestas } = req.body;

    if (!carnet || !nombre || !apellido || !propuestas) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        error: 'Todos los campos son requeridos: carnet, nombre, apellido, propuestas'
      });
    }

    // Acepta propuestas como array o string JSON, y guarda como string
    let propuestasString;
    try {
      if (Array.isArray(propuestas)) {
        propuestasString = JSON.stringify(propuestas);
      } else if (typeof propuestas === 'string') {
        // Si es string, intenta parsear para validar formato
        const parsed = JSON.parse(propuestas);
        if (!Array.isArray(parsed)) throw new Error();
        propuestasString = propuestas;
      } else {
        throw new Error();
      }
    } catch (e) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        error: 'Formato de propuestas inválido. Debe ser un array JSON'
      });
    }

    // Verifica si el carnet ya existe
    const candidatoExistente = await Candidato.findByCarnet(carnet);
    if (candidatoExistente) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'El carnet ya está registrado' });
    }

    const nuevoCandidato = await Candidato.create({
      carnet,
      nombre,
      apellido,
      propuestas: propuestasString,
      fotoUrl: req.file ? `/uploads/${req.file.filename}` : null
    });

    res.status(201).json({
      message: 'Candidato registrado exitosamente',
      candidato: nuevoCandidato
    });

  } catch (error) {
    console.error('Error en el servidor:', error);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ 
      error: 'Error al registrar el candidato',
      detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getCandidatos = async (req, res) => {
  try {
    const candidatos = await Candidato.getAll();
    res.json({ success: true, data: candidatos });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener candidatos' });
  }
};