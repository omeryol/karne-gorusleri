// js/main.js

// Modülleri içeri aktarıyoruz
import { showToast } from './utils.js';
import { loadData, saveData } from './data-management.js';
import { updateDashboardCards } from './dashboard.js';
import { initializeModalListeners } from './modals.js';
import { initializeCommentsTabListeners, loadCommentTemplates, loadStudentListForAssignment, updateCharCount } from './comments-tab.js'; // updateCharCount eklendi
import { initializeStudentManagementTabListeners, updateManagedStudentListUI } from './student-management-tab.js';
import { tabButtons, classSelect, termSelect } from './ui-elements.js'; // classSelect ve termSelect eklendi


// Sekme değiştirme fonksiyonu
function switchTab(tabId) {
    console.log(`[main.js] Sekme değiştiriliyor: ${tabId}`);
    // Tüm sekme içeriklerini gizle
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    // Tüm sekme butonlarının aktif stilini kaldır
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });

    // İstenen sekmeyi ve butonunu aktif yap
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`.tab-button[data-tab="${tabId.replace('-tab', '')}"]`).classList.add('active');

    // Sekmeye özel yüklemeler/güncellemeler
    if (tabId === 'comments-tab') {
        console.log('[main.js] Yorum Atama sekmesi aktif. Öğrenci listesi ve yorum şablonları yükleniyor.');
        loadStudentListForAssignment(document.getElementById('filter-unassigned-btn').classList.contains('active-filter'));
        loadCommentTemplates();
        updateCharCount(); // Yorum alanı için karakter sayacını güncelledik
    } else if (tabId === 'student-management-tab') {
        console.log('[main.js] Öğrenci Yönetimi sekmesi aktif. Öğrenci listesi güncelleniyor.');
        updateManagedStudentListUI();
    }
    saveData(); // Sekme değişimini kaydet
    updateDashboardCards(); // Dashboard'ı güncelle
}

// Tema renklerini güncelleyen fonksiyon
function updateThemeColors() {
    console.log('[main.js] Tema renkleri güncelleniyor.');
    const selectedClass = classSelect.value; // ui-elements'den geldi
    const selectedTerm = termSelect.value; // ui-elements'den geldi

    document.body.className = ''; // Mevcut sınıfı temizle

    if (selectedClass && selectedTerm) {
        document.body.classList.add(`class-${selectedClass}-term-${selectedTerm}`);
    }
}

// Uygulama yüklendiğinde çalışacak ana fonksiyon
document.addEventListener('DOMContentLoaded', () => {
    console.log('[main.js] DOM içeriği yüklendi. Uygulama başlatılıyor...');

    // Verileri Local Storage'dan yükle
    loadData();
    console.log('[main.js] Veriler yüklendi.');

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
    initializeStudentManagementTabListeners();
    console.log('[main.js] Öğrenci Yönetimi sekmesi dinleyicileri başlatıldı.');

    // Sekme navigasyon event dinleyicileri
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            switchTab(button.dataset.tab + '-tab');
        });
    });

    // Kayıtlı aktif sekmeyi yükle ve aç
    const activeTab = localStorage.getItem('activeTab');
    if (activeTab) {
        switchTab(activeTab + '-tab');
        console.log(`[main.js] Kayıtlı aktif sekme yüklendi: ${activeTab}`);
    } else {
        switchTab('comments-tab'); // Varsayılan sekme
        console.log('[main.js] Varsayılan sekme: Yorum Atama.');
    }

    // Tema renklerini yükle (data-management'dan gelen seçili sınıf ve döneme göre)
    updateThemeColors();
    console.log('[main.js] Tema renkleri ayarlandı.');

    // Service Worker kaydı (zaten index.html'de global script olarak mevcut, burada tekrar etmeye gerek yok)
});

// window objesine global olarak ihtiyaç duyulan fonksiyonları veya değişkenleri ekleyebiliriz
// Bu, özellikle comment_templates_data.js gibi modül olmayan harici scriptler için faydalı olabilir.
// Ancak, daha iyi uygulama, commentsData'yı da bir modül yapıp import etmektir.
// Şimdilik, comments-tab.js içinde window.commentsData kullanıldığı için bu global erişimi koruyoruz.