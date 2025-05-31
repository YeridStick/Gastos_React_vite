import { Link } from "react-router-dom";
import PropTypes from "prop-types";

export default function NavigationItem({ path, label, icon, activeTab, onNavigate }) {
  const getActiveClass = () => {
    // Para rutas de inventario, verificar si empezamos con 'inventario'
    if (path.startsWith('/inventario/')) {
      const routeParts = path.split('/');
      const section = routeParts[1]; // 'inventario'
      const subsection = routeParts[2]; // 'productos', 'stock', etc.
      
      return activeTab === section || activeTab === subsection || activeTab === `${section}/${subsection}`;
    }
    
    // Para otras rutas, usar la lógica existente
    return activeTab === path.replace('/', '');
  };

  const isActive = getActiveClass();

  return (
    <Link
      to={path}
      onClick={() => onNavigate(path)}
      className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
        isActive
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