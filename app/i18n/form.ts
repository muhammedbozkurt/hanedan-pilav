// Form metinleri: TR tip kaynağıdır, EN aynı tipi sağlar. Hata kodları (bos, uzun, gecersiz) sunucu yanıtlarıyla ortaktır.
import { useLang } from "./index.ts";
import type { Dil } from "~/lib/rotalar.ts";

export const formTr = {
  zorunluNot: "Yıldızlı (*) alanlar zorunludur.",
  zorunluIsaret: "*",
  opsiyonelSr: "isteğe bağlı",
  konu: {
    etiket: "Konu",
    genel: "Genel",
    catering: "Toplu yemek ve organizasyon",
    bayilik: "Bayilik",
    diger: "Diğer",
  },
  alanlar: {
    ad: "Ad soyad",
    firma: "Firma",
    telefon: "Telefon",
    eposta: "E-posta",
    mesaj: "Mesajınız",
    ilce: "İlçe",
    isletme: "Mevcut işletmeniz var mı?",
    lokasyon: "Düşündüğünüz bölge",
  },
  ipucu: { telefon: "Örnek: 0532 123 45 67", lokasyon: "Mahalle, cadde ya da semt" },
  ilce: { sec: "İlçe seçin", istanbulDisi: "İstanbul dışı" },
  isletme: { evet: "Evet", hayir: "Hayır" },
  bilgiNotu: { once: "Kişisel verileriniz, talebinizi yanıtlamak için ", link: "KVKK Aydınlatma Metni", sonra: "’nde açıklandığı şekilde işlenir." },
  hata: {
    konu: { bos: "Lütfen bir konu seçin.", gecersiz: "Lütfen listeden bir konu seçin." },
    ad: { bos: "Lütfen adınızı ve soyadınızı yazın.", uzun: "Ad soyad en fazla 100 karakter olabilir.", gecersiz: "Ad soyad satır sonu içeremez." },
    firma: { uzun: "Firma adı en fazla 120 karakter olabilir.", gecersiz: "Firma adı satır sonu içeremez." },
    telefon: {
      bos: "Lütfen telefon numaranızı yazın.",
      uzun: "Telefon numarası çok uzun.",
      gecersiz: "Geçerli bir telefon numarası yazın. Örnek: 0532 123 45 67",
    },
    eposta: {
      bos: "Lütfen e-posta adresinizi yazın.",
      uzun: "E-posta adresi çok uzun.",
      gecersiz: "Geçerli bir e-posta adresi yazın. Örnek: ad@ornek.com",
    },
    mesaj: { bos: "Lütfen mesajınızı yazın.", uzun: "Mesaj en fazla 3000 karakter olabilir.", gecersiz: "Mesajda geçersiz karakter var." },
    ilce: { bos: "Lütfen ilçenizi seçin.", gecersiz: "Lütfen listeden bir ilçe seçin." },
    mevcut_isletme: { gecersiz: "Lütfen Evet ya da Hayır seçin." },
    lokasyon: { uzun: "Bölge en fazla 200 karakter olabilir.", gecersiz: "Bölge satır sonu içeremez." },
    varsayilan: "Bu alanı kontrol edin.",
  },
  durum: {
    gonderiliyor: "Gönderiliyor…",
    basariBaslik: { iletisim: "Mesajınız bize ulaştı.", bayilik: "Başvurunuz bize ulaştı." },
    basariMetin: "En kısa sürede sizinle iletişime geçeceğiz.",
    duzeltme: (adet: number) => (adet === 1 ? "1 alanda düzeltme gerekiyor." : `${adet} alanda düzeltme gerekiyor.`),
    dogrulama: "Gönderilemedi. Zorunlu alanları kontrol edip yeniden deneyin.",
    sunucu: "Mesajınız şu anda gönderilemedi. Lütfen biraz sonra yeniden deneyin ya da bizi arayın.",
    hiz: "Kısa sürede çok fazla gönderim yapıldı. Lütfen birkaç dakika sonra yeniden deneyin.",
    ag: "Bağlantı kurulamadı. İnternet bağlantınızı kontrol edip yeniden deneyin.",
    cokHizli: "Form çok hızlı gönderildi. Lütfen birkaç saniye bekleyip yeniden deneyin.",
    origin: "Gönderim bu adresten kabul edilmiyor. Lütfen sayfayı yenileyip yeniden deneyin.",
  },
  gonder: { iletisim: "Gönder", bayilik: "Başvuruyu gönder", gonderiliyor: "Gönderiliyor" },
};

