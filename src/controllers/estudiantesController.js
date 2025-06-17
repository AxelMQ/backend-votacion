import Estudiante from '../models/Estudiante.js';

export const registerEstudiante = async (req, res) => {
  try {
    const { carnet, nombre, apellido, curso, paralelo, password } = req.body;

    // Validación de campos requeridos
    if (!carnet || !nombre || !apellido || !curso || !paralelo || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Todos los campos son requeridos: carnet, nombre, apellido, curso, paralelo, password' 
      });
    }

    // Verificar si el carnet ya existe
    const estudianteExistente = await Estudiante.findByCarnet(carnet);
    if (estudianteExistente) {
      return res.status(409).json({ 
        success: false,
        message: 'El carnet de estudiante ya está registrado' 
      });
    }

    // Crear nuevo estudiante
    const nuevoEstudiante = await Estudiante.create({
      carnet,
      nombre,
      apellido,
      curso,
      paralelo,
      password
    });

    res.status(201).json({
      success: true,
      message: 'Estudiante registrado exitosamente',
      data: {
        id: nuevoEstudiante.id,
        carnet: nuevoEstudiante.carnet,
        nombre: nuevoEstudiante.nombre,
        apellido: nuevoEstudiante.apellido,
        curso: nuevoEstudiante.curso,
        paralelo: nuevoEstudiante.paralelo
      }
    });

  } catch (error) {
    console.error('Error en registerEstudiante:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error al registrar estudiante' 
    });
  }
};

export const getEstudiantes = async (req, res) => {
  try {
    const estudiantes = await Estudiante.getAll();
    res.json({ 
      success: true,
      data: estudiantes 
    });
  } catch (error) {
    console.error('Error en getEstudiantes:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener la lista de estudiantes' 
    });
  }
};

export const getEstudianteByCarnet = async (req, res) => {
  try {
    const { carnet } = req.params;
    const estudiante = await Estudiante.findByCarnet(carnet);

    if (!estudiante) {
      return res.status(404).json({ 
        success: false,
        message: 'Estudiante no encontrado' 
      });
    }

    res.json({ 
      success: true,
      data: estudiante 
    });
  } catch (error) {
    console.error('Error en getEstudianteByCarnet:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al buscar estudiante' 
    });
  }
};