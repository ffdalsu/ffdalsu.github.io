"""F17b · Hoja de impresión como CV: Ctrl+P en Sobre mí da el CV en una sola hoja A4, sin océano ni menús."""

import re

from playwright.sync_api import Page, expect


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
    pdf = page.pdf(format="A4", prefer_css_page_size=True)
    paginas = len(re.findall(rb"/Type\s*/Page[^s]", pdf))
    assert paginas == 1


def test_cv_dice_lo_mismo_que_la_pagina(page: Page, base_url: str):
    page.goto(f"{base_url}/sobre-mi.html")
    cv = page.locator(".cv-impresion").text_content()
    for dato in ["Universidad Nacional", "Bancolombia", "Conaltura", "CS50x", "CS50AI", "ffdalsu.dev@gmail.com"]:
        assert dato in cv, dato
