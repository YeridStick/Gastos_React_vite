// Generar ID único para cada gasto
export const generarID = () => {
  const random = Math.random().toString(36).substr(2);
  const id = Date.now().toString(36);
  return random + id;
};

// Formatea cantidades como moneda (USD por defecto)
export const cantidad = (cantidad, moneda = 'USD', locale = 'en-US') => {
  return cantidad.toLocaleString(locale, {
    style: 'currency',
    currency: moneda,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Versión alternativa para formatear en euros
export const cantidadEUR = (cantidad) => {
  return cantidad.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Formatea fechas en español
export const formatearFecha = (fecha) => {
  const fechaNueva = new Date(fecha);
  
  const opciones = {
    year: 'numeric',
    month: 'long',
    day: '2-digit'
  };
  
  return fechaNueva.toLocaleDateString('es-ES', opciones);
};

// Funciones para localStorage
export const guardarEnLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error al guardar en localStorage:", error);
  }
};

export const obtenerDeLocalStorage = (key, defaultValue) => {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
  } catch (error) {
    console.error("Error al obtener de localStorage:", error);
    return defaultValue;
  }
};

// Función para calcular porcentaje
export const calcularPorcentaje = (valor, total) => {
  return total > 0 ? Math.round((valor / total) * 100) : 0;
};

// Función para obtener fecha actual en formato bonito
export const obtenerFechaActual = () => {
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const fecha = new Date();
  return `${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
};


/**
 * Normaliza un formato de fecha a timestamp numérico
 * @param {any} fecha - Fecha en cualquier formato (string ISO, objeto Date, número, etc.)
 * @returns {number} - Timestamp en milisegundos
 */
export const normalizarFecha = (fecha) => {
  // Si la fecha es undefined o null, usar la fecha actual
  if (fecha === undefined || fecha === null) {
    return Date.now();
  }
  
  // Si ya es un número, asumimos que es un timestamp
  if (typeof fecha === 'number') {
    return fecha;
  }
  
  // Si es un string
  if (typeof fecha === 'string') {
    // Si es string ISO (contiene T)
    if (fecha.includes('T')) {
      return new Date(fecha).getTime();
    }
    // Si es un string numérico
    else if (!isNaN(fecha)) {
      return Number(fecha);
    }
    // Otros formatos de fecha (yyyy-mm-dd)
    return new Date(fecha).getTime();
  }
  
  // Si es un objeto Date
  if (fecha instanceof Date) {
    return fecha.getTime();
  }
  
  // Si no podemos interpretar el formato, retornar la fecha actual
  console.warn('Formato de fecha no reconocido:', fecha);
  return Date.now();
};