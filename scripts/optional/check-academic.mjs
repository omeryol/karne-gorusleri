import { readFileSync } from 'fs';

function scan(file, label) {
  const data = JSON.parse(readFileSync(file, 'utf-8'));
  const academic = ['performans', 'potansiyel', 'sergilediği', 'tablo', 'eğilim', 'faktör', 'beceri', 'geliştirmesi', 'ortaya koy', 'göstergesi', 'açısından', 'seyir izledi', 'gözlemledim', 'mekanizma', 'kriter', 'kapasite', 'içselleştire', 'değişkenlik', 'verimli', 'organizasyon'];
  
  console.log(`\n=== ${label} ===`);
  let hitCount = 0, uniqueIds = new Set();
  for (const word of academic) {
    for (const item of data) {
      if (item.content.toLowerCase().includes(word)) {
        if (!uniqueIds.has(item.id)) {
          console.log(`  ID ${item.id}: "...${word}..." → ${item.content.slice(0,130)}...`);
          uniqueIds.add(item.id);
          hitCount++;
          if (hitCount >= 10) break;
        }
      }
    }
    if (hitCount >= 10) break;
  }
  console.log(`Toplam: ${uniqueIds.size} yorumda akademik terim bulundu`);
}

scan('yorumlar/5_1.json', '5_1.json');
scan('yorumlar/5_2.json', '5_2.json');
scan('yorumlar/8_1.json', '8_1.json');
