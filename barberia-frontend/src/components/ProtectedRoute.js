import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null); // Para almacenar el cargo del usuario
  const API_URL = process.env.REACT_APP_API_URL;
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        // Validar el token haciendo una solicitud al backend
        const response = await axios.get(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsAuthenticated(true);
        setUserRole(response.data.cargo); // Obtén el cargo del usuario
      } catch (error) {
        console.error('Token inválido o sesión expirada:', error);
        localStorage.removeItem('token'); // Eliminar token si es inválido
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [API_URL]);

  // Mostrar nada mientras se verifica la autenticación
  if (isAuthenticated === null) {
    return <div>Cargando...</div>;
  }

  // Verificar roles
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;

