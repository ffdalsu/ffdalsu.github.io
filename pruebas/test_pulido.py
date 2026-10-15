"""F18 · Pulido: lo que pidió JD (terminal a la vista, hoja de vida visible) y lo que halló la crítica (teclado,
lectores de pantalla, sonda, criaturas, formulario, celular y fechas reales)."""

import pytest
from conftest import ARRANQUE_VISTO
from playwright.sync_api import Page, expect
from portada_ayuda import LISTO

GITHUB = "https://github.com/ffdalsu"


@pytest.fixture
def inicio(page: Page, base_url: str) -> Page:
    page.set_viewport_size({"width": 1440, "height": 900})
    page.goto(f"{base_url}/index.html")
    page.wait_for_function(LISTO)
    return page


# ---------- terminal a la vista (D38) ----------


def test_boton_terminal_en_la_barra(inicio: Page):
    boton = inicio.locator(".barra .boton-terminal")
    expect(boton).to_be_visible()
    expect(boton).to_have_attribute("aria-keyshortcuts", "/")
    inicio.evaluate("window.scrollTo(0, document.body.scrollHeight)")  # la barra es fija: sigue a la vista abajo
    boton.click()
    expect(inicio.locator("#terminal")).to_be_visible()


@pytest.mark.parametrize("ancho", [768, 800, 1024, 1101, 1279, 1280, 1440])
def test_barra_en_una_fila(page: Page, base_url: str, ancho: int):
    page.set_viewport_size({"width": ancho, "height": 800})
    page.goto(f"{base_url}/sobre-mi.html")
    assert page.evaluate("document.querySelector('.barra').offsetHeight") <= 64
    expect(page.locator(".barra .boton-terminal")).to_be_visible()
    con_menu = ancho < 1280  # D38 ajustado: tema y sonido no caben en la barra por debajo de 1280 px
    assert page.locator(".barra .controles").is_visible() is not con_menu
    assert page.locator(".barra .boton-menu").is_visible() is con_menu


def test_en_celular_la_terminal_va_en_el_menu(page: Page, base_url: str):
    page.set_viewport_size({"width": 390, "height": 844})
    page.goto(f"{base_url}/index.html")
    expect(page.locator(".barra .boton-terminal")).to_be_hidden()
    expect(page.locator("#menu-movil .abrir-terminal")).to_have_count(1)


def test_help_agrupado_con_cv_y_github(inicio: Page):
    inicio.keyboard.press("/")
    inicio.locator("#terminal-entrada").fill("help")
    inicio.locator("#terminal-entrada").press("Enter")
    lineas = inicio.evaluate("Portafolio.Terminal.estado().lineas")
    texto = "\n".join(lineas)
    for grupo in ["┤ navegar ├", "┤ sitio ├", "┤ consola ├"]:
        assert grupo in texto
    assert any(line.strip().startswith("cv ") for line in lineas)
    assert any(line.strip().startswith("github ") for line in lineas)


def test_cv_y_github_desde_la_terminal(inicio: Page):
    # (termina en «true»: si la expresión devolviera la función, Playwright la ejecutaría)
    inicio.evaluate("window.abiertas = []; window.open = (url) => { window.abiertas.push(url); return null; }; true")
    inicio.keyboard.press("/")
    with inicio.expect_download() as descarga:
        inicio.locator("#terminal-entrada").fill("cv")
        inicio.locator("#terminal-entrada").press("Enter")
    assert descarga.value.suggested_filename == "hoja-de-vida-juan-david.pdf"
    inicio.locator("#terminal-entrada").fill("github")
    inicio.locator("#terminal-entrada").press("Enter")
    assert inicio.evaluate("window.abiertas") == [GITHUB]


# ---------- hoja de vida y GitHub visibles (D39, D43) ----------


@pytest.mark.parametrize(
    "pagina,selector", [("sobre-mi.html", "#ficha .descargar-cv"), ("index.html", ".acciones-sobre .descargar-cv")]
)
def test_boton_descarga_la_hoja_de_vida(page: Page, base_url: str, pagina: str, selector: str):
    page.goto(f"{base_url}/{pagina}")
    boton = page.locator(selector)
    expect(boton).to_be_visible()
    with page.expect_download() as descarga:
        boton.click()
    assert descarga.value.suggested_filename == "hoja-de-vida-juan-david.pdf"


def test_github_en_el_pie_y_la_ficha(page: Page, base_url: str):
    page.goto(f"{base_url}/sobre-mi.html")
    expect(page.locator(f'.pie a[href="{GITHUB}"]')).to_be_visible()
    expect(page.locator(f'#ficha a[href="{GITHUB}"]')).to_be_visible()


def test_fechas_reales(page: Page, base_url: str):
    """D41: las fechas que dio JD reemplazan las de muestra (D21) en Mi historia, los diplomas y la hoja de vida."""
    page.goto(f"{base_url}/sobre-mi.html")
    fechas = [f.strip() for f in page.locator(".hito-fecha").all_inner_texts()]
    assert fechas == ["2021", "2024", "2024", "2024 – 2025", "2025", "2026 – hoy"]
    assert page.locator(".diploma-cursos").all_inner_texts() == [
        "CS50x + CS50P · 2025",
        "CS50x + CS50 SQL · 2025",
        "CS50x + CS50AI · 2025",
    ]
    cv = page.locator(".cv-impresion").text_content()
    for dato in ["2026 – hoy", "2024 – 2026", "2021", "2024 – 2025"]:
        assert dato in cv


