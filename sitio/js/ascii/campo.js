/*
 * Campo de ondas del océano.
 *
 * Todo se mide en celdas de la rejilla (columnas y filas) y en segundos.
 *   - superficie(c, t): cuántas filas sube o baja el agua en la columna c (dos olas que se cruzan).
 *   - valor(c, y, t): intensidad del agua bajo la superficie, entre -1 y 1, para elegir el carácter.
 *     Es la suma de ondas circulares ψ = Σ sin(k·rᵢ − ω·t) / (1 + rᵢ/20) que salen de cada fuente.
 * Las fuentes son el puntero y los clics («salpicaduras»), que se agregan con salpicar().
 */
window.Portafolio = window.Portafolio || {};

Portafolio.Campo = (function () {
  const K = 0.55;      // número de onda: qué tan juntas van las crestas
  const OMEGA = 2.2;   // frecuencia angular: qué tan rápido se mueven
  const ASPECTO = 2.1; // una fila es más alta que ancha una columna; corrige para que las ondas sean círculos
  const salpicaduras = [];
  let puntero = null;

  function superficie(c, t) {
    let h = Math.sin(c * 0.23 - t * 1.6) * 0.9 + Math.sin(c * 0.09 + t * 0.7) * 0.6;
    // cada salpicadura levanta un anillo que se aleja y se apaga
    for (const s of salpicaduras) {
      const edad = t - s.t;
      const anillo = Math.abs(c - s.c) - edad * 18;
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
    return Math.max(-1, Math.min(1, v / 1.4));
  }

  /** Agrega una salpicadura en la columna c; las viejas (más de 4 s) se descartan. */
  function salpicar(c, t) {
    salpicaduras.push({ c: c, t: t });
    while (salpicaduras.length && t - salpicaduras[0].t > 4) salpicaduras.shift();
  }

  function moverPuntero(c, y) { puntero = (c === null) ? null : { c: c, y: y }; }

  return {
    superficie: superficie,
    valor: valor,
    salpicar: salpicar,
    moverPuntero: moverPuntero,
    fuentes: function () { return salpicaduras.length + (puntero ? 1 : 0); }
  };
})();
