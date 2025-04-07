import { cantidad } from "../../helpers/index.js";

const MetasAhorroActivas = ({ metasAhorro, formatearFecha }) => {
  const metasActivas = metasAhorro.filter((meta) => !meta.completada);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Metas de Ahorro Activas
        </h3>
      </div>

      {metasActivas.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Meta
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Fecha Objetivo
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Monto Objetivo
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Ahorrado
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Progreso
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metasActivas.map((meta) => {
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
                  <tr key={meta.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {meta.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatearFecha(meta.fechaObjetivo)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      {cantidad(meta.monto)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      {cantidad(meta.ahorroAcumulado || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end">
                        <span className="text-sm font-medium text-gray-900 mr-2">
                          {progreso}%
                        </span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${progreso}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-gray-500">
            No hay metas de ahorro activas en este periodo
          </p>
        </div>
      )}
    </div>
  );
};

export default MetasAhorroActivas;