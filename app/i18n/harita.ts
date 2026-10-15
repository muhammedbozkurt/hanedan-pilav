// Harita bileşeninin metinleri. tr tip kaynağıdır; en aynı tipi sağlar.

export const haritaTr = {
  grupAria: "İstanbul ilçe haritası",
  sadeceBilgiAria: "İstanbul haritası",
  bayiVar: "bayi var",
  bayiYok: "bayi yok",
  secili: "seçili",
  ilceAria: (ad: string, durum: string) => `${ad}, ${durum}`,
  pinKonumNotu: "İlçe merkezi gösterilir, adres noktası değildir.",
  atif: "© OpenStreetMap katkıda bulunanları",
  merkezEtiket: "Merkez",
};

export type HaritaMetni = typeof haritaTr;

export const haritaEn: HaritaMetni = {
  grupAria: "Istanbul district map",
  sadeceBilgiAria: "Map of Istanbul",
  bayiVar: "location available",
  bayiYok: "no location",
  secili: "selected",
  ilceAria: (ad, durum) => `${ad}, ${durum}`,
  pinKonumNotu: "Shows the district center, not a street address.",
  atif: "© OpenStreetMap contributors",
  merkezEtiket: "Headquarters",
};

export const HARITA_METNI = { tr: haritaTr, en: haritaEn } as const;
