import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import PropTypes from 'prop-types';
import Swal from "sweetalert2";

// Componentes
import Header from "./components/Header";
import { Sidebar } from "./components/sidebar";
import AuthPages from "./pages/AuthPages";
import Welcome from "./pages/Welcome.jsx";
import Dashboard from "./pages/Dashboard";
import ListadoGastos from "./pages/gastos/ListadoGastos";
import Filtros from "./components/Filtros";
import Categorias from "./pages/gastos/NuevaCategoria";
import Reportes from "./pages/Reportes";
import MetasAhorro from "./pages/MetasAhorro";
import GestionAhorro from "./pages/GestionAhorro";
import Recordatorios from "./pages/Recordatorios";
import DataManagement from "./pages/DataManagement.jsx";

// Modales
import Modal from "./components/Modal/General/Modal";
import ModalIngresoExtra from "./components/Modal/ModalIngresoExtra";
import ModalEditarPresupuesto from "./components/Modal/ModalEditarPresupuesto";

// Servicios
import {
  syncDataToServer,
  setupSyncObserver,
  handleLogout,
  setupSessionConflictDetection,
} from "../src/services/syncService.jsx"

// Funciones
import { generarID } from "./helpers/index";
import PresupuestoSetup from "./components/Modal/presupuesto/PresupuestoSetup.jsx";

// Hook personalizado para localStorage
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

