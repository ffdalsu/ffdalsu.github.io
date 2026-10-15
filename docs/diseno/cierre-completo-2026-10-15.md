# Cierre completo · pulido F18 · 2026-10-15

Constancia de `ti-pulir` (modo interfaz, esfuerzo máximo).
- **Revisado:** `66c23cd` (main tras la F17b) más los cambios de la rama `feat/portafolio-pulido`.
- **Informe de crítica y auditoría:** `docs/diseno/critica-2026-10-15.md`.
- **Decisiones de JD:** D38-D43 en `docs/plan.md`.

| Paso | Resultado |
|---|---|
| 0 · Herramientas | `ajustar_skills.py --verificar` → «Skills de diseño web listas» |
| 1 · Identidad | Tokens de los dos temas en todo el CSS. Los únicos HEX en JS están justificados: el favicon, siempre en ámbar (D35), y el color de respaldo del velo. Aplica la marca propia del portafolio (D1, sin ConApp) |
| 2 · Build | Sitio estático sin build. `npm run validar` → 0 errores; `ruff check` y `ruff format` limpios. JS inicial 109 KB gzip (presupuesto 200 KB) |
| 3 · Detector | Antes: 40 hallazgos. Después de corregir: 43, todos justificados (ver abajo). Se corrigieron el texto de 11 px de los diplomas y el contraste del enlace «saltar» al pasar el puntero |
| 4 · Movimiento | `review-animations`: **aprobado**, con 2 notas de rendimiento, ya aplicadas (ver tabla). `improve-animations` no aplica: el sitio es un portafolio, no una landing ni un experimental |
| 5 · Crítica y auditoría | Dos evaluaciones aisladas (A: diseño; B: detector y navegador con overlay inyectado). Heurísticas 28/40 y auditoría 15/20, las dos «Bueno». Copia archivada en `.impeccable/critique/` (no versionada) |
| 6 · Navegador | Queda para `ti-probar`, cuando JD lo ordene |
| 7 · Corrección | Un lote con todos los P1 y P2, en una ronda, más una ronda de verificación. Luego `impeccable polish`: recorrido en 390 (papel y ámbar), 1024 y 1440 px, menú, tabulador y consola sin errores. Sin P0 ni P1 abiertos |
| 8 · Constancia | Este archivo. Verificado: `uv run pytest` → 247 pasan; `npm run lighthouse` → PASA |

## Lo que se corrigió
| Origen | Problema | Arreglo |
|---|---|---|
| JD · D38 | La terminal solo se abría desde el pie | `[>_] /` en la barra fija. Por debajo de 1280 px, tema y sonido pasan a `[≡]` y la barra queda en una fila (medido de 768 a 1440 px) |
| JD · D39 | Nadie sabía que Ctrl+P imprime la hoja de vida | `[ ↓ hoja de vida · pdf ]` en la ficha y en el inicio, y el comando `cv`. PDF generado por `scripts/hoja_de_vida.py`, con prueba de que sigue al día |
| JD · D40 | La hoja de vida usaba ~60 % del A4 | Dos columnas que llenan el 93 % de la hoja, en una sola página |
| Crítica P1 | Ctrl+P en Inicio o Proyectos imprimía una hoja en blanco | Las reglas de la hoja solo valen donde está (`:has`); en las otras páginas se imprime el contenido sin capas fijas |
| Crítica P1 | Fechas de muestra presentadas como hechos | Fechas reales de JD (D41) en Mi historia, los diplomas y la hoja |
| Crítica P1 | El foco caía en `body` al cerrar el video o el contacto | Los modales devuelven el foco a quien los abrió (`menu.js`) |
| Crítica P1 | Los lectores de pantalla leían ruido mientras el texto se revolvía | `aria-label` con el nombre real en las habilidades y en el título durante el descifrado |
| Crítica P1 | Sin forma de saltar el encabezado | Enlace «saltar al contenido» y `main#contenido` |
| Crítica P2 | La criatura de la mitad de las habilidades quedaba fuera de pantalla | Al resaltarla, nada hasta el fondo del acuario, justo encima de la lista |
| Crítica P2 | La sonda tapaba el reloj del pie y el 61 % del ancho en el celular | Se desvanece al llegar al pie y no aparece en pantallas de 640 px o menos |
| Crítica P2 | Borde de los campos a 1,65:1 (WCAG 1.4.11); errores sin marcar | Borde en `--tenue` (5:1); `aria-invalid`, `aria-describedby` y el foco va al primer campo con error |
| Auditoría P2 | Áreas táctiles de 13-21 px en el celular | Relleno con puntero grueso: todas ≥ 24 px (WCAG 2.5.8) |
| Crítica P2 | Pistas de teclado en pantallas táctiles; el registro del arranque se cortaba a 390 px | «toca para saltar»; «esc para cerrar» se oculta; renglones de 44 caracteres |
| Movimiento | El océano se dibujaba oculto bajo el arranque; el arranque se pintaba a 60 cps | Océano en pausa mientras dura el arranque; arranque a 30 cps |
| Crítica P2 | Rayas finas entre celdas del velo | Celdas con bordes en píxeles enteros (el color se mantiene, D42) |
| Crítica P3 | «$ whoami» quedaba en ~5 px en el acto 2; `help` con 14 comandos sin agrupar | Se desvanece con el lema; `help` en grupos navegar / sitio / consola |
| Otros | Anillo de foco de 1 px; «no» en el sonido; GitHub oculto | Foco de 2 px; «silencio»; GitHub visible (D43) |

