// İstanbul'un 39 ilçesi. Harita, bayi filtresi ve bayilik formu bu listeyi ortak kullanır.
// Bu dosya Node betiklerinden de içe aktarılır: yalnız tip silinebilir sözdizimi kullanılır.

export type Yaka = "avrupa" | "anadolu";

export type Ilce = { readonly ad: string; readonly slug: string; readonly yaka: Yaka };

export const ILCELER: readonly Ilce[] = [
  { ad: "Adalar", slug: "adalar", yaka: "anadolu" },
  { ad: "Arnavutköy", slug: "arnavutkoy", yaka: "avrupa" },
  { ad: "Ataşehir", slug: "atasehir", yaka: "anadolu" },
  { ad: "Avcılar", slug: "avcilar", yaka: "avrupa" },
  { ad: "Bağcılar", slug: "bagcilar", yaka: "avrupa" },
  { ad: "Bahçelievler", slug: "bahcelievler", yaka: "avrupa" },
  { ad: "Bakırköy", slug: "bakirkoy", yaka: "avrupa" },
  { ad: "Başakşehir", slug: "basaksehir", yaka: "avrupa" },
  { ad: "Bayrampaşa", slug: "bayrampasa", yaka: "avrupa" },
  { ad: "Beşiktaş", slug: "besiktas", yaka: "avrupa" },
  { ad: "Beykoz", slug: "beykoz", yaka: "anadolu" },
  { ad: "Beylikdüzü", slug: "beylikduzu", yaka: "avrupa" },
  { ad: "Beyoğlu", slug: "beyoglu", yaka: "avrupa" },
  { ad: "Büyükçekmece", slug: "buyukcekmece", yaka: "avrupa" },
  { ad: "Çatalca", slug: "catalca", yaka: "avrupa" },
  { ad: "Çekmeköy", slug: "cekmekoy", yaka: "anadolu" },
  { ad: "Esenler", slug: "esenler", yaka: "avrupa" },
  { ad: "Esenyurt", slug: "esenyurt", yaka: "avrupa" },
  { ad: "Eyüpsultan", slug: "eyupsultan", yaka: "avrupa" },
  { ad: "Fatih", slug: "fatih", yaka: "avrupa" },
  { ad: "Gaziosmanpaşa", slug: "gaziosmanpasa", yaka: "avrupa" },
  { ad: "Güngören", slug: "gungoren", yaka: "avrupa" },
  { ad: "Kadıköy", slug: "kadikoy", yaka: "anadolu" },
  { ad: "Kağıthane", slug: "kagithane", yaka: "avrupa" },
  { ad: "Kartal", slug: "kartal", yaka: "anadolu" },
  { ad: "Küçükçekmece", slug: "kucukcekmece", yaka: "avrupa" },
  { ad: "Maltepe", slug: "maltepe", yaka: "anadolu" },
  { ad: "Pendik", slug: "pendik", yaka: "anadolu" },
  { ad: "Sancaktepe", slug: "sancaktepe", yaka: "anadolu" },
  { ad: "Sarıyer", slug: "sariyer", yaka: "avrupa" },
  { ad: "Silivri", slug: "silivri", yaka: "avrupa" },
  { ad: "Sultanbeyli", slug: "sultanbeyli", yaka: "anadolu" },
  { ad: "Sultangazi", slug: "sultangazi", yaka: "avrupa" },
  { ad: "Şile", slug: "sile", yaka: "anadolu" },
  { ad: "Şişli", slug: "sisli", yaka: "avrupa" },
  { ad: "Tuzla", slug: "tuzla", yaka: "anadolu" },
  { ad: "Ümraniye", slug: "umraniye", yaka: "anadolu" },
  { ad: "Üsküdar", slug: "uskudar", yaka: "anadolu" },
  { ad: "Zeytinburnu", slug: "zeytinburnu", yaka: "avrupa" },
];

export function ilceBul(ad: string): Ilce | undefined {
  return ILCELER.find((i) => i.ad === ad);
}
