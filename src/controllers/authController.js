import Estudiante from '../models/Estudiante.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret_desarrollo';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

export const login = async (req, res) => {
  try {
    const { carnet, password } = req.body;

    // Validación básica
    if (!carnet || !password) {
      return res.status(400).json({
        success: false,
        message: 'Carnet y contraseña son requeridos'
      });
    }

    // Verificar credenciales
    const estudiante = await Estudiante.verificarCredenciales(carnet, password);
    
    if (!estudiante) {
      return res.status(401).json({
        success: false,
        message: 'Carnet o contraseña incorrectos'
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: estudiante.id,
        carnet: estudiante.carnet,
        role: 'estudiante'
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Excluir datos sensibles del response
    const estudianteData = {
      id: estudiante.id,
      carnet: estudiante.carnet,
      nombre: estudiante.nombre,
      apellido: estudiante.apellido,
      curso: estudiante.curso,
      paralelo: estudiante.paralelo
    };

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      data: estudianteData
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor al iniciar sesión'
    });
  }
};

export const verifyToken = (req, res) => {
  res.json({
    success: true,
    message: 'Token válido',
    user: req.user
  });
};