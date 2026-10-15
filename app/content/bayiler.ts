// Bayi listesi. Yalnız doğrulanmış şubeler eklenir; konum (lat/lng) bilinmiyorsa boş bırakılır, tahmin edilmez.
// Bu dosya Node betiklerinden de içe aktarılır: yalnız tip silinebilir sözdizimi ve göreli `.ts` içe aktarma kullanılır.

export type BayiTuru = "merkez" | "sube";

export type Bayi = {
  readonly slug: string;
  readonly tur: BayiTuru;
  readonly ad: { readonly tr: string; readonly en: string };
  readonly adres: {
    readonly satir: string;
    readonly postaKodu: string;
    readonly ilce: string;
    readonly il: string;
  };
  readonly telefon?: { readonly e164: string; readonly gorunen: string };
  readonly konum?: { readonly lat: number; readonly lng: number };
};

export const BAYILER: readonly Bayi[] = [
  {
    slug: "sultangazi-merkez",
    tur: "merkez",
    ad: { tr: "Sultangazi Merkez", en: "Sultangazi Headquarters" },
    adres: {
      satir: "Yunus Emre Mah., Adem Yavuz Cd. No:76",
      postaKodu: "34260",
      ilce: "Sultangazi",
      il: "İstanbul",
    },
    telefon: { e164: "+905336163754", gorunen: "+90 533 616 37 54" },
  },
];

export function bayiBul(slug: string | undefined): Bayi | undefined {
  return BAYILER.find((b) => b.slug === slug);
}
