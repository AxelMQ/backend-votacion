import pool from '../config/database.js';

class Voto {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS votos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        votacion_id INT NOT NULL,
        estudiante_id INT NOT NULL,
        candidato_id INT NOT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (votacion_id) REFERENCES votaciones(id) ON DELETE CASCADE,
        FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
        FOREIGN KEY (candidato_id) REFERENCES candidatos(id) ON DELETE CASCADE,
        UNIQUE KEY unique_voto (votacion_id, estudiante_id)
      )
    `;
    await pool.query(query);
  }

  static async registrarVoto({ votacion_id, estudiante_id, candidato_id }) {
    // Verifica si ya votó
    const [rows] = await pool.query(
      'SELECT id FROM votos WHERE votacion_id = ? AND estudiante_id = ?',
      [votacion_id, estudiante_id]
    );
    if (rows.length > 0) {
      throw new Error('El estudiante ya ha votado en esta votación');
    }
    // Registra el voto
    await pool.query(
      'INSERT INTO votos (votacion_id, estudiante_id, candidato_id) VALUES (?, ?, ?)',
      [votacion_id, estudiante_id, candidato_id]
    );
    return true;
  }

  static async obtenerVotosPorVotacion(votacion_id) {
    const [rows] = await pool.query(
      'SELECT * FROM votos WHERE votacion_id = ?',
      [votacion_id]
    );
    return rows;
  }

  static async obtenerVotoDeEstudiante(votacion_id, estudiante_id) {
    const [rows] = await pool.query(
      'SELECT * FROM votos WHERE votacion_id = ? AND estudiante_id = ?',
      [votacion_id, estudiante_id]
    );
    return rows[0];
  }
}

export default Voto;