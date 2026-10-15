/*
 * Favicon vivo (F17a, D35): el ícono de la pestaña es bit. Parpadea cada ~4 s, mueve las olas cuando suena la música
 * y se duerme cuando la pestaña queda oculta. Se dibuja en un lienzo de 64 px y se pone como PNG en <link rel=icon>;
 * img/favicon.svg queda de respaldo (navegadores sin lienzo, o Safari, que no anima favicons).
 *
 *   Portafolio.Favicon.estado() → { cara: 'abierto'|'parpadeo'|'duerme', olas, cuadros }
 *
 * Es de toda la visita (el <head> no cambia al navegar). Con «reducir movimiento» queda quieto (solo duerme).
 */
window.Portafolio = window.Portafolio || {};

Portafolio.Favicon = (function () {
  const TIC_MS = 400, CADA_PARPADEO_MS = 4000, PARPADEO_MS = 250;
  const CARAS = { abierto: '[o_o]', parpadeo: '[-_-]', duerme: '[-.-]' };
  const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const est = { cara: 'abierto', olas: false, cuadros: 0 };

  const lienzo = document.createElement('canvas');
  lienzo.width = lienzo.height = 64;
  const c = lienzo.getContext && lienzo.getContext('2d');
  const enlace = document.querySelector('link[rel="icon"]');
  if (!c || !enlace) return { estado: () => Object.assign({}, est) };

  let fase = 0, parpadeando = false, firma = '';

  function musicaSonando() {
    try { return !!(Portafolio.Sonido && Portafolio.Sonido.estado().musica); } catch (e) { return false; }
  }

  function dibujar() {
    const cara = document.hidden ? 'duerme' : parpadeando ? 'parpadeo' : 'abierto';
    const olas = !document.hidden && musicaSonando();
    const desfase = olas && !reducir ? fase * 3 : 0;
    const nueva = cara + olas + desfase;
    if (nueva === firma) return;   // sin cambios: no se toca el <link>
    firma = nueva;
    c.fillStyle = '#120D04';
    c.fillRect(0, 0, 64, 64);
    c.fillStyle = '#FFB547';
    c.strokeStyle = '#FFB547';
    c.font = '700 21px Consolas, "Cascadia Mono", monospace';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(CARAS[cara], 32, olas ? 28 : 30);
    c.lineWidth = 3;
    c.lineCap = 'round';
    c.beginPath();
    for (let x = 6; x <= 58; x++) {
      const y = 50 + Math.sin((x + desfase) / 5) * (olas ? 4 : 2);
      if (x === 6) c.moveTo(x, y); else c.lineTo(x, y);
    }
    c.stroke();
    if (olas) { c.font = '700 14px sans-serif'; c.fillText('♪', 54 - (desfase % 6), 10); }
    enlace.type = 'image/png';
    enlace.href = lienzo.toDataURL('image/png');
    est.cara = cara;
    est.olas = olas;
    est.cuadros++;
  }

  dibujar();
  if (!reducir) {
    setInterval(() => { if (!document.hidden) { fase++; dibujar(); } }, TIC_MS);
    setInterval(() => {
      if (document.hidden) return;
      parpadeando = true; dibujar();
      setTimeout(() => { parpadeando = false; dibujar(); }, PARPADEO_MS);
    }, CADA_PARPADEO_MS);
  }
  document.addEventListener('visibilitychange', dibujar);

  return { estado: () => Object.assign({}, est), dibujar: dibujar };
})();
