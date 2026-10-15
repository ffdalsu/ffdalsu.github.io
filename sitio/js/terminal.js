/*
 * Terminal interactiva (F14): «/» (o [>_] en el pie y en el menú lateral) abre una consola sobre la página.
 *
 *   Portafolio.Terminal.registrar(nombre, ayuda, fn, argumentos)   agrega un comando (la F15 suma «pregunta»).
 *   fn(args, terminal) devuelve texto, una lista de líneas o una promesa; argumentos() da las opciones para Tab.
 *
 * Tab completa comandos y argumentos, ↑/↓ recorren el historial (se guarda en la pestaña), Esc la cierra y devuelve el
 * foco a donde estaba. No se abre si el foco está en un campo de texto o hay un modal abierto.
 * La terminal sobrevive al cambio de página sin recargar (js/navegacion.js): su contenido vive aquí, no en el DOM.
 */
window.Portafolio = window.Portafolio || {};

Portafolio.Terminal = (function () {
  const CLAVE_HISTORIAL = 'terminal-historial';
  const comandos = {};
  const salida = [];            // líneas mostradas: { texto, clase }
  let historial = [];
  let posicion = -1;            // posición al recorrer el historial con las flechas
  let abierta = false;
  let anterior = null;          // elemento que tenía el foco antes de abrir
  let raiz = null, $salida = null, $entrada = null, $prompt = null;
  const sonar = (n, d) => { if (Portafolio.Sonido) Portafolio.Sonido.efecto(n, d); };

  try { historial = JSON.parse(sessionStorage.getItem(CLAVE_HISTORIAL) || '[]'); } catch (e) { historial = []; }

  /* ---------- utilidades ---------- */
  const pagina = () => (document.querySelector('main') || { dataset: {} }).dataset.pagina || 'inicio';
  const prompt = () => 'juan-david:~/' + (pagina() === 'inicio' ? '' : pagina()) + '$';

  function distancia(a, b) {   // Levenshtein, para sugerir el comando que se quiso escribir
    const m = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) m[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
      m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    return m[a.length][b.length];
  }

  function escribir(texto, clase) {
    [].concat(texto).forEach((t) => salida.push({ texto: String(t), clase: clase || '' }));
    while (salida.length > 300) salida.shift();
    pintarSalida();
  }

  function pintarSalida() {
    if (!$salida) return;
    $salida.empty();
    salida.forEach((l) => $('<div>').addClass('linea ' + l.clase).text(l.texto).appendTo($salida));
    $salida.scrollTop($salida[0].scrollHeight);
  }

  /* ---------- abrir, cerrar y ejecutar ---------- */
  function abrir() {
    if (!raiz) return;
    if (!abierta) anterior = document.activeElement;
    abierta = true;
    raiz.hidden = false;
    raiz.classList.add('abierta');
    $prompt.text(prompt());
    if (!salida.length) escribir(['bienvenido a la terminal de juan-david.', 'escribe «help» para ver los comandos. Esc cierra.'], 'tenue');
    pintarSalida();
    $entrada.trigger('focus');
    sonar('crt-on');
  }

  function cerrar() {
    if (!abierta) return;
    abierta = false;
    if (raiz) { raiz.classList.remove('abierta'); raiz.hidden = true; }
    sonar('crt-off');
    if (anterior && document.contains(anterior)) anterior.focus(); else document.body.focus();
  }

  async function ejecutar(linea) {
    const texto = linea.trim();
    escribir(prompt() + ' ' + texto, 'eco');
    if (!texto) return;
    historial = historial.filter((h) => h !== texto).concat(texto).slice(-50);
    try { sessionStorage.setItem(CLAVE_HISTORIAL, JSON.stringify(historial)); } catch (e) { /* sin almacenamiento */ }
    posicion = -1;
    const [nombre, ...args] = texto.split(/\s+/);
    const comando = comandos[nombre.toLowerCase()];
    if (!comando) {
      const parecido = Object.keys(comandos).map((c) => [c, distancia(nombre.toLowerCase(), c)]).sort((a, b) => a[1] - b[1])[0];
      escribir('comando no encontrado: ' + nombre + (parecido && parecido[1] <= 2 ? ' · ¿quisiste decir «' + parecido[0] + '»?' : ' · escribe «help»'), 'error');
      sonar('error');
      return;
    }
    try {
      const r = await comando.fn(args, api);
      if (r !== undefined && r !== null && r !== '') escribir(r);
    } catch (e) {
      escribir('error: ' + e.message, 'error');
    }
    if ($prompt) $prompt.text(prompt());
  }

  /** Completa la palabra actual con Tab: el comando, o el argumento según el comando. */
  function completar() {
    const valor = $entrada.val();
    const partes = valor.split(/\s+/);
    let opciones;
    if (partes.length <= 1) opciones = Object.keys(comandos);
    else {
      const c = comandos[partes[0].toLowerCase()];
      opciones = c && c.argumentos ? c.argumentos() : [];
    }
    const ultima = partes[partes.length - 1].toLowerCase();
    const encontradas = opciones.filter((o) => o.startsWith(ultima));
    if (encontradas.length === 1) {
      partes[partes.length - 1] = encontradas[0];
      $entrada.val(partes.join(' ') + (partes.length === 1 ? ' ' : ''));
    } else if (encontradas.length > 1) {
      escribir(encontradas.join('   '), 'tenue');
    }
  }

  /* ---------- la terminal en el DOM: se crea en cada página montada ---------- */
  function montar() {
    raiz = document.createElement('section');
    raiz.className = 'terminal';
    raiz.id = 'terminal';
    raiz.hidden = true;
    raiz.setAttribute('aria-label', 'Terminal');
    raiz.innerHTML =
      '<div class="terminal-barra"><span class="terminal-titulo">terminal</span>' +
      '<span class="terminal-ayuda">Tab completa · ↑↓ historial · Esc cierra</span>' +
      '<button type="button" class="boton terminal-cerrar" aria-label="Cerrar la terminal">[x]</button></div>' +
      '<div class="terminal-salida" aria-live="polite"></div>' +
      '<form class="terminal-linea" autocomplete="off"><label class="terminal-prompt" for="terminal-entrada"></label>' +
      '<input id="terminal-entrada" type="text" spellcheck="false" autocapitalize="off" aria-label="Comando"></form>';
    document.body.appendChild(raiz);
    $salida = $(raiz).find('.terminal-salida');
    $entrada = $(raiz).find('input');
    $prompt = $(raiz).find('.terminal-prompt');
    $(raiz).find('.terminal-cerrar').on('click', cerrar);
    $(raiz).find('form').on('submit', function (e) {
      e.preventDefault();
      const v = $entrada.val();
      $entrada.val('');
      ejecutar(v);
    });
    $entrada.on('keydown', function (e) {
      if (e.key === 'Tab') { e.preventDefault(); completar(); }
      else if (e.key === 'Escape') { e.preventDefault(); cerrar(); }
      else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (!historial.length) return;
        if (e.key === 'ArrowUp') posicion = posicion < 0 ? historial.length - 1 : Math.max(0, posicion - 1);
        else posicion = posicion < 0 ? -1 : posicion + 1;
        if (posicion >= historial.length) posicion = -1;
        $entrada.val(posicion < 0 ? '' : historial[posicion]);
      } else if (e.key.length === 1) sonar('tecleo', { i: e.key.charCodeAt(0) });
    });
    $('.abrir-terminal').on('click', function () {
      $('#menu-movil').offcanvas('hide');
      abrir();
    });
    // si estaba abierta (por ejemplo, tras «cd»), sigue abierta en la página nueva
    if (abierta) { abierta = false; abrir(); }
  }

  function desmontar() {
    const seguia = abierta;
    raiz = null; $salida = null; $entrada = null; $prompt = null;
    abierta = seguia;   // se recuerda para volver a abrirla en la página nueva
  }

  Portafolio.Paginas.montar(montar);
  Portafolio.Paginas.desmontar(desmontar);

  // «/» abre la terminal, salvo que se esté escribiendo en un campo o haya un modal o el menú abiertos
  document.addEventListener('keydown', (e) => {
    if (e.key !== '/' || abierta || e.ctrlKey || e.metaKey || e.altKey) return;
    const el = document.activeElement;
    if (el && (el.matches('input, textarea, select') || el.isContentEditable)) return;
    if (document.querySelector('.modal.show, .offcanvas.show')) return;
    e.preventDefault();
    abrir();
  });

  /* ---------- comandos ---------- */
  function registrar(nombre, ayuda, fn, argumentos) { comandos[nombre] = { ayuda, fn, argumentos }; }
  const api = { registrar, escribir, cerrar, abrir };

  const ARCHIVOS = {
    'sobre-mi.txt': ['Juan David · matemático puro (Universidad Nacional) y desarrollador.', 'Bancolombia → Conaltura: automatizaciones, webs e inteligencia artificial.', 'Rumbo: especializarme en IA. Más en «cd sobre-mi».'],
    'habilidades.txt': ['lenguajes/  Python · SQL Server · C# / .NET · JavaScript', 'web/        HTML y CSS · Bootstrap · jQuery', 'herramientas/ Git y GitHub', 'ia-y-mate/  modelos de lenguaje · agentes · álgebra y análisis'],
    'certificados.txt': ['[✓] CS50x · [✓] CS50P · [✓] CS50 SQL · [✓] CS50AI', 'HarvardX · Computer Science for Python Programming', 'HarvardX · Computer Science for Databases using SQL', 'HarvardX · Computer Science for Artificial Intelligence'],
    'contacto.txt': ['correo: ffdalsu.dev@gmail.com', 'o escribe «contacto» para abrir el formulario.'],
    'bit.txt': ['bit [o_o] · mascota oficial de este océano.', 'flota, sigue el puntero, cuenta cosas y se duerme si nadie le hace caso.']
  };
  const PAGINAS = { inicio: 'index.html', 'sobre-mi': 'sobre-mi.html', proyectos: 'projects.html' };
  const PROYECTOS = ['facturacion', 'hermes', 'indicadores', 'automatizaciones', 'portafolio'];
  const irA = (archivo) => (Portafolio.Navegacion && Portafolio.Navegacion.ir) ? Portafolio.Navegacion.ir(archivo) : (location.href = archivo, Promise.resolve());

  // la ayuda agrupa los comandos (≤ 7 por grupo); los que registre otro módulo van a «otros»
  const GRUPOS = [
    ['navegar', ['cd', 'ls', 'cat', 'open']],
    ['sitio', ['cv', 'github', 'contacto', 'tema', 'sonido']],
    ['consola', ['help', 'whoami', 'date', 'echo', 'clear', 'exit', 'sudo']]
  ];
  registrar('help', 'lista los comandos', () => {
    const lineas = [], vistos = new Set();
    const grupo = (titulo, nombres) => {
      if (!nombres.length) return;
      lineas.push('┤ ' + titulo + ' ├');
      nombres.forEach((c) => { vistos.add(c); lineas.push('  ' + c.padEnd(10) + comandos[c].ayuda); });
    };
    GRUPOS.forEach(([titulo, nombres]) => grupo(titulo, nombres.filter((c) => comandos[c])));
    grupo('otros', Object.keys(comandos).filter((c) => !vistos.has(c)).sort());
    return lineas;
  });
  const HOJA_DE_VIDA = 'archivos/hoja-de-vida-juan-david.pdf';
  registrar('cv', 'descarga mi hoja de vida (pdf)', () => {
    const a = document.createElement('a');
    a.href = new URL(HOJA_DE_VIDA, document.baseURI).href;
    a.download = 'hoja-de-vida-juan-david.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    return 'descargando hoja-de-vida-juan-david.pdf…';
  });
  registrar('github', 'abre mi GitHub (github.com/ffdalsu)', () => {
    window.open('https://github.com/ffdalsu', '_blank', 'noopener');
    return 'abriendo github.com/ffdalsu…';
  });
  registrar('whoami', 'quién soy', () => 'juan-david · matemático puro y desarrollador · Python, SQL Server e IA');
  registrar('ls', 'lista páginas y archivos (ls proyectos: los proyectos)', (args) => {
    if (args[0] === 'proyectos' || args[0] === 'proyectos/') return PROYECTOS.map((p) => p + '/').join('   ');
    return Object.keys(PAGINAS).map((p) => p + '/').concat(Object.keys(ARCHIVOS)).join('   ');
  }, () => ['proyectos']);
  registrar('cat', 'muestra un archivo (cat sobre-mi.txt)', (args) => {
    if (!args[0]) return 'uso: cat <archivo> · prueba «ls»';
    const a = ARCHIVOS[args[0]];
    if (!a) throw new Error('no existe «' + args[0] + '» · prueba «ls»');
    return a;
  }, () => Object.keys(ARCHIVOS));
  registrar('cd', 'cambia de página (cd sobre-mi)', async (args) => {
    const destino = (args[0] || 'inicio').replace(/\/$/, '').replace(/^~$|^\.\.$/, 'inicio');
    if (!PAGINAS[destino]) throw new Error('no existe la página «' + destino + '» · prueba «ls»');
    if (destino === pagina()) return 'ya estás en ' + destino;
    await irA(PAGINAS[destino]);
    return '';
  }, () => Object.keys(PAGINAS));
  registrar('open', 'abre el video de un proyecto (open hermes)', async (args) => {
    const slug = args[0];
    if (!slug || PROYECTOS.indexOf(slug) < 0) throw new Error('uso: open <proyecto> · ' + PROYECTOS.join(', '));
    if (pagina() !== 'proyectos') await irA('projects.html#' + slug);
    const boton = document.querySelector('#' + slug + ' .boton-video');
    if (!boton) return 'abre «proyectos» y dale ▶ al video de ' + slug;
    cerrar();
    boton.click();
    return '▶ ' + slug;
  }, () => PROYECTOS);
  registrar('tema', 'cambia el tema (tema ambar | tema papel)', (args) => {
    const t = args[0] === 'ambar' ? 'dark' : args[0] === 'papel' ? 'light' : (Portafolio.Tema.actual() === 'dark' ? 'light' : 'dark');
    Portafolio.Tema.aplicar(t);
    return 'tema: ' + (t === 'dark' ? 'ámbar' : 'papel');
  }, () => ['ambar', 'papel']);
  registrar('sonido', 'sonido (sonido no | efectos | musica)', (args) => {
    const m = { no: 'silencio', efectos: 'efectos', musica: 'todo' }[args[0]];
    if (!m) throw new Error('uso: sonido no | efectos | musica');
    Portafolio.Sonido.cambiar(m);
    return 'sonido: ' + args[0];
  }, () => ['no', 'efectos', 'musica']);
  registrar('contacto', 'abre el formulario para escribirme', () => { cerrar(); $('#modal-contacto').modal('show'); return ''; });
  registrar('date', 'fecha y hora en Medellín', () => new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota', dateStyle: 'full', timeStyle: 'short' }));
  registrar('echo', 'repite lo que escribas', (args) => args.join(' '));
  registrar('clear', 'limpia la pantalla', () => { salida.length = 0; pintarSalida(); return ''; });
  registrar('exit', 'cierra la terminal', () => { cerrar(); return ''; });
  registrar('sudo', 'pide permisos de administrador', () => 'juan-david no está en el archivo sudoers. Este incidente será reportado. (es broma)');

  return {
    registrar: registrar,
    abrir: abrir,
    cerrar: cerrar,
    ejecutar: ejecutar,
    estado: function () { return { abierta: abierta, lineas: salida.map((l) => l.texto), historial: historial.slice() }; }
  };
})();
