import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const sourceDir = path.join(rootDir, 'yorumlar');
const reportDir = path.join(rootDir, 'reports');

fs.mkdirSync(reportDir, { recursive: true });

const files = fs
  .readdirSync(sourceDir)
  .filter((file) => file.endsWith('.json'))
  .sort();

function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\[öğrenci adı\]/gi, 'ogrenci')
    .replace(/[^a-z0-9çğıöşü\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getFocus(tags) {
  const normalized = Array.isArray(tags)
    ? tags.map((tag) => String(tag || '').toLowerCase())
    : [];

  if (normalized.some((tag) => /ödev|ders|matematik|okuma|yazma|sınav|akademik|performans/.test(tag))) return 'akademik';
  if (normalized.some((tag) => /davranış|kural|disiplin|saygı|sorumluluk|uyum/.test(tag))) return 'davranis';
  if (normalized.some((tag) => /arkadaş|sosyal|iletişim|işbirliği|takım|empati/.test(tag))) return 'sosyal';
  if (normalized.some((tag) => /dikkat|odak|motivasyon|duygusal|özgüven/.test(tag))) return 'gelisim';
  return 'genel';
}

function getTargetScore(entry) {
  const text = String(entry.content || '');
  let score = 0;

  if (/gözlem|girdiğim ders|sınıf içi|ödev/i.test(text)) score += 1;
  if (/bekliyorum|tavsiye|destek|takip|düzenli/i.test(text)) score += 1;

  const len = text.length;
  const lengthType = String(entry.lengthType || 'uzun');
  if (lengthType === 'kisa' && len >= 70 && len <= 300) score += 1;
  if (lengthType === 'uzun' && len >= 200 && len <= 900) score += 1;

  if (/felaket|asla|kesinlikle olmaz|imkansız/i.test(text)) score -= 1;

  return score;
}

function getToneSuggestion(tone) {
  if (tone === 'olumlu') {
    return 'Gozlemlenen guclu yonleri netlestir, sureklilik icin somut bir adim ekle.';
  }
  if (tone === 'olumsuz') {
    return 'Yargilayici dilden kac, duzenli takip + uygulanabilir mini hedef oner.';
  }
  return 'Dengeyi koru: bir guclu yan + bir gelisim adimi ver.';
}

function getLengthSuggestion(lengthType) {
  if (lengthType === 'kisa') {
    return 'En fazla 2 cumlede: (1) ana gozlem, (2) uygulanabilir takip adimi.';
  }
  return '4-7 cumlede: baglam, gozlem, etkisi ve takip adimi yapisini koru.';
}

function getFocusSuggestion(focus) {
  if (focus === 'akademik') return 'Ders ici performans, odev duzeni, tekrar rutini odakli yaz.';
  if (focus === 'davranis') return 'Sinif kurallari, sorumluluk ve tutum odakli somut gozlem kullan.';
  if (focus === 'sosyal') return 'Akran iliskileri, iletisim ve grup calismasi odakli ifade kur.';
  if (focus === 'gelisim') return 'Dikkat, motivasyon, ozduzenleme ve surec takibi odakli yaz.';
  return 'Genel ifade yerine olculenebilir sinif ici gozlemle netlestir.';
}

function buildCombinationBrief(combinationKey, currentCount, targetCount) {
  const [grade, term, tone, lengthType, focus] = combinationKey.split('_');
  const deficit = Math.max(targetCount - currentCount, 0);

  return {
    combinationKey,
    grade,
    term,
    tone,
    lengthType,
    focus,
    currentCount,
    targetCount,
    deficit,
    suggestions: {
      tone: getToneSuggestion(tone),
      length: getLengthSuggestion(lengthType),
      focus: getFocusSuggestion(focus),
    },
    promptSeed: `${grade}. sinif ${term}. donem, ${tone} ton, ${lengthType} yorum, ${focus} odagi: sinif ogretmeninin gozlemine dayali yeni varyantlar uret.`,
  };
}

const allEntries = [];
for (const file of files) {
  const filePath = path.join(sourceDir, file);
  const [grade, periodWithExt] = file.split('_');
  const term = periodWithExt.replace('.json', '');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (!Array.isArray(data)) continue;

  data.forEach((entry) => {
    const tags = Array.isArray(entry.etiketler || entry.tags)
      ? (entry.etiketler || entry.tags)
      : [];

    allEntries.push({
      file,
      grade,
      term,
      tone: String(entry.tone || entry.ton || 'notr'),
      lengthType: String(entry.lengthType || 'uzun'),
      focus: getFocus(tags),
      tags,
      content: String(entry.content || entry.icerik || ''),
    });
  });
}

const coverage = new Map();
for (const entry of allEntries) {
  const key = `${entry.grade}_${entry.term}_${entry.tone}_${entry.lengthType}_${entry.focus}`;
  coverage.set(key, (coverage.get(key) || 0) + 1);
}

const byExactContent = new Map();
for (const entry of allEntries) {
  const key = `${entry.grade}_${entry.term}_${entry.tone}_${entry.lengthType}::${normalizeText(entry.content)}`;
  byExactContent.set(key, (byExactContent.get(key) || 0) + 1);
}

let duplicateCount = 0;
byExactContent.forEach((count) => {
  if (count > 1) duplicateCount += count - 1;
});

const sparseCoverage = [...coverage.entries()]
  .filter(([, count]) => count < 8)
  .sort((a, b) => a[1] - b[1]);

const scoreBuckets = new Map();
for (const entry of allEntries) {
  const key = `${entry.tone}_${entry.lengthType}`;
  const current = scoreBuckets.get(key) || { total: 0, count: 0 };
  current.total += getTargetScore(entry);
  current.count += 1;
  scoreBuckets.set(key, current);
}

const TARGET_COMBINATION_COUNT = 10;

const sparseCoverageBriefs = sparseCoverage
  .map(([key, count]) => buildCombinationBrief(key, count, TARGET_COMBINATION_COUNT))
  .filter((item) => item.deficit > 0)
  .sort((a, b) => b.deficit - a.deficit);

const analysisResult = {
  generatedAt: new Date().toISOString(),
  totals: {
    entryCount: allEntries.length,
    combinationCount: coverage.size,
    duplicateCount,
  },
  targetScoreAverages: [...scoreBuckets.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], 'tr'))
    .map(([key, value]) => ({
      key,
      average: value.count > 0 ? Number((value.total / value.count).toFixed(2)) : 0,
      sampleSize: value.count,
    })),
  sparseCoverage: sparseCoverage.map(([key, count]) => ({ key, count })),
  improvementPlan: {
    targetPerCombination: TARGET_COMBINATION_COUNT,
    topDeficits: sparseCoverageBriefs.slice(0, 60),
  },
};

