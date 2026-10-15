/*
 * Sonido del sitio (D24, D25): control «┤ sonido ├ silencio · efectos · + música» del encabezado.
 *
 *   - Arranca en silencio. La elección se guarda en localStorage["sonido"] ("silencio" | "efectos" | "todo").
 *   - El AudioContext solo se crea con un gesto del visitante (clic o tecla): los navegadores bloquean el audio
 *     sin gesto y así nunca suena nada inesperado al abrir la página.
 *   - Portafolio.Sonido.efecto(nombre, datos) programa un efecto de js/sonido/sintetizador.js; en silencio no
 *     hace nada. El mismo efecto no se repite antes de 60 ms (el tecleo, 25 ms) para que nunca sature.
 *   - Aquí mismo suenan los efectos «de interfaz»: clic en enlaces y botones, abrir y cerrar modales y cambiar el
 *     tema. Los demás (agua, bit, títulos, diplomas, formulario) los piden sus propios módulos.
 *   - Con la pestaña oculta el audio se suspende.
 *   - En «+ música» suena además la música del sitio (js/sonido/musica.js), programada en vivo con 300 ms de
 *     adelanto; Portafolio.Sonido.profundidad(metros) la apaga «bajo el agua» al bajar por el inicio.
 */
window.Portafolio = window.Portafolio || {};

Portafolio.Sonido = (function () {
  const CLAVE = 'sonido';
  const MODOS = ['silencio', 'efectos', 'todo'];
  const VOLUMEN = 0.6;
  const ESPERA_MS = { tecleo: 25 };   // mínimo entre repeticiones del mismo efecto (por defecto 60 ms)
  // Música del sitio en «+ música». Para cambiarla basta esta palabra (D26):
  //   'generativa' (elegida: sinfonía desde ψ, nunca se repite) · 'oceano' (lo-fi) · 'chiptune' (NES, la de los videos)
  const MUSICA_DEL_SITIO = 'generativa';

  let modo = 'silencio';
  let ctx = null, sint = null, maestro = null, musica = null, relojMusica = null, metros = 0, aviso = null;
  const ultimos = [];          // registro de los últimos efectos programados (pruebas y depuración)
  const ultimaVez = {};

  try { const guardado = localStorage.getItem(CLAVE); if (MODOS.indexOf(guardado) >= 0) modo = guardado; } catch (e) { /* sin almacenamiento: silencio */ }

  /** Crea o reanuda el audio. Solo se llama desde un gesto del visitante. */
  function despertar() {
    if (modo === 'silencio') return;
    const Contexto = window.AudioContext || window.webkitAudioContext;
    if (!Contexto) return;
    if (!ctx) {
      ctx = new Contexto();
      maestro = ctx.createGain();
      maestro.gain.value = VOLUMEN;
      const compresor = ctx.createDynamicsCompressor();   // evita picos si coinciden varios efectos
      maestro.connect(compresor).connect(ctx.destination);
      sint = Portafolio.Sintetizador(ctx, maestro);
    }
    if (ctx.state === 'suspended' && !document.hidden) ctx.resume();
    sincronizarMusica();
    mostrarAviso(false);
  }

  /**
   * Al recargar con el sonido activado el navegador no deja sonar hasta un clic, una tecla o un toque (el scroll no
   * cuenta). Para que no parezca roto, un aviso discreto lo dice; el primer gesto en cualquier parte lo quita.
   */
  function mostrarAviso(si) {
    if (si && !aviso) {
      aviso = document.createElement('p');
      aviso.className = 'aviso-sonido';
      aviso.setAttribute('role', 'status');
      aviso.textContent = '♪ sonido activado · haz clic en cualquier parte para oírlo';
      document.body.appendChild(aviso);
    } else if (!si && aviso) {
      aviso.remove();
      aviso = null;
    }
  }

  /** Programa un efecto ahora (o dentro de «retraso» segundos). */
  function efecto(nombre, datos, retraso) {
    if (modo === 'silencio' || !sint || !sint.efectos[nombre]) return;
    const ahora = performance.now();
    if (ahora - (ultimaVez[nombre] || -1e9) < (ESPERA_MS[nombre] || 60)) return;
    ultimaVez[nombre] = ahora;
    sint.efectos[nombre](ctx.currentTime + 0.01 + (retraso || 0), datos);
    ultimos.push(nombre);
    if (ultimos.length > 40) ultimos.shift();
  }

  /** Enciende o apaga la música según el modo. Necesita el audio ya creado (gesto del visitante). */
  function sincronizarMusica() {
    const debe = modo === 'todo' && sint && Portafolio.Musica;
    if (debe && !musica) {
      musica = Portafolio.Musica.crear(sint, maestro, MUSICA_DEL_SITIO);
      musica.profundidad(metros);
      musica.alDia(0.3);
      relojMusica = setInterval(() => { if (musica && ctx.state === 'running') musica.alDia(0.3); }, 60);
    } else if (!debe && musica) {
      musica.detener();
      musica = null;
      clearInterval(relojMusica);
    }
  }

  /** Profundidad actual (m) del inicio: bajo el agua la música se apaga como sumergida. */
  function profundidad(m) {
    metros = m;
    if (musica) musica.profundidad(m);
  }

  function pintarControl() {
    $('.opcion-sonido').each(function () { $(this).attr('aria-pressed', String($(this).data('sonido') === modo)); });
  }

  function cambiar(nuevo) {
    if (MODOS.indexOf(nuevo) < 0) return;
    modo = nuevo;
    try { localStorage.setItem(CLAVE, modo); } catch (e) { /* la elección dura solo esta visita */ }
    pintarControl();
    sincronizarMusica();
    if (modo === 'silencio') { mostrarAviso(false); if (ctx) ctx.suspend(); return; }
    despertar();
    efecto('blip');
  }

  $(function () {
    pintarControl();
    if (modo !== 'silencio') mostrarAviso(true);
    $('.opcion-sonido').on('click', function () { cambiar($(this).data('sonido')); });

    // el primer gesto despierta el audio si el visitante ya lo había activado en otra visita
    ['pointerdown', 'keydown', 'touchend'].forEach((ev) => document.addEventListener(ev, despertar, { capture: true }));

    // efectos de interfaz: clic en enlaces y botones, y el interruptor del tema
    document.addEventListener('click', (e) => {
      const el = e.target.closest('a, button');
      if (!el || el.matches('.opcion-sonido')) return;
      efecto(el.matches('.opcion-tema') ? 'interruptor' : 'blip');
    }, { capture: true });

    // abrir y cerrar cualquier modal (videos, contacto): encender y apagar un CRT
    $(document).on('show.bs.modal', () => efecto('crt-on', null, 0.05));
    $(document).on('hide.bs.modal', () => efecto('crt-off'));

    document.addEventListener('visibilitychange', () => {
      if (!ctx) return;
      if (document.hidden) ctx.suspend(); else if (modo !== 'silencio') ctx.resume();
    });
  });

  return {
    efecto: efecto,
    profundidad: profundidad,
    cambiar: cambiar,
    /** Para que otros módulos (videos, música) usen el mismo sintetizador. */
    sintetizador: function () { return sint; },
    estado: function () {
      const m = musica ? musica.estado() : null;
      return { modo: modo, contexto: ctx ? ctx.state : null, ultimos: ultimos.slice(), musica: !!musica,
        variante: m ? m.variante : MUSICA_DEL_SITIO, corte: m ? m.corte : null, notas: m ? m.notas : 0 };
    }
  };
})();
