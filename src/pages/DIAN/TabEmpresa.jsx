export default function TabEmpresa({ configuracion, onChange, validarNIT, validarEmail }) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Información de la Empresa</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NIT *
            </label>
            <input
              type="text"
              required
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                configuracion.nit && !validarNIT(configuracion.nit) 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300'
              }`}
              value={configuracion.nit}
              onChange={(e) => onChange("nit", e.target.value)}
              placeholder="900123456-7"
            />
            {configuracion.nit && !validarNIT(configuracion.nit) && (
              <p className="mt-1 text-xs text-red-600">Formato de NIT inválido</p>
            )}
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Razón Social *
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={configuracion.razon_social}
              onChange={(e) => onChange("razon_social", e.target.value)}
              placeholder="Mi Empresa S.A.S."
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Régimen Tributario *
            </label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={configuracion.regimen_tributario}
              onChange={(e) => onChange("regimen_tributario", e.target.value)}
            >
              <option value="comun">Régimen Común</option>
              <option value="simplificado">Régimen Simplificado</option>
            </select>
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                configuracion.email && !validarEmail(configuracion.email) 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300'
              }`}
              value={configuracion.email}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="facturacion@empresa.com"
            />
            {configuracion.email && !validarEmail(configuracion.email) && (
              <p className="mt-1 text-xs text-red-600">Formato de email inválido</p>
            )}
          </div>
  
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={configuracion.direccion}
              onChange={(e) => onChange("direccion", e.target.value)}
              placeholder="Calle 123 #45-67"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ciudad
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={configuracion.ciudad}
              onChange={(e) => onChange("ciudad", e.target.value)}
              placeholder="Bogotá"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departamento
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={configuracion.departamento}
              onChange={(e) => onChange("departamento", e.target.value)}
              placeholder="Cundinamarca"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={configuracion.telefono}
              onChange={(e) => onChange("telefono", e.target.value)}
              placeholder="+57 1 234 5678"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Actividad Económica
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={configuracion.actividad_economica}
              onChange={(e) => onChange("actividad_economica", e.target.value)}
              placeholder="Comercio al por menor"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código Actividad CIIU
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={configuracion.codigo_actividad}
              onChange={(e) => onChange("codigo_actividad", e.target.value)}
              placeholder="4711"
            />
          </div>
        </div>
  
        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Información Importante</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• El NIT debe incluir el dígito de verificación (ej: 900123456-7)</li>
            <li>• La razón social debe coincidir exactamente con el RUT</li>
            <li>• El email será usado para notificaciones del sistema</li>
            <li>• El código CIIU debe corresponder a la actividad principal</li>
          </ul>
        </div>
      </div>
    );
  }