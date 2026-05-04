import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const yorumlarDir = path.join(rootDir, 'yorumlar');

const ACRONYMS = ['LGS', 'AI', 'MEB', 'TYT', 'AYT'];

function restoreAcronyms(text) {
  let out = text;
  for (const acronym of ACRONYMS) {
    const regex = new RegExp(`\\b${acronym.toLocaleLowerCase('tr-TR')}\\b`, 'g');
    out = out.replace(regex, acronym);
  }
  return out;
}

function sentenceCaseTurkish(text) {
  const placeholders = [];
  let out = String(text || '').replace(/\[[^\]]+\]/g, (match) => {
    const token = `§§${placeholders.length}§§`;
    placeholders.push(match);
    return token;
  });

  out = out.toLocaleLowerCase('tr-TR');
  out = restoreAcronyms(out);

  const chars = Array.from(out);
  let capitalizeNext = true;

  for (let i = 0; i < chars.length; i += 1) {
    const ch = chars[i];

    if (capitalizeNext && /[a-zçğıöşü]/.test(ch)) {
      chars[i] = ch.toLocaleUpperCase('tr-TR');
      capitalizeNext = false;
    }

    if (/[.!?]/.test(ch)) {
      capitalizeNext = true;
    }
  }

  out = chars.join('');
  out = out.replace(/§§(\d+)§§/g, (_, idx) => placeholders[Number(idx)] || '');
  out = out.replace(/(\[Öğrenci Adı\]\s+)Bu\b/g, '$1bu');
  out = out.replace(/\s+/g, ' ').replace(/\s+([.,!?;:])/g, '$1').trim();

  return out;
}

const files = fs
  .readdirSync(yorumlarDir)
  .filter((fileName) => fileName.endsWith('.json'))
  .sort();

for (const fileName of files) {
  const filePath = path.join(yorumlarDir, fileName);
  const raw = fs.readFileSync(filePath, 'utf8');
  const rows = JSON.parse(raw);

  let changed = 0;

  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    const current = String(row.content || '');
    const fixed = sentenceCaseTurkish(current);

    if (current !== fixed) {
      row.content = fixed;
      changed += 1;
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(rows, null, 2) + '\n', 'utf8');
  console.log(`${fileName}: ${changed} yorum duzeltildi`);
}

console.log('Yazim ve buyuk harf duzeltmeleri tamamlandi.');
