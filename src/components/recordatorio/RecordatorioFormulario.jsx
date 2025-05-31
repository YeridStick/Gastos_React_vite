import { useState, useEffect } from 'react';

// Componente de error para mostrar mensajes de validación
const Error = ({ children }) => {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">
            {children}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function RecordatorioFormulario({ 
  recordatorioEditar,
  setRecordatorioEditar,
  guardarRecordatorio
}) {
  // Estados para el formulario
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [categoria, setCategoria] = useState('');
  const [esRecurrente, setEsRecurrente] = useState(false);
  const [frecuencia, setFrecuencia] = useState('mensual');
  const [diasAnticipacion, setDiasAnticipacion] = useState(3);
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState('');
  
  // Cargar categorías desde localStorage
  useEffect(() => {
    try {
      const categoriasGuardadas = localStorage.getItem('categorias');
      
      if (categoriasGuardadas) {
        setCategorias(JSON.parse(categoriasGuardadas));
      } else {
        // Categorías predefinidas por defecto
        const categoriasPredefinidas = [
          { id: 'Comida', nombre: 'Comida' },
          { id: 'Casa', nombre: 'Casa' },
          { id: 'Ocio', nombre: 'Ocio' },
          { id: 'Salud', nombre: 'Salud' },
          { id: 'Educacion', nombre: 'Educación' },
          { id: 'Otros', nombre: 'Otros' }
        ];
        setCategorias(categoriasPredefinidas);
      }
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  }, []);

  // Cargar datos si estamos editando un recordatorio existente
  useEffect(() => {
    if (recordatorioEditar && Object.keys(recordatorioEditar).length > 0) {
      setTitulo(recordatorioEditar.titulo || '');
      setDescripcion(recordatorioEditar.descripcion || '');
      setMonto(recordatorioEditar.monto || '');
      setCategoria(recordatorioEditar.categoria || '');
      setEsRecurrente(recordatorioEditar.esRecurrente || false);
      setFrecuencia(recordatorioEditar.frecuencia || 'mensual');
      setDiasAnticipacion(recordatorioEditar.diasAnticipacion || 3);

      // Formatear fecha para el campo de fecha
      if (recordatorioEditar.fechaVencimiento) {
        const fechaObj = new Date(recordatorioEditar.fechaVencimiento);
        const year = fechaObj.getFullYear();
        const month = String(fechaObj.getMonth() + 1).padStart(2, '0');
        const day = String(fechaObj.getDate()).padStart(2, '0');
        setFechaVencimiento(`${year}-${month}-${day}`);
      }
    } else {
      limpiarFormulario();
    }
  }, [recordatorioEditar]);

  // Función para limpiar el formulario
  const limpiarFormulario = () => {
    setTitulo('');
    setDescripcion('');
    setMonto('');
    setFechaVencimiento('');
    setCategoria('');
    setEsRecurrente(false);
    setFrecuencia('mensual');
    setDiasAnticipacion(3);
    setError('');
  };

  // Función para cancelar edición
  const handleCancelar = () => {
    setRecordatorioEditar(null);
    limpiarFormulario();
  };

  // Función para manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!titulo || !monto || !fechaVencimiento || !categoria) {
      setError('Los campos Título, Monto, Fecha de vencimiento y Categoría son obligatorios');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (monto <= 0) {
      setError('El monto debe ser mayor a 0');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Crear objeto de recordatorio
    const recordatorio = {
      id: recordatorioEditar?.id || crypto.randomUUID(),
      titulo,
      descripcion,
      monto: Number(monto),
      fechaVencimiento: new Date(fechaVencimiento).getTime(),
      categoria,
      esRecurrente,
      frecuencia: esRecurrente ? frecuencia : null,
      diasAnticipacion: Number(diasAnticipacion),
      fechaCreacion: recordatorioEditar?.fechaCreacion || Date.now(),
      estado: 'pendiente'  // pendiente, completado, vencido
    };

    // Guardar recordatorio usando la función pasada como prop
    guardarRecordatorio(recordatorio);
    
    // Limpiar formulario y estado de edición
    limpiarFormulario();
    setRecordatorioEditar(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {recordatorioEditar?.id ? 'Editar Recordatorio' : 'Crear Nuevo Recordatorio'}
      </h2>
      
      {error && <Error>{error}</Error>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Título del recordatorio */}
        <div>
          <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">
            Título del recordatorio *
          </label>
          <input
            type="text"
            id="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Ej: Pago de alquiler"
          />
        </div>
        
        {/* Descripción */}
        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows="2"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Detalles adicionales (opcional)"
          ></textarea>
        </div>
        
        {/* Monto */}
        <div>
          <label htmlFor="monto" className="block text-sm font-medium text-gray-700">
            Monto a pagar *
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="text"
              id="monto"
              value={monto ? new Intl.NumberFormat('es-CO').format(Number(monto)) : ''}
              onChange={e => {
                // Permitir solo números
                const raw = e.target.value.replace(/\D/g, '');
                setMonto(raw);
              }}
              className="block w-full pl-7 pr-12 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="0.00"
              inputMode="numeric"
            />
          </div>
        </div>
        
        {/* Fecha de vencimiento */}
        <div>
          <label htmlFor="fechaVencimiento" className="block text-sm font-medium text-gray-700">
            Fecha de vencimiento *
          </label>
          <input
            type="date"
            id="fechaVencimiento"
            value={fechaVencimiento}
            onChange={(e) => setFechaVencimiento(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        {/* Categoría */}
        <div>
          <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">
            Categoría *
          </label>
          <select
            id="categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">-- Seleccionar Categoría --</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.nombre}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>
        
        {/* Pago recurrente */}
        <div className="flex items-center">
          <input
            id="esRecurrente"
            type="checkbox"
            checked={esRecurrente}
            onChange={(e) => setEsRecurrente(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="esRecurrente" className="ml-2 block text-sm text-gray-700">
            Es un pago recurrente
          </label>
        </div>
        
        {/* Opciones para pagos recurrentes */}
        {esRecurrente && (
          <div className="pl-6 ml-2 border-l-2 border-blue-100 space-y-4">
            <div>
              <label htmlFor="frecuencia" className="block text-sm font-medium text-gray-700">
                Frecuencia
              </label>
              <select
                id="frecuencia"
                value={frecuencia}
                onChange={(e) => setFrecuencia(e.target.value)}
                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="mensual">Mensual</option>
                <option value="semanal">Semanal</option>
                <option value="quincenal">Quincenal</option>
                <option value="bimestral">Bimestral</option>
                <option value="trimestral">Trimestral</option>
                <option value="semestral">Semestral</option>
                <option value="anual">Anual</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="diasAnticipacion" className="block text-sm font-medium text-gray-700">
                Recordar con anticipación (días)
              </label>
              <input
                type="number"
                id="diasAnticipacion"
                value={diasAnticipacion}
                onChange={(e) => setDiasAnticipacion(e.target.value)}
                min="1"
                max="30"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        )}
        
        {/* Botones de acción */}
        <div className="flex items-center justify-end space-x-3 pt-3">
          {recordatorioEditar && (
            <button
              type="button"
              onClick={handleCancelar}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
          )}
          
          <button
            type="submit"
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {recordatorioEditar ? 'Guardar Cambios' : 'Guardar Recordatorio'}
          </button>
        </div>
      </form>
    </div>
  );
}