"""F8 · Portada en tres actos (D29): cielo con el nombre, horizonte con bit e islas, y entrada al mar."""

import pytest
from playwright.sync_api import Page, expect
from portada_ayuda import LISTO, estado, ir_al_horizonte, y_del_agua


def abrir(page: Page, base_url: str, ancho: int = 1440, alto: int = 900, tema: str = "dark") -> Page:
    page.set_viewport_size({"width": ancho, "height": alto})
    page.add_init_script(f"try {{ localStorage.setItem('tema', '{tema}'); }} catch (e) {{}}")
    page.goto(f"{base_url}/index.html")
    page.wait_for_function(LISTO)
    return page


def caja(page: Page, selector: str) -> dict:
    return page.locator(selector).evaluate(
        "e => { const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height}; }"
    )


def se_cruzan(a: dict, b: dict) -> bool:
    return (
        a["x"] < b["x"] + b["w"] and b["x"] < a["x"] + a["w"] and a["y"] < b["y"] + b["h"] and b["y"] < a["y"] + a["h"]
    )


def test_acto1_nombre_a_pantalla_completa(page: Page, base_url: str):
    abrir(page, base_url)
    e = estado(page)
    assert e["acto"] == 1
    assert caja(page, ".portada-titulo")["w"] > 0.45 * 1440
    assert e["bit"]["visible"] is False  # el mar todavía está debajo de la pantalla
    expect(page.locator(".horizonte")).to_have_css("visibility", "hidden")


def test_cielo_luna_estrellas_gaviotas(page: Page, base_url: str):
    abrir(page, base_url)
    page.wait_for_timeout(500)
    cielo = estado(page)["cielo"]
    assert cielo["astro"] == "luna" and cielo["estrellas"] > 20 and cielo["gaviotas"] >= 3


def test_de_dia_hay_sol_y_no_estrellas(page: Page, base_url: str):
    abrir(page, base_url, tema="light")
    page.wait_for_timeout(500)
    cielo = estado(page)["cielo"]
    assert cielo["astro"] == "sol" and cielo["estrellas"] == 0


def test_acto2_bit_e_islas_visibles(page: Page, base_url: str):
    abrir(page, base_url)
    e = ir_al_horizonte(page)
    assert e["acto"] == 2 and e["bit"]["visible"]
    expect(page.locator(".horizonte")).to_have_css("visibility", "visible")
    for i in range(page.locator(".isla").count()):
        c = page.locator(".isla").nth(i).evaluate("e => e.getBoundingClientRect().bottom")
        assert 0 < c <= 900


@pytest.mark.parametrize("ancho,alto", [(1440, 900), (1280, 650), (1794, 795), (390, 844)])
def test_bit_nunca_tapado(page: Page, base_url: str, ancho: int, alto: int):
    abrir(page, base_url, ancho, alto)
    e = ir_al_horizonte(page)
    b = e["bit"]["caja"]
    bit = {"x": b["x"], "y": b["y"], "w": b["ancho"], "h": b["alto"]}
    assert 0 <= bit["y"] and bit["y"] + bit["h"] <= alto, "bit fuera de la pantalla"
    assert not se_cruzan(bit, caja(page, ".portada-nombre")), "el nombre tapa a bit"
    if page.locator(".panel-campo").is_visible():
        assert not se_cruzan(bit, caja(page, ".panel-campo")), "el panel ψ tapa a bit"


def test_nombre_se_encoge(page: Page, base_url: str):
    abrir(page, base_url)
    antes = caja(page, ".portada-nombre")
    ir_al_horizonte(page)
    despues = caja(page, ".portada-nombre")
    assert despues["w"] < antes["w"] * 0.5
    assert despues["x"] < 100 and despues["y"] < 200
    expect(page.locator(".portada-lema")).to_have_css("opacity", "0")


def test_clic_en_agua_no_selecciona_texto(page: Page, base_url: str):
    abrir(page, base_url)
    page.mouse.dblclick(700, 600)  # sobre el nombre y el subtítulo, en el acto 1
    assert page.evaluate("getSelection().toString()") == ""
    ir_al_horizonte(page)
    page.mouse.dblclick(300, y_del_agua(page, 6))
    assert page.evaluate("getSelection().toString()") == ""


@pytest.mark.parametrize("ancho,alto", [(1794, 795), (1280, 650)])
def test_panel_campo_sin_desborde(page: Page, base_url: str, ancho: int, alto: int):
    abrir(page, base_url, ancho, alto)
    ir_al_horizonte(page)
    panel = caja(page, ".panel-campo")
    assert page.locator(".panel-campo").is_visible()
    assert panel["x"] >= 0 and panel["x"] + panel["w"] <= ancho and panel["y"] + panel["h"] <= alto


def test_coreografia_continua(page: Page, base_url: str):
    """La cámara nunca salta: entre dos puntos cercanos del scroll el horizonte se mueve poco, y en el acto 3 va 1:1."""
    abrir(page, base_url)
    saltos = page.evaluate(
        """() => { const filas = 50, h = [];
                   for (let p = 0; p <= 3; p += 0.005) h.push(Portafolio.Coreografia.estado(p, filas, false).horizonte);
                   let max = 0; for (let i = 1; i < h.length; i++) max = Math.max(max, Math.abs(h[i] - h[i - 1]));
                   const a = Portafolio.Coreografia.estado(2.0, filas, false).horizonte;
                   const b = Portafolio.Coreografia.estado(2.1, filas, false).horizonte;
                   return { max: max, pendiente: (b - a) / 0.1 / filas }; }"""
    )
    assert saltos["max"] < 0.5
    assert abs(saltos["pendiente"] + 1) < 1e-6


def test_acto3_islas_ocultas_y_sonda(page: Page, base_url: str):
    abrir(page, base_url)
    page.evaluate("window.scrollTo(0, window.innerHeight * 2.4)")
    page.wait_for_function("Portafolio.Oceano.estado().acto === 3")
    page.wait_for_timeout(400)
    expect(page.locator(".horizonte")).to_have_css("visibility", "hidden")
    expect(page.locator("#sonda")).to_contain_text("acto 3")
    assert estado(page)["profundidad"] > 5


def test_movimiento_reducido_portada_estatica(page: Page, base_url: str):
    page.emulate_media(reduced_motion="reduce")
    abrir(page, base_url)
    page.evaluate("window.scrollTo(0, window.innerHeight * 1.1)")
    page.wait_for_timeout(300)
    expect(page.locator(".portada")).to_have_css("position", "absolute")
    assert page.locator(".portada-nombre").evaluate("e => getComputedStyle(e).transform") == "none"
