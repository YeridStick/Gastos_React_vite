import { useState, useEffect } from "react";

export default function FacturacionElectronica() {
  const [facturas, setFacturas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingFactura, setEditingFactura] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formData, setFormData] = useState({
    numero: "",
    fecha: new Date().toISOString().split('T')[0],
    cliente_nombre: "",
    cliente_documento: "",
    cliente_email: "",
    subtotal: 0,
    iva: 0,
    total: 0,
    estado: "borrador", // borrador, enviada, pagada, anulada
    metodo_pago: ""
  });

  useEffect(() => {
    // Cargar facturas del localStorage
    const facturasGuardadas = localStorage.getItem("facturas");
    if (facturasGuardadas) {
      setFacturas(JSON.parse(facturasGuardadas));
    }
  }, []);

  const saveFacturas = (nuevasFacturas) => {
    localStorage.setItem("facturas", JSON.stringify(nuevasFacturas));
    setFacturas(nuevasFacturas);
  };

  const generateFacturaNumber = () => {
    const lastFactura = facturas.sort((a, b) => parseInt(b.numero) - parseInt(a.numero))[0];
    const nextNumber = lastFactura ? parseInt(lastFactura.numero) + 1 : 1;
    return nextNumber.toString().padStart(6, '0');
  };

  const calculateTotals = (subtotal) => {
    const iva = subtotal * 0.19; // IVA 19% Colombia
    const total = subtotal + iva;
    return { subtotal, iva, total };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.subtotal <= 0) {
      alert("El subtotal debe ser mayor a 0");
      return;
    }

    // Calcular totales automáticamente
    const totals = calculateTotals(formData.subtotal);
    const facturaCompleta = { ...formData, ...totals };

    if (editingFactura) {
      // Editar factura existente
      const facturasActualizadas = facturas.map(f => 
        f.id === editingFactura.id 
          ? { ...facturaCompleta, id: editingFactura.id, fecha_actualizacion: new Date().toISOString() }
          : f
      );
      saveFacturas(facturasActualizadas);
      alert("Factura actualizada correctamente");
    } else {
      // Crear nueva factura
      const nuevaFactura = {
        ...facturaCompleta,
        id: Date.now(),
        numero: generateFacturaNumber(),
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString()
      };
      saveFacturas([...facturas, nuevaFactura]);
      alert("Factura creada correctamente");
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      numero: "",
      fecha: new Date().toISOString().split('T')[0],
      cliente_nombre: "",
      cliente_documento: "",
      cliente_email: "",
      subtotal: 0,
      iva: 0,
      total: 0,
      estado: "borrador",
      metodo_pago: ""
    });
    setEditingFactura(null);
    setShowModal(false);
  };

  const handleEdit = (factura) => {
    setFormData(factura);
    setEditingFactura(factura);
    setShowModal(true);
  };

  const changeStatus = (id, newStatus) => {
    const facturasActualizadas = facturas.map(f => 
      f.id === id 
        ? { ...f, estado: newStatus, fecha_actualizacion: new Date().toISOString() }
        : f
    );
    saveFacturas(facturasActualizadas);
    
    const statusNames = {
      enviada: "enviada",
      pagada: "marcada como pagada",
      anulada: "anulada"
    };
    
    alert(`Factura ${statusNames[newStatus]} correctamente`);
  };

  const deleteFactura = (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta factura?")) {
      const facturasActualizadas = facturas.filter(f => f.id !== id);
      saveFacturas(facturasActualizadas);
      alert("Factura eliminada correctamente");
    }
  };

  const filteredFacturas = facturas.filter(factura => {
    const matchesSearch = factura.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         factura.numero.includes(searchTerm);
    const matchesStatus = !statusFilter || factura.estado === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (estado) => {
    switch (estado) {
      case "borrador":
        return "bg-gray-100 text-gray-800";
      case "enviada":
        return "bg-blue-100 text-blue-800";
      case "pagada":
        return "bg-green-100 text-green-800";
      case "anulada":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const stats = {
    total: facturas.length,
    borradores: facturas.filter(f => f.estado === "borrador").length,
    enviadas: facturas.filter(f => f.estado === "enviada").length,
    pagadas: facturas.filter(f => f.estado === "pagada").length,
    valorTotal: facturas.filter(f => f.estado !== "anulada").reduce((sum, f) => sum + f.total, 0)
  };

  // Actualizar totales cuando cambie el subtotal
  const handleSubtotalChange = (value) => {
    const subtotal = parseFloat(value) || 0;
    const totals = calculateTotals(subtotal);
    setFormData({...formData, ...totals});
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Facturación Electrónica</h1>
        <p className="text-gray-600">Gestiona tus facturas electrónicas y cumple con la normativa DIAN</p>
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
              <p className="text-sm font-medium text-gray-600">Total Facturas</p>
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
              <p className="text-sm font-medium text-gray-600">Pagadas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pagadas}</p>
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
                placeholder="Buscar facturas..."
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
              <option value="pagada">Pagada</option>
              <option value="anulada">Anulada</option>
            </select>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Nueva Factura
          </button>
        </div>
      </div>

      {/* Tabla de facturas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFacturas.map((factura) => (
                <tr key={factura.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{factura.numero}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{factura.cliente_nombre}</div>
                      <div className="text-sm text-gray-500">{factura.cliente_documento}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(factura.fecha).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${factura.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(factura.estado)}`}>
                      {factura.estado === "borrador" ? "Borrador" :
                       factura.estado === "enviada" ? "Enviada" :
                       factura.estado === "pagada" ? "Pagada" : "Anulada"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(factura)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Editar"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      
                      {factura.estado === "borrador" && (
                        <button
                          onClick={() => changeStatus(factura.id, "enviada")}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Enviar"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </button>
                      )}
                      
                      {factura.estado === "enviada" && (
                        <button
                          onClick={() => changeStatus(factura.id, "pagada")}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Marcar como pagada"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      )}

                      <button
                        onClick={() => deleteFactura(factura.id)}
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

        {filteredFacturas.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay facturas</h3>
            <p className="mt-1 text-sm text-gray-500">Comienza creando tu primera factura electrónica.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Nueva Factura
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal para crear/editar facturas */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingFactura ? 'Editar Factura' : 'Nueva Factura'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.cliente_nombre}
                    onChange={(e) => setFormData({...formData, cliente_nombre: e.target.value})}
                    placeholder="Nombre del cliente"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Documento *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.cliente_documento}
                    onChange={(e) => setFormData({...formData, cliente_documento: e.target.value})}
                    placeholder="Número de documento"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.cliente_email}
                    onChange={(e) => setFormData({...formData, cliente_email: e.target.value})}
                    placeholder="email@ejemplo.com"
                  />
                </div>

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
                    Método de Pago
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.metodo_pago}
                    onChange={(e) => setFormData({...formData, metodo_pago: e.target.value})}
                  >
                    <option value="">Seleccionar</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="tarjeta_credito">Tarjeta de Crédito</option>
                    <option value="tarjeta_debito">Tarjeta de Débito</option>
                  </select>
                </div>

                {/* Mostrar cálculos */}
                {formData.subtotal > 0 && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${formData.subtotal.toLocaleString()}</span>
                      </div>
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
                  {editingFactura ? 'Actualizar' : 'Crear'} Factura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

FacturacionElectronica.propTypes = {
  // Agregar PropTypes si necesitas pasar props desde el componente padre
};