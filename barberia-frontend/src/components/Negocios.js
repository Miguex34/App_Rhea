import React, { useState, useEffect } from "react";
import "../styles/Negocios.css"; // Archivo CSS personalizado
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Negocios = () => {
  const [negocios, setNegocios] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNegocios = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/negocios/completos"
        );
        const negociosFiltrados = response.data.filter(
          (negocio) =>
            negocio.nombre &&
            negocio.telefono &&
            negocio.direccion &&
            negocio.categoria
        );
        setNegocios(negociosFiltrados);
      } catch (error) {
        console.error("Error al obtener negocios:", error);
      }
    };

    fetchNegocios();
  }, []);

  const handleNegocioClick = (nombre) => {
    navigate(`/negocio/${nombre}`);
  };

  return (
    <div className="negocios-container">
      <h1 className="titulo-negocios">Negocios Disponibles</h1>
      <p className="descripcion-negocios">
        Aquí verás todos los negocios disponibles. Haz clic en uno para ver más detalles.
      </p>
      <div className="negocios-grid">
        {negocios.length > 0 ? (
          negocios.map((negocio) => (
            <div
              key={negocio.id}
              className="negocio-card"
              onClick={() => handleNegocioClick(negocio.nombre)}
            >
              <h2>{negocio.nombre}</h2>
              <p>Direccion: {negocio.direccion}</p>
              <p>Telefono: {negocio.telefono}</p>
              <p>Categoría: {negocio.categoria}</p>
            </div>
          ))
        ) : (
          <p>No hay negocios disponibles</p>
        )}
      </div>
    </div>
  );
};

export default Negocios;
