# Plan · Portafolio web (Taller Herramientas III)

Taller de la asignatura Herramientas de Programación III (ET0056), I.U. Pascual Bravo. Enunciado en
`recursos/GUÍA DE TRABAJO PRÁCTICO EXPERIMENTAL 2.pdf`. El trabajo queda fuera de la wiki de TI, pero sigue el ciclo de
desarrollo de TI.

## Requisitos de la guía
- `index.html`: menú superior, encabezado (título + descripción), «Sobre mí», «Habilidades» con íconos de FontAwesome,
  pie con contacto y redes.
- `projects.html`: al menos 3 proyectos (título, descripción, botón) con modal **abierto con jQuery** que incrusta un
  video de YouTube relacionado con el proyecto.
- HTML, CSS, Bootstrap y jQuery; diseño responsive.
- Entrega: `.zip` con los HTML y las subcarpetas de imágenes, CSS, JS y bibliotecas (jQuery y Bootstrap locales) + URL
  publicada (GitHub Pages).

## Decisiones
| # | Fecha | Decisión |
|---|---|---|
| D1 | 2026-10-14 | Diseño completamente nuevo, sin la marca ConApp ni Conaltura |
| D2 | 2026-10-14 | Contenido real de JD, sin datos internos de Conaltura |
| D3 | 2026-10-14 | GitHub Pages con una cuenta académica |
| D4 | 2026-10-14 | Alcance extra: modo claro y oscuro, formulario de contacto, movimiento llamativo |
| D5 | 2026-10-14 | Referentes del Atlas: 067 ascii-tides (A) y flyingpapers.com (B) |
| D6 | 2026-10-14 | **Propuesta elegida: A · Terminal ASCII, pura.** Maqueta: `docs/diseno/maqueta-ab.html` (variante A) |
| D7 | 2026-10-14 | IA: LLM en el navegador (WebLLM + WebGPU) sobre un perfil público, con terminal de comandos como base. Hermes descartado (conocimiento confidencial de Conaltura y depende del PC de JD) |
| D8 | 2026-10-14 | Contacto por Formspree (cuenta creada con ffdalsu.dev@gmail.com; el identificador del formulario es público) |
| D9 | 2026-10-14 | Entrega en más de 2 semanas, con el refinamiento. La F7 es el punto de entrega seguro |
| D10 | 2026-10-14 | Inicio = **mascota guía «bit» + océano ASCII**: bit flota sobre el campo de ondas, sigue el cursor, se duerme y guía; habilidades = criaturas, proyectos = islas. En la F15 bit es la voz de la IA |
| D11 | 2026-10-14 | `index.html` conserva «Sobre mí» (corta) y «Habilidades», contadas por el ecosistema; `sobre-mi.html` tiene la versión completa. Cada página trata solo su tema |
| D12 | 2026-10-14 | Videos 16:9 de 30-45 s hechos por Claude con código (escenas ASCII grabadas con Playwright + ffmpeg); JD los sube a YouTube como no listados |
| D13 | 2026-10-14 | Proyectos reales: Hermes / base de conocimiento, Sistema de facturación, Herramienta de Indicadores, Vigía / automatizaciones (+ Tammamon cuando JD diga qué es), descritos sin datos internos |
| D14 | 2026-10-14 | Repo `<usuario>.github.io` → URL en la raíz |
| D15 | 2026-10-14 | Sin `gh auth login` (rompería la sesión de la empresa que usa el otro agente). Push por SSH con el alias `github-academico`; PR con un token fine-grained de solo este repo, usado como `GH_TOKEN` por comando, nunca impreso |
| D16 | 2026-10-14 | Formulario de contacto en un modal que abre `[ escríbeme ]` en el pie de todas las páginas |
| D17 | 2026-10-14 | Tamamon (`C:\Tamamon`) es un port de una app de terceros sin licencia conocida: no se publica; solo inspira a bit (una mascota que reacciona a lo que haces) |
| D18 | 2026-10-14 | Estructura híbrida: el inicio es una landing de un solo recorrido (océano con bit → quién soy → habilidades → proyectos destacados → contacto); Sobre mí y Proyectos son páginas de detalle |
| D19 | 2026-10-14 | Bit es el **bot en barquito** `[o_o]` (opciones en `docs/diseno/bit-opciones.html`) |
| D20 | 2026-10-14 | **Inmersión** en el inicio: el océano queda fijo detrás de la página y el scroll baja la cámara; cada sección va sobre una lámina opaca |
| D21 | 2026-10-14 | Datos de muestra (fechas y textos «dummy») en Sobre mí: es un proyecto universitario. Se mantienen los 4 CS50 reales y los 3 certificados profesionales de HarvardX que otorgan (Python, Databases using SQL, Artificial Intelligence). **Las fechas se reemplazaron por las reales en D41** |
| D22 | 2026-10-14 | Al implementar no se recorta la maqueta aprobada: la onda con «@», el panel ψ con contadores, la ficha, el árbol con *scramble* y el reloj del pie se restauraron; proyectos (F5) y formulario estilo terminal (F6) siguen la maqueta |
| D23 | 2026-10-14 | Los títulos (`.titulo-grande`, `.titulo`) se arman desde estática ASCII al entrar en pantalla, como las habilidades; en los videos el título del proyecto hace lo mismo |
| D24 | 2026-10-15 | Sonido **apagado por defecto**; se activa con un clic y se recuerda la elección de cada visitante |
| D25 | 2026-10-15 | Un control con tres posiciones en el encabezado: `┤ sonido ├ silencio · efectos · + música` |
| D26 | 2026-10-15 | Música: experimento con 3 variantes (océano lo-fi, chiptune enérgico, generativa desde ψ); JD elige oyéndolas en la F10 |
| D27 | 2026-10-15 | Los videos llevan música + efectos sincronizados; se regraban antes de subirlos |
| D28 | 2026-10-15 | Todo el sonido se sintetiza con Web Audio (sin archivos ni licencias); el mismo sintetizador sirve en vivo y offline para los videos |
| D29 | 2026-10-15 | **Portada en tres actos** (cielo con el nombre a pantalla completa → horizonte con bit e islas → el mar con el contenido), como en `docs/diseno/portada.html`; va antes del sonido |
| D30 | 2026-10-15 | Efectos aprobados por JD en el tablero (`docs/diseno/sonidos.html`). El control queda `┤ ♪ ├ no · efectos · + música` junto a `┤ ◐ ├ ámbar · papel` en una sola caja. Los CSS y JS propios llevan `?v=<commit>` (versionado en el flujo de Pages) para que la caché no mezcle versiones |
| D31 | 2026-10-15 | Música elegida por JD tras oír las 3 variantes y 3 prototipos de banda sonora: **el sitio usa la generativa desde ψ** y **los videos el chiptune enérgico**. Se cambia con una sola constante, `MUSICA_DEL_SITIO` en `js/sonido/sonido.js` (opciones: 'generativa', 'oceano', 'chiptune'), sin control visible |
| D32 | 2026-10-15 | El sonido no debe cortarse al cambiar de página. Ahora (A): al cargar se intenta sonar de inmediato (Chrome y Edge lo permiten al llegar por un enlace del sitio); si el navegador lo bloquea, aviso y el primer gesto lo arranca. Después (B): fase «Navegación sin recargar» antes de la terminal, para que la música nunca se corte en ningún navegador y llegue la transición entre páginas |
| D33 | 2026-10-15 | Celular: menú lateral (offcanvas de Bootstrap por la derecha, abierto con jQuery) con páginas, contacto, tema y sonido; corte en 768 px; escritorio sin cambios. Se declara `color-scheme: light dark` para que Chrome Android no oscurezca el tema papel |
| D34 | 2026-10-15 | **F15 descartada (no-go).** En el PC de JD ningún modelo en el navegador cumple: Qwen2.5-1.5B 5,9 tok/s y 7/10 a mano; Llama-3.2-1B 3/10; Gemma 4 E2B demasiado pesado (~3,4 GB). La entrega va sin IA. A futuro, si se retoma: un modelo en servidor (Worker de Cloudflare con Workers AI y límite de peticiones), nunca Hermes ni las suscripciones personales de JD (D7) |
| D35 | 2026-10-15 | **F16 · v2 guiada por ghostty.org** (`docs/diseno/referentes-v2.md`, `adn-ghostty.md`, `maqueta-v2.html`). Alcance de la F17: secuencia de arranque, transición ASCII entre páginas (en celular, fundido simple si no rinde), favicon vivo, 404 ASCII, hoja de impresión como CV e imagen para compartir; más `--tenue` del tema papel a `#5A6762` (contraste AA). Fuera: atajos de teclado e índice con puntos guía |
| D36 | 2026-10-15 | **Velo en lienzo, también en celular.** Como texto del DOM, el velo obligaba a maquetar ~10 000 caracteres por cuadro. En `<canvas>`, con la CPU frenada 4×, la mediana del cuadro es 17 ms en celular (igual que el fundido de la F13) y 17 ms en escritorio (contra 33 ms del fundido). Los saltos de ~300-400 ms son del montaje de la página nueva y pasan en los dos modos. `VELO_EN_CELULAR = true` |
| D37 | 2026-10-15 | **F17b: cómo se cumple Lighthouse.** Se mide la visita normal (arranque ya visto, con umbral) y la primera visita (con arranque, que oculta la página ~2 s a propósito; sin umbral de rendimiento), mediana de 3 corridas (`npm run lighthouse`). Para pasar: Font Awesome carga sin bloquear el primer pintado y se precargan Martian Mono e IBM Plex Mono (el nombre del inicio saltaba al cambiar de fuente: CLS 0,116 → 0,007). La 404 usa `<base href="/">` en vez de rutas absolutas, y la navegación resuelve los enlaces con `document.baseURI` |
| D38 | 2026-10-15 | **Terminal a la vista (pulido, pedido de JD).** Botón `[>_]` con la pista «/» al final de la barra fija. Ajuste al medir: tema y sonido no caben en la barra por debajo de **1280 px** (no 1100 como en la propuesta); ahí pasan al menú `[≡]` y la barra queda en una fila en todos los anchos. Las etiquetas pasan a `┤◐├` y `┤♪├` y «no» a «silencio» |
| D39 | 2026-10-15 | **Hoja de vida visible.** `[ ↓ hoja de vida · pdf ]` en la ficha de Sobre mí y en Sobre mí del inicio, y el comando `cv` en la terminal. Descargan `sitio/archivos/hoja-de-vida-juan-david.pdf`, generado de la misma hoja impresa con `scripts/hoja_de_vida.py`; `test_hoja_de_vida_pdf_al_dia` avisa si se desactualiza. Ctrl+P en Sobre mí sigue funcionando y en las otras páginas ya no imprime una hoja en blanco |
| D40 | 2026-10-15 | **Hoja de vida a dos columnas** que llena el A4 (93 % medido, una página): lateral con contacto, habilidades por grupo, certificados y rumbo; principal con perfil, experiencia con logros, formación y los 5 proyectos. Títulos `┤ … ├` en el naranja del tema papel |
| D41 | 2026-10-15 | **Fechas reales (JD):** grado 2021 (Universidad Nacional), Bancolombia 2024 – 2026, CS50 2024 – 2025 con los certificados de HarvardX en 2025, Conaltura 2026 – hoy. En Mi historia, los diplomas y la hoja de vida (reemplaza las de muestra de D21) |
| D42 | 2026-10-15 | **El velo entre páginas queda en el color del texto** (JD lo prefiere así, aunque en ámbar sea un destello naranja). Se corrigen solo las rayas finas entre celdas (bordes en píxeles enteros) |
| D43 | 2026-10-15 | **GitHub visible:** `github.com/ffdalsu` en el pie, la ficha, la hoja de vida y el comando `github` de la terminal. LinkedIn sigue oculto |

