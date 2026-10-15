// Türkçe sözlük. Tip kaynağıdır: en.ts bu tipi birebir sağlamak zorundadır.

export const tr = {
  dil: { ad: "Türkçe", kisa: "TR", ogLocale: "tr_TR" },
  genel: {
    atla: "İçeriğe geç",
    logoAlt: "Hanedan Pilav anasayfa",
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
    telif: (yil: number) => `© 1998-${yil} Hanedan Pilav`,
  },
  gorsel: {
    alan: "Fotoğraf alanı",
    foto: "Fotoğraf",
  },
  sayfalar: {
    anasayfa: {
      meta: {
        baslik: "Hanedan Pilav · 1998’den beri değişmeyen lezzet",
        aciklama:
          "Hanedan Pilav: 1998’den beri değişmeyen lezzet. Günlük 1 ton üretim kapasitesiyle bayilik ve toplu yemek hizmeti; merkezimiz Sultangazi, İstanbul.",
      },
      baslikBas: "1998’den beri",
      baslikSon: "değişmeyen lezzet.",
      giris:
        "Şubede tabak tabak, organizasyonda kazan kazan. Günlük 1\u00a0ton üretim kapasitesiyle bayilerimize ve kurumsal firmalara hizmet veriyoruz.",
      bayilerEylem: "En Yakın Bayiyi Bul",
    },
    kurumsal: {
      meta: {
        baslik: "Kurumsal · Hanedan Pilav",
        aciklama: "Hanedan Pilav’ın hikâyesi, üretim anlayışı ve ilkeleri: lezzet, hijyen ve süreklilik.",
      },
      etiket: "Kurumsal",
      baslik: "Geleneksel lezzet, modern üretim.",
      giris: "Hanedan Pilav, 1998’deki kuruluşundan bu yana gıda sektöründe köklü bir güven markası haline geldi.",
    },
    bayilerimiz: {
      meta: {
        baslik: "Bayilerimiz · Hanedan Pilav",
        aciklama:
          "Hanedan Pilav şubeleri ve bayilik başvurusu. Size en yakın şubeyi bulun ya da kendi Hanedan Pilav şubenizi açmak için bize ulaşın.",
      },
      etiket: "Bayilerimiz",
      baslik: "Bayilerimizi bulun.",
      giris: "Size en yakın Hanedan Pilav şubesini bulun. Merkezimiz İstanbul Sultangazi’de.",
      listeBaslik: "Şubeler",
      bayilikEtiket: "Franchise",
      bayilikBaslik: "Hanedan Pilav bayisi olun.",
      bayilikGiris: "Kendi Hanedan Pilav şubenizi açmak için bizimle telefon ya da WhatsApp üzerinden iletişime geçin.",
      ara: "Hemen Arayın",
    },
    bayiDetay: {
      meta: {
        baslik: (ad: string) => `${ad} · Hanedan Pilav`,
        aciklama: (ad: string, adres: string) => `Hanedan Pilav ${ad}: ${adres}. Adres, telefon ve çalışma saatleri.`,
      },
      etiket: { merkez: "Merkez", sube: "Şube" },
      geri: "Tüm bayiler",
      adres: "Adres",
      telefon: "Telefon",
    },
    galeri: {
      meta: {
        baslik: "Galeri · Hanedan Pilav",
        aciklama: "Hanedan Pilav galerisi: üretim mutfağı, kazan başı, organizasyon servisi ve tabakta pilav.",
      },
      etiket: "Galeri",
      baslik: "Kazandan tabağa.",
      giris: "Kazan başından servis masasına, Hanedan Pilav mutfağından kareler.",
    },
    iletisim: {
      meta: {
        baslik: "İletişim · Hanedan Pilav",
        aciklama: "Hanedan Pilav iletişim bilgileri: telefon, WhatsApp ve Sultangazi’deki merkez adresimiz.",
      },
      etiket: "İletişim",
      baslik: "Bize ulaşın.",
      giris: (saat: string) =>
        `Sorularınız, bayilik ve toplu yemek talepleriniz için telefon ya da WhatsApp üzerinden bize ulaşabilirsiniz. ${saat}.`,
    },
    kvkk: {
      meta: {
        baslik: "KVKK Aydınlatma Metni · Hanedan Pilav",
        aciklama: "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında Hanedan Pilav aydınlatma metni.",
      },
      etiket: "Yasal",
      baslik: "KVKK Aydınlatma Metni",
      giris:
        "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında, kişisel verilerinizin hangi amaçla ve nasıl işlendiğini bu metinde açıklıyoruz.",
    },
    cerez: {
      meta: {
        baslik: "Çerez Politikası · Hanedan Pilav",
        aciklama: "Hanedan Pilav web sitesi çerez kullanmaz; analitik veya üçüncü taraf takip aracı barındırmaz.",
      },
      etiket: "Yasal",
      baslik: "Çerez Politikası",
      giris: "Bu site çerez kullanmaz; analitik, reklam veya üçüncü taraf takip aracı barındırmaz.",
    },
    bulunamadi: {
      meta: {
        baslik: "Sayfa bulunamadı · Hanedan Pilav",
        aciklama: "Aradığınız sayfa bulunamadı.",
      },
      etiket: "404",
      baslik: "Sayfa bulunamadı.",
      giris: "Aradığınız sayfa taşınmış ya da kaldırılmış olabilir. Anasayfadan devam edebilirsiniz.",
      eylem: "Anasayfaya Dön",
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
