import React, { useState } from 'react'
import Mensaje from './Mensaje';

export default function NuevoPresupuesto({ 
  presupuesto, 
  setPresupuesto, 
  setIsValid 
}) {
  const [mensaje, setMensaje] = useState("")

  const handlePresupuesto = (e) => {
    e.preventDefault();
    if(!presupuesto || presupuesto < 0){
      setMensaje("No es un presupuesto valido")
      return;
    }
    setMensaje("")
    setIsValid(true)
  }
  return (
    <div className='mt-2 w-1/3 flex justify-center -mb-8 max-lg:m-0 max-lg:w-full max-lg:mb-8 transition-all'>
      <form onSubmit={handlePresupuesto} className="container mx-auto rounded-md bg-white p-12 shadow-lg -mb-[2rem] max-lg:m-0 transition-all max-lg:px-2 max-lg:w-full">
        <div className="container mx-auto w-4/5">
          <label className="font-normal text-blue-600 text-lg w-full text-center max-lg:text-4xl" htmlFor="Presupuesto">Definir Presupuesto</label>
          <input 
          id='Presupuesto'
            className=" px-1 text-2xl my-2 rounded border-none outline-none w-full text-center font-sans bg-gray-300 text-gray-800 placeholder:text-gray-600" 
            type="number" 
            placeholder="0"
            value={presupuesto}
            onChange={(e)=> setPresupuesto(Number(e.target.value))}
          />
          <input className="px-1 mt-0.5 mx-0 rounded bg-blue-900 text-white font-bold uppercase text-lg w-full" type="submit" value="Añadir" />
          {
            mensaje && <Mensaje>{mensaje}</Mensaje>
          }
        </div>
      </form>
    </div>
  )
}
