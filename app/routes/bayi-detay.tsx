import { ClockIcon } from "@phosphor-icons/react/Clock";
import { MapPinIcon } from "@phosphor-icons/react/MapPin";
import { PhoneIcon } from "@phosphor-icons/react/Phone";
import { Bolum } from "~/components/Bolum.tsx";
import { BulunamadiIcerik } from "~/components/HataIcerik.tsx";
import { Ikon } from "~/components/Ikon.tsx";
import { SayfaBasligi } from "~/components/SayfaBasligi.tsx";
import { type Bayi, bayiBul } from "~/content/bayiler.ts";
import { sozluk, usePaths, useT } from "~/i18n/index.ts";
import { saatMetni } from "~/lib/iletisim.ts";
import { dilBul } from "~/lib/rotalar.ts";
import { sayfaSeo, seo } from "~/lib/seo.ts";
import type { Route } from "./+types/bayi-detay";
import s from "./bayi-detay.module.css";

function adresMetni(b: Bayi): string {
  return `${b.adres.satir}, ${b.adres.postaKodu} ${b.adres.ilce}/${b.adres.il}`;
}

export const meta: Route.MetaFunction = ({ location, params }) => {
  const bayi = bayiBul(params.slug);
  if (!bayi) return sayfaSeo("bulunamadi", location.pathname, { indeksle: false });
  const dil = dilBul(location.pathname);
  const m = sozluk(dil).sayfalar.bayiDetay.meta;
  const ad = bayi.ad[dil];
  return seo({
    anahtar: "bayiDetay",
    dil,
    params: { slug: bayi.slug },
    baslik: m.baslik(ad),
    aciklama: m.aciklama(ad, adresMetni(bayi)),
  });
};

export default function BayiDetay({ params }: Route.ComponentProps) {
  const t = useT();
  const { dil, yol } = usePaths();
  const bayi = bayiBul(params.slug);
  if (!bayi) return <BulunamadiIcerik />;
  const m = t.sayfalar.bayiDetay;
  return (
    <>
      <SayfaBasligi
        geri={{ to: yol("bayilerimiz"), metin: m.geri }}
        etiket={m.etiket[bayi.tur]}
        baslik={bayi.ad[dil]}
        giris={adresMetni(bayi)}
      />
      <Bolum>
        <dl className={s.bilgi}>
          <div>
            <dt>
              <Ikon ikon={MapPinIcon} />
              {m.adres}
            </dt>
            <dd lang="tr">{adresMetni(bayi)}</dd>
          </div>
          {bayi.telefon ? (
            <div>
              <dt>
                <Ikon ikon={PhoneIcon} />
                {m.telefon}
              </dt>
              <dd>
                <a href={`tel:${bayi.telefon.e164}`}>{bayi.telefon.gorunen}</a>
              </dd>
            </div>
          ) : null}
          <div>
            <dt>
              <Ikon ikon={ClockIcon} />
              {t.saat.etiket}
            </dt>
            <dd>{saatMetni(t)}</dd>
          </div>
        </dl>
      </Bolum>
    </>
  );
}
