# Cierre liviano · maqueta v2 (F16) · 2026-10-15

- **Identidad:** Terminal ASCII (D6) con los tokens del sitio (papel / ámbar), Martian Mono + IBM Plex Mono, esquinas
  rectas. Del ADN de Ghostty se toman la ventana protagonista y la rampa de densidad; el radio de 10 px no.
- **Capturas:** 1440, 768 y 375 px en papel; 1440 y 375 en ámbar. Sin desbordes horizontales (scrollWidth = 375 en celular).
- **`impeccable detect`:** 15 hallazgos.
  - Contraste: `--tenue` en papel (`#66746E` sobre `#EDF0EC`) da **4,26:1**, por debajo de AA. Pasa a `#5A6762`
    (5,15:1 sobre el fondo, 4,72:1 sobre el panel). **El sitio publicado tiene el mismo problema:** se corrige en la F17.
  - Texto de 9,5 px en la hoja CV: es la vista reducida de un A4; impresa va a 10,5 pt. Aceptado.
  - «cramped-padding» en ventanas y secciones: falso positivo (la barra y el cuerpo van a sangre a propósito).
- **Anti-genéricos:** sin degradados, sin píldoras, sin sombras difusas, sin hero centrado con dos botones, datos reales
  del perfil público; la mono tiene función (es la estética terminal del sitio, D6).
