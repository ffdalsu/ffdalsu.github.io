"""Mide las 3 páginas con Lighthouse en escritorio y deja el informe en docs/qa/lighthouse-f17b.md (F17b).

Sirve el sitio en un puerto local, usa el Chromium de Playwright (no hace falta Chrome instalado) y corre el
Lighthouse fijado en package.json. Cada página se mide CORRIDAS veces y se toma la mediana (la red simulada hace
variar el rendimiento ±5).

Se mide dos veces el sitio:
  - visita normal: con la secuencia de arranque ya vista (lo que se ve al navegar o volver). Aquí van los umbrales.
  - primera visita: con el arranque, que oculta la página ~2 s a propósito (D35); el LCP del inicio (el nombre) se
    pinta al terminar. Se informa, sin umbral de rendimiento.
Para la visita normal se sirve una copia del sitio cuyo script del <head> no activa el arranque: el sitio no cambia.

Umbrales (docs/plan.md, F17b): accesibilidad, buenas prácticas y SEO ≥ 90; rendimiento ≥ 85.

Uso:
    npm run lighthouse          (o: uv run python scripts/lighthouse.py [--corridas N])
"""

import argparse
import datetime as dt
import functools
import http.server
import json
import os
import shutil
import statistics
import subprocess
import sys
import tempfile
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

RAIZ = Path(__file__).resolve().parent.parent
SITIO = RAIZ / "sitio"
INFORME = RAIZ / "docs" / "qa" / "lighthouse-f17b.md"
PAGINAS = ["index.html", "sobre-mi.html", "projects.html"]
CATEGORIAS = {
    "performance": "rendimiento",
    "accessibility": "accesibilidad",
    "best-practices": "buenas prácticas",
    "seo": "SEO",
}
UMBRAL = {"performance": 85, "accessibility": 90, "best-practices": 90, "seo": 90}
ACTIVA_ARRANQUE = "if (a !== 'visto') {"


class _Silencioso(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def servir(carpeta: Path) -> http.server.ThreadingHTTPServer:
    servidor = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(_Silencioso, directory=str(carpeta)))
    servidor.handle_error = lambda *args: None  # Lighthouse corta conexiones al terminar: no es un error del sitio
    threading.Thread(target=servidor.serve_forever, daemon=True).start()
    return servidor


def sin_arranque(destino: Path) -> Path:
    """Copia el sitio con el arranque desactivado en el script del <head> (para medir la visita normal)."""
    shutil.copytree(SITIO, destino)
    for pagina in PAGINAS:
        archivo = destino / pagina
        html = archivo.read_text(encoding="utf-8")
        assert ACTIVA_ARRANQUE in html, f"{pagina}: cambió el script del arranque; ajustar ACTIVA_ARRANQUE"
        archivo.write_text(html.replace(ACTIVA_ARRANQUE, "if (false) {"), encoding="utf-8")
    return destino


def medir(url: str, chrome: str, salida: Path) -> dict:
    """Corre Lighthouse sobre una URL y devuelve los puntajes (0-100), el LCP y las auditorías que fallan."""
    npx = shutil.which("npx") or "npx"
    comando = [
        npx,
        "lighthouse",
        url,
        "--preset=desktop",
        "--output=json",
        f"--output-path={salida}",
        "--quiet",
        "--only-categories=performance,accessibility,best-practices,seo",
        "--chrome-flags=--headless=new",
    ]
    subprocess.run(comando, check=True, cwd=RAIZ, env={**os.environ, "CHROME_PATH": chrome}, shell=os.name == "nt")
    datos = json.loads(salida.read_text(encoding="utf-8"))
    return {
        "puntajes": {k: round(v["score"] * 100) for k, v in datos["categories"].items()},
        "lcp": datos["audits"]["largest-contentful-paint"]["numericValue"] / 1000,
        "fallas": [
            a["title"]
            for a in datos["audits"].values()
            if a.get("score") is not None and a["score"] < 0.9 and a.get("scoreDisplayMode") == "binary"
        ],
    }


