"""F17a · Secuencia de arranque: una vez por sesión, se salta, no deja ver la página debajo y el audio la espera."""

import re
from pathlib import Path

import pytest
from playwright.sync_api import Page, expect

SITIO = Path(__file__).resolve().parent.parent / "sitio"
ACTIVO = "Portafolio.Arranque && Portafolio.Arranque.estado().activo"
TERMINO = "document.querySelector('.arranque') === null && !document.documentElement.classList.contains('arrancando')"


def test_arranque_aparece_en_la_primera_visita(page: Page, base_url: str):
    page.goto(f"{base_url}/projects.html")
    expect(page.locator(".arranque")).to_be_visible()
    page.wait_for_function("Portafolio.Arranque.estado().fase === 'saluda'")
    assert "[ ok ] despertando a bit" in page.locator(".arranque-log").inner_text()
    assert len(page.locator(".arranque-bit").inner_text().splitlines()) == 44
    page.wait_for_function(TERMINO, timeout=5000)
    assert page.evaluate("sessionStorage.getItem('arranque')") == "visto"


def test_arranque_una_vez_por_sesion(page: Page, base_url: str):
    page.goto(f"{base_url}/index.html")
    page.wait_for_function(TERMINO, timeout=5000)
    page.goto(f"{base_url}/sobre-mi.html")  # carga completa: ya no aparece
    page.wait_for_function("window.Portafolio && Portafolio.Arranque")
    assert page.locator(".arranque").count() == 0
    assert page.evaluate("Portafolio.Arranque.estado().activo") is False


@pytest.mark.parametrize("gesto", ["Escape", "a", "clic"])
def test_arranque_se_salta_con_esc_clic_o_tecla(page: Page, base_url: str, gesto: str):
    page.goto(f"{base_url}/index.html")
    page.wait_for_function(ACTIVO)
    if gesto == "clic":
        page.mouse.click(300, 300)
    else:
        page.keyboard.press(gesto)
    page.wait_for_function(TERMINO, timeout=1000)
    assert page.evaluate("Portafolio.Arranque.estado().saltado") is True


def test_sin_destello_del_contenido(page: Page, base_url: str):
    # el CSS bloquea el pintado: en cuanto la página está lista para pintarse, el contenido ya está oculto
    page.goto(f"{base_url}/index.html", wait_until="domcontentloaded")
    assert page.evaluate("document.documentElement.classList.contains('arrancando')")
    assert page.evaluate("getComputedStyle(document.querySelector('main')).visibility") == "hidden"
    page.wait_for_function(TERMINO, timeout=5000)
    expect(page.locator("main")).to_be_visible()


def test_seguro_si_no_carga_el_script(page: Page, base_url: str):
    page.route(re.compile(r".*/js/arranque\.js.*"), lambda ruta: ruta.abort())
    page.goto(f"{base_url}/index.html")
    assert page.evaluate("document.documentElement.classList.contains('arrancando')")
    page.wait_for_function("!document.documentElement.classList.contains('arrancando')", timeout=6000)
    expect(page.locator("main")).to_be_visible()


def test_teclas_no_llegan_a_la_terminal(page: Page, base_url: str):
    page.goto(f"{base_url}/index.html")
    page.wait_for_function(ACTIVO)
    page.keyboard.press("/")
    page.wait_for_function(TERMINO, timeout=1000)
    expect(page.locator(".terminal")).to_be_hidden()


def test_musica_espera_al_arranque(browser_type, base_url: str):
    """Con la música ya activada y un navegador que deja sonar sin clic: no suena hasta que el arranque termina."""
    navegador = browser_type.launch(args=["--autoplay-policy=no-user-gesture-required"])
    page = navegador.new_page()
    page.add_init_script("try { localStorage.setItem('sonido', 'todo'); } catch (e) {}")
    page.goto(f"{base_url}/sobre-mi.html")
    page.wait_for_function("Portafolio.Arranque.estado().fase === 'revela'")
    assert page.evaluate("Portafolio.Sonido.estado().musica") is False
    page.wait_for_function(TERMINO, timeout=5000)
    page.wait_for_function("Portafolio.Sonido.estado().musica === true")
    navegador.close()


def test_movimiento_reducido_cuadro_quieto(page: Page, base_url: str):
    page.emulate_media(reduced_motion="reduce")
    page.goto(f"{base_url}/index.html")
    page.wait_for_function(ACTIVO)
    primero = page.locator(".arranque-bit").inner_text()
    page.wait_for_timeout(300)
    assert page.locator(".arranque-bit").inner_text() == primero  # no se mueve
    assert len(page.locator(".arranque-log").inner_text().splitlines()) == 5
    page.wait_for_function(TERMINO, timeout=3000)


@pytest.mark.parametrize("ancho,alto", [(390, 844), (1440, 900)])
def test_bit_grande_cabe_en_390_y_1440(page: Page, base_url: str, ancho: int, alto: int):
    page.set_viewport_size({"width": ancho, "height": alto})
    page.goto(f"{base_url}/index.html")
    page.wait_for_function("Portafolio.Arranque.estado().fase === 'saluda'")
    caja = page.evaluate(
        "(() => { const v = document.querySelector('.arranque-ventana').getBoundingClientRect();"
        " const b = document.querySelector('.arranque-bit').getBoundingClientRect();"
        " const l = document.querySelector('.arranque-log').getBoundingClientRect();"
        " return {v: [v.left, v.top, v.right, v.bottom], b: [b.left, b.top, b.right, b.bottom], logAbajo: l.bottom}; })()"
    )
    v, b = caja["v"], caja["b"]
    assert b[0] >= v[0] and b[2] <= v[2] and b[3] <= v[3], caja
    assert b[1] >= caja["logAbajo"] - 1, caja  # bit no tapa el registro
    assert page.evaluate("document.documentElement.scrollWidth") <= ancho


def test_cifras_del_registro_son_las_del_sitio():
    log = (SITIO / "js" / "arranque.js").read_text(encoding="utf-8")
    habilidades = (SITIO / "index.html").read_text(encoding="utf-8").count("data-criatura=")
    proyectos = (SITIO / "projects.html").read_text(encoding="utf-8").count('class="proyecto"')
    assert f"{habilidades} habilidades" in log
    assert f"{proyectos} proyectos" in log
