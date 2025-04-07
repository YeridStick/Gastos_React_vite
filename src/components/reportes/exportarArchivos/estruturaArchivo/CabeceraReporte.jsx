const CabeceraReporte = ({ titulo, barraExportacion }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h2 className="text-2xl font-semibold text-gray-800">{titulo}</h2>
      {barraExportacion}
    </div>
  );
};

export default CabeceraReporte;