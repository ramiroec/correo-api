const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'emails.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error al conectar con la base de datos:', err.message);
  } else {
    console.log('✅ Conexión a SQLite establecida.');
  }
});

// Crear tabla de correos
db.run(`
  CREATE TABLE IF NOT EXISTS correos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE
  )
`, (err) => {
  if (err) {
    console.error('❌ Error al crear tabla correos:', err.message);
  } else {
    console.log('✅ Tabla "correos" verificada/creada.');
  }
});

// Crear tabla de envíos
db.run(`
  CREATE TABLE IF NOT EXISTS envios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha TEXT NOT NULL,
    asunto TEXT NOT NULL,
    cuerpo TEXT NOT NULL
  )
`, (err) => {
  if (err) {
    console.error('❌ Error al crear tabla envios:', err.message);
  } else {
    console.log('✅ Tabla "envios" verificada/creada.');
  }
});

module.exports = db;
