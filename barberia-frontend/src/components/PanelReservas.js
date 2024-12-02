import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import '../styles/PanelReserva.css';
moment.locale('es'); // Configurar Moment.js en español
const localizer = momentLocalizer(moment);

const PanelReservas = () => {
    const [negocioId, setNegocioId] = useState(null); // Estado para el ID del negocio
    const [reservas, setReservas] = useState([]);
    const [eventos, setEventos] = useState([]);
    const [reservasSeleccionadas, setReservasSeleccionadas] = useState([]);
    const [diaSeleccionado, setDiaSeleccionado] = useState(new Date());
    const API_URL = process.env.REACT_APP_API_URL;
    useEffect(() => {
        // Obtener el ID del negocio dinámicamente
        const obtenerNegocioId = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/negocios/usuario/negocio`, {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem('token')}`, // Asegúrate de que el token esté disponible
                    },
                  });
                setNegocioId(response.data.id); // Guarda el ID del negocio
            } catch (error) {
                console.error('Error al obtener el ID del negocio:', error);
            }
        };

        obtenerNegocioId();
    }, [API_URL]);

    useEffect(() => {
        // Una vez que tengamos el ID del negocio, obtener las reservas
        const obtenerReservas = async () => {
            if (!negocioId) return; // Esperar a tener el ID del negocio
            try {
                
                const response = await axios.get(`${API_URL}/api/panel-reservas/${negocioId}`, {
                    headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                const { reservas } = response.data;

                setReservas(reservas);
                const eventosFormat = reservas.map((reserva) => ({
                    title: `${reserva.nombre_servicio} - ${reserva.empleado}`,
                    start: new Date(`${reserva.fecha}T${reserva.hora_inicio}`),
                    end: new Date(`${reserva.fecha}T${reserva.hora_fin}`),
                    reserva,
                    bgColor:
                        reserva.estado === 'CONFIRMADA'
                            ? '#136426'
                            : reserva.estado === 'PENDIENTE'
                            ? '#e7c250'
                            : '#d42f3f',
                }));
                setEventos(eventosFormat);
            } catch (error) {
                console.error('Error al obtener reservas:', error);
            }
        };

        obtenerReservas();
    }, [negocioId,API_URL]); // Dependencia en el ID del negocio

    const handleSeleccionarDia = (date) => {
        setDiaSeleccionado(date);
        const reservasDelDia = reservas.filter(
            (reserva) => reserva.fecha === moment(date).format('YYYY-MM-DD')
        );
        setReservasSeleccionadas(reservasDelDia);
    };

    const eventStyleGetter = (event) => {
        return {
            style: {
                backgroundColor: event.bgColor,
                color: 'white',
                borderRadius: '5px',
                padding: '5px',
                border: 'none',
            },
        };
    };

    return (
        <div className="panel-reservas-container" style={{ padding: '20px' }}>
            <h2>Panel de Reservas</h2>
            <Calendar
                localizer={localizer}
                events={eventos}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                onSelectSlot={(slotInfo) => handleSeleccionarDia(slotInfo.start)}
                selectable
                defaultView="day"
                onNavigate={(date) => handleSeleccionarDia(date)}
                views={{
                    month: true,
                    week: true,
                    day: true,
                    agenda: true,
                }}
                messages={{
                    today: 'Hoy',
                    previous: 'Volver',
                    next: 'Siguiente',
                    month: 'Mes',
                    week: 'Semana',
                    day: 'Día',
                    agenda: 'Agenda',
                }}
                eventPropGetter={eventStyleGetter}
            />


            <div className="reservas-detalles">
                <h3>Reservas del {moment(diaSeleccionado).format('DD/MM/YYYY')}</h3>
                {reservasSeleccionadas.length > 0 ? (
                    <ul>
                        {reservasSeleccionadas.map((reserva, index) => (
                            <li key={index} className={`reserva ${reserva.estado.toLowerCase()}`}>
                                <b>Servicio:</b> {reserva.nombre_servicio}<br />
                                <b>Duración:</b> {reserva.duracion} minutos<br />
                                <b>Empleado:</b> {reserva.empleado}<br />
                                <b>Cliente:</b> {reserva.cliente}<br />
                                <b>Estado:</b> {reserva.estado}<br />
                                <b>Comentario:</b> {reserva.comentario_cliente || 'Sin comentario'}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No hay reservas para este día.</p>
                )}
            </div>
        </div>
    );
};

export default PanelReservas;
