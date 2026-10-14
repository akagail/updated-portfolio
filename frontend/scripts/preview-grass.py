from PIL import Image

# Front strip over stage-sky tone, cropped to its band.
front = Image.open("public/grass/grass-front.webp")
W, H = 1440, 400
bg = Image.new("RGB", (W, H), (220, 238, 250))
strip = front.resize((W, int(W * front.size[1] / front.size[0])), Image.LANCZOS)
bg.paste(strip, (0, H - strip.size[1]), strip)
bg.save("X:/Temp/Temp/opencode/cloudcheck/grass-front.png")

# Tuft over sky.
tuft = Image.open("public/grass/tuft-b.webp")
bg2 = Image.new("RGB", tuft.size, (150, 200, 235))
bg2.paste(tuft, mask=tuft.split()[3])
bg2.save("X:/Temp/Temp/opencode/cloudcheck/tuft-b.png")

# Full stage mock: pale sky + back + front + tufts, 1440x800.
SW, SH = 1440, 800
stops = [(0.0, (191, 224, 245)), (0.45, (220, 237, 250)), (1.0, (238, 247, 254))]
stage = Image.new("RGB", (SW, SH))
px = stage.load()
for y in range(SH):
    t = y / (SH - 1)
    for i in range(len(stops) - 1):
        if stops[i][0] <= t <= stops[i + 1][0]:
            f = (t - stops[i][0]) / (stops[i + 1][0] - stops[i][0])
            line = tuple(int(a + (b - a) * f) for a, b in zip(stops[i][1], stops[i + 1][1]))
            break
    for x in range(SW):
        px[x, y] = line

for name, bottom, ww in [("grass-back", 6, int(SW * 1.04)), ("grass-front", -10, int(SW * 1.04))]:
    im = Image.open(f"public/grass/{name}.webp")
    hh = int(ww * im.size[1] / im.size[0])
    im = im.resize((ww, hh), Image.LANCZOS)
    stage.paste(im, (int(-0.02 * SW), SH - bottom - hh), im)

for name, lx, w in [("tuft-a", 0.03, 150), ("tuft-c", 0.20, 190), ("tuft-b", 0.46, 165), ("tuft-a", 0.70, 185), ("tuft-c", 0.90, 150)]:
    im = Image.open(f"public/grass/{name}.webp")
    hh = int(w * im.size[1] / im.size[0])
    im = im.resize((w, hh), Image.LANCZOS)
    stage.paste(im, (int(lx * SW), SH - 8 - hh + 20), im)
stage.save("X:/Temp/Temp/opencode/cloudcheck/stage-mock.png")
print("ok")
