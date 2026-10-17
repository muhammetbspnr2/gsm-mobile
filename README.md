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
