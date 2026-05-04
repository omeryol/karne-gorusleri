import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const yorumlarDir = path.join(rootDir, 'yorumlar');
const reportsDir = path.join(rootDir, 'reports');

const PLACEHOLDER = '[Öğrenci Adı]';

const termText = {
  '1': 'bu ilk dönemde',
  '2': 'bu ikinci dönemde',
};

const gradeHint = {
  '5': 'ortaokula alışma sürecinde',
  '6': 'ders düzenini oturturken',
  '7': 'konular yoğunlaşırken',
  '8': 'sınav temposu artmışken',
};

const openingByTone = {
  olumlu: [
    `${PLACEHOLDER} ${'${term}'} gayet iyi bir çizgideydi`,
    `${PLACEHOLDER} ${'${term}'} sınıfta yüz güldürdü`,
    `${PLACEHOLDER} ${'${term}'} emek verdi ve karşılığını aldı`,
    `${PLACEHOLDER} ${'${term}'} istekli bir tablo çizdi`,
    `${PLACEHOLDER} ${'${term}'} derse sıcak yaklaştı`,
    `${PLACEHOLDER} ${'${term}'} beklediğimizden daha toparlayıcı bir dönem geçirdi`,
    `${PLACEHOLDER} ${'${term}'} adım adım ama sağlam ilerledi`,
    `${PLACEHOLDER} ${'${term}'} sınıf içi tutumuyla olumlu bir hava oluşturdu`,
  ],
  notr: [
    `${PLACEHOLDER} ${'${term}'} genel olarak dengeliydi`,
    `${PLACEHOLDER} ${'${term}'} bazı günler çok iyi, bazı günler daha desteğe açık ilerledi`,
    `${PLACEHOLDER} ${'${term}'} dönem boyunca iniş çıkışlar yaşadı`,
    `${PLACEHOLDER} ${'${term}'} elinden geleni yaptı ama düzeni tam oturtamadı`,
    `${PLACEHOLDER} ${'${term}'} temel olarak iyi bir seviyede ilerledi`,
    `${PLACEHOLDER} ${'${term}'} genel tabloyu korudu ama bazı alanlarda desteğe açık kaldı`,
    `${PLACEHOLDER} ${'${term}'} çaba gösterdi, düzen tarafında ise dalgalanmalar yaşadı`,
    `${PLACEHOLDER} ${'${term}'} yer yer çok iyi, yer yer yavaş ilerledi`,
  ],
  olumsuz: [
    `${PLACEHOLDER} ${'${term}'} beklediğimiz seviyenin altında kaldı`,
    `${PLACEHOLDER} ${'${term}'} zorlandı`,
    `${PLACEHOLDER} ${'${term}'} dikkat ve ödev takibinde sıkıntı yaşadı`,
    `${PLACEHOLDER} ${'${term}'} düzen kurmakta zorlandığı bir dönem geçirdi`,
    `${PLACEHOLDER} ${'${term}'} desteğe daha çok ihtiyaç duydu`,
    `${PLACEHOLDER} ${'${term}'} istediğimiz düzeye henüz yaklaşamadı`,
    `${PLACEHOLDER} ${'${term}'} toparlanmak için daha net bir plana ihtiyaç duydu`,
    `${PLACEHOLDER} ${'${term}'} ders sürecinde sık sık zorlayıcı anlar yaşadı`,
  ],
};

const middleByTone = {
  olumlu: [
    'Katılımı arttıkça derslerdeki rahatlığı da arttı.',
    'Ödevlerini çoğunlukla zamanında tamamladı.',
    'Yanlış yaptığında hızla toparlayıp devam etti.',
    'Sınıf içindeki uyumu ve saygılı tavrı olumlu yansıdı.',
    'Düzenli çalıştığı haftalarda çok net fark yarattı.',
    'Soru sormaktan çekinmediği için konuları daha hızlı kavradı.',
    'Derse hazırlıklı geldiği günlerde farkını açıkça gösterdi.',
    'Arkadaşlarıyla uyumlu olması sınıf içi çalışmaları kolaylaştırdı.',
    'Verilen geri bildirimleri hızlıca uygulamaya aldı.',
  ],
  notr: [
    'Düzenli olduğu günlerde güzel ilerledi, kopunca tempo düştü.',
    'Ödev tarafında kısa hatırlatmalar işe yarıyor.',
    'Katılımı artınca dersi anlama hızı da artıyor.',
    'Dikkat dağınıklığı yaşadığı anlarda geri kalabiliyor.',
    'Planlı çalışmayı sürdürdüğünde daha rahat ediyor.',
    'Küçük hedeflerle ilerlediğinde daha az zorlanıyor.',
    'Hatırlatma geldiğinde daha hızlı toparlanıyor.',
    'Önce kolay olandan başlayınca çalışma isteği artıyor.',
    'Konu tekrarlarını kısa tutunca daha verimli ilerliyor.',
  ],
  olumsuz: [
    'Ödev ve ders takibinde süreklilik sağlayamadı.',
    'Dikkatini toplamakta zorlandığı için ders akışından koptu.',
    'Sorumluluklarını ertelediğinde öğrenme temposu düştü.',
    'Kuralları ve sınıf düzenini sürdürme konusunda desteğe ihtiyaç duydu.',
    'Plansız ilerlediğinde ders yükü daha da zorlayıcı hale geldi.',
    'Kısa tekrarları atladığında konular üst üste birikti.',
    'Derse hazırlıksız geldiği günlerde kopmalar arttı.',
    'Sınıf içi görevleri zamanında tamamlamakta zorlandı.',
    'Not tutma ve düzen tarafında daha sık destek ihtiyacı oldu.',
  ],
};

