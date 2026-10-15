import { ArrowRightIcon } from "@phosphor-icons/react/ArrowRight";
import { PhoneIcon } from "@phosphor-icons/react/Phone";
import { XIcon } from "@phosphor-icons/react/X";
import { useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { SITE } from "~/content/site.ts";
import { usePaths, useT } from "~/i18n/index.ts";
import { cx } from "~/lib/cx.ts";
import { TEL_HREF, saatMetni, waHref } from "~/lib/iletisim.ts";
import { bayilikYolu } from "~/lib/rotalar.ts";
import { Buton } from "./Buton.tsx";
import { Ikon } from "./Ikon.tsx";
import { LangSwitch } from "./LangSwitch.tsx";
import s from "./MobilMenu.module.css";
import { NAV_ANAHTARLARI } from "./nav.ts";
import { WaMini } from "./WhatsApp.tsx";

const GENIS_EKRAN = "(min-width:1100px)";

function odaklanabilirler(kok: HTMLElement): HTMLElement[] {
  return Array.from(kok.querySelectorAll<HTMLElement>("a[href],button:not([disabled])")).filter(
    (el) => el.getClientRects().length > 0,
  );
}

type Props = { acik: boolean; kapat: (odakGeri: boolean) => void };

export function MobilMenu({ acik, kapat }: Props) {
  const t = useT();
  const { dil, yol } = usePaths();
  const { pathname } = useLocation();
  const kokRef = useRef<HTMLDivElement>(null);
  const kapatRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const kok = kokRef.current;
    if (!acik || !kok) return;
    const html = document.documentElement;
    const arkaPlan = Array.from(document.querySelectorAll<HTMLElement>("[data-arka-plan]"));
    html.classList.add("menu-acik");
    for (const el of arkaPlan) el.inert = true;
    kapatRef.current?.focus();

    function tus(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        kapat(true);
        return;
      }
      if (e.key !== "Tab" || !kok) return;
      const liste = odaklanabilirler(kok);
      const ilk = liste[0];
      const son = liste[liste.length - 1];
      if (!ilk || !son) return;
      const aktif = document.activeElement;
      const icerde = aktif instanceof Node && kok.contains(aktif);
      if (e.shiftKey && (aktif === ilk || !icerde)) {
        e.preventDefault();
        son.focus();
      } else if (!e.shiftKey && (aktif === son || !icerde)) {
        e.preventDefault();
        ilk.focus();
      }
    }
    document.addEventListener("keydown", tus);

    const genis = window.matchMedia(GENIS_EKRAN);
    const genisDegisti = () => {
      if (genis.matches) kapat(false);
    };
    genis.addEventListener("change", genisDegisti);

    return () => {
      document.removeEventListener("keydown", tus);
      genis.removeEventListener("change", genisDegisti);
      html.classList.remove("menu-acik");
      for (const el of arkaPlan) el.inert = false;
    };
  }, [acik, kapat]);

  // Geri/ileri gibi menü dışı gezinmelerde menü açık kalmasın.
  useEffect(() => {
    kapat(false);
  }, [pathname, kapat]);

  const linkKapat = () => kapat(false);

  return (
    <div
      ref={kokRef}
      className={cx(s.mm, "koyu")}
      id="mobil-menu"
      role="dialog"
      aria-modal="true"
      aria-label={t.genel.menuAria}
      hidden={!acik}
    >
      <div className={s.bar}>
        <div className={cx("kap", s.barIc)}>
          <Link className={s.logo} to={yol("anasayfa")} onClick={linkKapat}>
            <img src="/img/logo-saydam.png" width={520} height={188} alt={t.genel.logoAlt} />
          </Link>
          <button ref={kapatRef} className={s.kapat} type="button" onClick={() => kapat(true)}>
            <Ikon ikon={XIcon} />
            <span>{t.genel.kapat}</span>
          </button>
        </div>
      </div>
      <div className={cx("kap", s.govde)}>
        <nav className={s.nav} aria-label={t.genel.navAria}>
          <ul>
            {NAV_ANAHTARLARI.map((anahtar) => (
              <li key={anahtar}>
                <NavLink to={yol(anahtar)} onClick={linkKapat}>
                  <span>{t.nav[anahtar]}</span>
                  <Ikon ikon={ArrowRightIcon} />
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <Buton to={bayilikYolu(dil)} className={s.cta} onClick={linkKapat}>
          {t.nav.bayilik}
        </Buton>
        <div className={s.alt}>
          <a href={TEL_HREF}>
            <Ikon ikon={PhoneIcon} />
            <span className="sr">{t.genel.telSr}</span>
            {SITE.telefon.gorunen}
          </a>
          <a href={waHref(t)} target="_blank" rel="noopener noreferrer">
            <WaMini />
            <span>{t.wa.etiket}</span>
            <span className="sr">{t.genel.yeniSekme}</span>
          </a>
          <div className={s.satir}>
            <span>{saatMetni(t)}</span>
            <LangSwitch koyu />
          </div>
        </div>
      </div>
    </div>
  );
}
