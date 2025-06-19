import pool from '../config/database.js';

class Votacion {
  static async createTable() {
    // Tabla principal de votaciones
    const query = `
      CREATE TABLE IF NOT EXISTS votaciones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        fecha DATE NOT NULL,
        hora_inicio TIME NOT NULL,
        hora_fin TIME NOT NULL,
        estado ENUM('pendiente', 'en_progreso', 'finalizada', 'cancelada') DEFAULT 'pendiente',
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CHECK (hora_fin > hora_inicio)
      )
    `;
    await pool.query(query);

    // Tabla intermedia para candidatos por votación
    const queryCandidatos = `
      CREATE TABLE IF NOT EXISTS votacion_candidatos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        votacion_id INT NOT NULL,
        candidato_id INT NOT NULL,
        FOREIGN KEY (votacion_id) REFERENCES votaciones(id) ON DELETE CASCADE,
        FOREIGN KEY (candidato_id) REFERENCES candidatos(id) ON DELETE CASCADE,
        UNIQUE KEY unique_votacion_candidato (votacion_id, candidato_id)
      )
    `;
    await pool.query(queryCandidatos);

    // Si quieres restringir quién puede votar en cada votación
    
    const queryParticipantes = `
      CREATE TABLE IF NOT EXISTS votacion_participantes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        votacion_id INT NOT NULL,
        estudiante_id INT NOT NULL,
        FOREIGN KEY (votacion_id) REFERENCES votaciones(id) ON DELETE CASCADE,
        FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE, 
        UNIQUE KEY unique_votacion_participante (votacion_id, estudiante_id)
      )
    `;
    await pool.query(queryParticipantes);
  }
    
  // CRUD Votaciones
  static async create({ nombre, descripcion, fecha, hora_inicio, hora_fin }) {
    const [result] = await pool.query(
      `INSERT INTO votaciones (nombre, descripcion, fecha, hora_inicio, hora_fin)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, descripcion, fecha, hora_inicio, hora_fin]
    );
    return { id: result.insertId, nombre, descripcion, fecha, hora_inicio, hora_fin };
  }

  static async getAll() {
    const [rows] = await pool.query('SELECT * FROM votaciones');
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM votaciones WHERE id = ?', [id]);
    return rows[0];
  }

  static async update(id, { nombre, descripcion, fecha, hora_inicio, hora_fin, estado }) {
    await pool.query(
      `UPDATE votaciones SET nombre=?, descripcion=?, fecha=?, hora_inicio=?, hora_fin=?, estado=?
       WHERE id=?`,
      [nombre, descripcion, fecha, hora_inicio, hora_fin, estado, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    await pool.query('DELETE FROM votaciones WHERE id = ?', [id]);
  }

  static async update_b(id, data) {
  const fields = [];
  const values = [];
  for (const key in data) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
  }
  if (fields.length === 0) return this.findById(id); // Nada que actualizar

  values.push(id);
  const query = `UPDATE votaciones SET ${fields.join(', ')} WHERE id = ?`;
  await pool.query(query, values);
  return this.findById(id);
}

  // Métodos para candidatos en votación
  static async addCandidato(votacion_id, candidato_id) {
    await pool.query(
      `INSERT IGNORE INTO votacion_candidatos (votacion_id, candidato_id) VALUES (?, ?)`,
      [votacion_id, candidato_id]
    );
  }

  static async removeCandidato(votacion_id, candidato_id) {
    await pool.query(
      `DELETE FROM votacion_candidatos WHERE votacion_id = ? AND candidato_id = ?`,
      [votacion_id, candidato_id]
    );
  }

  static async getCandidatos(votacion_id) {
    const [rows] = await pool.query(
      `SELECT c.* FROM candidatos c
       INNER JOIN votacion_candidatos vc ON c.id = vc.candidato_id
       WHERE vc.votacion_id = ?`,
      [votacion_id]
    );
    return rows;
  }

  // Métodos para participantes en votación
  static async addParticipante(votacion_id, estudiante_id) {
    await pool.query(
      `INSERT IGNORE INTO votacion_participantes (votacion_id, estudiante_id) VALUES (?, ?)`,
      [votacion_id, estudiante_id]
    );
  }

  static async removeParticipante(votacion_id, estudiante_id) {
    await pool.query(
      `DELETE FROM votacion_participantes WHERE votacion_id = ? AND estudiante_id = ?`,
      [votacion_id, estudiante_id]
    );
  }

  static async getParticipantes(votacion_id) {
    const [rows] = await pool.query(
      `SELECT e.* FROM estudiantes e
       INNER JOIN votacion_participantes vp ON e.id = vp.estudiante_id
       WHERE vp.votacion_id = ?`,
      [votacion_id]
    );
    return rows;
  }
}

export default Votacion;