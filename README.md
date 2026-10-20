# GSM Takip — GitHub Pages
Personel: https://muhammetbspnr2.github.io/gsm-mobile/  
Yönetici: https://muhammetbspnr2.github.io/gsm-mobile/admin.html

## Firebase kurulumu
1. Firebase Console'da ilgili projeyi açın ve Authentication > Sign-in method altında Email/Password girişini etkinleştirin.
2. Project settings > Your apps içinden Web App yapılandırmasını alın ve firebase-config.js dosyasındaki tüm BURAYA_ alanlarını değiştirin. Veritabanı adresi önceden girilmiştir.
3. Realtime Database > Rules bölümünde database.rules.json içeriğini yayınlayın.
4. Personel ekranından kendi yönetici hesabınızı kaydedin. Firebase Authentication > Users içinden UID'yi kopyalayın. Realtime Database'de /admins/UID yoluna boolean true yazın.
5. Authentication authorized domains listesinde muhammetbspnr2.github.io bulunduğunu doğrulayın.
6. Kayıt, onay, giriş ve saha kaydını test edin.

## Güvenlik
- Service account private key dosyası GitHub'a yüklenmemelidir.
- Sabit admin/admin parolası kullanılmaz; yönetici yetkisi /admins/UID üzerinden kontrol edilir.
- Personel e-posta ile giriş yapar; GSM kodu profil bilgisi olarak üretilir.
- GPS için HTTPS ve tarayıcı izni gerekir. İl/ilçe otomatik coğrafi kodlama bu sürümde yoktur.
- Altı aylık şifre yenileme uyarısı istemci tarafındadır; katı uygulama için güvenilir sunucu mantığı gerekir.


## Sürüm 2.0.0 — Büyük güncelleme
- Personel ve yönetici panelleri yüklenebilir web uygulaması (PWA) olarak yapılandırıldı.
- Uygulama kabuğu önbelleğe alınır; internet yokken arayüz yeniden açılabilir. Firebase üzerinden canlı kayıt işlemleri için bağlantı gerekir.
- Çevrimdışı/çevrimiçi durum bilgilendirmesi ve desteklenen tarayıcılarda uygulama yükleme istemi eklendi.
- Sürüm numarası, önbellek stratejisi ve statik doğrulama kontrolleri birlikte güncellendi.

Firebase Realtime Database kuralları bu statik sürümle otomatik yayınlanmaz; bu sürüm kuralları değiştirmez.


## Sürüm 2.3.0 — Profesyonelleştirme ve kalite temeli
- Personel ve yönetici ekranlarının statik varlık sürüm işaretleri, PWA bildirimi ve Service Worker önbelleği aynı sürüme hizalandı.
- CSV içe aktarmada Saha No sayısal doğrulamasındaki çift kaçış hatası düzeltildi; önizleme ve aktarım doğrulaması aynı kurala göre çalışır.
- JavaScript sözdizimi, sürüm uyumu, temel HTML bağlantıları ve kritik içe aktarma kuralları için otomatik kalite kontrolü eklendi.
- Gerçek Firebase/telefon uçtan uca testleri otomatik statik kontrollerden ayrı tutulur; bunların sonucu canlı ortamda ayrıca doğrulanmalıdır.
