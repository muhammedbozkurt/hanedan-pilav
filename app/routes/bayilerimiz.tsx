import { ArrowRightIcon } from "@phosphor-icons/react/ArrowRight";
import { MapPinIcon } from "@phosphor-icons/react/MapPin";
import { PhoneIcon } from "@phosphor-icons/react/Phone";
import { useState } from "react";
import { Link } from "react-router";
import { Bolum } from "~/components/Bolum.tsx";
import { Buton } from "~/components/Buton.tsx";
import { Etiket } from "~/components/Etiket.tsx";
import { IstanbulHarita } from "~/components/harita/IstanbulHarita.tsx";
import { Ikon } from "~/components/Ikon.tsx";
import { SayfaBasligi } from "~/components/SayfaBasligi.tsx";
import { BAYILER } from "~/content/bayiler.ts";
import { ilceBul } from "~/content/ilceler.ts";
import { HARITA_METNI } from "~/i18n/harita.ts";
import { usePaths, useT } from "~/i18n/index.ts";
import { TEL_HREF, waHref } from "~/lib/iletisim.ts";
import { BAYILIK_CAPASI } from "~/lib/rotalar.ts";
import { sayfaSeo } from "~/lib/seo.ts";
import type { Route } from "./+types/bayilerimiz";
import s from "./bayilerimiz.module.css";

export const meta: Route.MetaFunction = ({ location }) => sayfaSeo("bayilerimiz", location.pathname);

export default function Bayilerimiz() {
  const t = useT();
  const { dil, yol } = usePaths();
  const m = t.sayfalar.bayilerimiz;
  const [secili, setSecili] = useState<string | null>(null);
  const merkez = BAYILER.find((b) => b.tur === "merkez");
  const merkezIlce = merkez ? ilceBul(merkez.adres.ilce) : undefined;
  return (
    <>
      <SayfaBasligi etiket={m.etiket} baslik={m.baslik} giris={m.giris} />
      <Bolum baslikId="bayi-harita-baslik" ustBoslukYok>
        <h2 id="bayi-harita-baslik" className="sr">
          {HARITA_METNI[dil].grupAria}
        </h2>
        <IstanbulHarita
          varyant="tam"
          vurgulu={merkezIlce ? [merkezIlce.slug] : []}
          pinler={merkezIlce ? [{ ilce: merkezIlce.slug, etiket: HARITA_METNI[dil].merkezEtiket }] : []}
          secili={secili}
          onSec={setSecili}
        />
      </Bolum>
      <Bolum baslikId="bayi-listesi-baslik">
        <h2 id="bayi-listesi-baslik" className="sr">
          {m.listeBaslik}
        </h2>
        <ul className={s.liste}>
          {BAYILER.map((b) => (
            <li key={b.slug}>
              <Link className={s.satir} to={yol("bayiDetay", { slug: b.slug })}>
                <span className={s.ikon}>
                  <Ikon ikon={MapPinIcon} />
                </span>
                <span className={s.ad}>{b.ad[dil]}</span>
                <span className={s.adres}>
                  {b.adres.satir}, {b.adres.postaKodu} {b.adres.ilce}/{b.adres.il}
                </span>
                <span className={s.ok} aria-hidden="true">
                  <Ikon ikon={ArrowRightIcon} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Bolum>
      <Bolum id={BAYILIK_CAPASI[dil]} baslikId="bayilik-baslik" ustBoslukYok>
        <div className={s.plaka} data-fab-gizle="">
          <Etiket>{m.bayilikEtiket}</Etiket>
          <h2 id="bayilik-baslik">{m.bayilikBaslik}</h2>
          <p>{m.bayilikGiris}</p>
          <div className={s.eylemler}>
            <Buton href={TEL_HREF} varyant="kara" ikon={PhoneIcon}>
              {m.ara}
            </Buton>
            <Buton href={waHref(t)} varyant="emaye" yeniSekme yeniSekmeMetni={t.genel.yeniSekme}>
              {t.wa.etiket}
            </Buton>
          </div>
        </div>
      </Bolum>
    </>
  );
}
