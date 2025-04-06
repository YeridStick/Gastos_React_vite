import { useState, useEffect } from 'react';
import { cantidad } from '../helpers/index.js';

export default function GestionAhorro({ presupuesto }) {
  const [metasAhorro, setMetasAhorro] = useState([]);
  const [ahorroDisponible, setAhorroDisponible] = useState(0);
  const [distribucionAutomatica, setDistribucionAutomatica] = useState(true);
  const [mensajeExito, setMensajeExito] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [metaEnEdicion, setMetaEnEdicion] = useState(null);
  const [cantidadAjuste, setCantidadAjuste] = useState('');
  
  // Cargar metas de ahorro y calcular ahorro disponible
  useEffect(() => {
    const obtenerMetasAhorro = () => {
      const metasAhorroLS = JSON.parse(localStorage.getItem('MetasAhorro')) || [];
      setMetasAhorro(metasAhorroLS);
    };
    
    const calcularAhorroDisponible = () => {
      // Obtener todos los gastos
      const gastosLS = JSON.parse(localStorage.getItem('gastos')) || [];
      
      // Obtener todos los ingresos extra
      const ingresosExtraLS = JSON.parse(localStorage.getItem('IngresosExtra')) || [];
      
      // Calcular el balance de los últimos 30 días
      const fechaActual = new Date();
      const hace30Dias = new Date();
      hace30Dias.setDate(fechaActual.getDate() - 30);
      
      const gastosMes = gastosLS.filter(gasto => {
        const fechaGasto = new Date(gasto.fecha);
        return fechaGasto >= hace30Dias;
      });
      
      const ingresosExtraMes = ingresosExtraLS.filter(ingreso => {
        const fechaIngreso = new Date(ingreso.fecha);
        return fechaIngreso >= hace30Dias;
      });
      
      const totalGastos = gastosMes.reduce((total, gasto) => total + gasto.gasto, 0);
      const totalIngresosExtra = ingresosExtraMes.reduce((total, ingreso) => total + ingreso.monto, 0);
      
      // Presupuesto mensual (presupuesto anual / 12)
      const presupuestoMensual = presupuesto / 12;
      
      // Calcular ahorro disponible (lo que queda después de gastos)
      const disponible = (presupuestoMensual + totalIngresosExtra) - totalGastos;
      
      // Solo guardar como disponible si es positivo
      setAhorroDisponible(disponible > 0 ? disponible : 0);
    };
    
    obtenerMetasAhorro();
    calcularAhorroDisponible();
  }, [presupuesto]);
  
  // Distribuir el ahorro disponible entre las metas
  const distribuirAhorro = () => {
    if (ahorroDisponible <= 0) {
      mostrarError('No hay ahorro disponible para distribuir');
      return;
    }
    
    const metasActivas = metasAhorro.filter(meta => !meta.completada);
    
    if (metasActivas.length === 0) {
      mostrarError('No hay metas de ahorro activas');
      return;
    }
    
    let metasActualizadas = [...metasAhorro];
    
    if (distribucionAutomatica) {
      // Distribuir equitativamente entre todas las metas activas
      const ahorroProporcion = ahorroDisponible / metasActivas.length;
      
      metasActualizadas = metasAhorro.map(meta => {
        if (meta.completada) return meta;
        
        const nuevoAhorroAcumulado = (meta.ahorroAcumulado || 0) + ahorroProporcion;
        const completada = nuevoAhorroAcumulado >= meta.monto;
        
        return {
          ...meta,
          ahorroAcumulado: completada ? meta.monto : nuevoAhorroAcumulado,
          completada
        };
      });
    } else {
      // Priorizar la meta más cercana a completarse
      // Ordenar metas por porcentaje de completitud
      const metasOrdenadas = [...metasActivas].sort((a, b) => {
        const pctA = ((a.ahorroAcumulado || 0) / a.monto) * 100;
        const pctB = ((b.ahorroAcumulado || 0) / b.monto) * 100;
        return pctB - pctA; // Mayor porcentaje primero
      });
      
      let ahorroRestante = ahorroDisponible;
      
      metasActualizadas = metasAhorro.map(meta => {
        if (meta.completada || ahorroRestante <= 0) return meta;
        
        const metaOrdenada = metasOrdenadas.find(m => m.id === meta.id);
        if (!metaOrdenada) return meta;
        
        const faltante = meta.monto - (meta.ahorroAcumulado || 0);
        const ahorroAsignado = Math.min(faltante, ahorroRestante);
        ahorroRestante -= ahorroAsignado;
        
        const nuevoAhorroAcumulado = (meta.ahorroAcumulado || 0) + ahorroAsignado;
        const completada = nuevoAhorroAcumulado >= meta.monto;
        
        return {
          ...meta,
          ahorroAcumulado: completada ? meta.monto : nuevoAhorroAcumulado,
          completada
        };
      });
    }
    
    // Guardar las metas actualizadas en localStorage
    localStorage.setItem('MetasAhorro', JSON.stringify(metasActualizadas));
    setMetasAhorro(metasActualizadas);
    setAhorroDisponible(0);
    
    mostrarExito('¡Ahorro distribuido correctamente!');
  };
  
  // Distribuir ahorro manualmente a una meta específica
  const distribuirAhorroAMeta = (id, monto) => {
    if (monto > ahorroDisponible) {
      mostrarError('La cantidad supera el ahorro disponible');
      return;
    }
    
    const metasActualizadas = metasAhorro.map(meta => {
      if (meta.id !== id) return meta;
      
      const nuevoAhorroAcumulado = (meta.ahorroAcumulado || 0) + monto;
      const completada = nuevoAhorroAcumulado >= meta.monto;
      
      return {
        ...meta,
        ahorroAcumulado: completada ? meta.monto : nuevoAhorroAcumulado,
        completada
      };
    });
    
    localStorage.setItem('MetasAhorro', JSON.stringify(metasActualizadas));
    setMetasAhorro(metasActualizadas);
    setAhorroDisponible(ahorroDisponible - monto);
    
    mostrarExito(`¡${monto.toFixed(2)} asignados correctamente!`);
  };

  // Ajustar ahorro de una meta (quitar o agregar)
  const ajustarAhorroMeta = (id, cantidadAjuste) => {
    const meta = metasAhorro.find(m => m.id === id);
    if (!meta) return;
    
    const ahorroActual = meta.ahorroAcumulado || 0;
    
    // Verificar que no se intente quitar más de lo ahorrado
    if (cantidadAjuste < 0 && Math.abs(cantidadAjuste) > ahorroActual) {
      mostrarError(`No puedes quitar más de lo ahorrado (${cantidad(ahorroActual)})`);
      return;
    }
    
    // Verificar que no se intente agregar más de lo disponible
    if (cantidadAjuste > 0 && cantidadAjuste > ahorroDisponible) {
      mostrarError(`No puedes agregar más de lo disponible (${cantidad(ahorroDisponible)})`);
      return;
    }
    
    const nuevoAhorroAcumulado = ahorroActual + cantidadAjuste;
    const completada = nuevoAhorroAcumulado >= meta.monto;
    
    const metasActualizadas = metasAhorro.map(m => {
      if (m.id !== id) return m;
      
      return {
        ...m,
        ahorroAcumulado: completada ? meta.monto : nuevoAhorroAcumulado,
        completada
      };
    });
    
    // Actualizar el ahorro disponible
    const nuevoAhorroDisponible = ahorroDisponible - cantidadAjuste;
    
    // Guardar cambios
    localStorage.setItem('MetasAhorro', JSON.stringify(metasActualizadas));
    setMetasAhorro(metasActualizadas);
    setAhorroDisponible(nuevoAhorroDisponible);
    
    // Mostrar mensaje de éxito
    const accion = cantidadAjuste > 0 ? 'agregados' : 'retirados';
    mostrarExito(`¡${Math.abs(cantidadAjuste).toFixed(2)} ${accion} correctamente!`);
    
    // Cerrar el modo edición
    setMetaEnEdicion(null);
    setCantidadAjuste('');
  };

  // Función para mostrar mensaje de éxito
  const mostrarExito = (mensaje) => {
    setMensajeExito(mensaje);
    setMensajeError('');
    setTimeout(() => {
      setMensajeExito('');
    }, 3000);
  };

  // Función para mostrar mensaje de error
  const mostrarError = (mensaje) => {
    setMensajeError(mensaje);
    setMensajeExito('');
    setTimeout(() => {
      setMensajeError('');
    }, 3000);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">Gestión de Ahorro</h2>
      </div>
      
      {mensajeExito && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
          <p>{mensajeExito}</p>
        </div>
      )}

      {mensajeError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p>{mensajeError}</p>
        </div>
      )}
      
      {/* Resumen de ahorro disponible */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-5">
          <h3 className="text-lg font-medium text-gray-900">Ahorro Disponible</h3>
          <div className="mt-4">
            <span className="text-3xl font-bold text-green-600">
              {cantidad(ahorroDisponible)}
            </span>
            <p className="mt-2 text-sm text-gray-500">
              Este es el dinero que puedes distribuir entre tus metas de ahorro.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="distribucionAutomatica"
                  checked={distribucionAutomatica}
                  onChange={() => setDistribucionAutomatica(!distribucionAutomatica)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="distribucionAutomatica" className="ml-2 text-sm text-gray-700">
                  Distribución automática equitativa
                </label>
              </div>
              <button
                onClick={distribuirAhorro}
                disabled={ahorroDisponible <= 0}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  ahorroDisponible > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Distribuir Ahorro
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Metas de ahorro */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Metas de Ahorro
          </h3>
        </div>
        
        {metasAhorro.filter(meta => !meta.completada).length > 0 ? (
          <div className="divide-y divide-gray-200">
            {metasAhorro
              .filter(meta => !meta.completada)
              .map(meta => {
                const progreso = meta.monto > 0 ? Math.min(100, Math.round((meta.ahorroAcumulado || 0) * 100 / meta.monto)) : 0;
                const faltante = meta.monto - (meta.ahorroAcumulado || 0);
                const enEdicion = metaEnEdicion === meta.id;
                
                return (
                  <div key={meta.id} className="p-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{meta.nombre}</h4>
                          <p className="text-sm text-gray-500">Meta: {cantidad(meta.monto)}</p>
                          <div className="mt-2 flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${progreso}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-700">
                              {progreso}%
                            </span>
                          </div>
                          <div className="mt-1 flex justify-between text-sm">
                            <span className="text-gray-500">Ahorrado: {cantidad(meta.ahorroAcumulado || 0)}</span>
                            <span className="text-gray-500">Falta: {cantidad(faltante)}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          {!enEdicion ? (
                            <>
                              <input
                                type="number"
                                min="0"
                                max={ahorroDisponible}
                                step="100"
                                placeholder="Cantidad"
                                className="block w-24 py-1 px-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                id={`cantidad-${meta.id}`}
                              />
                              <button
                                onClick={() => {
                                  const input = document.getElementById(`cantidad-${meta.id}`);
                                  const cantidad = parseFloat(input.value);
                                  if (isNaN(cantidad) || cantidad <= 0) {
                                    mostrarError('Ingresa una cantidad válida');
                                    return;
                                  }
                                  distribuirAhorroAMeta(meta.id, cantidad);
                                  input.value = '';
                                }}
                                disabled={ahorroDisponible <= 0}
                                className={`px-3 py-1 rounded text-sm font-medium ${
                                  ahorroDisponible > 0
                                    ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                              >
                                Asignar
                              </button>
                              <button
                                onClick={() => setMetaEnEdicion(meta.id)}
                                className="px-3 py-1 rounded text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                              >
                                Ajustar
                              </button>
                            </>
                          ) : (
                            <>
                              <div className="w-full flex flex-col gap-2">
                                <div className="flex flex-col sm:flex-row items-center gap-2">
                                  <input
                                    type="number"
                                    value={cantidadAjuste}
                                    onChange={(e) => setCantidadAjuste(e.target.value)}
                                    placeholder="Cantidad a ajustar"
                                    className="block w-full sm:w-36 py-1 px-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                  />
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => {
                                        const monto = parseFloat(cantidadAjuste);
                                        if (isNaN(monto) || monto === 0) {
                                          mostrarError('Ingresa una cantidad válida');
                                          return;
                                        }
                                        ajustarAhorroMeta(meta.id, monto);
                                      }}
                                      className="px-3 py-1 rounded text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200"
                                    >
                                      Agregar
                                    </button>
                                    <button
                                      onClick={() => {
                                        const monto = parseFloat(cantidadAjuste);
                                        if (isNaN(monto) || monto === 0) {
                                          mostrarError('Ingresa una cantidad válida');
                                          return;
                                        }
                                        ajustarAhorroMeta(meta.id, -monto);
                                      }}
                                      className="px-3 py-1 rounded text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200"
                                    >
                                      Quitar
                                    </button>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-500">
                                  (Para agregar/quitar del ahorro acumulado)
                                </p>
                                <button
                                  onClick={() => {
                                    setMetaEnEdicion(null);
                                    setCantidadAjuste('');
                                  }}
                                  className="px-3 py-1 rounded text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-500">No hay metas de ahorro activas</p>
          </div>
        )}
        
        {/* Metas completadas */}
        {metasAhorro.filter(meta => meta.completada).length > 0 && (
          <div>
            <div className="px-6 py-4 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-700">
                Metas Completadas
              </h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {metasAhorro
                .filter(meta => meta.completada)
                .map(meta => {
                  const enEdicion = metaEnEdicion === meta.id;
                  
                  return (
                    <div key={meta.id} className="p-6 bg-gray-50">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{meta.nombre}</h4>
                          <p className="text-sm text-green-600">Meta alcanzada: {cantidad(meta.monto)}</p>
                        </div>
                        {!enEdicion ? (
                          <div className="flex space-x-2">
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                              Completada
                            </span>
                            <button
                              onClick={() => setMetaEnEdicion(meta.id)}
                              className="px-3 py-1 rounded text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                            >
                              Ajustar
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={cantidadAjuste}
                                onChange={(e) => setCantidadAjuste(e.target.value)}
                                placeholder="Cantidad a quitar"
                                className="block w-36 py-1 px-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                              />
                              <button
                                onClick={() => {
                                  const monto = parseFloat(cantidadAjuste);
                                  if (isNaN(monto) || monto === 0) {
                                    mostrarError('Ingresa una cantidad válida');
                                    return;
                                  }
                                  ajustarAhorroMeta(meta.id, -monto);
                                }}
                                className="px-3 py-1 rounded text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200"
                              >
                                Quitar
                              </button>
                            </div>
                            <button
                              onClick={() => {
                                setMetaEnEdicion(null);
                                setCantidadAjuste('');
                              }}
                              className="px-3 py-1 rounded text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                            >
                              Cancelar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}