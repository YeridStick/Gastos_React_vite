import React, { useState } from 'react';

const FormularioPresupuesto = ({ 
  presupuesto, 
  setPresupuesto, 
  setIsValid, 
  setActiveTab 
}) => {
  const [error, setError] = useState(false);

  const handlePresupuesto = () => {
    if (presupuesto <= 0) {
      setError(true);
      return;
    }

    setError(false);
    setIsValid(true);
    setActiveTab("dashboard");
    
    // Guardar en localStorage
    localStorage.setItem("PresupuestoLS", JSON.stringify(presupuesto));
    localStorage.setItem("ValidLS", JSON.stringify(true));
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center p-4 sm:p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-5 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
          Bienvenidos
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 text-center">
          Para comenzar, define tu presupuesto inicial
        </p>

        <div className="flex flex-col">
          <label
            htmlFor="presupuesto"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            Presupuesto inicial
          </label>
          <input
            type="number"
            id="presupuesto"
            value={presupuesto}
            onChange={(e) => {
              setPresupuesto(Number(e.target.value));
              setError(Number(e.target.value) <= 0);
            }}
            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ingresa tu presupuesto"
          />

          {error && (
            <p className="mt-2 text-xs sm:text-sm text-red-600">
              El presupuesto debe ser un valor positivo
            </p>
          )}

          <button
            onClick={handlePresupuesto}
            disabled={presupuesto <= 0}
            className={`mt-4 px-4 py-2 rounded-md text-white font-medium text-sm sm:text-base ${
              presupuesto > 0
                ? "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Comenzar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormularioPresupuesto;