import PropTypes from "prop-types";

export default function InventoryToggleButton({ inventoryOnlyMode, onToggle }) {
  return (
    <div className="px-4 pb-4">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${
          inventoryOnlyMode
            ? "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
            : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
        }`}
      >
        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          {inventoryOnlyMode ? (
            // Icono para "Mostrar todo" - Grid/Dashboard
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          ) : (
            // Icono para "Solo inventario" - Cajas apiladas
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          )}
        </svg>
        <span className="font-semibold">
          {inventoryOnlyMode ? "Vista Completa" : "Solo Inventario"}
        </span>
      </button>
      
      {/* Indicador de estado */}
      <div className="mt-2 text-center">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          inventoryOnlyMode 
            ? "bg-orange-100 text-orange-800" 
            : "bg-gray-100 text-gray-800"
        }`}>
          {inventoryOnlyMode ? "📦 Modo Inventario" : "🏠 Vista Completa"}
        </span>
      </div>
    </div>
  );
}

InventoryToggleButton.propTypes = {
  inventoryOnlyMode: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};