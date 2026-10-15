import { InfoIcon } from "@phosphor-icons/react/Info";
import { Link } from "react-router";
import { Kap } from "~/components/Bolum.tsx";
import { Ikon } from "~/components/Ikon.tsx";
import { SayfaBasligi } from "~/components/SayfaBasligi.tsx";
import type { YasalSayfaMetni, YasalSozluk } from "~/i18n/yasal.ts";
import { SON_GUNCELLEME } from "./bilgiler.ts";
import { YasalBolumGoster, eksikAlanlar } from "./YasalMetin.tsx";
import s from "./YasalSayfa.module.css";

type Props<K extends string> = {
  metin: YasalSayfaMetni<K>;
  sira: readonly K[];
  ortak: YasalSozluk["ortak"];
};

// Saat dilimi sabit: prerender ve tarayıcı aynı günü yazar, hidrasyon farkı oluşmaz.
function tarihMetni(yerel: string): string {
  return new Intl.DateTimeFormat(yerel, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${SON_GUNCELLEME}T00:00:00Z`),
  );
}

const sira2 = (i: number) => String(i + 1).padStart(2, "0");

export function YasalSayfa<K extends string>({ metin, sira, ortak }: Props<K>) {
  const bolumler = sira.map((k) => metin.bolumler[k]);
  const taslak = eksikAlanlar(bolumler).length > 0;
  return (
    <>
      <SayfaBasligi etiket={metin.etiket} baslik={metin.baslik} giris={metin.giris}>
        <p className={s.guncelleme}>
          {ortak.sonGuncelleme} <time dateTime={SON_GUNCELLEME}>{tarihMetni(ortak.tarihYerel)}</time>
        </p>
        {taslak ? (
          <p className={s.taslak} role="note">
            <Ikon ikon={InfoIcon} />
            <span>{ortak.eksikNotu}</span>
          </p>
        ) : null}
      </SayfaBasligi>
      <Kap className={s.govde}>
        <div className={s.yerlesim}>
          <nav className={s.icindekiler} aria-labelledby="icindekiler-baslik">
            <h2 id="icindekiler-baslik">{ortak.icindekiler}</h2>
            <ol>
              {bolumler.map((b, i) => (
                <li key={b.id}>
                  <Link to={`#${b.id}`}>
                    <span className={s.no} aria-hidden="true">
                      {sira2(i)}
                    </span>
                    <span>{b.baslik}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
          <div className={s.metin}>
            {bolumler.map((b, i) => (
              <YasalBolumGoster key={b.id} bolum={b} no={sira2(i)} ortak={ortak} />
            ))}
          </div>
        </div>
      </Kap>
    </>
  );
}
