import { Link } from "react-router";
import { SITE, adresSatirlari } from "~/content/site.ts";
import { usePaths, useT } from "~/i18n/index.ts";
import { cx } from "~/lib/cx.ts";
import { TEL_HREF, saatMetni, waHref } from "~/lib/iletisim.ts";
import { bayilikYolu } from "~/lib/rotalar.ts";
import s from "./Footer.module.css";
import { LangSwitch } from "./LangSwitch.tsx";
import { Logo } from "./Logo.tsx";
import { NAV_ANAHTARLARI } from "./nav.ts";

export function Footer() {
  const t = useT();
  const { dil, yol } = usePaths();
  const [adres1, adres2] = adresSatirlari();
  return (
    <footer className={cx(s.alt, "koyu")} data-arka-plan="">
      <div className={cx("kap", s.ic)}>
        <div className={s.marka}>
          <Logo alt={SITE.marka} tembel />
          <p>
            <span lang="tr">{t.alt.slogan}</span>: {t.alt.cumle}
          </p>
        </div>
        <div className={s.merkez}>
          <h2>{t.alt.merkez}</h2>
          <address lang="tr">
            {adres1}
            <br />
            {adres2}
          </address>
        </div>
        <nav className={s.sayfalar} aria-label={t.alt.sayfalar}>
          <h2>{t.alt.sayfalar}</h2>
          <ul>
            {NAV_ANAHTARLARI.map((anahtar) => (
              <li key={anahtar}>
                <Link to={yol(anahtar)}>{t.nav[anahtar]}</Link>
              </li>
            ))}
            <li>
              <Link to={bayilikYolu(dil)}>{t.nav.bayilik}</Link>
            </li>
          </ul>
        </nav>
        <div className={s.iletisim}>
          <h2>{t.alt.iletisim}</h2>
          <ul>
            <li>
              <a className="nw" href={TEL_HREF}>
                {SITE.telefon.gorunen}
              </a>
            </li>
            <li>
              <a href={waHref(t)} target="_blank" rel="noopener noreferrer">
                <span>{t.wa.etiket}</span>
                <span className="sr">{t.genel.yeniSekme}</span>
              </a>
            </li>
            <li>
              <span>{saatMetni(t)}</span>
            </li>
          </ul>
        </div>
        <div className={s.son}>
          <span>{t.alt.telif(__YAPIM_YILI__)}</span>
          <div className={s.sonSag}>
            <nav className={s.yasal} aria-label={t.alt.yasal}>
              <Link to={yol("kvkk")}>{t.alt.kvkk}</Link>
              <Link to={yol("cerez")}>{t.alt.cerez}</Link>
            </nav>
            <LangSwitch koyu />
          </div>
        </div>
      </div>
    </footer>
  );
}
