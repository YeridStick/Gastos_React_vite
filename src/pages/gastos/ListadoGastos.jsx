import { Link } from 'react-router-dom';
import Gastos from './Gastos';
import PropTypes from 'prop-types';

export default function ListadoGastos({ 

  gastosState, 
  setGastoEditar, 
  editar, 
  eliminar, 
  gastosFiltrados, 
  filtros
}) {
  // Determinamos qué datos mostrar según el filtro
  let datosAMostrar = (filtros === "Todos" || filtros === "") ? gastosState : gastosFiltrados;
  
  // Si el filtro no es específicamente "Ahorro", excluimos los gastos de ahorro de la vista general
  if (filtros !== "Ahorro") {
    datosAMostrar = datosAMostrar.filter(gasto => gasto.categoria !== "Ahorro");
  }
  
  const hayDatos = datosAMostrar.length > 0;
  
  // Para mostrar mensaje informativo sobre los gastos de ahorro
  const gastosAhorro = gastosState.filter(gasto => gasto.categoria === "Ahorro").length;
  const mostrarMensajeAhorro = gastosAhorro > 0 && filtros !== "Ahorro";
  

  return(
    <div className="mx-auto mt-8 w-full">
      {/* Encabezado según si hay gastos o no */}
      {gastosState.length ? (
        <h2 className="font-black text-3xl text-center mb-6">
          Administra tus
          <span className="text-blue-700 ml-1.5">Gastos</span>
        </h2>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 text-center flex flex-col items-center">
          <svg className="h-10 w-10 text-blue-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">¡Personalizar tus categorías!</h3>
          <p className="text-gray-500 mb-4">Recuerda que puedes crear nuevas categorías, para registrar gastos mas específicos.</p>
          {/* Aquí podrías agregar un botón para abrir el modal de crear categoría si lo deseas */}
          <Link
            to="/categorias"
            className={`p-4 flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 bg-blue-500 hover:bg-blue-700 transition-all text-white font-bold justify-center`}
          >
            <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Categorías
          </Link>
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
                {gastosAhorro} {gastosAhorro === 1 ? 'gasto de ahorro' : 'gastos de ahorro'} se gestionan exclusivamente desde la sección de &quot;Gestión de Ahorro&quot;.
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

ListadoGastos.propTypes = {
  modal: PropTypes.bool,
  gastosState: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      nombreG: PropTypes.string.isRequired,
      gasto: PropTypes.number.isRequired,
      categoria: PropTypes.string.isRequired,
      fecha: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
    })
  ).isRequired,
  setGastoEditar: PropTypes.func.isRequired,
  editar: PropTypes.func.isRequired,
  eliminar: PropTypes.func.isRequired,
  gastosFiltrados: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      nombreG: PropTypes.string.isRequired,
      gasto: PropTypes.number.isRequired,
      categoria: PropTypes.string.isRequired,
      fecha: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
    })
  ).isRequired,
  filtros: PropTypes.string.isRequired
};