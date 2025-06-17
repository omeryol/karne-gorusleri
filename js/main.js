// js/main.js

// Gerekli modülleri ve UI elemanlarını içeri aktar
import { saveData, loadData } from './data-management.js';
import { updateDashboardCards } from './dashboard.js';
import { initializeModalListeners } from './modals.js';
import { initializeCommentsTabListeners, loadCommentTemplates, loadStudentListForAssignment, updateCharCount } from './comments-tab.js';
import { initializeStudentManagementTabListeners } from './student-management-tab.js';
import { headerClassSelect, headerTermSelect, mainHeader, dashboardCardsContainer } from './ui-elements.js';

console.log('[main.js] Main module loaded.');

/**
 * Kullanıcının seçtiği sınıf ve döneme göre uygulamanın tema renklerini ve
 * header yüksekliği gibi dinamik layout ayarlarını günceller.
 * Seçim yapılmamışsa varsayılan bir tema uygular.
 */
function updateThemeAndLayout() {
    const selectedClass = headerClassSelect.value;
    const selectedTerm = headerTermSelect.value;
    document.body.className = ''; // Önceki tema sınıflarını temizle

    if (selectedClass && selectedTerm) {
        // Seçime göre body'e özel bir sınıf ekleyerek temayı CSS üzerinden etkinleştir
        document.body.classList.add(`class-${selectedClass}-term-${selectedTerm}`);
        const root = document.documentElement;
        const computedStyle = getComputedStyle(root);
        let primaryRGB = '';

        // Seçilen sınıfa göre CSS'te tanımlı olan RGB renk kodunu al
        switch (selectedClass) {
            case '5': primaryRGB = computedStyle.getPropertyValue('--class-5-base-rgb').trim(); break;
            case '6': primaryRGB = computedStyle.getPropertyValue('--class-6-base-rgb').trim(); break;
            case '7': primaryRGB = computedStyle.getPropertyValue('--class-7-base-rgb').trim(); break;
            case '8': primaryRGB = computedStyle.getPropertyValue('--class-8-base-rgb').trim(); break;
        }
        // Geçerli tema rengini CSS değişkeni olarak ata. Bulunamazsa varsayılan mavi atanır.
        root.style.setProperty('--current-primary-color-rgb', primaryRGB || '0, 123, 255');
    } else {
        // Eğer sınıf veya dönem seçilmemişse, varsayılan mavi rengin RGB'sini ata
        document.documentElement.style.setProperty('--current-primary-color-rgb', '0, 123, 255');
    }

    // Panellerin maksimum yüksekliğini hesaplamak için header'ın toplam yüksekliğini ayarla
    if (mainHeader && dashboardCardsContainer) {
        const totalHeaderAreaHeight = mainHeader.offsetHeight + dashboardCardsContainer.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${totalHeaderAreaHeight}px`);
    }
}

/**
 * Uygulamanın ana olay dinleyicilerini (event listeners) ayarlar.
 * Bu fonksiyon, tüm interaktif elemanların çalışmasını sağlar.
 */
function initializeEventListeners() {
    // Header'daki ana filtreler değiştiğinde yapılacaklar
    const handleHeaderChange = () => {
        console.log('[main.js] Header selection changed.');
        updateThemeAndLayout();
        loadStudentListForAssignment(false); // Öğrenci listesini yeniden filtrele
        loadCommentTemplates(); // Yorum şablonlarını yeniden yükle
        saveData(); // Kullanıcının son seçimini kaydet
    };

    headerClassSelect.addEventListener('change', handleHeaderChange);
    headerTermSelect.addEventListener('change', handleHeaderChange);

    // Pencere yeniden boyutlandırıldığında layout'u (header yüksekliği) güncelle
    window.addEventListener('resize', updateThemeAndLayout);
    
    // Diğer modüllerin kendi iç olay dinleyicilerini başlatması için ilgili fonksiyonları çağır
    initializeModalListeners();
    initializeCommentsTabListeners();
    initializeStudentManagementTabListeners();
    
    console.log('[main.js] All event listeners initialized.');
}

/**
 * Uygulamayı başlatan ana fonksiyon.
 * Sayfa yüklendiğinde bir kez çalışır ve tüm sistemi başlatır.
 */
function main() {
    // 1. Tarayıcı hafızasından (localStorage) verileri yükle
    loadData();
    
    // 2. Arayüzü (UI) yüklenen ilk verilere göre güncelle
    updateThemeAndLayout();
    updateDashboardCards();
    loadStudentListForAssignment(false);
    loadCommentTemplates();
    updateCharCount();
    
    // 3. Tüm olay dinleyicilerini ve etkileşimleri başlat
    initializeEventListeners();
    
    console.log('[main.js] Application started successfully.');
}

// HTML dökümanı tamamen yüklendiğinde 'main' fonksiyonunu çalıştır
document.addEventListener('DOMContentLoaded', main);