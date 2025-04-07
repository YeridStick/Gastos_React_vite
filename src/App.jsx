import { useEffect, useState } from "react";
import Swal from "sweetalert2";

// Componentes
import Header from "./components/Header";
import Sidebar from "./components/Sidebar.jsx";

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

// Funciones
import { generarID } from "./helpers/index";

function App() {
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
        localStorage.clear());
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
        // Verificar si es un gasto de ahorro
        const esGastoAhorro = gastos.categoria === "Ahorro";
        let nombreMeta = null;
        
        // Si es un gasto de ahorro, extraer el nombre de la meta
        if (esGastoAhorro) {
          const nombreMetaMatch = gastos.nombreG.match(/Ahorro: (.*)/);
          if (nombreMetaMatch && nombreMetaMatch[1]) {
            nombreMeta = nombreMetaMatch[1];
          }
        }
        
        const gastosActualizados = gastosState.filter(
          (item) => item.id !== gastos.id
        );
        setGastosState(gastosActualizados);
        
        // Si era un gasto de ahorro, actualizar la meta correspondiente
        if (esGastoAhorro && nombreMeta) {
          // Obtener las metas de ahorro actuales
          const metasAhorroActuales = JSON.parse(localStorage.getItem('MetasAhorro')) || [];
          
          // Buscar la meta correspondiente
          const metasActualizadas = metasAhorroActuales.map(meta => {
            if (meta.nombre === nombreMeta) {
              // Recalcular el ahorro acumulado basado en los gastos restantes
              const gastosRelacionados = gastosActualizados.filter(
                gasto => gasto.categoria === "Ahorro" && gasto.nombreG === `Ahorro: ${nombreMeta}`
              );
              
              const nuevoAhorroAcumulado = gastosRelacionados.reduce(
                (total, gasto) => total + gasto.gasto, 0
              );
              
              const completada = nuevoAhorroAcumulado >= meta.monto;
              
              return {
                ...meta,
                ahorroAcumulado: completada ? meta.monto : nuevoAhorroAcumulado,
                completada
              };
            }
            return meta;
          });
          
          // Guardar las metas actualizadas en localStorage
          localStorage.setItem('MetasAhorro', JSON.stringify(metasActualizadas));
        }
  
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Barra superior */}
      <Header
        setIsSidebarOpen={setIsSidebarOpen}
        isSidebarOpen={isSidebarOpen}
        metas={metas}
        disponibleMensual={disponibleMensual}
      />

      {isValid ? (
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar para navegación */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            deletePresupuesto={deletePresupuesto}
          />

          {/* Contenido principal */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="mx-auto max-w-7xl">
              {" "}
              {/* Contenedor con ancho máximo */}
              {activeTab === "dashboard" && (
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
              )}
              {activeTab === "gastos" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-gray-800">
                      Administra tus gastos
                    </h2>
                    <button
                      onClick={handleNuevoGasto}
                      className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
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
              )}
              {activeTab === "categorias" && (
                <Categorias gastosState={gastosState} />
              )}
              {activeTab === "metas" && (
                <MetasAhorro
                  presupuesto={presupuesto}
                  gastosState={gastosState}
                  ingresosExtra={ingresosExtra}
                />
              )}
              {activeTab === "gestionAhorro" && (
                <GestionAhorro
                  presupuesto={presupuesto}
                  gastosState={gastosState}
                  ingresosExtra={ingresosExtra}
                  setGastosState={setGastosState}
                  setIngresosExtra={setIngresosExtra}
                />
              )}
              {activeTab === "reportes" && (
                <Reportes
                  gastosState={gastosState}
                  presupuesto={presupuesto}
                  ingresosExtra={ingresosExtra}
                />
              )}
            </div>
          </main>

          {/* Botón flotante para móviles */}
          <div className="md:hidden">
            <button
              onClick={handleNuevoGasto}
              className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="w-6 h-6"
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
            </button>
          </div>
        </div>
      ) : (
        // Componente de inicio para establecer presupuesto
        <div className="flex flex-col flex-1 items-center justify-center p-6 bg-gray-50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Bienvenidos
            </h2>
            <p className="text-gray-600 mb-6 text-center">
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
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingresa tu presupuesto"
              />

              {presupuesto < 0 && (
                <p className="mt-2 text-sm text-red-600">
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
                className={`mt-4 px-4 py-2 rounded-md text-white font-medium ${
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
  );
}

export default App;
