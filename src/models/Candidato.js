import pool from '../config/database.js';

class Candidato {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS candidatos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        carnet VARCHAR(20) NOT NULL UNIQUE,
        nombre VARCHAR(50) NOT NULL,
        apellido VARCHAR(50) NOT NULL,
        propuestas TEXT NOT NULL,
        fotoUrl VARCHAR(255),
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await pool.query(query);
  }

  static async getAll() {
    const [rows] = await pool.query('SELECT * FROM candidatos');
    return rows;
  }

  static async findByCarnet(carnet) {
    const [rows] = await pool.query('SELECT * FROM candidatos WHERE carnet = ?', [carnet]);
    return rows[0];
  }

  static async create({ carnet, nombre, apellido, propuestas, fotoUrl = null }) {
    const [result] = await pool.query(
      'INSERT INTO candidatos (carnet, nombre, apellido, propuestas, fotoUrl) VALUES (?, ?, ?, ?, ?)',
      [carnet, nombre, apellido, propuestas, fotoUrl]
    );
    return { id: result.insertId, carnet, nombre, apellido, propuestas, fotoUrl };
  }

  // Si tienes votos, asegúrate de agregar la columna votos INT DEFAULT 0 en la tabla
  static async incrementarVotos(carnet) {
    await pool.query(
      'UPDATE candidatos SET votos = votos + 1 WHERE carnet = ?',
      [carnet]
    );
  }

}
// Crear la tabla al importar el modelo
Candidato.createTable();

export default Candidato;