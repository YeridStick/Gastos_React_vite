import PropTypes from "prop-types";

export default function SyncSection({ pendingSync, onManualSync }) {
  return (
    <div className="pt-3 border-t border-gray-200">
      <button
        onClick={onManualSync}
        disabled={!pendingSync}
        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm font-medium 
          ${pendingSync 
            ? "text-orange-600 hover:bg-orange-50 hover:text-orange-700"
            : "text-gray-400"} 
          transition-colors duration-150 ${!pendingSync ? "cursor-not-allowed" : ""}`}
      >
        <div className="flex items-center">
          <svg className={`mr-2 h-4 w-4 ${pendingSync ? "text-orange-600" : "text-gray-400"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {pendingSync ? "Guardar cambios" : "Sin cambios pendientes"}
        </div>
        
        {/* Indicador de cambios pendientes */}
        {pendingSync && (
          <span className="inline-flex h-2 w-2 rounded-full bg-orange-500"></span>
        )}
      </button>
    </div>
  );
}

SyncSection.propTypes = {
  pendingSync: PropTypes.bool.isRequired,
  onManualSync: PropTypes.func.isRequired,
};
