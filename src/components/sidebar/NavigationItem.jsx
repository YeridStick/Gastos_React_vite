import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

export default function NavigationItem({ path, label, icon, onNavigate }) {
  const location = useLocation();
  
  const isActive = () => {
    // Usar la ruta actual directamente del router
    const currentPath = location.pathname;
    
    // Comparación exacta de rutas
    if (currentPath === path) {
      return true;
    }
    
    // Para rutas dinámicas o con parámetros, verificar si la ruta actual contiene el path base
    if (path !== '/' && currentPath.startsWith(path)) {
      return true;
    }
    
    return false;
  };

  return (
    <Link
      to={path}
      onClick={() => onNavigate(path)}
      className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
        isActive()
          ? "bg-blue-50 text-blue-700"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        {icon}
      </svg>
      {label}
    </Link>
  );
}

NavigationItem.propTypes = {
  path: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  activeTab: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
};