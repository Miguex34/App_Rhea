// pagoRoutes.js
const express = require('express');
const router = express.Router();
const pagoController = require('../controllers/pagoController');

router.post('/iniciar', pagoController.iniciarTransaccion); // Iniciar la transacción
router.get('/confirmacion', pagoController.confirmarPago); // Confirmar pago desde Transbank
router.get('/finalizacion', pagoController.finalizarPago); // Redirigir al usuario

module.exports = router;