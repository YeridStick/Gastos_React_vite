import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import RecordatorioFormulario from "../components/recordatorio/RecordatorioFormulario";
import ListaRecordatorios from "../components/recordatorio/ListaRecordatorios";
import PropTypes from "prop-types";

export default function RecordatoriosPage({ setGastosState }) {
  const [recordatorios, setRecordatorios] = useState([]);
  const [recordatorioEditar, setRecordatorioEditar] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [filtroActual, setFiltroActual] = useState("todos");

  // Cargar recordatorios y categorías al iniciar
  useEffect(() => {
    cargarRecordatorios();
    cargarCategorias();
  }, []);

  // Función para cargar recordatorios desde localStorage
  const cargarRecordatorios = () => {
    try {
      const recordatoriosGuardados = localStorage.getItem("recordatorios");
      if (recordatoriosGuardados) {
        const parsedRecordatorios = JSON.parse(recordatoriosGuardados);
        const recordatoriosActualizados = parsedRecordatorios.map(
          (recordatorio) => {
            // Asegurarse de que la fecha de vencimiento es un número (timestamp)
            let fechaVencimiento = recordatorio.fechaVencimiento;

            if (typeof fechaVencimiento === "string") {
              // Si es una fecha ISO (contiene T)
              if (fechaVencimiento.includes("T")) {
                fechaVencimiento = new Date(fechaVencimiento).getTime();
              }
              // Si es un string numérico
              else if (!isNaN(fechaVencimiento)) {
                fechaVencimiento = Number(fechaVencimiento);
              }
              // Si no se puede convertir, mantener la fecha original
            }

            // Comprobar si está vencido
            if (
              recordatorio.estado === "pendiente" &&
              fechaVencimiento < Date.now()
            ) {
              return {
                ...recordatorio,
                estado: "vencido",
                fechaVencimiento,
              };
            }

            return {
              ...recordatorio,
              fechaVencimiento,
            };
          }
        );

        setRecordatorios(recordatoriosActualizados);
        localStorage.setItem(
          "recordatorios",
          JSON.stringify(recordatoriosActualizados)
        );
      }
    } catch (error) {
      console.error("Error al cargar recordatorios:", error);
    }
  };

  // Función para cargar categorías desde localStorage
  const cargarCategorias = () => {
    try {
      const categoriasGuardadas = localStorage.getItem("categorias");
      setCategorias(JSON.parse(categoriasGuardadas));
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  };

  // Función para guardar un recordatorio
  const guardarRecordatorio = (nuevoRecordatorio) => {
    let recordatoriosActualizados;

    // Asegurarse de que la fecha de vencimiento es un timestamp (número)
    const recordatorioConFechaCorrecta = {
      ...nuevoRecordatorio,
      // Si la fecha viene como string ISO, convertirla a timestamp
      fechaVencimiento:
        typeof nuevoRecordatorio.fechaVencimiento === "string"
          ? new Date(nuevoRecordatorio.fechaVencimiento).getTime()
          : nuevoRecordatorio.fechaVencimiento,
      // Asegurarse que la fecha de creación es un timestamp
      fechaCreacion: nuevoRecordatorio.fechaCreacion || Date.now(),
    };

    console.log(
      "Guardando recordatorio con fecha:",
      new Date(recordatorioConFechaCorrecta.fechaVencimiento).toLocaleString()
    );

    if (recordatorioEditar) {
      // Actualizar recordatorio existente
      recordatoriosActualizados = recordatorios.map((recordatorio) =>
        recordatorio.id === recordatorioEditar.id
          ? recordatorioConFechaCorrecta
          : recordatorio
      );

      Swal.fire({
        title: "Recordatorio actualizado",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      // Crear nuevo recordatorio
      recordatoriosActualizados = [
        recordatorioConFechaCorrecta,
        ...recordatorios,
      ];

      Swal.fire({
        title: "Recordatorio guardado",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    }

    // Guardar en localStorage y actualizar estado
    setRecordatorios(recordatoriosActualizados);
    localStorage.setItem(
      "recordatorios",
      JSON.stringify(recordatoriosActualizados)
    );
    setRecordatorioEditar(null);
  };

  // Función para eliminar un recordatorio
  const eliminarRecordatorio = (recordatorioId) => {
    Swal.fire({
      title: "¿Eliminar recordatorio?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        // Actualizar el estado de los recordatorios
        const recordatoriosActualizados = recordatorios.filter(
          (recordatorio) => recordatorio.id !== recordatorioId
        );
        setRecordatorios(recordatoriosActualizados);

        // Guardar el ID del recordatorio eliminado en localStorage
        const eliminados = JSON.parse(localStorage.getItem("eliminados")) || {};
        if (!eliminados["recordatorios"]) {
          eliminados["recordatorios"] = [];
        }
        eliminados["recordatorios"].push(recordatorioId);
        localStorage.setItem("eliminados", JSON.stringify(eliminados));

        // Actualizar localStorage de recordatorios
        localStorage.setItem(
          "recordatorios",
          JSON.stringify(recordatoriosActualizados)
        );

        Swal.fire({
          title: "Recordatorio eliminado",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  // Función para marcar un recordatorio como completado
  const marcarCompletado = (id) => {
    // Encontrar el recordatorio que se va a marcar como completado
    const recordatorio = recordatorios.find((r) => r.id === id);

    if (!recordatorio) return;

    Swal.fire({
      title: "¿Marcar como completado?",
      text: `¿Has realizado el pago de "${recordatorio.titulo}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Sí, completar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        let recordatoriosActualizados = [...recordatorios];

        // Si es recurrente, crear el próximo recordatorio
        if (recordatorio.esRecurrente) {
          const proximaFecha = calcularProximaFecha(
            recordatorio.fechaVencimiento,
            recordatorio.frecuencia
          );

          const nuevoRecordatorio = {
            ...recordatorio,
            id: crypto.randomUUID(),
            fechaVencimiento: proximaFecha,
            fechaCreacion: Date.now(),
            estado: "pendiente",
          };

          recordatoriosActualizados.push(nuevoRecordatorio);
        }

        // Actualizar el estado del recordatorio actual
        recordatoriosActualizados = recordatoriosActualizados.map((r) =>
          r.id === id ? { ...r, estado: "completado" } : r
        );

        // Guardar cambios
        setRecordatorios(recordatoriosActualizados);
        localStorage.setItem(
          "recordatorios",
          JSON.stringify(recordatoriosActualizados)
        );

        // Preguntar si quiere registrar como gasto
        registrarComoGasto(recordatorio);
      }
    });
  };

  // Función para calcular la próxima fecha según la frecuencia
  const calcularProximaFecha = (fechaActual, frecuencia) => {
    // Asegurarse de que fechaActual es un objeto Date
    const fecha = new Date(fechaActual);

    switch (frecuencia) {
      case "diario":
        fecha.setDate(fecha.getDate() + 1);
        break;
      case "semanal":
        fecha.setDate(fecha.getDate() + 7);
        break;
      case "quincenal":
        fecha.setDate(fecha.getDate() + 15);
        break;
      case "mensual":
        fecha.setMonth(fecha.getMonth() + 1);
        break;
      case "bimestral":
        fecha.setMonth(fecha.getMonth() + 2);
        break;
      case "trimestral":
        fecha.setMonth(fecha.getMonth() + 3);
        break;
      case "semestral":
        fecha.setMonth(fecha.getMonth() + 6);
        break;
      case "anual":
        fecha.setFullYear(fecha.getFullYear() + 1);
        break;
      default:
        fecha.setMonth(fecha.getMonth() + 1);
    }

    // Devolver la fecha como timestamp (valor numérico)
    return fecha.getTime();
  };

  // Función para registrar como gasto en el presupuesto
  const registrarComoGasto = (recordatorio) => {
    Swal.fire({
      title: "Registrar como gasto",
      text: `¿Deseas registrar este pago como un gasto en tu presupuesto?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Sí, registrar",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          // Asegurarse de usar un timestamp numérico para la fecha
          const timestamp = Date.now();

          console.log("Creando gasto con timestamp:", timestamp);

          // Crear nuevo gasto
          const nuevoGasto = {
            id: crypto.randomUUID(),
            nombreG: recordatorio.titulo,
            gasto: recordatorio.monto,
            categoria: recordatorio.categoria,
            fecha: timestamp, // Usar el timestamp directo, sin conversión a string
            origen: "recordatorio",
            recordatorioId: recordatorio.id,
          };

          // Usar la función guardarGasto para registrar el gasto
          guardarGasto(nuevoGasto);
        } catch (error) {
          console.error("Error al registrar gasto:", error);
          Swal.fire({
            title: "Error",
            text: "No se pudo registrar el gasto. Inténtalo de nuevo.",
            icon: "error",
          });
        }
      }
    });
  };

  // Función para guardar un gasto
  const guardarGasto = (nuevoGasto) => {
    try {
      // Obtener los gastos actuales
      const gastosGuardados =
        JSON.parse(localStorage.getItem("ObjetosGastos")) || [];

      // Garantizar que la fecha es un string ISO
      nuevoGasto.fecha = new Date().toISOString(); // Cambiar esto

      console.log(
        "Guardando gasto desde recordatorio con fecha:",
        nuevoGasto.fecha
      );

      // Asegurar que el ID es único
      if (!nuevoGasto.id) {
        nuevoGasto.id = crypto.randomUUID();
      }

      // El resto de la función se mantiene igual
      const gastosActualizados = [nuevoGasto, ...gastosGuardados];
      localStorage.setItem("ObjetosGastos", JSON.stringify(gastosActualizados));

      if (typeof setGastosState === "function") {
        setGastosState(gastosActualizados);
      }

      Swal.fire({
        title: "¡Gasto registrado!",
        text: "El gasto ha sido añadido correctamente.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error al guardar el gasto:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo registrar el gasto. Inténtalo de nuevo.",
        icon: "error",
      });
    }
  };

  return (
    <div className="space-y-6">
      <RecordatorioFormulario
        guardarRecordatorio={guardarRecordatorio}
        recordatorioEditar={recordatorioEditar}
        setRecordatorioEditar={setRecordatorioEditar}
        categorias={categorias}
      />
      <ListaRecordatorios
        recordatorios={recordatorios}
        setRecordatorios={setRecordatorios}
        eliminarRecordatorio={eliminarRecordatorio}
        marcarCompletado={marcarCompletado}
        setRecordatorioEditar={setRecordatorioEditar}
        filtroActual={filtroActual}
        setFiltroActual={setFiltroActual}
        categorias={categorias}
      />
      {categorias.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center flex flex-col items-center">
          <svg className="h-10 w-10 text-blue-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">¡Crea una categoría primero!</h3>
          <p className="text-gray-500 mb-4">Para poder registrar gastos, primero necesitas crear al menos una categoría.</p>
          <button
            onClick={() => {/* abre modal de crear categoría */}}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Crear categoría
          </button>
        </div>
      ) : recordatorios.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center flex flex-col items-center">
          <svg className="h-10 w-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay gastos registrados</h3>
          <p className="text-gray-500">Agrega tu primer gasto usando el botón "Nuevo Gasto".</p>
        </div>
      ) : null}
    </div>
  );
}

RecordatoriosPage.propTypes = {
  setGastosState: PropTypes.func.isRequired,
};
