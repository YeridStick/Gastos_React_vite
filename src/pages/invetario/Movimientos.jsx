import { useState, useEffect } from "react";

export default function Movimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const [motivoFilter, setMotivoFilter] = useState("");

  useEffect(() => {
    // Cargar movimientos del localStorage
    const movimientosGuardados = localStorage.getItem("movimientos");
    if (movimientosGuardados) {
      setMovimientos(JSON.parse(movimientosGuardados).sort((a, b) => 
        new Date(b.fecha) - new Date(a.fecha)
      ));
    }
  }, []);

  const filteredMovimientos = movimientos.filter(movimiento => {
    const matchesSearch = movimiento.producto_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movimiento.producto_codigo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo = !tipoFilter || movimiento.tipo === tipoFilter;
    const matchesMotivo = !motivoFilter || movimiento.motivo === motivoFilter;
    
    const movimientoDate = new Date(movimiento.fecha).toISOString().split('T')[0];
    const matchesDateFrom = !dateFrom || movimientoDate >= dateFrom;
    const matchesDateTo = !dateTo || movimientoDate <= dateTo;
    
    return matchesSearch && matchesTipo && matchesMotivo && matchesDateFrom && matchesDateTo;
  });

  const getMovimientoIcon = (tipo) => {
    switch (tipo) {
      case "entrada":
        return (
          <div className="p-2 bg-green-100 rounded-lg">
            <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
        );
      case "salida":
        return (
          <div className="p-2 bg-red-100 rounded-lg">
            <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
            </svg>
          </div>
        );
      case "ajuste":
        return (
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="p-2 bg-gray-100 rounded-lg">
            <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
        );
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case "entrada":
        return "bg-green-100 text-green-800";
      case "salida":
        return "bg-red-100 text-red-800";
      case "ajuste":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = {
    totalMovimientos: movimientos.length,
    entradas: movimientos.filter(m => m.tipo === "entrada").length,
    salidas: movimientos.filter(m => m.tipo === "salida").length,
    ajustes: movimientos.filter(m => m.tipo === "ajuste").length
  };

  const motivosUnicos = [...new Set(movimientos.map(m => m.motivo))].filter(Boolean);

  const clearFilters = () => {
    setSearchTerm("");
    setDateFrom("");
    setDateTo("");
    setTipoFilter("");
    setMotivoFilter("");
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Movimientos de Inventario</h1>
        <p className="text-gray-600">Historial completo de entradas, salidas y ajustes de stock</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Movimientos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMovimientos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Entradas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.entradas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Salidas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.salidas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ajustes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.ajustes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Producto o código..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
            >
              <option value="">Todos los tipos</option>
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
              <option value="ajuste">Ajuste</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={motivoFilter}
              onChange={(e) => setMotivoFilter(e.target.value)}
            >
              <option value="">Todos los motivos</option>
              {motivosUnicos.map(motivo => (
                <option key={motivo} value={motivo}>{motivo}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Mostrando {filteredMovimientos.length} de {movimientos.length} movimientos
          </p>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Lista de movimientos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredMovimientos.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredMovimientos.map((movimiento) => (
              <div key={movimiento.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {getMovimientoIcon(movimiento.tipo)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {movimiento.producto_nombre}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoColor(movimiento.tipo)}`}>
                          {movimiento.tipo === "entrada" ? "Entrada" : 
                           movimiento.tipo === "salida" ? "Salida" : "Ajuste"}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-2">
                        Código: {movimiento.producto_codigo} • Motivo: {movimiento.motivo}
                      </p>
                      
                      <div className="flex items-center text-sm text-gray-600 space-x-4">
                        <div className="flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatDate(movimiento.fecha)}
                        </div>
                        
                        <div className="flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {movimiento.usuario}
                        </div>
                      </div>

                      {movimiento.observaciones && (
                        <p className="text-sm text-gray-600 mt-2 italic">
                          {movimiento.observaciones}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900 mb-1">
                      {movimiento.tipo === "entrada" ? "+" : movimiento.tipo === "salida" ? "-" : ""}
                      {movimiento.cantidad}
                    </div>
                    
                    {movimiento.stock_anterior !== undefined && movimiento.stock_nuevo !== undefined && (
                      <div className="text-xs text-gray-500">
                        {movimiento.stock_anterior} → {movimiento.stock_nuevo}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay movimientos</h3>
            <p className="mt-1 text-sm text-gray-500">
              {movimientos.length === 0 
                ? "Aún no se han registrado movimientos de inventario."
                : "No hay movimientos que coincidan con los filtros aplicados."
              }
            </p>
          </div>
        )}
      </div>

      {/* Paginación (opcional - implementar si hay muchos movimientos) */}
      {filteredMovimientos.length > 50 && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6 mt-6 rounded-lg">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Anterior
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">1</span> a <span className="font-medium">50</span> de{' '}
                <span className="font-medium">{filteredMovimientos.length}</span> resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Anterior</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Siguiente</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Movimientos.propTypes = {
  // Agregar PropTypes si necesitas pasar props desde el componente padre
};