## Supuestos (JD puede vetarlos)
- El repo es esta carpeta: `sitio/` (lo que se publica y se empaqueta), `videos/`, `docs/`, `pruebas/`, `scripts/`.
  `recursos/` (PDF del docente) queda fuera de git. Repo público.
- Sin paso de compilación y **scripts clásicos, sin módulos ES**, para que el zip funcione al abrirlo con doble clic
  (`file://`). Solo la IA (F15) exige http; bajo `file://` muestra su alternativa.
- Un JS por responsabilidad, comentarios en español, paleta central en `css/estilos.css` (como `EstiloVisual.cs` del
  referente WinForms).
- El canvas es decoración (`aria-hidden`); todo el contenido vive en HTML (accesible, validable y legible sin JS).
- **Scroll = inmersión:** al bajar, la cámara baja al fondo del océano. Se confirma en la revisión de bit de la F2.
- Pruebas: pytest + pytest-playwright con `uv`; validación HTML con `html-validate` fijado en `package.json`.
- Videos sin música (JD puede agregarla desde la biblioteca de audio de YouTube Studio).
- Certificados CS50 sin enlace hasta que JD pase las URL de verificación. Redes ocultas, con la estructura lista.
- Proyectos de Conaltura: descripciones genéricas y visuales con datos ficticios; JD confirma que publicarlos no
  choca con alguna política de la empresa.
- Implementa Claude; lo mecánico de la F1 puede ir al agente `ejecutor`.

## Contenido real (de JD, 2026-10-14)
- **Sobre mí:** matemático puro de la Universidad Nacional; encontró la aplicación de su carrera en la programación.
  Certificado por Harvard en CS50P, CS50 SQL, CS50 y CS50AI, más el certificado profesional en ciencias de la
  computación que Harvard emite al completar los CS50 del área. Trabajó en Bancolombia (entrenamiento de modelos
  financieros y automatizaciones). Hoy está en Conaltura, en transformación digital: automatizaciones, webs e
  innovación con IA.
- **Correo:** ffdalsu.dev@gmail.com. **Redes:** ninguna por ahora.

