// KVKK aydınlatma metni ve çerez politikası metinleri (TR/EN). İki dil aynı `YasalSozluk` tipini sağlar; bölüm anahtarları ortaktır.
// Künye ve süreç bilgileri metne `{ alan }` ile girer: değer `bilgiler.ts`ten okunur, bilinmiyorsa "[...]" yer tutucusu çizilir.
import type { YasalAlan } from "~/components/yasal/bilgiler.ts";
import type { Dil, SayfaAnahtari } from "~/lib/rotalar.ts";
import { useLang } from "./index.ts";

export type Parca =
  | string
  | { readonly kalin: string }
  | { readonly kod: string }
  | { readonly alan: YasalAlan }
  | { readonly sabit: "adres" | "telefon" }
  | { readonly sayfa: SayfaAnahtari; readonly metin: string };
export type Satir = readonly Parca[];
export type Tanim = { readonly etiket: string; readonly deger: Satir };
export type Blok =
  | { readonly p: Satir }
  | { readonly not: Satir }
  | { readonly liste: readonly Satir[] }
  | { readonly tanimlar: readonly Tanim[]; readonly baslik?: string };
export type YasalBolum = { readonly id: string; readonly baslik: string; readonly bloklar: readonly Blok[] };

export const KVKK_BOLUMLERI = ["sorumlu", "veriler", "amaclar", "yontem", "aktarim", "saklama", "haklar", "basvuru"] as const;
export const CEREZ_BOLUMLERI = ["ozet", "tanim", "kullanilmayanlar", "depolama", "baglantilar", "yonetim", "sorular"] as const;
export type KvkkBolumu = (typeof KVKK_BOLUMLERI)[number];
export type CerezBolumu = (typeof CEREZ_BOLUMLERI)[number];

export type YasalSayfaMetni<K extends string> = {
  readonly etiket: string;
  readonly baslik: string;
  readonly giris: string;
  readonly bolumler: Readonly<Record<K, YasalBolum>>;
};

export type YasalSozluk = {
  readonly ortak: {
    readonly icindekiler: string;
    readonly sonGuncelleme: string;
    readonly tarihYerel: string;
    readonly eksikNotu: string;
    readonly eksik: Readonly<Record<YasalAlan, string>>;
  };
  readonly kvkk: YasalSayfaMetni<KvkkBolumu>;
  readonly cerez: YasalSayfaMetni<CerezBolumu>;
};

const MD = "md. ";
const ART = "Article ";

