"""F3 · El ecosistema: criaturas por habilidad, islas que llevan a los proyectos, bit cuenta y llamado a contacto."""

import pytest
from playwright.sync_api import Page, expect

LISTO = "window.Portafolio && Portafolio.Oceano && Portafolio.Oceano.estado()"


def estado(page: Page) -> dict:
    return page.evaluate("Portafolio.Oceano.estado()")


@pytest.fixture
def inicio(page: Page, base_url: str) -> Page:
    page.set_viewport_size({"width": 1280, "height": 800})
    page.goto(f"{base_url}/index.html")
    page.wait_for_function(LISTO)
    return page


def test_cada_habilidad_tiene_criatura(inicio: Page):
    items = inicio.locator(".habilidades li").all_inner_texts()
    criaturas = [c["nombre"] for c in estado(inicio)["ecosistema"]["criaturas"]]
    assert [i.strip() for i in items] == criaturas
    assert len(criaturas) >= 8


def test_habilidades_con_iconos(inicio: Page):
    items = inicio.locator(".habilidades li")
    for i in range(items.count()):
        expect(items.nth(i).locator("i[class*='fa-']")).to_have_count(1)


def test_enfocar_habilidad_resalta_criatura(inicio: Page):
    inicio.locator("[data-criatura=sql]").scroll_into_view_if_needed()
    inicio.locator("[data-criatura=sql]").focus()
    inicio.wait_for_timeout(300)
    activas = [c["nombre"] for c in estado(inicio)["ecosistema"]["criaturas"] if c["activa"]]
    assert activas == ["SQL Server"]


def test_islas_muestran_nombre_y_linea(inicio: Page):
    islas = inicio.locator(".isla")
    assert islas.count() >= 3
    for i in range(islas.count()):
        expect(islas.nth(i).locator(".isla-nombre")).to_be_visible()
        expect(islas.nth(i).locator(".isla-linea")).to_be_visible()


def test_isla_lleva_a_su_proyecto(inicio: Page, base_url: str):
    inicio.locator(".isla", has_text="Hermes").click()
    expect(inicio).to_have_url(f"{base_url}/projects.html#hermes")
    expect(inicio.locator("#hermes")).to_have_count(1)


def test_cada_isla_tiene_destino(inicio: Page, base_url: str):
    destinos = inicio.locator(".isla").evaluate_all("els => els.map(e => e.getAttribute('href'))")
    inicio.goto(f"{base_url}/projects.html")
    for href in destinos:
        expect(inicio.locator("#" + href.split("#")[1])).to_have_count(1)


def test_sobre_mi_corta_presente(inicio: Page):
    texto = inicio.locator("#sobre-mi").inner_text()
    assert "Universidad Nacional" in texto and "CS50" in texto
    expect(inicio.locator("#sobre-mi a[href='sobre-mi.html']")).to_have_count(1)


def test_bit_cuenta_sobre_mi(page: Page, base_url: str):
    page.clock.install()
    page.goto(f"{base_url}/index.html")
    page.wait_for_function(LISTO)
    frases = set()
    for _ in range(14):
        page.mouse.move(100 + len(frases), 700)  # actividad, para que no se duerma
        page.clock.run_for(1000)
        frases.add(estado(page)["bit"]["frase"])
    assert "matemático puro · U. Nacional" in frases


def test_toque_movil_mueve_a_bit(browser, base_url: str):
    contexto = browser.new_context(viewport={"width": 390, "height": 844}, has_touch=True, is_mobile=True)
    page = contexto.new_page()
    page.goto(f"{base_url}/index.html")
    page.wait_for_function(LISTO)
    alto = page.evaluate("document.querySelector('.hero').getBoundingClientRect().bottom")
    page.touchscreen.tap(360, alto - 8)  # agua libre, debajo de las etiquetas de las islas
    page.wait_for_timeout(200)
    objetivo = estado(page)["bit"]["objetivo"]
    contexto.close()
    assert objetivo is not None and objetivo > 30


def test_llamado_a_contacto(inicio: Page):
    contacto = inicio.locator("#contacto")
    expect(contacto.get_by_role("heading", name="¿Hablamos?")).to_be_visible()
    expect(contacto.locator("a[href^='mailto:ffdalsu.dev@gmail.com']")).to_have_count(1)
