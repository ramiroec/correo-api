const express = require('express');
const bodyParser = require('body-parser');
const db = require('./conexionDB'); // ← usa Pool de PostgreSQL
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

// Middleware para log de accesos
app.use((req, res, next) => {
  const start = process.hrtime();
  res.on('finish', () => {
    const durationInMilliseconds = getDurationInMilliseconds(start);
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} ${res.statusCode} ${durationInMilliseconds.toLocaleString()} ms`);
  });
  next();
});

function getDurationInMilliseconds(start) {
  const NS_PER_SEC = 1e9;
  const NS_TO_MS = 1e6;
  const diff = process.hrtime(start);
  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
}

app.use(cors());
app.use(bodyParser.json());

console.log('🚀 Servidor inicializando...');

// Configurar transporte de correo con opciones mejoradas
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ramiroec2@gmail.com',
    pass: 'aaru cwxn ofjy lbfc'
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateLimit: 10,
  rateDelta: 1000
});

// Importar rutas de correos
const correosRoutes = require('./correos')(db, transporter);
const listasRoutes = require('./listas')(db, transporter);
app.use('/correos', correosRoutes);
app.use('/listas', listasRoutes);

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});