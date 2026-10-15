"""QA (ti-probar, 2026-10-15) · Recorridos críticos del portafolio, como los haría cada visitante.

Matrices: tema claro y oscuro (prefers-color-scheme), 390 · 768 · 1440 px, «reducir movimiento» y solo teclado.
Sitio estático servido en local (conftest.py); YouTube y Formspree se responden con dobles, nunca con la red real.
Cada recorrido revisa además: sin errores de consola, sin respuestas 4xx/5xx inesperadas y sin desborde horizontal.
Se corren con: uv run pytest -m e2e
"""

import pytest
from conftest import ARRANQUE_VISTO
from playwright.sync_api import Browser, Page, expect

pytestmark = pytest.mark.e2e

TEMAS = ["light", "dark"]
ANCHOS = [390, 768, 1440]
ALTO = {390: 844, 768: 1024, 1440: 900}
SIN_DESBORDE = "document.documentElement.scrollWidth <= window.innerWidth"


class Visita:
    """Una visita nueva: contexto propio, tema del sistema, ancho, y registro de errores de consola y de red."""

    def __init__(self, browser: Browser, base_url: str, ancho: int, tema: str = "light", reducir: bool = False):
        movil = ancho < 700
        self.contexto = browser.new_context(
            viewport={"width": ancho, "height": ALTO.get(ancho, 900)},
            color_scheme=tema,
            reduced_motion="reduce" if reducir else "no-preference",
            is_mobile=movil,
            has_touch=movil,
            accept_downloads=True,
        )
        self.contexto.add_init_script(ARRANQUE_VISTO)
        self.page = self.contexto.new_page()
        self.base = base_url
        self.ancho = ancho
        self.errores: list[str] = []
        self.page.on("pageerror", lambda e: self.errores.append(f"js: {e}"))
        self.page.on("console", self._consola)
        self.page.on(
            "response",
            lambda r: (
                self.errores.append(f"red {r.status}: {r.url}")
                if r.status >= 400 and r.url.startswith(base_url) and "no-existe" not in r.url
                else None
            ),
        )
        # dobles: ni YouTube ni Formspree salen a la red
        self.page.route("**/youtube-nocookie.com/**", lambda ruta: ruta.fulfill(body="<html><body>video</body></html>"))
        self.page.route(
            "**/formspree.io/**",
            lambda ruta: ruta.fulfill(status=200, content_type="application/json", body='{"ok": true}'),
        )

    def _consola(self, mensaje) -> None:
        # el 404 del propio documento al pedir a propósito una ruta inexistente es lo esperado (R5)
        esperado = "404" in mensaje.text and "no-existe" in (mensaje.location or {}).get("url", "")
        # Chromium del CI anota a veces este aviso al montar el iframe del video; el sitio no pide esa función
        esperado = esperado or "compute-pressure is not allowed" in mensaje.text
        if mensaje.type == "error" and not esperado:
            self.errores.append(f"consola: {mensaje.text}")

    def ir(self, ruta: str) -> Page:
        self.page.goto(f"{self.base}/{ruta}")
        self.page.wait_for_function("window.Portafolio && Portafolio.Paginas")
        return self.page

    def sin_desborde(self, donde: str) -> None:
        assert self.page.evaluate(SIN_DESBORDE), f"desborde horizontal: {donde} a {self.ancho} px"

    def cerrar(self) -> None:
        errores = list(self.errores)
        self.contexto.close()
        assert not errores, errores


def abrir_menu_si_hace_falta(page: Page) -> Page:
    """En anchos con [≡] las páginas, el contacto y la terminal están en el menú lateral."""
    if page.locator(".barra .boton-menu").is_visible():
        page.locator(".barra .boton-menu").click()
        expect(page.locator("#menu-movil")).to_be_visible()
    return page


def zona_de_navegacion(page: Page):
    return page.locator("#menu-movil") if page.locator("#menu-movil").is_visible() else page.locator(".barra nav")


# ---------- R1 · El docente revisa lo que pide la guía en el inicio ----------


