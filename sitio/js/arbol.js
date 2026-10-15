/*
 * Árbol de habilidades: al pasar el puntero (o el foco) por una habilidad, su nombre se «revuelve» con
 * caracteres del océano y se vuelve a armar letra por letra, como en la maqueta aprobada.
 * Con «reducir movimiento» no se revuelve.
 */
window.Portafolio = window.Portafolio || {};

Portafolio.Arbol = (function () {
  const RUIDO = '.·:-=+*#%@';
  const MS = 28;
  const reducir = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sonar = (n, d, r) => { if (Portafolio.Sonido) Portafolio.Sonido.efecto(n, d, r); };   // js/sonido/sonido.js

  function revolver(el) {
    if (reducir.matches) return;
    const final = el.dataset.texto || el.textContent;
    el.dataset.texto = final;
    clearInterval(el._intervalo);
    let paso = 0;
    el._intervalo = setInterval(() => {
      paso++;
      const fijas = paso / 1.5;   // cuántas letras ya quedaron en su lugar
      if (paso % 3 === 0) sonar('tecleo', { i: paso });
      el.textContent = Array.from(final).map((c, i) => (c === ' ' || i < fijas) ? c : RUIDO[Math.floor(Math.random() * RUIDO.length)]).join('');
      if (fijas >= final.length) { clearInterval(el._intervalo); el.textContent = final; }
    }, MS);
  }

  Portafolio.Paginas.montar(function () {
    // el nombre real queda como nombre accesible: mientras se revuelve, el lector de pantalla no lee ruido
    $('.habilidades li').each(function () { this.setAttribute('aria-label', this.textContent.trim()); });
    $('.habilidades li').on('mouseenter focus', function () {
      const sc = this.querySelector('.sc');
      if (sc) revolver(sc);
    });
  });

  return { revolver: revolver };
})();
