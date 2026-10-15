import { Bolum } from "~/components/Bolum.tsx";
import { Gorsel } from "~/components/Gorsel.tsx";
import { SITE } from "~/content/site.ts";
import { useKurumsal } from "~/i18n/kurumsal.ts";
import s from "./Hikaye.module.css";

export function Hikaye() {
  const m = useKurumsal().hikaye;
  const k = m.kunye;
  const kalemler = [
    { etiket: k.kurulus, deger: String(SITE.kurulusYili) },
    { etiket: k.merkez, deger: SITE.adres.ilce, yerel: true },
    { etiket: k.kapasite, deger: k.kapasiteDeger(SITE.uretimKapasitesi.miktar) },
    { etiket: k.hizmetAlani, deger: k.hizmetAlaniDeger },
  ];
  return (
    <Bolum baslikId="hikaye-baslik">
      <div className={s.izgara}>
        <Gorsel className={s.foto} oran="4:5" konu={m.gorsel.konu} not={m.gorsel.not} />
        <div className={s.metin}>
          <h2 id="hikaye-baslik">{m.baslik}</h2>
          {m.paragraflar.map((p) => (
            <p key={p} className={s.paragraf}>
              {p}
            </p>
          ))}
          <h3 className="sr">{k.baslik}</h3>
          <dl className={s.kunye}>
            {kalemler.map((kalem) => (
              <div key={kalem.etiket} className={s.kalem}>
                <dt>{kalem.etiket}</dt>
                <dd {...(kalem.yerel ? { lang: "tr", translate: "no" as const } : {})}>{kalem.deger}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Bolum>
  );
}
