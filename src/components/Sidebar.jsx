import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { syncNow } from "../services/syncService";

export default function Sidebar({ setIsSidebarOpen, isSidebarOpen, activeTab, setActiveTab, deletePresupuesto }) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar estado de autenticación
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userEmail = localStorage.getItem("userEmail");
      setIsAuthenticated(!!(token && userEmail));
    };

    // Verificar al montar el componente
    checkAuth();

    // Crear un listener para el evento storage para detectar cambios en la autenticación
    const handleStorageChange = (e) => {
      if (e.key === "token" || e.key === "userEmail") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Crear un evento personalizado para cambios de autenticación dentro de la misma ventana
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener("authChange", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  const handleNavigation = (path) => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
    setActiveTab(path.split('/')[1] || "dashboard");
  };

  // Función para manejar la creación de cuenta con datos actuales
  const handleCreateAccountWithData = () => {
    // Guardar indicador para preservar datos
    localStorage.setItem("preserveDataOnSignup", "true");
    navigate("/register");
    handleNavigation("/register");
  };

  // Función para sincronizar manualmente
  const handleManualSync = () => {
    // Verificar si la función syncNow está disponible
    if (window.syncNow && typeof window.syncNow === 'function') {
      syncNow();
      Swal.fire({
        title: 'Sincronización Exitosa',
        text: 'Tus datos han sido sincronizados con éxito',
        icon: 'success',
        confirmButtonColor: '#3b82f6'
      });
    } else {
      console.error("La función syncNow no está disponible");
      
      // Mostrar una alerta de error si SweetAlert está disponible
      if (window.Swal) {
        window.Swal.fire({
          title: 'Error',
          text: 'La función de sincronización no está disponible',
          icon: 'error',
          confirmButtonColor: '#3085d6'
        });
      }
    }
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:static md:h-auto md:z-0
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo (móvil) */}
          <div className="px-4 py-4 border-b border-gray-200 md:hidden">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="ml-2 text-xl font-bold text-gray-900">Gestión de Gastos</span>

              {/* Botón cerrar */}
              <button
                className="ml-auto md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                onClick={() => setIsSidebarOpen(false)}
              >
                <span className="sr-only">Cerrar menú</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navegación */}
          <nav className="flex-1 px-2 py-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Grupo: Principal */}
              <div>
                <div className="space-y-1">
                  {/* Dashboard */}
                  <Link
                    to="/dashboard"
                    onClick={() => handleNavigation("/dashboard")}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                      activeTab === "dashboard"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    Dashboard
                  </Link>
                </div>
              </div>

              {/* Grupo: Gestión de Gastos */}
              <div>
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Gestión de Gastos
                </h3>
                <div className="mt-2 space-y-1">
                  {/* Gastos */}
                  <Link
                    to="/gastos"
                    onClick={() => handleNavigation("/gastos")}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                      activeTab === "gastos"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Gastos
                  </Link>

                  {/* Categorías */}
                  <Link
                    to="/categorias"
                    onClick={() => handleNavigation("/categorias")}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                      activeTab === "categorias"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Categorías
                  </Link>

                  {/* Recordatorios */}
                  <Link
                    to="/recordatorios"
                    onClick={() => handleNavigation("/recordatorios")}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                      activeTab === "recordatorios"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    Recordatorios
                  </Link>
                </div>
              </div>

              {/* Grupo: Ahorro */}
              <div>
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ahorro
                </h3>
                <div className="mt-2 space-y-1">
                  {/* Metas de Ahorro */}
                  <Link
                    to="/metas"
                    onClick={() => handleNavigation("/metas")}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                      activeTab === "metas"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Metas de Ahorro
                  </Link>

                  {/* Gestión de Ahorro */}
                  <Link
                    to="/gestion-ahorro"
                    onClick={() => handleNavigation("/gestion-ahorro")}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                      activeTab === "gestionAhorro"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Gestión de Ahorro
                  </Link>
                </div>
              </div>

              {/* Grupo: Análisis */}
              <div>
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Análisis
                </h3>
                <div className="mt-2 space-y-1">
                  {/* Reportes */}
                  <Link
                    to="/reportes"
                    onClick={() => handleNavigation("/reportes")}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                      activeTab === "reportes"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Reportes
                  </Link>
                </div>
              </div>

              {/* NUEVO: Grupo para gestión de datos */}
              <div>
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Datos
                </h3>
                <div className="mt-2 space-y-1">
                  {/* Gestión de Datos */}
                  <Link
                    to="/gestion-datos"
                    onClick={() => handleNavigation("/gestion-datos")}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                      activeTab === "gestionDatos"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                      />
                    </svg>
                    Importar/Exportar
                  </Link>
                </div>
              </div>
              
              {/* Sección de cuenta - Mostrar solo si NO está autenticado */}
              {!isAuthenticated && (
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex flex-col space-y-1">
                    <Link
                      to="/login"
                      onClick={() => handleNavigation("/login")}
                      className="w-full flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Iniciar sesión
                    </Link>
                    
                    <button
                      onClick={handleCreateAccountWithData}
                      className="w-full flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150"
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Crear cuenta
                    </button>
                  </div>
                </div>
              )}
              
              {/* Sección de sincronización - Mostrar solo si ESTÁ autenticado */}
              {isAuthenticated && (
                <div className="pt-3 border-t border-gray-200">
                  <button
                    onClick={handleManualSync}
                    className="w-full flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Sincronizar datos
                  </button>
                </div>
              )}
            </div>
          </nav>
          
          {/* Botones de acciones */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="space-y-2">
              {/* Reiniciar */}
              <button
                className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-150"
                onClick={deletePresupuesto}
              >
                <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Reiniciar Aplicación
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}