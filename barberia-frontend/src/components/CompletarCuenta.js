import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiPhone, FiLock } from "react-icons/fi"; // Icons
import logo from "../assets/images/logo.png";

const CompletarCuenta = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email_cliente: new URLSearchParams(window.location.search).get("email"),
    celular_cliente: "",
    password_cliente: "",
    confirmar_password: "",
  });

  const [errors, setErrors] = useState({}); // Para manejar errores visuales
  const [negocioSeleccionado, setNegocioSeleccionado] = useState("");

  useEffect(() => {
    // Verifica que el negocio seleccionado esté almacenado en el sessionStorage
    const negocio = sessionStorage.getItem("negocioSeleccionado");
    if (!negocio) {
      toast.error("No se encontró un negocio seleccionado.");
    } else {
      setNegocioSeleccionado(negocio);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos
    const validationErrors = {};

    if (formData.password_cliente.length < 8) {
      validationErrors.password_cliente = "La contraseña debe tener al menos 8 caracteres.";
    }

    if (formData.password_cliente !== formData.confirmar_password) {
      validationErrors.confirmar_password = "Las contraseñas no coinciden.";
    }

    if (!/^\d{9}$/.test(formData.celular_cliente)) {
      validationErrors.celular_cliente = "El número de celular debe tener exactamente 9 dígitos.";
    }

    // Si hay errores, actualizamos el estado y mostramos los errores
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      // Petición al backend
      await axios.put(`${process.env.REACT_APP_API_URL}/api/clientes/completar-cuenta`, formData);
      toast.success("Cuenta completada exitosamente.");
      navigate(`/negocio/${negocioSeleccionado}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Ocurrió un error.");
    }
  };

  const handleCellphoneKeyPress = (e) => {
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault(); // Restringe caracteres no numéricos
    }
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 py-4 bg-gray-800 text-white">
        <div className="flex items-center space-x-4">
          <img
            src={logo}
            alt="Rhea Reserve Logo"
            className="h-10 cursor-pointer"
            onClick={() => navigate("/principal")}
          />
          <button onClick={() => navigate("/negocios")} className="text-lg font-semibold hover:underline">
            Negocios
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/register")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Registrarse
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Iniciar Sesión
          </button>
        </div>
      </nav>

      {/* Formulario */}
      <div className="max-w-lg mx-auto mt-8 p-6 bg-white shadow-md rounded-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Completar Cuenta</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={formData.email_cliente}
              disabled
              className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="celular_cliente"
                placeholder="Teléfono (9 dígitos)"
                value={formData.celular_cliente}
                onKeyPress={handleCellphoneKeyPress}
                onChange={(e) =>
                  setFormData({ ...formData, celular_cliente: e.target.value })
                }
                required
                className={`w-full p-3 pl-10 border border-gray-300 rounded-md ${
                  errors.celular_cliente ? "border-red-500" : ""
                }`}
              />
              {errors.celular_cliente && (
                <p className="text-red-500 text-sm mt-1">{errors.celular_cliente}</p>
              )}
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                name="password_cliente"
                placeholder="Nueva Contraseña"
                value={formData.password_cliente}
                onChange={(e) =>
                  setFormData({ ...formData, password_cliente: e.target.value })
                }
                required
                className={`w-full p-3 pl-10 border border-gray-300 rounded-md ${
                  errors.password_cliente ? "border-red-500" : ""
                }`}
              />
              {errors.password_cliente && (
                <p className="text-red-500 text-sm mt-1">{errors.password_cliente}</p>
              )}
            </div>
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                name="confirmar_password"
                placeholder="Repetir Contraseña"
                value={formData.confirmar_password}
                onChange={(e) =>
                  setFormData({ ...formData, confirmar_password: e.target.value })
                }
                required
                className={`w-full p-3 pl-10 border border-gray-300 rounded-md ${
                  errors.confirmar_password ? "border-red-500" : ""
                }`}
              />
              {errors.confirmar_password && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmar_password}</p>
              )}
            </div>
          </div>

          {/* Botón */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md"
          >
            Guardar
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompletarCuenta;
