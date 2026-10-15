import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { type FormTuru, dogrula } from "../../app/components/form/dogrula.ts";

// Aynı liste tests/php/form-test.php içinde FormIslem::dogrula ile de koşar: iki taraf aynı kararı vermeli.
type Deger = string | { tekrar: string; adet: number };
type Vaka = { ad: string; tur: FormTuru; degisiklik: Record<string, Deger>; hatalar: Record<string, string> };
type Liste = { temel: Record<FormTuru, Record<string, string>>; vakalar: Vaka[] };

const liste = JSON.parse(readFileSync(new URL("../fixtures/dogrulama-vakalari.json", import.meta.url), "utf8")) as Liste;

function coz(d: Deger): string {
  return typeof d === "string" ? d : d.tekrar.repeat(d.adet);
}

test("ortak vaka listesi en az 25 vaka içerir ve iki form türünü kapsar", () => {
  assert.ok(liste.vakalar.length >= 25, `vaka sayısı ${liste.vakalar.length}`);
  assert.ok(liste.vakalar.some((v) => v.tur === "bayilik"));
  assert.ok(liste.vakalar.some((v) => v.tur === "iletisim"));
});

for (const vaka of liste.vakalar) {
  test(`istemci: ${vaka.ad}`, () => {
    const veri: Record<string, string> = { ...liste.temel[vaka.tur] };
    for (const [alan, deger] of Object.entries(vaka.degisiklik)) veri[alan] = coz(deger);
    assert.deepEqual(dogrula(vaka.tur, veri), vaka.hatalar);
  });
}
