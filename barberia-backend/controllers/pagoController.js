const Pago = require('../models/Pago');
const Reserva = require('../models/Reserva');
const transbank = require('transbank-sdk'); // Asegúrate de tener configurado este paquete o SDK

// Crear un pago
exports.createPago = async (req, res) => {
  try {
    const { id_reserva, monto, metodo_pago } = req.body;

    // Validación simple
    if (!id_reserva || !monto || !metodo_pago) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }
    const completadoUrl = `${process.env.BACKEND_URL}/api/pagos/completado`;
    // Crear una instancia de Transbank Webpay Plus Transaction
    const transaction = new transbank.WebpayPlus.Transaction();
    const response = await transaction.create(
      'Tienda123', // Código del comercio de integración
      'Orden123',  // Número de orden única para el pago
      monto,       // Monto a pagar
      completadoUrl // URL dinámica donde se redirige al cliente después del pago
    );

    // Guardar el pago en la base de datos
    const pago = await Pago.create({
      id_reserva,
      monto,
      metodo_pago,
      fecha: new Date(),
      estado: 'Pendiente', // Estado inicial del pago
      codigo_transaccion: response.token, // Guardamos el token de Transbank
    });

    res.status(201).json({ message: 'Pago creado con éxito', pago, url: response.url });
  } catch (error) {
    console.error('Error al crear el pago:', error);
    res.status(500).json({ message: 'Error al crear el pago', error });
  }
};

// Completar el pago después de la respuesta de Transbank
exports.completePago = async (req, res) => {
  try {
    const token = req.body.token_ws;

    // Crear una instancia de Transbank Webpay Plus Transaction
    const transaction = new transbank.WebpayPlus.Transaction();
    const response = await transaction.commit(token);

    // Actualizar el pago en la base de datos
    const pago = await Pago.findOne({ where: { codigo_transaccion: token } });

    if (!pago) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    pago.estado = response.status === 'AUTHORIZED' ? 'Completado' : 'Rechazado';
    await pago.save();

    res.status(200).json({ message: 'Pago completado', pago });
  } catch (error) {
    console.error('Error al completar el pago:', error);
    res.status(500).json({ message: 'Error al completar el pago', error });
  }
};

// Obtener todos los pagos
exports.getPagos = async (req, res) => {
  try {
    const pagos = await Pago.findAll();
    res.status(200).json(pagos);
  } catch (error) {
    console.error('Error al obtener los pagos:', error);
    res.status(500).json({ message: 'Error al obtener los pagos', error });
  }
};

// Obtener un pago por ID
exports.getPagoById = async (req, res) => {
  try {
    const { id } = req.params;
    const pago = await Pago.findByPk(id);

    if (!pago) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    res.status(200).json(pago);
  } catch (error) {
    console.error('Error al obtener el pago:', error);
    res.status(500).json({ message: 'Error al obtener el pago', error });
  }
};

// Actualizar un pago
exports.updatePago = async (req, res) => {
  try {
    const { id } = req.params;
    const { monto, metodo_pago, estado } = req.body;

    const pago = await Pago.findByPk(id);
    if (!pago) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    pago.monto = monto || pago.monto;
    pago.metodo_pago = metodo_pago || pago.metodo_pago;
    pago.estado = estado || pago.estado;

    await pago.save();
    res.status(200).json({ message: 'Pago actualizado con éxito', pago });
  } catch (error) {
    console.error('Error al actualizar el pago:', error);
    res.status(500).json({ message: 'Error al actualizar el pago', error });
  }
};

// Eliminar un pago
exports.deletePago = async (req, res) => {
  try {
    const { id } = req.params;
    const pago = await Pago.findByPk(id);

    if (!pago) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    await pago.destroy();
    res.status(200).json({ message: 'Pago eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar el pago:', error);
    res.status(500).json({ message: 'Error al eliminar el pago', error });
  }
};
