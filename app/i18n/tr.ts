// Türkçe sözlük. Tip kaynağıdır: en.ts bu tipi birebir sağlamak zorundadır.
// `sayfalar` yalnız kendi sözlüğü olmayan sayfaların metasını tutar; diğer sayfaların metası kendi sözlüklerindedir.
import { KURULUS_YILI } from "./olgular.ts";

export const tr = {
  dil: { ad: "Türkçe", kisa: "TR", ogLocale: "tr_TR" },
  genel: {
    atla: "İçeriğe geç",
    logoAlt: "Hanedan Pilav ana sayfa",
    navAria: "Ana menü",
    dilAria: "Dil",
    secili: "seçili",
    telSr: "Telefon:",
    menu: "Menü",
    kapat: "Kapat",
    menuAria: "Site menüsü",
    yeniSekme: " (yeni sekmede açılır)",
  },
  nav: {
    kurumsal: "Kurumsal",
    bayilerimiz: "Bayilerimiz",
    galeri: "Galeri",
    iletisim: "İletişim",
    bayilik: "Bayilik Başvurusu",
  },
  wa: {
    etiket: "WhatsApp’tan yazın",
    aria: "WhatsApp’tan yazın (yeni sekmede açılır)",
    mesaj: "Merhaba, Hanedan Pilav hakkında bilgi almak istiyorum.",
  },
  saat: {
    etiket: "Çalışma saatleri",
    metin: (acilis: string, kapanis: string) => `Her gün ${acilis}-${kapanis}`,
  },
  alt: {
    slogan: "Lezzet Hanedanlığı",
    cumle: "pilav şubeleri, bayilik ve toplu yemek hizmeti.",
    merkez: "Merkez",
    sayfalar: "Sayfalar",
    iletisim: "İletişim",
    kvkk: "KVKK Aydınlatma Metni",
    cerez: "Çerez Politikası",
    yasal: "Yasal",
    telif: (yil: number) => `© ${KURULUS_YILI}-${yil} Hanedan Pilav`,
  },
  gorsel: {
    alan: "Fotoğraf alanı",
    foto: "Fotoğraf",
  },
  sayfalar: {
    kvkk: {
      meta: {
        baslik: "KVKK Aydınlatma Metni · Hanedan Pilav",
        aciklama: "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında Hanedan Pilav aydınlatma metni.",
      },
    },
    cerez: {
      meta: {
        baslik: "Çerez Politikası · Hanedan Pilav",
        aciklama: "Hanedan Pilav web sitesi çerez kullanmaz; analitik veya üçüncü taraf takip aracı barındırmaz.",
      },
    },
    bulunamadi: {
      meta: {
        baslik: "Sayfa bulunamadı · Hanedan Pilav",
        aciklama: "Aradığınız sayfa bulunamadı.",
      },
      eylem: "Ana Sayfaya Dön",
    },
  },
  hata: {
    metaBaslik: "Hata · Hanedan Pilav",
    etiket: "Hata",
    baslik: "Bir sorun oluştu.",
    giris: "Sayfa yüklenirken beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin.",
  },
};

export type Sozluk = typeof tr;
