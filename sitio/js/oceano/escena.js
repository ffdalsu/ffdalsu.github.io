/*
 * Escena del océano en el inicio: un canvas fijo detrás de la página.
 *
 * Inmersión: la superficie del mar está dentro del encabezado (.hero). Al desplazarse por la página la
 * cámara baja con el scroll, así que se pasa del cielo a la superficie y luego al fondo, que se oscurece.
 * Bit flota en la superficie, sigue al puntero mientras está sobre el encabezado y se duerme si no pasa nada.
 *
 * Rendimiento: máximo 30 cuadros por segundo, se pausa con la pestaña oculta y, con «reducir movimiento»,
 * no anima: dibuja un cuadro fijo cada vez que cambia el scroll, el tamaño o el tema.
 * Las pruebas leen Portafolio.Oceano.estado().
 */
window.Portafolio = window.Portafolio || {};

Portafolio.Oceano = (function () {
  const ESCALA_BIT = 2.2;     // bit se dibuja 2,2 veces más grande que los caracteres del mar
  const RAMPA = ' .·:-=+*#';  // de menos a más intensidad
  const MS_POR_CUADRO = 1000 / 30;
  const METROS_POR_FILA = 0.5;

  let rejilla = null, hero = null, bit = null, sonda = null, punteroPantalla = null, filaBitPantalla = 0;
  let colores = {};
  let ultimo = 0, msCuadro = 0, profundidad = 0;
  const reducir = window.matchMedia('(prefers-reduced-motion: reduce)');

  function leerColores() {
    const s = getComputedStyle(document.documentElement);
    colores = {
      fondo: s.getPropertyValue('--fondo').trim(),
      texto: s.getPropertyValue('--texto').trim(),
      tenue: s.getPropertyValue('--tenue').trim(),
      acento: s.getPropertyValue('--acento').trim()
    };
  }

  /** Fila del mundo (en filas de rejilla, desde el inicio de la página) donde está el nivel del mar. */
  function filaSuperficie() {
    const caja = hero.getBoundingClientRect();
    return (window.scrollY + caja.top + caja.height * 0.64) / rejilla.ch;
  }

  // Estrellas fijas del cielo: pseudoaleatorio estable por celda, para que no titilen al moverse
  const esEstrella = (c, y) => ((c * 73856093) ^ (y * 19349663)) % 61 === 0;

  function dibujar(ahora) {
    const inicio = performance.now();
    const t = ahora / 1000;
    const r = rejilla;
    const camara = window.scrollY / r.ch;          // fila del mundo que está en la parte de arriba de la pantalla
    const sup = filaSuperficie();
    const filasMundo = document.documentElement.scrollHeight / r.ch;
    const tenue = [], medio = [];

    for (let f = 0; f < r.filas; f++) {
      const y = Math.floor(camara) + f;
      let lt = '', lm = '';
      for (let c = 0; c < r.cols; c++) {
        const nivel = sup + Portafolio.Campo.superficie(c, t);
        const prof = y - nivel;
        let ct = ' ', cm = ' ';
        if (prof < -0.5) {
          if (esEstrella(c, y)) ct = '·';
        } else if (prof < 0.5) {
          cm = '~';
        } else {
          // bajo el agua: el mar se vuelve más ralo y tenue con la profundidad
          const oscuro = Math.min(1, prof / Math.max(20, filasMundo - sup));
          const v = Portafolio.Campo.valor(c, y, t);
          // solo las crestas (v > 0,1) llevan carácter; los valles quedan vacíos y el mar respira
          const i = v < 0.1 ? 0 : Math.max(1, Math.floor((v - 0.1) / 0.9 * (RAMPA.length - 1) * (1 - oscuro * 0.7)));
          const salto = 1 + Math.floor(oscuro * 3);
          if (i > 0 && (c + y) % salto === 0) {
            if (prof < 4 && i > 3) cm = RAMPA[i]; else ct = RAMPA[i];
          }
        }
        lt += ct; lm += cm;
      }
      tenue.push(lt); medio.push(lm);
    }

    // el ajuste fino entre filas enteras y la cámara evita saltos de una fila al desplazarse
    const dy = -(camara - Math.floor(camara)) * r.ch;
    r.limpiar();
    r.ctx.save(); r.ctx.translate(0, dy);
    r.capas(tenue, colores.tenue);
    r.capas(medio, colores.texto);
    r.ctx.restore();

    // criaturas de las habilidades e islas de los proyectos (js/oceano/ecosistema.js)
    if (Portafolio.Ecosistema) {
      Portafolio.Ecosistema.dibujar(r, t, camara, colores, punteroPantalla);
      Portafolio.Ecosistema.moverIslas(r, t, (c, tt) => sup + Portafolio.Campo.superficie(c, tt) - camara);
    }

    // bit, flotando a la altura de la ola bajo su centro
    bit.actualizar(ahora, r.cols, ESCALA_BIT);
    const s = bit.sprite;
    const ancho = s.ancho * ESCALA_BIT;
    const centro = Math.round(bit.x + ancho / 2);
    const balanceo = bit.modo === 'habla' ? -Math.abs(Math.sin(t * 9)) * 0.5 : 0;
    const filaBit = sup + Portafolio.Campo.superficie(centro, t) - s.linea * ESCALA_BIT + balanceo - camara;
    filaBitPantalla = filaBit;
    const cuadro = s.cuadro(bit.estadoSprite(), t, bit.ritmo());
    if (filaBit > -s.alto * ESCALA_BIT && filaBit < r.filas) {
      r.dibujo(cuadro, bit.x, filaBit, colores.acento, ESCALA_BIT, true, colores.fondo);
      adornos(t, filaBit, ancho, sup - camara);
    }

    profundidad = Math.max(0, (camara + r.filas * 0.5 - sup) * METROS_POR_FILA);
    msCuadro = msCuadro * 0.9 + (performance.now() - inicio) * 0.1;
  }

  /** Estela al nadar, «zzz» al dormir y el globo de texto al hablar. */
  function adornos(t, filaBit, ancho, filaAgua) {
    const r = rejilla;
    const x = Math.round(bit.x);
    const y = Math.round(filaBit);
    if (bit.modo === 'sigue' && Math.abs(bit.vx) > 0.05) {
      const d = bit.vx > 0 ? -1 : 1;
      const xe = d < 0 ? x - 1 : x + Math.ceil(ancho);
      const estela = [0, 1, 2, 3].map((i) => (Math.floor(t * 8) + i) % 3 ? (i ? '~' : '≈') : ' ').join('');
      r.dibujo([d < 0 ? estela.split('').reverse().join('') : estela], d < 0 ? xe - 3 : xe, Math.round(filaAgua), colores.texto, 1);
    }
    if (bit.modo === 'duerme') {
      const z = Math.floor(t * 1.5) % 3;
      r.dibujo([z === 2 ? 'Z' : 'z'], x + Math.ceil(ancho) + z, y - z, colores.tenue, 1);
    }
    if (bit.modo === 'habla') {
      // el globo va al lado de la cabeza (arriba lo taparían los paneles del encabezado):
      // a la derecha si cabe, si no a la izquierda, con una colita hacia bit
      const ancho2 = Array.from(bit.frase).length + 4;
      const derecha = x + Math.ceil(ancho) + 2 + ancho2 <= r.cols;
      const izquierda = x - ancho2 - 2 >= 0;
      const linea = '─'.repeat(ancho2 - 2);
      const globo = ['┌' + linea + '┐', '│ ' + bit.frase + ' │', '└' + linea + '┘'];
      if (derecha || izquierda) {
        const bx = derecha ? x + Math.ceil(ancho) + 2 : x - ancho2 - 2;
        r.dibujo(globo, bx, y + 1, colores.texto, 1, true, colores.fondo);
        r.dibujo(['─'], derecha ? bx - 1 : bx + ancho2, y + 2, colores.texto, 1);
      } else {
        // pantalla angosta: el globo va encima de bit, centrado y dentro de la pantalla
        const bx = Math.max(0, Math.min(r.cols - ancho2, Math.round(x + ancho / 2 - ancho2 / 2)));
        r.dibujo(globo.concat([' '.repeat(Math.max(0, Math.round(x + ancho / 2) - bx)) + '│']), bx, y - 4, colores.texto, 1, true, colores.fondo);
      }
    }
  }

  function cuadro(ahora) {
    if (!document.hidden && ahora - ultimo >= MS_POR_CUADRO) { ultimo = ahora; dibujar(ahora); }
    if (!reducir.matches) requestAnimationFrame(cuadro);
  }

  function iniciar() {
    const canvas = document.getElementById('oceano');
    hero = document.querySelector('.hero');
    if (!canvas || !hero) return;
    rejilla = Portafolio.Rejilla(canvas, { tamFuente: window.innerWidth < 640 ? 11 : 13 });
    // las frases de bit viven en el HTML (data-frases del encabezado), separadas por «|»
    bit = Portafolio.Bit((hero.dataset.frases || '').split('|').filter(Boolean));
    sonda = document.getElementById('sonda');
    leerColores();

    const ahora = () => performance.now();
    const columna = (x) => x / rejilla.cw;
    const fila = (yPantalla) => (window.scrollY + yPantalla) / rejilla.ch;
    const sobreHero = (y) => { const c = hero.getBoundingClientRect(); return y >= c.top && y <= c.bottom; };
    const redibujar = () => { if (reducir.matches) dibujar(ahora()); };

    window.addEventListener('pointermove', (e) => {
      bit.actividad(ahora());
      Portafolio.Campo.moverPuntero(columna(e.clientX), fila(e.clientY));
      punteroPantalla = { c: columna(e.clientX), f: e.clientY / rejilla.ch };
      bit.seguir(sobreHero(e.clientY) ? columna(e.clientX) : null, ahora());
    });
    // con el dedo, levantarlo también dispara pointerleave: solo el mouse «sale» de la página
    document.documentElement.addEventListener('pointerleave', (e) => {
      if (e.pointerType !== 'mouse') return;
      Portafolio.Campo.moverPuntero(null); punteroPantalla = null; bit.seguir(null, ahora());
    });
    // en pantallas táctiles no hay «pasar el puntero»: tocar el agua le dice a bit a dónde nadar
    hero.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' && !e.target.closest('a, button, .panel')) bit.seguir(columna(e.clientX), ahora());
    });
    hero.addEventListener('click', (e) => {
      if (e.target.closest('a, button, .panel')) return;
      const c = columna(e.clientX);
      const ancho = bit.sprite.ancho * ESCALA_BIT;
      if (c >= bit.x && c <= bit.x + ancho) bit.hablar(ahora());
      else Portafolio.Campo.salpicar(c, ahora() / 1000);
      redibujar();
    });
    window.addEventListener('scroll', () => { bit.actividad(ahora()); redibujar(); }, { passive: true });
    window.addEventListener('keydown', () => bit.actividad(ahora()));
    window.addEventListener('resize', () => { rejilla.medir(); redibujar(); });
    new MutationObserver(() => { leerColores(); redibujar(); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['data-bs-theme'] });

    // la sonda muestra la profundidad y el estado de bit cuatro veces por segundo
    if (sonda) setInterval(() => { sonda.textContent = 'prof ' + Math.round(profundidad) + ' m · bit: ' + bit.modo; }, 250);

    bit.hablar(ahora());
    dibujar(ahora());
    if (!reducir.matches) requestAnimationFrame(cuadro);
  }

  $(iniciar);

  return {
    estado: function () {
      return bit ? {
        bit: { x: bit.x, modo: bit.modo, ancho: bit.sprite.ancho * ESCALA_BIT, frase: bit.frase, objetivo: bit.objetivo, fila: filaBitPantalla, ch: rejilla.ch },
        ecosistema: Portafolio.Ecosistema ? Portafolio.Ecosistema.estado() : null,
        profundidad: profundidad,
        msCuadro: msCuadro,
        cw: rejilla.cw,
        animado: !reducir.matches
      } : null;
    }
  };
})();
