import { MapPinIcon } from "@phosphor-icons/react/MapPin";
import { Bolum } from "~/components/Bolum.tsx";
import { Buton } from "~/components/Buton.tsx";
import { IstanbulHarita } from "~/components/harita/IstanbulHarita.tsx";
import { ilceBul } from "~/content/ilceler.ts";
import { SITE } from "~/content/site.ts";
import { useAnasayfa } from "~/i18n/anasayfa.ts";
import { usePaths } from "~/i18n/index.ts";
import { cx } from "~/lib/cx.ts";
import s from "./HaritaTanitim.module.css";

// Harita panosu: kart sol üstte, harita tüm il kırpımıyla sağa yaslı. Dar ekranda kart üstte, harita merkeze yakınlaşmış kesitte.
export function HaritaTanitim() {
  const m = useAnasayfa().harita;
  const { yol } = usePaths();
  const merkez = ilceBul(SITE.adres.ilce);
  return (
    <Bolum baslikId="bayi-baslik" ustBoslukYok>
      <div className={s.pano}>
        <div className={s.kart}>
          <h2 id="bayi-baslik">{m.baslik}</h2>
          <p>{m.metin}</p>
          <Buton to={yol("bayilerimiz")} ikon={MapPinIcon} className={s.eylem}>
            {m.eylem}
          </Buton>
        </div>
        <div className={s.kesit}>
          <IstanbulHarita
            varyant="tanitim"
            kirpma="tum"
            vurgulu={merkez ? [merkez.slug] : []}
            pinler={merkez ? [{ ilce: merkez.slug, etiket: `${m.pin} · ${SITE.adres.ilce}` }] : []}
            ariaEtiket={m.ariaEtiket(SITE.adres.ilce)}
            className={s.harita}
          />
          <span className={cx(s.deniz, s.karadeniz)} aria-hidden="true">
            {m.karadeniz}
          </span>
          <span className={cx(s.deniz, s.marmara)} aria-hidden="true">
            {m.marmara}
          </span>
        </div>
      </div>
    </Bolum>
  );
}
