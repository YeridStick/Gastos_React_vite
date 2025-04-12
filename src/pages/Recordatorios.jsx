import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import RecordatorioFormulario from "../components/recordatorio/RecordatorioFormulario";
import ListaRecordatorios from "../components/recordatorio/ListaRecordatorios";


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
        const recordatoriosActualizados = parsedRecordatorios.map((recordatorio) => {
          if (recordatorio.estado === "pendiente" && recordatorio.fechaVencimiento < Date.now()) {
            return { ...recordatorio, estado: "vencido" };
          }
          return recordatorio;
        });
        setRecordatorios(recordatoriosActualizados);
        localStorage.setItem("recordatorios", JSON.stringify(recordatoriosActualizados));
      }
    } catch (error) {
      console.error("Error al cargar recordatorios:", error);
    }
  };

  // Función para cargar categorías desde localStorage
  const cargarCategorias = () => {
    try {
      const categoriasGuardadas = localStorage.getItem("categorias");
      if (categoriasGuardadas) {
        setCategorias(JSON.parse(categoriasGuardadas));
      } else {
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
  };

  // Función para guardar un recordatorio
  const guardarRecordatorio = (nuevoRecordatorio) => {
    let recordatoriosActualizados;
    
    if (recordatorioEditar) {
      // Actualizar recordatorio existente
      recordatoriosActualizados = recordatorios.map((recordatorio) =>
        recordatorio.id === recordatorioEditar.id ? nuevoRecordatorio : recordatorio
      );
      
      Swal.fire({
        title: 'Recordatorio actualizado',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      // Crear nuevo recordatorio
      recordatoriosActualizados = [nuevoRecordatorio, ...recordatorios];
      
      Swal.fire({
        title: 'Recordatorio guardado',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
    
    // Guardar en localStorage y actualizar estado
    setRecordatorios(recordatoriosActualizados);
    localStorage.setItem("recordatorios", JSON.stringify(recordatoriosActualizados));
    setRecordatorioEditar(null);
  };

  // Función para eliminar un recordatorio
  const eliminarRecordatorio = (id) => {
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
        const recordatoriosActualizados = recordatorios.filter((recordatorio) => recordatorio.id !== id);
        setRecordatorios(recordatoriosActualizados);
        localStorage.setItem("recordatorios", JSON.stringify(recordatoriosActualizados));
        
        Swal.fire({
          title: "Eliminado",
          text: "El recordatorio ha sido eliminado.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  // Función para marcar un recordatorio como completado
  const marcarCompletado = (id) => {
    // Encontrar el recordatorio que se va a marcar como completado
    const recordatorio = recordatorios.find(r => r.id === id);
    
    if (!recordatorio) return;
    
    Swal.fire({
      title: '¿Marcar como completado?',
      text: `¿Has realizado el pago de "${recordatorio.titulo}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, completar',
      cancelButtonText: 'Cancelar'
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
            estado: 'pendiente'
          };
          
          recordatoriosActualizados.push(nuevoRecordatorio);
        }
        
        // Actualizar el estado del recordatorio actual
        recordatoriosActualizados = recordatoriosActualizados.map(r => 
          r.id === id ? { ...r, estado: 'completado' } : r
        );
        
        // Guardar cambios
        setRecordatorios(recordatoriosActualizados);
        localStorage.setItem('recordatorios', JSON.stringify(recordatoriosActualizados));
        
        // Preguntar si quiere registrar como gasto
        registrarComoGasto(recordatorio);
      }
    });
  };
  
  // Función para calcular la próxima fecha según la frecuencia
  const calcularProximaFecha = (fechaActual, frecuencia) => {
    const fecha = new Date(fechaActual);
    
    switch (frecuencia) {
      case 'diario':
        fecha.setDate(fecha.getDate() + 1);
        break;
      case 'semanal':
        fecha.setDate(fecha.getDate() + 7);
        break;
      case 'quincenal':
        fecha.setDate(fecha.getDate() + 15);
        break;
      case 'mensual':
        fecha.setMonth(fecha.getMonth() + 1);
        break;
      case 'bimestral':
        fecha.setMonth(fecha.getMonth() + 2);
        break;
      case 'trimestral':
        fecha.setMonth(fecha.getMonth() + 3);
        break;
      case 'semestral':
        fecha.setMonth(fecha.getMonth() + 6);
        break;
      case 'anual':
        fecha.setFullYear(fecha.getFullYear() + 1);
        break;
      default:
        fecha.setMonth(fecha.getMonth() + 1);
    }
    
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
          // Crear nuevo gasto
          const nuevoGasto = {
            id: crypto.randomUUID(),
            nombreG: recordatorio.titulo,
            gasto: recordatorio.monto,
            categoria: recordatorio.categoria,
            fecha: Date.now(),
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
      // Obtener los gastos actuales desde localStorage
      const gastosGuardados = JSON.parse(localStorage.getItem("ObjetosGastos")) || [];

      // Agregar el nuevo gasto
      const gastosActualizados = [nuevoGasto, ...gastosGuardados];

      // Guardar en localStorage
      localStorage.setItem("ObjetosGastos", JSON.stringify(gastosActualizados));

      // Actualizar el estado global de gastos
      setGastosState(gastosActualizados); // Aquí se usa setGastosState correctamente

      // Mostrar notificación de éxito
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
        eliminarRecordatorio={eliminarRecordatorio}
        marcarCompletado={marcarCompletado}
        setRecordatorioEditar={setRecordatorioEditar}
        filtroActual={filtroActual}
        setFiltroActual={setFiltroActual}
      />
    </div>
  );
}