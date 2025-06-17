// js/modals.js

import { showToast, toggleModal } from './utils.js'; // toggleModal util'den alınacak
import {
    commentPreviewModal, modalCommentTitle, modalCommentText, modalCopyBtn,
    modalSelectBtn, modalPrevCommentBtn, modalNextCommentBtn,
    commentPreviewModalCloseButton, // Artık bir NodeList (liste)
    helpModal, openHelpModalBtn, helpModalCloseButton, // Artık bir NodeList (liste)
    allAssignmentsModal, allAssignedCommentsList, allAssignmentsModalCloseButton, // Artık bir NodeList (liste)
    studentManagementModal, studentManagementModalCloseButtons, // Bu zaten bir NodeList idi
    modalTabButtons, modalTabContents, // Öğrenci Yönetimi Modalı içindeki sekme elemanları
    headerClassSelect, headerTermSelect, // Yeni header'daki sınıf/dönem select'leri
    commentTextarea, assignCommentBtn, // comments-tab'dan gerekli UI elementleri
    commentProfileList, // Yorum profili listesi
} from './ui-elements.js';
import { studentAssignments, selectedStudent, setSelectedStudent, currentCommentTemplate, setCurrentCommentTemplate, students } from './data-management.js'; //


/*
    Hata Ayıklama Notu:
    Bu dosya, tüm modal pencerelerinin açılma, kapanma ve iç etkileşimlerini yönetir.
    Modalların doğru açılıp kapandığını, içeriğinin güncellendiğini ve içindeki butonların çalıştığını doğrulamak için:
    1. Her bir modalı (yorum önizleme, öğrenci yönetimi, tüm atamalar, yardım) açıp kapatmayı deneyin.
    2. Konsol loglarını (`[modals.js]`) takip ederek modal durum değişikliklerini ve fonksiyon çağrılarını kontrol edin.
    3. Özellikle `toggleModal` util fonksiyonunun doğru kullanıldığından ve animasyonların çalıştığından emin olun.
    4. Öğrenci Yönetimi modalı içindeki sekme geçişlerinin sorunsuz olduğunu doğrulayın.
    5. Yorum önizleme modalındaki prev/next butonlarının doğru yorumlar arasında geçiş yaptığını kontrol edin.
*/
console.log('[modals.js] Modal yönetimi modülü yükleniyor...'); //

// Yorum Önizleme Modalını Açma
export function openCommentPreviewModal(template) {
    console.log(`[modals.js] openCommentPreviewModal çağrıldı. Şablon: ${template ? template.title : 'null'}`); //
    if (!template) {
        console.error('[modals.js] openCommentPreviewModal: Geçersiz şablon objesi.'); //
        showToast('Yorum önizlemesi için şablon bulunamadı.', 'error'); //
        return;
    }
    setCurrentCommentTemplate(template); // Seçili şablonu kaydet
    modalCommentTitle.textContent = template.title; //

    // Eğer öğrenci seçili ise, yorumdaki yer tutucuyu doldur
    if (selectedStudent) {
        modalCommentText.textContent = template.comment.replace(/\[Öğrenci Adı\]/g, selectedStudent.firstName); //
        console.log(`[modals.js] Yorum metnine öğrenci adı eklendi: ${selectedStudent.firstName}`); //
    } else {
        modalCommentText.textContent = template.comment; //
        console.log('[modals.js] Öğrenci seçili değil, yorum metni olduğu gibi kullanıldı.'); //
    }
    toggleModal(commentPreviewModal, true); // Modalı aç
}

// Yorum Önizleme Modalından Yorumu Kopyala
function handleModalCopyComment() {
    console.log('[modals.js] handleModalCopyComment çağrıldı.'); //
    const commentToCopy = modalCommentText.textContent; //
    if (!commentToCopy) {
        console.warn('[modals.js] Kopyalanacak yorum metni boş.'); //
        showToast('Kopyalanacak yorum bulunamadı.', 'info'); //
        return;
    }
    navigator.clipboard.writeText(commentToCopy).then(() => {
        showToast('Yorum panoya kopyalandı!', 'success'); //
        toggleModal(commentPreviewModal, false); // Modalı kapat
        console.log('[modals.js] Yorum başarıyla panoya kopyalandı.'); //
    }).catch(err => {
        console.error('[modals.js] Yorum kopyalanamadı:', err); //
        showToast('Yorum kopyalanırken bir hata oluştu.', 'error'); //
    });
}

