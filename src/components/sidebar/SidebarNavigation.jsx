import PropTypes from "prop-types";
import NavigationSection from "./NavigationSection";
import DashboardLink from "./DashboardLink";
import AuthenticationSection from "./AuthenticationSection";
import SyncSection from "./SyncSection";

export default function SidebarNavigation({ 
  activeTab, 
  onNavigate, 
  isAuthenticated, 
  onCreateAccount, 
  pendingSync, 
  onManualSync,
  inventoryOnlyMode 
}) {
  const financeMenuItems = [
    {
      path: "/gastos",
      label: "Gastos",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      )
    },
    {
      path: "/categorias",
      label: "Categorías",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      )
    },
    {
      path: "/recordatorios",
      label: "Recordatorios",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      )
    }
  ];

  const inventoryMenuItems = [
    {
      path: "/inventario/productos",
      label: "Productos",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      )
    },
    {
      path: "/inventario/stock",
      label: "Stock",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      )
    },
    {
      path: "/inventario/movimientos",
      label: "Movimientos",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      )
    },
    {
      path: "/inventario/categorias",
      label: "Categorías",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      )
    },
    {
      path: "/inventario/reportes",
      label: "Reportes de Inventario",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      )
    },
    {
      path: "/inventario/configuracion",
      label: "Configuración",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      )
    }
  ];

  const savingsMenuItems = [
    {
      path: "/metas",
      label: "Metas de Ahorro",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      )
    },
    {
      path: "/gestion-ahorro",
      label: "Gestión de Ahorro",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      )
    }
  ];

  const analysisMenuItems = [
    {
      path: "/reportes",
      label: "Reportes",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      )
    }
  ];

  const dataMenuItems = [
    {
      path: "/gestion-datos",
      label: "Importar/Exportar",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
      )
    }
  ];

  return (
    <nav className="flex-1 px-2 py-4 overflow-y-auto">
      <div className="space-y-6">
        {/* Modo Inventario Solamente */}
        {inventoryOnlyMode ? (
          <>
            {/* Dashboard siempre visible */}
            <DashboardLink activeTab={activeTab} onNavigate={onNavigate} />
            
            {/* Solo Gestión de Inventario */}
            <NavigationSection
              title="Gestión de Inventario"
              items={inventoryMenuItems}
              activeTab={activeTab}
              onNavigate={onNavigate}
            />
          </>
        ) : (
          <>
            {/* Modo Completo */}
            {/* Dashboard */}
            <DashboardLink activeTab={activeTab} onNavigate={onNavigate} />

            {/* Gestión de Gastos */}
            <NavigationSection
              title="Gestión de Gastos"
              items={financeMenuItems}
              activeTab={activeTab}
              onNavigate={onNavigate}
            />

            {/* Ahorro */}
            <NavigationSection
              title="Ahorro"
              items={savingsMenuItems}
              activeTab={activeTab}
              onNavigate={onNavigate}
            />

            {/* Análisis */}
            <NavigationSection
              title="Análisis"
              items={analysisMenuItems}
              activeTab={activeTab}
              onNavigate={onNavigate}
            />

            {/* Datos */}
            <NavigationSection
              title="Datos"
              items={dataMenuItems}
              activeTab={activeTab}
              onNavigate={onNavigate}
            />
          </>
        )}

        {/* Sección de cuenta - Solo si NO está autenticado */}
        {!isAuthenticated && (
          <AuthenticationSection onNavigate={onNavigate} onCreateAccount={onCreateAccount} />
        )}

        {/* Sección de sincronización - Solo si ESTÁ autenticado */}
        {isAuthenticated && (
          <SyncSection pendingSync={pendingSync} onManualSync={onManualSync} />
        )}
      </div>
    </nav>
  );
}

SidebarNavigation.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  onCreateAccount: PropTypes.func.isRequired,
  pendingSync: PropTypes.bool.isRequired,
  onManualSync: PropTypes.func.isRequired,
  inventoryOnlyMode: PropTypes.bool.isRequired,
};