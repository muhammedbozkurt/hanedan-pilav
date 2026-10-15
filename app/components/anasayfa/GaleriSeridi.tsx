import { type CSSProperties, useEffect, useRef, useState } from "react";
import { Bolum } from "~/components/Bolum.tsx";
import { MetinLink } from "~/components/Buton.tsx";
import { Gorsel } from "~/components/Gorsel.tsx";
import { GALERI } from "~/content/galeri.ts";
import { useAnasayfa } from "~/i18n/anasayfa.ts";
import { usePaths } from "~/i18n/index.ts";
import s from "./GaleriSeridi.module.css";
import { gorselBilgisi } from "./yardimci.ts";

const OGE_SAYISI = 4;

function oranSayisi(oran: string): number {
  const [g, y] = oran.split(":").map(Number);
  return (g ?? 1) / (y ?? 1);
}

// Galerinin ilk dört karesi. Geniş ekranda kareler oranlarıyla orantılı genişlikte aynı boyda dizilir; dar ekranda yatay kaydırılır.
export function GaleriSeridi() {
  const m = useAnasayfa().galeri;
  const { dil, yol } = usePaths();
  const kap = useRef<HTMLDivElement>(null);
  // Kaydırılabilir şerit klavyeyle odaklanabilir olmalı; kaydırma yokken sekme sırasına fazladan durak eklenmez.
  const [kayar, setKayar] = useState(false);

  useEffect(() => {
    const el = kap.current;
    if (!el) return;
    const olc = () => setKayar(el.scrollWidth > el.clientWidth + 2);
    olc();
    const boyut = "ResizeObserver" in window ? new ResizeObserver(olc) : null;
    boyut?.observe(el);
    return () => boyut?.disconnect();
  }, []);

  return (
    <Bolum baslikId="galeri-baslik" ustBoslukYok>
      <div className={s.bas}>
        <h2 id="galeri-baslik">{m.baslik}</h2>
        <MetinLink to={yol("galeri")}>{m.eylem}</MetinLink>
      </div>
      <div ref={kap} className={s.seritKap} role="region" aria-label={m.seritAria} tabIndex={kayar ? 0 : undefined}>
        <ul className={s.serit}>
          {GALERI.slice(0, OGE_SAYISI).map((o) => (
            <li key={o.id} style={{ "--oran": oranSayisi(o.oran) } as CSSProperties}>
              <Gorsel className={s.kare} oran={o.oran} {...gorselBilgisi(o, dil)} sizes="(max-width: 1099px) 74vw, 30vw" />
            </li>
          ))}
        </ul>
      </div>
    </Bolum>
  );
}
