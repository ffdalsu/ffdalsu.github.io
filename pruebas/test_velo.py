"""F17a · Velo ASCII entre páginas: cubre, cambia y descubre; nunca queda puesto ni debajo de otra capa."""

import pytest
from playwright.sync_api import Page, expect
from portada_ayuda import LISTO

PAGINA = "document.querySelector('main') && document.querySelector('main').dataset.pagina === '{}'"


@pytest.fixture
def inicio(page: Page, base_url: str) -> Page:
    page.set_viewport_size({"width": 1440, "height": 900})
    page.goto(f"{base_url}/index.html")
    page.wait_for_function(LISTO)
    page.wait_for_function("document.fonts.status === 'loaded'")
    return page


def velo(page: Page) -> dict:
    return page.evaluate("Portafolio.Velo.estado()")


def ir(page: Page, nombre: str, pagina: str) -> None:
    page.locator(".barra .menu").get_by_role("link", name=nombre).click()
    page.wait_for_function(PAGINA.format(pagina))
    page.wait_for_function("Portafolio.Velo.estado().fase === 'quieto'")


def test_velo_cubre_y_descubre(inicio: Page):
    # se anotan las fases cuadro a cuadro y, en el instante en que cambia el <main>, cuánto del velo está lleno
    inicio.evaluate(
        "window.fases = []; (function mira() { const f = Portafolio.Velo.estado().fase;"
        " if (window.fases[window.fases.length - 1] !== f) window.fases.push(f); requestAnimationFrame(mira); })();"
        " new MutationObserver(() => { if (window.alCambiar === undefined && document.querySelector('main[data-pagina=proyectos]'))"
        " window.alCambiar = Portafolio.Velo.estado().cubierto; }).observe(document.body, { childList: true })"
    )
    ir(inicio, "proyectos", "proyectos")
    assert inicio.evaluate("window.alCambiar") == 1  # la página cambia debajo del velo lleno
    inicio.wait_for_function("window.fases[window.fases.length - 1] === 'quieto'")  # el observador anota en su cuadro
    assert inicio.evaluate("window.fases") == ["quieto", "cubre", "descubre", "quieto"]
    e = velo(inicio)
    assert e["modo"] == "velo" and e["usos"] == 1


def test_velo_no_queda_puesto(inicio: Page):
    for nombre, pagina in [("sobre mí", "sobre-mi"), ("proyectos", "proyectos"), ("inicio", "inicio")] * 2:
        ir(inicio, nombre, pagina)
    assert velo(inicio)["usos"] == 6
    assert inicio.locator(".velo").count() == 1  # sobrevive al cambio del <body> y no se duplica
    expect(inicio.locator(".velo")).to_be_hidden()
    assert velo(inicio)["cubierto"] == 0


@pytest.mark.parametrize("capa", ["modal", "terminal", "menu"])
def test_velo_sobre_modal_terminal_y_menu(inicio: Page, capa: str):
    if capa == "modal":
        inicio.evaluate("bootstrap.Modal.getOrCreateInstance(document.querySelector('.modal')).show()")
        selector = ".modal.show"
    elif capa == "terminal":
        inicio.keyboard.press("/")
        selector = ".terminal"
    else:
        inicio.set_viewport_size({"width": 390, "height": 844})
        inicio.locator(".boton-menu").click()
        selector = ".menu-movil.show"
    expect(inicio.locator(selector)).to_be_visible()
    z = inicio.evaluate(
        f"[+getComputedStyle(document.querySelector('.velo')).zIndex, +getComputedStyle(document.querySelector('{selector}')).zIndex]"
    )
    assert z[0] > z[1], z


def test_velo_movimiento_reducido_sin_velo(page: Page, base_url: str):
    page.emulate_media(reduced_motion="reduce")
    page.goto(f"{base_url}/index.html")
    page.wait_for_function(LISTO)
    assert velo(page)["modo"] == "ninguno"
    page.locator(".barra .menu").get_by_role("link", name="proyectos").click()
    page.wait_for_function(PAGINA.format("proyectos"))
    assert velo(page)["usos"] == 0


def test_velo_modo_en_celular(page: Page, base_url: str):
    """En celular se usa lo decidido en la F17a (VELO_EN_CELULAR en js/velo.js); el cuadro debe ser barato."""
    page.set_viewport_size({"width": 390, "height": 844})
    page.goto(f"{base_url}/index.html")
    page.wait_for_function(LISTO)
    modo = velo(page)["modo"]
    assert modo in ("velo", "fundido")
    page.evaluate("Portafolio.Navegacion.ir('projects.html')")
    page.wait_for_function(PAGINA.format("proyectos"))
    page.wait_for_function("Portafolio.Velo.estado().fase === 'quieto'")
    if modo == "velo":
        assert velo(page)["msCuadro"] < 16
