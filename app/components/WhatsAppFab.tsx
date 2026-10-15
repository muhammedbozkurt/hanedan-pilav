import { useEffect, useRef, useState } from "react";
import { useT } from "~/i18n/index.ts";
import { cx } from "~/lib/cx.ts";
import { waHref } from "~/lib/iletisim.ts";
import { WhatsAppGlyph } from "./WhatsApp.tsx";
import s from "./WhatsAppFab.module.css";

// `data-fab-gizle` taşıyan bir bölüm (ör. kendi WhatsApp/form eylemi olan bölümler) iki durumda FAB'ı çeker:
// görünür alanın yeterli kısmını kapladığında, ya da içindeki form FAB'ın kapladığı alt şeritle kesiştiği sürece
// (şerit kuralı yalnız formu izler; formsuz bölümlerde tablet boylarında sayfa açılışında FAB'ı gereksiz gizlerdi).
const SERIT_PAYI = 12;
const ESIKLER = Array.from({ length: 21 }, (_, i) => i / 20);

function yeterinceGorunur(g: IntersectionObserverEntry): boolean {
  if (!g.isIntersecting) return false;
  const olcu = Math.min(g.boundingClientRect.height, window.innerHeight);
  return olcu > 0 && g.intersectionRect.height >= olcu * 0.3;
}

// Formlu bölümde iki kural da formu izler: uzun bölümün yalnız üst kısmı görünürken FAB boş yere gizlenmez.
function izle(el: Element, oranGozcu: IntersectionObserver, seritGozcu: IntersectionObserver) {
  const form = el.querySelector("form");
  oranGozcu.observe(form ?? el);
  if (form) seritGozcu.observe(form);
}

export function WhatsAppFab() {
  const t = useT();
  const [gizli, setGizli] = useState(false);
  const fabRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const fab = fabRef.current;
    if (!fab) return;
    const oran = new Set<Element>();
    const serit = new Set<Element>();
    const izlenen = new Set<Element>();
    let gozculer: IntersectionObserver[] = [];
    const guncelle = () => setGizli(oran.size > 0 || serit.size > 0);
    const kur = () => {
      for (const g of gozculer) g.disconnect();
      serit.clear();
      const alt = Number.parseFloat(getComputedStyle(fab).bottom) || 0;
      const yukseklik = Math.min(window.innerHeight, fab.offsetHeight + alt + SERIT_PAYI);
      const oranGozcu = new IntersectionObserver(
        (girdiler) => {
          for (const g of girdiler) {
            if (yeterinceGorunur(g)) oran.add(g.target);
            else oran.delete(g.target);
          }
          guncelle();
        },
        { threshold: ESIKLER },
      );
      const seritGozcu = new IntersectionObserver(
        (girdiler) => {
          for (const g of girdiler) {
            if (g.isIntersecting) serit.add(g.target);
            else serit.delete(g.target);
          }
          guncelle();
        },
        { rootMargin: `-${Math.max(0, window.innerHeight - yukseklik)}px 0px 0px 0px` },
      );
      gozculer = [oranGozcu, seritGozcu];
      for (const el of izlenen) izle(el, oranGozcu, seritGozcu);
    };
    kur();
    const tara = () => {
      for (const el of document.querySelectorAll("[data-fab-gizle]")) {
        if (!izlenen.has(el)) {
          izlenen.add(el);
          if (gozculer[0] && gozculer[1]) izle(el, gozculer[0], gozculer[1]);
        }
      }
      for (const el of izlenen) {
        if (!el.isConnected) {
          const form = el.querySelector("form");
          gozculer[0]?.unobserve(form ?? el);
          if (form) {
            gozculer[1]?.unobserve(form);
            serit.delete(form);
          }
          izlenen.delete(el);
          oran.delete(form ?? el);
        }
      }
      guncelle();
    };
    tara();
    const degisim = new MutationObserver(tara);
    degisim.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", kur);
    return () => {
      window.removeEventListener("resize", kur);
      degisim.disconnect();
      for (const g of gozculer) g.disconnect();
    };
  }, []);

  return (
    <a
      ref={fabRef}
      className={cx(s.fab, gizli && s.gizli)}
      href={waHref(t)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.wa.aria}
      data-arka-plan=""
      data-wa-fab=""
      data-gizli={gizli ? "true" : "false"}
    >
      <span className={s.etiket} aria-hidden="true">
        {t.wa.etiket}
      </span>
      <span className={s.disk}>
        <WhatsAppGlyph className={s.glif} />
      </span>
    </a>
  );
}
