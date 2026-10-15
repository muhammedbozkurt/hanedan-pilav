// İstanbul ilçe haritası üretici. Çalıştırma: node scripts/harita/uret.ts
// Kaynak: OpenStreetMap katkıda bulunanları (ODbL), Overpass API. Çıktı: app/data/harita/istanbul.json
// HARITA_HAM ortam değişkeni ham Overpass yanıtının önbellek yolunu verir (varsa okunur, yoksa yazılır).
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { geoArea, geoMercator, geoPath } from "d3-geo";
import mapshaper from "mapshaper";
import osmtogeojson from "osmtogeojson";
import { ILCELER } from "../../app/content/ilceler.ts";

const KOK = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CIKTI = join(KOK, "app", "data", "harita", "istanbul.json");
const ENDPOINT = "https://overpass-api.de/api/interpreter";
const GENISLIK = 1000;
const CEKIRDEK_DISI = new Set(["silivri", "catalca", "sile"]);
const SADELESTIR = process.env.HARITA_SADELESTIR ?? "6%";

const SORGU = `[out:json][timeout:180];
area["boundary"="administrative"]["admin_level"="4"]["name"="İstanbul"]->.il;
rel(area.il)["boundary"="administrative"]["admin_level"="6"];
out geom;`;

async function hamVeri(): Promise<unknown> {
  const onbellek = process.env.HARITA_HAM;
  if (onbellek && existsSync(onbellek)) return JSON.parse(readFileSync(onbellek, "utf8"));
  const yanit = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      accept: "application/json",
      "user-agent": "hanedan-pilav-harita/1.0 (ilce siniri uretimi)",
    },
    body: `data=${encodeURIComponent(SORGU)}`,
  });
  if (!yanit.ok) throw new Error(`Overpass ${yanit.status}`);
  const metin = await yanit.text();
  if (onbellek) writeFileSync(onbellek, metin);
  return JSON.parse(metin);
}

type Ozellik = { type: "Feature"; properties: Record<string, string> | null; geometry: { type: string; coordinates: unknown } | null };
type Koleksiyon = { type: "FeatureCollection"; features: Ozellik[] };

