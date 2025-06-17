import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

class Estudiante {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS estudiantes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        carnet VARCHAR(20) NOT NULL UNIQUE,
        nombre VARCHAR(50) NOT NULL,
        apellido VARCHAR(50) NOT NULL,
        curso VARCHAR(20) NOT NULL,
        paralelo VARCHAR(10) NOT NULL,
        password VARCHAR(255) NOT NULL,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_carnet (carnet)
      )
    `;
    try {
      await pool.query(query);
      console.log('✅ Tabla de estudiantes verificada/creada');
    } catch (error) {
      console.error('❌ Error al crear tabla estudiantes:', error.message);
      throw error;
    }
  }

  static async getAll() {
    try {
      const [rows] = await pool.query(
        'SELECT id, carnet, nombre, apellido, curso, paralelo FROM estudiantes'
      );
      return rows;
    } catch (error) {
      console.error('Error al obtener estudiantes:', error);
      throw error;
    }
  }

  static async findByCarnet(carnet) {
    try {
      const [rows] = await pool.query(
        'SELECT id, carnet, nombre, apellido, curso, paralelo FROM estudiantes WHERE carnet = ?', 
        [carnet]
      );
      return rows[0];
    } catch (error) {
      console.error(`Error buscando carnet ${carnet}:`, error);
      throw error;
    }
  }

  static async create({ carnet, nombre, apellido, curso, paralelo, password }) {
    try {
      // Validación básica de datos
      if (!carnet || !nombre || !apellido || !curso || !paralelo || !password) {
        throw new Error('Todos los campos son requeridos');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const [result] = await pool.query(
        `INSERT INTO estudiantes 
        (carnet, nombre, apellido, curso, paralelo, password) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [carnet, nombre, apellido, curso, paralelo, hashedPassword]
      );
      
      return { 
        id: result.insertId, 
        carnet, 
        nombre, 
        apellido, 
        curso, 
        paralelo 
      };
    } catch (error) {
      console.error('Error al crear estudiante:', error);
      
      // Manejo específico de errores de MySQL
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('El carnet ya está registrado');
      }
      
      throw error;
    }
  }

  static async verificarCredenciales(carnet, password) {
    try {
      // 1. Validación básica de entrada
      if (!carnet || !password) {
        throw new Error('Carnet y contraseña son requeridos');
      }

      // 2. Buscar estudiante sin traer el password inicialmente (más seguro)
      const [rows] = await pool.query(
        `SELECT id, carnet, nombre, apellido, curso, paralelo, password 
        FROM estudiantes WHERE carnet = ?`,
        [carnet]
      );

      // 3. Verificar si existe el usuario
      if (rows.length === 0) {
        console.warn(`Intento de login con carnet no registrado: ${carnet}`);
        return null;
      }

      const estudiante = rows[0];

      // 4. Comparación segura de contraseñas con bcrypt
      const match = await bcrypt.compare(password, estudiante.password);
      if (!match) {
        console.warn(`Intento de login con contraseña incorrecta para carnet: ${carnet}`);
        return null;
      }

      // 5. Retornar datos limpios del estudiante (sin password)
      return {
        id: estudiante.id,
        carnet: estudiante.carnet,
        nombre: estudiante.nombre,
        apellido: estudiante.apellido,
        curso: estudiante.curso,
        paralelo: estudiante.paralelo
      };

    } catch (error) {
      console.error('Error en verificarCredenciales:', error);
      
      // 6. Manejo especial de errores de base de datos
      if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        throw new Error('Error de conexión con la base de datos');
      }
      
      throw error; // Re-lanzar otros errores
    }
  }
}

// Crear la tabla al importar el modelo (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
  Estudiante.createTable();
}

export default Estudiante;