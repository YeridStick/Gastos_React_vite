import { useState } from 'react';

// Función para formatear número con separadores de miles
const formatNumber = (value) => {
  if (!value) return '';
  return new Intl.NumberFormat('es-CO').format(value);
};

// Función para convertir texto formateado a número
const parseFormattedNumber = (formattedValue) => {
  if (!formattedValue) return 0;
  // Remover puntos separadores de miles y convertir a número
  return parseInt(formattedValue.replace(/\./g, ''), 10) || 0;
};

// Componente de configuración inicial de presupuesto
function PresupuestoSetup({
  presupuesto,
  setPresupuesto,
  setIsValid,
  setActiveTab,
}) {
  const [displayValue, setDisplayValue] = useState(
    presupuesto > 0 ? formatNumber(presupuesto) : ''
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    
    // Permitir solo números y puntos
    const cleanValue = value.replace(/[^\d]/g, '');
    
    if (cleanValue === '') {
      setDisplayValue('');
      setPresupuesto(0);
      return;
    }

    const numericValue = parseInt(cleanValue, 10);
    
    // Limitar a un máximo razonable (ejemplo: 999,999,999)
    if (numericValue <= 999999999) {
      setDisplayValue(formatNumber(numericValue));
      setPresupuesto(numericValue);
    }
  };

  const handleSubmit = () => {
    const numericPresupuesto = parseFormattedNumber(displayValue);
    if (numericPresupuesto > 0) {
      setPresupuesto(numericPresupuesto);
      setIsValid(true);
      setActiveTab("dashboard");
    }
  };

  const numericPresupuesto = parseFormattedNumber(displayValue);

  return (
    <div className="flex flex-col flex-1 items-center justify-center  via-white to-indigo-50">
      <div className="max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 transform transition-all duration-300 hover:shadow-2xl">
        {/* Header con icono */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <svg 
              className="w-8 h-8 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            ¡Bienvenido!
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Configura tu presupuesto inicial para comenzar a administrar tus finanzas de manera inteligente
          </p>
        </div>

        {/* Formulario */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="presupuesto"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Presupuesto inicial
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 text-lg font-medium">$</span>
              </div>
              <input
                type="text"
                id="presupuesto"
                value={displayValue}
                onChange={handleInputChange}
                className={`w-full pl-8 pr-4 py-3 text-lg font-medium border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                  numericPresupuesto <= 0
                    ? 'border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                    : 'border-green-300 focus:border-green-500 focus:ring-4 focus:ring-green-100'
                } placeholder-gray-400`}
                placeholder="0"
                autoComplete="off"
              />
              {displayValue && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <span className="text-xs text-gray-500 font-medium">COP</span>
                </div>
              )}
            </div>
            
            {/* Indicador visual del valor */}
            {displayValue && numericPresupuesto > 0 && (
              <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 font-medium">
                  💰 Presupuesto: {displayValue} pesos colombianos
                </p>
              </div>
            )}
          </div>

          {/* Mensaje de error */}
          {displayValue && numericPresupuesto <= 0 && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg border border-red-200">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-600 font-medium">
                El presupuesto debe ser mayor a cero
              </p>
            </div>
          )}

          {/* Sugerencias */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              💡 Consejos:
            </h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Incluye todos tus ingresos mensuales</li>
              <li>• Considera ingresos fijos y variables</li>
              <li>• Puedes ajustar este valor más adelante</li>
            </ul>
          </div>

          {/* Botón de acción */}
          <button
            onClick={handleSubmit}
            disabled={numericPresupuesto <= 0}
            className={`w-full py-3 px-6 rounded-xl text-white font-semibold text-base transition-all duration-200 transform ${
              numericPresupuesto > 0
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 hover:scale-[1.02] shadow-lg hover:shadow-xl'
                : 'bg-gray-400 cursor-not-allowed opacity-60'
            }`}
          >
            {numericPresupuesto > 0 ? (
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Comenzar mi gestión financiera
              </span>
            ) : (
              'Ingresa tu presupuesto para continuar'
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            🔒 Tus datos están seguros y se guardan localmente
          </p>
        </div>
      </div>
    </div>
  );
}

export default PresupuestoSetup;