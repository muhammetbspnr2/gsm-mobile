# GSM Mobile — Manual release verification

These checks require a real browser and a test account connected to the Firebase project. Static CI checks do not replace these checks.

## Access and authorization
- [ ] A verified, active personnel account can sign in.
- [ ] An unverified or inactive account cannot perform restricted operations.
- [ ] A non-admin account cannot open admin functions or write admin-only data.
- [ ] Sign-out clears the authenticated UI and protected views.

## Field visits and data integrity
- [ ] Enter an approved five-character Saha ID and start a visit.
- [ ] Attempt to start a second visit while one is open; the first visit must not be overwritten.
- [ ] Close and reopen the app/browser; the open visit and correct site must be restored.
- [ ] Save work notes and result; reload and verify both remain.
- [ ] Leave required work notes or result empty; save/checkout must be blocked with a Turkish explanation.
- [ ] End the visit; exactly one history record exists for that visit and the open visit is cleared.
- [ ] Confirm personnel can read only their own visit-history key; direct reads of another user's history key and broad history listing remain denied.
- [ ] Retry after a network failure; verify no duplicate history records or misleading success message.

## Import and site records
- [ ] Preview CSV, KML, and KMZ separately before writing any data.
- [ ] Verify five-character Saha ID validation and duplicate checks against both existing records and the current file.
- [ ] Verify blank Saha No is accepted for imports; non-empty Saha No accepts digits only and rejects duplicates.
- [ ] Verify coordinates, Google Maps URL, address, latitude/longitude aliases and Turkish headers are retained.
- [ ] Confirm invalid rows are clearly marked and are not imported.
- [ ] Import a small test batch and verify it appears in the personnel and admin views.
- [ ] Verify a failed/partial write is clearly reported and can be safely retried.

## Map, equipment, notifications, and reports
- [ ] Map pins match stored coordinates; missing-coordinate records remain discoverable.
- [ ] Search and filters work on mobile and desktop.
- [ ] Equipment changes are limited to the authorized active site and are visible for admin review.
- [ ] Send a test notification to one test user; confirm receipt, read status and delivery result.
- [ ] Export visit history, sites and audit logs; open each CSV in a spreadsheet and check Turkish characters and delimiters.
- [ ] Date filters include the intended start and end days.

## Mobile, offline and release
- [ ] Check common Android screen widths, keyboard behavior, touch targets and fixed navigation.
- [ ] With network disabled, the cached interface opens and clearly states that live Firebase writes need connectivity.
- [ ] Disable network, save required visit notes/result, close and reopen the PWA, then restore connectivity; verify the queued note syncs once to the same open visit.
- [ ] While a note is queued, edit it again and verify the newest text is synced without dropping the earlier queue.
- [ ] Attempt checkout offline; verify it is blocked and the open visit remains intact.
- [ ] Attempt to start another visit while offline; verify no visit is created.
- [ ] Log out with pending notes; verify the app warns that the notes remain on this device until the same account reconnects.
- [ ] Restore connectivity and confirm data refreshes without duplicate submissions.
- [ ] Install/update the PWA; confirm the visible version and refreshed assets match the release.
- [ ] Confirm browser console has no uncaught errors or Firebase permission errors.

Record tester, date, device/browser, test account, failures, and relevant console/network details before declaring a release production-ready.


## 2.4.0 arayüz / responsive regresyonu
- [ ] Personel giriş ve kayıt ekranı dar Android ekranında taşmadan açılıyor.
- [ ] Personel alt gezinmesindeki beş hedef tıklanabilir, seçili bölüm belirgin ve sabit alt gezinme içerik alanını kapatmıyor.
- [ ] Yönetici menüsünde İŞ GÜCÜ, SAHA OPERASYONLARI, İLETİŞİM ve SİSTEM grupları görünür.
- [ ] Yönetici menüsündeki 14 bölümün tamamı seçilebiliyor; sekme seçimi doğru içeriği gösteriyor.
- [ ] Yönetici istatistik kartları telefon ve masaüstünde okunaklı; kartlar yatay taşma oluşturmuyor.
- [ ] Saha haritası, içe aktarma önizlemesi, tablolar, formlar, modal pencereler ve bildirimler yeni renk paletinde okunaklı.
- [ ] Klavye odağı görünür; reduced-motion tercihi olan cihazlarda gereksiz hareket oluşmuyor.
- [ ] Güncellemeden sonra PWA/Service Worker 2.4.0 önbelleğini kullanıyor; eski stil görünüyorsa uygulama kapatılıp açılarak tekrar kontrol ediliyor.
