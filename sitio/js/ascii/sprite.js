/*
 * Sprites ASCII: un dibujo con varios estados, y cada estado con varios cuadros de animación.
 *
 *   const s = Portafolio.Sprite({ flota: [cuadro1, cuadro2] }, { ancho: 5, alto: 4, linea: 3 });
 *   s.cuadro('flota', t, 2)  → el cuadro que toca en el segundo t a 2 cuadros por segundo.
 *
 * ancho y alto se miden en celdas; linea es la fila del dibujo que va sobre la línea de flotación.
 */
window.Portafolio = window.Portafolio || {};

Portafolio.Sprite = function (estados, medidas) {
  return {
    ancho: medidas.ancho,
    alto: medidas.alto,
    linea: medidas.linea,
    cuadro: function (estado, t, cps) {
      const cuadros = estados[estado] || estados.flota;
      return cuadros[Math.floor(t * cps) % cuadros.length];
    }
  };
};
