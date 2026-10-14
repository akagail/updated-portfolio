"""Custom cloud sprites: domain-warped fBm cumulus with transparent backgrounds.

Generates distinct WebP formations into ../public/clouds/. Deterministic
(seeded) so re-runs reproduce the same assets. Requires numpy + Pillow.
"""

import os

import numpy as np
from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "clouds")


def octave(shape, cells, rng):
    """Smooth value-noise octave in [0, 1] via bicubic-upscaled random grid."""
    h, w = shape
    grid = (rng.random((cells[1] + 3, cells[0] + 3)) * 255).astype(np.uint8)
    img = Image.fromarray(grid, mode="L").resize((w, h), Image.BICUBIC)
    return np.asarray(img, dtype=np.float32) / 255.0


def fbm(shape, base_cells, octaves, rng, lacunarity=2.0):
    total = np.zeros(shape, dtype=np.float32)
    amp, cells, norm = 0.5, base_cells, 0.0
    for _ in range(octaves):
        total += amp * octave(shape, (cells, max(1, cells * shape[0] // shape[1])), rng)
        norm += amp
        amp *= 0.5
        cells = int(cells * lacunarity)
    return total / norm


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def cloud(seed, w=1100, h=640, puffs=1.0, base_lift=0.0, tall=1.0):
    """One cumulus formation. puffs widens, tall stretches, base_lift flattens."""
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    u = (xx / w) * 2 - 1  # -1..1
    v = ((yy / h) * 2 - 1) * -1  # +1 top

    # Domain-warped billows: strong warp + fine detail for cauliflower tops.
    q = fbm((h, w), 4, 4, rng)
    r = fbm((h, w), 4, 4, np.random.default_rng(seed + 999))
    warp = fbm((h, w), 3, 3, np.random.default_rng(seed + 555))
    d = fbm((h, w), 7, 5, np.random.default_rng(seed + 7777))
    detail = fbm((h, w), 18, 4, np.random.default_rng(seed + 31))
    d = 0.52 * d + 0.24 * q + 0.12 * r + 0.12 * np.abs(d - warp)

    # Horizontal puff-cluster mask with a flattened base, broken into lobes.
    lobes = 0.65 + 0.7 * fbm((h, w), 3, 3, np.random.default_rng(seed + 101))
    m = np.exp(-((u / puffs) ** 2 * 2.6 + ((v + 0.15) * 1.9 / tall) ** 2) * 1.6)
    m *= lobes
    m *= smoothstep(-1.0, -0.35 + base_lift, v)
    m *= smoothstep(1.0, 0.55, np.abs(u / puffs))  # fade sprite side edges

    n = (d * 0.62 + detail * 0.18) * (0.5 + 0.5 * m) + m * 0.52 - 0.30
    alpha = smoothstep(0.08, 0.38, n)
    # Fade the outer sprite border so no cutout edge can ever show.
    edge = (
        smoothstep(0.0, 0.06, xx / w)
        * smoothstep(0.0, 0.06, 1 - xx / w)
        * smoothstep(0.0, 0.08, yy / h)
        * smoothstep(0.0, 0.08, 1 - yy / h)
    )
    alpha *= edge
    if alpha.max() == 0:
        raise RuntimeError(f"seed {seed}: empty cloud")

    t = np.clip(n * 1.9, 0, 1)
    lit = smoothstep(0.0, 0.55, t)
    sun = smoothstep(-0.1, 0.9, v) * lit
    # Blue-gray crevices -> white body -> warm sunlit tops, darker base.
    base_shade = 0.84 + 0.16 * smoothstep(-0.7, 0.8, v)
    col = (
        np.stack(
            [
                165 + (255 - 165) * lit,
                185 + (255 - 185) * lit,
                205 + (255 - 205) * lit,
            ],
            axis=-1,
        )
        * (1 - 0.38 * sun[..., None])
        + np.array([255, 248, 230], np.float32) * (0.38 * sun[..., None])
    )
    col *= base_shade[..., None]
    # Fine texture so large areas are not flat plastic.
    grain = fbm((h, w), 32, 2, np.random.default_rng(seed + 77))
    col *= (0.93 + 0.12 * grain)[..., None]

    rgba = np.dstack([np.clip(col, 0, 255), alpha * 255]).astype(np.uint8)
    return Image.fromarray(rgba, mode="RGBA")


def wisp(seed, w=800, h=380):
    """Thin distant formation: same pipeline, weaker density, wider mask."""
    rng = np.random.default_rng(seed)
    img = cloud(seed + 5000, w=w, h=h, puffs=1.5, base_lift=0.25)
    a = np.asarray(img).astype(np.float32)
    a[..., 3] *= 0.75
    return Image.fromarray(a.astype(np.uint8), mode="RGBA")


def main():
    os.makedirs(OUT, exist_ok=True)
    jobs = [
        ("cloud-a.webp", lambda: cloud(11, puffs=1.0)),
        ("cloud-b.webp", lambda: cloud(47, puffs=1.25, base_lift=0.1)),
        ("cloud-c.webp", lambda: cloud(83, puffs=0.9, base_lift=-0.05)),
        ("cloud-d.webp", lambda: cloud(129, puffs=1.4)),
        ("cloud-humilis.webp", lambda: cloud(201, w=1100, h=520, puffs=1.35, base_lift=0.2, tall=0.6)),
        ("cloud-congestus.webp", lambda: cloud(305, w=1050, h=820, puffs=0.95, base_lift=-0.05, tall=1.45)),
        ("wisp-a.webp", lambda: wisp(7)),
        ("wisp-b.webp", lambda: wisp(23)),
    ]
    for name, make in jobs:
        path = os.path.join(OUT, name)
        make().save(path, "WEBP", quality=85, method=6)
        kb = os.path.getsize(path) // 1024
        print(f"{name}: {kb} KB")


if __name__ == "__main__":
    main()
