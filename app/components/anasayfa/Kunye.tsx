import { Kap } from "~/components/Bolum.tsx";
import { SITE } from "~/content/site.ts";
import { useAnasayfa } from "~/i18n/anasayfa.ts";
import { cx } from "~/lib/cx.ts";
import s from "./Kunye.module.css";

// Siyah künye bandı. Değerler site.ts'ten; kapasite "üretim kapasitesi" olarak geçer.
export function Kunye() {
  const m = useAnasayfa().kunye;
  const kalemler = [
    { etiket: m.kurulus, deger: String(SITE.kurulusYili) },
    { etiket: m.kapasite, deger: m.kapasiteDeger(SITE.uretimKapasitesi.miktar) },
    { etiket: m.ag, deger: m.agDeger },
    { etiket: m.merkez, deger: SITE.adres.ilce, yerel: true },
  ];
  return (
    <section className={cx(s.kunye, "koyu")} aria-labelledby="kunye-baslik">
      <h2 id="kunye-baslik" className="sr">
        {m.baslik}
      </h2>
      <Kap>
        <dl className={s.liste}>
          {kalemler.map((k) => (
            <div key={k.etiket} className={s.kalem}>
              <dt>{k.etiket}</dt>
              <dd {...(k.yerel ? { lang: "tr", translate: "no" as const } : {})}>{k.deger}</dd>
            </div>
          ))}
        </dl>
      </Kap>
    </section>
  );
}
