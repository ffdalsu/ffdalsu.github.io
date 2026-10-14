# Plan · Portafolio web (Taller Herramientas III)

Taller de la asignatura Herramientas de Programación III (ET0056), I.U. Pascual Bravo. Enunciado en
`recursos/GUÍA DE TRABAJO PRÁCTICO EXPERIMENTAL 2.pdf`. El trabajo queda fuera de la wiki de TI, pero sigue el ciclo de
desarrollo de TI.

## Requisitos de la guía
- `index.html`: menú superior, encabezado (título + descripción), «Sobre mí», «Habilidades» con íconos de FontAwesome,
  pie con contacto y redes.
- `projects.html`: al menos 3 proyectos (título, descripción, botón) con modal **abierto con jQuery** que incrusta un
  video de YouTube.
- HTML, CSS, Bootstrap y jQuery; diseño responsive.
- Entrega: `.zip` con los HTML y las subcarpetas de imágenes, CSS, JS y bibliotecas (jQuery y Bootstrap locales) + URL
  publicada (GitHub Pages).

## Decisiones
| # | Fecha | Decisión |
|---|---|---|
| D1 | 2026-10-14 | Diseño completamente nuevo, sin la marca ConApp ni Conaltura |
| D2 | 2026-10-14 | Contenido real de JD, sin datos internos de Conaltura |
| D3 | 2026-10-14 | GitHub Pages con una cuenta académica (JD inicia sesión cuando se pida) |
| D4 | 2026-10-14 | Alcance extra: modo claro y oscuro, formulario de contacto, movimiento llamativo |
| D5 | 2026-10-14 | Referentes del Atlas: 067 ascii-tides (A) y flyingpapers.com (B) |
| D6 | 2026-10-14 | **Propuesta elegida: A · Terminal ASCII, pura.** Maqueta: `docs/diseno/maqueta-ab.html` (variante A) |
| D7 | 2026-10-14 | IA: LLM en el navegador (WebLLM + WebGPU) sobre un perfil público, con terminal de comandos como base. Hermes descartado (conocimiento confidencial de Conaltura y depende del PC de JD) |
| D8 | 2026-10-14 | Contacto por Formspree (el identificador del formulario es público, no es secreto) |
| D9 | 2026-10-14 | Entrega en más de 2 semanas: se entrega con el refinamiento. La F4 es el punto de entrega seguro |

## Supuestos (JD puede vetarlos)
- El repo es esta carpeta: `sitio/` (lo que se publica y se empaqueta), `docs/`, `pruebas/`, `scripts/`.
  `recursos/` (PDF del docente) queda fuera de git. Repo público.
- Sin paso de compilación: lo que hay en `sitio/` es lo que corre. Un JS por responsabilidad, comentarios en español,
  paleta central en `css/estilos.css` (como `EstiloVisual.cs` del referente WinForms).
- Pruebas: pytest + pytest-playwright con `uv`; validación HTML con `html-validate` fijado en `package.json`.
- Textos y videos del borrador hasta que JD entregue los reales (obligatorios antes de la F9).
- Implementa Claude; lo mecánico de la F1 puede ir al agente `ejecutor`.

## Estructura (contrato desde la F1)
```
sitio/
  index.html  projects.html  404.html (F8)
  css/estilos.css            tokens de los dos temas + componentes
  js/tema.js                 claro/oscuro: <html data-bs-theme="dark|light">, localStorage "tema"
  js/campo.js                campo de ondas ASCII (F2)
  js/miniaturas.js           miniaturas ASCII de proyectos (F3)
  js/proyectos.js            modal de video con jQuery (F3)
  js/contacto.js             validación jQuery + Formspree (F4)
  js/terminal.js             terminal de comandos (F5)
  js/ia/                     modelo en el navegador (F6)
  data/perfil.md             contenido público que usa la IA (F6)
  lib/bootstrap-5.3.3/  lib/jquery-3.7.1/  lib/fontawesome-6.5.2/  lib/fuentes/ (IBM Plex Mono, Martian Mono)
  img/
pruebas/   scripts/empaquetar.py   docs/   .github/workflows/{ci.yml,pages.yml}
pyproject.toml  package.json  README.md  .gitignore  .pre-commit-config.yaml (gitleaks)
```

