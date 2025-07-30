// db.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_HG0rxUFWd3Ce@ep-autumn-breeze-ac80e1ox-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false } // Para conexiones seguras (como Neon)
});

pool.connect()
  .then(() => console.log('✅ Conexión a PostgreSQL establecida.'))
  .catch(err => console.error('❌ Error al conectar con PostgreSQL:', err.message));

module.exports = pool;
