/*
 * Secuencia de arranque (F17a, D35): la primera visita de la sesión abre con cinco líneas de «sistema» y bit grande
 * (js/ascii/bit-grande.js) que se revela desde el centro, saluda y parpadea. Luego cede el paso a la página.
 *
 * El script en línea del <head> de cada página pone la clase «arrancando» en <html> antes de pintar si
 * sessionStorage["arranque"] no dice «visto»; el CSS oculta entonces todo lo demás, así no hay destello. Ese mismo
 * script la quita a los 4 s si este archivo no llega a cargar.
 *
 *   Fases: log → revela → saluda → sale → fin (~2 s). Esc, un clic o cualquier tecla la saltan; mientras dura, las
 *   teclas no llegan a la terminal. Con «reducir movimiento» se ve el cuadro final quieto ~1 s.
 *   Al terminar: guarda «visto», quita la clase y emite «portafolio:arranque-fin» en document (el sonido espera a
 *   ese evento para arrancar; se emite dentro del gesto que la salta, así el navegador deja sonar).
 *   Portafolio.Arranque.estado() → { activo, fase, saltado }
 */
window.Portafolio = window.Portafolio || {};

Portafolio.Arranque = (function () {
  const html = document.documentElement;
  const B = Portafolio.BitGrande;
  const LOG = [
    'bit-os 2.0 · ffdalsu.github.io',
    '[ ok ] montando océano ............ 3 páginas',
    '[ ok ] soltando criaturas ......... 10 habilidades',
    '[ ok ] trazando islas ............. 5 proyectos',
    '[ ok ] despertando a bit'
  ];
  const LINEA_MS = 100, REVELA_MS = 800, SALUDA_MS = 500, SALE_MS = 250, QUIETO_MS = 1000;
  const est = { activo: false, fase: 'fin', saltado: false };

  if (!html.classList.contains('arrancando')) return { estado: () => Object.assign({}, est) };

  const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  est.activo = true;
  est.fase = 'log';

  // la capa: una ventana de terminal al centro con el registro arriba y bit abajo
  const capa = document.createElement('div');
  capa.className = 'arranque';
  capa.setAttribute('aria-hidden', 'true');
  capa.dataset.permanente = '';
  capa.innerHTML = '<div class="arranque-ventana"><div class="arranque-barra">bit — ~/portafolio</div>' +
    '<pre class="arranque-log"></pre><pre class="arranque-bit"></pre><span class="arranque-saltar">[esc] saltar</span></div>';
  document.body.appendChild(capa);
  const log = capa.querySelector('.arranque-log');
  const bit = capa.querySelector('.arranque-bit');
  const ventana = capa.querySelector('.arranque-ventana');

  function encajar() {
    // alto disponible: la ventana menos la barra (34), el registro (5 renglones de 20 + 32 de relleno),
    // el margen inferior de bit (36) y un respiro de 12
    B.ajustar(bit, ventana.clientWidth - 32, ventana.clientHeight - 34 - (5 * 20 + 32) - 36 - 12);
  }
  encajar();
  window.addEventListener('resize', encajar);

  let rafId = 0, terminado = false;
  const azar = Array.from({ length: B.COLS * B.FILAS }, () => Math.random());
  const t0 = performance.now();
  const inicioBit = LOG.length * LINEA_MS;
  const finSaludo = inicioBit + REVELA_MS + SALUDA_MS;

  /** Filtro de revelado: cada celda llega en su momento (primero el centro, con algo de azar); antes, cicla la rampa. */
  function revelar(p) {
    return function (x, y, ch) {
      const llega = (Math.hypot((x - B.COLS / 2) * B.ASPECTO, y - B.FILAS / 2) / 26) * 0.65 + azar[y * B.COLS + x] * 0.35;
      if (ch === ' ' || p >= llega) return ch;
      const k = Math.floor((p - llega + 0.3) / 0.3 * B.RAMPA.length);
      return k <= 0 ? ' ' : B.RAMPA[Math.min(B.RAMPA.length - 1, k)];
    };
  }

  function cuadro(ahora) {
    if (terminado) return;
    const ms = ahora - t0;
    log.textContent = LOG.slice(0, Math.min(LOG.length, Math.floor(ms / LINEA_MS) + 1)).join('\n');
    if (ms >= inicioBit) {
      const t = (ms - inicioBit) / 1000, p = (ms - inicioBit) / REVELA_MS;
      est.fase = p < 1 ? 'revela' : 'saluda';
      const parpadeo = t > 1.05 && t < 1.2 ? Math.abs(t - 1.125) * 13 : 1;
      bit.innerHTML = B.html(B.escena(t, { parpadeo: parpadeo, saludo: Math.sin(t * 7) }), p < 1 ? revelar(p) : null);
    }
    if (ms >= finSaludo) { salir(false); return; }
    rafId = requestAnimationFrame(cuadro);
  }

  function salir(saltado) {
    if (terminado) return;
    terminado = true;
    cancelAnimationFrame(rafId);
    est.saltado = saltado;
    est.fase = 'sale';
    try { sessionStorage.setItem('arranque', 'visto'); } catch (e) { /* sin almacenamiento: se verá en cada carga */ }
    window.removeEventListener('keydown', alTeclear, true);
    window.removeEventListener('pointerdown', alTocar, true);
    window.removeEventListener('resize', encajar);
    // la página aparece ya; la capa se apaga encima en 4 pasos y luego se quita
    html.classList.remove('arrancando');
    est.activo = false;
    document.dispatchEvent(new CustomEvent('portafolio:arranque-fin', { detail: { saltado: saltado } }));
    capa.classList.add('saliendo');
    setTimeout(() => { capa.remove(); est.fase = 'fin'; }, reducir ? 0 : SALE_MS);
  }

  function alTeclear(e) {
    // ninguna tecla llega a la página mientras dura (así «/» no abre la terminal)
    e.preventDefault();
    e.stopImmediatePropagation();
    salir(true);
  }
  function alTocar() { salir(true); }   // el clic sigue su camino: el sonido lo usa como gesto
  window.addEventListener('keydown', alTeclear, true);
  window.addEventListener('pointerdown', alTocar, true);

  if (reducir) {
    log.textContent = LOG.join('\n');
    est.fase = 'saluda';
    bit.innerHTML = B.html(B.escena(0.4, { saludo: 1 }));
    setTimeout(() => salir(false), QUIETO_MS);
  } else {
    rafId = requestAnimationFrame(cuadro);
  }

  return { estado: () => Object.assign({}, est) };
})();
