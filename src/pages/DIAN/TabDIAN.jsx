export default function TabDIAN({ configuracion, onChange }) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Configuración DIAN</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ambiente *
            </label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={configuracion.ambiente}
              onChange={(e) => onChange("ambiente", e.target.value)}
            >
              <option value="pruebas">Pruebas</option>
              <option value="produccion">Producción</option>
            </select>
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID Software *
              <span className="ml-1 text-gray-400 cursor-help" title="Identificador único del software asignado por la DIAN. Formato UUID.">ℹ️</span>
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={configuracion.id_software}
              onChange={(e) => onChange("id_software", e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PIN Software
              <span className="ml-1 text-gray-400 cursor-help" title="Código PIN asignado por la DIAN para validar el software.">ℹ️</span>
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={configuracion.pin_software}
              onChange={(e) => onChange("pin_software", e.target.value)}
              placeholder="12345"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Token Autenticación
              <span className="ml-1 text-gray-400 cursor-help" title="Token de autenticación para acceso a los WebServices de la DIAN.">ℹ️</span>
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={configuracion.token_autenticacion}
              onChange={(e) => onChange("token_autenticacion", e.target.value)}
              placeholder="Token de autenticación"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número Resolución
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={configuracion.numero_resolucion}
              onChange={(e) => onChange("numero_resolucion", e.target.value)}
              placeholder="18760000001"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Resolución
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={configuracion.fecha_resolucion}
              onChange={(e) => onChange("fecha_resolucion", e.target.value)}
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prefijo
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={configuracion.prefijo}
              onChange={(e) => onChange("prefijo", e.target.value)}
              placeholder="FE"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numeración Desde
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={configuracion.numeracion_desde}
              onChange={(e) => onChange("numeracion_desde", e.target.value)}
              placeholder="1"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numeración Hasta
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={configuracion.numeracion_hasta}
              onChange={(e) => onChange("numeracion_hasta", e.target.value)}
              placeholder="5000000"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vigencia Desde
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={configuracion.vigencia_desde}
              onChange={(e) => onChange("vigencia_desde", e.target.value)}
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vigencia Hasta
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={configuracion.vigencia_hasta}
              onChange={(e) => onChange("vigencia_hasta", e.target.value)}
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clave Técnica
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={configuracion.clave_tecnica}
              onChange={(e) => onChange("clave_tecnica", e.target.value)}
              placeholder="Clave técnica del software"
            />
          </div>
        </div>
  
        {/* Información de numeración */}
        {configuracion.numeracion_desde && configuracion.numeracion_hasta && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Rango de Numeración</h4>
            <div className="text-sm text-blue-700">
              <p>Facturas disponibles: {configuracion.prefijo || 'FE'} {configuracion.numeracion_desde} - {configuracion.prefijo || 'FE'} {configuracion.numeracion_hasta}</p>
              <p>Total disponibles: {(parseInt(configuracion.numeracion_hasta || 0) - parseInt(configuracion.numeracion_desde || 0) + 1).toLocaleString()} facturas</p>
            </div>
          </div>
        )}
  
        {/* Alertas según ambiente */}
        {configuracion.ambiente === "produccion" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-red-800 mb-2">⚠️ Ambiente de Producción</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Verificar que todos los datos sean correctos</li>
              <li>• El Token de Autenticación es obligatorio</li>
              <li>• Las facturas tendrán validez legal</li>
              <li>• Certificado digital debe estar vigente</li>
            </ul>
          </div>
        )}
  
        {configuracion.ambiente === "pruebas" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">🧪 Ambiente de Pruebas</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Las facturas NO tienen validez legal</li>
              <li>• Usar solo para testing y desarrollo</li>
              <li>• Cambiar a Producción para facturación real</li>
              <li>• Se pueden usar certificados de prueba</li>
            </ul>
          </div>
        )}
      </div>
    );
  }