## Estructura (contrato desde la F1)
```
sitio/
  index.html  sobre-mi.html  projects.html  404.html (F17)
  css/estilos.css              tokens de los dos temas + componentes
  js/tema.js                   <html data-bs-theme="dark|light">, localStorage "tema"
  js/ascii/rejilla.js          rejilla de caracteres sobre canvas, por capas de color (F2)
  js/ascii/campo.js            campo de ondas ψ(x,y,t) (F2)
  js/ascii/sprite.js           dibujos ASCII de varios cuadros (F2)
  js/oceano/bit.js             mascota: máquina de estados (F2)
  js/oceano/escena.js          océano fijo, cámara de inmersión y sonda de profundidad (F2)
  js/oceano/ecosistema.js      criaturas, islas, inmersión (F3)
  js/oceano/coreografia.js     scroll → acto, cámara y nombre de la portada (F8)
  js/oceano/cielo.js           luna o sol, estrellas, gaviotas y estrella fugaz (F8)
  js/miniaturas.js  js/proyectos.js  js/contacto.js  js/terminal.js  js/ia/ia.js
  js/sonido/sintetizador.js    notas, ruido y efectos con nombre sobre cualquier BaseAudioContext (F9)
  js/sonido/sonido.js          control del encabezado, desbloqueo con gesto, programador y registro (F9)
  js/sonido/musica.js          secuenciador de las variantes de música (F10)
  js/menu.js                   menú lateral del celular (F12)
  js/paginas.js                registro montar/desmontar de cada página (F13)
  js/navegacion.js             cambio de página sin recargar (F13)
  data/perfil.md               contenido público que usa la IA (F15)
  lib/bootstrap-5.3.3/  lib/jquery-3.7.1/  lib/fontawesome-6.5.2/  lib/fuentes/ (IBM Plex Mono, Martian Mono)
  img/
videos/escenas/<slug>.html     escenas que reutilizan sitio/js/ascii (F7); videos/salida/ queda fuera de git
pruebas/  scripts/empaquetar.py  scripts/grabar_video.py  docs/
.github/workflows/{ci.yml,pages.yml}  pyproject.toml  package.json  README.md  .gitignore  .pre-commit-config.yaml
```
Todos los módulos JS cuelgan de un solo objeto global `window.Portafolio` (por ejemplo `Portafolio.Oceano`), con un
método `estado()` que las pruebas leen.

## Fases

### F1 · Esqueleto publicado (bala trazadora)
- **Objetivo:** `https://<usuario>.github.io/` carga `index.html`, `sobre-mi.html` y `projects.html` con menú, pie y
  tema ámbar/papel que se guarda; todo sale de `lib/`.
- **Archivos:** crea la estructura de arriba (HTML con secciones vacías pero válidas), `css/estilos.css` (tokens de la
  maqueta A), `js/tema.js` (con script en línea anti-parpadeo en `<head>`), `lib/*`, `pruebas/conftest.py` (servidor
  local de `sitio/`), `pyproject.toml`, `package.json`, flujos de Actions, README, pre-commit. No toca `recursos/` ni
  `docs/diseno/`.
- **Contratos:** estructura de carpetas; `data-bs-theme` + `localStorage["tema"]`; despliegue de `sitio/` con
  `actions/upload-pages-artifact`; `git config` local del repo con la identidad académica; remoto
  `git@github-academico:<usuario>/<usuario>.github.io.git`.
- **Pruebas:** `test_paginas_responden_200[index|sobre-mi|projects]`, `test_sin_errores_de_consola`,
  `test_menu_navega_entre_las_tres`, `test_tema_alterna_y_persiste`, `test_sin_peticiones_externas`.
  Terminado = `uv run pytest -q` → todo pasa; `npm run validar` → 0 errores; CI verde; la URL responde 200.
- **Riesgos:** la llave SSH o el token mal configurados (se prueba primero `ssh -T git@github-academico`); Pages con
  Actions desde una subcarpeta; instalar los navegadores de Playwright.
- **Pasos de JD:** dar el usuario académico; agregar la llave pública que genero en Settings → SSH keys; crear el repo
  vacío y público `<usuario>.github.io`; en Settings → Pages, elegir «GitHub Actions»; crear el token fine-grained
  (solo ese repo: Contents, Pull requests y Actions) y guardarlo en el archivo que le indique.
- **Rama y PR:** `feat/portafolio-f1`. Antes del primer push se reescriben los 2 commits existentes con la identidad
  académica.
- **Quién:** Claude (copiar bibliotecas y armar el andamiaje de pruebas → `ejecutor`). **Revisión:** `ti-revisar`
  normal + `gitleaks`.

### F2 · El océano y bit
- **Objetivo:** el inicio muestra el océano ASCII con bit: flota sobre la onda, sigue el cursor (o el dedo), se duerme
  a los 8 s sin actividad y despierta al mover.
- **Archivos:** crea `js/ascii/{rejilla,campo,sprite}.js` y `js/oceano/bit.js`; modifica `index.html` y
  `css/estilos.css`. Crea `docs/diseno/bit-opciones.html` (3 diseños de bit con sus estados).
- **Contratos:** `Portafolio.Rejilla(canvas, {tamFuente})`, `Portafolio.Campo.valor(x, y, t)`,
  `Portafolio.Sprite(cuadros, ancla)`; `Portafolio.Oceano.estado()` → `{bit: {x, y, modo: "flota|sigue|duerme|habla"}}`.
  Máximo 30 cuadros por segundo; se pausa fuera de la vista; con movimiento reducido dibuja un cuadro fijo.
- **Pruebas:** `test_bit_aparece`, `test_bit_sigue_el_puntero`, `test_bit_duerme_tras_inactividad` (con
  `page.clock`), `test_bit_despierta_al_mover`, `test_movimiento_reducido_estatico`, `test_cuadro_dura_menos_de_8ms`.
- **Puerta interna:** el primer medio día van los 3 diseños de bit y la idea de la inmersión; JD elige antes de
  programar el comportamiento.
- **Riesgos:** que el diseño de bit necesite muchas vueltas (tope de 2 rondas) y el rendimiento en celulares (se mide
  en 375 px con CPU limitada).
- **Rama y PR:** `feat/portafolio-f2`. **Quién:** Claude. **Revisión:** normal.

### F3 · El ecosistema
- **Objetivo:** cada habilidad es una criatura del océano, sincronizada con la sección «Habilidades» (FontAwesome).
  Enfocar o tocar una habilidad lleva a bit hasta su criatura. Los proyectos son islas en el horizonte, que son
  enlaces reales a `projects.html#<slug>`, con nombre y una línea visibles (proyectos destacados, D18). Bit cuenta el
  «Sobre mí» corto en un globo, y el mismo texto vive en la sección HTML. El recorrido termina con un llamado a
  contacto.
- **Archivos:** crea `js/oceano/ecosistema.js`; modifica `index.html`, `js/oceano/bit.js` y `css/estilos.css`.
- **Contratos:** `data-criatura="<habilidad>"` en cada ítem de Habilidades; las islas son `<a>` posicionados sobre el
  canvas; `Portafolio.Oceano.estado().criaturas` lista las criaturas.
- **Pruebas:** `test_cada_habilidad_tiene_criatura`, `test_enfocar_habilidad_resalta_criatura`,
  `test_isla_lleva_a_su_proyecto`, `test_sobre_mi_corta_presente`, `test_habilidades_con_iconos`,
  `test_toque_movil_mueve_a_bit`, `test_sin_scroll_horizontal[375|768|1440]`.
- **Riesgos:** que con muchas criaturas el océano se sienta saturado; se limita a 8-10 criaturas, sin más de 3 a la
  vista.
- **Rama y PR:** `feat/portafolio-f3`. **Quién:** Claude. **Revisión:** normal.

### F4 · Sobre mí completa
- **Objetivo:** `sobre-mi.html` cuenta solo quién es JD: formación (U. Nacional), certificados (CS50P, CS50 SQL,
  CS50, CS50AI y el certificado profesional), experiencia (Bancolombia, Conaltura) y rumbo (IA).
- **Archivos:** modifica `sobre-mi.html` y `css/estilos.css`; crea `pruebas/test_sin_datos_internos.py` (lista de
  términos prohibidos: nombres de bases, servidores, IP y sistemas internos).
