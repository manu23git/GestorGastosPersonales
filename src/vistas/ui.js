export const els = {
  formulario: document.getElementById('formularioGasto'),
  idGasto: document.getElementById('idGasto'),
  campos: {
    Nombre: document.getElementById('Nombre'),
    Categoria: document.getElementById('Categoria'),
    Monto: document.getElementById('Monto'),
    Fecha: document.getElementById('Fecha'),
    Descripcion: document.getElementById('Descripcion')
  },
  botonEnviar: document.getElementById('botonEnviar'),
  botonCancelar: document.getElementById('botonCancelar'),
  tituloFormulario: document.getElementById('tituloFormulario'),
  ayudaFormulario: document.getElementById('ayudaFormulario'),
  listaCategorias: document.getElementById('listaCategorias'),
  filtroCategoria: document.getElementById('filtroCategoria'),
  filtroBusqueda: document.getElementById('filtroBusqueda'),
  botonRecargar: document.getElementById('botonRecargar'),
  bannerEstado: document.getElementById('bannerEstado'),
  listaGastos: document.getElementById('listaGastos'),
  estadoVacio: document.getElementById('estadoVacio'),
  totalRegistrado: document.getElementById('totalRegistrado'),
  cantidadGastos: document.getElementById('cantidadGastos'),
  promedioGasto: document.getElementById('promedioGasto'),
  avisoToast: document.getElementById('avisoToast'),
  textoToast: document.getElementById('textoToast'),
  modalConfirmar: document.getElementById('modalConfirmar'),
  botonConfirmarEliminar: document.getElementById('botonConfirmarEliminar'),
  totalesPorCategoria: document.getElementById('totalesPorCategoria'),
  totalesPorMes: document.getElementById('totalesPorMes'),
  totalesVacio: document.getElementById('totalesVacio'),
  botonesPestana: document.querySelectorAll('.tab-btn')
};

const instanciaAviso = new bootstrap.Toast(els.avisoToast, { delay: 3200 });
const instanciaModalConfirmar = new bootstrap.Modal(els.modalConfirmar);

