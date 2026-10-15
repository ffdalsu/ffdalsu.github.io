"""F7 · Videos: la escena dibuja cada proyecto en cada segmento y los MP4 grabados cumplen formato y duración."""

import array
import base64
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


# ---------- F11 · videos con sonido ----------


def test_senales_caen_en_su_segmento(page: Page, raiz_url: str):
    """Cada efecto suena en el segmento donde aparece su imagen (las señales salen de las mismas constantes)."""
    page.goto(f"{raiz_url}/videos/escena.html?proyecto=hermes")
    page.evaluate("VIDEO.listo")
    s, seg = page.evaluate("[VIDEO.senales(), VIDEO.SEG]")
    por_efecto = {}
    for x in s:
        por_efecto.setdefault(x["efecto"], []).append(x["t"])
    assert all(seg["problema"] <= t < seg["solucion"] for t in por_efecto["error"])
    assert all(seg["solucion"] <= t < seg["stack"] for t in por_efecto["campana"])
    assert all(seg["stack"] <= t < seg["cierre"] for t in por_efecto["sello"])
    assert len(por_efecto["sello"]) == 4  # una caja por tecnología del stack de Hermes
    assert all(0 <= x["t"] < seg["fin"] for x in s)


def test_audio_del_video_determinista(page: Page, raiz_url: str):
    page.goto(f"{raiz_url}/videos/escena.html?proyecto=facturacion")
    page.evaluate("VIDEO.listo")
    # una pista después de la otra: dos OfflineAudioContext renderizando a la vez se pueden bloquear
    uno, dos = page.evaluate("async () => [await VIDEO.audio(6), await VIDEO.audio(6)]")
    # se comparan las muestras (no el texto base64): el redondeo del motor de audio puede mover a lo sumo 1 unidad
    # de 16 bits (−90 dB), inaudible; comparar los textos completos haría que pytest arme un diff de megas
    a = array.array("h", base64.b64decode(uno)[44:])
    b = array.array("h", base64.b64decode(dos)[44:])
    assert len(a) == len(b) == 6 * 44100 * 2
    assert max(abs(x - y) for x, y in zip(a, b)) <= 1
    assert max(abs(x) for x in a) > 1000, "la pista quedó muda"


@pytest.mark.parametrize("slug", PROYECTOS)
def test_video_grabado_tiene_audio(slug: str):
    video = RAIZ / "videos" / "salida" / f"{slug}.mp4"
    if not video.exists() or not shutil.which("ffprobe"):
        pytest.skip("video no grabado aún (uv run python scripts/grabar_video.py --todos)")
    info = json.loads(
        subprocess.run(
            [
                "ffprobe",
                "-v",
                "error",
                "-select_streams",
                "a",
                "-show_entries",
                "stream=codec_name,sample_rate",
                "-of",
                "json",
                str(video),
            ],
            capture_output=True,
            text=True,
            check=True,
        ).stdout
    )
    assert (
        info["streams"] and info["streams"][0]["codec_name"] == "aac" and info["streams"][0]["sample_rate"] == "44100"
    )
    salida = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(video), "-af", "volumedetect", "-vn", "-f", "null", "-"],
        check=False,  # volumedetect escribe en stderr; el código de salida no importa aquí
        capture_output=True,
        text=True,
    ).stderr
    media = float(salida.split("mean_volume:")[1].split("dB")[0])
    assert media > -30, f"{slug}: audio demasiado bajo ({media} dB)"
