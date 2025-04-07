import { cantidad } from "../../helpers/index.js";

const DesglosePorCategorias = ({ datosReporte }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Desglose por Categorías
        </h3>
      </div>

      {Object.keys(datosReporte.gastosPorCategoria).length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Categoría
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Monto
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  % del Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(datosReporte.gastosPorCategoria)
                .sort((a, b) => b[1] - a[1]) // Ordenar por valor descendente
                .map(([categoria, valor]) => {
                  const porcentaje = Math.round(
                    (valor / datosReporte.gastoTotal) * 100
                  );

                  return (
                    <tr key={categoria} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {categoria}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        {cantidad(valor)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end">
                          <span className="text-sm font-medium text-gray-900 mr-2">
                            {porcentaje}%
                          </span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${porcentaje}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <th
                  scope="row"
                  className="px-6 py-3 text-left text-sm font-medium text-gray-900"
                >
                  Total
                </th>
                <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                  {cantidad(datosReporte.gastoTotal)}
                </td>
                <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                  100%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-gray-500">
            No hay datos para mostrar en este periodo
          </p>
        </div>
      )}
    </div>
  );
};

export default DesglosePorCategorias;