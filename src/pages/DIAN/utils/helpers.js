// Calcular días restantes hasta una fecha
export const calcularDiasRestantes = (fecha) => {
    if (!fecha) return null;
    const diasRestantes = Math.ceil((new Date(fecha) - new Date()) / (1000 * 60 * 60 * 24));
    return diasRestantes;
  };
  
  // Obtener URLs según el ambiente
  export const obtenerUrlsAmbiente = (ambiente) => {
    if (ambiente === "produccion") {
      return {
        webservice: "https://vpfe.dian.gov.co/WcfDianCustomerServices.svc",
        consulta: "https://catalogo-vpfe.dian.gov.co/Document/FindDocument"
      };
    } else {
      return {
        webservice: "https://vpfe-hab.dian.gov.co/WcfDianCustomerServices.svc",
        consulta: "https://catalogo-vpfe-hab.dian.gov.co/Document/FindDocument"
      };
    }
  };
  
  // Verificar si la configuración está completa
  export const esConfiguracionCompleta = (configuracion) => {
    const requeridos = [
      configuracion.empresa.nit,
      configuracion.empresa.razon_social,
      configuracion.dian.id_software
    ];
    
    if (configuracion.dian.ambiente === "produccion") {
      requeridos.push(
        configuracion.dian.token_autenticacion,
        configuracion.certificado.archivo_certificado,
        configuracion.certificado.password_certificado
      );
    }
    
    return requeridos.every(campo => campo && campo.toString().trim());
  };
  
  // Obtener porcentaje de configuración completado
  export const obtenerPorcentajeCompletado = (configuracion) => {
    const totalCampos = 20;
    let completados = 0;
    
    // Campos de empresa (8 campos)
    if (configuracion.empresa.nit) completados++;
    if (configuracion.empresa.razon_social) completados++;
    if (configuracion.empresa.email) completados++;
    if (configuracion.empresa.direccion) completados++;
    if (configuracion.empresa.ciudad) completados++;
    if (configuracion.empresa.departamento) completados++;
    if (configuracion.empresa.telefono) completados++;
    if (configuracion.empresa.actividad_economica) completados++;
    
    // Campos DIAN (7 campos)
    if (configuracion.dian.id_software) completados++;
    if (configuracion.dian.numero_resolucion) completados++;
    if (configuracion.dian.fecha_resolucion) completados++;
    if (configuracion.dian.prefijo) completados++;
    if (configuracion.dian.numeracion_desde) completados++;
    if (configuracion.dian.numeracion_hasta) completados++;
    if (configuracion.dian.ambiente === "produccion" ? configuracion.dian.token_autenticacion : true) completados++;
    
    // Campos certificado (3 campos)
    if (configuracion.certificado.archivo_certificado) completados++;
    if (configuracion.certificado.password_certificado) completados++;
    if (configuracion.certificado.fecha_vencimiento) completados++;
    
    // Configuración técnica (2 campos)
    if (configuracion.configuracion_tecnica.url_webservice) completados++;
    if (configuracion.configuracion_tecnica.zona_horaria) completados++;
    
    return Math.round((completados / totalCampos) * 100);
  };
  
  // Formatear números con separadores de miles
  export const formatearNumero = (numero) => {
    if (!numero) return "0";
    return parseInt(numero).toLocaleString('es-ES');
  };