import { useEffect, useState, useRef } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { cantidad } from "../helpers/index";
import Swal from "sweetalert2";

// Importación de iconos para el dashboard
import IconoAhorro from "../assets/img/icono_ahorro.svg";
import IconoCasa from "../assets/img/icono_casa.svg";
import IconoComida from "../assets/img/icono_comida.svg";
import IconoGasto from "../assets/img/icono_gastos.svg";
import IconoOcio from "../assets/img/icono_ocio.svg";
import IconoSalud from "../assets/img/icono_salud.svg";
import IconoEducacion from "../assets/img/icono_suscripciones.svg";
import HistorialEliminados from "../components/HistorialEliminados";

// Componente para mostrar tarjetas en el Dashboard
const DashboardCard = ({ title, amount, color, icon, trend, percentage }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-3 sm:p-5">
        <div className="flex items-center justify-between flex-wrap gap-1">
          <h2 className="text-base sm:text-lg font-medium text-gray-900">{title}</h2>
          {trend && (
            <span
              className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${
                trend === "up"
                  ? "bg-green-100 text-green-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {trend === "up" ? "+" : "-"}
              {percentage}% vs anterior
            </span>
          )}
        </div>
        <div className="mt-2 sm:mt-4 flex items-center">
          {icon && <img src={icon} alt={title} className="h-8 w-8 sm:h-10 sm:w-10 mr-2 sm:mr-3" />}
          <span className="text-xl sm:text-3xl font-bold text-gray-900 truncate">{amount}</span>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard({
  presupuesto,
  setPresupuesto,
  gastosState,
  actualizarPresupuesto,
  ingresosExtra = [],
  editarIngreso,
  eliminarIngreso,
  setModalIngreso,
  setModalEditar,
  actualizarPresupuestoTotal
}) {
  const [disponible, setDisponible] = useState(0);
  const [gastado, setGastado] = useState(0);
  const [porcentaje, setPorcentaje] = useState(0);
  const [gastosPorCategoria, setGastosPorCategoria] = useState({});
  const [categoriasInfo, setCategoriasInfo] = useState({});
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [actividadReciente, setActividadReciente] = useState([]);
  const menuRef = useRef(null);

  // Cerrar el menú al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMostrarMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cargar categorías desde localStorage
  useEffect(() => {
    try {
      const categoriasGuardadas = localStorage.getItem("categorias");

      if (categoriasGuardadas) {
        const categorias = JSON.parse(categoriasGuardadas);

        // Crear un objeto con información de cada categoría
        const infoObj = {};
        categorias.forEach((cat) => {
          infoObj[cat.id] = {
            nombre: cat.nombre,
            color: cat.color || "bg-gray-100 text-gray-800",
            icono: getIconoPorCategoria(cat.id),
          };
        });

        setCategoriasInfo(infoObj);
      }
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  }, []);

  // Función para obtener el icono basado en el ID de la categoría
  const getIconoPorCategoria = (categoriaId) => {
    switch (categoriaId) {
      case "Ahorro":
        return IconoAhorro;
      case "Comida":
        return IconoComida;
      case "Casa":
        return IconoCasa;
      case "Ocio":
        return IconoOcio;
      case "Salud":
        return IconoSalud;
      case "Educacion":
        return IconoEducacion;
      default:
        return IconoGasto;
    }
  };

  // Combinar gastos e ingresos en actividad reciente
  useEffect(() => {
    // Convertir gastos al formato de actividad
    const gastosFormateados = gastosState.map((gasto) => ({
      id: gasto.id,
      tipo: "gasto",
      nombre: gasto.nombreG,
      categoria: gasto.categoria,
      monto: gasto.gasto,
      fecha: gasto.fecha,
    }));

    // Convertir ingresos al formato de actividad
    const ingresosFormateados = ingresosExtra.map((ingreso) => ({
      id: ingreso.id,
      tipo: "ingreso",
      nombre: ingreso.descripcion || "Ingreso adicional",
      categoria: "Ingreso",
      monto: ingreso.monto,
      fecha: ingreso.fecha,
    }));

    // Combinar y ordenar por fecha (más reciente primero)
    const todasActividades = [...gastosFormateados, ...ingresosFormateados]
      .sort((a, b) => b.fecha - a.fecha)
      .slice(0, 8); // Mostrar solo las 8 actividades más recientes

    setActividadReciente(todasActividades);
  }, [gastosState, ingresosExtra]);

  // Calcular datos del dashboard
  useEffect(() => {
    const calcularTotales = () => {
      const sumaGasto = gastosState.reduce(
        (total, gasto) => gasto.gasto + total,
        0
      );
      const totalDisponible = presupuesto - sumaGasto;

      // Calcular porcentaje de presupuesto usado
      const nuevoPorcentaje =
        presupuesto > 0
          ? Math.min(100, Math.round((sumaGasto * 100) / presupuesto))
          : 0;

      // Agrupar gastos por categoría
      const categorias = {};
      gastosState.forEach((gasto) => {
        if (categorias[gasto.categoria]) {
          categorias[gasto.categoria] += gasto.gasto;
        } else {
          categorias[gasto.categoria] = gasto.gasto;
        }
      });

      // Actualizar estados
      setDisponible(totalDisponible);
      setGastado(sumaGasto);
      setPorcentaje(nuevoPorcentaje);
      setGastosPorCategoria(categorias);
    };

    calcularTotales();
  }, [gastosState, presupuesto]);

  // Determinar el color del gráfico según disponibilidad
  const getProgressBarColor = () => {
    if (porcentaje < 50) return "#3b82f6"; // Azul para menos del 50%
    if (porcentaje < 75) return "#eab308"; // Amarillo para menos del 75%
    return "#ef4444"; // Rojo para 75% o más
  };

  // Calcular fecha para tarjeta
  const obtenerMesActual = () => {
    const meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    const fecha = new Date();
    return `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
  };

  // Abrir modal para agregar ingreso
  const handleAgregarIngreso = () => {
    setModalIngreso(true);
  };

  // Confirmar eliminación de ingreso
  const handleEliminarIngreso = (ingreso) => {
    Swal.fire({
      title: '¿Eliminar ingreso?',
      text: `¿Estás seguro que deseas eliminar este ingreso de ${cantidad(ingreso.monto)}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        eliminarIngreso(ingreso.id);
        
        Swal.fire({
          title: 'Ingreso eliminado',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  // Formatear fecha
  const formatearFecha = (fechaTimestamp) => {
    const fecha = new Date(fechaTimestamp);
    return `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Encabezado del Dashboard con menú de opciones */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Dashboard</h2>
          
          {/* Menú de opciones avanzadas */}
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setMostrarMenu(!mostrarMenu)}
              className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Opciones avanzadas"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            
            {/* Menú desplegable */}
            {mostrarMenu && (
              <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white z-10 ring-1 ring-black ring-opacity-5">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <button
                    onClick={() => {
                      setMostrarMenu(false);
                      setModalEditar(true);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    Modificar presupuesto total
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleAgregarIngreso}
            className="px-2 py-1 sm:px-3 sm:py-1.5 bg-green-600 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center"
          >
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 mr-1"
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
            Agregar Ingreso
          </button>
          <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm font-medium">
            {obtenerMesActual()}
          </span>
        </div>
      </div>

      {/* Tarjetas de información resumida */}
      <div className="grid grid-cols-1 gap-3 sm:gap-6">
        <DashboardCard
          title="Presupuesto Total"
          amount={cantidad(presupuesto)}
          color="blue"
        />
        <DashboardCard
          title="Disponible"
          amount={cantidad(disponible)}
          color={disponible >= 0 ? "green" : "red"}
        />
        <DashboardCard
          title="Gastado"
          amount={cantidad(gastado)}
          color="gray"
          trend="down"
          percentage="12"
        />
      </div>

      {/* Gráfico de progreso y detalles */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
            Progreso del Presupuesto
          </h2>
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            <div className="w-32 h-32 sm:w-40 sm:h-40">
              <CircularProgressbar
                value={porcentaje}
                text={`${porcentaje}%`}
                styles={buildStyles({
                  pathColor: getProgressBarColor(),
                  textColor: "#1f2937",
                  trailColor: "#f3f4f6",
                })}
              />
            </div>
            <div className="w-full">
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div>
                  <div className="flex items-center mb-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700">
                      Presupuesto Total
                    </span>
                  </div>
                  <p className="ml-5 text-base sm:text-lg font-semibold text-gray-900">
                    {cantidad(presupuesto)}
                  </p>
                </div>

                <div>
                  <div className="flex items-center mb-1">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700">
                      Disponible
                    </span>
                  </div>
                  <p className="ml-5 text-base sm:text-lg font-semibold text-gray-900">
                    {cantidad(disponible)}
                  </p>
                </div>

                <div>
                  <div className="flex items-center mb-1">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700">
                      Gastado
                    </span>
                  </div>
                  <p className="ml-5 text-base sm:text-lg font-semibold text-gray-900">
                    {cantidad(gastado)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gastos por categoría */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-medium text-gray-900">
              Gastos por Categoría
            </h2>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {Object.keys(gastosPorCategoria).length > 0 ? (
              Object.entries(gastosPorCategoria).map(([categoriaId, monto]) => {
                // Obtener información de la categoría
                const info = categoriasInfo[categoriaId] || {
                  nombre: categoriaId,
                  icono: IconoGasto,
                  color: "bg-blue-100",
                };

                // Color para la barra de progreso
                const barColor = info.color?.split(" ")[0] || "bg-blue-600";

                return (
                  <div
                    key={categoriaId}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center min-w-0">
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${
                          info.color?.split(" ")[0] || "bg-blue-100"
                        } flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0`}
                      >
                        <img
                          src={info.icono}
                          alt={info.nombre}
                          className="w-4 h-4 sm:w-6 sm:h-6"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                          {info.nombre || categoriaId}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className={`${barColor} h-1.5 rounded-full`}
                            style={{ width: `${(monto / gastado) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 ml-2 flex-shrink-0">
                      {cantidad(monto)}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-4 text-sm">
                No hay gastos registrados aún
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Historial de ingresos extra con botones de acción */}
      {ingresosExtra.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-medium text-gray-900">
              Ingresos Adicionales
            </h2>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Descripción
                      </th>
                      <th
                        scope="col"
                        className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Fecha
                      </th>
                      <th
                        scope="col"
                        className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Monto
                      </th>
                      <th
                        scope="col"
                        className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ingresosExtra.map((ingreso) => {
                      // Formatear fecha
                      const formatoFecha = formatearFecha(ingreso.fecha);

                      return (
                        <tr key={ingreso.id} className="hover:bg-gray-50">
                          <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                            <div className="truncate max-w-32">
                              {ingreso.descripcion || "Ingreso adicional"}
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            {formatoFecha}
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-right text-green-600">
                            +{cantidad(ingreso.monto)}
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right">
                            <div className="flex justify-end">
                              <button
                                onClick={() => handleEliminarIngreso(ingreso)}
                                className="text-red-600 hover:text-red-900 transition-colors focus:outline-none"
                              >
                                <svg 
                                  className="h-4 w-4 sm:h-5 sm:w-5" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth="2" 
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actividad Reciente (Gastos e Ingresos) - Versión Adaptativa */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg font-medium text-gray-900">
            Actividad Reciente
          </h2>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault(); /* Navegar a actividad */
            }}
            className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Ver toda
          </a>
        </div>

        {actividadReciente.length > 0 ? (
          <div className="grid gap-3 sm:gap-4 grid-cols-1">
            {actividadReciente.map((actividad) => {
              const formatoFecha = formatearFecha(actividad.fecha);
              const esIngreso = actividad.tipo === "ingreso";
              const categoryColor = esIngreso
                ? "bg-green-100 text-green-800"
                : categoriasInfo[actividad.categoria]?.color ||
                  "bg-blue-100 text-blue-800";

              return (
                <div
                  key={`${actividad.tipo}-${actividad.id}`}
                  className="bg-white border border-gray-200 rounded-lg p-2 sm:p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-1 sm:gap-2">
                    {/* Tipo e información */}
                    <div className="flex-grow min-w-0">
                      <div className="flex flex-wrap gap-1 sm:gap-2 mb-1 sm:mb-2">
                        <span
                          className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${
                            esIngreso
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {esIngreso ? "Ingreso" : "Gasto"}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${categoryColor}`}
                        >
                          <span className="block truncate max-w-16 sm:max-w-full">
                            {actividad.categoria}
                          </span>
                        </span>
                      </div>

                      <div className="mt-1 font-medium text-gray-900 text-xs sm:text-sm truncate">
                        {actividad.nombre}
                      </div>

                      <div className="mt-0.5 text-xs text-gray-500">
                        {formatoFecha}
                      </div>
                    </div>

                    {/* Monto */}
                    <div className="flex-shrink-0 text-right">
                      <span
                        className={`font-medium text-xs sm:text-sm ${
                          esIngreso ? "text-green-600" : "text-gray-900"
                        }`}
                      >
                        {esIngreso ? "+" : ""}
                        {cantidad(actividad.monto)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4 text-xs sm:text-sm">
            No hay actividad registrada aún
          </p>
        )}
      </div>
       {/* Historial de elementos eliminados */}
       <HistorialEliminados />
    </div>
  );
}