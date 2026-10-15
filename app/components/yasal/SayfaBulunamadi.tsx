import type { Icon } from "@phosphor-icons/react";
import { ArrowRightIcon } from "@phosphor-icons/react/ArrowRight";
import { ChatCircleIcon } from "@phosphor-icons/react/ChatCircle";
import { HouseIcon } from "@phosphor-icons/react/House";
import { MapPinIcon } from "@phosphor-icons/react/MapPin";
import { Link } from "react-router";
import { Kap } from "~/components/Bolum.tsx";
import { Ikon } from "~/components/Ikon.tsx";
import { SayfaBasligi } from "~/components/SayfaBasligi.tsx";
import { type BulunamadiHedefi, useBulunamadi } from "~/i18n/bulunamadi.ts";
import { usePaths } from "~/i18n/index.ts";
import s from "./SayfaBulunamadi.module.css";

const HEDEFLER: readonly { anahtar: BulunamadiHedefi; ikon: Icon }[] = [
  { anahtar: "anasayfa", ikon: HouseIcon },
  { anahtar: "bayilerimiz", ikon: MapPinIcon },
  { anahtar: "iletisim", ikon: ChatCircleIcon },
];

// 404 gövdesi. Kök hata sınırı da aynı görünümü kullanmalı: bilinmeyen adreste prerender edilmiş /404 HTML'i hidrasyonda hata sınırıyla eşleşir.
export function SayfaBulunamadi() {
  const m = useBulunamadi();
  const { yol } = usePaths();
  return (
    <>
      <SayfaBasligi etiket={m.etiket} baslik={m.baslik} giris={m.giris} />
      <Kap className={s.govde}>
        <nav className={s.devam} aria-labelledby="devam-baslik">
          <h2 id="devam-baslik">{m.devamBaslik}</h2>
          <ul>
            {HEDEFLER.map(({ anahtar, ikon }) => (
              <li key={anahtar}>
                <Link className={s.satir} to={yol(anahtar)}>
                  <span className={s.simge}>
                    <Ikon ikon={ikon} />
                  </span>
                  <span className={s.ad}>{m.baglantilar[anahtar].baslik}</span>
                  <span className={s.aciklama}>{m.baglantilar[anahtar].aciklama}</span>
                  <span className={s.ok}>
                    <Ikon ikon={ArrowRightIcon} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Kap>
    </>
  );
}
