# Portafolio de Juan David

Portafolio web personal para el Taller de Herramientas de Programación III (ET0056), I.U. Pascual Bravo.
Estilo «terminal ASCII»: HTML, CSS, Bootstrap 5 y jQuery, con todas las bibliotecas en local.

## Cómo abrirlo

- **Publicado:** la URL de GitHub Pages de la cuenta académica.
- **En local:** abre `sitio/index.html` con doble clic. Para que funcionen los videos de YouTube (necesitan un
  origen http), sirve la carpeta:

  ```powershell
  python -m http.server 8000 --directory sitio
  ```

  y abre http://localhost:8000.

## Estructura

```
sitio/            lo que se publica y se entrega en el .zip
  index.html      inicio: encabezado, «Sobre mí» corta y «Habilidades»
  sobre-mi.html   formación, certificados y experiencia
  projects.html   proyectos con video
  css/estilos.css paleta y tipografías centrales (tokens de los temas papel y ámbar) + componentes
  js/             un archivo por responsabilidad (tema.js, …); todo cuelga de window.Portafolio
  lib/            Bootstrap 5.3.3, jQuery 3.7.1, Font Awesome 6.5.2 y las fuentes (IBM Plex Mono, Martian Mono)
  img/
pruebas/          pruebas con pytest + Playwright
docs/             plan por fases y diseño (maqueta aprobada)
```

No hay paso de compilación: lo que está en `sitio/` es exactamente lo que corre. Los scripts son clásicos (sin
módulos ES) para que el sitio también funcione abierto con doble clic.

## Pruebas

```powershell
uv sync
uv run playwright install chromium
uv run pytest          # comportamiento en el navegador
npm install
npm run validar        # validación HTML (html-validate)
```

GitHub Actions corre las dos en cada PR (`.github/workflows/ci.yml`) y publica `sitio/` en Pages al fusionar a
`main` (`.github/workflows/pages.yml`).

## Videos de proyecto

Los videos de los modales se generan con código, en el mismo estilo ASCII del sitio:

```powershell
uv run python scripts/grabar_video.py --todos        # o --proyecto facturacion
```

La escena está en `videos/escena.html?proyecto=<slug>` (40 s: intro, problema, solución, stack y cierre). El script
la recorre cuadro a cuadro con Playwright y la codifica con ffmpeg en `videos/salida/<slug>.mp4` (1920×1080, H.264).
Esos MP4 se suben a YouTube como «no listados» y su ID va en el `data-video-id` de cada botón de `projects.html`.

## Entrega del taller

```powershell
uv run python scripts/empaquetar.py                  # entrega/portafolio-juan-david-AAAAMMDD.zip
```
