// Çekim listesi: build/client HTML'lerindeki fotoğraf yer tutucularının data-cekim niteliklerini okur ve
// müşteriden fotoğraf istemek için sayfa bazında tekrarsız bir Markdown listesi yazdırır.
// Kullanım: npm run build && npm run cekim-listesi > cekim-listesi.md
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const KOK = join(process.cwd(), "build", "client");

type Kare = { oran: string; konu: string; not: string };

async function* htmlDosyalari(dizin: string): AsyncGenerator<string> {
  for (const girdi of await readdir(dizin, { withFileTypes: true })) {
    const yol = join(dizin, girdi.name);
    if (girdi.isDirectory()) yield* htmlDosyalari(yol);
    else if (girdi.name === "index.html") yield yol;
  }
}

function sayfaYolu(dosya: string): string {
  const goreli = relative(KOK, dosya).split(sep).join("/");
  return `/${goreli.replace(/(^|\/)index\.html$/, "")}`;
}

const VARLIKLAR: Record<string, string> = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">" };

function coz(metin: string): string {
  return metin.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (tam, ad: string) => {
    if (ad.startsWith("#x") || ad.startsWith("#X")) return String.fromCodePoint(Number.parseInt(ad.slice(2), 16));
    if (ad.startsWith("#")) return String.fromCodePoint(Number(ad.slice(1)));
    return VARLIKLAR[ad.toLowerCase()] ?? tam;
  });
}

function kareCoz(deger: string): Kare {
  const [oran = "", konu = "", not = ""] = coz(deger).split(" | ");
  return { oran, konu: konu || "(konu yok)", not };
}

const anahtar = (k: Kare) => `${k.oran}|${k.konu}|${k.not}`;
const satir = (k: Kare) => `${k.oran} · ${k.konu}${k.not ? `: ${k.not}` : ""}`;

try {
  await stat(KOK);
} catch {
  console.error("build/client bulunamadı. Önce `npm run build` çalıştırın.");
  process.exit(1);
}

// Sayfa yolu -> o sayfadaki tekrarsız kareler (sayfadaki sırayla).
const sayfalar = new Map<string, Kare[]>();
for await (const dosya of htmlDosyalari(KOK)) {
  const html = await readFile(dosya, "utf8");
  const gorulen = new Set<string>();
  const kareler: Kare[] = [];
  for (const e of html.matchAll(/\sdata-cekim="([^"]*)"/g)) {
    const kare = kareCoz(e[1] ?? "");
    if (gorulen.has(anahtar(kare))) continue;
    gorulen.add(anahtar(kare));
    kareler.push(kare);
  }
  if (kareler.length > 0) sayfalar.set(sayfaYolu(dosya), kareler);
}

if (sayfalar.size === 0) {
  console.log("# Fotoğraf çekim listesi\n\nYer tutucu yok: sitedeki tüm görsel alanları fotoğraflı.");
  process.exit(0);
}

// Aynı kare kümesini taşıyan sayfalar (ör. TR sayfası ve EN karşılığı) tek başlıkta toplanır. TR sayfaları önce gelir.
const sirali = [...sayfalar.keys()].sort((a, b) => Number(a.startsWith("/en")) - Number(b.startsWith("/en")) || a.localeCompare(b, "tr"));
const gruplar = new Map<string, { yollar: string[]; kareler: Kare[] }>();
for (const yol of sirali) {
  const kareler = sayfalar.get(yol) ?? [];
  const imza = kareler.map(anahtar).sort().join("\n");
  const grup = gruplar.get(imza);
  if (grup) grup.yollar.push(yol);
  else gruplar.set(imza, { yollar: [yol], kareler });
}

// Toplam listede aynı konu tek kare sayılır; farklı oranlar aynı fotoğrafın kadrajlarıdır.
const toplam = new Map<string, { kare: Kare; oranlar: Set<string>; yollar: Set<string> }>();
let kadraj = 0;
for (const yol of sirali) {
  for (const kare of sayfalar.get(yol) ?? []) {
    const konuAnahtari = `${kare.konu}|${kare.not}`;
    const kayit = toplam.get(konuAnahtari) ?? { kare, oranlar: new Set<string>(), yollar: new Set<string>() };
    if (!kayit.oranlar.has(kare.oran)) kadraj += 1;
    kayit.oranlar.add(kare.oran);
    kayit.yollar.add(yol);
    toplam.set(konuAnahtari, kayit);
  }
}

const cikti: string[] = [
  "# Fotoğraf çekim listesi",
  "",
  `${toplam.size} tekrarsız kare (${kadraj} kadraj), ${sayfalar.size} sayfada. Kaynak: build/client içindeki data-cekim nitelikleri; aynı kareleri taşıyan sayfalar tek başlıkta.`,
  "",
  "## Sayfa bazında",
];
for (const { yollar, kareler } of gruplar.values()) {
  cikti.push("", `### ${yollar.join(" · ")}`);
  for (const kare of kareler) cikti.push(`- [ ] ${satir(kare)}`);
}
cikti.push("", "## Tekrarsız toplam", "", "| # | Konu | Çekim notu | Oranlar | Sayfalar |", "|---|---|---|---|---|");
let no = 0;
for (const { kare, oranlar, yollar } of toplam.values()) {
  no += 1;
  cikti.push(`| ${no} | ${kare.konu} | ${kare.not} | ${[...oranlar].join(", ")} | ${[...yollar].join(", ")} |`);
}
console.log(cikti.join("\n"));
