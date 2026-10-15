// Node birim testleri de içe aktardığı için bağımsız tutulur.
export const BASLIK_UST_SINIR = 60;
export const ACIKLAMA_UST_SINIR = 160;

// Arama sonucunda kesilmesin diye sınırı aşan metin son tam kelimede bırakılır; sözlükte kısaltma yapılana kadar güvenlik ağıdır.
export function sinirla(metin: string, sinir: number): string {
  if (metin.length <= sinir) return metin;
  const kesik = metin.slice(0, sinir - 1);
  const bosluk = kesik.lastIndexOf(" ");
  return `${(bosluk > sinir * 0.6 ? kesik.slice(0, bosluk) : kesik).replace(/[\s,.;:]+$/u, "")}…`;
}
