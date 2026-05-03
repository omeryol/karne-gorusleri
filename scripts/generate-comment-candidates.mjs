import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const reportPath = path.join(rootDir, 'reports', 'template-quality-report.json');
const outJsonPath = path.join(rootDir, 'reports', 'generated-comment-candidates.json');
const outMdPath = path.join(rootDir, 'reports', 'generated-comment-candidates.md');

if (!fs.existsSync(reportPath)) {
  throw new Error('Once npm run analyze:templates komutunu calistirin.');
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const deficits = Array.isArray(report?.improvementPlan?.topDeficits)
  ? report.improvementPlan.topDeficits
  : [];

const focusTagMap = {
  akademik: ['akademik', 'ödev', 'katılım', 'tekrar'],
  davranis: ['davranış', 'kural', 'sorumluluk', 'uyum'],
  sosyal: ['sosyal', 'iletişim', 'arkadaş', 'işbirliği'],
  gelisim: ['gelişim', 'dikkat', 'motivasyon', 'özdüzenleme'],
  genel: ['genel', 'takip', 'katılım', 'gelişim'],
};

const observationPool = {
  akademik: [
    'Ders içi katılımında düzenli bir çizgi gözlemliyorum',
    'Ödev takibi ve konu tekrarında dönem boyunca net bir tablo oluştu',
    'Girdiğim derslerde konuyu kavrama hızının dengeli ilerlediğini görüyorum',
  ],
  davranis: [
    'Sınıf kuralları ve sorumluluk alma konusunda gözle görülür bir süreç yaşıyor',
    'Sınıf içindeki tutumu günlere göre değişse de takip edilebilir bir çizgide',
    'Kurallara uyum ve sınıf düzenine katkı konusunda belirgin sinyaller veriyor',
  ],
  sosyal: [
    'Akran iletişiminde dönem boyunca farklı durumlara verdiği tepkileri izliyorum',
    'Grup çalışmalarında iletişim kurma biçimi sınıf içi süreci doğrudan etkiliyor',
    'Arkadaş ilişkilerinde zaman zaman güçlü, zaman zaman destek gerektiren bir tablo var',
  ],
  gelisim: [
    'Dikkat ve öz düzenleme alanında küçük ama anlamlı adımlar gözlemliyorum',
    'Motivasyonunu koruma ve sürdürme konusunda dönem içinde dalgalanmalar yaşadı',
    'Öz güven ve derse odaklanma tarafında düzenli takip gerektiren bir süreçte',
  ],
  genel: [
    'Sınıf içindeki genel performansında takip edilebilir bir ilerleme görüyorum',
    'Dönem sürecinde güçlü yönleriyle birlikte gelişime açık alanları netleşti',
    'Genel tutumunda ders ve iletişim dengesini kurma çabası dikkat çekiyor',
  ],
};

const positiveActionPool = {
  akademik: [
    'Bu düzeni sürdürürse dönem sonunda daha güçlü bir akademik sonuç alacağını düşünüyorum.',
    'Aynı çalışma ritmini koruması, başarı çizgisini kalıcı hale getirecektir.',
    'Düzenli tekrar alışkanlığını devam ettirmesi önemli bir avantaj sağlayacaktır.',
  ],
  davranis: [
    'Bu olumlu tutumu koruduğunda sınıf içi uyumunun daha da güçleneceğini öngörüyorum.',
    'Sorumluluk alma davranışını sürdürmesi, dönem sürecini daha verimli hale getirir.',
    'Aynı çizgide devam etmesi hem kendisine hem sınıf ortamına katkı sağlar.',
  ],
  sosyal: [
    'İletişim tarafındaki bu yaklaşımını sürdürmesi sosyal dengesini daha da güçlendirecektir.',
    'Akran ilişkilerinde bu yapıcı tutumu koruması önemli bir kazanım olur.',
    'Grup içindeki dengeli iletişimi devam ettirmesi, sınıf iklimine olumlu yansır.',
  ],
  gelisim: [
    'Bu adımları aynı istikrarla sürdürdüğünde gelişimi daha görünür hale gelecektir.',
    'Düzenli takip ve küçük hedeflerle bu süreci güçlü şekilde sürdürebilir.',
    'Kendi ritmini koruduğunda dönem sonunda daha dengeli bir tablo bekliyorum.',
  ],
  genel: [
    'Bu çizgiyi koruması halinde dönem sonunda daha güçlü bir genel performans bekliyorum.',
    'Mevcut olumlu yönlerini sürdürmesi, sınıf içi dengesini destekleyecektir.',
    'Aynı istikrarla devam etmesi bu gelişimi kalıcı hale getirebilir.',
  ],
};

const neutralActionPool = {
  akademik: [
    'Ödev takibi ve düzenli tekrar planı ile gelişimini daha net görebileceğimizi düşünüyorum.',
    'Kısa ama düzenli çalışma adımları, akademik çizgisini yukarı taşıyacaktır.',
    'Ders tekrarını günlük küçük parçalara bölmesi faydalı olacaktır.',
  ],
  davranis: [
    'Sınıf kuralları konusunda günlük küçük hatırlatmalarla daha dengeli bir süreç ilerleyebilir.',
    'Sorumluluk alanlarını netleştirip düzenli takip etmek bu tabloyu iyileştirecektir.',
    'Davranış tarafında tutarlı geri bildirimle daha hızlı ilerleme bekliyorum.',
  ],
  sosyal: [
    'Akran iletişiminde küçük ve somut hedeflerle ilerlemek süreci olumlu etkileyebilir.',
    'Grup içinde rol paylaşımını netleştirmek sosyal uyumu destekleyecektir.',
    'İletişim dilini düzenli geri bildirimle güçlendirmek faydalı olur.',
  ],
  gelisim: [
    'Dikkat ve motivasyon için kısa hedeflerle düzenli takip, süreci daha görünür kılacaktır.',
    'Öz düzenleme becerisini günlük rutinlerle desteklemek olumlu sonuç verebilir.',
    'Küçük ama sürekliliği olan adımlar bu alanda belirgin katkı sağlar.',
  ],
  genel: [
    'Genel tabloyu güçlendirmek için düzenli takip ve net mini hedefler öneriyorum.',
    'Ders ve sınıf içi sorumluluk dengesini planlı sürdürmesi faydalı olacaktır.',
    'Kademeli ve takip edilebilir bir planla daha dengeli bir ilerleme bekliyorum.',
  ],
};

const negativeActionPool = {
  akademik: [
    'Ders ve ödev düzenini günlük takip ederek küçük hedeflerle ilerlemesi bu tabloyu toparlayacaktır.',
    'Temel kazanımları parçalara bölerek düzenli takip etmek, akademik dengeyi güçlendirebilir.',
    'Düzenli geri bildirim ve kısa tekrar planı bu alandaki zorlanmayı azaltacaktır.',
  ],
  davranis: [
    'Sınıf kuralları için net sınır ve düzenli takip yaklaşımıyla daha olumlu bir süreç bekliyorum.',
    'Sorumluluk alanlarını günlük kontrolle takip etmek davranış dengesini destekler.',
    'Tutarlı geri bildirim ve kararlı takip ile bu alanda toparlanma sağlanabilir.',
  ],
  sosyal: [
    'İletişim tarafında küçük ve uygulanabilir hedeflerle düzenli takip bu süreci iyileştirebilir.',
    'Akran ilişkilerinde kısa geri bildirim döngüleri kurmak sosyal uyumu artıracaktır.',
    'Grup içinde net rol ve sınırlarla ilerlemek çatışmaları azaltmaya yardımcı olur.',
  ],
  gelisim: [
    'Dikkat ve motivasyon alanını kısa hedeflerle düzenli takip etmek bu tabloyu dengeleyecektir.',
    'Öz düzenleme becerileri için günlük mini rutinler oluşturulması faydalı olur.',
    'Süreç odaklı ve kararlı takip ile bu alanda adım adım ilerleme bekliyorum.',
  ],
  genel: [
    'Genel performans için kısa hedef + düzenli takip yaklaşımıyla daha olumlu bir tablo kurulabilir.',
    'Sınıf içi sorumlulukları netleştirip günlük izlemek toparlanmayı destekler.',
    'Aşamalı ve kararlı takip, genel süreçte belirgin iyileşme sağlayacaktır.',
  ],
};

const variationPool = [
  'Bu adimlarin duzenli izlenmesi surecin kalitesini artirir.',
  'Ders ici takipte tutarlilik saglandiginda gelisim daha net gorulur.',
  'Kucuk ama surekli uygulamalarla daha kalici sonuc alinabilir.',
  'Sinif ici geri bildirimlerin duzenli olmasi ilerlemeyi hizlandirabilir.',
  'Bu surecin planli yurutulmesi hedef isabetini guclendirir.',
];

function pick(list, index) {
  return list[index % list.length];
}

function buildContent({ tone, lengthType, focus, index }) {
  const observations = observationPool[focus] || observationPool.genel;
  const observation = pick(observations, index);

  let action;
  if (tone === 'olumlu') {
    action = pick(positiveActionPool[focus] || positiveActionPool.genel, index + 1);
  } else if (tone === 'olumsuz') {
    action = pick(negativeActionPool[focus] || negativeActionPool.genel, index + 2);
  } else {
    action = pick(neutralActionPool[focus] || neutralActionPool.genel, index + 3);
  }

  const firstSentence = `[Öğrenci Adı] için ${observation}.`;

  if (lengthType === 'kisa') {
    return `${firstSentence} ${action}`;
  }

  const support = [
    'Bu değerlendirmeyi sınıf içindeki günlük gözlem ve derse katılımına göre yapıyorum.',
    'Süreçte özellikle ders düzeni, sorumluluk takibi ve sınıf içi etkileşimi dikkate alıyorum.',
    'Takipte somut ve uygulanabilir adımlara odaklanmayı önemsiyorum.',
  ];

  const closing = tone === 'olumlu'
    ? 'Bu istikrarı koruması dönem genelinde güçlü bir sonuç getirecektir.'
    : tone === 'olumsuz'
      ? 'Düzenli takip ve net adımlarla bu alanın daha dengeli ilerlemesini bekliyorum.'
      : 'Küçük ama düzenli adımlarla bu süreci daha verimli hale getirebilir.';

  return `${firstSentence} ${pick(support, index + 4)} ${action} ${closing}`;
}

function normalizeForCompare(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9çğıöşü\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function ensureUniqueContent(content, usedSet, index) {
  const normalized = normalizeForCompare(content);
  if (!usedSet.has(normalized)) {
    usedSet.add(normalized);
    return content;
  }

  const variation = pick(variationPool, index);
  const enriched = `${content} ${variation}`.replace(/\s+/g, ' ').trim();
  const enrichedNormalized = normalizeForCompare(enriched);
  if (!usedSet.has(enrichedNormalized)) {
    usedSet.add(enrichedNormalized);
    return enriched;
  }

  const indexed = `${enriched} Varyant ${index + 1}.`;
  usedSet.add(normalizeForCompare(indexed));
  return indexed;
}

const candidates = [];
deficits.forEach((item, deficitIndex) => {
  const createCount = Math.min(item.deficit, 5);
  const usedByCombination = new Set();

  for (let i = 0; i < createCount; i += 1) {
    const rawContent = buildContent({
      tone: item.tone,
      lengthType: item.lengthType,
      focus: item.focus,
      index: deficitIndex * 7 + i,
    });

    const content = ensureUniqueContent(rawContent, usedByCombination, deficitIndex * 7 + i);

    candidates.push({
      combinationKey: item.combinationKey,
      grade: item.grade,
      term: item.term,
      tone: item.tone,
      lengthType: item.lengthType,
      focus: item.focus,
      targetFile: `${item.grade}_${item.term}.json`,
      etiketler: focusTagMap[item.focus] || focusTagMap.genel,
      content,
    });
  }
});

const grouped = candidates.reduce((acc, item) => {
  if (!acc[item.targetFile]) acc[item.targetFile] = [];
  acc[item.targetFile].push(item);
  return acc;
}, {});

const output = {
  generatedAt: new Date().toISOString(),
  sourceReport: path.relative(rootDir, reportPath),
  totalCandidates: candidates.length,
  byFile: grouped,
};

fs.writeFileSync(outJsonPath, JSON.stringify(output, null, 2) + '\n', 'utf8');

const md = [
  '# Generated Comment Candidates',
  '',
  `Generated: ${output.generatedAt}`,
  `Source report: ${output.sourceReport}`,
  `Total candidates: ${output.totalCandidates}`,
  '',
];

Object.entries(grouped)
  .sort((a, b) => a[0].localeCompare(b[0], 'tr'))
  .forEach(([file, list]) => {
    md.push(`## ${file}`);
    md.push('');
    list.slice(0, 30).forEach((item, idx) => {
      md.push(`### ${idx + 1}. ${item.combinationKey}`);
      md.push(`- Tone: ${item.tone}`);
      md.push(`- Length: ${item.lengthType}`);
      md.push(`- Focus: ${item.focus}`);
      md.push(`- Tags: ${item.etiketler.join(', ')}`);
      md.push(`- Content: ${item.content}`);
      md.push('');
    });
  });

fs.writeFileSync(outMdPath, md.join('\n') + '\n', 'utf8');

console.log(`Aday JSON yazildi: ${outJsonPath}`);
console.log(`Aday Markdown yazildi: ${outMdPath}`);
console.log(`Toplam aday: ${output.totalCandidates}`);
