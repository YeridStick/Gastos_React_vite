import { useState, useEffect, useRef } from "react";
import { cantidad } from "../helpers/index";
import PropTypes from "prop-types";
import { sendEmailNotification } from '../services/syncService';

export default function Header({
  setIsSidebarOpen,
  isSidebarOpen,
  metas = [],
  disponibleMensual = 0,
  isAuthenticated = false,
  onLogout
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificacionesRef = useRef(null);
  const userMenuRef = useRef(null);

  // Cerrar menú de notificaciones al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificacionesRef.current &&
        !notificacionesRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Obtener información del usuario
  const userEmail = localStorage.getItem("userEmail") || "";
  const userName = userEmail.split('@')[0] || "Usuario";

  // Generar notificaciones basadas en metas, presupuesto disponible y recordatorios
  useEffect(() => {
    const nuevasNotificaciones = [];
    const notificacionesLeidas = JSON.parse(localStorage.getItem("notificacionesLeidas") || "[]");

    // Verify if user is authenticated before attempting to send emails
    if (!isAuthenticated) {
      console.log("User not authenticated. Skipping email notifications.");
    }

    // Verificar metas que necesitan atención
    metas.forEach((meta) => {
      if (meta.completada) return; // Ignorar metas completadas

      // Meta con poco tiempo restante (menos de 30 días)
      if (meta.diasRestantes < 30) {
        const notification = {
          id: `tiempo-${meta.id}`,
          titulo: "Fecha límite cercana",
          mensaje: `Tu meta "${meta.nombre}" vence en ${meta.diasRestantes} días.`,
          tipo: "warning",
          fecha: Date.now(),
        };
        if (!notificacionesLeidas.includes(notification.id)) {
          nuevasNotificaciones.push(notification);
          if (isAuthenticated && userEmail) {
            sendEmailNotification({
              email: userEmail,
              subject: notification.titulo,
              message: notification.mensaje,
              userName: userName,
            });
          }
        }
      }

      // Meta con ahorro mensual superior al disponible
      if (meta.ahorroMensual > disponibleMensual && disponibleMensual > 0) {
        const notification = {
          id: `presupuesto-${meta.id}`,
          titulo: "Meta difícil de alcanzar",
          mensaje: `Necesitas ahorrar ${cantidad(
            meta.ahorroMensual
          )} al mes para "${
            meta.nombre
          }", pero solo tienes disponible ${cantidad(disponibleMensual)}.`,
          tipo: "danger",
          fecha: Date.now(),
        };
        if (!notificacionesLeidas.includes(notification.id)) {
          nuevasNotificaciones.push(notification);
          if (isAuthenticated && userEmail) {
            sendEmailNotification({
              email: userEmail,
              subject: notification.titulo,
              message: notification.mensaje,
              userName: userName,
            });
          }
        }
      }

      // Meta con poco progreso respecto al tiempo transcurrido
      const porcentajeCompletado = (meta.ahorroAcumulado / meta.monto) * 100;
      const porcentajeTiempoTranscurrido =
        ((new Date() - new Date(meta.creada)) /
          (new Date(meta.fechaObjetivo) - new Date(meta.creada))) *
        100;

      if (porcentajeTiempoTranscurrido > 50 && porcentajeCompletado < 25) {
        const notification = {
          id: `progreso-${meta.id}`,
          titulo: "Progreso lento",
          mensaje: `Has completado solo el ${Math.round(
            porcentajeCompletado
          )}% de "${meta.nombre}" y ya ha transcurrido el ${Math.round(
            porcentajeTiempoTranscurrido
          )}% del tiempo.`,
          tipo: "info",
          fecha: Date.now(),
        };
        if (!notificacionesLeidas.includes(notification.id)) {
          nuevasNotificaciones.push(notification);
        }
      }
    });

    // Verificar recordatorios de pago próximos y vencidos
    try {
      const recordatoriosGuardados = localStorage.getItem("recordatorios");

      if (recordatoriosGuardados) {
        const recordatorios = JSON.parse(recordatoriosGuardados);
        const hoy = Date.now();

        // Filtrar recordatorios pendientes y próximos
        const recordatoriosProximos = recordatorios.filter(
          (r) =>
            r.estado === "pendiente" &&
            r.fechaVencimiento >= hoy &&
            (r.fechaVencimiento - hoy) / (1000 * 60 * 60 * 24) <=
              r.diasAnticipacion
        );

        // Filtrar recordatorios vencidos
        const recordatoriosVencidos = recordatorios.filter(
          (r) =>
            r.estado === "vencido" ||
            (r.estado === "pendiente" && r.fechaVencimiento < hoy)
        );

        // Añadir notificaciones para recordatorios próximos
        recordatoriosProximos.forEach((recordatorio) => {
          const diasRestantes = Math.ceil(
            (recordatorio.fechaVencimiento - hoy) / (1000 * 60 * 60 * 24)
          );

          const notification = {
            id: `proximo-${recordatorio.id}`,
            titulo: "Pago próximo",
            mensaje: `Tu pago de "${recordatorio.titulo}" por ${cantidad(
              recordatorio.monto
            )} vence en ${diasRestantes} ${
              diasRestantes === 1 ? "día" : "días"
            }.`,
            tipo: "warning",
            fecha: Date.now(),
            link: "recordatorios",
          };
          if (!notificacionesLeidas.includes(notification.id)) {
            nuevasNotificaciones.push(notification);
            if (isAuthenticated && userEmail) {
              sendEmailNotification({
                email: userEmail,
                subject: notification.titulo,
                message: notification.mensaje,
                userName: userName,
              });
            }
          }
        });

        // Añadir notificaciones para recordatorios vencidos
        recordatoriosVencidos.forEach((recordatorio) => {
          const diasVencidos = Math.abs(
            Math.floor(
              (recordatorio.fechaVencimiento - hoy) / (1000 * 60 * 60 * 24)
            )
          );

          const notification = {
            id: `vencido-${recordatorio.id}`,
            titulo: "Pago vencido",
            mensaje: `Tu pago de "${recordatorio.titulo}" por ${cantidad(
              recordatorio.monto
            )} está vencido por ${diasVencidos} ${
              diasVencidos === 1 ? "día" : "días"
            }.`,
            tipo: "danger",
            fecha: Date.now(),
            link: "recordatorios",
          };
          if (!notificacionesLeidas.includes(notification.id)) {
            nuevasNotificaciones.push(notification);
            if (isAuthenticated && userEmail) {
              sendEmailNotification({
                email: userEmail,
                subject: notification.titulo,
                message: notification.mensaje,
                userName: userName,
              });
            }
          }
        });
      }
    } catch (error) {
      console.error(
        "Error al cargar recordatorios para notificaciones:",
        error
      );
    }

    // Actualizar notificaciones
    if (nuevasNotificaciones.length > 0) {
      setNotificaciones(nuevasNotificaciones);
    }
  }, [metas, disponibleMensual, isAuthenticated, userEmail, userName]);

  // Manejar clic en notificación
  const handleNotificationClick = (notificacion) => {
    // Si la notificación tiene un link, navegar a esa sección
    if (notificacion.link) {
      // Cierra el panel de notificaciones
      setShowNotifications(false);
    }
  };

  // Manejar marcar todas las notificaciones como leídas
  const handleMarkAllAsRead = () => {
    const notificacionesLeidas = notificaciones.map(n => n.id);
    localStorage.setItem("notificacionesLeidas", JSON.stringify(notificacionesLeidas));
    setNotificaciones([]);
  };
  
  // Manejar cierre de sesión
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center">
          {/* Botón de hamburguesa para móvil */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden mr-3 p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <span className="sr-only">Abrir menú</span>
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Logo */}
          <div className="hidden sm:flex items-center">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="ml-2 text-xl font-bold text-gray-900">
              Gestión de Gastos
            </span>
          </div>
        </div>

        {/* Acciones del usuario */}
        <div className="flex items-center space-x-4">
          {/* Botón de notificaciones */}
          <div className="relative" ref={notificacionesRef}>
            <button
              className="p-2 rounded-full bg-gray-100 text-gray-500 hover:text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <span className="sr-only">Ver notificaciones</span>
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>

              {/* Indicador de notificaciones */}
              {notificaciones.length > 0 && (
                <span className="absolute top-0 right-0 block h-3 w-3 sm:h-4 sm:w-4 rounded-full ring-2 ring-white bg-red-500 text-white text-xs flex items-center justify-center font-medium">
                  {notificaciones.length > 9 ? "9+" : notificaciones.length}
                </span>
              )}
            </button>

            {/* Panel de notificaciones */}
            {showNotifications && (
              <div className="origin-top-right absolute right-0 mt-2 w-64 sm:w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-2 px-3 sm:px-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-900">
                      Notificaciones
                    </h3>
                    {notificaciones.length > 0 && (
                      <button
                        className="text-xs text-gray-500 hover:text-gray-700"
                        onClick={handleMarkAllAsRead}
                      >
                        Marcar todas
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-60 sm:max-h-80 overflow-y-auto">
                  {notificaciones.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {notificaciones.map((notificacion) => (
                        <div
                          key={notificacion.id}
                          className={`px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 ${
                            notificacion.link ? "cursor-pointer" : ""
                          }`}
                          onClick={() =>
                            notificacion.link &&
                            handleNotificationClick(notificacion)
                          }
                        >
                          <div className="flex items-start">
                            <div
                              className={`flex-shrink-0 rounded-full p-1 ${
                                notificacion.tipo === "danger"
                                  ? "bg-red-100 text-red-600"
                                  : notificacion.tipo === "warning"
                                  ? "bg-yellow-100 text-yellow-600"
                                  : "bg-blue-100 text-blue-600"
                              }`}
                            >
                              {notificacion.tipo === "danger" && (
                                <svg
                                  className="h-3 w-3 sm:h-4 sm:w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                  />
                                </svg>
                              )}
                              {notificacion.tipo === "warning" && (
                                <svg
                                  className="h-3 w-3 sm:h-4 sm:w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              )}
                              {notificacion.tipo === "info" && (
                                <svg
                                  className="h-3 w-3 sm:h-4 sm:w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              )}
                            </div>
                            <div className="ml-2 sm:ml-3 flex-1">
                              <p className="text-xs sm:text-sm font-medium text-gray-900">
                                {notificacion.titulo}
                              </p>
                              <p className="mt-0.5 sm:mt-1 text-xs text-gray-500 line-clamp-2">
                                {notificacion.mensaje}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-center text-xs sm:text-sm text-gray-500">
                      No hay notificaciones pendientes
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Menú de usuario */}
          {isAuthenticated && (
            <div className="relative" ref={userMenuRef}>
              <button 
                className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  {userName[0].toUpperCase()}
                </div>
                <span className="hidden sm:ml-2 sm:block">{userName}</span>
                <svg className="hidden sm:ml-1 sm:block h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm text-gray-700 truncate">{userEmail}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

Header.propTypes = {
  setIsSidebarOpen: PropTypes.func.isRequired,
  isSidebarOpen: PropTypes.bool.isRequired,
  metas: PropTypes.array,
  disponibleMensual: PropTypes.number,
  isAuthenticated: PropTypes.bool,
  onLogout: PropTypes.func
};