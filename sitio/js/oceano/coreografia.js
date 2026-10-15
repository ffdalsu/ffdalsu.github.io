/*
 * Coreografía de la portada (D29): convierte el scroll en el estado de la escena. Es una función pura, sin DOM,
 * para poder probarla sola.
 *
 *   p = pantallas bajadas (scrollY / alto de la pantalla)
 *   Acto 1 (p < 0,5)   cielo: el horizonte está debajo de la pantalla y el nombre ocupa todo.
 *   Acto 2 (p < 1,3)   la cámara baja hasta el horizonte (bit y las islas) y el nombre se encoge a la esquina.
 *                      Entre p = 1 y p = 1,3 la escena se queda quieta: es la pausa para ver a bit.
 *   Acto 3 (p ≥ 1,3)   el horizonte sube 1:1 con el scroll, como el contenido: se entra al mar.
 *
 * El horizonte se mide en filas de pantalla. La superficie del mar es la fila 0 del mundo, así que la cámara
 * (fila del mundo que está arriba de la pantalla) vale -horizonte.
 * Con «reducir movimiento» no hay cinemática: el horizonte entra y sale 1:1 con el scroll y el nombre no se mueve.
 */
window.Portafolio = window.Portafolio || {};

Portafolio.Coreografia = (function () {
  const INICIO_ACTO_2 = 0.5;
  const INICIO_ACTO_3 = 1.3;
  const HORIZONTE_INICIAL = 1.25;   // en pantallas: debajo del borde inferior en el acto 1
  const HORIZONTE_ACTO_2 = 0.63;    // en pantallas: donde se queda el horizonte para ver a bit
  const ESCALA_MINIMA = 0.38;       // tamaño final del nombre en la esquina

  /** Curva suave entre a y b (0 antes de a, 1 después de b). */
  function suave(a, b, x) {
    const k = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return k * k * (3 - 2 * k);
  }

  /**
   * @param {number} p        pantallas bajadas
   * @param {number} filas    filas de rejilla que caben en la pantalla
   * @param {boolean} reducido «reducir movimiento»
   */
  function estado(p, filas, reducido) {
    if (reducido) {
      return {
        acto: p < INICIO_ACTO_2 ? 1 : p < INICIO_ACTO_3 ? 2 : 3,
        horizonte: filas * (HORIZONTE_ACTO_2 + 0.37 - p),
        nombre: { k: 0, escala: 1, salida: 0 },
        lema: 1, campo: p > 0.2 && p < INICIO_ACTO_3 ? 1 : 0, baja: 0
      };
    }
    const bajada = suave(0.15, 1.0, p);
    let horizonte = filas * (HORIZONTE_INICIAL - (HORIZONTE_INICIAL - HORIZONTE_ACTO_2) * bajada);
    if (p > INICIO_ACTO_3) horizonte = filas * HORIZONTE_ACTO_2 - (p - INICIO_ACTO_3) * filas;
    const k = suave(0.05, 0.9, p);
    return {
      acto: p < INICIO_ACTO_2 ? 1 : p < INICIO_ACTO_3 ? 2 : 3,
      horizonte: horizonte,
      // k: cuánto viajó el nombre hacia la esquina (0 → 1); salida: pantallas que subió con el contenido en el acto 3
      nombre: { k: k, escala: 1 - (1 - ESCALA_MINIMA) * k, salida: Math.max(0, p - INICIO_ACTO_3) },
      lema: 1 - suave(0.2, 0.6, p),
      campo: suave(0.7, 1.0, p) * (1 - suave(INICIO_ACTO_3, INICIO_ACTO_3 + 0.25, p)),
      baja: 1 - suave(0.05, 0.3, p)
    };
  }

  return { estado: estado, suave: suave, INICIO_ACTO_3: INICIO_ACTO_3, LARGO: INICIO_ACTO_3 + 1 };
})();
