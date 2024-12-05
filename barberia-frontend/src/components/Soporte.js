import React, { useState, useEffect,useCallback } from 'react';
import axios from 'axios';

const FormularioSoporte = () => {
  const [formData, setFormData] = useState({
    asunto: '',
    descripcion: '',
    prioridad: 'media',
    imagen: null,
  });

  const [mensaje, setMensaje] = useState('');
  const [tickets, setTickets] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'imagen') {
      setFormData({
        ...formData,
        imagen: files[0],
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const fetchTickets = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMensaje('No estás autenticado. Por favor, inicia sesión.');
        return;
      }

      const response = await axios.get(`${API_URL}/api/soportes/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 && response.data.tickets) {
        setTickets(response.data.tickets);
      } else {
        throw new Error('No se pudieron obtener los tickets. Intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error al obtener los tickets de soporte:', error);
      setMensaje(
        error.response?.data?.message || 'Error al obtener los tickets de soporte. Intenta más tarde.'
      );
    }
  }, [API_URL]);

  // Manejar la creación de tickets
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.asunto) {
      setMensaje('Por favor, seleccione un asunto.');
      return;
    }

    if (formData.descripcion.trim().length < 10 || formData.descripcion.trim().length > 500) {
      setMensaje('La descripción debe tener entre 10 y 500 caracteres.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMensaje('No estás autenticado. Por favor, inicia sesión.');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('asunto', formData.asunto);
      formDataToSend.append('descripcion', formData.descripcion);
      formDataToSend.append('prioridad', formData.prioridad);
      if (formData.imagen) {
        formDataToSend.append('imagen', formData.imagen);
      }

      const response = await axios.post(`${API_URL}/api/soportes/crear`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        setMensaje('Ticket creado exitosamente.');
        fetchTickets(); // Actualiza la lista de tickets
      } else {
        throw new Error('No se pudo crear el ticket. Intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error al crear el ticket:', error);
      setMensaje(
        error.response?.data?.message || 'Error al crear el ticket. Por favor, intenta más tarde.'
      );
    }
  };

  // Llamar a fetchTickets al montar el componente
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const getCardStyle = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 border-yellow-300';
      case 'en_progreso':
        return 'bg-blue-100 border-blue-300';
      case 'resuelto':
        return 'bg-green-100 border-green-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen flex flex-col items-center">
      <div className="w-full max-w-2xl mb-8">
        <h1 className="text-3xl font-bold mb-4">Crear Ticket de Soporte</h1>
        {mensaje && <p className="mb-4 text-green-500">{mensaje}</p>}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md space-y-6">
          <div>
            <label className="block font-semibold mb-2">Asunto</label>
            <select
              name="asunto"
              value={formData.asunto}
              onChange={handleChange}
              className="p-2 border rounded w-full bg-gray-100"
            >
            <option value="">Seleccione un asunto</option>
            <option value="Problema al crear un servicio">Problema al crear un servicio</option>
            <option value="Problema con la cuenta">Problema con la cuenta</option>
            <option value="Problema con pagos">Problema con pagos</option>
            <option value="Problema con el calendario">Problema con el calendario</option>
            <option value="Problema con las notificaciones">Problema con las notificaciones</option>
            <option value="Error al registrar empleados">Error al registrar empleados</option>
            <option value="Error en la disponibilidad de empleados">Error en la disponibilidad de empleados</option>
            <option value="Problema con la visualización del negocio">Problema con la visualización del negocio</option>
            <option value="Dificultades para acceder a la cuenta">Dificultades para acceder a la cuenta</option>
            <option value="Error en el registro de clientes">Error en el registro de clientes</option>
            <option value="Consulta sobre configuración del negocio">Consulta sobre configuración del negocio</option>
            <option value="Consulta sobre tarifas o suscripciones">Consulta sobre tarifas o suscripciones</option>
            <option value="Error al subir imágenes o documentos">Error al subir imágenes o documentos</option>
            <option value="Problema con las reservas de clientes">Problema con las reservas de clientes</option>
            <option value="Error en el sistema de soporte">Error en el sistema de soporte</option>
            <option value="Problema con la integración de pagos">Problema con la integración de pagos</option>
            <option value="Otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-2">Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              className="p-2 border rounded w-full bg-gray-100"
              placeholder="Describa su problema aquí"
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">Prioridad</label>
            <select
              name="prioridad"
              value={formData.prioridad}
              onChange={handleChange}
              className="p-2 border rounded w-full bg-gray-100"
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-2">Subir Imagen (opcional)</label>
            <input
              type="file"
              name="imagen"
              onChange={handleChange}
              className="p-2 border rounded w-full bg-gray-100"
              accept="image/*"
            />
          </div>
          <button type="submit" className="bg-purple-500 text-white px-4 py-2 rounded">
            Enviar Ticket
          </button>
        </form>
      </div>
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Tus Tickets de Soporte</h2>
        {mensaje && <p className="mensaje-error text-red-500 mb-4">{mensaje}</p>}
        {tickets.length === 0 ? (
          <p>No tienes tickets de soporte creados.</p>
        ) : (
            <ul className="space-y-4">
            {tickets.map((ticket) => (
                <li key={ticket.id} className={`border p-6 rounded shadow-md ${getCardStyle(ticket.estado)}`}>
                    <p><strong>Asunto:</strong> {ticket.asunto}</p>
                    <p><strong>Descripción:</strong> {ticket.descripcion}</p>
                    <p><strong>Prioridad:</strong> {ticket.prioridad}</p>
                    <p><strong>Estado:</strong> {ticket.estado}</p>
                    <p><strong>Fecha de creación:</strong> {new Date(ticket.creado_en).toLocaleString()}</p>
                    <p><strong>Respuesta:</strong> {ticket.respuesta}</p>
                    {ticket.imagen && (
                        <div className="mt-4">
                            <a
                                href={ticket.imagen}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 underline"
                            >
                                Ver Imagen Adjunta
                            </a>
                        </div>
                    )}
                </li>
            ))}
        </ul>
        )}
      </div>
    </div>
  );
};

export default FormularioSoporte;
