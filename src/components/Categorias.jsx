import React, { useState, useEffect } from 'react';
import { cantidad } from '../helpers/index';

// Importación de iconos para el dashboard
import IconoAhorro from '../assets/img/icono_ahorro.svg';
import IconoCasa from '../assets/img/icono_casa.svg';
import IconoComida from '../assets/img/icono_comida.svg';
import IconoGasto from '../assets/img/icono_gastos.svg';
import IconoOcio from '../assets/img/icono_ocio.svg';
import IconoSalud from '../assets/img/icono_salud.svg';
import IconoEducacion from '../assets/img/icono_suscripciones.svg';

// Función para guardar en localStorage
const guardarEnLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error al guardar en localStorage:", error);
  }
};

// Función para obtener de localStorage
const obtenerDeLocalStorage = (key, defaultValue) => {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
  } catch (error) {
    console.error("Error al obtener de localStorage:", error);
    return defaultValue;
  }
};

// Componente para generar reportes
export default function Reportes({ gastosState, presupuesto }) {
  // Estado para almacenar datos de reportes usando localStorage
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(
    obtenerDeLocalStorage("reportePeriodo", 'mensual')
  );
  const [mesSeleccionado, setMesSeleccionado] = useState(
    obtenerDeLocalStorage("reporteMes", new Date().getMonth())
  );
  const [añoSeleccionado, setAñoSeleccionado] = useState(
    obtenerDeLocalStorage("reporteAño", new Date().getFullYear())
  );
  const [datosReporte, setDatosReporte] = useState({
    gastoTotal: 0,
    gastoPromedio: 0,
    gastoMasAlto: { valor: 0, nombre: '', fecha: null },
    gastoMasBajo: { valor: Infinity, nombre: '', fecha: null },
    gastosPorCategoria: {},
    tendencia: 'igual', // 'subida', 'bajada', 'igual'
    cumplimientoPresupuesto: 0,
    listadoGastos: []
  });
  
  // Estado para información de categorías
  const [categoriasInfo, setCategoriasInfo] = useState({});

  // Lista de meses para el selector
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Lista de años disponibles (últimos 5 años)
  const años = [];
  const añoActual = new Date().getFullYear();
  for (let i = 0; i < 5; i++) {
    años.push(añoActual - i);
  }

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

  // Guardar configuración del reporte en localStorage
  useEffect(() => {
    guardarEnLocalStorage("reportePeriodo", periodoSeleccionado);
    guardarEnLocalStorage("reporteMes", mesSeleccionado);
    guardarEnLocalStorage("reporteAño", añoSeleccionado);
  }, [periodoSeleccionado, mesSeleccionado, añoSeleccionado]);

  // Generar reporte cuando cambia el periodo o los gastos
  useEffect(() => {
    if (gastosState.length > 0) {
      generarReporte();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gastosState, periodoSeleccionado, mesSeleccionado, añoSeleccionado]);

  // Función para generar el reporte
  const generarReporte = () => {
    // Filtrar gastos según el periodo seleccionado
    let gastosFiltrados = [];
    const fechaActual = new Date();
    
    if (periodoSeleccionado === 'mensual') {
      // Filtrar por mes y año seleccionados
      gastosFiltrados = gastosState.filter(gasto => {
        const fechaGasto = new Date(gasto.fecha);
        return fechaGasto.getMonth() === mesSeleccionado && 
               fechaGasto.getFullYear() === añoSeleccionado;
      });
    } else if (periodoSeleccionado === 'anual') {
      // Filtrar solo por año seleccionado
      gastosFiltrados = gastosState.filter(gasto => {
        const fechaGasto = new Date(gasto.fecha);
        return fechaGasto.getFullYear() === añoSeleccionado;
      });
    } else if (periodoSeleccionado === 'trimestral') {
      // Determinar el trimestre actual (0-3)
      const trimestreActual = Math.floor(mesSeleccionado / 3);
      const mesInicio = trimestreActual * 3;
      const mesFin = mesInicio + 2;
      
      gastosFiltrados = gastosState.filter(gasto => {
        const fechaGasto = new Date(gasto.fecha);
        const mesGasto = fechaGasto.getMonth();
        return fechaGasto.getFullYear() === añoSeleccionado && 
               mesGasto >= mesInicio && mesGasto <= mesFin;
      });
    }

    // Si no hay gastos en el periodo, mostrar mensaje vacío
    if (gastosFiltrados.length === 0) {
      setDatosReporte({
        gastoTotal: 0,
        gastoPromedio: 0,
        gastoMasAlto: { valor: 0, nombre: '', fecha: null },
        gastoMasBajo: { valor: 0, nombre: '', fecha: null },
        gastosPorCategoria: {},
        tendencia: 'igual',
        cumplimientoPresupuesto: 0,
        listadoGastos: []
      });
      return;
    }

    // Calcular gasto total
    const gastoTotal = gastosFiltrados.reduce((total, gasto) => total + gasto.gasto, 0);
    
    // Calcular gasto promedio
    const gastoPromedio = gastoTotal / gastosFiltrados.length;
    
    // Encontrar gasto más alto y más bajo
    let gastoMasAlto = { valor: 0, nombre: '', fecha: null };
    let gastoMasBajo = { valor: Infinity, nombre: '', fecha: null };
    
    gastosFiltrados.forEach(gasto => {
      if (gasto.gasto > gastoMasAlto.valor) {
        gastoMasAlto = {
          valor: gasto.gasto,
          nombre: gasto.nombreG,
          fecha: gasto.fecha
        };
      }
      
      if (gasto.gasto < gastoMasBajo.valor) {
        gastoMasBajo = {
          valor: gasto.gasto,
          nombre: gasto.nombreG,
          fecha: gasto.fecha
        };
      }
    });
    
    // Si solo hay un gasto, el más bajo es igual al más alto
    if (gastosFiltrados.length === 1) {
      gastoMasBajo = { ...gastoMasAlto };
    }
    
    // Calcular gastos por categoría
    const gastosPorCategoria = {};
    gastosFiltrados.forEach(gasto => {
      if (!gastosPorCategoria[gasto.categoria]) {
        gastosPorCategoria[gasto.categoria] = 0;
      }
      gastosPorCategoria[gasto.categoria] += gasto.gasto;
    });
    
    // Determinar tendencia (comparando con periodo anterior)
    let tendencia = 'igual';
    if (periodoSeleccionado === 'mensual' && mesSeleccionado > 0) {
      const mesAnterior = mesSeleccionado - 1;
      const gastosMesAnterior = gastosState.filter(gasto => {
        const fechaGasto = new Date(gasto.fecha);
        return fechaGasto.getMonth() === mesAnterior && 
               fechaGasto.getFullYear() === añoSeleccionado;
      });
      
      const totalMesAnterior = gastosMesAnterior.reduce((total, gasto) => total + gasto.gasto, 0);
      
      if (gastoTotal > totalMesAnterior && totalMesAnterior > 0) {
        tendencia = 'subida';
      } else if (gastoTotal < totalMesAnterior && totalMesAnterior > 0) {
        tendencia = 'bajada';
      }
    }
    
    // Calcular porcentaje de cumplimiento del presupuesto
    const presupuestoMensual = presupuesto / 12;
    let presupuestoAplicable;
    
    if (periodoSeleccionado === 'mensual') {
      presupuestoAplicable = presupuestoMensual;
    } else if (periodoSeleccionado === 'trimestral') {
      presupuestoAplicable = presupuestoMensual * 3;
    } else {
      presupuestoAplicable = presupuesto;
    }
    
    const cumplimientoPresupuesto = presupuestoAplicable > 0 
      ? Math.min(100, Math.round((gastoTotal * 100) / presupuestoAplicable))
      : 0;
    
    // Actualizar el estado con los datos del reporte
    setDatosReporte({
      gastoTotal,
      gastoPromedio,
      gastoMasAlto,
      gastoMasBajo,
      gastosPorCategoria,
      tendencia,
      cumplimientoPresupuesto,
      listadoGastos: gastosFiltrados.sort((a, b) => b.fecha - a.fecha) // Ordenar por fecha descendente
    });
  };

  // Función para obtener el título del periodo
  const obtenerTituloPeriodo = () => {
    if (periodoSeleccionado === 'mensual') {
      return `${meses[mesSeleccionado]} ${añoSeleccionado}`;
    } else if (periodoSeleccionado === 'trimestral') {
      const trimestre = Math.floor(mesSeleccionado / 3) + 1;
      return `${trimestre}º Trimestre ${añoSeleccionado}`;
    } else {
      return `Año ${añoSeleccionado}`;
    }
  };

  // Función para exportar el reporte (simulada)
  const exportarReporte = (formato) => {
    alert(`Exportando reporte en formato ${formato}... Esta funcionalidad está en desarrollo.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">Reportes</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => exportarReporte('pdf')}
            className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm font-medium hover:bg-red-200"
          >
            Exportar PDF
          </button>
          <button 
            onClick={() => exportarReporte('excel')}
            className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-medium hover:bg-green-200"
          >
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Filtros para el reporte */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Reporte
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setPeriodoSeleccionado('mensual')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  periodoSeleccionado === 'mensual'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Mensual
              </button>
              <button
                onClick={() => setPeriodoSeleccionado('trimestral')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  periodoSeleccionado === 'trimestral'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Trimestral
              </button>
              <button
                onClick={() => setPeriodoSeleccionado('anual')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  periodoSeleccionado === 'anual'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Anual
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {periodoSeleccionado !== 'anual' && (
              <div>
                <label htmlFor="mes" className="block text-sm font-medium text-gray-700 mb-1">
                  Mes
                </label>
                <select
                  id="mes"
                  value={mesSeleccionado}
                  onChange={(e) => setMesSeleccionado(Number(e.target.value))}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  {meses.map((mes, index) => (
                    <option key={index} value={index}>{mes}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label htmlFor="año" className="block text-sm font-medium text-gray-700 mb-1">
                Año
              </label>
              <select
                id="año"
                value={añoSeleccionado}
                onChange={(e) => setAñoSeleccionado(Number(e.target.value))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {años.map((año) => (
                  <option key={año} value={año}>{año}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Título del reporte */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-xl font-medium text-gray-900">
          Reporte de Gastos: {obtenerTituloPeriodo()}
        </h3>
      </div>

      {/* Resumen del reporte */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Gasto total */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Gasto Total</h3>
              {datosReporte.tendencia !== 'igual' && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  datosReporte.tendencia === 'subida'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {datosReporte.tendencia === 'subida' ? '↑' : '↓'} vs anterior
                </span>
              )}
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-gray-900">
                {cantidad(datosReporte.gastoTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Promedio de gastos */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900">Promedio por Gasto</h3>
            <div className="mt-4">
              <span className="text-3xl font-bold text-gray-900">
                {cantidad(datosReporte.gastoPromedio)}
              </span>
            </div>
          </div>
        </div>

        {/* Gasto más alto */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900">Gasto Más Alto</h3>
            <div className="mt-4">
              <span className="text-3xl font-bold text-gray-900">
                {cantidad(datosReporte.gastoMasAlto.valor)}
              </span>
              {datosReporte.gastoMasAlto.nombre && (
                <p className="mt-1 text-sm text-gray-500">
                  {datosReporte.gastoMasAlto.nombre}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Cumplimiento presupuesto */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900">Cumplimiento Presupuesto</h3>
            <div className="mt-4">
              <div className="flex items-center">
                <span className="text-3xl font-bold text-gray-900">
                  {datosReporte.cumplimientoPresupuesto}%
                </span>
              </div>
              <div className="mt-2">
                <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                  <div 
                    style={{ width: `${datosReporte.cumplimientoPresupuesto}%` }}
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                      datosReporte.cumplimientoPresupuesto > 80 
                        ? 'bg-red-500' 
                        : datosReporte.cumplimientoPresupuesto > 60 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desglose por categorías */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Desglose por Categorías</h3>
        </div>
        
        {Object.keys(datosReporte.gastosPorCategoria).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % del Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(datosReporte.gastosPorCategoria)
                  .sort((a, b) => b[1] - a[1]) // Ordenar por valor descendente
                  .map(([categoria, valor]) => {
                    const porcentaje = Math.round((valor / datosReporte.gastoTotal) * 100);
                    
                    // Obtener información de la categoría
                    const categoriaInfo = categoriasInfo[categoria] || {
                      nombre: categoria,
                      color: 'bg-blue-100 text-blue-800'
                    };
                    
                    // Extraer solo el color de fondo para la barra de progreso
                    const barColor = categoriaInfo.color?.split(' ')[0] || 'bg-blue-600';
                    
                    return (
                      <tr key={categoria} className="hover:bg-gray-50 w-100">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {categoriaInfo.icono && (
                              <div className={`w-8 h-8 rounded-full ${categoriaInfo.color?.split(' ')[0] || 'bg-blue-100'} flex items-center justify-center mr-3`}>
                                <img className="h-5 w-5" src={categoriaInfo.icono} alt={categoriaInfo.nombre || categoria} />
                              </div>
                            )}
                            <span className="text-sm font-medium text-gray-900">
                              {categoriaInfo.nombre || categoria}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                          {cantidad(valor)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end">
                            <span className="text-sm font-medium text-gray-900 mr-2">
                              {porcentaje}%
                            </span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`${barColor} h-2 rounded-full`}
                                style={{ width: `${porcentaje}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <th scope="row" className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                    Total
                  </th>
                  <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                    {cantidad(datosReporte.gastoTotal)}
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                    100%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-500">No hay datos para mostrar en este periodo</p>
          </div>
        )}
      </div>

      {/* Listado de gastos en el periodo */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Listado de Gastos del Periodo
          </h3>
        </div>
        
        {datosReporte.listadoGastos.length > 0 ? (
          <div className="overflow-x-auto">
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
                {datosReporte.listadoGastos.map(gasto => {
                  // Formatear fecha
                  const fecha = new Date(gasto.fecha);
                  const formatoFecha = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
                  
                  // Obtener color de la categoría
                  const categoriaInfo = categoriasInfo[gasto.categoria] || {
                    nombre: gasto.categoria,
                    color: 'bg-blue-100 text-blue-800'
                  };
                  
                  return (
                    <tr key={gasto.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {gasto.nombreG}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${categoriaInfo.color}`}>
                          {categoriaInfo.nombre || gasto.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatoFecha}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        {cantidad(gasto.gasto)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-500">No hay gastos registrados en este periodo</p>
          </div>
        )}
      </div>
    </div>
  );
}