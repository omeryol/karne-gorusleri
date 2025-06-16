// js/modals.js

import { showToast } from './utils.js';
import {
    commentPreviewModal, modalCommentTitle, modalCommentText, modalCopyBtn,
    modalSelectBtn, modalCancelBtn, modalPrevCommentBtn, modalNextCommentBtn,
    modalCloseButtons, helpModal, openHelpModalBtn, closeHelpModalBtn,
    allAssignmentsModal, allAssignedCommentsList, closeAllAssignmentsModalBtn,
    closeAllAssignmentsModalBtnBottom, profileList, classSelect, termSelect,
    selectedStudentNameDisplay, commentTextarea, assignCommentBtnEditor // comments-tab'dan gerekli UI elementleri
} from './ui-elements.js';

// selectedStudent ve currentCommentTemplate data-management.js'den gelmeli
import { students, studentAssignments, selectedStudent, setSelectedStudent, currentCommentTemplate, setCurrentCommentTemplate } from './data-management.js';


// Yorum Önizleme Modalını Açma
export function openCommentPreviewModal(template) {
    setCurrentCommentTemplate(template); // Seçili şablonu kaydet
    modalCommentTitle.textContent = template.title;

    // Eğer öğrenci seçili ise, yorumdaki yer tutucuyu doldur
    if (selectedStudent) {
        modalCommentText.textContent = template.comment.replace(/\[Öğrenci Adı\]/g, selectedStudent.firstName);
    } else {
        modalCommentText.textContent = template.comment;
    }
    commentPreviewModal.style.display = 'flex'; // Modalı flex olarak göster
}

// Yorum Önizleme Modalından Yorumu Kopyala
function handleModalCopyComment() {
    const commentToCopy = modalCommentText.textContent;
    navigator.clipboard.writeText(commentToCopy).then(() => {
        showToast('Yorum panoya kopyalandı!', 'success');
        commentPreviewModal.style.display = 'none'; // Modalı kapat
    }).catch(err => {
        console.error('Yorum kopyalanamadı:', err);
        showToast('Yorum kopyalanırken bir hata oluştu.', 'error');
    });
}

// Yorum Önizleme Modalından Yorumu Seç ve Düzenle
function handleModalSelectComment() {
    if (currentCommentTemplate) {
        // Yorumu düzenleyiciye aktar
        commentTextarea.value = modalCommentText.textContent;
        // İlgili profile item'ı aktif yap ve scroll et
        const profileItem = profileList.querySelector(`.profile-item[data-id="${currentCommentTemplate.id}"]`);
        if (profileItem) {
            const currentActive = profileList.querySelector('.profile-item.active');
            if (currentActive) {
                currentActive.classList.remove('active');
            }
            profileItem.classList.add('active');
            profileItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        // Eğer öğrenci seçili ise, "Yorumu Güncelle" olarak değiştir
        if (selectedStudent && studentAssignments[selectedStudent.fullName]) {
            assignCommentBtnEditor.textContent = 'Yorumu Güncelle';
        } else {
            assignCommentBtnEditor.textContent = 'Yorumu Ata';
        }

        commentPreviewModal.style.display = 'none'; // Modalı kapat
    }
}

// Yorum Önizleme Modalından İptal Butonu
function handleModalCancel() {
    commentPreviewModal.style.display = 'none'; // Modalı kapat
}

// Yorum Önizleme Modalında Sonraki/Önceki Yorum Navigasyonu
function navigateCommentModal(direction) {
    const selectedClass = classSelect.value;
    const selectedTerm = termSelect.value;

    if (!selectedClass || !selectedTerm || !window.commentsData[selectedClass] || !window.commentsData[selectedClass][selectedTerm]) { // Global commentsData'ya window.commentsData ile eriş
        showToast('Yorumlar arasında gezinmek için lütfen sınıf ve dönem seçin.', 'info');
        return;
    }

    const templates = window.commentsData[selectedClass][selectedTerm]; // Global commentsData'ya window.commentsData ile eriş
    if (templates.length === 0) {
        showToast('Bu sınıf ve dönem için yorum bulunamadı.', 'info');
        return;
    }

    let currentIndex = -1;
    if (currentCommentTemplate) {
        currentIndex = templates.findIndex(t => t.id === currentCommentTemplate.id);
    }
    if (currentIndex === -1) {
        const activeProfileItem = profileList.querySelector('.profile-item.active');
        if (activeProfileItem) {
            currentIndex = templates.findIndex(t => t.id === activeProfileItem.dataset.id);
        }
    }
    if (currentIndex === -1) {
        currentIndex = (direction === 1) ? 0 : templates.length - 1;
    }

    let nextIndex = currentIndex + direction;

    if (nextIndex < 0) {
        nextIndex = templates.length - 1; // Başa döner
    } else if (nextIndex >= templates.length) {
        nextIndex = 0; // Sona döner
    }

    const nextTemplate = templates[nextIndex];
    if (nextTemplate) {
        modalCommentTitle.textContent = nextTemplate.title;
        if (selectedStudent) {
            modalCommentText.textContent = nextTemplate.comment.replace(/\[Öğrenci Adı\]/g, selectedStudent.firstName);
        } else {
            modalCommentText.textContent = nextTemplate.comment;
        }
        setCurrentCommentTemplate(nextTemplate); // currentCommentTemplate'i güncelle

        const profileItem = profileList.querySelector(`.profile-item[data-id="${nextTemplate.id}"]`);
        if (profileItem) {
            const currentActive = profileList.querySelector('.profile-item.active');
            if (currentActive) {
                currentActive.classList.remove('active');
            }
            profileItem.classList.add('active');
            profileItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}


// Atanan tüm yorumları görüntüleme modalını açma
export function viewAllAssignments() {
    allAssignedCommentsList.innerHTML = '';

    const sortedStudentsWithComments = students.filter(student => studentAssignments[student.fullName] && studentAssignments[student.fullName].trim() !== '')
                                               .sort((a, b) => a.class.localeCompare(b.class) || a.subClass.localeCompare(b.subClass) || a.num - b.num);

    if (sortedStudentsWithComments.length === 0) {
        allAssignedCommentsList.innerHTML = '<p>Henüz hiçbir öğrenciye yorum atanmadı.</p>';
    } else {
        sortedStudentsWithComments.forEach(student => {
            const assignedComment = studentAssignments[student.fullName];
            const studentEntry = document.createElement('div');
            studentEntry.classList.add('student-entry-modal');
            studentEntry.innerHTML = `
                <div class="student-entry-header">
                    <h2>${student.fullName} (${student.class}${student.subClass}. Sınıf - No: ${student.num})</h2>
                    <button class="copy-modal-comment-btn" data-comment="${assignedComment}">Kopyala</button>
                </div>
                <p>${assignedComment}</p>
            `;
            allAssignedCommentsList.appendChild(studentEntry);
        });

        allAssignedCommentsList.querySelectorAll('.copy-modal-comment-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const commentToCopy = event.target.dataset.comment;
                navigator.clipboard.writeText(commentToCopy).then(() => {
                    showToast('Yorum panoya kopyalandı!', 'success');
                }).catch(err => {
                    console.error('Yorum kopyalanırken bir hata oluştu:', err);
                    showToast('Yorum kopyalanırken bir hata oluştu.', 'error');
                });
            });
        });
    }
    allAssignmentsModal.style.display = 'flex';
}


