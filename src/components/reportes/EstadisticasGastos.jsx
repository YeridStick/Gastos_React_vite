import { cantidad } from "../../helpers/index.js";

const EstadisticasGastos = ({ datosReporte }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Promedio de gastos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-5">
          <h3 className="text-lg font-medium text-gray-900">
            Promedio por Gasto
          </h3>
          <div className="mt-4">
            <span className="text-3xl font-bold text-gray-900">
              {cantidad(datosReporte.gastoPromedio)}
            </span>
          </div>
        </div>
      </div>

      {/* Gasto más alto */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-5">
          <h3 className="text-lg font-medium text-gray-900">
            Gasto Más Alto
          </h3>
          <div className="mt-4">
            <span className="text-3xl font-bold text-gray-900">
              {cantidad(datosReporte.gastoMasAlto.valor)}
            </span>
            {datosReporte.gastoMasAlto.nombre && (
              <p className="mt-1 text-sm text-gray-500">
                {datosReporte.gastoMasAlto.nombre}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstadisticasGastos;