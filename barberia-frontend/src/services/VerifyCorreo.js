import axios from 'axios';

export const verificarCorreo = async (API_URL, email) => {
  try {
    const response = await axios.get(`${API_URL}/api/clientes/verificar-correo`, {
      params: { email },
    });
    return response.data; // Retorna { registrado: true/false }
  } catch (error) {
    console.error('Error al verificar el correo:', error);
    throw new Error('Error al verificar el correo. Inténtalo de nuevo.');
  }
};
