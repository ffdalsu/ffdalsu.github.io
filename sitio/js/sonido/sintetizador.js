/*
 * Sintetizador 8 bit (D28): todo el sonido del sitio y de los videos se genera aquí con Web Audio, sin archivos.
 *
 *   const s = Portafolio.Sintetizador(ctx, destino);   // ctx: AudioContext u OfflineAudioContext
 *   s.efectos.blip(ctx.currentTime);                    // programa un efecto en el segundo indicado
 *
 * Instrumentos: onda cuadrada (melodía, voces), triangular (bajos, campanas) y ruido blanco filtrado (agua,
 * golpes, teclas). El «azar» sale de una semilla fija, así que el mismo efecto suena igual en cada render:
 * eso permite grabar los videos de forma determinista.
 */
window.Portafolio = window.Portafolio || {};

Portafolio.Sintetizador = function (ctx, destino) {
  const salida = destino || ctx.destination;
  // Escala pentatónica menor de La (A3) en Hz, dos octavas: suena bien en cualquier orden
  const PENTA = [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25, 783.99, 880];
  const nota = (nombre) => 440 * Math.pow(2, (nombre - 69) / 12);   // número MIDI → Hz
  const azar = (n) => { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); };

  // un solo búfer de ruido blanco (1 s) por contexto, con semilla fija
  let ruidoBlanco = null;
  function bufferRuido() {
    if (ruidoBlanco) return ruidoBlanco;
    ruidoBlanco = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const datos = ruidoBlanco.getChannelData(0);
    for (let i = 0; i < datos.length; i++) datos[i] = azar(i + 1) * 2 - 1;
    return ruidoBlanco;
  }

  /** Envolvente: sube en «ataque» segundos al volumen y cae exponencialmente hasta el final. */
  function envolvente(t, duracion, volumen, ataque) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(volumen, t + (ataque || 0.004));
    g.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
    return g;
  }

  /**
   * Una nota de un oscilador.
   * opciones: {t, duracion, frecuencia, hasta (glissando), tipo ('square'|'triangle'|'sine'|'sawtooth'), volumen, ataque, salida}
   */
  function tono(o) {
    const osc = ctx.createOscillator();
    osc.type = o.tipo || 'square';
    osc.frequency.setValueAtTime(o.frecuencia, o.t);
    if (o.hasta) osc.frequency.exponentialRampToValueAtTime(o.hasta, o.t + o.duracion);
    const g = envolvente(o.t, o.duracion, o.volumen === undefined ? 0.2 : o.volumen, o.ataque);
    osc.connect(g).connect(o.salida || salida);
    osc.start(o.t);
    osc.stop(o.t + o.duracion + 0.02);
    return osc;
  }

  /**
   * Ruido filtrado.
   * opciones: {t, duracion, filtro ('lowpass'|'highpass'|'bandpass'), corte, corteHasta, volumen, salida}
   */
  function ruido(o) {
    const fuente = ctx.createBufferSource();
    fuente.buffer = bufferRuido();
    const f = ctx.createBiquadFilter();
    f.type = o.filtro || 'lowpass';
    f.frequency.setValueAtTime(o.corte || 2000, o.t);
    if (o.corteHasta) f.frequency.exponentialRampToValueAtTime(o.corteHasta, o.t + o.duracion);
    const g = envolvente(o.t, o.duracion, o.volumen === undefined ? 0.15 : o.volumen, o.ataque);
    fuente.connect(f).connect(g).connect(o.salida || salida);
    fuente.start(o.t, azar(o.t * 97) * 0.5);
    fuente.stop(o.t + o.duracion + 0.02);
  }

  /* ---------- Efectos con nombre: cada uno recibe el segundo de inicio y, si aplica, datos ---------- */
  const efectos = {
    // clic en un enlace o botón: un blip que sube
    blip(t) { tono({ t, duracion: 0.06, frecuencia: 880, hasta: 1320, volumen: 0.16 }); },

    // una tecla de consola (títulos que se descifran, habilidades que se revuelven)
    tecleo(t, d) {
      const i = (d && d.i) || 0;
      ruido({ t, duracion: 0.018, filtro: 'highpass', corte: 2600 + azar(i) * 1400, volumen: 0.07 });
      tono({ t, duracion: 0.012, frecuencia: 1600 + azar(i + 7) * 600, volumen: 0.03 });
    },

    // una gota que cae al agua: el tono baja y el ruido se apaga como una ola
    bloop(t) {
      tono({ t, duracion: 0.28, frecuencia: 620, hasta: 120, tipo: 'triangle', volumen: 0.3 });
      ruido({ t: t + 0.02, duracion: 0.45, filtro: 'lowpass', corte: 2400, corteHasta: 180, volumen: 0.12 });
    },

    // la voz de bit: un blip por letra, con tonos de la pentatónica según la letra (siempre igual para el mismo texto)
    voz(t, d) {
      const texto = Array.from((d && d.texto) || 'hola').slice(0, 16);
      texto.forEach((c, i) => {
        if (c === ' ') return;
        const altura = PENTA[(c.codePointAt(0) * 7 + i) % PENTA.length] * 2;
        tono({ t: t + i * 0.055, duracion: 0.045, frecuencia: altura, volumen: 0.09 });
      });
    },

    // campanita: una isla o una criatura resaltada
    campana(t) {
      tono({ t, duracion: 0.7, frecuencia: 1318.5, tipo: 'triangle', volumen: 0.16, ataque: 0.002 });
      tono({ t, duracion: 0.4, frecuencia: 2637, tipo: 'sine', volumen: 0.05, ataque: 0.002 });
    },

    // encender un monitor CRT (abrir un modal): golpe grave, chispa y barrido que sube
    'crt-on'(t) {
      tono({ t, duracion: 0.08, frecuencia: 90, tipo: 'square', volumen: 0.12 });
      ruido({ t, duracion: 0.09, filtro: 'highpass', corte: 5000, volumen: 0.06 });
      tono({ t: t + 0.03, duracion: 0.18, frecuencia: 300, hasta: 1500, tipo: 'sine', volumen: 0.08 });
    },

    // apagar el CRT (cerrar un modal): barrido que cae hasta un clic
    'crt-off'(t) {
      tono({ t, duracion: 0.2, frecuencia: 1400, hasta: 70, tipo: 'sine', volumen: 0.09 });
      ruido({ t: t + 0.18, duracion: 0.03, filtro: 'highpass', corte: 3000, volumen: 0.05 });
    },

    // un sello de tinta sobre un diploma
    sello(t) {
      tono({ t, duracion: 0.22, frecuencia: 130, hasta: 45, tipo: 'triangle', volumen: 0.4, ataque: 0.002 });
      ruido({ t, duracion: 0.1, filtro: 'lowpass', corte: 500, volumen: 0.25 });
    },

    // fanfarria corta: arpegio de Do mayor y nota larga
    fanfarria(t) {
      [72, 76, 79].forEach((n, i) => tono({ t: t + i * 0.09, duracion: 0.09, frecuencia: nota(n), volumen: 0.12 }));
      tono({ t: t + 0.27, duracion: 0.5, frecuencia: nota(84), volumen: 0.12 });
      tono({ t, duracion: 0.8, frecuencia: nota(48), tipo: 'triangle', volumen: 0.18 });
    },

    // error del formulario: dos notas graves que bajan
    error(t) {
      tono({ t, duracion: 0.11, frecuencia: 196, volumen: 0.13 });
      tono({ t: t + 0.13, duracion: 0.16, frecuencia: 147, volumen: 0.13 });
    },

    // mensaje enviado: arpegio que sube
    exito(t) { [67, 71, 74, 79].forEach((n, i) => tono({ t: t + i * 0.065, duracion: i === 3 ? 0.3 : 0.07, frecuencia: nota(n), volumen: 0.11 })); },

    // cambiar el tema: el clic doble de un interruptor
    interruptor(t) {
      tono({ t, duracion: 0.02, frecuencia: 1200, volumen: 0.12 });
      tono({ t: t + 0.045, duracion: 0.02, frecuencia: 800, volumen: 0.12 });
    },

    // bit se duerme: dos notas suaves que bajan, con vibrato
    zz(t) {
      [0, 0.45].forEach((dt, i) => {
        const osc = tono({ t: t + dt, duracion: 0.4, frecuencia: i ? 196 : 247, tipo: 'triangle', volumen: 0.07, ataque: 0.08 });
        const lfo = ctx.createOscillator(), prof = ctx.createGain();
        lfo.frequency.value = 6; prof.gain.value = 5;
        lfo.connect(prof).connect(osc.frequency); lfo.start(t + dt); lfo.stop(t + dt + 0.42);
      });
    }
  };

  return { ctx: ctx, salida: salida, tono: tono, ruido: ruido, efectos: efectos, nota: nota, PENTA: PENTA, azar: azar };
};

/** Nombres de los efectos disponibles (para el tablero, las pruebas y el control). */
Portafolio.Sintetizador.EFECTOS = ['blip', 'tecleo', 'bloop', 'voz', 'campana', 'crt-on', 'crt-off', 'sello', 'fanfarria', 'error', 'exito', 'interruptor', 'zz'];
