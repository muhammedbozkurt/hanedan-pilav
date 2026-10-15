// Harita bileşeninin metinleri. tr tip kaynağıdır; en aynı tipi sağlar.

export const haritaTr = {
  grupAria: "İstanbul ilçe haritası",
  sadeceBilgiAria: "İstanbul haritası",
  bayiVar: "bayi var",
  bayiYok: "bayi yok",
  secili: "seçili",
  ilceAria: (ad: string, durum: string) => `${ad}, ${durum}`,
  pinKonumNotu: "İşaret ilçenin ortasını gösterir, tam adresi değil.",
  atif: "© OpenStreetMap’e katkıda bulunanlar",
  merkezEtiket: "Merkez",
};

export type HaritaMetni = typeof haritaTr;

export const haritaEn: HaritaMetni = {
  grupAria: "Istanbul district map",
  sadeceBilgiAria: "Map of Istanbul",
  bayiVar: "has a location",
  bayiYok: "no location",
  secili: "selected",
  ilceAria: (ad, durum) => `${ad}, ${durum}`,
  pinKonumNotu: "Pins mark the middle of the district, not the exact address.",
  atif: "© OpenStreetMap contributors",
  merkezEtiket: "Headquarters",
};

export const HARITA_METNI = { tr: haritaTr, en: haritaEn } as const;
