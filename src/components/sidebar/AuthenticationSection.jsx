import { Link } from "react-router-dom";
import PropTypes from "prop-types";

export default function AuthenticationSection({ onNavigate, onCreateAccount }) {
  return (
    <div className="pt-3 border-t border-gray-200">
      <div className="flex flex-col space-y-1">
        <Link
          to="/login"
          onClick={() => onNavigate("/login")}
          className="w-full flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Iniciar sesión
        </Link>
        
        <button
          onClick={onCreateAccount}
          className="w-full flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150"
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Crear cuenta
        </button>
      </div>
    </div>
  );
}

AuthenticationSection.propTypes = {
  onNavigate: PropTypes.func.isRequired,
  onCreateAccount: PropTypes.func.isRequired,
};