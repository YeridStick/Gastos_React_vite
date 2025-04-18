import { useState, useEffect } from "react";

// Iconos para categorías
import IconoCasa from "../../assets/img/icono_casa.svg";
import IconoComida from "../../assets/img/icono_comida.svg";
import IconoGasto from "../../assets/img/icono_gastos.svg";
import IconoOcio from "../../assets/img/icono_ocio.svg";
import IconoSalud from "../../assets/img/icono_salud.svg";
import IconoEducacion from "../../assets/img/icono_suscripciones.svg";
import { cantidad } from "../../helpers/index";
import Swal from "sweetalert2";

// Categorías predefinidas
const categoriasPredefinidas = [
  {
    id: "Comida",
    nombre: "Comida",
    icono: IconoComida,
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    id: "Casa",
    nombre: "Casa",
    icono: IconoCasa,
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: "Ocio",
    nombre: "Ocio",
    icono: IconoOcio,
    color: "bg-purple-100 text-purple-800",
  },
  {
    id: "Salud",
    nombre: "Salud",
    icono: IconoSalud,
    color: "bg-red-100 text-red-800",
  },
  {
    id: "Educacion",
    nombre: "Educación",
    icono: IconoEducacion,
    color: "bg-indigo-100 text-indigo-800",
  },
  {
    id: "Otros",
    nombre: "Otros",
    icono: IconoGasto,
    color: "bg-gray-100 text-gray-800",
  },
];

// Colores disponibles para nuevas categorías
const coloresDisponibles = [
  { id: "green", nombre: "Verde", valor: "bg-green-100 text-green-800" },
  { id: "blue", nombre: "Azul", valor: "bg-blue-100 text-blue-800" },
  { id: "red", nombre: "Rojo", valor: "bg-red-100 text-red-800" },
  { id: "yellow", nombre: "Amarillo", valor: "bg-yellow-100 text-yellow-800" },
  { id: "purple", nombre: "Morado", valor: "bg-purple-100 text-purple-800" },
  { id: "indigo", nombre: "Índigo", valor: "bg-indigo-100 text-indigo-800" },
  { id: "pink", nombre: "Rosa", valor: "bg-pink-100 text-pink-800" },
  { id: "orange", nombre: "Naranja", valor: "bg-orange-100 text-orange-800" },
  { id: "teal", nombre: "Verde Azulado", valor: "bg-teal-100 text-teal-800" },
  { id: "gray", nombre: "Gris", valor: "bg-gray-100 text-gray-800" },
];

