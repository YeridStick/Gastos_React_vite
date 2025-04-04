import Gastos from './gastos/Gastos'

export default function ListadoGastos({ 
  modal, 
  gastosState, 
  setGastoEditar, 
  editar, 
  eliminar, 
  gastosFiltrados, 
  filtros
}) {
  return(
    <div className={`mx-auto mt-8 w-full ${modal && "hidden"} max-sm:mt-4 pb-8`} >
      {
        gastosState.length ? (
          <h2 className="font-black text-3xl text-center">
            Administra tus
            <span className="text-blue-700 ml-1.5">Gastos</span>
          </h2>
        ):
        (
          <div className="mx-auto mt-20 max-md:mt-4 w-full h-max overflow-y-auto">
            <h2 className="font-black text-3xl text-center">
              Añade un
              <span className="text-blue-700 ml-1.5">Gastos</span>
            </h2>
          </div>
        )
      }
      {
        filtros != "" ? (
          <>
            {
              gastosFiltrados.length ? (
                gastosFiltrados.map((gastos)=>{
                  return <Gastos 
                        key={gastos.id} 
                        gastos={gastos}
                        setGastoEditar={setGastoEditar}
                        editar={editar}
                        eliminar={eliminar}
                      />
                })
              ):
              (
                <div className="w-full mt-4 mb-8">
                  <div className="w-4/5 bg-white rounded-lg shadow mx-auto flex items-center justify-center max-lg:w-full">
                    <h1 className="text-gray-400 text-2xl py-2 font-bold">No hay gastos en <span className="text-blue-400 ml-1.5 font-semibold">{filtros}</span></h1>
                  </div>
                </div>
              )
            }
          </>
        ):
        (
          gastosState.map((gastos)=>{
            return <Gastos 
                    key={gastos.id} 
                    gastos={gastos}
                    setGastoEditar={setGastoEditar}
                    editar={editar}
                    eliminar={eliminar}
                  />
          })
        )
      }
    </div>
  )
}
