//Generar id
export const generarID = () => {
  const random = Math.random().toString(36).substr(2);
  const id = Date.now().toString(36)
  return random + id
}

export const cantidad = (CantidadPresupuesto) => {
  return CantidadPresupuesto.toLocaleString('en-US', {
    style: "currency",
    currency: "USD"
  })
}

export const formatearFecha = (fecha) => {
  const fechaDate = new Date(fecha);
  const opciones = {
    year: "numeric",
    month: "long",
    day: "2-digit"
  }
  return fechaDate.toLocaleDateString("es-ES", opciones)
}