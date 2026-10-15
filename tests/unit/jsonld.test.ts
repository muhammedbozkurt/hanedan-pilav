import assert from "node:assert/strict";
import { test } from "node:test";
import { BAYILER, type Bayi } from "../../app/content/bayiler.ts";
import { bayiCalismaSaatleri, bayiJsonLd, jsonLdMetni, kokJsonLd, organizasyonJsonLd } from "../../app/lib/jsonld.ts";
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

test("merkez: markalı ad, her gün 09:00-17:00, brand bağı, parentOrganization yok, konum yoksa geo yok", () => {
  const b = BAYILER.find((x) => x.tur === "merkez");
  assert.ok(b);
  const j = bayiJsonLd(b, "tr");
  assert.equal(j["@type"], "FoodEstablishment");
  assert.equal(j.name, "Hanedan Pilav Sultangazi Merkez");
  const saat = j.openingHoursSpecification as { dayOfWeek: string[]; opens: string; closes: string };
  assert.equal(saat.dayOfWeek.length, 7);
  assert.equal(saat.opens, "09:00");
  assert.equal(saat.closes, "17:00");
  assert.deepEqual(j.brand, { "@id": organizasyonJsonLd()["@id"] });
  assert.ok(!("parentOrganization" in j));
  assert.equal("geo" in j, Boolean(b.konum));
  const en = bayiJsonLd(b, "en");
  assert.equal(en.name, "Hanedan Pilav Sultangazi Headquarters");
  assert.match(String(en.url), /\/en\/locations\//);
  assert.equal(en["@id"], `${String(en.url)}#bayi`);
});

test("şube: kendi saati olmadığından açılış saati yazılmaz, site saati aktarılmaz; konum varsa geo yazılır", () => {
  const sube: Bayi = {
    slug: "ornek-sube",
    tur: "sube",
    ad: { tr: "Örnek Şube", en: "Sample Location" },
    adres: { satir: "Örnek Mah., Örnek Cd. No:1", postaKodu: "34000", ilce: "Fatih", il: "İstanbul" },
    konum: { lat: 41.01, lng: 28.95 },
  };
  assert.equal(bayiCalismaSaatleri(sube), null);
  const j = bayiJsonLd(sube, "tr");
  assert.equal(j.name, "Hanedan Pilav Örnek Şube");
  assert.ok(!("openingHoursSpecification" in j));
  assert.ok(!("telephone" in j));
  assert.ok(!("parentOrganization" in j));
  assert.deepEqual(j.brand, { "@id": organizasyonJsonLd()["@id"] });
  assert.deepEqual(j.geo, { "@type": "GeoCoordinates", latitude: 41.01, longitude: 28.95 });
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
