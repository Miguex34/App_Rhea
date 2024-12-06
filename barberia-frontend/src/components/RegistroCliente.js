import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify"; // Notificaciones
import { verificarCorreo } from "../services/VerifyCorreo";

const RegistroCliente = ({ closeModal, setAuth }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: null,
    email_cliente: "",
    password_cliente: "",
    confirmar_password: "",
    celular_cliente: "",
  });

  const API_URL = process.env.REACT_APP_API_URL;
  const [emailLink, setEmailLink] = useState("");
 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const verificarCorreoExistente = async () => {
    try {
      const result = await verificarCorreo(API_URL, formData.email_cliente);
      if (result.registrado) {
        setEmailLink(
          `https://apprhea-production.up.railway.app/completar-cuenta?email=${formData.email_cliente}`
        );
      } else {
        setEmailLink(""); // Limpia el enlace si el correo no está registrado
      }
    } catch (error) {
      console.error("Error al verificar el correo:", error);
      setEmailLink(""); // En caso de error, limpia el enlace
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (formData.password_cliente !== formData.confirmar_password) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }
  
    if (!/^\d{9}$/.test(formData.celular_cliente)) {
      toast.error("El número de celular debe contener exactamente 9 dígitos.");
      return;
    }
  
   
  
    try {
      const response = await axios.post(`${API_URL}/api/clientes/register`, {
        ...formData,
        
      });
      localStorage.setItem("token", response.data.token);
      setAuth(true);
      toast.success("Registro exitoso. Redirigiendo...");
      setTimeout(() => {
        closeModal();
      }, 2000);
    } catch (error) {
      if (error.response?.data?.is_guest) {
        toast.error(
          `Este correo ya está asociado a una cuenta. Completa tu cuenta aquí: https://apprhea-production.up.railway.app/completar-cuenta?email=${formData.email_cliente}`
        );
      } else {
        toast.error("Ocurrió un error durante el registro.");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Registro de Cliente
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="celular_cliente" className="block text-sm font-medium text-gray-700">
              Celular
            </label>
            <input
              type="text"
              id="celular_cliente"
              name="celular_cliente"
              value={formData.celular_cliente}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="email_cliente" className="block text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email_cliente"
              name="email_cliente"
              value={formData.email_cliente}
              onChange={handleInputChange}
              onBlur={verificarCorreoExistente}
              required
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2"
            />
            {emailLink && (
              <p className="mt-2 text-sm text-gray-600">
                El correo ya está registrado.{" "}
                <a
                  href={emailLink}
                  className="text-blue-500 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Completa tu cuenta aquí
                </a>.
              </p>
            )}
          </div>
          <div className="mb-6">
            <label htmlFor="password_cliente" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              id="password_cliente"
              name="password_cliente"
              value={formData.password_cliente}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="confirmar_password" className="block text-sm font-medium text-gray-700">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              id="confirmar_password"
              name="confirmar_password"
              value={formData.confirmar_password}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Registrar
          </button>
        </form>
        <button
          type="button"
          onClick={closeModal}
          className="w-full mt-4 bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default RegistroCliente;