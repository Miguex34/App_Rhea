const { WebpayPlus,   } = require('transbank-sdk');
const Pago = require('../models/Pago');
const Reserva = require('../models/Reserva');
const crypto = require('crypto');

// Configuración de Transbank
const webpay = new WebpayPlus.Transaction();

exports.iniciarTransaccion = async (req, res) => {
  try {
    const { idReserva, monto } = req.body;

    if (!idReserva || !monto) {
      return res.status(400).json({ error: 'idReserva y monto son requeridos.' });
    }

    // Usa idReserva directamente como buyOrder
    const buyOrder = idReserva;

    console.log(`Iniciando transacción con:\nidReserva: ${idReserva}\nmonto: ${monto}\nbuyOrder: ${buyOrder}`);

    // Crear la transacción en Transbank
    const response = await webpay.create(
      buyOrder.toString(), // ID único como "orden de compra"
      "1", // session id
      monto, // Monto total a pagar
      //"http://localhost:5000/api/pagos/confirmacion"//, // URL de confirmación en el backend
      "https://apprhea-production.up.railway.app/confirmacion",  //URL de retorno al frontend
      
      
    );
    console.log('Respuesta de Transbank:', response);
    res.json({
      urlTransbank: response.url,
      token: response.token,
    });

  } catch (error) {
    console.error('Error al iniciar la transacción:', error.message);
    res.status(500).json({ error: 'Error al iniciar la transacción.' });
  }
};

exports.confirmarPago = async (req, res) => {
  try {
    console.log("req.querytoken_ws",req.query.token_ws);
    const { token_ws } = req.query; // Transbank envía el token como query param
    console.log("1");
    // Consultar el estado de la transacción
    console.log("token_ws",token_ws);
    var response;
    try {
      response = await webpay.commit(token_ws);
    } catch (error) {
      console.error('error en commit:', error.message);
      res.status(200).json({ 'error': 'Error al confirmar el pago.' });
      return;
    }  
    console.log("2");

    // Verificar si ya existe un pago para este `buy_order`
    const existingPago = await Pago.findOne({ where: { id_reserva: response.buy_order } });

    if (existingPago) {
      console.log(`Pago ya procesado para buy_order: ${response.buy_order}`);
      return res.status(200).json({
        mensaje: 'Pago ya procesado.',
        estado: existingPago.estado,
      });
    }

    if (response.status === 'AUTHORIZED') {
      console.log("3");
      // Actualizar el estado del pago en la base de datos
      const pago = await Pago.create({
        id_reserva: response.buy_order,
        monto: response.amount,
        fecha: new Date(),
        metodo_pago: 'Webpay Plus',
        estado: 'CONFIRMADA',
        codigo_transaccion: response.authorization_code,
      });
      console.log("4");
      // Actualizar la reserva
      await Reserva.update(
        { id_pago: pago.id, estado: 'CONFIRMADA' },
        { where: { id: response.buy_order } }
      );
      console.log("5");
      res.json({ mensaje: 'Pago aprobado', detalles: response });
    } else {
      // Actualizar el estado del pago en la base de datos
      const pago = await Pago.create({
        id_reserva: response.buy_order,
        monto: response.amount,
        fecha: new Date(),
        metodo_pago: 'Webpay Plus',
        estado: 'RECHAZADO',
        codigo_transaccion: response.authorization_code,
      });
      // Actualizar la reserva
      await Reserva.update(
        { id_pago: pago.id, estado: 'RECHAZADO' },
        { where: { id: response.buy_order } }
      );
      res.status(200).json({ "error": 'El pago fue rechazado.', detalles: response });
    }
  } catch (error) {
    console.error('Error al confirmar el pago:', error.message);
    res.status(200).json({ "error": 'Error al confirmar el pago.' });
  }
};

exports.finalizarPago = async (req, res) => {
  try {
    const { token_ws } = req.query;
    res.redirect(`/metodoPago?status=finalizado&token=${token_ws}`);
  } catch (error) {
    console.error('Error en la finalización del pago:', error.message);
    res.status(500).send('Error en la finalización del pago.');
  }
};
