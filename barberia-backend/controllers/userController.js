// controllers/userController.js
const Usuario = require('../models/Usuario');
const Negocio = require('../models/Negocio');
const DuenoNegocio = require('../models/DuenoNegocio');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const EmpleadoNegocio = require('../models/EmpleadoNegocio');
const path = require('path');


// Función para registrar un usuario y crear su negocio
const register = async (req, res) => {
  const {
    nombre,
    correo,
    contraseña,
    telefono,
    nombreNegocio,
    correoNegocio, // Nuevo campo
    telefonoNegocio,
    direccionNegocio,
    cargo,
  } = req.body;

  try {
    // Verificar si el correo ya está registrado
    const emailExists = await Usuario.findOne({ where: { correo } });
    if (emailExists) {
      return res.status(400).json({ message: 'El correo ya está en uso.' });
    }

    const negocioExists = await Negocio.findOne({ where: { nombre: nombreNegocio } });
    if (negocioExists) {
      return res.status(400).json({ message: 'El nombre del negocio ya está en uso.' });
    }

    // Crear el hash de la contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Crear el usuario
    const nuevoUsuario = await Usuario.create({
      nombre,
      correo,
      contrasena_hash: hashedPassword,
      telefono,
      cargo,
    });

    console.log('Usuario creado:', nuevoUsuario);

    // Crear el negocio relacionado con el usuario
    const nuevoNegocio = await Negocio.create({
      nombre: nombreNegocio,
      correo: correoNegocio, // Guardar correo del negocio
      telefono: telefonoNegocio,
      direccion: direccionNegocio,
      id_dueno: nuevoUsuario.id,
    });

    // Crear la relación entre el usuario y el negocio (dueño de negocio)
    await DuenoNegocio.create({
      id_usuario: nuevoUsuario.id,
      id_negocio: nuevoNegocio.id,
    });

    // Crear relación entre usuario y negocio
    await EmpleadoNegocio.create({
      id_usuario: nuevoUsuario.id,
      id_negocio: nuevoNegocio.id,
      id_empleado: nuevoUsuario.id
    });

    // Generar un token JWT para el usuario recién registrado
    const token = jwt.sign({ id: nuevoUsuario.id, correo: nuevoUsuario.correo }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    return res.status(201).json({ message: 'Usuario y negocio creados con éxito', token });
  } catch (error) {
    console.error('Error al registrar el usuario y crear el negocio:', error);
    return res.status(500).json({ error: 'Error en el registro', detalle: error.message });
  }
};

// Función para el inicio de sesión
const login = async (req, res) => {
  const { correo, contraseña } = req.body;

  try {
    const usuario = await Usuario.findOne({ where: { correo } });
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const isPasswordValid = await bcrypt.compare(contraseña, usuario.contrasena_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ id: usuario.id, correo: usuario.correo }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    return res.status(200).json({ message: 'Inicio de sesión exitoso', token });
  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    return res.status(500).json({ error: 'Error al iniciar sesión', detalle: error.message });
  }
};

// Función para obtener un usuario por su ID
const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.status(200).json(usuario);
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    return res.status(500).json({ error: 'Error al obtener el usuario', detalle: error.message });
  }
};

// Función para obtener el usuario logeado
const getLoggedUser = async (req, res) => {
  try {
    const usuario = await Usuario.findOne({
      where: { id: req.user.id },
      include: {
        model: Negocio,
        as: 'negocio',
        attributes: ['id', 'nombre', 'telefono','correo','descripcion','categoria'],
      },
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      telefono: usuario.telefono,
      foto_perfil: usuario.foto_perfil,
      negocio: usuario.negocio || {},
      
    });
  } catch (error) {
    console.error('Error al obtener el usuario logeado:', error);
    res.status(500).json({ error: 'Error al obtener el usuario logeado' });
  }
};
const updateUser = async (req, res) => {
  const { nombre, correo, telefono, contraseñaActual, nuevaContraseña } = req.body;

  try {
    const usuario = await Usuario.findByPk(req.user.id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Si se intenta cambiar la contraseña, verificar la contraseña actual
    if (nuevaContraseña) {
      if (!contraseñaActual) {
        return res.status(400).json({ message: 'Debe ingresar la contraseña actual para cambiarla.' });
      }

      // Verificar la contraseña actual
      const isPasswordValid = await bcrypt.compare(contraseñaActual, usuario.contrasena_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Contraseña actual incorrecta' });
      }

      // Crear el hash de la nueva contraseña
      const hashedPassword = await bcrypt.hash(nuevaContraseña, 10);
      usuario.contrasena_hash = hashedPassword;
    }

    // Actualizar otros campos si están presentes
    if (nombre) usuario.nombre = nombre;
    if (correo) usuario.correo = correo;
    if (telefono) usuario.telefono = telefono;

    await usuario.save();
    return res.status(200).json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    return res.status(500).json({ error: 'Error al actualizar el usuario', detalle: error.message });
  }
};
const uploadProfileImage = async (req, res) => {
  try {
    console.log("ID de usuario en req.user:", req.user);

    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ningún archivo' });
    }

    const profileImageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const userId = req.user.id;

    // Busca al usuario por su ID
    const user = await Usuario.findByPk(userId);

    // Verifica si el usuario existe
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualiza el campo foto_perfil y guarda los cambios
    user.foto_perfil = profileImageUrl;
    await user.save();

    res.json({
      message: 'Foto de perfil actualizada correctamente',
      profileImage: user.foto_perfil,
    });
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    res.status(500).json({ message: 'Error al subir la imagen' });
  }
};

module.exports = {
  register,
  login,
  getUserById,
  getLoggedUser,
  updateUser,
  uploadProfileImage,
};
