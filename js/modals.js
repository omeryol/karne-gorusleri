// js/modals.js

import { showToast, toggleModal } from './utils.js';
import {
    commentPreviewModal, modalCommentTitle, modalCommentText, modalCopyBtn,
    modalSelectBtn, modalPrevCommentBtn, modalNextCommentBtn,
    commentPreviewModalCloseButton,
    helpModal, openHelpModalBtn, helpModalCloseButton,
    allAssignmentsModal, allAssignedCommentsList, allAssignmentsModalCloseButton,
    studentManagementModal, studentManagementModalCloseButtons,
    modalTabButtons, modalTabContents,
    headerClassSelect, headerTermSelect,
    commentTextarea, assignCommentBtn,
    commentProfileList,
} from './ui-elements.js';
import { students, studentAssignments, selectedStudent, setSelectedStudent, currentCommentTemplate, setCurrentCommentTemplate } from './data-management.js';

console.log('[modals.js] Modal yönetimi modülü yükleniyor...');

// ... (openCommentPreviewModal, handleModalCopyComment, handleModalSelectComment, navigateCommentModal, viewAllAssignments, switchModalTab fonksiyonları önceki düzeltilmiş versiyondaki gibi kalabilir, bir değişiklik gerekmiyor) ...
export { openCommentPreviewModal, viewAllAssignments, switchModalTab }; // Diğer modüllerin erişimi için

// Modal event listener'larını başlatma fonksiyonu
export function initializeModalListeners() {
    console.log('[modals.js] initializeModalListeners çağrıldı: Modal dinleyicileri başlatılıyor.');

    // İYİLEŞTİRME: Her bir olay dinleyicisi atanmadan önce ilgili butonun varlığı kontrol ediliyor.
    // Bu, HTML'de bir eleman olmasa bile kodun hata vermesini engeller.
    if(openHelpModalBtn) {
        openHelpModalBtn.addEventListener('click', () => {
            if(helpModal) toggleModal(helpModal, true);
        });
    }

    if (modalCopyBtn) modalCopyBtn.addEventListener('click', handleModalCopyComment);
    if (modalSelectBtn) modalSelectBtn.addEventListener('click', handleModalSelectComment);
    if (modalPrevCommentBtn) modalPrevCommentBtn.addEventListener('click', () => navigateCommentModal(-1));
    if (modalNextCommentBtn) modalNextCommentBtn.addEventListener('click', () => navigateCommentModal(1));

    // İYİLEŞTİRME: Kapatma butonları artık bir liste (NodeList) olduğu için her birine döngü ile dinleyici ekleniyor.
    if (commentPreviewModalCloseButton) {
        commentPreviewModalCloseButton.forEach(btn => btn.addEventListener('click', () => toggleModal(commentPreviewModal, false)));
    }
    if (helpModalCloseButton) {
        helpModalCloseButton.forEach(btn => btn.addEventListener('click', () => {
            toggleModal(helpModal, false);
            localStorage.setItem('doNotShowHelpModalAgain', 'true');
        }));
    }
    if (allAssignmentsModalCloseButton) {
        allAssignmentsModalCloseButton.forEach(btn => btn.addEventListener('click', () => toggleModal(allAssignmentsModal, false)));
    }
    if (studentManagementModalCloseButtons) {
        studentManagementModalCloseButtons.forEach(button => {
            button.addEventListener('click', () => toggleModal(studentManagementModal, false));
        });
    }
    if (modalTabButtons) {
        modalTabButtons.forEach(button => {
            button.addEventListener('click', () => switchModalTab(button.dataset.modalTab));
        });
    }

    // Modal dışına tıklayınca kapatma
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
             toggleModal(event.target, false);
        }
    });

    // Kullanım kılavuzu modalının başlangıçta açılma kontrolü
    const doNotShowHelpAgain = localStorage.getItem('doNotShowHelpModalAgain');
    if (!doNotShowHelpAgain && helpModal) {
         // Eğer daha önce kapatılmadıysa, ilk ziyarette gösterilebilir.
         // Şimdilik otomatik açma kapalı, butona basarak açılıyor.
         console.log('[modals.js] Yardım modalı başlangıçta otomatik açılmayacak, butona basılması bekleniyor.');
    }
}