- **Contratos:** los certificados son una lista con `data-verificacion` (vacío hasta tener la URL).
- **Pruebas:** `test_sobre_mi_tiene_formacion_experiencia_certificados`, `test_sin_datos_internos`, `test_sin_scroll_horizontal`.
- **Riesgos:** el nombre exacto del certificado profesional (se pide a JD).
- **Rama y PR:** `feat/portafolio-f4`. **Independiente de F2 y F3:** puede ir en paralelo en su propio worktree.
  **Quién:** Claude. **Revisión:** reforzada en el texto (exposición pública).

### F5 · Proyectos
- **Objetivo:** `projects.html` con los 4 proyectos reales (y Tammamon si JD lo explica), cada uno con miniatura ASCII
  animada; «ver video» abre el modal con jQuery y el video suena; al cerrar se detiene.
- **Archivos:** modifica `projects.html` y `css/estilos.css`; crea `js/proyectos.js` y `js/miniaturas.js`.
- **Contratos:** cada tarjeta lleva `id="<slug>"`, `data-video-id` y `data-titulo`; `$('#modal-video').modal('show')`;
  iframe `https://www.youtube-nocookie.com/embed/<id>?autoplay=1&rel=0` con
  `referrerpolicy="strict-origin-when-cross-origin"`. Los ID son provisionales hasta la F7.
- **Pruebas:** `test_al_menos_tres_proyectos`, `test_modal_abre_con_jquery` (espía `$.fn.modal`),
  `test_modal_carga_video_correcto`, `test_cerrar_detiene_video`, `test_escape_cierra`, `test_ancla_resalta_proyecto`,
  `test_sin_datos_internos`.
- **Riesgos:** YouTube no reproduce desde `file://`; el README indica usar la URL o `python -m http.server`.
- **Rama y PR:** `feat/portafolio-f5`. **Quién:** Claude. **Revisión:** reforzada en las descripciones.

### F6 · Contacto y empaquetado
- **Objetivo:** `[ escríbeme ]` en el pie de las 3 páginas abre el modal de contacto; valida con jQuery y envía de
  verdad por Formspree. `scripts/empaquetar.py` arma el `.zip`.
- **Archivos:** modifica los 3 HTML y `css/estilos.css`; crea `js/contacto.js`, `scripts/empaquetar.py` y
  `pruebas/test_empaquetar.py`.
- **Contratos:** `POST https://formspree.io/f/<id>` con `Accept: application/json`; estados enviando, enviado y error;
  el zip tiene en su raíz `index.html`, `sobre-mi.html`, `projects.html`, `css/`, `js/`, `lib/` e `img/`.
- **Pruebas:** `test_escribeme_abre_modal_en_las_tres`, `test_errores_por_campo`, `test_envio_exitoso` y
  `test_envio_fallido_muestra_error` (red simulada con `page.route`), `test_no_envia_dos_veces`,
  `test_zip_tiene_estructura`. Terminado = suite en verde y un mensaje real recibido en ffdalsu.dev@gmail.com.
- **Riesgos:** falta el identificador del formulario de Formspree (se pide a JD).
- **Rama y PR:** `feat/portafolio-f6`. **Quién:** Claude. **Revisión:** normal.

### F7 · Videos de proyecto
- **Objetivo:** 4 videos MP4 de 16:9, 1920×1080 y 30-45 s, uno por proyecto, en el estilo ASCII del sitio. JD los
  sube como no listados y sus ID quedan en `projects.html`. Con esto la guía queda cumplida.
- **Archivos:** crea `videos/escenas/_plantilla.js` (bit presenta → problema → solución → stack → cierre),
  `videos/escena.html?proyecto=<slug>` (una sola escena parametrizada que reutiliza `sitio/js/ascii/*` y las escenas de las miniaturas), `scripts/grabar_video.py` (avanza el tiempo cuadro a
  cuadro, captura el canvas y codifica con ffmpeg en H.264 yuv420p a 30 cps) y `pruebas/test_videos.py`; modifica
  `projects.html` (ID reales).
- **Contratos:** cada escena expone `render(t)` y `duracion`; la salida va a `videos/salida/<slug>.mp4`.
- **Pruebas:** `test_escena_renderiza_cuadro[<slug>]`, `test_video_dura_entre_30_y_45s` y `test_video_1920x1080`
  (`ffprobe`). Terminado = 4 MP4 válidos + los 4 ID puestos + `test_modal_carga_video_correcto` con los ID reales.
- **Riesgos:** que hacer 4 escenas distintas lleve mucho tiempo. Primero un video de punta a punta (Sistema de
  facturación), después los otros 3 sobre la misma plantilla.
- **Rama y PR:** `feat/portafolio-f7`. **Depende de** F2 (motor ASCII) y F5 (contenido). **Quién:** Claude; JD sube
  los videos.

### F8 · Portada
- **Objetivo:** el inicio se recorre en tres actos como en la maqueta aprobada (`docs/diseno/portada.html`, D29).
  **Acto 1:** el nombre a pantalla completa bajo un cielo ASCII (luna con cráteres y halo, estrellas que titilan solo
  sobre el horizonte, gaviotas aleteando, estrella fugaz; en papel, sol con rayos). **Acto 2:** el nombre se encoge a
  la esquina superior izquierda, el subtítulo se desvanece, la cámara baja al horizonte, bit saluda entre las islas y
  aparece el panel ψ. **Acto 3:** se entra al mar y sigue el contenido de hoy (Sobre mí con ficha, acuario, contacto).
  En celular, el mismo recorrido compacto. Bit nunca queda tapado, el panel ψ no se desborda y hacer clic en el agua
  no selecciona texto.
- **Archivos:** crea `js/oceano/coreografia.js` (función pura scroll → estado), `js/oceano/cielo.js` (luna o sol,
  estrellas, gaviotas, estrella fugaz) y `pruebas/test_portada.py`; modifica `index.html` (`.portada` fija con el
  nombre, `.recorrido` que da la longitud del scroll, `.horizonte` como capa fija), `css/estilos.css`,
  `js/oceano/escena.js` (cámara por coreografía, clics sobre el agua fuera de `.hero`, sonda con el acto),
  `js/oceano/ecosistema.js` (islas visibles solo con el horizonte en pantalla) y adapta `pruebas/test_oceano.py` y
  `pruebas/test_ecosistema.py`. No toca `sobre-mi.html`, `projects.html` ni los videos.
- **Contratos:** `Portafolio.Coreografia(p, medidas)` → `{acto, horizonte (fila de pantalla), nombre: {x, y, escala},
  lema (opacidad), campo (opacidad)}`, con p = pantallas bajadas; en el acto 3 el mar se mueve 1:1 con el contenido.
  `Portafolio.Oceano.estado()` suma `{acto, progreso, horizonte, bit: {visible, caja}, cielo: {astro, gaviotas,
  estrellas}}`. Se conserva todo lo que ya tiene el inicio: onda con «@», puntero, voz de bit, criaturas, islas como
  enlaces HTML (fuera del foco cuando salen de pantalla), sonda, títulos que se descifran. Con «reducir movimiento» la
  portada es estática (sin desplazamientos ligados al scroll). Solo se vuelve a medir la altura cuando cambia el ancho
  (en celular la barra del navegador cambia la altura al hacer scroll).
