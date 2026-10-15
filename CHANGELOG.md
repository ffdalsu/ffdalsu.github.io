# Cambios

Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Versiones: [SemVer](https://semver.org/lang/es/).

## [Sin publicar]

## [1.0.0] — 2026-10-15

Primera entrega del portafolio para el Taller Herramientas III (ET0056). Publicado en https://ffdalsu.github.io.

### Agregado
- Tres páginas (Inicio, Sobre mí y Proyectos) con jQuery y Bootstrap locales, sin paso de compilación (F1-F5).
- Portada en tres actos: el océano, bit y el ecosistema de criaturas e islas (F2, F3, F8).
- Sobre mí con hitos animados, diplomas y hoja de vida descargable e imprimible (F4, F17b, F18).
- Proyectos con miniaturas ASCII, videos de proyecto generados por código y modal de video de YouTube (F5, F7, F11).
- Contacto en modal estilo terminal con Formspree y respaldo por correo (F6).
- Sonido 8 bit sintetizado, música generativa y control de sonido (F9, F10).
- Navegación sin recargar con transición, menú lateral en celular y terminal interactiva con autocompletado (F12-F14, F18).
- Arranque con velo ASCII, favicon vivo, 404 ASCII e imagen para compartir (F17a, F17b).
- `scripts/empaquetar.py`: zip de entrega con los HTML y las carpetas `css/`, `js/`, `lib/` e `img/`.

### Calidad
- Contraste AA, uso solo con teclado y «reducir movimiento»; Lighthouse local antes de cada PR.
- 277 pruebas, 29 de ellas recorridos e2e; QA con veredicto SHIP (`docs/qa/qa-2026-10-15.md`).

### Descartado
- Asistente con IA en el navegador: ningún modelo cumplió en el equipo de prueba (F15, D34).

[Sin publicar]: https://github.com/ffdalsu/ffdalsu.github.io/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/ffdalsu/ffdalsu.github.io/releases/tag/v1.0.0
