import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Swal from "sweetalert2";

// Componentes
import Header from "./components/Header";
import Sidebar from "./components/Sidebar.jsx";
import AuthPages from "./pages/AuthPages";
import Welcome from "./pages/Welcome.jsx";

import Dashboard from "./pages/Dashboard";
import Modal from "./components/Modal/General/Modal";
import ModalIngresoExtra from "./components/Modal/ModalIngresoExtra";
import ModalEditarPresupuesto from "./components/Modal/ModalEditarPresupuesto";
import ListadoGastos from "./pages/gastos/ListadoGastos";
import Filtros from "./components/Filtros";
import Categorias from "./pages/gastos/NuevaCategoria";
import Reportes from "./pages/Reportes";
import MetasAhorro from "./pages/MetasAhorro";
import GestionAhorro from "./pages/GestionAhorro";
import Recordatorios from "./pages/Recordatorios";

// Servicios
import {
  syncDataToServer,
  syncDataFromServer,
  setupSyncObserver,
  setupPeriodicSync,
  handleLogout,
  setupSessionConflictDetection,
} from "./services/syncService";

// Funciones
import { generarID } from "./helpers/index";
import DataManagement from "./pages/DataManagement.jsx";

function App() {
  // Estado de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Estados principales
  const [presupuesto, setPresupuesto] = useState(
    JSON.parse(localStorage.getItem("PresupuestoLS")) ?? ""
  );
  const [isValid, setIsValid] = useState(
    JSON.parse(localStorage.getItem("ValidLS")) ?? false
  );
  const [modal, setModal] = useState(false);
  const [modalIngreso, setModalIngreso] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [gastosState, setGastosState] = useState(
    JSON.parse(localStorage.getItem("ObjetosGastos")) ?? []
  );
  const [gastoEditar, setGastoEditar] = useState({});
  const [ingresosExtra, setIngresosExtra] = useState(
    JSON.parse(localStorage.getItem("IngresosExtra")) ?? []
  );
  const [metas, setMetas] = useState(
    JSON.parse(localStorage.getItem("MetasAhorro")) ?? []
  );
  const [disponibleMensual, setDisponibleMensual] = useState(0);

  // Estados para navegación y filtros
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filtros, setFiltros] = useState("");
  const [gastosFiltrados, setGastosFiltrados] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const cleanupConflictDetection = setupSessionConflictDetection();

    return () => {
      cleanupConflictDetection();
    };
  }, []);

  // Verificar autenticación al cargar
  /*useEffect(() => {
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail");

    if (token && userEmail) {
      setIsAuthenticated(true);

      console.log("Configuración de sincronización inicializada en App.js");

      // Configurar sincronización automática con el servicio mejorado (una sola vez)
      const cleanup = setupSyncObserver();

      // Configurar la sincronización periódica (retorna el ID del intervalo)
      const syncInterval = setupPeriodicSync(5);

      // Solo sincronizar datos completos desde el servidor una vez al iniciar
      // Usar un pequeño timeout para evitar que múltiples componentes soliciten
      // la sincronización al mismo tiempo
      const initialSyncTimeout = setTimeout(() => {
        syncDataFromServer(true);
      }, 100);

      // Limpiar recursos de sincronización al desmontar
      return () => {
        if (syncInterval) {
          clearInterval(syncInterval);
        }
        if (initialSyncTimeout) {
          clearTimeout(initialSyncTimeout);
        }
        if (cleanup) {
          cleanup();
        }
        console.log("Recursos de sincronización liberados");
      };
    }
  }, []);*/

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail");
  
    if (token && userEmail) {
      setIsAuthenticated(true);
  
      const cleanup = setupSyncObserver();
      
      return () => {
        if (cleanup) {
          cleanup();
        }
      };
    }
  }, []);

  // Calcular disponible mensual para ahorro
  useEffect(() => {
    // Promedio de gastos mensuales
    const calcularDisponibleMensual = () => {
      // Agrupar gastos por mes
      const gastosPorMes = {};
      gastosState.forEach((gasto) => {
        const fecha = new Date(gasto.fecha);
        const mesAño = `${fecha.getMonth()}-${fecha.getFullYear()}`;

        if (!gastosPorMes[mesAño]) {
          gastosPorMes[mesAño] = 0;
        }

        gastosPorMes[mesAño] += gasto.gasto;
      });

      // Calcular promedio si hay datos
      if (Object.keys(gastosPorMes).length > 0) {
        const totalGastos = Object.values(gastosPorMes).reduce(
          (a, b) => a + b,
          0
        );
        const promedioGastosMensual =
          totalGastos / Object.keys(gastosPorMes).length;

        // Disponible mensual = presupuesto - promedio de gastos
        const disponible = presupuesto - promedioGastosMensual;
        setDisponibleMensual(disponible);
      } else {
        // Si no hay gastos registrados, todo el presupuesto está disponible
        setDisponibleMensual(presupuesto);
      }
    };

    if (presupuesto > 0) {
      calcularDisponibleMensual();
    }
  }, [presupuesto, gastosState]);

  // Cargar las metas cuando cambien en localStorage
  useEffect(() => {
    const metasGuardadas = localStorage.getItem("MetasAhorro");
    if (metasGuardadas) {
      try {
        setMetas(JSON.parse(metasGuardadas));
      } catch (error) {
        console.error("Error al cargar las metas:", error);
      }
    }
  }, []);

  const handleManualSync = async () => {
    try {
      console.log("Iniciando sincronización manual desde App.js...");

      Swal.fire({
        title: "Sincronizando",
        text: "Sincronizando datos con el servidor...",
        didOpen: () => {
          Swal.showLoading();
        },
        allowOutsideClick: false,
      });

      const result = await syncDataToServer();

      if (result) {
        //await syncDataFromServer();

        Swal.fire({
          title: "Sincronización Exitosa",
          text: "Tus datos han sido sincronizados con éxito",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          title: "Error",
          text: "Hubo un problema durante la sincronización",
          icon: "error",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (error) {
      console.error("Error durante la sincronización manual:", error);
      Swal.fire({
        title: "Error",
        text: "Hubo un problema durante la sincronización",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  // Función para manejar el éxito del inicio de sesión
  const handleLoginSuccess = (data) => {
    setIsAuthenticated(true);

    // Cargar estados desde localStorage después de la sincronización
    // Ahora los estados se actualizan desde el localStorage que ya ha sido sincronizado
    setPresupuesto(JSON.parse(localStorage.getItem("PresupuestoLS")) ?? "");
    setIsValid(JSON.parse(localStorage.getItem("ValidLS")) ?? false);
    setGastosState(JSON.parse(localStorage.getItem("ObjetosGastos")) ?? []);
    setIngresosExtra(JSON.parse(localStorage.getItem("IngresosExtra")) ?? []);
    setMetas(JSON.parse(localStorage.getItem("MetasAhorro")) ?? []);

    // Actualizar el activeTab para mostrar la sección correcta
    setActiveTab("dashboard");

    // No necesitamos configurar la sincronización aquí, ya que se hace en AuthPages.jsx
    console.log("Estados actualizados después de inicio de sesión exitoso");
  };

  // Función para manejar el cierre de sesión
  const logoutUser = async () => {
    try {
      await handleLogout();
      setIsAuthenticated(false);
      console.log("Sesión cerrada correctamente");
      Swal.fire({
        title: "Sesión cerrada",
        text: "sesión cerrada correctamente",
        icon: "success",
        confirmButtonColor: "#3b82f6",
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      Swal.fire({
        title: "Error",
        text: "Hubo un problema al cerrar la sesión",
        icon: "error",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  const handleNuevoGasto = () => {
    setModal(true);
    setGastoEditar({});
  };

  const deletePresupuesto = () => {
    Swal.fire({
      title: "¿Estás seguro que quieres reiniciar la aplicación?",
      icon: "question",
      confirmButtonText: "Sí",
      cancelButtonText: "No",
      showCancelButton: true,
      showCloseButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#6b7280",
      customClass: {
        popup: "rounded-lg",
        title: "text-gray-800 font-medium",
      },
    }).then((result) => {
      result.isConfirmed &&
        (setPresupuesto(""),
        setIsValid(false),
        setModal(false),
        setGastosState([]),
        setGastoEditar({}),
        setIngresosExtra([]),
        setMetas([]),
        localStorage.removeItem("ObjetosGastos"),
        localStorage.removeItem("PresupuestoLS"),
        localStorage.removeItem("ValidLS"),
        localStorage.removeItem("IngresosExtra"),
        localStorage.removeItem("MetasAhorro"),
        localStorage.removeItem("categorias"),
        localStorage.removeItem("recordatorios"));

      // Sincronizar con servidor para reflejar los cambios
      syncDataToServer();
    });
  };

  const guardarGastos = (cantidadGasto) => {
    if (gastoEditar.id) {
      cantidadGasto.id = gastoEditar.id;
      cantidadGasto.fecha = gastoEditar.fecha;
      const update = gastosState.map((element) => {
        if (element.id === cantidadGasto.id) {
          return cantidadGasto;
        } else {
          return element;
        }
      });
      setGastosState(update);

      // Notificación amigable
      Swal.fire({
        title: "¡Gasto Actualizado!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        position: "bottom-end",
        customClass: {
          popup: "rounded-lg",
        },
      });
    } else {
      cantidadGasto.id = generarID();
      cantidadGasto.fecha = Date.now();
      setGastosState([cantidadGasto, ...gastosState]);

      // Notificación amigable
      Swal.fire({
        title: "¡Gasto Agregado!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        position: "bottom-end",
        customClass: {
          popup: "rounded-lg",
        },
      });
    }
    setModal(false);
    setGastoEditar({});

    // La sincronización automática ocurrirá debido al observer de localStorage
  };

  // Nueva función para agregar ingresos extras
  const actualizarPresupuesto = (monto, descripcion) => {
    // Actualizar el presupuesto
    const nuevoPresupuesto = Number(presupuesto) + Number(monto);
    setPresupuesto(nuevoPresupuesto);

    // Registrar el ingreso extra
    const nuevoIngreso = {
      id: generarID(),
      monto,
      descripcion,
      fecha: Date.now(),
    };

    setIngresosExtra([nuevoIngreso, ...ingresosExtra]);

    // Notificación
    Swal.fire({
      title: "¡Ingreso Registrado!",
      text: `Se han añadido ${new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "COP",
      }).format(monto)} a tu presupuesto`,
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
      position: "bottom-end",
      customClass: {
        popup: "rounded-lg",
      },
    });

    // La sincronización automática ocurrirá debido al observer de localStorage
  };

  // Función para editar un ingreso extra
  const editarIngreso = (ingresoEditado) => {
    const ingresosActualizados = ingresosExtra.map((ingreso) =>
      ingreso.id === ingresoEditado.id ? ingresoEditado : ingreso
    );

    setIngresosExtra(ingresosActualizados);

    // Notificación
    Swal.fire({
      title: "¡Ingreso Actualizado!",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
      position: "bottom-end",
      customClass: {
        popup: "rounded-lg",
      },
    });

    // La sincronización automática ocurrirá debido al observer de localStorage
  };

  // Función para eliminar un ingreso extra
  const eliminarIngreso = (ingresoId) => {
    // Encontrar el ingreso para conocer su monto
    const ingresoAEliminar = ingresosExtra.find(
      (ingreso) => ingreso.id === ingresoId
    );

    if (ingresoAEliminar) {
      // Actualizar el presupuesto restando el monto del ingreso
      const nuevoPresupuesto =
        Number(presupuesto) - Number(ingresoAEliminar.monto);
      setPresupuesto(nuevoPresupuesto);

      // Filtrar el ingreso eliminado
      const ingresosActualizados = ingresosExtra.filter(
        (ingreso) => ingreso.id !== ingresoId
      );
      setIngresosExtra(ingresosActualizados);
    }

    // La sincronización automática ocurrirá debido al observer de localStorage
  };

  // Función para actualizar directamente el presupuesto total
  const actualizarPresupuestoTotal = (nuevoPresupuesto, motivo) => {
    // Registro para historial (opcional)
    const registro = {
      tipo: "cambio_presupuesto",
      presupuestoAnterior: presupuesto,
      presupuestoNuevo: nuevoPresupuesto,
      motivo: motivo || "No especificado",
      fecha: Date.now(),
    };

    // Aquí se podría guardar el registro en un historial si se desea
    console.log("Registro de cambio de presupuesto:", registro);

    // Actualizar el presupuesto
    setPresupuesto(nuevoPresupuesto);

    // La sincronización automática ocurrirá debido al observer de localStorage
  };

  const guardarEliminados = (tipo, id) => {
    // Obtener los datos actuales de "eliminados" en localStorage
    const eliminados = JSON.parse(localStorage.getItem("eliminados")) || {};

    // Si no existe el tipo, inicializarlo como un array vacío
    if (!eliminados[tipo]) {
      eliminados[tipo] = [];
    }

    // Agregar el ID al array correspondiente
    eliminados[tipo].push(id);

    // Guardar los datos actualizados en localStorage
    localStorage.setItem("eliminados", JSON.stringify(eliminados));
  };

  const editar = (gastos) => {
    setGastoEditar(gastos);
    setModal(true);
  };

  const eliminar = (gastos) => {
    Swal.fire({
      title: "¿Eliminar gasto?",
      text: "Esta acción no se puede revertir",
      icon: "warning",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      customClass: {
        popup: "rounded-lg",
        title: "text-gray-800 font-medium",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // Guardar el ID del gasto eliminado
        guardarEliminados("ObjetosGastos", gastos.id);

        // Actualizar el estado de los gastos
        const gastosActualizados = gastosState.filter(
          (item) => item.id !== gastos.id
        );
        setGastosState(gastosActualizados);

        Swal.fire({
          title: "Gasto eliminado",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          position: "bottom-end",
          customClass: {
            popup: "rounded-lg",
          },
        });

        // La sincronización automática ocurrirá debido al observer de localStorage
      }
    });
  };

  // Persistencia de datos
  useEffect(() => {
    localStorage.setItem("ObjetosGastos", JSON.stringify(gastosState));
    localStorage.setItem("PresupuestoLS", JSON.stringify(presupuesto));
    localStorage.setItem("ValidLS", JSON.stringify(isValid));
    localStorage.setItem("IngresosExtra", JSON.stringify(ingresosExtra));
  }, [gastosState, presupuesto, isValid, ingresosExtra]);

  // Efecto para filtrar gastos
  useEffect(() => {
    if (filtros !== "") {
      const gastosFiltrados = gastosState.filter(
        (element) => element.categoria === filtros
      );
      setGastosFiltrados(gastosFiltrados);
    }
  }, [filtros, gastosState]);

  // Renderización condicional basada en rutas
  return (
    <Router>
      <Routes>
        {/* Ruta de bienvenida (nueva página inicial) */}
        <Route path="/" element={<Welcome />} />

        {/* Rutas de autenticación */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AuthPages onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AuthPages onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* Dashboard y otras rutas - Ya no requieren autenticación */}
        <Route
          path="/dashboard"
          element={
            <div className="h-screen overflow-y-auto bg-gray-50 flex flex-col font-sans">
              <Header
                setIsSidebarOpen={setIsSidebarOpen}
                isSidebarOpen={isSidebarOpen}
                metas={metas}
                disponibleMensual={disponibleMensual}
                isAuthenticated={isAuthenticated}
                onLogout={logoutUser}
              />

              {isValid ? (
                <div className="flex flex-1 overflow-hidden">
                  <Sidebar
                    activeTab="dashboard"
                    setActiveTab={setActiveTab}
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    deletePresupuesto={deletePresupuesto}
                    isAuthenticated={isAuthenticated}
                    onManualSync={handleManualSync}
                  />

                  <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
                    <div className="mx-auto max-w-7xl">
                      <Dashboard
                        presupuesto={presupuesto}
                        setPresupuesto={setPresupuesto}
                        gastosState={gastosState}
                        actualizarPresupuesto={actualizarPresupuesto}
                        ingresosExtra={ingresosExtra}
                        editarIngreso={editarIngreso}
                        eliminarIngreso={eliminarIngreso}
                        setModalIngreso={setModalIngreso}
                        setModalEditar={setModalEditar}
                        actualizarPresupuestoTotal={actualizarPresupuestoTotal}
                      />
                    </div>
                  </main>
                </div>
              ) : (
                <div className="flex flex-col flex-1 items-center justify-center p-4 sm:p-6 bg-gray-50">
                  <div className="w-full max-w-md bg-white rounded-lg shadow-md p-5 sm:p-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
                      Bienvenidos
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 text-center">
                      Para comenzar, define tu presupuesto inicial
                    </p>

                    <div className="flex flex-col">
                      <label
                        htmlFor="presupuesto"
                        className="text-sm font-medium text-gray-700 mb-1"
                      >
                        Presupuesto inicial
                      </label>
                      <input
                        type="number"
                        id="presupuesto"
                        value={presupuesto}
                        onChange={(e) => setPresupuesto(Number(e.target.value))}
                        className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ingresa tu presupuesto"
                      />

                      {presupuesto < 0 && (
                        <p className="mt-2 text-xs sm:text-sm text-red-600">
                          El presupuesto debe ser un valor positivo
                        </p>
                      )}

                      <button
                        onClick={() => {
                          if (presupuesto > 0) {
                            setIsValid(true);
                            setActiveTab("dashboard");
                          }
                        }}
                        disabled={presupuesto <= 0}
                        className={`mt-4 px-4 py-2 rounded-md text-white font-medium text-sm sm:text-base ${
                          presupuesto > 0
                            ? "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Comenzar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Modales */}
              {modal && (
                <Modal
                  gastoEditar={gastoEditar}
                  setGastoEditar={setGastoEditar}
                  setModal={setModal}
                  guardarGastos={guardarGastos}
                />
              )}

              {modalIngreso && (
                <ModalIngresoExtra
                  setModalIngreso={setModalIngreso}
                  actualizarPresupuesto={actualizarPresupuesto}
                />
              )}

              {modalEditar && (
                <ModalEditarPresupuesto
                  setModalEditar={setModalEditar}
                  presupuestoActual={presupuesto}
                  actualizarPresupuestoTotal={actualizarPresupuestoTotal}
                />
              )}
            </div>
          }
        />

        {/* Las demás rutas permanecen iguales, pero ya no necesitan ProtectedRoute */}
        <Route
          path="/gastos"
          element={
            <div className="h-screen overflow-y-auto bg-gray-50 flex flex-col font-sans">
              <Header
                setIsSidebarOpen={setIsSidebarOpen}
                isSidebarOpen={isSidebarOpen}
                metas={metas}
                disponibleMensual={disponibleMensual}
                isAuthenticated={isAuthenticated}
                onLogout={logoutUser}
              />

              <div className="flex flex-1 overflow-hidden">
                <Sidebar
                  activeTab="gastos"
                  setActiveTab={setActiveTab}
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                  deletePresupuesto={deletePresupuesto}
                  isAuthenticated={isAuthenticated}
                  onManualSync={handleManualSync}
                />

                <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
                  <div className="mx-auto max-w-7xl">
                    <div className="space-y-4 sm:space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                          Administra tus gastos
                        </h2>
                        <button
                          onClick={handleNuevoGasto}
                          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center sm:justify-start"
                        >
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            ></path>
                          </svg>
                          Nuevo Gasto
                        </button>
                      </div>

                      <Filtros filtros={filtros} setFiltros={setFiltros} />

                      <ListadoGastos
                        gastosState={gastosState}
                        editar={editar}
                        eliminar={eliminar}
                        gastosFiltrados={gastosFiltrados}
                        filtros={filtros}
                      />
                    </div>
                  </div>
                </main>
              </div>

              {/* Modales */}
              {modal && (
                <Modal
                  gastoEditar={gastoEditar}
                  setGastoEditar={setGastoEditar}
                  setModal={setModal}
                  guardarGastos={guardarGastos}
                />
              )}
            </div>
          }
        />

        {/* Ruta para Categorías */}
        <Route
          path="/categorias"
          element={
            <div className="h-screen overflow-y-auto bg-gray-50 flex flex-col font-sans">
              <Header
                setIsSidebarOpen={setIsSidebarOpen}
                isSidebarOpen={isSidebarOpen}
                metas={metas}
                disponibleMensual={disponibleMensual}
                isAuthenticated={isAuthenticated}
                onLogout={logoutUser}
              />

              <div className="flex flex-1 overflow-hidden">
                <Sidebar
                  activeTab="categorias"
                  setActiveTab={setActiveTab}
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                  deletePresupuesto={deletePresupuesto}
                  isAuthenticated={isAuthenticated}
                  onManualSync={handleManualSync}
                />

                <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
                  <div className="mx-auto max-w-7xl">
                    <Categorias gastosState={gastosState} />
                  </div>
                </main>
              </div>
            </div>
          }
        />

        {/* Ruta para Reportes */}
        <Route
          path="/reportes"
          element={
            <div className="h-screen overflow-y-auto bg-gray-50 flex flex-col font-sans">
              <Header
                setIsSidebarOpen={setIsSidebarOpen}
                isSidebarOpen={isSidebarOpen}
                metas={metas}
                disponibleMensual={disponibleMensual}
                isAuthenticated={isAuthenticated}
                onLogout={logoutUser}
              />

              <div className="flex flex-1 overflow-hidden">
                <Sidebar
                  activeTab="reportes"
                  setActiveTab={setActiveTab}
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                  deletePresupuesto={deletePresupuesto}
                  isAuthenticated={isAuthenticated}
                  onManualSync={handleManualSync}
                />

                <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
                  <div className="mx-auto max-w-7xl">
                    <Reportes
                      gastosState={gastosState}
                      presupuesto={presupuesto}
                      ingresosExtra={ingresosExtra}
                    />
                  </div>
                </main>
              </div>
            </div>
          }
        />

        {/* Ruta para Metas de Ahorro */}
        <Route
          path="/metas"
          element={
            <div className="h-screen overflow-y-auto bg-gray-50 flex flex-col font-sans">
              <Header
                setIsSidebarOpen={setIsSidebarOpen}
                isSidebarOpen={isSidebarOpen}
                metas={metas}
                disponibleMensual={disponibleMensual}
                isAuthenticated={isAuthenticated}
                onLogout={logoutUser}
              />

              <div className="flex flex-1 overflow-hidden">
                <Sidebar
                  activeTab="metas"
                  setActiveTab={setActiveTab}
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                  deletePresupuesto={deletePresupuesto}
                  isAuthenticated={isAuthenticated}
                  onManualSync={handleManualSync}
                />

                <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
                  <div className="mx-auto max-w-7xl">
                    <MetasAhorro
                      presupuesto={presupuesto}
                      gastosState={gastosState}
                      ingresosExtra={ingresosExtra}
                    />
                  </div>
                </main>
              </div>
            </div>
          }
        />

        {/* Ruta para Gestión de Ahorro */}
        <Route
          path="/gestion-ahorro"
          element={
            <div className="h-screen overflow-y-auto bg-gray-50 flex flex-col font-sans">
              <Header
                setIsSidebarOpen={setIsSidebarOpen}
                isSidebarOpen={isSidebarOpen}
                metas={metas}
                disponibleMensual={disponibleMensual}
                isAuthenticated={isAuthenticated}
                onLogout={logoutUser}
              />

              <div className="flex flex-1 overflow-hidden">
                <Sidebar
                  activeTab="gestion-ahorro"
                  setActiveTab={setActiveTab}
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                  deletePresupuesto={deletePresupuesto}
                  isAuthenticated={isAuthenticated}
                  onManualSync={handleManualSync}
                />

                <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
                  <div className="mx-auto max-w-7xl">
                    <GestionAhorro
                      presupuesto={presupuesto}
                      gastosState={gastosState}
                      ingresosExtra={ingresosExtra}
                      setGastosState={setGastosState}
                      setIngresosExtra={setIngresosExtra}
                    />
                  </div>
                </main>
              </div>
            </div>
          }
        />

        {/* Ruta para Recordatorios */}
        <Route
          path="/recordatorios"
          element={
            <div className="h-screen overflow-y-auto bg-gray-50 flex flex-col font-sans">
              <Header
                setIsSidebarOpen={setIsSidebarOpen}
                isSidebarOpen={isSidebarOpen}
                metas={metas}
                disponibleMensual={disponibleMensual}
                isAuthenticated={isAuthenticated}
                onLogout={logoutUser}
              />

              <div className="flex flex-1 overflow-hidden">
                <Sidebar
                  activeTab="recordatorios"
                  setActiveTab={setActiveTab}
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                  deletePresupuesto={deletePresupuesto}
                  isAuthenticated={isAuthenticated}
                  onManualSync={handleManualSync}
                />

                <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
                  <div className="mx-auto max-w-7xl">
                    <Recordatorios
                      guardarGastos={guardarGastos}
                      gastosState={gastosState}
                      setGastosState={setGastosState}
                    />
                  </div>
                </main>
              </div>
            </div>
          }
        />

        <Route
          path="/gestion-datos"
          element={
            <div className="h-screen overflow-y-auto bg-gray-50 flex flex-col font-sans">
              <Header
                setIsSidebarOpen={setIsSidebarOpen}
                isSidebarOpen={isSidebarOpen}
                metas={metas}
                disponibleMensual={disponibleMensual}
                isAuthenticated={isAuthenticated}
                onLogout={logoutUser}
              />

              <div className="flex flex-1 overflow-hidden">
                <Sidebar
                  activeTab="gestion-datos"
                  setActiveTab={setActiveTab}
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                  deletePresupuesto={deletePresupuesto}
                  isAuthenticated={isAuthenticated}
                  onManualSync={handleManualSync}
                />

                <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
                  <div className="mx-auto max-w-7xl">
                    <DataManagement
                      onSyncData={handleManualSync}
                    />
                  </div>
                </main>
              </div>
            </div>
          }
        />

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
