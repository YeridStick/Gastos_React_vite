const API_BASE_URL = "https://g-gastosback-production.up.railway.app/api";
let syncInProgress;

/**
 * Inicializa la estructura para elementos eliminados si no existe
 * @returns {Object} Estructura de elementos eliminados
 */
export const initializeDeletedItems = () => {
  const eliminados = localStorage.getItem("eliminados");
  
  if (!eliminados) {
    const estructuraInicial = {
      ObjetosGastos: [],
      IngresosExtra: [],
      MetasAhorro: [],
      categorias: [],
      recordatorios: []
    };
    
    localStorage.setItem("eliminados", JSON.stringify(estructuraInicial));
    return estructuraInicial;
  }
  
  return JSON.parse(eliminados);
};

/**
 * Registra un elemento eliminado para sincronización
 * @param {string} tipo - El tipo de elemento (ObjetosGastos, IngresosExtra, etc.)
 * @param {string} id - El ID del elemento eliminado
 */
export const registrarElementoEliminado = (tipo, id) => {
  const eliminados = JSON.parse(localStorage.getItem("eliminados")) || initializeDeletedItems();
  
  // Verificar que el array para este tipo existe
  if (!eliminados[tipo]) {
    eliminados[tipo] = [];
  }
  
  // Añadir el ID si no está ya en la lista
  if (!eliminados[tipo].includes(id)) {
    eliminados[tipo].push(id);
    localStorage.setItem("eliminados", JSON.stringify(eliminados));
    console.log(`Elemento registrado para eliminación: ${tipo} - ${id}`);
  }
};

/**
 * Sincroniza los datos del localStorage con el servidor
 * @returns {Promise<boolean>} Éxito de la sincronización
 */
