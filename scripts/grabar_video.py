"""Graba los videos de proyecto (F7) a partir de videos/escena.html.

Abre la escena en Chromium (Playwright), avanza el tiempo cuadro a cuadro llamando a window.render(t), copia cada
cuadro del canvas como PNG y se lo pasa a ffmpeg, que codifica un MP4 H.264 (yuv420p, 1920×1080, 30 cps) listo para
subir a YouTube. Como la escena depende solo de t, cada grabación sale idéntica.

Uso:
    uv run python scripts/grabar_video.py --proyecto facturacion
    uv run python scripts/grabar_video.py --todos
Salida: videos/salida/<slug>.mp4 (fuera de git).
"""

import argparse
import base64
import functools
import http.server
import subprocess
import threading
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "videos" / "salida"
PROYECTOS = ["facturacion", "hermes", "indicadores", "automatizaciones", "portafolio"]


class _SinRegistro(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def servidor() -> tuple[http.server.ThreadingHTTPServer, str]:
    """Sirve la raíz del repo por HTTP (las fuentes no cargan desde file://)."""
    manejador = functools.partial(_SinRegistro, directory=str(RAIZ))
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), manejador)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, f"http://127.0.0.1:{srv.server_port}"


def grabar(navegador, base: str, slug: str) -> Path:
    pagina = navegador.new_page(viewport={"width": 1920, "height": 1080}, device_scale_factor=1)
    pagina.goto(f"{base}/videos/escena.html?proyecto={slug}")
    pagina.evaluate("VIDEO.listo")
    duracion, cps = pagina.evaluate("[VIDEO.duracion, VIDEO.cps]")
    total = int(duracion * cps)
    SALIDA.mkdir(parents=True, exist_ok=True)
    destino = SALIDA / f"{slug}.mp4"
    ffmpeg = subprocess.Popen(
        [
            "ffmpeg",
            "-y",
            "-loglevel",
            "error",
            "-f",
            "image2pipe",
            "-framerate",
            str(cps),
            "-i",
            "-",
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "18",
            "-pix_fmt",
            "yuv420p",
            "-movflags",
            "+faststart",
            str(destino),
        ],
        stdin=subprocess.PIPE,
    )
    inicio = time.time()
    for i in range(total):
        datos = pagina.evaluate(f"(render({i / cps}), document.getElementById('video').toDataURL('image/png'))")
        ffmpeg.stdin.write(base64.b64decode(datos.split(",", 1)[1]))
        if i % (cps * 5) == 0:
            print(f"  {slug}: {i / cps:4.0f} s de {duracion} s", flush=True)
    ffmpeg.stdin.close()
    if ffmpeg.wait() != 0:
        raise RuntimeError(f"ffmpeg falló al codificar {slug}")
    pagina.close()
    print(f"{destino} · {total} cuadros · {time.time() - inicio:.0f} s de grabación")
    return destino


def main() -> None:
    parser = argparse.ArgumentParser(description="Graba los videos ASCII de los proyectos.")
    grupo = parser.add_mutually_exclusive_group(required=True)
    grupo.add_argument("--proyecto", choices=PROYECTOS)
    grupo.add_argument("--todos", action="store_true")
    args = parser.parse_args()
    srv, base = servidor()
    try:
        with sync_playwright() as p:
            navegador = p.chromium.launch()
            for slug in PROYECTOS if args.todos else [args.proyecto]:
                grabar(navegador, base, slug)
            navegador.close()
    finally:
        srv.shutdown()


if __name__ == "__main__":
    main()
