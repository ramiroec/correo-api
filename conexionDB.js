// conexionDB.js
const { createClient } = require('@libsql/client');

const db = createClient({
  url: 'libsql://your-db-name.turso.io', // reemplaza con tu URL real
  authToken: 'your-auth-token',         // reemplaza con tu token real
});

module.exports = db;


/*
const { createClient } = require('@libsql/client');

const db = createClient({
  url: 'libsql://emails-ramiroec.aws-us-east-1.turso.io', // Cambia esto por tu URL real
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTM3NjAyMDYsImlkIjoiNTMwMzQ1MGItOTA0My00MjY0LTkzZmYtNzc1MjMxNWVlNmI0IiwicmlkIjoiNzg3Mzc2Y2YtYmQ2NS00MmU5LWJlY2YtNDJjY2VkMzQwMzE0In0.tSDJvlaASTx1THL99Mr9vROwLhc56_ioanRSTELI-o5ziQ6Czzeoju0TZ87j3NiPGeEFMzHO8JgbBwDbbLigBw', // Cambia esto por tu token real
});

// Crear tabla de correos
db.execute(`
  CREATE TABLE IF NOT EXISTS correos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE
  )
`).then(() => {
  console.log('✅ Tabla "correos" verificada/creada.');
}).catch((err) => {
  console.error('❌ Error al crear tabla correos:', err.message);
});

// Crear tabla de envíos
db.execute(`
  CREATE TABLE IF NOT EXISTS envios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha TEXT NOT NULL,
    asunto TEXT NOT NULL,
    cuerpo TEXT NOT NULL
  )
`).then(() => {
  console.log('✅ Tabla "envios" verificada/creada.');
}).catch((err) => {
  console.error('❌ Error al crear tabla envios:', err.message);
});

module.exports = db;
*/