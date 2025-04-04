import React, { useEffect, useState } from 'react'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import "react-circular-progressbar/dist/styles.css"

import { cantidad } from '../helpers/index'

export default function CtlPresupuesto({ presupuesto, setPresupuesto, gastosState, deletePresupuesto }) {
  const [ disponible, setDisponible ] = useState(0)
  const [ gastado, setGastado ] = useState(0)
  const [porcentaje, setProcentaje] = useState(0)

  useEffect(()=>{
    const sumaGasto = gastosState.reduce((total, gastoElement) => gastoElement.gasto + total, 0)
    const totalDisponible = presupuesto - sumaGasto
    //Calcular porcentaje
    const nuevoPorcentaje = ((totalDisponible * 100) / presupuesto)
    setTimeout(()=>{
      setProcentaje(nuevoPorcentaje)
    },800)
    
    //total es el acumulado ,la intacia de gasto, itere element y que inicie en 0
    setDisponible(totalDisponible)
    setGastado(sumaGasto)
  },[gastosState])

  return (
    <div className="mt-2 flex justify-center -mb-8  max-lg:mb-0 transition-all w-full max-lg:m-0">
      <div className='container mx-auto rounded-md bg-white p-12 shadow-lg -mb-[2rem] max-lg:m-0 transition-all max-lg:px-2 w-full'>
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Planificador de Gastos</h1>
        <div className="flex max-md:flex-wrap items-center justify-center">
          <div className="p-4 m-2">
            <CircularProgressbar
              styles={
                disponible >= 0 ? (
                  buildStyles({
                    pathColor: "rgb(37, 99, 235)",
                    trailColor: "rgba(0, 0, 0, 0.1)",
                    textColor: "rgb(37, 99, 235)",
                })
                ) 
                : 
                buildStyles({
                  pathColor: "rgb(225, 29, 92)",
                  trailColor: "rgba(0, 0, 0, 0.1)",
                  textColor: "rgb(225, 29, 92)",
                })
              }
              text={`${Math.floor(porcentaje)}%`}
              value={porcentaje}
            />
          </div>
          <div className="max-lg:mx-2 max-lg:mt-2 w-4/5 text-2xl max-lg:text-xl flex flex-col">
            <div className="w-full flex flex-col mb-4">
              <button onClick={()=> deletePresupuesto()} className="w-full rounded-md bg-rose-600 text-white font-bold uppercase">resetear App</button>
            </div>
            <div className="w-full flex flex-col mb-4">
              <p className="flex text-blue-600 font-black  max-lg:justify-between">Presupuesto:<span className="mx-2 font-medium text-gray-800">{cantidad(presupuesto)}</span></p>
            </div>
            <div className="w-full flex flex-col  mb-4">
              <p className="flex  text-blue-600 font-black  max-lg:justify-between">Disponible:<span className="mx-2 font-medium text-gray-800">{cantidad(disponible)}</span></p>
            </div>
            <div className="w-full flex flex-col  mb-4">
              <p className="flex text-blue-600 font-black  max-lg:justify-between">Gastado:<span className="mx-2 font-medium text-gray-800">{cantidad(gastado)}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
