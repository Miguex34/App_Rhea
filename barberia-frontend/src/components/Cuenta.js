import React, { useState, useEffect,useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FcInfo, FcExpand, FcCalendar, FcManager, FcOrganization } from "react-icons/fc";

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const categorias = [
  'Barbería', 
  'Salón de manicura y pedicura', 
  'Spa', 
  'Masajes', 
  'Peluquería', 
  'Centro de Estética', 
  'Salón de Belleza', 
  'Depilación',
  'Tratamientos Faciales'
];
const Cuenta = () => {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token');

  // Estado para el usuario logeado
  const [user, setUser] = useState({ nombre: '', correo: '', id_negocio: null });

  // Estado para los horarios, inicializado como un array vacío por defecto
  const [horarios, setHorarios] = useState([]);

  // Estado para la categoría seleccionada
  const [categoria, setCategoria] = useState('');
  // estado para descripcion
  const [descripcion, setDescripcion] = useState('');
  // Estado para el archivo del logo
  const [logoFile, setLogoFile] = useState(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [realizaServicios, setRealizaServicios] = useState(false); 
  const [disponibilidad, setDisponibilidad] = useState([]); // 
  const [isSavingDisponibilidad, setIsSavingDisponibilidad] = useState(false);
  const [showDatosNegocio, setShowDatosNegocio] = useState(false);
  const [showHorarioNegocio, setShowHorarioNegocio] = useState(false);
  const [showRealizasServicios, setShowRealizasServicios] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const fetchHorarios = useCallback(async (id_negocio) => {
    try {
      const response = await axios.get(`${API_URL}/api/horarios/negocio/${id_negocio}`);
      const fetchedHorarios = Array.isArray(response.data)
        ? response.data.map(horario => ({
            dia: horario.dia_semana,
            desde: horario.hora_inicio,
            hasta: horario.hora_fin,
            cerrado: !horario.activo,
          }))
        : diasSemana.map(dia => ({
            dia: dia,
            desde: '08:00',
            hasta: '19:00',
            cerrado: false,
          }));
      setHorarios(fetchedHorarios);
    } catch (error) {
      console.error('Error al obtener los horarios:', error);
      setHorarios(
        diasSemana.map(dia => ({
          dia: dia,
          desde: '08:00',
          hasta: '19:00',
          cerrado: false,
        }))
      );
    }
  }, [API_URL]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchDisponibilidad = async id_usuario => {
      try {
        const response = await axios.get(`${API_URL}/api/users/disponibilidad/${id_usuario}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.length) {
          setDisponibilidad(response.data);
          setRealizaServicios(true);
        } else {
          setDisponibilidad(
            diasSemana.map(dia => ({
              dia_semana: dia.toLowerCase(),
              hora_inicio: '08:00',
              hora_fin: '18:00',
              disponible: true,
            }))
          );
          setRealizaServicios(false);
        }
      } catch (error) {
        console.error('Error al obtener disponibilidad:', error);
        setDisponibilidad(
          diasSemana.map(dia => ({
            dia_semana: dia.toLowerCase(),
            hora_inicio: '08:00',
            hora_fin: '18:00',
            disponible: true,
          }))
        );
        setRealizaServicios(false);
      }
    };

    const checkEmpleadoStatus = async id_usuario => {
      try {
        const response = await axios.get(`${API_URL}/api/users/empleado/${id_usuario}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.realizaServicios) {
          setRealizaServicios(true);
        } else {
          setRealizaServicios(false);
        }
      } catch (error) {
        console.error('Error al verificar el estado del empleado:', error);
        setRealizaServicios(false);
      }
    };

    axios.get(`${API_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => {
      console.log('Usuario autenticado:', response.data);
      setUser(response.data);
        setUser(response.data);
  
        const negocio = response.data.negocio;
        if (negocio && negocio.id) {
          console.log('Cargando horarios para el negocio:', negocio.id);
          fetchHorarios(negocio.id);
          setCategoria(negocio.categoria || ''); // Establecer la categoría si ya existe
          setDescripcion(negocio.descripcion || '');
          setLogoUrl(negocio.logo || '');
          fetchDisponibilidad(response.data.id); // Llamar a fetchDisponibilidad
        } else {
          console.error('El usuario no tiene un negocio asociado:', negocio);
          alert('No se encontró un negocio asociado. Verifica tus datos.');
          setRealizaServicios(false); // Desactiva el checkbox si no tiene un negocio
        }
  
        // Verificar si el usuario es un empleado
        checkEmpleadoStatus(response.data.id);
      })
      .catch((error) => {
        console.error('Error al obtener el usuario:', error);
        localStorage.removeItem('token');
        navigate('/login');
      });
  }, [navigate,API_URL,fetchHorarios,token]);
  
  

  // Función para obtener los horarios desde el backend
  

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value, type, checked, dataset } = e.target;
    const nuevosHorarios = [...horarios];
  
    // Obtener el índice del horario que se está modificando
    const index = dataset.index;
  
    // Realizar la validación
    if (name === "desde" && nuevosHorarios[index].hasta && value >= nuevosHorarios[index].hasta) {
      alert("La hora de apertura debe ser anterior a la hora de cierre.");
      return; // No actualiza si el valor no es válido
    } else if (name === "hasta" && nuevosHorarios[index].desde && value <= nuevosHorarios[index].desde) {
      alert("La hora de cierre debe ser posterior a la hora de apertura.");
      return; // No actualiza si el valor no es válido
    }
  
    // Actualizar el valor del campo dependiendo de si es checkbox o input de tipo time
    if (type === "checkbox") {
      nuevosHorarios[index][name] = checked; // Actualizar el estado del checkbox
    } else {
      nuevosHorarios[index][name] = value; // Actualizar otros campos
    }
  
    setHorarios(nuevosHorarios);
  };

  // Manejar cambio de la categoría seleccionada
  const handleCategoriaChange = async (e) => {
    const nuevaCategoria = e.target.value;
    setCategoria(nuevaCategoria);
  
    try {
      const token = localStorage.getItem('token');
  
      if (!user.negocio || !user.negocio.id) {
        alert('No se encontró un negocio asociado al usuario.');
        return;
      }
  
      // Enviar la categoría al backend
      await axios.put(`${API_URL}/api/negocios/${user.negocio.id}/categoria`, 
        { categoria: nuevaCategoria }, 
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      alert('Categoría actualizada correctamente.');
    } catch (error) {
      console.error('Error al actualizar la categoría:', error);
    }
  };

  // Informacion Negocio
  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
     // Validación de la descripción en el frontend
  if (descripcion.length < 10 || descripcion.length > 100) {
    alert('La descripción debe tener entre 10 y 100 caracteres.');
    return;
  }

  const descripcionRegex = /^[a-zA-Z0-9\s.,!?'"\u00C0-\u00FF\u00D1\u00F1]+$/;
if (!descripcionRegex.test(descripcion)) {
  alert('La descripción contiene caracteres no permitidos. Solo se permiten letras, números y algunos caracteres comunes.');
  return;
}

    console.log({ categoria, descripcion });
    console.log('Token obtenido:', token);
    const formData = new FormData();
    formData.append('categoria', categoria);
    formData.append('descripcion', descripcion);
    if (logoFile) {
      formData.append('logo', logoFile);  // Añadir el archivo del logo si existe
    }
    try {
      if (!user.negocio.id) {
        alert('No se encontró un negocio asociado al usuario.');
        return;
      }
  
      const response = await axios.put(`${API_URL}/api/negocios/${user.negocio.id}`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
      });
      

      toast.success('¡Datos actualizados correctamente.!');
      setLogoUrl(response.data.negocio.logo);
    } catch (error) {
      if (error.response && error.response.data.message) {
        alert(`Error: ${error.response.data.message}`); // Mostrar el mensaje de error del backend
      } else {
        console.error('Error al actualizar la información del negocio:', error);
      }
    }
  };

  // Manejar cambios en la subida del logo
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file); // Setea el archivo para subir
      setLogoUrl(URL.createObjectURL(file)); // Mostrar la nueva imagen como preview
    }
  };

  // Enviar los datos del formulario de horarios al backend
  const handleHorarioSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      if (!user.negocio.id) {
        alert('No se encontró un negocio asociado al usuario.');
        return;
      }

      const horariosFormateados = horarios.map(h => ({
        dia: h.dia,
        desde: h.desde,
        hasta: h.hasta,
        cerrado: h.cerrado
      }));

      const response = await axios.put(
        `${API_URL}/api/horarios/negocio/${user.negocio.id}`,
        { horario: horariosFormateados },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success('¡Horarios actualizados correctamente.!');

      // Verifica si `response.data` es un array
      if (Array.isArray(response.data)) {
        const horariosActualizados = response.data.map(h => ({
          dia: h.dia_semana,
          desde: h.hora_inicio,
          hasta: h.hora_fin,
          cerrado: !h.activo,
        }));

        setHorarios(horariosActualizados);
      } else {
        console.error('La respuesta del servidor no es un array:', response.data);
        
      }
    } catch (error) {
      console.error('Error al actualizar los horarios:', error);
    }
  };
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('usuario'));
    if (storedUser) {
      setUser(storedUser); 
    }
  }, []);
  

  // Función para manejar el cambio del checkbox "¿Realizas Servicios?"
  const handleRealizaServiciosChange = async (e) => {
    const token = localStorage.getItem('token');
    const checked = e.target.checked;
    setRealizaServicios(checked);
  
    if (checked) {
      // Registrar como empleado
      try {
        const response = await axios.post(
          `${API_URL}/api/users/registrar-empleado`,
          {
            id_usuario: user.id,
            id_negocio: user.negocio.id,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log(response.data.message);
        toast.success('Registrado como empleado del negocio.');
      } catch (error) {
        console.error('Error al registrarse como empleado:', error);
        toast.error('No se pudo registrar como empleado.');
      }
    } else {
      // Eliminar de empleado_negocio y disponibilidad_empleado
      try {
        const response = await axios.post(
          `${API_URL}/api/users/eliminar-empleado`,
          {
            id_usuario: user.id,
            id_negocio: user.negocio.id,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log(response.data.message);
        toast.success('Eliminado correctamente.');
        setDisponibilidad([]); // Limpia la disponibilidad en el estado
      } catch (error) {
        console.error('Error al eliminar del negocio o disponibilidad:', error);
        toast.error('No se pudo eliminar correctamente.');
      }
    }
  };
  

  // Función para guardar la disponibilidad
  const saveDisponibilidad = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Validar que todos los días tengan valores válidos
      const disponibilidadValida = disponibilidad.every(
        (dia) =>
          dia.dia_semana &&
          dia.hora_inicio &&
          dia.hora_fin &&
          typeof dia.disponible === 'boolean'
      );
  
      if (!disponibilidadValida) {
        alert('Algunos días o valores no están definidos o no son válidos.');
        return;
      }
  
      // Enviar solicitud al backend
      const response = await axios.post(
        `${API_URL}/api/users/guardar-disponibilidad`,
        {
          id_usuario: user.id,
          disponibilidad,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      
      toast.success('¡Disponibilidad guardada correctamente!');
      console.log('Respuesta del servidor:', response.data);
    } catch (error) {
      console.error('Error al guardar disponibilidad:', error);
      toast.error('Error al guardar disponibilidad.');
      
    }
  };
  
  

  // Manejar cambios en la disponibilidad
  const handleDisponibilidadChange = (value, index, field) => {
    const nuevaDisponibilidad = [...disponibilidad];
    if (field === 'hora_inicio' || field === 'hora_fin') {
      nuevaDisponibilidad[index][field] = value ? dayjs(value).format('HH:mm:ss') : '00:00:00';
    } else if (field === 'disponible') {
      nuevaDisponibilidad[index].disponible = !value;
    }
    // Asegúrate de que `dia` siempre exista
    if (!nuevaDisponibilidad[index].dia) {
      nuevaDisponibilidad[index].dia = diasSemana[index].toLowerCase();
    }
    setDisponibilidad(nuevaDisponibilidad);
    

  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <ToastContainer /> {/* Notificaciones */}
  
      <h1 className="text-3xl font-bold mb-4">
        ¡Bienvenido <span className="text-purple-500">{user.nombre}</span>!
      </h1>
      
      <p className="mb-8">Comencemos con el proceso de completar la información de tu negocio.</p>
      <button
          onClick={() => setShowHelp(!showHelp)}
          className="text-gray-600 hover:text-blue-600"
          title="¿Cómo completar tu cuenta?"
        >
          <FcInfo size={24} />
        </button>
        {/* Sección de Ayuda */}
      {showHelp && (
        <div className="bg-gray-100 p-4 rounded shadow-md mb-4">
          <h3 className="text-xl font-semibold mb-2">¿Cómo completar tu cuenta?</h3>
          <ol className="list-decimal pl-6 text-gray-700">
            <li>
              <strong>Tipo de Negocio:</strong> Selecciona la categoría que mejor describa tu negocio (ejemplo: "Barbería").
            </li>
            <li>
              <strong>Descripción del Negocio:</strong> Escribe una breve descripción de tu negocio.
              <span className="block text-sm text-gray-600">Restricción: Entre 10 y 100 caracteres. Solo se permiten letras, números y algunos caracteres comunes.</span>
            </li>
            <li>
              <strong>Logo del Negocio:</strong> Carga una imagen que represente tu negocio. Si ya existe un logo, puedes reemplazarlo.
            </li>
            <li>
              <strong>Horario del Negocio:</strong> Configura los horarios de atención para cada día de la semana:
              <ul className="list-disc pl-6 mt-1">
                <li>Selecciona la hora de apertura y cierre.</li>
                <li>Marca la casilla "Cerrado" si no trabajas ese día.</li>
              </ul>
            </li>
            <li>
              <strong>¿Realizas Servicios?:</strong> Si el dueño del negocio realiza servicios, marca la casilla correspondiente y configura tu disponibilidad horaria.
            </li>
          </ol>
          <p className="mt-2 text-gray-600">
            Nota: Recuerda guardar los cambios en cada sección para que se actualicen correctamente.
          </p>
        </div>
      )}
      {/* Sección 1: Datos del Negocio */}
      <div className="bg-white rounded shadow-md mb-4">
        <div
          className="flex justify-between items-center p-4 cursor-pointer"
          onClick={() => setShowDatosNegocio(!showDatosNegocio)}
        >
          <div className="flex items-center space-x-2">
            <FcOrganization size={24} />
            <h2 className="text-xl font-semibold">Datos del Negocio</h2>
          </div>
          <FcExpand size={24} />
        </div>
        {showDatosNegocio && (
          <div className="p-4 border-t">
            {/* Formulario de Datos del Negocio */}
            <form className="space-y-6">
              <div>
                <label className="block font-semibold mb-2">Tipo de Negocio</label>
                <select
                  value={categoria}
                  onChange={handleCategoriaChange}
                  className="p-2 border rounded w-full bg-gray-100"
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map((cat, index) => (
                    <option key={index} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-2">Descripción del negocio</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="p-2 border rounded w-full bg-gray-100"
                  placeholder="Describe tu negocio aquí"
                />
              </div>
              {logoUrl && (
                <div className="mb-6">
                  <img src={logoUrl} alt="Logo del negocio" className="w-48 h-48 object-cover" />
                  <p className="text-green-500">Imagen del logo ya cargada. Si subes otra, reemplazará la actual.</p>
                </div>
              )}
              <div>
                <label className="block font-semibold mb-2">Logo del negocio</label>
                <input
                  type="file"
                  onChange={handleLogoChange}
                  className="p-2 border rounded w-full bg-gray-100"
                  accept="image/*"
                />
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                className="bg-purple-500 text-white px-4 py-2 rounded"
              >
                Guardar Datos del Negocio
              </button>
            </form>
          </div>
        )}
      </div>
  
      {/* Sección 2: Horario del Negocio */}
      <div className="bg-white rounded shadow-md mb-4">
        <div
          className="flex justify-between items-center p-4 cursor-pointer"
          onClick={() => setShowHorarioNegocio(!showHorarioNegocio)}
        >
          <div className="flex items-center space-x-2">
            <FcCalendar size={24} />
            <h2 className="text-xl font-semibold">Horario del Negocio</h2>
          </div>
          <FcExpand size={24} />
        </div>
        {showHorarioNegocio && (
          <div className="p-4 border-t">
            {/* Formulario de Horario */}
            <form onSubmit={handleHorarioSubmit} className="space-y-6">
              <div>
                <label className="block font-semibold mb-2">Horario de Apertura</label>
                {Array.isArray(horarios) &&
                  horarios.map((dia, index) => (
                    <div key={index} className="flex items-center space-x-4 mb-2">
                      <span className="w-20">{dia.dia}</span>
                      <input
                        type="time"
                        name="desde"
                        value={dia.desde}
                        data-index={index}
                        onChange={handleChange}
                        className="p-2 border rounded"
                      />
                      <input
                        type="time"
                        name="hasta"
                        value={dia.hasta}
                        data-index={index}
                        onChange={handleChange}
                        className="p-2 border rounded"
                      />
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="cerrado"
                          checked={dia.cerrado}
                          data-index={index}
                          onChange={handleChange}
                        />
                        <span>Cerrado</span>
                      </label>
                    </div>
                  ))}
              </div>
              <button type="submit" className="bg-purple-500 text-white px-4 py-2 rounded">
                Guardar Horarios
              </button>
            </form>
          </div>
        )}
      </div>
  
      {/* Sección 3: ¿Realizas Servicios? */}
      <div className="bg-white rounded shadow-md mb-4">
        <div
          className="flex justify-between items-center p-4 cursor-pointer"
          onClick={() => setShowRealizasServicios(!showRealizasServicios)}
        >
          <div className="flex items-center space-x-2">
            <FcManager size={24} />
            <h2 className="text-xl font-semibold">¿Realizas Servicios?</h2>
          </div>
          <FcExpand size={24} />
        </div>
        {showRealizasServicios && (
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3 mb-4">
              <label htmlFor="realizaServicios" className="text-lg font-semibold text-gray-700">
                ¿Realizas Servicios?
              </label>
              <input
                id="realizaServicios"
                type="checkbox"
                checked={realizaServicios}
                onChange={handleRealizaServiciosChange}
                className="form-checkbox h-5 w-5 text-purple-500"
              />
            </div>
            {realizaServicios && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setIsSavingDisponibilidad(true);
                  saveDisponibilidad().finally(() => setIsSavingDisponibilidad(false));
                }}
                className="space-y-6"
              >
                <h3 className="text-xl font-medium text-gray-700">Configura tu Disponibilidad</h3>
                {disponibilidad.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <span className="w-24 font-medium text-gray-700">{diasSemana[index]}</span>
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                      <TimePicker
                        value={item.hora_inicio}
                        onChange={(newValue) =>
                          handleDisponibilidadChange(newValue, index, "hora_inicio")
                        }
                        renderInput={(params) => <input {...params} className="p-2 border rounded" />}
                      />
                    </LocalizationProvider>
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                      <TimePicker
                        value={item.hora_fin}
                        onChange={(newValue) =>
                          handleDisponibilidadChange(newValue, index, "hora_fin")
                        }
                        renderInput={(params) => <input {...params} className="p-2 border rounded" />}
                      />
                    </LocalizationProvider>
                    <input
                      type="checkbox"
                      checked={!item.disponible}
                      onChange={(e) =>
                        handleDisponibilidadChange(!e.target.checked, index, "disponible")
                      }
                      className="form-checkbox h-5 w-5 text-purple-500"
                    />
                    <span>{!item.disponible ? "Cerrado" : "Abierto"}</span>
                  </div>
                ))}
                <button
                  type="submit"
                  className="bg-purple-500 text-white px-4 py-2 rounded w-full"
                  disabled={isSavingDisponibilidad}
                >
                  {isSavingDisponibilidad ? "Guardando..." : "Guardar Disponibilidad"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );

};
<ToastContainer />

export default Cuenta;

