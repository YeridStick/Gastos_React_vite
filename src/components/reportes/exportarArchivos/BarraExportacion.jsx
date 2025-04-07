import GeneradorReporteExcel from "./excel/GeneradorReporteExcel";

const BarraExportacion = ({
  datosReporte,
  periodo,
  metasAhorro,
  formatearFecha,
}) => {
  return (
    <div className="flex space-x-2">
      <GeneradorReporteExcel
        datosReporte={datosReporte}
        periodo={periodo}
        metasAhorro={metasAhorro}
        formatearFecha={formatearFecha}
      />
    </div>
  );
};

export default BarraExportacion;