// Yorum Önizleme Modalından Yorumu Seç ve Düzenle
function handleModalSelectComment() {
    console.log('[modals.js] handleModalSelectComment çağrıldı.'); //
    if (currentCommentTemplate) {
        commentTextarea.value = modalCommentText.textContent; // Yorumu düzenleyiciye aktar
        console.log(`[modals.js] Yorum "${currentCommentTemplate.title}" yorum alanına aktarıldı.`); //

        // İlgili profile item'ı aktif yap ve scroll et
        const profileItem = commentProfileList.querySelector(`.profile-item[data-id="${currentCommentTemplate.id}"]`); //
        if (profileItem) {
            const currentActive = commentProfileList.querySelector('.profile-item.active'); //
            if (currentActive) {
                currentActive.classList.remove('active');
                console.log('[modals.js] Önceki aktif yorum profili pasif yapıldı.'); //
            }
            profileItem.classList.add('active');
            profileItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            console.log(`[modals.js] Yorum profili "${currentCommentTemplate.title}" aktif yapıldı ve ekrana kaydırıldı.`); //
        }

        // Eğer öğrenci seçili ise, "Yorumu Güncelle" olarak değiştir
        if (selectedStudent && studentAssignments[selectedStudent.fullName]) {
            assignCommentBtn.textContent = 'Yorumu Güncelle'; //
            console.log('[modals.js] Atama butonu metni "Yorumu Güncelle" olarak değişti.'); //
        } else {
            assignCommentBtn.textContent = 'Yorumu Ata'; //
            console.log('[modals.js] Atama butonu metni "Yorumu Ata" olarak değişti.'); //
        }

        toggleModal(commentPreviewModal, false); // Modalı kapat
    } else {
        console.warn('[modals.js] handleModalSelectComment: currentCommentTemplate boş.'); //
        showToast('Seçilecek bir yorum şablonu bulunamadı.', 'info'); //
    }
}


// Yorum Önizleme Modalında Sonraki/Önceki Yorum Navigasyonu
function navigateCommentModal(direction) {
    console.log(`[modals.js] navigateCommentModal çağrıldı. Yön: ${direction === 1 ? 'Sonraki' : 'Önceki'}`); //
    const selectedClass = headerClassSelect.value; //
    const selectedTerm = headerTermSelect.value; //

    // commentsData'ya window üzerinden erişim sağlanır (global olarak yüklenir)
    if (!selectedClass || !selectedTerm || !window.commentsData[selectedClass] || !window.commentsData[selectedClass][selectedTerm]) {
        showToast('Yorumlar arasında gezinmek için lütfen sınıf ve dönem seçin.', 'info'); //
        console.warn('[modals.js] Yorum navigasyonu için sınıf veya dönem seçili değil.'); //
        return;
    }

    const templates = window.commentsData[selectedClass][selectedTerm]; //
    if (templates.length === 0) {
        showToast('Bu sınıf ve dönem için yorum bulunamadı.', 'info'); //
        console.warn('[modals.js] Seçili sınıf ve dönem için yorum şablonu bulunamadı.'); //
        return;
    }

    let currentIndex = -1;
    if (currentCommentTemplate) {
        currentIndex = templates.findIndex(t => t.id === currentCommentTemplate.id);
    }
    // Eğer currentCommentTemplate yoksa veya listede bulunamazsa, aktif profile item'ı kontrol et
    if (currentIndex === -1) {
        const activeProfileItem = commentProfileList.querySelector('.profile-item.active'); //
        if (activeProfileItem) {
            currentIndex = templates.findIndex(t => t.id === activeProfileItem.dataset.id);
        }
    }
    // Hala bulunamadıysa, başlangıç noktası belirle
    if (currentIndex === -1) {
        currentIndex = (direction === 1) ? 0 : templates.length - 1;
        console.log(`[modals.js] Mevcut şablon bulunamadı, başlangıç indeksi: ${currentIndex}`); //
    }

    let nextIndex = currentIndex + direction;

    if (nextIndex < 0) {
        nextIndex = templates.length - 1; // Başa döner
        console.log('[modals.js] Liste başına dönüldü.'); //
    } else if (nextIndex >= templates.length) {
        nextIndex = 0; // Sona döner
        console.log('[modals.js] Liste sonuna dönüldü.'); //
    }

    const nextTemplate = templates[nextIndex];
    if (nextTemplate) {
        modalCommentTitle.textContent = nextTemplate.title; //
        if (selectedStudent) {
            modalCommentText.textContent = nextTemplate.comment.replace(/\[Öğrenci Adı\]/g, selectedStudent.firstName); //
        } else {
            modalCommentText.textContent = nextTemplate.comment; //
        }
        setCurrentCommentTemplate(nextTemplate); // currentCommentTemplate'i güncelle
        console.log(`[modals.js] Yeni şablon yüklendi: ${nextTemplate.title}`); //

        // İlgili profile item'ı aktif yap ve scroll et
        const profileItem = commentProfileList.querySelector(`.profile-item[data-id="${nextTemplate.id}"]`); //
        if (profileItem) {
            const currentActive = commentProfileList.querySelector('.profile-item.active'); //
            if (currentActive) {
                currentActive.classList.remove('active');
            }
            profileItem.classList.add('active');
            profileItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            console.log('[modals.js] Yeni şablon profili aktif yapıldı.'); //
        }
    } else {
        console.warn('[modals.js] Sonraki/önceki şablon bulunamadı.'); //
    }
}


