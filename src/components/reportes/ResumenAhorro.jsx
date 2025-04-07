import { cantidad } from "../../helpers/index.js";

const ResumenAhorro = ({ datosReporte }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Resumen de Ahorro</h3>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total ahorrado */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">Total Ahorrado</h4>
                {datosReporte.tendenciaAhorro !== "igual" && (
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      datosReporte.tendenciaAhorro === "subida"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {datosReporte.tendenciaAhorro === "subida" ? "↑" : "↓"} vs anterior
                  </span>
                )}
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-blue-600">
                  {cantidad(datosReporte.totalAhorrado)}
                </span>
              </div>
            </div>
          </div>

          {/* Ahorro disponible */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-700">Ahorro Disponible</h4>
              <div className="mt-2">
                <span className="text-2xl font-bold text-green-600">
                  {cantidad(datosReporte.ahorroDisponible)}
                </span>
              </div>
            </div>
          </div>

          {/* Progreso global de ahorro */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-700">Progreso Global</h4>
              <div className="mt-2">
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-gray-900">
                    {datosReporte.progresoAhorro}%
                  </span>
                </div>
                <div className="mt-2">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                    <div
                      style={{ width: `${datosReporte.progresoAhorro}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Proyección de completitud */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-700">Proyección de Completitud</h4>
              <div className="mt-2">
                <span className="text-2xl font-bold text-gray-900">
                  {datosReporte.proyeccionCompletitud > 0
                    ? `${datosReporte.proyeccionCompletitud} meses`
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumenAhorro;