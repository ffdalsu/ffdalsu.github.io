"""F17b-F18 · Hoja de vida: Ctrl+P en Sobre mí y el PDF descargable dan la misma hoja A4, llena y sin océano ni menús;
imprimir otra página no sale en blanco."""

import re
from pathlib import Path

import pytest
from playwright.sync_api import Page, expect
from pypdf import PdfReader

PDF = Path(__file__).resolve().parent.parent / "sitio" / "archivos" / "hoja-de-vida-juan-david.pdf"
# A4 menos los márgenes de @page (13 mm arriba y abajo, 14 mm a los lados), en píxeles CSS (96 por pulgada)
AREA = {"width": round((210 - 28) / 25.4 * 96), "height": round((297 - 26) / 25.4 * 96)}


def paginas_pdf(datos: bytes) -> int:
    return len(re.findall(rb"/Type\s*/Page[^s]", datos))


def palabras(texto: str) -> set[str]:
    return {p for p in re.findall(r"[\wáéíóúñü#+]{3,}", texto.lower())}


def test_cv_oculto_en_pantalla(page: Page, base_url: str):
    page.goto(f"{base_url}/sobre-mi.html")
    expect(page.locator(".cv-impresion")).to_be_hidden()


def test_cv_impresion_sin_oceano_ni_menus(page: Page, base_url: str):
    page.goto(f"{base_url}/sobre-mi.html")
    page.emulate_media(media="print")
    expect(page.locator(".cv-impresion")).to_be_visible()
    expect(page.locator(".cv-nombre")).to_have_text("Juan David")
    for oculto in [".barra", ".pie", "main > section:not(.cv-impresion) >> nth=0", ".velo"]:
        expect(page.locator(oculto)).to_be_hidden()
    # negro sobre blanco aunque el visitante esté en el tema ámbar
    page.evaluate("document.documentElement.setAttribute('data-bs-theme', 'dark')")
    assert page.evaluate("getComputedStyle(document.body).backgroundColor") == "rgb(255, 255, 255)"
    assert page.evaluate("getComputedStyle(document.querySelector('.cv-impresion')).color") == "rgb(17, 17, 17)"


def test_cv_cabe_en_una_hoja(page: Page, base_url: str):
    page.goto(f"{base_url}/sobre-mi.html")
    page.wait_for_function("document.fonts.status === 'loaded'")
    assert paginas_pdf(page.pdf(format="A4", prefer_css_page_size=True)) == 1


def test_cv_llena_la_hoja(page: Page, base_url: str):
    """D40: la hoja aprovecha el espacio (antes sobraba casi la mitad), sin pasar a una segunda página."""
    page.set_viewport_size(AREA)
    page.goto(f"{base_url}/sobre-mi.html")
    page.wait_for_function("document.fonts.status === 'loaded'")
    page.emulate_media(media="print")
    alto = page.evaluate("document.querySelector('.cv-impresion').getBoundingClientRect().height")
    assert 0.85 <= alto / AREA["height"] <= 1.0, round(alto / AREA["height"], 3)


def test_cv_dice_lo_mismo_que_la_pagina(page: Page, base_url: str):
    page.goto(f"{base_url}/sobre-mi.html")
    cv = page.locator(".cv-impresion").text_content()
    for dato in [
        "Universidad Nacional",
        "Bancolombia",
        "Conaltura",
        "CS50x",
        "CS50AI",
        "ffdalsu.dev@gmail.com",
        "github.com/ffdalsu",
    ]:
        assert dato in cv, dato


def test_hoja_de_vida_pdf_al_dia(page: Page, base_url: str):
    """El PDF descargable (scripts/hoja_de_vida.py) dice lo mismo que la hoja de Sobre mí y es de una página."""
    lector = PdfReader(PDF)
    assert len(lector.pages) == 1
    del_pdf = palabras(" ".join(p.extract_text() for p in lector.pages))
    page.goto(f"{base_url}/sobre-mi.html")
    # los textos de cada nodo, separados por espacios (textContent pegaría «Bancolombia» con «2024»)
    texto = page.evaluate(
        "(() => { const w = document.createTreeWalker(document.querySelector('.cv-impresion'), NodeFilter.SHOW_TEXT);"
        " const t = []; while (w.nextNode()) t.push(w.currentNode.textContent); return t.join(' '); })()"
    )
    de_la_pagina = palabras(texto)
    faltan = sorted(de_la_pagina - del_pdf)
    assert not faltan, f"el PDF está desactualizado (uv run python scripts/hoja_de_vida.py); le faltan: {faltan[:12]}"


@pytest.mark.parametrize("pagina", ["index.html", "projects.html"])
def test_imprimir_otra_pagina_no_sale_en_blanco(page: Page, base_url: str, pagina: str):
    page.goto(f"{base_url}/{pagina}")
    page.emulate_media(media="print")
    expect(page.locator("main")).to_be_visible()
    expect(page.locator("main h1")).to_be_visible()
    for capa in [".velo", ".barra .controles", ".boton-terminal"]:
        expect(page.locator(capa)).to_be_hidden()
