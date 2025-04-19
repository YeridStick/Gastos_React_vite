import { useState, useEffect } from 'react';
import { formatearFecha, cantidad } from '../../helpers/index';

// Iconos para categorías
import IconoGasto from '../../assets/img/icono_gastos.svg';



export default function Gastos({ gastos, setGastoEditar, editar, eliminar }) {
  // Para obtener la fecha formateada
  const fechaFormateada = formatearFecha(gastos.fecha);
  
  // Verificar si es un gasto de tipo ahorro
  const esGastoAhorro = gastos.categoria === "Ahorro";
  
  // Verificar si el gasto proviene de un recordatorio
  const esGastoDeRecordatorio = gastos.origen === "recordatorio";

  
  // Estado para los colores y categorías
  const [categoriaInfo, setCategoriaInfo] = useState({
    icono: IconoGasto,
    color: 'bg-gray-100 text-gray-800'
  });
  
  // Cargar información de la categoría desde localStorage
  useEffect(() => {
    try {
      const categoriasGuardadas = localStorage.getItem("categorias");
  
      if (categoriasGuardadas) {
        const categorias = JSON.parse(categoriasGuardadas);
        const categoriaEncontrada = categorias.find(
          (cat) => cat.nombre === gastos.categoria
        );
  
        if (categoriaEncontrada) {
          setCategoriaInfo({
            icono: categoriaEncontrada.icono || IconoGasto, 
            color: categoriaEncontrada.color || "bg-gray-100 text-gray-800", 
          });
        } else {
          // Si no se encuentra la categoría, usar valores predeterminados
          setCategoriaInfo({
            icono: IconoGasto,
            color: "bg-gray-100 text-gray-800",
          });
        }
      }
    } catch (error) {
      console.error("Error al cargar información de categoría:", error);
    }
  }, [gastos.categoria]);

  return (
    <div className="bg-white rounded-lg shadow mb-4 overflow-hidden">
      <div className="p-4">
        {/* Contenido principal usando flexbox que se adapta a diferentes tamaños */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          {/* Información del gasto - lado izquierdo */}
          <div className="flex items-center flex-grow">
            <div className="flex-shrink-0 h-10 w-10">
              <img 
                className="h-10 w-10" 
                src={categoriaInfo.icono} 
                alt={`Icono ${gastos.categoria}`} 
              />
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <h3 className="text-sm md:text-base font-medium text-gray-900 truncate">
                {gastos.nombreG}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${categoriaInfo.color}`}>
                  {gastos.categoria}
                </span>
                <span className="text-xs text-gray-500">
                  {fechaFormateada}
                </span>
                
                {/* Indicador especial para gastos de ahorro */}
                {esGastoAhorro && (
                  <span className="px-2 py-1 text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Gestionado en Ahorro
                  </span>
                )}

                {/* Indicador especial para gastos de recordatorios */}
                {esGastoDeRecordatorio && (
                  <span className="px-2 py-1 text-xs leading-5 font-semibold rounded-full bg-yellow-50 text-yellow-600 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Generado desde Recordatorio
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Monto - lado derecho */}
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-medium text-gray-900">
              {cantidad(gastos.gasto)}
            </p>
          </div>
        </div>
        
        {/* Botones de acción */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-2 flex-wrap">
          {/* Solo mostrar botón de editar si NO es un gasto de ahorro */}
          {!esGastoAhorro ? (
            <button 
              onClick={() => editar(gastos)}
              className="px-4 py-1.5 bg-blue-50 rounded-md text-blue-600 text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              Editar
            </button>
          ) : (
            <button 
              className="px-4 py-1.5 bg-gray-50 rounded-md text-gray-400 text-sm font-medium cursor-not-allowed"
              title="Los gastos de ahorro solo pueden gestionarse desde la sección de Gestión de Ahorro"
            >
              Protegido
            </button>
          )}
          
          {/* Solo mostrar botón de eliminar si NO es un gasto de ahorro */}
          {!esGastoAhorro ? (
            <button 
              onClick={() => eliminar(gastos)}
              className="px-4 py-1.5 bg-red-50 rounded-md text-red-600 text-sm font-medium hover:bg-red-100 transition-colors"
            >
              Eliminar
            </button>
          ) : (
            <button 
              className="px-4 py-1.5 bg-gray-50 rounded-md text-gray-400 text-sm font-medium cursor-not-allowed"
              title="Los gastos de ahorro solo pueden gestionarse desde la sección de Gestión de Ahorro"
            >
              Protegido
            </button>
          )}
        </div>
      </div>
    </div>
  );
}