import React, { useEffect, useState } from 'react'
import CerarBtn from '../assets/img/cerrar.svg'
import Error from './Error';

export default function Modal({ setModal, guardarGastos, gastoEditar, setGastoEditar }) {
  const [nombreG, setNombreG] = useState("")
  const [gasto, setGasto] = useState("");
  const [categoria, setCategoria] = useState("")

  const [error, setError] = useState(false)
  // Utiliza el operador de nulabilidad opcional para acceder a las propiedades de gastoEditar de forma segura
  useEffect(()=>{
    setNombreG(gastoEditar?.nombreG || "");
    setGasto(gastoEditar?.gasto || "");
    setCategoria(gastoEditar?.categoria || "");
  },[gastoEditar])

  const handelForm = (e) => {
    e.preventDefault();
    if ([nombreG, gasto, categoria].includes("")){
      setError(true)
      return;
    }
    setError(false)
    guardarGastos({nombreG, gasto, categoria})
    //Limpiamos formulario
    setNombreG("")
    setGasto("")
    setCategoria("")
    //Cerramos modal
    setModal(false)
  }
  const cerrarModal = () => {
    setModal(false)
  }
  return (
    <div className="z-40 w-full h-screen bg-black bg-opacity-90 fixed top-0">
      <div className="fixed z-50 right-8 top-8">
        <img 
          className="w-10" 
          src={CerarBtn} 
          alt="Icono-cerrar" 
          onClick={()=>cerrarModal()}
        />
      </div>
      <form 
        className="w-3/5 m-auto flex flex-col mt-10" 
        onSubmit={handelForm} 
      >
        {
          error && <Error>Todos los campos son obligatorios</Error>
        }
        <h1 className="text-white text-center p-1 text-4xl uppercase font-normal relative after:content-{''} after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-blue-600">
          Nuevo Gasto
        </h1>
        <div className="w-full mt-4">
          <label className="w-full text-white text-2xl" htmlFor="nombreGasto">Nombre Gasto</label>
          <input 
            className="w-full mt-2 px-1.5 py-0.5 placeholder:text-gray-700 outline-none rounded" 
            type="text" 
            name="nombreGasto" 
            id="nombreGasto" 
            placeholder="Añade un Nombre de Gasto"
            value={nombreG}
            onChange={(e)=>setNombreG(e.target.value)}
          />
        </div>
        <div className="w-full mt-4">
          <label className="w-full text-white text-2xl" htmlFor="Cantidad">Cantidad</label>
          <input 
            className="w-full mt-2 px-1.5 py-0.5 placeholder:text-gray-700 outline-none rounded" 
            type="number" 
            name="Cantidad" 
            id="Cantidad" 
            placeholder="Añade la cantidad de Gasto: ej. 300"
            value={gasto}
            onChange={e=>setGasto(Number(e.target.value))}
          />
        </div>
        <div className="w-full mt-4">
          <label className="w-full text-white text-2xl" htmlFor="Categoría">Categoría</label>
          <select 
            className="w-full mt-2 px-1.5 py-0.5 placeholder:text-gray-700 outline-none rounded text-center" 
            name="Categoría" 
            id="Categoría"
            value={categoria}
            onChange={e=>setCategoria(e.target.value)}
          >
            <option value="">---Seleccione---</option>
            <option value="Ahorro">Ahorro</option>
            <option value="Comida">Comida</option>
            <option value="Casa">Casa</option>
            <option value="Ocio">Ocio</option>
            <option value="Salud">Salud</option>
            <option value="Educacion">Educacion</option>
            <option value="Otros">Otros</option>
          </select>
        </div>
        <div className="w-full mt-4">
          <input 
            type="submit" 
            value={gastoEditar.id ? "Editar Gasto" : "Añadir Gasto" }
            className="w-full mt-2 px-1.5 py-0.5 outline-none rounded uppercase text-white font-bold cursor-pointer bg-blue-700 hover:bg-blue-900 transition-all"
          />
        </div>
      </form>
    </div>
  )
}
