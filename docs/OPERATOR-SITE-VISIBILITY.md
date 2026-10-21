# GSM Mobile — Operatöre Göre Saha Görünürlüğü

Durum: Mimari karar / geliştirme dalı. Bu belge canlı uygulamayı, Firebase verilerini veya yayımlanmış kuralları değiştirmez.

## Kesin ürün kuralı

- Operatörler: Turkcell, Vodafone, Türk Telekom.
- Her kullanıcı kendi hesabına atanmış operatör(ler)in saha kataloğunu görür.
- Turkcell'e bağlı personel ve ekip şefleri tüm Turkcell sahalarını görür; Vodafone ve Türk Telekom sahalarını göremez.
- Vodafone'a bağlı personel ve ekip şefleri tüm Vodafone sahalarını görür; Turkcell ve Türk Telekom sahalarını göremez.
- Türk Telekom'a bağlı personel ve ekip şefleri tüm Türk Telekom sahalarını görür; Turkcell ve Vodafone sahalarını göremez.
- Ekip şefinin saha kataloğunu görmesi, diğer ekipleri yönetme yetkisi vermez. Ekip yönetimi yalnızca kendisine atanmış ekiplerle sınırlıdır.
- Merkezi yönetici tüm operatör ve saha kataloglarını yönetebilir.
- Mevcut sahaların hedef ilk ataması: operatör = Turkcell; firma/bölge = Turkcell Ankara Bölge. Canlıya geçmeden önce JSON yedeği üzerinde veya ayrı test ortamında kayıt sayısı, kimlikler ve eşleşmeler doğrulanmalı; belirsiz kayıtlar tahminle değiştirilmemelidir.

## Önemli yetki ayrımı

Saha kataloğunun operatör çapında görünür olması, firma içi operasyon verilerinin de tüm operatör kullanıcılarına açılması anlamına gelmez.

- Saha kataloğu alanları (Saha ID, Saha No, adres, koordinat, operatör, saha türü) aynı operatöre yetkili kullanıcılara görünür.
- Firma/personel kayıtları, ziyaret geçmişi, açık ziyaretler, envanter değişiklik talepleri, mesajlar ve ekip görevleri için ayrı firma/ekip yetkilendirmesi uygulanır.
- Saha kaydı oluşturma, düzenleme ve silme yetkileri görünürlükten ayrıdır; yalnızca yetkili rol ve firma kapsamında verilir.
- Birden fazla operatöre bağlı kullanıcı yalnızca hesabında açıkça atanmış operatörlerin kataloglarını görür.
- Kullanıcının istemciden gönderdiği operatorId/companyId/role değerleri tek başına yetki kanıtı kabul edilmez.

## Güvenli uygulama sırası

1. Çalışan sürümün ve Firebase yedeğinin geri yüklenebilirliğini doğrula; 2.7.5 kaynak kodu/commitini sabitle.
2. Test ortamında operatör kimliklerini ve kullanıcı-operatör üyeliklerini oluştur.
3. Mevcut saha kayıtlarını değiştirmeden önce JSON yedeğinde sayım ve örnek karşılaştırması yap; mevcut Saha ID, Saha No, koordinat, adres ve kayıt anahtarlarını koru.
4. İstemci saha listesi ve harita sorgularını operatör üyeliğine göre uyarla.
5. Firebase Realtime Database güvenlik kurallarında operatör kapsamını gerçek üyelik kayıtları üzerinden doğrula. Yalnızca istemci tarafı filtreleme yeterli değildir.
6. Firma özelindeki ziyaret/envanter/mesaj/ekip yollarını ayrı ayrı koru.
7. CSV/KML/KMZ içe aktarma, önizleme, doğrulama, koordinat/adres eşleme ve 5 karakterli benzersiz büyük harf/rakam Saha ID kuralı için regresyon testleri yap.
8. Emulator veya ayrı Firebase projesinde olumlu/olumsuz erişim testleri geçmeden canlıya geçme.
9. Yayın sırasında sorun olursa önce uygulama kodunu sabitlenen sürüme döndür. Firebase JSON yedeğini otomatik olarak geri yükleme; yalnızca veri değişikliği gerekiyorsa ve yedek doğrulandıysa kontrollü geri yükle.

## Zorunlu kabul testleri

- Turkcell personeli ve ekip şefi bütün Turkcell sahalarını görür; Vodafone ve Türk Telekom sahalarını göremez.
- Vodafone personeli ve ekip şefi bütün Vodafone sahalarını görür; diğer operatörlerin sahalarını göremez.
- Türk Telekom personeli ve ekip şefi bütün Türk Telekom sahalarını görür; diğer operatörlerin sahalarını göremez.
- Ekip şefi başka ekiplerin görevlerini veya personel yönetimini yapamaz.
- Bir operatör kullanıcısı başka firmanın özel ziyaret, personel, mesaj ve ekip kayıtlarını okuyamaz.
- Yetkisiz kullanıcı operatorId/companyId değerini değiştirerek erişimini genişletemez.
- CSV/KML/KMZ içe aktarma alan kaybı olmadan çalışır; Saha ID/Saha No benzersizlik kuralları korunur.
- Geri yükleme provası, canlı Firebase'e dokunmadan ayrı test ortamında başarıyla tamamlanır.

## Şu an yapılmayanlar

- Canlı Firebase verisi veya kuralları değiştirilmedi.
- Mevcut sahalar topluca Turkcell olarak güncellenmedi.
- 2.7.5 için özel bir Git tag/branch henüz doğrulanmadı; ana dalın mevcut dosyalarında 2.7.5 kaynak referansları görülüyor. Geri dönüş noktası sabitlenmeden canlı yayın yapılmamalı.
