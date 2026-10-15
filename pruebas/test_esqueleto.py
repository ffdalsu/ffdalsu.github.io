"""F1 · Esqueleto: las tres páginas cargan, navegan, guardan el tema y no piden nada a internet."""

import pytest
from playwright.sync_api import Page, expect

PAGINAS = ["index.html", "sobre-mi.html", "projects.html"]
# con la 404 (F17b): también debe cargar sin errores ni peticiones externas
CON_404 = PAGINAS + ["404.html"]


@pytest.mark.parametrize("pagina", PAGINAS)
def test_paginas_responden_200(page: Page, base_url: str, pagina: str):
    respuesta = page.goto(f"{base_url}/{pagina}")
    assert respuesta is not None and respuesta.status == 200


@pytest.mark.parametrize("pagina", CON_404)
def test_sin_errores_de_consola(page: Page, base_url: str, pagina: str):
    errores = []
    page.on("console", lambda m: errores.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: errores.append(str(e)))
    page.goto(f"{base_url}/{pagina}")
    page.wait_for_load_state("networkidle")
    assert errores == []


def test_menu_navega_entre_las_tres(page: Page, base_url: str):
    page.goto(f"{base_url}/index.html")
    page.get_by_role("link", name="sobre mí").click()
    expect(page).to_have_url(f"{base_url}/sobre-mi.html")
    expect(page.locator(".barra .menu a[aria-current=page]")).to_have_text("sobre mí")
    page.get_by_role("link", name="proyectos").click()
    expect(page).to_have_url(f"{base_url}/projects.html")
    page.get_by_role("link", name="inicio").click()
    expect(page).to_have_url(f"{base_url}/index.html")


def test_tema_alterna_y_persiste(page: Page, base_url: str):
    page.emulate_media(color_scheme="light")
    page.goto(f"{base_url}/index.html")
    raiz = page.locator("html")
    expect(raiz).to_have_attribute("data-bs-theme", "light")
    page.get_by_role("button", name="ámbar").click()
    expect(raiz).to_have_attribute("data-bs-theme", "dark")
    expect(page.get_by_role("button", name="ámbar")).to_have_attribute("aria-pressed", "true")
    # El tema elegido sobrevive al cambio de página
    page.goto(f"{base_url}/projects.html")
    expect(raiz).to_have_attribute("data-bs-theme", "dark")
    fondo = page.evaluate("getComputedStyle(document.body).backgroundColor")
    assert fondo == "rgb(18, 13, 4)"


def test_tema_por_defecto_sigue_al_sistema(page: Page, base_url: str):
    page.emulate_media(color_scheme="dark")
    page.goto(f"{base_url}/index.html")
    expect(page.locator("html")).to_have_attribute("data-bs-theme", "dark")


@pytest.mark.parametrize("pagina", CON_404)
def test_sin_peticiones_externas(page: Page, base_url: str, pagina: str):
    externas = []
    page.on("request", lambda r: externas.append(r.url) if not r.url.startswith((base_url, "data:")) else None)
    page.goto(f"{base_url}/{pagina}")
    page.wait_for_load_state("networkidle")
    assert externas == []


def test_fuentes_e_iconos_cargan(page: Page, base_url: str):
    page.goto(f"{base_url}/index.html")
    page.wait_for_load_state("networkidle")
    cargadas = page.evaluate(
        "Promise.all([document.fonts.load('16px \"IBM Plex Mono\"'), document.fonts.load('900 16px \"Font Awesome 6 Free\"')])"
        ".then(r => r.map(x => x.length))"
    )
    assert all(n > 0 for n in cargadas)
