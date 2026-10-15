"""Genera la imagen para compartir del portafolio (F17b): sitio/img/compartir.png, 1200 × 630.

Fotografía con Playwright la plantilla scripts/plantillas/compartir.html (bit grande en su ventana de terminal y el
nombre). Se corre a mano cuando cambian el nombre, el rol o el dibujo de bit; el PNG queda versionado en el repo.

Uso:
    uv run python scripts/imagen_compartir.py
"""

from pathlib import Path

from playwright.sync_api import sync_playwright

RAIZ = Path(__file__).resolve().parent.parent
PLANTILLA = RAIZ / "scripts" / "plantillas" / "compartir.html"
DESTINO = RAIZ / "sitio" / "img" / "compartir.png"
ANCHO, ALTO = 1200, 630


def generar(destino: Path = DESTINO) -> Path:
    """Fotografía la plantilla y guarda el PNG en destino."""
    with sync_playwright() as p:
        navegador = p.chromium.launch()
        pagina = navegador.new_page(viewport={"width": ANCHO, "height": ALTO})
        pagina.goto(PLANTILLA.as_uri())
        pagina.wait_for_selector("body[data-listo]")
        pagina.screenshot(path=str(destino), clip={"x": 0, "y": 0, "width": ANCHO, "height": ALTO})
        navegador.close()
    return destino


def main() -> None:
    archivo = generar()
    print(f"{archivo} · {archivo.stat().st_size / 1024:.0f} KB")


if __name__ == "__main__":
    main()
