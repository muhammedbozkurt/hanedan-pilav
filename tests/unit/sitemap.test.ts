import assert from "node:assert/strict";
import { test } from "node:test";
import { tumYollar } from "../../app/lib/rotalar.ts";
import { robotsUret, sitemapKayitlari, sitemapUret } from "../../scripts/yayin-lib.ts";

const TABAN = "https://www.hanedanpilav.com";

test("sitemap 404 hariç tüm prerender yollarını içerir", () => {
  const kayitlar = sitemapKayitlari(TABAN);
  const beklenen = tumYollar().filter((y) => !y.endsWith("/404"));
  assert.deepEqual(kayitlar.map((k) => k.loc).sort(), beklenen.map((y) => `${TABAN}${y}`).sort());
  assert.ok(!kayitlar.some((k) => k.loc.endsWith("/404")));
});

test("her kayıt tr, en ve x-default alternatiflerini taşır; x-default TR adresidir", () => {
  for (const k of sitemapKayitlari(TABAN)) {
    assert.deepEqual(k.alternatifler.map((a) => a.hreflang), ["tr", "en", "x-default"]);
    assert.equal(k.alternatifler[2]?.href, k.alternatifler[0]?.href);
    assert.ok(k.alternatifler.some((a) => a.href === k.loc));
  }
});

test("sitemapUret geçerli xml, lastmod ve xhtml:link üretir, kaçışlar", () => {
  const xml = sitemapUret(
    [{ loc: "https://x.test/a?b=1&c=2", alternatifler: [{ hreflang: "tr", href: "https://x.test/a?b=1&c=2" }] }],
    "2026-01-02",
  );
  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
  assert.match(xml, /<lastmod>2026-01-02<\/lastmod>/);
  assert.match(xml, /xmlns:xhtml="http:\/\/www\.w3\.org\/1999\/xhtml"/);
  assert.match(xml, /<loc>https:\/\/x\.test\/a\?b=1&amp;c=2<\/loc>/);
  assert.match(xml, /<xhtml:link rel="alternate" hreflang="tr" /);
});

test("robots: staging her şeyi kapatır, production izin verir ve sitemap bildirir", () => {
  assert.equal(robotsUret("staging"), "User-agent: *\nDisallow: /\n");
  const canli = robotsUret("production", TABAN);
  assert.match(canli, /^Allow: \//m);
  assert.doesNotMatch(canli, /^Disallow: \/\s*$/m);
  assert.match(canli, new RegExp(`^Sitemap: ${TABAN}/sitemap\\.xml$`, "m"));
});
