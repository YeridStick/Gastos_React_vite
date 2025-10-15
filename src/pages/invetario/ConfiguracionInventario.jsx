import { useState, useEffect } from "react";

export default function ConfiguracionInventario() {
  const [configuracion, setConfiguracion] = useState({
    empresa: {
      nombre: "",
      nit: "",
      direccion: "",
      telefono: "",
      email: "",
      ciudad: ""
    },
    inventario: {
      valoracion_metodo: "promedio", // promedio, fifo, lifo
      alerta_stock_bajo: true,
      dias_alerta_stock: 7,
      mostrar_codigo_barras: true,
      permitir_stock_negativo: false,
      unidades_decimales: 2,
      moneda: "COP",
      simbolo_moneda: "$"
    },
    notificaciones: {
      email_stock_bajo: true,
      email_movimientos: false,
      frecuencia_reportes: "semanal" // diario, semanal, mensual
    },
    backup: {
      backup_automatico: true,
      frecuencia_backup: "diario", // diario, semanal
      ultimo_backup: null
    }
  });

  const [cambiosGuardados, setCambiosGuardados] = useState(true);

  useEffect(() => {
    // Cargar configuración del localStorage
    const configGuardada = localStorage.getItem("configuracion_inventario");
    if (configGuardada) {
      setConfiguracion(JSON.parse(configGuardada));
    }
  }, []);

  const guardarConfiguracion = () => {
    localStorage.setItem("configuracion_inventario", JSON.stringify(configuracion));
    setCambiosGuardados(true);
    
    // Mostrar notificación de éxito
    alert("Configuración guardada correctamente");
  };

  const handleChange = (seccion, campo, valor) => {
    setConfiguracion(prev => ({
      ...prev,
      [seccion]: {
        ...prev[seccion],
        [campo]: valor
      }
    }));
    setCambiosGuardados(false);
  };

  const exportarDatos = () => {
    const productos = JSON.parse(localStorage.getItem("productos") || "[]");
    const movimientos = JSON.parse(localStorage.getItem("movimientos") || "[]");
    const categorias = JSON.parse(localStorage.getItem("categorias_inventario") || "[]");
    
    const datosExportar = {
      productos,
      movimientos,
      categorias,
      configuracion,
      fecha_exportacion: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(datosExportar, null, 2)], {
      type: "application/json"
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventario_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    // Actualizar fecha del último backup
    handleChange("backup", "ultimo_backup", new Date().toISOString());
  };

  const resetearConfiguracion = () => {
    if (window.confirm("¿Quieres restablecer la configuración a los valores por defecto?")) {
      const configDefault = {
        empresa: {
          nombre: "",
          nit: "",
          direccion: "",
          telefono: "",
          email: "",
          ciudad: ""
        },
        inventario: {
          valoracion_metodo: "promedio",
          alerta_stock_bajo: true,
          dias_alerta_stock: 7,
          mostrar_codigo_barras: true,
          permitir_stock_negativo: false,
          unidades_decimales: 2,
          moneda: "COP",
          simbolo_moneda: "$"
        },
        notificaciones: {
          email_stock_bajo: true,
          email_movimientos: false,
          frecuencia_reportes: "semanal"
        },
        backup: {
          backup_automatico: true,
          frecuencia_backup: "diario",
          ultimo_backup: null
        }
      };
      
      setConfiguracion(configDefault);
      setCambiosGuardados(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Configuración de Inventario</h1>
        <p className="text-gray-600">Personaliza las opciones del sistema de inventario</p>
      </div>

      <div className="space-y-6">
        {/* Información de la Empresa */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Información de la Empresa</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Empresa
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={configuracion.empresa.nombre}
                onChange={(e) => handleChange("empresa", "nombre", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NIT/RUC
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={configuracion.empresa.nit}
                onChange={(e) => handleChange("empresa", "nit", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={configuracion.empresa.email}
                onChange={(e) => handleChange("empresa", "email", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={configuracion.empresa.telefono}
                onChange={(e) => handleChange("empresa", "telefono", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Configuración de Inventario */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Configuración de Inventario</h2>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="alerta_stock_bajo"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={configuracion.inventario.alerta_stock_bajo}
                onChange={(e) => handleChange("inventario", "alerta_stock_bajo", e.target.checked)}
              />
              <label htmlFor="alerta_stock_bajo" className="ml-2 block text-sm text-gray-900">
                Mostrar alertas de stock bajo
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="permitir_stock_negativo"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={configuracion.inventario.permitir_stock_negativo}
                onChange={(e) => handleChange("inventario", "permitir_stock_negativo", e.target.checked)}
              />
              <label htmlFor="permitir_stock_negativo" className="ml-2 block text-sm text-gray-900">
                Permitir stock negativo
              </label>
            </div>
          </div>
        </div>

        {/* Backup y Datos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Backup y Gestión de Datos</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="backup_automatico"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={configuracion.backup.backup_automatico}
                onChange={(e) => handleChange("backup", "backup_automatico", e.target.checked)}
              />
              <label htmlFor="backup_automatico" className="ml-2 block text-sm text-gray-900">
                Backup automático
              </label>
            </div>

            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={exportarDatos}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar Datos
              </button>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-between items-center">
          <button
            onClick={resetearConfiguracion}
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            Restablecer a valores por defecto
          </button>

          <div className="flex gap-3">
            {!cambiosGuardados && (
              <span className="text-sm text-orange-600 flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Cambios sin guardar
              </span>
            )}
            
            <button
              onClick={guardarConfiguracion}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                cambiosGuardados
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              disabled={cambiosGuardados}
            >
              Guardar Configuración
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

ConfiguracionInventario.propTypes = {
  // Agregar PropTypes si necesitas pasar props desde el componente padre
};