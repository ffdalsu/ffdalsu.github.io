"""F13 · Navegación sin recargar: el audio no se corta, la historia funciona y los módulos se montan sin duplicarse."""

from pathlib import Path

import pytest
from playwright.sync_api import Page, expect
from portada_ayuda import LISTO, ir_al_horizonte

SITIO = Path(__file__).resolve().parent.parent / "sitio"


@pytest.fixture
def inicio(page: Page, base_url: str) -> Page:
    page.set_viewport_size({"width": 1440, "height": 900})
    page.goto(f"{base_url}/index.html")
    page.wait_for_function(LISTO)
    page.evaluate("window.marca = 'misma página'")  # si la página se recarga, la marca desaparece
    return page


def ir(page: Page, nombre: str) -> None:
    page.locator(".barra .menu").get_by_role("link", name=nombre).click()
    page.wait_for_function(
        f"document.querySelector('main') && document.querySelector('main').dataset.pagina === '{ {'inicio': 'inicio', 'sobre mí': 'sobre-mi', 'proyectos': 'proyectos'}[nombre] }'"
    )


def sigue_la_misma(page: Page) -> bool:
    return page.evaluate("window.marca") == "misma página"


def test_navegar_no_recarga(inicio: Page, base_url: str):
    ir(inicio, "sobre mí")
    expect(inicio).to_have_url(f"{base_url}/sobre-mi.html")
    expect(inicio.locator("main h1")).to_contain_text("Sobre mí")
    expect(inicio).to_have_title("Sobre mí · Juan David")
    assert sigue_la_misma(inicio)
    assert inicio.evaluate("Portafolio.Navegacion.estado().cambios") == 1


def test_musica_sigue_al_cambiar_de_pagina(inicio: Page):
    inicio.locator(".barra .opcion-sonido[data-sonido=todo]").click()
    inicio.wait_for_function("Portafolio.Sonido.estado().musica === true")
    ir(inicio, "proyectos")
    notas = inicio.evaluate("Portafolio.Sonido.estado().notas")
    inicio.wait_for_timeout(800)
    estado = inicio.evaluate("Portafolio.Sonido.estado()")
    assert estado["musica"] and estado["contexto"] == "running" and estado["notas"] > notas
    expect(inicio.locator(".aviso-sonido")).to_have_count(0)
    expect(inicio.locator(".barra .opcion-sonido[data-sonido=todo]")).to_have_attribute("aria-pressed", "true")
    assert sigue_la_misma(inicio)


def test_atras_y_adelante(inicio: Page, base_url: str):
    ir(inicio, "sobre mí")
    inicio.go_back()
    inicio.wait_for_function("document.querySelector('main').dataset.pagina === 'inicio'")
    expect(inicio).to_have_url(f"{base_url}/index.html")
    inicio.go_forward()
    inicio.wait_for_function("document.querySelector('main').dataset.pagina === 'sobre-mi'")
    assert sigue_la_misma(inicio)


def test_isla_llega_al_proyecto(inicio: Page, base_url: str):
    ir_al_horizonte(inicio)
    inicio.locator(".isla", has_text="Hermes").click()
    inicio.wait_for_function("document.querySelector('main').dataset.pagina === 'proyectos'")
    expect(inicio).to_have_url(f"{base_url}/projects.html#hermes")
    expect(inicio.locator("#hermes")).to_have_class("proyecto resaltado")
    assert sigue_la_misma(inicio)


def test_cada_pagina_se_monta_y_desmonta(inicio: Page):
    for destino in ["sobre mí", "proyectos", "inicio", "sobre mí", "inicio"]:
        ir(inicio, destino)
    inicio.wait_for_function(LISTO)
    inicio.wait_for_timeout(500)
    assert inicio.evaluate("Portafolio.Oceano.estado().bucles") == 1, "quedaron bucles del océano duplicados"
    assert inicio.evaluate("Portafolio.SobreMi.estado().activas") == 0
    assert inicio.evaluate("Portafolio.Miniaturas.estado().activas") == 0
    expect(inicio.locator("#oceano")).to_have_count(1)
    assert inicio.evaluate("Portafolio.Oceano.estado().msCuadro") < 8
    assert sigue_la_misma(inicio)


def test_foco_va_al_titulo(inicio: Page):
    ir(inicio, "proyectos")
    assert inicio.evaluate("document.activeElement === document.querySelector('main h1')")


def test_tema_y_contacto_funcionan_tras_navegar(inicio: Page):
    ir(inicio, "sobre mí")
    inicio.locator(".barra .opcion-tema[data-tema=light]").click()
    expect(inicio.locator("html")).to_have_attribute("data-bs-theme", "light")
    inicio.locator(".barra .opcion-tema[data-tema=dark]").click()
    expect(inicio.locator("html")).to_have_attribute("data-bs-theme", "dark")
    inicio.locator(".pie .abrir-contacto").click()
    expect(inicio.locator("#modal-contacto")).to_be_visible()


def test_menu_lateral_tras_navegar(page: Page, base_url: str):
    page.set_viewport_size({"width": 390, "height": 844})
    page.goto(f"{base_url}/index.html")
    page.wait_for_function(LISTO)
    page.evaluate("window.marca = 'misma página'")
    page.locator(".boton-menu").click()
    page.locator("#menu-movil").get_by_role("link", name="sobre mí").click()
    page.wait_for_function("document.querySelector('main').dataset.pagina === 'sobre-mi'")
    expect(page.locator(".offcanvas-backdrop")).to_have_count(0)
    page.locator(".boton-menu").click()
    expect(page.locator("#menu-movil")).to_be_visible()
    assert sigue_la_misma(page)


def test_file_navega_normal(page: Page):
    """Desde el zip abierto con doble clic (file://) no hay fetch: los enlaces navegan de la forma tradicional."""
    page.goto((SITIO / "index.html").as_uri())
    page.evaluate("window.marca = 'misma página'")
    page.locator(".barra .menu").get_by_role("link", name="sobre mí").click()
    page.wait_for_load_state()
    expect(page.locator("main h1")).to_contain_text("Sobre mí")
    assert page.evaluate("window.marca") is None
