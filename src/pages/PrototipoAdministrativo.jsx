import { useEffect, useMemo, useState } from "react";

const INVENTORY_KEYS = ["inventario", "Inventario", "productos", "Productos", "inventory", "InventoryItems"];
const MOVEMENTS_KEYS = ["movimientosInventario", "MovimientosInventario", "movimientos", "Movimientos"];
const CATEGORY_KEYS = ["categoriasInventario", "CategoriasInventario", "inventoryCategories"];
const SUPPLIERS_KEYS = ["proveedores", "Proveedores", "suppliers"];
const BILLING_KEYS = ["facturas", "Facturas", "clientes", "Clientes", "cotizaciones", "Cotizaciones"];
const SALES_KEYS = ["ventas", "Ventas", "ventasSimuladas", "VentasSimuladas", "historialVentas", "HistorialVentas", "facturas", "Facturas"];
const INVENTORY_CONFIG_KEY = "inventarioConfig";

const META = {
  inventarioDashboard: ["Dashboard inventario", "Resumen financiero y operativo del inventario.", "Gestion de inventario"],
  inventarioProductos: ["Productos", "Gestion de productos del inventario.", "Gestion de inventario"],
  inventarioStock: ["Stock", "Control de cantidades y alertas de stock bajo.", "Gestion de inventario"],
  inventarioMovimientos: ["Movimientos", "Entradas y salidas de inventario.", "Gestion de inventario"],
  inventarioCategorias: ["Categorias", "Administracion de categorias de productos.", "Gestion de inventario"],
  inventarioProveedores: ["Proveedores", "Gestion de proveedores y contratos.", "Gestion de inventario"],
  inventarioReportes: ["Reportes de inventario", "Resumen operativo basado en localStorage.", "Gestion de inventario"],
  inventarioConfig: ["Configuracion", "Parametros funcionales del inventario.", "Gestion de inventario"],
  facturas: ["Facturas", "Estado de facturas en almacenamiento local.", "Facturacion electronica"],
  clientes: ["Clientes", "Clientes detectados en almacenamiento local.", "Facturacion electronica"],
  cotizaciones: ["Cotizaciones", "Cotizaciones comerciales guardadas localmente.", "Facturacion electronica"],
  reportesVentas: ["Ventas", "Resumen y registro de ventas con margen.", "Facturacion electronica"],
  configDian: ["Configuracion DIAN", "Parametros de facturacion electronica para el prototipo.", "Facturacion electronica"],
};

const DEFAULT_SETTINGS = {
  lowStockMultiplier: 1,
  restockTargetMultiplier: 2,
  defaultMarkupPercent: 30,
  volumeDiscountUnits: 20,
  volumeDiscountPercent: 10,
  agingDays: 45,
  agingDiscountPercent: 8,
};

const PRODUCT_FORM = {
  nombre: "",
  categoria: "",
  cantidad: 0,
  minimo: 0,
  costoUnitario: 0,
  precioVenta: 0,
  proveedorId: "",
};
const MOVE_FORM = { productId: "", tipo: "entrada", cantidad: 1, detalle: "" };
const SALE_FORM = { productId: "", cantidad: 1, descuentoPct: 0, cliente: "" };
const SUPPLIER_FORM = {
  nombre: "",
  nit: "",
  email: "",
  telefono: "",
  tipoSuministro: "producto",
  categorias: "",
  productosCatalogo: "",
  costoUnitarioProducto: 0,
  servicioNombre: "",
  servicioTarifaMensual: 0,
  tipoContrato: "",
  vigenciaInicio: "",
  vigenciaFin: "",
  condiciones: "",
};

const toNum = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

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

const parseStorageArrays = (keys) => {
  const out = [];
  keys.forEach((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (Array.isArray(data)) out.push(...data);
    } catch (error) {
      console.error(`Error al leer ${key}:`, error);
    }
  });
  return out;
};

const findStorageKey = (keys, fallback) => keys.find((k) => localStorage.getItem(k) !== null) ?? fallback;

const readSettings = () => {
  try {
    const raw = localStorage.getItem(INVENTORY_CONFIG_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const data = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...data };
  } catch (error) {
    console.error("Error al leer configuracion de inventario:", error);
    return DEFAULT_SETTINGS;
  }
};

const normalizeProducts = (rows) =>
  rows.map((item, index) => {
    const costoUnitario = toNum(item.costoUnitario ?? item.costo ?? item.precio ?? item.valor ?? item.price);
    const precioVenta = toNum(item.precioVenta ?? item.precioVentaUnitario ?? item.salePrice ?? item.precio);
    return {
      id: item.id ?? item.codigo ?? `prod-${index}`,
      nombre: item.nombre ?? item.name ?? "Producto sin nombre",
      categoria: item.categoria ?? item.category ?? "Sin categoria",
      cantidad: toNum(item.cantidad ?? item.stock ?? item.quantity),
      minimo: toNum(item.minimo ?? item.stockMinimo ?? item.minStock),
      costoUnitario,
      precioVenta: precioVenta || costoUnitario,
      proveedorId: item.proveedorId ?? item.supplierId ?? "",
      createdAt: item.createdAt ?? item.fechaCreacion ?? Date.now(),
      updatedAt: item.updatedAt ?? Date.now(),
    };
  });

const normalizeMoves = (rows) =>
  rows.map((item, index) => ({
    id: item.id ?? `mov-${index}`,
    fecha: item.fecha ?? item.date ?? Date.now(),
    tipo: (item.tipo ?? item.type ?? "movimiento").toString().toLowerCase(),
    detalle: item.detalle ?? item.descripcion ?? item.description ?? "Sin detalle",
    cantidad: toNum(item.cantidad ?? item.quantity),
    productId: item.productId ?? "",
    producto: item.producto ?? "",
    montoCompra: toNum(item.montoCompra ?? 0),
    montoVenta: toNum(item.montoVenta ?? 0),
  }));

const normalizeSales = (rows) =>
  rows.map((item, index) => {
    const total = toNum(item.total ?? item.valorTotal ?? item.monto ?? item.valor ?? item.subtotal);
    const costo = toNum(item.costo ?? item.costoTotal ?? 0);
    return {
      id: item.id ?? item.numero ?? `venta-${index}`,
      documento: item.numeroFactura ?? item.numero ?? item.id ?? `V-${index + 1}`,
      cliente: item.cliente ?? item.nombreCliente ?? item.customer ?? "Cliente general",
      fecha: item.fecha ?? item.date ?? item.createdAt ?? Date.now(),
      estado: (item.estado ?? item.status ?? "registrada").toString().toLowerCase(),
      productId: item.productId ?? "",
      producto: item.producto ?? item.productName ?? "",
      cantidad: toNum(item.cantidad ?? item.itemsCount ?? 0),
      precioUnitario: toNum(item.precioUnitario ?? item.unitPrice ?? 0),
      descuentoPct: toNum(item.descuentoPct ?? item.discountPercent ?? 0),
      total,
      costo,
      ganancia: toNum(item.ganancia ?? total - costo),
      itemsCount: Array.isArray(item.items) ? item.items.length : toNum(item.cantidadItems ?? item.itemsCount ?? item.cantidad),
    };
  });

const normalizeSuppliers = (rows) =>
  rows.map((row, index) => ({
    id: row.id ?? `prov-${index}`,
    nombre: row.nombre ?? "Proveedor sin nombre",
    nit: row.nit ?? "",
    email: row.email ?? "",
    telefono: row.telefono ?? "",
    tipoSuministro: row.tipoSuministro ?? "producto",
    categorias: row.categorias ?? "",
    productosCatalogo: row.productosCatalogo ?? "",
    costoUnitarioProducto: toNum(row.costoUnitarioProducto ?? row.costoUnitario ?? 0),
    servicioNombre: row.servicioNombre ?? "",
    servicioTarifaMensual: toNum(row.servicioTarifaMensual ?? 0),
    tipoContrato: row.tipoContrato ?? "",
    vigenciaInicio: row.vigenciaInicio ?? "",
    vigenciaFin: row.vigenciaFin ?? "",
    condiciones: row.condiciones ?? "",
    activo: row.activo ?? true,
  }));