export default function Categorias({ gastosState }) {
  const [gastosPorCategoria, setGastosPorCategoria] = useState({});
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  // Nueva categoría
  const [nuevaCategoria, setNuevaCategoria] = useState({
    nombre: "",
    color: "bg-gray-100 text-gray-800",
  });

  const [error, setError] = useState(false);

  // Estado para categorías (predefinidas + personalizadas)
  const [categorias, setCategorias] = useState([]);

  const generarIdUnico = (nombre) => {
    // Base: nombre sin espacios y en minúsculas
    const baseId = nombre.trim().replace(/\s+/g, "").toLowerCase();

    // Añadir timestamp para garantizar unicidad incluso si se usa el mismo nombre
    const timestamp = Date.now();

    // Combinar con un valor aleatorio para mayor unicidad
    const randomPart = Math.floor(Math.random() * 1000);

    return `${baseId}-${timestamp}-${randomPart}`;
  };

  useEffect(() => {
    const categoriasGuardadas = localStorage.getItem("categorias");
    const userId = localStorage.getItem("userEmail") || "local";
    const eliminadosGuardados =
      JSON.parse(localStorage.getItem("eliminados")) || {};
    const categoriasEliminadas = eliminadosGuardados.categorias || [];

    console.log("Categorías en lista de eliminados:", categoriasEliminadas);

    if (categoriasGuardadas) {
      // Si hay categorías guardadas, filtrar las que han sido eliminadas
      let categoriasParseadas = JSON.parse(categoriasGuardadas);
      const cantidadOriginal = categoriasParseadas.length;

      // Filtrar categorías que NO están en la lista de eliminados
      categoriasParseadas = categoriasParseadas.filter((cat) => {
        const estaEliminada = categoriasEliminadas.includes(cat.id);
        if (estaEliminada) {
          console.log(
            `Filtrando categoría eliminada: ${cat.nombre} (${cat.id})`
          );
        }
        return !estaEliminada;
      });

      console.log(
        `Categorías filtradas: ${categoriasParseadas.length} de ${cantidadOriginal}`
      );
      setCategorias(categoriasParseadas);

      // Actualizar localStorage solo si hay cambios en las categorías
      if (categoriasParseadas.length !== cantidadOriginal) {
        console.log("Actualizando localStorage con categorías filtradas");
        localStorage.setItem("categorias", JSON.stringify(categoriasParseadas));
      }
    } else {
      // Si no hay categorías guardadas, generamos IDs únicos para las predefinidas
      const categoriasConIdUnico = categoriasPredefinidas.map((cat) => ({
        ...cat,
        id: generarIdUnico(cat.baseId, userId),
        _esPredefinida: true, // Marca interna para saber que es predefinida
      }));

      setCategorias(categoriasConIdUnico);
      localStorage.setItem("categorias", JSON.stringify(categoriasConIdUnico));
      console.log(
        "Categorías predefinidas inicializadas:",
        categoriasConIdUnico.length
      );
    }
  }, []);

  // Guardar categorías cuando cambian
  useEffect(() => {
    if (categorias.length > 0) {
      localStorage.setItem("categorias", JSON.stringify(categorias));
    }
  }, [categorias]);

  // Calcular gastos por categoría
  useEffect(() => {
    if (gastosState.length > 0) {
      // Calcular el total de todos los gastos
      const total = gastosState.reduce((sum, gasto) => sum + gasto.gasto, 0);

      // Inicializar objeto para almacenar gastos por categoría
      const gastosPorCat = {};

      // Incluir todas las categorías conocidas, incluso las que no tienen gastos
      categorias.forEach((cat) => {
        gastosPorCat[cat.id] = {
          total: 0,
          cantidad: 0,
          porcentaje: 0,
          gastos: [],
        };
      });

      // Sumar gastos por categoría
      gastosState.forEach((gasto) => {
        const categoria = gasto.categoria;
        if (gastosPorCat[categoria]) {
          gastosPorCat[categoria].total += gasto.gasto;
          gastosPorCat[categoria].cantidad += 1;
          gastosPorCat[categoria].gastos.push(gasto);
        } else {
          // Si la categoría no existe, probablemente es una categoría antigua
          gastosPorCat[categoria] = {
            total: gasto.gasto,
            cantidad: 1,
            porcentaje: 0,
            gastos: [gasto],
          };
        }
      });

      // Calcular porcentajes
      Object.keys(gastosPorCat).forEach((cat) => {
        gastosPorCat[cat].porcentaje =
          total > 0 ? Math.round((gastosPorCat[cat].total / total) * 100) : 0;
      });

      setGastosPorCategoria(gastosPorCat);
    }
  }, [gastosState, categorias]);

  const guardarEliminados = (tipo, id) => {
    // Asegurarse de que estamos guardando solo el ID (string)
    const idAGuardar = typeof id === "object" && id.id ? id.id : id;

    // Obtener los datos actuales de "eliminados" en localStorage
    const eliminados = JSON.parse(localStorage.getItem("eliminados")) || {};

    // Si no existe el tipo, inicializarlo como un array vacío
    if (!eliminados[tipo]) {
      eliminados[tipo] = [];
    }

    // Verificar si el ID ya existe en el array para evitar duplicados
    if (!eliminados[tipo].includes(idAGuardar)) {
      eliminados[tipo].push(idAGuardar);

      // Guardar los datos actualizados en localStorage
      localStorage.setItem("eliminados", JSON.stringify(eliminados));

      console.log(`ID guardado en eliminados (${tipo}): ${idAGuardar}`);
    }
  };

  // Función para agregar una nueva categoría
  const agregarCategoria = () => {
    if (nuevaCategoria.nombre.trim() === "") {
      setError(true);
      setTimeout(() => setError(false), 3000);
      return;
    }

    // Verificar si ya existe una categoría con ese nombre
    const categoriaExistente = categorias.find(
      (cat) => cat.nombre.toLowerCase() === nuevaCategoria.nombre.toLowerCase()
    );

    if (categoriaExistente) {
      setError(true);
      setTimeout(() => setError(false), 3000);
      return;
    }

    // Crear ID único
    const id = generarIdUnico(nuevaCategoria.nombre);

    // Crear nueva categoría
    const nuevaCat = {
      id,
      nombre: nuevaCategoria.nombre.trim(),
      icono: IconoGasto, // Usar icono genérico para categorías personalizadas
      color: nuevaCategoria.color,
    };

    // Actualizar lista de categorías
    setCategorias([...categorias, nuevaCat]);

    // Limpiar formulario y cerrar modal
    setNuevaCategoria({
      nombre: "",
      color: "bg-gray-100 text-gray-800",
    });
    setModalAbierto(false);
  };

  // Función para eliminar una categoría
  const eliminarCategoria = (categoriaId) => {
    // Verificar si hay gastos asociados a esta categoría
    const tieneGastos = gastosPorCategoria[categoriaId]?.cantidad > 0;

    if (tieneGastos) {
      // Si hay gastos asociados, no permitir eliminar la categoría
      const categoria = categorias.find((c) => c.id === categoriaId);
      const cantidadGastos = gastosPorCategoria[categoriaId].cantidad;
      const totalGastos = gastosPorCategoria[categoriaId].total;

      Swal.fire({
        title: "No se puede eliminar",
        html: `
        <p>La categoría <strong>${
          categoria?.nombre
        }</strong> tiene <strong>${cantidadGastos} gasto${
          cantidadGastos !== 1 ? "s" : ""
        }</strong> asociados por un total de ${cantidad(totalGastos)}.</p>
        <p class="mt-2">Para eliminar esta categoría, primero debes cambiar la categoría de los gastos asociados o eliminarlos.</p>
        <div class="mt-4 flex flex-col space-y-2">
          <button id="ver-detalles" class="w-full px-4 py-2 bg-blue-100 text-blue-800 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors">
            Ver detalles de los gastos
          </button>
          <button id="ir-gastos" class="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">
            Ir a gestión de gastos
          </button>
        </div>
      `,
        icon: "warning",
        showConfirmButton: true,
        confirmButtonText: "Entendido",
        confirmButtonColor: "#3b82f6",
        showCancelButton: false,
        didOpen: () => {
          // Agregar manejadores de eventos a los botones personalizados
          document
            .getElementById("ver-detalles")
            .addEventListener("click", () => {
              // Cerrar el diálogo actual
              Swal.close();
              // Mostrar detalles de la categoría
              setCategoriaSeleccionada(categoria);
            });

          document.getElementById("ir-gastos").addEventListener("click", () => {
            // Aquí podrías navegar a la página de gestión de gastos
            // Por ejemplo, utilizando navegación programática si usas React Router
            // navigate('/gastos');

            // O simplemente mostrar un mensaje para indicar cómo acceder a la gestión de gastos
            Swal.fire({
              title: "Gestión de gastos",
              text: "Dirígete a la sección de gastos para editar o eliminar los gastos asociados a esta categoría.",
              icon: "info",
              confirmButtonColor: "#3b82f6",
            });
          });
        },
      });
      return;
    }

    // Si no tiene gastos, confirmar eliminación
    Swal.fire({
      title: "¿Eliminar categoría?",
      text: `¿Estás seguro de eliminar la categoría "${
        categorias.find((c) => c.id === categoriaId)?.nombre
      }"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        eliminarCategoriaConfirmada(categoriaId);
      }
    });
  };

  // Función para completar la eliminación una vez confirmada
  const eliminarCategoriaConfirmada = (categoriaId) => {
    // Verificar si es una categoría predefinida
    const categoriaActual = categorias.find((cat) => cat.id === categoriaId);
    if (!categoriaActual) {
      console.error(`No se encontró la categoría con ID: ${categoriaId}`);
      return;
    }

    const esPredefinida = categoriaActual._esPredefinida === true;
    const nombreCategoria = categoriaActual.nombre;

    // Contar categorías predefinidas actuales
    const categoriasPredefinidaActuales = categorias.filter(
      (cat) => cat._esPredefinida === true
    );

    // Impedir eliminar si es la última categoría predefinida
    if (esPredefinida && categoriasPredefinidaActuales.length <= 1) {
      Swal.fire({
        title: "No se puede eliminar",
        text: "Debe existir al menos una categoría predefinida",
        icon: "error",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    console.log(`Eliminando categoría: ${nombreCategoria} (${categoriaId})`);

    // 1. Guardar el ID en el registro de eliminados
    guardarEliminados("categorias", categoriaId);

    // 2. Eliminar la categoría del array local
    const nuevasCategorias = categorias.filter((cat) => cat.id !== categoriaId);
    setCategorias(nuevasCategorias);

    // 3. Actualizar el localStorage con la nueva lista de categorías
    localStorage.setItem("categorias", JSON.stringify(nuevasCategorias));
    console.log(
      `Categoría eliminada. Quedan ${nuevasCategorias.length} categorías`
    );

    // 4. Eliminar entradas redundantes si existen
    // Esto es para limpiar el elementosEliminados si existe (que es redundante)
    try {
      const elementosEliminados =
        JSON.parse(localStorage.getItem("elementosEliminados")) || {};
      if (elementosEliminados.categorias) {
        if (!elementosEliminados.categorias.includes(categoriaId)) {
          elementosEliminados.categorias.push(categoriaId);
          localStorage.setItem(
            "elementosEliminados",
            JSON.stringify(elementosEliminados)
          );
        }
      }
    } catch (e) {
      console.error("Error al actualizar elementosEliminados:", e);
    }

    // 5. Si la categoría eliminada estaba seleccionada, deseleccionarla
    if (categoriaSeleccionada?.id === categoriaId) {
      setCategoriaSeleccionada(null);
    }

    // 6. Notificar éxito
    Swal.fire({
      title: "Categoría eliminada",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Categorías
        </h2>
        <div>
          <button
            onClick={() => setModalAbierto(true)}
            className="w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center sm:justify-start"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Nueva Categoría
          </button>
        </div>
      </div>

      {/* Tarjetas de categorías */}
      <div className="grid grid-cols-1 gap-3 sm:gap-6">
        {categorias.map((categoria) => {
          const stats = gastosPorCategoria[categoria.nombre] || {
            total: 0,
            cantidad: 0,
            porcentaje: 0,
          };

          return (
            <div
              key={categoria.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                        categoria.color.split(" ")[0]
                      }`}
                    >
                      <img
                        src={categoria.icono}
                        alt={categoria.nombre}
                        className="w-4 h-4 sm:w-6 sm:h-6"
                      />
                    </div>
                    <h3 className="ml-2 sm:ml-3 text-base sm:text-lg font-medium text-gray-900 truncate">
                      {categoria.nombre}
                    </h3>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs sm:text-sm font-medium text-gray-500 mr-2">
                      {stats.cantidad} gastos
                    </span>

                    {/* Botón eliminar*/}
                    <button
                      onClick={() => eliminarCategoria(categoria.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                      title="Eliminar categoría"
                    >
                      <svg
                        className="h-4 w-4 sm:h-5 sm:w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-3 sm:mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium text-gray-500">
                      Total gastado
                    </span>
                    <span className="text-sm sm:text-lg font-semibold text-gray-900">
                      {cantidad(stats.total)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="overflow-hidden h-1.5 sm:h-2 text-xs flex rounded bg-gray-200">
                      <div
                        style={{ width: `${stats.porcentaje}%` }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                          categoria.color.split(" ")[0]
                        }`}
                      ></div>
                    </div>
                    <div className="text-right mt-1">
                      <span className="text-xs font-medium text-gray-500">
                        {stats.porcentaje}% del total
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 sm:mt-4">
                  <button
                    onClick={() =>
                      setCategoriaSeleccionada(
                        categoriaSeleccionada?.id === categoria.id
                          ? null
                          : categoria
                      )
                    }
                    className="w-full py-1.5 sm:py-2 px-3 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {categoriaSeleccionada?.id === categoria.id
                      ? "Ocultar detalles"
                      : "Ver detalles"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detalles de categoría seleccionada */}
      {categoriaSeleccionada && (
        <div className="mt-4 sm:mt-8 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                  categoriaSeleccionada.color.split(" ")[0]
                }`}
              >
                <img
                  src={categoriaSeleccionada.icono}
                  alt={categoriaSeleccionada.nombre}
                  className="w-4 h-4 sm:w-6 sm:h-6"
                />
              </div>
              <h3 className="ml-2 sm:ml-3 text-base sm:text-lg font-medium text-gray-900 truncate">
                Gastos en {categoriaSeleccionada.nombre}
              </h3>
            </div>
            <button
              onClick={() => setCategoriaSeleccionada(null)}
              className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100"
            >
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {gastosPorCategoria[categoriaSeleccionada.id]?.gastos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Concepto
                    </th>
                    <th
                      scope="col"
                      className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Fecha
                    </th>
                    <th
                      scope="col"
                      className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Monto
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {gastosPorCategoria[categoriaSeleccionada.id].gastos
                    .sort((a, b) => b.fecha - a.fecha) // Ordenar por fecha (más reciente primero)
                    .map((gasto) => {
                      // Formatear fecha
                      const fecha = new Date(gasto.fecha);
                      const formatoFecha = `${fecha.getDate()}/${
                        fecha.getMonth() + 1
                      }/${fecha.getFullYear()}`;

                      return (
                        <tr key={gasto.id} className="hover:bg-gray-50">
                          <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                            <div className="truncate max-w-32 sm:max-w-none">
                              {gasto.nombreG}
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            {formatoFecha}
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 text-right">
                            {cantidad(gasto.gasto)}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <th
                      scope="row"
                      colSpan="2"
                      className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-900"
                    >
                      Total {categoriaSeleccionada.nombre}
                    </th>
                    <td className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs sm:text-sm font-medium text-gray-900">
                      {cantidad(
                        gastosPorCategoria[categoriaSeleccionada.id]?.total || 0
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="py-8 sm:py-12 text-center">
              <p className="text-xs sm:text-sm text-gray-500">
                No hay gastos registrados en esta categoría
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal para agregar nueva categoría */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay de fondo */}
            <div
              className="fixed inset-0 transition-opacity"
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
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              {/* Botón cerrar */}
              <div className="absolute top-0 right-0 p-3 sm:p-4">
                <button
                  onClick={() => setModalAbierto(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
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
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3
                      className="text-xl sm:text-2xl leading-6 font-semibold text-gray-900 mb-4"
                      id="modal-headline"
                    >
                      Nueva Categoría
                    </h3>

                    {error && (
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
                            <p className="text-xs sm:text-sm text-red-700">
                              El nombre de la categoría es requerido y debe ser
                              único
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <form className="space-y-4">
                      <div>
                        <label
                          htmlFor="nombreCategoria"
                          className="block text-xs sm:text-sm font-medium text-gray-700"
                        >
                          Nombre de la Categoría
                        </label>
                        <input
                          type="text"
                          name="nombreCategoria"
                          id="nombreCategoria"
                          value={nuevaCategoria.nombre}
                          onChange={(e) =>
                            setNuevaCategoria({
                              ...nuevaCategoria,
                              nombre: e.target.value,
                            })
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                          placeholder="Ej: Transporte"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700">
                          Color
                        </label>
                        <div className="mt-2 grid grid-cols-5 gap-2">
                          {coloresDisponibles.map((color) => (
                            <button
                              key={color.id}
                              type="button"
                              onClick={() =>
                                setNuevaCategoria({
                                  ...nuevaCategoria,
                                  color: color.valor,
                                })
                              }
                              className={`w-full h-8 sm:h-10 rounded-md ${
                                color.valor
                              } flex items-center justify-center ${
                                nuevaCategoria.color === color.valor
                                  ? "ring-2 ring-offset-2 ring-blue-500"
                                  : ""
                              }`}
                              title={color.nombre}
                            >
                              {nuevaCategoria.color === color.valor && (
                                <svg
                                  className="h-4 w-4 sm:h-5 sm:w-5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setModalAbierto(false)}
                          className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={agregarCategoria}
                          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Guardar
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
