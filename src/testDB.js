import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Configuración
dotenv.config({ path: '.env' });

async function testConnection() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'votacion_estudiantil',
      port: process.env.DB_PORT || 3306, 
      waitForConnections: true,
      connectionLimit: 10,
      connectTimeout: 10000  
    });

    console.log('✅ Conexión a MySQL exitosa!');
    
    // Prueba adicional de consulta
    const [rows] = await connection.query('SELECT 1 + 1 AS result');
    console.log(`✔ Prueba de consulta exitosa. Resultado: ${rows[0].result}`);
  
    } catch (error) {
        console.error('❌ Error de conexión a MySQL:', error.message);
        console.error('Código de error:', error.code);
        
        // Sugerencias basadas en errores comunes
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        console.error('\n¿Has verificado que las credenciales en tu .env son correctas?');
        console.error(`Usuario actual: ${process.env.DB_USER || 'root'}`);
        }
       
    } finally {
        if (connection) await connection.end();
        process.exit();  // Asegura que el proceso termine
    }
}

testConnection();