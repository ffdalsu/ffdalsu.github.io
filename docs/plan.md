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
| D10 | 2026-10-14 | Inicio = **mascota guía «bit» + océano ASCII**: bit flota sobre el campo de ondas, sigue el cursor, se duerme y guía; habilidades = criaturas, proyectos = islas. En la F9 bit es la voz de la IA |
| D11 | 2026-10-14 | `index.html` conserva «Sobre mí» (corta) y «Habilidades», contadas por el ecosistema; `sobre-mi.html` tiene la versión completa. Cada página trata solo su tema |
| D12 | 2026-10-14 | Videos 16:9 de 30-45 s hechos por Claude con código (escenas ASCII grabadas con Playwright + ffmpeg); JD los sube a YouTube como no listados |
| D13 | 2026-10-14 | Proyectos reales: Hermes / base de conocimiento, Sistema de facturación, Herramienta de Indicadores, Vigía / automatizaciones (+ Tammamon cuando JD diga qué es), descritos sin datos internos |
| D14 | 2026-10-14 | Repo `<usuario>.github.io` → URL en la raíz |
| D15 | 2026-10-14 | Sin `gh auth login` (rompería la sesión de la empresa que usa el otro agente). Push por SSH con el alias `github-academico`; PR con un token fine-grained de solo este repo, usado como `GH_TOKEN` por comando, nunca impreso |
| D16 | 2026-10-14 | Formulario de contacto en un modal que abre `[ escríbeme ]` en el pie de todas las páginas |

## Supuestos (JD puede vetarlos)
- El repo es esta carpeta: `sitio/` (lo que se publica y se empaqueta), `videos/`, `docs/`, `pruebas/`, `scripts/`.
  `recursos/` (PDF del docente) queda fuera de git. Repo público.
- Sin paso de compilación y **scripts clásicos, sin módulos ES**, para que el zip funcione al abrirlo con doble clic
  (`file://`). Solo la IA (F9) exige http; bajo `file://` muestra su alternativa.
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
  index.html  sobre-mi.html  projects.html  404.html (F11)
  css/estilos.css              tokens de los dos temas + componentes
  js/tema.js                   <html data-bs-theme="dark|light">, localStorage "tema"
  js/ascii/rejilla.js          rejilla de caracteres sobre canvas, por capas de color (F2)
  js/ascii/campo.js            campo de ondas ψ(x,y,t) (F2)
  js/ascii/sprite.js           dibujos ASCII de varios cuadros (F2)
  js/oceano/bit.js             mascota: máquina de estados (F2)
  js/oceano/ecosistema.js      criaturas, islas, inmersión (F3)
  js/miniaturas.js  js/proyectos.js  js/contacto.js  js/terminal.js  js/ia/ia.js
  data/perfil.md               contenido público que usa la IA (F9)
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
  enlaces reales a `projects.html#<slug>`. Bit cuenta el «Sobre mí» corto en un globo, y el mismo texto vive en la
  sección HTML.
- **Archivos:** crea `js/oceano/ecosistema.js`; modifica `index.html`, `js/oceano/bit.js` y `css/estilos.css`.
- **Contratos:** `data-criatura="<habilidad>"` en cada ítem de Habilidades; las islas son `<a>` posicionados sobre el
  canvas; `Portafolio.Oceano.estado().criaturas` lista las criaturas.
- **Pruebas:** `test_cada_habilidad_tiene_criatura`, `test_enfocar_habilidad_lleva_a_bit`,
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

### F7 · Videos de proyecto (punto de entrega seguro)
- **Objetivo:** 4 videos MP4 de 16:9, 1920×1080 y 30-45 s, uno por proyecto, en el estilo ASCII del sitio. JD los
  sube como no listados y sus ID quedan en `projects.html`. Con esto la guía queda cumplida.
- **Archivos:** crea `videos/escenas/_plantilla.js` (bit presenta → problema → solución → stack → cierre),
  `videos/escenas/<slug>.html` (reutiliza `sitio/js/ascii/*`), `scripts/grabar_video.py` (avanza el tiempo cuadro a
  cuadro, captura el canvas y codifica con ffmpeg en H.264 yuv420p a 30 cps) y `pruebas/test_videos.py`; modifica
  `projects.html` (ID reales).
- **Contratos:** cada escena expone `render(t)` y `duracion`; la salida va a `videos/salida/<slug>.mp4`.
- **Pruebas:** `test_escena_renderiza_cuadro[<slug>]`, `test_video_dura_entre_30_y_45s` y `test_video_1920x1080`
  (`ffprobe`). Terminado = 4 MP4 válidos + los 4 ID puestos + `test_modal_carga_video_correcto` con los ID reales.
- **Riesgos:** que hacer 4 escenas distintas lleve mucho tiempo. Primero un video de punta a punta (Sistema de
  facturación), después los otros 3 sobre la misma plantilla.
- **Rama y PR:** `feat/portafolio-f7`. **Depende de** F2 (motor ASCII) y F5 (contenido). **Quién:** Claude; JD sube
  los videos.

### F8 · Terminal interactiva
- **Objetivo:** `/` o `[>_]` abre una terminal superpuesta: `help`, `whoami`, `ls`, `cat <archivo>`,
  `open <proyecto>`, `tema [ambar|papel]`, `contacto`, `clear`; Tab autocompleta y las flechas recorren el historial.
- **Archivos:** crea `js/terminal.js`; modifica los 3 HTML y `css/estilos.css`.
- **Contratos:** `Portafolio.Terminal.registrar(nombre, ayuda, fn)`; `open` reutiliza el modal de la F5 y `contacto`
  el de la F6.
