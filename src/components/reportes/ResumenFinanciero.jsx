import { cantidad } from "../../helpers/index";

const ResumenFinanciero = ({ datosReporte }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Resumen Financiero General
        </h3>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Gasto total */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">
                  Gasto Total
                </h4>
                {datosReporte.tendencia !== "igual" && (
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      datosReporte.tendencia === "subida"
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {datosReporte.tendencia === "subida" ? "↑" : "↓"} vs
                    anterior
                  </span>
                )}
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-gray-900">
                  {cantidad(datosReporte.gastoTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Ingresos Extra */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-700">
                Ingresos Extra
              </h4>
              <div className="mt-2">
                <span className="text-2xl font-bold text-green-600">
                  {cantidad(datosReporte.ingresoExtra)}
                </span>
              </div>
            </div>
          </div>

          {/* Balance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-700">Balance</h4>
              <div className="mt-2">
                <span
                  className={`text-2xl font-bold ${
                    datosReporte.balance >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {cantidad(datosReporte.balance)}
                </span>
              </div>
            </div>
          </div>

          {/* Cumplimiento presupuesto */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-700">
                Cumplimiento Presupuesto
              </h4>
              <div className="mt-2">
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-gray-900">
                    {datosReporte.cumplimientoPresupuesto}%
                  </span>
                </div>
                <div className="mt-2">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                    <div
                      style={{
                        width: `${datosReporte.cumplimientoPresupuesto}%`,
                      }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                        datosReporte.cumplimientoPresupuesto > 80
                          ? "bg-red-500"
                          : datosReporte.cumplimientoPresupuesto > 60
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumenFinanciero;