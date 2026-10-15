"""Genera la hoja de vida en PDF (F18, D39): sitio/archivos/hoja-de-vida-juan-david.pdf, una hoja A4.

Imprime sobre-mi.html con su hoja de estilos de impresión (el bloque .cv-impresion, D40) usando el Chromium de
Playwright, así el PDF y Ctrl+P en Sobre mí dicen y muestran lo mismo. Se corre a mano cuando cambian Sobre mí o la
hoja; la prueba test_hoja_de_vida_pdf_al_dia avisa si el PDF quedó desactualizado.

Uso:
    uv run python scripts/hoja_de_vida.py
"""

import functools
import http.server
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

RAIZ = Path(__file__).resolve().parent.parent
SITIO = RAIZ / "sitio"
DESTINO = SITIO / "archivos" / "hoja-de-vida-juan-david.pdf"
# sin la secuencia de arranque y en el tema papel (la hoja impresa es negra sobre blanco en cualquier tema)
PREPARAR = "try { sessionStorage.setItem('arranque', 'visto'); localStorage.setItem('tema', 'light'); } catch (e) {}"


class _Silencioso(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def generar(destino: Path = DESTINO) -> Path:
    """Imprime Sobre mí a PDF y lo guarda en destino."""
    servidor = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(_Silencioso, directory=str(SITIO)))
    servidor.handle_error = lambda *args: None
    threading.Thread(target=servidor.serve_forever, daemon=True).start()
    destino.parent.mkdir(parents=True, exist_ok=True)
    try:
        with sync_playwright() as p:
            navegador = p.chromium.launch()
            contexto = navegador.new_context()
            contexto.add_init_script(PREPARAR)
            pagina = contexto.new_page()
            pagina.goto(f"http://127.0.0.1:{servidor.server_port}/sobre-mi.html")
            pagina.wait_for_function("document.fonts.status === 'loaded'")
            pagina.evaluate("document.title = 'Hoja de vida · Juan David'")  # el título del PDF
            pagina.pdf(path=str(destino), format="A4", prefer_css_page_size=True, print_background=True)
            navegador.close()
    finally:
        servidor.shutdown()
    return destino


def main() -> None:
    archivo = generar()
    print(f"{archivo} · {archivo.stat().st_size / 1024:.0f} KB")


if __name__ == "__main__":
    main()
