import { useState } from "react";
import { saveAs } from "file-saver"; 

const DataExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  // Función para convertir un objeto a formato CSV
  const convertToCSV = (data) => {
    // Crear el encabezado basado en las claves del primer objeto
    if (!data || data.length === 0) return "";
    
    const header = Object.keys(data[0]).join(",") + "\r\n";
    
    // Crear las filas
    const rows = data.map(obj => 
      Object.values(obj).map(value => {
        // Si el valor contiene comas o saltos de línea, ponerlo entre comillas
        if (typeof value === 'string' && (value.includes(',') || value.includes('\n') || value.includes('"'))) {
          // Escapar las comillas duplicándolas
          value = value.replace(/"/g, '""');
          return `"${value}"`;
        }
        return value;
      }).join(",")
    ).join("\r\n");
    
    return header + rows;
  };

  // Función para exportar datos del localStorage a un archivo CSV
  const exportDataToCSV = async () => {
    setIsExporting(true);
    
    try {
      // Crear un objeto con todos los datos de la aplicación
      const appData = {
        metadata: {
          exportDate: new Date().toISOString(),
          appVersion: "1.0.0",
        },
        data: {
          presupuesto: JSON.parse(localStorage.getItem("PresupuestoLS") || "0"),
          gastos: JSON.parse(localStorage.getItem("ObjetosGastos") || "[]"),
          ingresosExtra: JSON.parse(localStorage.getItem("IngresosExtra") || "[]"),
          metas: JSON.parse(localStorage.getItem("MetasAhorro") || "[]"),
          categorias: JSON.parse(localStorage.getItem("categorias") || "[]"),
          recordatorios: JSON.parse(localStorage.getItem("recordatorios") || "[]"),
        }
      };

      // Crear archivos CSV para cada tipo de dato
      const csvFiles = {};
      
      // Gastos
      if (appData.data.gastos.length > 0) {
        csvFiles.gastos = convertToCSV(appData.data.gastos);
      }
      
      // Ingresos Extra
      if (appData.data.ingresosExtra.length > 0) {
        csvFiles.ingresosExtra = convertToCSV(appData.data.ingresosExtra);
      }
      
      // Metas
      if (appData.data.metas.length > 0) {
        csvFiles.metas = convertToCSV(appData.data.metas);
      }
      
      // Categorías
      if (appData.data.categorias.length > 0) {
        csvFiles.categorias = convertToCSV(appData.data.categorias);
      }
      
      // Recordatorios
      if (appData.data.recordatorios.length > 0) {
        csvFiles.recordatorios = convertToCSV(appData.data.recordatorios);
      }
      
      // Crear un archivo JSON con todos los datos y metadatos
      const jsonBlob = new Blob([JSON.stringify(appData, null, 2)], { type: "application/json" });
      
      // Crear un ZIP con todos los archivos (necesitarías una librería como JSZip)
      // Para simplificar, solo guardaremos el archivo JSON completo
      saveAs(jsonBlob, `mis-finanzas-export-${new Date().toISOString().slice(0, 10)}.json`);
      
      // Notificar al usuario
      if (window.Swal) {
        window.Swal.fire({
          title: "¡Exportación exitosa!",
          text: "Tus datos financieros han sido exportados correctamente",
          icon: "success",
          confirmButtonColor: "#3b82f6",
        });
      }
    } catch (error) {
      console.error("Error al exportar datos:", error);
      
      if (window.Swal) {
        window.Swal.fire({
          title: "Error",
          text: "Hubo un problema al exportar tus datos. Por favor, intenta nuevamente.",
          icon: "error",
          confirmButtonColor: "#3b82f6",
        });
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Exportar mis datos</h3>
      
      <p className="text-sm text-gray-600 mb-4">
        Exporta todos tus datos financieros en un archivo que podrás guardar en tu dispositivo 
        o compartir con otras aplicaciones.
      </p>
      
      <button
        onClick={exportDataToCSV}
        disabled={isExporting}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isExporting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Exportando...
          </>
        ) : (
          <>
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Exportar mis datos
          </>
        )}
      </button>
    </div>
  );
};

export default DataExport;