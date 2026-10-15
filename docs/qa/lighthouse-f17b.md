# Lighthouse · F17b

Medido el 2026-10-15 con Lighthouse (versión de `package.json`), preset de escritorio, mediana de 3 corridas por página. Puntajes de 0 a 100; LCP en segundos.
Umbrales sobre la visita normal: rendimiento ≥ 85; accesibilidad, buenas prácticas y SEO ≥ 90. Resultado: **PASA**.

## Visita normal (arranque ya visto)

| página | rendimiento | accesibilidad | buenas prácticas | SEO | rango de rendimiento | LCP |
|---|---|---|---|---|---|---|
| index.html | 91 | 100 | 100 | 100 | 90-93 | 1.5 s |
| sobre-mi.html | 93 | 100 | 100 | 100 | 92-97 | 1.3 s |
| projects.html | 95 | 100 | 100 | 100 | 94-96 | 1.2 s |

## Primera visita de la sesión (con el arranque)

| página | rendimiento | accesibilidad | buenas prácticas | SEO | rango de rendimiento | LCP |
|---|---|---|---|---|---|---|
| index.html | 91 | 100 | 100 | 100 | 90-91 | 1.7 s |
| sobre-mi.html | 88 | 100 | 100 | 100 | 87-88 | 2.0 s |
| projects.html | 89 | 100 | 100 | 100 | 87-90 | 1.8 s |

El arranque oculta la página ~2 s a propósito (D35): el elemento más grande (en el inicio, el nombre) se pinta al terminar, así que el LCP y el rendimiento bajan en la primera visita. No tiene umbral de rendimiento; accesibilidad, buenas prácticas y SEO sí deben pasar.

Auditorías que fallan: ninguna.
