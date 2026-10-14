"""El sitio es público: ningún archivo de sitio/ puede nombrar sistemas, servidores, bases ni cuentas internas."""

import re
from pathlib import Path

SITIO = Path(__file__).resolve().parent.parent / "sitio"

# Términos internos de la empresa que no deben salir en público (sistemas, bases, servidores, cuentas, IP privadas)
PROHIBIDOS = [
    r"\bSINCO\b",
    r"\bDWH\b",
    r"DWH_CONALTURA",
    r"AppsConaltura",
    r"VM-WEBAPP",
    r"AplicacionBIC",
    r"serviciosti",
    r"\bHubSpot\b",
    r"\b10\.\d{1,3}\.\d{1,3}\.\d{1,3}\b",
    r"\b192\.168\.\d{1,3}\.\d{1,3}\b",
    r"jossa@conaltura",
]


def test_sin_datos_internos():
    hallazgos = []
    for archivo in SITIO.rglob("*"):
        if archivo.suffix not in {".html", ".js", ".css", ".md", ".json"} or "lib" in archivo.relative_to(SITIO).parts:
            continue
        texto = archivo.read_text(encoding="utf-8")
        for patron in PROHIBIDOS:
            for m in re.finditer(patron, texto):
                hallazgos.append(f"{archivo.relative_to(SITIO)}: {m.group(0)}")
    assert hallazgos == []
