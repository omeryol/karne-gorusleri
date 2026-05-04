import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const yorumlarDir = path.join(rootDir, 'yorumlar');

const APPEND_COUNT_PER_FILE = 400;
const PLACEHOLDER = '[Öğrenci Adı]';
const gradeNotes = {
  '5': 'ortaokula yeni adımlarında',
  '6': 'ortaokul düzenini oturtma sürecinde',
  '7': 'sınav temposunun arttığı bu dönemde',
  '8': 'LGS ve lise geçiş hazırlığında',
};

const termNotes = {
  '1': 'ilk dönemde',
  '2': 'ikinci dönemde',
};

const focusPool = [
  'dikkat',
  'ödev takibi',
  'katılım',
  'özgüven',
  'planlama',
  'sorumluluk',
  'okuma alışkanlığı',
  'iletişim',
  'iş birliği',
  'zaman yönetimi',
];

const warmOpeners = [
  `${PLACEHOLDER}, sınıfta sıcak tavrıyla hemen fark ediliyor`,
  `${PLACEHOLDER}, sınıfa geldiğinde enerjisiyle ortamı toparlıyor`,
  `${PLACEHOLDER}, iyi niyeti ve içtenliğiyle güzel bir iz bırakıyor`,
  `${PLACEHOLDER}, gayretiyle "ben buradayım" diyen öğrencilerimizden`,
  `${PLACEHOLDER}, adım adım ilerleyip emek veren bir öğrenci`,
  `${PLACEHOLDER}, güler yüzüyle öğrenme ortamına katkı sunuyor`,
  `${PLACEHOLDER}, öğrenme isteğiyle öğretmeni mutlu eden öğrencilerden`,
  `${PLACEHOLDER}, çabasıyla her hafta biraz daha güçleniyor`,
  `${PLACEHOLDER}, sakin ama kararlı duruşuyla ilerliyor`,
  `${PLACEHOLDER}, sınıf iklimine pozitif katkı veriyor`,
];

const positiveStrengths = [
  'konuları kavrama hızı artıyor',
  'ödevlerini daha düzenli tamamlıyor',
  'söz alıp fikrini paylaşma cesareti gelişiyor',
  'sorumluluk bilincini görünür şekilde artırıyor',
  'planlı çalıştığında çok iyi sonuç alıyor',
  'grup çalışmalarında daha yapıcı rol üstleniyor',
  'öğrenme motivasyonunu korumayı başarıyor',
  'küçük hedeflerle büyük ilerleme yakalıyor',
  'derse hazırlıklı gelme alışkanlığı güçleniyor',
  'kendini ifade ederken daha net davranıyor',
];

const neutralStrengths = [
  'potansiyeli güçlü ve doğru yönlendirmeyle daha da açılıyor',
  'iyi bir temele sahip, düzenli tekrar ile ivme kazanıyor',
  'bazı günler çok iyi, bazı günler dalgalı bir performans gösteriyor',
  'öğrenmeye açık bir yapısı var, rutine ihtiyaç duyuyor',
  'ders içi katılımı arttıkça başarısı belirginleşiyor',
  'kendi hızında ilerliyor, istikrarı artarsa çok iyi olacak',
  'sosyal uyumu iyi, akademik tarafta küçük dokunuşlara ihtiyaç var',
  'temel becerileri yeterli, planlamayla daha rahat edecek',
  'çabası var, bu çabayı günlük düzene yayması gerekiyor',
  'ödev ve tekrar dengesini kurdukça daha rahatlıyor',
];

const cautionStrengths = [
  'dikkatini toplamakta zaman zaman zorlanıyor',
  'ödev takibinde süreklilik sorunu yaşayabiliyor',
  'kurallara uyumda hatırlatmaya ihtiyaç duyuyor',
  'çalışma düzenini korumakta zorlandığı günler oluyor',
  'ders sırasında odak kaybı yaşadığında geride kalabiliyor',
  'sorumluluklarını ertelediğinde performansı düşüyor',
  'duygusal dalgalanmalar nedeniyle temposu yavaşlayabiliyor',
  'sözlü katılımda çekingenlik nedeniyle kendini geri çekebiliyor',
  'zaman yönetiminde desteğe ihtiyaç duyuyor',
  'defter ve materyal düzenini sürdürmekte zorlanabiliyor',
];

