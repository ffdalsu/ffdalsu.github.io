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
 * La música («+ música») llega en la F10; por ahora «+ música» suena igual que «efectos».
 */
window.Portafolio = window.Portafolio || {};

Portafolio.Sonido = (function () {
  const CLAVE = 'sonido';
  const MODOS = ['silencio', 'efectos', 'todo'];
  const VOLUMEN = 0.6;
  const ESPERA_MS = { tecleo: 25 };   // mínimo entre repeticiones del mismo efecto (por defecto 60 ms)

  let modo = 'silencio';
  let ctx = null, sint = null, maestro = null;
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

  function pintarControl() {
    $('.opcion-sonido').each(function () { $(this).attr('aria-pressed', String($(this).data('sonido') === modo)); });
  }

  function cambiar(nuevo) {
    if (MODOS.indexOf(nuevo) < 0) return;
    modo = nuevo;
    try { localStorage.setItem(CLAVE, modo); } catch (e) { /* la elección dura solo esta visita */ }
    pintarControl();
    if (modo === 'silencio') { if (ctx) ctx.suspend(); return; }
    despertar();
    efecto('blip');
  }

  $(function () {
    pintarControl();
    $('.opcion-sonido').on('click', function () { cambiar($(this).data('sonido')); });

    // el primer gesto despierta el audio si el visitante ya lo había activado en otra visita
    ['pointerdown', 'keydown'].forEach((ev) => document.addEventListener(ev, despertar, { capture: true }));

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
    cambiar: cambiar,
    /** Para que otros módulos (videos, música) usen el mismo sintetizador. */
    sintetizador: function () { return sint; },
    estado: function () { return { modo: modo, contexto: ctx ? ctx.state : null, ultimos: ultimos.slice() }; }
  };
})();