## Fases

### F1 · Esqueleto publicado (bala trazadora)
- **Objetivo:** la URL de GitHub Pages carga `index.html` y `projects.html` con menú, pie y tema ámbar/papel que se
  guarda; todas las bibliotecas y fuentes salen de `lib/`.
- **Archivos:** crea toda la estructura de arriba (HTML con secciones vacías pero válidas), `css/estilos.css` (tokens de
  la maqueta A), `js/tema.js` (con script en línea anti-parpadeo en `<head>`), `lib/*`, `pruebas/conftest.py` (servidor
  local de `sitio/`), `pyproject.toml`, `package.json`, flujos de Actions, README, `.gitignore`, pre-commit.
  No toca `recursos/` ni `docs/diseno/`.
- **Contratos:** estructura de carpetas; `data-bs-theme` + `localStorage["tema"]`; despliegue de `sitio/` con
  `actions/upload-pages-artifact`.
- **Pruebas:** `test_paginas_responden_200`, `test_sin_errores_de_consola`, `test_menu_lleva_a_proyectos_y_vuelve`,
  `test_tema_alterna_y_persiste`, `test_sin_peticiones_externas`. Terminado = `uv run pytest -q` → todo pasa;
  `npm run validar` → 0 errores; CI verde; la URL responde 200.
- **Riesgos:** login y permisos de la cuenta académica; Pages con Actions desde una subcarpeta; instalar los navegadores
  de Playwright. Se detecta pronto porque lo primero es el login y un despliegue vacío.
- **Rama y PR:** `feat/portafolio-f1`.
- **Quién:** Claude (copiar las bibliotecas y armar el andamiaje de pruebas → `ejecutor`). JD: `gh auth login` con la
  cuenta académica.
- **Revisión:** `ti-revisar` normal.

### F2 · Inicio completo
- **Objetivo:** el inicio se ve como la maqueta A: campo ASCII vivo, Sobre mí, Habilidades con FontAwesome y pie.
- **Archivos:** modifica `index.html` y `css/estilos.css`; crea `js/campo.js`.
- **Contratos:** `Campo.iniciar(canvas, opciones)`; con movimiento reducido dibuja un cuadro estático; se pausa fuera de
  la vista.
- **Pruebas:** `test_campo_dibuja`, `test_clic_agrega_fuente`, `test_movimiento_reducido_cuadro_estatico`,
  `test_sin_scroll_horizontal[375|768|1440]`, `test_habilidades_con_iconos`. Terminado = `uv run pytest -q` → todo
  pasa y `npm run validar` → 0 errores.
- **Riesgos:** rendimiento del canvas en celulares (se mide con el panel de rendimiento; se baja la densidad de
  caracteres por ancho).
- **Rama y PR:** `feat/portafolio-f2`. **Quién:** Claude. **Revisión:** normal.

### F3 · Proyectos y modales
- **Objetivo:** `projects.html` con 3 tarjetas y miniatura ASCII; «ver video» abre el modal con jQuery y el video
  suena; al cerrar se detiene.
- **Archivos:** modifica `projects.html` y `css/estilos.css`; crea `js/proyectos.js` y `js/miniaturas.js`.
- **Contratos:** cada tarjeta lleva `data-video-id` y `data-titulo`; el modal `#modal-video` se abre con
  `$('#modal-video').modal('show')`; iframe `https://www.youtube-nocookie.com/embed/<id>?autoplay=1&rel=0` con
  `referrerpolicy="strict-origin-when-cross-origin"`.
- **Pruebas:** `test_al_menos_tres_proyectos`, `test_modal_abre_con_jquery` (espía `$.fn.modal`),
  `test_modal_carga_video_correcto`, `test_cerrar_detiene_video`, `test_escape_cierra`. Terminado = suite y
  validación en verde.
- **Riesgos:** YouTube no reproduce desde `file://` (al abrir el zip con doble clic); el README indica usar la URL o
  `python -m http.server`.
- **Rama y PR:** `feat/portafolio-f3`. **Quién:** Claude. **Revisión:** normal.

