// js/main.js

// Modülleri içeri aktarıyoruz
import { saveData, loadData } from './data-management.js';
import { updateDashboardCards } from './dashboard.js';
import { initializeModalListeners } from './modals.js';
import { initializeCommentsTabListeners, loadCommentTemplates, loadStudentListForAssignment, updateCharCount } from './comments-tab.js';
import { initializeStudentManagementTabListeners } from './student-management-tab.js';
import { headerClassSelect, headerTermSelect, mainHeader, dashboardCardsContainer } from './ui-elements.js';

console.log('[main.js] main.js modülü yükleniyor...');

// Tema renklerini güncelleyen fonksiyon
function updateThemeColors() {
    console.log('[main.js] updateThemeColors çağrıldı.');
    const selectedClass = headerClassSelect.value;
    const selectedTerm = headerTermSelect.value;
    document.body.className = '';

    if (selectedClass && selectedTerm) {
        document.body.classList.add(`class-${selectedClass}-term-${selectedTerm}`);
        const root = document.documentElement;
        const computedStyle = getComputedStyle(root);
        let primaryRGB = '';
        if (selectedClass === '5') primaryRGB = computedStyle.getPropertyValue('--class-5-base-rgb').trim();
        else if (selectedClass === '6') primaryRGB = computedStyle.getPropertyValue('--class-6-base-rgb').trim();
        else if (selectedClass === '7') primaryRGB = computedStyle.getPropertyValue('--class-7-base-rgb').trim();
        else if (selectedClass === '8') primaryRGB = computedStyle.getPropertyValue('--class-8-base-rgb').trim();

        if (primaryRGB) {
            root.style.setProperty('--current-primary-color-rgb', primaryRGB);
        } else {
            root.style.setProperty('--current-primary-color-rgb', '0, 123, 255');
        }
    } else {
        document.documentElement.style.setProperty('--current-primary-color-rgb', '0, 123, 255');
    }

    if (mainHeader && dashboardCardsContainer) {
        const totalHeaderAreaHeight = mainHeader.offsetHeight + dashboardCardsContainer.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${totalHeaderAreaHeight}px`);
    }
}

// Uygulama yüklendiğinde çalışacak ana fonksiyon
document.addEventListener('DOMContentLoaded', () => {
    console.log('[main.js] DOM içeriği yüklendi. Uygulama başlatılıyor...');

    loadData();
    console.log('[main.js] Veriler yüklendi.');

    updateThemeColors();
    console.log('[main.js] Tema renkleri ilk ayarlandı.');

    updateDashboardCards();
    console.log('[main.js] Dashboard güncellendi.');

    initializeModalListeners();
    console.log('[main.js] Modal dinleyicileri başlatıldı.');

    initializeCommentsTabListeners();
    console.log('[main.js] Yorum sekmesi dinleyicileri başlatıldı.');

    initializeStudentManagementTabListeners();
    console.log('[main.js] Öğrenci Yönetimi dinleyicileri başlatıldı.');

    loadStudentListForAssignment(false);
    loadCommentTemplates();
    updateCharCount();
    console.log('[main.js] Öğrenci listesi ve yorum şablonları ilk yüklendi.');

    // --- TEŞHİS ADIMI ---
    console.log('[main.js] Olay dinleyicileri ekleniyor...');
    
    if (headerClassSelect) {
        console.log('[main.js] headerClassSelect elementi bulundu. Dinleyici ekleniyor.', headerClassSelect);
        headerClassSelect.addEventListener('change', () => {
            console.log('[main.js] SINIF SEÇİMİ DEĞİŞTİ. Yeni değer:', headerClassSelect.value);
            updateThemeColors();
            loadStudentListForAssignment(false);
            loadCommentTemplates();
            saveData();
        });
    } else {
        console.error('[main.js] HATA: headerClassSelect elementi bulunamadı!');
    }

    if (headerTermSelect) {
        console.log('[main.js] headerTermSelect elementi bulundu. Dinleyici ekleniyor.', headerTermSelect);
        headerTermSelect.addEventListener('change', () => {
            console.log('[main.js] DÖNEM SEÇİMİ DEĞİŞTİ. Yeni değer:', headerTermSelect.value);
            updateThemeColors();
            loadStudentListForAssignment(false);
            loadCommentTemplates();
            saveData();
        });
    } else {
        console.error('[main.js] HATA: headerTermSelect elementi bulunamadı!');
    }
    // --- TEŞHİS ADIMI SONU ---


    window.addEventListener('resize', updateThemeColors);
});

console.log('[main.js] main.js modülü başarıyla yüklendi.');