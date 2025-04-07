import React from 'react';
import Gastos from './Gastos';

export default function ListadoGastos({ 
  modal, 
  gastosState, 
  setGastoEditar, 
  editar, 
  eliminar, 
  gastosFiltrados, 
  filtros
}) {
  // Determinamos qué datos mostrar según el filtro
  let datosAMostrar = filtros !== "" ? gastosFiltrados : gastosState;
  
  // Si el filtro no es específicamente "Ahorro", excluimos los gastos de ahorro de la vista general
  if (filtros !== "Ahorro") {
    datosAMostrar = datosAMostrar.filter(gasto => gasto.categoria !== "Ahorro");
  }
  
  const hayDatos = datosAMostrar.length > 0;
  
  // Para mostrar mensaje informativo sobre los gastos de ahorro
  const gastosAhorro = gastosState.filter(gasto => gasto.categoria === "Ahorro").length;
  const mostrarMensajeAhorro = gastosAhorro > 0 && filtros !== "Ahorro";

  return(
    <div className={`mx-auto mt-8 w-full ${modal && "hidden"} max-sm:mt-4 pb-8`}>
      {/* Encabezado según si hay gastos o no */}
      {gastosState.length ? (
        <h2 className="font-black text-3xl text-center mb-6">
          Administra tus
          <span className="text-blue-700 ml-1.5">Gastos</span>
        </h2>
      ) : (
        <div className="mx-auto mt-20 max-md:mt-4 w-full h-max overflow-y-auto">
          <h2 className="font-black text-3xl text-center">
            Añade un
            <span className="text-blue-700 ml-1.5">Gastos</span>
          </h2>
        </div>
      )}

      {/* Subtítulo específico para filtros */}
      {filtros !== "" && (
        <div className="mb-4 text-center">
          <p className="text-gray-600">
            Mostrando gastos de categoría: <span className="font-medium text-blue-600">{filtros}</span>
          </p>
        </div>
      )}
      
      {/* Mensaje informativo sobre gastos de ahorro */}
      {mostrarMensajeAhorro && (
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-700 rounded">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium">Los gastos de ahorro están ocultos</p>
              <p className="mt-1 text-sm">
                {gastosAhorro} {gastosAhorro === 1 ? 'gasto de ahorro' : 'gastos de ahorro'} se gestionan exclusivamente desde la sección de "Gestión de Ahorro".
                {filtros === "" && " Selecciona el filtro \"Ahorro\" para verlos."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid para mostrar los gastos */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {hayDatos ? (
          datosAMostrar.map((gastos) => (
            <Gastos 
              key={gastos.id} 
              gastos={gastos}
              setGastoEditar={setGastoEditar}
              editar={editar}
              eliminar={eliminar}
            />
          ))
        ) : filtros !== "" ? (
          <div className="col-span-full w-full mt-4 mb-8">
            <div className="w-4/5 bg-white rounded-lg shadow mx-auto flex items-center justify-center max-lg:w-full">
              <h1 className="text-gray-400 text-2xl py-6 font-bold">No hay gastos en <span className="text-blue-400 ml-1.5 font-semibold">{filtros}</span></h1>
            </div>
          </div>
        ) : (
          <div className="col-span-full w-full mt-4 mb-8 text-center">
            <p className="text-gray-500 py-8">No hay gastos registrados</p>
          </div>
        )}
      </div>
    </div>
  )
}