"""Fixtures comunes: un servidor HTTP local que sirve sitio/ durante las pruebas."""

import functools
import http.server
import threading
from pathlib import Path

import pytest

SITIO = Path(__file__).resolve().parent.parent / "sitio"


class _SinRegistro(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):  # silencia el log de cada petición
        pass

    def send_error(self, code, message=None, explain=None):
        """Como GitHub Pages: una ruta que no existe (también anidada) devuelve 404.html con estado 404."""
        pagina = SITIO / "404.html"
        if code != 404 or not pagina.exists():
            super().send_error(code, message, explain)
            return
        cuerpo = pagina.read_bytes()
        self.send_response(404)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(cuerpo)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(cuerpo)


@pytest.fixture(scope="session")
def base_url():
    """URL base del sitio servido desde sitio/ en un puerto libre."""
    manejador = functools.partial(_SinRegistro, directory=str(SITIO))
    servidor = http.server.ThreadingHTTPServer(("127.0.0.1", 0), manejador)
    hilo = threading.Thread(target=servidor.serve_forever, daemon=True)
    hilo.start()
    yield f"http://127.0.0.1:{servidor.server_port}"
    servidor.shutdown()


# La secuencia de arranque (F17a) tapa la página ~2 s en la primera visita de la sesión. Las pruebas la dan por vista,
# salvo test_arranque.py, que la prueba a propósito. Quien cree su propio contexto debe añadir ARRANQUE_VISTO.
ARRANQUE_VISTO = "try { sessionStorage.setItem('arranque', 'visto'); } catch (e) {}"


@pytest.fixture(autouse=True)
def _arranque_visto(request):
    if request.module.__name__.endswith("test_arranque") or "context" not in request.fixturenames:
        return
    request.getfixturevalue("context").add_init_script(ARRANQUE_VISTO)
