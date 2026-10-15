"""F17b · Página 404: GitHub Pages la sirve en cualquier ruta que no exista; carga bien aunque la ruta esté anidada."""

from playwright.sync_api import Page, expect

LISTO = "window.Portafolio && Portafolio.Error404 && Portafolio.Error404.estado().activo"


def test_404_responde_con_la_pagina(page: Page, base_url: str):
    respuesta = page.goto(f"{base_url}/isla-perdida")
    assert respuesta is not None and respuesta.status == 404
    page.wait_for_function(LISTO)
    expect(page.locator("main h1")).to_have_text("404")
    expect(page.locator(".linea404").first).to_have_text("esta isla no está en el mapa.")
    expect(page.locator(".ventana-404-barra")).to_contain_text("/isla-perdida")
    assert page.locator(".mar404").inner_text().strip() != ""


def test_404_desde_ruta_anidada_carga_estilos(page: Page, base_url: str):
    errores = []
    page.on("pageerror", lambda e: errores.append(str(e)))
    page.goto(f"{base_url}/una/ruta/que/no/existe")
    page.wait_for_function(LISTO)
    # los estilos del sitio cargaron (con <base href="/">): la barra usa la fuente del sitio y la 404 su caja
    assert "IBM Plex Mono" in page.evaluate("getComputedStyle(document.body).fontFamily")
    assert page.evaluate("getComputedStyle(document.querySelector('.ventana-404')).borderTopStyle") == "solid"
    expect(page.locator(".ventana-404-barra")).to_contain_text("/una/ruta/que/no/existe")
    assert errores == []


def test_404_tres_salidas(page: Page, base_url: str):
    page.goto(f"{base_url}/a/b/c")
    page.wait_for_function(LISTO)
    salidas = page.locator(".aviso404 a")
    expect(salidas).to_have_count(3)
    page.evaluate("window.marca = 'misma'")
    salidas.filter(has_text="proyectos").click()
    page.wait_for_function("document.querySelector('main').dataset.pagina === 'proyectos'")
    expect(page).to_have_url(f"{base_url}/projects.html")
    assert page.evaluate("window.marca") == "misma"  # sin recargar: la música no se corta
    assert page.evaluate("Portafolio.Error404.estado().activo") is False  # el mar se desmontó


def test_404_mar_quieto_con_movimiento_reducido(page: Page, base_url: str):
    page.emulate_media(reduced_motion="reduce")
    page.goto(f"{base_url}/perdida")
    page.wait_for_function(LISTO)
    page.wait_for_timeout(400)
    assert page.evaluate("Portafolio.Error404.estado().cuadros") == 1
