import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout = ({
  setIsSidebarOpen,
  isSidebarOpen,
  metas,
  disponibleMensual,
  isAuthenticated,
  onLogout,
  activeTab,
  setActiveTab,
  deletePresupuesto,
}) => {
  return (
    <div className="h-screen overflow-y-auto bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <Header
        setIsSidebarOpen={setIsSidebarOpen}
        isSidebarOpen={isSidebarOpen}
        metas={metas}
        disponibleMensual={disponibleMensual}
        isAuthenticated={isAuthenticated}
        onLogout={onLogout}
      />

      {/* Main layout with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          deletePresupuesto={deletePresupuesto}
          isAuthenticated={isAuthenticated}
        />

        {/* Dynamic content rendered here */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;