# ---------- teclado y lectores de pantalla ----------


def test_saltar_al_contenido(page: Page, base_url: str):
    page.goto(f"{base_url}/projects.html")
    page.keyboard.press("Tab")
    saltar = page.locator(".saltar")
    expect(saltar).to_be_focused()
    expect(saltar).to_be_visible()
    page.keyboard.press("Enter")
    expect(page.locator("main#contenido")).to_be_focused()


def test_foco_vuelve_al_cerrar_el_contacto(page: Page, base_url: str):
    page.goto(f"{base_url}/sobre-mi.html")
    boton = page.locator(".pie .abrir-contacto")
    boton.focus()
    page.keyboard.press("Enter")
    expect(
        page.locator("#contacto-nombre")
    ).to_be_focused()  # el modal terminó de abrir (Bootstrap ignora Esc mientras anima)
    page.keyboard.press("Escape")
    expect(page.locator("#modal-contacto")).to_be_hidden()
    expect(boton).to_be_focused()


def test_foco_vuelve_al_cerrar_un_video(page: Page, base_url: str):
    page.goto(f"{base_url}/projects.html")
    boton = page.locator(".proyecto .boton-video").first
    boton.focus()
    page.keyboard.press("Enter")
    page.wait_for_function(
        "document.activeElement && document.activeElement.closest('.modal.show')"
    )  # terminó de abrir
    page.keyboard.press("Escape")
    expect(page.locator(".modal.show")).to_have_count(0)
    expect(boton).to_be_focused()


def test_lectores_oyen_el_texto_real(inicio: Page):
    python = inicio.locator("[data-criatura=python]")
    python.scroll_into_view_if_needed()
    assert python.get_attribute("aria-label") == "Python"
    python.hover()  # se revuelve el texto visible; el nombre accesible no cambia
    assert python.get_attribute("aria-label") == "Python"
    # el título que recibe el foco tras navegar se descifra con su nombre real como aria-label
    inicio.locator(".barra .menu").get_by_role("link", name="proyectos").click()
    inicio.wait_for_function("document.querySelector('main').dataset.pagina === 'proyectos'")
    titulo = inicio.locator("main h1")
    etiqueta = titulo.get_attribute("aria-label")
    assert etiqueta in (None, "Proyectos")  # mientras se descifra dice «Proyectos»; al terminar se quita
    expect(titulo).to_have_text("Proyectos")


def test_formulario_marca_los_campos_con_error(page: Page, base_url: str):
    page.goto(f"{base_url}/sobre-mi.html")
    page.locator(".pie .abrir-contacto").click()
    expect(page.locator("#contacto-nombre")).to_be_focused()
    page.locator("#form-contacto button[type=submit]").click()
    for campo in ["#contacto-nombre", "#contacto-correo", "#contacto-mensaje"]:
        expect(page.locator(campo)).to_have_attribute("aria-invalid", "true")
        expect(page.locator(campo)).to_have_attribute("aria-describedby", "log-contacto")
    expect(page.locator("#contacto-nombre")).to_be_focused()
    page.locator("#contacto-nombre").fill("Ana")
    page.locator("#form-contacto button[type=submit]").click()
    assert page.locator("#contacto-nombre").get_attribute("aria-invalid") is None


# ---------- inicio: sonda y criaturas ----------


def test_sonda_se_va_al_llegar_al_pie(inicio: Page):
    sonda = inicio.locator("#sonda")
    assert "oculta" not in (sonda.get_attribute("class") or "")
    inicio.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    expect(sonda).to_have_class("sonda oculta")


def test_sin_sonda_en_celular(page: Page, base_url: str):
    page.set_viewport_size({"width": 390, "height": 844})
    page.goto(f"{base_url}/index.html")
    page.wait_for_function(LISTO)
    expect(page.locator("#sonda")).to_be_hidden()


def test_criatura_nada_hasta_la_lista(inicio: Page):
    item = inicio.locator("[data-criatura=python]")
    item.scroll_into_view_if_needed()
    item.focus()
    inicio.wait_for_timeout(1500)
    datos = inicio.evaluate(
        "(() => { const e = Portafolio.Oceano.estado(); const k = e.ecosistema.criaturas.find(c => c.nombre === 'Python');"
        " return { fila: k.fila, ch: e.bit.ch, activa: k.activa, alto: innerHeight }; })()"
    )
    assert datos["activa"]
    assert 0 <= datos["fila"] * datos["ch"] <= datos["alto"], datos  # su criatura está en pantalla


# ---------- celular: dedos y pistas ----------


def test_areas_tactiles_en_celular(browser, base_url: str):
    contexto = browser.new_context(viewport={"width": 390, "height": 844}, has_touch=True, is_mobile=True)
    contexto.add_init_script(ARRANQUE_VISTO)
    page = contexto.new_page()
    page.goto(f"{base_url}/sobre-mi.html")
    altos = page.evaluate(
        "[...document.querySelectorAll('.pie .envoltura > a:not([hidden]), .pie .enlace, .marca')]"
        ".map(e => Math.round(e.getBoundingClientRect().height))"
    )
    assert altos and min(altos) >= 24, altos
    page.goto(f"{base_url}/projects.html")  # «esc para cerrar» vive en el modal de video
    expect(page.locator(".modal-ayuda").first).to_have_css("visibility", "hidden")
    contexto.close()
