# GSM Mobile Çok Firmalı Mimari ve Güvenli Geçiş Planı

Durum: Geliştirme dalında operatör bazlı saha kataloğu ve çevrimdışı geçiş aracı uygulandı. PR açık/draft; canlı site, canlı Firebase verisi ve yayımlanmış Firebase kuralları değiştirilmedi. Operasyon kayıtlarının tamamı için tenant izolasyonu henüz tamamlanmadı.

## Sabit ürün kararları
- Bir firma bir veya birden fazla operatörle çalışabilir.
- Firmalar kendi saha kayıtlarını görür.
- Mevcut sahalar ilk firma olan **Turkcell Ankara Bölge** ile ilişkilendirilecek; ilişkilendirme yalnızca kayıt sahipliği doğrulandıktan sonra yapılır.
- Ekip şefi yalnızca kendisine atanmış ekipleri yönetir.
- CSV/KML/KMZ içe aktarma, önizleme/doğrulama, 5 karakterli büyük harf/rakam Saha ID kuralı ve mevcut Saha No kuralları korunur.
- Canlı veri taşıması ve yayımlanmış Firebase kuralları, yedek ve doğrulama olmadan değiştirilmez.

## Kod incelemesinde görülen mevcut durum
- Personel profilleri `profiles/{uid}` altında; `company` serbest metin alanı olarak kullanılıyor.
- Firma kayıtları `companies` altında mevcut.
- Sahalar `sites` altında ortak tutuluyor ve istemci `approved=true` sorgusuyla saha listeliyor.
- Rol kontrolü ağırlıklı olarak `admins/{uid} === true` ve `access/{uid}/active` üzerinden yapılıyor.
- Google Maps CSV içe aktarma kodu `site-import.js` içinde `company: "Mikrolink"` sabit değerini yazıyor.
- `database.rules.json` depo dosyasında saha okuma kuralı aktif personellerin onaylı sahaları okuyabilmesine izin veriyor. Firebase Console'daki yayımlanmış kuralların bununla aynı olduğu henüz doğrulanmadı.
- Bu yüzden sadece arayüz filtresi eklemek yeterli veya güvenli değildir.

## Önerilen kimlik ve yetki modeli
- `companies/{companyId}`: ad, durum, `operatorIds`, oluşturulma bilgileri.
- `companyMembers/{companyId}/{uid}`: rol, aktiflik, atanma bilgileri. Firma üyeliği kullanıcı tarafından kendi kendine yükseltilemez.
- `teams/{teamId}`: `companyId`, ad, durum, oluşturulma bilgileri.
- `teamMembers/{teamId}/{uid}`: aktif üyelik ve görev.
- `teamLeaders/{uid}/{teamId}`: yalnızca yetkili atamayı ifade eden kayıt; yazma yalnızca firma yöneticisi/merkezi yönetici üzerinden.
- `sites/{siteId}`: mevcut kayıt kimliği korunur; `companyId` eklenir. Firma kapsamındaki benzersiz Saha ID/Saha No kontrolleri yazma yolunda ve uygulama doğrulamasında yapılır.
- Ziyaret, ekipman değişiklik talebi, günlük plan ve mesaj kayıtlarında uygun `companyId`; ekip göreviyle ilişkili kayıtlar için ayrıca `teamId` tutulur.
- Rol adları: `system_admin`, `company_admin`, `team_leader`, `personnel`. Eski `admins/{uid}` kaydı geçiş sırasında merkezi yönetici uyumluluğu için korunur; yetki kaynağına geçiş açıkça test edilir.

## Veri erişim ilkeleri
1. Her yazma işlemi istemcinin gönderdiği `companyId` değerine güvenerek yetki vermez; üyelik/rol verisi Firebase tarafında doğrulanır.
2. Firma yöneticisi yalnızca kendi firmasındaki ekipleri, personelleri, sahaları ve operasyon kayıtlarını yönetebilir.
3. Ekip şefi yalnızca kendisine atanmış ekiplerin personel ve görevlerini okuyup değiştirebilir; ekip veya firma üyeliği oluşturamaz.
4. Personel kendi profili, kendi ziyaret kaydı ve kendisine atanmış görevlerle sınırlıdır.
5. Firebase Realtime Database kuralları sorgu bazlı okumada bütün çocuk kayıtlarını güvenli biçimde filtreleyemez. Bu nedenle tenant verileri sorgu/erişim desenlerine uygun yollar altında ayrılmalı veya mevcut yollar için uyumlu bir geçiş katmanı kurulmalıdır. Kural testleri yapılmadan geniş okuma izni eklenmemelidir.
6. Merkezi ortak haberler gibi gerçekten ortak içerik ile firma özelindeki içerikler ayrı tutulur.
7. Firma üyeliği ve rol değişiklikleri denetim günlüğüne kaydedilir.

