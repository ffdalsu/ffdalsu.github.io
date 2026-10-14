/*
 * Rejilla de caracteres sobre un <canvas>.
 *
 * Divide el lienzo en celdas del ancho de un carácter monoespaciado y ofrece dos formas de pintar:
 *   - capas(): filas completas de texto por color (rápido; para el mar, que solo usa ASCII y «·»);
 *   - dibujo(): carácter por carácter y a cualquier escala (para sprites con símbolos que, si la
 *     fuente no los trae, se pintarían con otra fuente más ancha y descuadrarían la fila).
 */
window.Portafolio = window.Portafolio || {};

Portafolio.Rejilla = function (canvas, opciones) {
  const ctx = canvas.getContext('2d');
  const tamFuente = (opciones && opciones.tamFuente) || 13;
  const familia = '"IBM Plex Mono", "Cascadia Mono", Consolas, monospace';
  const r = { canvas: canvas, ctx: ctx, ancho: 0, alto: 0, cw: 0, ch: 0, cols: 0, filas: 0 };

  /** Ajusta el lienzo a su tamaño en pantalla (con la densidad de píxeles del equipo) y recalcula las celdas. */
  r.medir = function () {
    const d = Math.min(window.devicePixelRatio || 1, 2);
    const caja = canvas.getBoundingClientRect();
    r.ancho = caja.width;
    r.alto = caja.height;
    canvas.width = Math.round(caja.width * d);
    canvas.height = Math.round(caja.height * d);
    ctx.setTransform(d, 0, 0, d, 0, 0);
    ctx.textBaseline = 'top';
    ctx.font = tamFuente + 'px ' + familia;
    r.cw = ctx.measureText('M').width;
    r.ch = Math.round(tamFuente * 1.3);
    r.cols = Math.ceil(r.ancho / r.cw);
    r.filas = Math.ceil(r.alto / r.ch);
  };

  r.limpiar = function () { ctx.clearRect(0, 0, r.ancho, r.alto); };

  /** Pinta filas de texto completas: lineas[f] es el texto de la fila f en un solo color. */
  r.capas = function (lineas, color) {
    ctx.font = tamFuente + 'px ' + familia;
    ctx.fillStyle = color;
    for (let f = 0; f < lineas.length; f++) if (lineas[f].trim()) ctx.fillText(lineas[f], 0, f * r.ch);
  };

  /**
   * Pinta un dibujo de varias filas con su esquina superior izquierda en la celda (col, fila), que puede ser
   * fraccionaria, a la escala indicada. Si borrar es true, primero tapa el fondo para que el dibujo se lea limpio.
   */
  r.dibujo = function (filas, col, fila, color, escala, borrar, colorFondo) {
    const e = escala || 1;
    const px = col * r.cw;
    const py = fila * r.ch;
    if (borrar) {
      const anchoMax = Math.max.apply(null, filas.map(function (f) { return f.length; }));
      ctx.fillStyle = colorFondo;
      ctx.fillRect(px - 2, py, anchoMax * r.cw * e + 4, filas.length * r.ch * e);
    }
    ctx.font = (e > 1 ? '600 ' : '') + (tamFuente * e) + 'px ' + familia;
    ctx.fillStyle = color;
    filas.forEach(function (texto, j) {
      Array.from(texto).forEach(function (c, i) {
        if (c !== ' ') ctx.fillText(c, px + i * r.cw * e, py + j * r.ch * e);
      });
    });
    ctx.font = tamFuente + 'px ' + familia;
  };

  r.medir();
  return r;
};
