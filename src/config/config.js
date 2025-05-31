// Configuración centralizada de la aplicación

// Configuración de la API
export const API_CONFIG = {
  BASE_URL: "https://g-gastosback-production.up.railway.app//api",
  ENDPOINTS: {
    AUTH: {
      REQUEST_CODE: "/auth/request-code",
      VERIFY_CODE: "/auth/verify-code",
    },
    USERS: {
      REGISTER: "/users/register",
    },
    SYNC: {
      UPLOAD: "/sync/upload",
      DOWNLOAD: "/sync/download",
      CLOSE_SESSION: "/sync/close-session",
    },
    EMAIL: {
      NOTIFICATION: "/email/notification",
    }
  }
};

// Configuración de localStorage
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER_EMAIL: "userEmail",
  LAST_SYNC: "lastSyncTimestamp",
  PRESERVE_DATA: "preserveDataOnSignup",
  SESSION_CONFLICT: "sessionConflict",
  // Claves de datos
  GASTOS: "ObjetosGastos",
  PRESUPUESTO: "PresupuestoLS",
  VALID: "ValidLS",
  INGRESOS: "IngresosExtra",
  METAS: "MetasAhorro",
  CATEGORIAS: "categorias",
  RECORDATORIOS: "recordatorios",
  ELIMINADOS: "eliminados"
};

// Configuración de sincronización
export const SYNC_CONFIG = {
  TIMEOUT: 300000, // 5 minutos en milisegundos
  KEYS_TO_OBSERVE: [
    "ObjetosGastos",
    "PresupuestoLS",
    "ValidLS",
    "IngresosExtra",
    "MetasAhorro",
    "categorias",
    "recordatorios",
    "eliminados"
  ]
}; 