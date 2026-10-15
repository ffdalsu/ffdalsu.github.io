"""F17a · Favicon vivo: bit en la pestaña parpadea, mueve olas con la música y se duerme con la pestaña oculta."""

from playwright.sync_api import Page

LISTO = "window.Portafolio && Portafolio.Favicon && Portafolio.Paginas"


def favicon(page: Page) -> dict:
    return page.evaluate("Portafolio.Favicon.estado()")


def test_favicon_es_png_de_bit(page: Page, base_url: str):
    page.goto(f"{base_url}/sobre-mi.html")
    page.wait_for_function(LISTO)
    enlace = page.evaluate(
        "(() => { const l = document.querySelector('link[rel=icon]'); return [l.type, l.href.slice(0, 22)]; })()"
    )
    assert enlace == ["image/png", "data:image/png;base64,"]
    assert favicon(page)["cara"] == "abierto"


def test_favicon_parpadea(page: Page, base_url: str):
    page.clock.install()
    page.goto(f"{base_url}/index.html")
    page.wait_for_function(LISTO)
    caras = set()
    for _ in range(45):  # 4,5 s en pasos de 100 ms
        page.clock.run_for(100)
        caras.add(favicon(page)["cara"])
    assert {"abierto", "parpadeo"} <= caras


def test_favicon_olas_con_musica(page: Page, base_url: str):
    page.goto(f"{base_url}/index.html")
    page.wait_for_function(LISTO)
    assert favicon(page)["olas"] is False
    page.locator(".barra .opcion-sonido[data-sonido=todo]").click()
    page.wait_for_function("Portafolio.Sonido.estado().musica === true")
    page.wait_for_function("Portafolio.Favicon.estado().olas === true", timeout=2000)
    cuadros = favicon(page)["cuadros"]
    page.wait_for_timeout(900)
    assert favicon(page)["cuadros"] > cuadros  # las olas se mueven


def test_favicon_duerme_con_pestana_oculta(page: Page, base_url: str):
    page.goto(f"{base_url}/index.html")
    page.wait_for_function(LISTO)
    page.evaluate(
        "Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });"
        " document.dispatchEvent(new Event('visibilitychange'))"
    )
    assert favicon(page)["cara"] == "duerme"
    page.evaluate(
        "Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });"
        " document.dispatchEvent(new Event('visibilitychange'))"
    )
    assert favicon(page)["cara"] == "abierto"
