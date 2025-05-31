import { useEffect } from "react";
import {
  Outlet,
  useLocation,
} from "react-router-dom";
import PropTypes from 'prop-types';
import { Sidebar } from "../../components/sidebar";
import Header from "../../components/Header";


// Hooks personalizados
// Layout para rutas que requieren presupuesto definido
export function AppLayout({ 
  isAuthenticated, 
  logoutUser, 
  handleManualSync,
  metas, 
  disponibleMensual,
  deletePresupuesto,
  isSidebarOpen,
  setIsSidebarOpen,
  activeTab,
  setActiveTab
}) {
  const location = useLocation();
  const currentRoute = location.pathname.split('/')[1] || 'dashboard';

  useEffect(() => {
    setActiveTab(currentRoute);
  }, [currentRoute, setActiveTab]);

  return (
    <div className="h-screen overflow-y-auto bg-gray-50 flex flex-col font-sans">
      <Header
        setIsSidebarOpen={setIsSidebarOpen}
        isSidebarOpen={isSidebarOpen}
        metas={metas}
        disponibleMensual={disponibleMensual}
        isAuthenticated={isAuthenticated}
        onLogout={logoutUser}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          deletePresupuesto={deletePresupuesto}
          isAuthenticated={isAuthenticated}
          onManualSync={handleManualSync}
        />

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

AppLayout.propTypes = {
  isAuthenticated: PropTypes.bool,
  logoutUser: PropTypes.func,
  handleManualSync: PropTypes.func,
  metas: PropTypes.array,
  disponibleMensual: PropTypes.number,
  deletePresupuesto: PropTypes.func,
  isSidebarOpen: PropTypes.bool,
  setIsSidebarOpen: PropTypes.func,
  activeTab: PropTypes.string,
  setActiveTab: PropTypes.func
};