const babacanGuidance = [
  'Küçük ama düzenli adımlar atarsa çok daha rahat edeceğini biliyorum.',
  'Biraz plan, biraz sabır, biraz da takip ile güzel bir sıçrama yapacaktır.',
  'Evde kısa tekrarlarla desteklendiğinde sınıfta özgüveni daha da artacaktır.',
  'Onu acele ettirmeden ama düzenli takip ederek güçlü bir ritim yakalayabiliriz.',
  'Beraber koyacağımız net ve ulaşılabilir hedefler oldukça etkili olacaktır.',
  'Her gün az da olsa tekrar yapması, büyük fark yaratacaktır.',
  'Tatlı-sert hatırlatmalarla sorumluluk alışkanlığı hızla oturacaktır.',
  'Rutinini bozmadığında başarısının yükseldiğini kendisi de fark edecektir.',
  'Ailece tutarlı destek verilmesi süreci çok daha sağlıklı hale getirecektir.',
  'Ufak bir programla hem yorulmadan hem verimli ilerlemesi mümkündür.',
];

const playfulNudges = [
  'Minik bir not: Ödevler kendi kendine yapılmıyor, kalemi yine bizim kahraman tutuyor.',
  'Kibar bir hatırlatma: Plan yapınca dersler "zor boss" olmaktan çıkıyor.',
  'Tatlı bir uyarı: Erteleme alışkanlığı çok konuşuyor, ama biz ondan daha kararlıyız.',
  'Gülümseten gerçek: Düzenli tekrar, sınav haftasının gizli süper gücüdür.',
  'Minik espri bir yana, istikrar bu işin anahtarıdır.',
  'Günlük 20-25 dakika çalışma, son dakika panik filmini iptal eder.',
  'Defterler düzenli olunca zihin de "oh" demeye başlar.',
  'Bazen küçük bir çizelge, büyük bir rahatlama sağlar.',
  'İpucu: Önce kısa hedef, sonra keyifli mola; denge her zaman kazanır.',
  'Planlı ilerleyince öğrenme daha az yorucu, daha çok keyifli olur.',
];

const closingBoost = [
  'Kendisine güveniyoruz ve gelişimini memnuniyetle izliyoruz.',
  'Doğru destekle çok daha iyi bir tablo göreceğimize inanıyorum.',
  'Emek vermeye devam ettiği sürece güzel sonuçlar gelecektir.',
  'Kararlı adımlarını sürdürdüğünde hedeflerine rahatlıkla yaklaşacaktır.',
  'İstikrarlı çalışmasıyla güçlü bir dönem tamamlayabilir.',
  'Gelişime açık tutumu en kıymetli gücüdür.',
  'Bu ivmeyi koruması halinde daha parlak bir süreç yaşayacaktır.',
  'Öğrenme yolculuğunda yanında olduğumuzu bilmesini isterim.',
  'Azmi ve emeği, başarısının en sağlam temeli olacaktır.',
  'Düzenli emekle kendini her alanda ileri taşıyabilir.',
];

function pick(arr, i, offset = 0) {
  return arr[(i + offset) % arr.length];
}

function inferTone(i) {
  const cycle = ['olumlu', 'notr', 'olumlu', 'notr', 'olumsuz'];
  return cycle[i % cycle.length];
}

function inferLengthType(i) {
  return i % 2 === 0 ? 'kisa' : 'uzun';
}

function toneSummary(tone) {
  if (tone === 'olumlu') {
    return 'olumlu';
  }
  if (tone === 'olumsuz') {
    return 'olumsuz';
  }
  return 'notr';
}

