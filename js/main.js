// js/main.js

// Modülleri içeri aktarıyoruz
import { showToast } from './utils.js';
import { loadData, saveData } from './data-management.js';
import { updateDashboardCards } from './dashboard.js';
import { initializeModalListeners } from './modals.js';
import { initializeCommentsTabListeners, loadCommentTemplates, loadStudentListForAssignment, updateCharCount } from './comments-tab.js';
import { initializeStudentManagementTabListeners, updateManagedStudentListUI } from './student-management-tab.js';
import { headerClassSelect, headerTermSelect, mainHeader, dashboardCardsContainer } from './ui-elements.js';

/*
    Hata Ayıklama Notu:
    Bu dosya, uygulamanın ana başlatma noktasıdır ve tüm diğer modüllerin koordinasyonunu sağlar.
    `DOMContentLoaded` olayının doğru tetiklendiğini ve tüm başlatma fonksiyonlarının
    beklendiği sırayla çağrıldığını konsol loglarından kontrol edin.
    Tema rengi güncellemesinin `headerClassSelect` ve `headerTermSelect` değişikliklerinde doğru çalıştığından
    ve genel UI'ın güncellendiğinden emin olun.
*/
console.log('[main.js] main.js modülü yükleniyor...');


// Tema renklerini güncelleyen fonksiyon
function updateThemeColors() {
    console.log('[main.js] updateThemeColors çağrıldı: Tema renkleri güncelleniyor.');
    const selectedClass = headerClassSelect.value;
    const selectedTerm = headerTermSelect.value;

    // Body'deki tüm mevcut sınıf ve dönem sınıflarını temizle
    document.body.className = '';

    if (selectedClass && selectedTerm) {
        document.body.classList.add(`class-${selectedClass}-term-${selectedTerm}`);
        console.log(`[main.js] Body sınıfı güncellendi: class-${selectedClass}-term-${selectedTerm}`);
    } else {
        console.log('[main.js] Sınıf veya dönem seçili değil, varsayılan tema kullanılıyor.');
    }

    // Header yüksekliğini dinamik olarak ayarla
    // Bu, sticky dashboard'un doğru top değerini alması için önemlidir.
    if (mainHeader && dashboardCardsContainer) {
        // İlk yüklemede veya yeniden düzenlemede header ve dashboard'ın toplam yüksekliğini al
        const headerHeight = mainHeader.offsetHeight;
        const dashboardHeight = dashboardCardsContainer.offsetHeight;
        const totalHeaderAreaHeight = headerHeight + dashboardHeight;
        document.documentElement.style.setProperty('--header-height', `${totalHeaderAreaHeight}px`);
        console.log(`[main.js] CSS değişkeni --header-height güncellendi: ${totalHeaderAreaHeight}px`);
    }
}

// Uygulama yüklendiğinde çalışacak ana fonksiyon
document.addEventListener('DOMContentLoaded', () => {
    console.log('[main.js] DOM içeriği yüklendi. Uygulama başlatılıyor...');

    // Verileri Local Storage'dan yükle
    loadData();
    console.log('[main.js] Veriler yüklendi.');

    // Tema renklerini yükle (data-management'dan gelen seçili sınıf ve döneme göre)
    // Bu, loadData'dan sonra çağrılmalı ki headerClassSelect ve headerTermSelect değerleri dolu olsun.
    updateThemeColors();
    console.log('[main.js] Tema renkleri ilk ayarlandı.');

    // Dashboard kartlarını güncelle
    updateDashboardCards();
    console.log('[main.js] Dashboard güncellendi.');

    // Modal event dinleyicilerini başlat
    initializeModalListeners();
    console.log('[main.js] Modal dinleyicileri başlatıldı.');

    // Yorum sekmesi event dinleyicilerini başlat
    initializeCommentsTabListeners();
    console.log('[main.js] Yorum sekmesi dinleyicileri başlatıldı.');

    // Öğrenci Yönetimi sekmesi event dinleyicilerini başlat
    // (Bu artık modal içinde çalışacağı için initializeStudentManagementTabListeners fonksiyonu
    // modal açıldığında updateManagedStudentListUI'yi çağıracak.)
    initializeStudentManagementTabListeners();
    console.log('[main.js] Öğrenci Yönetimi dinleyicileri başlatıldı.');

    // İlk yüklemede öğrenci listesini ve yorum şablonlarını yükle
    // filter-unassigned-btn'in aktifliğini başlangıçta kontrol et (false varsayılan)
    loadStudentListForAssignment(false);
    loadCommentTemplates();
    updateCharCount(); // Yorum alanı karakter sayacını ilk yüklemede güncelle
    console.log('[main.js] Öğrenci listesi ve yorum şablonları ilk yüklendi.');

    // Header'daki sınıf ve dönem seçimi değiştiğinde listeleri ve temayı güncelle
    headerClassSelect.addEventListener('change', () => {
        updateThemeColors(); // Tema rengini güncelle
        loadStudentListForAssignment(false); // Öğrenci listesini yeniden yükle
        loadCommentTemplates(); // Yorum şablonlarını yeniden yükle
        saveData(); // Değişikliği kaydet
        console.log('[main.js] Header Sınıf seçimi değişti, UI güncellendi.');
    });
    headerTermSelect.addEventListener('change', () => {
        updateThemeColors(); // Tema rengini güncelle
        loadStudentListForAssignment(false); // Öğrenci listesini yeniden yükle
        loadCommentTemplates(); // Yorum şablonlarını yeniden yükle
        saveData(); // Değişikliği kaydet
        console.log('[main.js] Header Dönem seçimi değişti, UI güncellendi.');
    });

    // Header yüksekliğini dinamik olarak ayarla (JS ile güncelleyici)
    // Bu, `layout.css` ve `dashboard.css`'teki sticky header ve dashboard için önemlidir.
    // İlk yüklemede ve pencere boyutu değiştiğinde yükseklik ayarlanır.
    window.addEventListener('resize', updateThemeColors); // Pencere boyutu değiştiğinde tema ve yüksekliği güncelle
});

console.log('[main.js] main.js modülü başarıyla yüklendi.');

// commentsData global olarak index.html'den yüklendiği için window objesi üzerinden erişiyoruz.
// serviceWorker kaydı da index.html'de zaten mevcut.