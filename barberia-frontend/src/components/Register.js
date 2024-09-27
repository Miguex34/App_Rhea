// src/components/Register.js
import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contraseña: '',
    telefono: '',
    rol: 'dueño',
  });

  const [responseMessage, setResponseMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/users/register', {
        nombre: formData.nombre,
        correo: formData.correo,
        contraseña: formData.contraseña,
        telefono: formData.telefono,
        rol: formData.rol,
      });
      console.log(response.data);
      setResponseMessage('Usuario registrado exitosamente');
    } catch (error) {
      console.error('Error en la petición:', error.response.data);
      setResponseMessage(`Error al registrar usuario: ${error.response.data.detalle || 'Error desconocido'}`);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Registrar una Cuenta</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="nombre" className="block text-gray-700">Nombre Completo</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="correo" className="block text-gray-700">Correo Electrónico</label>
            <input
              type="email"
              id="correo"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            />
          </div>
            <div className="flex">
            <span className="p-2 bg-gray-200 border border-gray-300 rounded-l">+56 9</span>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className={`w-full p-2 border ${responseMessage ? 'border-red-500' : 'border-gray-300'} rounded-r mt-1`}
              maxLength="8"  // Solo permitimos 8 números aquí
              pattern="[0-9]{8}"  // Validamos con una expresión regular
              required
            />
          </div>


          <div className="mb-4">
            <label htmlFor="contraseña" className="block text-gray-700">Contraseña</label>
            <input
              type="password"
              id="contraseña"
              name="contraseña"
              value={formData.contraseña}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Crear Cuenta
          </button>
        </form>
        {responseMessage && (
          <div className="mt-4 text-center text-red-500">
            {responseMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
