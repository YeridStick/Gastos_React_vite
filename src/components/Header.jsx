import { useState, useEffect, useRef } from "react";
import { cantidad } from "../helpers/index";

const parseStorageArray = (keys) => {
  for (const key of keys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const data = JSON.parse(raw);
      if (Array.isArray(data)) return data;
    } catch (error) {
      console.error(`Error al leer ${key}:`, error);
    }
  }
  return [];
};

export default function Header({
  setIsSidebarOpen,
  isSidebarOpen,
  metas = [],
  disponibleMensual = 0,
  activeTab = "dashboard",
  onLogout,
  onNavigate,
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [notificationRefresh, setNotificationRefresh] = useState(0);
  const notificacionesRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificacionesRef.current &&
        !notificacionesRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNotificationRefresh(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const nuevasNotificaciones = [];

    metas.forEach((meta) => {
      if (meta.completada) return;

      if (meta.diasRestantes < 30) {
        nuevasNotificaciones.push({
          id: `tiempo-${meta.id}`,
          titulo: "Fecha limite cercana",
          mensaje: `Tu meta "${meta.nombre}" vence en ${meta.diasRestantes} dias.`,
          tipo: "warning",
          fecha: Date.now(),
        });
      }

      if (meta.ahorroMensual > disponibleMensual && disponibleMensual > 0) {
        nuevasNotificaciones.push({
          id: `presupuesto-${meta.id}`,
          titulo: "Meta dificil de alcanzar",
          mensaje: `Necesitas ahorrar ${cantidad(
            meta.ahorroMensual
          )} al mes para "${meta.nombre}", pero solo tienes disponible ${cantidad(
            disponibleMensual
          )}.`,
          tipo: "danger",
          fecha: Date.now(),
        });
      }

      const porcentajeCompletado = (meta.ahorroAcumulado / meta.monto) * 100;
      const porcentajeTiempoTranscurrido =
        ((new Date() - new Date(meta.creada)) /
          (new Date(meta.fechaObjetivo) - new Date(meta.creada))) *
        100;

      if (porcentajeTiempoTranscurrido > 50 && porcentajeCompletado < 25) {
        nuevasNotificaciones.push({
          id: `progreso-${meta.id}`,
          titulo: "Progreso lento",
          mensaje: `Has completado solo el ${Math.round(
            porcentajeCompletado
          )}% de "${meta.nombre}" y ya ha transcurrido el ${Math.round(
            porcentajeTiempoTranscurrido
          )}% del tiempo.`,
          tipo: "info",
          fecha: Date.now(),
        });
      }
    });

    try {
      const recordatoriosGuardados = localStorage.getItem("recordatorios");

      if (recordatoriosGuardados) {
        const recordatorios = JSON.parse(recordatoriosGuardados);
        const hoy = Date.now();

        const recordatoriosProximos = recordatorios.filter(
          (r) =>
            r.estado === "pendiente" &&
            r.fechaVencimiento >= hoy &&
            (r.fechaVencimiento - hoy) / (1000 * 60 * 60 * 24) <=
              r.diasAnticipacion
        );

        const recordatoriosVencidos = recordatorios.filter(
          (r) =>
            r.estado === "vencido" ||
            (r.estado === "pendiente" && r.fechaVencimiento < hoy)
        );

        recordatoriosProximos.forEach((recordatorio) => {
          const diasRestantes = Math.ceil(
            (recordatorio.fechaVencimiento - hoy) / (1000 * 60 * 60 * 24)
          );

          nuevasNotificaciones.push({
            id: `proximo-${recordatorio.id}`,
            titulo: "Pago proximo",
            mensaje: `Tu pago de "${recordatorio.titulo}" por ${cantidad(
              recordatorio.monto
            )} vence en ${diasRestantes} ${
              diasRestantes === 1 ? "dia" : "dias"
            }.`,
            tipo: "warning",
            fecha: Date.now(),
            link: "recordatorios",
          });
        });

        recordatoriosVencidos.forEach((recordatorio) => {
          const diasVencidos = Math.abs(
            Math.floor(
              (recordatorio.fechaVencimiento - hoy) / (1000 * 60 * 60 * 24)
            )
          );

          nuevasNotificaciones.push({
            id: `vencido-${recordatorio.id}`,
            titulo: "Pago vencido",
            mensaje: `Tu pago de "${recordatorio.titulo}" por ${cantidad(
              recordatorio.monto
            )} esta vencido por ${diasVencidos} ${
              diasVencidos === 1 ? "dia" : "dias"
            }.`,
            tipo: "danger",
            fecha: Date.now(),
            link: "recordatorios",
          });
        });
      }
    } catch (error) {
      console.error("Error al cargar recordatorios para notificaciones:", error);
    }

    try {
      const products = parseStorageArray(["inventario", "Inventario", "productos", "Productos", "inventory", "InventoryItems"]);
      const suppliers = parseStorageArray(["proveedores", "Proveedores", "suppliers"]);
      const settingsRaw = localStorage.getItem("inventarioConfig");
      const settings = settingsRaw ? JSON.parse(settingsRaw) : {};
      const lowStockMultiplier = Number(settings.lowStockMultiplier ?? 1);

      const lowStockProducts = products.filter((p) => {
        const cantidadActual = Number(p.cantidad ?? p.stock ?? p.quantity ?? 0);
        const minimo = Number(p.minimo ?? p.stockMinimo ?? p.minStock ?? 0);
        if (minimo <= 0) return false;
        const limit = Math.max(minimo, Math.ceil(minimo * (Number.isFinite(lowStockMultiplier) ? lowStockMultiplier : 1)));
        return cantidadActual <= limit;
      });

      lowStockProducts.slice(0, 6).forEach((product, idx) => {
        const category = String(product.categoria ?? product.category ?? "").toLowerCase();
        const productName = String(product.nombre ?? product.name ?? "").toLowerCase();
        const matchingSuppliers = suppliers.filter((supplier) => {
          if ((supplier.tipoSuministro ?? "producto") !== "producto") return false;
          const categories = String(supplier.categorias ?? "")
            .split(",")
            .map((v) => v.trim().toLowerCase())
            .filter(Boolean);
          const offeredProducts = String(supplier.productosCatalogo ?? "")
            .split(",")
            .map((v) => v.trim().toLowerCase())
            .filter(Boolean);
          const byCategory = categories.includes(category);
          const byProduct = offeredProducts.some((v) => v === productName || productName.includes(v));
          return byCategory || byProduct;
        });

        const title = matchingSuppliers.length > 0 ? "Stock bajo detectado" : "Stock bajo sin proveedor";
        const detail = matchingSuppliers.length > 0
          ? `Producto "${product.nombre ?? product.name}" con bajo stock. Puedes preparar pedido desde Proveedores.`
          : `Producto "${product.nombre ?? product.name}" con bajo stock y sin proveedor compatible en su categoria.`;

        nuevasNotificaciones.push({
          id: `stock-${product.id ?? idx}`,
          titulo: title,
          mensaje: detail,
          tipo: matchingSuppliers.length > 0 ? "warning" : "danger",
          fecha: Date.now(),
          link: "inventarioProveedores",
        });
      });
    } catch (error) {
      console.error("Error al generar notificaciones de inventario:", error);
    }

    setNotificaciones(nuevasNotificaciones);
  }, [metas, disponibleMensual, notificationRefresh]);

  const handleNotificationClick = (notificacion) => {
    if (notificacion.link) {
      if (typeof onNavigate === "function") {
        onNavigate(notificacion.link);
      }
      setShowNotifications(false);
    }
  };

  const getSectionLabel = () => {
    if (activeTab === "dashboard") return "Panel principal";
    if (["gastos", "categorias", "recordatorios"].includes(activeTab)) {
      return "Gestion de gastos";
    }
    if (activeTab.startsWith("inventario")) {
      return "Gestion de inventario";
    }
    if (
      ["facturas", "clientes", "cotizaciones", "reportesVentas", "configDian"].includes(
        activeTab
      )
    ) {
      return "Facturacion electronica";
    }
    return "Ahorro";
  };

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden mr-3 p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-500"
          >
            <span className="sr-only">Abrir menu</span>
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="hidden sm:flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m3 7 9-4 9 4-9 4-9-4Zm0 0v10l9 4 9-4V7"
                />
              </svg>
            </div>
            <div className="ml-2">
              <p className="text-sm font-semibold text-slate-900">Sistema administrativo</p>
              <p className="text-xs text-slate-500">{getSectionLabel()}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {onLogout && (
            <button
              onClick={onLogout}
              className="hidden sm:inline-flex rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cerrar sesion
            </button>
          )}
          <div className="relative" ref={notificacionesRef}>
            <button
              className="p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 relative transition-colors"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <span className="sr-only">Ver notificaciones</span>
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>

              {notificaciones.length > 0 && (
                <span className="absolute top-0 right-0 block h-3 w-3 sm:h-4 sm:w-4 rounded-full ring-2 ring-white bg-rose-500 text-white text-xs flex items-center justify-center font-medium">
                  {notificaciones.length > 9 ? "9+" : notificaciones.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="origin-top-right absolute right-0 mt-2 w-64 sm:w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-2 px-3 sm:px-4 border-b border-slate-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs sm:text-sm font-medium text-slate-900">
                      Notificaciones
                    </h3>
                    {notificaciones.length > 0 && (
                      <button
                        className="text-xs text-slate-500 hover:text-slate-700"
                        onClick={() => setNotificaciones([])}
                      >
                        Marcar todas
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-60 sm:max-h-80 overflow-y-auto">
                  {notificaciones.length > 0 ? (
                    <div className="divide-y divide-slate-200">
                      {notificaciones.map((notificacion) => (
                        <div
                          key={notificacion.id}
                          className={`px-3 sm:px-4 py-2 sm:py-3 hover:bg-slate-50 ${
                            notificacion.link ? "cursor-pointer" : ""
                          }`}
                          onClick={() =>
                            notificacion.link &&
                            handleNotificationClick(notificacion)
                          }
                        >
                          <div className="flex items-start">
                            <div
                              className={`flex-shrink-0 rounded-full p-1 ${
                                notificacion.tipo === "danger"
                                  ? "bg-rose-100 text-rose-600"
                                  : notificacion.tipo === "warning"
                                  ? "bg-amber-100 text-amber-600"
                                  : "bg-sky-100 text-sky-600"
                              }`}
                            >
                              {notificacion.tipo === "danger" && (
                                <svg
                                  className="h-3 w-3 sm:h-4 sm:w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                  />
                                </svg>
                              )}
                              {notificacion.tipo === "warning" && (
                                <svg
                                  className="h-3 w-3 sm:h-4 sm:w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              )}
                              {notificacion.tipo === "info" && (
                                <svg
                                  className="h-3 w-3 sm:h-4 sm:w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              )}
                            </div>
                            <div className="ml-2 sm:ml-3 flex-1">
                              <p className="text-xs sm:text-sm font-medium text-slate-900">
                                {notificacion.titulo}
                              </p>
                              <p className="mt-0.5 sm:mt-1 text-xs text-slate-500 line-clamp-2">
                                {notificacion.mensaje}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-center text-xs sm:text-sm text-slate-500">
                      No hay notificaciones pendientes
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
