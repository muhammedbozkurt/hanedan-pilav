// CSS Modules sınıf denetimi: vite/client tipleri her sınıf adını kabul ettiği için yazım hatası derlemede yakalanmaz.
// Her .module.css için TSX'teki `x.sinif` kullanımları dosyada tanımlı mı ve tanımlı her sınıf kullanılıyor mu, burada bakılır.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const KOK = process.cwd();
const APP = join(KOK, "app");

function tsxDosyalari(dizin: string): string[] {
  return readdirSync(dizin).flatMap((ad) => {
    const yol = join(dizin, ad);
    if (statSync(yol).isDirectory()) return ad === "+types" ? [] : tsxDosyalari(yol);
    return yol.endsWith(".tsx") ? [yol] : [];
  });
}

const deveHorguc = (ad: string) => ad.replace(/-+([a-z0-9])/g, (_, h: string) => h.toUpperCase());

function cssSiniflari(dosya: string): Set<string> {
  let css = readFileSync(dosya, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  css = css.replace(/:global\([^)]*\)/g, "").replace(/url\([^)]*\)/g, "").replace(/"[^"]*"/g, "");
  const siniflar = new Set<string>();
  for (const e of css.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) if (e[1]) siniflar.add(deveHorguc(e[1]));
  return siniflar;
}

const hatalar: string[] = [];
const kullanilan = new Map<string, Set<string>>();
const tanimli = new Map<string, Set<string>>();

for (const tsx of tsxDosyalari(APP)) {
  const kaynak = readFileSync(tsx, "utf8");
  for (const e of kaynak.matchAll(/import\s+(\w+)\s+from\s+"(\.{1,2}\/[^"]+\.module\.css)"/g)) {
    const [, ad, goreli] = e;
    if (!ad || !goreli) continue;
    const css = resolve(dirname(tsx), goreli);
    if (!tanimli.has(css)) tanimli.set(css, cssSiniflari(css));
    const siniflar = tanimli.get(css) ?? new Set<string>();
    const kume = kullanilan.get(css) ?? new Set<string>();
    kullanilan.set(css, kume);
    for (const k of kaynak.matchAll(new RegExp(`\\b${ad}\\.(\\w+)`, "g"))) {
      const sinif = k[1];
      if (!sinif) continue;
      kume.add(sinif);
      if (!siniflar.has(sinif)) hatalar.push(`${relative(KOK, tsx)}: "${ad}.${sinif}" ${relative(KOK, css)} içinde tanımlı değil.`);
    }
  }
}
for (const [css, siniflar] of tanimli) {
  const kume = kullanilan.get(css) ?? new Set<string>();
  for (const s of siniflar) if (!kume.has(s)) hatalar.push(`${relative(KOK, css)}: ".${s}" hiçbir bileşende kullanılmıyor.`);
}

if (hatalar.length > 0) {
  console.error(`CSS modülleri KALDI: ${hatalar.length} sorun`);
  for (const h of hatalar) console.error(`  - ${h}`);
  process.exit(1);
}
console.log(`CSS modülleri GEÇTİ: ${tanimli.size} modül, tüm sınıf başvuruları tutarlı.`);
