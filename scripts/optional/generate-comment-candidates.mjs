import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');
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
    'Derslerde katılımı gayet güzel, anladığını ve anlamadığını belli ediyor',
    'Ödevlerini yaparken düzenli bir çalışma temposu var, bu çok değerli',
    'Derslerde konuları kavrama şekli gayet yerinde, takip edebiliyorum',
  ],
  davranis: [
    'Sınıf kurallarına uyma konusunda zaman zaman hatırlatmaya ihtiyacı oluyor',
    'Sınıf içindeki hali günden güne değişiyor, bazen çok sakin bazen hareketli',
    'Kuralları benimseme ve sınıf düzenine katkı sağlama konusunda çaba gösteriyor',
  ],
  sosyal: [
    'Arkadaşlarıyla iletişimi genelde iyi, ama bazen anlaşmazlıklar yaşanabiliyor',
    'Grup çalışmalarında arkadaşlarıyla iletişim kurma şekli sınıf ortamını etkiliyor',
    'Arkadaşlık ilişkileri kimi zaman çok güzel, kimi zaman biraz desteğe ihtiyaç duyuyor',
  ],
  gelisim: [
    'Dikkat ve odaklanma konusunda küçük de olsa ilerlemeler var, bu sevindirici',
    'Motivasyonu dönem içinde bir gelip bir gidiyor, sürekli yüksek tutmakta zorlanıyor',
    'Kendine güven ve derse odaklanma konusunda biraz destek gerekiyor',
  ],
  genel: [
    'Sınıftaki haline bakınca ilerleme kaydettiğini söyleyebilirim',
    'Güçlü yönleri olduğu kadar geliştirmesi gereken yönleri de var',
    'Genel olarak ders ve arkadaşlarıyla iletişim dengesini kurmaya çalışıyor',
  ],
};

const positiveActionPool = {
  akademik: [
    'Böyle devam ederse çok daha iyi yerlere geleceğine eminim.',
    'Aynı çalışma şeklini korursa başarısı daha da artacaktır.',
    'Düzenli tekrara devam ederse bu onun için büyük avantaj olacak.',
  ],
  davranis: [
    'Bu güzel halini korursa sınıftaki uyumu daha da güçlenecek.',
    'Sorumluluklarını böyle güzel yerine getirmeye devam etmeli.',
    'Aynı çizgide devam etmesi hem kendisi hem de sınıf için çok iyi olacak.',
  ],
  sosyal: [
    'Arkadaşlarıyla olan bu güzel iletişimini sürdürmesi çok önemli.',
    'Arkadaşlıklarında bu yapıcı tavrını koruması büyük kazanç.',
    'Grup içinde bu dengeli halini devam ettirmesi sınıfa da olumlu yansıyor.',
  ],
  gelisim: [
    'Bu şekilde devam ederse gelişimi daha da belirgin hale gelecek.',
    'Küçük adımlarla da olsa ilerlemeye devam etmesi çok değerli.',
    'Kendi temposunu bulursa çok daha iyi bir noktaya gelecek.',
  ],
  genel: [
    'Bu çizgisini korursa çok güzel bir dönem geçireceğine eminim.',
    'İyi yönlerini koruması, onun sınıftaki dengesini destekleyecek.',
    'Aynı kararlılıkla devam ederse bu gelişim kalıcı olacak.',
  ],
};