export const yasalTr: YasalSozluk = {
  ortak: {
    icindekiler: "İçindekiler",
    sonGuncelleme: "Son güncelleme:",
    tarihYerel: "tr-TR",
    eksikNotu:
      "Bu metin yayına hazırlanıyor: köşeli parantez içinde işaretli bilgiler henüz eklenmedi ve yayından önce tamamlanacak.",
    eksik: {
      unvan: "Ticari unvan",
      mersisNo: "MERSİS numarası",
      vergiDairesi: "Vergi dairesi",
      vergiNo: "Vergi numarası",
      eposta: "Kurumsal e-posta adresi",
      kep: "KEP adresi",
      barindirma: "Barındırma sağlayıcısı ve ülkesi",
      epostaSaglayici: "E-posta sağlayıcısı ve ülkesi",
      yurtDisiAktarim: `Yurt dışına aktarım durumu ve KVKK ${MD}9 dayanağı`,
      saklamaSuresi: "Saklama süresi",
      ipSuresi: "IP adresinin tutulma süresi",
      sunucuKayitlari: "Sunucu erişim kayıtları ve saklama süresi",
    },
  },
  kvkk: {
    etiket: "Yasal",
    baslik: "KVKK Aydınlatma Metni",
    giris:
      "6698 sayılı Kişisel Verilerin Korunması Kanunu’nun (KVKK) 10. maddesi ve Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ uyarınca, web sitemiz aracılığıyla ilettiğiniz kişisel verilerin nasıl işlendiğini bu metinde açıklıyoruz.",
    bolumler: {
      sorumlu: {
        id: "veri-sorumlusu",
        baslik: "Veri sorumlusu",
        bloklar: [
          {
            p: [
              "Kişisel verileriniz, aşağıda unvanı ve iletişim bilgileri yer alan veri sorumlusu tarafından işlenir. Bu metinde geçen “Hanedan Pilav” ve “biz” ifadeleri bu veri sorumlusunu anlatır.",
            ],
          },
          {
            tanimlar: [
              { etiket: "Ticari unvan", deger: [{ alan: "unvan" }] },
              { etiket: "MERSİS numarası", deger: [{ alan: "mersisNo" }] },
              { etiket: "Vergi dairesi ve numarası", deger: [{ alan: "vergiDairesi" }, " / ", { alan: "vergiNo" }] },
              { etiket: "Adres", deger: [{ sabit: "adres" }] },
              { etiket: "E-posta", deger: [{ alan: "eposta" }] },
              { etiket: "KEP adresi", deger: [{ alan: "kep" }] },
              { etiket: "Telefon", deger: [{ sabit: "telefon" }] },
            ],
          },
          { p: ["Bu metin, yalnız bu web sitesi aracılığıyla işlenen kişisel verileri kapsar."] },
        ],
      },
      veriler: {
        id: "islenen-veriler",
        baslik: "İşlenen kişisel veriler",
        bloklar: [
          {
            p: [
              "Web sitemizde üyelik, kullanıcı hesabı veya çevrim içi satış yoktur. Bize ilettiğiniz kişisel veriler, aşağıdaki iki formdan birini doldurup gönderdiğinizde paylaştığınız bilgilerle sınırlıdır.",
            ],
          },
          {
            baslik: "İletişim formu",
            tanimlar: [
              { etiket: "Kimlik", deger: ["Ad soyad"] },
              { etiket: "İletişim", deger: ["Telefon numarası, e-posta adresi"] },
              { etiket: "Mesleki bilgi", deger: ["Firma adı"] },
              { etiket: "Talep bilgisi", deger: ["Seçtiğiniz konu ve mesajınızın içeriği"] },
            ],
          },
          {
            baslik: "Bayilik başvuru formu",
            tanimlar: [
              { etiket: "Kimlik", deger: ["Ad soyad"] },
              { etiket: "İletişim", deger: ["Telefon numarası, e-posta adresi"] },
              {
                etiket: "Başvuru bilgisi",
                deger: [
                  "Seçtiğiniz ilçe, mevcut bir işletmenizin olup olmadığı, düşündüğünüz lokasyon ve mesajınızın içeriği",
                ],
              },
            ],
          },
          {
            baslik: "Teknik veriler",
            tanimlar: [
              {
                etiket: "İşlem güvenliği",
                deger: [
                  "Form gönderdiğinizde IP adresiniz, formların kötüye kullanılmasını önlemek için hız sınırlamasında geçici olarak kullanılır. Tutulma süresi: ",
                  { alan: "ipSuresi" },
                ],
              },
              { etiket: "Sunucu kayıtları", deger: [{ alan: "sunucuKayitlari" }] },
            ],
          },
          {
            not: [
              "Mesaj alanlarına sağlık, din veya etnik köken gibi özel nitelikli kişisel verilerinizi yazmamanızı rica ederiz. Talebinizi yanıtlamak için bu bilgilere ihtiyacımız yoktur.",
            ],
          },
        ],
      },
      amaclar: {
        id: "amaclar-ve-hukuki-sebepler",
        baslik: "İşleme amaçları ve hukuki sebepler",
        bloklar: [
          {
            p: [
              `Kişisel verilerinizi yalnız aşağıdaki amaçlarla ve her amacın yanında belirtilen, KVKK ${MD}5/2’deki hukuki sebebe dayanarak işleriz.`,
            ],
          },
          {
            baslik: "İletişim talebinizi yanıtlamak",
            tanimlar: [
              { etiket: "İlgili veriler", deger: ["İletişim formundaki bilgiler"] },
              {
                etiket: "Hukuki sebep",
                deger: [
                  `Talebiniz bir sipariş, toplu yemek veya hizmet teklifiyle ilgiliyse, bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması (${MD}5/2-c). Diğer soru ve önerilerinizde, temel hak ve özgürlüklerinize zarar vermemek kaydıyla meşru menfaatimiz (${MD}5/2-f).`,
                ],
              },
            ],
          },
          {
            baslik: "Bayilik başvurunuzu değerlendirmek ve sizinle görüşmek",
            tanimlar: [
              { etiket: "İlgili veriler", deger: ["Bayilik başvuru formundaki bilgiler"] },
              {
                etiket: "Hukuki sebep",
                deger: [`Bayilik sözleşmesinin kurulmasıyla doğrudan doğruya ilgili olması (${MD}5/2-c).`],
              },
            ],
          },
          {
            baslik: "Formların kötüye kullanılmasını önlemek ve bilgi güvenliğini sağlamak",
            tanimlar: [
              { etiket: "İlgili veriler", deger: ["IP adresi"] },
              {
                etiket: "Hukuki sebep",
                deger: [`Temel hak ve özgürlüklerinize zarar vermemek kaydıyla meşru menfaatimiz (${MD}5/2-f).`],
              },
            ],
          },
          {
            baslik: "Hukuki yükümlülüklerimizi yerine getirmek",
            tanimlar: [
              { etiket: "İlgili veriler", deger: ["Yetkili merciin talebiyle ilgili veriler"] },
              {
                etiket: "Hukuki sebep",
                deger: [
                  `Kanunen yetkili kamu kurum ve kuruluşlarının usulüne uygun bilgi taleplerini karşılamak için hukuki yükümlülüğümüzü yerine getirmemizin zorunlu olması (${MD}5/2-ç).`,
                ],
              },
            ],
          },
          {
            p: [
              `Bu amaçların hiçbiri için açık rızanıza başvurmayız; her biri KVKK ${MD}5/2’de sayılan ve açık rıza gerektirmeyen bir hukuki sebebe dayanır.`,
            ],
          },
        ],
      },
      yontem: {
        id: "toplama-yontemi",
        baslik: "Toplama yöntemi",
        bloklar: [
          {
            p: [
              "Kişisel verileriniz, web sitemizdeki formları doldurup göndermenizle elektronik ortamda ve otomatik yolla toplanır.",
            ],
          },
          {
            p: [
              "Formlar, sitemizin kendi sunucusundaki bir betik tarafından işlenir. Gönderdiğiniz bilgiler bir veritabanına kaydedilmez; e-posta olarak kurumsal e-posta adresimize iletilir. IP adresiniz, gönderim sırasında sunucu tarafından otomatik olarak alınır.",
            ],
          },
        ],
      },
      aktarim: {
        id: "aktarim",
        baslik: "Kişisel verilerin aktarılması",
        bloklar: [
          {
            p: [
              `Kişisel verilerinizi KVKK ${MD}8 ve ${MD}9’a uygun olarak, yukarıdaki amaçlarla sınırlı şekilde yalnız şu alıcılarla paylaşırız:`,
            ],
          },
          {
            tanimlar: [
              {
                etiket: "Barındırma hizmeti sağlayıcısı",
                deger: ["Web sitesinin ve form betiğinin çalıştığı sunucuyu sağlar: ", { alan: "barindirma" }],
              },
              {
                etiket: "E-posta hizmeti sağlayıcısı",
                deger: ["Form içeriğinin iletildiği kurumsal e-posta hizmetini sağlar: ", { alan: "epostaSaglayici" }],
              },
              {
                etiket: "Yetkili kamu kurum ve kuruluşları",
                deger: ["Yalnız kanunen yetkili bir merciin usulüne uygun talebi halinde ve talebin kapsamıyla sınırlı olarak."],
              },
            ],
          },
          {
            p: [
              "Hizmet sağlayıcılarıyla paylaşım, sitenin çalışması ve formların size yanıt verecek kişilere ulaşması için zorunludur ve yukarıda belirtilen hukuki sebeplere dayanır.",
            ],
          },
          { p: [{ kalin: "Yurt dışına aktarım: " }, { alan: "yurtDisiAktarim" }] },
        ],
      },
      saklama: {
        id: "saklama-suresi",
        baslik: "Saklama süresi",
        bloklar: [
          {
            p: [
              "Kişisel verilerinizi, işlendikleri amaç için gereken süre ve ilgili mevzuatta öngörülen süreler boyunca saklarız. Form e-postaları için bu süre: ",
              { alan: "saklamaSuresi" },
            ],
          },
          {
            p: [
              `Süre dolduğunda veya işleme sebebi ortadan kalktığında kişisel verileriniz, KVKK ${MD}7 ve Kişisel Verilerin Silinmesi, Yok Edilmesi veya Anonim Hale Getirilmesi Hakkında Yönetmelik uyarınca silinir, yok edilir veya anonim hale getirilir.`,
            ],
          },
        ],
      },
      haklar: {
        id: "haklariniz",
        baslik: "Haklarınız",
        bloklar: [
          { p: [`KVKK ${MD}11 uyarınca veri sorumlusuna başvurarak aşağıdaki haklarınızı kullanabilirsiniz:`] },
          {
            liste: [
              ["Kişisel verilerinizin işlenip işlenmediğini öğrenme"],
              ["Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme"],
              ["Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme"],
              ["Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme"],
              ["Kişisel verileriniz eksik veya yanlış işlenmişse bunların düzeltilmesini isteme"],
              [`KVKK ${MD}7’de öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme`],
              ["Düzeltme, silme veya yok etme işlemlerinin, kişisel verilerinizin aktarıldığı üçüncü kişilere bildirilmesini isteme"],
              [
                "İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme",
              ],
              ["Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme"],
            ],
          },
        ],
      },
      basvuru: {
        id: "basvuru",
        baslik: "Başvuru yolu",
        bloklar: [
          {
            p: [
              "Haklarınıza ilişkin taleplerinizi, Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ uyarınca aşağıdaki yollardan biriyle bize iletebilirsiniz:",
            ],
          },
          {
            tanimlar: [
              {
                etiket: "Yazılı olarak",
                deger: ["Islak imzalı dilekçenizi elden teslim ederek veya posta yoluyla göndererek: ", { sabit: "adres" }],
              },
              {
                etiket: "Kayıtlı elektronik posta (KEP)",
                deger: ["KEP adresinizden şu adrese göndererek: ", { alan: "kep" }],
              },
              {
                etiket: "E-posta",
                deger: [
                  "Güvenli elektronik imza veya mobil imza ile imzalayarak ya da daha önce bize bildirdiğiniz ve kayıtlarımızda bulunan e-posta adresinizden şu adrese göndererek: ",
                  { alan: "eposta" },
                ],
              },
            ],
          },
          { p: ["Başvurunuzda şu bilgilerin bulunması zorunludur:"] },
          {
            liste: [
              ["Adınız, soyadınız ve başvuru yazılıysa imzanız"],
              [
                "Türkiye Cumhuriyeti vatandaşıysanız T.C. kimlik numaranız; yabancıysanız uyruğunuz, pasaport numaranız veya varsa kimlik numaranız",
              ],
              ["Tebligata esas yerleşim yeri veya iş yeri adresiniz"],
              ["Varsa bildirime esas e-posta adresiniz, telefon ve faks numaranız"],
              ["Talebinizin konusu"],
            ],
          },
          { p: ["Talebinizle ilgili bilgi ve belgeleri başvurunuza ekleyebilirsiniz."] },
          {
            p: [
              "Başvurunuzu, talebin niteliğine göre en kısa sürede ve en geç otuz gün içinde ücretsiz olarak sonuçlandırırız. İşlemin ayrıca bir maliyet gerektirmesi halinde, Kişisel Verileri Koruma Kurulunca belirlenen tarifedeki ücret alınabilir.",
            ],
          },
          {
            p: [
              `Başvurunuzun reddedilmesi, verilen cevabı yetersiz bulmanız veya süresinde cevap verilmemesi hallerinde; cevabı öğrendiğiniz tarihten itibaren otuz gün ve her halde başvuru tarihinden itibaren altmış gün içinde Kişisel Verileri Koruma Kuruluna şikâyette bulunabilirsiniz (KVKK ${MD}14).`,
            ],
          },
        ],
      },
    },
  },
  cerez: {
    etiket: "Yasal",
    baslik: "Çerez Politikası",
    giris:
      "Bu sayfa, web sitemizi ziyaret ettiğinizde tarayıcınızda ne saklandığını ve ne saklanmadığını açıklar. Kısaca: bu site çerez kullanmaz.",
    bolumler: {
      ozet: {
        id: "ozet",
        baslik: "Özet",
        bloklar: [
          {
            p: [
              "Bu site, ziyaretiniz sırasında tarayıcınıza çerez yazmaz. Analitik, reklam veya sosyal medya takip aracı da kullanmaz.",
            ],
          },
          {
            p: [
              "Tarayıcınızda oluşan tek kayıt, sayfalar arasında geri ve ileri giderken kaldığınız yeri hatırlayan bir oturum depolaması kaydıdır. Bu kayıt sunucumuza gönderilmez ve tarayıcı sekmesini kapattığınızda tarayıcınız tarafından silinir.",
            ],
          },
        ],
      },
      tanim: {
        id: "cerez-nedir",
        baslik: "Çerez nedir?",
        bloklar: [
          {
            p: [
              "Çerezler, ziyaret ettiğiniz bir web sitesinin tarayıcınıza kaydettiği ve sonraki isteklerde o siteye geri gönderilen küçük metin dosyalarıdır. Oturum açık tutma, tercih hatırlama, ziyaretçi sayma veya reklam hedefleme gibi amaçlarla kullanılabilir.",
            ],
          },
          {
            p: [
              "Tarayıcıların sunduğu yerel depolama (localStorage) ve oturum depolaması (sessionStorage) da benzer şekilde cihazınızda veri tutar; çerezlerden farkı, bu verilerin sunucuya kendiliğinden gönderilmemesidir.",
            ],
          },
        ],
      },
      kullanilmayanlar: {
        id: "kullanmadiklarimiz",
        baslik: "Bu sitede neler yok?",
        bloklar: [
          {
            liste: [
              [{ kalin: "Çerez: " }, "Sitemiz tarayıcınıza hiçbir çerez yazmaz."],
              [{ kalin: "Analitik ve istatistik: " }, "Ziyaretçi sayan veya davranış izleyen bir araç kullanmayız."],
              [{ kalin: "Reklam: " }, "Reklam, yeniden hedefleme veya dönüşüm takibi yoktur."],
              [
                { kalin: "Üçüncü taraf içerik: " },
                "Sosyal medya eklentisi, gömülü video veya gömülü harita yoktur. Yazı tipleri dahil tüm dosyalar sitenin kendi sunucusundan yüklenir.",
              ],
              [
                { kalin: "Harita: " },
                "Sitedeki harita, yayından önce OpenStreetMap verisinden hazırlanmış bir görseldir. Sayfayı açtığınızda OpenStreetMap’e veya başka bir harita hizmetine istek gönderilmez.",
              ],
            ],
          },
        ],
      },
      depolama: {
        id: "tarayici-depolamasi",
        baslik: "Tarayıcı depolaması",
        bloklar: [
          {
            p: [
              "Sitenin sayfalar arası geçişini yöneten React Router yazılım kütüphanesi, oturum depolamasına aşağıdaki tek kaydı yazar:",
            ],
          },
          {
            tanimlar: [
              { etiket: "Ad", deger: [{ kod: "react-router-scroll-positions" }] },
              { etiket: "Tür", deger: ["Oturum depolaması (sessionStorage), birinci taraf"] },
              {
                etiket: "Amaç",
                deger: ["Tarayıcınızın geri ve ileri düğmeleriyle gezinirken her sayfada kaldığınız kaydırma konumuna dönmenizi sağlar."],
              },
              {
                etiket: "İçerik",
                deger: [
                  "Her gezinme adımı için rastgele üretilen bir anahtar ve o sayfadaki dikey kaydırma konumu. Sizi tanımlayan bir bilgi içermez.",
                ],
              },
              { etiket: "Süre", deger: ["Tarayıcı oturumu boyunca. Sekmeyi veya pencereyi kapattığınızda tarayıcınız siler."] },
              { etiket: "Paylaşım", deger: ["Sunucumuza veya üçüncü kişilere gönderilmez; yalnız tarayıcınızda kalır."] },
            ],
          },
        ],
      },
      baglantilar: {
        id: "dis-baglantilar",
        baslik: "Dış bağlantılar",
        bloklar: [
          {
            p: [
              "Sitede WhatsApp sohbeti başlatma ve telefonla arama gibi dış hizmetlere giden bağlantılar bulunur. Bu bağlantılardan birine tıkladığınızda ilgili hizmetin sitesine veya uygulamasına geçersiniz; orada o hizmetin (örneğin WhatsApp’ın) kendi çerez ve gizlilik politikaları geçerlidir.",
            ],
          },
          { p: ["Bu bağlantılara tıklamadığınız sürece sitemizden bu hizmetlere herhangi bir istek gönderilmez."] },
        ],
      },
      yonetim: {
        id: "tercihleriniz",
        baslik: "Tercihleriniz",
        bloklar: [
          {
            p: [
              "Sitede çerez bulunmadığı için bu sayfada ayarlayabileceğiniz bir çerez tercihi de yoktur.",
            ],
          },
          {
            p: [
              "Oturum depolaması kaydını tarayıcınızın site verileri ayarlarından dilediğiniz zaman silebilir veya engelleyebilirsiniz. Bu durumda site çalışmaya devam eder; yalnız geri döndüğünüz sayfalarda kaydırma konumu hatırlanmaz.",
            ],
          },
        ],
      },
      sorular: {
        id: "sorular",
        baslik: "Sorularınız",
        bloklar: [
          {
            p: [
              "Formlar aracılığıyla işlenen kişisel veriler ve haklarınız için ",
              { sayfa: "kvkk", metin: "KVKK Aydınlatma Metni" },
              "’ne bakabilirsiniz. Diğer sorularınız için ",
              { sayfa: "iletisim", metin: "İletişim" },
              " sayfasındaki yollardan bize ulaşabilirsiniz.",
            ],
          },
          {
            p: [
              "Bu politika değişirse güncel hali bu sayfada yayımlanır; son güncelleme tarihi sayfanın başında yer alır.",
            ],
          },
        ],
      },
    },
  },
};