// Atanan tüm yorumları görüntüleme modalını açma
export function viewAllAssignments() {
    console.log('[modals.js] viewAllAssignments çağrıldı: Atanan tüm yorumlar modalı açılıyor.'); //
    allAssignedCommentsList.innerHTML = ''; // Listeyi temizle

    const sortedStudentsWithComments = students.filter(student => studentAssignments[student.fullName] && studentAssignments[student.fullName].trim() !== '')
                                               .sort((a, b) => a.class.localeCompare(b.class) || a.subClass.localeCompare(b.subClass) || a.num - b.num);

    if (sortedStudentsWithComments.length === 0) {
        allAssignedCommentsList.innerHTML = '<p class="empty-list-message">Henüz hiçbir öğrenciye yorum atanmadı.</p>'; //
        console.log('[modals.js] Hiç yorum atanmamış öğrenci bulunamadı.'); //
    } else {
        sortedStudentsWithComments.forEach(student => {
            const assignedComment = studentAssignments[student.fullName];
            const studentEntry = document.createElement('div');
            studentEntry.classList.add('student-entry-modal');
            studentEntry.innerHTML = `
                <div class="student-entry-header">
                    <h2>${student.fullName} (${student.class}${student.subClass}. Sınıf - No: ${student.num})</h2>
                    <button class="copy-modal-comment-btn button secondary-button" data-comment="${assignedComment}">Kopyala</button>
                </div>
                <p>${assignedComment}</p>
            `;
            allAssignedCommentsList.appendChild(studentEntry); //
        });

        // Kopyala butonları için event dinleyicileri ekle
        allAssignedCommentsList.querySelectorAll('.copy-modal-comment-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const commentToCopy = event.target.dataset.comment;
                if (commentToCopy) {
                    navigator.clipboard.writeText(commentToCopy).then(() => {
                        showToast('Yorum panoya kopyalandı!', 'success'); //
                        console.log('[modals.js] Atanan yorum kopyalandı.'); //
                    }).catch(err => {
                        console.error('[modals.js] Atanan yorum kopyalanamadı:', err); //
                        showToast('Yorum kopyalanırken bir hata oluştu.', 'error'); //
                    });
                } else {
                    console.warn('[modals.js] Kopyalanacak atanan yorum boş.'); //
                }
            });
        });
        console.log(`[modals.js] Atanan yorumlar listesi oluşturuldu: ${sortedStudentsWithComments.length} öğrenci.`); //
    }
    toggleModal(allAssignmentsModal, true); // Modalı aç
}

