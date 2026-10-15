import type { CSSProperties } from "react";
import type { Oran } from "~/content/galeri.ts";
import { cx } from "~/lib/cx.ts";
import s from "./Gorsel.module.css";

// Çekim notu her zaman Türkçe tutulur: müşteriden fotoğraf istenirken tek liste çıkar (scripts/cekim-listesi.ts).
export type Cekim = { readonly konu: string; readonly not: string };

type Props = {
  oran: Oran;
  konu: string;
  cekim?: Cekim;
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

// Fotoğraf yoksa sakin, markalı bir kraft kutu; çekim notu yalnız data-cekim niteliğinde taşınır, ekranda ve ekran okuyucuda görünmez.
// Fotoğraf gelince aynı oranlı kutuda <img>; yerleşim kaymaz.
export function Gorsel({ oran, konu, cekim, src, alt, genislik = 1200, oncelikli, sizes, className }: Props) {
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
    <div
      className={cx(s.foto, s.yer, className)}
      style={stil}
      aria-hidden="true"
      data-cekim={cekim ? `${oran} | ${cekim.konu} | ${cekim.not}` : oran}
    />
  );
}
