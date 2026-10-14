"""F7 · Videos: la escena dibuja cada proyecto en cada segmento y los MP4 grabados cumplen formato y duración."""

import functools
import http.server
import json
import shutil
import subprocess
import threading
from pathlib import Path

import pytest
from playwright.sync_api import Page

RAIZ = Path(__file__).resolve().parent.parent
PROYECTOS = ["facturacion", "hermes", "indicadores", "automatizaciones", "portafolio"]
SEGUNDOS = [1, 3, 8, 18, 30, 38]  # un instante de cada segmento de la plantilla


class _SinRegistro(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


@pytest.fixture(scope="module")
def raiz_url():
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(_SinRegistro, directory=str(RAIZ)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    yield f"http://127.0.0.1:{srv.server_port}"
    srv.shutdown()


@pytest.mark.parametrize("slug", PROYECTOS)
def test_escena_renderiza_cada_segmento(page: Page, raiz_url: str, slug: str):
    errores = []
    page.on("pageerror", lambda e: errores.append(str(e)))
    page.set_viewport_size({"width": 1920, "height": 1080})
    page.goto(f"{raiz_url}/videos/escena.html?proyecto={slug}")
    page.evaluate("VIDEO.listo")
    assert page.evaluate("VIDEO.duracion") == 40
    for t in SEGUNDOS:
        tinta = page.evaluate(
            f"""() => {{ render({t}); const d = document.getElementById('video').getContext('2d')
                     .getImageData(0, 0, 1920, 1080).data; let n = 0;
                   for (let i = 0; i < d.length; i += 16) if (d[i] > 120) n++; return n; }}"""
        )
        assert tinta > 500, f"{slug} en {t} s casi vacío"
    assert errores == []


@pytest.mark.parametrize("slug", PROYECTOS)
def test_video_grabado_cumple_formato(slug: str):
    video = RAIZ / "videos" / "salida" / f"{slug}.mp4"
    if not video.exists() or not shutil.which("ffprobe"):
        pytest.skip("video no grabado aún (uv run python scripts/grabar_video.py --todos)")
    info = json.loads(
        subprocess.run(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "stream=width,height,codec_name,pix_fmt:format=duration",
                "-of",
                "json",
                str(video),
            ],
            capture_output=True,
            text=True,
            check=True,
        ).stdout
    )
    s = info["streams"][0]
    assert (s["width"], s["height"], s["codec_name"], s["pix_fmt"]) == (1920, 1080, "h264", "yuv420p")
    assert 30 <= float(info["format"]["duration"]) <= 45