- **Pruebas:** `test_acto1_nombre_a_pantalla_completa`, `test_cielo_luna_estrellas_gaviotas` (y sol en papel),
  `test_acto2_bit_e_islas_visibles`, `test_bit_nunca_tapado[1440x900|1280x650|1794x795|390x844]`,
  `test_nombre_se_encoge`, `test_clic_en_agua_no_selecciona_texto`, `test_panel_campo_sin_desborde`,
  `test_coreografia_continua` (la cámara no salta entre actos), `test_movimiento_reducido_portada_estatica`, y las
  pruebas actuales del océano y del ecosistema adaptadas al recorrido. Terminado = `uv run pytest` y
  `npm run validar` en verde.
- **Puerta interna:** capturas de la versión de celular (390 px) para que JD la apruebe antes del PR (tope de 2
  rondas).
- **Riesgos:** la continuidad entre la cámara cinematográfica (actos 1-2) y el scroll del contenido (acto 3) (lo cubre
  `test_coreografia_continua`); el cambio de altura del celular al hacer scroll (medir solo con cambio de ancho); si
  el celular necesita más de 2 rondas, la fase se parte en F8a (escritorio) y F8b (celular).
- **Rama y PR:** `feat/portafolio-f8` (lleva también el plan de sonido ya escrito). **Quién:** Claude.
  **Revisión:** normal.

### F9 · Sonido a: motor y efectos
- **Objetivo:** el encabezado tiene `┤ sonido ├ [■] silencio [ ] efectos [ ] + música`; en «efectos» cada acción suena
  con un efecto 8 bit sintetizado, y JD los aprobó antes en un tablero de sonidos.
- **Archivos:** crea `js/sonido/sintetizador.js`, `js/sonido/sonido.js`, `docs/diseno/sonidos.html` (tablero, se
  publica como Artifact) y `pruebas/test_sonido.py`; modifica los 3 HTML (control), `css/estilos.css`, y agrega la
  llamada al efecto en `escena.js`, `bit.js`, `ecosistema.js`, `titulos.js`, `arbol.js`, `proyectos.js`,
  `contacto.js`, `sobre-mi.js` y `tema.js`.
- **Contratos:** `Portafolio.Sintetizador(ctx, destino)` con `nota()`, `ruido()` y `efectos.<nombre>(t, datos)`,
  determinista (azar con semilla); `Portafolio.Sonido.efecto(nombre, datos)` (no hace nada en silencio);
  `localStorage["sonido"] = "silencio" | "efectos" | "todo"`; `Portafolio.Sonido.estado()` →
  `{modo, contexto, ultimos[]}`. Efectos: `blip` (clic), `tecleo` (títulos y habilidades), `bloop` (salpicar),
  `voz` (bit habla), `campana` (isla o criatura), `crt-on` / `crt-off` (modales), `sello` + `fanfarria` (diplomas),
  `error` / `exito` (formulario), `interruptor` (tema), `zz` (bit se duerme). Máximo un mismo efecto cada 60 ms.
- **Pruebas:** `test_sin_gesto_no_hay_audio`, `test_control_tres_posiciones_y_persiste`,
  `test_evento_dispara_su_efecto[clic|salpicar|modal|error|tema|bit]`, `test_silencio_no_programa_nada`,
  `test_sintetizador_offline_determinista_y_audible`.
- **Puerta interna:** primero el tablero `docs/diseno/sonidos.html` con un botón por efecto; JD los oye y aprueba
  (tope de 2 rondas) antes de cablearlos.
- **Riesgos:** el Chromium sin pantalla del CI podría no crear `AudioContext` (es lo primero que se prueba; el
  respaldo es `OfflineAudioContext`); que los efectos cansen (volumen conservador y sin sonido al solo pasar el
  puntero, salvo en islas y criaturas).
- **Rama y PR:** `feat/portafolio-f9`. **Depende de** F8 (los sonidos se diseñan sobre la portada final). **Quién:** Claude. **Revisión:** normal.

### F10 · Sonido b: música
- **Objetivo:** en «+ música» suena la variante que JD eligió entre tres (océano lo-fi, chiptune enérgico, generativa
  desde ψ); se pausa con la pestaña oculta y en la inmersión se apaga como bajo el agua.
- **Archivos:** crea `js/sonido/musica.js`; amplía `docs/diseno/sonidos.html` con las 3 variantes; modifica
  `js/sonido/sonido.js` y `js/oceano/escena.js` (profundidad → filtro).
- **Contratos:** `Portafolio.Musica.programar(sint, desde, hasta, {variante, profundidad})` programa las notas de una
  ventana de tiempo (sirve en vivo, con anticipación de 100 ms, y offline para los videos); `estado()` suma
  `{musica, variante, corte}`.
- **Pruebas:** `test_musica_solo_en_todo`, `test_musica_se_pausa_con_pestana_oculta`,
  `test_profundidad_cierra_el_filtro`, `test_musica_offline_audible[variante]`.
- **Puerta interna:** las 3 variantes en el tablero; JD elige una (D26) antes de dejarla fija.
- **Riesgos:** que ninguna variante convenza a la primera (tope de 2 rondas; se ajustan tempo, escala e instrumentos).
- **Rama y PR:** `feat/portafolio-f10`. **Depende de** F9. **Quién:** Claude. **Revisión:** normal.

### F11 · Sonido c: videos con sonido (punto de entrega seguro)
- **Objetivo:** los 5 videos tienen la música elegida y efectos sincronizados con la imagen; JD los sube como no
  listados, pasa los ID y quedan en `projects.html`. Con esto la guía queda cumplida.
- **Archivos:** modifica `videos/escena.html` (lista de señales de audio derivada de los mismos tiempos de la
  plantilla y `VIDEO.audio()` → WAV), `scripts/grabar_video.py` (une imagen + WAV con ffmpeg, AAC 192 kbps) y
  `pruebas/test_videos.py`; luego `projects.html` con los ID reales.
- **Contratos:** `VIDEO.audio()` renderiza 40 s con `OfflineAudioContext` (44,1 kHz, estéreo) y devuelve el WAV en
  base64; los efectos caen en los mismos segundos que su imagen (teclas al escribir, `✗`, `✓`, cajas, voz de bit,
  cortinas, jingle).
- **Pruebas:** `test_audio_del_video_determinista`, `test_video_grabado_tiene_audio[slug]` (`ffprobe`: AAC, 44,1 kHz,
  40 s ± 0,2; `volumedetect` > −40 dB) y las de formato de la F7.
- **Riesgos:** desfase entre imagen y sonido (las señales salen de las mismas constantes de tiempo; una prueba compara
  ambos); el tamaño de los MP4 (AAC 192 kbps suma cerca de 1 MB por video).
- **Rama y PR:** `feat/portafolio-f11`. **Depende de** F10. **Quién:** Claude; JD sube los videos.

### F12 · Celular
- **Objetivo:** en celular (< 768 px) el encabezado es una línea con `juan-david:~/` y `[≡]`, que abre un menú lateral
  (offcanvas de Bootstrap por la derecha, abierto con jQuery, estilo terminal) con las páginas, `[ escríbeme ]`, el
  tema y el sonido; en escritorio todo queda igual. Se corrigen los bugs del barrido: luna o sol recortados, rectángulo
  alrededor de bit y de las criaturas, modo claro oscurecido por Chrome Android, etiquetas de criaturas cortadas, globo
  de bit sobre las islas, texto cortado en los hitos y el texto del acuario que solo habla de puntero.
