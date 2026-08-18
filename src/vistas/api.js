const URL_BASE_API = '/api/gastos';

async function realizarPeticion(ruta, opciones) {
  const respuesta = await fetch(URL_BASE_API + ruta, {
    headers: { 'Content-Type': 'application/json' },
    ...opciones
  });

  let cuerpo = null;
  try {
    cuerpo = await respuesta.json();
  } catch (_) {
    cuerpo = null;
  }

  if (!respuesta.ok) {
    const mensaje = (cuerpo && (cuerpo.mensaje || (cuerpo.errores && cuerpo.errores.join(' ')))) ||
      'Ocurrió un error al comunicarse con el servidor.';
    throw new Error(mensaje);
  }

  return cuerpo;
}

export function obtenerGastos() {
  return realizarPeticion('/', { method: 'GET' });
}

export function obtenerTotales() {
  return Promise.all([
    realizarPeticion('/total/categoria', { method: 'GET' }),
    realizarPeticion('/total/mes', { method: 'GET' })
  ]);
}

export function crearGasto(datosGasto) {
  return realizarPeticion('/', { method: 'POST', body: JSON.stringify(datosGasto) });
}

export function actualizarGasto(id, datosGasto) {
  return realizarPeticion('/' + id, { method: 'PUT', body: JSON.stringify(datosGasto) });
}

export function eliminarGasto(id) {
  return realizarPeticion('/' + id, { method: 'DELETE' });
}
