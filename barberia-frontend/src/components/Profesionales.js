import React, { useCallback, useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './Modal'; 

const Profesionales = () => {
  const [empleados, setEmpleados] = useState([]);
  const [showModal, setShowModal] = useState(false); // Estado para manejar el modal
  const API_URL = process.env.REACT_APP_API_URL;

  // Memoizar la función cargarEmpleados
  const cargarEmpleados = useCallback(async (id_negocio) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_URL}/api/empleados/negocio/${id_negocio}/empleados`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filtrar usuarios que tienen `telefono` no nulo (excluye usuarios temporales)
      const empleadosActivos = response.data.filter(empleado => empleado.telefono !== null);
      setEmpleados(empleadosActivos);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
    }
  }, [API_URL]); // API_URL es una dependencia porque se usa en la función

  // Cargar datos del usuario autenticado y luego cargar empleados según el negocio
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Si el usuario tiene un negocio, cargar empleados de ese negocio
        const negocio = response.data.negocio;
        if (negocio && negocio.id) {
          cargarEmpleados(negocio.id);
        } else {
          console.error('El usuario no tiene un negocio asociado');
          alert('No se encontró un negocio asociado. Verifica tus datos.');
        }
      } catch (error) {
        console.error('Error al obtener el usuario:', error);
        localStorage.removeItem('token');
      }
    };
    fetchUserData();
  }, [API_URL, cargarEmpleados]);

  // Función para cargar empleados según el id del negocio
  

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  return (
    <div className="max-w-6xl mx-auto bg-gray-200 p-8 shadow-md rounded-md mt-10">
      <h1 className="text-3xl font-bold text-center mb-8">Profesionales</h1>
      
      {/* Botón para invitar un colaborador */}
      <button 
        onClick={openModal} 
        className="fixed bottom-8 right-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-lg"
      >
        Invitar Colaborador
      </button>

      {/* Modal para invitar colaborador */}
      {showModal && <Modal closeModal={closeModal} />}

      {/* Grid para mostrar los empleados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {empleados.map((empleado) => (
          <div key={empleado.id} className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
              {empleado.foto_perfil ? (
                <img src={empleado.foto_perfil} alt={`${empleado.nombre}`} className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <span className="text-3xl text-gray-700">👤</span> // Ícono por defecto si no tiene foto
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{empleado.nombre}</h2>
              <p className="text-gray-600">{empleado.correo}</p>
              <p className="text-gray-600">{empleado.telefono || 'Sin teléfono'}</p>
              <p className="text-gray-800 font-medium">{empleado.cargo}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profesionales;

