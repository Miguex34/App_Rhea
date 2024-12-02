import React, { useState, useEffect } from "react";
import "../styles/Principal.css"; // Archivo CSS personalizado
import logo from "../assets/images/logo.png"; // Cambia al path real de tu logo
import avionImage from "../assets/images/avion.png"; // Cambia al path real de tu imagen del avión
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Principal = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [setNegocios] = useState([]);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchNegocios = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/negocios/completos`);
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
  }, [API_URL,setNegocios]);


  return (
    <div className="homepage-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <img
            src={logo}
            alt="Rhea Reserve Logo"
            className="logo"
            onClick={() => navigate("/principal")}
          />
          <button onClick={() => setMenuOpen(!menuOpen)}>
            <a href="/negocios" class="btn2"><span class="spn2">NEGOCIOS</span></a>
          </button>
        </div>

        <div className="navbar-right">
          <button onClick={() => navigate("/register")}>
            <a href="/register" class="btn2"><span class="spn2">Registrarse</span></a>
          </button>
          <button onClick={() => navigate("/login")}>
          <a href="/login" class="btn2"><span class="spn2">Iniciar Sesion</span></a>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-text">
          <h1>
            <span className="highlight">¡Reserva en segundos,</span> sin
            complicaciones!
          </h1>
          <p>
            Gestiona tus citas de forma rápida y fácil, donde y cuando quieras.
          </p>
          <a class="btn" href="/register">COMIENZA AHORA</a>
        </div>
        <div className="hero-image">
          <img src={avionImage} alt="Persona en avión" />
        </div>
      </div>
      <div className="separator"></div>
      {/* Cards Section */}
      <div className="cards-section">
        <div className="cards-wrapper">
          <div className="card-container">
            <div className="card">
              <div className="front-content">
                <p>Agenda <br></br> Inteligente</p>
              </div>
              <div className="content">
                <p className="heading">Agenda Inteligente</p>
                <p>
                  Optimiza la programación de tus citas de manera automática, garantizando disponibilidad y evitando conflictos de horarios.
                </p>
              </div>
            </div>
          </div>

          <div className="card-container">
            <div className="card">
              <div className="front-content">
                <p>Gestión Total</p>
              </div>
              <div className="content">
                <p className="heading">Gestión Total</p>
                <p>
                  Administra todos los aspectos de tu negocio, desde horarios y empleados hasta pagos y reportes, en una sola plataforma.
                </p>
              </div>
            </div>
          </div>

          <div className="card-container">
            <div className="card">
              <div className="front-content">
                <p>Reducción de <br></br> No Shows</p>
              </div>
              <div className="content">
                <p className="heading">Reducción de <br></br> No Shows</p>
                <p>
                  Implementa recordatorios automatizados y políticas flexibles para reducir cancelaciones y aumentar la puntualidad.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Principal;
