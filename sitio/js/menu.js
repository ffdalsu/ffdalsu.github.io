/*
 * Menú lateral del celular (F12): en pantallas angostas el encabezado muestra solo el nombre y [≡], que abre un
 * offcanvas de Bootstrap (con jQuery, como los modales) con las páginas, [ escríbeme ], el tema y el sonido.
 * Los controles del menú son copias de los del encabezado: tema.js y sonido.js pintan todas las copias juntas.
 */
window.Portafolio = window.Portafolio || {};

Portafolio.Menu = (function () {
  $(function () {
    const $menu = $('#menu-movil');
    if (!$menu.length) return;
    $('.boton-menu').on('click', function () { $menu.offcanvas('show'); });
    // [ escríbeme ] dentro del menú: primero se cierra el menú y luego se abre el formulario
    $menu.find('.abrir-contacto').on('click', function () { $menu.offcanvas('hide'); });
    // si la pantalla se agranda hasta escritorio con el menú abierto, se cierra
    window.matchMedia('(min-width: 768px)').addEventListener('change', (e) => { if (e.matches) $menu.offcanvas('hide'); });
  });
  return {};
})();
