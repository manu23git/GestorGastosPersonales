import { obtenerGastos, obtenerTotales, crearGasto, actualizarGasto, eliminarGasto } from './api.js';
import {
  els,
  fechaHoyISO,
  mostrarAviso,
  mostrarBanner,
  validarFormulario,
  poblarFiltroCategorias,
  renderizarEstadisticas,
  renderizarListado,
  renderizarTotales,
  llenarFormularioEdicion,
  reiniciarFormulario,
  mostrarConfirmacion,
  ocultarConfirmacion,
  cambiarTabTotales
} from './ui.js';

const estado = {
  gastos: [],
  idEnEdicion: null
};

let idEliminacionPendiente = null;

function gastosFiltrados() {
  const categoria = els.filtroCategoria.value;
  const busqueda = els.filtroBusqueda.value.trim().toLowerCase();

  return estado.gastos.filter((g) => {
    const coincideCategoria = !categoria || g.Categoria === categoria;
    const coincideBusqueda = !busqueda ||
      (g.Nombre && g.Nombre.toLowerCase().includes(busqueda)) ||
      (g.Descripcion && g.Descripcion.toLowerCase().includes(busqueda));
    return coincideCategoria && coincideBusqueda;
  }).sort((a, b) => new Date(b.Fecha) - new Date(a.Fecha));
}

function refrescarVista() {
  poblarFiltroCategorias(estado.gastos);
  renderizarEstadisticas(estado.gastos);
  renderizarListado(gastosFiltrados(), { alEditar: iniciarEdicion, alEliminar: abrirConfirmacion });
}

async function cargarGastos() {
  mostrarBanner('Cargando gastos…', 'loading');
  try {
    estado.gastos = await obtenerGastos();
    refrescarVista();
    mostrarBanner('', '');
  } catch (error) {
    mostrarBanner(error.message + ' No se pudo conectar con la API.', 'error');
    estado.gastos = [];
    refrescarVista();
  }
}

async function cargarTotales() {
  try {
    const [porCategoria, porMes] = await obtenerTotales();
    renderizarTotales(porCategoria || [], porMes || []);
  } catch (error) {
    renderizarTotales([], [], error.message);
  }
}

function iniciarEdicion(gasto) {
  estado.idEnEdicion = gasto._id;
  llenarFormularioEdicion(gasto);
}

function cancelarEdicion() {
  estado.idEnEdicion = null;
  reiniciarFormulario();
}

function abrirConfirmacion(id) {
  idEliminacionPendiente = id;
  mostrarConfirmacion();
}

async function eliminarGastoConfirmado() {
  if (!idEliminacionPendiente) return;
  const id = idEliminacionPendiente;
  els.botonConfirmarEliminar.disabled = true;

  try {
    await eliminarGasto(id);
    estado.gastos = estado.gastos.filter((g) => g._id !== id);
    if (estado.idEnEdicion === id) cancelarEdicion();
    refrescarVista();
    cargarTotales();
    mostrarAviso('Gasto eliminado.', 'success');
  } catch (error) {
    mostrarAviso(error.message, 'error');
  } finally {
    els.botonConfirmarEliminar.disabled = false;
    ocultarConfirmacion();
    idEliminacionPendiente = null;
  }
}

async function manejarEnvioFormulario(evento) {
  evento.preventDefault();

  const datos = {
    Nombre: els.campos.Nombre.value,
    Categoria: els.campos.Categoria.value,
    Monto: els.campos.Monto.value,
    Fecha: els.campos.Fecha.value,
    Descripcion: els.campos.Descripcion.value
  };

  if (!validarFormulario(datos)) return;

  const datosGasto = {
    Nombre: datos.Nombre.trim(),
    Categoria: datos.Categoria.trim(),
    Monto: Number(datos.Monto),
    Fecha: datos.Fecha,
    Descripcion: datos.Descripcion.trim()
  };

  els.botonEnviar.disabled = true;
  const esEdicion = Boolean(estado.idEnEdicion);

  try {
    if (esEdicion) {
      const actualizado = await actualizarGasto(estado.idEnEdicion, datosGasto);
      estado.gastos = estado.gastos.map((g) => (g._id === actualizado._id ? actualizado : g));
      mostrarAviso('Gasto actualizado.', 'success');
    } else {
      const creado = await crearGasto(datosGasto);
      estado.gastos.push(creado);
      mostrarAviso('Gasto agregado.', 'success');
    }

    cancelarEdicion();
    refrescarVista();
    cargarTotales();
  } catch (error) {
    mostrarAviso(error.message, 'error');
  } finally {
    els.botonEnviar.disabled = false;
  }
}

function iniciar() {
  els.campos.Fecha.value = fechaHoyISO();

  els.formulario.addEventListener('submit', manejarEnvioFormulario);
  els.botonCancelar.addEventListener('click', cancelarEdicion);
  els.botonRecargar.addEventListener('click', () => { cargarGastos(); cargarTotales(); });
  els.filtroCategoria.addEventListener('change', () => renderizarListado(gastosFiltrados(), { alEditar: iniciarEdicion, alEliminar: abrirConfirmacion }));
  els.filtroBusqueda.addEventListener('input', () => renderizarListado(gastosFiltrados(), { alEditar: iniciarEdicion, alEliminar: abrirConfirmacion }));
  els.botonConfirmarEliminar.addEventListener('click', eliminarGastoConfirmado);
  els.modalConfirmar.addEventListener('hidden.bs.modal', () => { idEliminacionPendiente = null; });
  els.botonesPestana.forEach((btn) => btn.addEventListener('click', () => cambiarTabTotales(btn.dataset.tab)));

  cargarGastos();
  cargarTotales();
}

iniciar();
