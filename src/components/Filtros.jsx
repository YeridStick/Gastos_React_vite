import React from 'react'

export default function Filtros({ filtros, setFiltros }) {
  return (
    <div className="w-full mt-20 max-md:mt-4">
      <form className="mx-auto w-4/5 max-lg:w-full px-4 bg-white flex max-md:flex-wrap items-center justify-around rounded-lg py-4 gap-2 shadow-md">
        <label 
          htmlFor="filtro" 
          className="text-gray-500 font-bold text-3xl uppercase w-full text-center"
        >
          Filtrar Gastos
        </label>
        <select 
          name="filtro" 
          id="filtro"
          className="w-full text-center rounded border outline-neutral-200 h-10 text-xl text-gray-800  font-semibold"
          value={filtros}
          onChange={(e)=>setFiltros(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="Ahorro">Ahorro</option>
          <option value="Comida">Comida</option>
          <option value="Casa">Casa</option>
          <option value="Ocio">Ocio</option>
          <option value="Salud">Salud</option>
          <option value="Educacion">Educacion</option>
          <option value="Otros">Otros</option>
        </select>
      </form>
    </div>
  )
}
