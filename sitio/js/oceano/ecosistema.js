/*
 * Ecosistema del inicio: las criaturas (habilidades) y las islas (proyectos destacados).
 *
 * Criaturas: cada <li data-criatura="…"> de la sección «Habilidades» tiene una criatura que nada en el
 * acuario (.acuario), la franja de mar abierto que hay justo encima de la lista. Pasar el puntero o el foco
 * por un ítem resalta su criatura, y acercar el puntero a una criatura resalta su ítem.
 *
 * Islas: son enlaces HTML reales (.isla) dentro del encabezado; aquí solo se mueven para que floten sobre la
 * ola. Así se pueden enfocar con el teclado, las leen los lectores de pantalla y funcionan sin JavaScript.
 */
window.Portafolio = window.Portafolio || {};

Portafolio.Ecosistema = (function () {
  // Dibujos mirando a la derecha; al nadar hacia la izquierda se reflejan con espejo()
  const DIBUJOS = {
    python: ['~~~~~=<'],
    sql: [' .--. ', '(====)', ' ¦¦¦¦ '],
    csharp: ['<#)))><'],
    javascript: ['><>  ><>', '  ><>   '],
    html: ['</>~'],
    bootstrap: ['[B]>'],
    jquery: ['$)>'],
    git: ['o-o-o<'],
    ia: [' .oOo. ', '( o o )', ' `~~~´ '],
    matematicas: ['∑ ∫ π']
  };
  const PARES = { '<': '>', '>': '<', '(': ')', ')': '(', '[': ']', ']': '[', '/': '\\', '\\': '/', '`': '´', '´': '`' };
  const espejo = (filas) => filas.map((f) => Array.from(f).reverse().map((c) => PARES[c] || c).join(''));

  const ESCALA = 1.6;
  const sonar = (n, d, r) => { if (Portafolio.Sonido) Portafolio.Sonido.efecto(n, d, r); };   // js/sonido/sonido.js
  let criaturas = [], islas = [], acuario = null, contenedor = null;

  function iniciar() {
    acuario = document.querySelector('.acuario');
    const items = document.querySelectorAll('.habilidades li[data-criatura]');
    criaturas = Array.from(items).map((li, i) => ({
      li: li,
      nombre: li.textContent.trim(),
      filas: DIBUJOS[li.dataset.criatura] || ['><>'],
      prof: (i + 0.5) / items.length,        // fracción de la altura del acuario
      lado: i % 2,                           // mitad izquierda o derecha
      fase: i * 1.7,
      activa: false,
      x: 0, y: 0, ancho: 0
    }));
    criaturas.forEach((k) => {
      const activar = (si) => () => { k.porItem = si; };
      k.li.addEventListener('mouseenter', activar(true));
      k.li.addEventListener('mouseleave', activar(false));
      k.li.addEventListener('focus', activar(true));
      k.li.addEventListener('blur', activar(false));
    });
    islas = Array.from(document.querySelectorAll('.isla'));
    islas.forEach((isla) => ['mouseenter', 'focus'].forEach((ev) => isla.addEventListener(ev, () => sonar('campana'))));
    contenedor = document.querySelector('.horizonte');
  }

  /** Dibuja las criaturas que caen en pantalla. puntero = {c, f} en celdas de pantalla, o null. */
  function dibujar(r, t, colores, puntero) {
    if (!acuario) return;
    const caja = acuario.getBoundingClientRect();
    const arriba = caja.top / r.ch;   // fila de pantalla donde empieza el acuario (en el acto 3 se mueve 1:1 con el scroll)
    const alto = caja.height / r.ch;
    criaturas.forEach((k) => {
      const ancho = Math.max.apply(null, k.filas.map((f) => Array.from(f).length)) * ESCALA;
      const etiqueta = k.nombre.length + 4;
      const mitad = r.cols / 2;
      const recorrido = Math.max(4, mitad - ancho - etiqueta - 6);
      const vaiven = Math.sin(t * 0.25 + k.fase);
      const x = k.lado * mitad + 3 + (vaiven + 1) / 2 * recorrido;
      const derecha = Math.cos(t * 0.25 + k.fase) >= 0;   // la derivada del vaiven dice hacia dónde nada
      const y = arriba + 2 + k.prof * (alto - 6) + Math.sin(t * 0.9 + k.fase) * 0.6;
      k.x = x; k.y = y; k.ancho = ancho;
      if (y < -4 || y > r.filas + 1) { k.activa = !!k.porItem; return; }

      const cerca = puntero && puntero.c >= x - 2 && puntero.c <= x + ancho + etiqueta && Math.abs(puntero.f - (y + 1)) < 3;
      const antes = k.activa;
      k.activa = !!k.porItem || !!cerca;
      if (k.activa && !antes) sonar('campana');
      k.li.classList.toggle('activa', k.activa);

      const filas = derecha ? k.filas : espejo(k.filas);
      r.dibujo(filas, x, y, k.activa ? colores.acento : colores.texto, ESCALA, true, colores.fondo);
      const texto = k.activa ? '[ ' + k.nombre + ' ]' : '← ' + k.nombre;
      const fy = Math.round(y + (k.filas.length * ESCALA) / 2 - 0.5);
      r.dibujo([texto], Math.ceil(x + ancho + 2), fy, k.activa ? colores.acento : colores.tenue, 1, true, colores.fondo);
    });
  }

  /** Coloca cada isla sobre la ola: filaAgua es la fila de pantalla del nivel del mar en esa columna. */
  function moverIslas(r, t, filaAguaEn) {
    // las islas solo existen mientras el horizonte está en pantalla; fuera de ella tampoco reciben el foco
    const horizonte = filaAguaEn(r.cols / 2, t);
    const visibles = horizonte > -2 && horizonte < r.filas + 2;
    if (contenedor) contenedor.style.visibility = visibles ? 'visible' : 'hidden';
    if (!visibles) return;
    islas.forEach((isla) => {
      const caja = isla.getBoundingClientRect();
      const c = (caja.left + caja.width / 2) / r.cw;
      const y = filaAguaEn(c, t) * r.ch;
      const padre = isla.offsetParent.getBoundingClientRect();
      // el borde de abajo del dibujo queda medio hundido en el agua
      isla.style.top = (y - padre.top - isla.querySelector('.isla-dibujo').offsetHeight * 0.85 - isla.querySelector('.isla-dibujo').offsetTop) + 'px';
    });
  }

  $(iniciar);

  return {
    dibujar: dibujar,
    moverIslas: moverIslas,
    estado: function () {
      return {
        criaturas: criaturas.map((k) => ({ nombre: k.nombre, activa: k.activa })),
        islas: islas.length
      };
    }
  };
})();