export const syncDataToServer = async () => {
  try {
    // Obtener datos necesarios para la sincronización
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail");
    const timestamp = Date.now();

    if (!token || !userEmail) {
      console.error("No hay token o email para sincronizar");
      return false;
    }

    // Obtener elementos eliminados
    const eliminados = JSON.parse(localStorage.getItem("eliminados")) || initializeDeletedItems();
    
    // Verificar si hay elementos para eliminar
    const hayElementosEliminados = Object.values(eliminados).some(arr => arr.length > 0);
    if (hayElementosEliminados) {
      console.log("Encontrados elementos para eliminar:", eliminados);
    }

    // Preparar los datos a enviar
    const dataToSync = {
      email: userEmail,
      data: {
        // Obtener datos del localStorage
        ObjetosGastos: JSON.parse(localStorage.getItem("ObjetosGastos") || "[]"),
        MetasAhorro: JSON.parse(localStorage.getItem("MetasAhorro") || "[]"),
        categorias: JSON.parse(localStorage.getItem("categorias") || "[]"),
        recordatorios: JSON.parse(localStorage.getItem("recordatorios") || "[]"),
        PresupuestoLS: JSON.parse(localStorage.getItem("PresupuestoLS") || "0"),
        IngresosExtra: JSON.parse(localStorage.getItem("IngresosExtra") || "[]")
      },
      eliminados: eliminados,
      timestamp: timestamp
    };

    console.log("Enviando datos al servidor:", dataToSync);

    // Enviar datos al servidor
    const response = await fetch(`${API_BASE_URL}/sync/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(dataToSync)
    });

    if (response.ok) {
      
      // Actualizar timestamp de última sincronización
      localStorage.setItem("lastSyncTimestamp", timestamp.toString());
      console.log("Datos sincronizados correctamente al servidor:", timestamp);
      return true;
    } else {
      const errorData = await response.json();
      console.error("Error al sincronizar datos al servidor:", errorData.message);
      return false;
    }
  } catch (error) {
    console.error("Error durante la sincronización al servidor:", error);
    return false;
  }
};

/**
 * Descarga datos actualizados desde el servidor y actualiza localStorage inmediatamente
 * @param {boolean} forceFullSync Forzar sincronización completa ignorando timestamp
 * @returns {Promise<boolean>} Éxito de la sincronización
 */
export const syncDataFromServer = async (forceFullSync = false) => {
  try {
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail");
    
    if (!token || !userEmail) {
      console.error("No hay token o email para sincronizar");
      return false;
    }

    // Obtener el timestamp de la última sincronización o usar 0 para sincronización completa
    const lastSyncTimestamp = forceFullSync 
      ? 0 
      : parseInt(localStorage.getItem("lastSyncTimestamp") || "0");

    console.log(`Solicitando datos desde timestamp: ${lastSyncTimestamp}`);

    // Solicitar datos al servidor desde la última sincronización
    const response = await fetch(
      `${API_BASE_URL}/sync/download?userId=${encodeURIComponent(userEmail)}&since=${lastSyncTimestamp}`, 
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
      console.error("Error al obtener datos del servidor:", errorData.message);
      return false;
    }

    const responseJson = await response.json();
    console.log("Datos recibidos del servidor:", responseJson);

    // Extraer los datos del objeto response
    const data = responseJson.data || responseJson;
    
    // Actualizar localStorage con los datos recibidos
    if (data.ObjetosGastos) {
      localStorage.setItem("ObjetosGastos", JSON.stringify(data.ObjetosGastos));
      console.log("Datos de gastos actualizados en localStorage:", data.ObjetosGastos.length, "elementos");
    }
    
    if (data.MetasAhorro) {
      localStorage.setItem("MetasAhorro", JSON.stringify(data.MetasAhorro));
      console.log("Datos de metas actualizados en localStorage:", data.MetasAhorro.length, "elementos");
    }
    
    if (data.categorias) {
      localStorage.setItem("categorias", JSON.stringify(data.categorias));
      console.log("Datos de categorías actualizados en localStorage:", data.categorias.length, "elementos");
    }
    
    if (data.recordatorios) {
      localStorage.setItem("recordatorios", JSON.stringify(data.recordatorios));
      console.log("Datos de recordatorios actualizados en localStorage:", data.recordatorios.length, "elementos");
    }
    
    if (data.IngresosExtra) {
      localStorage.setItem("IngresosExtra", JSON.stringify(data.IngresosExtra));
      console.log("Datos de ingresos actualizados en localStorage:", data.IngresosExtra.length, "elementos");
    }
    
    // Actualizar presupuesto si existe
    if (data.PresupuestoLS !== undefined) {
      localStorage.setItem("PresupuestoLS", JSON.stringify(data.PresupuestoLS));
      localStorage.setItem("ValidLS", JSON.stringify(true));
      console.log("Presupuesto actualizado en localStorage:", data.PresupuestoLS);
    }
    
    // Actualizar timestamp de última sincronización
    const timestamp = responseJson.timestamp || Date.now();
    localStorage.setItem("lastSyncTimestamp", timestamp.toString());
    console.log("Timestamp de sincronización actualizado:", timestamp);
    
    // Notificar a la aplicación que los datos han cambiado (útil para React)
    window.dispatchEvent(new Event('storage'));
    
    return true;
  } catch (error) {
    console.error("Error durante la sincronización desde el servidor:", error);
    return false;
  }
};

/**
 * Configurar observación de cambios en localStorage para sincronización automática
 */
export const setupSyncObserver = () => {
  // Inicializar estructura de elementos eliminados si no existe
  initializeDeletedItems();
  
  // Almacena la función original de setItem
  const originalSetItem = localStorage.setItem;
  window.originalSetItem = originalSetItem;

  // Sobrescribe la función setItem para detectar cambios
  localStorage.setItem = function(key, value) {
    // Llama a la función original
    originalSetItem.call(this, key, value);

    // Lista de claves a monitorear para sincronización
    const keysToMonitor = [
      "ObjetosGastos", 
      "MetasAhorro", 
      "categorias", 
      "recordatorios", 
      "IngresosExtra", 
      "PresupuestoLS",
      "eliminados"
    ];

    // Si la clave modificada es una que queremos sincronizar
    if (keysToMonitor.includes(key)) {
      console.log(`Detectado cambio en ${key}, programando sincronización...`);
      
      // Ejecutar sincronización con debounce (evitar muchas sincronizaciones seguidas)
      if (window.syncTimeout) {
        clearTimeout(window.syncTimeout);
      }
      
      window.syncTimeout = setTimeout(() => {
        // Verificar que el usuario esté autenticado
        const token = localStorage.getItem("token");
        if (token) {
          console.log("Ejecutando sincronización automática después de cambios...");
          syncDataToServer();
        }
      }, 2000); // Retraso de 2 segundos
    }
  };

  // También escuchar eventos de storage para casos donde otros tabs/ventanas modifiquen datos
  window.addEventListener('storage', (event) => {
    const keysToMonitor = [
      "ObjetosGastos", 
      "MetasAhorro", 
      "categorias", 
      "recordatorios", 
      "IngresosExtra", 
      "PresupuestoLS",
      "eliminados"
    ];

    if (keysToMonitor.includes(event.key)) {
      console.log(`Detectado cambio en ${event.key} desde otra ventana/tab`);
      
      if (window.syncTimeoutStorage) {
        clearTimeout(window.syncTimeoutStorage);
      }
      
      window.syncTimeoutStorage = setTimeout(() => {
        const token = localStorage.getItem("token");
        if (token) {
          syncDataToServer();
        }
      }, 2000);
    }
  });

  console.log("Observador de cambios en localStorage configurado");
};

/**
 * Programa sincronizaciones periódicas
 * @param {number} intervalMinutes Intervalo en minutos entre sincronizaciones
 */
export const setupPeriodicSync = (intervalMinutes = 5) => {
  // Convertir minutos a milisegundos
  const interval = intervalMinutes * 60 * 1000;
  
  console.log(`Configurando sincronización periódica cada ${intervalMinutes} minutos`);
  
  // Realizar una sincronización inicial inmediata
  const token = localStorage.getItem("token");
  if (token) {
    // Primero sincronizamos los datos locales al servidor
    syncDataToServer().then(() => {
      // Luego obtenemos los datos más recientes del servidor
      syncDataFromServer(true);
    });
  }
  
  // Establecer un intervalo para sincronización periódica
  const syncInterval = setInterval(() => {
    const token = localStorage.getItem("token");
    if (token) {
      console.log("Ejecutando sincronización periódica...");
      syncDataToServer().then(() => {
        syncDataFromServer();
      });
    } else {
      // Si el usuario ya no está autenticado, detener sincronización periódica
      clearInterval(syncInterval);
      console.log("Usuario desautenticado, deteniendo sincronización periódica");
    }
  }, interval);
  
  // Guardar la referencia del intervalo para limpieza futura
  window.syncInterval = syncInterval;
  
  return syncInterval;
};

/**
 * Función específica para la sincronización inicial después del login
 * Esta función garantiza que los datos se carguen correctamente del servidor 
 * justo después de iniciar sesión
 */
export const syncInitialDataAfterLogin = async (userEmail, token) => {
  console.log("Iniciando sincronización inicial después del login...");
  
  try {
    // Forzar una sincronización completa (since=0)
    const response = await fetch(
      `${API_BASE_URL}/sync/download?userId=${encodeURIComponent(userEmail)}&since=0`, 
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error("Error en la respuesta del servidor");
    }

    const responseJson = await response.json();
    console.log("Datos iniciales recibidos del servidor:", responseJson);

    // Extraer los datos del objeto response
    const data = responseJson.data || responseJson;
    
    // Actualizar localStorage con los datos recibidos
    if (data.ObjetosGastos) {
      localStorage.setItem("ObjetosGastos", JSON.stringify(data.ObjetosGastos));
    }
    
    if (data.MetasAhorro) {
      localStorage.setItem("MetasAhorro", JSON.stringify(data.MetasAhorro));
    }
    
    if (data.categorias) {
      localStorage.setItem("categorias", JSON.stringify(data.categorias));
    }
    
    if (data.recordatorios) {
      localStorage.setItem("recordatorios", JSON.stringify(data.recordatorios));
    }
    
    if (data.IngresosExtra) {
      localStorage.setItem("IngresosExtra", JSON.stringify(data.IngresosExtra));
    }
    
    // Actualizar presupuesto si existe
    if (data.PresupuestoLS !== undefined) {
      localStorage.setItem("PresupuestoLS", JSON.stringify(data.PresupuestoLS));
      localStorage.setItem("ValidLS", JSON.stringify(true));
    }
    
    // Actualizar timestamp de última sincronización
    const timestamp = responseJson.timestamp || Date.now();
    localStorage.setItem("lastSyncTimestamp", timestamp.toString());
    
    // Notificar a la aplicación que los datos han cambiado
    window.dispatchEvent(new Event('storage'));
    
    console.log("Sincronización inicial completada exitosamente");
    return true;
  } catch (error) {
    console.error("Error en la sincronización inicial:", error);
    return false;
  }
};

/**
 * Limpia los recursos de sincronización al cerrar sesión
 */
export const cleanupSync = () => {
  // Detener intervalos de sincronización
  if (window.syncInterval) {
    clearInterval(window.syncInterval);
  }
  
  if (window.syncTimeout) {
    clearTimeout(window.syncTimeout);
  }
  
  if (window.syncTimeoutStorage) {
    clearTimeout(window.syncTimeoutStorage);
  }
  
  // Restaurar la función original de localStorage
  if (window.originalSetItem) {
    localStorage.setItem = window.originalSetItem;
  }
  
  console.log("Recursos de sincronización limpiados");
};


/**
 * Realiza una sincronización manual bajo demanda
 * @returns {Promise<boolean>} Éxito de la sincronización
 */
export const syncNow = async () => {
  // Evitar sincronizaciones simultáneas
  if (syncInProgress) {
    console.log("Sincronización ya en progreso, ignorando solicitud");
    return false;
  }
  
  try {
    syncInProgress = true;
    console.log("Iniciando sincronización manual...");
    
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail");

    if (!token || !userEmail) {
      console.error("No hay token o email para sincronizar");
      
      // Mostrar alerta de error
      if (window.Swal) {
        window.Swal.fire({
          title: 'Error',
          text: 'No hay sesión activa para sincronizar',
          icon: 'error',
          confirmButtonColor: '#3085d6'
        });
      }
      return false;
    }

    // Primero subir datos locales al servidor
    const uploadResult = await syncDataToServer();
    
    if (!uploadResult) {
      console.error("Error en la sincronización al servidor");
      if (window.Swal) {
        window.Swal.fire({
          title: 'Error',
          text: 'Error al sincronizar datos al servidor',
          icon: 'error',
          confirmButtonColor: '#3085d6'
        });
      }
      return false;
    }
    
    // Luego descargar datos actualizados
    const downloadResult = await syncDataFromServer();
    
    return uploadResult && downloadResult;

  } catch (error) {
    console.error("Error durante la sincronización manual:", error);
    
    // Mostrar alerta de error genérico
    if (window.Swal) {
      window.Swal.fire({
        title: 'Error',
        text: 'Hubo un problema durante la sincronización',
        icon: 'error',
        confirmButtonColor: '#3085d6'
      });
    }
    
    return false;
  } finally {
    syncInProgress = false;
  }
};


/**
 * Cierra explícitamente la sesión en el servidor
 * @returns {Promise<boolean>} Éxito de cierre de sesión
 */
export const closeSessionExplicitly = async () => {
  try {
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail");
    
    if (!token || !userEmail) {
      console.error("No hay token o email para cerrar sesión");
      return false;
    }
    
    // Enviar solicitud al servidor para cerrar la sesión
    const response = await fetch(`${API_BASE_URL}/sync/close-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        email: userEmail
      })
    });
    
    if (response.ok) {
      console.log("Sesión cerrada correctamente en el servidor");
      return true;
    } else {
      const errorData = await response.json();
      console.error("Error al cerrar sesión en el servidor:", errorData.message);
      return false;
    }
  } catch (error) {
    console.error("Error durante el cierre de sesión:", error);
    return false;
  }
};

