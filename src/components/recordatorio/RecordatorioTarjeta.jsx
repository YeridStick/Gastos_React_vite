import {formatearFecha } from '../../helpers/index';
import PropTypes from 'prop-types';

// Componente para mostrar un recordatorio individual como tarjeta
export default function RecordatorioTarjeta({ 
  recordatorio, 
  onEditar, 
  onEliminar, 
  onCompletar,
  categorias // Prop para obtener los nombres de categorías
}) {
  
  // Fecha formateada para mostrar
  const fechaFormateada = formatearFecha(recordatorio.fechaVencimiento);
  
  
  // Obtener color de la categoría (por id o nombre)
  let colorBg = 'bg-gray-100';
  let categoriaEncontrada = null;
  if (categorias && categorias.length > 0) {
    categoriaEncontrada = categorias.find(
      cat => cat.id === recordatorio.categoria || cat.nombre === recordatorio.categoria
    );
    if (categoriaEncontrada && categoriaEncontrada.color) {
      colorBg = categoriaEncontrada.color.split(' ')[0];
    }
  }
  
  let bgColor = "bg-white";
  if (recordatorio.estado === "completado") bgColor = "bg-green-50";
  else if (recordatorio.estado === "vencido") bgColor = "bg-red-50";
  else if (
    recordatorio.estado === "pendiente" &&
    recordatorio.fechaVencimiento < Date.now()
  ) bgColor = "bg-red-50";
  else if (
    recordatorio.estado === "pendiente" &&
    (recordatorio.fechaVencimiento - Date.now()) / (1000 * 60 * 60 * 24) <= recordatorio.diasAnticipacion
  ) bgColor = "bg-yellow-50";
  
  return (
    <div className={`${bgColor} rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex items-center gap-4 p-4`}>
      <div className={`w-3 h-3 rounded-full ${colorBg}`} />
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-medium text-gray-900 truncate">{recordatorio.titulo}</h3>
        <p className="text-xs text-gray-500">{recordatorio.descripcion}</p>
        <p className="text-xs text-gray-400 mt-1">
          {categoriaEncontrada ? categoriaEncontrada.nombre : recordatorio.categoria}
        </p>
        <p className="text-xs text-gray-400 mt-1">Vence: {fechaFormateada}</p>
        <span className="font-bold text-xl text-gray-900">
          {new Intl.NumberFormat('es-CO').format(Number(recordatorio.monto))} COP
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {/* Botones de acción */}
        {recordatorio.estado !== 'completado' && (
          <button 
            onClick={() => onCompletar(recordatorio.id)}
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
          onClick={() => onEliminar(recordatorio.id)}
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
  );
}

RecordatorioTarjeta.propTypes = {
  recordatorio: PropTypes.object.isRequired,
  onEditar: PropTypes.func.isRequired,
  onEliminar: PropTypes.func.isRequired,
  onCompletar: PropTypes.func.isRequired,
  categorias: PropTypes.array.isRequired
};