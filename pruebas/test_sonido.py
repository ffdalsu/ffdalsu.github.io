"""F9 · Sonido a: control de tres posiciones, audio solo con gesto, cada acción con su efecto y render determinista."""

import pytest
from playwright.sync_api import Page, expect
from portada_ayuda import LISTO, ir_al_horizonte, y_del_agua


def sonido(page: Page) -> dict:
    return page.evaluate("Portafolio.Sonido.estado()")


def activar(page: Page, modo: str = "efectos") -> None:
    page.locator(f".opcion-sonido[data-sonido={modo}]").click()
    page.wait_for_function("Portafolio.Sonido.estado().contexto !== null")


def abrir_contacto(page: Page) -> None:
    """Abre el modal y espera a que termine su animación (Bootstrap ignora Esc mientras dura)."""
    page.evaluate(
        "window.abierto = false; $('#modal-contacto').one('shown.bs.modal', () => { window.abierto = true; })"
    )
    page.locator(".pie .abrir-contacto").click()
    page.wait_for_function("window.abierto === true")


def sono(page: Page, nombre: str) -> bool:
    page.wait_for_timeout(150)
    return nombre in sonido(page)["ultimos"]


@pytest.fixture
def inicio(page: Page, base_url: str) -> Page:
    page.set_viewport_size({"width": 1440, "height": 900})
    page.goto(f"{base_url}/index.html")
    page.wait_for_function(LISTO)
    return page


@pytest.mark.parametrize("pagina", ["index.html", "sobre-mi.html", "projects.html"])
def test_sin_gesto_no_hay_audio(page: Page, base_url: str, pagina: str):
    page.goto(f"{base_url}/{pagina}")
    estado = sonido(page)
    assert estado["modo"] == "silencio" and estado["contexto"] is None
    expect(page.locator(".opcion-sonido[data-sonido=silencio]")).to_have_attribute("aria-pressed", "true")


def test_control_tres_posiciones_y_persiste(inicio: Page, base_url: str):
    activar(inicio, "efectos")
    expect(inicio.locator(".opcion-sonido[data-sonido=efectos]")).to_have_attribute("aria-pressed", "true")
    assert inicio.evaluate("localStorage.getItem('sonido')") == "efectos"
    assert sono(inicio, "blip")  # activarlo suena
    inicio.goto(f"{base_url}/sobre-mi.html")
    expect(inicio.locator(".opcion-sonido[data-sonido=efectos]")).to_have_attribute("aria-pressed", "true")
    assert sonido(inicio)["contexto"] is None  # recordado, pero sin audio hasta el próximo gesto
    inicio.locator("body").click(position={"x": 5, "y": 300})
    inicio.wait_for_function("Portafolio.Sonido.estado().contexto !== null")


def test_silencio_no_programa_nada(inicio: Page):
    abrir_contacto(inicio)
    inicio.keyboard.press("Escape")
    expect(inicio.locator("#modal-contacto")).to_be_hidden()
    inicio.locator(".opcion-tema[data-tema=light]").click()
    assert sonido(inicio)["ultimos"] == []


def test_clic_suena_blip_y_modal_crt(inicio: Page):
    activar(inicio)
    abrir_contacto(inicio)
    assert sono(inicio, "crt-on")
    inicio.keyboard.press("Escape")
    assert sono(inicio, "crt-off")


def test_tema_suena_interruptor(inicio: Page):
    activar(inicio)
    inicio.locator(".opcion-tema[data-tema=light]").click()
    assert sono(inicio, "interruptor")


def test_salpicar_suena_bloop(inicio: Page):
    activar(inicio)
    e = ir_al_horizonte(inicio)
    x = 1200 if (e["bit"]["x"] + e["bit"]["ancho"] / 2) * e["cw"] < 900 else 200
    inicio.mouse.click(x, y_del_agua(inicio, 8))
    assert sono(inicio, "bloop")


def test_bit_saluda_con_su_voz(inicio: Page):
    activar(inicio)
    ir_al_horizonte(inicio)
    assert sono(inicio, "voz")


def test_titulo_suena_a_teclado(page: Page, base_url: str):
    page.goto(f"{base_url}/sobre-mi.html")
    activar(page)
    page.locator("#titulo-certificados").scroll_into_view_if_needed()
    expect(page.locator("#titulo-certificados")).to_have_attribute("data-descifrado", "1")
    assert "tecleo" in sonido(page)["ultimos"]


def test_formulario_suena_error(inicio: Page):
    activar(inicio)
    abrir_contacto(inicio)
    inicio.get_by_role("button", name="[ enviar ↵ ]").click()
    assert sono(inicio, "error")


def test_sintetizador_offline_determinista_y_audible(inicio: Page):
    """Cada efecto renderizado dos veces sin altavoces da las mismas muestras (salvo redondeo < 1e-6, unos −120 dB,
    inaudible) y no queda mudo."""
    resultado = inicio.evaluate(
        """async () => {
          const render = async (n) => {
            const ctx = new OfflineAudioContext(1, 44100, 44100), s = Portafolio.Sintetizador(ctx);
            s.efectos[n](0.01, n === 'voz' ? { texto: 'hola' } : undefined);
            return (await ctx.startRendering()).getChannelData(0);
          };
          const out = {};
          for (const n of Portafolio.Sintetizador.EFECTOS) {
            const a = await render(n), b = await render(n);
            let iguales = a.length === b.length, energia = 0;
            for (let i = 0; i < a.length; i++) { if (Math.abs(a[i] - b[i]) > 1e-6) iguales = false; energia += a[i] * a[i]; }
            out[n] = { iguales, rms: Math.sqrt(energia / a.length) };
          }
          return out;
        }"""
    )
    for nombre, r in resultado.items():
        assert r["iguales"], f"{nombre} no es determinista"
        assert r["rms"] > 0.001, f"{nombre} quedó mudo"
