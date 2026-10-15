// Lightbox gezinme mantığı: DOM'dan bağımsız, birim testli.

export function sonraki(i: number, n: number): number {
  return n <= 0 ? 0 : (i + 1) % n;
}

export function onceki(i: number, n: number): number {
  return n <= 0 ? 0 : (i - 1 + n) % n;
}

export function sayac(i: number, n: number): string {
  return `${n <= 0 ? 0 : i + 1} / ${n}`;
}

// Yatay kaydırma yönü: +1 sonraki, -1 önceki, 0 yok. Dikey hareket baskınsa veya eşik altındaysa yok sayılır.
export function kaydirmaYonu(dx: number, dy: number, esik = 48): -1 | 0 | 1 {
  if (Math.abs(dx) < esik || Math.abs(dx) < Math.abs(dy) * 1.2) return 0;
  return dx < 0 ? 1 : -1;
}
