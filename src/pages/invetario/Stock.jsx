import { useState, useEffect } from "react";

export default function Stock() {
  const [productos, setProductos] = useState([]);
  const [showAjusteModal, setShowAjusteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [ajusteData, setAjusteData] = useState({
    tipo: "entrada", // entrada, salida, ajuste
    cantidad: "",
    motivo: "",
    observaciones: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("todos");

  const motivosEntrada = [
    "Compra",
    "Devolución de cliente",
    "Ajuste de inventario",
    "Producción",
    "Transferencia entre almacenes",
    "Otro"
  ];

  const motivosSalida = [
    "Venta",
    "Merma",
    "Daño",
    "Robo",
    "Devolución a proveedor",
    "Muestra gratuita",
    "Uso interno",
    "Otro"
  ];

  useEffect(() => {
    // Cargar productos del localStorage
    const productosGuardados = localStorage.getItem("productos");
    if (productosGuardados) {
      setProductos(JSON.parse(productosGuardados));
    }
  }, []);

  const saveProductos = (nuevosProductos) => {
    localStorage.setItem("productos", JSON.stringify(nuevosProductos));
    setProductos(nuevosProductos);
  };

  const registrarMovimiento = (movimiento) => {
    const movimientos = JSON.parse(localStorage.getItem("movimientos") || "[]");
    const nuevoMovimiento = {
      id: Date.now(),
      ...movimiento,
      fecha: new Date().toISOString(),
      usuario: "Usuario actual" // En una app real, esto vendría del sistema de autenticación
    };
    localStorage.setItem("movimientos", JSON.stringify([...movimientos, nuevoMovimiento]));
  };

  const handleAjusteStock = (e) => {
    e.preventDefault();
    
    if (!selectedProduct) return;

    const cantidad = parseFloat(ajusteData.cantidad);
    if (!cantidad || cantidad <= 0) {
      alert("Ingresa una cantidad válida");
      return;
    }

    let nuevoStock = selectedProduct.stock_actual;
    
    switch (ajusteData.tipo) {
      case "entrada":
        nuevoStock += cantidad;
        break;
      case "salida":
        nuevoStock -= cantidad;
        if (nuevoStock < 0) {
          alert("No puedes reducir el stock por debajo de 0");
          return;
        }
        break;
      case "ajuste":
        nuevoStock = cantidad;
        break;
    }

    // Actualizar el producto
    const productosActualizados = productos.map(p => 
      p.id === selectedProduct.id 
        ? { ...p, stock_actual: nuevoStock, fecha_actualizacion: new Date().toISOString() }
        : p
    );
    saveProductos(productosActualizados);

    // Registrar el movimiento
    registrarMovimiento({
      producto_id: selectedProduct.id,
      producto_nombre: selectedProduct.nombre,
      producto_codigo: selectedProduct.codigo,
      tipo: ajusteData.tipo,
      cantidad: cantidad,
      stock_anterior: selectedProduct.stock_actual,
      stock_nuevo: nuevoStock,
      motivo: ajusteData.motivo,
      observaciones: ajusteData.observaciones
    });

    // Resetear form
    setAjusteData({
      tipo: "entrada",
      cantidad: "",
      motivo: "",
      observaciones: ""
    });
    setSelectedProduct(null);
    setShowAjusteModal(false);

    alert("Stock actualizado correctamente");
  };

  const getStockStatus = (actual, minimo) => {
    if (actual <= 0) return { status: "sin-stock", color: "text-red-600", bg: "bg-red-50", text: "Sin Stock" };
    if (actual <= minimo) return { status: "stock-bajo", color: "text-yellow-600", bg: "bg-yellow-50", text: "Stock Bajo" };
    return { status: "stock-ok", color: "text-green-600", bg: "bg-green-50", text: "Stock Normal" };
  };

  const filteredProductos = productos.filter(producto => {
    const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         producto.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    switch (stockFilter) {
      case "sin-stock":
        matchesFilter = producto.stock_actual <= 0;
        break;
      case "stock-bajo":
        matchesFilter = producto.stock_actual > 0 && producto.stock_actual <= producto.stock_minimo;
        break;
      case "stock-normal":
        matchesFilter = producto.stock_actual > producto.stock_minimo;
        break;
      default:
        matchesFilter = true;
    }
    
    return matchesSearch && matchesFilter;
  });

  const stockStats = {
    sinStock: productos.filter(p => p.stock_actual <= 0).length,
    stockBajo: productos.filter(p => p.stock_actual > 0 && p.stock_actual <= p.stock_minimo).length,
    stockNormal: productos.filter(p => p.stock_actual > p.stock_minimo).length,
    valorTotal: productos.reduce((total, p) => total + (p.stock_actual * parseFloat(p.precio_compra || 0)), 0)
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Control de Stock</h1>
        <p className="text-gray-600">Monitorea y ajusta el inventario de tus productos</p>
      </div>

      {/* Estadísticas de stock */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Stock Normal</p>
              <p className="text-2xl font-bold text-gray-900">{stockStats.stockNormal}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
              <p className="text-2xl font-bold text-gray-900">{stockStats.stockBajo}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sin Stock</p>
              <p className="text-2xl font-bold text-gray-900">{stockStats.sinStock}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900">${stockStats.valorTotal.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de filtrado */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar productos..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="todos">Todos los productos</option>
              <option value="sin-stock">Sin stock</option>
              <option value="stock-bajo">Stock bajo</option>
              <option value="stock-normal">Stock normal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de stock */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Actual</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Mínimo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Stock</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProductos.map((producto) => {
                const stockStatus = getStockStatus(producto.stock_actual, producto.stock_minimo);
                const valorStock = producto.stock_actual * parseFloat(producto.precio_compra || 0);
                
                return (
                  <tr key={producto.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{producto.nombre}</div>
                        <div className="text-sm text-gray-500">Código: {producto.codigo}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {producto.stock_actual} {producto.unidad_medida}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {producto.stock_minimo} {producto.unidad_medida}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                        {stockStatus.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${valorStock.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedProduct(producto);
                          setShowAjusteModal(true);
                        }}
                        className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        Ajustar Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProductos.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos que mostrar</h3>
            <p className="mt-1 text-sm text-gray-500">Ajusta tus filtros o agrega productos al inventario.</p>
          </div>
        )}
      </div>

      {/* Modal para ajustar stock */}
      {showAjusteModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Ajustar Stock</h3>
              <p className="text-sm text-gray-500 mt-1">
                {selectedProduct.nombre} - Stock actual: {selectedProduct.stock_actual} {selectedProduct.unidad_medida}
              </p>
            </div>

            <form onSubmit={handleAjusteStock} className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Movimiento *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={ajusteData.tipo}
                    onChange={(e) => setAjusteData({...ajusteData, tipo: e.target.value, motivo: ""})}
                  >
                    <option value="entrada">Entrada (+)</option>
                    <option value="salida">Salida (-)</option>
                    <option value="ajuste">Ajuste (Establecer cantidad exacta)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {ajusteData.tipo === "ajuste" ? "Nueva Cantidad *" : "Cantidad *"}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={ajusteData.cantidad}
                    onChange={(e) => setAjusteData({...ajusteData, cantidad: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={ajusteData.motivo}
                    onChange={(e) => setAjusteData({...ajusteData, motivo: e.target.value})}
                  >
                    <option value="">Seleccionar motivo</option>
                    {ajusteData.tipo === "entrada" || ajusteData.tipo === "ajuste" 
                      ? motivosEntrada.map(motivo => (
                          <option key={motivo} value={motivo}>{motivo}</option>
                        ))
                      : motivosSalida.map(motivo => (
                          <option key={motivo} value={motivo}>{motivo}</option>
                        ))
                    }
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observaciones
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={ajusteData.observaciones}
                    onChange={(e) => setAjusteData({...ajusteData, observaciones: e.target.value})}
                    placeholder="Información adicional sobre el movimiento..."
                  />
                </div>

                {ajusteData.tipo && ajusteData.cantidad && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-600">
                      <strong>Resultado:</strong> Stock {
                        ajusteData.tipo === "entrada" 
                          ? `${selectedProduct.stock_actual} + ${ajusteData.cantidad} = ${selectedProduct.stock_actual + parseFloat(ajusteData.cantidad || 0)}`
                          : ajusteData.tipo === "salida"
                          ? `${selectedProduct.stock_actual} - ${ajusteData.cantidad} = ${selectedProduct.stock_actual - parseFloat(ajusteData.cantidad || 0)}`
                          : `${ajusteData.cantidad}`
                      } {selectedProduct.unidad_medida}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAjusteModal(false);
                    setSelectedProduct(null);
                    setAjusteData({
                      tipo: "entrada",
                      cantidad: "",
                      motivo: "",
                      observaciones: ""
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Aplicar Cambio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

Stock.propTypes = {
  // Agregar PropTypes si necesitas pasar props desde el componente padre
};