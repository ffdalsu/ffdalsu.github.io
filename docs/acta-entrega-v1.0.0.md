# Acta de entrega — Portafolio web (Taller Herramientas III)

| Campo | Valor |
|---|---|
| Asignatura | Herramientas de Programación III (ET0056), I.U. Pascual Bravo |
| Trabajo | Guía de trabajo práctico experimental 2: portafolio web |
| Tipo | Sitio web estático (GitHub Pages) |
| Fecha de entrega | 2026-10-15 |
| Responsable | Juan David (ffdalsu.dev@gmail.com) |
| Estado al entregar | Publicado |

## 1. Qué se entrega
- **Objetivo:** un portafolio personal con el inicio, «Sobre mí» con habilidades, y los proyectos con su video, hecho
  con HTML, CSS, Bootstrap y jQuery, adaptable a cualquier pantalla.
- **Alcance incluido:**
  - lo que pide la guía: menú, encabezado, «Sobre mí», «Habilidades» con íconos de Font Awesome, pie con contacto y
    redes, y al menos 3 proyectos con un modal abierto con jQuery que incrusta su video de YouTube;
  - lo agregado: tema claro y oscuro, formulario de contacto (Formspree), sonido 8 bit, navegación sin recargar,
    terminal interactiva, hoja de vida descargable y página 404.
- **Fuera de alcance:** el asistente con IA en el navegador se descartó porque ningún modelo cumplió en el equipo de
  prueba (decisión D34 del plan).
- **Limitación conocida:** la página 404 solo funciona en el sitio publicado. Al abrir el zip con doble clic no aplica
  (decisión D35).

## 2. Versión entregada
| Campo | Valor |
|---|---|
| Repositorio | https://github.com/ffdalsu/ffdalsu.github.io |
| Tag / versión | `v1.0.0` · Release: https://github.com/ffdalsu/ffdalsu.github.io/releases/tag/v1.0.0 |
| Commit | `1cac02c` |
| Cambios | Primera entrega; detalle en `CHANGELOG.md` |
| Versión anterior | Ninguna (primera entrega) |
| Veredicto de QA (`ti-probar`) | **SHIP** · `docs/qa/qa-2026-10-15.md` · commit probado `550c1b2` |
| Cierre de la interfaz (`ti-pulir`) | `docs/diseno/cierre-completo-2026-10-15.md`. Los dos arreglos posteriores (#23 y #24) quedaron cubiertos por el QA |
| Revisión (`ti-revisar`) | Listo: ruff limpio, 277 pruebas en verde y gitleaks sin fugas sobre `a58eaef` · PR #26 |

## 3. Dónde queda publicado
| Campo | Valor |
|---|---|
| URL | https://ffdalsu.github.io (responde 200 el 2026-10-15) |
| Hosting | GitHub Pages, desde la carpeta `sitio/` de `main` (flujo `pages`) |
| Zip de entrega | `portafolio-juan-david-20261015.zip` (52 archivos, 722 KB), adjunto a la Release |

**Estructura del zip.** Tiene las subcarpetas que pide la guía. Los nombres de archivo no son los del árbol de
ejemplo, porque la guía pide la estructura y no esos nombres (decisión de JD, 2026-10-15).

| Lo que pide la guía | Dónde está en el zip |
|---|---|
| Páginas HTML | `index.html`, `sobre-mi.html`, `projects.html` y `404.html` en la raíz |
| Imágenes | `img/` |
| CSS propio | `css/` |
| JavaScript propio | `js/` |
| Bibliotecas locales (jQuery, Bootstrap) | `lib/`, junto con Font Awesome y las fuentes |
| Otros | `archivos/` (hoja de vida en PDF) |

## 4. Configuración requerida
No hay secretos. El sitio no usa variables de entorno ni `.env`. El identificador del formulario de Formspree es
público por diseño: va en el HTML.

- [x] El zip no lleva `.env`, entornos, logs ni datos: lo comprobó `verificar_artefacto.py`.

## 5. Pruebas realizadas
| # | Prueba | Resultado | Fecha |
|---|---|---|---|
| 1 | Suite completa (`uv run pytest`) | 277 pasan | 2026-10-15 |
| 2 | Recorridos críticos e2e (`pruebas/test_qa_recorridos.py`), en tema claro y oscuro, a 390, 768 y 1440 px | 29 de 29 en 3 vueltas seguidas | 2026-10-15 |
| 3 | Sitio publicado: consola, red, 404, PDF e imagen para compartir | Sin errores | 2026-10-15 |
| 4 | CI de `main` tras la versión | En verde | 2026-10-15 |

Durante la entrega, el CI marcó una vez el aviso `compute-pressure` que Chromium anota al montar el iframe del video.
El sitio no pide esa función, así que la prueba lo excluye (PR #26).

## 6. Documentación entregada
- `README.md`: qué es, cómo correrlo y cómo armar el zip (`uv run python scripts/empaquetar.py`).
- `docs/plan.md`: requisitos, decisiones D1 a D43 y fases.
- `docs/qa/qa-2026-10-15.md`: informe de QA con capturas en `docs/qa/capturas/`.
- `CHANGELOG.md`.

## 7. Operación y pendientes
- **Publicar un cambio:** PR a `main`; el flujo `pages` publica `sitio/` solo.
- **Rehacer el zip:** `uv run python scripts/empaquetar.py` (queda en `entrega/`).
- **Pendiente de JD:** confirmar que mostrar los proyectos de Conaltura en el portafolio no choca con ninguna política
  de la empresa.
- **Para el formulario de entrega:** subir el zip de la Release y pegar la URL https://ffdalsu.github.io.

## 8. Aceptación
| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| Estudiante | Juan David | | |
| Docente | | | |
