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
      baslikBas: "Made the same way",
      baslikSon: "since 1998.",
      giris: "By the plate or by the pot: one metric\u00a0ton of daily capacity, serving our franchisees and corporate clients.",
      bayilerEylem: "Find a Location",
    },
    kurumsal: {
      meta: {
        baslik: "About Us · Hanedan Pilav",
        aciklama: "The Hanedan Pilav story, how we cook and what we stand for: flavor, hygiene and continuity.",
      },
      etiket: "About us",
      baslik: "Traditional flavor, modern production.",
      giris: "Since its founding in 1998, Hanedan Pilav has grown into a long-trusted name in the food industry.",
    },
    bayilerimiz: {
      meta: {
        baslik: "Locations · Hanedan Pilav",
        aciklama:
          "Hanedan Pilav locations and franchise inquiries. Find the location nearest you or contact us about opening your own.",
      },
      etiket: "Locations",
      baslik: "Find a location.",
      giris: "Find the Hanedan Pilav location nearest you. Our headquarters is in Sultangazi, Istanbul.",
      listeBaslik: "Locations",
      bayilikEtiket: "Franchise",
      bayilikBaslik: "Become a Hanedan Pilav franchisee.",
      bayilikGiris: "Interested in opening your own Hanedan Pilav location? Reach out by phone or WhatsApp.",
      ara: "Call Us",
    },
    bayiDetay: {
      meta: {
        baslik: (ad) => `${ad} · Hanedan Pilav`,
        aciklama: (ad, adres) => `Hanedan Pilav ${ad}: ${adres}. Address, phone and hours.`,
      },
      etiket: { merkez: "Headquarters", sube: "Location" },
      geri: "All locations",
      adres: "Address",
      telefon: "Phone",
    },
    galeri: {
      meta: {
        baslik: "Gallery · Hanedan Pilav",
        aciklama: "The Hanedan Pilav gallery: our production kitchen, cooks at the pot, event service and pilaf on the plate.",
      },
      etiket: "Gallery",
      baslik: "From the pot to the plate.",
      giris: "From the pot to the serving table, a look inside the Hanedan Pilav kitchen.",
    },
    iletisim: {
      meta: {
        baslik: "Contact · Hanedan Pilav",
        aciklama: "Contact Hanedan Pilav by phone or WhatsApp, or visit our headquarters in Sultangazi, Istanbul.",
      },
      etiket: "Contact",
      baslik: "Get in touch.",
      giris: (saat) => `Questions, franchise inquiries or catering requests? Reach us by phone or WhatsApp. ${saat}.`,
    },
    kvkk: {
      meta: {
        baslik: "Privacy Notice · Hanedan Pilav",
        aciklama: "The Hanedan Pilav privacy notice under Turkey’s Personal Data Protection Law No. 6698 (KVKK).",
      },
      etiket: "Legal",
      baslik: "Privacy Notice",
      giris:
        "This notice explains why and how we process your personal data under Turkey’s Personal Data Protection Law No. 6698 (KVKK).",
    },
    cerez: {
      meta: {
        baslik: "Cookie Policy · Hanedan Pilav",
        aciklama: "The Hanedan Pilav website does not use cookies, analytics or third-party trackers.",
      },
      etiket: "Legal",
      baslik: "Cookie Policy",
      giris: "This site does not use cookies and does not include analytics, advertising or third-party tracking tools.",
    },
    bulunamadi: {
      meta: {
        baslik: "Page Not Found · Hanedan Pilav",
        aciklama: "The page you are looking for could not be found.",
      },
      etiket: "404",
      baslik: "Page not found.",
      giris: "The page you’re looking for may have been moved or removed. You can pick up from the homepage.",
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
