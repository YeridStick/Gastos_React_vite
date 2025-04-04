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