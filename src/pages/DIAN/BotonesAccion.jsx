import { useRef } from "react";

export default function BotonesAccion({ 
  exportarConfiguracion, 
  importarConfiguracion, 
  resetearConfiguracion, 
  guardarConfiguracion, 
  cambiosGuardados 
}) {
  const fileInputRef = useRef(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    importarConfiguracion(event);
  };

  return (
    <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
      {/* Grupo de botones principales */}
      <div className="flex flex-wrap gap-3">
        {/* Botón Guardar */}
        <button
          onClick={guardarConfiguracion}
          disabled={cambiosGuardados}
          className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            cambiosGuardados
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          {cambiosGuardados ? 'Guardado' : 'Guardar Configuración'}
        </button>

        {/* Indicador de cambios */}
        {!cambiosGuardados && (
          <div className="flex items-center text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Cambios pendientes
          </div>
        )}
      </div>

      {/* Grupo de botones secundarios */}
      <div className="flex flex-wrap gap-2">
        {/* Botón Exportar */}
        <button
          onClick={exportarConfiguracion}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
          title="Exportar configuración como JSON"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exportar
        </button>

        {/* Botón Importar */}
        <button
          onClick={handleImportClick}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
          title="Importar configuración desde JSON"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
          Importar
        </button>

        {/* Input de archivo oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Botón Resetear */}
        <button
          onClick={resetearConfiguracion}
          className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 flex items-center gap-2 transition-colors"
          title="Restablecer a configuración por defecto"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Resetear
        </button>
      </div>

      {/* Información adicional */}
      <div className="w-full sm:w-auto">
        <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Ctrl+S para guardar rápido</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Exportar antes de cambios importantes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}