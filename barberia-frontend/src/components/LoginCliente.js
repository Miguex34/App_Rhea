import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { verificarCorreo } from "../services/VerifyCorreo";

const LoginForm = ({ closeModal, setAuth }) => {
  const [formData, setFormData] = useState({ correo: "", contraseña: "" });
  const [error, setError] = useState(""); // Usar 'error' para manejar mensajes de error
  const API_URL = process.env.REACT_APP_API_URL;
  const [emailLink, setEmailLink] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const verificarCorreoExistente = async () => {
    try {
      const result = await verificarCorreo(API_URL, formData.correo);
      if (result.registrado) {
        setEmailLink(
          `https://apprhea-production.up.railway.app/completar-cuenta?email=${formData.correo}`
        );
      } else {
        setEmailLink(""); // Limpia el enlace si el correo no está registrado
      }
    } catch (error) {
      console.error("Error al verificar el correo:", error);
      setEmailLink(""); // En caso de error, limpia el enlace
    }
  };
  

  const fetchUser = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/api/clientes/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        localStorage.setItem("user", JSON.stringify(response.data));
        toast.success("¡Datos del usuario cargados correctamente!");
      }
    } catch (error) {
      console.error("Error al obtener datos del cliente:", error);
      toast.error("No se pudieron cargar los datos del usuario.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (error) {
      toast.error(error);
      setError("");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/clientes/loginc`, formData);
      const token = response.data.token;

      // Guardar el token y datos del usuario
      localStorage.setItem("token", token);
      await fetchUser(token);

      // Actualizar estado de autenticación
      setAuth(true);

      // Cerrar modal
      closeModal();

      toast.success("¡Inicio de sesión exitoso!");
    } catch (error) {
      if (error.response?.data?.is_guest) {
        toast.error("Este correo pertenece a un cliente invitado. Completa tu cuenta.");
        window.location.href = `/completar-cuenta?email=${formData.correo}`; // Redirigir al completar cuenta
      } else {
        toast.error("Credenciales inválidas.");
      }
    }
  };

  return (
    
    <form onSubmit={handleLogin} className="bg-white p-6 rounded-md shadow-lg max-w-sm w-full">
      <ToastContainer position="top-center" autoClose={5000} />

      {error && <p className="text-red-500">{error}</p>}

      <div className="mb-4">
        <label className="block text-sm font-bold mb-2">Correo</label>
        <input
          type="email"
          name="correo"
          value={formData.correo}
          onChange={handleInputChange}
          onBlur={verificarCorreoExistente}
          className="border rounded w-full py-2 px-3"
          required
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
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2">Contraseña</label>
        <input
          type="password"
          name="contraseña"
          value={formData.contraseña}
          onChange={handleInputChange}
          className="border rounded w-full py-2 px-3"
          required
        />
      </div>
      <div className="flex justify-between">
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Login
        </button>
        <button type="button" onClick={closeModal} className="bg-red-500 text-white px-4 py-2 rounded">
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
