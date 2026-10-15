import { BuildingsIcon } from "@phosphor-icons/react/Buildings";
import { CalendarCheckIcon } from "@phosphor-icons/react/CalendarCheck";
import { ForkKnifeIcon } from "@phosphor-icons/react/ForkKnife";
import { Bolum } from "~/components/Bolum.tsx";
import { Buton } from "~/components/Buton.tsx";
import { Gorsel } from "~/components/Gorsel.tsx";
import { Ikon } from "~/components/Ikon.tsx";
import { usePaths } from "~/i18n/index.ts";
import { useKurumsal } from "~/i18n/kurumsal.ts";
import type { Dil } from "~/lib/rotalar.ts";
import s from "./Catering.module.css";

// Çapa iki dilde aynıdır, dış bağlantılar /kurumsal#catering ve /en/about#catering olarak kurulabilir.
const CAPA = "catering";

// İletişim sayfası konu ön seçimini bu sorgu anahtarından okur (TR ?konu=, EN ?topic=).
const KONU_ANAHTARI: Readonly<Record<Dil, string>> = { tr: "konu", en: "topic" };
const TEKLIF_KONUSU = "catering";

const ALANLAR = [
  { anahtar: "kurumsal", ikon: BuildingsIcon },
  { anahtar: "toplu", ikon: ForkKnifeIcon },
  { anahtar: "organizasyon", ikon: CalendarCheckIcon },
] as const;

export function Catering() {
  const m = useKurumsal().catering;
  const { dil, yol } = usePaths();
  const teklifYolu = `${yol("iletisim")}?${new URLSearchParams({ [KONU_ANAHTARI[dil]]: TEKLIF_KONUSU })}`;
  return (
    <Bolum id={CAPA} baslikId="catering-baslik">
      <div className={s.izgara}>
        <div className={s.metin}>
          <h2 id="catering-baslik">{m.baslik}</h2>
          <p className={s.paragraf}>{m.metin}</p>
          <h3 className="sr">{m.alanlarBaslik}</h3>
          <ul className={s.alanlar}>
            {ALANLAR.map(({ anahtar, ikon }) => (
              <li key={anahtar}>
                <Ikon ikon={ikon} className={s.ikon} />
                <span>{m.alanlar[anahtar]}</span>
              </li>
            ))}
          </ul>
          <Buton to={teklifYolu} className={s.eylem}>
            {m.eylem}
          </Buton>
        </div>
        <Gorsel className={s.foto} oran="4:3" konu={m.gorsel.konu} not={m.gorsel.not} />
      </div>
    </Bolum>
  );
}