// Modal event listener'ları tek bir yerde toplanabilir
export function initializeModalListeners() {
    modalCopyBtn.addEventListener('click', handleModalCopyComment);
    modalSelectBtn.addEventListener('click', handleModalSelectComment);
    modalCancelBtn.addEventListener('click', handleModalCancel);
    modalPrevCommentBtn.addEventListener('click', () => navigateCommentModal(-1));
    modalNextCommentBtn.addEventListener('click', () => navigateCommentModal(1));

    modalCloseButtons.forEach(button => {
        button.addEventListener('click', () => {
            commentPreviewModal.style.display = 'none';
            helpModal.style.display = 'none';
            allAssignmentsModal.style.display = 'none'; // Yeni modalı da kapat
        });
    });

    closeAllAssignmentsModalBtn.addEventListener('click', () => {
        allAssignmentsModal.style.display = 'none';
    });
    closeAllAssignmentsModalBtnBottom.addEventListener('click', () => {
        allAssignmentsModal.style.display = 'none';
    });

    openHelpModalBtn.addEventListener('click', () => {
        helpModal.style.display = 'flex';
    });
    closeHelpModalBtn.addEventListener('click', () => {
        // 'Anladım' butonuna basıldığında bir daha göstermemek için local storage'a kaydedebiliriz.
        // localStorage.setItem('doNotShowHelpModalAgain', 'true'); // İstenirse aktif edilebilir.
        helpModal.style.display = 'none';
    });

    // Modal dışına tıklayınca kapatma
    window.addEventListener('click', (event) => {
        if (event.target === commentPreviewModal) {
            commentPreviewModal.style.display = 'none';
        }
        if (event.target === helpModal) {
            helpModal.style.display = 'none';
        }
        if (event.target === allAssignmentsModal) {
            allAssignmentsModal.style.display = 'none';
        }
    });

    // Kullanım kılavuzu modalının kontrolü:
    // Sadece başlangıçta bir kez göstermek veya hiç göstermemek için:
    const doNotShowHelpAgain = localStorage.getItem('doNotShowHelpModalAgain');
    if (doNotShowHelpAgain === 'true') {
        helpModal.style.display = 'none';
    } else {
        // İlk açılışta veya ayar 'false' ise göster.
        // Eğer her zaman sadece butona basınca açılmasını istiyorsak, bu else bloğunu tamamen silebiliriz.
        // İhtiyacınıza göre bu kısmı yorum satırı yapabilir veya silebilirsiniz.
        // helpModal.style.display = 'flex';
        // console.log('Kullanım kılavuzu gösterildi.');
    }
}