export type FormMetni = typeof formTr;

export const formEn: FormMetni = {
  zorunluNot: "Fields marked with an asterisk (*) are required.",
  zorunluIsaret: "*",
  opsiyonelSr: "optional",
  konu: {
    etiket: "Topic",
    genel: "General",
    catering: "Catering and events",
    bayilik: "Franchise",
    diger: "Other",
  },
  alanlar: {
    ad: "Full name",
    firma: "Company",
    telefon: "Phone",
    eposta: "Email",
    mesaj: "Your message",
    ilce: "District",
    isletme: "Do you already run a business?",
    lokasyon: "Location you have in mind",
  },
  ipucu: { telefon: "Example: +90 532 123 45 67", lokasyon: "Neighborhood, street, or area" },
  ilce: { sec: "Select a district", istanbulDisi: "Outside Istanbul" },
  isletme: { evet: "Yes", hayir: "No" },
  bilgiNotu: { once: "Your personal data is processed to respond to your request, as described in our ", link: "Privacy Notice", sonra: "." },
  hata: {
    konu: { bos: "Please choose a topic.", gecersiz: "Please choose a topic from the list." },
    ad: { bos: "Please enter your full name.", uzun: "Your name can be up to 100 characters.", gecersiz: "Your name cannot contain line breaks." },
    firma: { uzun: "Company name can be up to 120 characters.", gecersiz: "Company name cannot contain line breaks." },
    telefon: {
      bos: "Please enter your phone number.",
      uzun: "That phone number is too long.",
      gecersiz: "Enter a valid phone number. Example: +90 532 123 45 67",
    },
    eposta: {
      bos: "Please enter your email address.",
      uzun: "That email address is too long.",
      gecersiz: "Enter a valid email address. Example: name@example.com",
    },
    mesaj: { bos: "Please write a message.", uzun: "Your message can be up to 3,000 characters.", gecersiz: "Your message contains an invalid character." },
    ilce: { bos: "Please select your district.", gecersiz: "Please select a district from the list." },
    mevcut_isletme: { gecersiz: "Please choose Yes or No." },
    lokasyon: { uzun: "Location can be up to 200 characters.", gecersiz: "Location cannot contain line breaks." },
    varsayilan: "Please check this field.",
  },
  durum: {
    gonderiliyor: "Sending…",
    basariBaslik: { iletisim: "We’ve received your message.", bayilik: "We’ve received your application." },
    basariMetin: "We’ll get back to you as soon as possible.",
    duzeltme: (adet: number) => (adet === 1 ? "1 field needs your attention." : `${adet} fields need your attention.`),
    dogrulama: "We couldn’t send your message. Please check the required fields and try again.",
    sunucu: "We couldn’t send your message right now. Please try again shortly or give us a call.",
    hiz: "Too many submissions in a short time. Please wait a few minutes and try again.",
    ag: "We couldn’t connect. Please check your internet connection and try again.",
    cokHizli: "The form was sent too quickly. Please wait a few seconds and try again.",
    origin: "Submissions from this address are not accepted. Please reload the page and try again.",
  },
  gonder: { iletisim: "Send", bayilik: "Submit application", gonderiliyor: "Sending" },
};

const METINLER: Readonly<Record<Dil, FormMetni>> = { tr: formTr, en: formEn };

export function formMetni(dil: Dil): FormMetni {
  return METINLER[dil];
}

// Hata kodu sunucudan da geldiği için (bilinmeyen kod olabilir) anahtar araması gevşek yazılır.
export function hataMetni(m: FormMetni, alan: string, kod: string): string {
  const alanlar = m.hata as Record<string, unknown>;
  const grup = alanlar[alan];
  if (grup && typeof grup === "object") {
    const metin = (grup as Record<string, unknown>)[kod];
    if (typeof metin === "string") return metin;
  }
  return m.hata.varsayilan;
}

export function useFormT(): FormMetni {
  return formMetni(useLang());
}
