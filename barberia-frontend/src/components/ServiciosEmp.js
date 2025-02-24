import React, { useCallback, useState, useEffect } from 'react';
import axios from 'axios';

const ServiciosEmp = () => {
  const [servicios, setServicios] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL;

  // Memorizar la función para que no cambie en cada renderizado
  const cargarServiciosEmpleado = useCallback(async (idEmpleado) => {
    try {
      const response = await axios.get(`${API_URL}/api/servicios/empleado/${idEmpleado}/servicios`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setServicios(response.data);
    } catch (error) {
      console.error('Error al cargar los servicios asignados al empleado:', error);
    }
  }, [API_URL]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem('usuario'));
    if (storedUser && storedUser.cargo === 'Empleado') {
      cargarServiciosEmpleado(storedUser.id); 
    } else {
      console.warn('Usuario no autorizado o datos no encontrados.');
      window.location.href = '/login';
    }
  }, [cargarServiciosEmpleado]);

  

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-purple-500">
      Mis Servicios Asignados
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servicios.length > 0 ? (
          servicios.map((servicio) => (
            <div key={servicio.id} className="p-4 bg-gray-100 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{servicio.nombre}</h3>
              <p className="text-gray-700">{servicio.descripcion}</p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Duración:</strong> {servicio.duracion} min
              </p>
              <p className="text-sm text-gray-600">
                <strong>Precio:</strong> ${servicio.precio}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Categoría:</strong> {servicio.categoria}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-700">No tienes servicios asignados.</p>
        )}
      </div>
    </div>
  );
};

export default ServiciosEmp;
