/**
 * Shared SVG lens filters for refractive bubbles. Rendered once (inside the
 * always-mounted site rain); referenced document-wide via backdrop-filter.
 * Chromium/Edge: genuine localized backdrop displacement. Elsewhere the
 * url() declaration is dropped and bubbles keep their glass look.
 */
export function BubbleLensDefs() {
  const scales = [
    { id: "bubble-lens-s", scale: 8 },
    { id: "bubble-lens-m", scale: 14 },
    { id: "bubble-lens-l", scale: 22 },
  ];
  return (
    <svg aria-hidden="true" focusable="false" width="0" height="0" style={{ position: "absolute" }}>
      <defs>
        {scales.map((f) => (
          <filter
            key={f.id}
            id={f.id}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feImage
              href="/lens-map.png"
              preserveAspectRatio="none"
              x="0"
              y="0"
              width="100%"
              height="100%"
              result="map"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              scale={f.scale}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        ))}
      </defs>
    </svg>
  );
}

/** Refraction follows bubble size; small ones stay plain glass (perf). */
export function lensClass(size: number): string {
  return size < 28 ? "" : size < 42 ? "lens-m" : "lens-l";
}

/**
 * Site-wide falling glass bubbles — fixed overlay, decorative only.
 * Deterministic index-derived spread so SSR and client render match.
 */
export default function SiteRain({ count = 18 }: { count?: number }) {
  return (
    <div aria-hidden="true" className="site-rain">
      <BubbleLensDefs />
      {Array.from({ length: count }, (_, i) => {
        // DEMO: sizes/opacity cranked up so the rain is unmistakable.
        const size = 14 + ((i * 29) % 46);
        return (
          <span
            key={i}
            className={`rain-bubble ${lensClass(size)}`}
            style={{
              left: `${(i * 41 + 3) % 100}%`,
              width: size,
              height: size,
              opacity: 0.5 + ((i * 19) % 40) / 100,
              ["--fall" as string]: `${9 + ((i * 11) % 8)}s`,
              ["--delay" as string]: `${-((i * 5) % 16)}s`,
              ["--drift" as string]: `${((i * 31) % 70) - 35}px`,
            }}
          />
        );
      })}
    </div>
  );
}
