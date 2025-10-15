export default function Modales({ 
    showResetModal, 
    setShowResetModal,
    showValidationModal,
    setShowValidationModal,
    showProgressModal,
    progressMessage,
    validationErrors,
    resetearConfiguracion
  }) {
    return (
      <>
        {/* Modal de confirmación para resetear */}
        {showResetModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmar Restablecimiento</h3>
              <p className="text-sm text-gray-600 mb-6">
                ¿Estás seguro de que quieres restablecer toda la configuración?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={resetearConfiguracion}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Restablecer
                </button>
              </div>
            </div>
          </div>
        )}
  
        {/* Modal de validación */}
        {showValidationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Campos Requeridos</h3>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm text-red-600">{error}</li>
                ))}
              </ul>
              <button
                onClick={() => setShowValidationModal(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
  
        {/* Modal de progreso */}
        {showProgressModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Procesando...</h3>
                <p className="text-sm text-gray-600">{progressMessage}</p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }