"""Arma el .zip de entrega del taller a partir de sitio/.

El zip lleva en su raíz lo que pide la guía: los HTML y las subcarpetas css/, js/, lib/ (jQuery, Bootstrap,
Font Awesome y fuentes) e img/. No incluye pruebas, documentos ni archivos del repositorio.

Uso:
    uv run python scripts/empaquetar.py            # crea entrega/portafolio-juan-david-AAAAMMDD.zip
    uv run python scripts/empaquetar.py --destino otra/carpeta
"""

import argparse
import datetime as dt
import zipfile
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SITIO = RAIZ / "sitio"


def empaquetar(destino: Path, fecha: dt.date | None = None) -> Path:
    """Crea el zip de entrega en la carpeta destino y devuelve su ruta."""
    fecha = fecha or dt.date.today()
    destino.mkdir(parents=True, exist_ok=True)
    archivo = destino / f"portafolio-juan-david-{fecha:%Y%m%d}.zip"
    with zipfile.ZipFile(archivo, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for ruta in sorted(SITIO.rglob("*")):
            if ruta.is_file():
                zf.write(ruta, ruta.relative_to(SITIO).as_posix())
    return archivo


def main() -> None:
    parser = argparse.ArgumentParser(description="Arma el .zip de entrega del portafolio.")
    parser.add_argument("--destino", type=Path, default=RAIZ / "entrega", help="carpeta donde queda el zip")
    args = parser.parse_args()
    archivo = empaquetar(args.destino)
    with zipfile.ZipFile(archivo) as zf:
        total = len(zf.namelist())
    print(f"{archivo} · {total} archivos · {archivo.stat().st_size / 1024:.0f} KB")


if __name__ == "__main__":
    main()
