import { useMemo, useState } from "react";

const navSections = [
  {
    key: "panel",
    title: "Panel principal",
    items: [{ id: "dashboard", label: "Dashboard", icon: "home" }],
  },
  {
    key: "gastos",
    title: "Gestion de gastos",
    items: [
      { id: "gastos", label: "Gastos", icon: "wallet" },
      { id: "categorias", label: "Categorias", icon: "folder" },
      { id: "recordatorios", label: "Recordatorios", icon: "bell" },
    ],
  },
  {
    key: "inventario",
    title: "Gestion de inventario",
    badge: "Foco",
    items: [
      { id: "inventarioProductos", label: "Productos", icon: "box" },
      { id: "inventarioStock", label: "Stock", icon: "layers" },
      { id: "inventarioMovimientos", label: "Movimientos", icon: "swap" },
      { id: "inventarioCategorias", label: "Categorias", icon: "tag" },
      { id: "inventarioProveedores", label: "Proveedores", icon: "users" },
      { id: "inventarioReportes", label: "Reportes de inventario", icon: "chart" },
      { id: "inventarioConfig", label: "Configuracion", icon: "settings" },
    ],
  },
  {
    key: "facturacion",
    title: "Facturacion electronica",
    items: [
      { id: "facturas", label: "Facturas", icon: "receipt" },
      { id: "clientes", label: "Clientes", icon: "users" },
      { id: "cotizaciones", label: "Cotizaciones", icon: "file" },
      { id: "reportesVentas", label: "Reportes de ventas", icon: "trending" },
      { id: "configDian", label: "Configuracion DIAN", icon: "shield" },
    ],
  },
  {
    key: "ahorro",
    title: "Ahorro",
    items: [
      { id: "metas", label: "Metas de ahorro", icon: "target" },
      { id: "gestionAhorro", label: "Gestion de ahorro", icon: "cash" },
      { id: "reportes", label: "Reportes personales", icon: "chart" },
    ],
  },
];

const accordionModes = [
  { id: "all", label: "Todas" },
  { id: "inventario", label: "Inventario" },
  { id: "facturacion", label: "Facturacion" },
  { id: "ahorro", label: "Ahorro" },
];