const ham = await hamVeri();
const gj = osmtogeojson(ham as never) as unknown as Koleksiyon;
const sinirlar = gj.features.filter(
  (f) => f.properties && f.geometry && (f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon") && f.properties.admin_level === "6",
);

// OSM'de "Kâğıthane" gibi düzeltme işaretli yazımlar var; karşılaştırmada â/î/û sade harfe indirilir.
const sadeAd = (a: string) => a.toLocaleLowerCase("tr").replace(/â/g, "a").replace(/î/g, "i").replace(/û/g, "u").replace(/\s*ilçesi$/, "");
const slugBul = (p: Record<string, string>) => {
  const adlar = [p["name:tr"], p.name, p.official_name].filter((a): a is string => Boolean(a)).map(sadeAd);
  return ILCELER.find((i) => adlar.includes(sadeAd(i.ad)) || (i.slug === "eyupsultan" && adlar.includes("eyüp")));
};

const secili: Ozellik[] = [];
for (const f of sinirlar) {
  const ilce = f.properties ? slugBul(f.properties) : undefined;
  if (ilce) secili.push({ type: "Feature", properties: { slug: ilce.slug }, geometry: f.geometry });
}
const eksik = ILCELER.filter((i) => !secili.some((f) => f.properties?.slug === i.slug)).map((i) => i.slug);
if (eksik.length > 0) throw new Error(`Eksik ilçe: ${eksik.join(", ")}`);
const tekil = new Map<string, Ozellik>();
for (const f of secili) tekil.set(f.properties?.slug ?? "", f);

const girdi = JSON.stringify({ type: "FeatureCollection", features: [...tekil.values()] });
const sonuc = await mapshaper.applyCommands(
  `-i in.json -filter-islands min-area=0.15km2 remove-empty -simplify ${SADELESTIR} keep-shapes -o out.json format=geojson`,
  { "in.json": girdi },
);
const sade = JSON.parse(String(sonuc["out.json"])) as Koleksiyon;

// d3 yarıküre kuralı: dış halka saat yönünde olmalı; ters sarılı poligon tüm küreyi kaplar. Ters olanlar çevrilir.
function duzelt(g: { type: string; coordinates: unknown }): void {
  const parcalar = (g.type === "Polygon" ? [g.coordinates] : g.coordinates) as number[][][][];
  for (const p of parcalar) {
    if (geoArea({ type: "Polygon", coordinates: p } as never) > 2 * Math.PI) for (const halka of p) halka.reverse();
  }
}
for (const f of sade.features) if (f.geometry) duzelt(f.geometry);

const tumu = { type: "FeatureCollection", features: sade.features } as never;
const donusum = geoMercator().fitWidth(GENISLIK, tumu);
const yol = geoPath(donusum).digits(1);

const yuvarla = (n: number) => Math.round(n * 10) / 10;
type Sinir = [[number, number], [number, number]];
const birlestir = (kutular: Sinir[]): Sinir => [
  [Math.min(...kutular.map((k) => k[0][0])), Math.min(...kutular.map((k) => k[0][1]))],
  [Math.max(...kutular.map((k) => k[1][0])), Math.max(...kutular.map((k) => k[1][1]))],
];
const kutuDegeri = (k: Sinir, pay: number) => {
  const x = Math.floor(k[0][0] - pay);
  const y = Math.floor(k[0][1] - pay);
  return { x, y, g: Math.ceil(k[1][0] + pay) - x, y2: Math.ceil(k[1][1] + pay) - y };
};

// Etiket/pin noktası: parçalar içinden en büyük alanlı poligonun ağırlık merkezi.
function agirlikMerkezi(f: Ozellik): [number, number] {
  const g = f.geometry as { type: string; coordinates: unknown };
  const parcalar = (g.type === "Polygon" ? [g.coordinates] : g.coordinates) as number[][][][];
  let enIyi: { alan: number; f: Ozellik } | null = null;
  for (const p of parcalar) {
    const parcaF: Ozellik = { type: "Feature", properties: null, geometry: { type: "Polygon", coordinates: p } };
    const alan = yol.area(parcaF as never);
    if (!enIyi || alan > enIyi.alan) enIyi = { alan, f: parcaF };
  }
  const c = yol.centroid((enIyi?.f ?? f) as never);
  return [yuvarla(c[0]), yuvarla(c[1])];
}

const ilceler = ILCELER.map((i) => {
  const f = sade.features.find((x) => x.properties?.slug === i.slug);
  if (!f) throw new Error(`Sadeleştirmede kayıp: ${i.slug}`);
  const m = agirlikMerkezi(f);
  return { slug: i.slug, d: yol(f as never) ?? "", merkez: m, kutu: yol.bounds(f as never) as Sinir };
});

const tamKutu = kutuDegeri(birlestir(ilceler.map((i) => i.kutu)), 8);
const cekirdekKutu = kutuDegeri(birlestir(ilceler.filter((i) => !CEKIRDEK_DISI.has(i.slug)).map((i) => i.kutu)), 8);

const cikti = {
  meta: {
    kaynak: "OpenStreetMap katkıda bulunanları",
    lisans: "ODbL 1.0",
    lisansUrl: "https://www.openstreetmap.org/copyright",
    tarih: new Date().toISOString().slice(0, 10),
    yontem: `Overpass admin_level=6, mapshaper sadeleştirme ${SADELESTIR}, d3-geo Mercator`,
  },
  tam: { x: tamKutu.x, y: tamKutu.y, g: tamKutu.g, y2: tamKutu.y2 },
  cekirdek: { x: cekirdekKutu.x, y: cekirdekKutu.y, g: cekirdekKutu.g, y2: cekirdekKutu.y2 },
  ilceler: ilceler.map(({ slug, d, merkez }) => ({ slug, d, merkez, etiket: merkez })),
};
// Kısa anahtar: y2 yükseklik anlamındadır, çıktıda "y" ile karışmasın diye "h" yazılır.
const metin = JSON.stringify(cikti, null, 1).replace(/"y2"/g, '"h"');
writeFileSync(CIKTI, `${metin}\n`);
console.log(`${ilceler.length} ilçe, ${Buffer.byteLength(metin)} bayt, ${CIKTI}`);
