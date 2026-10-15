// Metin kapısı: uzun/orta tire ve yasaklı kelime taraması. Bulursa satır:sütun ile listeler ve hata koduyla çıkar.
// Yasaklı dizgeler bu dosyada kaçış dizisiyle yazılır ki betik kendini işaretlemesin.
import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const KOK = process.cwd();

// Tire taraması: repo içindeki tüm metin kaynakları. Kelime taraması: kullanıcıya görünen içerik (app/, public/).
const TIRE_HEDEFLERI = [
  "app",
  "public",
  "scripts",
  "tests",
  ".github",
  "README.md",
  "CLAUDE.md",
  "package.json",
  "react-router.config.ts",
  "vite.config.ts",
  "playwright.config.ts",
  "tsconfig.json",
];
const KELIME_HEDEFLERI = ["app", "public"];

const METIN_UZANTILARI = new Set([
  ".ts", ".tsx", ".js", ".mjs", ".cjs", ".css", ".json", ".md", ".html", ".txt", ".xml", ".svg", ".yml", ".yaml", ".php", ".webmanifest",
]);
const ATLA = new Set(["node_modules", "build", ".react-router", "playwright-report", "test-results"]);

const KURALLAR = {
  tire: [
    { ad: "uzun tire (U+2014)", re: /\u2014/g },
    { ad: "orta tire (U+2013)", re: /\u2013/g },
  ],
  kelime: [{ ad: "yasaklı kelime (k\u00e2rl\u0131 / profitable)", re: /k\u00e2rl[\u0131i]|karl\u0131|profitab/giu }],
};

async function var_(yol: string): Promise<boolean> {
  try {
    await stat(yol);
    return true;
  } catch {
    return false;
  }
}

async function* dosyalar(yol: string): AsyncGenerator<string> {
  const bilgi = await stat(yol);
  if (bilgi.isFile()) {
    if (METIN_UZANTILARI.has(extname(yol).toLowerCase())) yield yol;
    return;
  }
  for (const girdi of await readdir(yol, { withFileTypes: true })) {
    if (ATLA.has(girdi.name)) continue;
    yield* dosyalar(join(yol, girdi.name));
  }
}

type Bulgu = { dosya: string; satir: number; sutun: number; kural: string; parca: string };

async function tara(hedefler: string[], kurallar: { ad: string; re: RegExp }[]): Promise<Bulgu[]> {
  const bulgular: Bulgu[] = [];
  for (const hedef of hedefler) {
    const tam = join(KOK, hedef);
    if (!(await var_(tam))) continue;
    for await (const dosya of dosyalar(tam)) {
      const satirlar = (await readFile(dosya, "utf8")).split("\n");
      satirlar.forEach((satir, i) => {
        for (const kural of kurallar) {
          for (const e of satir.matchAll(kural.re)) {
            const sutun = (e.index ?? 0) + 1;
            bulgular.push({
              dosya: relative(KOK, dosya),
              satir: i + 1,
              sutun,
              kural: kural.ad,
              parca: satir.slice(Math.max(0, sutun - 30), sutun + 30).trim(),
            });
          }
        }
      });
    }
  }
  return bulgular;
}

const bulgular = [...(await tara(TIRE_HEDEFLERI, KURALLAR.tire)), ...(await tara(KELIME_HEDEFLERI, KURALLAR.kelime))];

if (bulgular.length > 0) {
  console.error(`check:metin KALDI: ${bulgular.length} bulgu`);
  for (const b of bulgular) console.error(`  ${b.dosya}:${b.satir}:${b.sutun}  ${b.kural}  "${b.parca}"`);
  process.exit(1);
}
console.log("check:metin GEÇTİ: tire ve yasaklı kelime bulunmadı.");
