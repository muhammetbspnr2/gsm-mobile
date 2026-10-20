# GSM Mobile — Teknik denetim ve profesyonelleştirme planı

## Denetlenen yapı
- Personel ve yönetici arayüzleri statik HTML/CSS/JavaScript olarak yayınlanır.
- Kimlik doğrulama ve canlı kayıtlar Firebase Authentication + Realtime Database kullanır.
- Harita/koordinat ekranları Leaflet tabanlıdır.
- PWA, Service Worker ile uygulama kabuğunu önbelleğe alır.
- Saha içe aktarma CSV, KML ve KMZ desteğine; önizleme, Saha ID benzersizlik kontrolü ve Saha No doğrulamasına sahiptir.
- Ziyaret geçmişi, CSV dışa aktarma, bildirimler, denetim kayıtları ve yönetici JSON yedekleme/geri yükleme ekranları zaten bulunmaktadır.

## Bu sürümde giderilenler
1. **Sürüm/önbellek uyumsuzluğu:** HTML dosyaları 2.2.9 varlıkları, altbilgiler ve Service Worker 2.2.12'yi, PWA durumu ise 2.1.0'ı gösteriyordu. Sürüm işaretleri 2.3.0'a hizalandı.
2. **Saha No içe aktarma doğrulaması:** CSV/KML/KMZ önizleme ve kayıt aşamalarındaki sayısal kontrol ifadesi çift kaçış nedeniyle rakamları doğru doğrulamıyordu. İki kontrol de düzeltildi.
3. **Görsel tutarlılık:** Lacivert ve altın sarısı vurgu paleti, daha belirgin odak durumları, buton geri bildirimi, tablo satırı vurgusu ve hareket azaltma tercihi eklendi.
4. **Kalite kapısı:** JavaScript sözdizimi ve statik regresyon kontrolleri için GitHub Actions iş akışı eklendi.
5. **Operasyonel kontrol listesi:** Gerçek Firebase ve Android testlerinin tekrarlanabilir biçimde kaydedilmesi için `QA_CHECKLIST.md` eklendi.

## Üretim öncesi açık doğrulamalar
Bunlar statik kaynak kodundan kesin biçimde doğrulanamaz; gerçek test hesabı ve tarayıcı gerekir:
- Firebase yetki kurallarının canlı projede yayımlanan sürümle eşleşmesi.
- E-posta doğrulama, personel aktifliği, yönetici yetkisi ve yetkisiz erişim senaryoları.
- Açık ziyaretin uygulama kapatılıp açıldıktan sonra geri yüklenmesi; ziyaret notu/sonuç kaydı ve yinelenmeyen çıkış kaydı.
- Ağ kesintisinden sonra canlı yazımların güvenli biçimde yeniden denenmesi.
- CSV/KML/KMZ dosyalarının gerçek örneklerle, özellikle tırnaklı CSV alanları ve koordinat/Maps URL sütunlarıyla doğrulanması.
- Android küçük ekran, klavye, sabit alt gezinme ve PWA güncelleme davranışı.

## Sıradaki uygulama sırası
1. Gerçek test hesabıyla personel/yönetici akışlarının uçtan uca regresyon testi.
2. Ağ kesintisi için açık bekleyen işlem kuyruğu tasarımı: işlem kimliği, yinelenmeyi önleme, kullanıcıya net durum ve güvenli yeniden deneme. Bu adım veri modeli ve Firebase kurallarıyla birlikte yapılmalı; yalnızca arayüz önbelleğine güvenilmemeli.
3. Firebase kurallarının otomatik/emülatör testleri ve en az ayrıcalık incelemesi.
4. Raporların tarih aralığı, personel, saha ve sonuç bazında tutarlılık kontrolü; CSV dışa aktarma testleri.
5. Yedek geri yükleme için dosya şeması/doğrulama, işlem öncesi yedek ve geri yükleme sonrası doğrulama testleri.
6. Erişilebilirlik, performans ve farklı Android tarayıcılarında son görsel/etkileşim denetimi.

## Yayın ölçütü
Bir kontrol ancak gerçek test sonucu kaydedildiğinde “başarılı” sayılır. Statik kontrolün geçmesi, Firebase/telefon üzerinde uçtan uca başarının kanıtı değildir.
