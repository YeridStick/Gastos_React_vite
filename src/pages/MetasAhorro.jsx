import { useState, useEffect } from 'react';
import { cantidad } from '../helpers/index';
import Swal from 'sweetalert2';

export default function MetasAhorro({ presupuesto, gastosState, ingresosExtra = [] }) {
  // Estados
  const [metas, setMetas] = useState(JSON.parse(localStorage.getItem("MetasAhorro")) ?? []);
  const [nombreMeta, setNombreMeta] = useState('');
  const [montoMeta, setMontoMeta] = useState('');
  const [fechaObjetivo, setFechaObjetivo] = useState('');
  const [descripcionMeta, setDescripcionMeta] = useState('');
  const [disponibleMensual, setDisponibleMensual] = useState(0);
  const [metaEnEdicion, setMetaEnEdicion] = useState(null);
  
  // Calcular disponible mensual
  useEffect(() => {
    // Promedio de gastos mensuales
    const calcularDisponibleMensual = () => {
      // Agrupar gastos por mes
      const gastosPorMes = {};
      gastosState.forEach(gasto => {
        const fecha = new Date(gasto.fecha);
        const mesAño = `${fecha.getMonth()}-${fecha.getFullYear()}`;
        
        if (!gastosPorMes[mesAño]) {
          gastosPorMes[mesAño] = 0;
        }
        
        gastosPorMes[mesAño] += gasto.gasto;
      });
      
      // Calcular promedio si hay datos
      if (Object.keys(gastosPorMes).length > 0) {
        const totalGastos = Object.values(gastosPorMes).reduce((a, b) => a + b, 0);
        const promedioGastosMensual = totalGastos / Object.keys(gastosPorMes).length;
        
        // Disponible mensual = presupuesto - promedio de gastos
        const disponible = presupuesto - promedioGastosMensual;
        setDisponibleMensual(disponible);
      } else {
        // Si no hay gastos registrados, todo el presupuesto está disponible
        setDisponibleMensual(presupuesto);
      }
    };
    
    calcularDisponibleMensual();
  }, [presupuesto, gastosState]);
  
  // Persistir metas en localStorage
  useEffect(() => {
    localStorage.setItem("MetasAhorro", JSON.stringify(metas));
  }, [metas]);

  // Función para añadir nueva meta
  const agregarMeta = (e) => {
    e.preventDefault();
    
    // Validaciones
    if ([nombreMeta, montoMeta, fechaObjetivo].includes('') || montoMeta <= 0) {
      Swal.fire({
        title: 'Error',
        text: 'Todos los campos son obligatorios y el monto debe ser mayor a 0',
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }
    
    const fechaActual = new Date();
    const fechaObj = new Date(fechaObjetivo);
    
    if (fechaObj <= fechaActual) {
      Swal.fire({
        title: 'Error',
        text: 'La fecha objetivo debe ser posterior a la fecha actual',
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }
    
    // Calcular días restantes
    const diffTiempo = fechaObj.getTime() - fechaActual.getTime();
    const diffDias = Math.ceil(diffTiempo / (1000 * 60 * 60 * 24));
    
    // Calcular montos recomendados de ahorro
    const ahorroSemanal = Number(montoMeta) / (diffDias / 7);
    const ahorroMensual = Number(montoMeta) / (diffDias / 30);
    const ahorroAnual = Number(montoMeta) / (diffDias / 365);
    
    // Crear la meta
    const nuevaMeta = {
      id: metaEnEdicion ? metaEnEdicion.id : Date.now().toString(),
      nombre: nombreMeta,
      monto: Number(montoMeta),
      fechaObjetivo,
      descripcion: descripcionMeta,
      creada: metaEnEdicion ? metaEnEdicion.creada : Date.now(),
      ahorroAcumulado: metaEnEdicion ? metaEnEdicion.ahorroAcumulado : 0,
      ahorroSemanal,
      ahorroMensual,
      ahorroAnual,
      diasRestantes: diffDias,
      completada: false
    };
    
    // Actualizar estado
    if (metaEnEdicion) {
      // Editar meta existente
      const metasActualizadas = metas.map(meta => 
        meta.id === metaEnEdicion.id ? nuevaMeta : meta
      );
      setMetas(metasActualizadas);
      
      Swal.fire({
        title: 'Meta Actualizada',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      // Agregar nueva meta
      setMetas([...metas, nuevaMeta]);
      
      Swal.fire({
        title: 'Meta Agregada',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
    
    // Limpiar formulario
    resetearFormulario();
  };
  
  // Resetear formulario
  const resetearFormulario = () => {
    setNombreMeta('');
    setMontoMeta('');
    setFechaObjetivo('');
    setDescripcionMeta('');
    setMetaEnEdicion(null);
  };
  
  // Editar meta
  const handleEditar = (meta) => {
    setMetaEnEdicion(meta);
    setNombreMeta(meta.nombre);
    setMontoMeta(meta.monto);
    setFechaObjetivo(meta.fechaObjetivo);
    setDescripcionMeta(meta.descripcion || '');
    
    // Scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Eliminar meta
  const handleEliminar = (metaId) => {
    Swal.fire({
      title: "¿Eliminar meta?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        // Guardar el ID de la meta eliminada en localStorage
        const eliminados = JSON.parse(localStorage.getItem("eliminados")) || {};
        if (!eliminados["MetasAhorro"]) {
          eliminados["MetasAhorro"] = [];
        }
        eliminados["MetasAhorro"].push(metaId);
        localStorage.setItem("eliminados", JSON.stringify(eliminados));

        // Actualizar el estado de las metas
        const metasActualizadas = metas.filter((meta) => meta.id !== metaId);
        setMetas(metasActualizadas);

        Swal.fire({
          title: "Meta eliminada",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };
  
  // Formatear fecha
  const formatearFecha = (fechaString) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };
  
  // Calcular progreso de meta
  const calcularPorcentaje = (meta) => {
    return Math.min(100, Math.round((meta.ahorroAcumulado / meta.monto) * 100));
  };
  
  // Obtener clase de color según factibilidad
  const getClaseFactibilidad = (meta) => {
    // Si la meta ya está completada, retornar verde
    if (meta.completada) return 'text-green-600';
    
    // Calcular si es factible con el ahorro disponible mensual
    if (meta.ahorroMensual > disponibleMensual) {
      return 'text-red-600'; // No factible
    } else if (meta.ahorroMensual > disponibleMensual * 0.5) {
      return 'text-yellow-600'; // Difícil pero posible
    } else {
      return 'text-green-600'; // Factible
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Metas de Ahorro</h2>
      </div>
      
      {/* Formulario para agregar/editar meta */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
          {metaEnEdicion ? 'Editar Meta' : 'Nueva Meta de Ahorro'}
        </h3>
        
        <form onSubmit={agregarMeta} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            <div>
              <label htmlFor="nombre-meta" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Nombre de la Meta
              </label>
              <input
                id="nombre-meta"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Ej: Nuevo Celular, Vacaciones..."
                value={nombreMeta}
                onChange={e => setNombreMeta(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="monto-meta" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Monto Objetivo
              </label>
              <input
                id="monto-meta"
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="¿Cuánto necesitas ahorrar?"
                value={montoMeta}
                onChange={e => setMontoMeta(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="fecha-objetivo" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Fecha Objetivo
              </label>
              <input
                id="fecha-objetivo"
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={fechaObjetivo}
                onChange={e => setFechaObjetivo(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="descripcion-meta" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Descripción (opcional)
              </label>
              <input
                id="descripcion-meta"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Más detalles sobre esta meta..."
                value={descripcionMeta}
                onChange={e => setDescripcionMeta(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 sm:space-x-3 pt-2">
            {metaEnEdicion && (
              <button
                type="button"
                onClick={resetearFormulario}
                className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {metaEnEdicion ? 'Guardar' : 'Crear Meta'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Información del presupuesto disponible */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Capacidad de Ahorro</h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
          Según tus gastos promedio, tienes aproximadamente {cantidad(disponibleMensual)} disponibles cada mes para ahorrar.
        </p>
        
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${Math.min(100, (disponibleMensual / presupuesto) * 100)}%` }}
            ></div>
          </div>
          <span className="ml-2 sm:ml-3 text-xs sm:text-sm font-medium text-gray-700">
            {Math.round((disponibleMensual / presupuesto) * 100)}%
          </span>
        </div>
      </div>
      
      {/* Listado de metas */}
      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-base sm:text-lg font-medium text-gray-900">Tus Metas de Ahorro</h3>
        
        {metas.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {metas.map(meta => {
              // Calcular progreso
              const porcentaje = calcularPorcentaje(meta);
              const clasesFactibilidad = getClaseFactibilidad(meta);
              
              return (
                <div key={meta.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-3 sm:p-5 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
                      <h4 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                        {meta.nombre}
                      </h4>
                      <span className={`font-medium ${
                        meta.completada 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                        } px-2 py-0.5 rounded-full text-xs inline-block sm:inline w-fit`}
                      >
                        {meta.completada ? 'Completada' : `${meta.diasRestantes} días`}
                      </span>
                    </div>
                    
                    {meta.descripcion && (
                      <p className="mt-1 text-xs sm:text-sm text-gray-600 line-clamp-2">{meta.descripcion}</p>
                    )}
                  </div>
                  
                  <div className="px-3 sm:px-5 py-3 sm:py-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs sm:text-sm font-medium text-gray-700">Progreso:</span>
                      <span className="text-xs sm:text-sm font-medium text-gray-900">
                        {cantidad(meta.ahorroAcumulado)} de {cantidad(meta.monto)} ({porcentaje}%)
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2.5 mb-3 sm:mb-4">
                      <div 
                        className={`${
                          meta.completada 
                            ? 'bg-green-600' 
                            : 'bg-blue-600'
                        } h-1.5 sm:h-2.5 rounded-full`} 
                        style={{ width: `${porcentaje}%` }}
                      ></div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-3 sm:mb-4">
                      <div className="bg-gray-50 p-1.5 sm:p-2 rounded text-center">
                        <p className="text-xs text-gray-500 truncate">Semanal</p>
                        <p className={`text-xs sm:text-sm font-medium ${clasesFactibilidad} truncate`}>
                          {cantidad(meta.ahorroSemanal)}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-1.5 sm:p-2 rounded text-center">
                        <p className="text-xs text-gray-500 truncate">Mensual</p>
                        <p className={`text-xs sm:text-sm font-medium ${clasesFactibilidad} truncate`}>
                          {cantidad(meta.ahorroMensual)}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-1.5 sm:p-2 rounded text-center">
                        <p className="text-xs text-gray-500 truncate">Anual</p>
                        <p className={`text-xs sm:text-sm font-medium ${clasesFactibilidad} truncate`}>
                          {cantidad(meta.ahorroAnual)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-2 border-t border-gray-100">
                      <div className="text-xs sm:text-sm">
                        <span className="text-gray-500">Fecha límite: </span>
                        <span className="font-medium">{formatearFecha(meta.fechaObjetivo)}</span>
                      </div>
                      
                      <div className="flex justify-between sm:justify-end sm:space-x-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditar(meta)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="Editar meta"
                          >
                            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEliminar(meta.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Eliminar meta"
                          >
                            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-xs sm:text-sm text-gray-500">No has creado ninguna meta de ahorro todavía.</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">¡Crea tu primera meta para alcanzar tus objetivos financieros!</p>
          </div>
        )}
      </div>
    </div>
  );
}