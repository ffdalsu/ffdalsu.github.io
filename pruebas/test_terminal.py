"""F14 · Terminal interactiva: se abre con «/», ejecuta comandos, completa con Tab, recuerda el historial y navega."""

import pytest
from playwright.sync_api import Page, expect
from portada_ayuda import LISTO


@pytest.fixture
def inicio(page: Page, base_url: str) -> Page:
    page.set_viewport_size({"width": 1440, "height": 900})
    page.goto(f"{base_url}/index.html")
    page.wait_for_function(LISTO)
    return page


def comando(page: Page, texto: str) -> None:
    page.locator("#terminal-entrada").fill(texto)
    page.locator("#terminal-entrada").press("Enter")


def lineas(page: Page) -> str:
    return "\n".join(page.evaluate("Portafolio.Terminal.estado().lineas"))


def test_abre_con_barra(inicio: Page):
    inicio.keyboard.press("/")
    expect(inicio.locator("#terminal")).to_be_visible()
    expect(inicio.locator("#terminal-entrada")).to_be_focused()


def test_abre_con_el_boton_del_pie(page: Page, base_url: str):
    page.goto(f"{base_url}/sobre-mi.html")
    page.locator(".pie .abrir-terminal").click()
    expect(page.locator("#terminal")).to_be_visible()


def test_no_abre_si_hay_un_campo_enfocado(inicio: Page):
    inicio.locator(".pie .abrir-contacto").click()
    inicio.locator("#contacto-nombre").click()
    inicio.keyboard.press("/")
    expect(inicio.locator("#terminal")).to_be_hidden()
    expect(inicio.locator("#contacto-nombre")).to_have_value("/")


def test_help_lista_comandos(inicio: Page):
    inicio.keyboard.press("/")
    comando(inicio, "help")
    salida = lineas(inicio)
    for c in ["help", "whoami", "ls", "cat", "cd", "open", "tema", "contacto", "clear"]:
        assert c in salida


def test_cat_muestra_un_archivo(inicio: Page):
    inicio.keyboard.press("/")
    comando(inicio, "cat certificados.txt")
    assert "Computer Science for Artificial Intelligence" in lineas(inicio)


def test_open_abre_modal(inicio: Page, base_url: str):
    inicio.keyboard.press("/")
    inicio.route("**/youtube-nocookie.com/**", lambda ruta: ruta.fulfill(body="<html></html>"))
    comando(inicio, "open hermes")
    expect(inicio).to_have_url(f"{base_url}/projects.html#hermes")
    expect(inicio.locator("#modal-video")).to_be_visible()
    expect(inicio.locator("#modal-video iframe")).to_have_attribute(
        "src", "https://www.youtube-nocookie.com/embed/avlyP3T4LP0?autoplay=1&rel=0"
    )


def test_contacto_abre_formulario(inicio: Page):
    inicio.keyboard.press("/")
    comando(inicio, "contacto")
    expect(inicio.locator("#modal-contacto")).to_be_visible()
    expect(inicio.locator("#terminal")).to_be_hidden()


def test_tab_autocompleta(inicio: Page):
    inicio.keyboard.press("/")
    entrada = inicio.locator("#terminal-entrada")
    entrada.fill("whoa")
    entrada.press("Tab")
    expect(entrada).to_have_value("whoami ")
    entrada.fill("cat cert")
    entrada.press("Tab")
    expect(entrada).to_have_value("cat certificados.txt")


def test_historial_flechas(inicio: Page):
    inicio.keyboard.press("/")
    comando(inicio, "whoami")
    comando(inicio, "date")
    entrada = inicio.locator("#terminal-entrada")
    entrada.press("ArrowUp")
    expect(entrada).to_have_value("date")
    entrada.press("ArrowUp")
    expect(entrada).to_have_value("whoami")
    entrada.press("ArrowDown")
    expect(entrada).to_have_value("date")


def test_comando_desconocido_sugiere(inicio: Page):
    inicio.keyboard.press("/")
    comando(inicio, "hepl")
    assert "¿quisiste decir «help»?" in lineas(inicio)


def test_tema_desde_terminal(inicio: Page):
    inicio.keyboard.press("/")
    comando(inicio, "tema papel")
    expect(inicio.locator("html")).to_have_attribute("data-bs-theme", "light")
    comando(inicio, "tema ambar")
    expect(inicio.locator("html")).to_have_attribute("data-bs-theme", "dark")


def test_cd_navega_sin_recargar_y_sigue_abierta(inicio: Page, base_url: str):
    inicio.evaluate("window.marca = 'misma página'")
    inicio.keyboard.press("/")
    comando(inicio, "cd sobre-mi")
    inicio.wait_for_function("document.querySelector('main').dataset.pagina === 'sobre-mi'")
    expect(inicio).to_have_url(f"{base_url}/sobre-mi.html")
    expect(inicio.locator("#terminal")).to_be_visible()  # la terminal sobrevive al cambio de página
    assert "cd sobre-mi" in lineas(inicio)
    assert inicio.evaluate("window.marca") == "misma página"


def test_esc_cierra_y_devuelve_foco(inicio: Page):
    boton = inicio.locator(".pie .abrir-terminal")
    boton.focus()
    inicio.keyboard.press("Enter")
    expect(inicio.locator("#terminal")).to_be_visible()
    inicio.locator("#terminal-entrada").press("Escape")
    expect(inicio.locator("#terminal")).to_be_hidden()
    expect(boton).to_be_focused()


def test_terminal_en_el_menu_lateral(page: Page, base_url: str):
    page.set_viewport_size({"width": 390, "height": 844})
    page.goto(f"{base_url}/projects.html")
    page.locator(".boton-menu").click()
    page.locator("#menu-movil .abrir-terminal").click()
    expect(page.locator("#terminal")).to_be_visible()
    expect(page.locator("#menu-movil")).to_be_hidden()