## Movimiento (`review-animations`)
| Antes | Después | Por qué |
|---|---|---|
| Bucle del océano activo bajo `html.arrancando` (`escena.js`) | Se salta el dibujo mientras dura el arranque | Doble trabajo en la primera carga del inicio |
| Arranque pintando en cada `requestAnimationFrame` (`arranque.js`) | Un cuadro cada 33 ms | El revelado por pasos se ve igual y cuesta la mitad |

Se aprueban sin cambios:
- el velo (dos fases de menos de 300 ms; en cola si se navega encima);
- el favicon (pausado con la pestaña oculta);
- el mar de la 404 (8 cps);
- el vaivén «↓ baja» y el sello del diploma, que se apagan con «reducir movimiento».

## Hallazgos del detector que quedan (justificados)
- **«Padding apretado» (25):** falsos positivos. El motor estático no resuelve reglas de descendiente ni `clamp()`; las
  rejillas comparten bordes y las ventanas van a sangre a propósito. La evaluación B lo confirmó en el navegador.
- **«Interlineado apretado» (10):**
  - 3 son arte ASCII con `aria-hidden` (escudos de los diplomas).
  - 7 son una mala lectura del detector: toma el `1.5` sin unidad de la hoja impresa (`font: 9pt/1.5`) como 1,5 px.
- **«Marquesina» (4):** el «↓ baja» del inicio es un vaivén vertical de 6 px que se apaga con «reducir movimiento».
- **«Mayúsculas» (3):** el emisor de los diplomas, una etiqueta de 35 caracteres. Ahora mide 12 px.
- **«Rayas» (1):** el detector cuenta los `--` y `─` del arte ASCII; el texto no tiene rayas.

## Excepciones aceptadas
- **Menú lateral en celulares de menos de ~400 px:** «+ música» baja de renglón. Se lee bien y no hay ancho para un solo
  renglón.
- **Fuera de alcance (P3):** el CTA en la portada, la quinta tarjeta de proyectos que deja una celda vacía y el enlace
  de verificación de los diplomas.

## Lighthouse (`npm run lighthouse`, escritorio, mediana de 3)
| Visita | Rendimiento (inicio · sobre mí · proyectos) | Accesibilidad · buenas prácticas · SEO |
|---|---|---|
| Normal | 91 · 93 · 95 | 100 · 100 · 100 |
| Primera (con el arranque) | 91 · 88 · 89 | 100 · 100 · 100 |