def medir_sitio(carpeta: Path, chrome: str, corridas: int, tmp: Path) -> dict:
    """Mide cada página varias veces y devuelve las medianas por página."""
    servidor = servir(carpeta)
    base = f"http://127.0.0.1:{servidor.server_port}"
    resultado = {}
    for pagina in PAGINAS:
        vueltas = [
            medir(f"{base}/{pagina}", chrome, tmp / f"{carpeta.name}-{pagina}-{i}.json") for i in range(corridas)
        ]
        resultado[pagina] = {
            "puntajes": {k: round(statistics.median(v["puntajes"][k] for v in vueltas)) for k in CATEGORIAS},
            "rango": (
                min(v["puntajes"]["performance"] for v in vueltas),
                max(v["puntajes"]["performance"] for v in vueltas),
            ),
            "lcp": statistics.median(v["lcp"] for v in vueltas),
            "fallas": sorted({f for v in vueltas for f in v["fallas"]}),
        }
    servidor.shutdown()
    return resultado


def tabla(resultado: dict) -> list[str]:
    filas = [
        "| página | " + " | ".join(CATEGORIAS.values()) + " | rango de rendimiento | LCP |",
        "|---|" + "---|" * (len(CATEGORIAS) + 2),
    ]
    for pagina, r in resultado.items():
        filas.append(
            f"| {pagina} | "
            + " | ".join(str(r["puntajes"][k]) for k in CATEGORIAS)
            + f" | {r['rango'][0]}-{r['rango'][1]} | {r['lcp']:.1f} s |"
        )
    return filas


def main() -> int:
    parser = argparse.ArgumentParser(description="Mide el sitio con Lighthouse (escritorio).")
    parser.add_argument("--corridas", type=int, default=3, help="corridas por página (se toma la mediana)")
    args = parser.parse_args()
    with sync_playwright() as p:
        chrome = p.chromium.executable_path
    with tempfile.TemporaryDirectory() as carpeta:
        tmp = Path(carpeta)
        normal = medir_sitio(sin_arranque(tmp / "normal"), chrome, args.corridas, tmp)
        primera = medir_sitio(SITIO, chrome, args.corridas, tmp)

    ok_normal = all(r["puntajes"][k] >= UMBRAL[k] for r in normal.values() for k in UMBRAL)
    ok_primera = all(r["puntajes"][k] >= UMBRAL[k] for r in primera.values() for k in UMBRAL if k != "performance")
    ok = ok_normal and ok_primera
    fallas = sorted({f for r in [*normal.values(), *primera.values()] for f in r["fallas"]})
    texto = [
        "# Lighthouse · F17b",
        "",
        (
            f"Medido el {dt.date.today():%Y-%m-%d} con Lighthouse (versión de `package.json`), preset de escritorio, "
            f"mediana de {args.corridas} corridas por página. Puntajes de 0 a 100; LCP en segundos."
        ),
        (
            f"Umbrales sobre la visita normal: rendimiento ≥ {UMBRAL['performance']}; accesibilidad, buenas prácticas"
            f" y SEO ≥ 90. Resultado: **{'PASA' if ok else 'NO PASA'}**."
        ),
        "",
        "## Visita normal (arranque ya visto)",
        "",
        *tabla(normal),
        "",
        "## Primera visita de la sesión (con el arranque)",
        "",
        *tabla(primera),
        "",
        (
            "El arranque oculta la página ~2 s a propósito (D35): el elemento más grande (en el inicio, el nombre) se pinta"
            " al terminar, así que el LCP y el rendimiento bajan en la primera visita. No tiene umbral de rendimiento;"
            " accesibilidad, buenas prácticas y SEO sí deben pasar."
        ),
        "",
        "Auditorías que fallan: " + ("; ".join(fallas) if fallas else "ninguna") + ".",
        "",
    ]
    INFORME.parent.mkdir(parents=True, exist_ok=True)
    INFORME.write_text("\n".join(texto), encoding="utf-8")
    print("\n".join(["visita normal:", *tabla(normal), "primera visita:", *tabla(primera)]))
    print(f"{'PASA' if ok else 'NO PASA'} · informe en {INFORME.relative_to(RAIZ)}")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