## Güvenli geçiş aşamaları
### A. Salt okunur envanter ve yedek
- Firebase Console'dan JSON yedeği alınır ve erişimi sınırlandırılır.
- `profiles`, `access`, `companies`, `sites`, `siteRequests`, `openVisits`, `visitHistory`, `equipment`, bildirim ve denetim kayıtlarının sayıları/anahtarları çıkarılır.
- Mevcut kullanıcı-firma ve saha-firma eşleşmeleri raporlanır; belirsiz kayıtlar otomatik atanmaz.
- Gerçek kişi bilgileri veya hassas veriler rapor/commit içine eklenmez.

### B. Geriye uyumlu şema hazırlığı
- Yeni kimlik alanları ve üyelik yapısı test ortamında oluşturulur.
- Eski `company` alanı hemen silinmez; `companyId` ile eşleştirme doğrulanana kadar geçici uyumluluk alanı olarak kalır.
- Önce okuma uyumluluğu ve hata raporlaması test edilir; canlı veri taşıması yapılmaz.

### C. Test verisiyle firma izolasyonu
- İki örnek firma, iki ekip şefi ve birden çok personel içeren sahte veriler hazırlanır.
- Başarılı ve reddedilmesi gereken okuma/yazma istekleri Firebase Emulator veya ayrı test projesinde doğrulanır.
- Kuralların varsayılanı erişimi reddetmek olmalıdır; eski genel erişim izinleri yeni izolasyonu delmemelidir.

### D. İçe aktarma uyumluluğu
- `site-import.js` içinde sabit `Mikrolink` değeri yerine yetkili kullanıcının seçili firma bağlamı kullanılır.
- CSV, KML, KMZ ayrıştırma, önizleme, doğrulama, koordinat/adres eşleme ve hata raporlama davranışı değiştirilmeden test edilir.
- Saha ID'nin tam 5 karakter, büyük harf/rakam olması; benzersizlik kontrolü ve Saha No'nun mevcut kuralları korunur.
- İçe aktarma işlemi, yetkili kullanıcının firma kapsamı dışında kayıt yazamaz.

### E. Operasyon verileri ve ayrı ekip şefi paneli
- Ekip şefi için yönetici panelinden ayrı team-leader.html ekranı ve team-leader.js akışı hazırlandı. Giriş, atanmış ekipleri yükleme, günlük görev oluşturma ve görev durumunu izleme arayüzü bu ayrı paneldedir.
- Yönetici > Personel yönetimi tablosuna kayıtlı operatör/firma/ekip seçimleri ve Personel/Ekip şefi rolü eklendi. Ekip şefi ataması aynı firmadaki birden fazla ekibe genişletilebilir.
- Yönetici > Firmalar bölümünden yeni operatör, firma ve firmaya bağlı ekip tanımlama formları eklendi; mükerrer adlar engellenir.
- Firma kaydında bir veya birden fazla kayıtlı operatör seçilir; personel atamasında operatörün firmanın tanımlı operatörleri arasında olması ve ekibin aynı firmaya bağlı olması kontrol edilir. Eski firma kayıtlarında operatör ilişkisi yoksa, atamadan önce firma-operatör eşleşmesi ayrıca gözden geçirilmelidir.
- database.rules.json dosyasına yeni operatör, ekip, ekip üyeliği, ekip şefi ve günlük plan yolları için başlangıç kuralları eklendi. Bu kurallar yalnızca depo dalındadır; Firebase Console'a yayımlanmadı ve Emulator/test projesinde doğrulanmadan canlıya alınmamalıdır.
- Ana personel ekranı ve yönetici ekranının üst bağlantılarına ayrı ekip şefi paneli bağlantısı eklendi; ekip şefi özellikleri yönetici menüsüne gömülmedi.
- Panel teamLeaders/{uid}, teams/{teamId} ve dailyPlans/{teamId}/{planId} için hedef şemayı kullanır. Üretimde çalışır hâle gelmesi için bu yolların güvenli Firebase kuralları ve personel/ekip üyeliği doğrulaması ayrıca test edilmelidir.
- Ziyaret, ekipman, değişiklik talepleri, bildirimler ve raporlara firma kapsamı eklenir.
- Ekip şefi paneli günlük plan, görev durumu, açık saha ziyareti ve ekip raporlarını sadece atandığı ekipler için sunar.
- Eski kayıtlar için firma/ekip ilişkisi kanıtlanamıyorsa tahminle taşınmaz; inceleme kuyruğunda kalır.

### F. Devreye alma ve geri dönüş
- Test sonuçları, kayıt sayıları ve import örnekleri onaylanmadan üretime geçilmez.
- Kurallar ve uygulama sürümü eş zamanlı ve kontrollü yayımlanır.
- Geri dönüş adımları, yedek konumu, önceki kurallar ve önceki uygulama sürümü önceden belgelenir.

