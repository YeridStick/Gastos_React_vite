import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import './ModalIngresoExtra.css'

const ModalIngresoExtra = ({ setModalIngreso, actualizarPresupuesto }) => {
  const [ingreso, setIngreso] = useState('')
  const [descripcion, setDescripcion] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validaciones
    if (ingreso === '' || ingreso <= 0) {
      Swal.fire({
        title: 'Error',
        text: 'El ingreso debe ser un número positivo',
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      })
      return
    }

    // Actualizar presupuesto
    actualizarPresupuesto(Number(ingreso), descripcion)
    
    // Cerrar modal
    setModalIngreso(false)
  }

  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.keyCode === 27) {
        setModalIngreso(false)
      }
    }
    
    window.addEventListener('keydown', handleEsc)
    
    return () => {
      window.removeEventListener('keydown', handleEsc)
    }
  }, [setModalIngreso])

  return (
    <div className="background-card">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md box">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">Agregar Ingreso Extra</h3>
          <button 
            type="button"
            className="text-gray-400 hover:text-gray-500"
            onClick={() => setModalIngreso(false)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad
            </label>
            <input
              id="cantidad"
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingrese la cantidad"
              value={ingreso}
              onChange={e => setIngreso(e.target.value)}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción/Fuente (opcional)
            </label>
            <input
              id="descripcion"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Salario extra, Bono, Freelance"
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setModalIngreso(false)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Agregar Ingreso
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalIngresoExtra