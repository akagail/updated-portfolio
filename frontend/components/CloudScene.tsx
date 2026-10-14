"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";

interface CloudSpec {
  src: string;
  width: number;
  height: number;
  sizes: string;
  style: CSSProperties & { "--drift"?: string };
  priority?: boolean;
}

interface Traveller {
  src: string;
  w: number;
  h: number;
  sizes: string;
  top: string;
  width: string;
  trav: string;
  delay: string;
  bob: string;
  op: number;
  flip: number;
}

interface CloudSceneProps {
  variant: "hero" | "stage";
  className?: string;
}

const DISTANT_OPACITY = 0.8;

/** Static fallback for reduced-motion (no JS randomness needed). */
const HERO_CLOUDS: CloudSpec[] = [
  { src: "/clouds/wisp-a.webp", width: 800, height: 380, sizes: "30vw", style: { left: "30%", top: "6%", width: "clamp(200px, 30vw, 420px)", opacity: DISTANT_OPACITY, "--drift": "160s" } },
  { src: "/clouds/cloud-c.webp", width: 1100, height: 640, sizes: "42vw", style: { left: "-8%", top: "-2%", width: "clamp(280px, 42vw, 600px)", "--drift": "120s" }, priority: true },
  { src: "/clouds/cloud-congestus.webp", width: 1050, height: 820, sizes: "46vw", style: { left: "56%", top: "24%", width: "clamp(320px, 46vw, 660px)", "--drift": "85s" } },
];

const STAGE_CLOUDS: CloudSpec[] = [
  { src: "/clouds/wisp-b.webp", width: 800, height: 380, sizes: "26vw", style: { left: "4%", top: "8%", width: "clamp(180px, 26vw, 360px)", opacity: DISTANT_OPACITY, "--drift": "165s" } },
  { src: "/clouds/cloud-b.webp", width: 1100, height: 640, sizes: "38vw", style: { left: "-10%", top: "-2%", width: "clamp(260px, 38vw, 540px)", "--drift": "125s" } },
  { src: "/clouds/cloud-d.webp", width: 1100, height: 640, sizes: "40vw", style: { left: "22%", top: "72%", width: "clamp(280px, 40vw, 580px)", "--drift": "100s" } },
];

const SKY: Record<CloudSceneProps["variant"], string> = {
  // Bright Frutiger-Aero blue up top, pale horizon where the copy sits.
  hero: "linear-gradient(180deg, #2f8fd2 0%, #63b4e6 34%, #a5d8f3 62%, #d8eefb 100%)",
  // Paler wash so glass cards pop.
  stage: "linear-gradient(180deg, #bfe0f5 0%, #dcedfa 45%, #eef7fe 100%)",
};

const SPRITES: Record<string, { src: string; w: number; h: number }> = {
  humilis: { src: "/clouds/cloud-humilis.webp", w: 1100, h: 520 },
  "wisp-a": { src: "/clouds/wisp-a.webp", w: 800, h: 380 },
  "wisp-b": { src: "/clouds/wisp-b.webp", w: 800, h: 380 },
  "cloud-a": { src: "/clouds/cloud-a.webp", w: 1100, h: 640 },
  "cloud-b": { src: "/clouds/cloud-b.webp", w: 1100, h: 640 },
  "cloud-c": { src: "/clouds/cloud-c.webp", w: 1100, h: 640 },
  "cloud-d": { src: "/clouds/cloud-d.webp", w: 1100, h: 640 },
  congestus: { src: "/clouds/cloud-congestus.webp", w: 1050, h: 820 },
};

const SMALL = ["humilis", "wisp-a", "wisp-b"];
const MEDIUM = ["cloud-a", "cloud-b", "cloud-c", "cloud-d"];

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/**
 * Fresh random sky every mount. Big clouds are kept out of the copy zones
 * (hero headline left, stage header/cards) so text stays legible.
 */
