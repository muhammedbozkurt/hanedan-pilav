import { useMemo, useState } from "react";
import veri from "~/data/harita/istanbul.json";
import { ILCELER } from "~/content/ilceler.ts";
import { HARITA_METNI } from "~/i18n/harita.ts";
import { useLang } from "~/i18n/index.ts";
import { cx } from "~/lib/cx.ts";
import s from "./IstanbulHarita.module.css";

export type HaritaPin = {
  readonly ilce: string;
  readonly etiket: string;
  // Verilmezse ilçe merkezi kullanılır. Merkez noktası adres değildir.
  readonly nokta?: { readonly x: number; readonly y: number };
};

export type HaritaKirpma = "tum" | "cekirdek";
export type PinYonu = "sag" | "ust";
export type HaritaVaryant = "tanitim" | "tam" | "mini";

type Props = {
  varyant: HaritaVaryant;
  vurgulu?: readonly string[];
  pinler?: readonly HaritaPin[];
  secili?: string | null;
  onSec?: (slug: string) => void;
  kirpma?: HaritaKirpma;
  // Salt okunur haritanın ekran okuyucu etiketi; verilmezse genel metin kullanılır.
  ariaEtiket?: string;
  // Pin etiketinin noktaya göre yönü.
  pinYonu?: PinYonu;
  className?: string;
};

type Kutu = { x: number; y: number; g: number; h: number };
const ILCE_ADI = new Map(ILCELER.map((i) => [i.slug, i.ad]));
const MERKEZ = new Map(veri.ilceler.map((i) => [i.slug, i.merkez as readonly number[]]));
const MINI_GENISLIK = 300;

export function IstanbulHarita({ varyant, vurgulu = [], pinler = [], secili = null, onSec, kirpma, ariaEtiket, pinYonu = "sag", className }: Props) {
  const dil = useLang();
  const m = HARITA_METNI[dil];
  const etkilesimli = varyant === "tam" && onSec !== undefined;
  const vurguKumesi = useMemo(() => new Set(vurgulu), [vurgulu]);
  const pinli = useMemo(() => new Map(pinler.map((p) => [p.ilce, p])), [pinler]);
  const [odak, setOdak] = useState<string | null>(null);
  // Salt okunur haritada vurgulu ilçeler sona çizilir ki kalın sınırları komşuların altında kalmasın.
  const sirali = useMemo(
    () => (etkilesimli ? veri.ilceler : [...veri.ilceler].sort((a, b) => Number(vurguKumesi.has(a.slug)) - Number(vurguKumesi.has(b.slug)))),
    [etkilesimli, vurguKumesi],
  );

  const kutu: Kutu = useMemo(() => {
    const secim = kirpma ?? (varyant === "tam" ? "tum" : "cekirdek");
    if (varyant === "mini") {
      const odak = pinler[0]?.ilce ?? vurgulu[0];
      const mrk = odak ? MERKEZ.get(odak) : undefined;
      if (mrk && mrk[0] !== undefined && mrk[1] !== undefined) {
        const h = Math.round(MINI_GENISLIK * (veri.cekirdek.h / veri.cekirdek.g));
        return { x: mrk[0] - MINI_GENISLIK / 2, y: mrk[1] - h / 2, g: MINI_GENISLIK, h };
      }
    }
    return secim === "tum" ? veri.tam : veri.cekirdek;
  }, [kirpma, varyant, pinler, vurgulu]);

  const durum = (slug: string): string => {
    const p = pinli.get(slug);
    if (p) return p.etiket.toLocaleLowerCase(dil);
    return vurguKumesi.has(slug) ? m.bayiVar : m.bayiYok;
  };

  return (
    <figure data-varyant={varyant} className={cx(s.kap, className)}>
      <div className={s.tuval} style={{ aspectRatio: `${kutu.g} / ${kutu.h}` }}>
        <svg
          className={s.svg}
          viewBox={`${kutu.x} ${kutu.y} ${kutu.g} ${kutu.h}`}
          role={etkilesimli ? "group" : "img"}
          aria-label={etkilesimli ? m.grupAria : (ariaEtiket ?? m.sadeceBilgiAria)}
        >
          {sirali.map((i) => {
            const sinif = cx(
              s.ilce,
              vurguKumesi.has(i.slug) && s.vurgulu,
              secili === i.slug && s.secili,
              etkilesimli && s.tiklanir,
            );
            if (!etkilesimli) return <path key={i.slug} className={sinif} d={i.d} />;
            const ad = ILCE_ADI.get(i.slug) ?? i.slug;
            const sec = () => onSec?.(i.slug);
            return (
              <path
                key={i.slug}
                className={sinif}
                d={i.d}
                role="button"
                tabIndex={0}
                aria-pressed={secili === i.slug}
                aria-label={m.ilceAria(ad, durum(i.slug))}
                onClick={sec}
                onFocus={(e) => setOdak(e.currentTarget.matches(":focus-visible") ? i.slug : null)}
                onBlur={() => setOdak((o) => (o === i.slug ? null : o))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    sec();
                  }
                }}
              />
            );
          })}
          {/* Etkileşimli haritada sekme sırası DOM sırasıdır; seçili ve odaktaki ilçenin sınırı yol taşınmadan, üste çizilen kopyayla öne alınır. */}
          {etkilesimli
            ? [secili, odak].map((slug, k) => {
                const d = slug ? veri.ilceler.find((i) => i.slug === slug)?.d : undefined;
                return d ? <path key={k} className={cx(s.ust, k === 0 ? s.seciliUst : s.odakUst)} d={d} aria-hidden="true" /> : null;
              })
            : null}
        </svg>
        <div className={s.pinler} aria-hidden="true">
          {pinler.map((p) => {
            const mrk = MERKEZ.get(p.ilce);
            const nx = p.nokta?.x ?? mrk?.[0];
            const ny = p.nokta?.y ?? mrk?.[1];
            if (nx === undefined || ny === undefined) return null;
            return (
              <span
                key={p.ilce}
                className={s.pin}
                data-yon={pinYonu}
                style={{ left: `${((nx - kutu.x) / kutu.g) * 100}%`, top: `${((ny - kutu.y) / kutu.h) * 100}%` }}
              >
                <span className={s.nokta} />
                <span className={s.tabela}>{p.etiket}</span>
              </span>
            );
          })}
        </div>
      </div>
      <figcaption className={s.alt}>
        {pinler.length > 0 && <span>{m.pinKonumNotu}</span>}
        <a className={s.atif} href={veri.meta.lisansUrl} target="_blank" rel="noopener noreferrer">
          {m.atif}
        </a>
      </figcaption>
    </figure>
  );
}