const actionByTone = {
  olumlu: [
    'Bu güzel çizgiyi korumak için evde kısa tekrarlar devam ederse çok iyi olur.',
    'Aynı düzenle giderse önümüzdeki dönemde de güçlü sonuçlar alır.',
    'Kısa ama düzenli çalışma alışkanlığı bu başarıyı kalıcı hale getirir.',
    'Evde 20-25 dakikalık tekrar rutini işini daha da kolaylaştırır.',
    'Düzenli bir haftalık planla bu ivmeyi uzun süre koruyabilir.',
    'Aile desteği devam ettikçe bu olumlu tablo daha da güçlenir.',
  ],
  notr: [
    'Evde kısa bir günlük planla bu iniş çıkışları azaltabiliriz.',
    'Net ve küçük hedefler koyarsak toparlanması hızlanır.',
    'Düzenli tekrar ve ödev takibiyle daha rahat bir seviyeye gelir.',
    'Kısa ama sürekli çalışma bu dönemde en etkili destek olur.',
    'Konu tekrarını haftaya yayarsak daha az yorularak ilerler.',
    'Günlük küçük sorumluluk listesi toparlanmasını kolaylaştırır.',
  ],
  olumsuz: [
    'Bu noktada ev-okul aynı çizgide ilerlerse toparlanma hızlanır.',
    'Günlük kısa çalışma planı ve düzenli kontrol şart görünüyor.',
    'Önce temel düzeni kurup sonra adım adım ilerlemek en doğru yol olur.',
    'Kısa hedefler ve net takip, süreci daha yönetilebilir hale getirir.',
    'Önce ödev düzenini kurup sonra ders hızını artırmak daha doğru olur.',
    'Haftalık kontrol listesi ile unutmaların önüne geçebiliriz.',
  ],
};

const hopefulClosings = [
  'Düzenli destekle bunu toparlayabileceğine inanıyoruz.',
  'Sabırlı ve kararlı gidersek güzel bir ilerleme göreceğiz.',
  'Birlikte aynı çizgide kaldığımızda sonuçlar hızla iyileşir.',
  'Doğru takip ile daha iyi bir döneme geçiş yapabilir.',
  'Adım adım gidersek rahatça toparlar.',
  'Doğru planla kısa sürede daha güvenli bir ritim yakalar.',
  'İstikrarlı takip olursa gelişimi gözle görülür hale gelir.',
  'Sakin ama düzenli bir programla çok daha iyi bir noktaya gelir.',
];

const playfulNudges = [
  'Küçük not: Ödevler son dakikayı pek sevmiyor.',
  'Tatlı hatırlatma: Kısa tekrar, son hafta telaşını azaltır.',
  'Plan olunca ders yükü daha hafif geliyor.',
  'Az ama düzenli çalışma her zaman daha çok işe yarıyor.',
  'Kısa hedefler, büyük karmaşayı önlüyor.',
  'Ufak bir plan, büyük bir rahatlama sağlar.',
  'Dersler maraton gibi; düzenli tempo her zaman kazandırır.',
  'İşi parçalara bölünce hem daha kolay hem daha kalıcı oluyor.',
];

const bridgeByTone = {
  olumlu: [
    'Bunu özellikle son haftalarda daha net gördük.',
    'Süreç boyunca bu olumlu hava korunabildi.',
    'Dönem geneline baktığımızda bu gelişim belirgindi.',
    'Özellikle sınıf içi uygulamalarda bu fark ortaya çıktı.',
  ],
  notr: [
    'Bu yüzden dönem içinde iniş çıkışlar dikkat çekti.',
    'Bazı haftalar güçlü, bazı haftalar daha yavaş geçti.',
    'Dönem boyunca aynı tempoyu korumak kolay olmadı.',
    'Özellikle yoğun haftalarda daha çok desteğe ihtiyaç duydu.',
  ],
  olumsuz: [
    'Bu durum dönem sonucunu doğrudan etkiledi.',
    'Bu tabloyu değiştirmek için net adımlara ihtiyaç var.',
    'Böyle olunca öğrenme süreci de yavaşladı.',
    'Bu noktada düzen kurmak en öncelikli adım oldu.',
  ],
};

