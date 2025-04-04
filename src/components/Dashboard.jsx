import React, { useEffect, useState } from 'react'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import "react-circular-progressbar/dist/styles.css"
import { cantidad } from '../helpers/index'

// Importación de iconos para el dashboard
import IconoAhorro from '../assets/img/icono_ahorro.svg'
import IconoCasa from '../assets/img/icono_casa.svg'
import IconoComida from '../assets/img/icono_comida.svg'
import IconoGasto from '../assets/img/icono_gastos.svg'
import IconoOcio from '../assets/img/icono_ocio.svg'
import IconoSalud from '../assets/img/icono_salud.svg'
import IconoEducacion from '../assets/img/icono_suscripciones.svg'

// Componente para mostrar tarjetas en el Dashboard
const DashboardCard = ({ title, amount, color, icon, trend, percentage }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">{title}</h2>
          {trend && (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-rose-100 text-rose-800'}`}>
              {trend === 'up' ? '+' : '-'}{percentage}% vs anterior
            </span>
          )}
        </div>
        <div className="mt-4 flex items-center">
          {icon && <img src={icon} alt={title} className="h-10 w-10 mr-3" />}
          <span className="text-3xl font-bold text-gray-900">{amount}</span>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard({ presupuesto, gastosState }) {
  const [disponible, setDisponible] = useState(0)
  const [gastado, setGastado] = useState(0)
  const [porcentaje, setPorcentaje] = useState(0)
  const [gastosPorCategoria, setGastosPorCategoria] = useState({})
  const [categoriasInfo, setCategoriasInfo] = useState({})

  // Cargar categorías desde localStorage
  useEffect(() => {
    try {
      const categoriasGuardadas = localStorage.getItem('categorias');
      
      if (categoriasGuardadas) {
        const categorias = JSON.parse(categoriasGuardadas);
        
        // Crear un objeto con información de cada categoría
        const infoObj = {};
        categorias.forEach(cat => {
          infoObj[cat.id] = {
            nombre: cat.nombre,
            color: cat.color || 'bg-gray-100 text-gray-800',
            icono: getIconoPorCategoria(cat.id)
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
      case 'Ahorro': return IconoAhorro;
      case 'Comida': return IconoComida;
      case 'Casa': return IconoCasa;
      case 'Ocio': return IconoOcio;
      case 'Salud': return IconoSalud;
      case 'Educacion': return IconoEducacion;
      default: return IconoGasto;
    }
  };

  // Calcular datos del dashboard
  useEffect(() => {
    const calcularTotales = () => {
      const sumaGasto = gastosState.reduce((total, gasto) => gasto.gasto + total, 0)
      const totalDisponible = presupuesto - sumaGasto
      
      // Calcular porcentaje de presupuesto usado
      const nuevoPorcentaje = presupuesto > 0 
        ? Math.min(100, Math.round((sumaGasto * 100) / presupuesto)) 
        : 0
      
      // Agrupar gastos por categoría
      const categorias = {}
      gastosState.forEach(gasto => {
        if (categorias[gasto.categoria]) {
          categorias[gasto.categoria] += gasto.gasto
        } else {
          categorias[gasto.categoria] = gasto.gasto
        }
      })
      
      // Actualizar estados
      setDisponible(totalDisponible)
      setGastado(sumaGasto)
      setPorcentaje(nuevoPorcentaje)
      setGastosPorCategoria(categorias)
    }
    
    calcularTotales()
  }, [gastosState, presupuesto])

  // Determinar el color del gráfico según disponibilidad
  const getProgressBarColor = () => {
    if (porcentaje < 50) return "#3b82f6" // Azul para menos del 50%
    if (porcentaje < 75) return "#eab308" // Amarillo para menos del 75%
    return "#ef4444"     // Rojo para 75% o más
  }
  
  // Calcular fecha para tarjeta
  const obtenerMesActual = () => {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    const fecha = new Date()
    return `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {obtenerMesActual()}
        </span>
      </div>
      
      {/* Tarjetas de información resumida */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Progreso del Presupuesto</h2>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-40 h-40">
              <CircularProgressbar
                value={porcentaje}
                text={`${porcentaje}%`}
                styles={buildStyles({
                  pathColor: getProgressBarColor(),
                  textColor: "#1f2937",
                  trailColor: "#f3f4f6"
                })}
              />
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <div className="flex items-center mb-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm font-medium text-gray-700">Presupuesto Total</span>
                  </div>
                  <p className="ml-5 text-lg font-semibold text-gray-900">{cantidad(presupuesto)}</p>
                </div>
                
                <div>
                  <div className="flex items-center mb-1">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm font-medium text-gray-700">Disponible</span>
                  </div>
                  <p className="ml-5 text-lg font-semibold text-gray-900">{cantidad(disponible)}</p>
                </div>
                
                <div>
                  <div className="flex items-center mb-1">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-sm font-medium text-gray-700">Gastado</span>
                  </div>
                  <p className="ml-5 text-lg font-semibold text-gray-900">{cantidad(gastado)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Gastos por categoría */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Gastos por Categoría</h2>
          </div>
          
          <div className="space-y-4">
            {Object.keys(gastosPorCategoria).length > 0 ? (
              Object.entries(gastosPorCategoria).map(([categoriaId, monto]) => {
                // Obtener información de la categoría
                const info = categoriasInfo[categoriaId] || {
                  nombre: categoriaId,
                  icono: IconoGasto,
                  color: 'bg-blue-100'
                };
                
                // Color para la barra de progreso
                const barColor = info.color?.split(' ')[0] || 'bg-blue-600';
                
                return (
                  <div key={categoriaId} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full ${info.color?.split(' ')[0] || 'bg-blue-100'} flex items-center justify-center mr-3`}>
                        <img src={info.icono} alt={info.nombre} className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{info.nombre || categoriaId}</p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div 
                            className={`${barColor} h-1.5 rounded-full`}
                            style={{ width: `${(monto / gastado) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{cantidad(monto)}</span>
                  </div>
                )
              })
            ) : (
              <p className="text-gray-500 text-center py-4">No hay gastos registrados aún</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Gastos recientes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Gastos Recientes</h2>
          <a href="#" onClick={(e) => { e.preventDefault(); /* Navegar a gastos */ }} className="text-sm font-medium text-blue-600 hover:text-blue-500">
            Ver todos
          </a>
        </div>
        
        {gastosState.length > 0 ? (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Concepto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {gastosState.slice(0, 5).map((gasto) => {
                  // Formatear fecha
                  const fecha = new Date(gasto.fecha);
                  const formatoFecha = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
                  
                  // Obtener información de color para la categoría
                  const categoryColor = categoriasInfo[gasto.categoria]?.color || 'bg-blue-100 text-blue-800';
                  
                  return (
                    <tr key={gasto.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {gasto.nombreG}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${categoryColor}`}>
                          {gasto.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatoFecha}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                        {cantidad(gasto.gasto)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-6">No hay gastos registrados aún</p>
        )}
      </div>
    </div>
  )
}