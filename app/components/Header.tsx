import { ListIcon } from "@phosphor-icons/react/List";
import { PhoneIcon } from "@phosphor-icons/react/Phone";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router";
import { SITE } from "~/content/site.ts";
import { usePaths, useT } from "~/i18n/index.ts";
import { cx } from "~/lib/cx.ts";
import { TEL_HREF } from "~/lib/iletisim.ts";
import { bayilikYolu } from "~/lib/rotalar.ts";
import { Buton } from "./Buton.tsx";
import s from "./Header.module.css";
import { Ikon } from "./Ikon.tsx";
import { LangSwitch } from "./LangSwitch.tsx";
import { Logo } from "./Logo.tsx";
import { MobilMenu } from "./MobilMenu.tsx";
import { NAV_ANAHTARLARI } from "./nav.ts";

export function Header() {
  const t = useT();
  const { dil, yol } = usePaths();
  const [kompakt, setKompakt] = useState(false);
  const [menuAcik, setMenuAcik] = useState(false);
  const isaretRef = useRef<HTMLDivElement>(null);
  const menuButonRef = useRef<HTMLButtonElement>(null);

  // Tente sabit konumlu ve gövde üst boşluğu sabit; kompakt hâl yalnız transform kullanır, sayfa yerleşimi kaymaz.
  useEffect(() => {
    const isaret = isaretRef.current;
    if (!isaret || !("IntersectionObserver" in window)) return;
    const gozcu = new IntersectionObserver((girdiler) => {
      const g = girdiler[0];
      if (g) setKompakt(!g.isIntersecting);
    });
    gozcu.observe(isaret);
    return () => gozcu.disconnect();
  }, []);

  const menuKapat = useCallback((odakGeri: boolean) => {
    setMenuAcik(false);
    if (odakGeri) requestAnimationFrame(() => menuButonRef.current?.focus());
  }, []);

  return (
    <>
      <div ref={isaretRef} className={s.isaret} aria-hidden="true" />
      <header className={cx(s.tente, kompakt && s.kompakt)} data-arka-plan="" data-kompakt={kompakt ? "true" : "false"}>
        <div className={s.kanvas} aria-hidden="true" />
        <div className={s.sacak}>
          <div className={cx("kap", s.sacakIc)}>
            <Link className={s.logo} to={yol("anasayfa")}>
              <Logo alt={t.genel.logoAlt} />
            </Link>
            <nav className={s.nav} aria-label={t.genel.navAria}>
              <ul>
                {NAV_ANAHTARLARI.map((anahtar) => (
                  <li key={anahtar}>
                    <NavLink to={yol(anahtar)}>{t.nav[anahtar]}</NavLink>
                  </li>
                ))}
              </ul>
            </nav>
            <div className={s.sag}>
              <LangSwitch className={s.dil} />
              <a className={s.tel} href={TEL_HREF}>
                <Ikon ikon={PhoneIcon} />
                <span className="sr">{t.genel.telSr}</span>
                <span className={s.telNo}>{SITE.telefon.gorunen}</span>
              </a>
              <Buton to={bayilikYolu(dil)} varyant="kara" kucuk className={s.cta}>
                {t.nav.bayilik}
              </Buton>
              <button
                ref={menuButonRef}
                className={s.menuAc}
                type="button"
                aria-expanded={menuAcik}
                aria-controls="mobil-menu"
                onClick={() => setMenuAcik(true)}
              >
                <Ikon ikon={ListIcon} />
                <span>{t.genel.menu}</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <MobilMenu acik={menuAcik} kapat={menuKapat} />
    </>
  );
}
