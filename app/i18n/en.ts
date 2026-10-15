// English dictionary. Natural corporate American English, not a literal translation of tr.ts.
import { KURULUS_YILI } from "./olgular.ts";
import type { Sozluk } from "./tr.ts";

// "09:00" gibi 24 saatlik değer ABD biçimine çevrilir: "9 a.m.", "5:30 p.m.".
function saat12(hhmm: string): string {
  const [s = 0, d = 0] = hhmm.split(":").map(Number);
  const dakika = d ? `:${String(d).padStart(2, "0")}` : "";
  return `${s % 12 || 12}${dakika} ${s < 12 ? "a.m." : "p.m."}`;
}

export const en: Sozluk = {
  dil: { ad: "English", kisa: "EN", ogLocale: "en_US" },
  genel: {
    atla: "Skip to content",
    logoAlt: "Hanedan Pilav home",
    navAria: "Main menu",
    dilAria: "Language",
    secili: "selected",
    telSr: "Phone:",
    menu: "Menu",
    kapat: "Close",
    menuAria: "Site menu",
    yeniSekme: " (opens in a new tab)",
  },
  nav: {
    kurumsal: "About",
    bayilerimiz: "Locations",
    galeri: "Gallery",
    iletisim: "Contact",
    bayilik: "Become a Franchisee",
  },
  wa: {
    etiket: "Chat on WhatsApp",
    aria: "Chat on WhatsApp (opens in a new tab)",
    mesaj: "Hello, I would like some information about Hanedan Pilav.",
  },
  saat: {
    etiket: "Hours",
    metin: (acilis, kapanis) => `Open daily, ${saat12(acilis)} to ${saat12(kapanis)}`,
  },
  alt: {
    slogan: "Lezzet Hanedanlığı",
    cumle: "pilaf restaurants, franchising, and catering.",
    merkez: "Headquarters",
    sayfalar: "Pages",
    iletisim: "Contact",
    kvkk: "Privacy Notice (KVKK)",
    cerez: "Cookie Policy",
    yasal: "Legal",
    telif: (yil) => `© ${KURULUS_YILI}-${yil} Hanedan Pilav`,
  },
  gorsel: {
    alan: "Photo slot",
    foto: "Photo",
  },
  sayfalar: {
    kvkk: {
      meta: {
        baslik: "Privacy Notice · Hanedan Pilav",
        aciklama: "The Hanedan Pilav privacy notice under Turkish Law No. 6698 on the Protection of Personal Data (KVKK).",
      },
    },
    cerez: {
      meta: {
        baslik: "Cookie Policy · Hanedan Pilav",
        aciklama: "The Hanedan Pilav website does not use cookies, analytics, or third-party trackers.",
      },
    },
    bulunamadi: {
      meta: {
        baslik: "Page Not Found · Hanedan Pilav",
        aciklama: "The page you are looking for could not be found.",
      },
      eylem: "Back to Homepage",
    },
  },
  hata: {
    metaBaslik: "Error · Hanedan Pilav",
    etiket: "Error",
    baslik: "Something went wrong.",
    giris: "An unexpected error occurred while loading this page. Please refresh and try again.",
  },
};
