/*
 * Escena del inicio: un canvas fijo detrás de la página con el cielo, el mar, bit, las criaturas y las islas.
 *
 * Portada en tres actos (D29, js/oceano/coreografia.js): el scroll mueve la cámara. En los actos 1 y 2 el
 * movimiento es cinematográfico (cielo → horizonte); en el acto 3 el mar sube 1:1 con el contenido.
 * La superficie del mar es la fila 0 del mundo; la cámara es la fila del mundo que está arriba de la pantalla.
 * Bit flota en la superficie, sigue al puntero sobre el agua, habla, cuenta y se duerme si no pasa nada.
 *
 * Rendimiento: máximo 30 cuadros por segundo, se pausa con la pestaña oculta y, con «reducir movimiento»,
 * no anima: dibuja un cuadro fijo cada vez que cambia el scroll, el tamaño o el tema.
 * Las pruebas leen Portafolio.Oceano.estado().
 */
window.Portafolio = window.Portafolio || {};

Portafolio.Oceano = (function () {
  const ESCALA_BIT = 2.2;        // bit se dibuja 2,2 veces más grande que los caracteres del mar
  const RAMPA = ' .·:-=+*#%@';    // de menos a más intensidad; «%» y «@» solo salen en las crestas de las salpicaduras
  const CALIENTE = 9;             // desde este índice de la rampa el carácter se pinta en color de acento
  const MS_POR_CUADRO = 1000 / 30;
  const METROS_POR_FILA = 0.5;

  let rejilla = null, hero = null, bit = null, sonda = null, punteroPantalla = null;
  let portada = null, nombre = null, lema = null, panelCampo = null, baja = null;
  let colores = {}, alto = 0, ancho = 0, escena = null, camara = 0, cajaBit = null, saludo = false, cajaGlobo = null;
  let ultimo = 0, msCuadro = 0, profundidad = 0, calientes = 0, tiempo = 0, progreso = 0;
  const reducir = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sonar = (n, d, r) => { if (Portafolio.Sonido) Portafolio.Sonido.efecto(n, d, r); };   // js/sonido/sonido.js
  let modoAnterior = 'flota';

  function leerColores() {
    const s = getComputedStyle(document.documentElement);
    colores = {
      fondo: s.getPropertyValue('--fondo').trim(),
      texto: s.getPropertyValue('--texto').trim(),
      tenue: s.getPropertyValue('--tenue').trim(),
      acento: s.getPropertyValue('--acento').trim()
    };
  }
  const esNoche = () => document.documentElement.getAttribute('data-bs-theme') === 'dark';

  /**
   * Alto de la pantalla. Solo se vuelve a medir si cambia el ancho: en el celular la barra del navegador
   * cambia la altura al hacer scroll y la escena daría saltos.
   */
  function medirPantalla(forzar) {
    if (!forzar && window.innerWidth === ancho) return;
    ancho = window.innerWidth;
    alto = window.innerHeight;
    rejilla.medir();
    // el recorrido de la portada dura LARGO pantallas; el contenido empieza justo al iniciar el acto 3
    hero.style.height = Math.round(alto * Portafolio.Coreografia.LARGO) + 'px';
  }

  /** Aplica la coreografía al nombre, al subtítulo, al panel ψ y a la invitación a bajar. */
  function moverPortada(e) {
    if (!nombre || reducir.matches) return;
    const destinoX = Math.max(16, ancho * 0.04);
    const destinoY = (document.querySelector('.barra') || { offsetHeight: 56 }).offsetHeight + 16;
    const k = e.nombre.k;
    const x = (destinoX - nombre.offsetLeft) * k;
    const y = (destinoY - nombre.offsetTop) * k - e.nombre.salida * alto;
    nombre.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) scale(' + e.nombre.escala.toFixed(3) + ')';
    if (lema) lema.style.opacity = e.lema.toFixed(2);
    if (panelCampo) { panelCampo.style.opacity = e.campo.toFixed(2); panelCampo.style.visibility = e.campo > 0.02 ? 'visible' : 'hidden'; }
    if (baja) baja.style.opacity = e.baja.toFixed(2);
  }

  function dibujar(ahora) {
    const inicio = performance.now();
    const t = ahora / 1000;
    const r = rejilla;
    progreso = window.scrollY / alto;
    escena = Portafolio.Coreografia.estado(progreso, r.filas, reducir.matches);
    const horizonte = escena.horizonte;
    camara = -horizonte;
    moverPortada(escena);

    r.limpiar();
    // el cielo (luna o sol, estrellas, gaviotas) mientras se vea algo de cielo
    const barra = document.querySelector('.barra');
    const margen = barra ? barra.getBoundingClientRect().bottom / r.ch : 0;   // filas que tapa el encabezado fijo
    if (Portafolio.Cielo) Portafolio.Cielo.dibujar(r, t, colores, horizonte, esNoche(), margen);

    // el mar: solo las filas por debajo del horizonte
    const filasMundo = document.documentElement.scrollHeight / r.ch;
    const tenue = [], medio = [], fuerte = [];
    let nCalientes = 0;
    const desde = Math.max(0, Math.floor(horizonte) - 3);
    for (let f = 0; f < r.filas; f++) {
      const y = Math.floor(camara) + f;
      let lt = '', lm = '', lf = '';
      if (f >= desde) {
        for (let c = 0; c < r.cols; c++) {
          const prof = y - Portafolio.Campo.superficie(c, t);
          let ct = ' ', cm = ' ', cf = ' ';
          if (prof >= -0.5 && prof < 0.5) {
            cm = '~';
          } else if (prof >= 0.5) {
            // bajo el agua: el mar se vuelve más ralo y tenue con la profundidad
            const oscuro = Math.min(1, prof / Math.max(20, filasMundo));
            const v = Portafolio.Campo.valor(c, y, t);
            // solo las crestas (v > 0,1) llevan carácter; los valles quedan vacíos y el mar respira.
            // Las crestas normales llegan hasta «#»; solo las salpicaduras (v casi 1) alcanzan «%» y «@»
            const i = v < 0.1 ? 0 : Math.max(1, Math.round((v - 0.1) / 0.9 * (RAMPA.length - 1) * (1 - oscuro * 0.5)));
            const salto = 1 + Math.floor(oscuro * 3);
            if (i >= CALIENTE) { cf = RAMPA[i]; nCalientes++; }
            else if (i > 0 && (c + y) % salto === 0) {
              if (prof < 4 && i > 3) cm = RAMPA[Math.min(i, 8)]; else ct = RAMPA[Math.min(i, 8)];
            }
          }
          lt += ct; lm += cm; lf += cf;
        }
      }
      tenue.push(lt); medio.push(lm); fuerte.push(lf);
    }
    // el ajuste fino entre filas enteras y la cámara evita saltos de una fila al desplazarse
    const dy = -(camara - Math.floor(camara)) * r.ch;
    r.ctx.save(); r.ctx.translate(0, dy);
    r.capas(tenue, colores.tenue);
    r.capas(medio, colores.texto);
    r.capas(fuerte, colores.acento);
    r.ctx.restore();
    calientes = nCalientes;
    tiempo = t;

    // criaturas de las habilidades e islas de los proyectos (js/oceano/ecosistema.js)
    if (Portafolio.Ecosistema) {
      Portafolio.Ecosistema.dibujar(r, t, colores, punteroPantalla);
      Portafolio.Ecosistema.moverIslas(r, t, (c, tt) => Portafolio.Campo.superficie(c, tt) - camara);
    }

    // bit, flotando a la altura de la ola bajo su centro
    bit.actualizar(ahora, r.cols, ESCALA_BIT);
    if (escena.acto >= 2 && !saludo) { saludo = true; bit.hablar(ahora); sonar('voz', { texto: bit.frase }); }
    if (bit.modo === 'duerme' && modoAnterior !== 'duerme' && cajaBit) sonar('zz');
    modoAnterior = bit.modo;
    const s = bit.sprite;
    const anchoBit = s.ancho * ESCALA_BIT;
    const centro = Math.round(bit.x + anchoBit / 2);
    const balanceo = bit.modo === 'habla' ? -Math.abs(Math.sin(t * 9)) * 0.5 : 0;
    const filaBit = Portafolio.Campo.superficie(centro, t) - s.linea * ESCALA_BIT + balanceo - camara;
    const visible = filaBit > -s.alto * ESCALA_BIT && filaBit < r.filas;
    cajaBit = visible ? { x: bit.x * r.cw, y: filaBit * r.ch, ancho: anchoBit * r.cw, alto: s.alto * ESCALA_BIT * r.ch, fila: filaBit } : null;
    if (visible) {
      r.dibujo(s.cuadro(bit.estadoSprite(), t, bit.ritmo()), bit.x, filaBit, colores.acento, ESCALA_BIT, 'silueta', colores.fondo);
      adornos(t, filaBit, anchoBit, -camara);
    }

    profundidad = Math.max(0, (camara + r.filas * 0.5) * METROS_POR_FILA);
    msCuadro = msCuadro * 0.9 + (performance.now() - inicio) * 0.1;
  }

  /** Estela al nadar, «zzz» al dormir y el globo de texto al hablar. */
  function adornos(t, filaBit, anchoBit, filaAgua) {
    const r = rejilla;
    const x = Math.round(bit.x);
    const y = Math.round(filaBit);
    if (bit.modo === 'sigue' && Math.abs(bit.vx) > 0.05) {
      const d = bit.vx > 0 ? -1 : 1;
      const xe = d < 0 ? x - 1 : x + Math.ceil(anchoBit);
      const estela = [0, 1, 2, 3].map((i) => (Math.floor(t * 8) + i) % 3 ? (i ? '~' : '≈') : ' ').join('');
      r.dibujo([d < 0 ? estela.split('').reverse().join('') : estela], d < 0 ? xe - 3 : xe, Math.round(filaAgua), colores.texto, 1);
    }
    if (bit.modo === 'duerme') {
      const z = Math.floor(t * 1.5) % 3;
      r.dibujo([z === 2 ? 'Z' : 'z'], x + Math.ceil(anchoBit) + z, y - z, colores.tenue, 1);
    }
    cajaGlobo = null;
    if (bit.modo === 'habla') {
      // el globo va al lado de la cabeza: a la derecha si cabe, si no a la izquierda, con una colita hacia bit
      const ancho2 = Array.from(bit.frase).length + 4;
      const derecha = x + Math.ceil(anchoBit) + 2 + ancho2 <= r.cols;
      const izquierda = x - ancho2 - 2 >= 0;
      const linea = '─'.repeat(ancho2 - 2);
      const globo = ['┌' + linea + '┐', '│ ' + bit.frase + ' │', '└' + linea + '┘'];
      // en pantallas angostas las islas rodean a bit: el globo siempre va abajo, en el agua
      if ((derecha || izquierda) && r.cols >= 70) {
        const bx = derecha ? x + Math.ceil(anchoBit) + 2 : x - ancho2 - 2;
        r.dibujo(globo, bx, y + 1, colores.texto, 1, true, colores.fondo);
        r.dibujo(['─'], derecha ? bx - 1 : bx + ancho2, y + 2, colores.texto, 1);
        cajaGlobo = { x: bx * r.cw, y: (y + 1) * r.ch, ancho: ancho2 * r.cw, alto: 3 * r.ch };
      } else {
        // pantalla angosta: el globo va debajo de bit, en el agua, donde no hay islas que tapar
        const bx = Math.max(0, Math.min(r.cols - ancho2, Math.round(x + anchoBit / 2 - ancho2 / 2)));
        // por debajo de bit y de las etiquetas de las islas cercanas (que llegan ~3 filas bajo la superficie)
        const by = Math.max(y + Math.ceil(bit.sprite.alto * ESCALA_BIT) + 1, Math.ceil(filaAgua) + 4);
        r.dibujo([' '.repeat(Math.max(0, Math.round(x + anchoBit / 2) - bx)) + '│'].concat(globo), bx, by, colores.texto, 1, true, colores.fondo);
        cajaGlobo = { x: bx * r.cw, y: (by + 1) * r.ch, ancho: ancho2 * r.cw, alto: 3 * r.ch };
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
    portada = document.querySelector('.portada');
    nombre = document.querySelector('.portada-nombre');
    lema = document.querySelector('.portada-lema');
    panelCampo = document.querySelector('.panel-campo');
    baja = document.querySelector('.portada-baja');
    // las frases de bit viven en el HTML (data-frases del encabezado), separadas por «|»
    bit = Portafolio.Bit((hero.dataset.frases || '').split('|').filter(Boolean));
    sonda = document.getElementById('sonda');
    leerColores();
    medirPantalla(true);

    const ahora = () => performance.now();
    const columna = (x) => x / rejilla.cw;
    const filaMundo = (yPantalla) => camara + yPantalla / rejilla.ch;
    const sobreAgua = (y) => escena && y / rejilla.ch > escena.horizonte - 8;
    const esContenido = (el) => el.closest('a, button, input, textarea, .lamina, .panel, .barra, .modal');
    const redibujar = () => { if (reducir.matches) dibujar(ahora()); };

    window.addEventListener('pointermove', (e) => {
      bit.actividad(ahora());
      Portafolio.Campo.moverPuntero(columna(e.clientX), filaMundo(e.clientY));
      punteroPantalla = { c: columna(e.clientX), f: e.clientY / rejilla.ch };
      bit.seguir(sobreAgua(e.clientY) && escena.acto < 3 ? columna(e.clientX) : null, ahora());
    });
    // con el dedo, levantarlo también dispara pointerleave: solo el mouse «sale» de la página
    document.documentElement.addEventListener('pointerleave', (e) => {
      if (e.pointerType !== 'mouse') return;
      Portafolio.Campo.moverPuntero(null); punteroPantalla = null; bit.seguir(null, ahora());
    });
    // en pantallas táctiles no hay «pasar el puntero»: tocar el agua le dice a bit a dónde nadar
    document.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' && !esContenido(e.target) && sobreAgua(e.clientY)) bit.seguir(columna(e.clientX), ahora());
    });
    // clic sobre el agua (fuera del contenido): en bit, bit habla; en el agua, suelta una onda
    document.addEventListener('click', (e) => {
      if (esContenido(e.target) || !sobreAgua(e.clientY)) return;
      const c = columna(e.clientX), f = e.clientY / rejilla.ch;
      if (cajaBit && c >= bit.x && c <= bit.x + bit.sprite.ancho * ESCALA_BIT && f >= cajaBit.fila - 1 && f <= cajaBit.fila + bit.sprite.alto * ESCALA_BIT) {
        bit.hablar(ahora());
        sonar('voz', { texto: bit.frase });
      } else {
        Portafolio.Campo.salpicar(c, ahora() / 1000, filaMundo(e.clientY));
        sonar('bloop');
      }
      redibujar();
    });
    window.addEventListener('scroll', () => { bit.actividad(ahora()); redibujar(); }, { passive: true });
    window.addEventListener('keydown', () => bit.actividad(ahora()));
    window.addEventListener('resize', () => { medirPantalla(false); redibujar(); });
    new MutationObserver(() => { leerColores(); redibujar(); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['data-bs-theme'] });

    // la sonda muestra el acto, la profundidad y el estado de bit; el panel ψ, las fuentes y el tiempo
    const nFuentes = document.getElementById('campo-fuentes'), nTiempo = document.getElementById('campo-t');
    setInterval(() => {
      if (sonda && escena) sonda.textContent = 'acto ' + escena.acto + ' · prof ' + Math.round(profundidad) + ' m · bit: ' + bit.modo;
      if (Portafolio.Sonido) Portafolio.Sonido.profundidad(profundidad);   // la música se apaga bajo el agua
      if (nFuentes) nFuentes.textContent = Portafolio.Campo.fuentes(tiempo);
      if (nTiempo) nTiempo.textContent = tiempo.toFixed(1);
    }, 250);

    dibujar(ahora());
    if (!reducir.matches) requestAnimationFrame(cuadro);
  }

  $(iniciar);

  return {
    estado: function () {
      return bit ? {
        acto: escena.acto,
        progreso: progreso,
        horizonte: escena.horizonte,
        filas: rejilla.filas,
        bit: {
          x: bit.x, modo: bit.modo, ancho: bit.sprite.ancho * ESCALA_BIT, frase: bit.frase, objetivo: bit.objetivo,
          visible: !!cajaBit, caja: cajaBit, fila: cajaBit ? cajaBit.fila : null, ch: rejilla.ch
        },
        cielo: Portafolio.Cielo ? Portafolio.Cielo.estado() : null,
        globo: cajaGlobo,
        ecosistema: Portafolio.Ecosistema ? Portafolio.Ecosistema.estado() : null,
        profundidad: profundidad,
        calientes: calientes,
        fuentes: Portafolio.Campo.fuentes(tiempo),
        msCuadro: msCuadro,
        cw: rejilla.cw,
        animado: !reducir.matches
      } : null;
    }
  };
})();
