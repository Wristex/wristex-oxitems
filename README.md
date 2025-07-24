# wristex_oxitems Discord Botu

wristex_oxitems, FiveM sunucunuzda [ox_inventory] için kolayca item eklemenizi sağlayan bir Discord botudur. Slash komutuyla item bilgilerini girersiniz, bot otomatik olarak `[ox]/ox_inventory/data/items.lua` dosyasına itemi ekler ve görseli `[ox]/ox_inventory/web/images/` klasörüne indirir.

## Özellikler
- Sadece yetkili Discord kullanıcıları item ekleyebilir.
- Slash komut desteği: `/create-items`
- Görsel URL'sinden otomatik indirme ve kaydetme
- Lua formatında otomatik item ekleme
- Kapanış `}` karakterinden önce güvenli ekleme
- Klasörler eksikse otomatik oluşturma

## Gereksinimler
- Node.js 18 veya üzeri
- Bir Discord bot hesabı (token ve client ID alınmalı)
- Botun çalıştığı makinede FiveM sunucusunun `[ox]/ox_inventory` klasörüne erişim hakkı

## Kurulum
1. **Bot dosyalarını** `wristex_oxitems-main` klasörüne koyun (veya istediğiniz bir yere).
2. Terminali bu klasörde açın.
3. Gerekli paketleri yükleyin:
   ```
   npm install
   ```
4. `bot.js` dosyasındaki şu ayarları kendinize göre düzenleyin:
   - `TOKEN`: Discord bot tokenınız
   - `CLIENT_ID`: Discord bot client ID
   - `AUTHORIZED_IDS`: Komutu kullanabilecek Discord kullanıcı ID'leri (string olarak)
   - `OX_INVENTORY_PATH`: `[ox]/ox_inventory` klasörünün yolu. Varsayılan olarak botun bir üst klasöründe `[ox]/ox_inventory` olarak ayarlanmıştır. Gerekirse tam yol verin.

## Kullanım
1. Botu başlatın:
   ```
   npm start
   ```
2. Discord sunucunuzda `/create-items` komutunu kullanın ve gerekli alanları doldurun:
   - **item_name**: Eklenecek itemin adı (ör: water)
   - **label**: Item etiketi
   - **weight**: Ağırlık (sayı)
   - **stack**: Stacklenebilir mi? (true/false)
   - **close**: Kullanımda envanter kapanır mı? (true/false)
   - **description**: Açıklama
   - **gorsel_url**: (Opsiyonel) Görselin internet adresi

## Yetkilendirme
- Sadece `AUTHORIZED_IDS` listesinde olan Discord kullanıcıları komutu kullanabilir.
- Komut kullanıldığında item, `[ox]/ox_inventory/data/items.lua` dosyasına eklenir ve görsel `[ox]/ox_inventory/web/images/` klasörüne indirilir.

## Dosya ve Klasör Yapısı
- **[ox]/ox_inventory/data/items.lua**: Tüm itemler bu dosyada tutulur. Bot, yeni itemi kapanış `}` karakterinden önce ekler.
- **[ox]/ox_inventory/web/images/**: Görseller buraya indirilir. Dosya adı otomatik olarak item adıyla kaydedilir.

## Sıkça Sorulan Sorular
- **FiveM sunucusu kapalıyken bot çalışır mı?**
  - Evet, bot bağımsız çalışır. Ancak dosya erişimi için sunucu dosyalarına erişim gerekir.
- **Hata alırsam ne yapmalıyım?**
  - Yol ayarlarını ve dosya izinlerini kontrol edin. Botun çalıştığı makinede internet bağlantısı olduğundan emin olun.
- **Birden fazla item ekleyebilir miyim?**
  - Her komutta bir item eklenir. Dilediğiniz kadar komut kullanabilirsiniz.

## Destek
Sorularınız için wristex Discord sunucusuna veya botun geliştiricisine ulaşabilirsiniz.
