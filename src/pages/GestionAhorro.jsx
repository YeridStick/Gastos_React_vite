import { useState, useEffect } from "react";
import { cantidad } from "../helpers/index.js";
import { generarID } from "../helpers/index";
import Swal from "sweetalert2";
import PropTypes from 'prop-types';

// Utilidad para formatear con separadores de miles
const formatMiles = (value) => {
  if (!value) return '';
  return Number(value).toLocaleString('es-CO');
};

export default function GestionAhorro({
  presupuesto,
  gastosState,
  ingresosExtra = [],
  setGastosState,
  setIngresosExtra,
}) {
  const [metasAhorro, setMetasAhorro] = useState([]);
  const [ahorroDisponible, setAhorroDisponible] = useState(0);
  const [distribucionAutomatica, setDistribucionAutomatica] = useState(true);
  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [metaEnEdicion, setMetaEnEdicion] = useState(null);
  const [cantidadAjuste, setCantidadAjuste] = useState("");

  // Cargar metas de ahorro y calcular ahorro disponible
  useEffect(() => {
    const obtenerMetasAhorro = async () => {
      const metasAhorroLS = JSON.parse(localStorage.getItem("MetasAhorro")) || [];
      setMetasAhorro(metasAhorroLS);
      console.log("Metas cargadas desde localStorage:", metasAhorroLS);

      if (metasAhorroLS.length > 0) {
        sincronizarMetasConGastos(metasAhorroLS);
      }
    };

    const ejecutarMigracion = async () => {
      const yaSeEjecutoMigracion = localStorage.getItem("migracionGastosAhorroCompletada");
      if (!yaSeEjecutoMigracion) {
        const resultado = migrarGastosAhorro();
        if (resultado) {
          localStorage.setItem("migracionGastosAhorroCompletada", "true");
        }
      }
    };

    obtenerMetasAhorro();
    ejecutarMigracion();
    calcularAhorroDisponible();
  }, [presupuesto, gastosState, ingresosExtra]);

  const calcularAhorroDisponible = () => {
    const totalGastos = gastosState.reduce((acc, gasto) => acc + Number(gasto.gasto), 0);
    const disponible = Math.max(0, presupuesto - totalGastos);
    setAhorroDisponible(disponible);
  };

  const crearGastoAhorro = (monto, nombreMeta, metaId = null) => {
    // Si no se proporcionó un ID pero sí un nombre, buscar la meta
    if (!metaId && nombreMeta && nombreMeta !== "Distribución automática") {
      const meta = metasAhorro.find(
        (m) => m.nombre === nombreMeta && !m.completada
      );
      if (meta) {
        metaId = meta.id;
      }
    }

    // Usar fecha en formato ISO string - como los gastos regulares
    const fechaISO = new Date().toISOString();

    console.log(`Creando gasto de ahorro con fecha ISO: ${fechaISO}`);

    const nuevoGasto = {
      nombreG: `Ahorro: ${nombreMeta}`,
      gasto: monto,
      categoria: "Ahorro",
      id: generarID(),
      fecha: fechaISO, // Aquí es el cambio clave - guardar como string ISO
      metaId: metaId,
      userId: localStorage.getItem("userEmail") || null,
    };

    // El resto de la función se mantiene igual
    const gastosActuales = [...gastosState];
    const gastosActualizados = [nuevoGasto, ...gastosActuales];
    setGastosState(gastosActualizados);
    localStorage.setItem("ObjetosGastos", JSON.stringify(gastosActualizados));

    return nuevoGasto;
  };

  // Función para crear un nuevo ingreso (cuando se retira dinero de una meta)
  const crearIngresoExtra = (monto, nombreMeta, metaId = null) => {
    // Usar fecha en formato ISO string
    const fechaISO = new Date().toISOString();

    console.log("Creando ingreso extra con fecha ISO:", fechaISO);

    const nuevoIngreso = {
      descripcion: `Retiro de ahorro: ${nombreMeta}`,
      monto: monto,
      id: generarID(),
      fecha: fechaISO, // Guardar como string ISO
      metaId: metaId, // Guardar referencia al ID de la meta
      origen: "ahorro",
    };

    // Obtener ingresos actuales
    const ingresosActuales = [...ingresosExtra];

    // Añadir el nuevo ingreso
    const ingresosActualizados = [nuevoIngreso, ...ingresosActuales];

    // Actualizar estado y localStorage
    setIngresosExtra(ingresosActualizados);
    localStorage.setItem("IngresosExtra", JSON.stringify(ingresosActualizados));

    return nuevoIngreso;
  };

  // Distribuir el ahorro disponible entre las metas
  const distribuirAhorro = () => {
    if (ahorroDisponible <= 0) {
      mostrarError("No hay ahorro disponible para distribuir");
      return;
    }

    const metasActivas = metasAhorro.filter((meta) => !meta.completada);

    if (metasActivas.length === 0) {
      mostrarError("No hay metas de ahorro activas");
      return;
    }

    let metasActualizadas = [...metasAhorro];
    let gastosCreados = [];

    if (distribucionAutomatica) {
      // Distribuir equitativamente entre todas las metas activas
      const ahorroProporcion = ahorroDisponible / metasActivas.length;

      metasActualizadas = metasAhorro.map((meta) => {
        if (meta.completada) return meta;

        const nuevoAhorroAcumulado =
          (meta.ahorroAcumulado || 0) + ahorroProporcion;
        const completada = nuevoAhorroAcumulado >= meta.monto;

        // Calcular el porcentaje de progreso actualizado
        const porcentajeProgreso =
          meta.monto > 0
            ? Math.min(
                100,
                Math.round((nuevoAhorroAcumulado * 100) / meta.monto)
              )
            : 0;

        // Crear un gasto individual para cada meta en lugar de uno general
        const gasto = crearGastoAhorro(ahorroProporcion, meta.nombre, meta.id);
        gastosCreados.push(gasto);

        return {
          ...meta,
          ahorroAcumulado: completada ? meta.monto : nuevoAhorroAcumulado,
          porcentajeProgreso,
          completada,
        };
      });
    } else {
      // Priorizar la meta más cercana a completarse
      // Ordenar metas por porcentaje de completitud
      const metasOrdenadas = [...metasActivas].sort((a, b) => {
        const pctA = ((a.ahorroAcumulado || 0) / a.monto) * 100;
        const pctB = ((b.ahorroAcumulado || 0) / b.monto) * 100;
        return pctB - pctA; // Mayor porcentaje primero
      });

      let ahorroRestante = ahorroDisponible;

      metasActualizadas = metasAhorro.map((meta) => {
        if (meta.completada || ahorroRestante <= 0) return meta;

        const metaOrdenada = metasOrdenadas.find((m) => m.id === meta.id);
        if (!metaOrdenada) return meta;

        const faltante = meta.monto - (meta.ahorroAcumulado || 0);
        const ahorroAsignado = Math.min(faltante, ahorroRestante);

        if (ahorroAsignado > 0) {
          ahorroRestante -= ahorroAsignado;

          // Crear un gasto individual para esta meta
          const gasto = crearGastoAhorro(ahorroAsignado, meta.nombre, meta.id);
          gastosCreados.push(gasto);
        }

        const nuevoAhorroAcumulado =
          (meta.ahorroAcumulado || 0) + ahorroAsignado;
        const completada = nuevoAhorroAcumulado >= meta.monto;

        // Calcular el porcentaje de progreso actualizado
        const porcentajeProgreso =
          meta.monto > 0
            ? Math.min(
                100,
                Math.round((nuevoAhorroAcumulado * 100) / meta.monto)
              )
            : 0;

        return {
          ...meta,
          ahorroAcumulado: completada ? meta.monto : nuevoAhorroAcumulado,
          porcentajeProgreso,
          completada,
        };
      });
    }

    // Guardar las metas actualizadas en localStorage
    localStorage.setItem("MetasAhorro", JSON.stringify(metasActualizadas));
    setMetasAhorro(metasActualizadas);
    setAhorroDisponible(0);

    mostrarExito(
      `¡Ahorro distribuido correctamente entre ${gastosCreados.length} metas!`
    );
  };

  // Función para migrar los gastos de ahorro existentes y asignarles el ID de meta
  // Agregar esta función en el componente GestionAhorro y llamarla una vez al cargar
  const migrarGastosAhorro = () => {
    const metas = JSON.parse(localStorage.getItem("MetasAhorro")) || [];
    const gastos = JSON.parse(localStorage.getItem("ObjetosGastos")) || [];

    let gastosModificados = false;

    // Recorrer todos los gastos de tipo "Ahorro"
    const gastosActualizados = gastos.map((gasto) => {
      // Si ya tiene metaId o no es de categoría Ahorro, no lo modificamos
      if (gasto.metaId || gasto.categoria !== "Ahorro") {
        return gasto;
      }

      // Extraer el nombre de la meta del nombre del gasto
      const nombreMetaMatch = gasto.nombreG.match(/Ahorro: (.*)/);
      if (nombreMetaMatch && nombreMetaMatch[1]) {
        const nombreMeta = nombreMetaMatch[1];

        // Buscar la meta correspondiente
        const metaEncontrada = metas.find((meta) => meta.nombre === nombreMeta);

        if (metaEncontrada) {
          gastosModificados = true;
          return {
            ...gasto,
            metaId: metaEncontrada.id,
          };
        }
      }

      return gasto;
    });

    // Si se modificaron gastos, guardar los cambios
    if (gastosModificados) {
      localStorage.setItem("ObjetosGastos", JSON.stringify(gastosActualizados));
      console.log(
        "Gastos de ahorro migrados exitosamente con referencia a metas"
      );

      // Si existe el estado de gastos, actualizarlo
      if (window.setGastosState) {
        window.setGastosState(gastosActualizados);
      }

      Swal.fire({
        title: "Datos actualizados",
        text: "Se han actualizado los gastos de ahorro para mejorar la gestión de metas",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    }

    return gastosModificados;
  };

  // Distribuir ahorro manualmente a una meta específica
  const distribuirAhorroAMeta = (id, monto) => {
    if (monto > ahorroDisponible) {
      mostrarError("La cantidad supera el ahorro disponible");
      return;
    }

    const meta = metasAhorro.find((m) => m.id === id);
    if (!meta) return;

    // Crear el gasto de ahorro para esta asignación, pasando el ID de la meta
    crearGastoAhorro(monto, meta.nombre, meta.id);

    const metasActualizadas = metasAhorro.map((meta) => {
      if (meta.id !== id) return meta;

      const nuevoAhorroAcumulado = (meta.ahorroAcumulado || 0) + monto;
      const completada = nuevoAhorroAcumulado >= meta.monto;

      // Calcular porcentaje actualizado
      const porcentajeProgreso =
        meta.monto > 0
          ? Math.min(100, Math.round((nuevoAhorroAcumulado * 100) / meta.monto))
          : 0;

      return {
        ...meta,
        ahorroAcumulado: completada ? meta.monto : nuevoAhorroAcumulado,
        porcentajeProgreso,
        completada,
      };
    });

    // Guardar las metas actualizadas en localStorage
    localStorage.setItem("MetasAhorro", JSON.stringify(metasActualizadas));
    setMetasAhorro(metasActualizadas);
    setAhorroDisponible(ahorroDisponible - monto);

    mostrarExito(`¡${monto.toFixed(2)} asignados correctamente!`);
  };

  // Esta función sincroniza las metas de ahorro con los gastos existentes
  const sincronizarMetasConGastos = (metasIniciales = metasAhorro) => {
    console.log("========== INICIANDO SINCRONIZACIÓN ==========");
    console.log("Metas iniciales:", metasIniciales);

    if (!metasIniciales || metasIniciales.length === 0) {
      console.log("No hay metas para sincronizar");
      return;
    }

    // 1. Obtener todos los gastos de ahorro
    const gastosAhorro = gastosState.filter(
      (gasto) => gasto.categoria === "Ahorro"
    );

    console.log(`Encontrados ${gastosAhorro.length} gastos de ahorro:`, gastosAhorro);

    // 2. Crear un mapa para almacenar IDs de metas eliminadas
    const metasEliminadas = JSON.parse(localStorage.getItem("eliminados") || "{}");
    const idsMetasEliminadas = metasEliminadas.MetasAhorro || [];

    // 3. Filtrar los gastos que pertenecen a metas eliminadas
    const gastosActualizados = gastosState.filter((gasto) => {
      if (gasto.categoria !== "Ahorro") return true;

      if (gasto.metaId && idsMetasEliminadas.includes(gasto.metaId)) {
        console.log(`Eliminando gasto ${gasto.id} porque pertenece a meta eliminada ${gasto.metaId}`);
        return false;
      }

      if (!gasto.metaId) {
        const nombreMetaMatch = gasto.nombreG.match(/Ahorro: (.*)/);
        if (nombreMetaMatch && nombreMetaMatch[1]) {
          const nombreMeta = nombreMetaMatch[1];
          const metaActiva = metasIniciales.find((m) => m.nombre === nombreMeta);

          if (!metaActiva) {
            console.log(`Eliminando gasto ${gasto.id} porque no existe meta activa con nombre "${nombreMeta}"`);
            return false;
          }

          gasto.metaId = metaActiva.id;
        }
      }

      return true;
    });

    // 4. Actualizar el estado de gastos si es necesario
    if (gastosActualizados.length !== gastosState.length) {
      console.log(`Se eliminaron ${gastosState.length - gastosActualizados.length} gastos de metas eliminadas`);
      setGastosState(gastosActualizados);
      localStorage.setItem("ObjetosGastos", JSON.stringify(gastosActualizados));
    }

    // 5. Crear un mapa de gastos por meta
    const ahorrosPorMeta = {};

    gastosActualizados.forEach((gasto) => {
      if (gasto.categoria === "Ahorro") {
        let metaId = gasto.metaId;

        if (!metaId) {
          const nombreMetaMatch = gasto.nombreG.match(/Ahorro: (.*)/);
          if (nombreMetaMatch && nombreMetaMatch[1]) {
            const nombreMeta = nombreMetaMatch[1];
            console.log(`Buscando meta para gasto "${gasto.nombreG}" con nombre "${nombreMeta}"`);

            const metaEncontrada = metasIniciales.find((m) => m.nombre === nombreMeta);

            if (metaEncontrada) {
              console.log(`Meta encontrada por nombre: ${metaEncontrada.id}`);
              metaId = metaEncontrada.id;
              gasto.metaId = metaId;
            } else {
              console.log(`No se encontró meta para "${nombreMeta}"`);
            }
          }
        }

        if (metaId) {
          if (!ahorrosPorMeta[metaId]) {
            ahorrosPorMeta[metaId] = 0;
          }
          ahorrosPorMeta[metaId] += Number(gasto.gasto);
          console.log(`Sumando gasto ${gasto.gasto} a meta ${metaId}, total: ${ahorrosPorMeta[metaId]}`);
        }
      }
    });

    console.log("Gastos acumulados por meta:", ahorrosPorMeta);

    // 6. Actualizar las metas según los gastos existentes
    const metasActualizadas = metasIniciales.map((meta) => {
      const gastosTotales = ahorrosPorMeta[meta.id] || 0;
      const completada = gastosTotales >= meta.monto;

      const porcentajeProgreso = meta.monto > 0
        ? Math.min(100, Math.round((gastosTotales * 100) / meta.monto))
        : 0;

      console.log(`Meta ${meta.nombre} (ID: ${meta.id}): ${gastosTotales} de ${meta.monto} (${porcentajeProgreso}%)`);

      return {
        ...meta,
        ahorroAcumulado: completada ? meta.monto : gastosTotales,
        porcentajeProgreso,
        completada,
      };
    });

    console.log("Metas actualizadas después de sincronización:", metasActualizadas);

    setMetasAhorro(metasActualizadas);
    localStorage.setItem("MetasAhorro", JSON.stringify(metasActualizadas));
    calcularAhorroDisponible();

    console.log("========== SINCRONIZACIÓN COMPLETADA ==========");
  };

  useEffect(() => {
    calcularAhorroDisponible();
  }, [presupuesto, gastosState, ingresosExtra]); // Incluir todas las dependencias

  // Ajustar ahorro de una meta (quitar o agregar)
  // Ajustar ahorro de una meta (quitar o agregar)
  const ajustarAhorroMeta = (id, cantidadAjuste) => {
    const meta = metasAhorro.find((m) => m.id === id);
    if (!meta) return;

    const ahorroActual = meta.ahorroAcumulado || 0;

    // Verificar que no se intente quitar más de lo ahorrado
    if (cantidadAjuste < 0 && Math.abs(cantidadAjuste) > ahorroActual) {
      mostrarError(
        `No puedes quitar más de lo ahorrado (${cantidad(ahorroActual)})`
      );
      return;
    }

    // Verificar que no se intente agregar más de lo disponible
    if (cantidadAjuste > 0 && cantidadAjuste > ahorroDisponible) {
      mostrarError(
        `No puedes agregar más de lo disponible (${cantidad(ahorroDisponible)})`
      );
      return;
    }

    // Si es un ajuste positivo (agregar fondos), crear un gasto
    if (cantidadAjuste > 0) {
      crearGastoAhorro(cantidadAjuste, meta.nombre, meta.id);
    }
    // Si es un ajuste negativo (retirar fondos), crear un ingreso
    else if (cantidadAjuste < 0) {
      crearIngresoExtra(Math.abs(cantidadAjuste), meta.nombre, meta.id);
    }

    const nuevoAhorroAcumulado = ahorroActual + cantidadAjuste;
    const completada = nuevoAhorroAcumulado >= meta.monto;

    // Calcular el porcentaje de progreso actualizado
    const porcentajeProgreso =
      meta.monto > 0
        ? Math.min(100, Math.round((nuevoAhorroAcumulado * 100) / meta.monto))
        : 0;

    const metasActualizadas = metasAhorro.map((m) => {
      if (m.id !== id) return m;

      return {
        ...m,
        ahorroAcumulado: completada ? meta.monto : nuevoAhorroAcumulado,
        porcentajeProgreso, // Agregamos el porcentaje actualizado
        completada,
      };
    });

    // Actualizar el ahorro disponible
    const nuevoAhorroDisponible = ahorroDisponible - cantidadAjuste;

    // Guardar cambios
    localStorage.setItem("MetasAhorro", JSON.stringify(metasActualizadas));
    setMetasAhorro(metasActualizadas);
    setAhorroDisponible(nuevoAhorroDisponible);

    // Mostrar mensaje de éxito
    const accion = cantidadAjuste > 0 ? "agregados" : "retirados";
    mostrarExito(
      `¡${Math.abs(cantidadAjuste).toFixed(2)} ${accion} correctamente!`
    );

    // Cerrar el modo edición
    setMetaEnEdicion(null);
    setCantidadAjuste("");
  };

  // Función para retirar todo el ahorro acumulado de una meta
  const retirarTodoAhorro = (id) => {
    const meta = metasAhorro.find((m) => m.id === id);
    if (!meta) return;

    const ahorroActual = meta.ahorroAcumulado || 0;

    if (ahorroActual <= 0) {
      mostrarError("Esta meta no tiene fondos para retirar");
      return;
    }

    // Pedir confirmación antes de retirar
    Swal.fire({
      title: "¿Retirar todo el ahorro?",
      text: `¿Estás seguro que deseas retirar ${cantidad(ahorroActual)} de "${
        meta.nombre
      }"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, retirar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        // Buscar todos los gastos asociados a esta meta
        const gastosAsociados = gastosState.filter(
          (gasto) =>
            gasto.categoria === "Ahorro" &&
            (gasto.nombreG === `Ahorro: ${meta.nombre}` ||
              gasto.metaId === meta.id)
        );

        console.log(
          `Encontrados ${gastosAsociados.length} gastos asociados a la meta ${meta.nombre}`
        );

        // Eliminar todos los gastos asociados a esta meta
        const gastosActualizados = gastosState.filter(
          (gasto) =>
            !(
              gasto.categoria === "Ahorro" &&
              (gasto.nombreG === `Ahorro: ${meta.nombre}` ||
                gasto.metaId === meta.id)
            )
        );

        // Actualizar el estado de gastos
        setGastosState(gastosActualizados);
        localStorage.setItem(
          "ObjetosGastos",
          JSON.stringify(gastosActualizados)
        );

        // Crear ingreso por el retiro
        crearIngresoExtra(ahorroActual, meta.nombre, meta.id);

        // Actualizar la meta
        const metasActualizadas = metasAhorro.map((m) => {
          if (m.id !== id) return m;

          return {
            ...m,
            ahorroAcumulado: 0,
            porcentajeProgreso: 0,
            completada: false,
          };
        });

        // Guardar cambios
        localStorage.setItem("MetasAhorro", JSON.stringify(metasActualizadas));
        setMetasAhorro(metasActualizadas);

        // Notificar éxito
        Swal.fire({
          title: "¡Retiro completado!",
          text: `Se han retirado ${cantidad(ahorroActual)} de "${meta.nombre}"`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  // Función para mostrar mensaje de éxito
  const mostrarExito = (mensaje) => {
    setMensajeExito(mensaje);
    setMensajeError("");
    setTimeout(() => {
      setMensajeExito("");
    }, 3000);
  };

  // Función para mostrar mensaje de error
  const mostrarError = (mensaje) => {
    setMensajeError(mensaje);
    setMensajeExito("");
    setTimeout(() => {
      setMensajeError("");
    }, 3000);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Gestión de Ahorro
        </h2>
      </div>

      {mensajeExito && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 sm:p-4 rounded text-sm">
          <p>{mensajeExito}</p>
        </div>
      )}

      {mensajeError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 rounded text-sm">
          <p>{mensajeError}</p>
        </div>
      )}

      {/* Resumen de ahorro disponible */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 sm:p-5">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">
            Ahorro Disponible
          </h3>
          <div className="mt-3 sm:mt-4">
            <span className="text-xl sm:text-3xl font-bold text-green-600">
              {cantidad(ahorroDisponible)}
            </span>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">
              {presupuesto <= 0
                ? "Configura tu presupuesto para comenzar a ahorrar."
                : "Este es el dinero que puedes distribuir entre tus metas de ahorro."}
            </p>
            <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="distribucionAutomatica"
                  checked={distribucionAutomatica}
                  onChange={() =>
                    setDistribucionAutomatica(!distribucionAutomatica)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="distribucionAutomatica"
                  className="ml-2 text-xs sm:text-sm text-gray-700"
                >
                  Distribución automática equitativa
                </label>
              </div>
              <button
                onClick={distribuirAhorro}
                disabled={ahorroDisponible <= 0}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-medium ${
                  ahorroDisponible > 0
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Distribuir Ahorro
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metas de ahorro */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">
            Metas de Ahorro
          </h3>
        </div>

        {metasAhorro.filter((meta) => !meta.completada).length > 0 ? (
          <div className="divide-y divide-gray-200">
            {metasAhorro
              .filter((meta) => !meta.completada)
              .map((meta) => {
                const enEdicion = metaEnEdicion === meta.id;

                return (
                  <div key={meta.id} className="p-4 sm:p-6">
                    <div className="flex flex-col gap-3 sm:gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div>
                          <h4 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                            {meta.nombre}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-500">
                            Meta: {cantidad(meta.monto)}
                          </p>
                          <div className="mt-2 flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2.5">
                              <div
                                className="bg-blue-600 h-1.5 sm:h-2.5 rounded-full"
                                style={{
                                  width: `${meta.porcentajeProgreso || 0}%`,
                                }}
                              ></div>
                            </div>
                            <span className="ml-2 text-xs sm:text-sm font-medium text-gray-700">
                              {meta.porcentajeProgreso || 0}%
                            </span>
                          </div>
                          <div className="mt-1 flex justify-between text-xs sm:text-sm">
                            <span className="text-gray-500">
                              Ahorrado: {cantidad(meta.ahorroAcumulado || 0)}
                            </span>
                            <span className="text-gray-500 ml-2">
                              Falta: {cantidad(meta.monto - (meta.ahorroAcumulado || 0))}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          {!enEdicion ? (
                            <>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={formatMiles(cantidadAjuste)}
                                  onChange={e => {
                                    const raw = e.target.value.replace(/[.,\s]/g, '');
                                    setCantidadAjuste(raw);
                                  }}
                                  placeholder="Cantidad"
                                  className="block w-24 py-1 px-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                                  inputMode="numeric"
                                />
                                <button
                                  onClick={() => {
                                    const cantidad = parseInt(cantidadAjuste, 10);
                                    if (isNaN(cantidad) || cantidad <= 0) {
                                      mostrarError("Ingresa una cantidad válida");
                                      return;
                                    }
                                    distribuirAhorroAMeta(meta.id, cantidad);
                                    setCantidadAjuste('');
                                  }}
                                  disabled={ahorroDisponible <= 0}
                                  className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium ${
                                    ahorroDisponible > 0
                                      ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  }`}
                                >
                                  Asignar
                                </button>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setMetaEnEdicion(meta.id)}
                                  className="px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                                >
                                  Ajustar
                                </button>
                                {meta.ahorroAcumulado > 0 && (
                                  <button
                                    onClick={() => retirarTodoAhorro(meta.id)}
                                    className="px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200"
                                  >
                                    Retirar
                                  </button>
                                )}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="w-full flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={formatMiles(cantidadAjuste)}
                                    onChange={e => {
                                      const raw = e.target.value.replace(/[.,\s]/g, '');
                                      setCantidadAjuste(raw);
                                    }}
                                    placeholder="Cantidad"
                                    className="block w-24 py-1 px-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                                    inputMode="numeric"
                                  />
                                  <div className="flex space-x-1 sm:space-x-2">
                                    <button
                                      onClick={() => {
                                        const cantidad = parseInt(cantidadAjuste, 10);
                                        if (isNaN(cantidad) || cantidad === 0) {
                                          mostrarError("Ingresa una cantidad válida");
                                          return;
                                        }
                                        ajustarAhorroMeta(meta.id, cantidad);
                                        setCantidadAjuste("");
                                      }}
                                      className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200"
                                    >
                                      +
                                    </button>
                                    <button
                                      onClick={() => {
                                        const cantidad = parseInt(cantidadAjuste, 10);
                                        if (isNaN(cantidad) || cantidad === 0) {
                                          mostrarError("Ingresa una cantidad válida");
                                          return;
                                        }
                                        ajustarAhorroMeta(meta.id, -cantidad);
                                        setCantidadAjuste("");
                                      }}
                                      className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200"
                                    >
                                      -
                                    </button>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-500">
                                  Para agregar/quitar ahorro
                                </p>
                                <button
                                  onClick={() => {
                                    setMetaEnEdicion(null);
                                    setCantidadAjuste("");
                                  }}
                                  className="px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="py-8 sm:py-12 text-center">
            <p className="text-xs sm:text-sm text-gray-500">
              No hay metas de ahorro activas
            </p>
          </div>
        )}

        {/* Metas completadas */}
        {metasAhorro.filter((meta) => meta.completada).length > 0 && (
          <div>
            <div className="px-6 py-4 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-700">
                Metas Completadas
              </h3>
            </div>

            <div className="divide-y divide-gray-200">
              {metasAhorro
                .filter((meta) => meta.completada)
                .map((meta) => {
                  const enEdicion = metaEnEdicion === meta.id;

                  return (
                    <div key={meta.id} className="p-6 bg-gray-50">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">
                            {meta.nombre}
                          </h4>
                          <p className="text-sm text-green-600">
                            Meta alcanzada: {cantidad(meta.monto)}
                          </p>
                        </div>
                        {!enEdicion ? (
                          <div className="flex space-x-2">
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                              Completada
                            </span>
                            <button
                              onClick={() => setMetaEnEdicion(meta.id)}
                              className="px-3 py-1 rounded text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                            >
                              Ajustar
                            </button>
                            <button
                              onClick={() => retirarTodoAhorro(meta.id)}
                              className="px-3 py-1 rounded text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200"
                            >
                              Retirar Todo
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={formatMiles(cantidadAjuste)}
                                onChange={e => {
                                  const raw = e.target.value.replace(/[.,\s]/g, '');
                                  setCantidadAjuste(raw);
                                }}
                                placeholder="Cantidad a quitar"
                                className="block w-36 py-1 px-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                inputMode="numeric"
                              />
                              <button
                                onClick={() => {
                                  const cantidad = parseInt(cantidadAjuste, 10);
                                  if (isNaN(cantidad) || cantidad === 0) {
                                    mostrarError("Ingresa una cantidad válida");
                                    return;
                                  }
                                  ajustarAhorroMeta(meta.id, -cantidad);
                                }}
                                className="px-3 py-1 rounded text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200"
                              >
                                Quitar
                              </button>
                            </div>
                            <button
                              onClick={() => {
                                setMetaEnEdicion(null);
                                setCantidadAjuste("");
                              }}
                              className="px-3 py-1 rounded text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                            >
                              Cancelar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

GestionAhorro.propTypes = {
  presupuesto: PropTypes.number.isRequired,
  gastosState: PropTypes.arrayOf(
    PropTypes.shape({
      gasto: PropTypes.number.isRequired,
      categoria: PropTypes.string.isRequired,
      nombreG: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired,
      fecha: PropTypes.string.isRequired,
      metaId: PropTypes.string,
      userId: PropTypes.string
    })
  ).isRequired,
  ingresosExtra: PropTypes.arrayOf(
    PropTypes.shape({
      descripcion: PropTypes.string.isRequired,
      monto: PropTypes.number.isRequired,
      id: PropTypes.string.isRequired,
      fecha: PropTypes.string.isRequired,
      metaId: PropTypes.string,
      origen: PropTypes.string
    })
  ),
  setGastosState: PropTypes.func.isRequired,
  setIngresosExtra: PropTypes.func.isRequired
};
