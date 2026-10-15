"""F12 · Celular: menú lateral, encabezado de una línea y los bugs del barrido (astro, silueta, color, etiquetas, globo)."""

import pytest
from playwright.sync_api import Page, expect
from portada_ayuda import LISTO, estado, ir_al_horizonte

ANCHOS = [390, 360]


def abrir(page: Page, base_url: str, pagina: str = "index.html", ancho: int = 390, tema: str = "dark") -> Page:
    page.set_viewport_size({"width": ancho, "height": 844})
    page.add_init_script(f"try {{ localStorage.setItem('tema', '{tema}'); }} catch (e) {{}}")
    page.goto(f"{base_url}/{pagina}")
    if pagina == "index.html":
        page.wait_for_function(LISTO)
    return page


@pytest.mark.parametrize("ancho", ANCHOS)
def test_encabezado_movil_de_una_linea(page: Page, base_url: str, ancho: int):
    abrir(page, base_url, ancho=ancho)
    assert page.locator(".barra").evaluate("e => e.offsetHeight") <= 64
    expect(page.locator(".boton-menu")).to_be_visible()
    expect(page.locator(".barra .menu")).to_be_hidden()
    expect(page.locator(".barra .controles")).to_be_hidden()


@pytest.mark.parametrize("pagina", ["index.html", "sobre-mi.html", "projects.html"])
def test_menu_movil_abre_con_jquery(page: Page, base_url: str, pagina: str):
    abrir(page, base_url, pagina)
    page.evaluate(
        "() => { const o = $.fn.offcanvas; window.llamadas = [];"
        " $.fn.offcanvas = function (a) { llamadas.push(a); return o.apply(this, arguments); }; }"
    )
    page.locator(".boton-menu").click()
    menu = page.locator("#menu-movil")
    expect(menu).to_be_visible()
    assert "show" in page.evaluate("window.llamadas")
    for nombre in ["inicio", "sobre mí", "proyectos"]:
        expect(menu.get_by_role("link", name=nombre)).to_be_visible()
    expect(menu.locator(".opcion-tema")).to_have_count(2)
    expect(menu.locator(".opcion-sonido")).to_have_count(3)


def test_menu_lateral_navega(page: Page, base_url: str):
    abrir(page, base_url)
    page.locator(".boton-menu").click()
    page.locator("#menu-movil").get_by_role("link", name="proyectos").click()
    expect(page).to_have_url(f"{base_url}/projects.html")


def test_controles_duplicados_sincronizados(page: Page, base_url: str):
    abrir(page, base_url)
    page.locator(".boton-menu").click()
    page.locator("#menu-movil .opcion-tema[data-tema=light]").click()
    expect(page.locator("html")).to_have_attribute("data-bs-theme", "light")
    # la copia del encabezado (oculta en celular) también quedó marcada
    expect(page.locator(".barra .opcion-tema[data-tema=light]")).to_have_attribute("aria-pressed", "true")


def test_escritorio_sin_cambios(page: Page, base_url: str):
    abrir(page, base_url, ancho=1440)
    expect(page.locator(".boton-menu")).to_be_hidden()
    expect(page.locator(".barra .menu")).to_be_visible()
    expect(page.locator(".barra .controles")).to_be_visible()
    assert page.locator(".barra").evaluate("e => e.offsetHeight") <= 64


@pytest.mark.parametrize("ancho", ANCHOS)
@pytest.mark.parametrize("tema", ["dark", "light"])
def test_astro_dentro_y_bajo_el_encabezado(page: Page, base_url: str, ancho: int, tema: str):
    abrir(page, base_url, ancho=ancho, tema=tema)
    page.wait_for_timeout(300)
    c = estado(page)["cielo"]["caja"]
    barra = page.locator(".barra").evaluate("e => e.getBoundingClientRect().bottom")
    assert c["y"] >= barra - 1, "el encabezado tapa el astro"
    assert c["x"] >= 0 and c["x"] + c["ancho"] <= ancho + 1, "el astro se sale por un lado"


def test_borrado_solo_la_silueta(page: Page, base_url: str):
    abrir(page, base_url)
    tramos = page.evaluate("Portafolio.Rejilla.silueta([' .-. ', '[o_o]', ' /|\\\\ ', '\\\\___/'])")
    assert tramos == [[1, 3], [0, 4], [1, 3], [0, 4]]  # solo la forma de bit, no el rectángulo completo


@pytest.mark.parametrize("tema,esquema", [("light", "light"), ("dark", "dark")])
def test_color_scheme_declarado(page: Page, base_url: str, tema: str, esquema: str):
    abrir(page, base_url, tema=tema)
    assert page.locator("meta[name=color-scheme]").get_attribute("content") == "light dark"
    assert page.evaluate("getComputedStyle(document.documentElement).colorScheme") == esquema
    fondo = page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--fondo').trim()")
    assert page.locator("meta[name=theme-color]").get_attribute("content").lower() == fondo.lower()


@pytest.mark.parametrize("ancho", ANCHOS)
def test_etiquetas_de_criaturas_dentro(page: Page, base_url: str, ancho: int):
    abrir(page, base_url, ancho=ancho)
    page.locator(".acuario").scroll_into_view_if_needed()
    page.wait_for_timeout(1500)
    e = estado(page)
    cols = ancho / e["cw"]
    vistas = [c["etiqueta"] for c in e["ecosistema"]["criaturas"] if c["etiqueta"]]
    assert vistas, "no se vio ninguna criatura"
    assert all(t["desde"] >= 0 and t["hasta"] <= cols + 0.5 for t in vistas)


@pytest.mark.parametrize("ancho", ANCHOS)
def test_globo_no_tapa_islas(page: Page, base_url: str, ancho: int):
    abrir(page, base_url, ancho=ancho)
    ir_al_horizonte(page)
    page.wait_for_function("Portafolio.Oceano.estado().globo !== null")
    g = estado(page)["globo"]
    for i in range(page.locator(".isla").count()):
        isla = (
            page.locator(".isla")
            .nth(i)
            .evaluate("e => { const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height}; }")
        )
        cruza = (
            g["x"] < isla["x"] + isla["w"]
            and isla["x"] < g["x"] + g["ancho"]
            and g["y"] < isla["y"] + isla["h"]
            and isla["y"] < g["y"] + g["alto"]
        )
        assert not cruza, f"el globo tapa la isla {i}"


@pytest.mark.parametrize("ancho", ANCHOS)
def test_hitos_sin_texto_cortado(page: Page, base_url: str, ancho: int):
    abrir(page, base_url, "sobre-mi.html", ancho=ancho)
    for hito in ["grado", "banco", "cs50x", "red", "sellos", "obra"]:
        page.locator(f"#hito-{hito}").scroll_into_view_if_needed()
        page.wait_for_timeout(700)
    assert page.evaluate("Portafolio.SobreMi.estado().desbordes") == 0