const neutralActionPool = {
  akademik: [
    'Ödevlerini düzenli yapıp tekrar ederse daha iyi olacağını düşünüyorum.',
    'Kısa ama düzenli çalışarak derslerini daha iyi hale getirebilir.',
    'Ders tekrarlarını günlük küçük parçalara bölmesi işini kolaylaştıracak.',
  ],
  davranis: [
    'Sınıf kurallarını her gün ufak ufak hatırlatarak daha dengeli ilerleyebiliriz.',
    'Sorumluluklarını netleştirip düzenli takip edersek işler daha iyiye gidecek.',
    'Davranışlarıyla ilgili düzenli geri bildirim verirsek daha hızlı ilerler.',
  ],
  sosyal: [
    'Arkadaşlarıyla iletişiminde küçük hedeflerle ilerlemek iyi olabilir.',
    'Grup içinde rollerini netleştirirse arkadaşlarıyla uyumu artacak.',
    'İletişim şeklini konuşarak ve hatırlatarak güçlendirebiliriz.',
  ],
  gelisim: [
    'Dikkat ve motivasyon için küçük hedeflerle düzenli takip iyi gelecek.',
    'Kendini toparlaması için günlük ufak rutinler oluşturması faydalı olur.',
    'Küçük ama sürekli adımlarla bu alanda ilerleme kaydedebilir.',
  ],
  genel: [
    'Toparlanması için düzenli takip ve net hedefler iyi bir yol olacak.',
    'Ders ve sınıf içi sorumluluklarını dengeli götürmesi önemli.',
    'Adım adım ilerleyecek bir planla daha dengeli olacağını düşünüyorum.',
  ],
};

const negativeActionPool = {
  akademik: [
    'Ders ve ödev düzenini her gün takip edip küçük hedeflerle ilerlersek toparlar.',
    'Konuları küçük parçalara bölüp düzenli tekrar edersek daha iyi olacak.',
    'Düzenli geri bildirim ve kısa tekrarlarla bu zorluğu aşabiliriz.',
  ],
  davranis: [
    'Sınıf kuralları konusunda net sınırlar ve düzenli takiple daha iyi bir süreç bekliyorum.',
    'Sorumluluklarını her gün ufak ufak kontrol ederek takip edersek düzelir.',
    'Tutarlı geri bildirim ve kararlı takiple bu konuda toparlanabilir.',
  ],
  sosyal: [
    'Arkadaşlarıyla iletişiminde küçük ve uygulanabilir hedeflerle takip edersek düzelebilir.',
    'Arkadaşlık ilişkilerinde kısa geri bildirimlerle sosyal uyumu artırabiliriz.',
    'Grup içinde rollerini ve sınırlarını netleştirirsek sorunlar azalabilir.',
  ],
  gelisim: [
    'Dikkat ve motivasyon için küçük hedeflerle düzenli takip iyi bir yol olacak.',
    'Kendini toplaması için günlük ufak rutinler oluşturması faydalı olur.',
    'Kararlı ve düzenli takiple bu alanda adım adım ilerleme bekliyorum.',
  ],
  genel: [
    'Küçük hedefler ve düzenli takiple daha iyi bir tablo göreceğimize inanıyorum.',
    'Sınıf içi sorumluluklarını netleştirip her gün takip edersek toparlanır.',
    'Adım adım ve kararlı takiple genel durumunda iyileşme göreceğiz.',
  ],
};

const variationPool = [
  'Bu adımları düzenli takip edersek işler daha güzel olacak.',
  'Derste düzenli takip sağlarsak gelişim daha net görülür.',
  'Küçük ama düzenli çalışmalarla daha kalıcı sonuç alabiliriz.',
  'Sınıfta düzenli geri bildirim vermek ilerlemeyi hızlandırabilir.',
  'Bu süreci planlı götürmek işleri kolaylaştıracak.',
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
    'Bunu sınıfta yaptığım gözlemlere ve derse katılımına göre söylüyorum.',
    'Özellikle ders düzeni, sorumluluk takibi ve arkadaşlarıyla iletişimini göz önüne alıyorum.',
    'Takipte küçük ve uygulanabilir adımlara odaklanmayı önemsiyorum.',
  ];

  const closing = tone === 'olumlu'
    ? 'Bunu böyle devam ettirirse dönem sonunda çok güzel sonuçlar alacağız.'
    : tone === 'olumsuz'
      ? 'Düzenli takip ve net adımlarla bu konuda daha iyiye gideceğimizi düşünüyorum.'
      : 'Küçük ama düzenli adımlarla bu süreci daha iyi hale getirebiliriz.';

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
