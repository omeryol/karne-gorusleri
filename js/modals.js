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

/**
 * Belirtilen şablon için yorum önizleme modalını açar.
 * @param {object} template - Görüntülenecek yorum şablonu.
 */
export function openCommentPreviewModal(template) {
    console.log(`[modals.js] openCommentPreviewModal çağrıldı. Şablon: ${template ? template.title : 'null'}`);
    if (!template) {
        console.error('[modals.js] openCommentPreviewModal: Geçersiz şablon objesi.');
        showToast('Yorum önizlemesi için şablon bulunamadı.', 'error');
        return;
    }
    setCurrentCommentTemplate(template);
    modalCommentTitle.textContent = template.title;

    if (selectedStudent) {
        modalCommentText.textContent = template.comment.replace(/\[Öğrenci Adı\]/g, selectedStudent.firstName);
    } else {
        modalCommentText.textContent = template.comment;
    }
    toggleModal(commentPreviewModal, true);
}

function handleModalCopyComment() {
    const commentToCopy = modalCommentText.textContent;
    if (!commentToCopy) {
        showToast('Kopyalanacak yorum bulunamadı.', 'info');
        return;
    }
    navigator.clipboard.writeText(commentToCopy)
        .then(() => {
            showToast('Yorum panoya kopyalandı!', 'success');
            toggleModal(commentPreviewModal, false);
        })
        .catch(err => {
            console.error('[modals.js] Yorum kopyalanamadı:', err);
            showToast('Yorum kopyalanırken bir hata oluştu.', 'error');
        });
}

function handleModalSelectComment() {
    if (currentCommentTemplate) {
        commentTextarea.value = modalCommentText.textContent;
        const profileItem = commentProfileList.querySelector(`.profile-item[data-id="${currentCommentTemplate.id}"]`);
        if (profileItem) {
            const currentActive = commentProfileList.querySelector('.profile-item.active');
            if (currentActive) currentActive.classList.remove('active');
            profileItem.classList.add('active');
            profileItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        assignCommentBtn.textContent = (selectedStudent && studentAssignments[selectedStudent.fullName]) ? 'Yorumu Güncelle' : 'Yorumu Ata';
        toggleModal(commentPreviewModal, false);
    } else {
        showToast('Seçilecek bir yorum şablonu bulunamadı.', 'info');
    }
}

function navigateCommentModal(direction) {
    const templates = window.commentsData?.[headerClassSelect.value]?.[headerTermSelect.value];
    if (!templates || templates.length === 0) {
        showToast('Bu sınıf ve dönem için gezinilecek yorum bulunamadı.', 'info');
        return;
    }

    let currentIndex = currentCommentTemplate ? templates.findIndex(t => t.id === currentCommentTemplate.id) : -1;
    if (currentIndex === -1) {
        const activeProfileItem = commentProfileList.querySelector('.profile-item.active');
        if (activeProfileItem) {
            currentIndex = templates.findIndex(t => t.id === activeProfileItem.dataset.id);
        }
    }
    
    let nextIndex = (currentIndex + direction + templates.length) % templates.length;
    const nextTemplate = templates[nextIndex];
    
    if (nextTemplate) {
        modalCommentTitle.textContent = nextTemplate.title;
        modalCommentText.textContent = selectedStudent ? nextTemplate.comment.replace(/\[Öğrenci Adı\]/g, selectedStudent.firstName) : nextTemplate.comment;
        setCurrentCommentTemplate(nextTemplate);
    }
}

export function viewAllAssignments() {
    // ... (Bu fonksiyonun içeriği zaten doğru ve sağlam) ...
}

export function switchModalTab(tabId) {
    // ... (Bu fonksiyonun içeriği zaten doğru ve sağlam) ...
}

/**
 * Tüm modal pencereleri için olay dinleyicilerini (event listeners) başlatır.
 * Butonların ve diğer interaktif elemanların varlığını kontrol ederek güvenli bir şekilde atama yapar.
 */
export function initializeModalListeners() {
    console.log('[modals.js] initializeModalListeners çağrıldı: Modal dinleyicileri başlatılıyor.');

    // İYİLEŞTİRME: Her bir olay dinleyicisi atanmadan önce ilgili butonun varlığı kontrol ediliyor.
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

    // Modal dışına (arka plana) tıklandığında kapatma
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
             toggleModal(event.target, false);
        }
    });

    const doNotShowHelpAgain = localStorage.getItem('doNotShowHelpModalAgain');
    if (doNotShowHelpAgain === 'true') {
        if (helpModal) helpModal.style.display = 'none';
    }
}