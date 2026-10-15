import { BuildingsIcon } from "@phosphor-icons/react/Buildings";
import { CalendarCheckIcon } from "@phosphor-icons/react/CalendarCheck";
import { ForkKnifeIcon } from "@phosphor-icons/react/ForkKnife";
import { Bolum } from "~/components/Bolum.tsx";
import { Buton } from "~/components/Buton.tsx";
import { Gorsel } from "~/components/Gorsel.tsx";
import { Ikon } from "~/components/Ikon.tsx";
import { usePaths } from "~/i18n/index.ts";
import { kurumsalSozluk, useKurumsal } from "~/i18n/kurumsal.ts";
import { CATERING_CAPASI, teklifYolu } from "~/lib/rotalar.ts";
import s from "./Catering.module.css";

const ALANLAR = [
  { anahtar: "kurumsal", ikon: BuildingsIcon },
  { anahtar: "toplu", ikon: ForkKnifeIcon },
  { anahtar: "organizasyon", ikon: CalendarCheckIcon },
] as const;

export function Catering() {
  const m = useKurumsal().catering;
  const { dil } = usePaths();
  return (
    <Bolum id={CATERING_CAPASI} baslikId="catering-baslik">
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
          <Buton to={teklifYolu(dil)} className={s.eylem}>
            {m.eylem}
          </Buton>
        </div>
        <Gorsel className={s.foto} oran="4:3" konu={m.gorsel.konu} cekim={kurumsalSozluk("tr").catering.gorsel} />
      </div>
    </Bolum>
  );
}
