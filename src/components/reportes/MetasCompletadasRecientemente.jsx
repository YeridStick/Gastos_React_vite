// import React from "react";
import PropTypes from "prop-types";

const MetasCompletadasRecientemente = ({ metasCompletadas }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
    <div className="px-6 py-4 border-b border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 flex items-center">
        <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Metas Completadas Recientemente
      </h3>
    </div>
    <div className="p-6">
      {metasCompletadas && metasCompletadas.length > 0 ? (
        <div className="space-y-4">
          {metasCompletadas.map(meta => (
            <div
              key={meta.id}
              className="flex items-center bg-green-50 border border-green-100 rounded-lg p-4 shadow-sm"
            >
              <svg className="w-6 h-6 text-green-500 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <div className="text-lg font-semibold text-green-700">{meta.nombre}</div>
                <div className="text-sm text-gray-500">Completada el {meta.fechaCompletada}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-400 text-center py-8">
          No hay metas completadas recientemente.
        </div>
      )}
    </div>
  </div>
);

MetasCompletadasRecientemente.propTypes = {
  metasCompletadas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      nombre: PropTypes.string.isRequired,
      fechaCompletada: PropTypes.string.isRequired,
    })
  ),
};

export default MetasCompletadasRecientemente; 