import PropTypes from "prop-types";

export default function SidebarFooter({ onDeletePresupuesto }) {
  return (
    <div className="px-4 py-4 border-t border-gray-200">
      <div className="space-y-2">
        <button
          className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-150"
          onClick={onDeletePresupuesto}
        >
          <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Reiniciar Aplicación
        </button>
      </div>
    </div>
  );
}

SidebarFooter.propTypes = {
  onDeletePresupuesto: PropTypes.func.isRequired,
};