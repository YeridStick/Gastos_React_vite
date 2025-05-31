import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { cantidad } from "../../helpers/index";
import Swal from "sweetalert2";

// Categorías predefinidas
const categoriasPredefinidas = [
  {
    id: "Otros",
    nombre: "Otros",
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

  const generarIdUnico = (baseId, userId = "") => {
    // Validar que baseId sea un string válido
    if (!baseId || typeof baseId !== "string") {
      console.error("baseId inválido:", baseId);
      return `categoria-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
    }

    const base = baseId.trim().replace(/\s+/g, "").toLowerCase();
    const timestamp = Date.now();
    const userPrefix = userId ? `${userId.substring(0, 8)}-` : "";

    return `${userPrefix}${base}-${timestamp}`;
  };

  useEffect(() => {
    const categoriasGuardadas = localStorage.getItem("categorias");
    const userId = localStorage.getItem("userEmail") || "local";
    const eliminadosGuardados =
      JSON.parse(localStorage.getItem("eliminados")) || {};
    const categoriasEliminadas = eliminadosGuardados.categorias || [];

    console.log("Categorías en lista de eliminados:", categoriasEliminadas);

    if (categoriasGuardadas) {
      try {
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
        if (categoriasParseadas.length > 0) {
          setCategorias(categoriasParseadas);
        } else {
          // Si no quedan categorías, inicializar con las predefinidas
          inicializarCategoriasPredefinidas(userId);
        }

        // Actualizar localStorage solo si hay cambios en las categorías
        if (categoriasParseadas.length !== cantidadOriginal) {
          console.log("Actualizando localStorage con categorías filtradas");
          localStorage.setItem(
            "categorias",
            JSON.stringify(categoriasParseadas)
          );
        }
      } catch (error) {
        console.error("Error al procesar categorías guardadas:", error);
        inicializarCategoriasPredefinidas(userId);
      }
    } else {
      // Si no hay categorías guardadas, inicializar con las predefinidas
      inicializarCategoriasPredefinidas(userId);
    }
  }, []);

  // Función para inicializar categorías predefinidas
  const inicializarCategoriasPredefinidas = (userId) => {
    if (categoriasPredefinidas.length === 0) {
      // No inicializar nada si no hay predefinidas
      setCategorias([]);
      localStorage.setItem("categorias", JSON.stringify([]));
      return;
    }
    const categoriasConIdUnico = categoriasPredefinidas.map((cat) => ({
      ...cat,
      id: generarIdUnico(cat.nombre, userId),
      _esPredefinida: true,
    }));

    setCategorias(categoriasConIdUnico);
    localStorage.setItem("categorias", JSON.stringify(categoriasConIdUnico));
    console.log(
      "Categorías predefinidas inicializadas:",
      categoriasConIdUnico.length
    );
  };

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
      const totalGeneral = gastosState.reduce((sum, gasto) => sum + Number(gasto.gasto), 0);

      // Inicializar objeto para almacenar gastos por categoría
      const gastosPorCat = {};

      // Incluir todas las categorías conocidas, incluso las que no tienen gastos
      categorias.forEach((cat) => {
        gastosPorCat[cat.nombre] = {
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
          gastosPorCat[categoria].total += Number(gasto.gasto);
          gastosPorCat[categoria].cantidad += 1;
          gastosPorCat[categoria].gastos.push(gasto);
        } else {
          gastosPorCat[categoria] = {
            total: Number(gasto.gasto),
            cantidad: 1,
            porcentaje: 0,
            gastos: [gasto],
          };
        }
      });

      // Calcular porcentajes
      Object.keys(gastosPorCat).forEach((cat) => {
        const totalCategoria = gastosPorCat[cat].total;
        gastosPorCat[cat].porcentaje = totalGeneral > 0 ? Math.round((totalCategoria / totalGeneral) * 100) : 0;
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
    <>
      {categorias.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center flex flex-col items-center">
          <svg
            className="h-10 w-10 text-blue-400 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            ¡Crea una categoría primero!
          </h3>
          <p className="text-gray-500 mb-4">
            Para poder registrar gastos, primero necesitas crear al menos una
            categoría.
          </p>
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
      ) : (
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

          {/* Mensaje cuando no hay categorías */}
          {categorias.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-500 mb-4">No hay categorías creadas</p>
              <button
                onClick={() => setModalAbierto(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Crear primera categoría
              </button>
            </div>
          ) : (
            /* Tarjetas de categorías */
            <div className="grid grid-cols-1 gap-3 sm:gap-6">
              {categorias.map((categoria) => {
                const totalCategoria = gastosState
                  .filter(g => g.categoria === categoria.nombre)
                  .reduce((acc, g) => acc + Number(g.gasto), 0);

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
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              categoria.color.split(" ")[0]
                            }`}
                          />
                          <h3 className="text-base sm:text-lg font-medium text-gray-900">
                            {categoria.nombre}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            {stats.cantidad} gastos
                          </span>
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
                      <div className="mt-4">
                        <div className="flex items-center justify-end mb-2">
                          
                          <div className="flex items-end justify-end gap-1">
                            <span className="text-2xl font-bold text-gray-900">
                              {new Intl.NumberFormat('es-CO').format(Number(totalCategoria))}
                            </span>
                            <span className="text-sm text-gray-400 font-medium">COP</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                          <div
                            className={`${categoria.color?.split(' ')[0] || 'bg-blue-600'} h-1.5 rounded-full`}
                            style={{ width: `${Math.min(100, Math.max(0, stats.porcentaje))}%` }}
                          ></div>
                        </div>
                        <div className="text-right mt-1">
                          <span className="text-xs font-medium text-gray-500">
                            {Math.min(100, Math.max(0, stats.porcentaje))}% del total
                          </span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <button
                          onClick={() =>
                            setCategoriaSeleccionada(
                              categoriaSeleccionada?.id === categoria.id
                                ? null
                                : categoria
                            )
                          }
                          className="w-full py-1.5 sm:py-2 px-3 border border-gray-200 rounded-md text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
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
          )}

          {/* Detalles de categoría seleccionada */}
          {categoriaSeleccionada && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Overlay Background */}
                <div
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                  onClick={() => setCategoriaSeleccionada(null)}
                ></div>

                {/* Modal Container */}
                <div className="relative inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 rounded-xl ${
                          categoriaSeleccionada.color.split(" ")[0]
                        } flex items-center justify-center shadow-lg`}
                      >
                        <span className="text-xl font-semibold text-white">
                          {categoriaSeleccionada.nombre.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {categoriaSeleccionada.nombre}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {gastosPorCategoria[categoriaSeleccionada.nombre]
                            ?.cantidad || 0}{" "}
                          gastos registrados
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setCategoriaSeleccionada(null)}
                      className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition-colors"
                    >
                      <svg
                        className="h-6 w-6"
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

                  {/* Content */}
                  <div className="space-y-6">
                    {gastosPorCategoria[categoriaSeleccionada.nombre]?.gastos
                      .length > 0 ? (
                      <>
                        {/* Resumen Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl shadow-sm">
                            <p className="text-sm font-medium text-blue-600">
                              Total Gastado
                            </p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                              {new Intl.NumberFormat('es-CO').format(Number(gastosPorCategoria[categoriaSeleccionada.nombre]?.total || 0))} COP
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl shadow-sm">
                            <p className="text-sm font-medium text-purple-600">
                              Porcentaje del Total
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`${categoriaSeleccionada.color?.split(' ')[0] || 'bg-purple-600'} h-1.5 rounded-full`}
                                  style={{ width: `${gastosPorCategoria[categoriaSeleccionada.nombre]?.porcentaje || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-xl font-bold text-purple-900">
                                {gastosPorCategoria[categoriaSeleccionada.nombre]?.porcentaje || 0}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Lista de Gastos */}
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
                          {gastosPorCategoria[categoriaSeleccionada.nombre].gastos
                            .sort((a, b) => b.fecha - a.fecha)
                            .map((gasto) => {
                              const fecha = new Date(gasto.fecha);
                              const formatoFecha = `${fecha.getDate()}/${
                                fecha.getMonth() + 1
                              }/${fecha.getFullYear()}`;

                              return (
                                <div
                                  key={gasto.id}
                                  className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {gasto.nombreG}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {formatoFecha}
                                    </p>
                                  </div>
                                  <div className="ml-4 flex-shrink-0">
                                    <p className="text-sm font-semibold text-gray-900">
                                      {cantidad(gasto.gasto)}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                          <svg
                            className="h-8 w-8 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-500">
                          No hay gastos registrados en esta categoría
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setCategoriaSeleccionada(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal para agregar nueva categoría */}
          {/* Improved Responsive Modal for New Category */}
          {modalAbierto && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
                {/* Overlay Background */}
                <div
                  className="fixed inset-0 bg-black/40 transition-opacity"
                  onClick={() => setModalAbierto(false)}
                ></div>

                {/* Modal Container */}
                <div className="relative w-full max-w-md mx-auto transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                  {/* Close Button */}
                  <button
                    onClick={() => setModalAbierto(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <svg
                      className="h-6 w-6"
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

                  {/* Modal Content */}
                  <div className="p-6 space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 text-center">
                      Nueva Categoría
                    </h3>

                    {/* Error Message */}
                    {error && (
                      <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-md">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-3">
                            <svg
                              className="h-5 w-5 text-red-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <p className="text-sm text-red-700">
                            El nombre de la categoría es requerido y debe ser único
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Category Name Input */}
                    <div>
                      <label
                        htmlFor="nombreCategoria"
                        className="block text-sm font-medium text-gray-700 mb-2"
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
                        className="block w-full rounded-md border-gray-300 shadow-sm 
                  focus:border-blue-500 focus:ring-blue-500 
                  text-sm py-2.5 px-3"
                        placeholder="Ej: Transporte"
                      />
                    </div>

                    {/* Color Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color
                      </label>
                      <div className="grid grid-cols-5 gap-2">
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
                            className={`aspect-square rounded-md ${color.valor} 
                        flex items-center justify-center 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                        ${
                          nuevaCategoria.color === color.valor
                            ? "ring-2 ring-blue-500"
                            : "hover:opacity-80"
                        }`}
                            title={color.nombre}
                          >
                            {nuevaCategoria.color === color.valor && (
                              <svg
                                className="h-5 w-5 text-white"
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

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => setModalAbierto(false)}
                        className="flex-1 py-2.5 border border-gray-300 rounded-md 
                  text-sm font-medium text-gray-700 
                  hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={agregarCategoria}
                        className="flex-1 py-2.5 bg-blue-600 text-white 
                  rounded-md text-sm font-medium 
                  hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

Categorias.propTypes = {
  gastosState: PropTypes.arrayOf(
    PropTypes.shape({
      gasto: PropTypes.number.isRequired,
      categoria: PropTypes.string.isRequired,
      nombreG: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired,
      fecha: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
    })
  ).isRequired,
};
