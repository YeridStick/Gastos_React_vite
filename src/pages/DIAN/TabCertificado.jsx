import { calcularDiasRestantes } from "./utils/helpers";

export default function TabCertificado({ 
  configuracion, 
  onChange, 
  showToast, 
  setShowProgressModal, 
  setProgressMessage, 
  setCambiosGuardados 
}) {
  
  const generarCertificadoPrueba = () => {
    setShowProgressModal(true);
    setProgressMessage("Generando certificado de prueba...");
    
    setTimeout(() => {
      onChange("archivo_certificado", "certificado_prueba.p12");
      onChange("password_certificado", "123456");
      onChange("fecha_vencimiento", new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      onChange("entidad_certificadora", "DIAN");
      
      setCambiosGuardados(false);
      setShowProgressModal(false);
      showToast("Certificado de prueba generado exitosamente", "success");
    }, 1500);
  };

  const validarCertificado = () => {
    setShowProgressModal(true);
    setProgressMessage("Validando certificado digital...");
    
    setTimeout(() => {
      setShowProgressModal(false);
      if (configuracion.archivo_certificado && configuracion.password_certificado) {
        showToast("✅ Certificado válido y operativo", "success");
      } else {
        showToast("❌ Certificado incompleto o inválido", "error");
      }
    }, 2000);
  };

  const mostrarInfoCertificado = () => {
    if (!configuracion.archivo_certificado) {
      showToast("No hay certificado configurado", "error");
      return;
    }
    
    const info = `
INFORMACIÓN DEL CERTIFICADO DIGITAL

📁 Archivo: ${configuracion.archivo_certificado}
🏢 Entidad: ${configuracion.entidad_certificadora || "No especificada"}
📅 Vencimiento: ${configuracion.fecha_vencimiento ? 
      new Date(configuracion.fecha_vencimiento).toLocaleDateString('es-ES') : "No especificado"}
⏰ Días restantes: ${calcularDiasRestantes(configuracion.fecha_vencimiento) || "N/A"}
🔐 Estado: ${calcularDiasRestantes(configuracion.fecha_vencimiento) <= 0 ? 
      "VENCIDO" : calcularDiasRestantes(configuracion.fecha_vencimiento) < 30 ? 
      "POR VENCER" : "VIGENTE"}

NOTAS:
• Los certificados deben renovarse antes del vencimiento
• Solo certificados válidos funcionan en producción
• Mantenga la contraseña segura y confidencial
    `;
    
    alert(info);
  };

  const copiarSerialCertificado = () => {
    const serial = `${Date.now().toString(16).toUpperCase()}`;
    navigator.clipboard.writeText(serial).then(() => {
      showToast(`Serial copiado: ${serial}`, "success");
    }).catch(() => {
      showToast("Error al copiar el serial", "error");
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Certificados Digitales</h3>
        <button
          onClick={generarCertificadoPrueba}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Generar Certificado de Prueba
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Archivo Certificado (.p12)
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={configuracion.archivo_certificado}
            onChange={(e) => onChange("archivo_certificado", e.target.value)}
            placeholder="certificado.p12"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña Certificado
          </label>
          <input
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={configuracion.password_certificado}
            onChange={(e) => onChange("password_certificado", e.target.value)}
            placeholder="Contraseña del certificado"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Vencimiento
          </label>
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={configuracion.fecha_vencimiento}
            onChange={(e) => onChange("fecha_vencimiento", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Entidad Certificadora
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={configuracion.entidad_certificadora}
            onChange={(e) => onChange("entidad_certificadora", e.target.value)}
          >
            <option value="">Seleccionar entidad</option>
            <option value="GSE">GSE - Gestión de Seguridad Electrónica</option>
            <option value="Andes SCD">Andes SCD</option>
            <option value="Certicámara">Certicámara</option>
            <option value="DIAN">DIAN - Certificado de Pruebas</option>
            <option value="otro">Otra entidad</option>
          </select>
        </div>

        {configuracion.entidad_certificadora === "otro" && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Especificar Entidad Certificadora
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nombre de la entidad certificadora"
              onChange={(e) => onChange("entidad_certificadora_custom", e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Estado del certificado */}
      {configuracion.fecha_vencimiento && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Estado del Certificado</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Archivo:</span>
              <span className="text-sm font-medium">
                {configuracion.archivo_certificado || "No especificado"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Vence:</span>
              <span className="text-sm font-medium">
                {new Date(configuracion.fecha_vencimiento).toLocaleDateString('es-ES')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Días restantes:</span>
              <span className={`text-sm font-medium ${
                calcularDiasRestantes(configuracion.fecha_vencimiento) < 30
                  ? 'text-red-600' : calcularDiasRestantes(configuracion.fecha_vencimiento) < 90
                  ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {calcularDiasRestantes(configuracion.fecha_vencimiento) || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Estado:</span>
              <span className={`text-sm font-medium ${
                calcularDiasRestantes(configuracion.fecha_vencimiento) <= 0
                  ? 'text-red-600' : calcularDiasRestantes(configuracion.fecha_vencimiento) < 30
                  ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {calcularDiasRestantes(configuracion.fecha_vencimiento) <= 0
                  ? '🔴 VENCIDO' : calcularDiasRestantes(configuracion.fecha_vencimiento) < 30
                  ? '🟡 POR VENCER' : '🟢 VIGENTE'
                }
              </span>
            </div>
          </div>
          
          {/* Alertas del certificado */}
          {calcularDiasRestantes(configuracion.fecha_vencimiento) <= 0 && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h5 className="text-sm font-medium text-red-800">Certificado Vencido</h5>
                  <p className="text-xs text-red-700 mt-1">
                    El certificado digital ha vencido. No podrá firmar documentos electrónicos.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {calcularDiasRestantes(configuracion.fecha_vencimiento) > 0 && 
           calcularDiasRestantes(configuracion.fecha_vencimiento) < 30 && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h5 className="text-sm font-medium text-yellow-800">Certificado por Vencer</h5>
                  <p className="text-xs text-yellow-700 mt-1">
                    Su certificado vence pronto. Considere renovarlo para evitar interrupciones.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Herramientas para certificados */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Herramientas de Certificado</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={validarCertificado}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
          >
            Validar Certificado
          </button>
          <button
            onClick={mostrarInfoCertificado}
            className="text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors"
          >
            Información Detallada
          </button>
          <button
            onClick={copiarSerialCertificado}
            className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
          >
            Copiar Serial
          </button>
        </div>
      </div>

      {/* Guía de certificados */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-800 mb-2">📚 Guía de Certificados</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Para <strong>Pruebas</strong>: Use el certificado generado automáticamente</li>
          <li>• Para <strong>Producción</strong>: Obtenga un certificado válido de una CA autorizada</li>
          <li>• Entidades certificadoras: GSE, Andes SCD, Certicámara</li>
          <li>• El certificado debe estar en formato PKCS#12 (.p12)</li>
          <li>• Renueve el certificado antes de su vencimiento</li>
        </ul>
      </div>
    </div>
  );
}