- **Pruebas:** `test_abre_con_barra`, `test_no_abre_si_hay_un_campo_enfocado`, `test_help_lista_comandos`,
  `test_open_abre_modal`, `test_contacto_abre_formulario`, `test_tab_autocompleta`, `test_historial_flechas`,
  `test_comando_desconocido_sugiere`, `test_tema_desde_terminal`, `test_esc_cierra_y_devuelve_foco`.
- **Riesgos:** choque de atajos con los campos de texto (cubierto por una prueba).
- **Rama y PR:** `feat/portafolio-f8`. **Quién:** Claude. **Revisión:** normal.

### F9 · IA en el navegador (bit es la voz)
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
- **Rama y PR:** `feat/portafolio-f9`. **Depende de** F8. **Quién:** Claude. **Revisión:** reforzada en `perfil.md`.

### F10 · Refinamiento a: referentes y maqueta v2
- **Objetivo:** JD elige los detalles de la v2 a partir de 5 referentes terminal/ASCII/generativos (Atlas + externos),
  con su ADN y una maqueta de detalles.
- **Archivos:** `docs/diseno/referentes-v2.md`, `docs/diseno/adn-*.md`, `docs/diseno/maqueta-v2.html`. Los
  referentes nuevos aprobados van al Atlas con `ti-referente`.
- **Contratos:** la lista de detalles aprobados es el alcance de la F11.
- **Pruebas:** cierre liviano con capturas en 375, 768 y 1440 px, claro y oscuro.
- **Riesgos:** que el alcance crezca sin fin; tope de 2 rondas.
- **Rama y PR:** `docs/diseno-v2`. Puede ir en paralelo desde la F3. **Quién:** Claude con `ti-web-ui`.

### F11 · Refinamiento b: implementación
- **Objetivo:** el sitio tiene los detalles aprobados en la F10. Candidatos: secuencia de arranque, transición ASCII
  entre páginas (View Transitions entre documentos), atajos de teclado, 404 ASCII, favicon vivo, imagen para compartir,
  hoja de impresión como CV.
- **Archivos:** según la F10.
- **Pruebas:** las de cada detalle, la suite completa en verde, y Lighthouse ≥ 90 en accesibilidad, buenas prácticas y
  SEO y ≥ 85 en rendimiento (escritorio).
- **Riesgos:** que el rendimiento baje; Lighthouse en cada PR.
- **Rama y PR:** `feat/portafolio-f11` (se parte si no cabe en 2 días). **Quién:** Claude. **Revisión:** normal.

### F12 · Pulido, QA y entrega
- **Objetivo:** pulido `max` y QA con veredicto SHIP; zip y URL listos para el formulario de entrega.
- **Archivos:** `docs/qa/informe-*.md`, README final y los ajustes que salgan.
- **Pruebas:** `ti-pulir` (max) → `ti-probar` → SHIP; `uv run python scripts/empaquetar.py` → zip validado; tag
  `v1.0.0` y Release.
- **Riesgos:** que falte contenido de JD; se pide desde ya.
- **Rama y PR:** `feat/portafolio-f12`. **Quién:** Claude; JD entrega el zip y la URL.

## Dependencias
- F1 va antes de todo.
- F2 → F3.
- F4 es independiente de F2 y F3.
- F7 necesita F2 y F5.
- F5 → F8 → F9.
- F10 puede ir en paralelo desde la F3.
- F11 necesita F9 y F10.
- F12 va al final.

## Matriz requisito → fase
| Requisito | Fase |
|---|---|
| Menú superior; pie con contacto y redes | F1 (estructura), F6 (contacto) |
| Encabezado, Sobre mí y Habilidades con FontAwesome en `index.html` | F2, F3 |
| Sobre mí completa (D11) | F4 |
| ≥ 3 proyectos + modal jQuery con YouTube | F5 |
| Videos relacionados con cada proyecto (D12) | F7 |
| Responsive | F3, F4, F5 (pruebas en 375, 768 y 1440) |
| Publicado en un servidor gratuito | F1 |
| Zip con la estructura pedida | F6, F12 |
| Tema claro/oscuro (D4) | F1 |
| Formulario de contacto (D8, D16) | F6 |
| Mascota y ecosistema (D10) | F2, F3 |
| IA (D7) | F8, F9 |
| Refinamiento visual | F10, F11, F12 |

## Plan de pruebas
- `uv run pytest -q`: Playwright contra un servidor local de `sitio/` (fixture en `pruebas/conftest.py`); reloj simulado
  con `page.clock` para los comportamientos de bit.
- `npm run validar`: `html-validate` sobre `sitio/*.html`, 0 errores (la rúbrica penaliza errores de validación).
- `test_sin_datos_internos` sobre todo `sitio/` desde la F4.
- CI en cada PR: las anteriores. Despliegue a Pages solo desde `main`.
- Videos: `ffprobe` en la F7. Desde la F11: Lighthouse en cada PR. Antes de entregar: `ti-probar` con veredicto SHIP.

## Relevo
- **Dónde quedamos:** replan aprobado (12 fases), 2026-10-14. Rama `feat/portafolio-f1` con el plan. Los 2 commits
  existentes salieron con la identidad global y se reescriben con la académica antes del primer push.
- **Pendiente de JD:** usuario de GitHub académico (bloquea la F1); qué es Tammamon; el identificador de Formspree
  (F6); el nombre exacto del certificado profesional y las URL de verificación de los CS50 (F4); confirmar que mostrar
  los proyectos de Conaltura no choca con alguna política de la empresa.
- **Siguiente paso:** F1.
