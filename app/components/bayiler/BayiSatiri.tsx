import { ArrowRightIcon } from "@phosphor-icons/react/ArrowRight";
import { NavigationArrowIcon } from "@phosphor-icons/react/NavigationArrow";
import { PhoneIcon } from "@phosphor-icons/react/Phone";
import { Link } from "react-router";
import { Etiket } from "~/components/Etiket.tsx";
import { Ikon } from "~/components/Ikon.tsx";
import type { Bayi } from "~/content/bayiler.ts";
import { useBayilerimiz } from "~/i18n/bayilerimiz.ts";
import { usePaths, useT } from "~/i18n/index.ts";
import { adresMetni, yolTarifiHref } from "./bayi.ts";
import s from "./BayiSatiri.module.css";

// Liste satırı birden çok bağlantı taşır; bu yüzden satırın tamamı tek bağlantı değildir. Detay sayfasına bayi adı gider.
export function BayiSatiri({ bayi, mesafe }: { bayi: Bayi; mesafe?: string | undefined }) {
  const m = useBayilerimiz().satir;
  const t = useT();
  const { dil, yol } = usePaths();
  const ad = bayi.ad[dil];
  return (
    <article className={s.satir} aria-labelledby={`bayi-${bayi.slug}`}>
      <div className={s.ust}>
        <h3 className={s.ad} id={`bayi-${bayi.slug}`}>
          <Link className={s.adLink} to={yol("bayiDetay", { slug: bayi.slug })}>
            <span>{ad}</span>
            <Ikon ikon={ArrowRightIcon} />
          </Link>
        </h3>
        <Etiket className={s.tur}>{m.tur[bayi.tur]}</Etiket>
        {mesafe ? <span className={s.mesafe}>{mesafe}</span> : null}
      </div>
      <p className={s.adres} lang="tr">
        {adresMetni(bayi)}
      </p>
      <div className={s.eylemler}>
        {bayi.telefon ? (
          <a className={s.eylem} href={`tel:${bayi.telefon.e164}`}>
            <Ikon ikon={PhoneIcon} />
            <span className="sr">{m.telefonSr} </span>
            <span className="nw">{bayi.telefon.gorunen}</span>
          </a>
        ) : null}
        {/* Görünür etiket erişilebilir adın başında kalır; ad ve yeni sekme bilgisi ekran okuyucuya eklenir. */}
        <a
          className={s.eylem}
          href={yolTarifiHref(bayi)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${m.yolTarifiAria(ad)}${t.genel.yeniSekme}`}
        >
          <Ikon ikon={NavigationArrowIcon} />
          <span>{m.yolTarifi}</span>
        </a>
      </div>
    </article>
  );
}
