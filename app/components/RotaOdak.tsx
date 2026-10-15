import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

// İstemci tarafı sayfa geçişinde odak yeni içeriğin başına taşınır; ekran okuyucu eski sayfada kalmaz. Çapalı geçişte hedefe kaydırma ScrollRestoration'dadır.
export function RotaOdak() {
  const { pathname, hash } = useLocation();
  const ilk = useRef(true);
  useEffect(() => {
    if (ilk.current) {
      ilk.current = false;
      return;
    }
    if (hash) {
      const hedef = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (hedef) {
        if (!hedef.hasAttribute("tabindex")) hedef.setAttribute("tabindex", "-1");
        hedef.focus({ preventScroll: true });
        return;
      }
    }
    document.getElementById("icerik")?.focus({ preventScroll: true });
  }, [pathname, hash]);
  return null;
}
