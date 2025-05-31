import PropTypes from "prop-types";

export default function SidebarHeader({
  onClose,
  inventoryOnlyMode,
  onToggleInventoryMode,
}) {
  return (
    <div className="px-4 py-4 border-b border-gray-200">
      {/* Botón Toggle Inventario */}
      <div className="mt-3">
        <button
          onClick={onToggleInventoryMode}
          className={`w-full flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            inventoryOnlyMode
              ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
        >
          <svg
            className="mr-2 h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            {inventoryOnlyMode ? (
              // Icono para "Mostrar todo"
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            ) : (
              // Icono para "Solo inventario"
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            )}
          </svg>
          {inventoryOnlyMode ? "Mostrar Todo" : "Solo Inventario"}
        </button>
      </div>

      <div className="flex items-center">
        <button
          className="ml-auto md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          onClick={onClose}
        >
          <span className="sr-only">Cerrar menú</span>
          <svg
            className="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

SidebarHeader.propTypes = {
  onClose: PropTypes.func.isRequired,
  inventoryOnlyMode: PropTypes.bool.isRequired,
  onToggleInventoryMode: PropTypes.func.isRequired,
};
