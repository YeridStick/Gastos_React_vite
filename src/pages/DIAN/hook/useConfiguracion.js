import { useState, useEffect } from "react";

const configDefault = {
  empresa: {
    nit: "",
    razon_social: "",
    regimen_tributario: "comun",
    direccion: "",
    ciudad: "",
    departamento: "",
    telefono: "",
    email: "",
    actividad_economica: "",
    codigo_actividad: ""
  },
  dian: {
    ambiente: "pruebas",
    token_autenticacion: "",
    pin_software: "",
    id_software: "",
    resolucion_numeracion: "",
    numero_resolucion: "",
    fecha_resolucion: "",
    prefijo: "",
    numeracion_desde: "",
    numeracion_hasta: "",
    vigencia_desde: "",
    vigencia_hasta: "",
    clave_tecnica: ""
  },
  certificado: {
    archivo_certificado: "",
    password_certificado: "",
    fecha_vencimiento: "",
    entidad_certificadora: ""
  },
  configuracion_tecnica: {
    url_webservice: "https://vpfe-hab.dian.gov.co/WcfDianCustomerServices.svc",
    formato_fecha: "YYYY-MM-DD",
    zona_horaria: "America/Bogota",
    validar_firma: true,
    generar_pdf: true,
    envio_automatico: false,
    timeout_conexion: 60,
    max_reintentos: 3,
    intervalo_reintentos: 30
  }
};

export function useConfiguracion() {
  const [configuracion, setConfiguracion] = useState(configDefault);
  const [cambiosGuardados, setCambiosGuardados] = useState(true);

  // Cargar configuración del localStorage al inicializar
  useEffect(() => {
    const configGuardada = localStorage.getItem("configuracion_dian");
    if (configGuardada) {
      try {
        setConfiguracion(JSON.parse(configGuardada));
      } catch (error) {
        console.error("Error al cargar configuración:", error);
      }
    }
  }, []);

  // Validar campos requeridos
  const validarCamposRequeridos = () => {
    const errores = [];
    
    if (!configuracion.empresa.nit.trim()) {
      errores.push("NIT de la empresa");
    }
    if (!configuracion.empresa.razon_social.trim()) {
      errores.push("Razón Social de la empresa");
    }
    if (!configuracion.dian.id_software.trim()) {
      errores.push("ID Software de la DIAN");
    }
    
    if (configuracion.dian.ambiente === "produccion") {
      if (!configuracion.dian.token_autenticacion.trim()) {
        errores.push("Token de autenticación (requerido para producción)");
      }
      if (!configuracion.certificado.archivo_certificado.trim()) {
        errores.push("Archivo de certificado (requerido para producción)");
      }
      if (!configuracion.certificado.password_certificado.trim()) {
        errores.push("Contraseña del certificado (requerido para producción)");
      }
    }
    
    return errores;
  };

  // Guardar configuración
  const guardarConfiguracion = (setValidationErrors, setShowValidationModal, setShowProgressModal, setProgressMessage, showToast) => {
    const errores = validarCamposRequeridos();
    if (errores.length > 0) {
      setValidationErrors(errores);
      setShowValidationModal(true);
      return;
    }

    try {
      setShowProgressModal(true);
      setProgressMessage("Guardando configuración...");
      
      setTimeout(() => {
        localStorage.setItem("configuracion_dian", JSON.stringify(configuracion));
        setCambiosGuardados(true);
        setShowProgressModal(false);
        showToast("Configuración guardada correctamente", "success");
      }, 1500);
    } catch (error) {
      console.error("Error al guardar configuración:", error);
      setShowProgressModal(false);
      showToast("Error al guardar la configuración", "error");
    }
  };

  // Exportar configuración
  const exportarConfiguracion = () => {
    const configParaExportar = {
      ...configuracion,
      dian: {
        ...configuracion.dian,
        token_autenticacion: "",
        clave_tecnica: ""
      },
      certificado: {
        ...configuracion.certificado,
        password_certificado: ""
      },
      metadata: {
        fecha_exportacion: new Date().toISOString(),
        version: "2.1.0",
        ambiente: configuracion.dian.ambiente
      }
    };

    const blob = new Blob([JSON.stringify(configParaExportar, null, 2)], {
      type: "application/json"
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `configuracion_dian_${configuracion.empresa.nit || 'backup'}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Importar configuración
  const importarConfiguracion = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const configImportada = JSON.parse(e.target.result);
        
        if (!configImportada.empresa || !configImportada.dian) {
          throw new Error("Archivo de configuración inválido");
        }
        
        if (configImportada.metadata) {
          delete configImportada.metadata;
        }
        
        setConfiguracion(configImportada);
        setCambiosGuardados(false);
        alert("Configuración importada correctamente");
      } catch (error) {
        console.error("Error al importar configuración:", error);
        alert("Error al importar la configuración. Verifica que el archivo sea válido.");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Resetear configuración
  const resetearConfiguracion = (setShowResetModal, setTestConexion, showToast, setCambiosGuardados) => {
    setConfiguracion(configDefault);
    setCambiosGuardados(false);
    setShowResetModal(false);
    setTestConexion(null);
    showToast("Configuración restablecida a valores por defecto", "info");
  };

  return {
    configuracion,
    setConfiguracion,
    cambiosGuardados,
    setCambiosGuardados,
    guardarConfiguracion,
    exportarConfiguracion,
    importarConfiguracion,
    resetearConfiguracion
  };
}