const Icon = ({ name }) => {
  const className = "h-4 w-4";

  if (name === "home") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m3 11.25 9-8.25 9 8.25V21H3v-9.75Z" />
      </svg>
    );
  }
  if (name === "wallet") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 7.5A2.5 2.5 0 0 1 5.5 5H20v14H5.5A2.5 2.5 0 0 1 3 16.5v-9Z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20 9h-5a2 2 0 1 0 0 4h5" />
      </svg>
    );
  }
  if (name === "folder") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v8A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-10Z" />
      </svg>
    );
  }
  if (name === "bell") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 1 1-6 0v-1" />
      </svg>
    );
  }
  if (name === "box") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m3 7 9-4 9 4-9 4-9-4Z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 7v10l9 4 9-4V7" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 11v10" />
      </svg>
    );
  }
  if (name === "layers") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m12 3 9 4.5-9 4.5-9-4.5L12 3Z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m3 12 9 4.5 9-4.5" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m3 16.5 9 4.5 9-4.5" />
      </svg>
    );
  }
  if (name === "swap") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 7h14m0 0-3-3m3 3-3 3M17 17H3m0 0 3-3m-3 3 3 3" />
      </svg>
    );
  }
  if (name === "tag") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 7h.01M3 10.5V6a3 3 0 0 1 3-3h4.5a3 3 0 0 1 2.1.9L21 12l-9 9-8.4-8.4a3 3 0 0 1-.9-2.1Z" />
      </svg>
    );
  }
  if (name === "chart") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M5 19V10m7 9V5m7 14v-7" />
      </svg>
    );
  }
  if (name === "settings") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10.3 3h3.4l.6 2.1a7.6 7.6 0 0 1 1.8.8l2-1.1 2.4 2.4-1.1 2a7.6 7.6 0 0 1 .8 1.8l2.1.6v3.4l-2.1.6a7.6 7.6 0 0 1-.8 1.8l1.1 2-2.4 2.4-2-1.1a7.6 7.6 0 0 1-1.8.8l-.6 2.1h-3.4l-.6-2.1a7.6 7.6 0 0 1-1.8-.8l-2 1.1-2.4-2.4 1.1-2a7.6 7.6 0 0 1-.8-1.8L3 13.7v-3.4l2.1-.6a7.6 7.6 0 0 1 .8-1.8l-1.1-2 2.4-2.4 2 1.1a7.6 7.6 0 0 1 1.8-.8L10.3 3Z" />
        <circle cx="12" cy="12" r="2.8" strokeWidth="1.8" />
      </svg>
    );
  }
  if (name === "receipt") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21V3Z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 8h6M9 12h6M9 16h4" />
      </svg>
    );
  }
  if (name === "users") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6 20a5 5 0 1 1 10 0M19 10a2.5 2.5 0 1 0 0-5M22 20a4 4 0 0 0-4-4" />
      </svg>
    );
  }
  if (name === "file") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 3h7l5 5v13H7V3Z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M14 3v5h5M9 13h6M9 17h6" />
      </svg>
    );
  }
  if (name === "trending") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 17l6-6 4 4 7-7" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M14 8h6v6" />
      </svg>
    );
  }
  if (name === "shield") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 3 5 6v6c0 5 3.4 8.6 7 9.9 3.6-1.3 7-4.9 7-9.9V6l-7-3Z" />
      </svg>
    );
  }
  if (name === "target") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="8" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="1" strokeWidth="1.8" />
      </svg>
    );
  }
  if (name === "cash") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="3" y="6" width="18" height="12" rx="2" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="2.5" strokeWidth="1.8" />
      </svg>
    );
  }

  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 12h16" />
    </svg>
  );
};

export default function Sidebar({ activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen, deletePresupuesto }) {
  const [accordionMode, setAccordionMode] = useState("all");

  const visibleSections = useMemo(() => {
    if (accordionMode === "all") return navSections;
    const allowedMap = {
      inventario: new Set(["panel", "inventario"]),
      facturacion: new Set(["panel", "facturacion"]),
      ahorro: new Set(["panel", "ahorro"]),
    };
    const allowed = allowedMap[accordionMode] ?? new Set(["panel"]);
    return navSections.filter((section) => allowed.has(section.key));
  }, [accordionMode]);

  const handleNavigation = (tabId) => {
    setActiveTab(tabId);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-[1px] transition-opacity md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-[21rem] border-r border-slate-200 bg-white shadow-xl transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:h-auto md:z-0 transition duration-300 ease-in-out`}
      >
        <div className="h-full flex flex-col">
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 mb-4">
              <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Modo acordeon</p>
              <div className="flex flex-row justify-between">
                {accordionModes.map((mode) => {
                  const active = accordionMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setAccordionMode(mode.id)}
                      className={`rounded-lg px-3 py-2 text-left text-xs font-medium transition ${
                        active
                          ? "bg-slate-900 text-white"
                          : "bg-white text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {mode.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              {visibleSections.map((section) => (
                <div key={section.title} className="animate-fade-in">
                  <div className="mb-2 flex items-center justify-between px-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{section.title}</p>
                    {section.badge && <span className="status-badge status-info">{section.badge}</span>}
                  </div>

                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const active = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavigation(item.id)}
                          className={`w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                            active
                              ? "bg-slate-900 text-white shadow-sm"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          }`}
                        >
                          <span className={`mr-3 ${active ? "text-white" : "text-slate-400"}`}>
                            <Icon name={item.icon} />
                          </span>
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          <div className="px-4 py-4 border-t border-slate-200 bg-slate-50/70">
            <button
              className="w-full flex items-center justify-center px-3 py-2.5 rounded-xl text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
              onClick={deletePresupuesto}
            >
              Reiniciar aplicacion
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
