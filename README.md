# Öğrenci Yorumları Yönetim Sistemi

Modern ve kullanıcı dostu öğrenci yorumları yönetim sistemi. Pedagojik standartlara uygun öğrenci değerlendirme yorumlarını düzenlemek, filtrelemek ve yönetmek için tasarlanmıştır.

## Özellikler

### 🎨 Modern Arayüz
- Gradient arka plan ve cam efekti (glassmorphism)
- Responsive tasarım (mobil uyumlu)
- Animasyonlı yorum kartları
- Hover efektleri ve smooth geçişler

### 🔍 Gelişmiş Filtreleme
- Sınıf seviyesine göre filtreleme (5-8. sınıf)
- Dönem bazlı filtreleme (1. ve 2. dönem)
- Metin bazlı arama özelliği
- Gerçek zamanlı sonuç güncelleme

### 📊 İstatistikler
- Toplam yorum sayısı
- Kategori bazlı yorum dağılımı
- Renkli istatistik kartları

### 🏷️ Otomatik Kategorizasyon
- **Olumlu Değerlendirme**: Başarılı performans yorumları
- **Gelişim Odaklı**: Gelişim potansiyeli olan öğrenciler
- **Dikkat Gerektiren**: Özel ilgi gerektiren durumlar
- **Genel Değerlendirme**: Standart değerlendirmeler

### ⚡ Performans Optimizasyonları
- Debouncing ile arama optimizasyonu
- DocumentFragment kullanımı
- Lazy loading ve progressive rendering
- Optimize edilmiş DOM manipülasyonları

## Kurulum

1. Dosyaları web sunucunuza yükleyin
2. `index.html` dosyasını tarayıcınızda açın
3. Sistem otomatik olarak yorumları yükleyecektir

## Dosya Yapısı

```
├── index.html              # Ana HTML dosyası
├── script.js               # JavaScript fonksiyonları
├── style.css               # CSS stilleri
├── commentsData_expanded.js # Yorum veritabanı
└── README.md               # Bu dosya
```

## Kullanım

### Filtreleme
- **Sınıf Filtresi**: Dropdown menüden istediğiniz sınıf seviyesini seçin
- **Dönem Filtresi**: 1. veya 2. dönem yorumlarını filtreleyin
- **Arama**: Yorum başlığı veya içeriğinde arama yapın
- **Temizle**: Tüm filtreleri tek tıkla temizleyin

### Yorum Detayları
- Herhangi bir yorumun "Detay" butonuna tıklayın
- Tam yorum metnini görüntüleyin
- Öğrenci adı ile yorumu özelleştirin
- Önizleme yapın ve kopyalayın

### Dışa Aktarma
- "Dışa Aktar" butonuna tıklayın
- Filtrelenmiş yorumları PDF olarak indirin

## Teknik Detaylar

### Bağımlılıklar
- Bootstrap 5.3.0 (CSS Framework)
- Font Awesome 6.0.0 (İkonlar)
- Vanilla JavaScript (Framework bağımsız)

### Tarayıcı Desteği
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobil Uyumluluk
- Responsive tasarım
- Touch-friendly arayüz
- Optimize edilmiş performans

## Geliştirici Notları

### Performans
- Debouncing ile arama gecikmesi: 300ms
- Progressive loading ile animasyon gecikmesi: 50ms per item
- DocumentFragment kullanımı ile DOM optimizasyonu

### Kategorizasyon Algoritması
Yorumlar içerik analizi ile otomatik kategorize edilir:
- Pozitif anahtar kelimeler: başarılı, yüksek, güçlü, vb.
- Gelişim anahtar kelimeleri: gelişim, destek, potansiyel, vb.
- Dikkat anahtar kelimeleri: problem, zorluk, düşük, vb.

## Lisans

Bu proje eğitim amaçlı geliştirilmiştir.

## İletişim

Sorularınız için GitHub üzerinden issue açabilirsiniz.