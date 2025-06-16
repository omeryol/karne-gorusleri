// js/main.js

// Modülleri içeri aktarıyoruz
import { showToast } from './utils.js';
import { loadData, saveData } from './data-management.js';
import { updateDashboardCards } from './dashboard.js';
import { initializeModalListeners } from './modals.js';
import { initializeCommentsTabListeners, loadCommentTemplates, loadStudentListForAssignment } from './comments-tab.js';
import { initializeStudentManagementTabListeners, updateManagedStudentListUI } from './student-management-tab.js';
import { tabButtons } from './ui-elements.js';

// Global scope'tan commentsData'ya erişim sağlamak için (eğer comment_templates_data.js module olarak export edilmiyorsa)
// window.commentsData'ya diğer modüllerde erişmek daha güvenli.

// Sekme değiştirme fonksiyonu
function switchTab(tabId) {
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
        // Yorum atama sekmesine geçildiğinde öğrenci listesini ve yorum şablonlarını yeniden yükle
        loadStudentListForAssignment(document.getElementById('filter-unassigned-btn').classList.contains('active-filter'));
        loadCommentTemplates();
    } else if (tabId === 'student-management-tab') {
        // Öğrenci yönetimi sekmesine geçildiğinde öğrenci listesini yeniden yükle
        updateManagedStudentListUI();
    }
    saveData(); // Sekme değişimini kaydet
    updateDashboardCards(); // Dashboard'ı güncelle
}

// Tema renklerini güncelleyen fonksiyon
function updateThemeColors() {
    const selectedClass = document.getElementById('class-select').value;
    const selectedTerm = document.getElementById('term-select').value;

    document.body.className = ''; // Mevcut sınıfı temizle

    if (selectedClass && selectedTerm) {
        document.body.classList.add(`class-${selectedClass}-term-${selectedTerm}`);
    }
}

// Uygulama yüklendiğinde çalışacak ana fonksiyon
document.addEventListener('DOMContentLoaded', () => {
    // UI elementlerini initialize eden fonksiyonları çağır (Eğer ui-elements.js sadece export ediyorsa, buradan çağrıya gerek yok)
    // Eğer ui-elements.js içinde DOM manipülasyonu yapan fonksiyonlar olsaydı, onları burada çağırırdık.

    // Verileri Local Storage'dan yükle
    loadData();

    // Dashboard kartlarını güncelle
    updateDashboardCards();

    // Modal event dinleyicilerini başlat
    initializeModalListeners();

    // Yorum sekmesi event dinleyicilerini başlat
    initializeCommentsTabListeners();

    // Öğrenci Yönetimi sekmesi event dinleyicilerini başlat
    initializeStudentManagementTabListeners();

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
    } else {
        switchTab('comments-tab'); // Varsayılan sekme
    }

    // Tema renklerini yükle (data-management'dan gelen seçili sınıf ve döneme göre)
    updateThemeColors();

    // Service Worker kaydı (zaten index.html'de global script olarak mevcut, burada tekrar etmeye gerek yok)
    // Ancak modüler yapıya uygun olması için bu kısım burada değil, doğrudan index.html'de kalmalı.
});

// window objesine global olarak ihtiyaç duyulan fonksiyonları veya değişkenleri ekleyebiliriz
// Bu, özellikle comment_templates_data.js gibi modül olmayan harici scriptler için faydalı olabilir.
// Ancak, daha iyi uygulama, commentsData'yı da bir modül yapıp import etmektir.
// Şimdilik, comments-tab.js içinde window.commentsData kullanıldığı için bu global erişimi koruyoruz.

// Dışa aktarılacak bir şey yoksa bile dosyanın bir modül olduğunu belirtmek için boş export kullanılabilir
// export {};