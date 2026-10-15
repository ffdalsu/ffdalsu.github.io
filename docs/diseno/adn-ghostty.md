# ADN · ghostty.org (guía de la v2, D35)

Medido con agent-browser el 2026-10-15 en 1440 × 900. Es materia prima, no se copia: los colores y las fuentes de
nuestro sitio siguen siendo papel/ámbar con Martian Mono e IBM Plex Mono (D6).

## Lo que lo hace funcionar
- **Una sola pieza protagonista:** la ventana de terminal ocupa el centro y dentro solo está el logo animado. Todo lo
  demás (una frase y dos botones) es secundario.
- **El logo es ASCII de densidad:** cada celda elige un carácter de una rampa (` ·~=+x%$@`) según el brillo. Hay dos
  capas: el cuerpo en gris claro y el halo en el color de acento. La animación son cuadros precalculados (un video
  convertido a texto), no una simulación en vivo.
- **Cromo de ventana mínimo:** barra de unos 34 px con los tres puntos (12 px) a la izquierda y el título centrado
  con un ícono pequeño.

## Medidas
| Pieza | Valor |
|---|---|
| Fondo de página y ventana | `#0F0F11` |
| Borde de la ventana | 1 px `#4C4C50`, radio 10 px, sin sombra |
| Texto ASCII | JetBrains Mono 10 px, `#C3C3C4` (cuerpo) y `#3551F3` (halo) |
| Barra de título | ~34 px; puntos de 12 px (`#FF605C` …) |
| Botón | radio 6 px, borde 1 px de acento, relleno 10 × 34 px, 16 px, peso 400, `transition: background-color .15s` |
| Texto | Pretendard 16 px blanco |

## Cómo lo traducimos
| Ghostty | Portafolio v2 |
|---|---|
| Ventana con el logo animado | Secuencia de arranque: ventana `bit — ~/portafolio` donde bit se «revela» con la rampa de densidad |
| Dos capas de color (cuerpo + halo) | Cuerpo en `--texto`, halo/olas en `--acento`; en papel y en ámbar |
| Cuadros precalculados | Cuadros generados por código al cargar (bit es pequeño: no hace falta un video) |
| Una pieza protagonista por pantalla | 404 e imagen para compartir: bit solo, centrado, con una línea de texto |
| Cromo mínimo | Se reutiliza en la imagen para compartir y en la 404 |
| Radio 10 px | **No se toma:** el sitio usa esquinas rectas (radio 0) y se mantiene |
