import { cantidad } from "../../helpers/index.js";

const ProgresoMetasAhorro = ({ metasAhorro, datosReporte, formatearFecha }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Progreso de Metas de Ahorro
        </h3>
      </div>

      {metasAhorro.length > 0 ? (
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {metasAhorro.map((meta) => {
              // Buscar si hay gastos asociados a esta meta en el periodo
              const ahorradoEnPeriodo =
                (datosReporte.ahorrosPorMeta || {})[meta.nombre] || 0;
              const progreso =
                meta.monto > 0
                  ? Math.min(
                      100,
                      Math.round(
                        ((meta.ahorroAcumulado || 0) * 100) / meta.monto
                      )
                    )
                  : 0;

              return (
                <div key={meta.id} className="border rounded-lg p-4">
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center">
                      <h4 className="text-lg font-medium text-gray-900">
                        {meta.nombre}
                      </h4>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          meta.completada
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {meta.completada ? "Completada" : "En progreso"}
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">
                          Progreso:
                        </span>
                        <span className="text-sm font-medium">
                          {cantidad(meta.ahorroAcumulado || 0)} de{" "}
                          {cantidad(meta.monto)} ({progreso}%)
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <div
                          className={`${
                            meta.completada ? "bg-green-500" : "bg-blue-500"
                          } h-2 rounded-full`}
                          style={{ width: `${progreso}%` }}
                        ></div>
                      </div>

                      {!meta.completada && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Ahorrado en este periodo:
                          </span>
                          <span
                            className={`font-medium ${
                              ahorradoEnPeriodo > 0
                                ? "text-green-600"
                                : "text-gray-600"
                            }`}
                          >
                            {cantidad(ahorradoEnPeriodo)}
                          </span>
                        </div>
                      )}

                      {meta.fechaObjetivo && (
                        <div className="flex justify-between text-sm mt-2">
                          <span className="text-gray-600">
                            Fecha objetivo:
                          </span>
                          <span className="font-medium">
                            {formatearFecha(meta.fechaObjetivo)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-gray-500">No hay metas de ahorro definidas</p>
        </div>
      )}
    </div>
  );
};

export default ProgresoMetasAhorro;