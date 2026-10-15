import { ClockIcon } from "@phosphor-icons/react/Clock";
import { PhoneIcon } from "@phosphor-icons/react/Phone";
import { Bolum } from "~/components/Bolum.tsx";
import { Buton } from "~/components/Buton.tsx";
import { Etiket } from "~/components/Etiket.tsx";
import { Ikon } from "~/components/Ikon.tsx";
import { WaMini } from "~/components/WhatsApp.tsx";
import { SITE } from "~/content/site.ts";
import { useAnasayfa } from "~/i18n/anasayfa.ts";
import { usePaths, useT } from "~/i18n/index.ts";
import { cx } from "~/lib/cx.ts";
import { TEL_HREF, saatMetni, waHref } from "~/lib/iletisim.ts";
import { bayilikYolu } from "~/lib/rotalar.ts";
import s from "./BayilikPlakasi.module.css";

// Vidalı sarı emaye plaka (motif yalnız bayilik kapanışında). Plaka kendi WhatsApp eylemini taşıdığı için görünürken FAB çekilir.
export function BayilikPlakasi() {
  const m = useAnasayfa().plaka;
  const t = useT();
  const { dil } = usePaths();
  return (
    <Bolum baslikId="plaka-baslik" ustBoslukYok>
      <div className={s.plaka} data-fab-gizle="">
        <div className={s.metin}>
          <Etiket>{m.etiket}</Etiket>
          <h2 id="plaka-baslik">{m.baslik}</h2>
          <p>{m.metin}</p>
          <Buton to={bayilikYolu(dil)} varyant="kara" className={s.eylem}>
            {t.nav.bayilik}
          </Buton>
        </div>
        <ul className={s.iletisim}>
          <li>
            <a className={s.satir} href={TEL_HREF}>
              <Ikon ikon={PhoneIcon} className={s.simge} />
              <span className={s.k}>{m.telefon}</span>
              <span className={cx(s.v, "nw")}>{SITE.telefon.gorunen}</span>
            </a>
          </li>
          <li>
            <a className={s.satir} href={waHref(t)} target="_blank" rel="noopener noreferrer">
              <WaMini className={s.simge} />
              <span className={s.k}>{m.mesaj}</span>
              <span className={s.v}>{t.wa.etiket}</span>
              <span className="sr">{t.genel.yeniSekme}</span>
            </a>
          </li>
          <li>
            <div className={s.satir}>
              <Ikon ikon={ClockIcon} className={s.simge} />
              <span className={s.k}>{t.saat.etiket}</span>
              <span className={s.v}>{saatMetni(t)}</span>
            </div>
          </li>
        </ul>
      </div>
    </Bolum>
  );
}
