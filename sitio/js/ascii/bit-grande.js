/*
 * Bit grande (F17a, D35): la escena del arranque y de la imagen para compartir, al estilo del logo de Ghostty.
 *
 * Bit se dibuja con formas (distancias con signo: cajas redondeadas, segmentos, círculos y el polígono del barco) y
 * cada celda se sombrea con una rampa de densidad. La escena se diseña en 30 filas y se muestrea en una rejilla de
 * COLS × FILAS celdas, así que gana detalle sin cambiar de forma. Es una función pura, sin DOM.
 *
 *   Portafolio.BitGrande.escena(t, { parpadeo, saludo }) → { chars: [cadena por fila], capas: [[0|1|2 por celda]] }
 *       t en segundos; parpadeo 1 = ojos abiertos, 0 = cerrados; saludo -1..1 = altura del brazo derecho.
 *       Capas: 0 = cuerpo (color del texto), 1 = luz (acento: ojos, antena, luces del pecho, halo, mar), 2 = tenue.
 *   Portafolio.BitGrande.html(escena, filtro) → HTML del <pre> (spans .acento y .tenue). filtro(x, y, ch) puede
 *       cambiar cada carácter (el arranque lo usa para revelar la escena por celdas).
 *   Portafolio.BitGrande.ajustar(pre, ancho, alto) → pone el tamaño de letra para que la rejilla quepa en la caja.
 */
window.Portafolio = window.Portafolio || {};

