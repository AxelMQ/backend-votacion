const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

const votacionRoutes = require('./routes/votacionRoutes');

const app = express();
const PORT = 3000;

// Crear carpeta uploads si no existe
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de Multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten imágenes (JPEG, JPG, PNG)'));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB
});

// Middleware para parsear JSON
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// Array temporal para almacenar estudiantes
let estudiantes = [];

// Array temporal para almacenar candidatos
let candidatos = [];

// Endpoint para registrar estudiantes
app.post('/api/register-estudiante', (req, res) => {
  const { codigo, nombre, apellido, curso, paralelo } = req.body;

  // Validaciones básicas
  if (!codigo || !nombre || !apellido || !curso || !paralelo) {
    return res.status(400).json({ 
      error: 'Todos los campos son requeridos: codigo, nombre, apellido, curso, paralelo' 
    });
  }

  // Verificar si el código ya existe
  const estudianteExistente = estudiantes.find(est => est.codigo === codigo);
  if (estudianteExistente) {
    return res.status(400).json({ error: 'El código de estudiante ya está registrado' });
  }

  // Crear nuevo estudiante
  const nuevoEstudiante = {
    codigo,
    nombre,
    apellido,
    curso,
    paralelo,
    fechaRegistro: new Date().toISOString()
  };

  // Agregar a la "base de datos" temporal
  estudiantes.push(nuevoEstudiante);

  // Respuesta exitosa
  res.status(201).json({
    message: 'Estudiante registrado exitosamente',
    estudiante: nuevoEstudiante
  });
});

// Endpoint para listar estudiantes (para verificar)
app.get('/api/estudiantes', (req, res) => {
  res.json(estudiantes);
});

// Endpoint para registrar candidatos
app.post('/api/register-candidato', upload.single('foto'), (req, res) => {
  try {
    const { codigo, nombre, apellido, propuestas } = req.body;

    // Validaciones básicas
    if (!codigo || !nombre || !apellido || !propuestas) {
      // Eliminar la foto subida si hay error de validación
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        error: 'Todos los campos son requeridos: codigo, nombre, apellido, propuestas'
      });
    }

    // Validar que propuestas sea un array
    let propuestasArray;
    try {
      // Si propuestas viene como string (form-data), parsear a JSON
      propuestasArray = typeof propuestas === 'string' ? 
        JSON.parse(propuestas) : 
        propuestas;
      
      if (!Array.isArray(propuestasArray)) {
        throw new Error('Propuestas debe ser un array');
      }
    } catch (e) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        error: 'Formato de propuestas inválido. Debe ser un array JSON'
      });
    }

    // Verificar si el código ya existe
    const candidatoExistente = candidatos.find(c => c.codigo === codigo);
    if (candidatoExistente) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'El código ya está registrado' });
    }

    // // Verificar que se subió una foto
    // if (!req.file) {
    //   return res.status(400).json({ error: 'La foto del candidato es requerida' });
    // }

    // Crear nuevo candidato
    const nuevoCandidato = {
      codigo,
      nombre,
      apellido,
      propuestas: propuestasArray,
      fotoUrl: req.file ? `/uploads/${req.file.filename}` : null,
      fechaRegistro: new Date().toISOString()
    };

    // Agregar a la "base de datos" temporal
    candidatos.push(nuevoCandidato);

    res.status(201).json({
      message: 'Candidato registrado exitosamente',
      candidato: nuevoCandidato
    });

  } catch (error) {
    console.error('Error en el servidor:', error);
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error al eliminar archivo:', err);
      }
    }
    res.status(500).json({ 
      error: 'Error al registrar el candidato',
      detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/candidatos', (req, res) => {
  res.json(candidatos);
});

app.use('/api/votacion', votacionRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});