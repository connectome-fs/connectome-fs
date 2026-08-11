"""One-shot generator: scaled identical geometry for logo.svg / logo-mark.svg."""
from __future__ import annotations

import re
from pathlib import Path

nodes = [
    (92, 110, 7.5, "pink"),
    (116, 72, 8, "pink"),
    (152, 52, 9, "pink"),
    (186, 64, 7.5, "teal"),
    (212, 52, 7, "pink"),
    (234, 78, 7.5, "pink"),
    (236, 116, 7, "teal"),
    (220, 148, 7.5, "pink"),
    (232, 176, 6.5, "pink"),
    (210, 202, 7.5, "teal"),
    (172, 214, 8.5, "pink"),
    (138, 208, 7, "pink"),
    (104, 194, 7, "teal"),
    (80, 168, 7, "pink"),
    (74, 156, 6.5, "pink"),
    (142, 96, 6.5, "pink"),
    (168, 84, 6, "teal"),
    (194, 102, 6.5, "pink"),
    (212, 130, 6, "teal"),
    (192, 156, 8, "pink"),
    (166, 144, 6, "teal"),
    (140, 164, 6.5, "pink"),
    (114, 142, 7, "teal"),
    (128, 116, 6, "pink"),
]

xs = [n[0] for n in nodes]
ys = [n[1] for n in nodes]
rs = [n[2] for n in nodes]
minx = min(x - r for x, r in zip(xs, rs))
maxx = max(x + r for x, r in zip(xs, rs))
miny = min(y - r for y, r in zip(ys, rs))
maxy = max(y + r for y, r in zip(ys, rs))
cx = (minx + maxx) / 2
cy = (miny + maxy) / 2
margin = 14
usable = 256 - 2 * margin
s = min(usable / (maxx - minx), usable / (maxy - miny))


def mxy(x: float, y: float) -> tuple[float, float]:
    return 128 + (x - cx) * s, 128 + (y - cy) * s


def mr(r: float) -> float:
    return r * s


def fmt(n: float) -> str:
    return f"{n:.1f}".rstrip("0").rstrip(".")


def pt(x: float, y: float) -> str:
    X, Y = mxy(x, y)
    return f"{fmt(X)} {fmt(Y)}"


cortex = [
    (74, 156),
    (92, 110),
    (116, 72),
    (152, 52),
    (186, 64),
    (212, 52),
    (234, 78),
    (236, 116),
    (220, 148),
    (232, 176),
    (210, 202),
    (172, 214),
    (138, 208),
    (104, 194),
    (80, 168),
    (74, 156),
]
mesh = [
    (116, 72),
    (142, 96),
    (168, 84),
    (194, 102),
    (212, 130),
    (192, 156),
    (166, 144),
    (140, 164),
    (114, 142),
    (128, 116),
    (116, 72),
]
pink_spokes = [
    ((152, 52), (166, 144)),
    ((186, 64), (192, 156)),
    ((92, 110), (114, 142)),
    ((220, 148), (192, 156)),
    ((138, 208), (140, 164)),
]
teal_spokes = [
    ((212, 52), (194, 102)),
    ((234, 78), (212, 130)),
    ((210, 202), (192, 156)),
    ((104, 194), (114, 142)),
]


def path_from(pts: list[tuple[float, float]]) -> str:
    return "M" + " L".join(pt(*p) for p in pts)


def spokes(pairs: list[tuple[tuple[float, float], tuple[float, float]]]) -> str:
    return " ".join(f"M{pt(*a)} L{pt(*b)}" for a, b in pairs)


def circles(palette: dict[str, str]) -> str:
    lines = []
    for x, y, r, kind in nodes:
        X, Y = mxy(x, y)
        R = mr(r)
        lines.append(
            f'    <circle cx="{fmt(X)}" cy="{fmt(Y)}" r="{fmt(R)}" fill="{palette[kind]}"/>'
        )
    return "\n".join(lines)


def mark_group(palette: dict[str, str]) -> str:
    def sw(w: float) -> str:
        return fmt(w * s * 0.92)

    return f"""  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="{palette["pink"]}" stroke-width="{sw(3.2)}"
      d="{path_from(cortex)}"/>
    <path stroke="{palette["teal"]}" stroke-width="{sw(2.6)}"
      d="{path_from(mesh)}"/>
    <path stroke="{palette["pink"]}" stroke-width="{sw(2.2)}"
      d="{spokes(pink_spokes)}"/>
    <path stroke="{palette["teal"]}" stroke-width="{sw(2.0)}"
      d="{spokes(teal_spokes)}"/>
  </g>
  <g>
{circles(palette)}
  </g>"""


dark = {"pink": "#f078a8", "teal": "#3ec9c4"}
light = {"pink": "#d4568c", "teal": "#0c6b6e"}

logo = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-label="connectome-fs">
  <title>connectome-fs</title>
  <defs>
    <linearGradient id="field" x1="28" y1="24" x2="228" y2="232" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#2a1524"/>
      <stop offset="100%" stop-color="#120c14"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="52" fill="url(#field)"/>
  <!-- Neuronal brain geometry (shared with logo-mark.svg). Pink-dominant. -->
{mark_group(dark)}
</svg>
"""

mark = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-label="connectome-fs mark">
  <title>connectome-fs</title>
  <!-- Same neuronal brain geometry as logo.svg (no field tile). Pink-dominant. -->
{mark_group(light)}
</svg>
"""

fav = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="connectome-fs favicon">
  <title>connectome-fs</title>
  <!-- Low-res: 8 outline + hub, pink-dominant -->
  <rect width="64" height="64" rx="14" fill="#1a1018"/>
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="#f078a8" stroke-width="2.8"
      d="M12 34 L20 18 L32 10 L46 16 L54 30 L48 44 L34 54 L18 48 L12 34"/>
    <path stroke="#3ec9c4" stroke-width="2.2"
      d="M32 10 L36 30 L46 16 M36 30 L48 44 M36 30 L18 48"/>
  </g>
  <g>
    <circle cx="20" cy="18" r="4" fill="#f078a8"/>
    <circle cx="32" cy="10" r="4.4" fill="#f078a8"/>
    <circle cx="46" cy="16" r="3.8" fill="#3ec9c4"/>
    <circle cx="54" cy="30" r="4" fill="#f078a8"/>
    <circle cx="48" cy="44" r="3.8" fill="#f078a8"/>
    <circle cx="34" cy="54" r="4.4" fill="#f078a8"/>
    <circle cx="18" cy="48" r="3.8" fill="#3ec9c4"/>
    <circle cx="12" cy="34" r="3.6" fill="#f078a8"/>
    <circle cx="36" cy="30" r="4.2" fill="#f078a8"/>
  </g>
</svg>
"""

root = Path(__file__).resolve().parent.parent
targets_logo = [
    root / "brand" / "logo.svg",
    root / "site" / "public" / "brand" / "logo.svg",
    root / "supplemental-ui" / "img" / "logo.svg",
    Path(r"C:\code\github.com\connectome-fs\.github\brand\logo.svg"),
]
targets_mark = [
    root / "brand" / "logo-mark.svg",
    root / "site" / "public" / "brand" / "logo-mark.svg",
    Path(r"C:\code\github.com\connectome-fs\.github\brand\logo-mark.svg"),
]
targets_fav = [
    root / "brand" / "favicon.svg",
    root / "site" / "public" / "favicon.svg",
    root / "site" / "public" / "brand" / "favicon.svg",
    Path(r"C:\code\github.com\connectome-fs\.github\brand\favicon.svg"),
]


def write_all(paths: list[Path], text: str) -> None:
    for p in paths:
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(text, encoding="utf-8", newline="\n")
        print("wrote", p)


write_all(targets_logo, logo)
write_all(targets_mark, mark)
write_all(targets_fav, fav)


def geom(svg: str):
    # Avoid matching the trailing `d="` inside attributes like id="field".
    ds = re.findall(r'(?<![a-zA-Z])d="([^"]+)"', svg)
    cs = re.findall(r'cx="([^"]+)" cy="([^"]+)" r="([^"]+)"', svg)
    return ds, cs


dl, cl = geom(logo)
dm, cm = geom(mark)
assert dl == dm, "path geometry mismatch"
assert cl == cm, "circle geometry mismatch"
print("geometry identical; scale", round(s, 4))
