/*
 * Cielo de la portada (maqueta D29): luna o sol, estrellas, gaviotas y una estrella fugaz, en caracteres.
 *
 *   - Luna (tema ámbar): un disco sombreado con la normal de una esfera, con cráteres y un halo que respira.
 *   - Sol (tema papel): disco lleno con rayos que giran; de día no hay estrellas.
 *   - Estrellas: posiciones fijas (pseudoaleatorias con semilla) que titilan; nunca bajo el agua.
 *   - Gaviotas: una bandada en V que cruza despacio aleteando (\v/ -v- /v\).
 * desplazamiento = filas que bajó la cámara; cada capa se mueve a su ritmo (paralaje).
 */
window.Portafolio = window.Portafolio || {};

Portafolio.Cielo = (function () {
  const RAMPA = ' .·:-=+*#%@';
  const ALAS = ['\\v/', '-v-', '/v\\', '-v-'];
  const BANDADA = [[0, 0], [-4, 1.4], [-8, 2.8], [4, 1.6], [8, 3.1], [-12, 4.4]];
  const CRATERES = [[-0.35, -0.2, 0.22], [0.25, 0.3, 0.16], [0.1, -0.45, 0.12], [-0.1, 0.45, 0.1]];
  const azar = (n) => { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); };
  let cuenta = { estrellas: 0, gaviotas: 0 };

  function estrellas(r, t, colores, desplazamiento, horizonte) {
    let n = 0;
    for (let i = 0; i < 170; i++) {
      const c = Math.floor(azar(i) * r.cols);
      const f = Math.floor(azar(i + 300) * r.filas * 1.6) - desplazamiento * 0.5;
      if (f < 2 || f > Math.min(r.filas, horizonte - 2)) continue;
      const brillo = (Math.sin(t * (0.6 + azar(i + 9) * 2) + i) + 1) / 2;
      r.dibujo([brillo > 0.85 ? '+' : brillo > 0.5 ? '·' : '.'], c, f, brillo > 0.85 ? colores.acento : colores.tenue, 1);
      n++;
    }
    // estrella fugaz cada 9 s
    const k = t % 9;
    if (k < 1.1) {
      const c0 = r.cols * 0.7, f0 = 4 - desplazamiento * 0.5;
      for (let j = 0; j < 8; j++) {
        const f = f0 + k * 8 - j * 0.3;
        if (f < horizonte - 2) r.dibujo([j === 0 ? '*' : '·'], c0 - k * 40 + j * 1.5, f, j === 0 ? colores.acento : colores.tenue, 1);
      }
    }
    return n;
  }

  function astro(r, t, colores, desplazamiento, noche, movil) {
    const R = Math.max(4, Math.min(movil ? 5 : 8, Math.floor(r.filas * 0.13)));
    const asp = r.ch / r.cw;
    const cc = Math.floor(r.cols * (movil ? 0.72 : 0.8));
    const fc = Math.floor(r.filas * (movil ? 0.22 : 0.3)) - desplazamiento * 0.3;
    if (fc + R * 1.3 < 0) return;
    for (let f = -R - 2; f <= R + 2; f++) {
      for (let c = Math.floor(-R * asp) - 4; c <= R * asp + 4; c++) {
        const x = c / (R * asp), y = f / R, d = Math.sqrt(x * x + y * y);
        if (d > 1) {
          if (d < 1.28 && azar(c * 7 + f * 13) > 0.55 + Math.sin(t * 1.3) * 0.08) r.dibujo([noche ? '·' : (d < 1.12 ? '\'' : '·')], cc + c, fc + f, colores.tenue, 1);
          continue;
        }
        const z = Math.sqrt(1 - d * d);
        let luz = noche ? (x * -0.55 + y * -0.35 + z * 0.75) : 0.85 + z * 0.15;
        if (noche) CRATERES.forEach(([cx, cy, rr]) => { const dd = Math.hypot(x - cx, y - cy); if (dd < rr) luz -= 0.35 * (1 - dd / rr); });
        const i = Math.max(1, Math.min(RAMPA.length - 1, Math.round(luz * (RAMPA.length - 1))));
        r.dibujo([RAMPA[i]], cc + c, fc + f, i > 7 ? colores.acento : colores.texto, 1);
      }
    }
    if (!noche) {
      for (let k = 0; k < 12; k++) {
        const a = k / 12 * Math.PI * 2 + t * 0.15, rr = R * 1.45 + Math.sin(t * 2 + k) * 0.6;
        r.dibujo([k % 2 ? '·' : '*'], cc + Math.cos(a) * rr * asp, fc + Math.sin(a) * rr, colores.acento, 1);
      }
    }
  }

  function gaviotas(r, t, colores, desplazamiento, horizonte, movil) {
    const cruce = 70, base = (((t + 22) % cruce) / cruce) * (r.cols + 60) - 30;   // a los 0 s ya van cruzando
    const bandada = movil ? BANDADA.slice(0, 3) : BANDADA;
    let n = 0;
    bandada.forEach(([dc, df], i) => {
      const c = r.cols - base + dc + Math.sin(t * 0.7 + i) * 1.5;
      const f = r.filas * 0.32 + df + Math.sin(t * 1.1 + i * 2) * 0.6 - desplazamiento * 0.8;
      if (f < 1 || f > horizonte - 3 || c < -4 || c > r.cols) return;
      r.dibujo([ALAS[Math.floor(t * 5 + i) % 4]], c, f, colores.texto, 1.4);
      n++;
    });
    return n;
  }

  /** Dibuja el cielo; horizonte en filas de pantalla. No dibuja nada si el cielo ya salió de la pantalla. */
  function dibujar(r, t, colores, horizonte, noche) {
    if (horizonte < 1) { cuenta = { estrellas: 0, gaviotas: 0 }; return; }
    const movil = r.cols < 70;
    const desplazamiento = r.filas * 1.25 - horizonte;
    const nE = noche ? estrellas(r, t, colores, desplazamiento, horizonte) : 0;
    astro(r, t, colores, desplazamiento, noche, movil);
    const nG = gaviotas(r, t, colores, desplazamiento, horizonte, movil);
    cuenta = { estrellas: nE, gaviotas: nG, astro: noche ? 'luna' : 'sol' };
  }

  return { dibujar: dibujar, estado: function () { return cuenta; } };
})();
