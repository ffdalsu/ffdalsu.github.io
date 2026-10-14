/*
 * Campo de ondas del océano.
 *
 * Todo se mide en celdas de la rejilla (columnas y filas del mundo) y en segundos.
 *   - superficie(c, t): cuántas filas sube o baja el agua en la columna c (dos olas que se cruzan, más el
 *     levantamiento de las salpicaduras).
 *   - valor(c, y, t): intensidad del agua bajo la superficie, entre -1 y 1, para elegir el carácter.
 *     Es la suma de ondas circulares ψ = Σ sin(k·rᵢ − ω·t) / (1 + rᵢ/20) que salen de cada fuente:
 *     el puntero es una fuente permanente y cada clic suelta un anillo que se expande y se apaga.
 * Las fuentes se agregan con moverPuntero() y salpicar().
 */
window.Portafolio = window.Portafolio || {};

Portafolio.Campo = (function () {
  const K = 0.55;          // número de onda: qué tan juntas van las crestas
  const OMEGA = 2.2;       // frecuencia angular: qué tan rápido se mueven
  const ASPECTO = 2.1;     // una fila es más alta que ancha una columna; corrige para que las ondas sean círculos
  const VELOCIDAD = 26;    // columnas por segundo a las que se expande el anillo de una salpicadura
  const VIDA = 6;          // segundos que dura una salpicadura
  const salpicaduras = [];
  let puntero = null;

  function superficie(c, t) {
    let h = Math.sin(c * 0.23 - t * 1.6) * 0.9 + Math.sin(c * 0.09 + t * 0.7) * 0.6;
    for (const s of salpicaduras) {
      const edad = t - s.t;
      const anillo = Math.abs(c - s.c) - edad * VELOCIDAD;
      h += 1.6 * Math.exp(-anillo * anillo / 6) * Math.exp(-edad * 0.9);
    }
    return h;
  }

  function valor(c, y, t) {
    let v = Math.sin(c * 0.4 + y * 0.9 - t * 1.2) * 0.5 + Math.sin(c * 0.17 - y * 0.3 + t * 0.8) * 0.5;
    if (puntero) {
      const dx = c - puntero.c;
      const dy = (y - puntero.y) * ASPECTO;
      const d = Math.sqrt(dx * dx + dy * dy);
      v += 1.1 * Math.sin(d * K - t * OMEGA) / (1 + d / 20);
    }
    // cada salpicadura es un anillo brillante que se aleja del punto del clic (aquí salen las «@»)
    for (const s of salpicaduras) {
      const edad = t - s.t;
      const dx = c - s.c;
      const dy = (y - s.y) * ASPECTO;
      const anillo = Math.sqrt(dx * dx + dy * dy) - edad * VELOCIDAD;
      v += 2.4 * Math.exp(-anillo * anillo / 10) * Math.exp(-edad * 0.7);
    }
    return Math.max(-1, Math.min(1, v / 1.4));
  }

  /** Suelta una salpicadura en la celda (c, y) del mundo; las que ya se apagaron se descartan. */
  function salpicar(c, t, y) {
    salpicaduras.push({ c: c, y: y === undefined ? 0 : y, t: t });
    while (salpicaduras.length && t - salpicaduras[0].t > VIDA) salpicaduras.shift();
  }

  function moverPuntero(c, y) { puntero = (c === null) ? null : { c: c, y: y }; }

  return {
    superficie: superficie,
    valor: valor,
    salpicar: salpicar,
    moverPuntero: moverPuntero,
    /** Fuentes activas: el puntero (si está) más las salpicaduras que aún no se apagan en el segundo t. */
    fuentes: function (t) {
      return salpicaduras.filter((s) => t === undefined || t - s.t < VIDA).length + (puntero ? 1 : 0);
    }
  };
})();
