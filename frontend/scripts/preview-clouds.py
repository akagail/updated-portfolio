from PIL import Image

for n in ["cloud-a", "cloud-b", "cloud-c", "cloud-d", "wisp-a", "wisp-b", "cloud-humilis", "cloud-congestus"]:
    im = Image.open(f"public/clouds/{n}.webp")
    bg = Image.new("RGB", im.size, (90, 150, 200))
    bg.paste(im, mask=im.split()[3])
    bg.save(f"X:/Temp/Temp/opencode/cloudcheck/{n}.png")

# Hero composition mock at 1440x800 (positions/sizes mirror CloudScene hero).
W, H = 1440, 800
stops = [(0.0, (47, 143, 210)), (0.34, (99, 180, 230)), (0.62, (165, 216, 243)), (1.0, (216, 238, 251))]
sky = Image.new("RGB", (W, H))
px = sky.load()
for y in range(H):
    t = y / (H - 1)
    for i in range(len(stops) - 1):
        if stops[i][0] <= t <= stops[i + 1][0]:
            f = (t - stops[i][0]) / (stops[i + 1][0] - stops[i][0])
            px_line = tuple(int(a + (b - a) * f) for a, b in zip(stops[i][1], stops[i + 1][1]))
            break
    for x in range(W):
        px[x, y] = px_line

layout = [
    ("wisp-a", 0.30, 0.06, 420), ("wisp-b", 0.44, 0.30, 340),
    ("cloud-c", -0.08, -0.02, 600), ("cloud-a", 0.60, -0.06, 480),
    ("cloud-humilis", 0.30, 0.44, 300), ("cloud-congestus", 0.56, 0.24, 660),
    # drifter snapshots mid-flight (spread x)
    ("cloud-humilis", 0.08, 0.58, 260), ("wisp-a", 0.52, 0.12, 300),
    ("cloud-d", 0.82, 0.52, 380),
]
for n, lx, ty, w in layout:
    im = Image.open(f"public/clouds/{n}.webp")
    h = int(w * im.size[1] / im.size[0])
    sky.paste(im.resize((w, h), Image.LANCZOS), (int(lx * W), int(ty * H)), im.resize((w, h), Image.LANCZOS))
sky.save("X:/Temp/Temp/opencode/cloudcheck/hero-mock.png")
print("ok")
