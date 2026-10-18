# GSM Takip sürüm notları

## 2.0.0 — Büyük sürüm
- Personel ve yönetici ekranları için PWA manifesti ve yükleme desteği.
- Çevrimdışı uygulama kabuğu önbelleği; ağ yokken son alınan statik arayüzü açabilme.
- Çevrimiçi/çevrimdışı durum bilgilendirmesi.
- Uygulama simgesi, mobil cihazlarda ana ekrana ekleme ve bağımsız pencere görünümü.
- Sürüm bağlantıları ve GitHub Actions statik kontrolleri güncellendi.
- Önceki özellikler korunur: Firebase kimlik doğrulaması, yönetici/personel yetkilendirmesi, saha/ziyaret işlemleri, envanter talepleri, haberler, tepkiler, yorumlar, raporlar ve denetim kayıtları.

### Bilinen sınır
Çevrimdışı önbellek yalnızca uygulama arayüzünü açmaya yardımcı olur. Firebase üzerinden yeni kayıt oluşturma, güncelleme veya canlı verileri okuma internet bağlantısı gerektirir. Bu sürümde çevrimdışı işlem kuyruğu yoktur.
