import PropTypes from "prop-types";

export default function SidebarHeader({
  onClose,
}) {
  return (
    <div className="px-4 border-b border-gray-200">
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
