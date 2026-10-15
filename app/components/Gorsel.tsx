import { CameraIcon } from "@phosphor-icons/react/Camera";
import type { CSSProperties } from "react";
import type { Oran } from "~/content/galeri.ts";
import { useT } from "~/i18n/index.ts";
import { cx } from "~/lib/cx.ts";
import s from "./Gorsel.module.css";
import { Ikon } from "./Ikon.tsx";

type Props = {
  oran: Oran;
  konu: string;
  not?: string;
  src?: string;
  alt?: string;
  genislik?: number;
  oncelikli?: boolean;
  sizes?: string;
  className?: string;
};

function oranSayilari(oran: Oran): [number, number] {
  const [g, y] = oran.split(":").map(Number);
  return [g ?? 1, y ?? 1];
}

// Fotoğraf yoksa referansın yer tutucu dili (oran + çekim notu); fotoğraf gelince aynı kutuda <img>. Kutu oranı sabit olduğu için yerleşim kaymaz.
export function Gorsel({ oran, konu, not, src, alt, genislik = 1200, oncelikli, sizes, className }: Props) {
  const t = useT();
  const [og, oy] = oranSayilari(oran);
  const stil: CSSProperties = { aspectRatio: `${og} / ${oy}` };
  if (src) {
    return (
      <div className={cx(s.foto, className)} style={stil}>
        <img
          src={src}
          alt={alt ?? konu}
          width={genislik}
          height={Math.round((genislik * oy) / og)}
          loading={oncelikli ? "eager" : "lazy"}
          decoding="async"
          sizes={sizes}
          {...(oncelikli ? { fetchPriority: "high" as const } : {})}
        />
      </div>
    );
  }
  return (
    <div className={cx(s.foto, className)} style={stil} role="img" aria-label={`${t.gorsel.alan}: ${konu}`}>
      <p className={s.cekim} aria-hidden="true">
        <b>
          <Ikon ikon={CameraIcon} />
          <span>{`${t.gorsel.foto}: ${konu}, ${oran}`}</span>
        </b>
        {not ? <span>{not}</span> : null}
      </p>
    </div>
  );
}