### F4 · Contacto y empaquetado (punto de entrega seguro)
- **Objetivo:** el formulario valida con jQuery y envía de verdad por Formspree; `scripts/empaquetar.py` arma el
  `.zip` de entrega. Con esto la guía queda cumplida.
- **Archivos:** modifica `index.html` y `css/estilos.css`; crea `js/contacto.js`, `scripts/empaquetar.py` y
  `pruebas/test_empaquetar.py`.
- **Contratos:** `POST https://formspree.io/f/<id>` con `Accept: application/json`; estados enviando, enviado y error;
  el zip tiene en su raíz `index.html`, `projects.html`, `css/`, `js/`, `lib/` e `img/`.
- **Pruebas:** `test_errores_por_campo`, `test_envio_exitoso` y `test_envio_fallido_muestra_error` (red simulada con
  `page.route`), `test_no_envia_dos_veces`, `test_zip_tiene_estructura`. Terminado = suite en verde y un mensaje real
  recibido en el correo de JD.
- **Riesgos:** que JD no tenga todavía la cuenta de Formspree. Mientras tanto se prueba con red simulada y el
  identificador entra al final.
- **Rama y PR:** `feat/portafolio-f4`. **Quién:** Claude; JD crea el formulario en Formspree. **Revisión:** normal.

### F5 · Terminal interactiva
- **Objetivo:** con `/` o el botón `[>_]` se abre una terminal superpuesta. Comandos: `help`, `whoami`, `ls`,
  `cat <archivo>`, `open <proyecto>`, `tema [ambar|papel]`, `contacto`, `clear`. Tab autocompleta y las flechas
  recorren el historial.
- **Archivos:** crea `js/terminal.js`; modifica los dos HTML y `css/estilos.css`.
- **Contratos:** `Terminal.registrar(nombre, ayuda, fn)`; `open` reutiliza el modal de la F3.
- **Pruebas:** `test_abre_con_barra`, `test_help_lista_comandos`, `test_open_abre_modal`, `test_tab_autocompleta`,
  `test_historial_flechas`, `test_comando_desconocido_sugiere`, `test_tema_desde_terminal`, `test_esc_cierra_y_devuelve_foco`.
- **Riesgos:** choque de atajos con campos de texto (la terminal no se abre si el foco está en un input).
- **Rama y PR:** `feat/portafolio-f5`. **Quién:** Claude. **Revisión:** normal.

### F6 · IA en el navegador
- **Objetivo:** `pregunta <texto>` responde sobre el perfil público de JD con un LLM que corre en el navegador del
  visitante; «modo por dentro» muestra las 5 alternativas más probables de cada token como barras ASCII. Sin WebGPU
  aparece una alternativa honesta.
- **Archivos:** crea `js/ia/ia.js`, `data/perfil.md`, `lib/web-llm-<versión>/`, `docs/ia-evals.md`; modifica
  `js/terminal.js`.
- **Contratos:** `IA.disponible()`, `IA.cargar(onProgreso)`, `IA.preguntar(texto, onToken)`; el perfil completo va en
  el prompt de sistema (cabe en el contexto, no hace falta RAG); la descarga solo empieza con el consentimiento del
  visitante e indica el tamaño.
- **Pruebas:** **spike con go/no-go primero**, en el PC de JD con Chrome: primer token < 5 s después de cargar,
  ≥ 10 tokens/s y 8 de 10 preguntas de `docs/ia-evals.md` correctas (el spike compara Qwen2.5-1.5B y Llama-3.2-1B).
  Automáticas: `test_sin_webgpu_muestra_alternativa`, `test_pide_permiso_antes_de_descargar`,
  `test_perfil_sin_datos_internos`, `test_prompt_incluye_perfil`.
- **Riesgos:** un modelo flojo en español o lento. Si da no-go, se para y se vuelve a `ti-plan` (plan B: Worker de
  Cloudflare con Workers AI).
- **Rama y PR:** `feat/portafolio-f6`. **Quién:** Claude. **Revisión:** reforzada en `perfil.md` (que no haya datos
  internos).