- **Archivos:** modifica los 3 HTML (botón `[≡]`, `#menu-movil` con los controles duplicados, `<meta name="color-scheme"
  content="light dark">` y `<meta name="theme-color">`), `css/estilos.css`, `js/tema.js` (color de la barra del
  navegador), `js/ascii/rejilla.js` (borrado por silueta), `js/oceano/cielo.js` (margen superior y borde derecho),
  `js/oceano/escena.js` (globo bajo el agua en pantallas angostas), `js/oceano/ecosistema.js` (etiquetas dentro),
  `js/sobre-mi.js` (textos que caben); crea `js/menu.js` y `pruebas/test_movil.py`.
- **Contratos:** `Portafolio.Rejilla.dibujo(..., borrar: 'silueta')` borra por fila solo entre el primer y el último
  carácter visible; `Portafolio.Cielo.dibujar(..., margenSuperior)` y `Cielo.estado().caja` (px); `Ecosistema.estado()`
  con las cajas de las etiquetas; `Oceano.estado().globo` (px). El menú se abre con `$('#menu-movil').offcanvas('show')`.
  Los botones de tema y sonido existen dos veces (encabezado y menú) y se pintan juntos.
- **Pruebas:** a 390 y 360 px: `test_menu_movil_abre_con_jquery` (espía `$.fn.offcanvas`), `test_encabezado_movil_de_una_linea`
  (≤ 64 px), `test_astro_dentro_y_bajo_el_encabezado`, `test_etiquetas_de_criaturas_dentro`, `test_globo_no_tapa_islas`,
  `test_hitos_sin_texto_cortado`, `test_controles_duplicados_sincronizados`; además `test_escritorio_sin_cambios` (1440),
  `test_borrado_solo_la_silueta`, `test_color_scheme_declarado` (y `theme-color` por tema).
- **Riesgos:** el oscurecimiento forzado de Android no se reproduce en las pruebas (JD lo confirma en su celular);
  controles duplicados desincronizados (cubierto por prueba).
- **Rama y PR:** `feat/portafolio-f12`. **Quién:** Claude. **Revisión:** normal.

### F13 · Navegación sin recargar (D32-B)
- **Objetivo:** pasar entre Inicio, Sobre mí y Proyectos (menú, menú lateral, islas, pie) no recarga la página: la
  música y los efectos no se cortan en ningún navegador, y el cambio lleva una transición ASCII (View Transitions).
  Atrás y Adelante funcionan; el foco va al título de la página nueva; desde `file://` o sin JS se navega normal.
- **Archivos:** crea `js/navegacion.js` y `pruebas/test_navegacion.py`; los 3 HTML cargan todos los scripts y marcan
  `<main data-pagina="inicio|sobre-mi|proyectos">`; adapta a `montar(raiz)` / `desmontar()` los módulos con estado:
  `oceano/escena.js`, `oceano/ecosistema.js`, `sobre-mi.js`, `miniaturas.js`, `proyectos.js`, `titulos.js`,
  `arbol.js`, `contacto.js`, `tema.js`, `menu.js` y los controles de `sonido.js` (el audio en sí no se desmonta).
- **Contratos:** `Portafolio.Paginas.registrar(nombre, { montar, desmontar })`; el enrutador intercepta los enlaces del
  mismo origen a las 3 páginas, baja el HTML, reemplaza el contenido del `<body>` (sin los `<script>`), copia la clase
  del `<body>` y el `<title>`, hace `history.pushState`, llama a desmontar y montar, y respeta `#ancla`. Ante cualquier
  error, navegación normal.
- **Pruebas:** `test_navegar_no_recarga` (una marca en `window` sobrevive), `test_musica_sigue_al_cambiar_de_pagina`,
  `test_atras_y_adelante`, `test_isla_llega_al_proyecto` (ancla y resaltado), `test_cada_pagina_se_monta_y_desmonta`
  (tras 5 cambios hay una sola escena y un solo bucle), `test_foco_va_al_titulo`, `test_file_navega_normal`, y la suite
  completa en verde.
- **Riesgos:** fugas al desmontar (bucles de animación o intervalos duplicados → lentitud), cubiertas por la prueba de
  instancias; si pasa de 2 días se parte en F13a (enrutador e inicio) y F13b (Sobre mí y Proyectos).
- **Rama y PR:** `feat/portafolio-f13`. **Depende de** F12. **Quién:** Claude. **Revisión:** normal.

### F14 · Terminal interactiva
- **Objetivo:** `/` o `[>_]` abre una terminal superpuesta: `help`, `whoami`, `ls`, `cat <archivo>`,
  `open <proyecto>`, `tema [ambar|papel]`, `contacto`, `clear`; Tab autocompleta y las flechas recorren el historial.
- **Archivos:** crea `js/terminal.js`; modifica los 3 HTML y `css/estilos.css`.
- **Contratos:** `Portafolio.Terminal.registrar(nombre, ayuda, fn)`; `open` reutiliza el modal de la F5 y `contacto`
  el de la F6.
- **Pruebas:** `test_abre_con_barra`, `test_no_abre_si_hay_un_campo_enfocado`, `test_help_lista_comandos`,
  `test_open_abre_modal`, `test_contacto_abre_formulario`, `test_tab_autocompleta`, `test_historial_flechas`,
  `test_comando_desconocido_sugiere`, `test_tema_desde_terminal`, `test_esc_cierra_y_devuelve_foco`.
- **Riesgos:** choque de atajos con los campos de texto (cubierto por una prueba).
- **Rama y PR:** `feat/portafolio-f14`. **Depende de** F13 (la terminal navega sin recargar). **Quién:** Claude. **Revisión:** normal.

### F15 · IA en el navegador (bit es la voz) — DESCARTADA (D34)
- **Objetivo:** `pregunta <texto>` en la terminal, o hablarle a bit en el inicio, responde sobre el perfil público de
  JD con un LLM que corre en el navegador. «Modo por dentro» muestra las 5 alternativas más probables de cada token
  como barras ASCII. Sin WebGPU, o bajo `file://`, aparece una alternativa honesta.
- **Archivos:** crea `js/ia/ia.js`, `data/perfil.md`, `lib/web-llm-<versión>/` y `docs/ia-evals.md`; modifica
  `js/terminal.js` y `js/oceano/bit.js`.
- **Contratos:** `Portafolio.IA.disponible()`, `.cargar(onProgreso)`, `.preguntar(texto, onToken)`; el perfil
  completo va en el prompt de sistema (no hace falta RAG). La descarga solo empieza con el consentimiento del visitante
  e indica el tamaño. WebLLM se carga con `import()` dinámico solo cuando se usa (así el resto sigue en scripts
  clásicos).
- **Pruebas:** **spike con go/no-go primero**, en el PC de JD con Chrome: primer token < 5 s después de cargar,
  ≥ 10 tokens/s y 8 de 10 preguntas de `docs/ia-evals.md` correctas (compara Qwen2.5-1.5B y Llama-3.2-1B).
  Automáticas: `test_sin_webgpu_muestra_alternativa`, `test_pide_permiso_antes_de_descargar`,
  `test_perfil_sin_datos_internos`, `test_prompt_incluye_perfil`.
- **Riesgos:** un modelo flojo en español o lento. Si da no-go, se para y se vuelve a `ti-plan` (plan B: Worker de
  Cloudflare con Workers AI).
