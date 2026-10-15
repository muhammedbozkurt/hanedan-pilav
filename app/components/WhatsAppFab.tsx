import { useEffect, useState } from "react";
import { useT } from "~/i18n/index.ts";
import { cx } from "~/lib/cx.ts";
import { waHref } from "~/lib/iletisim.ts";
import { WhatsAppGlyph } from "./WhatsApp.tsx";
import s from "./WhatsAppFab.module.css";

const ESIKLER = Array.from({ length: 21 }, (_, i) => i / 20);

// `data-fab-gizle` taşıyan bir bölüm görünür alanın yeterli kısmını kapladığında FAB çekilir (ör. kendi WhatsApp/form eylemi olan bölümler).
function yeterinceGorunur(g: IntersectionObserverEntry): boolean {
  if (!g.isIntersecting) return false;
  const olcu = Math.min(g.boundingClientRect.height, window.innerHeight);
  return olcu > 0 && g.intersectionRect.height >= olcu * 0.3;
}

export function WhatsAppFab() {
  const t = useT();
  const [gizli, setGizli] = useState(false);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const gorunen = new Set<Element>();
    const izlenen = new Set<Element>();
    const gozcu = new IntersectionObserver(
      (girdiler) => {
        for (const g of girdiler) {
          if (yeterinceGorunur(g)) gorunen.add(g.target);
          else gorunen.delete(g.target);
        }
        setGizli(gorunen.size > 0);
      },
      { threshold: ESIKLER },
    );
    const tara = () => {
      for (const el of document.querySelectorAll("[data-fab-gizle]")) {
        if (!izlenen.has(el)) {
          izlenen.add(el);
          gozcu.observe(el);
        }
      }
      for (const el of izlenen) {
        if (!el.isConnected) {
          gozcu.unobserve(el);
          izlenen.delete(el);
          gorunen.delete(el);
        }
      }
      setGizli(gorunen.size > 0);
    };
    tara();
    const degisim = new MutationObserver(tara);
    degisim.observe(document.body, { childList: true, subtree: true });
    return () => {
      degisim.disconnect();
      gozcu.disconnect();
    };
  }, []);

  return (
    <a
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
