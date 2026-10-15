// English dictionary. Natural corporate American English, not a literal translation of tr.ts.
import type { Sozluk } from "./tr.ts";

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
    metin: (acilis, kapanis) => `Every day, ${acilis}-${kapanis}`,
  },
  alt: {
    slogan: "Lezzet Hanedanlığı",
    cumle: "pilaf restaurants, franchising and catering.",
    merkez: "Headquarters",
    sayfalar: "Pages",
    iletisim: "Contact",
    kvkk: "Privacy Notice (KVKK)",
    cerez: "Cookie Policy",
    yasal: "Legal",
    telif: (yil) => `© 1998-${yil} Hanedan Pilav`,
  },
  gorsel: {
    alan: "Photo slot",
    foto: "Photo",
  },
  sayfalar: {
    anasayfa: {
      meta: {
        baslik: "Hanedan Pilav · Made the same way since 1998",
        aciklama:
          "Hanedan Pilav, made the same way since 1998. One metric ton of daily production capacity for franchising and catering, headquartered in Sultangazi, Istanbul.",
      },
    },
    kurumsal: {
      meta: {
        baslik: "About Us · Hanedan Pilav",
        aciklama: "The Hanedan Pilav story, how we cook and what we stand for: flavor, hygiene and continuity.",
      },
    },
    bayilerimiz: {
      meta: {
        baslik: "Locations · Hanedan Pilav",
        aciklama:
          "Hanedan Pilav locations and franchise inquiries. Find the location nearest you or contact us about opening your own.",
      },
    },
    galeri: {
      meta: {
        baslik: "Gallery · Hanedan Pilav",
        aciklama: "The Hanedan Pilav gallery: our production kitchen, cooks at the pot, event service and pilaf on the plate.",
      },
    },
    iletisim: {
      meta: {
        baslik: "Contact · Hanedan Pilav",
        aciklama: "Contact Hanedan Pilav by phone or WhatsApp, or visit our headquarters in Sultangazi, Istanbul.",
      },
    },
    kvkk: {
      meta: {
        baslik: "Privacy Notice · Hanedan Pilav",
        aciklama: "The Hanedan Pilav privacy notice under Turkey’s Personal Data Protection Law No. 6698 (KVKK).",
      },
    },
    cerez: {
      meta: {
        baslik: "Cookie Policy · Hanedan Pilav",
        aciklama: "The Hanedan Pilav website does not use cookies, analytics or third-party trackers.",
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
