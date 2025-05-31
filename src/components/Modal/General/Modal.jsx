import { useState, useEffect, useRef } from "react";
import PropTypes from 'prop-types';

// Componente de error
const Error = ({ children }) => {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 mb-4 rounded">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">{children}</p>
        </div>
      </div>
    </div>
  );
};

Error.propTypes = {
  children: PropTypes.node.isRequired
};

export default function Modal({
  setModal,
  guardarGastos,
  gastoEditar = {},
  setGastoEditar,
}) {
  const [nombreG, setNombreG] = useState("");
  const [gasto, setGasto] = useState("");
  const [categoria, setCategoria] = useState("");
  const [fecha, setFecha] = useState("");
  const [error, setError] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState("");

  // Estado para almacenar las categorías
  const [categorias, setCategorias] = useState([]);

  // Ref para el formulario
  const formRef = useRef(null);

  // Ref para el input de nombre - para enfocar automáticamente
  const nombreInputRef = useRef(null);

  // Cargar categorías desde localStorage
  useEffect(() => {
    try {
      const categoriasGuardadas = localStorage.getItem("categorias");

      if (categoriasGuardadas) {
        setCategorias(JSON.parse(categoriasGuardadas));
      } else {
        // Si no hay categorías guardadas, usar las predefinidas
        const categoriasPredefinidas = [
          { id: "Comida", nombre: "Comida" },
          { id: "Casa", nombre: "Casa" },
          { id: "Ocio", nombre: "Ocio" },
          { id: "Salud", nombre: "Salud" },
          { id: "Educacion", nombre: "Educación" },
          { id: "Otros", nombre: "Otros" },
        ];
        setCategorias(categoriasPredefinidas);
      }
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }

    // Escuchar cambios en localStorage para categorías
    const handleStorageChange = (e) => {
      if (e.key === "categorias") {
        try {
          setCategorias(JSON.parse(e.newValue));
        } catch (error) {
          console.error("Error al actualizar categorías:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Cargar datos para edición
  useEffect(() => {
    if (gastoEditar && Object.keys(gastoEditar).length > 0) {
      setNombreG(gastoEditar.nombreG || "");
      setGasto(gastoEditar.gasto || "");
      setCategoria(gastoEditar.categoria || "");

      // Convertir la fecha a formato YYYY-MM-DD para el campo de entrada
      if (gastoEditar.fecha) {
        const fechaObj = new Date(gastoEditar.fecha);
        const year = fechaObj.getUTCFullYear();
        const month = String(fechaObj.getUTCMonth() + 1).padStart(2, "0");
        const day = String(fechaObj.getUTCDate()).padStart(2, "0");
        setFecha(`${year}-${month}-${day}`);
      }
    }

    // Enfocar el primer campo cuando se abre el modal
    setTimeout(() => {
      if (nombreInputRef.current) {
        nombreInputRef.current.focus();
      }
    }, 100);
  }, [gastoEditar]);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Detectar clic fuera del modal para cerrarlo
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        // Si el clic fue fuera del formulario pero dentro del div del fondo
        // entonces cerrar el modal
        if (event.target.classList.contains("modal-backdrop")) {
          cerrarModal();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Detectar la tecla Escape para cerrar el modal
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        cerrarModal();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  // En Modal.jsx - Asegúrate de que la fecha se procese correctamente

  // Cuando se envía el formulario
  // En Modal.jsx, modificar la función handleSubmit para manejar mejor las fechas:

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validación de campos
    if ([nombreG, gasto, categoria].includes("") || gasto <= 0) {
      setError(true);

      if ([nombreG, gasto, categoria].includes("")) {
        setErrorMensaje("Todos los campos son obligatorios");
      } else if (gasto <= 0) {
        setErrorMensaje("El monto debe ser mayor a 0");
      }

      setTimeout(() => {
        setError(false);
      }, 3000);
      return;
    }

    // Crear el objeto base del gasto
    const objetoGasto = {
      nombreG,
      gasto,
      categoria,
    };

    // Manejo de fecha para edición o nuevo gasto
    if (gastoEditar.id) {
      // Si estamos editando, mantener el ID
      objetoGasto.id = gastoEditar.id;

      // Si se seleccionó una fecha en el formulario, convertirla a formato ISO
      if (fecha) {
        // Crear fecha en UTC para evitar problemas de zona horaria
        const fechaSeleccionada = new Date(`${fecha}T12:00:00Z`);
        objetoGasto.fecha = fechaSeleccionada.toISOString();
        console.log(
          "Editando gasto con fecha seleccionada:",
          objetoGasto.fecha
        );
      } else if (gastoEditar.fecha) {
        // Si no se seleccionó fecha pero el gasto original tenía una, mantenerla
        objetoGasto.fecha = gastoEditar.fecha;
        console.log("Manteniendo fecha original:", objetoGasto.fecha);
      } else {
        // Si no hay fecha seleccionada ni original, usar la fecha actual
        objetoGasto.fecha = new Date().toISOString();
        console.log("Usando fecha actual para edición:", objetoGasto.fecha);
      }
    } else {
      // Para nuevos gastos, usar la fecha actual
      objetoGasto.fecha = new Date().toISOString();
      console.log("Creando nuevo gasto con fecha actual:", objetoGasto.fecha);
    }

    // Enviar el objeto para guardar
    guardarGastos(objetoGasto);

    // Limpiar el formulario
    setNombreG("");
    setGasto("");
    setCategoria("");
    setFecha("");

    // Cerrar el modal
    cerrarModal();
  };

  const cerrarModal = () => {
    setGastoEditar({});
    setModal(false);
  };

  // Manejar cambio de valor de gasto
  const handleGastoChange = (e) => {
    const value = e.target.value;
    // Solo permitir números positivos y con máximo 2 decimales
    if (value === "" || /^\d+(\.\d{0,2})?$/.test(value)) {
      setGasto(value === "" ? "" : Number(value));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-2 sm:px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay de fondo */}
        <div
          className="fixed inset-0 transition-opacity modal-backdrop"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
        </div>

        {/* Centrar modal */}
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        {/* Contenido del modal */}
        <div
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full max-w-[95%] sm:w-full"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
          ref={formRef}
        >
          {/* Botón cerrar */}
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
            <button
              onClick={cerrarModal}
              className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
              aria-label="Cerrar"
            >
              <span className="sr-only">Cerrar</span>
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Título y formulario */}
          <div className="px-4 pt-5 pb-4 sm:p-6">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3
                  className="text-xl sm:text-2xl leading-6 font-semibold text-gray-900 mb-4"
                  id="modal-headline"
                >
                  {gastoEditar && gastoEditar.id ? "Editar Gasto" : "Nuevo Gasto"}
                </h3>

                {error && <Error>{errorMensaje}</Error>}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="nombreGasto"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nombre del Gasto <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="nombreGasto"
                      id="nombreGasto"
                      value={nombreG}
                      onChange={(e) => setNombreG(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Ej: Alquiler Oficina"
                      ref={nombreInputRef}
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cantidadGasto"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Monto <span className="text-red-600">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="text"
                        name="cantidadGasto"
                        id="cantidadGasto"
                        value={gasto ? Number(gasto).toLocaleString('es-CO') : ''}
                        onChange={e => {
                          const raw = e.target.value.replace(/\D/g, '');
                          setGasto(raw);
                        }}
                        className="block w-full pl-7 pr-12 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="0.00"
                        inputMode="decimal"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="categoriaGasto"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Categoría <span className="text-red-600">*</span>
                    </label>
                    <select
                      id="categoriaGasto"
                      name="categoriaGasto"
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                      className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">-- Seleccionar Categoría --</option>
                      {categorias.map((cat) => (
                        <option key={cat.id} value={cat.nombre}>
                          {cat.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Solo mostrar campo de fecha en edición */}
                  {gastoEditar && gastoEditar.id && (
                    <div>
                      <label
                        htmlFor="fechaGasto"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Fecha
                      </label>
                      <input
                        type="date"
                        name="fechaGasto"
                        id="fechaGasto"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  )}

                  <div className="pt-4 flex flex-col sm:flex-row sm:space-x-3">
                    <button
                      type="button"
                      onClick={cerrarModal}
                      className="mb-2 sm:mb-0 w-full sm:w-auto order-2 sm:order-1 inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:w-auto order-1 sm:order-2 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                    >
                      {gastoEditar && gastoEditar.id ? "Guardar Cambios" : "Añadir Gasto"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Modal.propTypes = {
  setModal: PropTypes.func.isRequired,
  guardarGastos: PropTypes.func.isRequired,
  gastoEditar: PropTypes.shape({
    id: PropTypes.string,
    nombreG: PropTypes.string,
    gasto: PropTypes.number,
    categoria: PropTypes.string,
    fecha: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }),
  setGastoEditar: PropTypes.func.isRequired
};
