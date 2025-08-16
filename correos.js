module.exports = function(db, transporter) {
  const express = require('express');
  const router = express.Router();

  // Enviar correos SOLO a los de la lista recibida
  router.post('/enviar', async (req, res) => {
    const { asunto, cuerpo, listaId } = req.body;
    if (!listaId) {
      return res.status(400).send('Debe indicar listaId');
    }
    console.log('📨 Enviando email con asunto:', asunto, 'a lista:', listaId);

    const inicio = Date.now();

    try {
      // Obtener los correos de la lista indicada
      const result = await db.query(
        `SELECT c.email
         FROM correos c
         JOIN correos_listas cl ON c.id = cl.correo_id
         WHERE cl.lista_id = $1`,
        [listaId]
      );
      const allEmails = result.rows.map(row => row.email);
      console.log('📬 Total de correos en la lista:', allEmails.length);

      if (allEmails.length === 0) {
        return res.status(400).send('La lista no tiene correos.');
      }

      const batchSize = 50;
      let lotes = 0;
      for (let i = 0; i < allEmails.length; i += batchSize) {
        const batch = allEmails.slice(i, i + batchSize);
        lotes++;
        console.log(`✉️ Enviando lote ${lotes} a ${batch.length} destinatarios`);

        const mailOptions = {
          from: 'ramiroec2@gmail.com',
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
        console.log(`✅ Lote ${lotes} enviado`);

        if (i + batchSize < allEmails.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      await db.query(
        'INSERT INTO envios (fecha, asunto, cuerpo) VALUES ($1, $2, $3)',
        [new Date().toISOString(), asunto, cuerpo]
      );

      const fin = Date.now();

      res.json({
        mensaje: `Correo enviado a ${allEmails.length} destinatarios de la lista en ${lotes} lotes.`,
        asunto,
        listaId,
        destinatarios: allEmails.length,
        lotes,
        fecha: new Date().toISOString(),
        duracionSegundos: Math.round((fin - inicio) / 1000)
      });
    } catch (err) {
      console.error('❌ Error al enviar correo:', err.message);
      res.status(500).send('Error al enviar correo.');
    }
  });

  // Ver historial de envíos
  router.get('/envios', async (req, res) => {
    try {
      const result = await db.query('SELECT * FROM envios ORDER BY fecha DESC');
      res.json(result.rows);
    } catch (err) {
      console.error('❌ Error al obtener envíos:', err.message);
      res.status(500).send('Error al obtener envíos.');
    }
  });

  return router;
};