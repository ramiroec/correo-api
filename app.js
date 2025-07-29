// --- servidor.js adaptado para Turso ---
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./conexionDB');
const nodemailer = require('nodemailer');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

console.log('🚀 Servidor inicializando...');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ramiroec2@gmail.com',
    pass: 'aaru cwxn ofjy lbfc'
  }
});

app.post('/agregar', async (req, res) => {
  const { email } = req.body;
  try {
    await db.execute({
      sql: 'INSERT OR IGNORE INTO correos (email) VALUES (?)',
      args: [email]
    });
    res.send('Email agregado.');
  } catch (err) {
    console.error('❌ Error al insertar email:', err.message);
    res.status(500).send('Error al guardar email.');
  }
});

app.post('/enviar', async (req, res) => {
  const { asunto, cuerpo } = req.body;
  try {
    const result = await db.execute('SELECT email FROM correos');
    const emails = result.rows.map(row => row.email);

    const mailOptions = {
      from: 'ramiroec2@gmail.com',
      to: emails.join(','),
      subject: asunto,
      html: `
        <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 32px;">
          <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #eee; padding: 24px;">
            <h2 style="color: #2a7ae2;">${asunto}</h2>
            <div>${cuerpo}</div>
            <hr style="margin: 32px 0;">
            <div style="text-align: center; color: #888; font-size: 13px;">
              <img src="https://cdn-icons-png.flaticon.com/512/561/561127.png" alt="Correo" width="48" style="margin-bottom: 8px;" />
              <br>
              Este correo fue enviado con <b>Correo Masivo</b>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    await db.execute({
      sql: 'INSERT INTO envios (fecha, asunto, cuerpo) VALUES (?, ?, ?)',
      args: [new Date().toISOString(), asunto, cuerpo]
    });

    res.send('Correo enviado a todos.');
  } catch (err) {
    console.error('❌ Error al enviar correo o guardar envío:', err.message);
    res.status(500).send('Error al enviar correo.');
  }
});

app.get('/envios', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM envios ORDER BY fecha DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error al obtener envíos:', err.message);
    res.status(500).send('Error al obtener envíos.');
  }
});

app.get('/correos', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM correos');
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error al obtener correos:', err.message);
    res.status(500).send('Error al obtener correos.');
  }
});

app.get('/correos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM correos WHERE id = ?',
      args: [id]
    });
    const row = result.rows[0];
    if (!row) return res.status(404).send('Correo no encontrado.');
    res.json(row);
  } catch (err) {
    console.error('❌ Error al obtener correo:', err.message);
    res.status(500).send('Error al obtener correo.');
  }
});

app.put('/correos/:id', async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  try {
    const result = await db.execute({
      sql: 'UPDATE correos SET email = ? WHERE id = ?',
      args: [email, id]
    });
    if (result.rowsAffected === 0) return res.status(404).send('Correo no encontrado.');
    res.send('Correo actualizado.');
  } catch (err) {
    console.error('❌ Error al actualizar correo:', err.message);
    res.status(500).send('Error al actualizar correo.');
  }
});

app.delete('/correos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.execute({
      sql: 'DELETE FROM correos WHERE id = ?',
      args: [id]
    });
    if (result.rowsAffected === 0) return res.status(404).send('Correo no encontrado.');
    res.send('Correo eliminado.');
  } catch (err) {
    console.error('❌ Error al eliminar correo:', err.message);
    res.status(500).send('Error al eliminar correo.');
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const originalName = file.originalname.replace(/\s+/g, '_');
    cb(null, Date.now() + '-' + originalName);
  }
});
const upload = multer({ storage });

app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ninguna imagen' });
  }
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ location: imageUrl });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
