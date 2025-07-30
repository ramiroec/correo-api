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

// Configurar el transporte de correo (puedes usar Gmail o Mailtrap para pruebas)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'labdiazgill@gmail.com',
    pass: 'xkxn voir zxiz vsza'   
  }
});

// Agregar correo a la lista
app.post('/agregar', (req, res) => {
  const { email } = req.body;
  console.log('📥 Agregando correo:', email);

  db.run('INSERT OR IGNORE INTO correos (email) VALUES (?)', [email], function (err) {
    if (err) {
      console.error('❌ Error al insertar email:', err.message);
      return res.status(500).send('Error al guardar email.');
    }
    console.log('✅ Email guardado con ID:', this.lastID);
    res.send('Email agregado.');
  });
});

// Enviar correo a todos
app.post('/enviar', (req, res) => {
  const { asunto, cuerpo } = req.body;
  console.log('📨 Enviando email con asunto:', asunto);

  db.all('SELECT email FROM correos', [], (err, rows) => {
    if (err) {
      console.error('❌ Error al obtener correos:', err.message);
      return res.status(500).send('Error al obtener correos.');
    }

    const emails = rows.map(row => row.email);
    console.log('📬 Correos encontrados:', emails);

    const mailOptions = {
      from: 'labdiazgill@gmail.com', // Debe coincidir con el usuario autenticado
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

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('❌ Error al enviar correo:', error);
        return res.status(500).send('Error al enviar correo.');
      } else {
        console.log('✅ Correo enviado:', info.response);

        db.run('INSERT INTO envios (fecha, asunto, cuerpo) VALUES (?, ?, ?)',
          [new Date().toISOString(), asunto, cuerpo], (err) => {
            if (err) {
              console.error('❌ Error al guardar envío:', err.message);
            } else {
              console.log('📦 Envío registrado en la base de datos.');
            }
          });

        res.send('Correo enviado a todos.');
      }
    });
  });
});

// Ver historial de envíos
app.get('/envios', (req, res) => {
  db.all('SELECT * FROM envios ORDER BY fecha DESC', [], (err, rows) => {
    if (err) {
      console.error('❌ Error al obtener envíos:', err.message);
      return res.status(500).send('Error al obtener envíos.');
    }
    console.log('📜 Historial de envíos obtenido.');
    res.json(rows);
  });
});

// Listar todos los correos
app.get('/correos', (req, res) => {
  db.all('SELECT * FROM correos', [], (err, rows) => {
    if (err) {
      console.error('❌ Error al obtener correos:', err.message);
      return res.status(500).send('Error al obtener correos.');
    }
    res.json(rows);
  });
});

// Obtener un correo por ID
app.get('/correos/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM correos WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('❌ Error al obtener correo:', err.message);
      return res.status(500).send('Error al obtener correo.');
    }
    if (!row) return res.status(404).send('Correo no encontrado.');
    res.json(row);
  });
});

// Actualizar un correo
app.put('/correos/:id', (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  db.run('UPDATE correos SET email = ? WHERE id = ?', [email, id], function (err) {
    if (err) {
      console.error('❌ Error al actualizar correo:', err.message);
      return res.status(500).send('Error al actualizar correo.');
    }
    if (this.changes === 0) return res.status(404).send('Correo no encontrado.');
    res.send('Correo actualizado.');
  });
});

// Eliminar un correo
app.delete('/correos/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM correos WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('❌ Error al eliminar correo:', err.message);
      return res.status(500).send('Error al eliminar correo.');
    }
    if (this.changes === 0) return res.status(404).send('Correo no encontrado.');
    res.send('Correo eliminado.');
  });
});

// Configura almacenamiento de imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Elimina espacios y caracteres especiales del nombre original
    const originalName = file.originalname.replace(/\s+/g, '_');
    cb(null, Date.now() + '-' + originalName);
  }
});
const upload = multer({ storage });

// Endpoint para subir imágenes
app.post('/upload', upload.single('image'), (req, res) => {
  console.log('🖼️ Intentando subir imagen...');
  if (!req.file) {
    console.error('❌ No se subió ninguna imagen');
    return res.status(400).json({ error: 'No se subió ninguna imagen' });
  }
  console.log('✅ Imagen subida:', req.file);

  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  const responseJson = { location: imageUrl };
  console.log('📤 JSON enviado al frontend:', responseJson);

  res.json(responseJson);
});

// Servir archivos estáticos de la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});