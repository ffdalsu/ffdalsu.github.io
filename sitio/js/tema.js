/*
 * Tema claro (papel) y oscuro (ámbar).
 *
 * El tema vive en el atributo data-bs-theme de <html> y se guarda en localStorage["tema"].
 * Un script corto en el <head> de cada página aplica el tema guardado antes de pintar,
 * para que no se vea un destello del tema equivocado; este archivo solo maneja los botones.
 */
window.Portafolio = window.Portafolio || {};

Portafolio.Tema = (function () {
  const CLAVE = 'tema';

  /** Devuelve "dark" o "light" según el atributo actual. */
  function actual() {
    return document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'dark' : 'light';
  }

  /** Aplica un tema, lo guarda y actualiza los botones. */
  function aplicar(tema) {
    document.documentElement.setAttribute('data-bs-theme', tema);
    try { localStorage.setItem(CLAVE, tema); } catch (e) { /* almacenamiento bloqueado: el tema dura solo esta visita */ }
    pintarBotones();
  }

  /** Marca con aria-pressed el botón del tema activo y da a la barra del navegador (celular) el color del fondo. */
  function pintarBotones() {
    const tema = actual();
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', getComputedStyle(document.documentElement).getPropertyValue('--fondo').trim());
    $('.opcion-tema').each(function () {
      $(this).attr('aria-pressed', String($(this).data('tema') === tema));
    });
  }

  $(function () {
    $('.opcion-tema').on('click', function () { aplicar($(this).data('tema')); });
    pintarBotones();
  });

  return { actual: actual, aplicar: aplicar, estado: function () { return { tema: actual() }; } };
})();
