import React, { useState, useEffect } from 'react';
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

export default function Gastos({ gastos, editar, eliminar }) {
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
    <div className="hover:bg-gray-50 w-100 display flex items-center justify-between bg-white shadow-md rounded-lg p-4 mb-4 transition-all duration-300 ease-in-out">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <img className="h-10 w-10" src={categoriaInfo.icono} alt={`Icono ${gastos.categoria}`} />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{gastos.nombreG}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${categoriaInfo.color}`}>
          {gastos.categoria}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {fechaFormateada}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
        {cantidad(gastos.gasto)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-2">
          <button 
            onClick={() => editar(gastos)}
            className="text-blue-600 hover:text-blue-900 transition-colors focus:outline-none focus:underline"
          >
            Editar
          </button>
          <button 
            onClick={() => eliminar(gastos)}
            className="text-red-600 hover:text-red-900 transition-colors focus:outline-none focus:underline"
          >
            Eliminar
          </button>
        </div>
      </td>
    </div>
  );
}