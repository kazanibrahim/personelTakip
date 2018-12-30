8.1	Kullanıcı kayıt sayfası

 Uygulamada ilk önce çalıştırıldığında eğer ilk defa oluşturuluyorda sistem ilk kullanıcı kullanıcı adı admin ve şifre admin olrak tanımlanıyor. Uygulamaya giriş yapılıp bu kullanıcı adı ve şifre değiştirilebilir ve ayrı kullanıcılar eklenebilir eklenen bu kullanıcılara daha sonra yetki verilebilir. Uygulama ikinci bir giriş yapıldığında artık eski adı ve şifresi admin olan kullanıcı eklenmeyecek atrık değiştirmiş olduğumuz yeni kullanıcı adı ve şifre ile giriş yapılacaktır.

 
![image](https://user-images.githubusercontent.com/18012576/50546982-5ed67a80-0c42-11e9-94c7-21d73fe97f57.png)

Şekil 8 kullanıcı ekleme


8.2	Okuyucu ekleme sayfası
![image](https://user-images.githubusercontent.com/18012576/50546988-701f8700-0c42-11e9-992f-e0b4a4c41463.png)

 Uygulamada kart ekleyebilmemiz için elimdeki ilk okuyucuyu tanımlayıcı okuycu olarak eklememiz gerekiyor . Tanımlayıcı okuyucuyu uygulamaya okuyucu adı okuyucunun seri numarası , özelliği ve okyucu tipi olarak tanımlayıcı okuycu olrak seçmemiz gerekmektedir.
Daha sonra ekleyeceğimiz okuycuları giriş , çıkış , giriş-çıkış olrak tanımlayabiliriz. Giriş olarak tanımladığımız okuycudan yetki vereceğimiz personel sadece giriş yapabilecek. Aynı şekilde çıkış olrak tanımladığımız okuyucudan sadece yetki vereceğimiz personel çıkış yapabilecek.

 
Şekil 9 okuyucu ekleme


8.3	Okuyucu grup ekleme
![image](https://user-images.githubusercontent.com/18012576/50546990-7c0b4900-0c42-11e9-9603-abf492f840ca.png)

Tanımlayıcı okuyucu dışındaki tanımladığımız okuycuları giriş, çıkış ve giriş-çıkış okuyucularını gruplandırmamız gerekiyor. Bu okuyucuları gruplandırırken personele yetki verirken bu grupları kullanacaz tek tek okuycuları değil bu şekilde okuyucular örnediğin bir iş yerindeki arge bölümündeki giri ve çıkış okyucu grubu olarak isimlendirerek gruplandırabiliriz.

 
Şekil 10 okuyucu grubu ekleme



8.4	Kart ekleme sayfası
![image](https://user-images.githubusercontent.com/18012576/50546993-862d4780-0c42-11e9-9d2e-0afb91f084ee.png)

 Kart eklemek için daha önce belirttiğim gibi daha  önce tanımladığımız  tanım okyucusunu burda seçmeliyizi daha sonra kart konudu manuel olarak elle giriyoruz ve tanımlamak istediğimiz kartı tanımlayıcı okuycuya okuttuğumuzda kart ID Al ile kartın ıd’sine erişim sağlayabiliriz.Ayrıca uygulamya eklediğimiz kartları dinamik bir şekilde düzenleyebilir ve sileribiliriz. Daha sonraki aşamalrda eklediğimiz bu kartları personellerle iliştirecez.

 
Şekil 11 kart ekleme
  


8.5	Personel ekleme sayfası
![image](https://user-images.githubusercontent.com/18012576/50546997-90e7dc80-0c42-11e9-84ea-af6663163445.png)

Uygulamamıza okuyucu , okuycu grup ve kart ekledikten sonra şimdi de sıra eklemiş olduğumuz bu kart ve okuycuları ilişkilendirmeye peroneli tanımlar isim soyisim tc.no sicil numarası  geçiş yetkisi ve kart seçilmelidir.Eklediğimiz personeli de dinamik bir şekilde düzenleyebiliriz ve silebilirz.
 
Şekil 12 personel ekleme




8.6	Raporlar
![image](https://user-images.githubusercontent.com/18012576/50546999-9ba27180-0c42-11e9-9d02-b3a4abaf88cc.png)

Uygulamada aylık olarak yapılan giriş çıkışları daha sonra uygulamaya eklencek olan  geçikme veya erken çıkışlar aylık olarak yetkili kişi tarafında raporlanabilir.Oluşturduğumuz raporu excell sayfına aktarabiliriz 

 
Şekil 13 raporlar









