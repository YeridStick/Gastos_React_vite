import Gastos from './Gastos'

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
  const datosAMostrar = filtros !== "" ? gastosFiltrados : gastosState;
  const hayDatos = datosAMostrar.length > 0;

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

      {/* Grid responsivo para mostrar los gastos */}
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