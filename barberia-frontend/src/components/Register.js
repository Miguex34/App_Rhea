import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contraseña: '',
    telefono: '',
    nombreNegocio: '',
    correoNegocio: '', // Campo para el correo del negocio
    telefonoNegocio: '',
    direccionNegocio: '', // Campo para la dirección del negocio
    cargo: 'Dueño',
  });

  const [suggestions, setSuggestions] = useState([]);
  const [errors, setErrors] = useState({});
  const [responseMessage, setResponseMessage] = useState('');
  const navigate = useNavigate();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  // Función para buscar direcciones en Nominatim
  const searchAddress = async (query) => {
    try {
      const response = await fetch(`http://localhost:5000/api/address?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Error al buscar dirección:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Buscar direcciones solo si el campo de dirección cambia y tiene al menos 3 caracteres
    if (name === 'direccionNegocio' && value.length > 2) {
      searchAddress(value);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData({ ...formData, direccionNegocio: suggestion.display_name });
    setSuggestions([]); // Limpia las sugerencias al seleccionar una
  };

  const validateForm = () => {
    const newErrors = {};
    const nameRegex = /^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|org|net|edu)$/;
    const passwordRegex = /^\S+$/;
    const phoneRegex = /^\d+$/;

    if (!nameRegex.test(formData.nombre)) {
      newErrors.nombre = 'El nombre solo puede contener letras y espacios.';
    }
    if (!emailRegex.test(formData.correo)) {
      newErrors.correo = 'El correo no es válido. Debe terminar en .com, .org, .net o .edu.';
    }
    if (!passwordRegex.test(formData.contraseña) || formData.contraseña.length < 8) {
      newErrors.contraseña = 'La contraseña debe tener al menos 8 caracteres y no contener espacios.';
    }
    if (!phoneRegex.test(formData.telefono) || formData.telefono.length !== 9) {
      newErrors.telefono = 'El teléfono debe tener exactamente 9 dígitos.';
    }
    if (!phoneRegex.test(formData.telefonoNegocio) || formData.telefonoNegocio.length !== 9) {
      newErrors.telefonoNegocio = 'El teléfono del negocio debe tener exactamente 9 dígitos.';
    }
    if (!acceptTerms) {
      newErrors.acceptTerms = 'Debes aceptar los términos y condiciones para registrarte.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setResponseMessage('Por favor, corrige los errores antes de continuar.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/users/register', formData);
      const { token } = response.data;
      localStorage.setItem('token', token);
      navigate('/panel-reservas');
    } catch (error) {
      console.error('Error al registrar:', error);

      // Mostrar mensaje específico si el correo o el nombre del negocio ya están en uso
      if (error.response && error.response.data.message) {
        setResponseMessage(error.response.data.message);
      } else {
        setResponseMessage('Error al registrar el usuario. Intenta de nuevo más tarde.');
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-8 space-y-6">
        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold text-gray-700 mb-4">
                ¡Crea Tu <span className="text-purple-500">Cuenta</span>!
              </h2>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre Completo"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-500"
              />
              {errors.nombre && <p className="text-red-500">{errors.nombre}</p>}

              <input
                type="email"
                name="correo"
                placeholder="Correo Electrónico"
                value={formData.correo}
                onChange={handleChange}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-500"
              />
              {errors.correo && <p className="text-red-500">{errors.correo}</p>}

              <input
                type="password"
                name="contraseña"
                placeholder="Contraseña"
                value={formData.contraseña}
                onChange={handleChange}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-500"
              />
              {errors.contraseña && <p className="text-red-500">{errors.contraseña}</p>}

              <input
                type="tel"
                name="telefono"
                placeholder="Teléfono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-500"
              />
              {errors.telefono && <p className="text-red-500">{errors.telefono}</p>}
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-700 mb-4">
                ¡Registra Tu <span className="text-purple-500">Negocio</span>!
              </h2>
              <input
                type="text"
                name="nombreNegocio"
                placeholder="Nombre del Negocio"
                value={formData.nombreNegocio}
                onChange={handleChange}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-500"
              />
              {errors.nombreNegocio && <p className="text-red-500">{errors.nombreNegocio}</p>}

              <input
                type="email"
                name="correoNegocio"
                placeholder="Correo del Negocio"
                value={formData.correoNegocio}
                onChange={handleChange}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-500"
              />
              {errors.correoNegocio && <p className="text-red-500">{errors.correoNegocio}</p>}

              <input
                type="text"
                name="direccionNegocio"
                placeholder="Dirección del Negocio"
                value={formData.direccionNegocio}
                onChange={handleChange}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-500"
              />
              {suggestions.length > 0 && (
                <ul className="border border-gray-300 rounded-md mt-2 bg-white max-h-48 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {suggestion.display_name}
                    </li>
                  ))}
                </ul>
              )}
              {errors.direccionNegocio && <p className="text-red-500">{errors.direccionNegocio}</p>}

              <input
                type="tel"
                name="telefonoNegocio"
                placeholder="Teléfono del Negocio"
                value={formData.telefonoNegocio}
                onChange={handleChange}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-500"
              />
              <label className="flex items-center">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mr-2 h-5 w-5 text-purple-500 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-600">
                Acepto los{' '}
                <button
                  type="button"
                  className="text-purple-500 underline"
                  onClick={openModal}
                >
                  términos y condiciones
                </button>{' '}
                del uso de la plataforma, la gestión de mi negocio y de mis empleados.
              </span>
            </label>
              {errors.telefonoNegocio && <p className="text-red-500">{errors.telefonoNegocio}</p>}
            </div>
          </div>
          {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-2xl w-full shadow-lg relative">
          {/* Título */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Términos y Condiciones</h2>
          {/* Contenido con barra de desplazamiento */}
          <div className="overflow-y-auto max-h-[70vh] pr-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
            <p className="text-sm text-gray-700">
              <strong>Bienvenido a Rhea</strong>, una plataforma de gestión para negocios del sector
              de belleza y cuidado personal. Al registrarse y utilizar nuestros servicios, usted
              acepta los presentes Términos y Condiciones. Por favor, lea cuidadosamente este
              documento antes de continuar.
            </p>
  
            <h3 className="text-lg font-semibold mt-4">1. Información Recopilada</h3>
            <p>
              <strong>1.1. Información personal:</strong> Al registrarse en nuestra plataforma,
              recopilamos información personal, incluyendo pero no limitado a:
            </p>
            <ul className="list-disc ml-6 mt-2">
              <li>Nombre completo del propietario del negocio.</li>
              <li>Correo electrónico.</li>
              <li>Número de teléfono.</li>
              <li>Dirección del negocio.</li>
              <li>
                Información de empleados (nombre, correo electrónico, cargo, disponibilidad laboral).
              </li>
            </ul>
  
            <p className="mt-2">
              <strong>1.2. Información comercial:</strong> Además, recopilamos datos relacionados con
              su negocio, tales como:
            </p>
            <ul className="list-disc ml-6 mt-2">
              <li>Categoría del negocio.</li>
              <li>Servicios ofrecidos.</li>
              <li>Horarios de atención.</li>
              <li>Reservas realizadas y datos de clientes.</li>
            </ul>
  
            <p className="mt-2">
              <strong>1.3. Uso de cookies y tecnologías similares:</strong> Podemos recopilar
              información técnica, como su dirección IP, tipo de navegador y actividad en nuestra
              plataforma para mejorar la experiencia del usuario.
            </p>
  
            <h3 className="text-lg font-semibold mt-4">2. Uso de la Información</h3>
  <p>
    <strong>2.1. Finalidad del tratamiento de datos:</strong> La información recopilada será utilizada para:
  </p>
  <ul className="list-disc ml-6 mt-2">
    <li>Crear y gestionar su cuenta en la plataforma.</li>
    <li>Proporcionar herramientas de gestión de servicios, horarios y empleados.</li>
    <li>Facilitar las reservas de sus clientes.</li>
    <li>
      Enviar notificaciones relacionadas con su negocio, como confirmaciones de reservas o
      actualizaciones de la plataforma.
    </li>
  </ul>

  <p className="mt-2">
    <strong>2.2. Compartición de datos:</strong> Solo compartiremos su información con terceros en
    los siguientes casos:
  </p>
  <ul className="list-disc ml-6 mt-2">
    <li>
      <strong>Proveedores de servicios:</strong> Para procesar pagos, enviar correos electrónicos
      (ej. a través de servicios como SendGrid) y alojar la plataforma.
    </li>
    <li>
      <strong>Obligaciones legales:</strong> Si es requerido por una autoridad judicial o
      regulatoria.
    </li>
  </ul>

  <p className="mt-2">
    <strong>2.3. Conservación de datos:</strong> La información proporcionada será almacenada de
    manera segura durante el tiempo que utilice nuestros servicios y hasta un máximo de 5 años
    después de la cancelación de su cuenta, según lo exijan las leyes aplicables.
  </p>

  <h3 className="text-lg font-semibold mt-4">3. Obligaciones del Usuario</h3>
  <p>
    Al registrarse en Rhea, usted acepta:
  </p>
  <ul className="list-disc ml-6 mt-2">
    <li>Proporcionar información veraz, completa y actualizada.</li>
    <li>Mantener la confidencialidad de sus credenciales de inicio de sesión.</li>
    <li>
      No utilizar la plataforma para actividades ilícitas, fraudulentas o perjudiciales.
    </li>
    <li>
      Informar a sus empleados y clientes sobre cómo sus datos serán utilizados a través de nuestra
      plataforma.
    </li>
  </ul>

  <h3 className="text-lg font-semibold mt-4">4. Propiedad Intelectual</h3>
  <p>
    Todos los derechos de propiedad intelectual relacionados con la plataforma Rhea, incluidos el
    diseño, logotipos, código fuente y funcionalidades, son propiedad exclusiva de Rhea. El uso de
    nuestra plataforma no le otorga derechos sobre los mismos.
  </p>

  <h3 className="text-lg font-semibold mt-4">5. Limitación de Responsabilidad</h3>
  <p>
    Rhea no será responsable por:
  </p>
  <ul className="list-disc ml-6 mt-2">
    <li>Pérdida de datos causados por negligencia del usuario.</li>
    <li>
      Errores o interrupciones en el servicio debido a factores fuera de nuestro control (ej. cortes
      de internet o fallos en servidores externos).
    </li>
    <li>
      Pérdidas económicas derivadas de mal uso de la plataforma por parte del usuario.
    </li>
  </ul>

  <h3 className="text-lg font-semibold mt-4">6. Seguridad y Protección de Datos</h3>
  <p>
    Implementamos medidas de seguridad técnicas y organizativas para proteger su información,
    como:
  </p>
  <ul className="list-disc ml-6 mt-2">
    <li>Cifrado de datos sensibles en tránsito y en reposo.</li>
    <li>Acceso restringido a personal autorizado.</li>
    <li>Auditorías de seguridad regulares.</li>
  </ul>
  <p className="mt-2">
    Sin embargo, no garantizamos protección total frente a vulnerabilidades externas. En caso de un
    incidente de seguridad, será notificado según las leyes aplicables.
  </p>

  <h3 className="text-lg font-semibold mt-4">7. Cancelación de la Cuenta</h3>
  <p>
    El usuario puede solicitar la cancelación de su cuenta en cualquier momento. Esto implicará la
    eliminación de su información personal y de negocio de nuestra plataforma, salvo en casos en
    los que la ley nos exija conservar ciertos datos.
  </p>

  <h3 className="text-lg font-semibold mt-4">8. Modificaciones</h3>
  <p>
    Rhea se reserva el derecho de actualizar estos términos y condiciones. Le notificaremos
    cualquier cambio significativo antes de su implementación. El uso continuo de nuestra
    plataforma posterior a estos cambios implicará su aceptación.
  </p>

  <h3 className="text-lg font-semibold mt-4">9. Aceptación</h3>
  <p>
    Al marcar la casilla de aceptación durante el proceso de registro, usted declara que ha leído,
    comprendido y aceptado estos términos y condiciones.
  </p>
  <p className="mt-2">
    Si tiene dudas sobre estos términos, puede contactarnos en [correo de contacto].
  </p>
  <p className="mt-2">
    Rhea se reserva el derecho de denegar el acceso a usuarios que no cumplan con estos términos.
  </p>
          </div>
  
          {/* Botón de cerrar */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={closeModal}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )}  
          <div className="flex justify-between">
          <button
              type="submit"
              className={`${
                acceptTerms
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              } px-6 py-3 rounded-md transition`}
              disabled={!acceptTerms}
            >
              Crear Cuenta
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-purple-500 hover:underline"
            >
              ¿Ya tienes una cuenta? Inicia sesión
            </button>
          </div>
        </form>

        {responseMessage && (
          <div className="mt-4 text-center text-red-500">{responseMessage}</div>
        )}
      </div>
    </div>
  );
};

export default Register;
