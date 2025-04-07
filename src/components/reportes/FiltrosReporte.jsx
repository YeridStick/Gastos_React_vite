const FiltrosReporte = ({
  periodoSeleccionado,
  setPeriodoSeleccionado,
  mesSeleccionado,
  setMesSeleccionado,
  añoSeleccionado,
  setAñoSeleccionado,
  meses,
  años,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Reporte
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPeriodoSeleccionado("mensual")}
              className={`px-3 py-1 rounded text-sm font-medium ${
                periodoSeleccionado === "mensual"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setPeriodoSeleccionado("trimestral")}
              className={`px-3 py-1 rounded text-sm font-medium ${
                periodoSeleccionado === "trimestral"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Trimestral
            </button>
            <button
              onClick={() => setPeriodoSeleccionado("anual")}
              className={`px-3 py-1 rounded text-sm font-medium ${
                periodoSeleccionado === "anual"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Anual
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {periodoSeleccionado !== "anual" && (
            <div>
              <label
                htmlFor="mes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mes
              </label>
              <select
                id="mes"
                value={mesSeleccionado}
                onChange={(e) => setMesSeleccionado(Number(e.target.value))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {meses.map((mes, index) => (
                  <option key={index} value={index}>
                    {mes}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label
              htmlFor="año"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Año
            </label>
            <select
              id="año"
              value={añoSeleccionado}
              onChange={(e) => setAñoSeleccionado(Number(e.target.value))}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {años.map((año) => (
                <option key={año} value={año}>
                  {año}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltrosReporte;