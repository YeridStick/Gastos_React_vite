import { useState, useEffect } from "react";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const [formData, setFormData] = useState({
    tipo_documento: "CC",
    numero_documento: "",
    nombre: "",
    apellidos: "",
    razon_social: "",
    tipo_persona: "natural", // natural, juridica
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    departamento: "",
    codigo_postal: "",
    activo: true,
    regimen_tributario: "simplificado", // simplificado, comun
    responsabilidades_fiscales: []
  });

  useEffect(() => {
    // Cargar clientes del localStorage
    const clientesGuardados = localStorage.getItem("clientes");
    if (clientesGuardados) {
      setClientes(JSON.parse(clientesGuardados));
    }
  }, []);

  const saveClientes = (nuevosClientes) => {
    localStorage.setItem("clientes", JSON.stringify(nuevosClientes));
    setClientes(nuevosClientes);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.numero_documento || !formData.nombre) {
      alert("Completa los campos obligatorios");
      return;
    }

    // Verificar si ya existe el documento
    const documentoExiste = clientes.some(c => 
      c.numero_documento === formData.numero_documento && 
      (!editingCliente || c.id !== editingCliente.id)
    );

    if (documentoExiste) {
      alert("Ya existe un cliente con este número de documento");
      return;
    }

    if (editingCliente) {
      // Editar cliente existente
      const clientesActualizados = clientes.map(c => 
        c.id === editingCliente.id 
          ? { ...formData, id: editingCliente.id, fecha_actualizacion: new Date().toISOString() }
          : c
      );
      saveClientes(clientesActualizados);
      alert("Cliente actualizado correctamente");
    } else {
      // Crear nuevo cliente
      const nuevoCliente = {
        ...formData,
        id: Date.now(),
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString()
      };
      saveClientes([...clientes, nuevoCliente]);
      alert("Cliente creado correctamente");
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      tipo_documento: "CC",
      numero_documento: "",
      nombre: "",
      apellidos: "",
      razon_social: "",
      tipo_persona: "natural",
      email: "",
      telefono: "",
      direccion: "",
      ciudad: "",
      departamento: "",
      codigo_postal: "",
      activo: true,
      regimen_tributario: "simplificado",
      responsabilidades_fiscales: []
    });
    setEditingCliente(null);
    setShowModal(false);
  };

  const handleEdit = (cliente) => {
    setFormData(cliente);
    setEditingCliente(cliente);
    setShowModal(true);
  };

  const toggleStatus = (id) => {
    const clientesActualizados = clientes.map(c => 
      c.id === id 
        ? { ...c, activo: !c.activo, fecha_actualizacion: new Date().toISOString() }
        : c
    );
    saveClientes(clientesActualizados);
    alert("Estado del cliente actualizado");
  };

  const deleteCliente = (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este cliente?")) {
      const clientesActualizados = clientes.filter(c => c.id !== id);
      saveClientes(clientesActualizados);
      alert("Cliente eliminado correctamente");
    }
  };

  const exportarClientes = () => {
    if (clientes.length === 0) {
      alert("No hay clientes para exportar");
      return;
    }

    const csv = [
      "Tipo Documento,Número Documento,Nombre,Apellidos,Email,Teléfono,Ciudad,Estado",
      ...clientes.map(c => 
        `${c.tipo_documento},${c.numero_documento},"${c.nombre}","${c.apellidos || ''}","${c.email}","${c.telefono}","${c.ciudad}",${c.activo ? 'Activo' : 'Inactivo'}`
      )
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredClientes = clientes.filter(cliente => {
    const matchesSearch = cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cliente.numero_documento.includes(searchTerm) ||
                         (cliente.apellidos && cliente.apellidos.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTipo = !tipoFilter || cliente.tipo_persona === tipoFilter;
    
    return matchesSearch && matchesTipo;
  });

  const stats = {
    total: clientes.length,
    activos: clientes.filter(c => c.activo).length,
    inactivos: clientes.filter(c => !c.activo).length,
    naturales: clientes.filter(c => c.tipo_persona === "natural").length,
    juridicas: clientes.filter(c => c.tipo_persona === "juridica").length
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Clientes</h1>
        <p className="text-gray-600">Administra la información de tus clientes para facturación electrónica</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Clientes</p>
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
              <p className="text-sm font-medium text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactivos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactivos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Personas Naturales</p>
              <p className="text-2xl font-bold text-gray-900">{stats.naturales}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Personas Jurídicas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.juridicas}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controles superiores */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar clientes..."
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
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
            >
              <option value="">Todos los tipos</option>
              <option value="natural">Persona Natural</option>
              <option value="juridica">Persona Jurídica</option>
            </select>

            <button
              onClick={exportarClientes}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar CSV
            </button>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Tabla de clientes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {cliente.tipo_persona === "natural" 
                          ? `${cliente.nombre} ${cliente.apellidos || ''}`
                          : cliente.razon_social || cliente.nombre
                        }
                      </div>
                      <div className="text-sm text-gray-500">{cliente.ciudad}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{cliente.tipo_documento} {cliente.numero_documento}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{cliente.email}</div>
                      <div className="text-sm text-gray-500">{cliente.telefono}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      cliente.tipo_persona === "natural" 
                        ? "bg-purple-100 text-purple-800" 
                        : "bg-indigo-100 text-indigo-800"
                    }`}>
                      {cliente.tipo_persona === "natural" ? "Natural" : "Jurídica"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      cliente.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {cliente.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(cliente)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Editar"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => toggleStatus(cliente.id)}
                        className={`p-1 ${cliente.activo ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                        title={cliente.activo ? "Desactivar" : "Activar"}
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                      </button>

                      <button
                        onClick={() => deleteCliente(cliente.id)}
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
              ))}
            </tbody>
          </table>
        </div>

        {filteredClientes.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay clientes</h3>
            <p className="mt-1 text-sm text-gray-500">Comienza agregando tu primer cliente.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Nuevo Cliente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal para crear/editar cliente */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Persona *
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.tipo_persona}
                      onChange={(e) => setFormData({...formData, tipo_persona: e.target.value})}
                    >
                      <option value="natural">Persona Natural</option>
                      <option value="juridica">Persona Jurídica</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Documento *
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.tipo_documento}
                      onChange={(e) => setFormData({...formData, tipo_documento: e.target.value})}
                    >
                      <option value="CC">Cédula de Ciudadanía</option>
                      <option value="CE">Cédula de Extranjería</option>
                      <option value="NIT">NIT</option>
                      <option value="TI">Tarjeta de Identidad</option>
                      <option value="PP">Pasaporte</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Documento *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.numero_documento}
                    onChange={(e) => setFormData({...formData, numero_documento: e.target.value})}
                    placeholder="Número de documento"
                  />
                </div>

                {formData.tipo_persona === "natural" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombres *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.nombre}
                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                        placeholder="Nombres"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Apellidos
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.apellidos}
                        onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                        placeholder="Apellidos"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Razón Social *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.razon_social}
                      onChange={(e) => setFormData({...formData, razon_social: e.target.value})}
                      placeholder="Razón social de la empresa"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="email@ejemplo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.telefono}
                      onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                      placeholder="Número de teléfono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.direccion}
                    onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                    placeholder="Dirección completa"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.ciudad}
                      onChange={(e) => setFormData({...formData, ciudad: e.target.value})}
                      placeholder="Ciudad"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departamento
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.departamento}
                      onChange={(e) => setFormData({...formData, departamento: e.target.value})}
                      placeholder="Departamento"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="activo"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={formData.activo}
                    onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                  />
                  <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
                    Cliente activo
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
                  {editingCliente ? 'Actualizar' : 'Crear'} Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

Clientes.propTypes = {
  // Agregar PropTypes si necesitas pasar props desde el componente padre
};