## Zorunlu kabul testleri
- Firma A kullanıcısı Firma B sahalarını, ziyaretlerini, envanterini, mesajlarını ve personellerini okuyamaz/değiştiremez.
- Ekip şefi atanmadığı ekipteki görevleri okuyamaz/değiştiremez.
- Personel kendi kendini yönetici/ekip şefi yapamaz ve `companyId` değiştirmekle başka firmaya geçemez.
- Firma yöneticisi başka firma üyeliği veya ekip üyeliği oluşturamaz.
- CSV/KML/KMZ örnek dosyaları eski önizleme ve doğrulama sonuçlarını korur; kayıt alanları kaybolmaz.
- Mevcut saha kimlikleri, koordinatlar, adresler, Saha ID ve Saha No kayıt sayıları ve değerleri karşılaştırılır.
- Açık ziyaretler ve ziyaret geçmişi, yetki geçişinden sonra doğru kullanıcı ve firmayla ilişkilendirilir.
- Bağlantı hatası/izin reddi durumları kullanıcıya anlaşılır gösterilir; hassas veri konsola dökülmez.

## Kodda uygulanan ilk aşama: operatör bazlı saha kataloğu
- `tenant-sites.js` personelin `profiles/{uid}/operatorId` ve `operatorIds` alanlarından operatör kapsamını hesaplar; birden çok operatör atanmışsa katalogları birleştirir.
- Personel saha listesini ortak `sites` kökünden değil, `operatorSites/{operatorId}` altındaki yalnızca onaylı kayıtlardan okur. Operatör ataması olmayan personel için tüm saha kataloğu kapalıdır.
- `database.rules.json` içinde ortak `sites` kökünün genel personel okuması kaldırıldı. Tekil saha okuması kullanıcı operatör atamasıyla sınırlandırıldı; operatör katalog sorgusu yalnızca ilgili operatöre atanmış aktif kullanıcıya ve `approved=true` sorgusuna açıldı. Yazmalar yöneticiyle sınırlı.
- Yönetici manuel saha ekleme/düzenleme/silme ve içe aktarma yolları operatör kataloğu indeksini de günceller. Operatör değişiminde eski indeks kopyası kaldırılır.
- Personel atama tablosu birden fazla operatör seçimini destekler; seçilen operatörlerin tümü firmanın `operatorIds` ilişkisine kayıtlı olmalıdır.
- Sürüm/cache göstergeleri tutarlı biçimde `2.8.1` olarak hizalandı; statik testler operatör kataloğu kurallarını da denetleyecek şekilde güncellendi.
- GitHub Actions'ta son commit için `GSM Mobile quality checks` ve `GSM Takip validation` başarılı oldu. Bu, statik doğrulamadır; ayrı Firebase Emulator/test projesinde gerçek okuma/yazma yetki testlerinin yerini tutmaz.

## Mevcut sahaları Turkcell'e hazırlama (kod dalında tamamlandı; canlıya uygulanmadı)
- `site-import.js` içindeki yeni Google Maps CSV/KML/KMZ kayıtlarının sabit firma alanı `Mikrolink` yerine `Turkcell Ankara Bölge`, operatör alanı ise boş yerine `Turkcell` olarak değiştirildi. Ayrıştırma, önizleme, doğrulama, Saha ID/Saha No denetimleri ve koordinat/adres eşlemesi değiştirilmedi.
- `scripts/assign-existing-sites-turkcell.mjs` eklendi. Bu araç yalnızca yerel Firebase JSON dışa aktarımını işler; Firebase'e bağlanmaz ve girdi dosyasının üzerine yazmaz. Varsayılanı dry-run'dır. `--write-output` verilirse ayrı bir JSON dosyası oluşturur.
- Araç mevcut `sites/{key}` kayıtlarında yalnızca `operator: "Turkcell"` ve `company: "Turkcell Ankara Bölge"` alanlarını hedefler; site anahtarları ve diğer saha/veri alanları aynen korunur. Çıktı, sayımlar ve saha eşleşmeleri incelenmeden canlıya yüklenmemelidir.
- `operatorId` ve `companyId` kasıtlı olarak otomatik üretilmez; bunlar yönetici panelinde oluşturulan kayıtların gerçek Firebase anahtarlarıyla eşleştirildikten sonra ayrı bir aşamada doldurulmalıdır.

## Henüz yapılmayanlar
- Canlı Firebase verisi okunmadı veya değiştirilmedi.
- Firebase Console'daki yayımlanmış kurallar doğrulanmadı.
- Hiçbir kullanıcı ya da saha otomatik olarak firmaya atanmadı.
- Ekip şefi panelinin arayüz ve istemci akışı ayrı geliştirme dalına eklendi; henüz canlıya yayımlanmadı ve mevcut Firebase kurallarıyla uçtan uca çalıştığı doğrulanmadı.
- teamLeaders, teams, teamMembers ve dailyPlans yolları için güvenlik kuralları test ortamında hazırlanıp Emulator/ayrı Firebase projesinde sınanmalıdır.
- Üretim güvenlik kuralları değiştirilmedi.
- Ziyaretler, ekipman, değişiklik talepleri, mesajlar, bildirimler ve raporların tamamı için firma/ekip izolasyonu henüz uygulanmadı; bu nedenle bu PR tek başına üretime alınmaya hazır değildir.
- Bu plan uygulama değişikliği ve testlerin yerine geçmez; canlıya geçmeden önce ayrı test projesi ve yedek gereklidir.
