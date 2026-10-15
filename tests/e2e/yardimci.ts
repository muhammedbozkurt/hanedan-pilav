import type { Page } from "@playwright/test";
import { SITE } from "../../app/content/site.ts";
import { type Dil, SAYFA_ANAHTARLARI, dilBul, sayfaYollari, tumYollar } from "../../app/lib/rotalar.ts";

export { SITE, dilBul };
export const TUM_YOLLAR = tumYollar();
export const WA_PARCASI = `wa.me/${SITE.whatsapp.numara}`;

// Her TR yolunun EN karşılığı ve tersi (parametreli rotalar aynı veri sırasıyla açılır).
export const KARSILIK = new Map<string, string>();
for (const anahtar of SAYFA_ANAHTARLARI) {
  const tr = sayfaYollari(anahtar, "tr");
  const en = sayfaYollari(anahtar, "en");
  tr.forEach((y, i) => {
    const e = en[i];
    if (!e) throw new Error(`${anahtar}: ${y} için EN karşılığı yok`);
    KARSILIK.set(y, e);
    KARSILIK.set(e, y);
  });
}

export function digerDil(dil: Dil): Dil {
  return dil === "tr" ? "en" : "tr";
}

export async function yatayTasma(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}
