# Kanlı Kurultay — geliştirilmiş arena sürümü

## Gereksinimler
- Node.js 18 veya üzeri
- İnternet bağlantısı (Three.js tarayıcıda CDN üzerinden yüklenir)

## Yerel çalıştırma
1. Bu klasörde terminal aç.
2. `npm install`
3. `npm start`
4. Tarayıcıda `http://localhost:3000` adresini aç.

## Kontroller
- WASD: hareket
- Fare: kamera
- Sol tık: saldırı
- Shift: koş
- H: ata bin / attan in
- Q: mızrak fırlat (menüden mızrak seç)
- ESC: fare kilidini bırak

## Modlar
- Bot Antrenmanı: yerel botlar sana yaklaşır ve saldırır.
- Multiplayer: Socket.IO sunucusuna bağlanır. Sunucudaki temel kılıç hasarı ve oyuncu hareketi aktiftir.

## Özelleştirme
Giriş menüsünde zırh tipi, miğfer, silah ve oyun modu seçilebilir. Zırh/kalkan/silah dayanıklılığı antrenman modunda düşer.

## Varlıklar ve lisans
`public/assets/` içindeki taş, demir, deri ve zemin dokuları bu proje için üretilmiştir. Banner SVG'leri de projeye özel hazırlanmıştır. Three.js CDN'den yüklenir; bu nedenle çalıştırırken internet bağlantısı gerekir.

## Durum
Bu, oynanabilir bir geliştirme sürümüdür; tam Mount & Blade ölçeğinde bir oyun değildir. Multiplayer modunda bot AI'sı sunucuya senkronize edilmez ve atlı savaş/animasyonlar ilk uygulama aşamasındadır.
