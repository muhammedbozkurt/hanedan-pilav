import { ClockIcon } from "@phosphor-icons/react/Clock";
import { MapPinIcon } from "@phosphor-icons/react/MapPin";
import { NavigationArrowIcon } from "@phosphor-icons/react/NavigationArrow";
import { PhoneIcon } from "@phosphor-icons/react/Phone";
import { Bolum } from "~/components/Bolum.tsx";
import { Buton } from "~/components/Buton.tsx";
import { adresMetni, ilceSlugu, yolTarifiHref } from "~/components/bayiler/bayi.ts";
import { IstanbulHarita } from "~/components/harita/IstanbulHarita.tsx";
import { BulunamadiIcerik } from "~/components/HataIcerik.tsx";
import { Ikon } from "~/components/Ikon.tsx";
import { SayfaBasligi } from "~/components/SayfaBasligi.tsx";
import { bayiBul } from "~/content/bayiler.ts";
import { bayilerimizSozluk, useBayilerimiz } from "~/i18n/bayilerimiz.ts";
import { usePaths, useT } from "~/i18n/index.ts";
import { saatMetni } from "~/lib/iletisim.ts";
import { bayiJsonLd, jsonLdMetni } from "~/lib/jsonld.ts";
import { dilBul } from "~/lib/rotalar.ts";
import { sayfaSeo, seo } from "~/lib/seo.ts";
import type { Route } from "./+types/bayi-detay";
import s from "./bayi-detay.module.css";

export const meta: Route.MetaFunction = ({ location, params }) => {
  const bayi = bayiBul(params.slug);
  if (!bayi) return sayfaSeo("bulunamadi", location.pathname, { indeksle: false });
  const dil = dilBul(location.pathname);
  const m = bayilerimizSozluk(dil).detay.meta;
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
  const sozluk = useBayilerimiz();
  const { dil, yol } = usePaths();
  const bayi = bayiBul(params.slug);
  if (!bayi) return <BulunamadiIcerik />;
  const m = sozluk.detay;
  const ilce = ilceSlugu(bayi);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdMetni(bayiJsonLd(bayi, dil)) }} />
      <SayfaBasligi
        geri={{ to: yol("bayilerimiz"), metin: m.geri }}
        etiket={sozluk.satir.tur[bayi.tur]}
        baslik={bayi.ad[dil]}
        eylemler={
          <>
            {bayi.telefon ? (
              <Buton href={`tel:${bayi.telefon.e164}`} varyant="kara" ikon={PhoneIcon}>
                {m.ara}
              </Buton>
            ) : null}
            <Buton href={yolTarifiHref(bayi)} varyant="emaye" ikon={NavigationArrowIcon} yeniSekme yeniSekmeMetni={t.genel.yeniSekme}>
              {m.yolTarifi}
            </Buton>
          </>
        }
      />
      <Bolum baslikId="detay-bilgi-baslik" className={s.bolum}>
        <div className={s.duzen}>
          <div>
            <h2 id="detay-bilgi-baslik" className="sr">
              {m.bilgiBaslik}
            </h2>
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
                    <a className={s.tel} href={`tel:${bayi.telefon.e164}`}>
                      {bayi.telefon.gorunen}
                    </a>
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
          </div>
          {ilce ? (
            <IstanbulHarita varyant="mini" vurgulu={[ilce]} pinler={[{ ilce, etiket: bayi.adres.ilce }]} className={s.harita} />
          ) : null}
        </div>
      </Bolum>
    </>
  );
}
