import * as XLSX from 'xlsx';
import ExportarReporteBtn from '../ExportarReporteBtn';

const GeneradorReporteExcel = ({ datosReporte, periodo, metasAhorro, formatearFecha }) => {
    const generarExcel = () => {
      try {
        // Crear libro de trabajo (workbook)
        const wb = XLSX.utils.book_new();
        wb.Props = {
          Title: `Reporte Financiero ${periodo}`,
          Subject: "Reporte Financiero",
          Author: "Control de Gastos App",
          CreatedDate: new Date()
        };
        
        // Aplicar estilos básicos (ancho de columnas)
        const defaultColWidth = [{ wch: 30 }, { wch: 20 }];
        
        // Función para dar formato a montos
        const formatoMoneda = (valor) => {
          const num = Number(valor);
          if (!isNaN(num)) {
            return new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN'
            }).format(num);
          }
          return valor;
        };
        
        // Hoja 1: Resumen Financiero
        const datosResumen = [
          ["Reporte Financiero", periodo],
          ["Generado el", formatearFecha(new Date())],
          [],
          ["Concepto", "Valor"],
          ["Gasto Total", formatoMoneda(Number(datosReporte.gastoTotal))],
          ["Ingresos Extra", formatoMoneda(Number(datosReporte.ingresoExtra))],
          ["Balance", formatoMoneda(Number(datosReporte.balance))],
          ["Cumplimiento Presupuesto", `${datosReporte.cumplimientoPresupuesto}%`]
        ];
        
        const wsResumen = XLSX.utils.aoa_to_sheet(datosResumen);
        
        // Aplicar estilos básicos a la primera hoja
        wsResumen['!cols'] = defaultColWidth;
        
        // Aplicar formato a las celdas con títulos
        wsResumen.A1 = { v: "Reporte Financiero", s: { font: { bold: true, sz: 16 }, alignment: { horizontal: "center" } } };
        wsResumen.A4 = { v: "Concepto", s: { font: { bold: true }, fill: { fgColor: { rgb: "9FC5E8" } } } };
        wsResumen.B4 = { v: "Valor", s: { font: { bold: true }, fill: { fgColor: { rgb: "9FC5E8" } } } };
        
        XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen Financiero");
        
        // Hoja 2: Resumen de Ahorro
        const metasDetalle = (metasAhorro && metasAhorro.length > 0)
          ? metasAhorro.map(meta => [
              meta.nombre,
              formatoMoneda(Number(meta.monto)),
              formatoMoneda(Number(meta.ahorroAcumulado || 0)),
              meta.monto > 0 ? `${Math.min(100, Math.round(((meta.ahorroAcumulado || 0) * 100) / meta.monto))}%` : "0%",
              formatearFecha(meta.fechaObjetivo),
              meta.completada ? "Completada" : "Activa"
            ])
          : [["No hay metas de ahorro en este periodo", "", "", "", "", ""]];

        const datosAhorro = [
          ["Resumen de Ahorro", periodo],
          [],
          ["Concepto", "Valor"],
          ["Total Ahorrado", formatoMoneda(Number(datosReporte.totalAhorrado))],
          ["Ahorro Disponible", formatoMoneda(Number(datosReporte.ahorroDisponible))],
          ["Progreso Global", `${datosReporte.progresoAhorro}%`],
          ["Proyección de Completitud", datosReporte.proyeccionCompletitud > 0 
            ? `${datosReporte.proyeccionCompletitud} meses` 
            : "N/A"],
          [],
          ["Metas Activas", datosReporte.metasActivasTotal],
          ["Metas Completadas", datosReporte.metasCompletadasTotal],
          [],
          ["Detalle de Metas de Ahorro"],
          ["Nombre", "Monto Objetivo", "Ahorrado", "Progreso", "Fecha Objetivo", "Estado"],
          ...metasDetalle
        ];
        
        const wsAhorro = XLSX.utils.aoa_to_sheet(datosAhorro);
        wsAhorro['!cols'] = defaultColWidth;
        // Aplicar borde grueso a la tabla de detalle de metas
        const startRow = datosAhorro.findIndex(row => row[0] === "Detalle de Metas de Ahorro") + 1;
        const endRow = startRow + metasDetalle.length;
        for (let r = startRow; r <= endRow; r++) {
          for (let c = 0; c < 6; c++) {
            const cell = XLSX.utils.encode_cell({ r, c });
            if (!wsAhorro[cell]) continue;
            wsAhorro[cell].s = wsAhorro[cell].s || {};
            wsAhorro[cell].s.border = {
              top: { style: "medium", color: { rgb: "000000" } },
              bottom: { style: "medium", color: { rgb: "000000" } },
              left: { style: "medium", color: { rgb: "000000" } },
              right: { style: "medium", color: { rgb: "000000" } }
            };
          }
        }
        XLSX.utils.book_append_sheet(wb, wsAhorro, "Resumen Ahorro");
        
        // Hoja 3: Gastos por Categoría
        const headersCategorias = ["Categoría", "Monto", "Porcentaje"];
        const categoriaColWidth = [{ wch: 25 }, { wch: 20 }, { wch: 15 }];
        
        const datosCategorias = Object.entries(datosReporte.gastosPorCategoria || {})
          .sort((a, b) => b[1] - a[1])
          .map(([categoria, valor]) => {
            const porcentaje = datosReporte.gastoTotal > 0 
              ? Math.round((valor / datosReporte.gastoTotal) * 100)
              : 0;
            return [categoria, formatoMoneda(Number(valor)), `${porcentaje}%`];
          });
        
        // Combinar encabezados y datos
        const categoriasData = [
          ["Desglose por Categorías", periodo],
          [],
          headersCategorias,
          ...datosCategorias
        ];
        
        // Si no hay categorías, agregar mensaje
        if (datosCategorias.length === 0) {
          categoriasData.push(["No hay datos para mostrar", "", ""]);
        }
        
        const wsCategorias = XLSX.utils.aoa_to_sheet(categoriasData);
        wsCategorias['!cols'] = categoriaColWidth;
        XLSX.utils.book_append_sheet(wb, wsCategorias, "Categorías");
        
        // Hoja 4: Metas de Ahorro
        if (metasAhorro && metasAhorro.length > 0) {
          const headersMetasActivas = ["Meta", "Fecha Objetivo", "Monto Objetivo", "Ahorrado", "Progreso"];
          const metasColWidth = [
            { wch: 25 }, // Nombre
            { wch: 15 }, // Fecha
            { wch: 15 }, // Monto
            { wch: 15 }, // Ahorrado
            { wch: 15 }, // Progreso
            { wch: 15 }  // Estado
          ];
          
          // Datos de metas activas
          const metasActivas = metasAhorro.filter(meta => !meta.completada);
          const metasCompletadas = metasAhorro.filter(meta => meta.completada);
          
          // Datos de metas activas
          const datosMetasActivas = metasActivas.map(meta => {
            const progreso = meta.monto > 0 
              ? Math.min(100, Math.round(((meta.ahorroAcumulado || 0) * 100) / meta.monto)) 
              : 0;
            
            return [
              meta.nombre,
              formatearFecha(meta.fechaObjetivo),
              formatoMoneda(Number(meta.monto)),
              formatoMoneda(Number(meta.ahorroAcumulado || 0)),
              `${progreso}%`,
              meta.completada ? "Completada" : "Activa"
            ];
          });
          
          // Crear hoja con metas activas
          const metasActivasData = [
            ["Metas de Ahorro Activas", periodo],
            [],
            headersMetasActivas,
            ...(datosMetasActivas.length > 0 ? datosMetasActivas : [["No hay metas activas", "", "", "", "", ""]])
          ];
          
          const wsMetasActivas = XLSX.utils.aoa_to_sheet(metasActivasData);
          wsMetasActivas['!cols'] = metasColWidth;
          XLSX.utils.book_append_sheet(wb, wsMetasActivas, "Metas Activas");
          
          // Si hay metas completadas, crear una hoja para ellas
          if (metasCompletadas.length > 0) {
            const datosMetasCompletadas = metasCompletadas.map(meta => [
              meta.nombre,
              formatearFecha(meta.fechaObjetivo || new Date()),
              formatoMoneda(Number(meta.monto)),
              formatoMoneda(Number(meta.ahorroAcumulado || meta.monto)),
              "100%",
              meta.completada ? "Completada" : "Activa"
            ]);
            
            const metasCompletadasData = [
              ["Metas de Ahorro Completadas", periodo],
              [],
              headersMetasActivas,
              ...datosMetasCompletadas
            ];
            
            const wsMetasCompletadas = XLSX.utils.aoa_to_sheet(metasCompletadasData);
            wsMetasCompletadas['!cols'] = metasColWidth;
            XLSX.utils.book_append_sheet(wb, wsMetasCompletadas, "Metas Completadas");
          }
        }
        
        // Hoja 5: Ahorro por Meta (si hay datos)
        if (datosReporte.ahorrosPorMeta && Object.keys(datosReporte.ahorrosPorMeta).length > 0) {
          const headersAhorroPorMeta = ["Meta", "Ahorrado en Periodo", "% del Total"];
          
          const datosAhorroPorMeta = Object.entries(datosReporte.ahorrosPorMeta)
            .sort((a, b) => b[1] - a[1])
            .map(([nombreMeta, valor]) => {
              const porcentaje = datosReporte.totalGastosAhorro > 0 
                ? Math.round((valor / datosReporte.totalGastosAhorro) * 100)
                : 0;
              
              return [nombreMeta, formatoMoneda(Number(valor)), `${porcentaje}%`];
            });
          
          const ahorroPorMetaData = [
            ["Ahorro por Meta en Periodo", periodo],
            [],
            headersAhorroPorMeta,
            ...datosAhorroPorMeta,
            [],
            ["Total", formatoMoneda(Number(datosReporte.totalGastosAhorro || 0)), "100%"]
          ];
          
          const wsAhorroPorMeta = XLSX.utils.aoa_to_sheet(ahorroPorMetaData);
          wsAhorroPorMeta['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 15 }];
          XLSX.utils.book_append_sheet(wb, wsAhorroPorMeta, "Ahorro por Meta");
        }
        
        // Generar archivo y descargar
        // Nombre de archivo con formato seguro (sin espacios ni caracteres especiales)
        const nombreArchivo = `Reporte_Financiero_${periodo.replace(/[\s:\/\\]/g, '_')}.xlsx`;
        XLSX.writeFile(wb, nombreArchivo);
        
        console.log("Excel generado con éxito");
      } catch (error) {
        console.error("Error al generar Excel:", error);
        alert("Ocurrió un error al generar el Excel. Por favor, inténtalo de nuevo.");
      }
    };
  
    return (
      <ExportarReporteBtn 
        onExport={generarExcel} 
        tipo="Excel" 
      />
    );
  };
  
  export default GeneradorReporteExcel;