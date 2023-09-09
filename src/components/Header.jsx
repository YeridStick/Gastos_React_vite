import React from 'react'
import NuevoPresupuesto from './NuevoPresupuesto'
import CtlPresupuesto from './CtlPresupuesto'

export default function Header({ 
  presupuesto, 
  setPresupuesto, 
  isValid, 
  setIsValid,
  gastosState,
  deletePresupuesto
}) {
  return (
    <header className="bg-blue-600 w-full text-center flex flex-col items-center justify-center max-lg:rounded-b">
      <h1 className="text-white text-4xl font-bold uppercase mt-4 mb-4 max-lg:mt-8">
        Planificador de Gastos
      </h1>
      {
        isValid ? (
          <CtlPresupuesto
            deletePresupuesto={deletePresupuesto}
            presupuesto={presupuesto}
            setPresupuesto={setPresupuesto}
            gastosState={gastosState}
            setIsValid={setIsValid}
          />
        ):(
          <NuevoPresupuesto
            presupuesto={presupuesto}
            setPresupuesto={setPresupuesto}
            setIsValid={setIsValid}
          />
        )
      }
    </header>
  )
}
