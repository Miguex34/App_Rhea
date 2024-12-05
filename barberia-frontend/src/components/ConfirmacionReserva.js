import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../ConfirmacionReserva.css';
import axios from 'axios';

const ConfirmacionReserva = () => {
    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_API_URL;
    const [estadoPago, setEstadoPago] = useState(null); // 'CONFIRMADA', 'RECHAZADA', o null
    const [isLoading, setIsLoading] = useState(true); // Estado del loader

    const token_ws = new URLSearchParams(window.location.search).get('token_ws');
    const reservaInvitado = JSON.parse(sessionStorage.getItem('reservaInvitado'));

    const handleVolverInicio = () => {
        sessionStorage.clear();
        navigate('/principal'); // Redirigir a la página inicial
    };

    useEffect(() => {
        const verificarPago = async () => {
            if (!token_ws) {
                setIsLoading(false); // No hay token, se termina el loader
                return;
            }

            try {
                // Llamar al backend para verificar el estado del pago
                const response = await axios.get(`${API_URL}/api/pagos/confirmacion?token_ws=${token_ws}`);
                console.log('Respuesta del backend:', response.data);

                // Revisar el campo "estado" de la respuesta del backend
                if (response.data.estado === 'CONFIRMADA') {
                    setEstadoPago('CONFIRMADA');
                } else if (response.data.estado === 'RECHAZADO') {
                    setEstadoPago('RECHAZADA');
                } else {
                    setEstadoPago('RECHAZADA'); // Cualquier otro caso se toma como rechazo
                }
            } catch (error) {
                console.error('Error al verificar el pago:', error);
                setEstadoPago('RECHAZADA'); // Asumimos error como rechazo
            } finally {
                setIsLoading(false); // Termina el loader
            }
        };

        verificarPago();
    }, [token_ws]);

    // Mostrar el loader mientras se verifica el estado
    if (isLoading) {
        return (
            <div className="registro-content">
                <div className="registro-form">
                    <h2 className="registro-titulo-wait">Confirmando Pago...</h2>
                </div>
            </div>
        );
    }

    // Caso de pago en tienda (sin `token_ws`)
    if (!token_ws) {
        return (
            <div className="confirmacion-container">
                <h2 className="confirmacion-titulo">🎊¡Reserva Confirmada! 🎊</h2>
                <p>Tu reserva se ha realizado con éxito.</p> <br />
                <p> Recibirás un correo en <span className="correousuario">{reservaInvitado?.email}</span> con la información detallada.</p>
                <button onClick={handleVolverInicio} className="btn volver-inicio">Volver al Inicio</button>
            </div>
        );
    }

    // Modal de confirmación de pago
    if (estadoPago === 'CONFIRMADA') {
        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="confirmacion-container">
                        <h2 className="confirmacion-titulo">🎊¡Reserva Confirmada! 🎊</h2>
                        <p>Tu reserva se ha realizado con éxito.</p> <br />
                        <p> Recibirás un correo en <span className="correousuario">{reservaInvitado?.email}</span> con la información detallada.</p>
                    </div>
                    <div className="modal-buttons">
                        <button onClick={handleVolverInicio} className="btn volver-inicio">Volver</button>
                    </div>
                </div>
            </div>
        );
    }

    // Modal de rechazo de pago
    if (estadoPago === 'RECHAZADA') {
        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="confirmacion-container">
                        <h2 className="confirmacion-titulo-rechazo">¡Reserva Rechazada!</h2>
                        <p>Tuvimos un problema con el pago. Por favor, intenta nuevamente.</p> <br />
                    </div>
                    <div className="modal-buttons">
                        <button onClick={handleVolverInicio} className="btn volver-inicio">Volver</button>
                    </div>
                </div>
            </div>
        );
    }

    // Caso por defecto (nunca debería suceder)
    return null;
};

export default ConfirmacionReserva;
