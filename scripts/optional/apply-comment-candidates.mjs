import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

const candidatesPath = path.join(rootDir, 'reports', 'generated-comment-candidates.json');
const outJsonPath = path.join(rootDir, 'reports', 'applied-comment-candidates-report.json');
const outMdPath = path.join(rootDir, 'reports', 'applied-comment-candidates-report.md');
const yorumlarDir = path.join(rootDir, 'yorumlar');

function parseArgs(argv) {
  const args = {
    mode: 'dry-run',
    limit: 50,
  };

  argv.forEach((arg) => {
    if (arg.startsWith('--mode=')) {
      args.mode = arg.split('=')[1] || 'dry-run';
    }
    if (arg.startsWith('--limit=')) {
      const parsed = Number(arg.split('=')[1]);
      if (Number.isFinite(parsed) && parsed > 0) {
        args.limit = Math.floor(parsed);
      }
    }
  });

  if (args.mode !== 'dry-run' && args.mode !== 'apply') {
    throw new Error(`Gecersiz mode: ${args.mode}. Kullanilabilir: dry-run, apply`);
  }

  return args;
}

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
  if (normalized.some((tag) => /dikkat|odak|motivasyon|duygusal|özdüzenleme|ozduzenleme|öz düzenleme/.test(tag))) return 'gelisim';
  return 'genel';
}

function getCombinationKeyFromEntry(entry, fileName) {
  const [grade, termWithExt] = fileName.split('_');
  const term = termWithExt.replace('.json', '');
  const tone = String(entry.tone || entry.ton || 'notr');
  const lengthType = String(entry.lengthType || 'uzun');
  const tags = Array.isArray(entry.etiketler || entry.tags) ? (entry.etiketler || entry.tags) : [];
  const focus = getFocus(tags);
  return `${grade}_${term}_${tone}_${lengthType}_${focus}`;
}

function getContentFrequency(entries) {
  const map = new Map();
  entries.forEach((entry) => {
    const key = normalizeText(entry.content || entry.icerik || '');
    map.set(key, (map.get(key) || 0) + 1);
  });
  return map;
}

function toCandidateList(candidatesByFile) {
  const list = [];
  Object.entries(candidatesByFile || {}).forEach(([targetFile, items]) => {
    if (!Array.isArray(items)) return;
    items.forEach((item, index) => {
      list.push({
        ...item,
        targetFile,
        _order: index,
      });
    });
  });
  return list;
}

