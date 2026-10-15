/*
 * Sobre mí: animaciones ASCII de los hitos y despliegue de los diplomas.
 *
 * Cada hito tiene un <canvas data-anim="…"> decorativo; su animación corre solo mientras se ve en pantalla.
 * Los diplomas son HTML (se leen y se seleccionan); al verlos se «despliegan» y el sello cae con un golpe.
 * Con «reducir movimiento» cada animación dibuja un cuadro final fijo y los diplomas aparecen ya desplegados.
 */
window.Portafolio = window.Portafolio || {};

Portafolio.SobreMi = (function () {
  const reducir = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sonar = (n, d, r) => { if (Portafolio.Sonido) Portafolio.Sonido.efecto(n, d, r); };   // js/sonido/sonido.js
  const SIMBOLOS = ['∑', '∫', 'π', '√', '∞', 'Δ', '∂', 'e'];
  const ESCUDO = [' .-------. ', ' |VE | RI| ', ' |---+---| ', ' |  TAS  | ', '  \\     /  ', '   `---´   '];
  let colores = {};
  const vistos = new Set();
  let desbordes = 0;   // textos que no cupieron en su canvas ni corriéndolos (las pruebas exigen 0)

  function leerColores() {
    const s = getComputedStyle(document.documentElement);
    colores = { fondo: s.getPropertyValue('--fondo').trim(), texto: s.getPropertyValue('--texto').trim(),
      tenue: s.getPropertyValue('--tenue').trim(), acento: s.getPropertyValue('--acento').trim() };
  }

  // Pseudoaleatorio estable: la misma semilla da siempre el mismo número entre 0 y 1
  const azar = (n) => { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); };
  const centrar = (r, texto) => Math.max(0, Math.floor((r.cols - Array.from(texto).length) / 2));

  /* ---------- Una animación por hito: (rejilla, t en segundos) ---------- */
  const ANIMACIONES = {
    // Grado: el birrete sube y cae en parábola mientras llueven símbolos matemáticos
    grado(r, t) {
      for (let i = 0; i < 22; i++) {
        const c = Math.floor(azar(i) * r.cols);
        const f = ((t * (1.5 + azar(i + 50) * 2) + azar(i + 99) * r.filas) % (r.filas + 2)) - 1;
        r.dibujo([SIMBOLOS[i % SIMBOLOS.length]], c, f, i % 3 ? colores.tenue : colores.acento, 1);
      }
      const ciclo = (t % 2.6) / 2.6;
      const alto = 4 * ciclo * (1 - ciclo);                 // parábola: 0 → 1 → 0
      const birrete = ['  _____  ', ' /_____\\ ', '    |~   '];
      const fila = r.filas - 6 - alto * (r.filas - 9);
      r.dibujo(birrete, centrar(r, birrete[0]) / 1.4, fila, colores.acento, 1.4, true, colores.fondo);
      const placa = '[ Matemático puro · U. Nacional ]';
      r.dibujo([placa], centrar(r, placa), r.filas - 2, colores.texto, 1, true, colores.fondo);
    },

    // Bancolombia: un modelo entrenándose; la exactitud sube y la pérdida baja época a época
    banco(r, t) {
      const ancho = r.cols - 6, alto = r.filas - 4, x0 = 4, y0 = 1;
      for (let f = 0; f <= alto; f++) r.dibujo(['│'], x0 - 1, y0 + f, colores.tenue, 1);
      r.dibujo(['└' + '─'.repeat(ancho)], x0 - 1, y0 + alto, colores.tenue, 1);
      const epocas = 50, epoca = Math.min(epocas, Math.floor((t * 12) % (epocas + 20)));
      for (let e = 0; e <= epoca; e++) {
        const x = x0 + Math.round(e / epocas * (ancho - 1));
        const exactitud = 1 - Math.exp(-e / 9) * 0.85;
        const perdida = Math.exp(-e / 11) * 0.95 + 0.04;
        r.dibujo(['*'], x, y0 + Math.round((1 - exactitud) * (alto - 1)), colores.acento, 1);
        if (e % 2 === 0) r.dibujo(['·'], x, y0 + Math.round((1 - perdida) * (alto - 1)), colores.texto, 1);
      }
      const p = (Math.exp(-epoca / 11) * 0.95 + 0.04).toFixed(3);
      const leyenda = (r.cols < 50 ? 'época ' : 'modelo.fit() · época ') + String(epoca).padStart(2, '0') + '/' + epocas + (r.cols < 50 ? ' · pérd. ' : ' · pérdida ') + p;
      r.dibujo([leyenda], x0 + 1, r.filas - 2, colores.texto, 1, true, colores.fondo);
      const clave = r.cols < 50 ? '* exact. · pérd.' : '* exactitud  · pérdida';
      r.dibujo([clave], r.cols - clave.length - 1, y0, colores.tenue, 1, true, colores.fondo);
    },

    // CS50x: el escudo se arma línea por línea y corre el primer programa de CS50
    cs50x(r, t) {
      const ciclo = t % 7;
      const lineas = Math.min(ESCUDO.length, Math.floor(ciclo * 3));
      const c = Math.max(1, Math.floor(r.cols * 0.12));
      r.dibujo(ESCUDO.slice(0, lineas), c, 1, colores.acento, 1.3);
      const consola = ['$ make hello', '$ ./hello', 'hello, world'];
      const cx = Math.floor(r.cols * 0.52);
      const letras = Math.max(0, Math.floor((ciclo - 2) * 14));
      let resto = letras;
      consola.forEach((l, i) => {
        const visibles = Array.from(l).slice(0, Math.max(0, resto)).join('');
        resto -= l.length;
        if (visibles) r.dibujo([visibles], cx, 2 + i * 2, i === 2 ? colores.acento : colores.texto, 1);
      });
      if (Math.floor(t * 2) % 2 === 0) r.dibujo(['█'], cx, 2 + Math.min(3, Math.floor(letras / 12)) * 2, colores.tenue, 1);
      const pie = r.cols < 50 ? 'CS50x · Harvard' : 'CS50x · Introduction to Computer Science';
      r.dibujo([pie], Math.max(0, Math.floor((r.cols - pie.length) / 2)), r.filas - 2, colores.tenue, 1);
    },

    // CS50P · SQL · AI: una red neuronal; las señales viajan de los cursos a la salida
    red(r, t) {
      const capas = [['CS50P', 'CS50 SQL', 'CS50AI'], ['o', 'o', 'o', 'o'], ['IA']];
      const xs = [Math.floor(r.cols * 0.08), Math.floor(r.cols * 0.5), Math.floor(r.cols * 0.82)];
      const pos = capas.map((capa, i) => capa.map((_, j) => ({ c: xs[i], f: Math.round((j + 1) * r.filas / (capa.length + 1)) })));
      for (let i = 0; i < 2; i++) pos[i].forEach((a, ai) => pos[i + 1].forEach((b, bi) => {
        for (let k = 1; k < 12; k++) r.dibujo(['·'], a.c + (b.c - a.c) * k / 12 + 2, a.f + (b.f - a.f) * k / 12, colores.tenue, 1);
        const avance = ((t * 0.7 + (ai + bi) * 0.23) % 1);
        r.dibujo(['@'], a.c + (b.c - a.c) * avance + 2, a.f + (b.f - a.f) * avance, colores.acento, 1);
      }));
      capas.forEach((capa, i) => capa.forEach((nombre, j) => {
        const p = pos[i][j];
        const texto = i === 1 ? '(o)' : '[' + nombre + ']';
        r.dibujo([texto], i === 0 ? Math.max(0, p.c - 2) : p.c, p.f, i === 1 ? colores.texto : colores.acento, 1, true, colores.fondo);
      }));
    },

    // Tres certificados: tres sellos caen uno tras otro y quedan marcados
    sellos(r, t) {
      const nombres = ['Python', 'SQL', 'IA'];
      const ciclo = t % 6;
      const ancho = Math.floor(r.cols / 3);
      nombres.forEach((n, i) => {
        const llegada = 0.6 + i * 0.9;
        const caida = Math.max(0, 1 - Math.max(0, ciclo - llegada + 0.5) * 2);
        const c = i * ancho + Math.max(0, Math.floor((ancho - 11) / 2));
        const f = 1 - caida * 6;
        if (ciclo > llegada - 0.5) r.dibujo(ESCUDO, c, f, colores.acento, 1, true, colores.fondo);
        if (ciclo > llegada) {
          const sello = '[✓ ' + n + ']';
          r.dibujo([sello], i * ancho + Math.max(0, Math.floor((ancho - sello.length) / 2)), r.filas - 3, colores.texto, 1, true, colores.fondo);
        }
      });
      const pie = r.cols < 45 ? 'HarvardX · certificado × 3' : 'HarvardX · Professional Certificate × 3';
      r.dibujo([pie], centrar(r, pie), r.filas - 1, colores.tenue, 1);
    },

    // Conaltura: un edificio se construye piso a piso con su grúa y se encienden las ventanas
    obra(r, t) {
      const pisos = 7, ciclo = t % 9;
      const hechos = Math.min(pisos, Math.floor(ciclo * 1.3));
      const ancho = 17, c = Math.floor(r.cols * 0.18), suelo = r.filas - 2;
      r.dibujo(['▔'.repeat(r.cols)], 0, suelo + 1, colores.tenue, 1);
      for (let p = 0; p < hechos; p++) {
        const ventanas = Array.from({ length: 4 }, (_, v) => (azar(p * 7 + v + Math.floor(t * 1.5)) > 0.55 ? '■' : '□')).join(' ');
        r.dibujo(['│ ' + ventanas + '  │'], c, suelo - p, p % 2 ? colores.texto : colores.texto, 1);
        r.dibujo([ventanas.replace(/□/g, ' ')], c + 2, suelo - p, colores.acento, 1);
      }
      const tope = suelo - hechos;
      r.dibujo(['┌' + '─'.repeat(ancho - 2) + '┐'], c, tope, colores.texto, 1);
      // la grúa: torre, pluma y gancho que sube y baja
      const gx = c + ancho + 6;
      for (let f = 1; f <= suelo; f++) r.dibujo(['╫'], gx, f, colores.tenue, 1);
      r.dibujo(['═'.repeat(14) + '╬' + '══'], gx - 14, 1, colores.tenue, 1);
      const gancho = 2 + Math.round((Math.sin(t * 1.6) + 1) / 2 * Math.max(1, tope - 3));
      for (let f = 2; f < gancho; f++) r.dibujo(['│'], gx - 8, f, colores.tenue, 1);
      r.dibujo(['╧'], gx - 8, gancho, colores.acento, 1);
      const lema = ['automatizaciones', 'webs', 'IA'];
      lema.forEach((l, i) => r.dibujo(['› ' + l], gx + 4, 3 + i * 2, i <= Math.floor(ciclo) % 4 ? colores.acento : colores.tenue, 1));
    }
  };

  function animar(canvas) {
    const tipo = canvas.dataset.anim, dibujar = ANIMACIONES[tipo];
    if (!dibujar) return;
    const r = Portafolio.Rejilla(canvas, { tamFuente: canvas.getBoundingClientRect().width < 340 ? 11 : 12 });
    // ningún texto se sale del canvas: si no cabe a la derecha se corre hacia adentro (celular)
    const dibujoOriginal = r.dibujo;
    r.dibujo = function (filas, col, fila, color, escala, borrar, fondo) {
      const largo = Math.max.apply(null, filas.map((f) => Array.from(f).length)) * (escala || 1);
      if (largo > 1 && col + largo > r.cols) {
        if (largo > r.cols) desbordes++;
        col = Math.max(0, r.cols - largo);
      }
      return dibujoOriginal(filas, col, fila, color, escala, borrar, fondo);
    };
    let visible = false, inicio = 0;
    const cuadro = (ahora) => {
      if (!visible) return;
      r.limpiar();
      dibujar(r, (ahora - inicio) / 1000);
      requestAnimationFrame(cuadro);
    };
    if (reducir.matches) { r.limpiar(); dibujar(r, 4.5); vistos.add(tipo); return; }
    new IntersectionObserver(([e]) => {
      const antes = visible;
      visible = e.isIntersecting;
      if (visible && !antes) { vistos.add(tipo); if (!inicio) inicio = performance.now(); requestAnimationFrame(cuadro); }
    }, { threshold: 0.25 }).observe(canvas);
    window.addEventListener('resize', () => r.medir());
  }

  $(function () {
    leerColores();
    new MutationObserver(leerColores).observe(document.documentElement, { attributes: true, attributeFilter: ['data-bs-theme'] });
    document.querySelectorAll('canvas[data-anim]').forEach(animar);

    // diplomas: se despliegan al verlos (si no hay movimiento, ya aparecen desplegados)
    const diplomas = document.querySelectorAll('.diploma');
    if (reducir.matches || !('IntersectionObserver' in window)) { diplomas.forEach((d) => d.classList.add('desplegado')); return; }
    diplomas.forEach((d) => d.classList.add('por-desplegar'));
    // se observa el contenedor: un diploma enrollado (clip-path al 100 %) no tiene área visible y nunca «se vería»
    const contenedor = document.querySelector('.diplomas');
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        diplomas.forEach((d) => d.classList.add('desplegado'));
        io.disconnect();
        diplomas.forEach((d, i) => setTimeout(() => sonar('sello'), 1250 + i * 250));
        setTimeout(() => sonar('fanfarria'), 1350 + diplomas.length * 250);
      }
    }, { threshold: 0.2 });
    io.observe(contenedor);
  });

  return { estado: function () { return { animacionesVistas: Array.from(vistos), desbordes: desbordes }; } };
})();
