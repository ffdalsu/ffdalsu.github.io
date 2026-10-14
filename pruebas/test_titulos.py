"""Los títulos se arman desde estática ASCII al entrar en pantalla, sin perder el cursor ni el texto real."""

import pytest
from playwright.sync_api import Page, expect


@pytest.mark.parametrize("pagina", ["index.html", "sobre-mi.html", "projects.html"])
def test_titulo_principal_se_descifra(page: Page, base_url: str, pagina: str):
    page.add_init_script(
        "document.addEventListener('DOMContentLoaded', () => { window.textos = [];"
        " const h = document.querySelector('.titulo-grande');"
        " new MutationObserver(() => textos.push(h.firstChild.textContent))"
        ".observe(h, { childList: true, characterData: true, subtree: true }); });"
    )
    page.goto(f"{base_url}/{pagina}")
    titulo = page.locator(".titulo-grande")
    expect(titulo).to_have_attribute("data-descifrado", "1")
    final = page.evaluate("document.querySelector('.titulo-grande').firstChild.textContent")
    textos = page.evaluate("window.textos")
    assert any(t != final for t in textos)  # pasó por estática
    expect(titulo.locator(".cursor")).to_have_count(1)  # el cursor sigue ahí


def test_titulo_de_seccion_se_descifra_al_verlo(page: Page, base_url: str):
    page.goto(f"{base_url}/sobre-mi.html")
    titulo = page.locator("#titulo-certificados")
    expect(titulo).not_to_have_attribute("data-descifrado", "1")
    titulo.scroll_into_view_if_needed()
    expect(titulo).to_have_attribute("data-descifrado", "1")
    expect(titulo).to_have_text("Certificados de Harvard")


def test_sin_movimiento_no_se_descifra(page: Page, base_url: str):
    page.emulate_media(reduced_motion="reduce")
    page.goto(f"{base_url}/index.html")
    page.wait_for_timeout(600)
    expect(page.locator(".titulo-grande")).not_to_have_attribute("data-descifrado", "1")
    expect(page.locator(".titulo-grande")).to_have_text("Juan David")
