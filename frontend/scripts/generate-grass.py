"""Grass fringe assets: blade-by-blade raster strips with transparent tops.

Generates into ../public/grass/: back/front panoramic strips plus three
individual tuft sprites for animated accents. Deterministic (seeded).
Requires numpy + Pillow.
"""

import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "grass")

DEEP = np.array([30, 95, 45], np.float32)
VIVID = np.array([95, 190, 80], np.float32)
SUNNY = np.array([170, 200, 90], np.float32)


def smooth_field(rng, n, kernel=41):
    raw = rng.random(n).astype(np.float32)
    k = np.ones(kernel, np.float32) / kernel
    return np.convolve(np.pad(raw, kernel, mode="edge"), k, mode="valid")[:n]


def blade_color(rng):
    r = rng.random()
    base = SUNNY if r > 0.92 else DEEP + (VIVID - DEEP) * rng.random()
    return tuple(int(np.clip(c * rng.uniform(0.88, 1.12), 0, 255)) for c in base)


def strip(seed, w=2048, h=340, blades=1500, hmax=300, hmin=60, blur=0.7, haze=0.0):
    """Panoramic grass band, transparent above an irregular blade silhouette."""
    rng = np.random.default_rng(seed)
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # Dark undergrowth with an irregular top edge, so gaps read as depth.
    edge = (0.58 + 0.12 * smooth_field(rng, w, kernel=90)) * h
    rows = np.arange(h, dtype=np.float32)[:, None]
    uw = np.clip((rows - edge[None, :]) / 30.0, 0, 1)
    ugreen = np.stack([
        20 + 15 * uw,
        70 + 40 * uw,
        35 + 15 * uw,
        uw * 255,
    ], axis=-1).astype(np.uint8)
    img = Image.alpha_composite(img, Image.fromarray(ugreen, "RGBA"))
    d = ImageDraw.Draw(img)

    heights = hmin + smooth_field(rng, blades, kernel=25) * (hmax - hmin)
    # Meadow clumps: tall tufts separated by short gaps.
    heights *= 0.55 + 0.9 * smooth_field(rng, blades, kernel=140)
    xs = np.linspace(0, w, blades) + rng.uniform(-6, 6, blades)
    for x, bh in zip(xs, heights):
        bw = rng.uniform(5, 10)
        lean = rng.uniform(-55, 55)
        bend = rng.uniform(-14, 14)
        d.polygon(
            [
                (x - bw / 2, h),
                (x + bw / 2, h),
                (x + lean * 0.35 + bend, h - bh * 0.55),
                (x + lean, h - bh),
            ],
            fill=blade_color(rng),
        )

    a = np.asarray(img).astype(np.float32)
    # Sunlight from above: bright tips, shaded roots, faint warmth up top.
    yy = np.linspace(0, 1, h, dtype=np.float32)[:, None, None]
    a[..., :3] *= 0.55 + 0.60 * (1 - yy)
    a[..., 0] += 14 * (1 - yy)[..., 0] * (a[..., 3] > 0)
    if haze:
        a[..., :3] = a[..., :3] * (1 - haze) + np.array([205, 232, 242], np.float32) * haze
    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGBA")
    return img.filter(ImageFilter.GaussianBlur(blur)) if blur else img


def tuft(seed, w=260, h=300, blades=90):
    """One blade cluster fanning from the base — for animated accents."""
    rng = np.random.default_rng(seed)
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # Grounding mound so the cluster sits in soil, not air.
    d.ellipse([w * 0.25, h * 0.88, w * 0.75, h * 1.08], fill=(30, 88, 44, 255))
    cx = w / 2 + rng.uniform(-20, 20)
    for _ in range(blades):
        lean = rng.uniform(-w * 0.38, w * 0.38)
        bh = rng.uniform(h * 0.35, h * 1.0)
        bw = rng.uniform(3, 6)
        bend = rng.uniform(-22, 22)
        x = cx + rng.uniform(-30, 30)
        d.polygon(
            [
                (x - bw / 2, h),
                (x + bw / 2, h),
                (x + lean * 0.3 + bend, h - bh * 0.55),
                (x + lean, h - bh),
            ],
            fill=blade_color(rng),
        )
    a = np.asarray(img).astype(np.float32)
    yy = np.linspace(0, 1, h, dtype=np.float32)[:, None, None]
    a[..., :3] *= 0.6 + 0.55 * (1 - yy)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGBA")


def main():
    os.makedirs(OUT, exist_ok=True)
    jobs = [
        ("grass-back.webp", lambda: strip(5, h=260, blades=800, hmax=170, hmin=40, blur=1.6, haze=0.25)),
        ("grass-front.webp", lambda: strip(9, h=340, blades=1100, hmax=320, hmin=40, blur=0.7)),
        ("tuft-a.webp", lambda: tuft(21)),
        ("tuft-b.webp", lambda: tuft(33)),
        ("tuft-c.webp", lambda: tuft(47)),
    ]
    for name, make in jobs:
        path = os.path.join(OUT, name)
        make().save(path, "WEBP", quality=85, method=6)
        print(f"{name}: {os.path.getsize(path) // 1024} KB")


if __name__ == "__main__":
    main()
