// Kurumsal sayfası sözlüğü. TR tip kaynağıdır; EN aynı tipi sağlar. Olgular yalnız app/content/site.ts ve mevcut sitedeki ifadelerden gelir.
// Tekrar sınırı: kuruluş yılı, kapasite, "İstanbul geneli" ve hijyen sayfa gövdesinde en fazla iki kez geçer (künye bunlardan biri).
import type { Dil } from "~/lib/rotalar.ts";
import { useLang } from "./index.ts";
import { KURULUS_YILI, kapasiteEn, kapasiteTr, metrikTon, yilEki } from "./olgular.ts";

const tr = {
  meta: {
    baslik: "Kurumsal · Hanedan Pilav",
    aciklama:
      `${yilEki(KURULUS_YILI, "den")} bu yana Hanedan Pilav: günlük ${kapasiteTr(" ")} üretim kapasitesi, titiz hijyen standartları, İstanbul geneli şube ağı ve kurumsal firmalara toplu yemek hizmeti.`,
  },
  baslik: {
    etiket: "Kurumsal",
    baslik: "Geleneksel lezzet, modern üretim.",
    giris: "Hanedan Pilav, kuruluşundan bu yana gıda sektöründe köklü bir güven markası hâline geldi.",
  },
  hikaye: {
    baslik: `${yilEki(KURULUS_YILI, "den")} bugüne.`,
    paragraflar: [
      "İlk günden bu yana geleneksel lezzet anlayışımızı koruyor, onu modern üretim standartlarıyla birleştiriyoruz.",
      "Bugün Sultangazi’deki merkezimizden hem kendi şubelerimize hem de kurumsal firmalara hizmet veriyoruz.",
    ],
    kunye: {
      baslik: "Kısaca Hanedan Pilav",
      kurulus: "Kuruluş",
      merkez: "Merkez",
      kapasite: "Günlük üretim kapasitesi",
      kapasiteDeger: (miktar: number) => `${miktar}\u00a0ton`,
      hizmetAlani: "Hizmet alanı",
      hizmetAlaniDeger: "İstanbul geneli",
    },
    gorsel: { konu: "üretim mutfağı", not: "Geniş plan; paslanmaz tezgâhlar, düzen ve temizlik." },
  },
  calisma: {
    baslik: "Nasıl çalışıyoruz?",
    maddeler: {
      uretim: {
        baslik: "Yüksek kapasiteli üretim",
        metin: `Günlük ${kapasiteTr()} üretim kapasitemiz, şubelerimizin ve toplu yemek siparişlerinin ihtiyacını birlikte karşılar.`,
      },
      hijyen: {
        baslik: "Titiz hijyen standartları",
        metin: "Yüksek hacimde üretirken temizlik kurallarından taviz vermiyor, onları üretimin her aşamasında uyguluyoruz.",
      },
      lojistik: {
        baslik: "Şube ve lojistik ağı",
        metin: "Şubelerimiz ve lojistik ağımız sayesinde İstanbul genelinde hizmet verebiliyoruz.",
      },
    },
  },
  catering: {
    baslik: "Toplu yemek ve organizasyon.",
    metin: "Yüksek üretim kapasitemizle profesyonel ve güvenilir toplu yemek çözümleri sunuyoruz.",
    alanlarBaslik: "Hizmet verdiğimiz alanlar",
    alanlar: {
      kurumsal: "Kurumsal firmalar",
      toplu: "Toplu yemekler",
      organizasyon: "Organizasyonlar",
    },
    eylem: "Toplu Yemek Teklifi",
    gorsel: { konu: "toplu yemek servisi", not: "Servis hattında kazanlar; geniş plan, sıcak ışık." },
  },
  degerler: {
    baslik: "Neye önem veriyoruz?",
    maddeler: {
      lezzet: { baslik: "Lezzet", metin: "Geleneksel pişirme anlayışından ödün vermeyen bir mutfak." },
      hijyen: { baslik: "Hijyen", metin: "Mutfakta temizlik ve düzen, her gün aynı titizlikle uygulanır." },
      sureklilik: {
        baslik: "Süreklilik",
        metin: "Her gün aynı lezzeti sunabilmek için üretimde ve lojistikte sürekliliği önceliyoruz.",
      },
    },
  },
  kapanis: {
    baslik: "Kendi Hanedan Pilav şubenizi açın.",
    metin: "Bayilik başvurusuyla ilgili bilgiler Bayilerimiz sayfasında.",
  },
};

export type KurumsalSozluk = typeof tr;

const en: KurumsalSozluk = {
  meta: {
    baslik: "About Us · Hanedan Pilav",
    aciklama:
      `Hanedan Pilav since ${KURULUS_YILI}: ${kapasiteEn(" ")} of daily production capacity, rigorous hygiene standards, locations across Istanbul, and catering for companies.`,
  },
  baslik: {
    etiket: "About us",
    baslik: "Traditional flavor, modern production.",
    giris: "Since its founding, Hanedan Pilav has grown into a long-trusted name in the food industry.",
  },
  hikaye: {
    baslik: `From ${KURULUS_YILI} to today.`,
    paragraflar: [
      "From day one, we have held on to a traditional approach to flavor and paired it with modern production standards.",
      "Today, from our headquarters in Sultangazi, we supply our own locations and serve corporate clients.",
    ],
    kunye: {
      baslik: "Hanedan Pilav at a glance",
      kurulus: "Founded",
      merkez: "Headquarters",
      kapasite: "Daily production capacity",
      kapasiteDeger: metrikTon,
      hizmetAlani: "Service area",
      hizmetAlaniDeger: "Across Istanbul",
    },
    gorsel: { konu: "production kitchen", not: "Wide shot; stainless counters, order, and cleanliness." },
  },
  calisma: {
    baslik: "How we work.",
    maddeler: {
      uretim: {
        baslik: "High-capacity production",
        metin: `Our daily production capacity of ${kapasiteEn()} covers our locations and large catering orders alike.`,
      },
      hijyen: {
        baslik: "Rigorous hygiene standards",
        metin: "Volume never comes at the expense of cleanliness. We apply our standards at every stage of production.",
      },
      lojistik: {
        baslik: "Locations and logistics network",
        metin: "Our network of locations and logistics lets us serve customers across Istanbul.",
      },
    },
  },
  catering: {
    baslik: "Catering and events.",
    metin: "Backed by high production capacity, we offer professional, dependable catering.",
    alanlarBaslik: "Who we serve",
    alanlar: {
      kurumsal: "Corporate clients",
      toplu: "Group meals",
      organizasyon: "Events",
    },
    eylem: "Get a Catering Quote",
    gorsel: { konu: "catering service", not: "Pots on the serving line; wide shot, warm light." },
  },
  degerler: {
    baslik: "What we stand for.",
    maddeler: {
      lezzet: { baslik: "Flavor", metin: "A kitchen that stays true to traditional cooking." },
      hijyen: { baslik: "Hygiene", metin: "Cleanliness and order, kept with the same care every single day." },
      sureklilik: {
        baslik: "Continuity",
        metin: "Steady production and logistics, so the flavor you get today is the flavor you get tomorrow.",
      },
    },
  },
  kapanis: {
    baslik: "Open your own Hanedan Pilav location.",
    metin: "Details on how to apply are on our Locations page.",
  },
};

const SOZLUKLER: Readonly<Record<Dil, KurumsalSozluk>> = { tr, en };

export function kurumsalSozluk(dil: Dil): KurumsalSozluk {
  return SOZLUKLER[dil];
}

export function useKurumsal(): KurumsalSozluk {
  return kurumsalSozluk(useLang());
}