### F7 · Refinamiento a: referentes y maqueta v2
- **Objetivo:** JD elige los detalles de la v2 a partir de 5 referentes terminal/ASCII/generativos (Atlas + externos),
  con su ADN y una maqueta de detalles.
- **Archivos:** `docs/diseno/referentes-v2.md`, `docs/diseno/adn-*.md`, `docs/diseno/maqueta-v2.html`. Los
  referentes nuevos aprobados van al Atlas con `ti-referente`.
- **Contratos:** la lista de detalles aprobados es el alcance de la F8.
- **Pruebas:** cierre liviano con capturas en 375, 768 y 1440 px, claro y oscuro (`docs/diseno/cierre-liviano-*.md`).
- **Riesgos:** que el alcance crezca sin fin; tope de 2 rondas.
- **Rama y PR:** `docs/diseno-v2`. **Quién:** Claude con `ti-web-ui`. Puede ir en paralelo desde la F2.

### F8 · Refinamiento b: implementación
- **Objetivo:** el sitio tiene los detalles aprobados en la F7. Candidatos: secuencia de arranque, transición ASCII
  entre páginas (View Transitions entre documentos), atajos de teclado, 404 ASCII, favicon vivo, imagen para compartir,
  hoja de impresión como CV.
- **Archivos:** según la F7; crea `404.html` si se aprueba.
- **Pruebas:** las de cada detalle (`test_404_existe`, `test_impresion_oculta_canvas`, `test_atajos`…), la suite
  completa en verde, y Lighthouse ≥ 90 en accesibilidad, buenas prácticas y SEO y ≥ 85 en rendimiento (escritorio).
- **Riesgos:** que el rendimiento baje con tanto detalle; Lighthouse en cada PR.
- **Rama y PR:** `feat/portafolio-f8` (se parte si no cabe en 2 días). **Quién:** Claude. **Revisión:** normal.

### F9 · Pulido, QA y entrega
- **Objetivo:** contenido final, pulido `max` y QA con veredicto SHIP; zip y URL listos para el formulario de entrega.
- **Archivos:** contenido de los HTML y de `perfil.md`; `docs/qa/informe-*.md`; README final.
- **Pruebas:** `ti-pulir` (max) → `ti-probar` → SHIP; `uv run python scripts/empaquetar.py` → zip validado; tag
  `v1.0.0` y Release.
- **Riesgos:** que falten los textos o los videos reales de JD (se piden desde ya).
- **Rama y PR:** `feat/portafolio-f9`. **Quién:** Claude; JD entrega el zip y la URL.

## Matriz requisito → fase
| Requisito | Fase |
|---|---|
| Menú superior, pie con contacto y redes | F1 (estructura), F9 (datos finales) |
| Encabezado, Sobre mí, Habilidades con FontAwesome | F2 |
| ≥ 3 proyectos + modal jQuery con YouTube | F3 |
| Responsive | F2, F3 (pruebas en 375, 768 y 1440) |
| Publicado en un servidor gratuito | F1 |
| Zip con la estructura pedida | F4, F9 |
| Tema claro/oscuro (D4) | F1 |
| Formulario de contacto (D4, D8) | F4 |
| Movimiento llamativo (D4) | F2, F8 |
| IA (D7) | F5, F6 |
| Refinamiento visual | F7, F8, F9 |

## Plan de pruebas
- `uv run pytest -q`: Playwright contra un servidor local de `sitio/` (fixture en `pruebas/conftest.py`).
- `npm run validar`: `html-validate` sobre `sitio/*.html`, 0 errores (la rúbrica penaliza errores de validación).
- CI en cada PR: las dos anteriores. Despliegue a Pages solo desde `main`.
- Desde la F8: Lighthouse en cada PR. Antes de entregar: `ti-probar` con veredicto SHIP.

## Relevo
- **Dónde quedamos:** plan aprobado (9 fases), 2026-10-14. Git inicializado, rama `feat/portafolio-f1` con el plan.
- **Pendiente de JD:** textos finales, los 3 videos de YouTube, el correo y las redes, la cuenta académica de GitHub
  (`gh auth login`) y la cuenta de Formspree (para la F4).
- **Siguiente paso:** F1, que arranca con el login de la cuenta académica.
