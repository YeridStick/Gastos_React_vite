import { useEffect, useState } from "react";
import Swal from "sweetalert2";

// Iconos importados (usa los que ya tienes en tu aplicación)
import IconoGasto from "../assets/img/icono_gastos.svg";
import IconoIngreso from "../assets/img/icono_ahorro.svg";
import IconoMeta from "../assets/img/icono_suscripciones.svg";
import IconoCategoria from "../assets/img/icono_casa.svg";
import IconoRecordatorio from "../assets/img/icono_ocio.svg";
import { useNavigate } from "react-router-dom";

const HistorialEliminados = () => {
    const navigate = useNavigate();
  const [eliminados, setEliminados] = useState({});
  const [elementosTotales, setElementosTotales] = useState(0);
  const [filtroActivo, setFiltroActivo] = useState("todos");
  const [mostrarDetalle, setMostrarDetalle] = useState(true);

  useEffect(() => {
    // Cargar los elementos eliminados desde localStorage
    const eliminadosGuardados =
      JSON.parse(localStorage.getItem("eliminados")) || {};
    setEliminados(eliminadosGuardados);

    // Calcular el total de elementos eliminados
    const total = Object.values(eliminadosGuardados).reduce(
      (sum, items) => sum + items.length,
      0
    );
    setElementosTotales(total);
  }, []);

  // Función para limpiar todo el historial
  const limpiarHistorial = () => {
    Swal.fire({
      title: "¿Estás seguro?",
      html: `
        <p>Esto eliminará todo el historial de elementos eliminados.</p>
        <p class="mt-2 text-red-500 font-medium">Asegúrate de haber sincronizado tus datos con el servidor antes de continuar.</p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, limpiar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    }).then((result) => {
      if (result.isConfirmed) {
        // Limpiar el historial en localStorage y el estado
        localStorage.setItem("eliminados", JSON.stringify({}));
        setEliminados({});
        setElementosTotales(0);
        Swal.fire({
          title: "Historial limpiado",
          text: "El historial de elementos eliminados ha sido limpiado.",
          icon: "success",
          confirmButtonColor: "#3b82f6",
        });
      }
    });
  };

  // Función para limpiar una categoría específica
  const limpiarCategoria = (tipo) => {
    Swal.fire({
      title: "¿Limpiar esta categoría?",
      html: `
        <p>Eliminar historial de la categoría "${getNombreCategoria(tipo)}"</p>
        <p class="mt-2 text-red-500 font-medium">Asegúrate de haber sincronizado tus datos con el servidor antes de continuar.</p>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, limpiar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    }).then((result) => {
      if (result.isConfirmed) {
        const nuevoEliminados = { ...eliminados };
        const itemsEliminados = nuevoEliminados[tipo].length;
        nuevoEliminados[tipo] = [];

        localStorage.setItem("eliminados", JSON.stringify(nuevoEliminados));
        setEliminados(nuevoEliminados);
        setElementosTotales(elementosTotales - itemsEliminados);

        Swal.fire({
          title: "Categoría limpiada",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  // Función para obtener el nombre legible de una categoría
  const getNombreCategoria = (tipo) => {
    switch (tipo) {
      case "ObjetosGastos":
        return "Gastos";
      case "IngresosExtra":
        return "Ingresos";
      case "MetasAhorro":
        return "Metas de Ahorro";
      case "categorias":
        return "Categorías";
      case "recordatorios":
        return "Recordatorios";
      default:
        return tipo;
    }
  };

  // Función para obtener el ícono correspondiente a cada categoría
  const getIconoCategoria = (tipo) => {
    switch (tipo) {
      case "ObjetosGastos":
        return IconoGasto;
      case "IngresosExtra":
        return IconoIngreso;
      case "MetasAhorro":
        return IconoMeta;
      case "categorias":
        return IconoCategoria;
      case "recordatorios":
        return IconoRecordatorio;
      default:
        return IconoGasto;
    }
  };

  // Función para formatear la fecha
  const formatearFecha = (timestamp) => {
    if (!timestamp) return "Fecha desconocida";

    const fecha = new Date(timestamp);
    return fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filtrar las categorías según el filtro activo
  const categoriasFiltradas = Object.entries(eliminados).filter(
    ([tipo, items]) => {
      if (filtroActivo === "todos") return items.length > 0;
      return tipo === filtroActivo && items.length > 0;
    }
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Historial de Elementos Eliminados
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {elementosTotales > 0
                  ? `${elementosTotales} elementos en total`
                  : "No hay elementos eliminados registrados"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setMostrarDetalle(!mostrarDetalle)}
                className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                title={mostrarDetalle ? "Ocultar detalles" : "Mostrar detalles"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {mostrarDetalle ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  )}
                </svg>
              </button>

              <button
                onClick={limpiarHistorial}
                disabled={elementosTotales === 0}
                className={`px-3 py-1.5 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors ${
                  elementosTotales === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Limpiar Todo
                </span>
              </button>
            </div>
          </div>

          {/* Filtro de categorías */}
          {elementosTotales > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setFiltroActivo("todos")}
                className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                  filtroActivo === "todos"
                    ? "bg-blue-100 text-blue-800 border border-blue-300"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
                }`}
              >
                Todos
              </button>

              {Object.entries(eliminados).map(
                ([tipo, items]) =>
                  items.length > 0 && (
                    <button
                      key={tipo}
                      onClick={() => setFiltroActivo(tipo)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center ${
                        filtroActivo === tipo
                          ? "bg-blue-100 text-blue-800 border border-blue-300"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
                      }`}
                    >
                      <img
                        src={getIconoCategoria(tipo)}
                        alt=""
                        className="w-3 h-3 mr-1"
                      />
                      {getNombreCategoria(tipo)} ({items.length})
                    </button>
                  )
              )}
            </div>
          )}
        </div>

        {/* Contenido del historial */}
        {elementosTotales > 0 ? (
          <div className={`p-4 sm:p-6 ${mostrarDetalle ? "block" : "hidden"}`}>
            <div className="space-y-6">
              {categoriasFiltradas.length > 0 ? (
                categoriasFiltradas.map(([tipo, items]) => (
                  <div key={tipo} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <img
                          src={getIconoCategoria(tipo)}
                          alt=""
                          className="w-5 h-5 mr-2"
                        />
                        <h3 className="text-sm font-medium text-gray-900">
                          {getNombreCategoria(tipo)}
                        </h3>
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 text-gray-700">
                          {items.length} elemento{items.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <button
                        onClick={() => limpiarCategoria(tipo)}
                        className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                        title="Limpiar esta categoría"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
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

                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                      <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden border rounded-lg">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                              <tr>
                                <th
                                  scope="col"
                                  className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                                >
                                  ID
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                                >
                                  Fecha eliminación
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {items.slice(0, 10).map((id, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 font-medium">
                                    {id.id || id}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {formatearFecha(id.timestamp)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {items.length > 10 && (
                      <div className="mt-2 text-center">
                        <p className="text-xs text-gray-500">
                          Mostrando 10 de {items.length} elementos
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                    ></path>
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No hay elementos para mostrar
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No se encontraron elementos eliminados{" "}
                    {filtroActivo !== "todos"
                      ? `en la categoría "${getNombreCategoria(filtroActivo)}"`
                      : ""}
                    .
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-6 text-center py-10">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              ></path>
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No hay elementos eliminados
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Cuando elimines elementos de tu aplicación, aparecerán en este
              historial.
            </p>
          </div>
        )}
      </div>

      {/* Información adicional con advertencia de sincronización */}
      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">
              Importante: Sincronización de datos
            </h3>
            <div className="mt-2 text-sm text-amber-700">
              <p className="mb-2">
                <strong>No limpies este historial sin antes:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Realizar una sincronización completa con el servidor</li>
                <li>Descargar una copia de seguridad de tus datos</li>
              </ul>
              <p className="mt-2">
                Eliminar el historial antes de sincronizar podría causar
                inconsistencias entre tus datos locales y los almacenados en el
                servidor, resultando en pérdida de información o problemas de
                sincronización.
              </p>
            </div>

            {/* Botones de acción */}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className="inline-flex items-center px-3 py-1.5 border border-amber-300 text-xs font-medium rounded-md text-amber-800 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                onClick={() => {
                  // Si tienes la función de sincronización disponible
                  if (window.syncNow && typeof window.syncNow === "function") {
                    window.syncNow();
                  } else {
                    // Si no está disponible, informar al usuario
                    Swal.fire({
                      title: "Sincronización",
                      text: "Navega al menú principal para sincronizar tus datos con el servidor.",
                      icon: "info",
                      confirmButtonColor: "#3b82f6",
                    });
                  }
                }}
              >
                <svg
                  className="mr-1.5 h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Sincronizar Ahora
              </button>

              <button
                className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-xs font-medium rounded-md text-blue-800 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => navigate('/gestion-datos')}
              >
                <svg
                  className="mr-1.5 h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                  />
                </svg>
                Exportar Datos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistorialEliminados;