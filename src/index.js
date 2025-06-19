import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';

// Configuración de ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar variables de entorno
dotenv.config();

// Importar rutas
import authRoutes from './routes/authRoutes.js'; // Asegúrate que la ruta es correcta
import estudiantesRoutes from './routes/estudiantesRoutes.js';
import candidatosRoutes from './routes/candidatosRoutes.js';
import votacionesRoutes from './routes/votacionesRoutes.js';
import votosRoutes from './routes/votosRoutes.js';

// Importar modelos para crear tablas
import Estudiante from './models/Estudiante.js';
import Candidato from './models/Candidato.js';
import Votacion from './models/Votacion.js';
import Voto from './models/Voto.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Configura CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition']
}));

// Configuración básica
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Crear carpeta uploads si no existe
const uploadDir = path.join(__dirname, '..', 'uploads');
console.log('Upload directory path:', uploadDir);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.get('/uploads', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading uploads directory' });
    }
    res.json({ files });
  });
});

app.use('/uploads', express.static(uploadDir));

app.get('/test-image/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (fs.existsSync(filePath)) {
    console.log(`✅ Serving test image: ${req.params.filename}`);
    res.sendFile(filePath);
  } else {
    console.log(`❌ Test image not found: ${req.params.filename}`);
    res.status(404).json({ message: 'Image not found' });
  }
});

// Crear tablas al iniciar (solo en desarrollo)
const initializeDatabase = async () => {
  try {
    await Estudiante.createTable();
    await Candidato.createTable();
    await Votacion.createTable();
    await Voto.createTable();
    console.log('✅ Tablas verificadas/creadas correctamente');
  } catch (error) {
    console.error('❌ Error al crear tablas:', error.message);
  }
};

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/estudiantes', estudiantesRoutes);
app.use('/api/candidatos', candidatosRoutes);
app.use('/api/votaciones', votacionesRoutes);
app.use('/api/votos', votosRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    status: 'running',
    message: 'API de Votación Estudiantil',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
app.listen(PORT, async () => {
  await initializeDatabase();
  console.log(`\nServidor corriendo en http://localhost:${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}\n`);
});