/**
 * Cierra la sesión del usuario de manera completa
 * @returns {Promise<boolean>} Éxito del cierre de sesión
 */
export const handleLogout = async () => {
  try {
    // Intentar sincronizar una última vez antes de cerrar sesión
    await syncDataToServer();
    
    // Cerrar sesión explícitamente en el servidor
    await closeSessionExplicitly();
    
    // Limpiar recursos de sincronización
    cleanupSync();
    
    // Limpiar datos locales específicos de la aplicación
    const keysToRemove = [
      "token", 
      "userEmail", 
      "lastSyncTimestamp", 
      "sessionId",
      "ObjetosGastos",
      "MetasAhorro", 
      "categorias", 
      "recordatorios", 
      "PresupuestoLS", 
      "IngresosExtra",
      "eliminados",
      "ValidLS"
    ];
    
    // Eliminar cada clave de localStorage
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Disparar evento de cambio de autenticación
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('authChange'));
    
    // Notificar evento de logout para componentes que lo necesiten
    window.dispatchEvent(new CustomEvent('userLoggedOut'));
    
    console.log("Sesión cerrada correctamente");
    return true;
  } catch (error) {
    console.error("Error durante el cierre de sesión:", error);
    
    // En caso de error, al menos intentar limpiar lo básico
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    
    // Disparar eventos de cambio
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('authChange'));
    
    return false;
  }
};

