import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'

// Componentes
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Modal from './components/Modal'
import ListadoGastos from './components/ListadoGastos'
import Filtros from './components/Filtros'
import Categorias from './components/gastos/Nuevos'
import Reportes from './components/Reportes'

// Funciones
import { generarID } from './helpers/index'

function App() {
  // Estados principales
  const [presupuesto, setPresupuesto] = useState(JSON.parse(localStorage.getItem("PresupuestoLS")) ?? "")
  const [isValid, setIsValid] = useState(JSON.parse(localStorage.getItem("ValidLS")) ?? false)
  const [modal, setModal] = useState(false)
  const [gastosState, setGastosState] = useState(JSON.parse(localStorage.getItem("ObjetosGastos")) ?? [])
  const [gastoEditar, setGastoEditar] = useState({})
  
  // Estados para navegación y filtros
  const [activeTab, setActiveTab] = useState('dashboard')
  const [filtros, setFiltros] = useState("")
  const [gastosFiltrados, setGastosFiltrados] = useState([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleNuevoGasto = () => {
    setModal(true)
    setGastoEditar({})
  }

  const deletePresupuesto = () => {
    Swal.fire({
      title: '¿Estás seguro que quieres reiniciar la aplicación?',
      icon: 'question',
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      showCancelButton: true,
      showCloseButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      customClass: {
        popup: 'rounded-lg',
        title: 'text-gray-800 font-medium',
      }
    }).then((result) => {
      result.isConfirmed && (
        setPresupuesto(""),
        setIsValid(false),
        setModal(false),
        setGastosState([]),
        setGastoEditar({}),
        localStorage.clear()
      )
    })
  }

  const guardarGastos = cantidadGasto => {
    if(gastoEditar.id){
      cantidadGasto.id = gastoEditar.id 
      cantidadGasto.fecha = gastoEditar.fecha
      const update = gastosState.map((element) => {
        if (element.id === cantidadGasto.id) {
          return cantidadGasto
        } else {
          return element
        }
      })
      setGastosState(update)
      
      // Notificación amigable
      Swal.fire({
        title: '¡Gasto Actualizado!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        position: 'bottom-end',
        customClass: {
          popup: 'rounded-lg',
        }
      })
    } else {
      cantidadGasto.id = generarID();
      cantidadGasto.fecha = Date.now();
      setGastosState([cantidadGasto, ...gastosState])
      
      // Notificación amigable
      Swal.fire({
        title: '¡Gasto Agregado!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        position: 'bottom-end',
        customClass: {
          popup: 'rounded-lg',
        }
      })
    }
    setModal(false)
    setGastoEditar({})
  }

  const editar = (gastos) => {
    setGastoEditar(gastos)
    setModal(true)
  }

  const eliminar = (gastos) => {
    Swal.fire({
      title: '¿Eliminar gasto?',
      text: 'Esta acción no se puede revertir',
      icon: 'warning',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      customClass: {
        popup: 'rounded-lg',
        title: 'text-gray-800 font-medium',
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const gastosActualizados = gastosState.filter(item => item.id !== gastos.id)
        setGastosState(gastosActualizados)
        
        Swal.fire({
          title: 'Gasto eliminado',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          position: 'bottom-end',
          customClass: {
            popup: 'rounded-lg',
          }
        })
      }
    })
  }

  // Persistencia de datos
  useEffect(() => {
    localStorage.setItem("ObjetosGastos", JSON.stringify(gastosState));
    localStorage.setItem("PresupuestoLS", JSON.stringify(presupuesto));
    localStorage.setItem("ValidLS", JSON.stringify(isValid));
  }, [gastosState, presupuesto, isValid])

  // Efecto para filtrar gastos
  useEffect(() => {
    if(filtros !== "") {
      const gastosFiltrados = gastosState.filter(element => element.categoria === filtros)
      setGastosFiltrados(gastosFiltrados)
    }
  }, [filtros, gastosState])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Barra superior */}
      <Header 
        presupuesto={presupuesto}
        setPresupuesto={setPresupuesto}
        isValid={isValid}
        setIsValid={setIsValid}
        setIsSidebarOpen={setIsSidebarOpen}
        isSidebarOpen={isSidebarOpen}
      />
      
      {isValid ? (
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar para navegación */}
          <Sidebar 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            deletePresupuesto={deletePresupuesto}
          />
          
          {/* Contenido principal */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {activeTab === 'dashboard' && (
              <Dashboard 
                presupuesto={presupuesto}
                gastosState={gastosState}
              />
            )}
            
            {activeTab === 'gastos' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-gray-800">Administra tus gastos</h2>
                  <button 
                    onClick={handleNuevoGasto}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Nuevo Gasto
                  </button>
                </div>
                
                <Filtros
                  filtros={filtros}
                  setFiltros={setFiltros}
                />
                
                <ListadoGastos 
                  gastosState={gastosState}
                  editar={editar}
                  eliminar={eliminar}
                  gastosFiltrados={gastosFiltrados}
                  filtros={filtros}
                />
              </div>
            )}
            
            {activeTab === 'categorias' && (
              <Categorias gastosState={gastosState} />
            )}

            {activeTab === 'reportes' && (
              <Reportes gastosState={gastosState} presupuesto={presupuesto} />
            )}
          </main>
          
          {/* Botón flotante para móviles */}
          <div className="md:hidden">
            <button 
              onClick={handleNuevoGasto} 
              className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </button>
          </div>
        </div>
      ) : (
        // Componente de inicio para establecer presupuesto
        <div className="flex flex-col flex-1 items-center justify-center p-6 bg-gray-50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Bienvenido a FinanceTracker</h2>
            <p className="text-gray-600 mb-6 text-center">
              Para comenzar, define tu presupuesto inicial
            </p>
            
            <div className="flex flex-col">
              <label htmlFor="presupuesto" className="text-sm font-medium text-gray-700 mb-1">
                Presupuesto inicial
              </label>
              <input
                type="number"
                id="presupuesto"
                value={presupuesto}
                onChange={e => setPresupuesto(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingresa tu presupuesto"
              />
              
              {presupuesto < 0 && (
                <p className="mt-2 text-sm text-red-600">
                  El presupuesto debe ser un valor positivo
                </p>
              )}
              
              <button
                onClick={() => {
                  if (presupuesto > 0) {
                    setIsValid(true)
                    setActiveTab('dashboard')
                  }
                }}
                disabled={presupuesto <= 0}
                className={`mt-4 px-4 py-2 rounded-md text-white font-medium ${
                  presupuesto > 0 
                    ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Comenzar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {modal && (
        <Modal 
          gastoEditar={gastoEditar} 
          setGastoEditar={setGastoEditar} 
          setModal={setModal} 
          guardarGastos={guardarGastos}
        />
      )}
    </div>
  )
}

export default App