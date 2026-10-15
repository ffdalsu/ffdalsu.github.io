"""Ayudas para las pruebas del inicio: llevar la portada al acto 2 (horizonte con bit y las islas)."""

from playwright.sync_api import Page

LISTO = "window.Portafolio && Portafolio.Oceano && Portafolio.Oceano.estado()"


def estado(page: Page) -> dict:
    return page.evaluate("Portafolio.Oceano.estado()")


def ir_al_horizonte(page: Page, con_reloj: bool = False) -> dict:
    """Baja 1,1 pantallas (la pausa del acto 2, donde la cámara se queda quieta) y devuelve el estado."""
    page.evaluate("window.scrollTo(0, window.innerHeight * 1.1)")
    if con_reloj:
        page.clock.run_for(600)
    else:
        page.wait_for_function("Portafolio.Oceano.estado().acto === 2")
        page.wait_for_timeout(400)
    return estado(page)


def y_del_agua(page: Page, filas_bajo_superficie: float = 4) -> float:
    """Coordenada y (px de pantalla) de un punto del agua, unas filas por debajo de la superficie."""
    e = estado(page)
    return (e["horizonte"] + filas_bajo_superficie) * e["bit"]["ch"]
