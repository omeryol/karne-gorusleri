/**
 * Yorum normalizasyon betiği
 * 
 * Mevcut robotik ve tekrar eden yorumları, tamamen doğal, insani ve
 * Türkçeye uygun hale getirir. Her yorum kendine özgü olacak şekilde
 * yeniden yazılır.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const YORUMLAR_DIR = resolve(__dirname, '../../yorumlar');

// ============================================================
// GENİŞ DOĞAL CÜMLE HAVUZU
// ============================================================

// Açılış cümleleri - her yorum farklı bir açılışla başlar
const openings = [
  "[Öğrenci Adı]'yla bu dönem birlikte çalışırken inişli çıkışlı bir yolculuk yaptık diyebilirim.",
  "[Öğrenci Adı] düzenli olduğu zamanlarda ne kadar başarılı olabildiğini hepimize gösterdi bu dönem.",
  "[Öğrenci Adı] için bu dönem, sorumluluk almayı öğrenme açısından epey öğretici geçti.",
  "[Öğrenci Adı]'nın bu dönemine baktığımda, aslında içinde çok daha fazlasını barındırdığını görüyorum.",
  "[Öğrenci Adı]'yla geçirdiğimiz bu dönemde en çok, kendi sınırlarını keşfetmesi önemliydi bence.",
  "[Öğrenci Adı] bu dönem bazen zorlandı ama inanıyorum ki içinde çok güzel bir potansiyel var.",
  "[Öğrenci Adı]'nın derslere yaklaşımı dönem boyunca dalgalıydı, bazı günler çok iyi bazı günler zorlandı.",
  "[Öğrenci Adı]'yla bu dönem en çok, çalışma alışkanlıkları üzerine kafa yorduk.",
  "[Öğrenci Adı]'na baktığımda en büyük eksiğinin düzenli bir çalışma programı olduğunu düşünüyorum.",
  "[Öğrenci Adı] henüz ders çalışma sorumluluğunu tam olarak üstlenebilmiş değil sanki.",
  "[Öğrenci Adı] dönem içinde bazen dersin akışından kopsa da, onunla ilgilendiğimizde hemen toparlandı.",
  "[Öğrenci Adı]'nın bu dönem en çok zorlandığı şey, motivasyonunu yüksek tutabilmek oldu.",
  "[Öğrenci Adı]'nın bu dönem derslere katılımı ve ödev takibi maalesef istediğimiz gibi olmadı.",
  "[Öğrenci Adı]'yla bu dönem, onun hızına uygun bir tempoda ilerlemeye çalıştık.",
  "[Öğrenci Adı] derslere girip çıksa da bu dönem istediğimiz verimi tam alamadık açıkçası.",
  "[Öğrenci Adı] bu dönem derslere odaklanma ve düzen konusunda biraz daha desteğe ihtiyaç duydu.",
  "[Öğrenci Adı]'nın çalışma alışkanlıklarına bakınca, zamanını daha iyi planlaması gerektiği ortada.",
  "[Öğrenci Adı] bu dönem planlı çalışmanın ne kadar önemli olduğunu henüz tam olarak anlayamadı sanırım.",
  "[Öğrenci Adı]'yla bu süreçte en çok üzerinde durduğumuz şey, düzenli tekrar alışkanlığı kazanmaktı.",
  "[Öğrenci Adı]'nın bu dönem sınıftaki performansı, aslında neler yapabileceğinin oldukça altında kaldı.",
  "[Öğrenci Adı] için bu dönem, ders düzenini oturtma bakımından oldukça zorlu geçti.",
  "[Öğrenci Adı] bu dönem özellikle ödev ve ders hazırlığı konusunda sık sık hatırlatma istedi.",
  "[Öğrenci Adı]'yla bu dönem odaklanma sorunları üzerine çalıştık ve ufak da olsa ilerleme kaydettik.",
  "[Öğrenci Adı]'nın bu dönem en büyük sorunu, günlük tekrarları ihmal etmesiydi.",
  "[Öğrenci Adı] dönem boyunca bazen kabuğuna çekilse de, cesaretlendirince güzel katkılar verdi.",
  "[Öğrenci Adı]'nın bu dönemki görüntüsü, sorumluluklarını erteleme huyunu bir kenara bırakması gerektiğini gösteriyor.",
  "[Öğrenci Adı]'yla bu dönem özellikle derse hazırlıklı gelme ve ödevlerini takip etme konusunda adımlar attık.",
  "[Öğrenci Adı] bu dönem dersleri takip etmekte zorlanmasının asıl sebebi plansızlıktı bence.",
  "[Öğrenci Adı]'nın derslerdeki tutumu, biraz daha disiplinli olması gerektiğini gösteriyor.",
  "[Öğrenci Adı] için bu dönem, çalışma alışkanlıklarını oturtma açısından aslında çok önemliydi.",
  "[Öğrenci Adı]'nın bu dönem derslerdeki hali biraz dalgalıydı, bazen parlıyor bazen sönüyordu.",
  "[Öğrenci Adı]'la bu döneme baktığımızda en büyük eksiğin düzenli çalışmak olduğunu görüyoruz.",
  "[Öğrenci Adı] dönem boyunca bazen çok iyiydi bazen de düşüş yaşadı, istikrar yakalaması önemli.",
  "[Öğrenci Adı]'nın derslere ilgisi dönem içinde gelgitler yaşadı, sevdiği konularda çok hevesliydi.",
  "[Öğrenci Adı]'yla bu dönem, kendi başına çalışma becerisini geliştirmesi gerektiğini net olarak gördük.",
  "[Öğrenci Adı]'nın bu dönemki durumu bana, özellikle düzen ve plan konusunda desteğe ihtiyacı olduğunu gösterdi.",
  "[Öğrenci Adı] dönem boyunca zaman zaman yol göstermemize ihtiyaç duysa da, doğru yönlendirince toparlandı.",
  "[Öğrenci Adı]'nın bu dönemki çalışma temposu, daha istikrarlı bir programa ihtiyacı olduğunu ortaya koydu.",
  "[Öğrenci Adı] için bu dönem, kendi ayakları üzerinde durmayı öğrenmesi gereken bir süreçti aslında.",
  "[Öğrenci Adı]'nın dönem içindeki durumuna bakınca, çalışma alışkanlıklarını biraz gözden geçirmesi gerektiği ortada.",
];

// Orta kısım cümleleri - yorumun içeriğini oluşturan çeşitli temalar
const middles = [
  "Özellikle ön hazırlık yapmadığı günlerde dersi yakalamakta zorlandı, konular havada uçuşunca yetişemedi.",
  "Uzun süre dikkatini vermesi gereken işlerde çabuk dağıldı, bir süre sonra başka şeylerle ilgilenmeye başladı.",
  "Ödevlerini zamanında getirme konusunda sık sık uyarmamız gerekti, bu da ders başarısını etkiledi açıkçası.",
  "Hazırlık yapmadan geldiğinde derste anlatılanları anlamakta epey zorlandı, sonra yetişmek için uğraştı durdu.",
  "Günlük tekrarları aksatınca konular birikti, sınav öncesi hepsini yetiştirmeye çalışırken iyice bunaldı.",
  "Sınıf kurallarına uymakta bazen zorlandı, hele grup çalışmalarında sınırları korumak hiç kolay olmadı onun için.",
  "Kitap, defter, kalem derken ders araçlarını eksiksiz getirmeyi sık sık unuttu, sürekli hatırlatmak durumunda kaldık.",
  "Derste not almayı henüz tam olarak alışkanlık haline getiremedi, bu yüzden tekrar yaparken zorlanıyor.",
  "İşin içine girdiğinde harika işler çıkarıyordu ama dikkati dağılınca yarıda bırakıp başka şeylere yöneliyordu.",
  "Söz alıp konuşmaktan çekindiği çok oldu, oysa anlatmaya başlayınca ne kadar güzel ifade ettiğini görüyoruz.",
  "Ders programına alışmakta zorlandı ama belli bir rutin oturtunca rahatladı ve işler yoluna girdi.",
  "Çalışma masası ve malzemeleri biraz dağınıktı, bu dağınıklık dikkatini dağıtıp toparlanmasını zorlaştırdı.",
  "Zorlandığı konularda hemen ‚yapamıyorum' deyip bırakıyordu, oysa biraz uğraşınca aslında yapabildiğini gördük.",
  "Ders sırasında arkadaşlarıyla konuşmaya dalıp dersi kaçırdığı anlar oldu, sonra ne olduğunu anlamak için uğraştı.",
  "İşleri son ana kadar erteleme huyu yüzünden hep son anda yetiştirme telaşı yaşadı, bu da işlerin kalitesini düşürdü.",
  "Derse hazırlıksız geldiğinde ilk on-on beş dakika toparlanmaya çalıştı, bu da dersin önemli kısmını kaçırmasına neden oldu.",
  "Kendini ifade etmekte zorlandı, özellikle tahtada veya topluluk önünde konuşması gerektiğinde iyice çekingenleşti.",
  "Anlamadığı yerleri sormaya çekindi, acaba ‚biliyorlarmış gibi' davranıp geçiştirdi, böylece eksikler birikti.",
  "Grup çalışmalarında kendi bildiğinde ısrar etti, ortak karar almak gerektiğinde esnemekte zorlandı.",
  "Hafta sonu çalışmalarını genelde ihmal etti, pazartesi geldiğinde önceki haftanın konularını unutmuş oluyordu.",
  "Motivasyonu bir gelip bir gidiyordu, iyi olduğu bir günün ertesi nedense hep düşüş yaşıyordu.",
  "Sınav anında heyecanlanıp bildiklerini unuttuğu oldu, oysa sınıfta çok güzel cevaplar veriyordu.",
  "Ders dışı uğraşları yüzünden bazen yorgun geliyordu, o günlerde derslerden verim alması çok zordu.",
  "Söylediklerimizi dikkate alıp hemen düzeltiyordu ama bu düzelmeler maalesef uzun süre kalıcı olmuyordu.",
  "Kendine güveni dalgalıydı, sevdiği konularda kendinden emindi ama diğerlerinde hemen geri çekiliyordu.",
  "Telefon, tablet gibi şeyler dikkatini çabuk dağıttı, ders çalışırken hep bir yerlerden dikkati kayıp gidiyordu.",
  "Hatalarını fark edince düzeltmek için uğraşıyordu ama bu çabası uzun soluklu olmuyordu maalesef.",
  "Sevdiği derslerde çok başarılıydı, gözlerinin içi parlıyordu ama sevmediği konularda aynı hevesi gösteremiyordu.",
  "Anlamadığı yerleri ‚sonra bakarım' diyerek geçiştirince konular birikti ve sonra başa çıkması çok zorlaştı.",
  "Kendine bir program yapması gerektiğini konuştuk, çok istedi ama uygulamaya gelince bir türlü tutturamadı.",
  "Sürekli ‚doğru mu yapıyorum' diye soruyordu, kendi başına karar vermekte ve çalışmakta zorlanıyordu.",
  "Neden çalışması gerektiğini tam bilmiyor gibiydi, hedefleri net olmayınca motivasyonu da düşük kaldı.",
  "Kalem, silgi derken ders araçlarını sık sık kaybediyor veya unutuyordu, bu da ders akışını bölüyordu.",
  "Kitap okuma alışkanlığı zayıf olunca, özellikle uzun metinleri anlamakta ve yorumlamakta zorlandı.",
  "Not almayı ihmal edince konuları sonradan hatırlaması ve tekrar etmesi epey zor oluyordu.",
  "Ders sırasında aklı başka yerlere gidiyordu, hayallere dalıp dersi kaçırdığı çok oldu.",
  "Uzun süre yerinde oturmakta zorlandı, sürekli kalkıp dolaşma ihtiyacı hissetti.",
  "Sessiz ortamda çok daha iyi çalışıyordu, kalabalık ve gürültülü ortamda dikkatini toplaması çok zordu.",
  "Kendini başkalarıyla kıyaslayıp motivasyonunu düşürüyordu, oysa kendi hızında ilerlemesi gerektiğini anlatmaya çalıştık.",
  "Ödev yaparken sık sık mola veriyor, bir türlü uzun süre çalışmaya odaklanamıyordu.",
  "Ders dışında zamanını planlamakta zorlandı, boş vakitlerini nasıl değerlendireceğini bilemedi.",
  "Düşüncelerini yazıya dökmekte zorlandı, anlatırken çok güzel ifade ederken yazınca kaybolup gidiyordu.",
  "Okuma hızı biraz düşüktü, bu yüzden sınavlarda soruları yetiştirmekte zorlandı.",
  "Soruları çözerken acele ediyor, adımları atlayınca da ufak tefek hatalar yapıyordu.",
  "Yeni bir şey öğrenirken hemen sonuç görmek istiyordu, olmayınca hevesi kaçıp bırakıyordu.",
  "Eleştirildiğinde kırılıyordu, oysa eleştirilerin gelişimi için önemli olduğunu zamanla anlayacak.",
  "Ezberleyerek çalışıyordu ama konuları gerçekten anlaması gerektiğini henüz tam kavrayamadı.",
  "Birebir ilgilenince çok güzel anlıyordu ama kalabalık içinde adeta kayboluyordu.",
  "Ders dışı ilgi alanları derslerinin önüne geçiyordu bazen, dengeyi kurmakta zorlandı.",
];

// Kapanış cümleleri - motive edici, yol gösterici, işbirlikçi
const closings = [
  "Beraber çalışıp düzenli takip edersek, onun çok daha iyi yerlere geleceğine yürekten inanıyorum.",
  "Küçük adımlarla gitmek, büyük hedeflere ulaşmanın en güzel yolu. Bunu aklımızdan çıkarmayalım.",
  "Önümüzdeki dönem evde de aynı çizgide olursak, bu zorlukların üstesinden hep birlikte geliriz.",
  "Düzenli ve kararlı olursa, bu eksiklikleri kapatacak gücü fazlasıyla var içinde.",
  "Yeni dönemde daha planlı gidersek, onun çok daha başarılı olacağına eminim.",
  "En önemlisi, ona güvendiğimizi hissettirmek. Küçük başarılarını takdir etmek bile büyük fark yaratıyor.",
  "Hedefleri netleştirip adım adım ilerlersek, önümüzdeki dönemi çok daha verimli geçireceğimize inanıyorum.",
  "Evde yapılacak kısa tekrarlar bile öğrendiklerinin kalıcı olması için çok önemli.",
  "Bence günlük kısa ama düzenli çalışma alışkanlığını bir an önce oturtması en doğrusu olacak.",
  "Beraber gerçekçi hedefler koyarsak, onu çok daha istekli ve motive göreceğimizi düşünüyorum.",
  "Sabırlı ve tutarlı olursak, bu zorlukları geride bırakıp çok daha güçlü bir şekilde yoluna devam edecek.",
  "Aile desteğiyle birleşince, [Öğrenci Adı]'nın hızla toparlanacağına yürekten inanıyorum.",
  "Yeni dönemde sık sık iletişimde kalırsak, bu alışkanlıkların kalıcı olmasına beraber yardımcı oluruz.",
  "Her çocuğun öğrenme hızı farklı, önemli olan pes etmeden devam etmesi.",
  "Gösterdiği çabanın karşılığını alması için kendine uygun bir çalışma ritmi bulması şart.",
  "Biraz daha destekle bu zorlukları aşacağına eminim, içinde o güç var.",
  "Kendine güveni geldikçe derslerinin de daha iyi olacağını göreceğiz.",
  "Hatalarından ders almayı biliyor, bu da onu daha da ileriye taşıyacak.",
  "Önümüzdeki dönem onun için yeni bir başlangıç olabilir, yeter ki bu fırsatı iyi kullanalım.",
  "Küçük hedeflerle başlayıp başardıkça özgüveni artacak, bu da başarısına yansıyacak.",
  "Bu zorlukları aşabileceğini biliyorum, biraz yönlendirme ve takip yeterli.",
  "Düzenli çalışma programına bağlı kalırsa kısa sürede büyük ilerleme kaydedecek.",
  "En önemlisi ona inandığımızı hissettirmek ve her adımda yanında olduğumuzu göstermek.",
  "Ona biraz daha sorumluluk verirsek kendi başına çalışma alışkanlığı da gelişecek.",
  "Beraber atacağımız adımlarla bu dönemi telafi edeceğine eminim.",
  "Gelişime açık bir öğrenci, doğru yönlendirmeyle eksiklerini hızla kapatacaktır.",
  "Kendi potansiyelinin farkına varınca durdurması çok zor olacak, buna eminim.",
  "Yeni dönemde daha sıkı iş birliği yaparsak bu hedeflere hep birlikte ulaşırız.",
  "Başarı bir gecede gelmiyor, küçük adımların birikimiyle ortaya çıkıyor.",
  "Yanında istikrarlı bir şekilde durursak bu zorlukları geride bırakacaktır.",
  "Küçük hedefler koyup başardıkça takdir etmek, motivasyonunu artıracaktır.",
  "Düzenli bir kontrol sistemi kurarsak, işleri erteleme alışkanlığını da kırarız.",
  "Evde sessiz bir çalışma ortamı oluşturmak, odaklanmasına çok yardımcı olacaktır.",
  "Her küçük ilerlemesini takdir etmek, özgüvenini artırıp başarısını yükseltecek.",
  "Yapılan plana sadık kalmak en büyük kazanımı olacak, bunu alışkanlık haline getirmeli.",
  "Unutmasın ki hata yapmak öğrenmenin bir parçası, önemli olan pes etmemek.",
  "Kendine uygun bir çalışma yöntemi bulursa dersler daha keyifli hale gelecek.",
];

// ============================================================
// POZİTİF (TEBRİK/ÖVGÜ) CÜMLE HAVUZU
// ============================================================

const positiveOpenings = [
  "[Öğrenci Adı] bu dönem gerçekten çok güzel işler çıkardı, kendisiyle gurur duyabilir.",
  "[Öğrenci Adı]'nın bu dönemki başarısı, düzenli ve disiplinli çalışmasının bir meyvesi oldu.",
  "[Öğrenci Adı]'yla bu dönem çalışmak gerçekten keyifliydi, sorumluluklarını çok güzel yerine getirdi.",
  "[Öğrenci Adı] bu dönem derslerdeki performansıyla hepimizi gururlandırdı.",
  "[Öğrenci Adı]'nın bu dönemki halini görünce, ne kadar doğru bir yolda ilerlediğini görmek mutluluk verici.",
  "[Öğrenci Adı] derslerine olan ilgisi ve gayretiyle bu dönem parlayan öğrencilerden biriydi.",
  "[Öğrenci Adı]'nın bu dönemki çalışma azmi ve kararlılığı takdire şayandı doğrusu.",
  "[Öğrenci Adı] bu dönem hem derslerinde hem de sınıf içindeki tutumuyla örnek bir öğrenci oldu.",
  "[Öğrenci Adı]'nın bu dönem gösterdiği gelişim gerçekten görülmeye değerdi, emeğinin karşılığını aldı.",
  "[Öğrenci Adı] ile bu dönem çalışırken onun ne kadar yetenekli ve çalışkan olduğuna bir kez daha şahit oldum.",
  "[Öğrenci Adı] derslerdeki başarısının yanı sıra arkadaşlarıyla olan ilişkileriyle de takdir topladı.",
  "[Öğrenci Adı]'nın bu dönemki başarısının sırrı düzenli çalışması ve dersleri asla aksatmamasıydı.",
  "[Öğrenci Adı] bu dönem kendini gerçekten çok geliştirdi, ilk günden bugüne büyük yol kat etti.",
  "[Öğrenci Adı]'nın derslere katılımı ve ödevlerine gösterdiği özen her zaman takdir edilesiydi.",
  "[Öğrenci Adı] ile bu dönem çalışmak bir öğretmen olarak bana da keyif verdi, gerçekten hep hazırdı.",
];

const positiveMiddles = [
  "Derslerine düzenli çalıştığı, ödevlerini zamanında ve özenle yaptığı için başarısı kaçınılmaz oldu.",
  "Sınıfta aktif rol alması, sorulara verdiği doğru cevaplar derslerin akışına çok güzel katkı sağladı.",
  "Arkadaşlarına karşı saygılı ve yardımsever tavrı, sınıfta örnek bir duruş sergilemesini sağladı.",
  "Anlamadığı konularda soru sormaktan çekinmemesi ve meraklı yapısı öğrenme hızını artırdı.",
  "Hem sözlü hem yazılı ifadede oldukça başarılıydı, düşüncelerini çok net ve güzel anlatıyor.",
  "Grup çalışmalarında hem liderlik yaptı hem de arkadaşlarının fikirlerine değer verdi.",
  "Derse her zaman hazırlıklı gelmesi ve konuları önceden okuması onu bir adım öne çıkardı.",
  "Zorlandığı konularda pes etmek yerine mücadele etmesi, en çok takdir ettiğim yönlerinden biriydi.",
  "Sınavlardaki başarısının yanında sınıf içi katılımıyla da beğeni topladı.",
  "Ders dışı aktivitelerle derslerini çok güzel dengeliyor, her alanda başarılı olmayı başarıyor.",
  "Kendine olan güveni ve pozitif enerjisi arkadaşlarına da ilham verdi.",
  "Ödevlerini sadece yapmakla kalmıyor, üzerine düşünüp araştırarak geliştiriyordu.",
  "Sorumluluk bilinci o kadar yüksekti ki hiçbir zaman hatırlatmaya ihtiyaç duymadık.",
  "Eleştirilere açık olması ve hatalarından ders çıkarması onu sürekli ileriye taşıdı.",
  "Özellikle sözlü ifade gerektiren durumlarda çok başarılıydı, düşüncelerini rahatlıkla ifade ediyordu.",
];

const positiveClosings = [
  "Böyle devam ederse önümüzdeki yıllarda çok daha büyük başarılara imza atacağına eminim.",
  "Kendisiyle ne kadar gurur duysak az, bu başarılı grafiğini sürdüreceğine inanıyorum.",
  "Böyle çalışkan ve azimli bir öğrenciye sahip olduğumuz için gerçekten çok şanslıyız.",
  "Bu dönem gösterdiği başarı, ilerleyen yıllar için çok güzel bir temel oluşturdu.",
  "Ailesine de bu başarısından dolayı teşekkür ederim, güzel yetiştirmişler.",
  "Kendisini yürekten tebrik ediyorum, emeklerinin karşılığını fazlasıyla aldı.",
  "Bu tempoyu korursa ileride çok güzel yerlere geleceğine şüphem yok.",
  "İstikrarlı çalışması ve pozitif tutumuyla hepimize örnek oldu.",
  "Dilerim bu başarılı grafiği önümüzdeki yıllarda da aynı şekilde devam eder.",
  "Onun gibi çalışkan ve saygılı öğrenciler yetiştirmek en büyük öğretmen mutluluğu.",
  "Başarılarının devamını diliyorum, kendisiyle gurur duyuyorum.",
  "Özverili çalışması ve güzel ahlakıyla her zaman takdiri hak etti.",
];

// ============================================================
// 8. SINIF (OKUL BİTİŞİ / GELECEK YIL) KAPANIŞLARI
// ============================================================

const grade8Closings = [
  "Lise hayatında da aynı başarıyı göstereceğine, [Öğrenci Adı]'na olan inancım tam.",
  "Ortaokulu tamamlarken, lise döneminde de aynı gayretle çalışırsa çok başarılı olacağına eminim.",
  "İlkokuldan bugüne kadar geçen sürede gösterdiği gelişim gerçekten takdire değer, lisede de aynı azmi gösterecektir.",
  "Ortaokul yıllarını başarıyla tamamlayan [Öğrenci Adı]'nın lisede de aynı çizgide ilerleyeceğine inanıyorum.",
  "Tüm ortaokul hayatı boyunca gösterdiği çaba ve gayret, lise için sağlam bir temel oluşturdu.",
  "Ortaokul yıllarını geride bırakırken, yeni okul hayatında başarılarının katlanarak devam edeceğine eminim.",
  "Bu dönemle birlikte ortaokul macerası sona eriyor. [Öğrenci Adı]'na yeni okul hayatında başarılar diliyorum.",
  "Ortaokulu bitirirken kazandığı bu güzel alışkanlıklar, lisede onun en büyük yardımcısı olacak.",
];

const grade8ClosingsNegative = [
  "Ortaokul yılları bitti ama lisede yeni bir başlangıç yapacağız. Bu eksikleri gidermek için hâlâ vaktimiz var.",
  "Ortaokulu geride bırakırken, lisede bu alışkanlıkları düzeltmesi için kendine bir söz vermeli.",
  "Yeni bir okul, yeni bir başlangıç demek. [Öğrenci Adı] lisede çok daha iyi yerlere gelebilir.",
  "Ortaokul yılları boyunca yaşadığımız bu zorlukları geride bırakıp lisede yeni bir sayfa açabiliriz.",
  "Ortaokul bitti, önünde kocaman bir lise hayatı var. Bu fırsatı iyi değerlendirirse her şeyi düzeltebilir.",
];

// ============================================================
// YORUM ÜRETME
// ============================================================

function generateUniqueComment(id, fileSeed, tone, fileName) {
  const seed = fileSeed + id * 31;
  const isPositive = tone === 'olumlu';
  const isGrade8 = fileName.startsWith('8_');
  
  const useOpenings = isPositive ? positiveOpenings : openings;
  const useMiddles = isPositive ? positiveMiddles : middles;
  
  const openIdx = Math.abs((seed * 13)) % useOpenings.length;
  let midIdx1 = Math.abs((seed * 17 + 3)) % useMiddles.length;
  let midIdx2 = Math.abs((seed * 23 + 7)) % useMiddles.length;
  while (midIdx2 === midIdx1) {
    midIdx2 = (midIdx2 + 1) % useMiddles.length;
  }
  
  // Select closing based on context
  let useClosings;
  if (isPositive) {
    useClosings = isGrade8 ? [...positiveClosings, ...grade8Closings] : positiveClosings;
  } else {
    useClosings = isGrade8 ? [...closings, ...grade8ClosingsNegative] : closings;
  }
  const closeIdx = Math.abs((seed * 29 + 11)) % useClosings.length;
  
  const strategy = Math.abs(seed) % 6;
  
  const m1 = useMiddles[midIdx1];
  const m2 = useMiddles[midIdx2];
  
  let parts = [];
  
  if (strategy === 0) {
    parts.push(useOpenings[openIdx], m1, m2, useClosings[closeIdx]);
  } else if (strategy === 1) {
    parts.push(useOpenings[openIdx], m2, m1, useClosings[closeIdx]);
  } else if (strategy === 2) {
    parts.push(useOpenings[openIdx], m1, useClosings[closeIdx]);
  } else if (strategy === 3) {
    parts.push(useOpenings[openIdx], m2, `Bunun yanı sıra ${m1.charAt(0).toLowerCase() + m1.slice(1)}`, useClosings[closeIdx]);
  } else if (strategy === 4) {
    parts.push(useOpenings[openIdx], m1, `Ayrıca ${m2.charAt(0).toLowerCase() + m2.slice(1)}`, useClosings[closeIdx]);
  } else {
    const m3 = useMiddles[Math.abs((midIdx1 + midIdx2 + seed)) % useMiddles.length];
    parts.push(useOpenings[openIdx], m1, m3, useClosings[closeIdx]);
  }
  
  return parts.join(' ').replace('‌', '');
}

// ============================================================
// ANA FONKSİYON
// ============================================================

const files = [
  '5_1.json', '5_2.json',
  '6_1.json', '6_2.json',
  '7_1.json', '7_2.json',
  '8_1.json', '8_2.json'
];

for (const fileName of files) {
  const filePath = resolve(YORUMLAR_DIR, fileName);
  const data = JSON.parse(readFileSync(filePath, 'utf-8'));
  const fileSeed = parseInt(fileName.replace(/[^0-9]/g, '')) * 100;
  
  for (const item of data) {
    const comment = generateUniqueComment(item.id, fileSeed, item.tone, fileName);
    item.content = comment;
    item.icerik = comment;
  }
  
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ ${fileName}: ${data.length} yorum güncellendi.`);
}

console.log('\n🎉 Tüm yorumlar başarıyla doğallaştırıldı!');
