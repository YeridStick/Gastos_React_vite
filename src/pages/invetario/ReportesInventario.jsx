import { useState, useEffect } from "react";

export default function ReportesInventario() {
  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [reporteActivo, setReporteActivo] = useState("valoracion");
  const [filtros, setFiltros] = useState({
    fechaDesde: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    fechaHasta: new Date().toISOString().split('T')[0],
    categoria: "",
    tipoMovimiento: ""
  });

  useEffect(() => {
    // Cargar datos del localStorage
    const productosGuardados = localStorage.getItem("productos");
    if (productosGuardados) {
      setProductos(JSON.parse(productosGuardados));
    }

    const movimientosGuardados = localStorage.getItem("movimientos");
    if (movimientosGuardados) {
      setMovimientos(JSON.parse(movimientosGuardados));
    }
  }, []);

  // Cálculos para el reporte de valoración
  const getValoracionInventario = () => {
    return productos.map(producto => {
      const valorCompra = producto.stock_actual * parseFloat(producto.precio_compra || 0);
      const valorVenta = producto.stock_actual * parseFloat(producto.precio_venta || 0);
      const margenUnitario = parseFloat(producto.precio_venta || 0) - parseFloat(producto.precio_compra || 0);
      const margenTotal = producto.stock_actual * margenUnitario;
      
      return {
        ...producto,
        valor_compra: valorCompra,
        valor_venta: valorVenta,
        margen_unitario: margenUnitario,
        margen_total: margenTotal,
        porcentaje_margen: producto.precio_compra > 0 ? (margenUnitario / parseFloat(producto.precio_compra)) * 100 : 0
      };
    }).filter(p => p.stock_actual > 0);
  };

  // Productos con stock bajo
  const getProductosStockBajo = () => {
    return productos.filter(p => p.stock_actual <= p.stock_minimo && p.activo);
  };

  // Movimientos en el período seleccionado
  const getMovimientosPeriodo = () => {
    return movimientos.filter(mov => {
      const fechaMov = new Date(mov.fecha).toISOString().split('T')[0];
      const cumpleFecha = fechaMov >= filtros.fechaDesde && fechaMov <= filtros.fechaHasta;
      const cumpleCategoria = !filtros.categoria || mov.producto_nombre.includes(filtros.categoria);
      const cumpleTipo = !filtros.tipoMovimiento || mov.tipo === filtros.tipoMovimiento;
      
      return cumpleFecha && cumpleCategoria && cumpleTipo;
    });
  };

  // Productos más vendidos (basado en movimientos de salida)
  const getProductosMasVendidos = () => {
    const movimientosSalida = movimientos.filter(m => 
      m.tipo === "salida" && 
      m.motivo === "Venta" &&
      m.fecha >= filtros.fechaDesde && 
      m.fecha <= filtros.fechaHasta
    );

    const ventasPorProducto = {};
    movimientosSalida.forEach(mov => {
      if (ventasPorProducto[mov.producto_id]) {
        ventasPorProducto[mov.producto_id].cantidad += mov.cantidad;
        ventasPorProducto[mov.producto_id].veces += 1;
      } else {
        ventasPorProducto[mov.producto_id] = {
          producto_nombre: mov.producto_nombre,
          producto_codigo: mov.producto_codigo,
          cantidad: mov.cantidad,
          veces: 1
        };
      }
    });

    return Object.values(ventasPorProducto).sort((a, b) => b.cantidad - a.cantidad);
  };

  const categorias = [...new Set(productos.map(p => p.categoria))].filter(Boolean);

  const totalesValoracion = getValoracionInventario().reduce((acc, item) => ({
    valor_compra: acc.valor_compra + item.valor_compra,
    valor_venta: acc.valor_venta + item.valor_venta,
    margen_total: acc.margen_total + item.margen_total,
    productos: acc.productos + 1
  }), { valor_compra: 0, valor_venta: 0, margen_total: 0, productos: 0 });

  const exportarReporte = (tipo) => {
    let data = [];
    let filename = "";

    switch (tipo) {
      case "valoracion":
        data = getValoracionInventario();
        filename = "valoracion_inventario.csv";
        break;
      case "stock_bajo":
        data = getProductosStockBajo();
        filename = "productos_stock_bajo.csv";
        break;
      case "movimientos":
        data = getMovimientosPeriodo();
        filename = "movimientos_inventario.csv";
        break;
      case "mas_vendidos":
        data = getProductosMasVendidos();
        filename = "productos_mas_vendidos.csv";
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
      id: "valoracion",
      nombre: "Valoración de Inventario",
      descripcion: "Valor total del inventario actual",
      icono: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      )
    },
    {
      id: "stock_bajo",
      nombre: "Stock Bajo",
      descripcion: "Productos que necesitan reposición",
      icono: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
      )
    },
    {
      id: "movimientos",
      nombre: "Movimientos",
      descripcion: "Historial de entradas y salidas",
      icono: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      )
    },
    {
      id: "mas_vendidos",
      nombre: "Más Vendidos",
      descripcion: "Productos con mayor rotación",
      icono: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reportes de Inventario</h1>
        <p className="text-gray-600">Analiza el rendimiento y estado de tu inventario</p>
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
              Categoría
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filtros.categoria}
              onChange={(e) => setFiltros({...filtros, categoria: e.target.value})}
            >
              <option value="">Todas las categorías</option>
              {categorias.map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo Movimiento
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filtros.tipoMovimiento}
              onChange={(e) => setFiltros({...filtros, tipoMovimiento: e.target.value})}
            >
              <option value="">Todos los tipos</option>
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
              <option value="ajuste">Ajuste</option>
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
          {/* Reporte de Valoración */}
          {reporteActivo === "valoracion" && (
            <div>
              {/* Resumen */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    ${totalesValoracion.valor_compra.toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-600">Valor de Compra</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    ${totalesValoracion.valor_venta.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-600">Valor de Venta</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    ${totalesValoracion.margen_total.toLocaleString()}
                  </div>
                  <div className="text-sm text-purple-600">Margen Total</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">
                    {totalesValoracion.productos}
                  </div>
                  <div className="text-sm text-gray-600">Productos con Stock</div>
                </div>
              </div>

              {/* Tabla detallada */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Compra</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Venta</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Margen</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">% Margen</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getValoracionInventario().map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.nombre}</div>
                          <div className="text-sm text-gray-500">{item.codigo}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.stock_actual} {item.unidad_medida}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${item.valor_compra.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${item.valor_venta.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${item.margen_total.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.porcentaje_margen.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reporte de Stock Bajo */}
          {reporteActivo === "stock_bajo" && (
            <div>
              <div className="mb-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {getProductosStockBajo().length}
                  </div>
                  <div className="text-sm text-yellow-600">Productos requieren reposición</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Actual</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Mínimo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diferencia</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getProductosStockBajo().map((producto) => (
                      <tr key={producto.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{producto.nombre}</div>
                          <div className="text-sm text-gray-500">{producto.codigo}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {producto.stock_actual} {producto.unidad_medida}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {producto.stock_minimo} {producto.unidad_medida}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {producto.stock_minimo - producto.stock_actual} {producto.unidad_medida}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            producto.stock_actual <= 0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {producto.stock_actual <= 0 ? 'Sin Stock' : 'Stock Bajo'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reporte de Movimientos */}
          {reporteActivo === "movimientos" && (
            <div>
              <div className="mb-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {getMovimientosPeriodo().length}
                  </div>
                  <div className="text-sm text-blue-600">Movimientos en el período</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getMovimientosPeriodo().map((movimiento) => (
                      <tr key={movimiento.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(movimiento.fecha).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{movimiento.producto_nombre}</div>
                          <div className="text-sm text-gray-500">{movimiento.producto_codigo}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            movimiento.tipo === 'entrada' ? 'bg-green-100 text-green-800' :
                            movimiento.tipo === 'salida' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {movimiento.tipo === 'entrada' ? 'Entrada' :
                             movimiento.tipo === 'salida' ? 'Salida' : 'Ajuste'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {movimiento.cantidad}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {movimiento.motivo}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reporte de Más Vendidos */}
          {reporteActivo === "mas_vendidos" && (
            <div>
              <div className="mb-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {getProductosMasVendidos().length}
                  </div>
                  <div className="text-sm text-green-600">Productos con ventas en el período</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ranking</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad Vendida</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Veces Vendido</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Promedio por Venta</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getProductosMasVendidos().map((producto, index) => (
                      <tr key={index} className={index < 3 ? 'bg-yellow-50' : ''}>
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{producto.producto_nombre}</div>
                          <div className="text-sm text-gray-500">{producto.producto_codigo}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {producto.cantidad}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {producto.veces}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(producto.cantidad / producto.veces).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {getProductosMasVendidos().length === 0 && (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay ventas en el período</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No se encontraron movimientos de salida con motivo Venta en el período seleccionado.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Estadísticas generales al final */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Estadísticas Generales</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{productos.length}</div>
            <div className="text-sm text-gray-600">Total Productos</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{productos.filter(p => p.activo).length}</div>
            <div className="text-sm text-gray-600">Productos Activos</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{getProductosStockBajo().length}</div>
            <div className="text-sm text-gray-600">Stock Bajo</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{productos.filter(p => p.stock_actual <= 0).length}</div>
            <div className="text-sm text-gray-600">Sin Stock</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{movimientos.length}</div>
            <div className="text-sm text-gray-600">Total Movimientos</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">${totalesValoracion.valor_venta.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Valor Total Inventario</div>
          </div>
        </div>
      </div>

      {/* Gráfico de tendencias (placeholder para futuras mejoras) */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tendencias de Movimientos</h3>
        
        <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">Gráfico de tendencias próximamente</p>
            <p className="text-xs text-gray-400">Visualización de movimientos por mes</p>
          </div>
        </div>
      </div>

      {/* Botones de acción adicionales */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => {
            const resumen = {
              fecha_generacion: new Date().toISOString(),
              total_productos: productos.length,
              productos_activos: productos.filter(p => p.activo).length,
              stock_bajo: getProductosStockBajo().length,
              sin_stock: productos.filter(p => p.stock_actual <= 0).length,
              valor_total_compra: totalesValoracion.valor_compra,
              valor_total_venta: totalesValoracion.valor_venta,
              margen_total: totalesValoracion.margen_total,
              movimientos_periodo: getMovimientosPeriodo().length,
              productos_mas_vendidos: getProductosMasVendidos().slice(0, 5)
            };

            const blob = new Blob([JSON.stringify(resumen, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `resumen_inventario_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exportar Resumen Ejecutivo
        </button>

        <button
          onClick={() => {
            const alertas = [
              ...getProductosStockBajo().map(p => ({
                tipo: "stock_bajo",
                producto: p.nombre,
                codigo: p.codigo,
                stock_actual: p.stock_actual,
                stock_minimo: p.stock_minimo,
                diferencia: p.stock_minimo - p.stock_actual
              })),
              ...productos.filter(p => p.stock_actual <= 0).map(p => ({
                tipo: "sin_stock",
                producto: p.nombre,
                codigo: p.codigo,
                stock_actual: p.stock_actual
              }))
            ];

            if (alertas.length === 0) {
              alert("No hay alertas de stock en este momento");
              return;
            }

            const blob = new Blob([JSON.stringify(alertas, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `alertas_stock_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          Exportar Alertas de Stock
        </button>

        <button
          onClick={() => {
            // Limpiar filtros
            setFiltros({
              fechaDesde: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
              fechaHasta: new Date().toISOString().split('T')[0],
              categoria: "",
              tipoMovimiento: ""
            });
          }}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Limpiar Filtros
        </button>

        <button
          onClick={() => window.print()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-7a2 2 0 00-2-2H9a2 2 0 00-2 2v7a2 2 0 002 2z" />
          </svg>
          Imprimir Reporte
        </button>
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
            {filtros.categoria && `Categoría: ${filtros.categoria}`}
            {filtros.tipoMovimiento && ` | Tipo: ${filtros.tipoMovimiento}`}
            {!filtros.categoria && !filtros.tipoMovimiento && 'Sin filtros adicionales'}
          </div>
        </div>
      </div>

      {/* Estados vacíos mejorados */}
      {productos.length === 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos en el inventario</h3>
            <p className="mt-1 text-sm text-gray-500">
              Para generar reportes, primero necesitas agregar productos a tu inventario.
            </p>
            <div className="mt-6">
              <button
                onClick={() => window.location.href = '/inventario/productos'}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Agregar Primer Producto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ReportesInventario.propTypes = {
  // Agregar PropTypes si necesitas pasar props desde el componente padre
};