Portafolio.BitGrande = (function () {
  const RAMPA = ' ·:-=+*#';              // rampa corta: revelar celdas y el velo entre páginas
  const RAMPA_BIT = ' .:-=+*x%#@';       // rampa larga: el sombreado de bit
  const COLS = 96, FILAS = 44, ASPECTO = 0.54, ESCALA = 30 / FILAS;
  const CASCO = [[-17.5, 2.6], [-10, 5.3], [10, 5.3], [17.5, 2.6], [12, 9.6], [-12, 9.6]];
  const CLASE = ['', 'acento', 'tenue'];

  const largo = (x, y) => Math.hypot(x, y);
  function caja(px, py, hx, hy, r) {
    const qx = Math.abs(px) - hx + r, qy = Math.abs(py) - hy + r;
    return largo(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
  }
  function segmento(px, py, ax, ay, bx, by, r) {
    const pax = px - ax, pay = py - ay, bax = bx - ax, bay = by - ay;
    const h = Math.max(0, Math.min(1, (pax * bax + pay * bay) / (bax * bax + bay * bay)));
    return largo(pax - bax * h, pay - bay * h) - r;
  }
  function dentro(px, py, pol) {
    let s = false;
    for (let i = 0, j = pol.length - 1; i < pol.length; j = i++) {
      const [xi, yi] = pol[i], [xj, yj] = pol[j];
      if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) s = !s;
    }
    return s;
  }
  function borde(px, py, pol) {
    let d = 1e9;
    for (let i = 0, j = pol.length - 1; i < pol.length; j = i++) d = Math.min(d, segmento(px, py, pol[j][0], pol[j][1], pol[i][0], pol[i][1], 0));
    return dentro(px, py, pol) ? -d : d;
  }

  function escena(t, opciones) {
    const o = Object.assign({ parpadeo: 1, saludo: Math.sin(t * 5) }, opciones);
    const flote = Math.sin(t * 1.3) * 0.35;
    const chars = [], capas = [];
    for (let y = 0; y < FILAS; y++) {
      let fila = '';
      const capa = [];
      for (let x = 0; x < COLS; x++) {
        const u = (x - COLS / 2 + 0.5) * ASPECTO * ESCALA, v = (y - FILAS / 2 + 0.5) * ESCALA;
        const luz = (-u / 18 - v / 22) * 0.06;           // luz desde arriba a la izquierda
        let d = 0, c = 0;
        const pinta = (sdf, base, capaNueva, aro) => {
          if (sdf < 0) { d = base + luz + (sdf > -0.55 ? (aro == null ? 0.22 : aro) : 0); c = capaNueva; }
        };
        const bv = v - flote;                             // bit y el barco se mecen juntos
        // Halo (el anillo de Ghostty): un aro de puntos que gira
        if (Math.abs(largo(u, v + 3) - 14.4) < 0.3 && v < 7.5) { d = 0.28 + 0.18 * Math.sin(Math.atan2(v + 3, u) * 16 - t * 2); c = 1; }
        // Antena
        pinta(segmento(u, bv, 0, -12, 0, -9, 0.32), 0.62, 0);
        pinta(largo(u, bv + 13.1) - 1.25, 0.75 + Math.sin(t * 3) * 0.2, 1, 0.3);
        // Orejas, cabeza y pantalla con líneas de barrido
        pinta(caja(Math.abs(u) - 6.9, bv + 5, 0.8, 1.8, 0.35), 0.55, 0);
        pinta(caja(u, bv + 5, 6.2, 4.6, 2), 0.7, 0);
        pinta(caja(u, bv + 5.1, 4.7, 3.3, 1.4), (y % 2 ? 0.1 : 0.03), 0, 0.12);
        // Ojos (se cierran al parpadear, con un brillo) y sonrisa
        for (const ox of [-2.2, 2.2]) {
          const ey = (bv + 5.9) / Math.max(0.1, o.parpadeo);
          pinta(largo(u - ox, ey) - 1.35, 0.98, 1, 0.05);
          if (o.parpadeo > 0.6) pinta(largo(u - ox + 0.45, ey + 0.45) - 0.38, 0.15, 0, 0);
        }
        pinta(Math.min(segmento(u, bv, -1.5, -3.3, 0, -2.75, 0.34), segmento(u, bv, 0, -2.75, 1.5, -3.3, 0.34)), 0.85, 1, 0);
        // Cuello, cuerpo, luces del pecho y brazos (el derecho saluda)
        pinta(caja(u, bv + 0.5, 1.3, 0.7, 0.2), 0.45, 0);
        pinta(caja(u, bv - 2.7, 4.4, 2.7, 1.2), 0.62, 0);
        [-1.6, 0, 1.6].forEach((lx, i) => pinta(largo(u - lx, bv - 2.3) - 0.55, 0.35 + 0.6 * Math.max(0, Math.sin(t * 4 - i * 1.2)), 1, 0));
        const mano = [7.4, -2.2 + o.saludo * 1.2];
        pinta(segmento(u, bv, -4.2, 1, -6.6, 4.2, 0.75), 0.6, 0);
        pinta(largo(u + 6.8, bv - 4.4) - 0.95, 0.66, 0);
        pinta(segmento(u, bv, 4.2, 1, mano[0], mano[1], 0.75), 0.6, 0);
        pinta(largo(u - mano[0], bv - mano[1] + 0.3) - 0.95, 0.66, 0);
        // Barco de papel: casco con puntas levantadas y dos pliegues
        const db = borde(u, bv, CASCO);
        if (db < 0) {
          d = 0.42 + luz + (db > -0.5 ? 0.3 : 0); c = 0;
          if (Math.min(segmento(u, bv, -10, 5.3, -6.5, 9.6, 0), segmento(u, bv, 10, 5.3, 6.5, 9.6, 0)) < 0.3) { d = 0.25; c = 2; }
        }
        // Mar: superficie con dos ondas; tapa el fondo del casco
        const sup = 8.9 + 0.5 * Math.sin(u * 0.45 + t * 1.6) + 0.3 * Math.sin(u * 0.9 - t * 1.1);
        if (v > sup) {
          const prof = v - sup, onda = 0.5 + 0.5 * Math.sin(u * 0.7 - t * 2 + prof * 1.3);
          d = Math.max(0.08, (prof < 0.7 ? 0.65 : 0.42 - prof * 0.05) * (0.55 + 0.45 * onda)); c = 1;
        }
        const k = Math.max(0, Math.min(RAMPA_BIT.length - 1, Math.round(d * (RAMPA_BIT.length - 1))));
        fila += RAMPA_BIT[k];
        capa.push(c);
      }
      chars.push(fila);
      capas.push(capa);
    }
    return { chars: chars, capas: capas };
  }

  function html(e, filtro) {
    let s = '';
    for (let y = 0; y < e.chars.length; y++) {
      let actual = 0;
      for (let x = 0; x < e.chars[y].length; x++) {
        const ch = filtro ? filtro(x, y, e.chars[y][x]) : e.chars[y][x];
        const c = ch === ' ' ? actual : e.capas[y][x];
        if (c !== actual) { if (actual > 0) s += '</span>'; if (c > 0) s += '<span class="' + CLASE[c] + '">'; actual = c; }
        s += ch;
      }
      if (actual > 0) s += '</span>';
      s += '\n';
    }
    return s;
  }

  // la celda de una fuente mono mide ~0,6 × 1,12 em
  function ajustar(pre, ancho, alto) {
    pre.style.fontSize = Math.max(2, Math.min(ancho / (COLS * 0.6), alto / (FILAS * 1.12))).toFixed(2) + 'px';
    pre.style.lineHeight = '1.12';
  }

  return { COLS: COLS, FILAS: FILAS, ASPECTO: ASPECTO, RAMPA: RAMPA, escena: escena, html: html, ajustar: ajustar };
})();
