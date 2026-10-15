"""F5 · Proyectos: tarjetas con miniatura ASCII, modal de video abierto con jQuery y llegada desde las islas."""

import re

import pytest
from playwright.sync_api import Page, expect

ID_PRUEBA = "abc123XYZ00"


def abrir(page: Page, selector: str) -> None:
    """Hace clic en el botón y espera a que termine la animación de apertura (Bootstrap ignora el cierre mientras dura)."""
    page.evaluate("window.abierto = false; $('#modal-video').one('shown.bs.modal', () => { window.abierto = true; })")
    page.locator(selector).click()
    page.wait_for_function("window.abierto === true")


@pytest.fixture
def proyectos(page: Page, base_url: str) -> Page:
    page.set_viewport_size({"width": 1280, "height": 800})
    page.goto(f"{base_url}/projects.html")
    return page


def test_al_menos_tres_proyectos(proyectos: Page):
    tarjetas = proyectos.locator(".proyecto")
    assert tarjetas.count() >= 3
    for i in range(tarjetas.count()):
        t = tarjetas.nth(i)
        expect(t.locator("h2")).not_to_be_empty()
        expect(t.locator(".stack")).not_to_be_empty()
        expect(t.locator(".boton-video")).to_have_count(1)


def test_modal_abre_con_jquery(proyectos: Page):
    proyectos.evaluate(
        "() => { const original = $.fn.modal; window.llamadas = [];"
        " $.fn.modal = function (accion) { llamadas.push(accion); return original.apply(this, arguments); }; }"
    )
    proyectos.locator(".boton-video").first.click()
    expect(proyectos.locator("#modal-video")).to_be_visible()
    assert "show" in proyectos.evaluate("window.llamadas")


def test_modal_carga_video_correcto(proyectos: Page):
    proyectos.locator("#hermes .boton-video").evaluate(f"b => b.setAttribute('data-video-id', '{ID_PRUEBA}')")
    proyectos.route("**/youtube-nocookie.com/**", lambda ruta: ruta.fulfill(body="<html></html>"))
    proyectos.locator("#hermes .boton-video").click()
    iframe = proyectos.locator("#modal-video iframe")
    expect(iframe).to_have_attribute("src", f"https://www.youtube-nocookie.com/embed/{ID_PRUEBA}?autoplay=1&rel=0")
    expect(proyectos.locator("#modal-video-titulo")).to_contain_text("hermes")


def test_cerrar_detiene_video(proyectos: Page):
    proyectos.locator("#hermes .boton-video").evaluate(f"b => b.setAttribute('data-video-id', '{ID_PRUEBA}')")
    proyectos.route("**/youtube-nocookie.com/**", lambda ruta: ruta.fulfill(body="<html></html>"))
    abrir(proyectos, "#hermes .boton-video")
    proyectos.get_by_role("button", name="[ cerrar ]").click()
    expect(proyectos.locator("#modal-video")).to_be_hidden()
    assert proyectos.locator("#modal-video iframe").get_attribute("src") is None


def test_escape_cierra(proyectos: Page):
    abrir(proyectos, "#facturacion .boton-video")
    proyectos.keyboard.press("Escape")
    expect(proyectos.locator("#modal-video")).to_be_hidden()


def test_sin_video_muestra_estatica(proyectos: Page):
    # todos los proyectos ya tienen video; se le quita a uno para probar la pantalla de respaldo
    proyectos.locator("#portafolio .boton-video").evaluate("b => b.setAttribute('data-video-id', '')")
    proyectos.locator("#portafolio .boton-video").click()
    expect(proyectos.locator(".video-pendiente")).to_be_visible()
    expect(proyectos.locator("#modal-video iframe")).to_be_hidden()


def test_ancla_resalta_proyecto(page: Page, base_url: str):
    page.goto(f"{base_url}/projects.html#hermes")
    expect(page.locator("#hermes")).to_have_class("proyecto resaltado")


def test_miniaturas_se_dibujan(proyectos: Page):
    proyectos.wait_for_timeout(500)
    pintado = proyectos.evaluate(
        """() => { const c = document.querySelector('#facturacion canvas'), d = c.getContext('2d')
                     .getImageData(0, 0, c.width, c.height).data;
                   for (let i = 3; i < d.length; i += 4) if (d[i] > 0) return true; return false; }"""
    )
    assert pintado


@pytest.mark.parametrize("ancho", [375, 768, 1440])
def test_proyectos_sin_scroll_horizontal(page: Page, base_url: str, ancho: int):
    page.set_viewport_size({"width": ancho, "height": 800})
    page.goto(f"{base_url}/projects.html")
    assert page.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth") <= 0


def test_cada_proyecto_tiene_su_video(proyectos: Page):
    """Los 5 videos subidos a YouTube (no listados): cada botón lleva un ID de 11 caracteres y no se repiten."""
    ids = proyectos.locator(".boton-video").evaluate_all("bs => bs.map(b => b.dataset.videoId)")
    assert len(ids) == 5 and len(set(ids)) == 5
    assert all(re.fullmatch(r"[A-Za-z0-9_-]{11}", i) for i in ids)
