// İletişim sayfası sözlüğü. TR tip kaynağıdır; EN aynı tipi sağlar.
import type { Dil } from "~/lib/rotalar.ts";
import { useLang } from "./index.ts";

const tr = {
  meta: {
    baslik: "İletişim · Hanedan Pilav",
    aciklama:
      "Hanedan Pilav iletişim bilgileri: telefon, WhatsApp, çalışma saatleri ve Sultangazi’deki merkez adresimiz. Soru, bayilik ve toplu yemek talepleriniz için formu doldurun.",
  },
  baslik: {
    etiket: "İletişim",
    baslik: "Bize ulaşın.",
    giris: "Soru, bayilik ve toplu yemek talepleriniz için bize telefonla, WhatsApp’tan ya da formla yazabilirsiniz.",
  },
  bilgi: {
    baslik: "İletişim bilgileri",
    telefon: "Telefon",
    telefonAra: "Telefon:",
    whatsapp: "WhatsApp",
    whatsappEylem: "WhatsApp’tan yazın",
    eposta: "E-posta",
    saat: "Çalışma saatleri",
    adres: "Adres",
    yolTarifi: "Yol tarifi",
    yeniSekme: " (yeni sekmede açılır)",
    harita: "Sultangazi’deki merkezimizin ilçe haritası",
  },
  form: {
    baslik: "Bize yazın",
    metin: "Formu doldurun, mesajınız en kısa sürede ilgili ekibe ulaşsın.",
  },
  yonlendirme: {
    baslik: "Başka bir konuda mı yazıyorsunuz?",
    bayilik: {
      baslik: "Bayilik başvurusu",
      metin: "Bayilik şartlarını ve başvuru formunu Bayilerimiz sayfasında bulabilirsiniz.",
      eylem: "Bayilik bilgilerine git",
    },
    catering: {
      baslik: "Toplu yemek",
      metin: "Kurumsal toplu yemek hizmetimizin kapsamını Kurumsal sayfamızda bulabilirsiniz.",
      eylem: "Toplu yemek bilgilerine git",
    },
  },
};

export type IletisimSozluk = typeof tr;

const en: IletisimSozluk = {
  meta: {
    baslik: "Contact · Hanedan Pilav",
    aciklama:
      "Contact Hanedan Pilav: phone, WhatsApp, business hours and our headquarters address in Sultangazi, Istanbul. Send us your questions, franchise inquiries or catering requests.",
  },
  baslik: {
    etiket: "Contact",
    baslik: "Get in touch.",
    giris: "Call us, message us on WhatsApp or use the form for questions, franchise inquiries and catering requests.",
  },
  bilgi: {
    baslik: "Contact details",
    telefon: "Phone",
    telefonAra: "Phone:",
    whatsapp: "WhatsApp",
    whatsappEylem: "Message us on WhatsApp",
    eposta: "Email",
    saat: "Business hours",
    adres: "Address",
    yolTarifi: "Get directions",
    yeniSekme: " (opens in a new tab)",
    harita: "District map showing our headquarters in Sultangazi",
  },
  form: {
    baslik: "Send us a message",
    metin: "Fill in the form and your message will reach the right team as soon as possible.",
  },
  yonlendirme: {
    baslik: "Writing about something else?",
    bayilik: {
      baslik: "Franchise application",
      metin: "You can find the franchise requirements and the application form on our Locations page.",
      eylem: "See franchise details",
    },
    catering: {
      baslik: "Catering",
      metin: "You can read about our corporate catering service on our About page.",
      eylem: "See catering details",
    },
  },
};

const SOZLUKLER: Readonly<Record<Dil, IletisimSozluk>> = { tr, en };

export function iletisimSozluk(dil: Dil): IletisimSozluk {
  return SOZLUKLER[dil];
}

export function useIletisim(): IletisimSozluk {
  return iletisimSozluk(useLang());
}
