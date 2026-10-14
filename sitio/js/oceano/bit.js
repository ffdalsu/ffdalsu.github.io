/*
 * Bit, la mascota: un robot de terminal en un barco de papel.
 *
 * Máquina de estados (de mayor a menor prioridad):
 *   habla  → mientras dura una frase (clic sobre bit, o cuando la escena le pide decir algo)
 *   sigue  → el puntero (o el dedo) está lejos de bit; nada hacia él con un resorte suave
 *   duerme → pasaron DORMIR_MS sin actividad del visitante
 *   flota  → todo lo demás
 * Las posiciones se miden en columnas de la rejilla; los tiempos, en milisegundos de performance.now().
 */
window.Portafolio = window.Portafolio || {};

Portafolio.Bit = function () {
  const DORMIR_MS = 8000;
  const FRASE_MS = 2800;
  const FRASES = ['¡hola! soy bit', 'baja: abajo hay más ↓', 'ψ = Σ sin(k·r − ωt)', 'haz clic en el agua'];

  const sprite = Portafolio.Sprite({
    flota: [[' .-. ', '[o_o]', ' /|\\ ', '\\___/'], [' .-. ', '[o_o]', ' /|\\ ', '\\___/'],
            [' .-. ', '[-_-]', ' /|\\ ', '\\___/'], [' .-. ', '[o_o]', ' /|\\ ', '\\___/']],
    sigueD: [[' .-. ', '[ oo]', ' /|\\_', '\\___/'], [' .-. ', '[ oo]', '_/|\\ ', '\\___/']],
    sigueI: [[' .-. ', '[oo ]', '_/|\\ ', '\\___/'], [' .-. ', '[oo ]', ' /|\\_', '\\___/']],
    duerme: [[' .-. ', '[-_-]', ' /|\\ ', '\\___/'], [' .-. ', '[-.-]', ' /|\\ ', '\\___/']],
    habla: [[' .-. ', '[o_o]', ' \\|/ ', '\\___/'], [' .-. ', '[oOo]', ' \\|/ ', '\\___/']]
  }, { ancho: 5, alto: 4, linea: 3 });

  const b = {
    sprite: sprite,
    x: null,            // columna de la esquina izquierda
    vx: 0,
    objetivo: null,     // columna hacia la que nada (centro de bit)
    modo: 'flota',
    frase: '',
    hablaHasta: 0,
    ultimaActividad: performance.now(),
    siguiente: 0        // índice de la próxima frase
  };

  /** El visitante hizo algo (mover, tocar, desplazar, teclear): bit se despierta. */
  b.actividad = function (ahora) { b.ultimaActividad = ahora; };

  /** Nadar hacia la columna c (centro de bit); null para dejar de seguir. */
  b.seguir = function (c, ahora) { b.objetivo = c; if (c !== null) b.actividad(ahora); };

  /** Decir una frase; sin texto, dice la siguiente de su repertorio. */
  b.hablar = function (ahora, texto) {
    b.frase = texto || FRASES[b.siguiente++ % FRASES.length];
    b.hablaHasta = ahora + FRASE_MS;
    b.actividad(ahora);
  };

  /** Avanza la simulación un paso. escala = cuántas columnas ocupa cada celda del sprite. */
  b.actualizar = function (ahora, cols, escala) {
    const ancho = sprite.ancho * escala;
    if (b.x === null) b.x = Math.max(0, cols * 0.18 - ancho / 2);
    const centro = b.x + ancho / 2;

    // bit puede nadar mientras habla: el movimiento no depende del modo que se muestra
    const lejos = b.objetivo !== null && Math.abs(b.objetivo - centro) > 1.2;
    if (ahora < b.hablaHasta) b.modo = 'habla';
    else if (lejos) b.modo = 'sigue';
    else if (ahora - b.ultimaActividad > DORMIR_MS) b.modo = 'duerme';
    else b.modo = 'flota';

    if (lejos) b.vx += (b.objetivo - centro) * 0.012;
    b.vx *= 0.86;
    b.x = Math.max(0, Math.min(cols - ancho, b.x + b.vx));
  };

  /** Clave del sprite según el modo y la dirección en que nada. */
  b.estadoSprite = function () {
    if (b.modo === 'sigue') return b.vx >= 0 ? 'sigueD' : 'sigueI';
    return b.modo;
  };

  /** Cuadros por segundo de cada modo. */
  b.ritmo = function () { return { duerme: 1.2, sigue: 6, habla: 5, flota: 0.8 }[b.modo]; };

  return b;
};
