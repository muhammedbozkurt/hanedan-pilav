import { expect, test } from "@playwright/test";
import { satirIciBetikHashleri } from "../../scripts/yayin-lib.ts";
import { SITE, TUM_YOLLAR, dilBul } from "./yardimci.ts";

const OG_LOCALE = { tr: "tr_TR", en: "en_US" } as const;
const KARSI_DIL = { tr: "en", en: "tr" } as const;
const NOINDEX_YOLLARI = ["/404", "/en/404"];
const STAGING = process.env.SITE_ORTAM === "staging";

async function meta(page: import("@playwright/test").Page, secici: string): Promise<string | null> {
  return page.locator(secici).first().getAttribute("content");
}

test.describe("seo meta", () => {
  for (const yol of TUM_YOLLAR) {
    test(`${yol}: title, description, canonical, hreflang, og, twitter`, async ({ page }) => {
      await page.goto(yol);
      const dil = dilBul(yol);
      const baslik = await page.title();
      expect(baslik.length).toBeGreaterThan(0);
      expect(baslik.length, "title <= 60").toBeLessThanOrEqual(60);

      const aciklama = (await meta(page, 'meta[name="description"]')) ?? "";
      expect(aciklama.length).toBeGreaterThan(0);
      expect(aciklama.length, "description <= 160").toBeLessThanOrEqual(160);
      expect(aciklama.endsWith("…"), "description sözlükte kısaltılmış olmalı, seo.ts kesmesine düşmemeli").toBe(false);
      expect(baslik.endsWith("…"), "title seo.ts kesmesine düşmemeli").toBe(false);

      const url = `${SITE.alanAdi}${yol}`;
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", url);
      expect(url.endsWith("/") && yol !== "/").toBe(false);

      const trUrl = await page.locator('link[rel="alternate"][hreflang="tr"]').getAttribute("href");
      const enUrl = await page.locator('link[rel="alternate"][hreflang="en"]').getAttribute("href");
      const varsayilan = await page.locator('link[rel="alternate"][hreflang="x-default"]').getAttribute("href");
      expect(dil === "tr" ? trUrl : enUrl).toBe(url);
      expect(trUrl).toMatch(/^https:\/\/www\.hanedanpilav\.com\//);
      expect(enUrl).toMatch(/^https:\/\/www\.hanedanpilav\.com\/en(\/|$)/);
      expect(varsayilan).toBe(trUrl);

      expect(await meta(page, 'meta[property="og:title"]')).toBe(baslik);
      expect(await meta(page, 'meta[property="og:description"]')).toBe(aciklama);
      expect(await meta(page, 'meta[property="og:url"]')).toBe(url);
      expect(await meta(page, 'meta[property="og:image"]')).toMatch(/^https:\/\/www\.hanedanpilav\.com\/img\/.+\.png$/);
      expect(await meta(page, 'meta[property="og:locale"]')).toBe(OG_LOCALE[dil]);
      expect(await meta(page, 'meta[property="og:locale:alternate"]')).toBe(OG_LOCALE[KARSI_DIL[dil]]);
      expect(await meta(page, 'meta[name="twitter:card"]')).toBe("summary_large_image");
      expect(await meta(page, 'meta[name="twitter:title"]')).toBe(baslik);
      expect(await meta(page, 'meta[name="twitter:image"]')).toBeTruthy();
    });

    test(`${yol}: JSON-LD ayrıştırılır ve Organization içerir`, async ({ page }) => {
      await page.goto(yol);
      const bloklar = await page.locator('script[type="application/ld+json"]').allTextContents();
      expect(bloklar.length).toBeGreaterThan(0);
      const tipler = bloklar.flatMap((b) => {
        const veri = JSON.parse(b) as { "@type"?: string; "@graph"?: { "@type": string }[] };
        return veri["@graph"] ? veri["@graph"].map((g) => g["@type"]) : [veri["@type"]];
      });
      expect(tipler).toContain("Organization");
      expect(tipler).toContain("WebSite");
    });
  }

  for (const yol of NOINDEX_YOLLARI) {
    test(`${yol}: noindex`, async ({ page }) => {
      await page.goto(yol);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    });
  }

  test("indekslenen sayfalarda robots noindex yok", async ({ page }) => {
    for (const yol of TUM_YOLLAR.filter((y) => !NOINDEX_YOLLARI.includes(y))) {
      await page.goto(yol);
      await expect(page.locator('meta[name="robots"][content*="noindex"]'), yol).toHaveCount(0);
    }
  });
});

test.describe("sitemap, robots, .htaccess", () => {
  test("sitemap tüm sayfaları içerir, 404 hariç, alternatiflerle", async ({ request }) => {
    const yanit = await request.get("/sitemap.xml");
    expect(yanit.status()).toBe(200);
    const xml = await yanit.text();
    const locler = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const beklenen = TUM_YOLLAR.filter((y) => !NOINDEX_YOLLARI.includes(y)).map((y) => `${SITE.alanAdi}${y}`);
    expect([...locler].sort()).toEqual([...beklenen].sort());
    expect(locler.some((l) => l?.endsWith("/404"))).toBe(false);
    expect(xml).toMatch(/hreflang="x-default"/);
    expect(xml).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
  });

  test("robots.txt ortama uygun", async ({ request }) => {
    const metin = await (await request.get("/robots.txt")).text();
    if (STAGING) {
      expect(metin).toMatch(/^Disallow: \/$/m);
    } else {
      expect(metin).not.toMatch(/^Disallow: \/\s*$/m);
      expect(metin).toContain(`Sitemap: ${SITE.alanAdi}/sitemap.xml`);
    }
  });

  test(".htaccess CSP: her sayfanın satır içi betik hash'i izinli, unsafe-inline betikte yok", async ({ request }) => {
    const htaccess = await (await request.get("/.htaccess")).text();
    const csp = /Content-Security-Policy "([^"]+)"/.exec(htaccess)?.[1] ?? "";
    expect(csp).toContain("script-src 'self' 'sha256-");
    const betikYonergesi = csp.split("; ").find((p) => p.startsWith("script-src ")) ?? "";
    expect(betikYonergesi).not.toContain("unsafe-inline");
    expect(htaccess.includes("X-Robots-Tag")).toBe(STAGING ? true : false);
    for (const yol of TUM_YOLLAR) {
      const html = await (await request.get(yol)).text();
      for (const h of satirIciBetikHashleri(html)) {
        expect(betikYonergesi, `${yol} için hash eksik`).toContain(h);
      }
    }
  });
});
