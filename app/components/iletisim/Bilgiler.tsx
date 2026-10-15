import { ClockIcon } from "@phosphor-icons/react/Clock";
import { EnvelopeIcon } from "@phosphor-icons/react/Envelope";
import { MapPinIcon } from "@phosphor-icons/react/MapPin";
import { PhoneIcon } from "@phosphor-icons/react/Phone";
import { Buton } from "~/components/Buton.tsx";
import { IstanbulHarita } from "~/components/harita/IstanbulHarita.tsx";
import { Ikon } from "~/components/Ikon.tsx";
import { WhatsAppGlyph } from "~/components/WhatsApp.tsx";
import { ilceBul } from "~/content/ilceler.ts";
import { SITE, adresSatirlari, adresTekSatir } from "~/content/site.ts";
import { HARITA_METNI } from "~/i18n/harita.ts";
import { usePaths, useT } from "~/i18n/index.ts";
import { useIletisim } from "~/i18n/iletisim.ts";
import { TEL_HREF, saatMetni, waHref } from "~/lib/iletisim.ts";
import s from "./Bilgiler.module.css";

const YOL_TARIFI = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adresTekSatir())}`;

export function Bilgiler() {
  const t = useT();
  const m = useIletisim().bilgi;
  const { dil } = usePaths();
  const [adres1, adres2] = adresSatirlari();
  const ilce = ilceBul(SITE.adres.ilce);
  return (
    <div className={s.kolon}>
      <h2 className="sr">{m.baslik}</h2>
      <dl className={s.liste}>
        <div className={s.satir}>
          <dt>
            <Ikon ikon={PhoneIcon} />
            {m.telefon}
          </dt>
          <dd>
            <a className={s.telefon} href={TEL_HREF}>
              <span className="sr">{t.genel.telSr} </span>
              {SITE.telefon.gorunen}
            </a>
          </dd>
        </div>
        <div className={s.satir}>
          <dt>
            <WhatsAppGlyph className={s.wa} />
            {m.whatsapp}
          </dt>
          <dd>
            <Buton href={waHref(t)} yeniSekme yeniSekmeMetni={m.yeniSekme} varyant="emaye">
              {m.whatsappEylem}
            </Buton>
          </dd>
        </div>
        {SITE.eposta ? (
          <div className={s.satir}>
            <dt>
              <Ikon ikon={EnvelopeIcon} />
              {m.eposta}
            </dt>
            <dd>
              <a className={s.metinLink} href={`mailto:${SITE.eposta}`}>
                {SITE.eposta}
              </a>
            </dd>
          </div>
        ) : null}
        <div className={s.satir}>
          <dt>
            <Ikon ikon={ClockIcon} />
            {m.saat}
          </dt>
          <dd>{saatMetni(t)}</dd>
        </div>
        <div className={s.satir}>
          <dt>
            <Ikon ikon={MapPinIcon} />
            {m.adres}
          </dt>
          <dd>
            <address lang="tr" className={s.adres}>
              {adres1}
              <br />
              {adres2}
            </address>
            <a className={s.metinLink} href={YOL_TARIFI} target="_blank" rel="noopener noreferrer">
              {m.yolTarifi}
              <span className="sr">{m.yeniSekme}</span>
            </a>
          </dd>
        </div>
      </dl>
      <IstanbulHarita
        varyant="mini"
        className={s.harita}
        vurgulu={ilce ? [ilce.slug] : []}
        pinler={ilce ? [{ ilce: ilce.slug, etiket: HARITA_METNI[dil].merkezEtiket }] : []}
      />
    </div>
  );
}