const formateadorDinero = new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' });
const formateadorFecha = new Intl.DateTimeFormat('es-DO', { day: '2-digit', month: 'short', year: 'numeric' });
const NOMBRES_MES = ['', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export function formatearDinero(valor) {
  return formateadorDinero.format(Number(valor) || 0);
}

function formatearFecha(iso) {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '';
  return formateadorFecha.format(fecha);
}

function aFechaInputISO(iso) {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '';
  return fecha.toISOString().slice(0, 10);
}

export function fechaHoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function escaparHtml(valor) {
  const div = document.createElement('div');
  div.textContent = valor == null ? '' : String(valor);
  return div.innerHTML;
}

export function mostrarAviso(mensaje, tipo) {
  els.textoToast.textContent = mensaje;
  els.avisoToast.className = 'toast align-items-center border-0 text-white ' +
    (tipo === 'error' ? 'bg-danger' : tipo === 'success' ? 'bg-success' : 'bg-dark');
  instanciaAviso.show();
}

export function mostrarBanner(mensaje, tipo) {
  if (!mensaje) {
    els.bannerEstado.hidden = true;
    return;
  }
  els.bannerEstado.hidden = false;
  els.bannerEstado.textContent = mensaje;
  els.bannerEstado.className = 'alert ' +
    (tipo === 'error' ? 'alert-danger' : tipo === 'success' ? 'alert-success' : 'alert-warning');
}

export function limpiarErroresCampos() {
  Object.keys(els.campos).forEach((campo) => {
    const elError = document.getElementById('error-' + campo);
    if (elError) elError.textContent = '';
    els.campos[campo].classList.remove('is-invalid');
  });
}

function establecerErrorCampo(campo, mensaje) {
  document.getElementById('error-' + campo).textContent = mensaje;
  els.campos[campo].classList.add('is-invalid');
}

export function validarFormulario(datos) {
  limpiarErroresCampos();
  let valido = true;

  if (!datos.Nombre.trim()) {
    establecerErrorCampo('Nombre', 'El nombre es obligatorio.');
    valido = false;
  }
  if (!datos.Categoria.trim()) {
    establecerErrorCampo('Categoria', 'La categoría es obligatoria.');
    valido = false;
  }
  if (!datos.Monto || Number(datos.Monto) < 1) {
    establecerErrorCampo('Monto', 'El monto debe ser mayor o igual a 1.');
    valido = false;
  }
  if (!datos.Fecha) {
    establecerErrorCampo('Fecha', 'La fecha es obligatoria.');
    valido = false;
  }

  return valido;
}

export function poblarFiltroCategorias(gastos) {
  const categorias = Array.from(new Set(gastos.map((g) => g.Categoria).filter(Boolean))).sort();
  const valorActual = els.filtroCategoria.value;

  els.filtroCategoria.innerHTML = '<option value="">Todas las categorías</option>' +
    categorias.map((c) => `<option value="${escaparHtml(c)}">${escaparHtml(c)}</option>`).join('');
  els.filtroCategoria.value = categorias.includes(valorActual) ? valorActual : '';

  els.listaCategorias.innerHTML = categorias.map((c) => `<option value="${escaparHtml(c)}"></option>`).join('');
}

export function renderizarEstadisticas(gastos) {
  const total = gastos.reduce((acc, g) => acc + Number(g.Monto || 0), 0);
  const cantidad = gastos.length;
  const promedio = cantidad ? total / cantidad : 0;

  els.totalRegistrado.textContent = formatearDinero(total);
  els.cantidadGastos.textContent = String(cantidad);
  els.promedioGasto.textContent = formatearDinero(promedio);
}

function crearFilaGasto(gasto, { alEditar, alEliminar }) {
  const fila = document.createElement('tr');
  fila.innerHTML = `
    <td>
      <div class="fw-semibold">${escaparHtml(gasto.Nombre)}</div>
      ${gasto.Descripcion ? `<div class="text-muted small">${escaparHtml(gasto.Descripcion)}</div>` : ''}
    </td>
    <td><span class="badge text-bg-success-subtle text-success-emphasis border border-success-subtle">${escaparHtml(gasto.Categoria)}</span></td>
    <td class="text-muted small">${formatearFecha(gasto.Fecha)}</td>
    <td class="text-end fw-semibold">${formatearDinero(gasto.Monto)}</td>
    <td class="text-end">
      <button type="button" class="btn btn-sm btn-outline-primary me-1" data-accion="editar">Editar</button>
      <button type="button" class="btn btn-sm btn-outline-danger" data-accion="eliminar">Eliminar</button>
    </td>
  `;

  fila.querySelector('[data-accion="editar"]').addEventListener('click', () => alEditar(gasto));
  fila.querySelector('[data-accion="eliminar"]').addEventListener('click', () => alEliminar(gasto._id));

  return fila;
}

export function renderizarListado(lista, acciones) {
  els.listaGastos.innerHTML = '';

  if (!lista.length) {
    els.estadoVacio.hidden = false;
    return;
  }
  els.estadoVacio.hidden = true;

  const fragmento = document.createDocumentFragment();
  lista.forEach((gasto) => {
    fragmento.appendChild(crearFilaGasto(gasto, acciones));
  });
  els.listaGastos.appendChild(fragmento);
}

export function renderizarTotales(porCategoria, porMes, mensajeError) {
  if (mensajeError) {
    els.totalesPorCategoria.innerHTML = '';
    els.totalesPorMes.innerHTML = '';
    els.totalesVacio.hidden = false;
    els.totalesVacio.textContent = 'No se pudieron cargar los totales: ' + mensajeError;
    return;
  }

  els.totalesVacio.hidden = !!(porCategoria.length || porMes.length);

  els.totalesPorCategoria.innerHTML = porCategoria.map((t) => `
    <div class="col-6 col-md-4 col-lg-3">
      <div class="total-card">
        <div class="t-label">${escaparHtml(t.categoria)}</div>
        <div class="t-value">${formatearDinero(t.total)}</div>
        <div class="t-count">${t.cantidad} gasto${t.cantidad === 1 ? '' : 's'}</div>
      </div>
    </div>
  `).join('');

  els.totalesPorMes.innerHTML = porMes.map((t) => `
    <div class="col-6 col-md-4 col-lg-3">
      <div class="total-card">
        <div class="t-label">${NOMBRES_MES[t.mes] || t.mes} ${t.anio}</div>
        <div class="t-value">${formatearDinero(t.total)}</div>
        <div class="t-count">${t.cantidad} gasto${t.cantidad === 1 ? '' : 's'}</div>
      </div>
    </div>
  `).join('');
}

export function llenarFormularioEdicion(gasto) {
  els.idGasto.value = gasto._id;
  els.campos.Nombre.value = gasto.Nombre || '';
  els.campos.Categoria.value = gasto.Categoria || '';
  els.campos.Monto.value = gasto.Monto != null ? gasto.Monto : '';
  els.campos.Fecha.value = aFechaInputISO(gasto.Fecha);
  els.campos.Descripcion.value = gasto.Descripcion || '';

  els.tituloFormulario.textContent = 'Editar gasto';
  els.ayudaFormulario.textContent = 'Modificá los datos y guardá los cambios.';
  els.botonEnviar.textContent = 'Guardar cambios';
  els.botonCancelar.hidden = false;
  limpiarErroresCampos();
  els.campos.Nombre.focus();
  window.scrollTo({ top: els.formulario.getBoundingClientRect().top + window.scrollY - 24, behavior: 'smooth' });
}

export function reiniciarFormulario() {
  els.formulario.reset();
  els.idGasto.value = '';
  els.tituloFormulario.textContent = 'Nuevo gasto';
  els.ayudaFormulario.textContent = 'Completá los datos y agregalo al libro.';
  els.botonEnviar.textContent = 'Agregar gasto';
  els.botonCancelar.hidden = true;
  limpiarErroresCampos();
  els.campos.Fecha.value = fechaHoyISO();
}

export function mostrarConfirmacion() {
  instanciaModalConfirmar.show();
}

export function ocultarConfirmacion() {
  instanciaModalConfirmar.hide();
}

export function cambiarTabTotales(tab) {
  els.botonesPestana.forEach((btn) => {
    const activo = btn.dataset.tab === tab;
    btn.classList.toggle('active', activo);
    btn.setAttribute('aria-pressed', String(activo));
  });
  els.totalesPorCategoria.hidden = tab !== 'categoria';
  els.totalesPorMes.hidden = tab !== 'mes';
}