- **Rama y PR:** `feat/portafolio-f15`. **Depende de** F14. **Quién:** Claude. **Revisión:** reforzada en `perfil.md`.

### F16 · Refinamiento a: referentes y maqueta v2
- **Objetivo:** JD elige los detalles de la v2 a partir de 5 referentes terminal/ASCII/generativos (Atlas + externos),
  con su ADN y una maqueta de detalles.
- **Archivos:** `docs/diseno/referentes-v2.md`, `docs/diseno/adn-*.md`, `docs/diseno/maqueta-v2.html`. Los
  referentes nuevos aprobados van al Atlas con `ti-referente`.
- **Contratos:** la lista de detalles aprobados es el alcance de la F17.
- **Pruebas:** cierre liviano con capturas en 375, 768 y 1440 px, claro y oscuro.
- **Riesgos:** que el alcance crezca sin fin; tope de 2 rondas.
- **Rama y PR:** `docs/diseno-v2`. Puede ir en paralelo desde la F3. **Quién:** Claude con `ti-web-ui`.

### F17a · Arranque, transición ASCII y favicon vivo
- **Objetivo:** la primera visita de la sesión (a cualquiera de las páginas) abre con la secuencia de arranque: cuatro
  líneas de sistema y bit con volumen que se revela, saluda y parpadea (~2 s; Esc, clic o cualquier tecla la saltan;
  sin destello del contenido debajo). Al navegar entre páginas, la pantalla se llena de caracteres y se vacía
  (~450 ms). La pestaña muestra a bit, que parpadea, mueve olas si suena la música y se duerme con la pestaña oculta.
  Referencia: `docs/diseno/maqueta-v2.html` (D35).
- **Archivos:** crea `js/ascii/bit-grande.js` (la escena sombreada de la maqueta, 96 × 44, sin DOM), `js/arranque.js`,
  `js/velo.js`, `js/favicon.js`, `pruebas/test_arranque.py`, `pruebas/test_velo.py` y `pruebas/test_favicon.py`.
  Modifica los 3 HTML (script en línea del `<head>`: clase `arrancando` antes de pintar; cargan los 4 scripts nuevos),
  `css/estilos.css` (capa del arranque y del velo; se quita la transición CSS de la F13 salvo como respaldo),
  `js/navegacion.js` (usa el velo y conserva los nodos `[data-permanente]` al cambiar el `<body>`),
  `js/sonido/sonido.js` (el arranque automático del audio espera a `portafolio:arranque-fin`) y `pruebas/conftest.py`
  (marca el arranque como visto en todas las pruebas, salvo en `test_arranque.py`). No toca el océano ni el bit
  pequeño del sitio.
- **Contratos:**
  - `Portafolio.BitGrande = { COLS, FILAS, RAMPA, escena(t, {parpadeo, saludo}) → {chars, capas}, html(escena, filtro) }`.
    Es una función pura; la reutiliza la F17b para la imagen para compartir.
  - El arranque se muestra si `sessionStorage['arranque'] !== 'visto'`. El script del `<head>` pone
    `html.arrancando` (CSS oculta todo lo demás) y un seguro que la quita a los 4 s si `arranque.js` no carga. Al
    terminar o saltarse: guarda «visto», quita la clase y emite `document` → `portafolio:arranque-fin`. Mientras está
    activo, las teclas no llegan a la terminal. Con «reducir movimiento»: cuadro final quieto ~1 s, sin animación.
    `Portafolio.Arranque.estado() → {activo, fase: 'log'|'revela'|'saluda'|'sale'|'fin', saltado}`.
  - `Portafolio.Velo.cubrir() → Promise` (220 ms) y `.descubrir() → Promise` (230 ms). Es un `<pre class="velo"
    data-permanente>` fijo a pantalla completa; la celda se mide tras `document.fonts.ready`. `navegar()` hace: bajar
    el HTML → cubrir → aplicar → descubrir; el velo nunca se vacía antes de tener la página nueva.
    `Portafolio.Velo.estado() → {fase: 'quieto'|'cubre'|'lleno'|'descubre', usos, modo: 'velo'|'fundido'}`.
    En celular (`pointer: coarse` o ≤ 768 px) se mide con la CPU frenada 4×: si el cuadro medio pasa de 16 ms,
    `modo = 'fundido'` (la transición de la F13) y queda escrito como decisión.
  - `Portafolio.Favicon.estado() → {cara: 'abierto'|'parpadeo'|'duerme', olas, cuadros}`. Lienzo de 64 px →
    `link[rel=icon]` con PNG; `favicon.svg` queda de respaldo. 2-4 cambios por segundo; olas solo si
    `Portafolio.Sonido.estado().musica`; con «reducir movimiento», quieto. Es de toda la visita (no se desmonta).
- **Pruebas** (`pruebas/test_arranque.py`, `test_velo.py`, `test_favicon.py`):
  - Arranque: `test_arranque_aparece_en_la_primera_visita`, `test_arranque_una_vez_por_sesion`,
    `test_arranque_se_salta_con_esc_clic_o_tecla`, `test_sin_destello_del_contenido`, `test_seguro_si_no_carga_el_script`,
    `test_teclas_no_llegan_a_la_terminal`, `test_musica_espera_al_arranque`, `test_movimiento_reducido_cuadro_quieto` y
    `test_bit_grande_cabe_en_390_y_1440` (sin desborde).
  - Velo: `test_velo_cubre_y_descubre`, `test_velo_no_queda_puesto` (tras 5 navegaciones), `test_velo_sobre_modal_terminal_y_menu`,
    `test_velo_movimiento_reducido_sin_velo` y `test_velo_modo_en_celular`.
  - Favicon: `test_favicon_es_png_de_bit`, `test_favicon_parpadea` (`page.clock`), `test_favicon_olas_con_musica` y
    `test_favicon_duerme_con_pestana_oculta`.
  - Terminado = `uv run pytest` y `npm run validar` → 0 fallos y 0 errores, incluidas todas las de la F13.
- **Riesgos:**
  - El arranque tapa los clics de las pruebas existentes: la marca de `conftest.py` va primero.
  - El velo puede quedar debajo de un modal, de la terminal o del menú lateral: hay una prueba con cada uno abierto.
  - Si las fuentes cambian, cambia la medida de las celdas: se mide después de `document.fonts.ready` y se vuelve a
    medir con `resize`.
  - Si pasa de 2 días, el favicon se pasa a la F17b.
- **Rama y PR:** `feat/portafolio-f17a`. **Depende de** F16. **Quién:** Claude. **Revisión:** normal.

### F17b · 404, CV para imprimir, imagen para compartir y contraste
- **Objetivo:** una ruta que no existe muestra la 404 ASCII (bit perdido en el océano, «404» grande y tres salidas).
  Ctrl+P en Sobre mí da el CV de la maqueta en una sola hoja A4, en negro sobre blanco. Pegar el enlace en WhatsApp o
  LinkedIn muestra la tarjeta con bit y el nombre. El texto tenue del tema papel pasa AA. Lighthouse en verde.