/**
 * Detecta y maneja conflictos entre múltiples sesiones activas
 * Incluye modales para notificar al usuario
 */
/**
 * Configurar detección de conflictos de sesión
 * @returns {Function} Función para desactivar la detección de conflictos
 */
export const setupSessionConflictDetection = () => {
  // Generar un identificador único para esta sesión si no existe
  if (!localStorage.getItem("sessionId")) {
    localStorage.setItem("sessionId", 
      `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
    );
  }

  /**
   * Manejar respuestas del servidor que indican conflictos de sesión
   * @param {Object} response - Respuesta del servidor
   * @returns {boolean} - Si la sesión está activa
   */
  const handleSessionResponse = (response) => {
    // Si el servidor indica que esta no es la sesión activa
    if (response && response.sessionActive === false) {
      console.warn("El servidor indica que esta no es la sesión activa");
      
      // Usar SweetAlert si está disponible para mostrar un diálogo
      if (window.Swal) {
        window.Swal.fire({
          title: "Sesión no activa",
          text: "Se ha detectado otra sesión activa. ¿Deseas hacer de esta la sesión activa?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí, usar esta sesión",
          cancelButtonText: "No, cerrar esta sesión",
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33"
        }).then((result) => {
          if (result.isConfirmed) {
            // Forzar sincronización completa
            syncDataFromServer(true)
              .then(() => {
                // Notificar que los datos han sido recargados
                window.dispatchEvent(new CustomEvent('dataReloaded', { 
                  detail: { source: 'sessionConflict' } 
                }));
                
                window.Swal.fire({
                  title: "Sesión activada",
                  text: "Esta es ahora la sesión activa",
                  icon: "success",
                  timer: 2000,
                  showConfirmButton: false
                });
              });
          } else {
            // Cerrar sesión si el usuario no quiere mantenerla
            handleLogout()
              .then(() => {
                // Redirigir a la página de inicio de sesión
                window.location.href = "/login";
              });
          }
        });
      }
      
      return false;
    }
    
    return true;
  };

  // Interceptar métodos de sincronización para añadir detección de conflictos
  const originalSyncDataFromServer = syncDataFromServer;
  const originalSyncDataToServer = syncDataToServer;

  // Sobrescribir método de sincronización desde el servidor
  window.syncDataFromServer = async (forceFullSync = false) => {
    try {
      const result = await originalSyncDataFromServer(forceFullSync);
      
      // Verificar la respuesta de la sesión
      handleSessionResponse(result);
      
      return result;
    } catch (error) {
      console.error("Error en sincronización desde servidor:", error);
      return false;
    }
  };

  // Sobrescribir método de sincronización hacia el servidor
  window.syncDataToServer = async () => {
    try {
      const result = await originalSyncDataToServer();
      
      // Verificar la respuesta de la sesión
      handleSessionResponse(result);
      
      return result;
    } catch (error) {
      console.error("Error en sincronización hacia servidor:", error);
      return false;
    }
  };

  // Añadir detector de cierre de ventana para advertir sobre sincronización
  const beforeUnloadHandler = (event) => {
    const token = localStorage.getItem("token");
    if (token) {
      event.preventDefault();
      event.returnValue = "¿Estás seguro de que deseas salir? Tus datos pueden perderse si no se han sincronizado.";
      return event.returnValue;
    }
  };
  window.addEventListener('beforeunload', beforeUnloadHandler);

  // Retornar una función de limpieza para restaurar los métodos originales
  return () => {
    window.syncDataFromServer = originalSyncDataFromServer;
    window.syncDataToServer = originalSyncDataToServer;
    window.removeEventListener('beforeunload', beforeUnloadHandler);
  };
};


export const resolveSessionConflict = async (userChoice) => {
  if (userChoice === 'keepCurrent') {
    // Forzar sincronización completa para esta sesión
    await syncDataFromServer(true);
    
    window.dispatchEvent(new CustomEvent('dataReloaded', { 
      detail: { source: 'sessionConflictResolved' } 
    }));
  } else if (userChoice === 'logout') {
    // Cerrar sesión completamente
    await handleLogout();
    window.location.href = "/login";
  }
};

export default {
  syncDataToServer,
  syncDataFromServer,
  syncInitialDataAfterLogin,
  setupSyncObserver,
  setupPeriodicSync,
  cleanupSync,
  registrarElementoEliminado,
  initializeDeletedItems,
  syncNow,
  handleLogout,
  closeSessionExplicitly,
  setupSessionConflictDetection,
  resolveSessionConflict
};