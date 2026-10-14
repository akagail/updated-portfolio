import type { CSSProperties } from "react";
import Image from "next/image";

const TUFTS: {
  src: string;
  left: string;
  width: number;
  flip: boolean;
  sway: string;
  delay: string;
}[] = [
  { src: "/grass/tuft-a.webp", left: "3%", width: 150, flip: false, sway: "5.2s", delay: "-1.4s" },
  { src: "/grass/tuft-c.webp", left: "20%", width: 190, flip: true, sway: "6.8s", delay: "-4.1s" },
  { src: "/grass/tuft-b.webp", left: "46%", width: 165, flip: false, sway: "5.9s", delay: "-2.7s" },
  { src: "/grass/tuft-a.webp", left: "70%", width: 185, flip: true, sway: "7.4s", delay: "-5.3s" },
  { src: "/grass/tuft-c.webp", left: "90%", width: 150, flip: false, sway: "6.3s", delay: "-0.8s" },
];

/**
 * Foreground grass fringe for the Projects stage only: two depth strips
 * swaying at different speeds plus individual tufts rocking in the wind.
 * Decorative — sits behind the cards, never intercepts input.
 */
export default function GrassFringe() {
  return (
    <div aria-hidden="true" className="grass-fringe">
      <Image
        src="/grass/grass-back.webp"
        alt=""
        width={2048}
        height={260}
        sizes="100vw"
        className="grass-strip grass-back"
      />
      <Image
        src="/grass/grass-front.webp"
        alt=""
        width={2048}
        height={340}
        sizes="100vw"
        className="grass-strip grass-front"
      />
      {TUFTS.map((t, i) => (
        <Image
          key={`${t.src}-${i}`}
          src={t.src}
          alt=""
          width={260}
          height={300}
          className="tuft"
          style={
            {
              left: t.left,
              width: t.width,
              "--sway": t.sway,
              "--sway-delay": t.delay,
              "--flip": t.flip ? -1 : 1,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
