/*
 * Música 8 bit (D26): tres variantes sintetizadas con js/sonido/sintetizador.js, sin archivos.
 *
 *   const m = Portafolio.Musica.crear(sint, destino, 'oceano');   // crea su propio bus con filtro
 *   m.programar(desde, hasta);   // programa las notas entre esos segundos (relativos al inicio de la música)
 *   m.profundidad(metros);       // bajo el agua el filtro se cierra: suena «sumergida»
 *
 * programar() sirve igual en vivo (se llama cada ~60 ms con una ventana corta hacia adelante) y offline para los
 * videos (una sola llamada con los 40 s). Todo depende del número de paso, nunca del reloj: sale igual siempre.
 *
 *   oceano      lo-fi tranquilo, 84 bpm: bajo triangular, arpegio suave, melodía pentatónica y percusión blanda.
 *   chiptune    estilo NES, 132 bpm: bajo en octavas, arpegio rápido, melodía pegajosa, bombo y caja.
 *   generativa  70 bpm: las notas salen de una interferencia de ondas como ψ; no se repite (frecuencias inconmensurables).
 * Progresión de las dos primeras: La m · Fa · Do · Sol (8 compases).
 */
window.Portafolio = window.Portafolio || {};

Portafolio.Musica = (function () {
  const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
  const azar = (n) => { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); };

  // acordes por compás (MIDI): La m, Fa, Do, Sol, repetido
  const ACORDES = [[57, 60, 64], [53, 57, 60], [60, 64, 67], [55, 59, 62]];
  const BAJOS = [45, 41, 48, 43];

  // melodías: por compás, lista de [paso (0-15), nota MIDI, duración en pasos]
  const MELODIA_OCEANO = [
    [[0, 76, 4], [6, 74, 2], [8, 72, 6]], [[0, 69, 6], [8, 72, 4], [12, 74, 4]],
    [[0, 76, 4], [4, 79, 4], [8, 76, 8]], [[0, 74, 12]],
    [[0, 72, 4], [4, 74, 4], [8, 76, 6], [14, 74, 2]], [[0, 72, 8], [8, 69, 8]],
    [[0, 67, 4], [4, 69, 4], [8, 72, 8]], [[0, 69, 16]]
  ];
  const MOTIVO = {
    A: [[0, 76, 2], [2, 76, 2], [4, 79, 2], [6, 76, 2], [8, 74, 4], [12, 72, 4]],
    B: [[0, 72, 2], [2, 74, 2], [4, 76, 4], [8, 74, 2], [10, 72, 2], [12, 69, 4]],
    C: [[0, 79, 4], [4, 81, 4], [8, 79, 4], [12, 76, 4]],
    D: [[0, 74, 4], [4, 72, 4], [8, 69, 8]]
  };
  const MELODIA_CHIP = ['A', 'B', 'A', 'C', 'A', 'B', 'A', 'D'].map((k) => MOTIVO[k]);
  const PENTA = [57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84];   // La menor pentatónica, dos octavas

  const VARIANTES = {
    oceano: { nombre: 'Océano lo-fi', bpm: 84 },
    chiptune: { nombre: 'Chiptune enérgico', bpm: 132 },
    generativa: { nombre: 'Generativa desde ψ', bpm: 70 }
  };

  /* Cada variante programa lo que suena en un paso (semicorchea) dado: i = paso absoluto, t = segundo */
  const PASOS = {
    oceano(s, i, t, paso, bus) {
      const compas = Math.floor(i / 16) % 8, p = i % 16, c = compas % 4;
      const swing = (p % 4 === 2) ? paso * 0.33 : 0;   // las corcheas débiles llegan un poco tarde (lo-fi)
      if (p === 0 || p === 10) s.tono({ t, duracion: paso * (p ? 5 : 9), frecuencia: hz(BAJOS[c]), tipo: 'triangle', volumen: 0.17, ataque: 0.01, salida: bus });
      if (p % 2 === 0) {
        const nota = ACORDES[c][[0, 1, 2, 1][(p / 2) % 4]] + 12;
        s.tono({ t: t + swing, duracion: paso * 1.6, frecuencia: hz(nota), tipo: 'square', volumen: 0.028, salida: bus });
      }
      MELODIA_OCEANO[compas].forEach(([q, n, d]) => { if (q === p) s.tono({ t, duracion: paso * d, frecuencia: hz(n), tipo: 'triangle', volumen: 0.075, ataque: 0.02, salida: bus }); });
      if (p === 0 || p === 8) s.tono({ t, duracion: 0.16, frecuencia: 110, hasta: 45, tipo: 'triangle', volumen: 0.2, ataque: 0.002, salida: bus });
      if (p % 4 === 2) s.ruido({ t: t + swing, duracion: 0.035, filtro: 'highpass', corte: 7000, volumen: 0.022, salida: bus });
      if (azar(i * 3.1) > 0.9) s.ruido({ t: t + azar(i) * paso, duracion: 0.008, filtro: 'highpass', corte: 3000, volumen: 0.01, salida: bus });   // crujido de vinilo
    },
    chiptune(s, i, t, paso, bus) {
      const compas = Math.floor(i / 16) % 8, p = i % 16, c = compas % 4;
      if (p % 2 === 0) s.tono({ t, duracion: paso * 1.7, frecuencia: hz(BAJOS[c] + ((p / 2) % 2 ? 12 : 0)), tipo: 'square', volumen: 0.055, salida: bus });
      s.tono({ t, duracion: paso * 0.9, frecuencia: hz(ACORDES[c][p % 3] + 24), tipo: 'triangle', volumen: 0.035, salida: bus });
      MELODIA_CHIP[compas].forEach(([q, n, d]) => { if (q === p) s.tono({ t, duracion: paso * d * 0.92, frecuencia: hz(n), tipo: 'square', volumen: 0.06, salida: bus }); });
      if (p === 0 || p === 8 || p === 10) s.tono({ t, duracion: 0.12, frecuencia: 150, hasta: 50, tipo: 'triangle', volumen: 0.22, ataque: 0.002, salida: bus });
      if (p === 4 || p === 12) s.ruido({ t, duracion: 0.11, filtro: 'bandpass', corte: 1800, volumen: 0.09, salida: bus });
      if (p % 2 === 1) s.ruido({ t, duracion: 0.025, filtro: 'highpass', corte: 8000, volumen: 0.02, salida: bus });
    },
    generativa(s, i, t, paso, bus) {
      if (i % 2) return;   // corcheas
      const k = i / 2;
      // interferencia de dos fuentes, como ψ: ondas con frecuencias que nunca vuelven a coincidir
      const v = Math.sin(k * 0.55 * 1.7) * 0.6 + Math.sin(k * 0.55 * Math.SQRT2 + 1.3) * 0.4;
      const fuerza = Math.abs(v);
      if (fuerza > 0.42) {
        const nota = PENTA[Math.floor((v + 1) / 2 * (PENTA.length - 1))];
        const dur = paso * (2 + Math.round(fuerza * 6));
        s.tono({ t, duracion: dur, frecuencia: hz(nota), tipo: 'triangle', volumen: 0.05 + fuerza * 0.05, ataque: 0.03, salida: bus });
        if (fuerza > 0.8) s.tono({ t: t + paso, duracion: dur, frecuencia: hz(nota + 12), tipo: 'sine', volumen: 0.03, ataque: 0.05, salida: bus });
      }
      if (k % 16 === 0) {   // bordón grave cada dos compases, La o Fa según el signo de la onda lenta
        const raiz = Math.sin(k * 0.071) > 0 ? 45 : 41;
        s.tono({ t, duracion: paso * 30, frecuencia: hz(raiz), tipo: 'triangle', volumen: 0.11, ataque: 0.4, salida: bus });
      }
    }
  };

  /**
   * Crea un reproductor de la variante. destino: nodo al que sale la música (el maestro del sitio).
   * El bus tiene un filtro pasa-bajos para la inmersión y, en la generativa, un eco.
   */
  function crear(sint, destino, variante) {
    const ctx = sint.ctx;
    const nombre = VARIANTES[variante] ? variante : 'oceano';
    const paso = 60 / VARIANTES[nombre].bpm / 4;
    const volumen = ctx.createGain();
    volumen.gain.value = 0.9;
    const filtro = ctx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.value = 18000;
    filtro.Q.value = 0.7;
    const bus = ctx.createGain();
    bus.connect(filtro).connect(volumen).connect(destino);
    if (nombre === 'generativa') {
      const eco = ctx.createDelay(1), retorno = ctx.createGain();
      eco.delayTime.value = paso * 6;
      retorno.gain.value = 0.35;
      bus.connect(eco).connect(retorno).connect(eco);
      retorno.connect(filtro);
    }
    let origen = ctx.currentTime + 0.1, siguiente = 0, notas = 0, corte = 18000;

    return {
      variante: nombre,
      /** Programa los pasos cuyo inicio cae en [desde, hasta) segundos desde el origen de la música. */
      programar(desde, hasta) {
        let i = Math.max(siguiente, Math.ceil(desde / paso - 1e-9));
        for (; i * paso < hasta; i++) { PASOS[nombre](sint, i, origen + i * paso, paso, bus); notas++; }
        siguiente = i;
      },
      /** Programa lo que falta hasta «adelanto» segundos después del momento actual del contexto. */
      alDia(adelanto) { this.programar(siguiente * paso, ctx.currentTime - origen + (adelanto || 0.25)); },
      /** Bajo el agua el filtro se cierra: 18 kHz en la superficie, ~500 Hz a 40 m o más. */
      profundidad(metros) {
        corte = 18000 * Math.pow(500 / 18000, Math.min(1, Math.max(0, metros) / 40));
        filtro.frequency.setTargetAtTime(corte, ctx.currentTime, 0.15);
      },
      /** Apaga la música con un desvanecimiento corto. */
      detener() {
        volumen.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.08);
        setTimeout(() => { try { volumen.disconnect(); } catch (e) { /* ya desconectado */ } }, 600);
      },
      reiniciarOrigen(t) { origen = t; siguiente = 0; },
      estado() { return { variante: nombre, notas: notas, corte: Math.round(corte) }; }
    };
  }

  return { crear: crear, VARIANTES: VARIANTES };
})();
