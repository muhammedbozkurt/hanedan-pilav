# Hanedan Pilav Web Sitesi

hanedanpilav.com için yeni kurumsal site. Proje şu an **tasarım sunumu** aşamasında: müşteri iki tasarım yönü arasından seçim yapacak, seçilen yön tam siteye dönüştürülecek.

## İki tasarım

| | B "Afiş" | E "Esnaf Tabelası" |
|---|---|---|
| Klasör | `_tasarim/sunum/b-afis/` | `_tasarim/sunum/e-esnaf/` |
| His | Cesur, afiş ızgarası, sarı baskın yüzey | Sıcak, otantik, esnaf tabelası dili |
| Hero başlığı | "Günlük 1 ton pilav." | "1998'den beri değişmeyen lezzet." |
| Fontlar | Schibsted Grotesk, IBM Plex Mono | Rokkitt, Plus Jakarta Sans |

İkisi de aynı bölüm yapısını ve aynı bilgileri kullanır, böylece yalnız tasarım karşılaştırılır: header, hero, kimlik bandı, hizmetler, kurumsal hikaye, İstanbul haritası, galeri, bayilik bandı, footer ve WhatsApp düğmesi.

## Yerelde açma

```bash
cd _tasarim/sunum
python3 -m http.server 8765
```

- B: http://127.0.0.1:8765/b-afis/
- E: http://127.0.0.1:8765/e-esnaf/

`index.html` dosyasını çift tıklayarak açmak yerine sunucu kullanın; bazı tarayıcılar `file://` üzerinden font yüklemez.

## GitHub Pages ile yayınlama

1. Repo > Settings > Pages > Source: "Deploy from a branch", Branch: `main`, klasör: `/ (root)`.
2. Birkaç dakika sonra linkler:
   - B: `https://KULLANICI.github.io/REPO/_tasarim/sunum/b-afis/`
   - E: `https://KULLANICI.github.io/REPO/_tasarim/sunum/e-esnaf/`

Notlar:

- Kökteki `.nojekyll` dosyası silinmemeli. O olmadan GitHub Pages, alt çizgiyle başlayan `_tasarim/` klasörünü yayınlamaz.
- Private repoda Pages ücretli GitHub planı gerektirir. Yayınlanan Pages sitesi, linki bilen herkese açıktır.

## Sunumda nasıl çalışır

- **TR / EN:** Header'daki dil seçici tüm metni değiştirir, seçim tarayıcıda hatırlanır. EN metinler çeviri değil, ayrı yazılmış kurumsal metinlerdir.
- **Menü:** Kurumsal, Bayilerimiz, Galeri ve İletişim, anasayfadaki ilgili bölüme kaydırır.
- **Henüz olmayan sayfalar:** Alt sayfaya gidecek düğmeler (Bayilik Başvurusu, Toplu Yemek Teklifi, Tüm Galeri, KVKK vb.) sayfada kalır ve "Bu sayfa, seçilen tasarım yönüyle hazırlanacak." bildirimini gösterir.
- **Gerçek bağlantılar:** Telefon ve WhatsApp bağlantıları çalışır (+90 533 616 37 54).
- **WhatsApp düğmesi:** Her ekran boyutunda sağ altta durur, mobilde yalnız ikon görünür.
- **Önizleme notu:** İlk açılışta bir kez "fotoğraf alanları çekimden sonra doldurulacak" notu çıkar. Kapatılınca o sekmede tekrar görünmez; yeniden görmek için sayfayı yeni sekmede açın.
- **Uyum:** 360 px ile 1440 px arası her genişlikte çalışır. Mobil menü klavyeyle kullanılabilir, sayfa "hareketi azalt" ayarına uyar.

## Teknik yapı

- Her tasarım tek bir `index.html` ile yanındaki `fonts/` ve `img/` klasörlerinden oluşur. Harici CDN, framework veya build adımı yoktur.
- Renkler ve ölçüler dosyanın başındaki `:root` CSS değişkenlerindedir.
- Düzenleme doğrudan `index.html` üzerinde yapılır.

## Bilinen sınırlamalar

- Fotoğraflar henüz yok. Fotoğraf alanları, oran ve çekim notuyla işaretli yer tutuculardır.
- Haritadaki ilçe sınırları, lisansı belirsiz açık kaynak bir veriden (ozanyerli/istanbul-districts-geojson) üretildi. Yalnız sunum içindir; canlı sitede OpenStreetMap (ODbL) verisiyle değiştirilecek.
- Haritada yalnız Sultangazi merkezi işaretlidir ve konumu ilçe merkezidir, adresin tam noktası değildir.
- WhatsApp numarasının telefon numarasıyla aynı olduğu varsayıldı, müşteriyle doğrulanacak.
- Alt sayfalar (Kurumsal, Bayilerimiz, Galeri, İletişim) ve formlar seçimden sonra yapılacak.

## Sonraki adım

Seçilen yön, Astro (statik çıktı) ve React ile TR/EN tam siteye dönüştürülecek ve müşterinin kendi hostingine yüklenecek.

## Klasör yapısı

```
_tasarim/sunum/b-afis/    B tasarımı (index.html, fonts/, img/)
_tasarim/sunum/e-esnaf/   E tasarımı (index.html, fonts/, img/)
.claude/skills/           Tasarım denetim skill'leri (hp-design-taste, hp-web-guidelines, hp-design-reference)
f7a5dff9-...-768x293.png  Mevcut logo (PNG)
```

## Lisanslar

Fontlar SIL Open Font License 1.1 (Fontsource üzerinden). Satır içi ikonlar Phosphor Icons (MIT). WhatsApp glifi Simple Icons (CC0); WhatsApp markası Meta'ya aittir. Skill lisansları ilgili klasörlerdeki LICENSE dosyalarındadır.