const jsonReportPath = path.join(reportDir, 'template-quality-report.json');
fs.writeFileSync(jsonReportPath, JSON.stringify(analysisResult, null, 2) + '\n', 'utf8');

const markdownLines = [
  '# Template Improvement Plan',
  '',
  `Generated: ${analysisResult.generatedAt}`,
  '',
  `- Total entries: ${analysisResult.totals.entryCount}`,
  `- Combination count: ${analysisResult.totals.combinationCount}`,
  `- Exact duplicate count: ${analysisResult.totals.duplicateCount}`,
  `- Target per combination: ${TARGET_COMBINATION_COUNT}`,
  '',
  '## Average Target Score (tone_length)',
  '',
  ...analysisResult.targetScoreAverages.map((row) => `- ${row.key}: ${row.average} (${row.sampleSize} kayit)`),
  '',
  '## Top Deficit Combinations',
  '',
];

if (analysisResult.improvementPlan.topDeficits.length === 0) {
  markdownLines.push('- Eksik kombinasyon bulunamadi.');
} else {
  analysisResult.improvementPlan.topDeficits.slice(0, 40).forEach((item, index) => {
    markdownLines.push(`### ${index + 1}. ${item.combinationKey}`);
    markdownLines.push(`- Current: ${item.currentCount}`);
    markdownLines.push(`- Target: ${item.targetCount}`);
    markdownLines.push(`- Deficit: ${item.deficit}`);
    markdownLines.push(`- Tone note: ${item.suggestions.tone}`);
    markdownLines.push(`- Length note: ${item.suggestions.length}`);
    markdownLines.push(`- Focus note: ${item.suggestions.focus}`);
    markdownLines.push(`- Prompt seed: ${item.promptSeed}`);
    markdownLines.push('');
  });
}

const markdownReportPath = path.join(reportDir, 'template-improvement-plan.md');
fs.writeFileSync(markdownReportPath, markdownLines.join('\n') + '\n', 'utf8');

console.log('=== Template Quality Report ===');
console.log(`Toplam kayit: ${allEntries.length}`);
console.log(`Kapsama kombinasyonu: ${coverage.size}`);
console.log(`Birebir tekrar sayisi: ${duplicateCount}`);
console.log('');

console.log('--- Ortalama hedef puani (tone_length) ---');
[...scoreBuckets.entries()]
  .sort((a, b) => a[0].localeCompare(b[0], 'tr'))
  .forEach(([key, value]) => {
    const avg = value.count > 0 ? (value.total / value.count).toFixed(2) : '0.00';
    console.log(`${key}: ${avg}`);
  });

console.log('');
console.log('--- Dusuk kapsama kombinasyonlari (ilk 30) ---');
if (sparseCoverage.length === 0) {
  console.log('Yok');
} else {
  sparseCoverage.slice(0, 30).forEach(([key, count]) => {
    console.log(`${key}: ${count}`);
  });
}

console.log('');
console.log(`JSON raporu yazildi: ${jsonReportPath}`);
console.log(`Markdown plan yazildi: ${markdownReportPath}`);