- **Archivos:** crea `sitio/404.html` (mismos scripts y menú que las otras páginas, con rutas absolutas `/…`),
  `js/error404.js` (mar animado, se monta solo en `main[data-pagina="404"]`), `scripts/imagen_compartir.py` y su
  plantilla `scripts/plantillas/compartir.html` (usa `sitio/js/ascii/bit-grande.js`), `sitio/img/compartir.png`,
  `pruebas/test_404.py`, `pruebas/test_impresion.py` y `pruebas/test_compartir.py`. Modifica `sobre-mi.html` (bloque
  `.cv-impresion`, oculto en pantalla), los 3 HTML (etiquetas `og:` y `twitter:`), `css/estilos.css` (`@media print`
  y `--tenue: #5A6762` en papel), `pruebas/conftest.py` (como GitHub Pages: una ruta que no existe devuelve
  `404.html` con estado 404), `pruebas/test_esqueleto.py` (404 en las pruebas por página) y `package.json`
  (`lighthouse` fijado a una versión y el script `npm run lighthouse`).
- **Contratos:**
  - 404: solo la sirve GitHub Pages; en el zip o con `file://` no aplica. `navegacion.js` la trata como una página más
    al salir de ella.
  - Etiquetas `og:` y `twitter:` con URL absolutas: `og:image = https://ffdalsu.github.io/img/compartir.png`,
    `twitter:card = summary_large_image`.
  - `uv run python scripts/imagen_compartir.py` vuelve a generar el PNG (1200 × 630). Se corre a mano si cambia el
    nombre o el rol.
  - El CV usa las fechas de muestra de D21 y lo mismo que dice Sobre mí.
- **Pruebas:**
  - 404: `test_404_responde_con_la_pagina`, `test_404_desde_ruta_anidada_carga_estilos` y `test_404_tres_salidas`.
  - CV: `test_cv_oculto_en_pantalla`, `test_cv_impresion_sin_oceano_ni_menus` (`emulate_media("print")`) y
    `test_cv_cabe_en_una_hoja` (`page.pdf` A4 → 1 página).
  - Compartir y contraste: `test_meta_og_en_las_paginas`, `test_imagen_compartir_1200x630` y `test_contraste_tenue_aa`
    (papel y ámbar, sobre `--fondo` y `--panel`).
  - Terminado = `uv run pytest`, `npm run validar` (que incluye `404.html`) y `npm run lighthouse` (escritorio, las 3
    páginas: ≥ 90 en accesibilidad, buenas prácticas y SEO; ≥ 85 en rendimiento) en verde. El informe va a
    `docs/qa/lighthouse-f17b.md`.
- **Riesgos:**
  - Cada navegador pone sus márgenes al imprimir: se prueba el PDF de Chromium y se revisa a mano en Edge.
  - Las fuentes de la imagen dependen del equipo: el PNG se genera en el PC de JD y se versiona.
  - Lighthouse puede necesitar Chrome: se le pasa el Chromium de Playwright (`CHROME_PATH`).
  - La 404 con rutas absolutas no se ve en el zip: es aceptado (D35).
- **Rama y PR:** `feat/portafolio-f17b`. **Depende de** F17a (`bit-grande.js`). **Quién:** Claude. **Revisión:**
  normal; las etiquetas `og:` en los 3 HTML son mecánicas y pueden ir al agente `ejecutor`.

### F18 · Pulido, QA y entrega
- **Objetivo:** pulido `max` y QA con veredicto SHIP; zip y URL listos para el formulario de entrega.
- **Archivos:** `docs/qa/informe-*.md`, README final y los ajustes que salgan.
- **Pruebas:** `ti-pulir` (max) → `ti-probar` → SHIP; `uv run python scripts/empaquetar.py` → zip validado; tag
  `v1.0.0` y Release.
- **Riesgos:** que falte contenido de JD; se pide desde ya.
- **Rama y PR:** `feat/portafolio-f18`. **Quién:** Claude; JD entrega el zip y la URL.
- **Pulido (`ti-pulir`, 2026-10-15):** hecho en `feat/portafolio-pulido` con crítica de dos evaluaciones aisladas, auditoría, revisión de movimiento y los pedidos de JD (D38-D43). Constancia: `docs/diseno/cierre-completo-2026-10-15.md`. **QA (`ti-probar`) solo cuando JD dé la orden.**

## Dependencias
- F1 va antes de todo.
- F2 → F3.
- F4 es independiente de F2 y F3.
- F7 necesita F2 y F5.
- F8 (portada) → F9 → F10 → F11 (sonido; la F11 necesita también la F7).
- F12 (celular) → F13 (navegación sin recargar) → F14 (terminal).
- F5 → F14. (F15 descartada, D34.)
- F16 puede ir en paralelo desde la F3.
- F17a necesita F16; F17b necesita F17a (`bit-grande.js`); F18 va después de F17b.
- F18 va al final.

## Matriz requisito → fase
| Requisito | Fase |
|---|---|
| Menú superior; pie con contacto y redes | F1 (estructura), F6 (contacto) |
| Encabezado, Sobre mí y Habilidades con FontAwesome en `index.html` | F2, F3 |
| Sobre mí completa (D11) | F4 |
| ≥ 3 proyectos + modal jQuery con YouTube | F5 |
| Videos relacionados con cada proyecto (D12) | F7, F11 (con sonido e ID reales) |
| Responsive | F3, F4, F5 (pruebas en 375, 768 y 1440) |
| Publicado en un servidor gratuito | F1 |
| Zip con la estructura pedida | F6, F18 |
| Tema claro/oscuro (D4) | F1 |
| Formulario de contacto (D8, D16) | F6 |
| Mascota y ecosistema (D10) | F2, F3, F8 (portada) |
| IA (D7, D34) | F14 (terminal); la IA queda fuera de la entrega |
| Refinamiento visual | F16, F17a, F17b, F18 |
| Sonido y música (D24-D28) | F9, F10, F11 |

## Plan de pruebas
- `uv run pytest -q`: Playwright contra un servidor local de `sitio/` (fixture en `pruebas/conftest.py`); reloj simulado
  con `page.clock` para los comportamientos de bit.
- `npm run validar`: `html-validate` sobre `sitio/*.html`, 0 errores (la rúbrica penaliza errores de validación).
- `test_sin_datos_internos` sobre todo `sitio/` desde la F4.
- CI en cada PR: las anteriores. Despliegue a Pages solo desde `main`.
- Desde la F17a, `conftest.py` marca el arranque como visto (`sessionStorage`) en todas las pruebas salvo
  `test_arranque.py`; desde la F17b, el servidor de pruebas devuelve `404.html` como GitHub Pages.
- Sonido: registro de efectos de `Portafolio.Sonido.estado()` y render con `OfflineAudioContext` (determinista y audible).
- Videos: `ffprobe` en la F7 y, desde la F11, pista AAC no silenciosa. Desde la F17b: `npm run lighthouse` (local, escritorio) antes de cada PR. Antes de entregar: `ti-probar` con veredicto SHIP.

## Relevo
- **Dónde quedamos:** QA hecha (2026-10-15) sobre `550c1b2`: **SHIP**. 8 recorridos críticos en las matrices de tema,
  ancho, movimiento reducido y teclado, 3 vueltas sin fallas; 277 pruebas en verde; sitio publicado explorado sin
  errores. Informe: `docs/qa/qa-2026-10-15.md`.
- **Pendiente de JD:** decidir si el zip usa los nombres del árbol de ejemplo de la guía (`css/styles.css`,
  `js/scripts.js`, bibliotecas en `css/` y `js/`); confirmar que mostrar los proyectos de Conaltura no choca con alguna
  política de la empresa.
- **Siguiente paso:** `ti-entregar` (versión, zip, URL y acta) cuando JD lo ordene.
