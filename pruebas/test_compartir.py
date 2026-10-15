"""F17b · Imagen para compartir y contraste: la vista previa del enlace y el texto tenue legible (AA) en los dos temas."""

import struct
from pathlib import Path

import pytest
from playwright.sync_api import Page

SITIO = Path(__file__).resolve().parent.parent / "sitio"
URL = "https://ffdalsu.github.io/"
PAGINAS = {"index.html": "", "sobre-mi.html": "sobre-mi.html", "projects.html": "projects.html"}


@pytest.mark.parametrize("pagina", PAGINAS)
def test_meta_og_en_las_paginas(page: Page, base_url: str, pagina: str):
    page.goto(f"{base_url}/{pagina}")
    meta = page.evaluate(
        'Object.fromEntries([...document.querySelectorAll(\'meta[property^="og:"], meta[name^="twitter:"]\')]'
        ".map(m => [m.getAttribute('property') || m.getAttribute('name'), m.content]))"
    )
    assert meta["og:title"] == page.title()
    assert meta["og:description"] == page.locator("meta[name=description]").get_attribute("content")
    assert meta["og:url"] == URL + PAGINAS[pagina]
    assert meta["og:image"] == URL + "img/compartir.png"
    assert (meta["og:image:width"], meta["og:image:height"]) == ("1200", "630")
    assert meta["twitter:card"] == "summary_large_image"


def test_imagen_compartir_1200x630():
    png = (SITIO / "img" / "compartir.png").read_bytes()
    assert png[:8] == b"\x89PNG\r\n\x1a\n"
    ancho, alto = struct.unpack(">II", png[16:24])
    assert (ancho, alto) == (1200, 630)
    assert len(png) < 300 * 1024  # WhatsApp no muestra vistas previas muy pesadas


def _luminancia(rgb: str) -> float:
    canales = [int(c) / 255 for c in rgb[rgb.index("(") + 1 : rgb.index(")")].split(",")[:3]]
    lineal = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in canales]
    return 0.2126 * lineal[0] + 0.7152 * lineal[1] + 0.0722 * lineal[2]


@pytest.mark.parametrize("tema", ["light", "dark"])
def test_contraste_tenue_aa(page: Page, base_url: str, tema: str):
    page.goto(f"{base_url}/index.html")
    page.evaluate(f"document.documentElement.setAttribute('data-bs-theme', '{tema}')")
    colores = page.evaluate(
        "(() => { const d = document.createElement('div'); document.body.appendChild(d); const r = {};"
        " for (const t of ['tenue', 'fondo', 'panel']) { d.style.color = `var(--${t})`; r[t] = getComputedStyle(d).color; }"
        " d.remove(); return r; })()"
    )
    tenue = _luminancia(colores["tenue"])
    for fondo in ("fondo", "panel"):
        otro = _luminancia(colores[fondo])
        razon = (max(tenue, otro) + 0.05) / (min(tenue, otro) + 0.05)
        assert razon >= 4.5, (tema, fondo, round(razon, 2))
