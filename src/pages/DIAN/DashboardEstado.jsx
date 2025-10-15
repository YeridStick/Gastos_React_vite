import { calcularDiasRestantes, obtenerPorcentajeCompletado, esConfiguracionCompleta, obtenerUrlsAmbiente } from "./utils/helpers";

export default function DashboardEstado({ configuracion, testConexion, testearConexionDIAN }) {
  return (
    <>
      {/* Dashboard de estado general */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Estado de configuración */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Progreso de Configuración</h3>
            <span className={`text-sm font-semibold ${
              obtenerPorcentajeCompletado(configuracion) === 100 ? 'text-green-600' : 
              obtenerPorcentajeCompletado(configuracion) >= 70 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {obtenerPorcentajeCompletado(configuracion)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                obtenerPorcentajeCompletado(configuracion) === 100 ? 'bg-green-500' : 
                obtenerPorcentajeCompletado(configuracion) >= 70 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${obtenerPorcentajeCompletado(configuracion)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">
            {esConfiguracionCompleta(configuracion) ? 
              'Configuración lista para producción' : 
              'Completa los campos requeridos'
            }
          </p>
        </div>

        {/* Estado del ambiente */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Ambiente Actual</h3>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              configuracion.dian.ambiente === "produccion" 
                ? "bg-green-100 text-green-800" 
                : "bg-yellow-100 text-yellow-800"
            }`}>
              {configuracion.dian.ambiente === "produccion" ? "PRODUCCIÓN" : "PRUEBAS"}
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-2">
            {configuracion.dian.ambiente === "produccion" 
              ? "Facturas con validez legal"
              : "Facturas de prueba únicamente"
            }
          </p>
          <div className="text-xs text-gray-400">
            URL: {obtenerUrlsAmbiente(configuracion.dian.ambiente).webservice.split('/')[2]}
          </div>
        </div>

        {/* Estado del certificado */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Certificado Digital</h3>
            {configuracion.certificado.fecha_vencimiento ? (
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                calcularDiasRestantes(configuracion.certificado.fecha_vencimiento) > 30
                  ? "bg-green-100 text-green-800"
                  : calcularDiasRestantes(configuracion.certificado.fecha_vencimiento) > 0
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}>
                {calcularDiasRestantes(configuracion.certificado.fecha_vencimiento) > 0 
                  ? `${calcularDiasRestantes(configuracion.certificado.fecha_vencimiento)} días`
                  : "VENCIDO"
                }
              </div>
            ) : (
              <div className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                NO CONFIG.
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-1">
            {configuracion.certificado.archivo_certificado || "Sin certificado configurado"}
          </p>
          <div className="text-xs text-gray-400">
            {configuracion.certificado.entidad_certificadora || "Entidad no especificada"}
          </div>
        </div>
      </div>

      {/* Indicador de estado principal */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-3 ${
              configuracion.dian.ambiente === "produccion" 
                ? "bg-green-100" 
                : "bg-yellow-100"
            }`}>
              <svg className={`h-6 w-6 ${
                configuracion.dian.ambiente === "produccion" 
                  ? "text-green-600" 
                  : "text-yellow-600"
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Ambiente: {configuracion.dian.ambiente === "produccion" ? "Producción" : "Pruebas"}
              </h3>
              <p className="text-sm text-gray-600">
                {configuracion.dian.ambiente === "produccion" 
                  ? "Sistema configurado para facturación real"
                  : "Sistema en modo de pruebas - facturas no válidas legalmente"
                }
              </p>
            </div>
          </div>
          
          <button
            onClick={testearConexionDIAN}
            disabled={testConexion === "testing"}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              testConexion === "success" ? "bg-green-100 text-green-700" :
              testConexion === "error" ? "bg-red-100 text-red-700" :
              "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {testConexion === "testing" ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Probando...
              </>
            ) : testConexion === "success" ? (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Conexión OK
              </>
            ) : testConexion === "error" ? (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Error
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
                Probar Conexión
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}