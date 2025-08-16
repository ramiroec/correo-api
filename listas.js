module.exports = function (db, transporter) {
    const express = require('express');
    const router = express.Router();

    // Crear una nueva lista
    router.post('/', async (req, res) => {
        const { nombre } = req.body;
        try {
            await db.query('INSERT INTO listas (nombre) VALUES ($1) ON CONFLICT (nombre) DO NOTHING', [nombre]);
            res.send('Lista creada.');
        } catch (err) {
            console.error('❌ Error al crear lista:', err.message);
            res.status(500).send('Error al crear lista.');
        }
    });

    // Listar todas las listas
    router.get('/', async (req, res) => {
        try {
            const result = await db.query('SELECT * FROM listas ORDER BY nombre');
            res.json(result.rows);
        } catch (err) {
            console.error('❌ Error al obtener listas:', err.message);
            res.status(500).send('Error al obtener listas.');
        }
    });

    // Agregar un correo a una lista
    router.post('/:id/correos', async (req, res) => {
        const { email } = req.body;
        const listaId = req.params.id;

        try {
            const correoRes = await db.query('INSERT INTO correos (email) VALUES ($1) ON CONFLICT (email) DO UPDATE SET email=EXCLUDED.email RETURNING id', [email]);
            const correoId = correoRes.rows[0].id;

            await db.query('INSERT INTO correos_listas (correo_id, lista_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [correoId, listaId]);
            res.send('Correo agregado a la lista.');
        } catch (err) {
            console.error('❌ Error al agregar correo a lista:', err.message);
            res.status(500).send('Error al asociar correo a lista.');
        }
    });

    // Obtener todos los correos de una lista
    router.get('/:id/correos', async (req, res) => {
        const listaId = req.params.id;
        try {
            const result = await db.query(`
      SELECT c.id, c.email
      FROM correos c
      JOIN correos_listas cl ON c.id = cl.correo_id
      WHERE cl.lista_id = $1
      ORDER BY c.email
    `, [listaId]);

            res.json(result.rows);
        } catch (err) {
            console.error('❌ Error al obtener correos de lista:', err.message);
            res.status(500).send('Error al obtener correos de la lista.');
        }
    });

    // Borrar una lista y sus asociaciones
    router.delete('/:id', async (req, res) => {
        const listaId = req.params.id;
        try {
            // Elimina las asociaciones de correos con la lista
            await db.query('DELETE FROM correos_listas WHERE lista_id = $1', [listaId]);
            // Elimina la lista
            await db.query('DELETE FROM listas WHERE id = $1', [listaId]);
            res.send('Lista eliminada.');
        } catch (err) {
            console.error('❌ Error al eliminar lista:', err.message);
            res.status(500).send('Error al eliminar lista.');
        }
    });

    return router;
};
