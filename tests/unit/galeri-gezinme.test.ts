import assert from "node:assert/strict";
import { test } from "node:test";
import { kaydirmaYonu, onceki, sayac, sonraki } from "../../app/components/galeri/gezinme.ts";

test("sonraki sona gelince başa sarar", () => {
  assert.equal(sonraki(0, 3), 1);
  assert.equal(sonraki(2, 3), 0);
});

test("önceki başta sona sarar", () => {
  assert.equal(onceki(2, 3), 1);
  assert.equal(onceki(0, 3), 2);
});

test("tek öğede yerinde kalır, boş listede 0", () => {
  assert.equal(sonraki(0, 1), 0);
  assert.equal(onceki(0, 1), 0);
  assert.equal(sonraki(0, 0), 0);
  assert.equal(onceki(0, 0), 0);
});

test("sayaç 1 tabanlı", () => {
  assert.equal(sayac(2, 8), "3 / 8");
  assert.equal(sayac(0, 0), "0 / 0");
});

test("kaydırma yönü", () => {
  assert.equal(kaydirmaYonu(-120, 5), 1);
  assert.equal(kaydirmaYonu(120, 5), -1);
  assert.equal(kaydirmaYonu(20, 0), 0);
  assert.equal(kaydirmaYonu(-60, 90), 0);
});
