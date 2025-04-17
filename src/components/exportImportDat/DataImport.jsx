import { useState, useRef } from "react";
import Swal from "sweetalert2";

const DataImport = ({ onDataImported }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef(null);

  // Función para manejar la importación del archivo
  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImporting(true);
    setFileError("");

    try {
      // Comprobar que sea un archivo JSON
      if (!file.name.endsWith('.json')) {
        setFileError("El archivo debe ser de tipo JSON");
        return;
      }

      // Leer el archivo como texto
      const fileContent = await readFileAsText(file);
      
      // Parsear el contenido
      const importedData = JSON.parse(fileContent);
      
      // Validar estructura de datos
      if (!validateDataStructure(importedData)) {
        setFileError("El formato del archivo no es válido");
        return;
      }

      // Mostrar confirmación antes de importar
      const confirmResult = await Swal.fire({
        title: "Confirmar importación",
        html: `
          <p>Estás a punto de importar los siguientes datos:</p>
          <ul class="text-left list-disc pl-5 mt-2 mb-3">
            ${importedData.data.gastos.length ? `<li>${importedData.data.gastos.length} gastos</li>` : ''}
            ${importedData.data.ingresosExtra.length ? `<li>${importedData.data.ingresosExtra.length} ingresos extra</li>` : ''}
            ${importedData.data.metas.length ? `<li>${importedData.data.metas.length} metas de ahorro</li>` : ''}
            ${importedData.data.categorias.length ? `<li>${importedData.data.categorias.length} categorías</li>` : ''}
            ${importedData.data.recordatorios.length ? `<li>${importedData.data.recordatorios.length} recordatorios</li>` : ''}
          </ul>
          <p class="font-medium text-amber-600">¿Quieres combinar estos datos con los existentes o reemplazar todos tus datos actuales?</p>
        `,
        icon: "question",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Combinar",
        denyButtonText: "Reemplazar todo",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#3b82f6",
        denyButtonColor: "#ef4444",
      });

      if (confirmResult.isDismissed) {
        // Usuario canceló
        return;
      }

      // Determinar modo de importación (combinar o reemplazar)
      const replacementMode = confirmResult.isDenied; // true = reemplazar, false = combinar
      
      // Importar datos
      await importData(importedData, replacementMode);
      
      // Notificar al componente padre (si existe esta función)
      if (onDataImported) {
        onDataImported();
      }
      
      // Mostrar mensaje de éxito y luego recargar la página
      Swal.fire({
        title: "¡Importación exitosa!",
        text: "Tus datos financieros han sido importados correctamente. La página se recargará para mostrar los cambios.",
        icon: "success",
        confirmButtonColor: "#3b82f6",
        confirmButtonText: "Aceptar",
      }).then(() => {
        // Guardar la ruta actual para redirección
        const currentRoute = window.location.pathname;
        localStorage.setItem("lastVisitedRoute", currentRoute);

        // Recargar la página
        window.location.reload();
      });
      
      // Limpiar el input de archivo
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error al importar datos:", error);
      setFileError("Hubo un error al procesar el archivo: " + error.message);
      
      Swal.fire({
        title: "Error",
        text: "Hubo un problema al importar tus datos. Por favor, verifica el formato del archivo.",
        icon: "error",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Función para leer el archivo como texto
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  // Función para validar la estructura de los datos importados
  const validateDataStructure = (data) => {
    // Verificar estructura básica
    if (!data || !data.metadata || !data.data) {
      return false;
    }
    
    // Verificar que existan las propiedades necesarias
    const requiredProps = ['presupuesto', 'gastos', 'ingresosExtra', 'metas', 'categorias', 'recordatorios'];
    
    return requiredProps.every(prop => prop in data.data);
  };

  // Función para importar los datos al localStorage y actualizar estados
  const importData = async (importedData, replacementMode) => {
    // Si es modo reemplazo, limpiamos primero
    if (replacementMode) {
      localStorage.removeItem("ObjetosGastos");
      localStorage.removeItem("PresupuestoLS");
      localStorage.removeItem("IngresosExtra");
      localStorage.removeItem("MetasAhorro");
      localStorage.removeItem("categorias");
      localStorage.removeItem("recordatorios");
    }
    
    // Actualizar presupuesto
    localStorage.setItem("PresupuestoLS", JSON.stringify(importedData.data.presupuesto));
    localStorage.setItem("ValidLS", JSON.stringify(true));
    
    // Actualizar gastos (combinando o reemplazando)
    if (replacementMode) {
      localStorage.setItem("ObjetosGastos", JSON.stringify(importedData.data.gastos));
    } else {
      const currentGastos = JSON.parse(localStorage.getItem("ObjetosGastos") || "[]");
      // Obtener IDs existentes para evitar duplicados
      const existingIds = new Set(currentGastos.map(item => item.id));
      // Filtrar solo nuevos elementos
      const newGastos = importedData.data.gastos.filter(item => !existingIds.has(item.id));
      // Combinar y guardar
      localStorage.setItem("ObjetosGastos", JSON.stringify([...newGastos, ...currentGastos]));
    }
    
    // Actualizar ingresos extra (combinando o reemplazando)
    if (replacementMode) {
      localStorage.setItem("IngresosExtra", JSON.stringify(importedData.data.ingresosExtra));
    } else {
      const currentIngresos = JSON.parse(localStorage.getItem("IngresosExtra") || "[]");
      const existingIds = new Set(currentIngresos.map(item => item.id));
      const newIngresos = importedData.data.ingresosExtra.filter(item => !existingIds.has(item.id));
      localStorage.setItem("IngresosExtra", JSON.stringify([...newIngresos, ...currentIngresos]));
    }
    
    // Actualizar metas (combinando o reemplazando)
    if (replacementMode) {
      localStorage.setItem("MetasAhorro", JSON.stringify(importedData.data.metas));
    } else {
      const currentMetas = JSON.parse(localStorage.getItem("MetasAhorro") || "[]");
      const existingIds = new Set(currentMetas.map(item => item.id));
      const newMetas = importedData.data.metas.filter(item => !existingIds.has(item.id));
      localStorage.setItem("MetasAhorro", JSON.stringify([...newMetas, ...currentMetas]));
    }
    
    // Actualizar categorías (combinando o reemplazando)
    if (replacementMode) {
      localStorage.setItem("categorias", JSON.stringify(importedData.data.categorias));
    } else {
      const currentCategorias = JSON.parse(localStorage.getItem("categorias") || "[]");
      const existingIds = new Set(currentCategorias.map(item => item.id));
      const newCategorias = importedData.data.categorias.filter(item => !existingIds.has(item.id));
      localStorage.setItem("categorias", JSON.stringify([...newCategorias, ...currentCategorias]));
    }
    
    // Actualizar recordatorios (combinando o reemplazando)
    if (replacementMode) {
      localStorage.setItem("recordatorios", JSON.stringify(importedData.data.recordatorios));
    } else {
      const currentRecordatorios = JSON.parse(localStorage.getItem("recordatorios") || "[]");
      const existingIds = new Set(currentRecordatorios.map(item => item.id));
      const newRecordatorios = importedData.data.recordatorios.filter(item => !existingIds.has(item.id));
      localStorage.setItem("recordatorios", JSON.stringify([...newRecordatorios, ...currentRecordatorios]));
    }
    
    // Guardar un indicador de que se importaron datos
    localStorage.setItem("dataImportTimestamp", Date.now().toString());
    
    // Disparar evento para notificar a la aplicación (por si no se recarga la página)
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Importar datos</h3>
      
      <p className="text-sm text-gray-600 mb-4">
        Importa tus datos financieros desde un archivo JSON exportado previamente.
      </p>
      
      <div className="mt-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selecciona un archivo para importar
        </label>
        
        <input
          type="file"
          accept=".json"
          onChange={handleFileImport}
          ref={fileInputRef}
          disabled={isImporting}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        
        {fileError && (
          <p className="mt-2 text-sm text-red-600">
            {fileError}
          </p>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-500 bg-gray-50 p-3 rounded border border-gray-200">
        <p className="font-medium text-gray-700 mb-1">Importante:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Sólo se aceptan archivos JSON exportados por esta aplicación</li>
          <li>Puedes elegir combinar los datos con los existentes o reemplazar todo</li>
          <li>Si estás autenticado, los cambios se sincronizarán automáticamente</li>
          <li>La página se recargará automáticamente al importar datos</li>
        </ul>
      </div>
    </div>
  );
};

export default DataImport;