import { useState, useEffect } from "react";

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    categoria: "",
    precio_compra: "",
    precio_venta: "",
    stock_minimo: "",
    stock_actual: "",
    unidad_medida: "unidad",
    activo: true
  });

  const categorias = [
    "Electrónicos",
    "Ropa y Accesorios", 
    "Hogar y Jardín",
    "Deportes",
    "Libros y Medios",
    "Salud y Belleza",
    "Alimentos y Bebidas",
    "Otros"
  ];

  const unidadesMedida = [
    "unidad",
    "kilogramo",
    "gramo",
    "litro",
    "metro",
    "centímetro",
    "caja",
    "paquete"
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingProduct) {
      // Editar producto existente
      const productosActualizados = productos.map(p => 
        p.id === editingProduct.id 
          ? { ...formData, id: editingProduct.id, fecha_actualizacion: new Date().toISOString() }
          : p
      );
      saveProductos(productosActualizados);
    } else {
      // Crear nuevo producto
      const nuevoProducto = {
        ...formData,
        id: Date.now(),
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString()
      };
      saveProductos([...productos, nuevoProducto]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      codigo: "",
      nombre: "",
      descripcion: "",
      categoria: "",
      precio_compra: "",
      precio_venta: "",
      stock_minimo: "",
      stock_actual: "",
      unidad_medida: "unidad",
      activo: true
    });
    setEditingProduct(null);
    setShowModal(false);
  };

  const handleEdit = (producto) => {
    setFormData(producto);
    setEditingProduct(producto);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      const productosActualizados = productos.filter(p => p.id !== id);
      saveProductos(productosActualizados);
    }
  };

  const toggleActive = (id) => {
    const productosActualizados = productos.map(p => 
      p.id === id ? { ...p, activo: !p.activo } : p
    );
    saveProductos(productosActualizados);
  };

  const filteredProductos = productos.filter(producto => {
    const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         producto.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || producto.categoria === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (actual, minimo) => {
    if (actual <= 0) return { status: "sin-stock", color: "text-red-600", bg: "bg-red-50" };
    if (actual <= minimo) return { status: "stock-bajo", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { status: "stock-ok", color: "text-green-600", bg: "bg-green-50" };
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Productos</h1>
        <p className="text-gray-600">Administra tu catálogo de productos e inventario</p>
      </div>

      {/* Controles superiores */}
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
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categorias.map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Agregar Producto
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Productos</p>
              <p className="text-2xl font-bold text-gray-900">{productos.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Productos Activos</p>
              <p className="text-2xl font-bold text-gray-900">{productos.filter(p => p.activo).length}</p>
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
              <p className="text-2xl font-bold text-gray-900">
                {productos.filter(p => p.stock_actual <= p.stock_minimo && p.stock_actual > 0).length}
              </p>
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
              <p className="text-2xl font-bold text-gray-900">
                {productos.filter(p => p.stock_actual <= 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precios</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProductos.map((producto) => {
                const stockStatus = getStockStatus(producto.stock_actual, producto.stock_minimo);
                return (
                  <tr key={producto.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{producto.nombre}</div>
                        <div className="text-sm text-gray-500">Código: {producto.codigo}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {producto.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>Compra: ${parseFloat(producto.precio_compra || 0).toLocaleString()}</div>
                      <div>Venta: ${parseFloat(producto.precio_venta || 0).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                        {producto.stock_actual} {producto.unidad_medida}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Mín: {producto.stock_minimo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(producto.id)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          producto.activo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {producto.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(producto)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Editar"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(producto.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Eliminar"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

        {filteredProductos.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
            <p className="mt-1 text-sm text-gray-500">Comienza agregando tu primer producto.</p>
          </div>
        )}
      </div>

      {/* Modal para agregar/editar producto */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.codigo}
                    onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.categoria}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map(categoria => (
                      <option key={categoria} value={categoria}>{categoria}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unidad de Medida
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.unidad_medida}
                    onChange={(e) => setFormData({...formData, unidad_medida: e.target.value})}
                  >
                    {unidadesMedida.map(unidad => (
                      <option key={unidad} value={unidad}>{unidad}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio de Compra
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.precio_compra}
                    onChange={(e) => setFormData({...formData, precio_compra: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio de Venta *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.precio_venta}
                    onChange={(e) => setFormData({...formData, precio_venta: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Actual *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.stock_actual}
                    onChange={(e) => setFormData({...formData, stock_actual: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Mínimo *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.stock_minimo}
                    onChange={(e) => setFormData({...formData, stock_minimo: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="activo"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={formData.activo}
                    onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                  />
                  <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
                    Producto activo
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {editingProduct ? 'Actualizar' : 'Crear'} Producto
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

Productos.propTypes = {
  // Agregar PropTypes si necesitas pasar props desde el componente padre
};