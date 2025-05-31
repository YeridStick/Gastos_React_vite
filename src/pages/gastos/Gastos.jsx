import { useState, useEffect } from "react";
import { cantidad } from "../../helpers/index";
import PropTypes from 'prop-types';

export default function Gastos({ gastos, editar, eliminar }) {
  const { nombreG, gasto, categoria, fecha } = gastos;

  // Función para formatear la fecha
  const formatearFecha = (fecha) => {
    const fechaNueva = new Date(fecha);
    const opciones = {
      year: 'numeric',
      month: 'long',
      day: '2-digit'
    };
    return fechaNueva.toLocaleDateString('es-ES', opciones);
  };

  // Estado para el color de la categoría
  const [colorCategoria, setColorCategoria] = useState("bg-gray-100");

  // Cargar color de la categoría desde localStorage
  useEffect(() => {
    try {
      const categoriasGuardadas = localStorage.getItem("categorias");
      if (categoriasGuardadas) {
        const categorias = JSON.parse(categoriasGuardadas);
        const categoriaEncontrada = categorias.find(
          (cat) => cat.nombre === categoria
        );
        if (categoriaEncontrada) {
          setColorCategoria(categoriaEncontrada.color.split(" ")[0]);
        }
      }
    } catch (error) {
      console.error("Error al cargar color de categoría:", error);
    }
  }, [categoria]);

  const handleEditar = () => {
    // Pasar el objeto gastos completo
    console.log("Enviando gasto a editar:", gastos);
    editar(gastos);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow w-full max-w-md mx-auto mb-4">
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2 sm:gap-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-4 h-4 sm:w-3 sm:h-3 rounded-full ${colorCategoria} flex-shrink-0`} />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate max-w-[140px] sm:max-w-xs">
              {nombreG}
            </h3>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-0">
            <span className="text-xs sm:text-sm font-medium text-gray-500 whitespace-nowrap">
              {formatearFecha(fecha)}
            </span>
            <button
              onClick={() => eliminar(gastos)}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              title="Eliminar gasto"
            >
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-medium text-gray-500 break-words">
              {categoria}
            </span>
          </div>
          <span className="font-bold text-xl text-gray-900">
            {new Intl.NumberFormat('es-CO').format(Number(gasto))} COP
          </span>
        </div>

        <div className="mt-4">
          <button
            onClick={handleEditar}
            className="w-full py-2 px-3 border border-gray-200 rounded-md text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Editar
          </button>
        </div>
      </div>
    </div>
  );
}

Gastos.propTypes = {
  gastos: PropTypes.shape({
    nombreG: PropTypes.string.isRequired,
    gasto: PropTypes.number.isRequired,
    categoria: PropTypes.string.isRequired,
    fecha: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    id: PropTypes.string.isRequired,
    origen: PropTypes.string
  }).isRequired,
  setGastoEditar: PropTypes.func.isRequired,
  editar: PropTypes.func.isRequired,
  eliminar: PropTypes.func.isRequired
};
