import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import './ModalIngresoExtra.css'

const ModalEditarPresupuesto = ({ setModalEditar, presupuestoActual, actualizarPresupuestoTotal }) => {
  const [nuevoPresupuesto, setNuevoPresupuesto] = useState(presupuestoActual)
  const [motivo, setMotivo] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validaciones
    if (nuevoPresupuesto === '' || nuevoPresupuesto <= 0) {
      Swal.fire({
        title: 'Error',
        text: 'El presupuesto debe ser un número positivo',
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      })
      return
    }

    // Confirmar cambio de presupuesto
    Swal.fire({
      title: '¿Modificar presupuesto total?',
      text: `Esta acción modificará el presupuesto total de ${presupuestoActual} a ${nuevoPresupuesto}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, modificar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Actualizar presupuesto total
        actualizarPresupuestoTotal(Number(nuevoPresupuesto), motivo)
        
        // Cerrar modal
        setModalEditar(false)
        
        Swal.fire({
          title: 'Presupuesto actualizado',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        })
      }
    })
  }

  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.keyCode === 27) {
        setModalEditar(false)
      }
    }
    
    window.addEventListener('keydown', handleEsc)
    
    return () => {
      window.removeEventListener('keydown', handleEsc)
    }
  }, [setModalEditar])

  return (
    <div className="background-card">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md box">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">Modificar Presupuesto Total</h3>
          <button 
            type="button"
            className="text-gray-400 hover:text-gray-500"
            onClick={() => setModalEditar(false)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-2">
            <div className="flex items-center justify-between">
              <label htmlFor="presupuesto-actual" className="block text-sm font-medium text-gray-700">
                Presupuesto Actual
              </label>
              <span className="text-sm text-gray-500">No editable</span>
            </div>
            <input
              id="presupuesto-actual"
              type="number"
              className="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md cursor-not-allowed"
              value={presupuestoActual}
              disabled
            />
          </div>
          
          <div className="mb-4 mt-6">
            <label htmlFor="nuevo-presupuesto" className="block text-sm font-medium text-gray-700 mb-1">
              Nuevo Presupuesto Total
            </label>
            <input
              id="nuevo-presupuesto"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingrese el nuevo presupuesto total"
              value={nuevoPresupuesto ? Number(nuevoPresupuesto).toLocaleString('es-CO') : ''}
              onChange={e => {
                const raw = e.target.value.replace(/\D/g, '');
                setNuevoPresupuesto(raw);
              }}
            />
            {nuevoPresupuesto && (
              <div className="text-xs text-gray-500 mt-1">
                {new Intl.NumberFormat('es-CO').format(Number(nuevoPresupuesto))} COP
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-1">
              Motivo del cambio (opcional)
            </label>
            <textarea
              id="motivo"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Cambio de salario, corrección de error, etc."
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              rows="3"
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setModalEditar(false)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Modificar Presupuesto
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalEditarPresupuesto