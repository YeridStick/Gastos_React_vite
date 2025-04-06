import { useState, useEffect } from 'react';
import { cantidad } from '../helpers/index.js';

// Componente para generar reportes
export default function Reportes({ gastosState, presupuesto }) {
  // Estado para almacenar datos de reportes
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('mensual');
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth());
  const [añoSeleccionado, setAñoSeleccionado] = useState(new Date().getFullYear());
  const [ingresosExtra, setIngresosExtra] = useState([]);
  const [metasAhorro, setMetasAhorro] = useState([]);
  const [datosReporte, setDatosReporte] = useState({
    gastoTotal: 0,
    ingresoExtra: 0,
    gastoPromedio: 0,
    gastoMasAlto: { valor: 0, nombre: '', fecha: null },
    gastoMasBajo: { valor: Infinity, nombre: '', fecha: null },
    gastosPorCategoria: {},
    tendencia: 'igual', // 'subida', 'bajada', 'igual'
    cumplimientoPresupuesto: 0,
    progressoAhorro: 0,
    balance: 0,
    listadoGastos: []
  });

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
  
  // Cargar ingresos extras desde localStorage
  useEffect(() => {
    const obtenerIngresosExtra = () => {
      const ingresosExtraLS = JSON.parse(localStorage.getItem('IngresosExtra')) || [];
      setIngresosExtra(ingresosExtraLS);
    };
    
    const obtenerMetasAhorro = () => {
      const metasAhorroLS = JSON.parse(localStorage.getItem('MetasAhorro')) || [];
      setMetasAhorro(metasAhorroLS);
    };
    
    obtenerIngresosExtra();
    obtenerMetasAhorro();
  }, []);

  // Generar reporte cuando cambia el periodo o los gastos
  useEffect(() => {
    generarReporte();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gastosState, ingresosExtra, metasAhorro, periodoSeleccionado, mesSeleccionado, añoSeleccionado]);

  // Función para generar el reporte
  const generarReporte = () => {
    // Filtrar gastos según el periodo seleccionado
    let gastosFiltrados = [];
    let ingresosExtraFiltrados = [];
    const fechaActual = new Date();
    
    if (periodoSeleccionado === 'mensual') {
      // Filtrar por mes y año seleccionados
      gastosFiltrados = gastosState.filter(gasto => {
        const fechaGasto = new Date(gasto.fecha);
        return fechaGasto.getMonth() === mesSeleccionado && 
               fechaGasto.getFullYear() === añoSeleccionado;
      });
      
      ingresosExtraFiltrados = ingresosExtra.filter(ingreso => {
        const fechaIngreso = new Date(ingreso.fecha);
        return fechaIngreso.getMonth() === mesSeleccionado && 
               fechaIngreso.getFullYear() === añoSeleccionado;
      });
    } else if (periodoSeleccionado === 'anual') {
      // Filtrar solo por año seleccionado
      gastosFiltrados = gastosState.filter(gasto => {
        const fechaGasto = new Date(gasto.fecha);
        return fechaGasto.getFullYear() === añoSeleccionado;
      });
      
      ingresosExtraFiltrados = ingresosExtra.filter(ingreso => {
        const fechaIngreso = new Date(ingreso.fecha);
        return fechaIngreso.getFullYear() === añoSeleccionado;
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
      
      ingresosExtraFiltrados = ingresosExtra.filter(ingreso => {
        const fechaIngreso = new Date(ingreso.fecha);
        const mesIngreso = fechaIngreso.getMonth();
        return fechaIngreso.getFullYear() === añoSeleccionado && 
               mesIngreso >= mesInicio && mesIngreso <= mesFin;
      });
    }

    // Si no hay gastos en el periodo, mostrar mensaje vacío
    if (gastosFiltrados.length === 0 && ingresosExtraFiltrados.length === 0) {
      setDatosReporte({
        gastoTotal: 0,
        ingresoExtra: 0,
        gastoPromedio: 0,
        gastoMasAlto: { valor: 0, nombre: '', fecha: null },
        gastoMasBajo: { valor: 0, nombre: '', fecha: null },
        gastosPorCategoria: {},
        tendencia: 'igual',
        cumplimientoPresupuesto: 0,
        progressoAhorro: 0,
        balance: 0,
        listadoGastos: []
      });
      return;
    }

    // Calcular gasto total
    const gastoTotal = gastosFiltrados.reduce((total, gasto) => total + gasto.gasto, 0);
    
    // Calcular ingresos extras
    const ingresoExtra = ingresosExtraFiltrados.reduce((total, ingreso) => total + ingreso.monto, 0);
    
    // Calcular gasto promedio
    const gastoPromedio = gastosFiltrados.length > 0 ? gastoTotal / gastosFiltrados.length : 0;
    
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
    
    // Si no hay gastos, ajustar valor mínimo a 0
    if (gastosFiltrados.length === 0) {
      gastoMasBajo = { valor: 0, nombre: '', fecha: null };
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
    
    // Calcular presupuesto aplicable considerando ingresos extras
    let presupuestoMensual = presupuesto / 12;
    let presupuestoAplicable;
    
    if (periodoSeleccionado === 'mensual') {
      presupuestoAplicable = presupuestoMensual + ingresoExtra;
    } else if (periodoSeleccionado === 'trimestral') {
      presupuestoAplicable = (presupuestoMensual * 3) + ingresoExtra;
    } else {
      presupuestoAplicable = presupuesto + ingresoExtra;
    }
    
    // Calcular porcentaje de cumplimiento del presupuesto
    const cumplimientoPresupuesto = presupuestoAplicable > 0 
      ? Math.min(100, Math.round((gastoTotal * 100) / presupuestoAplicable))
      : 0;
    
    // Calcular balance (ingresos - gastos)
    const balance = presupuestoAplicable - gastoTotal;
    
    // Calcular progreso de ahorro
    const metasFiltradas = metasAhorro.filter(meta => {
      if (!meta.completada) {
        return true;
      }
      return false;
    });
    
    let progressoAhorro = 0;
    if (metasFiltradas.length > 0) {
      const montoTotalMetas = metasFiltradas.reduce((total, meta) => total + meta.monto, 0);
      const ahorroAcumulado = metasFiltradas.reduce((total, meta) => total + (meta.ahorroAcumulado || 0), 0);
      progressoAhorro = montoTotalMetas > 0 ? Math.min(100, Math.round((ahorroAcumulado * 100) / montoTotalMetas)) : 0;
    }
    
    // Actualizar el estado con los datos del reporte
    setDatosReporte({
      gastoTotal,
      ingresoExtra,
      gastoPromedio,
      gastoMasAlto,
      gastoMasBajo,
      gastosPorCategoria,
      tendencia,
      cumplimientoPresupuesto,
      progressoAhorro,
      balance,
      listadoGastos: gastosFiltrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)) // Ordenar por fecha descendente
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
            <div className="flex flex-wrap gap-2">
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
          Reporte Financiero: {obtenerTituloPeriodo()}
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

        {/* Ingresos Extra */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900">Ingresos Extra</h3>
            <div className="mt-4">
              <span className="text-3xl font-bold text-green-600">
                {cantidad(datosReporte.ingresoExtra)}
              </span>
            </div>
          </div>
        </div>

        {/* Balance */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900">Balance</h3>
            <div className="mt-4">
              <span className={`text-3xl font-bold ${datosReporte.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {cantidad(datosReporte.balance)}
              </span>
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

      {/* Segunda fila de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* Progreso de Ahorro */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900">Progreso de Ahorro</h3>
            <div className="mt-4">
              <div className="flex items-center">
                <span className="text-3xl font-bold text-gray-900">
                  {datosReporte.progressoAhorro}%
                </span>
              </div>
              <div className="mt-2">
                <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                  <div 
                    style={{ width: `${datosReporte.progressoAhorro}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
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
                    
                    return (
                      <tr key={categoria} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {categoria}
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
                                className="bg-blue-600 h-2 rounded-full" 
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
      
      {/* Metas de Ahorro */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Metas de Ahorro Activas
          </h3>
        </div>
        
        {metasAhorro.filter(meta => !meta.completada).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meta
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Objetivo
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto Objetivo
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ahorrado
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progreso
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {metasAhorro
                  .filter(meta => !meta.completada)
                  .map(meta => {
                    const progreso = meta.monto > 0 ? Math.min(100, Math.round((meta.ahorroAcumulado || 0) * 100 / meta.monto)) : 0;

                    return (
                      <tr key={meta.id}> {/* Asegúrate de que cada fila tenga una clave única */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {meta.nombre}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {meta.categoria}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {meta.fechaObjetivo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                          {cantidad(meta.monto)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                          {progreso}%
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