function ensureReportDir() {
  const reportDir = path.dirname(outJsonPath);
  fs.mkdirSync(reportDir, { recursive: true });
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(candidatesPath)) {
    throw new Error('Aday dosyasi bulunamadi. Once npm run suggest:comments calistirin.');
  }

  const candidateSource = JSON.parse(fs.readFileSync(candidatesPath, 'utf8'));
  const allCandidates = toCandidateList(candidateSource.byFile || {});
  const selectedCandidates = allCandidates.slice(0, args.limit);

  const fileCache = new Map();
  const usedReplacementIdsByFile = new Map();
  const operations = [];

  selectedCandidates.forEach((candidate) => {
    const fileName = candidate.targetFile;
    const filePath = path.join(yorumlarDir, fileName);

    if (!fs.existsSync(filePath)) {
      operations.push({
        status: 'skipped',
        reason: 'target-file-not-found',
        candidate,
      });
      return;
    }

    if (!fileCache.has(fileName)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      fileCache.set(fileName, data);
      usedReplacementIdsByFile.set(fileName, new Set());
    }

    const entries = fileCache.get(fileName);
    if (!Array.isArray(entries)) {
      operations.push({
        status: 'skipped',
        reason: 'invalid-target-file',
        candidate,
      });
      return;
    }

    const usedIds = usedReplacementIdsByFile.get(fileName);
    const targetCombination = candidate.combinationKey;

    const matching = entries
      .map((entry, index) => ({ entry, index }))
      .filter(({ entry }) => getCombinationKeyFromEntry(entry, fileName) === targetCombination);

    if (matching.length === 0) {
      operations.push({
        status: 'skipped',
        reason: 'no-matching-combination',
        candidate,
      });
      return;
    }

    const frequency = getContentFrequency(matching.map((x) => x.entry));

    const sortedCandidates = matching
      .map((item) => {
        const contentKey = normalizeText(item.entry.content || item.entry.icerik || '');
        const freq = frequency.get(contentKey) || 1;
        return {
          ...item,
          freq,
        };
      })
      .sort((a, b) => {
        if (b.freq !== a.freq) return b.freq - a.freq;
        const aId = Number(a.entry.id || 0);
        const bId = Number(b.entry.id || 0);
        return bId - aId;
      });

    const replacement = sortedCandidates.find((x) => !usedIds.has(x.entry.id));

    if (!replacement) {
      operations.push({
        status: 'skipped',
        reason: 'no-available-slot',
        candidate,
      });
      return;
    }

    const oldContent = String(replacement.entry.content || replacement.entry.icerik || '');
    const newContent = String(candidate.content || '').trim();

    if (!newContent || normalizeText(oldContent) === normalizeText(newContent)) {
      operations.push({
        status: 'skipped',
        reason: 'same-content',
        candidate,
        targetId: replacement.entry.id,
      });
      usedIds.add(replacement.entry.id);
      return;
    }

    const updatedEntry = {
      ...replacement.entry,
      tone: candidate.tone,
      ton: candidate.tone,
      lengthType: candidate.lengthType,
      etiketler: Array.isArray(candidate.etiketler) ? candidate.etiketler : replacement.entry.etiketler,
      content: newContent,
    };

    entries[replacement.index] = updatedEntry;
    usedIds.add(replacement.entry.id);

    operations.push({
      status: 'planned',
      candidate,
      targetId: replacement.entry.id,
      previousContent: oldContent,
      newContent,
      previousFrequency: replacement.freq,
    });
  });

  if (args.mode === 'apply') {
    fileCache.forEach((entries, fileName) => {
      const filePath = path.join(yorumlarDir, fileName);
      fs.writeFileSync(filePath, JSON.stringify(entries, null, 2) + '\n', 'utf8');
    });
  }

  const appliedCount = operations.filter((op) => op.status === 'planned').length;
  const skippedCount = operations.length - appliedCount;

  const report = {
    generatedAt: new Date().toISOString(),
    mode: args.mode,
    limit: args.limit,
    selectedCandidates: selectedCandidates.length,
    plannedChanges: appliedCount,
    skipped: skippedCount,
    operations,
  };

  ensureReportDir();
  fs.writeFileSync(outJsonPath, JSON.stringify(report, null, 2) + '\n', 'utf8');

  const lines = [
    '# Applied Comment Candidates Report',
    '',
    `Generated: ${report.generatedAt}`,
    `Mode: ${report.mode}`,
    `Limit: ${report.limit}`,
    `Selected candidates: ${report.selectedCandidates}`,
    `Planned changes: ${report.plannedChanges}`,
    `Skipped: ${report.skipped}`,
    '',
    '## Changes',
    '',
  ];

  report.operations.slice(0, 120).forEach((op, index) => {
    if (op.status === 'planned') {
      lines.push(`### ${index + 1}. APPLIED ${op.candidate.combinationKey}`);
      lines.push(`- Target file: ${op.candidate.targetFile}`);
      lines.push(`- Target id: ${op.targetId}`);
      lines.push(`- Previous frequency in combo: ${op.previousFrequency}`);
      lines.push(`- New content: ${op.newContent}`);
      lines.push('');
    } else {
      lines.push(`### ${index + 1}. SKIPPED ${op.candidate?.combinationKey || 'unknown'}`);
      lines.push(`- Reason: ${op.reason}`);
      if (op.candidate?.targetFile) {
        lines.push(`- Target file: ${op.candidate.targetFile}`);
      }
      lines.push('');
    }
  });

  fs.writeFileSync(outMdPath, lines.join('\n') + '\n', 'utf8');

  console.log(`Mode: ${args.mode}`);
  console.log(`Secilen aday: ${report.selectedCandidates}`);
  console.log(`Planlanan degisiklik: ${report.plannedChanges}`);
  console.log(`Atlanan: ${report.skipped}`);
  console.log(`Rapor JSON: ${outJsonPath}`);
  console.log(`Rapor MD: ${outMdPath}`);
}

main();