const jargonMap = new Map([
  ['akademik', 'ders'],
  ['performans', 'gidişat'],
  ['potansiyel', 'yapabilecek güç'],
  ['motivasyon', 'istek'],
  ['süreklilik', 'düzen'],
  ['ivme', 'tempo'],
  ['rutin', 'düzen'],
  ['optimizasyon', 'iyileştirme'],
]);

function pick(arr, i, shift = 0) {
  return arr[(i + shift) % arr.length];
}

function hashSeed(value) {
  const input = String(value || '');
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededIndex(length, seed, salt) {
  const mixed = hashSeed(`${seed}:${salt}`);
  return mixed % Math.max(1, length);
}

function seededPick(arr, seed, salt) {
  return arr[seededIndex(arr.length, seed, salt)];
}

function normalizeTone(v) {
  const tone = String(v || '').toLowerCase();
  if (tone === 'olumlu' || tone === 'notr' || tone === 'olumsuz') return tone;
  return 'notr';
}

function normalizeLength(v) {
  const s = String(v || '').toLowerCase();
  return s === 'kisa' || s === 'kısa' ? 'kisa' : 'uzun';
}

function normalizeTag(tag) {
  return String(tag || '')
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
}

function toneByTags(existingTone, tags = []) {
  const normalizedTags = tags.map(normalizeTag);
  if (normalizedTags.some((tag) => tag.includes('destek-gerektiren'))) {
    return 'olumsuz';
  }
  if (normalizedTags.some((tag) => tag.includes('motive-edici'))) {
    return 'olumlu';
  }
  return existingTone;
}

function simplifyJargon(content) {
  let result = String(content || '');
  for (const [from, to] of jargonMap.entries()) {
    const rgx = new RegExp(`\\b${from}\\b`, 'gi');
    result = result.replace(rgx, to);
  }
  return result;
}

function sentenceCap(content, maxSentence = 5) {
  const parts = String(content || '')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (parts.length <= maxSentence) return parts.join(' ');
  return parts.slice(0, maxSentence).join(' ');
}

function cleanup(content) {
  return String(content || '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,!?;:])/g, '$1')
    .replace(/düzenı/gi, 'düzeni')
    .trim();
}

function buildContent({ tone, lengthType, grade, term, i, id, tags }) {
  const termPhrase = termText[term] || 'bu dönemde';
  const gradePhrase = gradeHint[grade] || 'ders sürecinde';
  const seed = `${grade}_${term}_${id}_${i}_${(tags || []).join('|')}`;

  const opening = `${seededPick(openingByTone[tone] || openingByTone.notr, seed, 'opening').replace(/\$\{term\}/g, termPhrase)}.`;
  const middleOptions = middleByTone[tone] || middleByTone.notr;
  const middle1 = seededPick(middleOptions, seed, 'middle1');
  let middle2 = seededPick(middleOptions, seed, 'middle2');
  if (middle2 === middle1) {
    middle2 = seededPick(middleOptions, seed, 'middle3');
  }
  const action = seededPick(actionByTone[tone] || actionByTone.notr, seed, 'action');
  const playful = seededPick(playfulNudges, seed, 'playful');
  const bridge = seededPick(bridgeByTone[tone] || bridgeByTone.notr, seed, 'bridge');

  const longTail = tone === 'olumsuz'
    ? `${seededPick(hopefulClosings, seed, 'hopeful')}`
    : `${gradePhrase} bu tempoyu koruması çok önemli.`;

  const base = lengthType === 'kisa'
    ? `${opening} ${middle1} ${action}`
    : `${opening} ${middle1} ${bridge} ${middle2} ${action} ${playful} ${longTail}`;

  return cleanup(sentenceCap(simplifyJargon(base), lengthType === 'kisa' ? 3 : 5));
}

function ensureNegativeHope(content, tone, i) {
  if (tone !== 'olumsuz') return content;
  if (/inanıyoruz|iyileş|toparla|güzel bir ilerleme|daha iyi/i.test(content)) return content;
  return `${content} ${pick(hopefulClosings, i, 2)}`;
}

function buildSimilarityKey(content) {
  return cleanup(content)
    .toLowerCase()
    .replace(/\[öğrenci adı\]/gi, '')
    .replace(/[^a-z0-9çğıöşü\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function ensureVariation(content, usedKeys, tone, lengthType, grade, term, i) {
  let next = content;
  let key = buildSimilarityKey(next);
  let guard = 0;

  while (usedKeys.has(key) && guard < 5) {
    const extra = tone === 'olumlu'
      ? pick(actionByTone.olumlu, i, guard + 3)
      : tone === 'olumsuz'
        ? pick(actionByTone.olumsuz, i, guard + 4)
        : pick(actionByTone.notr, i, guard + 2);
    const alt = pick(bridgeByTone[tone] || bridgeByTone.notr, i, guard + 5);
    next = cleanup(`${next} ${extra} ${alt}`);
    next = sentenceCap(next, lengthType === 'kisa' ? 3 : 5);
    key = buildSimilarityKey(next);
    guard += 1;
  }

  return next;
}

function calculateReadabilityScore(content) {
  const sentenceCount = String(content).split(/[.!?]+/).filter((s) => s.trim().length > 0).length || 1;
  const wordCount = String(content).split(/\s+/).filter(Boolean).length;
  const averageSentence = wordCount / sentenceCount;

  // 8-15 kelime/sentence araligi hedefleniyor.
  const penalty = Math.abs(11.5 - averageSentence);
  return Math.max(0, Number((100 - penalty * 7).toFixed(1)));
}

const report = {
  generatedAt: new Date().toISOString(),
  files: {},
  totals: {
    comments: 0,
    duplicates: 0,
    avgReadability: 0,
  },
};

const files = fs.readdirSync(yorumlarDir).filter((f) => /^\d_\d\.json$/.test(f)).sort();

for (const file of files) {
  const fullPath = path.join(yorumlarDir, file);
  const raw = fs.readFileSync(fullPath, 'utf8');
  const data = JSON.parse(raw);
  const arr = Array.isArray(data) ? data : Array.isArray(data?.yorumlar) ? data.yorumlar : [];

  const [grade, termPart] = file.split('_');
  const term = termPart.replace('.json', '');
  const usedKeys = new Set();
  let duplicateCount = 0;
  let readabilitySum = 0;

  const rewritten = arr.map((item, i) => {
    const baseTone = normalizeTone(item?.tone || item?.ton);
    const tone = toneByTags(baseTone, Array.isArray(item?.etiketler) ? item.etiketler : []);
    const lengthType = normalizeLength(item?.lengthType || item?.length);
    const draft = buildContent({ tone, lengthType, grade, term, i, id: item?.id || i + 1, tags: item?.etiketler || item?.tags || [] });
    const hopeful = ensureNegativeHope(draft, tone, i);
    const varied = ensureVariation(hopeful, usedKeys, tone, lengthType, grade, term, i);
    const finalContent = cleanup(varied);
    const similarityKey = buildSimilarityKey(finalContent);

    if (usedKeys.has(similarityKey)) {
      duplicateCount += 1;
    }
    usedKeys.add(similarityKey);

    const readability = calculateReadabilityScore(finalContent);
    readabilitySum += readability;

    return {
      ...item,
      content: finalContent,
      tone,
      lengthType,
    };
  });

  fs.writeFileSync(fullPath, JSON.stringify(rewritten, null, 2) + '\n', 'utf8');
  report.files[file] = {
    comments: rewritten.length,
    duplicates: duplicateCount,
    avgReadability: Number((readabilitySum / Math.max(1, rewritten.length)).toFixed(1)),
  };

  report.totals.comments += rewritten.length;
  report.totals.duplicates += duplicateCount;
  report.totals.avgReadability += report.files[file].avgReadability;

  console.log(`${file}: ${rewritten.length} yorum gundelik dile cevrildi`);
}

report.totals.avgReadability = Number((report.totals.avgReadability / Math.max(1, files.length)).toFixed(1));

if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

const reportJsonPath = path.join(reportsDir, 'colloquial-quality-report.json');
const reportMdPath = path.join(reportsDir, 'colloquial-quality-report.md');

fs.writeFileSync(reportJsonPath, JSON.stringify(report, null, 2) + '\n', 'utf8');

const lines = [
  '# Gundelik Dil Kalite Raporu',
  '',
  `- Toplam yorum: ${report.totals.comments}`,
  `- Tahmini tekrar sayisi: ${report.totals.duplicates}`,
  `- Ortalama okunabilirlik puani: ${report.totals.avgReadability}`,
  '',
  '## Dosya Bazinda',
  '',
  '| Dosya | Yorum | Tekrar | Okunabilirlik |',
  '| --- | ---: | ---: | ---: |',
  ...Object.entries(report.files).map(([fileName, stats]) => `| ${fileName} | ${stats.comments} | ${stats.duplicates} | ${stats.avgReadability} |`),
  '',
];

fs.writeFileSync(reportMdPath, `${lines.join('\n')}\n`, 'utf8');

console.log('Tum yorumlar gundelik ve sade dile donusturuldu.');
console.log(`Rapor yazildi: ${reportJsonPath}`);
