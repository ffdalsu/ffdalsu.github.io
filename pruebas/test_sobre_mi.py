"""F4 · Sobre mí completa: ficha, hitos animados, diplomas de Harvard, árbol de habilidades y elementos de la maqueta."""

import pytest
from playwright.sync_api import Page, expect


@pytest.fixture
def sobre_mi(page: Page, base_url: str) -> Page:
    page.set_viewport_size({"width": 1280, "height": 800})
    page.goto(f"{base_url}/sobre-mi.html")
    return page


def test_sobre_mi_tiene_formacion_experiencia_certificados(sobre_mi: Page):
    texto = sobre_mi.locator("main").inner_text()
    for dato in ["Universidad Nacional", "Bancolombia", "Conaltura", "CS50x", "CS50P", "CS50 SQL", "CS50AI"]:
        assert dato in texto, dato
    expect(sobre_mi.locator("#ficha dt")).to_have_count(6)


def test_hitos_en_orden_y_con_animacion(sobre_mi: Page):
    hitos = sobre_mi.locator(".hito")
    assert hitos.count() >= 6
    for i in range(hitos.count()):
        expect(hitos.nth(i).locator("canvas[data-anim]")).to_have_count(1)
    fechas = sobre_mi.locator(".hito-fecha").all_inner_texts()
    assert fechas[0].startswith("2021") and "hoy" in fechas[-1]


def test_hito_se_anima_al_verlo(sobre_mi: Page):
    sobre_mi.locator("#hito-banco").scroll_into_view_if_needed()
    sobre_mi.wait_for_timeout(600)
    vistas = sobre_mi.evaluate("Portafolio.SobreMi.estado().animacionesVistas")
    assert "banco" in vistas
    pintado = sobre_mi.evaluate(
        """() => { const c = document.querySelector('#hito-banco canvas'), d = c.getContext('2d')
                     .getImageData(0, 0, c.width, c.height).data;
                   for (let i = 3; i < d.length; i += 4) if (d[i] > 0) return true; return false; }"""
    )
    assert pintado


def test_tres_diplomas_de_harvard(sobre_mi: Page):
    programas = sobre_mi.locator(".diploma-programa").all_inner_texts()
    assert programas == [
        "Computer Science for Python Programming",
        "Computer Science for Databases using SQL",
        "Computer Science for Artificial Intelligence",
    ]


def test_diplomas_se_despliegan_al_verlos(sobre_mi: Page):
    expect(sobre_mi.locator(".diploma.desplegado")).to_have_count(0)
    sobre_mi.locator(".diplomas").scroll_into_view_if_needed()
    expect(sobre_mi.locator(".diploma.desplegado")).to_have_count(3)


def test_movimiento_reducido_muestra_diplomas(page: Page, base_url: str):
    page.emulate_media(reduced_motion="reduce")
    page.goto(f"{base_url}/sobre-mi.html")
    expect(page.locator(".diploma.desplegado")).to_have_count(3)


@pytest.mark.parametrize("pagina", ["index.html", "sobre-mi.html"])
def test_arbol_de_habilidades_por_carpetas(page: Page, base_url: str, pagina: str):
    page.goto(f"{base_url}/{pagina}")
    ramas = [r.strip() for r in page.locator(".arbol .rama").all_inner_texts()]
    assert ramas[0].endswith("lenguajes/") and ramas[-1].startswith("└──")


def test_habilidad_se_revuelve_al_pasar(page: Page, base_url: str):
    page.goto(f"{base_url}/sobre-mi.html")
    celda = page.locator(".habilidades li", has_text="SQL Server")
    celda.scroll_into_view_if_needed()
    # registra todos los textos intermedios mientras se revuelve
    celda.locator(".sc").evaluate(
        "el => { window.textos = []; new MutationObserver(() => textos.push(el.textContent))"
        ".observe(el, { childList: true, characterData: true, subtree: true }); }"
    )
    celda.hover()
    expect(celda.locator(".sc")).to_have_text("SQL Server")  # al terminar se vuelve a armar
    page.wait_for_timeout(500)
    textos = page.evaluate("window.textos")
    assert any(t != "SQL Server" for t in textos)
    assert textos[-1] == "SQL Server"


@pytest.mark.parametrize("pagina", ["index.html", "sobre-mi.html", "projects.html"])
def test_reloj_del_pie(page: Page, base_url: str, pagina: str):
    page.goto(f"{base_url}/{pagina}")
    expect(page.locator("#reloj")).to_have_text(__import__("re").compile(r"^\d{2}:\d{2}$"))


def test_ficha_tambien_en_el_inicio(page: Page, base_url: str):
    page.goto(f"{base_url}/index.html")
    expect(page.locator("#sobre-mi #ficha dt")).to_have_count(6)


@pytest.mark.parametrize("ancho", [375, 768, 1440])
def test_sobre_mi_sin_scroll_horizontal(page: Page, base_url: str, ancho: int):
    page.set_viewport_size({"width": ancho, "height": 800})
    page.goto(f"{base_url}/sobre-mi.html")
    assert page.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth") <= 0


def test_escudos_de_los_diplomas_sin_barras(sobre_mi: Page):
    """El escudo ASCII no muestra barras de desplazamiento (Bootstrap pone overflow:auto en <pre>)."""
    sobre_mi.locator(".diplomas").scroll_into_view_if_needed()
    sobre_mi.wait_for_timeout(2200)  # termina el sello
    desbordes = sobre_mi.locator(".diploma-escudo").evaluate_all("es => es.map(e => getComputedStyle(e).overflow)")
    assert desbordes and all(d == "visible" for d in desbordes)