const money = (value) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(toNum(value));
const shortDate = (value) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("es-CO");
};
const dateKey = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const monthKey = (value) => dateKey(value).slice(0, 7);
const todayISO = () => dateKey(Date.now());
const currentMonthISO = () => monthKey(Date.now());

const Empty = ({ message }) => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">{message}</div>
);

const statusClass = (kind) =>
  ({
    success: "status-success",
    warning: "status-warning",
    danger: "status-danger",
    info: "status-info",
  }[kind] ?? "status-info");

const csvToArray = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

const looksLikeSale = (movement) => {
  const t = String(movement?.tipo || "").toLowerCase();
  if (t === "venta") return true;
  if (t !== "salida") return false;
  const detail = String(movement?.detalle || "").toLowerCase();
  return detail.includes("venta");
};

export default function PrototipoAdministrativo({ vista }) {
  const [title, description, section] = META[vista] ?? ["Modulo administrativo", "Vista de apoyo para el prototipo.", "Administracion"];

  const productsKey = useMemo(() => findStorageKey(INVENTORY_KEYS, "inventario"), []);
  const movementsKey = useMemo(() => findStorageKey(MOVEMENTS_KEYS, "movimientosInventario"), []);
  const categoriesKey = useMemo(() => findStorageKey(CATEGORY_KEYS, "categoriasInventario"), []);
  const suppliersKey = useMemo(() => findStorageKey(SUPPLIERS_KEYS, "proveedores"), []);
  const salesKey = useMemo(() => findStorageKey(SALES_KEYS, "ventas"), []);

  const [settings, setSettings] = useState(readSettings());
  const [products, setProducts] = useState(() => normalizeProducts(parseStorageArray(INVENTORY_KEYS)));
  const [moves, setMoves] = useState(() => normalizeMoves(parseStorageArray(MOVEMENTS_KEYS)));
  const [sales, setSales] = useState(() => normalizeSales(parseStorageArrays(SALES_KEYS)));
  const [suppliers, setSuppliers] = useState(() => normalizeSuppliers(parseStorageArray(SUPPLIERS_KEYS)));
  const [billingRows, setBillingRows] = useState(() => parseStorageArray(BILLING_KEYS));
  const [categories, setCategories] = useState(() => {
    const custom = parseStorageArray(CATEGORY_KEYS).map((item) => (typeof item === "string" ? item : item?.nombre)).filter(Boolean);
    if (custom.length > 0) return [...new Set(custom)];
    return [...new Set(normalizeProducts(parseStorageArray(INVENTORY_KEYS)).map((p) => p.categoria).filter(Boolean))];
  });

  const [productForm, setProductForm] = useState(PRODUCT_FORM);
  const [editingProductId, setEditingProductId] = useState("");
  const [moveForm, setMoveForm] = useState(MOVE_FORM);
  const [saleForm, setSaleForm] = useState(SALE_FORM);
  const [supplierForm, setSupplierForm] = useState(SUPPLIER_FORM);
  const [editingSupplierId, setEditingSupplierId] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [purchaseDraft, setPurchaseDraft] = useState(() =>
    parseStorageArray(["pedidoBorradorProveedor"]).map((item) => ({
      ...item,
      estado: item.estado ?? "pendiente",
    }))
  );
  const [selectedDailyDate, setSelectedDailyDate] = useState(todayISO());
  const [selectedMonth, setSelectedMonth] = useState(currentMonthISO());

  useEffect(() => {
    setProducts(normalizeProducts(parseStorageArray(INVENTORY_KEYS)));
    setMoves(normalizeMoves(parseStorageArray(MOVEMENTS_KEYS)));
    setSales(normalizeSales(parseStorageArrays(SALES_KEYS)));
    setSuppliers(normalizeSuppliers(parseStorageArray(SUPPLIERS_KEYS)));
    setBillingRows(parseStorageArray(BILLING_KEYS));
  }, [vista]);

  useEffect(() => localStorage.setItem(productsKey, JSON.stringify(products)), [products, productsKey]);
  useEffect(() => localStorage.setItem(movementsKey, JSON.stringify(moves)), [moves, movementsKey]);
  useEffect(() => localStorage.setItem(categoriesKey, JSON.stringify(categories)), [categories, categoriesKey]);
  useEffect(() => localStorage.setItem(suppliersKey, JSON.stringify(suppliers)), [suppliers, suppliersKey]);
  useEffect(() => localStorage.setItem(salesKey, JSON.stringify(sales)), [sales, salesKey]);
  useEffect(() => localStorage.setItem(INVENTORY_CONFIG_KEY, JSON.stringify(settings)), [settings]);
  useEffect(() => localStorage.setItem("pedidoBorradorProveedor", JSON.stringify(purchaseDraft)), [purchaseDraft]);

  const isInventoryView = vista?.startsWith("inventario");
  const isBillingView = vista?.startsWith("fact") || ["clientes", "cotizaciones", "configDian"].includes(vista);

  const lowStockLimit = (product) => Math.max(product.minimo, Math.ceil(product.minimo * toNum(settings.lowStockMultiplier)));
  const restockTarget = (product) =>
    Math.max(
      lowStockLimit(product),
      Math.ceil(lowStockLimit(product) * Math.max(1, toNum(settings.restockTargetMultiplier)))
    );
  const isLowStock = (product) => product.minimo > 0 && product.cantidad <= lowStockLimit(product);
  const lowStockItems = products.filter((p) => isLowStock(p));

  const findSupplierOptionsForProduct = (product) => {
    const category = String(product.categoria || "").toLowerCase();
    const productName = String(product.nombre || "").toLowerCase();

    return suppliers
      .filter((supplier) => supplier.tipoSuministro === "producto")
      .filter((supplier) => {
        const categoriesCovered = csvToArray(supplier.categorias);
        const productsCovered = csvToArray(supplier.productosCatalogo);
        const byCategory = categoriesCovered.includes(category);
        const byProduct = productsCovered.some((name) => name === productName || productName.includes(name));
        return byCategory || byProduct;
      });
  };

  const restockSuggestions = lowStockItems.map((product) => {
    const target = restockTarget(product);
    const unitsNeeded = Math.max(0, target - product.cantidad);
    const supplierOptions = findSupplierOptionsForProduct(product);
    const optionsWithCost = supplierOptions.map((supplier) => ({
      supplier,
      unitCost:
        toNum(supplier.costoUnitarioProducto) > 0
          ? toNum(supplier.costoUnitarioProducto)
          : toNum(product.costoUnitario),
    }));

    const bestOption = optionsWithCost.sort((a, b) => a.unitCost - b.unitCost)[0];
    const estimatedCost = unitsNeeded * (bestOption?.unitCost ?? toNum(product.costoUnitario));

    return {
      product,
      target,
      unitsNeeded,
      supplierOptions,
      bestOption,
      estimatedCost,
    };
  });

  const inventoryValueAtCost = products.reduce((acc, p) => acc + p.cantidad * p.costoUnitario, 0);
  const inventoryValueAtSale = products.reduce((acc, p) => acc + p.cantidad * p.precioVenta, 0);
  const saleRows = useMemo(() => moves.filter((m) => looksLikeSale(m)), [moves]);
  const purchaseRows = useMemo(
    () => moves.filter((m) => !looksLikeSale(m) && toNum(m.montoCompra) > 0),
    [moves]
  );

  const saleAmountFromMove = (move) => {
    const explicit = toNum(move.montoVenta);
    if (explicit > 0) return explicit;
    const product = products.find((p) => p.id === move.productId);
    if (!product) return 0;
    return Math.max(0, toNum(move.cantidad)) * toNum(product.precioVenta);
  };

  const saleCostFromMove = (move) => {
    const explicit = toNum(move.montoCompra);
    if (explicit > 0) return explicit;
    const product = products.find((p) => p.id === move.productId);
    if (!product) return 0;
    return Math.max(0, toNum(move.cantidad)) * toNum(product.costoUnitario);
  };

  const totalInvestment = purchaseRows.reduce((acc, m) => acc + toNum(m.montoCompra), 0);
  const totalSales = saleRows.reduce((acc, m) => acc + saleAmountFromMove(m), 0);
  const totalSalesCost = saleRows.reduce((acc, m) => acc + saleCostFromMove(m), 0);
  const totalProfit = totalSales - totalSalesCost;
  const soldUnits = saleRows.reduce((acc, s) => acc + toNum(s.cantidad), 0);
  const salesCount = saleRows.length;

  const dailyRows = useMemo(() => moves.filter((m) => dateKey(m.fecha) === selectedDailyDate), [moves, selectedDailyDate]);
  const dailyInvestment = dailyRows.filter((m) => !looksLikeSale(m)).reduce((acc, m) => acc + toNum(m.montoCompra), 0);
  const dailySalesRows = dailyRows.filter((m) => looksLikeSale(m));
  const dailySales = dailySalesRows.reduce((acc, m) => acc + saleAmountFromMove(m), 0);
  const dailySalesCost = dailySalesRows.reduce((acc, m) => acc + saleCostFromMove(m), 0);
  const dailyProfit = dailySales - dailySalesCost;
  const dailySalesUnits = dailySalesRows.reduce((acc, m) => acc + toNum(m.cantidad), 0);
  const dailySalesCount = dailySalesRows.length;

  const monthlyRows = useMemo(() => moves.filter((m) => monthKey(m.fecha) === selectedMonth), [moves, selectedMonth]);
  const monthlyInvestment = monthlyRows.filter((m) => !looksLikeSale(m)).reduce((acc, m) => acc + toNum(m.montoCompra), 0);
  const monthlySalesRows = monthlyRows.filter((m) => looksLikeSale(m));
  const monthlySales = monthlySalesRows.reduce((acc, m) => acc + saleAmountFromMove(m), 0);
  const monthlySalesCost = monthlySalesRows.reduce((acc, m) => acc + saleCostFromMove(m), 0);
  const monthlyProfit = monthlySales - monthlySalesCost;
  const monthlySalesUnits = monthlySalesRows.reduce((acc, m) => acc + toNum(m.cantidad), 0);
  const monthlySalesCount = monthlySalesRows.length;

  const pushMove = (payload) =>
    setMoves((prev) => [
      { id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`, fecha: Date.now(), ...payload },
      ...prev,
    ]);

  const resetProductForm = () => {
    setProductForm(PRODUCT_FORM);
    setEditingProductId("");
  };

  const saveProduct = () => {
    const nombre = productForm.nombre.trim();
    const categoria = productForm.categoria.trim() || "Sin categoria";
    if (!nombre) return;

    const costoUnitario = toNum(productForm.costoUnitario);
    const precioVenta =
      toNum(productForm.precioVenta) > 0
        ? toNum(productForm.precioVenta)
        : Math.round(costoUnitario * (1 + toNum(settings.defaultMarkupPercent) / 100));

    const existing = products.find((p) => p.id === editingProductId);
    const payload = {
      id: editingProductId || `prod-${Date.now()}`,
      nombre,
      categoria,
      cantidad: Math.max(0, toNum(productForm.cantidad)),
      minimo: Math.max(0, toNum(productForm.minimo)),
      costoUnitario,
      precioVenta,
      proveedorId: productForm.proveedorId || "",
      createdAt: existing?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    };

    if (editingProductId) {
      setProducts((prev) => prev.map((p) => (p.id === editingProductId ? payload : p)));
      pushMove({
        tipo: "ajuste",
        cantidad: payload.cantidad,
        detalle: `Edicion de producto ${payload.nombre}`,
        productId: payload.id,
        producto: payload.nombre,
      });
    } else {
      setProducts((prev) => [payload, ...prev]);
      if (payload.cantidad > 0) {
        pushMove({
          tipo: "entrada",
          cantidad: payload.cantidad,
          detalle: `Alta de producto ${payload.nombre}`,
          productId: payload.id,
          producto: payload.nombre,
          montoCompra: payload.cantidad * payload.costoUnitario,
          montoVenta: 0,
        });
      }
    }

    if (!categories.includes(categoria)) setCategories((prev) => [categoria, ...prev]);
    resetProductForm();
  };

  const editProduct = (product) => {
    setEditingProductId(product.id);
    setProductForm({
      nombre: product.nombre,
      categoria: product.categoria,
      cantidad: product.cantidad,
      minimo: product.minimo,
      costoUnitario: product.costoUnitario,
      precioVenta: product.precioVenta,
      proveedorId: product.proveedorId || "",
    });
  };

  const deleteProduct = (id) => {
    const row = products.find((p) => p.id === id);
    if (!row) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    pushMove({
      tipo: "salida",
      cantidad: row.cantidad,
      detalle: `Eliminacion de producto ${row.nombre}`,
      productId: row.id,
      producto: row.nombre,
    });
    if (editingProductId === id) resetProductForm();
  };

  const adjustStock = (id, delta) => {
    const row = products.find((p) => p.id === id);
    if (!row) return;
    const quantity = Math.max(0, row.cantidad + delta);
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, cantidad: quantity, updatedAt: Date.now() } : p)));
    pushMove({
      tipo: delta > 0 ? "entrada" : "salida",
      cantidad: Math.abs(delta),
      detalle: `Ajuste rapido de stock para ${row.nombre}`,
      productId: row.id,
      producto: row.nombre,
      montoCompra: delta > 0 ? Math.abs(delta) * row.costoUnitario : 0,
      montoVenta: 0,
    });
  };

  const saveMove = () => {
    const quantity = Math.max(1, toNum(moveForm.cantidad));
    const row = products.find((p) => p.id === moveForm.productId);
    if (!row) return;
    if (row) {
      const isOut = moveForm.tipo === "salida" || moveForm.tipo === "venta";
      const delta = isOut ? -quantity : quantity;
      const nextQty = Math.max(0, row.cantidad + delta);
      if (isOut && row.cantidad < quantity) return;
      setProducts((prev) => prev.map((p) => (p.id === row.id ? { ...p, cantidad: nextQty, updatedAt: Date.now() } : p)));
    }

    const isSale = moveForm.tipo === "venta";
    const saleTotal = isSale ? quantity * toNum(row?.precioVenta) : 0;
    const saleCost = isSale ? quantity * toNum(row?.costoUnitario) : 0;

    pushMove({
      tipo: moveForm.tipo,
      cantidad: quantity,
      detalle: moveForm.detalle.trim() || "Movimiento manual",
      productId: row?.id ?? "",
      producto: row?.nombre ?? "",
      montoCompra: moveForm.tipo === "entrada" ? quantity * (row?.costoUnitario ?? 0) : saleCost,
      montoVenta: isSale ? saleTotal : 0,
    });

    if (isSale) {
      const sale = {
        id: `sale-${Date.now()}`,
        documento: `VM-${Date.now().toString().slice(-6)}`,
        cliente: "Venta manual",
        fecha: Date.now(),
        estado: "completada",
        productId: row.id,
        producto: row.nombre,
        cantidad: quantity,
        precioUnitario: toNum(row.precioVenta),
        descuentoPct: 0,
        total: saleTotal,
        costo: saleCost,
        ganancia: saleTotal - saleCost,
        itemsCount: quantity,
      };
      setSales((prev) => [sale, ...prev]);
    }

    setMoveForm(MOVE_FORM);
  };

  const addCategory = () => {
    const next = newCategory.trim();
    if (!next || categories.includes(next)) return;
    setCategories((prev) => [next, ...prev]);
    setNewCategory("");
  };

  const deleteCategory = (name) => {
    if (products.some((p) => p.categoria === name)) return;
    setCategories((prev) => prev.filter((c) => c !== name));
  };

  const resetSupplierForm = () => {
    setSupplierForm(SUPPLIER_FORM);
    setEditingSupplierId("");
  };

  const saveSupplier = () => {
    const nombre = supplierForm.nombre.trim();
    if (!nombre) return;
    const payload = {
      id: editingSupplierId || `prov-${Date.now()}`,
      nombre,
      nit: supplierForm.nit.trim(),
      email: supplierForm.email.trim(),
      telefono: supplierForm.telefono.trim(),
      tipoSuministro: supplierForm.tipoSuministro,
      categorias: supplierForm.categorias.trim(),
      productosCatalogo: supplierForm.productosCatalogo.trim(),
      costoUnitarioProducto: toNum(supplierForm.costoUnitarioProducto),
      servicioNombre: supplierForm.servicioNombre.trim(),
      servicioTarifaMensual: toNum(supplierForm.servicioTarifaMensual),
      tipoContrato: supplierForm.tipoContrato.trim(),
      vigenciaInicio: supplierForm.vigenciaInicio,
      vigenciaFin: supplierForm.vigenciaFin,
      condiciones: supplierForm.condiciones.trim(),
      activo: true,
    };
    if (editingSupplierId) {
      setSuppliers((prev) => prev.map((s) => (s.id === editingSupplierId ? payload : s)));
    } else {
      setSuppliers((prev) => [payload, ...prev]);
    }
    resetSupplierForm();
  };

  const editSupplier = (supplier) => {
    setEditingSupplierId(supplier.id);
    setSupplierForm({
      nombre: supplier.nombre,
      nit: supplier.nit,
      email: supplier.email,
      telefono: supplier.telefono,
      tipoSuministro: supplier.tipoSuministro ?? "producto",
      categorias: supplier.categorias ?? "",
      productosCatalogo: supplier.productosCatalogo ?? "",
      costoUnitarioProducto: toNum(supplier.costoUnitarioProducto),
      servicioNombre: supplier.servicioNombre ?? "",
      servicioTarifaMensual: toNum(supplier.servicioTarifaMensual),
      tipoContrato: supplier.tipoContrato,
      vigenciaInicio: supplier.vigenciaInicio,
      vigenciaFin: supplier.vigenciaFin,
      condiciones: supplier.condiciones,
    });
  };

  const deleteSupplier = (id) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    if (editingSupplierId === id) resetSupplierForm();
    setProducts((prev) => prev.map((p) => (p.proveedorId === id ? { ...p, proveedorId: "" } : p)));
  };

  const addToPurchaseDraft = (suggestion) => {
    if (!suggestion || suggestion.unitsNeeded <= 0 || !suggestion.bestOption) return;
    const exists = purchaseDraft.some(
      (item) =>
        item.productId === suggestion.product.id &&
        item.proveedorId === suggestion.bestOption.supplier.id
    );
    if (exists) return;

    const row = {
      id: `draft-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      fecha: Date.now(),
      estado: "pendiente",
      productId: suggestion.product.id,
      producto: suggestion.product.nombre,
      categoria: suggestion.product.categoria,
      proveedorId: suggestion.bestOption.supplier.id,
      proveedor: suggestion.bestOption.supplier.nombre,
      unidades: suggestion.unitsNeeded,
      costoUnitario: suggestion.bestOption.unitCost,
      subtotal: suggestion.estimatedCost,
    };
    setPurchaseDraft((prev) => [row, ...prev]);
  };

  const removeFromPurchaseDraft = (id) => {
    setPurchaseDraft((prev) => prev.filter((item) => item.id !== id));
  };

  const approvePurchaseDraft = (id) => {
    const row = purchaseDraft.find((item) => item.id === id);
    if (!row || row.estado === "aprobada") return;
    const product = products.find((p) => p.id === row.productId);
    if (!product) return;

    const units = Math.max(0, toNum(row.unidades));
    const unitCost = Math.max(0, toNum(row.costoUnitario));
    const incomingCost = units * unitCost;
    const currentCost = product.costoUnitario * product.cantidad;
    const newQty = product.cantidad + units;
    const weightedCost = newQty > 0 ? (currentCost + incomingCost) / newQty : product.costoUnitario;

    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id
          ? {
              ...p,
              cantidad: newQty,
              costoUnitario: Number(weightedCost.toFixed(2)),
              updatedAt: Date.now(),
            }
          : p
      )
    );

    pushMove({
      tipo: "entrada",
      cantidad: units,
      detalle: `Compra aprobada a proveedor ${row.proveedor}`,
      productId: product.id,
      producto: product.nombre,
      montoCompra: incomingCost,
      montoVenta: 0,
    });

    setPurchaseDraft((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, estado: "aprobada", fechaAprobacion: Date.now() }
          : item
      )
    );
  };

  const selectedSaleProduct = products.find((p) => p.id === saleForm.productId);
  const suggestedSalePrice = Math.round(
    Math.max(0, toNum(productForm.costoUnitario)) *
      (1 + Math.max(0, toNum(settings.defaultMarkupPercent)) / 100)
  );
  const soldThisMonthByProduct = (productId) => {
    const now = new Date();
    return sales
      .filter((s) => s.productId === productId)
      .filter((s) => {
        const d = new Date(s.fecha);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((acc, s) => acc + s.cantidad, 0);
  };

  const buildDiscountSuggestion = (product) => {
    if (!product) return [];
    const messages = [];
    const soldUnitsMonth = soldThisMonthByProduct(product.id);
    if (soldUnitsMonth >= toNum(settings.volumeDiscountUnits)) {
      messages.push(`Alta rotacion: sugiere ${toNum(settings.volumeDiscountPercent)}% de descuento para impulsar volumen.`);
    }
    const daysInStock = Math.floor((Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    if (daysInStock >= toNum(settings.agingDays) && product.cantidad > 0) {
      messages.push(`Stock antiguo (${daysInStock} dias): sugiere ${toNum(settings.agingDiscountPercent)}% de descuento.`);
    }
    return messages;
  };

  const saleSuggestions = buildDiscountSuggestion(selectedSaleProduct);

  const registerSale = () => {
    const product = products.find((p) => p.id === saleForm.productId);
    const qty = Math.max(1, toNum(saleForm.cantidad));
    const discount = Math.min(90, Math.max(0, toNum(saleForm.descuentoPct)));
    if (!product) return;
    if (qty > product.cantidad) return;

    const gross = qty * product.precioVenta;
    const total = gross * (1 - discount / 100);
    const cost = qty * product.costoUnitario;
    const profit = total - cost;

    const sale = {
      id: `sale-${Date.now()}`,
      documento: `V-${Date.now().toString().slice(-6)}`,
      cliente: saleForm.cliente.trim() || "Cliente general",
      fecha: Date.now(),
      estado: "completada",
      productId: product.id,
      producto: product.nombre,
      cantidad: qty,
      precioUnitario: product.precioVenta,
      descuentoPct: discount,
      total,
      costo: cost,
      ganancia: profit,
      itemsCount: qty,
    };

    setSales((prev) => [sale, ...prev]);
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, cantidad: p.cantidad - qty, updatedAt: Date.now() } : p))
    );
    pushMove({
      tipo: "venta",
      cantidad: qty,
      detalle: `Venta de ${product.nombre}`,
      productId: product.id,
      producto: product.nombre,
      montoCompra: cost,
      montoVenta: total,
    });
    setSaleForm(SALE_FORM);
  };

  const saveSettings = () => {
    setSettings((prev) => ({
      ...prev,
      lowStockMultiplier: Math.max(1, toNum(prev.lowStockMultiplier)),
      restockTargetMultiplier: Math.max(1, toNum(prev.restockTargetMultiplier)),
      defaultMarkupPercent: Math.max(0, toNum(prev.defaultMarkupPercent)),
      volumeDiscountUnits: Math.max(1, toNum(prev.volumeDiscountUnits)),
      volumeDiscountPercent: Math.max(0, toNum(prev.volumeDiscountPercent)),
      agingDays: Math.max(1, toNum(prev.agingDays)),
      agingDiscountPercent: Math.max(0, toNum(prev.agingDiscountPercent)),
    }));
  };

  const productStatus = (p) => {
    if (p.cantidad <= 0) return ["Agotado", "danger"];
    if (isLowStock(p)) return ["Stock bajo", "warning"];
    return ["Disponible", "success"];
  };

  return (
    <div className="space-y-4">
      <div className="panel-header">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{section}</p>
        <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>

      {isInventoryView && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="panel-card"><p className="panel-kpi-label">Productos registrados</p><p className="panel-kpi-value text-slate-900">{products.length}</p></div>
          <div className="panel-card"><p className="panel-kpi-label">Stock bajo</p><p className="panel-kpi-value text-amber-600">{lowStockItems.length}</p></div>
          <div className="panel-card"><p className="panel-kpi-label">Inversion total</p><p className="panel-kpi-value text-rose-700">{money(totalInvestment)}</p></div>
          <div className="panel-card"><p className="panel-kpi-label">Ventas y ganancia</p><p className="panel-kpi-value text-emerald-700">{money(totalSales)} / {money(totalProfit)}</p></div>
        </div>
      )}

      {vista === "inventarioDashboard" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="panel-card"><p className="panel-kpi-label">Inversion total</p><p className="panel-kpi-value text-rose-700">{money(totalInvestment)}</p></div>
            <div className="panel-card"><p className="panel-kpi-label">Ventas totales</p><p className="panel-kpi-value text-emerald-700">{money(totalSales)}</p></div>
            <div className="panel-card"><p className="panel-kpi-label">Ganancia total</p><p className="panel-kpi-value text-sky-700">{money(totalProfit)}</p></div>
            <div className="panel-card"><p className="panel-kpi-label">Ventas realizadas</p><p className="panel-kpi-value text-slate-900">{salesCount}</p></div>
            <div className="panel-card"><p className="panel-kpi-label">Unidades vendidas</p><p className="panel-kpi-value text-slate-900">{soldUnits}</p></div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="panel-card">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Resumen diario</h3>
                  <p className="mt-1 text-xs text-slate-500">Control de inversion, ventas y ganancia para una fecha puntual.</p>
                </div>
                <label className="text-xs text-slate-600">
                  Fecha
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    type="date"
                    value={selectedDailyDate}
                    onChange={(e) => setSelectedDailyDate(e.target.value)}
                  />
                </label>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs text-slate-500">Inversion del dia</p><p className="mt-1 text-lg font-semibold text-rose-700">{money(dailyInvestment)}</p></div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs text-slate-500">Ventas del dia</p><p className="mt-1 text-lg font-semibold text-emerald-700">{money(dailySales)}</p></div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs text-slate-500">Ganancia del dia</p><p className="mt-1 text-lg font-semibold text-sky-700">{money(dailyProfit)}</p></div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs text-slate-500">Ventas / unidades</p><p className="mt-1 text-lg font-semibold text-slate-900">{dailySalesCount} / {dailySalesUnits}</p></div>
              </div>
            </div>

            <div className="panel-card">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Resumen mensual</h3>
                  <p className="mt-1 text-xs text-slate-500">Vista para comparar rendimiento por mes.</p>
                </div>
                <label className="text-xs text-slate-600">
                  Mes
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  />
                </label>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs text-slate-500">Inversion del mes</p><p className="mt-1 text-lg font-semibold text-rose-700">{money(monthlyInvestment)}</p></div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs text-slate-500">Ventas del mes</p><p className="mt-1 text-lg font-semibold text-emerald-700">{money(monthlySales)}</p></div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs text-slate-500">Ganancia del mes</p><p className="mt-1 text-lg font-semibold text-sky-700">{money(monthlyProfit)}</p></div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs text-slate-500">Ventas / unidades</p><p className="mt-1 text-lg font-semibold text-slate-900">{monthlySalesCount} / {monthlySalesUnits}</p></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {vista === "inventarioProductos" && (
        <div className="space-y-4">
          <div className="panel-card">
            <h3 className="text-sm font-semibold text-slate-800">{editingProductId ? "Editar producto" : "Agregar producto"}</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">Nombre del producto</span>
                <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Ej: Monitor" value={productForm.nombre} onChange={(e) => setProductForm((p) => ({ ...p, nombre: e.target.value }))} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">Categoria</span>
                <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Ej: Periferico" list="cat-list" value={productForm.categoria} onChange={(e) => setProductForm((p) => ({ ...p, categoria: e.target.value }))} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">Cantidad inicial</span>
                <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="0" type="number" min="0" value={productForm.cantidad} onChange={(e) => setProductForm((p) => ({ ...p, cantidad: toNum(e.target.value) }))} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">Stock minimo</span>
                <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="0" type="number" min="0" value={productForm.minimo} onChange={(e) => setProductForm((p) => ({ ...p, minimo: toNum(e.target.value) }))} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">Costo unitario</span>
                <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="0" type="number" min="0" value={productForm.costoUnitario} onChange={(e) => setProductForm((p) => ({ ...p, costoUnitario: toNum(e.target.value) }))} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">Precio de venta</span>
                <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="0" type="number" min="0" value={productForm.precioVenta} onChange={(e) => setProductForm((p) => ({ ...p, precioVenta: toNum(e.target.value) }))} />
              </label>
              <label className="block xl:col-span-2">
                <span className="mb-1 block text-xs font-medium text-slate-600">Proveedor asociado</span>
                <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={productForm.proveedorId} onChange={(e) => setProductForm((p) => ({ ...p, proveedorId: e.target.value }))}>
                  <option value="">Sin proveedor</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </label>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                Precio sugerido ({settings.defaultMarkupPercent}% margen): {money(suggestedSalePrice)}
              </span>
              <button
                className="rounded-md border border-slate-300 px-2 py-1 text-slate-700 hover:bg-slate-100"
                onClick={() => setProductForm((prev) => ({ ...prev, precioVenta: suggestedSalePrice }))}
              >
                Usar sugerencia
              </button>
            </div>
            <datalist id="cat-list">{categories.map((c) => <option key={c} value={c} />)}</datalist>
            <p className="mt-3 text-xs text-slate-500">DAO local: {"{ id, nombre, categoria, cantidad, minimo, costoUnitario, precioVenta, proveedorId, createdAt }"}</p>
            <div className="mt-3 flex gap-2">
              <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700" onClick={saveProduct}>{editingProductId ? "Guardar cambios" : "Agregar producto"}</button>
              {editingProductId && <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" onClick={resetProductForm}>Cancelar</button>}
            </div>
          </div>

          {products.length === 0 ? (
            <Empty message="No hay productos registrados aun." />
          ) : (
            <div className="panel-card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="table-head">Producto</th>
                      <th className="table-head">Categoria</th>
                      <th className="table-head text-right">Stock</th>
                      <th className="table-head text-right">Costo</th>
                      <th className="table-head text-right">Venta</th>
                      <th className="table-head text-right">Margen/U</th>
                      <th className="table-head">Estado</th>
                      <th className="table-head text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-sm">
                    {products.map((product) => {
                      const [label, kind] = productStatus(product);
                      return (
                        <tr key={product.id} className="hover:bg-slate-50">
                          <td className="table-cell font-medium text-slate-800">{product.nombre}</td>
                          <td className="table-cell">{product.categoria}</td>
                          <td className="table-cell text-right">{product.cantidad}</td>
                          <td className="table-cell text-right">{money(product.costoUnitario)}</td>
                          <td className="table-cell text-right">{money(product.precioVenta)}</td>
                          <td className="table-cell text-right">{money(product.precioVenta - product.costoUnitario)}</td>
                          <td className="table-cell"><span className={`status-badge ${statusClass(kind)}`}>{label}</span></td>
                          <td className="table-cell">
                            <div className="flex justify-end gap-2">
                              <button className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100" onClick={() => editProduct(product)}>Editar</button>
                              <button className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-700 hover:bg-rose-100" onClick={() => deleteProduct(product.id)}>Eliminar</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {vista === "inventarioStock" && (
        products.length === 0 ? (
          <Empty message="No hay productos para gestionar stock." />
        ) : (
          <div className="panel-card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="table-head">Producto</th>
                    <th className="table-head text-right">Disponible</th>
                    <th className="table-head text-right">Minimo</th>
                    <th className="table-head">Descuentos sugeridos</th>
                    <th className="table-head text-right">Ajustes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-sm">
                  {products.map((product) => {
                    const suggestions = buildDiscountSuggestion(product);
                    return (
                      <tr key={product.id} className="hover:bg-slate-50">
                        <td className="table-cell font-medium text-slate-800">{product.nombre}</td>
                        <td className="table-cell text-right">{product.cantidad}</td>
                        <td className="table-cell text-right">{lowStockLimit(product)}</td>
                        <td className="table-cell">{suggestions.length ? suggestions.join(" | ") : "Sin sugerencias"}</td>
                        <td className="table-cell">
                          <div className="flex justify-end gap-2">
                            <button className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100" onClick={() => adjustStock(product.id, -1)}>-1</button>
                            <button className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100" onClick={() => adjustStock(product.id, 1)}>+1</button>
                            <button className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100" onClick={() => adjustStock(product.id, 5)}>+5</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {vista === "inventarioMovimientos" && (
        <div className="space-y-4">
          <div className="panel-card">
            <h3 className="text-sm font-semibold text-slate-800">Resumen financiero de movimientos</h3>
            <p className="mt-1 text-xs text-slate-500">
              Inversion = compras/entradas. Ganancia = ventas - costo vendido. Esta vista usa los movimientos como fuente principal.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs text-slate-500">Inversion total</p><p className="mt-1 text-xl font-semibold text-rose-700">{money(totalInvestment)}</p></div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs text-slate-500">Ventas totales</p><p className="mt-1 text-xl font-semibold text-emerald-700">{money(totalSales)}</p></div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs text-slate-500">Ganancia total</p><p className="mt-1 text-xl font-semibold text-sky-700">{money(totalProfit)}</p></div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs text-slate-500">Cantidad de ventas</p><p className="mt-1 text-xl font-semibold text-slate-900">{salesCount}</p></div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs text-slate-500">Unidades vendidas</p><p className="mt-1 text-xl font-semibold text-slate-900">{soldUnits}</p></div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="panel-card">
              <div className="flex items-end justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-800">Resumen diario</h3>
                <label className="text-xs text-slate-600">
                  Fecha
                  <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" type="date" value={selectedDailyDate} onChange={(e) => setSelectedDailyDate(e.target.value)} />
                </label>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs text-slate-500">Inversion del dia</p><p className="mt-1 text-lg font-semibold text-rose-700">{money(dailyInvestment)}</p></div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs text-slate-500">Ventas del dia</p><p className="mt-1 text-lg font-semibold text-emerald-700">{money(dailySales)}</p></div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs text-slate-500">Ganancia del dia</p><p className="mt-1 text-lg font-semibold text-sky-700">{money(dailyProfit)}</p></div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs text-slate-500">Ventas / unidades</p><p className="mt-1 text-lg font-semibold text-slate-900">{dailySalesCount} / {dailySalesUnits}</p></div>
              </div>
            </div>
            <div className="panel-card">
              <div className="flex items-end justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-800">Resumen mensual</h3>
                <label className="text-xs text-slate-600">
                  Mes
                  <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
                </label>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs text-slate-500">Inversion del mes</p><p className="mt-1 text-lg font-semibold text-rose-700">{money(monthlyInvestment)}</p></div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs text-slate-500">Ventas del mes</p><p className="mt-1 text-lg font-semibold text-emerald-700">{money(monthlySales)}</p></div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs text-slate-500">Ganancia del mes</p><p className="mt-1 text-lg font-semibold text-sky-700">{money(monthlyProfit)}</p></div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs text-slate-500">Ventas / unidades</p><p className="mt-1 text-lg font-semibold text-slate-900">{monthlySalesCount} / {monthlySalesUnits}</p></div>
              </div>
            </div>
          </div>

          <div className="panel-card">
            <h3 className="text-sm font-semibold text-slate-800">Registrar movimiento</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">Producto</span>
                <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={moveForm.productId} onChange={(e) => setMoveForm((p) => ({ ...p, productId: e.target.value }))}>
                  <option value="">Sin producto</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">Tipo de movimiento</span>
                <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={moveForm.tipo} onChange={(e) => setMoveForm((p) => ({ ...p, tipo: e.target.value }))}>
                  <option value="entrada">Entrada</option>
                  <option value="salida">Salida</option>
                  <option value="venta">Venta</option>
                  <option value="ajuste">Ajuste</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">Cantidad</span>
                <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" type="number" min="1" value={moveForm.cantidad} onChange={(e) => setMoveForm((p) => ({ ...p, cantidad: toNum(e.target.value) }))} />
              </label>
              <label className="block xl:col-span-2">
                <span className="mb-1 block text-xs font-medium text-slate-600">Detalle o motivo</span>
                <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Ej: Venta corporativa" value={moveForm.detalle} onChange={(e) => setMoveForm((p) => ({ ...p, detalle: e.target.value }))} />
              </label>
            </div>
            <button className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700" onClick={saveMove}>Guardar movimiento</button>
          </div>
          {moves.length === 0 ? (
            <Empty message="No hay movimientos de inventario guardados para mostrar." />
          ) : (
            <div className="panel-card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50"><tr><th className="table-head">Fecha</th><th className="table-head">Tipo</th><th className="table-head">Producto</th><th className="table-head">Detalle</th><th className="table-head text-right">Cant.</th><th className="table-head text-right">Compra</th><th className="table-head text-right">Venta</th><th className="table-head text-right">Ganancia</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-sm">
                    {moves.slice().sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 40).map((m) => {
                      const isSale = looksLikeSale(m);
                      const buy = isSale ? saleCostFromMove(m) : toNum(m.montoCompra);
                      const sell = isSale ? saleAmountFromMove(m) : toNum(m.montoVenta);
                      const profit = isSale ? sell - buy : 0;
                      return (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="table-cell">{shortDate(m.fecha)}</td>
                          <td className="table-cell">{isSale ? "venta" : m.tipo}</td>
                          <td className="table-cell">{m.producto || "-"}</td>
                          <td className="table-cell">{m.detalle}</td>
                          <td className="table-cell text-right">{m.cantidad}</td>
                          <td className="table-cell text-right">{money(buy)}</td>
                          <td className="table-cell text-right">{money(sell)}</td>
                          <td className="table-cell text-right">{money(profit)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {vista === "inventarioCategorias" && (
        <div className="space-y-4">
          <div className="panel-card">
            <h3 className="text-sm font-semibold text-slate-800">Gestion de categorias</h3>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <label className="w-full block">
                <span className="mb-1 block text-xs font-medium text-slate-600">Nombre de categoria</span>
                <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Ej: Accesorios" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
              </label>
              <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700" onClick={addCategory}>Agregar</button>
            </div>
          </div>
          {categories.length === 0 ? (
            <Empty message="No hay categorias registradas." />
          ) : (
            <div className="panel-card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50"><tr><th className="table-head">Categoria</th><th className="table-head text-right">Productos</th><th className="table-head text-right">Accion</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-sm">
                    {categories.map((c) => (
                      <tr key={c} className="hover:bg-slate-50">
                        <td className="table-cell font-medium text-slate-800">{c}</td>
                        <td className="table-cell text-right">{products.filter((p) => p.categoria === c).length}</td>
                        <td className="table-cell">
                          <div className="flex justify-end">
                            <button className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-700 hover:bg-rose-100" onClick={() => deleteCategory(c)}>Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {vista === "inventarioProveedores" && (
        <div className="space-y-4">
          <div className="panel-card">
            <h3 className="text-sm font-semibold text-slate-800">{editingSupplierId ? "Editar proveedor" : "Agregar proveedor"}</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">Nombre o razon social</span>
                <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Ej: Comercial XYZ" value={supplierForm.nombre} onChange={(e) => setSupplierForm((p) => ({ ...p, nombre: e.target.value }))} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">NIT / identificacion</span>
                <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Ej: 900123456" value={supplierForm.nit} onChange={(e) => setSupplierForm((p) => ({ ...p, nit: e.target.value }))} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">Correo de contacto</span>
                <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Ej: compras@proveedor.com" value={supplierForm.email} onChange={(e) => setSupplierForm((p) => ({ ...p, email: e.target.value }))} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">Telefono</span>
                <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Ej: 3001234567" value={supplierForm.telefono} onChange={(e) => setSupplierForm((p) => ({ ...p, telefono: e.target.value }))} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">Tipo de suministro</span>
                <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={supplierForm.tipoSuministro} onChange={(e) => setSupplierForm((p) => ({ ...p, tipoSuministro: e.target.value }))}>
                  <option value="producto">Proveedor de producto</option>
                  <option value="servicio">Proveedor de servicio</option>
                </select>
              </label>
              {supplierForm.tipoSuministro === "producto" ? (
                <>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-600">Categorias que atiende</span>
                    <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Ej: Perifericos, Redes" value={supplierForm.categorias} onChange={(e) => setSupplierForm((p) => ({ ...p, categorias: e.target.value }))} />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-600">Productos que vende</span>
                    <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Ej: Mouse, Teclado" value={supplierForm.productosCatalogo} onChange={(e) => setSupplierForm((p) => ({ ...p, productosCatalogo: e.target.value }))} />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-600">Costo unitario referencial</span>
                    <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" type="number" min="0" placeholder="Ej: 200000" value={supplierForm.costoUnitarioProducto} onChange={(e) => setSupplierForm((p) => ({ ...p, costoUnitarioProducto: toNum(e.target.value) }))} />
                  </label>
                </>
              ) : (
                <>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-600">Servicio ofertado</span>
                    <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Ej: Mantenimiento preventivo" value={supplierForm.servicioNombre} onChange={(e) => setSupplierForm((p) => ({ ...p, servicioNombre: e.target.value }))} />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-600">Tarifa mensual / contrato</span>
                    <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" type="number" min="0" placeholder="Ej: 1500000" value={supplierForm.servicioTarifaMensual} onChange={(e) => setSupplierForm((p) => ({ ...p, servicioTarifaMensual: toNum(e.target.value) }))} />
                  </label>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">Modo servicio: se guarda como artefacto de contratacion (sin asociacion a stock).</div>
                </>
              )}
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">Tipo de contrato</span>
                <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Ej: indefinido" value={supplierForm.tipoContrato} onChange={(e) => setSupplierForm((p) => ({ ...p, tipoContrato: e.target.value }))} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">Inicio de vigencia</span>
                <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" type="date" value={supplierForm.vigenciaInicio} onChange={(e) => setSupplierForm((p) => ({ ...p, vigenciaInicio: e.target.value }))} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">Fin de vigencia</span>
                <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" type="date" value={supplierForm.vigenciaFin} onChange={(e) => setSupplierForm((p) => ({ ...p, vigenciaFin: e.target.value }))} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">Condiciones del contrato</span>
                <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Terminos clave del acuerdo" value={supplierForm.condiciones} onChange={(e) => setSupplierForm((p) => ({ ...p, condiciones: e.target.value }))} />
              </label>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Para producto: define categorias/productos y costo referencial para habilitar sugerencias de pedido automatico.
            </p>
            <div className="mt-3 flex gap-2">
              <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700" onClick={saveSupplier}>{editingSupplierId ? "Guardar cambios" : "Agregar proveedor"}</button>
              {editingSupplierId && <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" onClick={resetSupplierForm}>Cancelar</button>}
            </div>
          </div>
          <div className="panel-card">
            <h3 className="text-sm font-semibold text-slate-800">Preensamble de pedido por stock bajo</h3>
            {restockSuggestions.filter((s) => s.unitsNeeded > 0).length === 0 ? (
              <p className="mt-2 text-sm text-slate-600">No hay productos por reponer con la configuracion actual.</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="table-head">Producto</th>
                      <th className="table-head">Categoria</th>
                      <th className="table-head text-right">Stock actual</th>
                      <th className="table-head text-right">Objetivo</th>
                      <th className="table-head text-right">Unid. pedir</th>
                      <th className="table-head">Proveedor sugerido</th>
                      <th className="table-head text-right">Costo estimado</th>
                      <th className="table-head text-right">Accion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-sm">
                    {restockSuggestions.filter((s) => s.unitsNeeded > 0).map((s) => (
                      <tr key={s.product.id} className="hover:bg-slate-50">
                        <td className="table-cell font-medium text-slate-800">{s.product.nombre}</td>
                        <td className="table-cell">{s.product.categoria}</td>
                        <td className="table-cell text-right">{s.product.cantidad}</td>
                        <td className="table-cell text-right">{s.target}</td>
                        <td className="table-cell text-right">{s.unitsNeeded}</td>
                        <td className="table-cell">{s.bestOption ? s.bestOption.supplier.nombre : "Sin proveedor compatible"}</td>
                        <td className="table-cell text-right">{money(s.estimatedCost)}</td>
                        <td className="table-cell">
                          <div className="flex justify-end">
                            <button
                              disabled={!s.bestOption}
                              onClick={() => addToPurchaseDraft(s)}
                              className={`rounded-md px-2 py-1 text-xs font-medium ${
                                s.bestOption
                                  ? "border border-slate-300 text-slate-700 hover:bg-slate-100"
                                  : "cursor-not-allowed border border-slate-200 text-slate-400"
                              }`}
                            >
                              Preparar pedido
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="panel-card">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Borrador de pedido a proveedor</h3>
              <p className="text-xs text-slate-500">
                Total estimado: {money(purchaseDraft.reduce((acc, item) => acc + toNum(item.subtotal), 0))}
              </p>
            </div>
            {purchaseDraft.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600">Aun no hay lineas de pedido preparadas.</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50"><tr><th className="table-head">Producto</th><th className="table-head">Proveedor</th><th className="table-head text-right">Unidades</th><th className="table-head text-right">Costo unit.</th><th className="table-head text-right">Subtotal</th><th className="table-head">Estado</th><th className="table-head text-right">Accion</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-sm">
                    {purchaseDraft.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="table-cell">{item.producto}</td>
                        <td className="table-cell">{item.proveedor}</td>
                        <td className="table-cell text-right">{item.unidades}</td>
                        <td className="table-cell text-right">{money(item.costoUnitario)}</td>
                        <td className="table-cell text-right">{money(item.subtotal)}</td>
                        <td className="table-cell">
                          <span className={`status-badge ${item.estado === "aprobada" ? "status-success" : "status-warning"}`}>
                            {item.estado === "aprobada" ? "Aprobada" : "Pendiente"}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex justify-end gap-2">
                            {item.estado !== "aprobada" && (
                              <button className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-100" onClick={() => approvePurchaseDraft(item.id)}>
                                Aprobar
                              </button>
                            )}
                            <button className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-700 hover:bg-rose-100" onClick={() => removeFromPurchaseDraft(item.id)}>Quitar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {suppliers.length === 0 ? (
            <Empty message="No hay proveedores registrados." />
          ) : (
            <div className="panel-card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50"><tr><th className="table-head">Proveedor</th><th className="table-head">Tipo</th><th className="table-head">Cobertura</th><th className="table-head">Contrato</th><th className="table-head">Vigencia</th><th className="table-head">Contacto</th><th className="table-head text-right">Acciones</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-sm">
                    {suppliers.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="table-cell font-medium text-slate-800">{s.nombre}</td>
                        <td className="table-cell">{s.tipoSuministro === "servicio" ? "Servicio" : "Producto"}</td>
                        <td className="table-cell">
                          {s.tipoSuministro === "servicio"
                            ? `${s.servicioNombre || "Servicio"} (${money(s.servicioTarifaMensual)})`
                            : `${s.categorias || "-"} | ${s.productosCatalogo || "-"} | ${money(s.costoUnitarioProducto)}`}
                        </td>
                        <td className="table-cell">{s.tipoContrato || "-"}</td>
                        <td className="table-cell">{s.vigenciaInicio || "-"} / {s.vigenciaFin || "-"}</td>
                        <td className="table-cell">{s.nit || "-"} | {s.email || s.telefono || "-"}</td>
                        <td className="table-cell">
                          <div className="flex justify-end gap-2">
                            <button className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100" onClick={() => editSupplier(s)}>Editar</button>
                            <button className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-700 hover:bg-rose-100" onClick={() => deleteSupplier(s.id)}>Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {vista === "inventarioReportes" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="panel-card"><p className="panel-kpi-label">Inventario a costo</p><p className="panel-kpi-value text-slate-900">{money(inventoryValueAtCost)}</p></div>
            <div className="panel-card"><p className="panel-kpi-label">Inventario a venta</p><p className="panel-kpi-value text-emerald-700">{money(inventoryValueAtSale)}</p></div>
            <div className="panel-card"><p className="panel-kpi-label">Inversion acumulada</p><p className="panel-kpi-value text-rose-700">{money(totalInvestment)}</p></div>
            <div className="panel-card"><p className="panel-kpi-label">Ganancia bruta</p><p className="panel-kpi-value text-sky-700">{money(totalProfit)}</p></div>
          </div>
          {lowStockItems.length > 0 ? (
            <div className="panel-card">
              <h3 className="text-sm font-semibold text-slate-800">Alertas de stock bajo</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {lowStockItems.map((p) => <span key={p.id} className="status-badge status-warning">{p.nombre} ({p.cantidad}/{lowStockLimit(p)})</span>)}
              </div>
            </div>
          ) : (
            <div className="panel-card"><p className="text-sm text-slate-600">No hay alertas de stock bajo con la configuracion actual.</p></div>
          )}
        </div>
      )}

      {vista === "reportesVentas" && (
        <div className="space-y-4">
          <div className="panel-card">
            <h3 className="text-sm font-semibold text-slate-800">Registrar venta</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">Producto a vender</span>
                <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={saleForm.productId} onChange={(e) => setSaleForm((p) => ({ ...p, productId: e.target.value }))}>
                  <option value="">Selecciona producto</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.nombre} (stock {p.cantidad})</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">Cantidad de unidades</span>
                <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Ej: 3" type="number" min="1" value={saleForm.cantidad} onChange={(e) => setSaleForm((p) => ({ ...p, cantidad: toNum(e.target.value) }))} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">Descuento aplicado (%)</span>
                <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="0" type="number" min="0" max="90" value={saleForm.descuentoPct} onChange={(e) => setSaleForm((p) => ({ ...p, descuentoPct: toNum(e.target.value) }))} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">Cliente</span>
                <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Nombre del cliente" value={saleForm.cliente} onChange={(e) => setSaleForm((p) => ({ ...p, cliente: e.target.value }))} />
              </label>
            </div>
            {saleSuggestions.length > 0 && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                {saleSuggestions.map((s) => <p key={s}>{s}</p>)}
              </div>
            )}
            <button className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700" onClick={registerSale}>Registrar venta</button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="panel-card"><p className="panel-kpi-label">Ventas registradas</p><p className="panel-kpi-value text-slate-900">{salesCount}</p></div>
            <div className="panel-card"><p className="panel-kpi-label">Unidades vendidas</p><p className="panel-kpi-value text-sky-700">{soldUnits}</p></div>
            <div className="panel-card"><p className="panel-kpi-label">Ingreso por ventas</p><p className="panel-kpi-value text-emerald-700">{money(totalSales)}</p></div>
            <div className="panel-card"><p className="panel-kpi-label">Ganancia bruta</p><p className="panel-kpi-value text-slate-900">{money(totalProfit)}</p></div>
          </div>

          {sales.length === 0 ? (
            <Empty message="No hay ventas registradas aun." />
          ) : (
            <div className="panel-card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50"><tr><th className="table-head">Documento</th><th className="table-head">Producto</th><th className="table-head">Cliente</th><th className="table-head text-right">Cant.</th><th className="table-head text-right">Total</th><th className="table-head text-right">Ganancia</th><th className="table-head">Estado</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-sm">
                    {sales.slice().sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 20).map((s) => {
                      const [text, kind] = s.estado === "completada" ? ["Completada", "success"] : ["Registrada", "info"];
                      return (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="table-cell font-medium text-slate-800">{s.documento}</td>
                          <td className="table-cell">{s.producto || "-"}</td>
                          <td className="table-cell">{s.cliente}</td>
                          <td className="table-cell text-right">{s.cantidad}</td>
                          <td className="table-cell text-right">{money(s.total)}</td>
                          <td className="table-cell text-right">{money(s.ganancia)}</td>
                          <td className="table-cell"><span className={`status-badge ${statusClass(kind)}`}>{text}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {vista === "inventarioConfig" && (
        <div className="space-y-4">
          <div className="panel-card">
            <h3 className="text-sm font-semibold text-slate-800">Reglas operativas de inventario</h3>
            <p className="mt-1 text-xs text-slate-500">Estas reglas afectan alertas de stock, precios sugeridos y descuentos.</p>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              <label className="text-xs text-slate-600">Multiplicador de stock bajo
                <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" type="number" min="1" step="0.1" value={settings.lowStockMultiplier} onChange={(e) => setSettings((p) => ({ ...p, lowStockMultiplier: toNum(e.target.value) }))} />
              </label>
              <label className="text-xs text-slate-600">Multiplicador objetivo de reposicion
                <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" type="number" min="1" step="0.1" value={settings.restockTargetMultiplier} onChange={(e) => setSettings((p) => ({ ...p, restockTargetMultiplier: toNum(e.target.value) }))} />
              </label>
              <label className="text-xs text-slate-600">Markup por defecto (%)
                <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" type="number" min="0" value={settings.defaultMarkupPercent} onChange={(e) => setSettings((p) => ({ ...p, defaultMarkupPercent: toNum(e.target.value) }))} />
              </label>
              <label className="text-xs text-slate-600">Unidades para descuento por volumen
                <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" type="number" min="1" value={settings.volumeDiscountUnits} onChange={(e) => setSettings((p) => ({ ...p, volumeDiscountUnits: toNum(e.target.value) }))} />
              </label>
              <label className="text-xs text-slate-600">Descuento por volumen (%)
                <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" type="number" min="0" value={settings.volumeDiscountPercent} onChange={(e) => setSettings((p) => ({ ...p, volumeDiscountPercent: toNum(e.target.value) }))} />
              </label>
              <label className="text-xs text-slate-600">Dias para sugerir descuento por antiguedad
                <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" type="number" min="1" value={settings.agingDays} onChange={(e) => setSettings((p) => ({ ...p, agingDays: toNum(e.target.value) }))} />
              </label>
              <label className="text-xs text-slate-600">Descuento por antiguedad (%)
                <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" type="number" min="0" value={settings.agingDiscountPercent} onChange={(e) => setSettings((p) => ({ ...p, agingDiscountPercent: toNum(e.target.value) }))} />
              </label>
            </div>
            <button className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700" onClick={saveSettings}>Guardar configuracion</button>
          </div>
          <div className="panel-card">
            <p className="text-sm text-slate-600">
              Funcionalidad activa: productos nuevos toman markup por defecto si no defines precio de venta, las alertas de stock usan multiplicador, y reportes de ventas muestran sugerencias de descuento por volumen y por antiguedad.
            </p>
          </div>
        </div>
      )}

      {isBillingView && (
        <div className="panel-card">
          {billingRows.length > 0 ? (
            <p className="text-sm text-slate-600">Se detectaron {billingRows.length} registros en almacenamiento local asociados a facturacion/clientes/cotizaciones.</p>
          ) : (
            <p className="text-sm text-slate-600">No hay datos guardados en esta seccion. La vista queda activa para futura integracion.</p>
          )}
        </div>
      )}
    </div>
  );
}
