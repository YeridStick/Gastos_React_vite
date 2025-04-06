import { useState, useEffect, useRef } from 'react';
import { cantidad } from '../helpers/index';

export default function Header({ setIsSidebarOpen, isSidebarOpen, metas = [], disponibleMensual = 0 }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const notificacionesRef = useRef(null);

  // Cerrar menú de notificaciones al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificacionesRef.current && !notificacionesRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Generar notificaciones basadas en metas y presupuesto disponible
  useEffect(() => {
    const nuevasNotificaciones = [];
    
    // Verificar metas que necesitan atención
    metas.forEach(meta => {
      if (meta.completada) return; // Ignorar metas completadas
      
      // Meta con poco tiempo restante (menos de 30 días)
      if (meta.diasRestantes < 30) {
        nuevasNotificaciones.push({
          id: `tiempo-${meta.id}`,
          titulo: 'Fecha límite cercana',
          mensaje: `Tu meta "${meta.nombre}" vence en ${meta.diasRestantes} días.`,
          tipo: 'warning',
          fecha: Date.now()
        });
      }
      
      // Meta con ahorro mensual superior al disponible
      if (meta.ahorroMensual > disponibleMensual && disponibleMensual > 0) {
        nuevasNotificaciones.push({
          id: `presupuesto-${meta.id}`,
          titulo: 'Meta difícil de alcanzar',
          mensaje: `Necesitas ahorrar ${cantidad(meta.ahorroMensual)} al mes para "${meta.nombre}", pero solo tienes disponible ${cantidad(disponibleMensual)}.`,
          tipo: 'danger',
          fecha: Date.now()
        });
      }
      
      // Meta con poco progreso respecto al tiempo transcurrido
      const porcentajeCompletado = (meta.ahorroAcumulado / meta.monto) * 100;
      const porcentajeTiempoTranscurrido = ((new Date() - new Date(meta.creada)) / 
                                           (new Date(meta.fechaObjetivo) - new Date(meta.creada))) * 100;
      
      if (porcentajeTiempoTranscurrido > 50 && porcentajeCompletado < 25) {
        nuevasNotificaciones.push({
          id: `progreso-${meta.id}`,
          titulo: 'Progreso lento',
          mensaje: `Has completado solo el ${Math.round(porcentajeCompletado)}% de "${meta.nombre}" y ya ha transcurrido el ${Math.round(porcentajeTiempoTranscurrido)}% del tiempo.`,
          tipo: 'info',
          fecha: Date.now()
        });
      }
    });
    
    // Actualizar notificaciones
    if (nuevasNotificaciones.length > 0) {
      setNotificaciones(nuevasNotificaciones);
    }
  }, [metas, disponibleMensual]);

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
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Logo */}
          <div className="flex items-center">
            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="ml-2 text-xl font-bold text-gray-900">Gestión de Gastos</span>
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
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              
              {/* Indicador de notificaciones */}
              {notificaciones.length > 0 && (
                <span className="absolute top-0 right-0 block h-4 w-4 rounded-full ring-2 ring-white bg-red-500 text-white text-xs flex items-center justify-center font-medium">
                  {notificaciones.length}
                </span>
              )}
            </button>
            
            {/* Panel de notificaciones */}
            {showNotifications && (
              <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-2 px-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-900">Notificaciones</h3>
                    {notificaciones.length > 0 && (
                      <button 
                        className="text-xs text-gray-500 hover:text-gray-700"
                        onClick={() => setNotificaciones([])}
                      >
                        Marcar todas como leídas
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {notificaciones.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {notificaciones.map(notificacion => (
                        <div key={notificacion.id} className="px-4 py-3 hover:bg-gray-50">
                          <div className="flex items-start">
                            <div className={`flex-shrink-0 rounded-full p-1 ${
                              notificacion.tipo === 'danger' 
                                ? 'bg-red-100 text-red-600' 
                                : notificacion.tipo === 'warning'
                                ? 'bg-yellow-100 text-yellow-600'
                                : 'bg-blue-100 text-blue-600'
                            }`}>
                              {notificacion.tipo === 'danger' && (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                              )}
                              {notificacion.tipo === 'warning' && (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                              {notificacion.tipo === 'info' && (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                            </div>
                            <div className="ml-3 flex-1">
                              <p className="text-sm font-medium text-gray-900">{notificacion.titulo}</p>
                              <p className="mt-1 text-sm text-gray-500">{notificacion.mensaje}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-center text-sm text-gray-500">
                      No hay notificaciones pendientes
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}