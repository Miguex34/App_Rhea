import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const CancelarReserva = () => {
    const { token } = useParams(); // Obtener el token desde la URL
    const [isCancelling, setIsCancelling] = useState(false); // Estado para el botón
    const [error, setError] = useState(null); // Manejo de errores
    const navigate = useNavigate(); // Navegación para redirigir al usuario

    // Manejar la cancelación de la reserva
    const handleCancelarReserva = async () => {
        setIsCancelling(true); // Mostrar que se está procesando
        try {
            await axios.post('http://localhost:5000/api/reserva-horario/cancelar', { token });
            alert('La reserva ha sido cancelada exitosamente.');
            navigate('/'); // Redirigir al usuario después de la cancelación
        } catch (error) {
            console.error('Error al cancelar la reserva:', error);
            setError('Hubo un problema al cancelar la reserva. Intenta de nuevo más tarde.');
        } finally {
            setIsCancelling(false); // Detener la animación de carga
        }
    };

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Cancelar Reserva</h1>
            <p>¿Estás seguro que deseas cancelar esta reserva?</p>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button
                onClick={handleCancelarReserva}
                disabled={isCancelling} // Deshabilitar mientras se cancela
                style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    backgroundColor: isCancelling ? '#ccc' : '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: isCancelling ? 'not-allowed' : 'pointer'
                }}
            >
                {isCancelling ? 'Cancelando...' : 'Cancelar Reserva'}
            </button>
        </div>
    );
};

export default CancelarReserva;
