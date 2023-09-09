import React, { useState } from 'react';

import { formatearFecha, cantidad } from '../helpers';

import IconoAhorro from '../assets/img/icono_ahorro.svg';
import IconoCasa from '../assets/img/icono_casa.svg';
import IconoComida from '../assets/img/icono_comida.svg';
import IconoGasto from '../assets/img/icono_gastos.svg';
import IconoOcio from '../assets/img/icono_ocio.svg';
import IconoSalud from '../assets/img/icono_salud.svg';
import IconoEducacion from '../assets/img/icono_suscripciones.svg';

const direccionarioIcono = {
  Ahorro: IconoAhorro,
  Comida: IconoComida,
  Casa: IconoCasa,
  Ocio: IconoOcio,
  Salud: IconoSalud,
  Educacion: IconoEducacion,
  Otros: IconoGasto,
};


export default function Gastos({ gastos, setGastoEditar, editar, eliminar }) {
  // Define los elementos JSX para las acciones de deslizamiento
  const [acciones, setAcciones] = useState(false)

  return (
    <div 
      onMouseLeave={()=>setAcciones(false)}
      onMouseEnter={()=>setAcciones(true)} 
      className="transition-all duration-500 mb-8"
    >
      <div className="mx-auto w-4/5 px-4 py-2 rounded-lg shadow-md my-1 bg-white flex justify-between max-md:w-full max-md:flex-wrap max-sm:justify-center">
        <div className="flex max-md:flex-wrap">
          <div className="w-max flex items-center justify-center ml-3 mr-6 max-sm:w-full">
            <img
              className="w-20"
              src={direccionarioIcono[gastos.categoria]}
              alt="Icono Gasto"
            />
          </div>
          <div className="max-sm:flex max-sm:flex-wrap max-sm:justify-center max-sm:m-auto">
            <p className="text-xl text-gray-400 font-bold uppercase max-md:text-lg max-sm:w-full max-sm:text-center">
              {gastos.categoria}
            </p>
            <h2 className="text-2xl text-gray-700 font-bold max-md:text-xl max-sm:w-full max-sm:text-center">
              {gastos.nombreG}
            </h2>
            <p className="text-lg text-gray-500 font-bold max-md:text-md max-sm:w-full max-sm:text-center">
              <span className="font-semibold text-xl text-gray-800 mr-1 max-md:text-lg">
                Agregada:
              </span>
              {formatearFecha(gastos.fecha)}
            </p>
          </div>
        </div>
        <div className="flex items-center pl-4 mr-4 max-md:m-0 max-md:mt-4 max-sm:p-0 max-sm:m-0">
          <p className="text-3xl font-black max-md:text-lg max-md:text-center ">
            {cantidad(gastos.gasto)}
          </p>
        </div>
      </div>
      <div className={`transition-all duration-900 bg-white mx-auto w-4/5 px-4 py-2 rounded-lg shadow-lg flex flex-wrap -mt-2 gap-2 relative -bottom-3 left-0 ${acciones ? "opacity-1" : " opacity-0"} -mb-16`}>
        <button 
          onClick={()=> editar(gastos)}
          className="bg-green-500 px-4 py-2 text-white font-bold uppercase rounded-lg flex-1 transition-all"
        >
          Editar
        </button>
        <button onClick={()=>eliminar(gastos)} className="bg-rose-500 px-4 py-2 text-white font-bold uppercase rounded-lg flex-1 transition-all">Eliminar</button>
      </div>
    </div>
  );
}
