/*
 * Títulos que se arman desde estática ASCII, como en una consola: cuando un título (.titulo-grande o .titulo)
 * entra en pantalla por primera vez, sus letras empiezan como caracteres de ruido y se van fijando de izquierda
 * a derecha (el mismo efecto de las habilidades al pasarles el puntero).
 *
 * Solo se toca el texto del título: los elementos de adentro (el cursor █) quedan intactos.
 * El texto real está en el HTML desde el principio; con «reducir movimiento» o sin JavaScript no se anima.
 */
window.Portafolio = window.Portafolio || {};

Portafolio.Titulos = (function () {
  const RUIDO = '.·:-=+*#%@';
  const MS = 28;
  const reducir = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sonar = (n, d, r) => { if (Portafolio.Sonido) Portafolio.Sonido.efecto(n, d, r); };   // js/sonido/sonido.js

  /** Descifra el primer nodo de texto del elemento. */
  function descifrar(el) {
    const nodo = Array.from(el.childNodes).find((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
    if (!nodo) return;
    const final = nodo.textContent;
    const letras = Array.from(final);
    // mientras se descifra, el nombre accesible es el texto real (tras navegar, el título recibe el foco)
    el.setAttribute('aria-label', el.textContent.trim());
    let paso = 0;
    const intervalo = setInterval(() => {
      paso++;
      const fijas = paso / 1.5;
      if (Math.floor(fijas) > Math.floor((paso - 1) / 1.5)) sonar('tecleo', { i: Math.floor(fijas) });
      nodo.textContent = letras.map((c, i) => (c === ' ' || i < fijas) ? c : RUIDO[Math.floor(Math.random() * RUIDO.length)]).join('');
      if (fijas >= letras.length) { clearInterval(intervalo); nodo.textContent = final; el.dataset.descifrado = '1'; el.removeAttribute('aria-label'); }
    }, MS);
  }

  let io = null;
  Portafolio.Paginas.montar(function () {
    const titulos = document.querySelectorAll('.titulo-grande, .titulo');
    if (reducir.matches || !('IntersectionObserver' in window)) return;
    io = new IntersectionObserver((entradas) => entradas.forEach((e) => {
      if (e.isIntersecting) { io.unobserve(e.target); descifrar(e.target); }
    }), { threshold: 0.6 });
    titulos.forEach((t) => io.observe(t));
  });
  Portafolio.Paginas.desmontar(function () { if (io) io.disconnect(); io = null; });

  return { descifrar: descifrar };
})();
