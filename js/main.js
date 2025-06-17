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
 * Tema renklerini ve header yüksekliğini günceller.
 */
function updateThemeAndLayout() {
    const selectedClass = headerClassSelect.value;
    const selectedTerm = headerTermSelect.value;
    document.body.className = '';

    if (selectedClass && selectedTerm) {
        document.body.classList.add(`class-${selectedClass}-term-${selectedTerm}`);
        const root = document.documentElement;
        const computedStyle = getComputedStyle(root);
        let primaryRGB = '';

        switch (selectedClass) {
            case '5': primaryRGB = computedStyle.getPropertyValue('--class-5-base-rgb').trim(); break;
            case '6': primaryRGB = computedStyle.getPropertyValue('--class-6-base-rgb').trim(); break;
            case '7': primaryRGB = computedStyle.getPropertyValue('--class-7-base-rgb').trim(); break;
            case '8': primaryRGB = computedStyle.getPropertyValue('--class-8-base-rgb').trim(); break;
        }
        root.style.setProperty('--current-primary-color-rgb', primaryRGB || '0, 123, 255');
    } else {
        document.documentElement.style.setProperty('--current-primary-color-rgb', '0, 123, 255');
    }

    if (mainHeader && dashboardCardsContainer) {
        const totalHeaderAreaHeight = mainHeader.offsetHeight + dashboardCardsContainer.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${totalHeaderAreaHeight}px`);
    }
}

/**
 * Uygulamanın ana olay dinleyicilerini (event listeners) ayarlar.
 */
function initializeEventListeners() {
    // Header'daki ana filtreler değiştiğinde yapılacaklar
    const handleHeaderChange = () => {
        console.log('[main.js] Header selection changed.');
        updateThemeAndLayout();
        loadStudentListForAssignment(false);
        loadCommentTemplates();
        saveData(); // Kullanıcının son seçimini kaydet
    };

    headerClassSelect.addEventListener('change', handleHeaderChange);
    headerTermSelect.addEventListener('change', handleHeaderChange);

    // Pencere yeniden boyutlandırıldığında layout'u güncelle
    window.addEventListener('resize', updateThemeAndLayout);
    
    // Diğer modüllerin kendi iç olay dinleyicilerini başlatması
    initializeModalListeners();
    initializeCommentsTabListeners();
    initializeStudentManagementTabListeners();
    
    console.log('[main.js] All event listeners initialized.');
}

/**
 * Uygulamayı başlatan ana fonksiyon.
 */
function main() {
    // 1. Tarayıcı hafızasından verileri yükle
    loadData();
    
    // 2. Arayüzü (UI) ilk verilere göre güncelle
    updateThemeAndLayout();
    updateDashboardCards();
    loadStudentListForAssignment(false);
    loadCommentTemplates();
    updateCharCount();
    
    // 3. Tüm olay dinleyicilerini ve etkileşimleri başlat
    initializeEventListeners();
    
    console.log('[main.js] Application started successfully.');
}

// HTML dökümanı tamamen yüklendiğinde uygulamayı başlat
document.addEventListener('DOMContentLoaded', main);