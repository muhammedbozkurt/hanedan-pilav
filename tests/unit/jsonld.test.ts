import assert from "node:assert/strict";
import { test } from "node:test";
import { BAYILER } from "../../app/content/bayiler.ts";
import { bayiJsonLd, jsonLdMetni, kokJsonLd, organizasyonJsonLd } from "../../app/lib/jsonld.ts";
import { ACIKLAMA_UST_SINIR, sinirla } from "../../app/lib/metin-sinir.ts";

test("Organization: sameAs boşsa hiç yazılmaz, kuruluş yılı ve adres var", () => {
  const o = organizasyonJsonLd();
  assert.equal(o["@type"], "Organization");
  assert.equal(o.foundingDate, "1998");
  assert.ok(!("sameAs" in o));
  assert.equal((o.address as { addressCountry: string }).addressCountry, "TR");
});

test("kök grafiği Organization ve WebSite içerir", () => {
  const g = kokJsonLd("en")["@graph"] as { "@type": string; inLanguage?: string }[];
  assert.deepEqual(g.map((x) => x["@type"]), ["Organization", "WebSite"]);
  assert.equal(g[1]?.inLanguage, "en");
});

test("bayi: FoodEstablishment, her gün 09:00-17:00, konum yoksa geo yok", () => {
  const b = BAYILER[0];
  assert.ok(b);
  const j = bayiJsonLd(b, "tr");
  assert.equal(j["@type"], "FoodEstablishment");
  const saat = j.openingHoursSpecification as { dayOfWeek: string[]; opens: string; closes: string };
  assert.equal(saat.dayOfWeek.length, 7);
  assert.equal(saat.opens, "09:00");
  assert.equal(saat.closes, "17:00");
  assert.ok(j.parentOrganization);
  assert.equal("geo" in j, Boolean(b.konum));
  const en = bayiJsonLd(b, "en");
  assert.match(String(en.url), /\/en\/locations\//);
});

test("jsonLdMetni '<' karakterini kaçışlar", () => {
  assert.ok(!jsonLdMetni({ a: "</script>" }).includes("<"));
});

test("sinirla sınırı aşan metni kelimede keser, kısa metne dokunmaz", () => {
  assert.equal(sinirla("kısa", 160), "kısa");
  const uzun = "kelime ".repeat(40);
  const s = sinirla(uzun, ACIKLAMA_UST_SINIR);
  assert.ok(s.length <= ACIKLAMA_UST_SINIR);
  assert.ok(s.endsWith("…"));
});