@pytest.mark.parametrize("tema", TEMAS)
@pytest.mark.parametrize("ancho", ANCHOS)
def test_r1_inicio_cumple_la_guia(browser, base_url, ancho, tema):
    v = Visita(browser, base_url, ancho, tema)
    page = v.ir("index.html")
    assert page.evaluate("document.documentElement.getAttribute('data-bs-theme')") == (
        "dark" if tema == "dark" else "light"
    )
    # encabezado: título y descripción
    expect(page.locator("h1#titulo-inicio")).to_contain_text("Juan David")
    expect(page.locator(".portada-lema")).to_be_visible()
    # Sobre mí y Habilidades con íconos de Font Awesome
    expect(page.locator("#sobre-mi")).to_have_count(1)
    habilidades = page.locator(".habilidades li")
    assert habilidades.count() >= 8
    for i in range(habilidades.count()):
        expect(habilidades.nth(i).locator("i[class*='fa-']")).to_have_count(1)
    # pie: contacto y redes
    pie = page.locator(".pie")
    expect(pie.locator('a[href^="mailto:"]')).to_be_visible()
    expect(pie.locator('a[href="https://github.com/ffdalsu"]')).to_be_visible()
    # menú superior con enlaces a las otras páginas (en el celular, dentro de [≡])
    abrir_menu_si_hace_falta(page)
    nav = zona_de_navegacion(page)
    expect(nav.get_by_role("link", name="sobre mí")).to_be_visible()
    expect(nav.get_by_role("link", name="proyectos")).to_be_visible()
    v.sin_desborde("inicio con el menú abierto")
    v.cerrar()


# ---------- R2 · El docente abre los proyectos y un video en la ventana modal (jQuery) ----------


@pytest.mark.parametrize("tema", TEMAS)
@pytest.mark.parametrize("ancho", ANCHOS)
def test_r2_proyectos_y_video_en_modal(browser, base_url, ancho, tema):
    v = Visita(browser, base_url, ancho, tema)
    page = v.ir("projects.html")
    proyectos = page.locator(".proyecto")
    assert proyectos.count() >= 3
    for i in range(proyectos.count()):
        expect(proyectos.nth(i).locator("h2")).not_to_be_empty()
        expect(proyectos.nth(i).locator(".proyecto-cuerpo > p").first).not_to_be_empty()
    boton = proyectos.first.get_by_role("button", name="ver video")
    boton.scroll_into_view_if_needed()
    boton.click()
    modal = page.locator(".modal.show")
    expect(modal).to_be_visible()
    assert "youtube-nocookie.com/embed/" in (modal.locator("iframe").get_attribute("src") or "")
    v.sin_desborde("proyectos con el video abierto")
    page.locator(".modal.show").get_by_role("button", name="[ cerrar ]").click()
    expect(page.locator(".modal.show")).to_have_count(0)
    # al cerrar, el iframe se vacía: el video deja de sonar
    assert page.locator("#modal-video iframe, .modal iframe").first.get_attribute("src") is None
    v.cerrar()


# ---------- R3 · Un reclutador descarga la hoja de vida ----------


@pytest.mark.parametrize("ancho", ANCHOS)
def test_r3_reclutador_descarga_la_hoja_de_vida(browser, base_url, ancho, tmp_path):
    v = Visita(browser, base_url, ancho)
    page = v.ir("index.html")
    enlace = page.locator(".acciones-sobre .descargar-cv")
    enlace.scroll_into_view_if_needed()
    with page.expect_download() as descarga:
        enlace.click()
    archivo = tmp_path / descarga.value.suggested_filename
    descarga.value.save_as(archivo)
    contenido = archivo.read_bytes()
    assert contenido[:5] == b"%PDF-" and len(contenido) > 20_000
    # la ficha de Sobre mí ofrece lo mismo
    page = v.ir("sobre-mi.html")
    expect(page.locator("#ficha .descargar-cv")).to_be_visible()
    v.cerrar()


# ---------- R4 · Alguien escribe por el formulario de contacto ----------


@pytest.mark.parametrize("ancho", ANCHOS)
def test_r4_contacto_valida_y_envia(browser, base_url, ancho):
    v = Visita(browser, base_url, ancho)
    page = v.ir("sobre-mi.html")
    page.locator(".pie .abrir-contacto").scroll_into_view_if_needed()
    page.locator(".pie .abrir-contacto").click()
    expect(page.locator("#contacto-nombre")).to_be_focused()
    v.sin_desborde("contacto abierto")
    page.get_by_role("button", name="enviar").click()
    expect(page.locator("#contacto-correo")).to_have_attribute("aria-invalid", "true")
    expect(page.locator("#log-contacto")).to_contain_text("✗")
    page.locator("#contacto-nombre").fill("Ana Gómez")
    page.locator("#contacto-correo").fill("ana@ejemplo.com")
    page.locator("#contacto-mensaje").fill("Hola, vi tu portafolio y me gustaría hablar.")
    page.get_by_role("button", name="enviar").click()
    expect(page.locator("#log-contacto")).to_contain_text("mensaje enviado")
    v.cerrar()


# ---------- R5 · Navegar entre páginas, volver atrás y perderse ----------


