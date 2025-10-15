import { useState, useEffect } from "react";

export default function Cotizaciones() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCotizacion, setEditingCotizacion] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formData, setFormData] = useState({
    numero: "",
    fecha: new Date().toISOString().split('T')[0],
    fecha_vencimiento: "",
    cliente_id: "",
    cliente_nombre: "",
    cliente_documento: "",
    cliente_email: "",
    subtotal: 0,
    descuento: 0,
    iva: 0,
    total: 0,
    estado: "borrador", // borrador, enviada, aprobada, rechazada, vencida
    observaciones: "",
    validez_dias: 30,
    condiciones: ""
  });

  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    // Cargar cotizaciones y clientes del localStorage
    const cotizacionesGuardadas = localStorage.getItem("cotizaciones");
    if (cotizacionesGuardadas) {
      setCotizaciones(JSON.parse(cotizacionesGuardadas));
    }

    const clientesGuardados = localStorage.getItem("clientes");
    if (clientesGuardados) {
      setClientes(JSON.parse(clientesGuardados));
    }
  }, []);

  const saveCotizaciones = (nuevasCotizaciones) => {
    localStorage.setItem("cotizaciones", JSON.stringify(nuevasCotizaciones));
    setCotizaciones(nuevasCotizaciones);
  };

  const generateCotizacionNumber = () => {
    const lastCotizacion = cotizaciones.sort((a, b) => parseInt(b.numero) - parseInt(a.numero))[0];
    const nextNumber = lastCotizacion ? parseInt(lastCotizacion.numero) + 1 : 1;
    return nextNumber.toString().padStart(6, '0');
  };

  const calculateTotals = (subtotal, descuento = 0) => {
    const subtotalConDescuento = subtotal - (subtotal * descuento / 100);
    const iva = subtotalConDescuento * 0.19; // IVA 19% Colombia
    const total = subtotalConDescuento + iva;
    return { subtotal: subtotalConDescuento, iva, total };
  };

  const handleClienteChange = (clienteId) => {
    const cliente = clientes.find(c => c.id === parseInt(clienteId));
    if (cliente) {
      setFormData({
        ...formData,
        cliente_id: clienteId,
        cliente_nombre: cliente.tipo_persona === "natural" 
          ? `${cliente.nombre} ${cliente.apellidos || ''}`
          : cliente.razon_social || cliente.nombre,
        cliente_documento: cliente.numero_documento,
        cliente_email: cliente.email
      });
    } else {
      setFormData({
        ...formData,
        cliente_id: "",
        cliente_nombre: "",
        cliente_documento: "",
        cliente_email: ""
      });
    }
  };

  const handleSubtotalChange = (value) => {
    const subtotal = parseFloat(value) || 0;
    const totals = calculateTotals(subtotal, formData.descuento);
    setFormData({...formData, subtotal, ...totals});
  };

  const handleDescuentoChange = (value) => {
    const descuento = parseFloat(value) || 0;
    const totals = calculateTotals(formData.subtotal, descuento);
    setFormData({...formData, descuento, ...totals});
  };

  const calculateFechaVencimiento = (fecha, dias) => {
    const fechaBase = new Date(fecha);
    fechaBase.setDate(fechaBase.getDate() + dias);
    return fechaBase.toISOString().split('T')[0];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.cliente_nombre || formData.subtotal <= 0) {
      alert("Completa los campos obligatorios");
      return;
    }

    const fechaVencimiento = calculateFechaVencimiento(formData.fecha, formData.validez_dias);

    if (editingCotizacion) {
      // Editar cotización existente
      const cotizacionesActualizadas = cotizaciones.map(c => 
        c.id === editingCotizacion.id 
          ? { 
              ...formData, 
              id: editingCotizacion.id, 
              fecha_vencimiento: fechaVencimiento,
              fecha_actualizacion: new Date().toISOString() 
            }
          : c
      );
      saveCotizaciones(cotizacionesActualizadas);
      alert("Cotización actualizada correctamente");
    } else {
      // Crear nueva cotización
      const nuevaCotizacion = {
        ...formData,
        id: Date.now(),
        numero: generateCotizacionNumber(),
        fecha_vencimiento: fechaVencimiento,
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString()
      };
      saveCotizaciones([...cotizaciones, nuevaCotizacion]);
      alert("Cotización creada correctamente");
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      numero: "",
      fecha: new Date().toISOString().split('T')[0],
      fecha_vencimiento: "",
      cliente_id: "",
      cliente_nombre: "",
      cliente_documento: "",
      cliente_email: "",
      subtotal: 0,
      descuento: 0,
      iva: 0,
      total: 0,
      estado: "borrador",
      observaciones: "",
      validez_dias: 30,
      condiciones: ""
    });
    setEditingCotizacion(null);
    setShowModal(false);
  };

  const handleEdit = (cotizacion) => {
    setFormData(cotizacion);
    setEditingCotizacion(cotizacion);
    setShowModal(true);
  };

  const changeStatus = (id, newStatus) => {
    const cotizacionesActualizadas = cotizaciones.map(c => 
      c.id === id 
        ? { ...c, estado: newStatus, fecha_actualizacion: new Date().toISOString() }
        : c
    );
    saveCotizaciones(cotizacionesActualizadas);
    
    const statusNames = {
      enviada: "enviada",
      aprobada: "aprobada",
      rechazada: "rechazada",
      vencida: "marcada como vencida"
    };
    
    alert(`Cotización ${statusNames[newStatus]} correctamente`);
  };

  const convertirAFactura = (cotizacion) => {
    if (window.confirm("¿Deseas convertir esta cotización en una factura?")) {
      // Crear nueva factura basada en la cotización
      const facturas = JSON.parse(localStorage.getItem("facturas") || "[]");
      
      const nuevaFactura = {
        id: Date.now(),
        numero: (facturas.length + 1).toString().padStart(6, '0'),
        fecha: new Date().toISOString().split('T')[0],
        cliente_nombre: cotizacion.cliente_nombre,
        cliente_documento: cotizacion.cliente_documento,
        cliente_email: cotizacion.cliente_email,
        subtotal: cotizacion.subtotal,
        iva: cotizacion.iva,
        total: cotizacion.total,
        estado: "borrador",
        metodo_pago: "",
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString(),
        cotizacion_origen: cotizacion.id
      };

      facturas.push(nuevaFactura);
      localStorage.setItem("facturas", JSON.stringify(facturas));

      // Cambiar estado de la cotización a aprobada
      changeStatus(cotizacion.id, "aprobada");
      
      alert("Cotización convertida a factura exitosamente");
    }
  };

  const deleteCotizacion = (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta cotización?")) {
      const cotizacionesActualizadas = cotizaciones.filter(c => c.id !== id);
      saveCotizaciones(cotizacionesActualizadas);
      alert("Cotización eliminada correctamente");
    }
  };

  const exportarCotizaciones = () => {
    if (cotizaciones.length === 0) {
      alert("No hay cotizaciones para exportar");
      return;
    }

    const csv = [
      "Número,Fecha,Cliente,Documento,Total,Estado,Fecha Vencimiento",
      ...cotizaciones.map(c => 
        `${c.numero},${c.fecha},"${c.cliente_nombre}",${c.cliente_documento},${c.total},${c.estado},${c.fecha_vencimiento}`
      )
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cotizaciones_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredCotizaciones = cotizaciones.filter(cotizacion => {
    const matchesSearch = cotizacion.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cotizacion.numero.includes(searchTerm);
    const matchesStatus = !statusFilter || cotizacion.estado === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (estado) => {
    switch (estado) {
      case "borrador":
        return "bg-gray-100 text-gray-800";
      case "enviada":
        return "bg-blue-100 text-blue-800";
      case "aprobada":
        return "bg-green-100 text-green-800";
      case "rechazada":
        return "bg-red-100 text-red-800";
      case "vencida":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Verificar cotizaciones vencidas
  useEffect(() => {
    const hoy = new Date().toISOString().split('T')[0];
    const cotizacionesVencidas = cotizaciones.filter(c => 
      c.estado === "enviada" && c.fecha_vencimiento < hoy
    );

    if (cotizacionesVencidas.length > 0) {
      cotizacionesVencidas.forEach(c => {
        changeStatus(c.id, "vencida");
      });
    }
  }, [cotizaciones]);

  const stats = {
    total: cotizaciones.length,
    borradores: cotizaciones.filter(c => c.estado === "borrador").length,
    enviadas: cotizaciones.filter(c => c.estado === "enviada").length,
    aprobadas: cotizaciones.filter(c => c.estado === "aprobada").length,
    valorTotal: cotizaciones.filter(c => c.estado !== "rechazada").reduce((sum, c) => sum + c.total, 0)
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Cotizaciones</h1>
        <p className="text-gray-600">Crea y administra cotizaciones para tus clientes</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Cotizaciones</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Borradores</p>
              <p className="text-2xl font-bold text-gray-900">{stats.borradores}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Enviadas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.enviadas}</p>
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
              <p className="text-sm font-medium text-gray-600">Aprobadas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.aprobadas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900">${stats.valorTotal.toLocaleString()}</p>
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
                placeholder="Buscar cotizaciones..."
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="borrador">Borrador</option>
              <option value="enviada">Enviada</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
              <option value="vencida">Vencida</option>
            </select>

            <button
              onClick={exportarCotizaciones}
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
            Nueva Cotización
          </button>
        </div>
      </div>

      {/* Tabla de cotizaciones */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCotizaciones.map((cotizacion) => (
                <tr key={cotizacion.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{cotizacion.numero}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{cotizacion.cliente_nombre}</div>
                      <div className="text-sm text-gray-500">{cotizacion.cliente_documento}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(cotizacion.fecha).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(cotizacion.fecha_vencimiento).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${cotizacion.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(cotizacion.estado)}`}>
                      {cotizacion.estado === "borrador" ? "Borrador" :
                       cotizacion.estado === "enviada" ? "Enviada" :
                       cotizacion.estado === "aprobada" ? "Aprobada" :
                       cotizacion.estado === "rechazada" ? "Rechazada" : "Vencida"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(cotizacion)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Editar"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      
                      {cotizacion.estado === "borrador" && (
                        <button
                          onClick={() => changeStatus(cotizacion.id, "enviada")}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Enviar"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </button>
                      )}
                      
                      {(cotizacion.estado === "enviada" || cotizacion.estado === "aprobada") && (
                        <button
                          onClick={() => convertirAFactura(cotizacion)}
                          className="text-purple-600 hover:text-purple-900 p-1"
                          title="Convertir a Factura"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </button>
                      )}

                      <button
                        onClick={() => deleteCotizacion(cotizacion.id)}
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

        {filteredCotizaciones.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay cotizaciones</h3>
            <p className="mt-1 text-sm text-gray-500">Comienza creando tu primera cotización.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Nueva Cotización
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal para crear/editar cotización */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingCotizacion ? 'Editar Cotización' : 'Nueva Cotización'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.fecha}
                      onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Validez (días) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.validez_dias}
                      onChange={(e) => setFormData({...formData, validez_dias: parseInt(e.target.value) || 30})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cliente *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.cliente_id}
                    onChange={(e) => handleClienteChange(e.target.value)}
                  >
                    <option value="">Seleccionar cliente</option>
                    {clientes.filter(c => c.activo).map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.tipo_persona === "natural" 
                          ? `${cliente.nombre} ${cliente.apellidos || ''}`
                          : cliente.razon_social || cliente.nombre
                        } - {cliente.numero_documento}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subtotal *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.subtotal}
                      onChange={(e) => handleSubtotalChange(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descuento (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.descuento}
                      onChange={(e) => handleDescuentoChange(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observaciones
                  </label>
                  <textarea
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.observaciones}
                    onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                    placeholder="Observaciones adicionales..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condiciones
                  </label>
                  <textarea
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.condiciones}
                    onChange={(e) => setFormData({...formData, condiciones: e.target.value})}
                    placeholder="Términos y condiciones..."
                  />
                </div>

                {/* Mostrar cálculos */}
                {formData.subtotal > 0 && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${formData.subtotal.toLocaleString()}</span>
                      </div>
                      {formData.descuento > 0 && (
                        <div className="flex justify-between">
                          <span>Descuento ({formData.descuento}%):</span>
                          <span>-${((formData.subtotal * formData.descuento) / 100).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>IVA (19%):</span>
                        <span>${formData.iva.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-1 mt-1">
                        <span>Total:</span>
                        <span>${formData.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
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
                  {editingCotizacion ? 'Actualizar' : 'Crear'} Cotización
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

Cotizaciones.propTypes = {
  // Agregar PropTypes si necesitas pasar props desde el componente padre
};