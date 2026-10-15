/*
 * Menú lateral (F12, D38): por debajo de 1280 px el tema y el sonido salen de la barra y viven en [≡], que abre un
 * offcanvas de Bootstrap (con jQuery, como los modales) con las páginas, [ escríbeme ], el tema y el sonido.
 * Si en algún ancho la barra no cabe en una fila (zoom, otra fuente), también pasa a ese modo: clase .compacta.
 * Además, los modales (video y contacto) devuelven el foco a quien los abrió al cerrarse.
 * Los controles del menú son copias de los del encabezado: tema.js y sonido.js pintan todas las copias juntas.
 */
window.Portafolio = window.Portafolio || {};

Portafolio.Menu = (function () {
  Portafolio.Paginas.montar(function () {
    const $menu = $('#menu-movil');
    if (!$menu.length) return;
    $('.boton-menu').on('click', function () { $menu.offcanvas('show'); });
    // [ escríbeme ] dentro del menú: primero se cierra el menú y luego se abre el formulario
    $menu.find('.abrir-contacto').on('click', function () { $menu.offcanvas('hide'); });
  });
  // La barra debe quedar en una fila. Si con tema y sonido no cabe (zoom, la fuente de otro navegador), pasa a modo
  // compacto: tema y sonido van al menú [≡], como en pantallas angostas. Se revisa al cargar, al cambiar de tamaño,
  // cuando llegan las fuentes y en cada página nueva.
  function revisarBarra() {
    const barra = document.querySelector('.barra');
    const fila = barra && barra.querySelector('.envoltura');
    if (!fila) return;
    barra.classList.remove('compacta');
    // hay dos filas si alguna pieza empieza más abajo de donde termina otra (en una fila centrada, todas se solapan)
    const cajas = Array.from(fila.children).filter((e) => e.offsetParent !== null).map((e) => e.getBoundingClientRect());
    const partida = Math.max.apply(null, cajas.map((c) => c.top)) >= Math.min.apply(null, cajas.map((c) => c.bottom));
    if (partida) barra.classList.add('compacta');
  }
  Portafolio.Paginas.montar(revisarBarra);
  window.addEventListener('resize', revisarBarra);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(revisarBarra);

  // si la pantalla se agranda hasta escritorio con el menú abierto, se cierra (un solo oyente para toda la visita)
  window.matchMedia('(min-width: 1280px)').addEventListener('change', (e) => { if (e.matches) $('#menu-movil').offcanvas('hide'); });

  // Bootstrap solo devuelve el foco a los botones con data-bs-toggle; estos modales se abren con .modal('show'),
  // así que se recuerda quién tenía el foco y se le devuelve al cerrar (teclado y lectores de pantalla)
  let antesDelModal = null;
  $(document).on('show.bs.modal', () => {
    const el = document.activeElement;
    antesDelModal = el && el !== document.body ? el : null;
  });
  $(document).on('hidden.bs.modal', () => {
    if (antesDelModal && antesDelModal.isConnected) antesDelModal.focus({ preventScroll: true });
    antesDelModal = null;
  });
  return {};
})();
