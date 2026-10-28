# KANLI KURULTAY — Multiplayer Arena

## Gereksinimler
- Node.js 18 veya daha yeni
- İnternet bağlantısı (Three.js CDN ve Google Fonts ilk yüklemede internet ister)

## Windows'ta çalıştırma
1. ZIP'i bir klasöre çıkar.
2. Klasörün içinde adres çubuğuna `cmd` yazıp Enter'a bas.
3. Şunları sırayla çalıştır:
   ```bat
   npm install
   npm start
   ```
4. Tarayıcıda `http://localhost:3000` aç.
5. Aynı bilgisayardan ikinci test için başka sekmede aynı adresi açıp farklı adla gir.

## İnternetten arkadaşlarla oynamak
Bu klasör oyun sunucusunu da içerir. Arkadaşların internet üzerinden katılması için Node.js destekleyen bir sunucuya dağıtman gerekir. Sunucunun dışarıdan erişilebilir adresi ve WebSocket desteği olmalı. Yerel `localhost` adresi arkadaşlarının bilgisayarında çalışmaz.

## Kontroller
- WASD: hareket
- Fare: bakış (oyun ekranına tıkla)
- Sol tık: kılıç saldırısı
- Shift: koş
- ESC: fare kilidini bırak

## Bu sürümde
- Özgün KANLI KURULTAY giriş ekranı
- 3D taş arena, sütunlar, sancaklar ve blok siperler
- Sunucu üzerinden oyuncu konumları, kılıç vuruşları, can, skor ve yeniden doğma
- Basit oyuncu listesi ve vuruş bildirimi

Not: Bu, oynanabilir ilk temel sürümdür; profesyonel üretim için kimlik doğrulama, oda/eşleştirme, anti-cheat, daha gelişmiş animasyonlar, ses, mobil kontroller ve sunucu tarafı hareket doğrulaması ayrıca geliştirilmelidir.