// Öğrenci Yönetimi modalı içindeki sekme yönetimi
function switchModalTab(tabId) {
    console.log(`[modals.js] switchModalTab çağrıldı: Sekme değiştiriliyor -> ${tabId}`); //
    modalTabContents.forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none'; // Gözden kaldırmak için
    });
    modalTabButtons.forEach(button => {
        button.classList.remove('active');
    });

    const targetContent = document.getElementById(tabId);
    if (targetContent) {
        targetContent.classList.add('active');
        targetContent.style.display = 'flex'; // Flex olarak geri göster
        document.querySelector(`.modal-tab-button[data-modal-tab="${tabId}"]`).classList.add('active');
        console.log(`[modals.js] Sekme "${tabId}" aktif yapıldı.`); //
    } else {
        console.error(`[modals.js] Hata: "${tabId}" ID'sine sahip sekme içeriği bulunamadı.`); //
    }
}


// Modal event listener'larını başlatma fonksiyonu
export function initializeModalListeners() {
    console.log('[modals.js] initializeModalListeners çağrıldı: Modal dinleyicileri başlatılıyor.'); //

    // Yorum Önizleme Modalı Butonları
    modalCopyBtn.addEventListener('click', handleModalCopyComment); //
    modalSelectBtn.addEventListener('click', handleModalSelectComment); //
    modalPrevCommentBtn.addEventListener('click', () => navigateCommentModal(-1)); //
    modalNextCommentBtn.addEventListener('click', () => navigateCommentModal(1)); //

    // DÜZELTME: Kapatma butonları artık bir liste (NodeList) olduğu için her birine döngü ile dinleyici ekleniyor.
    // Bu, konsoldaki tekrarlayan çağrı hatasını çözer ve tüm kapatma butonlarının ('X', 'Kapat' vb.) çalışmasını garantiler.
    if (commentPreviewModalCloseButton) {
        commentPreviewModalCloseButton.forEach(btn => btn.addEventListener('click', () => toggleModal(commentPreviewModal, false))); //
    }
    if (helpModalCloseButton) {
        helpModalCloseButton.forEach(btn => btn.addEventListener('click', () => {
            toggleModal(helpModal, false); //
            localStorage.setItem('doNotShowHelpModalAgain', 'true'); // Anladım'a basınca bir daha gösterme
            console.log('[modals.js] Yardım modalı kapatıldı ve bir daha göstermemek için ayar kaydedildi.'); //
        }));
    }
    if (allAssignmentsModalCloseButton) {
        allAssignmentsModalCloseButton.forEach(btn => btn.addEventListener('click', () => toggleModal(allAssignmentsModal, false))); //
    }

    // Öğrenci Yönetimi Modalı kapatma butonları (Bu zaten doğru şekilde yapılmıştı)
    studentManagementModalCloseButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const modalId = event.target.closest('.modal').id; // data-modal yerine daha güvenilir bir yol
            const modalElement = document.getElementById(modalId);
            if (modalElement) {
                toggleModal(modalElement, false); //
                console.log(`[modals.js] Öğrenci Yönetimi Modalı kapatıldı: ${modalId}`); //
            }
        });
    });

    // Öğrenci Yönetimi modalı içindeki sekme butonları
    modalTabButtons.forEach(button => {
        button.addEventListener('click', () => switchModalTab(button.dataset.modalTab));
    });

    // DÜZELTME: Modal dışına (arka plana) tıklandığında kapatma mantığı daha güvenilir hale getirildi.
    window.addEventListener('click', (event) => {
        // Sadece tıklanan elemanın kendisi bir modal ise (yani karartılmış arkaplan ise) kapat.
        if (event.target.classList.contains('modal')) {
             toggleModal(event.target, false); //
        }
    });

    // Kullanım kılavuzu modalının başlangıçta açılma kontrolü:
    const doNotShowHelpAgain = localStorage.getItem('doNotShowHelpModalAgain');
    if (doNotShowHelpAgain === 'true') {
        if (helpModal) helpModal.style.display = 'none'; // Eğer daha önce 'Anladım' dendi ise gizli kalır
        console.log('[modals.js] Yardım modalı başlangıçta gizlendi (doNotShowHelpModalAgain ayarı aktif).'); //
    } else {
        // Otomatik açılmaması için bu kısım boş bırakıldı.
        // openHelpModalBtn'e tıklanarak açılacak.
        console.log('[modals.js] Yardım modalı başlangıçta otomatik açılmayacak, butona basılması bekleniyor.'); //
    }
}

console.log('[modals.js] Modal yönetimi modülü başarıyla yüklendi.'); //