const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_2L4VpmRWjBhJ@ep-curly-boat-acm1ihpp-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false },
  idleTimeoutMillis: 30000, // 30 segundos de inactividad antes de cerrar
  connectionTimeoutMillis: 5000, // 5 segundos para conectar
  max: 10 // Máximo de conexiones en el pool
});

// Verificación periódica de conexiones
setInterval(async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
  } catch (err) {
    console.error('❌ Error en verificación de conexión:', err.message);
  }
}, 30000); // Cada 30 segundos

module.exports = {
  async query(text, params) {
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }
};