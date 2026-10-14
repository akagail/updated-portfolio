"""Spherical lens displacement map for bubble backdrop-refraction.

256x256 PNG: R/G channels encode a radial lens profile (0.5 = no shift at
the rim and center, peak mid-radius), B neutral. Used by SVG
feDisplacementMap filters referenced from the bubbles' backdrop-filter.
"""

import os

import numpy as np
from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "lens-map.png")


def main():
    s = 256
    yy, xx = np.mgrid[0:s, 0:s].astype(np.float32)
    u = (xx / (s - 1)) * 2 - 1
    v = (yy / (s - 1)) * 2 - 1
    r = np.sqrt(u * u + v * v)
    inside = np.clip(1 - r, 0, 1)
    # Lens profile: zero at center and rim, peak ~0.55 radius.
    m = np.sin(np.pi * np.clip(r, 0, 1) ** 0.9) * (r <= 1)
    amp = 0.45
    with np.errstate(invalid="ignore", divide="ignore"):
        nx = np.where(r > 1e-6, u / np.maximum(r, 1e-6), 0)
        ny = np.where(r > 1e-6, v / np.maximum(r, 1e-6), 0)
    rgba = np.stack(
        [
            0.5 + amp * m * nx,
            0.5 + amp * m * ny,
            np.full_like(r, 0.5),
            np.ones_like(r),
        ],
        axis=-1,
    )
    rgba[..., :2] *= inside[..., None]  # outside the disc: neutral-ish
    rgba[..., :2] += 0.5 * (1 - inside[..., None])
    Image.fromarray((np.clip(rgba, 0, 1) * 255).astype(np.uint8), "RGBA").save(OUT)
    print(f"lens-map.png: {os.path.getsize(OUT) // 1024} KB")


if __name__ == "__main__":
    main()
