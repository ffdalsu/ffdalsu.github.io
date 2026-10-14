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


@pytest.fixture(scope="session")
def base_url():
    """URL base del sitio servido desde sitio/ en un puerto libre."""
    manejador = functools.partial(_SinRegistro, directory=str(SITIO))
    servidor = http.server.ThreadingHTTPServer(("127.0.0.1", 0), manejador)
    hilo = threading.Thread(target=servidor.serve_forever, daemon=True)
    hilo.start()
    yield f"http://127.0.0.1:{servidor.server_port}"
    servidor.shutdown()
