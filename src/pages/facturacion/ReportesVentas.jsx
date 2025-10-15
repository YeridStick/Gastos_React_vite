import { useState, useEffect } from "react";

export default function ReportesVentas() {
  const [facturas, setFacturas] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [reporteActivo, setReporteActivo] = useState("ventas");
  const [filtros, setFiltros] = useState({
    fechaDesde: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    fechaHasta: new Date().toISOString().split('T')[0],
    cliente: "",
    estado: ""
  });

  useEffect(() => {
    // Cargar datos del localStorage
    const facturasGuardadas = localStorage.getItem("facturas");
    if (facturasGuardadas) {
      setFacturas(JSON.parse(facturasGuardadas));
    }

    const cotizacionesGuardadas = localStorage.getItem("cotizaciones");
    if (cotizacionesGuardadas) {
      setCotizaciones(JSON.parse(cotizacionesGuardadas));
    }
  }, []);

  // Reporte de ventas (facturas pagadas)
  const getReporteVentas = () => {
    return facturas.filter(factura => {
      const fechaFactura = new Date(factura.fecha).toISOString().split('T')[0];
      const cumpleFecha = fechaFactura >= filtros.fechaDesde && fechaFactura <= filtros.fechaHasta;
      const cumpleCliente = !filtros.cliente || factura.cliente_nombre.toLowerCase().includes(filtros.cliente.toLowerCase());
      const cumpleEstado = !filtros.estado || factura.estado === filtros.estado;
      
      return cumpleFecha && cumpleCliente && cumpleEstado;
    });
  };

  // Reporte de cotizaciones
  const getReporteCotizaciones = () => {
    return cotizaciones.filter(cotizacion => {
      const fechaCotizacion = new Date(cotizacion.fecha).toISOString().split('T')[0];
      const cumpleFecha = fechaCotizacion >= filtros.fechaDesde && fechaCotizacion <= filtros.fechaHasta;
      const cumpleCliente = !filtros.cliente || cotizacion.cliente_nombre.toLowerCase().includes(filtros.cliente.toLowerCase());
      const cumpleEstado = !filtros.estado || cotizacion.estado === filtros.estado;
      
      return cumpleFecha && cumpleCliente && cumpleEstado;
    });
  };

  // Análisis de conversión (cotizaciones → facturas)
  const getAnalisisConversion = () => {
    const cotizacionesEnviadas = cotizaciones.filter(c => c.estado === "enviada" || c.estado === "aprobada");
    const cotizacionesConvertidas = facturas.filter(f => f.cotizacion_origen);
    
    return {
      total_cotizaciones: cotizacionesEnviadas.length,
      cotizaciones_convertidas: cotizacionesConvertidas.length,
      tasa_conversion: cotizacionesEnviadas.length > 0 
        ? (cotizacionesConvertidas.length / cotizacionesEnviadas.length * 100).toFixed(1)
        : 0,
      valor_cotizaciones: cotizacionesEnviadas.reduce((sum, c) => sum + c.total, 0),
      valor_convertido: cotizacionesConvertidas.reduce((sum, f) => sum + f.total, 0)
    };
  };

  // Clientes más frecuentes
  const getClientesFrecuentes = () => {
    const ventasPorCliente = {};
    
    facturas.forEach(factura => {
      const key = factura.cliente_documento;
      if (ventasPorCliente[key]) {
        ventasPorCliente[key].cantidad += 1;
        ventasPorCliente[key].total += factura.total;
      } else {
        ventasPorCliente[key] = {
          cliente_nombre: factura.cliente_nombre,
          cliente_documento: factura.cliente_documento,
          cantidad: 1,
          total: factura.total
        };
      }
    });

    return Object.values(ventasPorCliente)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  };

  // Ventas por mes
  const getVentasPorMes = () => {
    const ventasPorMes = {};
    
    facturas.forEach(factura => {
      if (factura.estado === "pagada") {
        const fecha = new Date(factura.fecha);
        const mesAño = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (ventasPorMes[mesAño]) {
          ventasPorMes[mesAño].cantidad += 1;
          ventasPorMes[mesAño].total += factura.total;
        } else {
          ventasPorMes[mesAño] = {
            mes: mesAño,
            cantidad: 1,
            total: factura.total
          };
        }
      }
    });

    return Object.values(ventasPorMes).sort((a, b) => a.mes.localeCompare(b.mes));
  };

  const exportarReporte = (tipo) => {
    let data = [];
    let filename = "";

    switch (tipo) {
      case "ventas":
        data = getReporteVentas();
        filename = "reporte_ventas.csv";
        break;
      case "cotizaciones":
        data = getReporteCotizaciones();
        filename = "reporte_cotizaciones.csv";
        break;
      case "clientes":
        data = getClientesFrecuentes();
        filename = "clientes_frecuentes.csv";
        break;
      case "mensual":
        data = getVentasPorMes();
        filename = "ventas_por_mes.csv";
        break;
    }

    if (data.length === 0) {
      alert("No hay datos para exportar");
      return;
    }

    // Crear CSV
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(item => Object.values(item).join(","));
    const csv = [headers, ...rows].join("\n");

    // Descargar archivo
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const reportes = [
    {
      id: "ventas",
      nombre: "Ventas",
      descripcion: "Facturas y ventas realizadas",
      icono: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      )
    },
    {
      id: "cotizaciones",
      nombre: "Cotizaciones",
      descripcion: "Estado de cotizaciones enviadas",
      icono: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      )
    },
    {
      id: "conversion",
      nombre: "Conversión",
      descripcion: "Análisis cotización → venta",
      icono: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      )
    },
    {
      id: "clientes",
      nombre: "Clientes Top",
      descripcion: "Clientes más frecuentes",
      icono: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      )
    }
  ];

  // Calcular estadísticas generales
  const ventasData = getReporteVentas();
  const cotizacionesData = getReporteCotizaciones();
  const conversion = getAnalisisConversion();
  
  const stats = {
    total_ventas: ventasData.filter(f => f.estado === "pagada").length,
    valor_ventas: ventasData.filter(f => f.estado === "pagada").reduce((sum, f) => sum + f.total, 0),
    total_cotizaciones: cotizacionesData.length,
    valor_cotizaciones: cotizacionesData.reduce((sum, c) => sum + c.total, 0),
    tasa_conversion: conversion.tasa_conversion,
    promedio_venta: ventasData.filter(f => f.estado === "pagada").length > 0 
      ? ventasData.filter(f => f.estado === "pagada").reduce((sum, f) => sum + f.total, 0) / ventasData.filter(f => f.estado === "pagada").length
      : 0
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reportes de Ventas</h1>
        <p className="text-gray-600">Análisis de ventas, cotizaciones y rendimiento comercial</p>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ventas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_ventas}</p>
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
              <p className="text-sm font-medium text-gray-600">Valor Ventas</p>
              <p className="text-2xl font-bold text-gray-900">${stats.valor_ventas.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cotizaciones</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_cotizaciones}</p>
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
              <p className="text-sm font-medium text-gray-600">Valor Cotizaciones</p>
              <p className="text-2xl font-bold text-gray-900">${stats.valor_cotizaciones.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tasa Conversión</p>
              <p className="text-2xl font-bold text-gray-900">{stats.tasa_conversion}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Promedio Venta</p>
              <p className="text-2xl font-bold text-gray-900">${stats.promedio_venta.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Selector de reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {reportes.map((reporte) => (
          <button
            key={reporte.id}
            onClick={() => setReporteActivo(reporte.id)}
            className={`p-4 text-left rounded-lg border transition-all ${
              reporteActivo === reporte.id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center mb-2">
              <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {reporte.icono}
              </svg>
              <h3 className="font-medium">{reporte.nombre}</h3>
            </div>
            <p className="text-sm text-gray-600">{reporte.descripcion}</p>
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Desde
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filtros.fechaDesde}
              onChange={(e) => setFiltros({...filtros, fechaDesde: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Hasta
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filtros.fechaHasta}
              onChange={(e) => setFiltros({...filtros, fechaHasta: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filtros.cliente}
              onChange={(e) => setFiltros({...filtros, cliente: e.target.value})}
              placeholder="Buscar cliente..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filtros.estado}
              onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
            >
              <option value="">Todos los estados</option>
              <option value="borrador">Borrador</option>
              <option value="enviada">Enviada</option>
              <option value="pagada">Pagada</option>
              <option value="anulada">Anulada</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contenido del reporte */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            {reportes.find(r => r.id === reporteActivo)?.nombre}
          </h3>
          <button
            onClick={() => exportarReporte(reporteActivo)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar CSV
          </button>
        </div>

        <div className="p-6">
          {/* Reporte de Ventas */}
          {reporteActivo === "ventas" && (
            <div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getReporteVentas().map((factura) => (
                      <tr key={factura.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{factura.numero}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{factura.cliente_nombre}</div>
                          <div className="text-sm text-gray-500">{factura.cliente_documento}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(factura.fecha).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${factura.total.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            factura.estado === 'pagada' ? 'bg-green-100 text-green-800' :
                            factura.estado === 'enviada' ? 'bg-blue-100 text-blue-800' :
                            factura.estado === 'anulada' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {factura.estado === 'pagada' ? 'Pagada' :
                             factura.estado === 'enviada' ? 'Enviada' :
                             factura.estado === 'anulada' ? 'Anulada' : 'Borrador'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reporte de Cotizaciones */}
          {reporteActivo === "cotizaciones" && (
            <div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vence</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getReporteCotizaciones().map((cotizacion) => (
                      <tr key={cotizacion.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{cotizacion.numero}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{cotizacion.cliente_nombre}</div>
                          <div className="text-sm text-gray-500">{cotizacion.cliente_documento}</div>
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
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            cotizacion.estado === 'aprobada' ? 'bg-green-100 text-green-800' :
                            cotizacion.estado === 'enviada' ? 'bg-blue-100 text-blue-800' :
                            cotizacion.estado === 'rechazada' ? 'bg-red-100 text-red-800' :
                            cotizacion.estado === 'vencida' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {cotizacion.estado === 'aprobada' ? 'Aprobada' :
                             cotizacion.estado === 'enviada' ? 'Enviada' :
                             cotizacion.estado === 'rechazada' ? 'Rechazada' :
                             cotizacion.estado === 'vencida' ? 'Vencida' : 'Borrador'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Análisis de Conversión */}
          {reporteActivo === "conversion" && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {conversion.total_cotizaciones}
                  </div>
                  <div className="text-sm text-blue-600">Cotizaciones Enviadas</div>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {conversion.cotizaciones_convertidas}
                  </div>
                  <div className="text-sm text-green-600">Convertidas a Venta</div>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {conversion.tasa_conversion}%
                  </div>
                  <div className="text-sm text-purple-600">Tasa de Conversión</div>
                </div>

                <div className="bg-indigo-50 p-6 rounded-lg">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">
                    ${conversion.valor_convertido.toLocaleString()}
                  </div>
                  <div className="text-sm text-indigo-600">Valor Convertido</div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Análisis de Rendimiento</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Valor Total Cotizaciones:</span>
                    <span className="font-medium">${conversion.valor_cotizaciones.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Valor Convertido:</span>
                    <span className="font-medium">${conversion.valor_convertido.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Oportunidad Perdida:</span>
                    <span className="font-medium text-red-600">
                      ${(conversion.valor_cotizaciones - conversion.valor_convertido).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Clientes Top */}
          {reporteActivo === "clientes" && (
            <div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ranking</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Facturas</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Compras</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Promedio</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getClientesFrecuentes().map((cliente, index) => (
                      <tr key={cliente.cliente_documento} className={index < 3 ? 'bg-yellow-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white mr-2 ${
                              index === 0 ? 'bg-yellow-500' :
                              index === 1 ? 'bg-gray-400' :
                              index === 2 ? 'bg-yellow-600' : 'bg-gray-300'
                            }`}>
                              {index + 1}
                            </span>
                            {index < 3 && (
                              <svg className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {cliente.cliente_nombre}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {cliente.cliente_documento}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {cliente.cantidad}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${cliente.total.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${(cliente.total / cliente.cantidad).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {getClientesFrecuentes().length === 0 && (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay datos de clientes</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No se encontraron ventas en el período seleccionado.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Información del Reporte</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
          <div>
            <strong>Fecha de generación:</strong><br />
            {new Date().toLocaleString('es-ES')}
          </div>
          <div>
            <strong>Período analizado:</strong><br />
            {new Date(filtros.fechaDesde).toLocaleDateString('es-ES')} - {new Date(filtros.fechaHasta).toLocaleDateString('es-ES')}
          </div>
          <div>
            <strong>Filtros aplicados:</strong><br />
            {filtros.cliente && `Cliente: ${filtros.cliente}`}
            {filtros.estado && ` | Estado: ${filtros.estado}`}
            {!filtros.cliente && !filtros.estado && 'Sin filtros adicionales'}
          </div>
        </div>
      </div>
    </div>
  );
}

ReportesVentas.propTypes = {
  // Agregar PropTypes si necesitas pasar props desde el componente padre
};