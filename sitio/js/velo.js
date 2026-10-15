/*
 * Velo ASCII entre páginas (F17a, D35): al navegar sin recargar (js/navegacion.js) la pantalla se llena de caracteres
 * en orden aleatorio, la página cambia por debajo y el velo se vacía. Usa la rampa corta de js/ascii/bit-grande.js,
 * la misma del arranque.
 *
 *   Portafolio.Velo.cubrir()    → Promise, ~220 ms hasta quedar lleno
 *   Portafolio.Velo.descubrir() → Promise, ~230 ms hasta quedar vacío
 *   Portafolio.Velo.modo()      → 'velo' | 'fundido' (la transición de la F13) | 'ninguno' (reducir movimiento)
 *   Portafolio.Velo.estado()    → { fase: 'quieto'|'cubre'|'lleno'|'descubre', usos, modo, msCuadro, cubierto }
 *       cubierto: fracción de celdas llenas en el último cuadro dibujado (1 = la página no se ve).
 *
 * Es un único <canvas> fijo a pantalla completa, de toda la visita (data-permanente: navegacion.js no lo quita).
 * Se dibuja en lienzo y no como texto del DOM: así el navegador no vuelve a maquetar miles de caracteres en cada
 * cuadro. La celda se mide cuando cargan las fuentes.
 */
window.Portafolio = window.Portafolio || {};

Portafolio.Velo = (function () {
  const CUBRIR_MS = 220, DESCUBRIR_MS = 230;
  // Decisión de la F17a tras medir en celular con la CPU frenada 4× (docs/plan.md, D36).
  const VELO_EN_CELULAR = true;
  const FUENTE = '14px "IBM Plex Mono", "Cascadia Mono", Consolas, monospace';
  const ALTO_CELDA = 16;
  const reducir = window.matchMedia('(prefers-reduced-motion: reduce)');
  const celular = window.matchMedia('(pointer: coarse), (max-width: 768px)');
  const RAMPA = Portafolio.BitGrande.RAMPA;

  const lienzo = document.createElement('canvas');
  lienzo.className = 'velo';
  lienzo.setAttribute('aria-hidden', 'true');
  lienzo.dataset.permanente = '';
  document.body.appendChild(lienzo);
  const c = lienzo.getContext('2d');

  const est = { fase: 'quieto', usos: 0, msCuadro: 0, cubierto: 0 };
  let anchoCelda = 8.4;

  function medir() {
    c.font = FUENTE;
    const w = c.measureText('MMMMMMMMMM').width / 10;
    if (w > 0) anchoCelda = w;
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(medir); else medir();

  function modo() {
    if (reducir.matches) return 'ninguno';
    if (celular.matches && !VELO_EN_CELULAR) return 'fundido';
    return 'velo';
  }

  /** Anima el velo: llenar (true) o vaciar (false). Cada celda tiene su turno al azar; la rampa le da densidad. */
  function animar(llenar, duracion) {
    const ancho = window.innerWidth, alto = window.innerHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    lienzo.width = Math.round(ancho * dpr);
    lienzo.height = Math.round(alto * dpr);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cols = Math.ceil(ancho / anchoCelda) + 1;
    const filas = Math.ceil(alto / ALTO_CELDA) + 1;
    const turno = new Float32Array(cols * filas);
    for (let i = 0; i < turno.length; i++) turno[i] = Math.random() * 0.7;
    const tinta = getComputedStyle(document.documentElement).getPropertyValue('--texto').trim() || '#1E2B2A';
    lienzo.classList.add('activo');
    return new Promise((listo) => {
      const t0 = performance.now();
      let cuadros = 0, gastado = 0;
      (function cuadro(ahora) {
        const inicio = performance.now();
        const p = Math.min(1, (ahora - t0) / duracion);
        c.clearRect(0, 0, ancho, alto);
        c.fillStyle = tinta;
        c.font = FUENTE;
        c.textBaseline = 'top';
        let llenas = 0;
        for (let y = 0; y < filas; y++) {
          for (let x = 0; x < cols; x++) {
            const crudo = (p - turno[y * cols + x]) / 0.3;
            const nivel = llenar ? crudo : 1 - crudo;
            if (nivel <= 0) continue;
            if (nivel >= 1) {
              // celda llena: bordes en píxeles enteros y contiguos, así no quedan rayas finas entre celdas
              const x0 = Math.floor(x * anchoCelda), x1 = Math.floor((x + 1) * anchoCelda);
              c.fillRect(x0, y * ALTO_CELDA, x1 - x0, ALTO_CELDA);
              llenas++;
            } else {
              c.fillText(RAMPA[Math.floor(nivel * (RAMPA.length - 1)) + 1], x * anchoCelda, y * ALTO_CELDA);
            }
          }
        }
        est.cubierto = llenas / (cols * filas);
        cuadros++;
        gastado += performance.now() - inicio;
        if (p < 1) { requestAnimationFrame(cuadro); return; }
        est.msCuadro = gastado / cuadros;
        listo();
      })(t0);
    });
  }

  function cubrir() {
    est.fase = 'cubre';
    return animar(true, CUBRIR_MS).then(() => { est.fase = 'lleno'; });
  }

  function descubrir() {
    est.fase = 'descubre';
    return animar(false, DESCUBRIR_MS).then(() => {
      c.clearRect(0, 0, lienzo.width, lienzo.height);
      lienzo.classList.remove('activo');
      est.cubierto = 0;
      est.fase = 'quieto';
      est.usos++;
    });
  }

  return {
    cubrir: cubrir,
    descubrir: descubrir,
    modo: modo,
    estado: () => Object.assign({ modo: modo() }, est)
  };
})();
