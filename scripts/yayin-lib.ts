// Yayın yardımcıları: sitemap, robots, CSP hash'leri ve .htaccess işleme. Saf işlevler; betikler ve birim testleri kullanır.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE } from "../app/content/site.ts";
import { DILLER, SAYFA_ANAHTARLARI, VARSAYILAN_DIL, sayfaYollari } from "../app/lib/rotalar.ts";

export const ORTAMLAR = ["staging", "production"] as const;
export type Ortam = (typeof ORTAMLAR)[number];

export function ortamOku(ham: string | undefined): Ortam {
  const deger = (ham ?? "production").trim() || "production";
  if (!(ORTAMLAR as readonly string[]).includes(deger)) {
    throw new Error(`SITE_ORTAM "${deger}" geçersiz; "staging" veya "production" olmalı.`);
  }
  return deger as Ortam;
}

// ---- sitemap ----

export type SitemapKaydi = {
  readonly loc: string;
  readonly alternatifler: readonly { readonly hreflang: string; readonly href: string }[];
};

const SITEMAP_DISI = new Set<string>(["bulunamadi"]);

export function sitemapKayitlari(taban: string = SITE.alanAdi): SitemapKaydi[] {
  const kayitlar: SitemapKaydi[] = [];
  for (const anahtar of SAYFA_ANAHTARLARI) {
    if (SITEMAP_DISI.has(anahtar)) continue;
    const yollar = Object.fromEntries(DILLER.map((d) => [d, sayfaYollari(anahtar, d)])) as Record<
      (typeof DILLER)[number],
      string[]
    >;
    for (const dil of DILLER) {
      yollar[dil].forEach((yol, i) => {
        const alternatifler = DILLER.map((d) => ({ hreflang: d as string, href: `${taban}${yollar[d][i]}` }));
        alternatifler.push({ hreflang: "x-default", href: `${taban}${yollar[VARSAYILAN_DIL][i]}` });
        kayitlar.push({ loc: `${taban}${yol}`, alternatifler });
      });
    }
  }
  return kayitlar;
}

function xmlKacis(metin: string): string {
  return metin.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function sitemapUret(kayitlar: readonly SitemapKaydi[], lastmod: string): string {
  const url = kayitlar
    .map((k) => {
      const alt = k.alternatifler
        .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${xmlKacis(a.href)}"/>`)
        .join("\n");
      return `  <url>\n    <loc>${xmlKacis(k.loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n${alt}\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${url}\n</urlset>\n`;
}

// Öncelik: SITEMAP_LASTMOD, son commit tarihi, bugün (UTC).
export function sonDegisiklikTarihi(env: NodeJS.ProcessEnv = process.env): string {
  const tarih = /^\d{4}-\d{2}-\d{2}$/;
  if (env.SITEMAP_LASTMOD && tarih.test(env.SITEMAP_LASTMOD)) return env.SITEMAP_LASTMOD;
  try {
    const cikti = execFileSync("git", ["log", "-1", "--format=%cs"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    if (tarih.test(cikti)) return cikti;
  } catch {
    // git yoksa bugüne düşülür
  }
  return new Date().toISOString().slice(0, 10);
}

// ---- robots ----

export function robotsUret(ortam: Ortam, taban: string = SITE.alanAdi): string {
  if (ortam === "staging") return "User-agent: *\nDisallow: /\n";
  return `User-agent: *\nAllow: /\n\nSitemap: ${taban}/sitemap.xml\n`;
}

// ---- CSP ----

const CALISTIRILABILIR_TURLER = new Set(["", "module", "text/javascript", "application/javascript"]);

// Yalnız çalıştırılan satır içi betikler hash'lenir; JSON-LD gibi veri blokları CSP kapsamı dışındadır.
export function satirIciBetikHashleri(html: string): string[] {
  const hashler: string[] = [];
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const nitelikler = m[1] ?? "";
    const icerik = m[2] ?? "";
    if (/\bsrc\s*=/i.test(nitelikler) || icerik.length === 0) continue;
    const tur = /\btype\s*=\s*["']?([^"'\s>]+)/i.exec(nitelikler)?.[1]?.toLowerCase() ?? "";
    if (!CALISTIRILABILIR_TURLER.has(tur)) continue;
    hashler.push(`'sha256-${createHash("sha256").update(icerik, "utf8").digest("base64")}'`);
  }
  return hashler;
}

export async function htmlDosyalari(klasor: string): Promise<string[]> {
  const sonuc: string[] = [];
  for (const oge of await readdir(klasor, { withFileTypes: true })) {
    const yol = join(klasor, oge.name);
    if (oge.isDirectory()) sonuc.push(...(await htmlDosyalari(yol)));
    else if (oge.name.endsWith(".html")) sonuc.push(yol);
  }
  return sonuc;
}

export async function tumBetikHashleri(klasor: string): Promise<string[]> {
  const set = new Set<string>();
  for (const dosya of await htmlDosyalari(klasor)) {
    for (const h of satirIciBetikHashleri(await readFile(dosya, "utf8"))) set.add(h);
  }
  return [...set].sort();
}

// style-src: hazır HTML'de style="..." nitelikleri var (Gorsel en-boy oranı, harita, hata görünümü); yalnız nitelik düzeyinde
// 'unsafe-inline' açılır, <style> blokları ve harici stiller 'self' ile sınırlı kalır.
export function cspUret(betikHashleri: readonly string[]): string {
  return [
    "default-src 'self'",
    `script-src 'self' ${betikHashleri.join(" ")}`.trim(),
    "style-src 'self'",
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

// ---- .htaccess ----

const BLOK = (ad: string) => new RegExp(`(# BEGIN ${ad}\\n)[\\s\\S]*?(# END ${ad})`);

function blokDoldur(sablon: string, ad: string, icerik: string): string {
  const re = BLOK(ad);
  if (!re.test(sablon)) throw new Error(`.htaccess şablonunda "${ad}" blok işaretleri yok.`);
  return sablon.replace(re, (_, bas: string, son: string) => `${bas}${icerik}\n  ${son}`);
}

export function htaccessIsle(sablon: string, ortam: Ortam, csp: string): string {
  const ortamSatirlari =
    ortam === "staging"
      ? '  Header always set X-Robots-Tag "noindex, nofollow"'
      : "  # production: ek başlık yok";
  const cspSatiri = `  Header always set Content-Security-Policy "${csp}"`;
  return blokDoldur(blokDoldur(sablon, "ORTAM", ortamSatirlari), "CSP", cspSatiri);
}
