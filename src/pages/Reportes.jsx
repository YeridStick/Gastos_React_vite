import { useEffect, useState } from "react";
import BarraExportacion from "../components/reportes/exportarArchivos/BarraExportacion";
import FiltrosReporte from "../components/reportes/FiltrosReporte";
import ResumenFinanciero from "../components/reportes/ResumenFinanciero";
import ResumenAhorro from "../components/reportes/ResumenAhorro";
import DesgloseAhorroPorMeta from "../components/reportes/DesgloseAhorroPorMeta";
import ProgresoMetasAhorro from "../components/reportes/ProgresoMetasAhorro";
import DesglosePorCategorias from "../components/reportes/DesglosePorCategorias";
import MetasAhorroActivas from "../components/reportes/MetasAhorroActivas";
import EstadisticasGastos from "../components/reportes/EstadisticasGastos";

import TituloReporte from "../components/reportes/exportarArchivos/estruturaArchivo/TituloReporte";
import CabeceraReporte from "../components/reportes/exportarArchivos/estruturaArchivo/CabeceraReporte";

// Componente principal de Reportes
export default function Reportes({
  gastosState,
  presupuesto,
  ingresosExtra = [],
  metasAhorro = [],
}) {
  // Estado para almacenar datos de reportes
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("mensual");
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth());
  const [añoSeleccionado, setAñoSeleccionado] = useState(
    new Date().getFullYear()
  );
  const [datosReporte, setDatosReporte] = useState({
    gastoTotal: 0,
    ingresoExtra: 0,
    gastoPromedio: 0,
    gastoMasAlto: { valor: 0, nombre: "", fecha: null },
    gastoMasBajo: { valor: Infinity, nombre: "", fecha: null },
    gastosPorCategoria: {},
    tendencia: "igual",
    cumplimientoPresupuesto: 0,
    progresoAhorro: 0,
    balance: 0,
    listadoGastos: [],
    // Datos específicos de ahorro
    totalAhorrado: 0,
    totalMetasAhorro: 0,
    ahorroDisponible: 0,
    metasActivasTotal: 0,
    metasCompletadasTotal: 0,
    metasActivas: [],
    metasCompletadas: [],
    ahorrosPorMeta: {},
    tendenciaAhorro: "igual",
    proyeccionCompletitud: 0,
    totalGastosAhorro: 0,
  });
  
  // Estado para secciones colapsables en móvil
  const [seccionesVisibles, setSeccionesVisibles] = useState({
    resumenFinanciero: true,
    resumenAhorro: true,
    estadisticasGastos: true,
    desgloseAhorro: true,
    progresoMetas: true,
    desgloseCategorias: true,
    metasActivas: true
  });

  // Toggle para expandir/contraer secciones en móvil
  const toggleSeccion = (seccion) => {
    setSeccionesVisibles(prev => ({
      ...prev,
      [seccion]: !prev[seccion]
    }));
  };

  // Lista de meses para el selector
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  // Lista de años disponibles (últimos 5 años)
  const años = [];
  const añoActual = new Date().getFullYear();
  for (let i = 0; i < 5; i++) {
    años.push(añoActual - i);
  }

  // Cargar datos si no se pasaron como props
  useEffect(() => {
    const ingresosExtraData = !ingresosExtra || ingresosExtra.length === 0 
      ? JSON.parse(localStorage.getItem("IngresosExtra")) || []
      : ingresosExtra;
  
    const metasAhorroData = !metasAhorro || metasAhorro.length === 0
      ? JSON.parse(localStorage.getItem("MetasAhorro")) || []
      : metasAhorro;
  
    generarReporte(ingresosExtraData, metasAhorroData);
  }, []);

  // Generar reporte cuando cambia el periodo o los datos
  useEffect(() => {
    if (datosReporte.gastoTotal !== 0 || datosReporte.ingresoExtra !== 0) {
      generarReporte();
    }
  }, [
    periodoSeleccionado,
    mesSeleccionado,
    añoSeleccionado
  ]);

  // Función para filtrar datos según el periodo seleccionado
  const filtrarPorPeriodo = (items) => {
    if (!items || !Array.isArray(items)) return [];

    return items.filter((item) => {
      const fechaItem = new Date(item.fecha);

      if (periodoSeleccionado === "mensual") {
        return (
          fechaItem.getMonth() === mesSeleccionado &&
          fechaItem.getFullYear() === añoSeleccionado
        );
      } else if (periodoSeleccionado === "anual") {
        return fechaItem.getFullYear() === añoSeleccionado;
      } else if (periodoSeleccionado === "trimestral") {
        const trimestreActual = Math.floor(mesSeleccionado / 3);
        const mesInicio = trimestreActual * 3;
        const mesFin = mesInicio + 2;

        return (
          fechaItem.getFullYear() === añoSeleccionado &&
          fechaItem.getMonth() >= mesInicio &&
          fechaItem.getMonth() <= mesFin
        );
      }
      return false;
    });
  };

  // Función para generar el reporte
  const generarReporte = (
    ingresosExtraData = ingresosExtra,
    metasAhorroData = metasAhorro
  ) => {
    // Filtrar datos según el periodo seleccionado
    const gastosFiltrados = filtrarPorPeriodo(gastosState);
    const ingresosExtraFiltrados = filtrarPorPeriodo(ingresosExtraData);

    // Si no hay datos en el periodo, mostrar valores por defecto
    if (gastosFiltrados.length === 0 && ingresosExtraFiltrados.length === 0) {
      setDatosReporte({
        gastoTotal: 0,
        ingresoExtra: 0,
        gastoPromedio: 0,
        gastoMasAlto: { valor: 0, nombre: "", fecha: null },
        gastoMasBajo: { valor: 0, nombre: "", fecha: null },
        gastosPorCategoria: {},
        tendencia: "igual",
        cumplimientoPresupuesto: 0,
        progresoAhorro: 0,
        balance: 0,
        listadoGastos: [],
        totalAhorrado: 0,
        totalMetasAhorro: 0,
        ahorroDisponible: 0,
        metasActivasTotal: 0,
        metasCompletadasTotal: 0,
        metasActivas: [],
        metasCompletadas: [],
        ahorrosPorMeta: {},
        tendenciaAhorro: "igual",
        proyeccionCompletitud: 0,
        totalGastosAhorro: 0,
      });
      return;
    }

    // Calcular gasto total
    const gastoTotal = gastosFiltrados.reduce(
      (total, gasto) => total + gasto.gasto,
      0
    );

    // Calcular ingresos extras
    const ingresoExtra = ingresosExtraFiltrados.reduce(
      (total, ingreso) => total + ingreso.monto,
      0
    );

    // Calcular gasto promedio
    const gastoPromedio =
      gastosFiltrados.length > 0 ? gastoTotal / gastosFiltrados.length : 0;

    // Encontrar gasto más alto y más bajo
    let gastoMasAlto = { valor: 0, nombre: "", fecha: null };
    let gastoMasBajo = { valor: Infinity, nombre: "", fecha: null };

    gastosFiltrados.forEach((gasto) => {
      if (gasto.gasto > gastoMasAlto.valor) {
        gastoMasAlto = {
          valor: gasto.gasto,
          nombre: gasto.nombreG,
          fecha: gasto.fecha,
        };
      }

      if (gasto.gasto < gastoMasBajo.valor) {
        gastoMasBajo = {
          valor: gasto.gasto,
          nombre: gasto.nombreG,
          fecha: gasto.fecha,
        };
      }
    });

    // Ajustar valor mínimo
    if (gastosFiltrados.length <= 1) {
      gastoMasBajo =
        gastosFiltrados.length === 0
          ? { valor: 0, nombre: "", fecha: null }
          : { ...gastoMasAlto };
    }

    // Calcular gastos por categoría
    const gastosPorCategoria = {};
    gastosFiltrados.forEach((gasto) => {
      if (!gastosPorCategoria[gasto.categoria]) {
        gastosPorCategoria[gasto.categoria] = 0;
      }
      gastosPorCategoria[gasto.categoria] += gasto.gasto;
    });

    // Calcular presupuesto aplicable según el periodo
    let presupuestoMensual = presupuesto / 12;
    let presupuestoAplicable;

    if (periodoSeleccionado === "mensual") {
      presupuestoAplicable = presupuestoMensual + ingresoExtra;
    } else if (periodoSeleccionado === "trimestral") {
      presupuestoAplicable = presupuestoMensual * 3 + ingresoExtra;
    } else {
      presupuestoAplicable = presupuesto + ingresoExtra;
    }

    // Calcular porcentaje de cumplimiento del presupuesto
    const cumplimientoPresupuesto =
      presupuestoAplicable > 0
        ? Math.min(100, Math.round((gastoTotal * 100) / presupuestoAplicable))
        : 0;

    // Calcular balance (ingresos - gastos)
    const balance = presupuestoAplicable - gastoTotal;

    // ====== CÁLCULOS ESPECÍFICOS PARA AHORRO ======

    // Filtrar gastos de ahorro (categoría "Ahorro")
    const gastosAhorro = gastosFiltrados.filter(
      (gasto) => gasto.categoria === "Ahorro"
    );
    const totalGastosAhorro = gastosAhorro.reduce(
      (total, gasto) => total + gasto.gasto,
      0
    );

    // Organizar gastos de ahorro por meta
    const ahorrosPorMeta = {};
    gastosAhorro.forEach((gasto) => {
      // Extraer el nombre de la meta del nombre del gasto (formato "Ahorro: NombreMeta")
      const nombreMetaMatch = gasto.nombreG.match(/Ahorro: (.*)/);
      if (nombreMetaMatch && nombreMetaMatch[1]) {
        const nombreMeta = nombreMetaMatch[1];

        if (!ahorrosPorMeta[nombreMeta]) {
          ahorrosPorMeta[nombreMeta] = 0;
        }

        ahorrosPorMeta[nombreMeta] += gasto.gasto;
      }
    });

    // Procesar metas de ahorro
    const metasActivas = metasAhorroData.filter((meta) => !meta.completada);
    const metasCompletadas = metasAhorroData.filter((meta) => meta.completada);

    const totalMetasAhorro = metasAhorroData.reduce(
      (total, meta) => total + meta.monto,
      0
    );
    const totalAhorrado = metasAhorroData.reduce(
      (total, meta) => total + (meta.ahorroAcumulado || 0),
      0
    );

    // Calcular progreso global de ahorro
    const progresoAhorro =
      totalMetasAhorro > 0
        ? Math.min(100, Math.round((totalAhorrado * 100) / totalMetasAhorro))
        : 0;

    // Calcular ahorro disponible
    const ahorroDisponible = Math.max(0, presupuestoAplicable - gastoTotal);

    // Calcular tendencia de ahorro (comparando con periodo anterior)
    let tendenciaAhorro = "igual";
    let periodoAnteriorAhorros = [];

    if (
      periodoSeleccionado === "mensual" &&
      (mesSeleccionado > 0 || añoSeleccionado < new Date().getFullYear())
    ) {
      let mesAnterior = mesSeleccionado - 1;
      let añoAnterior = añoSeleccionado;

      if (mesAnterior < 0) {
        mesAnterior = 11; // Diciembre
        añoAnterior--;
      }

      periodoAnteriorAhorros = gastosState.filter((gasto) => {
        const fechaGasto = new Date(gasto.fecha);
        return (
          gasto.categoria === "Ahorro" &&
          fechaGasto.getMonth() === mesAnterior &&
          fechaGasto.getFullYear() === añoAnterior
        );
      });
    }

    const totalAhorroPeriodoAnterior = periodoAnteriorAhorros.reduce(
      (total, gasto) => total + gasto.gasto,
      0
    );

    if (
      totalGastosAhorro > totalAhorroPeriodoAnterior &&
      totalAhorroPeriodoAnterior > 0
    ) {
      tendenciaAhorro = "subida";
    } else if (
      totalGastosAhorro < totalAhorroPeriodoAnterior &&
      totalAhorroPeriodoAnterior > 0
    ) {
      tendenciaAhorro = "bajada";
    }

    // Calcular proyección de tiempo para completar todas las metas activas
    let proyeccionCompletitud = 0;

    if (metasActivas.length > 0 && totalGastosAhorro > 0) {
      // Calcular promedio de ahorro mensual
      const ahorroMensualPromedio =
        periodoSeleccionado === "mensual"
          ? totalGastosAhorro
          : periodoSeleccionado === "trimestral"
          ? totalGastosAhorro / 3
          : totalGastosAhorro / 12;

      // Calcular cantidad total que falta para completar todas las metas
      const montoFaltante = metasActivas.reduce((total, meta) => {
        return total + (meta.monto - (meta.ahorroAcumulado || 0));
      }, 0);

      // Calcular meses necesarios para completar todas las metas
      proyeccionCompletitud =
        ahorroMensualPromedio > 0
          ? Math.ceil(montoFaltante / ahorroMensualPromedio)
          : 0;
    }

    // Actualizar el estado con todos los datos del reporte
    setDatosReporte({
      gastoTotal,
      ingresoExtra,
      gastoPromedio,
      gastoMasAlto,
      gastoMasBajo,
      gastosPorCategoria,
      tendencia: "igual", // Por ahora lo dejamos fijo, pero se podría implementar
      cumplimientoPresupuesto,
      balance,
      listadoGastos: gastosFiltrados.sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha)
      ),
      // Datos específicos de ahorro
      totalAhorrado,
      totalMetasAhorro,
      ahorroDisponible,
      metasActivasTotal: metasActivas.length,
      metasCompletadasTotal: metasCompletadas.length,
      metasActivas,
      metasCompletadas,
      ahorrosPorMeta,
      tendenciaAhorro,
      proyeccionCompletitud,
      progresoAhorro,
      totalGastosAhorro,
    });
  };

  // Función para obtener el título del periodo
  const obtenerTituloPeriodo = () => {
    if (periodoSeleccionado === "mensual") {
      return `${meses[mesSeleccionado]} ${añoSeleccionado}`;
    } else if (periodoSeleccionado === "trimestral") {
      const trimestre = Math.floor(mesSeleccionado / 3) + 1;
      return `${trimestre}º Trimestre ${añoSeleccionado}`;
    } else {
      return `Año ${añoSeleccionado}`;
    }
  };

  // Función para formatear fecha
  const formatearFecha = (fechaString) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Título del periodo actual para usar en exportaciones
  const tituloPeriodo = obtenerTituloPeriodo();

  // Componente para secciones colapsables en móvil
  const SeccionColapsable = ({ titulo, id, children }) => {
    const isVisible = seccionesVisibles[id];
    
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div 
          className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 flex justify-between items-center cursor-pointer" 
          onClick={() => toggleSeccion(id)}
        >
          <h3 className="text-base sm:text-lg font-medium text-gray-900">
            {titulo}
          </h3>
          <svg 
            className={`h-5 w-5 text-gray-500 transition-transform ${isVisible ? 'transform rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {isVisible && (
          <div className="p-4 sm:p-6">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Cabecera con título y botones de exportación */}
      <CabeceraReporte 
        titulo="Reportes" 
        barraExportacion={
          <div className="overflow-x-auto -mx-4 sm:mx-0 pb-2">
            <div className="px-4 sm:px-0">
              <BarraExportacion 
                datosReporte={datosReporte} 
                periodo={tituloPeriodo}
                metasAhorro={metasAhorro} 
                formatearFecha={formatearFecha} 
              />
            </div>
          </div>
        }
      />

      {/* Filtros para el reporte */}
      <FiltrosReporte 
        periodoSeleccionado={periodoSeleccionado}
        setPeriodoSeleccionado={setPeriodoSeleccionado}
        mesSeleccionado={mesSeleccionado}
        setMesSeleccionado={setMesSeleccionado}
        añoSeleccionado={añoSeleccionado}
        setAñoSeleccionado={setAñoSeleccionado}
        meses={meses}
        años={años}
      />

      {/* Título del reporte */}
      <TituloReporte titulo={`Reporte: ${tituloPeriodo}`} className="text-lg sm:text-xl font-bold" />

      {/* Resumen Financiero */}
      <SeccionColapsable titulo="Resumen Financiero" id="resumenFinanciero">
        <ResumenFinanciero datosReporte={datosReporte} />
      </SeccionColapsable>

      {/* Resumen de Ahorro */}
      <SeccionColapsable titulo="Resumen de Ahorro" id="resumenAhorro">
        <ResumenAhorro datosReporte={datosReporte} />
      </SeccionColapsable>

      {/* Estadísticas de Gastos */}
      <SeccionColapsable titulo="Estadísticas de Gastos" id="estadisticasGastos">
        <EstadisticasGastos datosReporte={datosReporte} />
      </SeccionColapsable>

      {/* Desglose de Ahorro Por Meta */}
      <SeccionColapsable titulo="Desglose de Ahorro Por Meta" id="desgloseAhorro">
        <DesgloseAhorroPorMeta datosReporte={datosReporte} />
      </SeccionColapsable>

      {/* Progreso de Metas de Ahorro */}
      <SeccionColapsable titulo="Progreso de Metas de Ahorro" id="progresoMetas">
        <ProgresoMetasAhorro 
          metasAhorro={metasAhorro} 
          datosReporte={datosReporte} 
          formatearFecha={formatearFecha} 
        />
      </SeccionColapsable>

      {/* Desglose por Categorías */}
      <SeccionColapsable titulo="Desglose por Categorías" id="desgloseCategorias">
        <DesglosePorCategorias datosReporte={datosReporte} />
      </SeccionColapsable>

      {/* Metas de Ahorro Activas */}
      <SeccionColapsable titulo="Metas de Ahorro Activas" id="metasActivas">
        <MetasAhorroActivas 
          metasAhorro={metasAhorro} 
          formatearFecha={formatearFecha} 
        />
      </SeccionColapsable>
    </div>
  );
}