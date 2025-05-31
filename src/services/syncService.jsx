// syncService.js con sincronización manual mejorada y detección de cambios correcta

import { API_CONFIG, STORAGE_KEYS, SYNC_CONFIG } from '../config/config';
import { isAuthenticated, getCredentials } from './authService';

let pendingChanges = false; // Flag para indicar si hay cambios pendientes

// Parchar los métodos de localStorage para capturar cambios
const patchLocalStorage = () => {
  const originalSetItem = localStorage.setItem;
  
  // Sobrescribir setItem para que dispare un evento cuando ocurra un cambio relevante
  localStorage.setItem = function(key, value) {
    const prevValue = localStorage.getItem(key);
    if (prevValue !== value) {
      originalSetItem.call(this, key, value);
      // Si la clave está en nuestra lista de interés, disparar un evento
      if (SYNC_CONFIG.KEYS_TO_OBSERVE.includes(key)) {
        // Crear un evento como si fuera un cambio en localStorage
        const storageEvent = new CustomEvent('localDataChanged', {
          detail: { key, newValue: value }
        });
        // Disparar el evento
        window.dispatchEvent(storageEvent);
      }
    }
  };
};

// Observer para detectar cambios en localStorage
const setupSyncObserver = () => {
  if (!isAuthenticated()) return null;
  
  // Parchar el localStorage para capturar eventos de la misma ventana
  patchLocalStorage();
  
  // Función para manejar cambios en localStorage
  const handleStorageChange = (e) => {
    // Para eventos de storage normal
    if (!e.detail && (!e.key || SYNC_CONFIG.KEYS_TO_OBSERVE.includes(e.key))) {
      pendingChanges = true;
      window.dispatchEvent(new CustomEvent('syncPendingChange', {
        detail: { hasPendingChanges: true }
      }));
      console.log("Cambios detectados en localStorage. Sincronización pendiente.");
    }
    // Para nuestro evento personalizado
    else if (e.detail && e.type === 'localDataChanged') {
      pendingChanges = true;
      window.dispatchEvent(new CustomEvent('syncPendingChange', {
        detail: { hasPendingChanges: true }
      }));
      console.log("Cambios locales detectados en:", e.detail.key);
    }
  };

  // Agregar listener para eventos de storage (cambios desde otras pestañas)
  window.addEventListener('storage', handleStorageChange);
  window.addEventListener('localDataChanged', handleStorageChange);
  
  // Verificar al inicio si hay cambios pendientes comparando timestamps
  const checkInitialPendingChanges = () => {
    if (isAuthenticated()) {
      const lastSyncTimestamp = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_SYNC) || "0");
      const currentTime = Date.now();
      
      if (currentTime - lastSyncTimestamp > SYNC_CONFIG.TIMEOUT) {
        pendingChanges = true;
        window.dispatchEvent(new CustomEvent('syncPendingChange', {
          detail: { hasPendingChanges: true }
        }));
      }
    }
  };
  
  checkInitialPendingChanges();
  
  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('localDataChanged', handleStorageChange);
  };
};

// Función para sincronizar datos al servidor
const syncDataToServer = async () => {
  if (!isAuthenticated()) {
    console.log("No hay sesión activa. No se puede sincronizar.");
    return false;
  }
  
  try {
    const { token, email } = getCredentials();
    const timestamp = Date.now();
    
    // Obtener elementos eliminados del localStorage
    const eliminados = JSON.parse(localStorage.getItem(STORAGE_KEYS.ELIMINADOS) || "{}");
    
    // Obtener datos del localStorage
    const dataToSync = {
      email: email,
      data: {
        [STORAGE_KEYS.GASTOS]: JSON.parse(localStorage.getItem(STORAGE_KEYS.GASTOS) || "[]"),
        [STORAGE_KEYS.METAS]: JSON.parse(localStorage.getItem(STORAGE_KEYS.METAS) || "[]"),
        [STORAGE_KEYS.CATEGORIAS]: JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIAS) || "[]"),
        [STORAGE_KEYS.RECORDATORIOS]: JSON.parse(localStorage.getItem(STORAGE_KEYS.RECORDATORIOS) || "[]"),
        [STORAGE_KEYS.PRESUPUESTO]: JSON.parse(localStorage.getItem(STORAGE_KEYS.PRESUPUESTO) || "0"),
        [STORAGE_KEYS.INGRESOS]: JSON.parse(localStorage.getItem(STORAGE_KEYS.INGRESOS) || "[]")
      },
      eliminados: eliminados,
      timestamp: timestamp
    };
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SYNC.UPLOAD}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(dataToSync)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error de sincronización:", errorData);
      return false;
    }
    
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp.toString());
    pendingChanges = false;
    
    window.dispatchEvent(new CustomEvent('syncPendingChange', {
      detail: { hasPendingChanges: false }
    }));
    
    console.log("Datos sincronizados correctamente");
    return true;
  } catch (error) {
    console.error("Error al sincronizar datos:", error);
    return false;
  }
};