@pytest.mark.parametrize("ancho", ANCHOS)
def test_r5_navegar_volver_y_404(browser, base_url, ancho):
    v = Visita(browser, base_url, ancho)
    page = v.ir("index.html")
    for nombre, pagina in [("sobre mí", "sobre-mi"), ("proyectos", "proyectos")]:
        abrir_menu_si_hace_falta(page)
        zona_de_navegacion(page).get_by_role("link", name=nombre).click()
        page.wait_for_function(f"document.querySelector('main').dataset.pagina === '{pagina}'")
        expect(page.locator("main h1")).to_be_visible()
    page.go_back()
    page.wait_for_function("document.querySelector('main').dataset.pagina === 'sobre-mi'")
    page.goto(f"{base_url}/ruta/que/no-existe")
    expect(page.locator("main h1")).to_have_text("404")
    page.locator(".aviso404").get_by_role("link", name="volver al inicio").click()
    page.wait_for_function("document.querySelector('main').dataset.pagina === 'inicio'")
    v.cerrar()


# ---------- R6 · La terminal: abrir sin bajar al pie y navegar con comandos ----------


@pytest.mark.parametrize("ancho", ANCHOS)
def test_r6_terminal(browser, base_url, ancho):
    v = Visita(browser, base_url, ancho)
    page = v.ir("projects.html")
    if page.locator(".barra .boton-terminal").is_visible():
        page.locator(".barra .boton-terminal").click()
    else:
        abrir_menu_si_hace_falta(page)
        page.locator("#menu-movil .abrir-terminal").click()
    expect(page.locator("#terminal")).to_be_visible()
    v.sin_desborde("terminal abierta")
    page.locator("#terminal-entrada").fill("cd sobre-mi")
    page.locator("#terminal-entrada").press("Enter")
    page.wait_for_function("document.querySelector('main').dataset.pagina === 'sobre-mi'")
    expect(page.locator("#terminal")).to_be_visible()
    page.locator("#terminal-entrada").fill("help")
    page.locator("#terminal-entrada").press("Enter")
    expect(page.locator("#terminal")).to_contain_text("┤ navegar ├")
    page.locator("#terminal-entrada").press("Escape")
    expect(page.locator("#terminal")).to_be_hidden()
    v.cerrar()


# ---------- R7 · Solo teclado: saltar, navegar, abrir y cerrar un video ----------


def test_r7_solo_teclado(browser, base_url):
    v = Visita(browser, base_url, 1440)
    page = v.ir("index.html")
    page.keyboard.press("Tab")
    expect(page.locator(".saltar")).to_be_focused()
    page.keyboard.press("Enter")
    expect(page.locator("main#contenido")).to_be_focused()
    # a Proyectos con el teclado
    page.locator(".barra .menu").get_by_role("link", name="proyectos").focus()
    page.keyboard.press("Enter")
    page.wait_for_function("document.querySelector('main').dataset.pagina === 'proyectos'")
    expect(page.locator("main h1")).to_be_focused()
    boton = page.locator(".proyecto .boton-video").nth(1)
    boton.focus()
    page.keyboard.press("Enter")
    page.wait_for_function("document.activeElement && document.activeElement.closest('.modal.show')")
    page.keyboard.press("Escape")
    expect(page.locator(".modal.show")).to_have_count(0)
    expect(boton).to_be_focused()
    # el foco siempre se ve
    estilo = page.evaluate("getComputedStyle(document.activeElement).outlineStyle")
    assert estilo != "none"
    v.cerrar()


# ---------- R8 · Con «reducir movimiento» todo funciona y nada se anima ----------


@pytest.mark.parametrize("tema", TEMAS)
def test_r8_movimiento_reducido(browser, base_url, tema):
    v = Visita(browser, base_url, 1440, tema, reducir=True)
    page = v.ir("index.html")
    assert page.evaluate("Portafolio.Velo.estado().modo") == "ninguno"
    page.locator(".barra .menu").get_by_role("link", name="proyectos").click()
    page.wait_for_function("document.querySelector('main').dataset.pagina === 'proyectos'")
    assert page.evaluate("Portafolio.Velo.estado().usos") == 0
    expect(page.locator(".proyecto").first).to_be_visible()
    v.cerrar()


# ---------- Sin desborde con cada menú, cajón y modal abierto ----------


@pytest.mark.parametrize("ancho", [390, 768])
def test_sin_desborde_con_todo_abierto(browser, base_url, ancho):
    v = Visita(browser, base_url, ancho)
    for pagina in ["index.html", "sobre-mi.html", "projects.html", "404.html"]:
        page = v.ir(pagina)
        v.sin_desborde(f"{pagina} cerrado")
        page.locator(".barra .boton-menu").click()
        expect(page.locator("#menu-movil")).to_be_visible()
        v.sin_desborde(f"{pagina} con el menú lateral")
        page.locator("#menu-movil").get_by_role("button", name="Cerrar el menú").click()
        expect(page.locator("#menu-movil")).to_be_hidden()
    v.cerrar()
