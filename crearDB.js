// crearDB.js
const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_HG0rxUFWd3Ce@ep-autumn-breeze-ac80e1ox-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false } // Necesario para conexión SSL
});

async function crearTablas() {
  try {
    await client.connect();
    console.log('✅ Conexión a PostgreSQL establecida.');

    // Crear tabla de correos
    await client.query(`
      CREATE TABLE IF NOT EXISTS correos (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE
      )
    `);
    console.log('✅ Tabla "correos" verificada/creada.');

    // Crear tabla de envíos
    await client.query(`
      CREATE TABLE IF NOT EXISTS envios (
        id SERIAL PRIMARY KEY,
        fecha TEXT NOT NULL,
        asunto TEXT NOT NULL,
        cuerpo TEXT NOT NULL
      )
    `);
    console.log('✅ Tabla "envios" verificada/creada.');
  } catch (err) {
    console.error('❌ Error al crear tablas:', err.message);
  } finally {
    await client.end();
  }
}

crearTablas();