function generateLayout(variant: "hero" | "stage"): { anchors: CloudSpec[]; travellers: Traveller[] } {
  const count = variant === "hero" ? 11 : 9;
  const anchors: CloudSpec[] = [];
  const travellers: Traveller[] = [];

  for (let i = 0; i < count; i++) {
    const roll = Math.random();
    const sizeClass = roll < 0.45 ? "small" : roll < 0.87 ? "medium" : "large";
    let key = sizeClass === "small" ? pick(SMALL) : sizeClass === "medium" ? pick(MEDIUM) : "congestus";
    let vw = sizeClass === "small" ? rnd(13, 22) : sizeClass === "medium" ? rnd(26, 40) : rnd(40, 52);
    let left = rnd(-12, 95);
    let top = rnd(-4, 86);

    if (vw > 26) {
      for (let t = 0; t < 10; t++) {
        const clear =
          variant === "hero"
            ? !(left < 62 && top > 25 && top < 72)
            : top < 16 || top > 74;
        if (clear) break;
        left = rnd(-12, 95);
        top = rnd(-4, 86);
        if (t === 9) {
          // Nowhere clear — shrink to a small drifter instead.
          key = pick(SMALL);
          vw = rnd(13, 22);
        }
      }
    }

    const sp = SPRITES[key];
    const width = `clamp(140px, ${vw.toFixed(1)}vw, ${Math.round(vw * 22)}px)`;
    const flip = Math.random() > 0.5 ? -1 : 1;

    if (Math.random() < 0.7) {
      const trav = Math.round(rnd(150, 260));
      travellers.push({
        src: sp.src, w: sp.w, h: sp.h, sizes: `${Math.round(vw)}vw`,
        top: `${top.toFixed(1)}%`, width,
        trav: `${trav}s`, delay: `${-Math.round(rnd(0, trav))}s`,
        bob: `${rnd(8, 15).toFixed(1)}s`,
        op: +(sizeClass === "small" ? rnd(0.5, 0.8) : rnd(0.65, 0.9)).toFixed(2),
        flip,
      });
    } else {
      const dur = Math.round(rnd(90, 160));
      anchors.push({
        src: sp.src, width: sp.w, height: sp.h, sizes: `${Math.round(vw)}vw`,
        style: {
          left: `${left.toFixed(1)}%`, top: `${top.toFixed(1)}%`, width,
          opacity: sizeClass === "small" ? DISTANT_OPACITY : 1,
          "--drift": `${dur}s`,
        },
      });
    }
  }
  return { anchors, travellers };
}

/**
 * Layered atmospheric sky with a fresh random layout on every page load.
 * Server render is sky-only; clouds roll in client-side so SSR never mismatches.
 */
export default function CloudScene({ variant, className = "" }: CloudSceneProps) {
  const [layout, setLayout] = useState<{ anchors: CloudSpec[]; travellers: Traveller[] } | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
      return;
    }
    setLayout(generateLayout(variant));
  }, [variant]);

  const anchors = reduced ? (variant === "hero" ? HERO_CLOUDS : STAGE_CLOUDS) : (layout?.anchors ?? []);
  const travellers = reduced ? [] : (layout?.travellers ?? []);

  return (
    <div aria-hidden="true" className={`cloud-scene ${className}`}>
      <div className="cloud-scene__sky" style={{ background: SKY[variant] }} />
      {anchors.map((c, i) => (
        <span key={`${c.src}-${i}`} className="cloud-appear" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <Image
            src={c.src}
            alt=""
            width={c.width}
            height={c.height}
            sizes={c.sizes}
            priority={c.priority}
            className="cloud-scene__cloud"
            style={c.style}
          />
        </span>
      ))}
      {travellers.map((d, i) => (
        <span key={`${d.src}-${i}`} className="cloud-appear" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <span
            className="cloud-drifter"
            style={{ top: d.top, "--trav": d.trav, "--trav-delay": d.delay, "--op": d.op } as CSSProperties}
          >
            <Image
              src={d.src}
              alt=""
              width={d.w}
              height={d.h}
              sizes={d.sizes}
              className="cloud-bob"
              style={{ width: d.width, height: "auto", "--bob": d.bob, "--flip": d.flip } as CSSProperties}
            />
          </span>
        </span>
      ))}
    </div>
  );
}
