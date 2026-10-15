// Rota kapısı: sayfa tablosu, routes.ts, prerender listesi ve build/client çıktısı birbiriyle tutarlı mı?
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import config from "../react-router.config.ts";
import rotaAgaci from "../app/routes.ts";
import {
  DILLER,
  SAYFALAR,
  SAYFA_ANAHTARLARI,
  dilBul,
  rotaIdCoz,
  sayfaYollari,
  tumYollar,
  yolParametreleri,
} from "../app/lib/rotalar.ts";

const KOK = process.cwd();
const hatalar: string[] = [];
const hata = (m: string) => hatalar.push(m);

// 1) Sayfa tablosu: her anahtarın TR ve EN yolu var, dil önekleri doğru, parametreler iki dilde aynı.
const gorulenDesenler = new Map<string, string>();
for (const anahtar of SAYFA_ANAHTARLARI) {
  const tanim = SAYFALAR[anahtar];
  for (const dil of DILLER) {
    const desen = tanim[dil];
    if (!desen || !desen.startsWith("/")) hata(`${anahtar}.${dil}: yol tanımsız ya da "/" ile başlamıyor (${desen}).`);
    if (dilBul(desen) !== dil) hata(`${anahtar}.${dil}: yol öneki dile uymuyor (${desen}).`);
    const onceki = gorulenDesenler.get(desen);
    if (onceki) hata(`${desen}: hem ${onceki} hem ${anahtar}.${dil} tarafından kullanılıyor.`);
    gorulenDesenler.set(desen, `${anahtar}.${dil}`);
  }
  const trP = yolParametreleri(tanim.tr).join(",");
  const enP = yolParametreleri(tanim.en).join(",");
  if (trP !== enP) hata(`${anahtar}: TR (${trP}) ve EN (${enP}) yol parametreleri farklı.`);
  if (!existsSync(join(KOK, "app", tanim.modul))) hata(`${anahtar}: modül bulunamadı (app/${tanim.modul}).`);
}

// 2) routes.ts: her (dil, anahtar) için tam bir rota, doğru yol ve modül.
type RotaGirdisi = { id?: string; path?: string; file: string; children?: RotaGirdisi[] };
const duzRotalar: RotaGirdisi[] = [];
const topla = (liste: RotaGirdisi[]) => {
  for (const r of liste) {
    duzRotalar.push(r);
    if (r.children) topla(r.children);
  }
};
topla(rotaAgaci as RotaGirdisi[]);
const beklenenRotaSayisi = SAYFA_ANAHTARLARI.length * DILLER.length;
if (duzRotalar.length !== beklenenRotaSayisi)
  hata(`routes.ts: ${duzRotalar.length} rota var, ${beklenenRotaSayisi} bekleniyordu.`);
for (const r of duzRotalar) {
  const cozum = r.id ? rotaIdCoz(r.id) : null;
  if (!cozum) {
    hata(`routes.ts: tanınmayan rota id'si (${r.id ?? "yok"}).`);
    continue;
  }
  const tanim = SAYFALAR[cozum.anahtar];
  if (r.path !== tanim[cozum.dil]) hata(`routes.ts: ${r.id} yolu ${r.path}, tabloda ${tanim[cozum.dil]}.`);
  if (r.file !== tanim.modul) hata(`routes.ts: ${r.id} modülü ${r.file}, tabloda ${tanim.modul}.`);
}

// 3) Prerender listesi: routes.ts'deki her yol (parametreler veriden açılarak) listede, fazlası yok.
const beklenenYollar = new Set(
  duzRotalar.flatMap((r) => {
    const cozum = r.id ? rotaIdCoz(r.id) : null;
    return cozum ? sayfaYollari(cozum.anahtar, cozum.dil) : [];
  }),
);
const prerender = config.prerender;
const prerenderListesi: string[] = Array.isArray(prerender) ? prerender : [];
if (!Array.isArray(prerender)) hata("react-router.config.ts: prerender bir yol listesi olmalı.");
if (config.ssr !== false) hata("react-router.config.ts: ssr:false olmalı (statik barındırma).");
const prerenderKume = new Set(prerenderListesi);
for (const y of beklenenYollar) if (!prerenderKume.has(y)) hata(`prerender: ${y} listede yok.`);
for (const y of prerenderKume) if (!beklenenYollar.has(y)) hata(`prerender: ${y} hiçbir rotaya karşılık gelmiyor.`);
if (prerenderListesi.length !== prerenderKume.size) hata("prerender: listede tekrar eden yol var.");
if (tumYollar().length !== beklenenYollar.size) hata("tumYollar() ile routes.ts açılımı farklı sayıda yol üretiyor.");

// 4) build/client: her yol için index.html, doğru <html lang> ve tek h1.
const istemci = join(KOK, "build", "client");
if (!existsSync(istemci)) {
  hata("build/client yok: önce `npm run build` çalıştırın.");
} else {
  for (const y of beklenenYollar) {
    const dosya = join(istemci, y === "/" ? "" : y.slice(1), "index.html");
    if (!existsSync(dosya)) {
      hata(`build: ${y} için ${dosya.replace(KOK + "/", "")} oluşmamış.`);
      continue;
    }
    const html = readFileSync(dosya, "utf8");
    const lang = /<html[^>]*\slang="([^"]+)"/.exec(html)?.[1];
    if (lang !== dilBul(y)) hata(`build: ${y} <html lang="${lang}">, beklenen "${dilBul(y)}".`);
    const h1Sayisi = (html.match(/<h1[\s>]/g) ?? []).length;
    if (h1Sayisi !== 1) hata(`build: ${y} içinde ${h1Sayisi} adet h1 var, 1 bekleniyordu.`);
  }
}

if (hatalar.length > 0) {
  console.error(`check:rotalar KALDI: ${hatalar.length} sorun`);
  for (const m of hatalar) console.error(`  - ${m}`);
  process.exit(1);
}
console.log(
  `check:rotalar GEÇTİ: ${SAYFA_ANAHTARLARI.length} sayfa x ${DILLER.length} dil, ${beklenenYollar.size} yol prerender edildi ve build/client içinde mevcut.`,
);
