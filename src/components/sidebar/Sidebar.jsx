import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { hasPendingChanges } from "../../services/syncService";
import PropTypes from "prop-types";
import SidebarHeader from "./SidebarHeader";
import SidebarNavigation from "./SidebarNavigation";
import SidebarFooter from "./SidebarFooter";

export default function Sidebar({ 
  setIsSidebarOpen, 
  isSidebarOpen, 
  activeTab, 
  setActiveTab, 
  deletePresupuesto,
  isAuthenticated,  
  onManualSync  
}) {  
  const [pendingSync, setPendingSync] = useState(false);
  const [inventoryOnlyMode, setInventoryOnlyMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setPendingSync(hasPendingChanges());
    
    const handlePendingChanges = (event) => {
      setPendingSync(event.detail?.hasPendingChanges || false);
    };
    
    window.addEventListener('syncPendingChange', handlePendingChanges);
    
    return () => {
      window.removeEventListener('syncPendingChange', handlePendingChanges);
    };
  }, []);

  const handleNavigation = (path) => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
    setActiveTab(path.split('/')[1] || "dashboard");
  };

  const handleCreateAccountWithData = () => {
    localStorage.setItem("preserveDataOnSignup", "true");
    navigate("/register");
    handleNavigation("/register");
  };

  const handleManualSync = () => {
    if (pendingSync) {
      onManualSync();
    }
  };

  const toggleInventoryMode = () => {
    setInventoryOnlyMode(!inventoryOnlyMode);
    // Si activamos el modo inventario y no estamos en una ruta de inventario, 
    // navegar a productos por defecto
    if (!inventoryOnlyMode && !activeTab.includes('inventario') && !activeTab.includes('productos')) {
      handleNavigation('/inventario/productos');
    }
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity md:hidden w-full"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 bg-white shadow-lg transform transition-transform duration-300 ease-in-out w-64
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:static md:h-auto md:z-0
        `}
      >
        <div className="h-full flex flex-col">
          <SidebarHeader 
            onClose={() => setIsSidebarOpen(false)} 
            inventoryOnlyMode={inventoryOnlyMode}
            onToggleInventoryMode={toggleInventoryMode}
          />
          
          <SidebarNavigation 
            activeTab={activeTab}
            onNavigate={handleNavigation}
            isAuthenticated={isAuthenticated}
            onCreateAccount={handleCreateAccountWithData}
            pendingSync={pendingSync}
            onManualSync={handleManualSync}
            inventoryOnlyMode={inventoryOnlyMode}
          />
          
          <SidebarFooter onDeletePresupuesto={deletePresupuesto} />
        </div>
      </aside>
    </>
  );
}

Sidebar.propTypes = {
  setIsSidebarOpen: PropTypes.func.isRequired,
  isSidebarOpen: PropTypes.bool.isRequired,
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  deletePresupuesto: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  onManualSync: PropTypes.func.isRequired,
};