export const yasalEn: YasalSozluk = {
  ortak: {
    icindekiler: "Contents",
    sonGuncelleme: "Last updated:",
    tarihYerel: "en-US",
    eksikNotu:
      "This notice is being finalized: details marked in square brackets have not been added yet and will be completed before launch.",
    eksik: {
      unvan: "Legal company name",
      mersisNo: "MERSIS number",
      vergiDairesi: "Tax office",
      vergiNo: "Tax ID number",
      eposta: "Company email address",
      kep: "KEP address",
      barindirma: "Hosting provider and country",
      epostaSaglayici: "Email provider and country",
      yurtDisiAktarim: `Transfers abroad and KVKK ${ART}9 basis`,
      saklamaSuresi: "Retention period",
      ipSuresi: "IP address retention period",
      sunucuKayitlari: "Server access logs and retention period",
    },
  },
  kvkk: {
    etiket: "Legal",
    baslik: "Privacy Notice",
    giris:
      "This notice is provided in accordance with Turkish Law No. 6698 on the Protection of Personal Data (“KVKK”), Article 10, and the Communiqué on Principles and Procedures to Be Followed in Fulfilling the Obligation to Inform. It explains how we process the personal data you share with us through this website.",
    bolumler: {
      sorumlu: {
        id: "data-controller",
        baslik: "Data controller",
        bloklar: [
          {
            p: [
              "Your personal data is processed by the data controller identified below. In this notice, “Hanedan Pilav,” “we,” and “us” refer to this data controller.",
            ],
          },
          {
            tanimlar: [
              { etiket: "Legal name", deger: [{ alan: "unvan" }] },
              { etiket: "MERSIS number", deger: [{ alan: "mersisNo" }] },
              { etiket: "Tax office and number", deger: [{ alan: "vergiDairesi" }, " / ", { alan: "vergiNo" }] },
              { etiket: "Address", deger: [{ sabit: "adres" }] },
              { etiket: "Email", deger: [{ alan: "eposta" }] },
              { etiket: "Registered email (KEP)", deger: [{ alan: "kep" }] },
              { etiket: "Phone", deger: [{ sabit: "telefon" }] },
            ],
          },
          { p: ["This notice covers only personal data processed through this website."] },
        ],
      },
      veriler: {
        id: "data-we-process",
        baslik: "Personal data we process",
        bloklar: [
          {
            p: [
              "This website has no memberships, user accounts, or online sales. The personal data you share with us is limited to the information you submit through one of the two forms below.",
            ],
          },
          {
            baslik: "Contact form",
            tanimlar: [
              { etiket: "Identity", deger: ["Full name"] },
              { etiket: "Contact details", deger: ["Phone number, email address"] },
              { etiket: "Professional details", deger: ["Company name"] },
              { etiket: "Request details", deger: ["The subject you select and the content of your message"] },
            ],
          },
          {
            baslik: "Franchise application form",
            tanimlar: [
              { etiket: "Identity", deger: ["Full name"] },
              { etiket: "Contact details", deger: ["Phone number, email address"] },
              {
                etiket: "Application details",
                deger: [
                  "The district you select, whether you currently run a business, the location you have in mind, and the content of your message",
                ],
              },
            ],
          },
          {
            baslik: "Technical data",
            tanimlar: [
              {
                etiket: "Transaction security",
                deger: [
                  "When you submit a form, your IP address is used temporarily for rate limiting to prevent abuse of the forms. Retention period: ",
                  { alan: "ipSuresi" },
                ],
              },
              { etiket: "Server logs", deger: [{ alan: "sunucuKayitlari" }] },
            ],
          },
          {
            not: [
              "Please do not include special categories of personal data, such as health information, religious beliefs, or ethnic origin, in your messages. We do not need this information to respond to you.",
            ],
          },
        ],
      },
      amaclar: {
        id: "purposes-and-legal-bases",
        baslik: "Purposes and legal bases",
        bloklar: [
          {
            p: [
              `We process your personal data only for the purposes below, each based on the legal ground under ${ART}5(2) of the KVKK listed next to it.`,
            ],
          },
          {
            baslik: "Responding to your inquiry",
            tanimlar: [
              { etiket: "Data involved", deger: ["Information from the contact form"] },
              {
                etiket: "Legal basis",
                deger: [
                  `If your inquiry concerns an order, catering, or a service quote: processing is directly related to the establishment or performance of a contract (${ART}5(2)(c)). For other questions and feedback: our legitimate interests, provided that your fundamental rights and freedoms are not harmed (${ART}5(2)(f)).`,
                ],
              },
            ],
          },
          {
            baslik: "Reviewing your franchise application and following up with you",
            tanimlar: [
              { etiket: "Data involved", deger: ["Information from the franchise application form"] },
              {
                etiket: "Legal basis",
                deger: [`Processing is directly related to the establishment of a franchise agreement (${ART}5(2)(c)).`],
              },
            ],
          },
          {
            baslik: "Preventing form abuse and keeping our systems secure",
            tanimlar: [
              { etiket: "Data involved", deger: ["IP address"] },
              {
                etiket: "Legal basis",
                deger: [`Our legitimate interests, provided that your fundamental rights and freedoms are not harmed (${ART}5(2)(f)).`],
              },
            ],
          },
          {
            baslik: "Meeting our legal obligations",
            tanimlar: [
              { etiket: "Data involved", deger: ["Data relevant to the authority’s request"] },
              {
                etiket: "Legal basis",
                deger: [
                  `Processing is necessary to comply with our legal obligations when a competent public authority makes a lawful request for information (${ART}5(2)(ç)).`,
                ],
              },
            ],
          },
          {
            p: [
              `We do not rely on your explicit consent for any of these purposes. Each one is based on a legal ground under ${ART}5(2) of the KVKK that does not require consent.`,
            ],
          },
        ],
      },
      yontem: {
        id: "how-we-collect",
        baslik: "How we collect your data",
        bloklar: [
          {
            p: [
              "We collect your personal data electronically, by automated means, when you fill out and submit a form on this website.",
            ],
          },
          {
            p: [
              "The forms are handled by a script on this website’s own server. Your submission is not stored in a database; it is forwarded by email to our company email address. Your IP address is collected automatically by the server when you submit a form.",
            ],
          },
        ],
      },
      aktarim: {
        id: "sharing",
        baslik: "Who we share your data with",
        bloklar: [
          {
            p: [
              `In line with ${ART}8 and ${ART}9 of the KVKK, and only for the purposes above, we share your personal data with the following recipients:`,
            ],
          },
          {
            tanimlar: [
              {
                etiket: "Hosting provider",
                deger: ["Operates the server that runs this website and its form script: ", { alan: "barindirma" }],
              },
              {
                etiket: "Email service provider",
                deger: ["Provides the company email service that receives form submissions: ", { alan: "epostaSaglayici" }],
              },
              {
                etiket: "Competent public authorities",
                deger: ["Only when a legally authorized authority makes a valid request, and only to the extent of that request."],
              },
            ],
          },
          {
            p: [
              "Sharing with these service providers is necessary to run this website and to deliver your form submission to the people who will respond, and it relies on the legal bases listed above.",
            ],
          },
          { p: [{ kalin: "Transfers abroad: " }, { alan: "yurtDisiAktarim" }] },
        ],
      },
      saklama: {
        id: "retention",
        baslik: "How long we keep your data",
        bloklar: [
          {
            p: [
              "We keep your personal data for as long as necessary for the purpose for which it is processed and for any period required by applicable law. For form emails, this period is: ",
              { alan: "saklamaSuresi" },
            ],
          },
          {
            p: [
              `When that period ends, or when the reason for processing no longer applies, we delete, destroy, or anonymize your personal data in accordance with ${ART}7 of the KVKK and the Regulation on the Erasure, Destruction or Anonymization of Personal Data.`,
            ],
          },
        ],
      },
      haklar: {
        id: "your-rights",
        baslik: "Your rights",
        bloklar: [
          { p: [`Under ${ART}11 of the KVKK, you have the right to apply to the data controller to:`] },
          {
            liste: [
              ["Find out whether your personal data is being processed"],
              ["Request information about the processing, if your personal data has been processed"],
              ["Learn the purpose of the processing and whether your personal data is used in line with that purpose"],
              ["Know the third parties in Türkiye or abroad to whom your personal data has been transferred"],
              ["Request correction of your personal data if it is incomplete or inaccurate"],
              [`Request deletion or destruction of your personal data under the conditions set out in ${ART}7 of the KVKK`],
              ["Request that any correction, deletion, or destruction be communicated to the third parties to whom your personal data has been transferred"],
              ["Object to an outcome against you that results from analysis of your data exclusively by automated systems"],
              ["Claim compensation for any damage you suffer because your personal data was processed unlawfully"],
            ],
          },
        ],
      },
      basvuru: {
        id: "how-to-apply",
        baslik: "How to submit a request",
        bloklar: [
          {
            p: [
              "Under the Communiqué on the Principles and Procedures for Requests to the Data Controller, you can submit a request about your rights through any of the following channels:",
            ],
          },
          {
            tanimlar: [
              {
                etiket: "In writing",
                deger: ["Deliver a signed letter in person or send it by mail to: ", { sabit: "adres" }],
              },
              {
                etiket: "Registered email (KEP)",
                deger: ["Send it from your own KEP address to: ", { alan: "kep" }],
              },
              {
                etiket: "Email",
                deger: [
                  "Sign it with a secure electronic signature or mobile signature, or send it from an email address you have previously provided to us and that is in our records, to: ",
                  { alan: "eposta" },
                ],
              },
            ],
          },
          { p: ["Your request must include:"] },
          {
            liste: [
              ["Your full name and, for written requests, your signature"],
              [
                "Your Turkish ID number if you are a citizen of Türkiye; otherwise, your nationality and passport number, or your ID number if you have one",
              ],
              ["Your residential or business address for official notifications"],
              ["Your email address, phone number, and fax number for notifications, if any"],
              ["The subject of your request"],
            ],
          },
          { p: ["You may attach any information and documents related to your request."] },
          {
            p: [
              "We will resolve your request free of charge as soon as possible, depending on its nature, and within thirty days at the latest. If handling your request involves an additional cost, we may charge the fee set by the Personal Data Protection Board.",
            ],
          },
          {
            p: [
              `If your request is rejected, you find our response insufficient, or we do not respond in time, you may file a complaint with the Personal Data Protection Board within thirty days of learning of our response, and in any case within sixty days of your request (KVKK ${ART}14).`,
            ],
          },
        ],
      },
    },
  },
  cerez: {
    etiket: "Legal",
    baslik: "Cookie Policy",
    giris:
      "This page explains what is and isn’t stored in your browser when you visit our website. In short: this site does not use cookies.",
    bolumler: {
      ozet: {
        id: "at-a-glance",
        baslik: "At a glance",
        bloklar: [
          {
            p: [
              "This site does not set any cookies in your browser during your visit. It also does not use analytics, advertising, or social media tracking tools.",
            ],
          },
          {
            p: [
              "The only thing stored in your browser is a session storage entry that remembers your scroll position as you move back and forth between pages. It is never sent to our server, and your browser deletes it when you close the tab.",
            ],
          },
        ],
      },
      tanim: {
        id: "what-are-cookies",
        baslik: "What are cookies?",
        bloklar: [
          {
            p: [
              "Cookies are small text files that a website saves in your browser and that are sent back to that website with later requests. They can be used to keep you signed in, remember preferences, count visitors, or target ads.",
            ],
          },
          {
            p: [
              "Browsers also offer local storage (localStorage) and session storage (sessionStorage), which keep data on your device in a similar way. Unlike cookies, this data is not sent to the server automatically.",
            ],
          },
        ],
      },
      kullanilmayanlar: {
        id: "what-we-dont-use",
        baslik: "What this site doesn’t use",
        bloklar: [
          {
            liste: [
              [{ kalin: "Cookies: " }, "This site does not set any cookies in your browser."],
              [{ kalin: "Analytics: " }, "We do not use any tool that counts visitors or tracks behavior."],
              [{ kalin: "Advertising: " }, "There is no advertising, retargeting, or conversion tracking."],
              [
                { kalin: "Third-party content: " },
                "There are no social media plugins, embedded videos, or embedded maps. All files, including fonts, load from this website’s own server.",
              ],
              [
                { kalin: "Map: " },
                "The map on this site is an image prepared from OpenStreetMap data before publication. Opening a page sends no request to OpenStreetMap or any other map service.",
              ],
            ],
          },
        ],
      },
      depolama: {
        id: "browser-storage",
        baslik: "Browser storage",
        bloklar: [
          {
            p: ["React Router, the software library that handles navigation on this site, writes a single entry to session storage:"],
          },
          {
            tanimlar: [
              { etiket: "Name", deger: [{ kod: "react-router-scroll-positions" }] },
              { etiket: "Type", deger: ["Session storage (sessionStorage), first party"] },
              {
                etiket: "Purpose",
                deger: ["Returns you to where you were on each page when you use your browser’s back and forward buttons."],
              },
              {
                etiket: "Contents",
                deger: [
                  "A randomly generated key for each navigation step and the vertical scroll position on that page. It contains nothing that identifies you.",
                ],
              },
              { etiket: "Duration", deger: ["For the browser session. Your browser deletes it when you close the tab or window."] },
              { etiket: "Sharing", deger: ["Never sent to our server or to third parties; it stays in your browser."] },
            ],
          },
        ],
      },
      baglantilar: {
        id: "external-links",
        baslik: "External links",
        bloklar: [
          {
            p: [
              "This site includes links to outside services, such as starting a WhatsApp chat or placing a phone call. When you select one, you leave this site for that service’s website or app, where its own cookie and privacy policies apply (WhatsApp’s, for example).",
            ],
          },
          { p: ["Unless you select one of these links, this site sends no requests to these services."] },
        ],
      },
      yonetim: {
        id: "your-choices",
        baslik: "Your choices",
        bloklar: [
          { p: ["Because this site uses no cookies, there are no cookie settings to adjust on this page."] },
          {
            p: [
              "You can delete or block the session storage entry at any time in your browser’s site data settings. The site will keep working; it just won’t remember your scroll position when you go back to a page.",
            ],
          },
        ],
      },
      sorular: {
        id: "questions",
        baslik: "Questions",
        bloklar: [
          {
            p: [
              "For details on the personal data processed through our forms and your rights, see our ",
              { sayfa: "kvkk", metin: "Privacy Notice" },
              ". For anything else, reach us through the options on our ",
              { sayfa: "iletisim", metin: "Contact" },
              " page.",
            ],
          },
          { p: ["If this policy changes, the updated version will be posted on this page, with the date shown at the top."] },
        ],
      },
    },
  },
};

const SOZLUKLER: Readonly<Record<Dil, YasalSozluk>> = { tr: yasalTr, en: yasalEn };

export function yasalSozluk(dil: Dil): YasalSozluk {
  return SOZLUKLER[dil];
}

export function useYasal(): YasalSozluk {
  return yasalSozluk(useLang());
}
