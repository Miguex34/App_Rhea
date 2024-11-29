const express = require('express');
const router = express.Router();
const panelReservasController = require('../controllers/panelReservasController');

// Ruta para obtener reservas por negocio
router.get('/:id_negocio', panelReservasController.obtenerReservasPorNegocio);

// Ruta para obtener reservas por empleado
router.get('/empleado/:id_empleado', panelReservasController.obtenerReservasPorEmpleado);

module.exports = router;