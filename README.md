# Auth Prime Projesi Dokümantasyonu

Bu proje, Express.js kullanılarak geliştirilmiş kapsamlı bir kimlik doğrulama ve yetkilendirme sistemidir. Redis, PostgreSQL ve JWT (JSON Web Tokens) teknolojilerini kullanarak güvenli ve ölçeklenebilir bir kimlik doğrulama çözümü sunar.

## Temel Özellikler

-   Kullanıcı kaydı ve girişi
-   JWT tabanlı kimlik doğrulama
-   Redis ile oturum yönetimi
-   Rol ve Yetki tabanlı yetkilendirme
-   Hız sınırlama
-   Hata işleme
-   Güvenli token yenileme mekanizması

## Proje Yapısı

Proje aşağıdaki ana bileşenlerden oluşmaktadır:

-   **app.js**: Ana uygulama dosyası
-   **config/**: Veritabanı, Redis ve loglama yapılandırmaları
-   **controllers/**: İş mantığı ve route işleyicileri
-   **middlewares/**: Kimlik doğrulama, hata işleme ve hız sınırlama ara yazılımları
-   **models/**: Veritabanı modelleri
-   **services/**: Redis ve token işlemleri için servisler
-   **utils/**: Yardımcı fonksiyonlar ve araçlar

## Servisler

### Token Servisi (tokenService.js)

JWT token'larının oluşturulması, doğrulanması ve yönetimi için kullanılır.

Önemli metodlar:

-   `createBindingKey`: IP ve cihaz bilgilerini hashleyerek `bindingKey` oluşturur.
-   `generateAccessToken`: Access token oluşturur.
-   `generateRefreshToken`: Refresh token oluşturur.
-   `verifyAccessToken`: Access token'ı doğrular.
-   `verifyRefreshToken`: Refresh token'ı doğrular.
-   `decodeToken`: Token'ı decode ederek içerisindeki bilgileri alırız.

### Redis Servisi (redisService.js)

Oturum yönetimi için Redis veritabanı ile etkileşimi sağlar.

Önemli metodlar:

-   `setSession`: Yeni bir oturum kaydeder.
-   `delSession`: Bir oturumu siler.
-   `delAllSessions`: Belirli bir kullanıcının tüm oturumlarını siler.
-   `getSession`: Bir oturumu getirir.
-   `getAllSessionsByUser`: Belirli bir kullanıcının tüm oturumlarını alır.
-   `getAllSessions`: Tüm oturumları listeler.

## Kimlik Doğrulama Senaryosu

### 1. İstemciden Gelen İstek

-   İstemciden gelen isteği alırız.
-   İstek içinde `Authorization` başlığı olup olmadığını kontrol ederiz. Bu başlık, kullanıcının oturum açtığını belirten `Bearer Access Token`'ı içerir.

### 2. Access Token Kontrolü

-   `Authorization` başlığı varsa, içindeki `Bearer Access Token`'ı alırız.
-   `Access Token`'ı doğrulama işlemi başlatılır. Bu işlemde, token'ın geçerli olup olmadığı ve istemcinin IP ve cihaz bilgileri ile uyumlu olup olmadığı kontrol edilir.
    -   **Başarılı Olursa:**
        -   `req.user` değişkenine doğrulanan kullanıcı bilgilerini tanımlarız.
        -   `return next()` diyerek sıradaki middleware'e geçeriz.
    -   **Başarısız Olursa:**
        -   `handleRefreshToken` middleware'ine yönlendiriliriz.

### 3. Refresh Token Kontrolü

-   İstekten `refreshToken` çerezini kontrol ederiz.
-   `refreshToken` varsa, token doğrulama işlemi başlatılır. Bu işlemde, token'ın geçerli olup olmadığı ve istemcinin IP ve cihaz bilgileri ile uyumlu olup olmadığı kontrol edilir.
    -   **Başarılı Olursa:**
        -   Yeni bir `Access Token` oluşturulur.
        -   Eski `Refresh Token` silinir ve yerine yeni bir `Refresh Token` oluşturulur.
        -   `req.user` değişkenine doğrulanan kullanıcı bilgilerini tanımlarız.
        -   Yeni oluşturulan `Access Token`'ı istemciye döneriz (header'da `x-new-token` olarak).
        -   Yeni `Refresh Token`'ı çerez olarak istemciye göndeririz.
        -   `return next()` diyerek sıradaki middleware'e geçeriz.
    -   **Başarısız Olursa:**
        -   `req.user` null olarak kalır.
        -   `return next()` diyerek sıradaki middleware'e geçeriz.

### 4. Token Doğrulama

-   **Token Oluşturma:**
    -   Token oluşturulurken, istemcinin IP ve cihaz bilgilerini hashleyerek `bindingKey` tanımlarız ve bunu token'a ekleriz.
-   **Token Doğrulama:**
    -   Token doğrulama işlemlerinde, istemcinin mevcut IP ve cihaz bilgilerini aynı şekilde hashleyerek token içindeki `bindingKey` ile karşılaştırırız.
        -   **Eşleşme Başarılı Olursa:**
            -   Token doğrulama başarılı olur ve kullanıcı bilgileri alınır.
        -   **Eşleşme Başarısız Olursa:**
            -   Token doğrulama başarısız olur ve token kabul edilmez.

## Güvenlik Özellikleri

-   IP ve cihaz bilgisine dayalı token bağlama
-   Her token yenilemede işleminde yeniden oluşturulan refresh tokenlar
-   Stateless access token'lar
-   Güvenli şifre hashleme (bcrypt)
-   HttpOnly ve Secure cookie'ler
-   Rate limiting
-   Rol tabanlı erişim kontrolü

## Performans Özellikleri

-   Redis kullanarak oturum yönetimi sağlanır. Bu, oturumları hızlı bir şekilde yönetmemizi ve doğrulama işlemlerini hızlıca gerçekleştirmemizi sağlar.
-   `bindingKey` kullanımı ile her doğrulama işleminde IP ve cihaz bilgilerini kontrol ederek güvenliği artırırken, sadece geçerli oturumları kabul ederiz.
-   Yeni token oluşturma ve eski token'ları silme işlemleri asenkron olarak yapılır, bu da performans açısından avantaj sağlar.

## Kullanılan Önemli Paketler

-   `bcrypt`: Şifreleri güvenli bir şekilde hashlemek için kullanılır.
-   `cookie-parser`: Çerezleri ayrıştırmak için kullanılır.
-   `dotenv`: Ortam değişkenlerini yönetmek için kullanılır.
-   `express`: Web uygulaması framework'ü.
-   `express-rate-limit`: İstek hızını sınırlamak için kullanılır.
-   `ioredis`: Redis istemcisi.
-   `jsonwebtoken`: JWT oluşturmak ve doğrulamak için kullanılır.
-   `pg`: PostgreSQL istemcisi.
-   `sequelize`: Promise tabanlı Node.js ORM aracı.
-   `ua-parser-js`: Kullanıcı ajanı bilgilerini ayrıştırmak için kullanılır.
-   `uuid`: UUID oluşturmak için kullanılır.

### Geliştirme Bağımlılıkları

-   `nodemon`: Geliştirme sırasında uygulamayı otomatik olarak yeniden başlatmak için kullanılır.

## Kurulum ve Çalıştırma

1. Gerekli bağımlılıkları yükleyin: `npm install`
2. Çevre değişkenlerini ayarlayın (.env dosyası)
3. Veritabanı ve Redis bağlantılarını yapılandırın
4. Uygulamayı başlatın: `npm run dev` (geliştirme) veya `npm start` (prodüksiyon)