// Función para obtener datos del servidor
const syncDataFromServer = async (forceSync = false) => {
  if (!isAuthenticated()) {
    console.log("No hay sesión activa. No se puede sincronizar desde el servidor.");
    return false;
  }
  
  try {
    const { token, email } = getCredentials();
    
    if (!forceSync && !pendingChanges) {
      console.log("No hay cambios pendientes que sincronizar");
      return true;
    }
    
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SYNC.DOWNLOAD}?userId=${encodeURIComponent(email)}&since=0`, 
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error al obtener datos:", errorData);
      return false;
    }
    
    const serverData = await response.json();
    
    if (!serverData || !serverData.data) {
      console.log("No hay datos nuevos para sincronizar");
      return true;
    }
    
    // Guardar datos en localStorage
    Object.entries(serverData.data).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
    
    if (serverData.eliminados) {
      localStorage.setItem(STORAGE_KEYS.ELIMINADOS, JSON.stringify(serverData.eliminados));
    }
    
    if (serverData.data[STORAGE_KEYS.PRESUPUESTO] && serverData.data[STORAGE_KEYS.PRESUPUESTO] > 0) {
      localStorage.setItem(STORAGE_KEYS.VALID, JSON.stringify(true));
    }
    
    if (serverData.timestamp) {
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, serverData.timestamp.toString());
    }
    
    pendingChanges = false;
    
    window.dispatchEvent(new CustomEvent('syncPendingChange', {
      detail: { hasPendingChanges: false }
    }));
    
    window.dispatchEvent(new Event('storage'));
    
    console.log("Datos obtenidos y actualizados correctamente");
    return true;
  } catch (error) {
    console.error("Error al obtener datos del servidor:", error);
    return false;
  }
};

// Función para manejar el cierre de sesión
const handleLogout = async () => {
  try {
    const { token, email } = getCredentials();
    
    if (!token || !email) {
      console.log("No hay sesión activa para cerrar");
      return true;
    }
    
    if (pendingChanges) {
      const shouldSync = window.confirm(
        "Tienes cambios sin sincronizar. ¿Deseas guardarlos antes de cerrar sesión?"
      );
      
      if (shouldSync) {
        await syncDataToServer();
      }
    }
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SYNC.CLOSE_SESSION}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) {
        console.warn("No se pudo notificar al servidor del cierre de sesión");
      }
    } catch (error) {
      console.warn("Error al comunicar cierre de sesión al servidor:", error);
    }
    
    localStorage.setItem(STORAGE_KEYS.SESSION_CONFLICT, "true");
    localStorage.removeItem(STORAGE_KEYS.SESSION_CONFLICT);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
    
    console.log("Sesión cerrada correctamente a nivel local");
    return true;
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return false;
  }
};

// Función para sincronización inicial después del login
const syncInitialDataAfterLogin = async (email, token) => {
  try {
    console.log("Sincronización inicial después del login...");
    
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER_EMAIL, email);
    
    const success = await syncDataFromServer(true);
    setupSyncObserver();
    
    return success;
  } catch (error) {
    console.error("Error en sincronización inicial:", error);
    return false;
  }
};

// Función para enviar notificación por correo electrónico
const sendEmailNotification = async (emailData) => {
  try {
    const { token } = getCredentials();
    if (!token) {
      console.error("No hay token de autenticación disponible.");
      return false;
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EMAIL.NOTIFICATION}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error al enviar correo electrónico:", errorData);
      return false;
    }

    console.log("Correo electrónico enviado correctamente.");
    return true;
  } catch (error) {
    console.error("Error en la solicitud de envío de correo electrónico:", error);
    return false;
  }
};

// Función para establecer la detección de conflictos de sesión
const setupSessionConflictDetection = () => {
  // Función para manejar mensajes de otros tabs
  const handleStorageEvent = (e) => {
    if (e.key === STORAGE_KEYS.SESSION_CONFLICT && e.newValue === "true") {
      // Notificar al usuario que su sesión fue cerrada desde otra pestaña
      console.log("Sesión cerrada desde otra pestaña");
      // Recargar la página para reflejar el estado desconectado
      window.location.reload();
    }
  };
  
  window.addEventListener("storage", handleStorageEvent);
  
  return () => {
    window.removeEventListener("storage", handleStorageEvent);
  };
};

// Funciones auxiliares
const hasPendingChanges = () => pendingChanges;

const setHasPendingChanges = (state) => {
  pendingChanges = !!state;
  window.dispatchEvent(new CustomEvent('syncPendingChange', {
    detail: { hasPendingChanges: pendingChanges }
  }));
  return pendingChanges;
};

// Exportar las funciones del servicio
export {
  syncDataToServer,
  syncDataFromServer,
  setupSyncObserver,
  handleLogout,
  setupSessionConflictDetection,
  syncInitialDataAfterLogin,
  hasPendingChanges,
  setHasPendingChanges,
  sendEmailNotification
};