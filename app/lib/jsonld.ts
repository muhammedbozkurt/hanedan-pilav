// Yapılandırılmış veri üreticileri. Node birim testleri de içe aktardığı için yalnız göreli `.ts` içe aktarma kullanılır.
import type { Bayi } from "../content/bayiler.ts";
import { SITE } from "../content/site.ts";
import { type Dil, yol } from "./rotalar.ts";

const KOK = SITE.alanAdi;
const ORGANIZASYON_ID = `${KOK}/#organization`;
const WEBSITE_ID = `${KOK}/#website`;
const LOGO_YOLU = "/img/logo-saydam.png";

const HAFTA_GUNLERI = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

type JsonLd = Record<string, unknown>;

export function organizasyonJsonLd(): JsonLd {
  const a = SITE.adres;
  const eposta = SITE.eposta;
  return {
    "@type": "Organization",
    "@id": ORGANIZASYON_ID,
    name: SITE.marka,
    url: `${KOK}/`,
    logo: `${KOK}${LOGO_YOLU}`,
    foundingDate: String(SITE.kurulusYili),
    telephone: SITE.telefon.e164,
    ...(eposta ? { email: eposta } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: `${a.mahalle}, ${a.cadde} ${a.kapiNo}`,
      postalCode: a.postaKodu,
      addressLocality: a.ilce,
      addressRegion: a.il,
      addressCountry: "TR",
    },
    ...(SITE.sosyal.length > 0 ? { sameAs: SITE.sosyal.map((s) => s.url) } : {}),
  };
}

export function webSiteJsonLd(dil: Dil): JsonLd {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE.marka,
    url: `${KOK}/`,
    inLanguage: dil,
    publisher: { "@id": ORGANIZASYON_ID },
  };
}

export function kokJsonLd(dil: Dil): JsonLd {
  return { "@context": "https://schema.org", "@graph": [organizasyonJsonLd(), webSiteJsonLd(dil)] };
}

// Site çalışma saatleri merkezin saatidir; şubeye aktarılmaz. Şubenin kendi saati veride olmadığından şube için saat yoktur.
export function bayiCalismaSaatleri(bayi: Bayi): typeof SITE.calismaSaatleri | null {
  return bayi.tur === "merkez" ? SITE.calismaSaatleri : null;
}

// Bayi detay sayfası için. Konum bilinmiyorsa geo, saat bilinmiyorsa openingHoursSpecification yazılmaz.
// Şubeler franchise işletmesidir, kuruluşun alt birimi değildir: markaya `brand` ile bağlanır, parentOrganization kullanılmaz.
export function bayiJsonLd(bayi: Bayi, dil: Dil): JsonLd {
  const saat = bayiCalismaSaatleri(bayi);
  const url = `${KOK}${yol("bayiDetay", dil, { slug: bayi.slug })}`;
  return {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    "@id": `${url}#bayi`,
    name: `${SITE.marka} ${bayi.ad[dil]}`,
    url,
    image: `${KOK}${LOGO_YOLU}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: bayi.adres.satir,
      postalCode: bayi.adres.postaKodu,
      addressLocality: bayi.adres.ilce,
      addressRegion: bayi.adres.il,
      addressCountry: "TR",
    },
    ...(bayi.telefon ? { telephone: bayi.telefon.e164 } : {}),
    ...(bayi.konum
      ? { geo: { "@type": "GeoCoordinates", latitude: bayi.konum.lat, longitude: bayi.konum.lng } }
      : {}),
    ...(saat
      ? {
          openingHoursSpecification: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [...HAFTA_GUNLERI],
            opens: saat.acilis,
            closes: saat.kapanis,
          },
        }
      : {}),
    brand: { "@id": ORGANIZASYON_ID },
  };
}

// `</script>` ve HTML açılışını kırmasın diye "<" kaçışlanır.
export function jsonLdMetni(veri: JsonLd): string {
  return JSON.stringify(veri).replace(/</g, "\\u003c");
}
