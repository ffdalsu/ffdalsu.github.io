/*
 * Página 404 (F17b, D35): bit perdido en un océano ASCII. Solo actúa si el <main> es el de la 404.
 *
 * El mar son dos ondas que se cruzan (rampa « .-~»); la ruta que no existe se muestra en el comando y en la barra de
 * la ventana. Con «reducir movimiento» el mar queda quieto.
 *   Portafolio.Error404.estado() → { activo, ruta, cuadros }
 */
window.Portafolio = window.Portafolio || {};

Portafolio.Error404 = (function () {
  const PASO_MS = 120;
  const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const est = { activo: false, ruta: '', cuadros: 0 };
  let intervalo = null, t = 0;

  function pintar(mar) {
    const celda = mar.dataset.celda ? JSON.parse(mar.dataset.celda) : { w: 7.8, h: 15 };
    const cols = Math.ceil(mar.clientWidth / celda.w) + 1, filas = Math.ceil(mar.clientHeight / celda.h) + 1;
    const lineas = new Array(filas);
    for (let y = 0; y < filas; y++) {
      let s = '';
      for (let x = 0; x < cols; x++) {
        const v = Math.sin(x / 6 + t + y * 0.7) + Math.sin(x / 11 - t * 0.6 + y * 0.3);
        s += v > 1.2 ? '~' : v > 0.6 ? '-' : v > 0.1 ? '.' : ' ';
      }
      lineas[y] = s;
    }
    mar.textContent = lineas.join('\n');
    est.cuadros++;
  }

  function medir(mar) {
    const prueba = document.createElement('span');
    prueba.textContent = 'MMMMMMMMMM';
    mar.appendChild(prueba);
    const r = prueba.getBoundingClientRect();
    if (r.width > 0) mar.dataset.celda = JSON.stringify({ w: r.width / 10, h: r.height });
    prueba.remove();
  }

  Portafolio.Paginas.montar(function () {
    const mar = document.querySelector('main[data-pagina="404"] .mar404');
    if (!mar) return;
    est.activo = true;
    est.ruta = decodeURIComponent(location.pathname);
    document.querySelectorAll('.ruta-perdida').forEach((el) => { el.textContent = est.ruta; });
    medir(mar);
    pintar(mar);
    if (!reducir) intervalo = setInterval(() => { t += 0.12; pintar(mar); }, PASO_MS);
  });

  Portafolio.Paginas.desmontar(function () {
    clearInterval(intervalo);
    intervalo = null;
    est.activo = false;
  });

  return { estado: () => Object.assign({}, est) };
})();
