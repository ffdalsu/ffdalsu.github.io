/*
 * Sonido del sitio (D24, D25): control «┤ sonido ├ silencio · efectos · + música» del encabezado.
 *
 *   - Arranca en silencio. La elección se guarda en localStorage["sonido"] ("silencio" | "efectos" | "todo").
 *   - Si el visitante ya había activado el sonido, al cargar se intenta sonar de inmediato; si el navegador lo
 *     bloquea (exige un clic, una tecla o un toque), un aviso lo dice y el primer gesto en cualquier parte lo arranca.
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

  /** Crea el audio si aún no existe. Sin gesto del visitante puede quedar «suspended» hasta el primer clic. */
  function crearContexto() {
    const Contexto = window.AudioContext || window.webkitAudioContext;
    if (!Contexto) return false;
    if (!ctx) {
      ctx = new Contexto();
      maestro = ctx.createGain();
      maestro.gain.value = VOLUMEN;
      const compresor = ctx.createDynamicsCompressor();   // evita picos si coinciden varios efectos
      maestro.connect(compresor).connect(ctx.destination);
      sint = Portafolio.Sintetizador(ctx, maestro);
      ctx.addEventListener('statechange', alSonar);
    }
    return true;
  }

  /** Cuando el audio por fin corre: arranca la música y se quita el aviso. */
  function alSonar() {
    if (!ctx || ctx.state !== 'running' || modo === 'silencio') return;
    sincronizarMusica();
    mostrarAviso(false);
  }

  /** Crea o reanuda el audio. Se llama con cada gesto del visitante (clic, tecla, toque). */
  function despertar() {
    if (modo === 'silencio' || !crearContexto()) return;
    if (ctx.state === 'suspended' && !document.hidden) ctx.resume().then(alSonar, () => {});
    alSonar();
  }

  /**
   * Al cargar una página con el sonido ya activado se intenta sonar de inmediato: Chrome y Edge lo permiten cuando se
   * llega haciendo clic en un enlace del mismo sitio. Si el navegador lo bloquea (Firefox, Safari, una recarga), el
   * audio queda en pausa y aparece el aviso hasta el primer gesto.
   */
  function intentarAlCargar() {
    if (modo === 'silencio' || !crearContexto()) return;
    if (ctx.state === 'running') { alSonar(); return; }
    mostrarAviso(true);
    ctx.resume().then(alSonar, () => {});
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
    // con el audio en pausa no se programa nada: si no, todo sonaría de golpe al reanudar
    if (modo === 'silencio' || !sint || !sint.efectos[nombre] || ctx.state !== 'running') return;
    const ahora = performance.now();
    if (ahora - (ultimaVez[nombre] || -1e9) < (ESPERA_MS[nombre] || 60)) return;
    ultimaVez[nombre] = ahora;
    sint.efectos[nombre](ctx.currentTime + 0.01 + (retraso || 0), datos);
    ultimos.push(nombre);
    if (ultimos.length > 40) ultimos.shift();
  }

  /** Enciende o apaga la música según el modo. Solo arranca con el audio corriendo. */
  function sincronizarMusica() {
    const debe = modo === 'todo' && sint && ctx.state === 'running' && Portafolio.Musica;
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

  // el control y el aviso son de cada página: se vuelven a montar al cambiar de página sin recargar (js/navegacion.js)
  Portafolio.Paginas.montar(function () {
    pintarControl();
    $('.opcion-sonido').on('click', function () { cambiar($(this).data('sonido')); });
    if (aviso === null && modo !== 'silencio' && (!ctx || ctx.state !== 'running')) mostrarAviso(true);
  });
  // el aviso vivía en el body que se reemplaza: se olvida para volver a crearlo si hace falta
  Portafolio.Paginas.desmontar(function () { aviso = null; });

  // lo de toda la visita: el audio no se desmonta nunca, así la música sigue al cambiar de página
  $(function () {
    // si está la secuencia de arranque (js/arranque.js), el audio espera a que termine
    if (document.documentElement.classList.contains('arrancando')) {
      document.addEventListener('portafolio:arranque-fin', intentarAlCargar, { once: true });
    } else {
      intentarAlCargar();
    }

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
