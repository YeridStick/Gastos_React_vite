import { cantidad, formatearFecha } from '../../helpers/index';

// Iconos para categorías
import IconoAhorro from '../../assets/img/icono_ahorro.svg';
import IconoCasa from '../../assets/img/icono_casa.svg';
import IconoComida from '../../assets/img/icono_comida.svg';
import IconoGasto from '../../assets/img/icono_gastos.svg';
import IconoOcio from '../../assets/img/icono_ocio.svg';
import IconoSalud from '../../assets/img/icono_salud.svg';
import IconoEducacion from '../../assets/img/icono_suscripciones.svg';

// Componente para mostrar un recordatorio individual como tarjeta
export default function RecordatorioTarjeta({ 
  recordatorio, 
  onEditar, 
  onEliminar, 
  onCompletar 
}) {
  // Obtener icono según la categoría
  const getIconoPorCategoria = (categoriaId) => {
    switch (categoriaId) {
      case 'Ahorro': return IconoAhorro;
      case 'Comida': return IconoComida;
      case 'Casa': return IconoCasa;
      case 'Ocio': return IconoOcio;
      case 'Salud': return IconoSalud;
      case 'Educacion': return IconoEducacion;
      default: return IconoGasto;
    }
  };
  
  // Fecha formateada para mostrar
  const fechaFormateada = formatearFecha(recordatorio.fechaVencimiento);
  
  // Calcular días restantes
  const calcularDiasRestantes = () => {
    return Math.ceil((recordatorio.fechaVencimiento - Date.now()) / (1000 * 60 * 60 * 24));
  };
  
  const diasRestantes = calcularDiasRestantes();
  
  // Determinar estado visual del recordatorio
  const getEstadoVisual = () => {
    if (recordatorio.estado === 'completado') {
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'Completado',
        badge: 'bg-green-100 text-green-800'
      };
    }
    
    if (recordatorio.estado === 'vencido' || diasRestantes < 0) {
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'Vencido',
        badge: 'bg-red-100 text-red-800'
      };
    }
    
    if (diasRestantes <= recordatorio.diasAnticipacion) {
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'Próximo',
        badge: 'bg-yellow-100 text-yellow-800'
      };
    }
    
    return {
      bg: 'bg-white',
      border: 'border-gray-200',
      text: 'Pendiente',
      badge: 'bg-blue-100 text-blue-800'
    };
  };
  
  const estado = getEstadoVisual();
  
  return (
    <div className={`rounded-lg shadow-sm overflow-hidden ${estado.bg} border ${estado.border} transition-all hover:shadow-md`}>
      <div className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          {/* Icono de categoría */}
          <div className="flex-shrink-0 mr-3">
            <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center`}>
              <img 
                src={getIconoPorCategoria(recordatorio.categoria)} 
                alt={recordatorio.categoria} 
                className="h-6 w-6"
              />
            </div>
          </div>
          
          {/* Información del recordatorio */}
          <div className="flex-grow min-w-0">
            <div className="flex flex-wrap gap-2 mb-1">
              <span className={`px-2 py-0.5 text-xs leading-5 font-semibold rounded-full ${estado.badge}`}>
                {estado.text}
              </span>
              
              {recordatorio.esRecurrente && (
                <span className="px-2 py-0.5 text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                  {recordatorio.frecuencia.charAt(0).toUpperCase() + recordatorio.frecuencia.slice(1)}
                </span>
              )}
              
              <span className="px-2 py-0.5 text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                {recordatorio.categoria}
              </span>
            </div>
            
            <h3 className="font-medium text-gray-900 truncate">
              {recordatorio.titulo}
            </h3>
            
            {recordatorio.descripcion && (
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {recordatorio.descripcion}
              </p>
            )}
            
            <div className="mt-2 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Vence: {fechaFormateada}
              </div>
              
              {recordatorio.estado !== 'completado' && (
                <div className="text-sm font-medium">
                  {diasRestantes > 0 ? (
                    <span className={diasRestantes <= recordatorio.diasAnticipacion ? 'text-yellow-600' : 'text-gray-600'}>
                      {diasRestantes} {diasRestantes === 1 ? 'día' : 'días'}
                    </span>
                  ) : (
                    <span className="text-red-600">Vencido</span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Monto */}
          <div className="text-right flex-shrink-0 ml-2">
            <p className="text-lg font-semibold text-gray-900">
              {cantidad(recordatorio.monto)}
            </p>
          </div>
        </div>
        
        {/* Botones de acción */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end gap-2 flex-wrap">
          {recordatorio.estado !== 'completado' && (
            <button 
              onClick={() => onCompletar(recordatorio)}
              className="px-3 py-1.5 bg-green-50 rounded-md text-green-600 text-xs font-medium hover:bg-green-100 transition-colors"
            >
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Completar
              </span>
            </button>
          )}
          
          <button 
            onClick={() => onEditar(recordatorio)}
            className="px-3 py-1.5 bg-blue-50 rounded-md text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors"
          >
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </span>
          </button>
          
          <button 
            onClick={() => onEliminar(recordatorio)}
            className="px-3 py-1.5 bg-red-50 rounded-md text-red-600 text-xs font-medium hover:bg-red-100 transition-colors"
          >
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}