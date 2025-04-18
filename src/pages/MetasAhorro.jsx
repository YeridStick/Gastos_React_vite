import { useState, useEffect } from "react";
import { cantidad } from "../helpers/index";
import Swal from "sweetalert2";

import IconoCasa from "../assets/img/icono_casa.svg";
import IconoComida from "../assets/img/icono_comida.svg";
import IconoGasto from "../assets/img/icono_gastos.svg";
import IconoOcio from "../assets/img/icono_ocio.svg";
import IconoSalud from "../assets/img/icono_salud.svg";
import IconoEducacion from "../assets/img/icono_suscripciones.svg";

const generarIdUnico = (baseId, userId = "") => {
  const base = baseId.trim().replace(/\s+/g, "").toLowerCase();
  const timestamp = Date.now();
  const userPrefix = userId ? `${userId.substring(0, 8)}-` : "";

  return `${userPrefix}${base}-${timestamp}`;
};

const getNombreCategoria = (tipo) => {
  switch (tipo) {
    case "categorias":
      return "Categorías";
    // ... otros casos
    default:
      return tipo;
  }
};

export default function MetasAhorro({
  presupuesto,
  gastosState,
  ingresosExtra = [],
}) {
  // Estados
  const [metas, setMetas] = useState(
    JSON.parse(localStorage.getItem("MetasAhorro")) ?? []
  );
  const [nombreMeta, setNombreMeta] = useState("");
  const [montoMeta, setMontoMeta] = useState("");
  const [fechaObjetivo, setFechaObjetivo] = useState("");
  const [descripcionMeta, setDescripcionMeta] = useState("");
  const [disponibleMensual, setDisponibleMensual] = useState(0);
  const [metaEnEdicion, setMetaEnEdicion] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [nuevaCategoria, setNuevaCategoria] = useState({
    nombre: "",
    color: "bg-gray-100 text-gray-800",
  });
  const [modalAbierto, setModalAbierto] = useState(false);
  const [error, setError] = useState(false);

  const categoriasPredefinidas = [
    {
      baseId: "Comida",
      nombre: "Comida",
      icono: IconoComida,
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      baseId: "Casa",
      nombre: "Casa",
      icono: IconoCasa,
      color: "bg-blue-100 text-blue-800",
    },
    {
      baseId: "Ocio",
      nombre: "Ocio",
      icono: IconoOcio,
      color: "bg-purple-100 text-purple-800",
    },
    {
      baseId: "Salud",
      nombre: "Salud",
      icono: IconoSalud,
      color: "bg-red-100 text-red-800",
    },
    {
      baseId: "Educacion",
      nombre: "Educación",
      icono: IconoEducacion,
      color: "bg-indigo-100 text-indigo-800",
    },
    {
      baseId: "Otros",
      nombre: "Otros",
      icono: IconoGasto,
      color: "bg-gray-100 text-gray-800",
    },
  ];

  const coloresDisponibles = [
    { id: "green", nombre: "Verde", valor: "bg-green-100 text-green-800" },
    { id: "blue", nombre: "Azul", valor: "bg-blue-100 text-blue-800" },
    { id: "red", nombre: "Rojo", valor: "bg-red-100 text-red-800" },
    {
      id: "yellow",
      nombre: "Amarillo",
      valor: "bg-yellow-100 text-yellow-800",
    },
    { id: "purple", nombre: "Morado", valor: "bg-purple-100 text-purple-800" },
    { id: "indigo", nombre: "Índigo", valor: "bg-indigo-100 text-indigo-800" },
    { id: "pink", nombre: "Rosa", valor: "bg-pink-100 text-pink-800" },
    { id: "orange", nombre: "Naranja", valor: "bg-orange-100 text-orange-800" },
    { id: "teal", nombre: "Verde Azulado", valor: "bg-teal-100 text-teal-800" },
    { id: "gray", nombre: "Gris", valor: "bg-gray-100 text-gray-800" },
  ];

  // Calcular disponible mensual
  useEffect(() => {
    // Promedio de gastos mensuales
    const calcularDisponibleMensual = () => {
      // Agrupar gastos por mes
      const gastosPorMes = {};
      gastosState.forEach((gasto) => {
        const fecha = new Date(gasto.fecha);
        const mesAño = `${fecha.getMonth()}-${fecha.getFullYear()}`;

        if (!gastosPorMes[mesAño]) {
          gastosPorMes[mesAño] = 0;
        }

        gastosPorMes[mesAño] += gasto.gasto;
      });

      // Calcular promedio si hay datos
      if (Object.keys(gastosPorMes).length > 0) {
        const totalGastos = Object.values(gastosPorMes).reduce(
          (a, b) => a + b,
          0
        );
        const promedioGastosMensual =
          totalGastos / Object.keys(gastosPorMes).length;

        // Disponible mensual = presupuesto - promedio de gastos
        const disponible = presupuesto - promedioGastosMensual;
        setDisponibleMensual(disponible);
      } else {
        // Si no hay gastos registrados, todo el presupuesto está disponible
        setDisponibleMensual(presupuesto);
      }
    };

    calcularDisponibleMensual();
  }, [presupuesto, gastosState]);

  // Persistir metas en localStorage
  useEffect(() => {
    localStorage.setItem("MetasAhorro", JSON.stringify(metas));
  }, [metas]);

  useEffect(() => {
    const categoriasGuardadas = localStorage.getItem("categorias");
    const userId = localStorage.getItem("userEmail") || "local";

    if (categoriasGuardadas) {
      // Si hay categorías guardadas, las usamos
      setCategorias(JSON.parse(categoriasGuardadas));
    } else {
      // Si no hay categorías guardadas, generamos IDs únicos para las predefinidas
      const categoriasConIdUnico = categoriasPredefinidas.map((cat) => ({
        ...cat,
        id: generarIdUnico(cat.baseId, userId),
        _esPredefinida: true, // Marca interna para saber que es predefinida
      }));

      setCategorias(categoriasConIdUnico);
      localStorage.setItem("categorias", JSON.stringify(categoriasConIdUnico));
    }
  }, []);

  // Función para añadir nueva meta
  const agregarMeta = (e) => {
    e.preventDefault();

    // Validaciones
    if ([nombreMeta, montoMeta, fechaObjetivo].includes("") || montoMeta <= 0) {
      Swal.fire({
        title: "Error",
        text: "Todos los campos son obligatorios y el monto debe ser mayor a 0",
        icon: "error",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    const fechaActual = new Date();
    const fechaObj = new Date(fechaObjetivo);

    if (fechaObj <= fechaActual) {
      Swal.fire({
        title: "Error",
        text: "La fecha objetivo debe ser posterior a la fecha actual",
        icon: "error",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    // Calcular días restantes
    const diffTiempo = fechaObj.getTime() - fechaActual.getTime();
    const diffDias = Math.ceil(diffTiempo / (1000 * 60 * 60 * 24));

    // Calcular montos recomendados de ahorro
    const ahorroSemanal = Number(montoMeta) / (diffDias / 7);
    const ahorroMensual = Number(montoMeta) / (diffDias / 30);
    const ahorroAnual = Number(montoMeta) / (diffDias / 365);

    // Crear la meta
    const nuevaMeta = {
      id: metaEnEdicion ? metaEnEdicion.id : Date.now().toString(),
      nombre: nombreMeta,
      monto: Number(montoMeta),
      fechaObjetivo,
      descripcion: descripcionMeta,
      creada: metaEnEdicion ? metaEnEdicion.creada : Date.now(),
      ahorroAcumulado: metaEnEdicion ? metaEnEdicion.ahorroAcumulado : 0,
      ahorroSemanal,
      ahorroMensual,
      ahorroAnual,
      diasRestantes: diffDias,
      completada: false,
    };

    // Actualizar estado
    if (metaEnEdicion) {
      // Editar meta existente
      const metasActualizadas = metas.map((meta) =>
        meta.id === metaEnEdicion.id ? nuevaMeta : meta
      );
      setMetas(metasActualizadas);

      Swal.fire({
        title: "Meta Actualizada",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      // Agregar nueva meta
      setMetas([...metas, nuevaMeta]);

      Swal.fire({
        title: "Meta Agregada",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    }

    // Limpiar formulario
    resetearFormulario();
  };

  // Resetear formulario
  const resetearFormulario = () => {
    setNombreMeta("");
    setMontoMeta("");
    setFechaObjetivo("");
    setDescripcionMeta("");
    setMetaEnEdicion(null);
  };

  // Editar meta
  const handleEditar = (meta) => {
    setMetaEnEdicion(meta);
    setNombreMeta(meta.nombre);
    setMontoMeta(meta.monto);
    setFechaObjetivo(meta.fechaObjetivo);
    setDescripcionMeta(meta.descripcion || "");

    // Scroll al formulario
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Eliminar meta
  const handleEliminar = (metaId) => {
    Swal.fire({
      title: "¿Eliminar meta?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        // Guardar el ID de la meta eliminada en localStorage
        const eliminados = JSON.parse(localStorage.getItem("eliminados")) || {};
        if (!eliminados["MetasAhorro"]) {
          eliminados["MetasAhorro"] = [];
        }
        eliminados["MetasAhorro"].push(metaId);
        localStorage.setItem("eliminados", JSON.stringify(eliminados));

        // Actualizar el estado de las metas
        const metasActualizadas = metas.filter((meta) => meta.id !== metaId);
        setMetas(metasActualizadas);

        Swal.fire({
          title: "Meta eliminada",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  // Formatear fecha
  const formatearFecha = (fechaString) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Calcular progreso de meta
  const calcularPorcentaje = (meta) => {
    return Math.min(100, Math.round((meta.ahorroAcumulado / meta.monto) * 100));
  };

  // Obtener clase de color según factibilidad
  const getClaseFactibilidad = (meta) => {
    // Si la meta ya está completada, retornar verde
    if (meta.completada) return "text-green-600";

    // Calcular si es factible con el ahorro disponible mensual
    if (meta.ahorroMensual > disponibleMensual) {
      return "text-red-600"; // No factible
    } else if (meta.ahorroMensual > disponibleMensual * 0.5) {
      return "text-yellow-600"; // Difícil pero posible
    } else {
      return "text-green-600"; // Factible
    }
  };

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
  
    // Verificar si coincide con alguna categoría predefinida para usar su icono
    const tipoCategoria = categoriasPredefinidas.find(
      (cat) =>
        cat.nombre.toLowerCase() === nuevaCategoria.nombre.trim().toLowerCase()
    );
    
    // Determinar el icono apropiado
    let icono = IconoGasto; // Icono por defecto
    if (tipoCategoria) {
      icono = tipoCategoria.icono;
    }
  
    // Crear nueva categoría
    const nuevaCat = {
      id: generarIdUnico(
        nuevaCategoria.nombre,
        localStorage.getItem("userEmail") || "local"
      ),
      nombre: nuevaCategoria.nombre.trim(),
      icono: icono,
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
  

  const eliminarCategoria = (categoriaId) => {
    const categoria = categorias.find((cat) => cat.id === categoriaId);

    if (categoria._esPredefinida) {
      Swal.fire({
        title: "No se puede eliminar",
        text: "Esta es una categoría predefinida y no puede ser eliminada.",
        icon: "error",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    Swal.fire({
      title: "¿Eliminar categoría?",
      text: `¿Estás seguro de eliminar la categoría "${categoria.nombre}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        // Guardar el ID de la categoría eliminada en el historial
        guardarEliminados("categorias", categoriaId);

        // Eliminar la categoría
        const nuevasCategorias = categorias.filter(
          (cat) => cat.id !== categoriaId
        );
        setCategorias(nuevasCategorias);

        Swal.fire({
          title: "Categoría eliminada",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  const guardarEliminados = (tipo, id) => {
    // Asegurarse de que estamos guardando solo el ID
    const idAGuardar = typeof id === "object" && id.id ? id.id : id;

    // Obtener los datos actuales de "eliminados" en localStorage
    const eliminados = JSON.parse(localStorage.getItem("eliminados")) || {};

    // Si no existe el tipo, inicializarlo como un array vacío
    if (!eliminados[tipo]) {
      eliminados[tipo] = [];
    }

    // Agregar solo el ID al array correspondiente
    eliminados[tipo].push(idAGuardar);

    // Guardar los datos actualizados en localStorage
    localStorage.setItem("eliminados", JSON.stringify(eliminados));

    console.log(`ID guardado en eliminados (${tipo}): ${idAGuardar}`);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Metas de Ahorro
        </h2>
        <button
          onClick={() => setModalAbierto(true)}
          className="px-3 py-1.5 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
        >
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4 mr-1"
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

      {/* Formulario para agregar/editar meta */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
          {metaEnEdicion ? "Editar Meta" : "Nueva Meta de Ahorro"}
        </h3>

        <form onSubmit={agregarMeta} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            <div>
              <label
                htmlFor="nombre-meta"
                className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
              >
                Nombre de la Meta
              </label>
              <input
                id="nombre-meta"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Ej: Nuevo Celular, Vacaciones..."
                value={nombreMeta}
                onChange={(e) => setNombreMeta(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="monto-meta"
                className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
              >
                Monto Objetivo
              </label>
              <input
                id="monto-meta"
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="¿Cuánto necesitas ahorrar?"
                value={montoMeta}
                onChange={(e) => setMontoMeta(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="fecha-objetivo"
                className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
              >
                Fecha Objetivo
              </label>
              <input
                id="fecha-objetivo"
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={fechaObjetivo}
                onChange={(e) => setFechaObjetivo(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="descripcion-meta"
                className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
              >
                Descripción (opcional)
              </label>
              <input
                id="descripcion-meta"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Más detalles sobre esta meta..."
                value={descripcionMeta}
                onChange={(e) => setDescripcionMeta(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 sm:space-x-3 pt-2">
            {metaEnEdicion && (
              <button
                type="button"
                onClick={resetearFormulario}
                className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {metaEnEdicion ? "Guardar" : "Crear Meta"}
            </button>
          </div>
        </form>
      </div>

      {/* Modal para agregar nueva categoría - Añadir esto al final de tu componente */}
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

      {/* Información del presupuesto disponible */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
          Capacidad de Ahorro
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
          Según tus gastos promedio, tienes aproximadamente{" "}
          {cantidad(disponibleMensual)} disponibles cada mes para ahorrar.
        </p>

        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{
                width: `${Math.min(
                  100,
                  (disponibleMensual / presupuesto) * 100
                )}%`,
              }}
            ></div>
          </div>
          <span className="ml-2 sm:ml-3 text-xs sm:text-sm font-medium text-gray-700">
            {Math.round((disponibleMensual / presupuesto) * 100)}%
          </span>
        </div>
      </div>

      {/* Listado de metas */}
      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-base sm:text-lg font-medium text-gray-900">
          Tus Metas de Ahorro
        </h3>

        {metas.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {metas.map((meta) => {
              // Calcular progreso
              const porcentaje = calcularPorcentaje(meta);
              const clasesFactibilidad = getClaseFactibilidad(meta);

              return (
                <div
                  key={meta.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-3 sm:p-5 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
                      <h4 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                        {meta.nombre}
                      </h4>
                      <span
                        className={`font-medium ${
                          meta.completada
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        } px-2 py-0.5 rounded-full text-xs inline-block sm:inline w-fit`}
                      >
                        {meta.completada
                          ? "Completada"
                          : `${meta.diasRestantes} días`}
                      </span>
                    </div>

                    {meta.descripcion && (
                      <p className="mt-1 text-xs sm:text-sm text-gray-600 line-clamp-2">
                        {meta.descripcion}
                      </p>
                    )}
                  </div>

                  <div className="px-3 sm:px-5 py-3 sm:py-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs sm:text-sm font-medium text-gray-700">
                        Progreso:
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-gray-900">
                        {cantidad(meta.ahorroAcumulado)} de{" "}
                        {cantidad(meta.monto)} ({porcentaje}%)
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2.5 mb-3 sm:mb-4">
                      <div
                        className={`${
                          meta.completada ? "bg-green-600" : "bg-blue-600"
                        } h-1.5 sm:h-2.5 rounded-full`}
                        style={{ width: `${porcentaje}%` }}
                      ></div>
                    </div>

                    <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-3 sm:mb-4">
                      <div className="bg-gray-50 p-1.5 sm:p-2 rounded text-center">
                        <p className="text-xs text-gray-500 truncate">
                          Semanal
                        </p>
                        <p
                          className={`text-xs sm:text-sm font-medium ${clasesFactibilidad} truncate`}
                        >
                          {cantidad(meta.ahorroSemanal)}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-1.5 sm:p-2 rounded text-center">
                        <p className="text-xs text-gray-500 truncate">
                          Mensual
                        </p>
                        <p
                          className={`text-xs sm:text-sm font-medium ${clasesFactibilidad} truncate`}
                        >
                          {cantidad(meta.ahorroMensual)}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-1.5 sm:p-2 rounded text-center">
                        <p className="text-xs text-gray-500 truncate">Anual</p>
                        <p
                          className={`text-xs sm:text-sm font-medium ${clasesFactibilidad} truncate`}
                        >
                          {cantidad(meta.ahorroAnual)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-2 border-t border-gray-100">
                      <div className="text-xs sm:text-sm">
                        <span className="text-gray-500">Fecha límite: </span>
                        <span className="font-medium">
                          {formatearFecha(meta.fechaObjetivo)}
                        </span>
                      </div>

                      <div className="flex justify-between sm:justify-end sm:space-x-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditar(meta)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="Editar meta"
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEliminar(meta.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Eliminar meta"
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
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-xs sm:text-sm text-gray-500">
              No has creado ninguna meta de ahorro todavía.
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              ¡Crea tu primera meta para alcanzar tus objetivos financieros!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
