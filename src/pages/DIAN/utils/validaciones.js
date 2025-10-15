// Validar formato NIT colombiano
export const validarNIT = (nit) => {
    const nitRegex = /^\d{8,15}-?\d$/;
    return nitRegex.test(nit);
  };
  
  // Validar formato email
  export const validarEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Validar formato UUID (para ID Software)
  export const validarUUID = (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };
  
  // Validar número de resolución DIAN
  export const validarNumeroResolucion = (numero) => {
    const resolucionRegex = /^\d{8,15}$/;
    return resolucionRegex.test(numero);
  };
  
  // Validar código CIIU
  export const validarCodigoCIIU = (codigo) => {
    const ciiuRegex = /^\d{4}$/;
    return ciiuRegex.test(codigo);
  };
  
  // Validar teléfono colombiano
  export const validarTelefono = (telefono) => {
    const telefonoRegex = /^(\+57\s?)?[1-9]\d{6,9}$/;
    return telefonoRegex.test(telefono.replace(/\s/g, ''));
  };
  
  // Validar que una fecha no esté vencida
  export const validarFechaNoVencida = (fecha) => {
    if (!fecha) return false;
    return new Date(fecha) > new Date();
  };
  
  // Validar rango de numeración
  export const validarRangoNumeracion = (desde, hasta) => {
    const numDesde = parseInt(desde);
    const numHasta = parseInt(hasta);
    
    if (isNaN(numDesde) || isNaN(numHasta)) return false;
    if (numDesde < 1) return false;
    if (numHasta <= numDesde) return false;
    if (numHasta - numDesde > 100000000) return false; // Máximo 100 millones
    
    return true;
  };
  
  // Validar PIN software (debe ser numérico de 4-6 dígitos)
  export const validarPINSoftware = (pin) => {
    const pinRegex = /^\d{4,6}$/;
    return pinRegex.test(pin);
  };
  
  // Validar prefijo de facturación
  export const validarPrefijo = (prefijo) => {
    const prefijoRegex = /^[A-Z]{1,4}$/;
    return prefijoRegex.test(prefijo);
  };
  
  // Validar contraseña de certificado (mínimo 6 caracteres)
  export const validarPasswordCertificado = (password) => {
    return password && password.length >= 6;
  };
  
  // Validar timeout (entre 10 y 300 segundos)
  export const validarTimeout = (timeout) => {
    const num = parseInt(timeout);
    return !isNaN(num) && num >= 10 && num <= 300;
  };
  
  // Validar número de reintentos (entre 0 y 10)
  export const validarReintentos = (reintentos) => {
    const num = parseInt(reintentos);
    return !isNaN(num) && num >= 0 && num <= 10;
  };
  
  // Validar intervalo de reintentos (entre 1 y 3600 segundos)
  export const validarIntervaloReintentos = (intervalo) => {
    const num = parseInt(intervalo);
    return !isNaN(num) && num >= 1 && num <= 3600;
  };
  
  // Función principal de validación completa
  export const validarConfiguracionCompleta = (configuracion) => {
    const errores = [];
    const advertencias = [];
  
    // Validaciones empresa
    if (!validarNIT(configuracion.empresa.nit)) {
      errores.push("Formato de NIT inválido");
    }
    
    if (configuracion.empresa.email && !validarEmail(configuracion.empresa.email)) {
      errores.push("Formato de email inválido");
    }
  
    if (configuracion.empresa.telefono && !validarTelefono(configuracion.empresa.telefono)) {
      advertencias.push("Formato de teléfono inválido");
    }
  
    if (configuracion.empresa.codigo_actividad && !validarCodigoCIIU(configuracion.empresa.codigo_actividad)) {
      advertencias.push("Código CIIU debe tener 4 dígitos");
    }
  
    // Validaciones DIAN
    if (configuracion.dian.id_software && !validarUUID(configuracion.dian.id_software)) {
      errores.push("ID Software debe ser un UUID válido");
    }
  
    if (configuracion.dian.pin_software && !validarPINSoftware(configuracion.dian.pin_software)) {
      advertencias.push("PIN Software debe tener 4-6 dígitos");
    }
  
    if (configuracion.dian.numero_resolucion && !validarNumeroResolucion(configuracion.dian.numero_resolucion)) {
      advertencias.push("Número de resolución inválido");
    }
  
    if (configuracion.dian.prefijo && !validarPrefijo(configuracion.dian.prefijo)) {
      advertencias.push("Prefijo debe ser 1-4 letras mayúsculas");
    }
  
    if (configuracion.dian.numeracion_desde && configuracion.dian.numeracion_hasta) {
      if (!validarRangoNumeracion(configuracion.dian.numeracion_desde, configuracion.dian.numeracion_hasta)) {
        errores.push("Rango de numeración inválido");
      }
    }
  
    // Validaciones certificado
    if (configuracion.certificado.password_certificado && !validarPasswordCertificado(configuracion.certificado.password_certificado)) {
      advertencias.push("Contraseña del certificado debe tener al menos 6 caracteres");
    }
  
    if (configuracion.certificado.fecha_vencimiento && !validarFechaNoVencida(configuracion.certificado.fecha_vencimiento)) {
      advertencias.push("El certificado está vencido o vence pronto");
    }
  
    // Validaciones técnicas
    if (configuracion.configuracion_tecnica.timeout_conexion && !validarTimeout(configuracion.configuracion_tecnica.timeout_conexion)) {
      advertencias.push("Timeout debe estar entre 10 y 300 segundos");
    }
  
    if (configuracion.configuracion_tecnica.max_reintentos && !validarReintentos(configuracion.configuracion_tecnica.max_reintentos)) {
      advertencias.push("Número de reintentos debe estar entre 0 y 10");
    }
  
    if (configuracion.configuracion_tecnica.intervalo_reintentos && !validarIntervaloReintentos(configuracion.configuracion_tecnica.intervalo_reintentos)) {
      advertencias.push("Intervalo de reintentos debe estar entre 1 y 3600 segundos");
    }
  
    return { errores, advertencias };
  };