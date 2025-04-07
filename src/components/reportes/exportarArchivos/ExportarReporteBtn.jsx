const ExportarReporteBtn = ({ onExport, tipo, icono }) => {
  const getClasses = () => {
    if (tipo === "pdf") {
      return "px-3 py-1 bg-red-100 text-red-800 rounded text-sm font-medium hover:bg-red-200";
    } else if (tipo === "excel") {
      return "px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-medium hover:bg-green-200";
    }
    return "px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium hover:bg-blue-200";
  };

  return (
    <button onClick={() => onExport(tipo)} className={getClasses()}>
      Exportar {tipo}
    </button>
  );
};

export default ExportarReporteBtn;