function createTags({ grade, term, tone, lengthType, i }) {
  const styleTags = ['samimi', 'babacan', 'şefkatli', 'uyarici', 'hafif-esprili'];
  const focusA = pick(focusPool, i, 1);
  const focusB = pick(focusPool, i, 4);
  const toneTag = tone === 'olumlu' ? 'motive-edici' : tone === 'olumsuz' ? 'destek-gerektiren' : 'dengeleyici';

  return [
    `sinif-${grade}`,
    `donem-${term}`,
    toneTag,
    lengthType,
    ...styleTags,
    focusA,
    focusB,
  ];
}

function buildShortComment({ grade, term, tone, i }) {
  const opener = pick(warmOpeners, i);
  const strength = tone === 'olumlu'
    ? pick(positiveStrengths, i, 2)
    : tone === 'olumsuz'
      ? pick(cautionStrengths, i, 2)
      : pick(neutralStrengths, i, 2);
  const guidance = pick(babacanGuidance, i, 3);
  const playful = pick(playfulNudges, i, 1);

  if (tone === 'olumsuz') {
    return `${opener}. ${termNotes[term]} ${strength}. ${guidance} ${playful}`;
  }

  return `${opener}. ${gradeNotes[grade]} ${strength}. ${playful}`;
}

function buildLongComment({ grade, term, tone, i }) {
  const opener = pick(warmOpeners, i, 1);
  const strength = tone === 'olumlu'
    ? pick(positiveStrengths, i, 3)
    : tone === 'olumsuz'
      ? pick(cautionStrengths, i, 3)
      : pick(neutralStrengths, i, 3);
  const guidance = pick(babacanGuidance, i, 5);
  const playful = pick(playfulNudges, i, 2);
  const close = pick(closingBoost, i, 4);

  const toneClause = tone === 'olumlu'
    ? 'Bu tablo, doğru çalışma ritmiyle daha da güçlenebilir.'
    : tone === 'olumsuz'
      ? 'Bu noktada düzenli takip ve tutarlı destek kritik önem taşıyor.'
      : 'Düzenli tekrar ve planlı ilerleme ile performansı daha dengeli hale gelecektir.';

  return `${opener}. ${termNotes[term]} ${strength}. ${guidance} ${toneClause} ${playful} ${close}`;
}

function sanitizeContent(content) {
  return content
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,!?;:])/g, '$1')
    .trim();
}

function generateTemplate({ id, grade, term, i }) {
  const tone = inferTone(i);
  const lengthType = inferLengthType(i);
  const content = lengthType === 'kisa'
    ? buildShortComment({ grade, term, tone, i })
    : buildLongComment({ grade, term, tone, i });

  return {
    id,
    content: sanitizeContent(content),
    tone: toneSummary(tone),
    etiketler: createTags({ grade, term, tone, lengthType, i }),
    lengthType,
  };
}

function nextId(templates) {
  return templates.reduce((max, item) => Math.max(max, Number(item?.id) || 0), 0) + 1;
}

const files = fs.readdirSync(yorumlarDir).filter((f) => /^\d_\d\.json$/.test(f)).sort();

for (const file of files) {
  const fullPath = path.join(yorumlarDir, file);
  const raw = fs.readFileSync(fullPath, 'utf8');
  const data = JSON.parse(raw);
  const templates = Array.isArray(data) ? data : Array.isArray(data?.yorumlar) ? data.yorumlar : [];

  const [grade, termWithExt] = file.split('_');
  const term = termWithExt.replace('.json', '');
  const nextTemplates = [...templates];
  let i = nextTemplates.length;
  let id = nextId(nextTemplates);
  let appended = 0;

  while (appended < APPEND_COUNT_PER_FILE) {
    nextTemplates.push(generateTemplate({ id, grade, term, i }));
    id += 1;
    i += 1;
    appended += 1;
  }

  fs.writeFileSync(fullPath, JSON.stringify(nextTemplates, null, 2) + '\n', 'utf8');
  console.log(`${file}: ${nextTemplates.length} yorum (eklenen ${appended})`);
}

console.log(`Tum dosyalara ${APPEND_COUNT_PER_FILE} yeni yorum eklendi.`);

