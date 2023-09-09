import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'

import Header from './components/Header'
import IconoNuevoGasto from "./assets/img/nuevo-gasto.svg"
import Modal from './components/Modal'
//funciones
import { generarID } from './helpers'
import ListadoGastos from './components/ListadoGastos'
import Filtros from './components/Filtros'
import { element } from 'prop-types'

function App() {
  const [presupuesto, setPresupuesto ] = useState(JSON.parse(localStorage.getItem("PresupuestoLS")) ?? "")
  const [isValid, setIsValid] = useState(JSON.parse(localStorage.getItem("ValidLS")) ?? false)
  const [modal, setModal] = useState(false)

  //Me guarda todos los gastos
  const [gastosState, setGastosState] = useState(JSON.parse(localStorage.getItem("ObjetosGastos")) ?? [])
  const [gastoEditar, setGastoEditar] = useState({})

  //Filtros
  const [filtros, setFiltros] = useState("")
  const [gastosFiltrados, setGastosFiltrados] = useState([])

  const hondleNuevoGasto = () => {
    setModal(true)
    setGastoEditar({})
  }
  const deletePresupuesto = () => {
    Swal.fire({
      title: 'Estas seguro que quiere reiniciar la App?',
      icon: 'question',
      iconHtml: '؟',
      confirmButtonText: 'Si',
      cancelButtonText: 'No',
      showCancelButton: true,
      showCloseButton: true
    }).then((result)=>{
      result.isConfirmed && (
        setPresupuesto(""),
        setIsValid(false),
        setModal(false),
        setGastosState([]),
        setGastoEditar({}),
        localStorage.clear
      )
    })
  }

  const guardarGastos = cantidadGasto => {
    //Actulizar condicion modal
    if(gastoEditar.id){
      cantidadGasto.id = gastoEditar.id 
      cantidadGasto.fecha = gastoEditar.fecha
      const update = gastosState.map((elemet)=> {
        if (elemet.id === cantidadGasto.id) {
          return cantidadGasto
        }else{
          return elemet
        }
      })
      setGastosState(update)
    }else{
      cantidadGasto.id = generarID();
      cantidadGasto.fecha = Date.now();
      setGastosState([cantidadGasto, ...gastosState])
    }
    setGastoEditar({})
  }

  const editar = (gastos) => {
    setGastoEditar(gastos)
    setModal(true)
  }
  const eliminar = (gastos) => {
    const eliminarGssto = gastosState.filter(delite=> gastos.id !== delite.id )
    Swal.fire({
      title: ' Eliminar gasto?',
      icon: 'question',
      iconHtml: '؟',
      confirmButtonText: 'Si',
      cancelButtonText: 'No',
      showCancelButton: true,
      showCloseButton: true
    }).then((result)=>{
      result.isConfirmed && (
        setGastosState(eliminarGssto)
      )
    })
  }
  useEffect(()=>{
    localStorage.setItem("ObjetosGastos", JSON.stringify(gastosState));
    localStorage.setItem("PresupuestoLS", JSON.stringify(presupuesto));
    localStorage.setItem("ValidLS", JSON.stringify(isValid));
  },[gastosState,presupuesto, isValid])

  useEffect(()=>{
    if(filtros !== ""){
      //Filtrar por categoria
      const gastosFiltragos = gastosState.filter(element=> element.categoria === filtros)
      setGastosFiltrados(gastosFiltragos)
    }
  },[filtros])

  return (
    <div className="w-full items-center justify-center font-sans">
      <Header
        presupuesto={presupuesto}
        setPresupuesto={setPresupuesto}
        isValid={isValid}
        deletePresupuesto={deletePresupuesto}
        setIsValid={setIsValid}
        gastosState={gastosState}
        gastoEditar={gastoEditar}
        setGastoEditar={setGastoEditar}
      />
      {
        isValid && (
          <>
            <main className="w-full mt-12 max-sm:mt-4">
              <Filtros
                filtros={filtros}
                setFiltros={setFiltros}
              />
              <ListadoGastos 
                modal={modal}  
                gastosState={gastosState}
                setGastoEditar={setGastoEditar}
                gastoEditar={gastoEditar}
                editar={editar}
                eliminar={eliminar}
                gastosFiltrados={gastosFiltrados}
                filtros={filtros}
              />
            </main>
            <div onClick={hondleNuevoGasto} className="fixed bottom-8 right-8 overflow-hidden rounded-full">
              <img className="w-12" src={IconoNuevoGasto} alt="Icono Nuevo Gasto" />
            </div>
          </>
        )
      }
      {
        modal && <Modal 
                  gastoEditar={gastoEditar} 
                  setGastoEditar={setGastoEditar} 
                  setModal={setModal} 
                  guardarGastos={guardarGastos}
                />
      }
    </div>
  )
}

export default App