// Layout común para todas las rutas de la aplicación
function AppLayout({
  isAuthenticated,
  logoutUser,
  handleManualSync,
  metas,
  disponibleMensual,
  deletePresupuesto,
  isSidebarOpen,
  setIsSidebarOpen,
  activeTab,
  setActiveTab,
}) {
  const location = useLocation();
  const currentRoute = location.pathname.split("/")[1] || "dashboard";

  useEffect(() => {
    setActiveTab(currentRoute);
  }, [currentRoute, setActiveTab]);

  return (
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
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          deletePresupuesto={deletePresupuesto}
          isAuthenticated={isAuthenticated}
          onManualSync={handleManualSync}
        />

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

AppLayout.propTypes = {
  isAuthenticated: PropTypes.bool,
  logoutUser: PropTypes.func,
  handleManualSync: PropTypes.func,
  metas: PropTypes.array,
  disponibleMensual: PropTypes.number,
  deletePresupuesto: PropTypes.func,
  isSidebarOpen: PropTypes.bool,
  setIsSidebarOpen: PropTypes.func,
  activeTab: PropTypes.string,
  setActiveTab: PropTypes.func,
};

// Componente principal de la aplicación
function App() {
  // Estado de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Estados principales con hook personalizado
  const [presupuesto, setPresupuesto] = useLocalStorage("PresupuestoLS", "");
  const [isValid, setIsValid] = useLocalStorage("ValidLS", false);
  const [gastosState, setGastosState] = useLocalStorage("ObjetosGastos", []);
  const [ingresosExtra, setIngresosExtra] = useLocalStorage(
    "IngresosExtra",
    []
  );
  const [metas, setMetas] = useLocalStorage("MetasAhorro", []);

  // Estados para modales
  const [modal, setModal] = useState(false);
  const [modalIngreso, setModalIngreso] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [gastoEditar, setGastoEditar] = useState({});

  // Estados para navegación y filtros
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filtros, setFiltros] = useState("");
  const [gastosFiltrados, setGastosFiltrados] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [disponibleMensual, setDisponibleMensual] = useState(0);

  // Efecto para detectar conflictos de sesión
  useEffect(() => {
    const cleanupConflictDetection = setupSessionConflictDetection();
    return () => {
      cleanupConflictDetection();
    };
  }, []);

  // Verificar autenticación al cargar
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
    if (presupuesto <= 0) return;

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
      const disponible = presupuesto - promedioGastosMensual;
      setDisponibleMensual(disponible);
    } else {
      // Si no hay gastos registrados, todo el presupuesto está disponible
      setDisponibleMensual(presupuesto);
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

  // Efecto para filtrar gastos
  useEffect(() => {
    if (filtros !== "") {
      const gastosFiltrados = gastosState.filter(
        (element) => element.categoria === filtros
      );
      setGastosFiltrados(gastosFiltrados);
    }
  }, [filtros, gastosState]);

  // Funciones de sincronización
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
    setPresupuesto(JSON.parse(localStorage.getItem("PresupuestoLS")) ?? "");
    setIsValid(JSON.parse(localStorage.getItem("ValidLS")) ?? false);
    setGastosState(JSON.parse(localStorage.getItem("ObjetosGastos")) ?? []);
    setIngresosExtra(JSON.parse(localStorage.getItem("IngresosExtra")) ?? []);
    setMetas(JSON.parse(localStorage.getItem("MetasAhorro")) ?? []);
    setActiveTab("dashboard");

    console.log("Estados actualizados después de inicio de sesión exitoso");
  };

  const limpiarGastosHuerfanos = () => {
    // Obtener el registro de elementos eliminados
    const eliminados = JSON.parse(localStorage.getItem("eliminados") || "{}");
    const metasEliminadas = eliminados.MetasAhorro || [];

    // Si no hay metas eliminadas, no hay nada que limpiar
    if (metasEliminadas.length === 0) {
      return false;
    }

    // Obtener los gastos actuales
    const gastos = JSON.parse(localStorage.getItem("ObjetosGastos") || "[]");
    const metas = JSON.parse(localStorage.getItem("MetasAhorro") || "[]");

    // Filtrar los gastos para eliminar aquellos que pertenecen a metas eliminadas
    const gastosActualizados = gastos.filter((gasto) => {
      // Si no es un gasto de ahorro, mantenerlo
      if (!gasto || gasto.categoria !== "Ahorro") {
        return true;
      }

      // Si tiene metaId y ese ID está en la lista de metas eliminadas, eliminarlo
      if (gasto.metaId && metasEliminadas.includes(gasto.metaId)) {
        console.log(
          `Limpieza: Eliminando gasto huérfano ${gasto.id} (meta eliminada ${gasto.metaId})`
        );
        return false;
      }

      // Si tiene un nombre de meta pero no existe meta activa con ese nombre, verificar
      if (!gasto.metaId) {
        const nombreMetaMatch = gasto.nombreG.match(/Ahorro: (.*)/);
        if (nombreMetaMatch && nombreMetaMatch[1]) {
          const nombreMeta = nombreMetaMatch[1];

          // Verificar si existe una meta activa con ese nombre
          const metaExistente = metas.find((m) => m.nombre === nombreMeta);

          if (!metaExistente) {
            console.log(
              `Limpieza: Eliminando gasto huérfano ${gasto.id} (no existe meta "${nombreMeta}")`
            );
            return false;
          }

          // Asignar el ID de la meta existente al gasto
          gasto.metaId = metaExistente.id;
        }
      }

      return true;
    });

    // Si se eliminaron gastos, actualizar el almacenamiento
    if (gastosActualizados.length !== gastos.length) {
      console.log(
        `Limpieza: Se eliminaron ${
          gastos.length - gastosActualizados.length
        } gastos huérfanos`
      );
      localStorage.setItem("ObjetosGastos", JSON.stringify(gastosActualizados));
      return true; // Indicar que se realizaron cambios
    }

    return false; // Indicar que no se realizaron cambios
  };
  // Añadir esta llamada en useEffect de App.jsx
  useEffect(() => {
    // Limpiar gastos huérfanos al iniciar la aplicación
    const cambiosRealizados = limpiarGastosHuerfanos();
    if (cambiosRealizados) {
      // Recargar los gastos desde localStorage
      setGastosState(JSON.parse(localStorage.getItem("ObjetosGastos") || "[]"));
    }
  }, []);

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

  // Funciones para el manejo de presupuesto y gastos
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
      if (result.isConfirmed) {
        setPresupuesto("");
        setIsValid(false);
        setModal(false);
        setGastosState([]);
        setGastoEditar({});
        setIngresosExtra([]);
        setMetas([]);

        // Limpiar localStorage
        localStorage.removeItem("ObjetosGastos");
        localStorage.removeItem("PresupuestoLS");
        localStorage.removeItem("ValidLS");
        localStorage.removeItem("IngresosExtra");
        localStorage.removeItem("MetasAhorro");
        localStorage.removeItem("categorias");
        localStorage.removeItem("recordatorios");

        // Sincronizar con servidor para reflejar los cambios
        syncDataToServer();
      }
    });
  };

  const handleNuevoGasto = () => {
    setGastoEditar({}); // Limpiar el estado de edición
    setModal(true);
  };

  // En App.js - Función guardarGastos
  const guardarGastos = (cantidadGasto) => {
    if (gastoEditar.id) {
      // Conservar solo el ID del gasto a editar
      cantidadGasto.id = gastoEditar.id;

      // Verificar y depurar el problema de fecha
      console.log(
        "Fecha recibida del modal:",
        new Date(cantidadGasto.fecha).toLocaleString()
      );

      if (gastoEditar.fecha) {
        console.log(
          "Fecha original del gasto:",
          new Date(gastoEditar.fecha).toLocaleString()
        );
      }

      const update = gastosState.map((element) => {
        if (element.id === cantidadGasto.id) {
          return cantidadGasto;
        } else {
          return element;
        }
      });

      console.log(
        "Gasto actualizado:",
        update.find((g) => g.id === cantidadGasto.id)
      );
      setGastosState(update);

      // Verificar que el localStorage se actualiza correctamente
      setTimeout(() => {
        const gastosEnStorage = JSON.parse(
          localStorage.getItem("ObjetosGastos")
        );
        console.log(
          "Gasto en localStorage:",
          gastosEnStorage.find((g) => g.id === cantidadGasto.id)
        );
      }, 100);
    } else {
      // Lógica para nuevo gasto - CORREGIDO
      cantidadGasto.id = generarID();

      // Usar la fecha del modal si existe, o asignar la fecha actual si no
      if (!cantidadGasto.fecha) {
        cantidadGasto.fecha = new Date().toISOString();
      }

      console.log("Nuevo gasto creado:", cantidadGasto);
      setGastosState([cantidadGasto, ...gastosState]);

      // Verificar que el gasto se guardó correctamente
      setTimeout(() => {
        const gastosEnStorage = JSON.parse(
          localStorage.getItem("ObjetosGastos")
        );
        console.log(
          "Nuevo gasto en localStorage:",
          gastosEnStorage.find((g) => g.id === cantidadGasto.id)
        );
      }, 100);
    }
  };

  // Función para agregar ingresos extras
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
    console.log("Editando gasto:", gastos); // Para depuración
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
      }
    });
  };

  // Definición de rutas y sus componentes
  const routes = [
    {
      path: "/dashboard",
      element: (
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
      ),
    },
    {
      path: "/gastos",
      element: (
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
            setGastoEditar={setGastoEditar}
            editar={editar}
            eliminar={eliminar}
            gastosFiltrados={gastosFiltrados}
            filtros={filtros}
            modal={modal}
          />
        </div>
      ),
    },
    {
      path: "/categorias",
      element: <Categorias gastosState={gastosState} />,
    },
    {
      path: "/reportes",
      element: (
        <Reportes
          gastosState={gastosState}
          presupuesto={presupuesto}
          ingresosExtra={ingresosExtra}
        />
      ),
    },
    {
      path: "/metas",
      element: (
        <MetasAhorro
          presupuesto={presupuesto}
          gastosState={gastosState}
          setGastosState={setGastosState}
          ingresosExtra={ingresosExtra}
        />
      ),
    },
    {
      path: "/gestion-ahorro",
      element: (
        <GestionAhorro
          presupuesto={presupuesto}
          gastosState={gastosState}
          ingresosExtra={ingresosExtra}
          setGastosState={setGastosState}
          setIngresosExtra={setIngresosExtra}
        />
      ),
    },
    {
      path: "/recordatorios",
      element: (
        <Recordatorios
          guardarGastos={guardarGastos}
          gastosState={gastosState}
          setGastosState={setGastosState}
        />
      ),
    },
    {
      path: "/gestion-datos",
      element: <DataManagement onSyncData={handleManualSync} />,
    },
  ];

  return (
    <Router>
      <Routes>
        {/* Ruta de bienvenida */}
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

        {/* Layout común para todas las rutas protegidas */}
        <Route
          element={
            isValid ? (
              <AppLayout
                presupuesto={presupuesto}
                isAuthenticated={isAuthenticated}
                logoutUser={logoutUser}
                handleManualSync={handleManualSync}
                metas={metas}
                disponibleMensual={disponibleMensual}
                deletePresupuesto={deletePresupuesto}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            ) : (
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
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    deletePresupuesto={deletePresupuesto}
                    isAuthenticated={isAuthenticated}
                    onManualSync={handleManualSync}
                  />

                  <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
                  <PresupuestoSetup
                        presupuesto={presupuesto}
                        setPresupuesto={setPresupuesto}
                        setIsValid={setIsValid}
                        setActiveTab={setActiveTab}
                      />
                  </main>
                </div>
              </div>
            )
          }
        >
          {/* Rutas anidadas que comparten el mismo layout */}
          {routes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Modales (centralizados) */}
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
    </Router>
  );
}

export default App;