"""F2 · El océano y bit: la escena dibuja, bit sigue, se duerme, despierta y la inmersión mide la profundidad."""

import pytest
from playwright.sync_api import Page


def estado(page: Page) -> dict:
    return page.evaluate("Portafolio.Oceano.estado()")


def centro_bit(e: dict) -> float:
    return e["bit"]["x"] + e["bit"]["ancho"] / 2


@pytest.fixture
def inicio(page: Page, base_url: str) -> Page:
    page.set_viewport_size({"width": 1280, "height": 800})
    page.goto(f"{base_url}/index.html")
    page.wait_for_function("window.Portafolio && Portafolio.Oceano && Portafolio.Oceano.estado()")
    return page


def test_bit_aparece(inicio: Page):
    e = estado(inicio)
    assert e["bit"]["x"] is not None
    assert e["bit"]["modo"] in {"flota", "habla"}
    # el canvas tiene caracteres pintados (algún píxel no transparente)
    pintado = inicio.evaluate(
        """() => { const c = document.getElementById('oceano'), d = c.getContext('2d')
                     .getImageData(0, 0, c.width, c.height).data;
                   for (let i = 3; i < d.length; i += 4) if (d[i] > 0) return true; return false; }"""
    )
    assert pintado


def test_bit_sigue_el_puntero(inicio: Page):
    antes = centro_bit(estado(inicio))
    inicio.mouse.move(1100, 300)
    inicio.wait_for_timeout(1500)
    despues = centro_bit(estado(inicio))
    destino = 1100 / estado(inicio)["cw"]
    assert abs(despues - destino) < abs(antes - destino)


def test_bit_duerme_tras_inactividad(page: Page, base_url: str):
    page.clock.install()
    page.goto(f"{base_url}/index.html")
    page.wait_for_function("window.Portafolio && Portafolio.Oceano && Portafolio.Oceano.estado()")
    page.clock.run_for(12_000)
    assert estado(page)["bit"]["modo"] == "duerme"


def test_bit_despierta_al_mover(page: Page, base_url: str):
    page.clock.install()
    page.goto(f"{base_url}/index.html")
    page.wait_for_function("window.Portafolio && Portafolio.Oceano && Portafolio.Oceano.estado()")
    page.clock.run_for(12_000)
    assert estado(page)["bit"]["modo"] == "duerme"
    page.mouse.move(200, 300)
    page.clock.run_for(200)
    assert estado(page)["bit"]["modo"] != "duerme"


def test_clic_en_bit_lo_hace_hablar(page: Page, base_url: str):
    page.clock.install()
    page.set_viewport_size({"width": 1280, "height": 800})
    page.goto(f"{base_url}/index.html")
    page.wait_for_function("window.Portafolio && Portafolio.Oceano && Portafolio.Oceano.estado()")
    page.clock.run_for(4_000)  # termina el saludo inicial
    assert estado(page)["bit"]["modo"] != "habla"
    e = estado(page)
    x = centro_bit(e) * e["cw"]
    y = page.evaluate("document.querySelector('.hero').getBoundingClientRect().height * 0.55")
    page.mouse.click(x, y)
    page.clock.run_for(100)
    assert estado(page)["bit"]["modo"] == "habla"


def test_scroll_aumenta_profundidad(inicio: Page):
    arriba = estado(inicio)["profundidad"]
    inicio.mouse.wheel(0, 1500)
    inicio.wait_for_timeout(600)
    assert estado(inicio)["profundidad"] > arriba + 10


def test_movimiento_reducido_estatico(page: Page, base_url: str):
    page.emulate_media(reduced_motion="reduce")
    page.goto(f"{base_url}/index.html")
    page.wait_for_function("window.Portafolio && Portafolio.Oceano && Portafolio.Oceano.estado()")
    assert estado(page)["animado"] is False
    pixeles = "document.getElementById('oceano').toDataURL()"
    uno = page.evaluate(pixeles)
    page.wait_for_timeout(700)
    assert page.evaluate(pixeles) == uno


def test_cuadro_dura_menos_de_8ms(inicio: Page):
    inicio.wait_for_timeout(2000)
    assert estado(inicio)["msCuadro"] < 8


@pytest.mark.parametrize("ancho", [375, 768, 1440])
def test_sin_scroll_horizontal(page: Page, base_url: str, ancho: int):
    page.set_viewport_size({"width": ancho, "height": 800})
    page.goto(f"{base_url}/index.html")
    sobra = page.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
    assert sobra <= 0
