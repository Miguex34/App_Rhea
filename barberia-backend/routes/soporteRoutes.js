// archivo: routes/soporteRoutes.js
const express = require('express');
const router = express.Router();
const soporteController = require('../controllers/soporteController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const Usuario = require('../models/Usuario'); // Asegúrate de ajustar la ruta de tu modelo
const bcrypt = require('bcryptjs');

// Verifica que el soporteController contiene `crearTicket`
router.post('/crear', authMiddleware, upload.fields([
    { name: 'asunto', maxCount: 1 },
    { name: 'descripcion', maxCount: 1 },
    { name: 'prioridad', maxCount: 1 },
    { name: 'imagen', maxCount: 1 } // La imagen es opcional
  ]), soporteController.crearTicket);

router.get('/tickets', authMiddleware, soporteController.obtenerTicketsUsuario);

// Ruta para obtener todos los tickets de soporte (solo para administradores)
router.get('/todos', authMiddleware, soporteController.obtenerTodosLosTickets);

// Ruta para actualizar el estado de un ticket de soporte
router.put('/:id/estado', authMiddleware, soporteController.actualizarEstadoTicket);

router.post('/register/soporte', async (req, res) => {
  const { nombre, correo, telefono, contraseña } = req.body;

  // Validación básica de los datos
  if (!nombre || !correo || !telefono || !contraseña) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    // Verificar si el correo ya está registrado
    const usuarioExistente = await Usuario.findOne({ where: { correo } });
    if (usuarioExistente) {
      return res.status(409).json({ message: 'El correo ya está registrado' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Crear el usuario con el cargo "Soporte"
    const nuevoUsuario = await Usuario.create({
      nombre,
      correo,
      telefono, 
      contrasena_hash: hashedPassword,
      cargo: 'Soporte', // Cargo predeterminado
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        correo: nuevoUsuario.correo,
        cargo: nuevoUsuario.cargo,
      },
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});
module.exports = router;
