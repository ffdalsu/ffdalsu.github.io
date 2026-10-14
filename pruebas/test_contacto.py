"""F6 · Contacto: modal [ escríbeme ] en las tres páginas, validación jQuery, envío por Formspree o por correo, y zip."""

import datetime as dt
import json
import sys
import zipfile
from pathlib import Path

import pytest
from playwright.sync_api import Page, expect

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))
import empaquetar


def abrir_contacto(page: Page) -> None:
    page.evaluate(
        "window.abierto = false; $('#modal-contacto').one('shown.bs.modal', () => { window.abierto = true; })"
    )
    page.locator(".pie .abrir-contacto").click()
    page.wait_for_function("window.abierto === true")


def llenar(page: Page) -> None:
    page.locator("#contacto-nombre").fill("Ana Restrepo")
    page.locator("#contacto-correo").fill("ana@correo.com")
    page.locator("#contacto-mensaje").fill("Hola, quiero hablar de un proyecto con datos.")


@pytest.fixture
def con_formspree(page: Page, base_url: str) -> Page:
    page.goto(f"{base_url}/index.html")
    page.locator("#form-contacto").evaluate("f => f.setAttribute('data-formspree', 'prueba123')")
    abrir_contacto(page)
    llenar(page)
    return page


@pytest.mark.parametrize("pagina", ["index.html", "sobre-mi.html", "projects.html"])
def test_escribeme_abre_modal_en_las_tres(page: Page, base_url: str, pagina: str):
    page.goto(f"{base_url}/{pagina}")
    abrir_contacto(page)
    expect(page.locator("#modal-contacto")).to_be_visible()
    expect(page.locator("#contacto-nombre")).to_be_focused()


def test_llamado_del_inicio_abre_el_modal(page: Page, base_url: str):
    page.goto(f"{base_url}/index.html")
    page.locator("#contacto .abrir-contacto").click()
    expect(page.locator("#modal-contacto")).to_be_visible()


def test_errores_por_campo(page: Page, base_url: str):
    page.goto(f"{base_url}/index.html")
    abrir_contacto(page)
    page.locator("#contacto-correo").fill("sin-arroba")
    page.get_by_role("button", name="[ enviar ↵ ]").click()
    log = page.locator("#log-contacto")
    expect(log.locator(".error")).to_have_count(3)
    expect(log).to_contain_text("correo: escribe uno válido")
    expect(page.locator(".campo.mal")).to_have_count(3)


def test_envio_exitoso(con_formspree: Page):
    peticiones = []

    def responder(ruta):
        peticiones.append(ruta.request)
        ruta.fulfill(status=200, content_type="application/json", body=json.dumps({"ok": True}))

    con_formspree.route("https://formspree.io/f/prueba123", responder)
    con_formspree.get_by_role("button", name="[ enviar ↵ ]").click()
    expect(con_formspree.locator("#log-contacto")).to_contain_text("✓ mensaje enviado")
    assert peticiones[0].method == "POST"
    assert "ana%40correo.com" in peticiones[0].post_data
    expect(con_formspree.locator("#contacto-nombre")).to_have_value("")


def test_envio_fallido_muestra_error(con_formspree: Page):
    con_formspree.route("https://formspree.io/f/prueba123", lambda ruta: ruta.fulfill(status=500, body="{}"))
    con_formspree.get_by_role("button", name="[ enviar ↵ ]").click()
    expect(con_formspree.locator("#log-contacto")).to_contain_text("✗ no se pudo enviar (500)")
    expect(con_formspree.locator("#contacto-nombre")).to_have_value("Ana Restrepo")


def test_no_envia_dos_veces(con_formspree: Page):
    peticiones = []

    def lento(ruta):
        peticiones.append(1)
        con_formspree.wait_for_timeout(400)
        ruta.fulfill(status=200, content_type="application/json", body="{}")

    con_formspree.route("https://formspree.io/f/prueba123", lento)
    con_formspree.locator("#form-contacto").evaluate("f => { f.requestSubmit(); f.requestSubmit(); }")
    expect(con_formspree.locator("#log-contacto")).to_contain_text("✓ mensaje enviado")
    assert len(peticiones) == 1


def test_sin_formspree_abre_el_correo(page: Page, base_url: str):
    page.goto(f"{base_url}/index.html")
    # el sitio ya trae el ID real; aquí se quita para probar el respaldo por correo
    page.locator("#form-contacto").evaluate("f => f.setAttribute('data-formspree', '')")
    page.evaluate("window.urlCorreo = null; Portafolio.Contacto.abrirCorreo = (u) => { window.urlCorreo = u; }")
    abrir_contacto(page)
    llenar(page)
    page.get_by_role("button", name="[ enviar ↵ ]").click()
    url = page.evaluate("window.urlCorreo")
    assert url.startswith("mailto:ffdalsu.dev@gmail.com?subject=")
    expect(page.locator("#log-contacto")).to_contain_text("programa de correo")


def test_zip_tiene_estructura(tmp_path: Path):
    archivo = empaquetar.empaquetar(tmp_path, dt.date(2026, 10, 14))
    assert archivo.name == "portafolio-juan-david-20261014.zip"
    with zipfile.ZipFile(archivo) as zf:
        nombres = zf.namelist()
    for requerido in ["index.html", "sobre-mi.html", "projects.html", "css/estilos.css"]:
        assert requerido in nombres
    carpetas = {n.split("/")[0] for n in nombres if "/" in n}
    assert {"css", "js", "lib", "img"} <= carpetas
    assert any(n.startswith("lib/jquery-3.7.1/") for n in nombres)
    assert any(n.startswith("lib/bootstrap-5.3.3/") for n in nombres)
    assert not any(n.startswith(("pruebas/", "docs/", "scripts/")) for n in nombres)
