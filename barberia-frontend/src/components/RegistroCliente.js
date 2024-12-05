import React, { useState } from "react";
import axios from "axios";
import { AiOutlineClose } from "react-icons/ai"; // Importar icono de cerrar
import { toast } from "react-toastify"; // Importar toast para notificaciones
import { verificarCorreo } from "../services/VerifyCorreo";
import ReCAPTCHA from 'react-google-recaptcha';

const RegistroCliente = ({ closeModal, setAuth }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email_cliente: "",
    password_cliente: "",
    confirmar_password: "",
    celular_cliente: "",
  });

  const [captchaToken, setCaptchaToken] = useState(null);
  const [emailError, setEmailError] = useState(""); // Manejo del error de correo
  const API_URL = process.env.REACT_APP_API_URL;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleCaptchaChange = (token) => {
    setCaptchaToken(token); // Guardar el token generado por el captcha
  };

  const verificarCorreoExistente = async () => {
    try {
      const result = await verificarCorreo(API_URL, formData.email_cliente);
      if (result.registrado) {
        setEmailError("El correo ya está registrado. Completa tu cuenta.");
      } else {
        setEmailError("");
      }
    } catch (error) {
      setEmailError("Error al verificar el correo.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (emailError) {
      toast.error(emailError);
      return;
    }

    if (formData.password_cliente !== formData.confirmar_password) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    if (!/^\d{9}$/.test(formData.celular_cliente)) {
      toast.error("El número de celular debe contener exactamente 9 dígitos.");
      return;
    }
    if (!captchaToken) {
      toast.error("Por favor, verifica que no eres un robot.");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/clientes/register`, formData,captchaToken,);
      localStorage.setItem("token", response.data.token);
      setAuth(true);
      closeModal();
    } catch (error) {
      if (error.response?.data?.is_guest) {
        toast.error("Este correo ya está asociado a una cuenta. Completa tu cuenta.");
      } else {
        toast.error("Ocurrió un error durante el registro.");
      }
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      {/* Botón de Cerrar */}
      <AiOutlineClose
        onClick={closeModal}
        className="absolute top-3 left-3 text-gray-500 hover:text-gray-800 cursor-pointer text-2xl"
      />

      <p className="title">Registro</p>
      <p className="message">Regístrate para acceder a la plataforma.</p>

      <div className="flex">
        <label>
          <input
            required
            type="text"
            name="nombre"
            placeholder=""
            value={formData.nombre}
            onChange={handleInputChange}
            className="input"
          />
          <span>Nombre</span>
        </label>
        <label>
          <input
            type="text"
            name="apellido"
            placeholder=""
            value={formData.apellido}
            onChange={handleInputChange}
            className="input"
          />
          <span>Apellido</span>
        </label>
      </div>

      <label>
        <input
          required
          type="email"
          name="email_cliente"
          placeholder=""
          value={formData.email_cliente}
          onChange={handleInputChange}
          onBlur={verificarCorreoExistente}
          className="input"
        />
        <span>Correo Electrónico</span>
      </label>
      {emailError && <p className="message error">{emailError}</p>}

      <label>
        <input
          required
          type="password"
          name="password_cliente"
          placeholder=""
          value={formData.password_cliente}
          onChange={handleInputChange}
          className="input"
        />
        <span>Contraseña</span>
      </label>
      <label>
        <input
          required
          type="password"
          name="confirmar_password"
          placeholder=""
          value={formData.confirmar_password}
          onChange={handleInputChange}
          className="input"
        />
        <span>Confirmar Contraseña</span>
      </label>

      <label>
        <input
          required
          type="text"
          name="celular_cliente"
          placeholder=""
          value={formData.celular_cliente}
          onChange={handleInputChange}
          className="input"
        />
        <span>Celular</span>
      </label>
       {/* Captcha */}
       <ReCAPTCHA
        sitekey="TU_SITE_KEY" // Sustituir con tu Site Key
        onChange={handleCaptchaChange}
      />
      <button type="submit" className="submit bg-purple-700 hover:bg-purple-800">
        Registrar
      </button>
    </form>
  );
};

export default RegistroCliente;
