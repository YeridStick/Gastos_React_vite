import { useState } from "react";
import DashboardEstado from "./DashboardEstado";
import TabEmpresa from "./TabEmpresa";
import TabDIAN from "./TabDIAN";
import TabCertificado from "./TabCertificado";
import TabTecnica from "./TabTecnica";
import BotonesAccion from "./BotonesAccion";
import Modales from "./Modales";
import Toast from "./Toast";
import { useConfiguracion } from "./hook/useConfiguracion";
import { validarNIT, validarEmail } from "./utils/validaciones";
import TabsNavegacion from "./TabsNavegacion";

export default function ConfiguracionDIAN() {
  const {
    configuracion,
    setConfiguracion,
    cambiosGuardados,
    setCambiosGuardados,
    guardarConfiguracion,
    exportarConfiguracion,
    importarConfiguracion,
    resetearConfiguracion
  } = useConfiguracion();

  const [tabActiva, setTabActiva] = useState("empresa");
  const [testConexion, setTestConexion] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
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
    
    if (seccion === "dian" && ["ambiente", "id_software", "token_autenticacion"].includes(campo)) {
      setTestConexion(null);
    }
  };

  const testearConexionDIAN = async () => {
    setTestConexion("testing");
    setShowProgressModal(true);
    setProgressMessage("Probando conexión con DIAN...");
    
    setTimeout(() => {
      setShowProgressModal(false);
      
      if (!configuracion.dian.id_software.trim()) {
        setTestConexion("error");
        showToast("Error: ID Software requerido para test de conexión", "error");
        return;
      }
      
      if (configuracion.dian.ambiente === "produccion" && !configuracion.dian.token_autenticacion.trim()) {
        setTestConexion("error");
        showToast("Error: Token requerido para ambiente de producción", "error");
        return;
      }
      
      setTestConexion("success");
      showToast(`Conexión exitosa con DIAN - Ambiente: ${configuracion.dian.ambiente}`, "success");
    }, 3000);
  };

  const tabs = [
    { id: "empresa", nombre: "Datos Empresa", icono: "🏢" },
    { id: "dian", nombre: "Configuración DIAN", icono: "📋" },
    { id: "certificado", nombre: "Certificados", icono: "🔐" },
    { id: "tecnica", nombre: "Configuración Técnica", icono: "⚙️" }
  ];

  const componenteTab = {
    empresa: (
      <TabEmpresa 
        configuracion={configuracion.empresa}
        onChange={(campo, valor) => handleChange("empresa", campo, valor)}
        validarNIT={validarNIT}
        validarEmail={validarEmail}
      />
    ),
    dian: (
      <TabDIAN 
        configuracion={configuracion.dian}
        onChange={(campo, valor) => handleChange("dian", campo, valor)}
      />
    ),
    certificado: (
      <TabCertificado 
        configuracion={configuracion.certificado}
        onChange={(campo, valor) => handleChange("certificado", campo, valor)}
        showToast={showToast}
        setShowProgressModal={setShowProgressModal}
        setProgressMessage={setProgressMessage}
        setCambiosGuardados={setCambiosGuardados}
      />
    ),
    tecnica: (
      <TabTecnica 
        configuracion={configuracion.configuracion_tecnica}
        ambiente={configuracion.dian.ambiente}
        onChange={(campo, valor) => handleChange("configuracion_tecnica", campo, valor)}
        showToast={showToast}
        setCambiosGuardados={setCambiosGuardados}
      />
    )
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Configuración DIAN</h1>
        <p className="text-gray-600">Configura los parámetros para facturación electrónica según normativa DIAN</p>
      </div>

      {/* Dashboard de Estado */}
      <DashboardEstado 
        configuracion={configuracion}
        testConexion={testConexion}
        testearConexionDIAN={testearConexionDIAN}
      />

      {/* Navegación de Tabs */}
      <TabsNavegacion 
        tabs={tabs}
        tabActiva={tabActiva}
        setTabActiva={setTabActiva}
      />

      {/* Contenido de Tab Activa */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {componenteTab[tabActiva]}
      </div>

      {/* Botones de Acción */}
      <BotonesAccion 
        exportarConfiguracion={exportarConfiguracion}
        importarConfiguracion={importarConfiguracion}
        resetearConfiguracion={() => setShowResetModal(true)}
        guardarConfiguracion={() => guardarConfiguracion(setValidationErrors, setShowValidationModal, setShowProgressModal, setProgressMessage, showToast)}
        cambiosGuardados={cambiosGuardados}
      />

      {/* Información y Estado */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <svg className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Importante</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>La configuración en ambiente de <strong>Pruebas</strong> permite generar facturas de práctica sin validez legal.</li>
                <li>Para facturación <strong>real</strong>, debe configurar el ambiente de Producción con certificados válidos.</li>
                <li>Los certificados digitales tienen fecha de vencimiento y deben renovarse periódicamente.</li>
                <li>Consulte con su proveedor tecnológico o la DIAN para obtener los parámetros correctos.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      <Modales 
        showResetModal={showResetModal}
        setShowResetModal={setShowResetModal}
        showValidationModal={showValidationModal}
        setShowValidationModal={setShowValidationModal}
        showProgressModal={showProgressModal}
        progressMessage={progressMessage}
        validationErrors={validationErrors}
        resetearConfiguracion={() => resetearConfiguracion(setShowResetModal, setTestConexion, showToast, setCambiosGuardados)}
      />

      {/* Toast de Notificaciones */}
      <Toast 
        toast={toast}
        setToast={setToast}
      />

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span>Configuración DIAN v2.1.0</span>
            <span>•</span>
            <span>Última actualización: {new Date().toLocaleDateString('es-ES')}</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ayuda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}