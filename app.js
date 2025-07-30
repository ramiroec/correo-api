// index.js
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./conexionDB'); // ← usa Pool de PostgreSQL
const nodemailer = require('nodemailer');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;

const app = express();
app.use(cors());
app.use(bodyParser.json());

console.log('🚀 Servidor inicializando...');

// Configurar transporte de correo
// Configurar transporte de correo con opciones mejoradas
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'labdiazgill@gmail.com',
    pass: 'xkxn voir zxiz vsza'
  },
  pool: true, // Usar conexiones persistentes
  maxConnections: 5, // Número máximo de conexiones concurrentes
  maxMessages: 100, // Máximo de mensajes por conexión
  rateLimit: 10, // Mensajes por segundo
  rateDelta: 1000 // Intervalo de tiempo para rateLimit
});

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: 'dehsi2ubm',
  api_key: '534226953618942',
  api_secret: 'yd1gRm1d4X2PbGxpfIS9wtUbI1s'
});

// Agregar correo
app.post('/agregar', async (req, res) => {
  const { email } = req.body;
  console.log('📥 Agregando correo:', email);

  try {
    await db.query('INSERT INTO correos (email) VALUES ($1) ON CONFLICT (email) DO NOTHING', [email]);
    res.send('Email agregado.');
  } catch (err) {
    console.error('❌ Error al insertar email:', err.message);
    res.status(500).send('Error al guardar email.');
  }
});

// En el endpoint /enviar, modificar para enviar por lotes:
app.post('/enviar', async (req, res) => {
  const { asunto, cuerpo } = req.body;
  console.log('📨 Enviando email con asunto:', asunto);

  try {
    const result = await db.query('SELECT email FROM correos');
    const allEmails = result.rows.map(row => row.email);
    console.log('📬 Total de correos encontrados:', allEmails.length);

    // Dividir en lotes de 50 correos
    const batchSize = 50;
    for (let i = 0; i < allEmails.length; i += batchSize) {
      const batch = allEmails.slice(i, i + batchSize);
      console.log(`✉️ Enviando lote ${i/batchSize + 1} a ${batch.length} destinatarios`);

      const mailOptions = {
        from: 'labdiazgill@gmail.com',
        to: batch.join(','),
        subject: asunto,
        html: `
          <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 32px;">
            <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #eee; padding: 24px;">
              <div>${cuerpo}</div>
              <hr style="margin: 32px 0;">
              <div style="text-align: center; color: #888; font-size: 11px;">
                <img src="https://cdn-icons-png.flaticon.com/512/561/561127.png" alt="Correo" width="24" style="margin-bottom: 4px;" />
                <br>
                Este correo forma parte de una comunicación masiva enviada con fines informativos.
              </div>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Lote ${i/batchSize + 1} enviado`);
      
      // Pequeña pausa entre lotes para evitar bloqueos
      if (i + batchSize < allEmails.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    await db.query(
      'INSERT INTO envios (fecha, asunto, cuerpo) VALUES ($1, $2, $3)',
      [new Date().toISOString(), asunto, cuerpo]
    );

    res.send(`Correo enviado a todos los ${allEmails.length} destinatarios en ${Math.ceil(allEmails.length/batchSize)} lotes.`);
  } catch (err) {
    console.error('❌ Error al enviar correo:', err.message);
    res.status(500).send('Error al enviar correo.');
  }
});


// Ver historial de envíos
app.get('/envios', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM envios ORDER BY fecha DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error al obtener envíos:', err.message);
    res.status(500).send('Error al obtener envíos.');
  }
});

// Listar todos los correos
app.get('/correos', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM correos');
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error al obtener correos:', err.message);
    res.status(500).send('Error al obtener correos.');
  }
});

// Obtener correo por ID
app.get('/correos/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM correos WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).send('Correo no encontrado.');
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error al obtener correo:', err.message);
    res.status(500).send('Error al obtener correo.');
  }
});

// Actualizar un correo
app.put('/correos/:id', async (req, res) => {
  const { email } = req.body;
  try {
    const result = await db.query('UPDATE correos SET email = $1 WHERE id = $2', [email, req.params.id]);
    if (result.rowCount === 0) return res.status(404).send('Correo no encontrado.');
    res.send('Correo actualizado.');
  } catch (err) {
    console.error('❌ Error al actualizar correo:', err.message);
    res.status(500).send('Error al actualizar correo.');
  }
});

// Eliminar un correo
app.delete('/correos/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM correos WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).send('Correo no encontrado.');
    res.send('Correo eliminado.');
  } catch (err) {
    console.error('❌ Error al eliminar correo:', err.message);
    res.status(500).send('Error al eliminar correo.');
  }
});

// Multer para recibir archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Subir imagen a Cloudinary
app.post('/upload', upload.single('image'), async (req, res) => {
  console.log('🖼️ Intentando subir imagen a Cloudinary...');
  if (!req.file) return res.status(400).json({ error: 'No se subió ninguna imagen' });

  try {
    const result = await cloudinary.uploader.upload_stream(
      { folder: 'correo-app' },
      (error, result) => {
        if (error) {
          console.error('❌ Error al subir a Cloudinary:', error);
          return res.status(500).json({ error: 'Error al subir imagen a Cloudinary' });
        }
        res.json({ location: result.secure_url });
      }
    );
    // Escribir el buffer en el stream
    result.end(req.file.buffer);
  } catch (err) {
    console.error('❌ Error general al subir a Cloudinary:', err);
    res.status(500).json({ error: 'Error al subir imagen a Cloudinary' });
  }
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
