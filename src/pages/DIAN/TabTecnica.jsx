import { obtenerUrlsAmbiente } from "./utils/helpers";

export default function TabTecnica({ 
  configuracion, 
  ambiente, 
  onChange, 
  showToast, 
  setCambiosGuardados 
}) {
  
  const restablecerConfigTecnica = () => {
    const configTecnicaDefault = {
      url_webservice: obtenerUrlsAmbiente(ambiente).webservice,
      formato_fecha: "YYYY-MM-DD",
      zona_horaria: "America/Bogota",
      validar_firma: true,
      generar_pdf: true,
      envio_automatico: false,
      reenvio_automatico: false,
      notificaciones_email: false,
      log_detallado: false,
      timeout_conexion: 60,
      max_reintentos: 3,
      intervalo_reintentos: 30,
      timeout_reintento: 120
    };
    
    Object.keys(configTecnicaDefault).forEach(key => {
      onChange(key, configTecnicaDefault[key]);
    });
    
    setCambiosGuardados(false);
    showToast("Configuración técnica restablecida", "info");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Configuración Técnica</h3>
        <button
          onClick={restablecerConfigTecnica}
          className="text-sm text-gray-600 hover:text-gray-800 underline"
        >
          Restablecer a valores por defecto
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL WebService
            <span className="ml-2 text-xs text-blue-600">(Se actualiza automáticamente según el ambiente)</span>
          </label>
          <input
            type="url"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            value={configuracion.url_webservice}
            readOnly
          />
          <p className="text-xs text-gray-500 mt-1">
            Ambiente: {ambiente === "produccion" ? "Producción" : "Habilitación (Pruebas)"}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Formato Fecha
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={configuracion.formato_fecha}
            onChange={(e) => onChange("formato_fecha", e.target.value)}
          >
            <option value="YYYY-MM-DD">YYYY-MM-DD (2024-03-15)</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY (15/03/2024)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (03/15/2024)</option>
            <option value="DD-MM-YYYY">DD-MM-YYYY (15-03-2024)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Timeout de Conexión (segundos)
          </label>
          <input
            type="number"
            min="10"
            max="300"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={configuracion.timeout_conexion || 60}
            onChange={(e) => onChange("timeout_conexion", e.target.value)}
            placeholder="60"
          />
        </div>
      </div>

      {/* Opciones de automatización */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Opciones de Automatización</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="validar_firma"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={configuracion.validar_firma}
                onChange={(e) => onChange("validar_firma", e.target.checked)}
              />
              <label htmlFor="validar_firma" className="ml-2 block text-sm text-gray-900">
                Validar firma digital automáticamente
              </label>
            </div>
            <p className="text-xs text-gray-500 ml-6">
              Verifica la validez de la firma digital antes del envío
            </p>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="generar_pdf"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={configuracion.generar_pdf}
                onChange={(e) => onChange("generar_pdf", e.target.checked)}
              />
              <label htmlFor="generar_pdf" className="ml-2 block text-sm text-gray-900">
                Generar PDF automáticamente
              </label>
            </div>
            <p className="text-xs text-gray-500 ml-6">
              Crea automáticamente la representación gráfica en PDF
            </p>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="envio_automatico"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={configuracion.envio_automatico}
                onChange={(e) => onChange("envio_automatico", e.target.checked)}
              />
              <label htmlFor="envio_automatico" className="ml-2 block text-sm text-gray-900">
                Envío automático a DIAN
              </label>
            </div>
            <p className="text-xs text-gray-500 ml-6">
              Envía documentos automáticamente tras la validación
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="reenvio_automatico"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={configuracion.reenvio_automatico || false}
                onChange={(e) => onChange("reenvio_automatico", e.target.checked)}
              />
              <label htmlFor="reenvio_automatico" className="ml-2 block text-sm text-gray-900">
                Reenvío automático en caso de error
              </label>
            </div>
            <p className="text-xs text-gray-500 ml-6">
              Intenta reenviar automáticamente si hay errores temporales
            </p>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="notificaciones_email"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={configuracion.notificaciones_email || false}
                onChange={(e) => onChange("notificaciones_email", e.target.checked)}
              />
              <label htmlFor="notificaciones_email" className="ml-2 block text-sm text-gray-900">
                Notificaciones por email
              </label>
            </div>
            <p className="text-xs text-gray-500 ml-6">
              Envía notificaciones sobre el estado de los documentos
            </p>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="log_detallado"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={configuracion.log_detallado || false}
                onChange={(e) => onChange("log_detallado", e.target.checked)}
              />
              <label htmlFor="log_detallado" className="ml-2 block text-sm text-gray-900">
                Logging detallado
              </label>
            </div>
            <p className="text-xs text-gray-500 ml-6">
              Registra información detallada para debugging
            </p>
          </div>
        </div>
      </div>

      {/* Configuración de reintentos */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-md font-medium text-gray-900 mb-3">Configuración de Reintentos</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número máximo de reintentos
            </label>
            <input
              type="number"
              min="0"
              max="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={configuracion.max_reintentos || 3}
              onChange={(e) => onChange("max_reintentos", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Intervalo entre reintentos (segundos)
            </label>
            <input
              type="number"
              min="1"
              max="3600"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={configuracion.intervalo_reintentos || 30}
              onChange={(e) => onChange("intervalo_reintentos", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timeout por reintento (segundos)
            </label>
            <input
              type="number"
              min="10"
              max="300"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={configuracion.timeout_reintento || 120}
              onChange={(e) => onChange("timeout_reintento", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Configuración avanzada */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">⚙️ Configuración Avanzada</h4>
        <div className="text-sm text-blue-700 space-y-2">
          <div className="flex justify-between">
            <span>URL WebService:</span>
            <span className="font-mono text-xs">{configuracion.url_webservice}</span>
          </div>
          <div className="flex justify-between">
            <span>Zona Horaria:</span>
            <span>{configuracion.zona_horaria}</span>
          </div>
          <div className="flex justify-between">
            <span>Timeout Total:</span>
            <span>{configuracion.timeout_conexion}s + ({configuracion.max_reintentos} × {configuracion.timeout_reintento}s) = {
              parseInt(configuracion.timeout_conexion || 60) + 
              (parseInt(configuracion.max_reintentos || 3) * parseInt(configuracion.timeout_reintento || 120))
            }s máximo</span>
          </div>
        </div>
      </div>

      {/* Recomendaciones */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-yellow-800 mb-2">💡 Recomendaciones</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• <strong>Producción</strong>: Activar validación de firma y generación de PDF</li>
          <li>• <strong>Alto volumen</strong>: Reducir timeouts y reintentos para mayor velocidad</li>
          <li>• <strong>Conexión lenta</strong>: Aumentar timeouts y reintentos</li>
          <li>• <strong>Debugging</strong>: Activar logging detallado temporalmente</li>
          <li>• <strong>Notificaciones</strong>: Configurar email solo si es necesario</li>
        </ul>
      </div>
    </div>
  );
}