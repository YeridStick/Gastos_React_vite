import { useState } from "react";

import { syncDataToServer } from "../services/syncService";
import DataExport from "../components/exportImportDat/DataExport";
import DataImport from "../components/exportImportDat/DataImport";

const DataManagement = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const isAuthenticated = localStorage.getItem("token") !== null;

  // Función para manejar la actualización después de importar datos
  const handleDataImported = () => {
    // Forzar la actualización del componente
    setRefreshKey(prevKey => prevKey + 1);
    
    // Si el usuario está autenticado, sincronizar con el servidor
    if (isAuthenticated) {
      syncDataToServer();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Gestión de Datos</h2>
        <p className="text-gray-600">
          Exporta tus datos para hacer copias de seguridad o importa datos desde un archivo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de exportación */}
        <div key={`export-${refreshKey}`}>
          <DataExport />
        </div>

        {/* Panel de importación */}
        <div key={`import-${refreshKey}`}>
          <DataImport onDataImported={handleDataImported} />
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="text-lg font-medium text-blue-800 mb-2">
          Información sobre portabilidad de datos
        </h3>
        <div className="space-y-3 text-sm text-blue-700">
          <p>
            <strong>Copias de seguridad:</strong> Exporta regularmente tus datos para evitar 
            pérdidas en caso de problemas con tu dispositivo.
          </p>
          <p>
            <strong>Dispositivos múltiples:</strong> Usa la exportación/importación para
            transferir tus datos entre dispositivos sin necesidad de una cuenta.
          </p>
          {isAuthenticated && (
            <p>
              <strong>Sincronización:</strong> Como tienes una cuenta, los cambios realizados
              al importar datos se sincronizarán automáticamente con el servidor.
            </p>
          )}
          <p>
            <strong>Privacidad:</strong> Los archivos exportados contienen toda tu información 
            financiera. Guárdalos en un lugar seguro.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;