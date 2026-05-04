
# karne-gorusleri

Karne gorusleri projesi, Turk ortaokul ogretmenleri icin gelistirilmis tamamen yerel (local) ve offline calisabilen bir statik yorum deposudur.

## Ozellikler

- 5-8. siniflar icin hazir yorum sablonlari
- Emoji destekli ton sistemi (Olumlu, Notr, Olumsuz)
- Ogrenci bazli yorum yazma ve duzenleme
- LocalStorage ile cihazda veri saklama
- PWA destegi ile offline kullanim
- JSON yedek alma / geri yukleme
- CSV (Excel uyumlu) disa aktarma

## Mimari

- Uygulamanin ana calisan surumu: kok dizindeki [index.html](index.html) ve [assets](assets)
- Veri kaynaklari: [yorumlar](yorumlar) altindaki statik JSON dosyalari
- Veri kaliciligi: tarayici localStorage
- Offline destegi: [service-worker.js](service-worker.js)

## Calistirma

Projeyi bir statik sunucu ile acmaniz yeterlidir.

### Secenek 0 (onerilen)

```bash
npm run local
```

Sonra tarayicidan `http://localhost:5000` adresine gidin.

## Script Duzeni

Kod daginikligini azaltmak icin scriptler iki ana klasore ayrildi:

- `scripts/core`: Uygulamayi calistirmak ve paket veriyi uretmek icin zorunlu scriptler
	- `build-template-data.mjs`
	- `local-static-server.mjs`
- `scripts/optional`: Veri iyilestirme ve raporlama odakli opsiyonel scriptler
	- `comment-tools.mjs` (tek giris noktasi)
	- `analyze-template-quality.mjs`
	- `generate-comment-candidates.mjs`
	- `apply-comment-candidates.mjs`
	- `deduplicate-short-comments.mjs`

Opsiyonel islemler tek komut catisi altinda toplanmistir:

- `npm run analyze:templates`
- `npm run suggest:comments`
- `npm run suggest:apply:dry`
- `npm run suggest:apply`
- `npm run dedupe:short`
- `npm run dedupe:short:global`

### Secenek 1 (VS Code Live Server)

1. Klasoru VS Code ile acin.
2. [index.html](index.html) dosyasini Live Server ile calistirin.

### Secenek 2 (Python)

```bash
python -m http.server 5000
```

Sonra tarayicidan `http://localhost:5000` adresine gidin.

## Yedekleme

- Ust barda veritabani ikonu: JSON yedek indirir.
- Ust barda yukleme ikonu: JSON yedegi geri yukler.

## Lisans

Bu proje GNU Affero General Public License v3.0 (AGPL-3.0) ile lisanslanmistir.

- Tam metin: [LICENSE](LICENSE)
- Lisans baglantisi: https://www.gnu.org/licenses/agpl-3.0.html
