# Karne Asistanı - GitHub Pages Deployment Guide

Bu proje GitHub Pages üzerinde çalışacak şekilde yapılandırılmıştır.

## GitHub Pages Deployment

### Otomatik Deployment (Önerilen)

1. Projeyi GitHub repository'nize push edin
2. Repository ayarlarında Pages bölümüne gidin
3. Source olarak "Deploy from a branch" seçin
4. Branch olarak "main" ve folder olarak "/docs" seçin
5. Save butonuna tıklayın

GitHub Actions otomatik olarak her push'ta projeyi build edip deploy edecektir.

### Manuel Build

Yerel ortamda build almak için:

```bash
./build-github.sh
```

Bu komut `docs/` klasöründe GitHub Pages için hazır dosyaları oluşturacaktır.

## Proje Özellikleri

- ✅ Tamamen client-side çalışır (GitHub Pages uyumlu)
- ✅ LocalStorage ile veri saklama
- ✅ PWA desteği
- ✅ Responsive tasarım
- ✅ Dark/Light tema
- ✅ Offline çalışma capability

## Kullanım

Bu uygulama öğretmenlerin karne yorumlarını kolayca oluşturabilmeleri için tasarlanmıştır:

1. **Öğrenci Yönetimi**: Sınıf ve bölüm bazında öğrenci ekleme/düzenleme
2. **Yorum Sistemi**: Pozitif, nötr, negatif tonlarda yorumlar
3. **Şablon Kütüphanesi**: Hazır yorum şablonları
4. **Veri Yönetimi**: Tüm veriler tarayıcınızda güvenle saklanır

## Teknik Detaylar

- **Frontend**: React + TypeScript + Vite
- **UI Framework**: Tailwind CSS + Radix UI
- **State Management**: TanStack Query
- **Storage**: Browser LocalStorage
- **Build Tool**: Vite
- **Deployment**: GitHub Pages