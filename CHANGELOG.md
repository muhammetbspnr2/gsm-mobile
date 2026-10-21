# GSM Mobile sürüm notları

## 2.7.3 — CSS baştan yazıldı
- Eski, üst üste eklenmiş stil blokları tamamen kaldırılarak tek ve tutarlı kırmızı-beyaz tasarım sistemi oluşturuldu.
- Giriş/kayıt ekranı, personel paneli, yönetici gezinmesi, tablolar, saha detay pencereleri, haberler, iletişim, harita ve içe aktarma alanları yeniden stillendirildi.
- Mobil, tablet ve masaüstü kırılımları yeniden tanımlandı; CSS ve Service Worker önbelleği sürümü yükseltildi.
- Mevcut HTML kimlikleri, uygulama mantığı, Firebase ve CSV/KML/KMZ akışları korunur.

## 2.7.2 — Kırmızı-beyaz tasarım ve önbellek tutarlılığı
- Personel ve yönetici panellerinde ortak kırmızı-beyaz kurumsal tasarım sistemi; daha tutarlı formlar, kartlar, tablolar, gezinme ve mobil etkileşim durumları.
- Personel ve yönetici varlıkları, PWA etiketi ve Service Worker önbelleği 2.7.2 sürümünde hizalandı.
- Mevcut Firebase iş akışları ve CSV/KML/KMZ aktarım kuralları korunur.

## 2.0.13 — Bildirim izin hatası açıklaması
- Bildirim gönderimi tüm alıcılarda PERMISSION_DENIED ile başarısız olursa hata mesajı, canlı Firebase kurallarının yayımlanmasını açıkça belirtir.
- Alıcı bazlı hata kodları görünür; yetki hatası ile diğer gönderim hataları ayrıştırılır.
- Uygulama ve PWA önbellek sürümü 2.0.13 olarak eşitlendi.

## 2.0.12 — Kısmi aktarım güvenliği
- Kısmi içe aktarımdan sonra yalnızca başarıyla eklenen satırlar önizlemeden kaldırılır.
- Aynı Saha ID'ye sahip aktarılmayan satırlar gizlenmez; kullanıcı hatalı satırları görebilir ve düzeltebilir.
- Sürüm ve önbellek bağlantıları 2.0.12 ile eşitlendi.

## 2.0.11 — Aktarım doğrulaması ve önbellek tutarlılığı
- CSV/KML/KMZ saha aktarımında 5 karakterli benzersiz Saha ID doğrulaması korunur.
- Dolu Saha No alanları yalnızca rakamlardan oluşur; mevcut kayıtlarda veya aynı aktarım dosyasında tekrar eden numaralar aktarılmaz. Saha No boş bırakılabilir.
- Aktarım önizlemesi hata nedenini gösterir; aktarım öncesinde Firebase'deki güncel saha kayıtları tekrar kontrol edilir.
- Personel/yönetici paneli ve PWA önbellek sürümleri eşitlendi; HTML varlık bağlantıları güncellendi.
- CI, `site-import.js` JavaScript sözdizimini de doğrular.

## 2.0.0 — Büyük sürüm
- Personel ve yönetici ekranları için PWA manifesti ve yükleme desteği.
- Çevrimdışı uygulama kabuğu önbelleği; ağ yokken son alınan statik arayüzü açabilme.
- Çevrimiçi/çevrimdışı durum bilgilendirmesi.
- Uygulama simgesi, mobil cihazlarda ana ekrana ekleme ve bağımsız pencere görünümü.
- Sürüm bağlantıları ve GitHub Actions statik kontrolleri güncellendi.
- Önceki özellikler korunur: Firebase kimlik doğrulaması, yönetici/personel yetkilendirmesi, saha/ziyaret işlemleri, envanter talepleri, haberler, tepkiler, yorumlar, raporlar ve denetim kayıtları.

### Bilinen sınır
Çevrimdışı önbellek yalnızca uygulama arayüzünü açmaya yardımcı olur. Firebase üzerinden yeni kayıt oluşturma, güncelleme veya canlı verileri okuma internet bağlantısı gerektirir. Bu sürümde çevrimdışı işlem kuyruğu yoktur.
