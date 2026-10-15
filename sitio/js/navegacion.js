/*
 * Navegación sin recargar (F13, D32-B): pasar entre Inicio, Sobre mí y Proyectos no recarga la página, así que el
 * audio (música y efectos) no se corta en ningún navegador.
 *
 * Al hacer clic en un enlace a una de las tres páginas: se baja su HTML, se reemplaza el contenido del <body> (los
 * <script> se quedan, porque todas las páginas cargan los mismos), se copia el <title> y la clase del <body>, se
 * desmontan y montan los módulos (js/paginas.js) y se actualiza el historial. El cambio lleva una transición ASCII
 * (View Transitions, css/estilos.css). Atrás y Adelante funcionan; el foco va al título de la página nueva.
 *
 * Si algo falla (sin red, file:// del zip, navegador sin fetch) se navega normal: el sitio sigue funcionando igual.
 */
window.Portafolio = window.Portafolio || {};

Portafolio.Navegacion = (function () {
  const PAGINAS = ['index.html', 'sobre-mi.html', 'projects.html'];
  const reducir = window.matchMedia('(prefers-reduced-motion: reduce)');
  let cambios = 0;
  let ocupado = false;

  /** Nombre de archivo de una ruta ('/' cuenta como index.html). */
  function archivo(url) {
    const nombre = url.pathname.split('/').pop();
    return nombre === '' ? 'index.html' : nombre;
  }

  function esPaginaPropia(url) {
    return url.origin === location.origin && location.protocol !== 'file:' && PAGINAS.indexOf(archivo(url)) >= 0;
  }

  /** Reemplaza el contenido del body por el de la página nueva, sin tocar los scripts. */
  function cambiar(doc) {
    const primerScript = document.body.querySelector(':scope > script');
    Array.from(document.body.childNodes).forEach((n) => { if (n.nodeName !== 'SCRIPT') n.remove(); });
    Array.from(doc.body.childNodes).forEach((n) => {
      if (n.nodeName === 'SCRIPT') return;
      document.body.insertBefore(document.importNode(n, true), primerScript);
    });
    document.body.className = doc.body.className;
    document.body.removeAttribute('style');   // Bootstrap deja overflow y padding si había un modal o el menú abierto
    document.title = doc.title;
  }

  /** Lleva la vista al ancla (si la hay) o arriba, y pone el foco en el título de la página. */
  function ubicar(url) {
    const destino = url.hash ? document.getElementById(decodeURIComponent(url.hash.slice(1))) : null;
    if (destino) destino.scrollIntoView(); else window.scrollTo(0, 0);
    const titulo = document.querySelector('main h1');
    if (titulo) { titulo.setAttribute('tabindex', '-1'); titulo.focus({ preventScroll: true }); }
  }

  async function navegar(url, empujar) {
    if (ocupado) return;
    ocupado = true;
    try {
      const respuesta = await fetch(url.pathname, { headers: { Accept: 'text/html' } });
      if (!respuesta.ok) throw new Error('HTTP ' + respuesta.status);
      const doc = new DOMParser().parseFromString(await respuesta.text(), 'text/html');
      const aplicar = () => {
        Portafolio.Paginas.desmontarTodo();
        cambiar(doc);
        if (empujar) history.pushState({ portafolio: true }, '', url.href);
        Portafolio.Paginas.montarTodo();
        ubicar(url);
      };
      if (document.startViewTransition && !reducir.matches) await document.startViewTransition(aplicar).updateCallbackDone;
      else aplicar();
      cambios++;
    } catch (e) {
      location.href = url.href;   // cualquier problema: navegación normal
    } finally {
      ocupado = false;
    }
  }

  // un solo oyente para toda la visita
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.getAttribute('href'), location.href);
    if (!esPaginaPropia(url)) return;
    // un ancla dentro de la misma página: que la maneje el navegador
    if (archivo(url) === archivo(new URL(location.href)) && url.hash) return;
    e.preventDefault();
    if (url.href === location.href) return;
    navegar(url, true);
  });

  window.addEventListener('popstate', () => {
    if (location.protocol === 'file:') return;
    navegar(new URL(location.href), false);
  });

  // la entrada inicial también queda marcada, para que «Atrás» vuelva a ella sin recargar
  if (location.protocol !== 'file:') history.replaceState({ portafolio: true }, '', location.href);

  return { estado: function () { return { cambios: cambios }; } };
})();
