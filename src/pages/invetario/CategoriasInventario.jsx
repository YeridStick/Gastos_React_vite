import { useState, useEffect } from "react";

export default function CategoriasInventario() {
  const [categorias, setCategorias] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    activa: true
  });

  useEffect(() => {
    // Cargar categorías del localStorage
    const categoriasGuardadas = localStorage.getItem("categorias_inventario");
    if (categoriasGuardadas) {
      setCategorias(JSON.parse(categoriasGuardadas));
    } else {
      // Inicializar con categorías por defecto
      const categoriasDefault = [
        { id: 1, nombre: "Electrónicos", descripcion: "Dispositivos electrónicos y tecnología", activa: true, productos_count: 0 },
        { id: 2, nombre: "Ropa y Accesorios", descripcion: "Vestimenta y complementos", activa: true, productos_count: 0 },
        { id: 3, nombre: "Hogar y Jardín", descripcion: "Artículos para el hogar y jardín", activa: true, productos_count: 0 },
        { id: 4, nombre: "Deportes", descripcion: "Equipamiento deportivo y fitness", activa: true, productos_count: 0 },
        { id: 5, nombre: "Salud y Belleza", descripcion: "Productos de cuidado personal", activa: true, productos_count: 0 }
      ];
      setCategorias(categoriasDefault);
      localStorage.setItem("categorias_inventario", JSON.stringify(categoriasDefault));
    }
  }, []);

  const saveCategorias = (nuevasCategorias) => {
    localStorage.setItem("categorias_inventario", JSON.stringify(nuevasCategorias));
    setCategorias(nuevasCategorias);
  };

  const updateProductCount = () => {
    // Actualizar el conteo de productos por categoría
    const productos = JSON.parse(localStorage.getItem("productos") || "[]");
    const categoriasActualizadas = categorias.map(cat => ({
      ...cat,
      productos_count: productos.filter(p => p.categoria === cat.nombre).length
    }));
    saveCategorias(categoriasActualizadas);
  };

  useEffect(() => {
    updateProductCount();
  }, [categorias.length]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingCategoria) {
      // Editar categoría existente
      const categoriasActualizadas = categorias.map(c => 
        c.id === editingCategoria.id 
          ? { ...formData, id: editingCategoria.id, fecha_actualizacion: new Date().toISOString() }
          : c
      );
      saveCategorias(categoriasActualizadas);
    } else {
      // Crear nueva categoría
      const nuevaCategoria = {
        ...formData,
        id: Date.now(),
        productos_count: 0,
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString()
      };
      saveCategorias([...categorias, nuevaCategoria]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      activa: true
    });
    setEditingCategoria(null);
    setShowModal(false);
  };

  const handleEdit = (categoria) => {
    setFormData(categoria);
    setEditingCategoria(categoria);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    const categoria = categorias.find(c => c.id === id);
    
    if (categoria.productos_count > 0) {
      alert(`No puedes eliminar esta categoría porque tiene ${categoria.productos_count} productos asignados.`);
      return;
    }

    if (window.confirm("¿Estás seguro de que quieres eliminar esta categoría?")) {
      const categoriasActualizadas = categorias.filter(c => c.id !== id);
      saveCategorias(categoriasActualizadas);
    }
  };

  const toggleActive = (id) => {
    const categoriasActualizadas = categorias.map(c => 
      c.id === id ? { ...c, activa: !c.activa } : c
    );
    saveCategorias(categoriasActualizadas);
  };

  const filteredCategorias = categorias.filter(categoria => 
    categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    categoria.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: categorias.length,
    activas: categorias.filter(c => c.activa).length,
    inactivas: categorias.filter(c => !c.activa).length,
    conProductos: categorias.filter(c => c.productos_count > 0).length
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Categorías de Inventario</h1>
        <p className="text-gray-600">Organiza tus productos por categorías para facilitar su gestión</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Categorías</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
              <p className="text-sm font-medium text-gray-600">Activas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activas}</p>
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
              <p className="text-sm font-medium text-gray-600">Inactivas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactivas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Con Productos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.conProductos}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controles superiores */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar categorías..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Nueva Categoría
          </button>
        </div>
      </div>

      {/* Grid de categorías */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategorias.map((categoria) => (
          <div key={categoria.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{categoria.nombre}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    categoria.activa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {categoria.activa ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEdit(categoria)}
                  className="text-gray-400 hover:text-blue-600 p-1"
                  title="Editar"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(categoria.id)}
                  className="text-gray-400 hover:text-red-600 p-1"
                  title="Eliminar"
                  disabled={categoria.productos_count > 0}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4">{categoria.descripcion}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                {categoria.productos_count} productos
              </div>

              <button
                onClick={() => toggleActive(categoria.id)}
                className={`text-sm font-medium px-3 py-1 rounded-full transition-colors ${
                  categoria.activa 
                    ? 'text-red-700 hover:bg-red-50' 
                    : 'text-green-700 hover:bg-green-50'
                }`}
              >
                {categoria.activa ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCategorias.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay categorías</h3>
          <p className="mt-1 text-sm text-gray-500">
            {categorias.length === 0 
              ? "Comienza creando tu primera categoría de inventario."
              : "No hay categorías que coincidan con tu búsqueda."
            }
          </p>
        </div>
      )}

      {/* Modal para agregar/editar categoría */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4">
              <div className="space-y-4">
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
                    placeholder="Nombre de la categoría"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    placeholder="Descripción de la categoría"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="activa"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={formData.activa}
                    onChange={(e) => setFormData({...formData, activa: e.target.checked})}
                  />
                  <label htmlFor="activa" className="ml-2 block text-sm text-gray-900">
                    Categoría activa
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  {editingCategoria ? 'Actualizar' : 'Crear'} Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

CategoriasInventario.propTypes = {
  // Agregar PropTypes si necesitas pasar props desde el componente padre
};