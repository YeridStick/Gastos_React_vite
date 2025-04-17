import RecordatorioTarjeta from './RecordatorioTarjeta';
import Swal from 'sweetalert2';

export default function ListaRecordatorios({
  recordatorios,
  setRecordatorios,
  marcarCompletado,
  setRecordatorioEditar,
  filtroActual,
  setFiltroActual
}) {
  // Filtrar recordatorios según el filtro seleccionado
  const filtrarRecordatorios = () => {
    const hoy = Date.now();
    
    switch (filtroActual) {
      case 'pendientes':
        return recordatorios.filter(r => r.estado === 'pendiente');
      case 'proximos':
        return recordatorios.filter(r => 
          r.estado === 'pendiente' && 
          r.fechaVencimiento >= hoy &&
          (r.fechaVencimiento - hoy) / (1000 * 60 * 60 * 24) <= r.diasAnticipacion
        );
      case 'vencidos':
        return recordatorios.filter(r => 
          r.estado === 'vencido' || 
          (r.estado === 'pendiente' && r.fechaVencimiento < hoy)
        );
      case 'completados':
        return recordatorios.filter(r => r.estado === 'completado');
      default:
        return recordatorios;
    }
  };

  const eliminarRecordatorio = (recordatorioId) => {
    Swal.fire({
      title: "¿Eliminar recordatorio?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        // Guardar el ID del recordatorio eliminado en localStorage
        const eliminados = JSON.parse(localStorage.getItem("eliminados")) || {};
        if (!eliminados["recordatorios"]) {
          eliminados["recordatorios"] = [];
        }
        eliminados["recordatorios"].push(recordatorioId);
        localStorage.setItem("eliminados", JSON.stringify(eliminados));

        // Actualizar el estado de los recordatorios
        const recordatoriosActualizados = recordatorios.filter(
          (recordatorio) => recordatorio.id !== recordatorioId
        );
        setRecordatorios(recordatoriosActualizados);

        Swal.fire({
          title: "Recordatorio eliminado",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  // Recordatorios filtrados
  const recordatoriosFiltrados = filtrarRecordatorios();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Mis Recordatorios
          {recordatorios.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({recordatoriosFiltrados.length} de {recordatorios.length})
            </span>
          )}
        </h2>
        
        {/* Filtros */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setFiltroActual('todos')} 
            className={`px-3 py-1 text-xs font-medium rounded-full ${
              filtroActual === 'todos' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          <button 
            onClick={() => setFiltroActual('pendientes')} 
            className={`px-3 py-1 text-xs font-medium rounded-full ${
              filtroActual === 'pendientes' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pendientes
          </button>
          <button 
            onClick={() => setFiltroActual('proximos')} 
            className={`px-3 py-1 text-xs font-medium rounded-full ${
              filtroActual === 'proximos' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Próximos
          </button>
          <button 
            onClick={() => setFiltroActual('vencidos')} 
            className={`px-3 py-1 text-xs font-medium rounded-full ${
              filtroActual === 'vencidos' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Vencidos
          </button>
          <button 
            onClick={() => setFiltroActual('completados')} 
            className={`px-3 py-1 text-xs font-medium rounded-full ${
              filtroActual === 'completados' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completados
          </button>
        </div>
      </div>
      
      {/* Lista de recordatorios */}
      <div className="space-y-4">
        {recordatoriosFiltrados.length > 0 ? (
          recordatoriosFiltrados.map(recordatorio => (
            <RecordatorioTarjeta
              key={recordatorio.id}
              recordatorio={recordatorio}
              onEditar={setRecordatorioEditar}
              onEliminar={() => eliminarRecordatorio(recordatorio.id)}
              onCompletar={() => marcarCompletado(recordatorio.id)}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay recordatorios</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filtroActual === 'todos' 
                ? 'Comienza creando un nuevo recordatorio de pago.' 
                : `No hay recordatorios ${
                    filtroActual === 'pendientes' ? 'pendientes' : 
                    filtroActual === 'proximos' ? 'próximos' : 
                    filtroActual === 'vencidos' ? 'vencidos' : 'completados'
                  } por el momento.`
              }
            </p>
          </div>
        )}
      </div>
      
      {/* Tarjeta informativa */}
      {recordatorios.length === 0 && (
        <div className="mt-6 bg-blue-50 rounded-lg shadow-sm p-4 border border-blue-200">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">¿Para qué sirven los recordatorios?</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Te ayudan a no olvidar pagos importantes como servicios, alquileres o suscripciones</li>
                  <li>Puedes crear pagos recurrentes que se repiten automáticamente</li>
                  <li>Al completar un recordatorio, puedes registrarlo como gasto en tu presupuesto</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}