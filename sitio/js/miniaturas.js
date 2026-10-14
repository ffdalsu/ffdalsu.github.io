/*
 * Miniaturas ASCII animadas de los proyectos (maqueta A). Cada <canvas data-miniatura="…"> tiene su escena.
 * Solo se animan las que están en pantalla; con «reducir movimiento» se dibuja un cuadro fijo.
 * Los datos que aparecen (facturas, cifras) son de demostración.
 */
window.Portafolio = window.Portafolio || {};

Portafolio.Miniaturas = (function () {
  const reducir = window.matchMedia('(prefers-reduced-motion: reduce)');
  let colores = {};

  function leerColores() {
    const s = getComputedStyle(document.documentElement);
    colores = { fondo: s.getPropertyValue('--fondo').trim(), texto: s.getPropertyValue('--texto').trim(),
      tenue: s.getPropertyValue('--tenue').trim(), acento: s.getPropertyValue('--acento').trim() };
  }

  const RECIBO = [
    'FACTURA  No. 000127', 'cliente: Tienda La 70', '──────────────────────────────',
    'teclado mecánico   2    189.900', 'mouse inalámbrico  1     64.500', 'monitor 24 pulg.   1    719.000',
    'cable HDMI 2 m     3     18.000', '──────────────────────────────', 'subtotal              1.217.300',
    'IVA 19 %                231.287', 'TOTAL                 1.448.587', '', 'gracias por su compra', ''
  ];

  const ESCENAS = {
    // Facturación: el recibo de la factura pasa como por una impresora térmica
    factura(r, t) {
      const desde = Math.floor(t * 2.5);
      for (let f = 0; f < r.filas; f++) {
        const linea = RECIBO[(f + desde) % RECIBO.length];
        r.dibujo([linea], 2, f, linea.startsWith('TOTAL') ? colores.acento : colores.texto, 1);
      }
    },
    // Hermes: nodos de conocimiento conectados; una pregunta viaja de nodo en nodo hasta la respuesta
    hermes(r, t) {
      const nodos = Array.from({ length: 9 }, (_, i) => ({
        c: Math.round(r.cols / 2 + Math.cos(i * 2.1 + t * (0.25 + (i % 4) * 0.06)) * (0.18 + (i % 3) * 0.1) * r.cols * 1.2),
        f: Math.round(r.filas / 2 + Math.sin(i * 2.1 + t * (0.25 + (i % 4) * 0.06)) * (0.18 + (i % 3) * 0.1) * r.filas * 1.4)
      }));
      nodos.forEach((p, i) => {
        const q = nodos[(i + 3) % nodos.length];
        for (let k = 1; k < 24; k++) r.dibujo(['·'], p.c + (q.c - p.c) * k / 24, Math.round(p.f + (q.f - p.f) * k / 24), colores.tenue, 1);
      });
      const salto = Math.floor(t * 1.5) % nodos.length, avance = (t * 1.5) % 1;
      const a = nodos[salto], b = nodos[(salto + 3) % nodos.length];
      r.dibujo(['?'], a.c + (b.c - a.c) * avance, a.f + (b.f - a.f) * avance, colores.acento, 1);
      nodos.forEach((p, i) => r.dibujo([i === 0 ? '@' : 'o'], p.c, p.f, i === 0 ? colores.acento : colores.texto, 1));
      r.dibujo(['> ¿dónde corre el proyecto X?'], 2, r.filas - 2, colores.texto, 1, true, colores.fondo);
    },
    // Indicadores: un tablero; las barras crecen hasta su valor y la cifra principal cuenta hacia arriba
    indicadores(r, t) {
      const valores = [0.42, 0.68, 0.55, 0.81, 0.63, 0.92, 0.74];
      const avance = Math.min(1, (t % 6) / 2);
      const base = r.filas - 2, alto = r.filas - 6, ancho = 3;
      r.dibujo(['ventas por mes · demo'], 2, 1, colores.tenue, 1);
      r.dibujo(['▲ ' + Math.round(1240 * avance) + ' u'], r.cols - 12, 1, colores.acento, 1);
      valores.forEach((v, i) => {
        const h = Math.round(v * alto * avance);
        for (let k = 0; k < h; k++) r.dibujo([i === 5 ? '███' : '▓▓▓'], 3 + i * (ancho + 2), base - k, i === 5 ? colores.acento : colores.texto, 1);
      });
      r.dibujo(['─'.repeat(r.cols - 4)], 2, base + 1, colores.tenue, 1);
    },
    // Automatizaciones: el reloj de la tarea programada da la hora y salen sobres hacia los destinatarios
    automatizaciones(r, t) {
      const c = Math.floor(r.cols * 0.22), f = Math.floor(r.filas / 2);
      const reloj = ['  .---.  ', ' /  |  \\ ', '|   o   |', ' \\     / ', "  '---'  "];
      r.dibujo(reloj, c - 4, f - 2, colores.texto, 1);
      const ang = t * 1.2, mx = Math.round(Math.cos(ang) * 2.5), my = Math.round(Math.sin(ang) * 1.2);
      r.dibujo(['*'], c + mx, f + my, colores.acento, 1);
      r.dibujo(['cron · 06:00 L-V'], c - 6, f + 4, colores.tenue, 1);
      for (let i = 0; i < 3; i++) {
        const avance = (t * 0.5 + i / 3) % 1;
        const x = c + 6 + avance * (r.cols - c - 14), y = f - 2 + i * 2 + Math.sin(avance * 6) * 0.5;
        r.dibujo(['[✉]'], x, y, avance > 0.85 ? colores.acento : colores.texto, 1);
      }
      r.dibujo(['✓ alerta enviada'], r.cols - 18, r.filas - 2, colores.acento, 1, true, colores.fondo);
    },
    // Este portafolio: las dos ondas del océano del inicio
    onda(r, t) {
      for (let c = 0; c < r.cols; c++) {
        const y1 = Math.round(r.filas / 2 + Math.sin(c * 0.22 + t * 2) * r.filas * 0.32);
        const y2 = Math.round(r.filas / 2 + Math.sin(c * 0.13 - t * 1.4 + 1) * r.filas * 0.22);
        r.dibujo(['~'], c, y1, colores.texto, 1);
        for (let y = y1 + 1; y < r.filas; y += 3) r.dibujo(['.'], c, y, colores.tenue, 1);
        r.dibujo(['-'], c, y2, colores.acento, 1);
      }
    }
  };

  function animar(canvas) {
    const escena = ESCENAS[canvas.dataset.miniatura];
    if (!escena) return;
    const r = Portafolio.Rejilla(canvas, { tamFuente: 11 });
    let visible = false;
    const cuadro = (ahora) => {
      if (!visible) return;
      r.limpiar(); escena(r, ahora / 1000);
      requestAnimationFrame(cuadro);
    };
    if (reducir.matches) { r.limpiar(); escena(r, 3); canvas.dataset.dibujada = '1'; return; }
    new IntersectionObserver(([e]) => {
      const antes = visible;
      visible = e.isIntersecting;
      if (visible) canvas.dataset.dibujada = '1';
      if (visible && !antes) requestAnimationFrame(cuadro);
    }).observe(canvas);
    window.addEventListener('resize', () => r.medir());
  }

  $(function () {
    leerColores();
    new MutationObserver(leerColores).observe(document.documentElement, { attributes: true, attributeFilter: ['data-bs-theme'] });
    document.querySelectorAll('canvas[data-miniatura]').forEach(animar);
  });

  // las escenas también las usan los videos de proyecto (videos/escena.html)
  return { escenas: ESCENAS, usarColores: function (c) { colores = c; } };
})();
