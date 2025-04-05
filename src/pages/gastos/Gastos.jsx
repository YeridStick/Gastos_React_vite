import { useState, useEffect } from 'react';
import { formatearFecha, cantidad } from '../../helpers/index';

// Iconos para categorías
import IconoAhorro from '../../assets/img/icono_ahorro.svg';
import IconoCasa from '../../assets/img/icono_casa.svg';
import IconoComida from '../../assets/img/icono_comida.svg';
import IconoGasto from '../../assets/img/icono_gastos.svg';
import IconoOcio from '../../assets/img/icono_ocio.svg';
import IconoSalud from '../../assets/img/icono_salud.svg';
import IconoEducacion from '../../assets/img/icono_suscripciones.svg';

// Mapeo de categorías predefinidas a iconos
const iconosPredefinidos = {
  Ahorro: IconoAhorro,
  Comida: IconoComida,
  Casa: IconoCasa,
  Ocio: IconoOcio,
  Salud: IconoSalud,
  Educacion: IconoEducacion,
  Otros: IconoGasto,
};

export default function Gastos({ gastos, setGastoEditar, editar, eliminar }) {
  // Para obtener la fecha formateada
  const fechaFormateada = formatearFecha(gastos.fecha);
  
  // Estado para los colores y categorías
  const [categoriaInfo, setCategoriaInfo] = useState({
    icono: IconoGasto,
    color: 'bg-gray-100 text-gray-800'
  });
  
  // Cargar información de la categoría desde localStorage
  useEffect(() => {
    try {
      const categoriasGuardadas = localStorage.getItem('categorias');
      
      if (categoriasGuardadas) {
        const categorias = JSON.parse(categoriasGuardadas);
        const categoriaEncontrada = categorias.find(cat => cat.id === gastos.categoria);
        
        if (categoriaEncontrada) {
          // Si se encuentra la categoría, usar su información
          setCategoriaInfo({
            icono: iconosPredefinidos[gastos.categoria] || IconoGasto, // Usar icono predefinido o genérico
            color: categoriaEncontrada.color || 'bg-gray-100 text-gray-800'
          });
        } else {
          // Si no se encuentra la categoría, usar valores predeterminados
          setCategoriaInfo({
            icono: IconoGasto,
            color: 'bg-gray-100 text-gray-800'
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
          <button 
            onClick={() => editar(gastos)}
            className="px-4 py-1.5 bg-blue-50 rounded-md text-blue-600 text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            Editar
          </button>
          <button 
            onClick={() => eliminar(gastos)}
            className="px-4 py-1.5 bg-red-50 rounded-md text-red-600 text-sm font-medium hover:bg-red-100 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}