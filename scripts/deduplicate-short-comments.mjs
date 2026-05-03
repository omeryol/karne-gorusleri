import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const yorumlarDir = path.join(rootDir, 'yorumlar');

const cliScope = process.argv
  .find((arg) => arg.startsWith('--scope='))
  ?.split('=')[1]
  ?.trim()
  ?.toLowerCase();
const dedupeScope = cliScope === 'global' ? 'global' : 'file';

const files = fs.readdirSync(yorumlarDir).filter((f) => f.endsWith('.json')).sort();

function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9çğıöşü\s]/gi, '')
    .trim();
}

function splitSentences(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function getFocus(tags) {
  const normalized = Array.isArray(tags)
    ? tags.map((tag) => String(tag || '').toLowerCase())
    : [];

  if (normalized.some((tag) => /ödev|ders|matematik|okuma|yazma|sınav|akademik|performans/.test(tag))) return 'akademik';
  if (normalized.some((tag) => /davranış|kural|disiplin|saygı|sorumluluk|uyum/.test(tag))) return 'davranis';
  if (normalized.some((tag) => /arkadaş|sosyal|iletişim|işbirliği|takım|empati/.test(tag))) return 'sosyal';
  if (normalized.some((tag) => /dikkat|odak|motivasyon|duygusal|özgüven|özdüzenleme/.test(tag))) return 'gelisim';
  return 'genel';
}

function buildSecondSentence({ tone, focus, variantIndex, grade, term }) {
  const introPool = [
    'Bu dönemde',
    'Önümüzdeki süreçte',
    'Sınıf içi takipte',
    'Düzenli takip ile',
    'Günlük küçük adımlarla',
    'Ders sürecinde',
    'Bu gelişim çizgisinde',
    'Kademeli ilerlemeyle',
  ];

  const focusPool = {
    akademik: [
      'ödev düzeni ve ders katılımı',
      'konu tekrarı ve sınıf içi performans',
      'akademik takip ve çalışma düzeni',
      'ders odaklı sorumluluklar',
    ],
    davranis: [
      'sınıf kuralları ve sorumluluk alma',
      'davranış takibi ve sınıf uyumu',
      'kurallara uyum ve tutarlı davranış',
      'sınıf içi tutum dengesi',
    ],
    sosyal: [
      'akran iletişimi ve grup uyumu',
      'arkadaş ilişkileri ve işbirliği',
      'sosyal iletişim ve sınıf etkileşimi',
      'grup içi iletişim dengesi',
    ],
    gelisim: [
      'dikkat ve öz düzenleme',
      'motivasyon ve odaklanma',
      'öz güven ve süreç takibi',
      'gelişim adımlarının sürekliliği',
    ],
    genel: [
      'genel sınıf içi performans',
      'ders ve sorumluluk dengesi',
      'süreç takibi ve katılım',
      'genel gelişim çizgisi',
    ],
  };

  const endingPoolByTone = {
    olumlu: [
      'alanında istikrarlı bir ilerleme bekliyorum.',
      'tarafında güçlü bir devamlılık sağlayacaktır.',
      'başlığında olumlu tabloyu koruyacaktır.',
      'sürecinde mevcut başarısını destekleyecektir.',
    ],
    notr: [
      'alanında daha dengeli bir ilerleme bekliyorum.',
      'tarafında düzenli gelişim sağlayacaktır.',
      'başlığında gözle görülür katkı sunacaktır.',
      'sürecinde daha net sonuçlar verecektir.',
    ],
    olumsuz: [
      'alanında toparlanmayı destekleyecektir.',
      'tarafında daha dengeli bir sürece katkı sağlayacaktır.',
      'başlığında kademeli iyileşme getirecektir.',
      'sürecinde riskleri azaltmaya yardımcı olacaktır.',
    ],
  };

  const intros = introPool;
  const focuses = focusPool[focus] || focusPool.genel;
  const endings = endingPoolByTone[tone] || endingPoolByTone.notr;

  const i1 = (variantIndex + Number(grade) + Number(term)) % intros.length;
  const i2 = (variantIndex * 3 + Number(grade)) % focuses.length;
  const i3 = (variantIndex * 5 + Number(term)) % endings.length;

  return `${intros[i1]} ${focuses[i2]} ${endings[i3]}`;
}

function buildUniqueBooster(variantIndex) {
  const boosters = [
    'Haftalik takip planiyla ilerleme daha net gorulecektir.',
    'Kisa geri bildirim dongusu bu sureci destekleyecektir.',
    'Gunluk mini hedefler surekliligi guclendirecektir.',
    'Sinif ici duzenli izleme olumlu katkı saglayacaktir.',
    'Asamali takip bu alanda kalici ilerleme getirir.',
    'Planli tekrar ve takip bu tabloyu guclendirir.',
    'Duzenli sinif ici geri bildirim sureci hizlandirir.',
    'Kademeli hedefler ile denge daha kolay korunur.',
    'Kisa ve net adimlarla surec daha verimli ilerler.',
    'Uygulanabilir hedefler bu alanda istikrar saglar.',
  ];

  return boosters[variantIndex % boosters.length];
}

let totalChanged = 0;
const globalSeenShortKeys = new Set();

for (const file of files) {
  const filePath = path.join(yorumlarDir, file);
  const [grade, termWithExt] = file.split('_');
  const term = termWithExt.replace('.json', '');
  const entries = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (!Array.isArray(entries)) continue;

  const shortEntries = entries
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => String(entry.lengthType || '') === 'kisa');

  const groups = new Map();
  shortEntries.forEach((item) => {
    const key = normalizeText(item.entry.content || '');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  });

  let changedInFile = 0;

  for (const duplicateItems of groups.values()) {
    if (duplicateItems.length <= 1) continue;

    // Keep first occurrence as-is; rewrite others.
    for (let i = 1; i < duplicateItems.length; i += 1) {
      const { entry, index } = duplicateItems[i];
      const sentences = splitSentences(entry.content || '');
      const firstSentence = sentences[0] || '[Öğrenci Adı] için süreç takibini sürdürüyorum.';
      const tags = Array.isArray(entry.etiketler || entry.tags) ? (entry.etiketler || entry.tags) : [];
      const focus = getFocus(tags);
      const tone = String(entry.tone || entry.ton || 'notr');
      const secondSentence = buildSecondSentence({
        tone,
        focus,
        variantIndex: i + Number(entry.id || 0),
        grade,
        term,
      });

      const newContent = `${firstSentence} ${secondSentence}`.replace(/\s+/g, ' ').trim();
      if (normalizeText(newContent) === normalizeText(entry.content || '')) continue;

      const updated = {
        ...entry,
        content: newContent,
        icerik: newContent,
      };

      entries[index] = updated;
      changedInFile += 1;
    }
  }

  // Uniqueness pass for short comments.
  const shortItemsAfterFirstPass = entries
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => String(entry.lengthType || '') === 'kisa');

  const seen = dedupeScope === 'global' ? globalSeenShortKeys : new Set();
  shortItemsAfterFirstPass.forEach(({ entry, index }) => {
    const key = normalizeText(entry.content || '');
    if (!seen.has(key)) {
      seen.add(key);
      return;
    }

    const sentences = splitSentences(entry.content || '');
    const firstSentence = sentences[0] || '[Öğrenci Adı] için süreç takibini sürdürüyorum.';
    const tags = Array.isArray(entry.etiketler || entry.tags) ? (entry.etiketler || entry.tags) : [];
    const focus = getFocus(tags);
    const tone = String(entry.tone || entry.ton || 'notr');

    let updatedContent = entry.content || '';
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const variantSeed = Number(entry.id || 0) + attempt * 17;
      const secondSentence = buildSecondSentence({
        tone,
        focus,
        variantIndex: variantSeed,
        grade,
        term,
      });
      const booster = buildUniqueBooster(variantSeed);
      const candidateSecond = attempt % 2 === 0 ? secondSentence : `${secondSentence} ${booster}`;
      const candidateContent = `${firstSentence} ${candidateSecond}`.replace(/\s+/g, ' ').trim();
      const candidateKey = normalizeText(candidateContent);

      if (!seen.has(candidateKey)) {
        updatedContent = candidateContent;
        seen.add(candidateKey);
        break;
      }
    }

    if (normalizeText(updatedContent) !== key) {
      entries[index] = {
        ...entry,
        content: updatedContent,
        icerik: updatedContent,
      };
      changedInFile += 1;
    } else {
      seen.add(key);
    }
  });

  if (changedInFile > 0) {
    fs.writeFileSync(filePath, JSON.stringify(entries, null, 2) + '\n', 'utf8');
    totalChanged += changedInFile;
  }

  console.log(`${file}: changed=${changedInFile}`);
}

console.log(`TOTAL_CHANGED=${totalChanged}`);
console.log(`SCOPE=${dedupeScope}`);
