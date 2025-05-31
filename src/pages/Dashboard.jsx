import { useEffect, useState, useRef } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { cantidad } from "../helpers/index";
import Swal from "sweetalert2";
import PropTypes from "prop-types";

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
const DashboardCard = ({ title, amount, icon, trend, percentage }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base sm:text-lg font-medium text-gray-700">{title}</h2>
        {trend && (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              trend === "up"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {trend === "up" ? "+" : "-"}
            {percentage}%
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-2 bg-gray-50 rounded-lg">
            <img src={icon} alt={title} className="h-6 w-6 sm:h-8 sm:w-8" />
          </div>
        )}
        <span className="text-xl sm:text-2xl font-bold text-gray-900">{amount}</span>
      </div>
    </div>
  );
};

DashboardCard.propTypes = {
  title: PropTypes.string.isRequired,
  amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.string,
  icon: PropTypes.string,
  trend: PropTypes.string,
  percentage: PropTypes.number,
};

// Componente para selector de mes
const MonthSelector = ({ currentDate, onChange }) => {
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Generar años desde el año actual hacia atrás (hasta 3 años atrás)
  const years = [];
  const thisYear = new Date().getFullYear();
  for (let i = 0; i < 4; i++) {
    years.push(thisYear - i);
  }
  
  const handleMonthChange = (e) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(parseInt(e.target.value));
    onChange(newDate);
  };
  
  const handleYearChange = (e) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(parseInt(e.target.value));
    onChange(newDate);
  };
  
  return (
    <div className="flex items-center space-x-2">
      <select 
        value={currentMonth} 
        onChange={handleMonthChange}
        className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        {meses.map((mes, index) => (
          <option key={index} value={index}>
            {mes}
          </option>
        ))}
      </select>
      <select 
        value={currentYear} 
        onChange={handleYearChange}
        className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        {years.map(year => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
      <button 
        onClick={() => onChange(new Date())}
        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
        title="Ir al mes actual"
      >
        Hoy
      </button>
    </div>
  );
};

MonthSelector.propTypes = {
  currentDate: PropTypes.instanceOf(Date).isRequired,
  onChange: PropTypes.func.isRequired,
};

// Componente para cambiar entre vistas (mensual, total)
const ViewToggle = ({ currentView, onChange }) => {
  return (
    <div className="inline-flex rounded-md shadow-sm">
      <button
        type="button"
        onClick={() => onChange('monthly')}
        className={`relative inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-l-md focus:z-10 focus:outline-none ${
          currentView === 'monthly' 
            ? 'bg-blue-600 text-white' 
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        Mes actual
      </button>
      <button
        type="button"
        onClick={() => onChange('total')}
        className={`relative inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-r-md focus:z-10 focus:outline-none ${
          currentView === 'total' 
            ? 'bg-blue-600 text-white' 
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        Vista global
      </button>
    </div>
  );
};

ViewToggle.propTypes = {
  currentView: PropTypes.oneOf(['monthly', 'total']).isRequired,
  onChange: PropTypes.func.isRequired
};

export default function Dashboard({
  presupuesto,
  // eslint-disable-next-line no-unused-vars
  setPresupuesto,
  gastosState,
  ingresosExtra = [],
  eliminarIngreso,
  setModalIngreso,
  setModalEditar
}) {
  // Estados para seguimiento mensual y vistas
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('monthly'); // 'monthly' o 'total'
  
  // Estados de datos
  const [disponible, setDisponible] = useState(0);
  const [gastado, setGastado] = useState(0);
  const [porcentaje, setPorcentaje] = useState(0);
  const [gastosPorCategoria, setGastosPorCategoria] = useState({});
  const [categoriasInfo, setCategoriasInfo] = useState({});
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [actividadReciente, setActividadReciente] = useState([]);
  const menuRef = useRef(null);
  
  // Estados para datos filtrados por mes
  const [gastosFiltrados, setGastosFiltrados] = useState([]);
  const [ingresosFiltrados, setIngresosFiltrados] = useState([]);
  const [presupuestoMensual, setPresupuestoMensual] = useState(0);

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
          infoObj[cat.nombre] = {
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

  // Filtrar datos según el mes y año seleccionados
  useEffect(() => {
    const filtrarDatosPorMes = () => {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      
      // Función para verificar si un timestamp pertenece al mes seleccionado
      const isInSelectedMonth = (timestamp) => {
        const date = new Date(timestamp);
        return date.getFullYear() === year && date.getMonth() === month;
      };
      
      // Filtrar gastos del mes seleccionado
      const gastosMes = currentView === 'monthly' 
        ? gastosState.filter(gasto => isInSelectedMonth(gasto.fecha))
        : gastosState;
      
      // Filtrar ingresos del mes seleccionado
      const ingresosMes = currentView === 'monthly'
        ? ingresosExtra.filter(ingreso => isInSelectedMonth(ingreso.fecha))
        : ingresosExtra;
      
      setGastosFiltrados(gastosMes);
      setIngresosFiltrados(ingresosMes);
      
      // Calcular presupuesto mensual (para la vista mensual)
      if (currentView === 'monthly') {
        // Si estamos en el mes actual, usar el presupuesto actual
        const ahora = new Date();
        const esElMesActual = ahora.getMonth() === month && ahora.getFullYear() === year;
        
        if (esElMesActual) {
          setPresupuestoMensual(presupuesto);
        } else {
          // Para meses pasados, calcular presupuesto aproximado
          // Esto es una simplificación - se podría mejorar según tu lógica de negocio
          const totalIngresosMes = ingresosMes.reduce((sum, ingreso) => sum + ingreso.monto, 0);
          
          // Buscar el ingreso más alto del mes (posible presupuesto base)
          const posiblePresupuestoBase = ingresosMes.length > 0 
            ? Math.max(...ingresosMes.map(i => i.monto))
            : presupuesto / 12; // Aproximación si no hay datos
            
          setPresupuestoMensual(posiblePresupuestoBase + totalIngresosMes);
        }
      } else {
        // En vista global, usar el presupuesto total
        setPresupuestoMensual(presupuesto);
      }
    };
    
    filtrarDatosPorMes();
  }, [selectedDate, gastosState, ingresosExtra, presupuesto, currentView]);

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
    const gastosFormateados = gastosFiltrados.map((gasto) => ({
      id: gasto.id,
      tipo: "gasto",
      nombre: gasto.nombreG,
      categoria: gasto.categoria,
      monto: gasto.gasto,
      fecha: gasto.fecha,
    }));

    // Convertir ingresos al formato de actividad
    const ingresosFormateados = ingresosFiltrados.map((ingreso) => ({
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
  }, [gastosFiltrados, ingresosFiltrados]);

  // Calcular datos del dashboard basados en datos filtrados
  useEffect(() => {
    const calcularTotales = () => {
      const sumaGasto = gastosFiltrados.reduce(
        (total, gasto) => Number(gasto.gasto) + total,
        0
      );
      
      // Calculate total available amount based on total budget and all expenses (like Gestión de Ahorro)
      const totalGastosGlobal = gastosState.reduce(
        (total, gasto) => Number(gasto.gasto) + total,
        0
      );
      const totalDisponible = Math.max(0, presupuesto - totalGastosGlobal);

      // Calcular porcentaje de presupuesto usado (still based on monthly for progress bar)
      const nuevoPorcentaje =
        presupuestoMensual > 0
          ? Math.min(100, Math.round((sumaGasto * 100) / presupuestoMensual))
          : 0;

      // Agrupar gastos por categoría
      const categorias = {};
      gastosFiltrados.forEach((gasto) => {
        if (categorias[gasto.categoria]) {
          categorias[gasto.categoria] += Number(gasto.gasto);
        } else {
          categorias[gasto.categoria] = Number(gasto.gasto);
        }
      });

      // Actualizar estados
      setDisponible(totalDisponible);
      setGastado(sumaGasto); // Gastado still shows monthly/filtered expenses
      setPorcentaje(nuevoPorcentaje);
      setGastosPorCategoria(categorias);
    };

    calcularTotales();
  }, [gastosFiltrados, presupuestoMensual, gastosState, presupuesto]); // Added gastosState and presupuesto to dependency array

  // Determinar el color del gráfico según disponibilidad
  const getProgressBarColor = () => {
    if (porcentaje < 50) return "#3b82f6"; // Azul para menos del 50%
    if (porcentaje < 75) return "#eab308"; // Amarillo para menos del 75%
    return "#ef4444"; // Rojo para 75% o más
  };

  // Obtener texto para la fecha seleccionada
  const obtenerMesSeleccionado = () => {
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return `${meses[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
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

  // En el progreso del presupuesto, calcula el color del porcentaje
  const progressColor = getProgressBarColor();

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Encabezado del Dashboard con menú de opciones */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-y-3 sm:gap-y-0 bg-white p-4 sm:p-6 rounded-xl shadow-sm">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Dashboard</h2>
          
          {/* Menú de opciones avanzadas */}
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setMostrarMenu(!mostrarMenu)}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              aria-label="Opciones avanzadas"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            
            {/* Menú desplegable */}
            {mostrarMenu && (
              <div className="absolute left-0 mt-2 w-48 rounded-lg shadow-lg bg-white z-10 ring-1 ring-black ring-opacity-5">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <button
                    onClick={() => {
                      setMostrarMenu(false);
                      setModalEditar(true);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    role="menuitem"
                  >
                    Modificar presupuesto total
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <ViewToggle 
            currentView={currentView} 
            onChange={setCurrentView} 
          />
          
          {currentView === 'monthly' && (
            <MonthSelector 
              currentDate={selectedDate}
              onChange={setSelectedDate}
            />
          )}
        </div>
      </div>
      
      {/* Acciones adicionales */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
        <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
          {currentView === 'monthly' ? obtenerMesSeleccionado() : 'Vista Global'}
        </span>
        
        <button
          onClick={handleAgregarIngreso}
          className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Agregar Ingreso
        </button>
      </div>

      {/* Tarjetas de información resumida */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
        <DashboardCard
          title={currentView === 'monthly' ? "Presupuesto Mensual" : "Presupuesto Total"}
          amount={'$' + new Intl.NumberFormat('es-CO').format(Number(presupuestoMensual))}
          color="blue"
        />
        <DashboardCard
          title="Disponible"
          amount={<span className={`text-xl sm:text-2xl font-bold ${disponible < 0 ? 'text-red-600' : 'text-green-600'}`}> 
            {disponible < 0 ? '-' : ''}{'$' + new Intl.NumberFormat('es-CO').format(Math.abs(Number(disponible)))}
          </span>}
          color={disponible >= 0 ? "green" : "red"}
        />
        <DashboardCard
          title="Gastado"
          amount={'$' + new Intl.NumberFormat('es-CO').format(Number(gastado))}
          color="gray"
        />
      </div>

      {/* Gráfico de progreso y detalles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
            Progreso del Presupuesto
          </h2>
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            <div className="w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
              <CircularProgressbar
                value={porcentaje}
                text={`${Math.min(100, Math.max(0, porcentaje))}%`}
                styles={buildStyles({
                  pathColor: progressColor,
                  textColor: progressColor,
                  trailColor: "#f3f4f6",
                })}
              />
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
                        className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${
                          info.color?.split(" ")[0] || "bg-blue-100"
                        } mr-3 flex-shrink-0`}
                      />
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
                    <span className="font-bold text-gray-900 text-right">
                      {'$' + new Intl.NumberFormat('es-CO').format(Number(monto))}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-4 text-sm">
                {currentView === 'monthly' 
                  ? `No hay gastos registrados para ${obtenerMesSeleccionado()}`
                  : "No hay gastos registrados aún"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Historial de ingresos extra con botones de acción */}
      {ingresosFiltrados.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-medium text-gray-900">
              {currentView === 'monthly' 
                ? `Ingresos de ${obtenerMesSeleccionado()}` 
                : "Todos los Ingresos"}
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
                    {ingresosFiltrados.map((ingreso) => {
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
                            +{'$' + new Intl.NumberFormat('es-CO').format(Number(ingreso.monto))}
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
      ) : currentView === 'monthly' && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-medium text-gray-900">
              {`Ingresos de ${obtenerMesSeleccionado()}`}
            </h2>
          </div>
          <p className="text-gray-500 text-center py-4 text-sm">
            No hay ingresos registrados para {obtenerMesSeleccionado()}
          </p>
        </div>
      )}

      {/* Actividad Reciente (Gastos e Ingresos) - Versión Adaptativa */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg font-medium text-gray-900">
            {currentView === 'monthly' ? `Actividad de ${obtenerMesSeleccionado()}` : 'Actividad Reciente'}
          </h2>
          {actividadReciente.length > 8 && (
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault(); /* Navegar a actividad */
              }}
              className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Ver toda
            </a>
          )}
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
                        {'$' + new Intl.NumberFormat('es-CO').format(Number(actividad.monto))}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4 text-xs sm:text-sm">
            {currentView === 'monthly' 
              ? `No hay actividad registrada para ${obtenerMesSeleccionado()}`
              : "No hay actividad registrada aún"}
          </p>
        )}
      </div>
      
      {/* Solo mostrar historial de eliminados en vista global */}
      {currentView === 'total' && (
        <HistorialEliminados />
      )}
    </div>
  );
}

Dashboard.propTypes = {
  presupuesto: PropTypes.number.isRequired,
  setPresupuesto: PropTypes.func.isRequired,
  gastosState: PropTypes.array.isRequired,
  actualizarPresupuesto: PropTypes.func.isRequired,
  ingresosExtra: PropTypes.array,
  editarIngreso: PropTypes.func.isRequired,
  eliminarIngreso: PropTypes.func.isRequired,
  setModalIngreso: PropTypes.func.isRequired,
  setModalEditar: PropTypes.func.isRequired,
  actualizarPresupuestoTotal: PropTypes.func.isRequired
};