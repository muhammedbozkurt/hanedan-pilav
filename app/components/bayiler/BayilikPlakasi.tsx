import { Bolum } from "~/components/Bolum.tsx";
import { Etiket } from "~/components/Etiket.tsx";
import { BayilikFormu } from "~/components/form/BayilikFormu.tsx";
import { SITE } from "~/content/site.ts";
import { useBayilerimiz } from "~/i18n/bayilerimiz.ts";
import { usePaths } from "~/i18n/index.ts";
import { TEL_HREF } from "~/lib/iletisim.ts";
import { BAYILIK_CAPASI } from "~/lib/rotalar.ts";
import s from "./BayilikPlakasi.module.css";

// Vidalı sarı emaye plaka: motif bütçesinde yalnız bayilik bölümüne ayrılmıştır. Plaka görünürken FAB çekilir.
export function BayilikPlakasi() {
  const m = useBayilerimiz().bayilik;
  const { dil } = usePaths();
  const o = m.olgular;
  return (
    <Bolum id={BAYILIK_CAPASI[dil]} baslikId="bayilik-baslik" ustBoslukYok className={s.bolum}>
      <div className={s.plaka} data-fab-gizle="">
        <div className={s.metin}>
          <Etiket>{m.etiket}</Etiket>
          <h2 id="bayilik-baslik" className={s.baslik}>
            {m.baslik}
          </h2>
          <p className={s.giris}>{m.giris}</p>
          <h3 className="sr">{m.olgularBaslik}</h3>
          <dl className={s.olgular}>
            <div>
              <dt>{o.kurulus}</dt>
              <dd>{SITE.kurulusYili}</dd>
            </div>
            <div>
              <dt>{o.kapasite}</dt>
              <dd>{o.kapasiteDeger(SITE.uretimKapasitesi.miktar)}</dd>
            </div>
            <div>
              <dt>{o.merkez}</dt>
              <dd>{o.merkezDeger}</dd>
            </div>
          </dl>
          <div className={s.sonraki}>
            <h3>{m.sonrakiBaslik}</h3>
            <p>{m.sonraki}</p>
            <p>
              {m.telefonOnce}{" "}
              <a className={s.tel} href={TEL_HREF}>
                {SITE.telefon.gorunen}
              </a>
            </p>
          </div>
        </div>
        <div className={s.formAlani}>
          <h3 className="sr">{m.formBaslik}</h3>
          <BayilikFormu className={s.form} />
        </div>
      </div>
    </Bolum>
  );
}
