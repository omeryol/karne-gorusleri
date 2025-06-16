// js/comments-tab.js

import { showToast } from './utils.js';
import { students, studentAssignments, selectedStudent, setSelectedStudent, currentCommentTemplate, setCurrentCommentTemplate, saveData } from './data-management.js';
import { updateDashboardCards } from './dashboard.js';
import { openCommentPreviewModal, viewAllAssignments } from './modals.js';
import {
    studentListClassFilter, studentListSubClassFilter, studentSearchInput, studentListContainer, // Öğrenci listesi panelindeki yeni ID'ler
    filterUnassignedBtn, selectedStudentNameDisplay, commentTextarea, assignCommentBtn, // Yorum düzenleyici elementleri
    headerClassSelect, headerTermSelect, commentProfileList, profileSearchInput, // Header'daki ve yorum şablonu bölümündeki yeni ID'ler
    copyCommentBtn, clearCommentEditorBtn, autoClearCommentCheckbox, remainingCharsSpan,
    prevStudentBtn, nextStudentBtn, // Yeni eklenen önceki/sonraki öğrenci butonları
    addNewStudentBtn, manageStudentsBtn, // Yeni öğrenci ekleme/yönetme butonları
    viewAllAssignmentsBtn // Yorum düzenleyici altındaki tüm atamaları görüntüle butonu
} from './ui-elements.js';

/*
    Hata Ayıklama Notu:
    Bu modül, uygulamanın ana işlevi olan yorum atama akışını yönetir.
    Bu dosyadaki her fonksiyonun ve olay dinleyicisinin, yeni HTML yapısındaki
    doğru elementlerle etkileşime girdiğinden ve beklenen davranışları sergilediğinden emin olun.
    Tarayıcının Konsol sekmesini açarak `[comments-tab.js]` ön ekli logları dikkatlice takip edin.
    Özellikle şunları kontrol edin:
    - Öğrenci listesinin doğru filtrelenmesi ve aranması.
    - Öğrenci seçildiğinde yorum alanının ve seçili öğrenci bilgisinin güncellenmesi.
    - Yorum şablonlarının sınıf ve döneme göre doğru yüklenmesi ve aranması.
    - Bir yorum şablonu seçildiğinde önizleme modalının açılması ve yorumun aktarılması.
    - Yorumun atanması, kopyalanması ve temizlenmesi.
    - "Yorum Bekleyenler" filtresinin doğru çalışması.
    - "Yeni Öğrenci Ekle" ve "Öğrenci Yönetimi" butonlarının modalı doğru açması.
*/
console.log('[comments-tab.js] Yorum Atama sekmesi modülü yükleniyor...');

// commentsData global olarak index.html'den yüklendiği için window objesi üzerinden erişiyoruz.

// Yorum atama sekmesindeki öğrenci listesini yükleme/filtreleme
export function loadStudentListForAssignment(filterUnassigned = false) {
    console.log(`[comments-tab.js] loadStudentListForAssignment çağrıldı. Yorum Bekleyenler filtresi: ${filterUnassigned}`);
    const filterClass = studentListClassFilter.value; // Yeni ID
    const filterSubClass = studentListSubClassFilter.value; // Yeni ID
    const searchTerm = studentSearchInput.value.toLowerCase(); // Mevcut

    studentListContainer.innerHTML = ''; // Yeni ID

    const filteredStudents = students.filter(student => {
        const matchesClass = filterClass === 'all' || student.class === filterClass;
        const matchesSubClass = filterSubClass === 'all' || student.subClass === filterSubClass;
        const matchesSearch = student.fullName.toLowerCase().includes(searchTerm) ||
                              student.firstName.toLowerCase().includes(searchTerm);
        const isAssigned = studentAssignments[student.fullName] && studentAssignments[student.fullName].trim() !== '';

        // Hata Ayıklama Logu: Filtreleme koşulları
        // console.log(`  Öğrenci: ${student.fullName}, Sınıf: ${matchesClass}, Şube: ${matchesSubClass}, Arama: ${matchesSearch}, Atanmış: ${isAssigned}`);

        if (filterUnassigned) {
            return matchesClass && matchesSubClass && matchesSearch && !isAssigned;
        }
        return matchesClass && matchesSubClass && matchesSearch;
    }).sort((a, b) => {
        if (a.class === b.class) {
            if (a.subClass === b.subClass) {
                return a.num - b.num;
            }
            return a.subClass.localeCompare(b.subClass);
        }
        return a.class.localeCompare(b.class);
    });

    console.log(`[comments-tab.js] Filtrelenen öğrenci sayısı: ${filteredStudents.length}`);

    if (filteredStudents.length === 0) {
        studentListContainer.innerHTML = '<p class="empty-list-message">Filtreye uygun öğrenci bulunamadı.</p>';
        selectedStudentNameDisplay.textContent = 'Yok';
        setSelectedStudent(null);
        commentTextarea.value = '';
        updateCharCount();
        assignCommentBtn.textContent = 'Yorumu Ata / Güncelle';
        console.log('[comments-tab.js] Filtreye uygun öğrenci bulunamadı, arayüz sıfırlandı.');
        return;
    }

    filteredStudents.forEach(student => {
        const studentItem = document.createElement('div');
        studentItem.classList.add('student-item');
        studentItem.dataset.id = student.id;

        const assignedComment = studentAssignments[student.fullName] || '';
        const previewText = assignedComment ? assignedComment.substring(0, 50) + (assignedComment.length > 50 ? '...' : '') : 'Yorum atanmadı';
        const buttonText = assignedComment ? 'Güncelle' : 'Ata';
        const statusClass = assignedComment ? 'status-assigned' : 'status-pending'; // Yeni durum sınıfları

        studentItem.innerHTML = `
            <div class="student-info">
                <span class="student-number">${student.num}</span>
                <span class="student-full-name">${student.fullName} (${student.class}${student.subClass})</span>
                <span class="student-status-indicator ${statusClass}"></span>
            </div>
            <span class="student-comment-preview">${previewText}</span>
            <button class="assign-btn button secondary-button" data-student-id="${student.id}">${buttonText}</button>
        `;

        studentListContainer.appendChild(studentItem);
    });

    // Sayfa yüklendiğinde veya filtre değiştiğinde seçili öğrenciyi vurgula
    if (selectedStudent) {
        const activeItem = studentListContainer.querySelector(`.student-item[data-id="${selectedStudent.id}"]`);
        if (activeItem) {
            selectStudentForAssignmentItem(activeItem); // Tekrar seçme fonksiyonunu çağır
            console.log(`[comments-tab.js] Sayfa yüklendiğinde/filtre değiştiğinde seçili öğrenci vurgulandı: ${selectedStudent.fullName}`);
        } else {
            // Eğer seçili öğrenci filtrelenmiş listede yoksa, seçimi kaldır
            selectedStudentNameDisplay.textContent = 'Yok';
            setSelectedStudent(null);
            commentTextarea.value = '';
            updateCharCount();
            assignCommentBtn.textContent = 'Yorumu Ata / Güncelle';
            console.log('[comments-tab.js] Seçili öğrenci filtrelenmiş listede bulunamadı, seçim kaldırıldı.');
        }
    } else {
        selectedStudentNameDisplay.textContent = 'Yok';
        commentTextarea.value = '';
        updateCharCount();
        assignCommentBtn.textContent = 'Yorumu Ata / Güncelle';
        console.log('[comments-tab.js] Hiçbir öğrenci seçili değil.');
    }
}

// Yorum profillerini yükleme/filtreleme
export function loadCommentTemplates() {
    console.log('[comments-tab.js] loadCommentTemplates çağrıldı: Yorum şablonları yükleniyor.');
    const selectedClass = headerClassSelect.value; // Yeni ID
    const selectedTerm = headerTermSelect.value; // Yeni ID
    const searchTerm = profileSearchInput.value.toLowerCase(); // Mevcut

    commentProfileList.innerHTML = ''; // Yeni ID

    if (typeof window.commentsData !== 'undefined' && window.commentsData[selectedClass] && window.commentsData[selectedClass][selectedTerm]) {
        const templates = window.commentsData[selectedClass][selectedTerm];
        const filteredTemplates = templates.filter(template => {
            return template.title.toLowerCase().includes(searchTerm) ||
                   template.comment.toLowerCase().includes(searchTerm);
        });

        console.log(`[comments-tab.js] Sınıf: ${selectedClass}, Dönem: ${selectedTerm}, Filtrelenen şablon sayısı: ${filteredTemplates.length}`);

        if (filteredTemplates.length === 0 && searchTerm.length > 0) {
            commentProfileList.innerHTML = '<p class="empty-list-message">Aradığınız kriterlere uygun yorum bulunamadı.</p>';
        } else if (filteredTemplates.length === 0) {
            commentProfileList.innerHTML = '<p class="empty-list-message">Bu sınıf ve dönem için yorum bulunamadı.</p>';
        } else {
            filteredTemplates.forEach(template => {
                const profileItem = document.createElement('div');
                profileItem.classList.add('profile-item');
                profileItem.dataset.id = template.id;
                profileItem.textContent = template.title;
                profileItem.addEventListener('click', () => {
                    openCommentPreviewModal(template);
                    console.log(`[comments-tab.js] Yorum şablonu tıklandı: ${template.title}`);
                });
                commentProfileList.appendChild(profileItem);
            });
        }
    } else {
        commentProfileList.innerHTML = '<p class="empty-list-message">Lütfen yukarıdan sınıf ve dönem seçin.</p>';
        console.warn('[comments-tab.js] Yorum şablonları yüklenemedi: Sınıf veya dönem seçili değil ya da commentsData eksik.');
    }
}

// Yorum düzenleme alanındaki karakter sayısını güncelleme
export function updateCharCount() {
    // Hata Ayıklama Logu: Karakter sayımı güncelleniyor
    // console.log('[comments-tab.js] updateCharCount çağrıldı.');
    const currentLength = commentTextarea.value.length;
    const remaining = 500 - currentLength; // maxlength değeri
    remainingCharsSpan.textContent = remaining;
    if (remaining < 0) {
        remainingCharsSpan.style.color = 'var(--accent-color-error)'; // Kırmızı renk değişkeni
    } else {
        remainingCharsSpan.style.color = 'var(--text-color-light)'; // Normal renk değişkeni
    }
}

// Yorumu panoya kopyalama
function copyCommentToClipboard() {
    console.log('[comments-tab.js] copyCommentToClipboard çağrıldı.');
    const commentToCopy = commentTextarea.value.trim();
    if (commentToCopy.length === 0) {
        showToast('Kopyalanacak yorum metni boş.', 'info');
        console.warn('[comments-tab.js] Kopyalanacak yorum metni boş.');
        return;
    }
    navigator.clipboard.writeText(commentToCopy).then(() => {
        showToast('Yorum panoya kopyalandı!', 'success');
        console.log('[comments-tab.js] Yorum panoya başarıyla kopyalandı.');
    }).catch(err => {
        console.error('[comments-tab.js] Yorum kopyalanamadı:', err);
        showToast('Yorum kopyalanırken bir hata oluştu.', 'error');
    });
}

// Yorum düzenleme alanını temizler
function clearCommentEditor() {
    console.log('[comments-tab.js] clearCommentEditor çağrıldı.');
    commentTextarea.value = '';
    updateCharCount();
    const currentActive = commentProfileList.querySelector('.profile-item.active'); // Yeni ID
    if (currentActive) {
        currentActive.classList.remove('active');
        console.log('[comments-tab.js] Aktif yorum profili pasif yapıldı.');
    }
    setCurrentCommentTemplate(null); // Temizlendiğinde şablonu sıfırla
    showToast('Yorum alanı temizlendi.', 'info');
}

// Öğrenciye yorum atama işlemini gerçekleştirir
function assignCommentToStudent() {
    console.log('[comments-tab.js] assignCommentToStudent çağrıldı.');
    if (!selectedStudent) {
        showToast('Lütfen önce sol listeden bir öğrenci seçin.', 'error');
        console.warn('[comments-tab.js] Yorum atamak için öğrenci seçili değil.');
        return;
    }

    let comment = commentTextarea.value.trim();

    if (comment.length === 0) {
        showToast('Lütfen önce bir yorum seçin veya yazın.', 'error');
        console.warn('[comments-tab.js] Yorum metni boş.');
        return;
    }

    comment = comment.replace(/\[Öğrenci Adı\]/g, selectedStudent.firstName);

    studentAssignments[selectedStudent.fullName] = comment;
    showToast(`${selectedStudent.fullName} öğrencisine yorum atandı/güncellendi.`, 'success');
    saveData();
    // Filtre durumunu koruyarak öğrenci listesini yeniden yükle
    loadStudentListForAssignment(filterUnassignedBtn.classList.contains('active-filter'));
    updateDashboardCards();
    console.log(`[comments-tab.js] Yorum atandı/güncellendi: ${selectedStudent.fullName}`);

    if (autoClearCommentCheckbox.checked) {
        clearCommentEditor();
        setSelectedStudent(null);
        selectedStudentNameDisplay.textContent = 'Yok';
        assignCommentBtn.textContent = 'Yorumu Ata / Güncelle'; // Buton metnini sıfırla
        console.log('[comments-tab.js] Otomatik temizleme aktif, yorum alanı ve öğrenci seçimi sıfırlandı.');
    }
}

// Öğrenci listesinde bir öğrenciye tıklandığında veya Ata butonuna basıldığında
function handleStudentClickInAssignmentList(event) {
    console.log('[comments-tab.js] handleStudentClickInAssignmentList çağrıldı.');
    const studentItem = event.target.closest('.student-item');
    if (!studentItem) return;

    // Eğer "Ata" veya "Güncelle" butonuna tıklandıysa
    if (event.target.classList.contains('assign-btn')) {
        const studentIdToAssign = event.target.dataset.studentId;
        const student = students.find(s => s.id === studentIdToAssign);
        if (student) {
            selectStudentForAssignmentItem(studentItem);
            console.log(`[comments-tab.js] Öğrenci listeden seçildi (Buton): ${student.fullName}`);
        }
    } else { // Öğrenci item'ının kendisine tıklandıysa
        selectStudentForAssignmentItem(studentItem);
        console.log(`[comments-tab.js] Öğrenci listeden seçildi (Item): ${studentItem.querySelector('.student-full-name').textContent}`);
    }
}

// Öğrenciyi seçme fonksiyonu (studentItemElement parametresi alıyor)
export function selectStudentForAssignmentItem(studentItemElement) {
    console.log('[comments-tab.js] selectStudentForAssignmentItem çağrıldı.');
    const previouslySelected = studentListContainer.querySelector('.student-item.active-student'); // Yeni ID
    if (previouslySelected) {
        previouslySelected.classList.remove('active-student');
        console.log('[comments-tab.js] Önceki seçili öğrenci pasif yapıldı.');
    }

    studentItemElement.classList.add('active-student');
    const studentId = studentItemElement.dataset.id;
    const student = students.find(s => s.id === studentId);
    setSelectedStudent(student);

    if (selectedStudent) {
        selectedStudentNameDisplay.textContent = `${selectedStudent.fullName} (${selectedStudent.class}${selectedStudent.subClass}. Sınıf - No: ${selectedStudent.num})`;
        const assignedCommentForSelected = studentAssignments[selectedStudent.fullName];
        if (assignedCommentForSelected) {
            commentTextarea.value = assignedCommentForSelected.replace(/\[Öğrenci Adı\]/g, selectedStudent.firstName);
            assignCommentBtn.textContent = 'Yorumu Güncelle';
            console.log(`[comments-tab.js] Seçili öğrencinin yorumu yüklendi: ${selectedStudent.fullName}`);
        } else {
            commentTextarea.value = '';
            assignCommentBtn.textContent = 'Yorumu Ata';
            console.log(`[comments-tab.js] Seçili öğrencinin atanmış yorumu yok, yorum alanı boşaltıldı.`);
        }
        updateCharCount();
    } else {
        selectedStudentNameDisplay.textContent = 'Yok';
        commentTextarea.value = '';
        updateCharCount();
        assignCommentBtn.textContent = 'Yorumu Ata / Güncelle';
        console.log('[comments-tab.js] selectedStudent null, UI sıfırlandı.');
    }
}

// Hızlı öğrenci navigasyonu (Editor panelindeki önceki/sonraki butonları)
export function navigateStudent(direction) {
    console.log(`[comments-tab.js] navigateStudent çağrıldı. Yön: ${direction === 1 ? 'Sonraki' : 'Önceki'}`);
    const currentStudentItems = Array.from(studentListContainer.querySelectorAll('.student-item')); // Yeni ID
    if (currentStudentItems.length === 0) {
        showToast('Listede öğrenci bulunamadı.', 'info');
        console.warn('[comments-tab.js] Hızlı gezinme için öğrenci listesi boş.');
        return;
    }

    let currentIndex = -1;
    if (selectedStudent) {
        currentIndex = currentStudentItems.findIndex(item => item.dataset.id === selectedStudent.id);
        if (currentIndex === -1) { // Seçili öğrenci mevcut listede yoksa
            console.warn('[comments-tab.js] Seçili öğrenci mevcut filtrelenmiş listede bulunamadı, ilk veya son öğrenciye gidilecek.');
        }
    }

    let nextIndex = currentIndex + direction;

    if (nextIndex < 0) {
        nextIndex = currentStudentItems.length - 1; // Başa döner
        console.log('[comments-tab.js] Öğrenci listesi başına dönüldü.');
    } else if (nextIndex >= currentStudentItems.length) {
        nextIndex = 0; // Sona döner
        console.log('[comments-tab.js] Öğrenci listesi sonuna dönüldü.');
    }

    selectStudentForAssignmentItem(currentStudentItems[nextIndex]);
    currentStudentItems[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    console.log(`[comments-tab.js] Öğrenci navigasyonu tamamlandı, yeni öğrenci: ${currentStudentItems[nextIndex].querySelector('.student-full-name').textContent}`);
}


// Event dinleyicilerini başlatma fonksiyonu
export function initializeCommentsTabListeners() {
    console.log('[comments-tab.js] initializeCommentsTabListeners çağrıldı: Yorum atama dinleyicileri başlatılıyor.');

    // Öğrenci listesi filtreleri ve arama
    studentListClassFilter.addEventListener('change', () => {
        loadStudentListForAssignment(filterUnassignedBtn.classList.contains('active-filter'));
        console.log('[comments-tab.js] Sınıf filtresi değişti.');
    });
    studentListSubClassFilter.addEventListener('change', () => {
        loadStudentListForAssignment(filterUnassignedBtn.classList.contains('active-filter'));
        console.log('[comments-tab.js] Şube filtresi değişti.');
    });
    studentSearchInput.addEventListener('input', () => {
        loadStudentListForAssignment(filterUnassignedBtn.classList.contains('active-filter'));
        console.log('[comments-tab.js] Öğrenci arama inputu değişti.');
    });
    studentListContainer.addEventListener('click', handleStudentClickInAssignmentList);

    // Yorum Bekleyenler filtresi
    filterUnassignedBtn.addEventListener('click', () => {
        filterUnassignedBtn.classList.toggle('active-filter');
        if (filterUnassignedBtn.classList.contains('active-filter')) {
            loadStudentListForAssignment(true);
            showToast('Yorum bekleyen öğrenciler filtrelendi.', 'info');
            console.log('[comments-tab.js] Yorum bekleyenler filtresi aktif edildi.');
        } else {
            loadStudentListForAssignment(false);
            showToast('Tüm öğrenciler gösteriliyor.', 'info');
            console.log('[comments-tab.js] Yorum bekleyenler filtresi pasif edildi.');
        }
    });

    // Öğrenci navigasyon butonları (Öğrenci Listesi Panelinde)
    if (prevStudentBtn) prevStudentBtn.addEventListener('click', () => navigateStudent(-1));
    if (nextStudentBtn) nextStudentBtn.addEventListener('click', () => navigateStudent(1));

    // Yorum düzenleyici alanındaki butonlar
    assignCommentBtn.addEventListener('click', assignCommentToStudent);
    copyCommentBtn.addEventListener('click', copyCommentToClipboard);
    clearCommentEditorBtn.addEventListener('click', clearCommentEditor);
    autoClearCommentCheckbox.addEventListener('change', saveData);
    if (viewAllAssignmentsBtn) viewAllAssignmentsBtn.addEventListener('click', viewAllAssignments);

    // Yorum şablonları filtreleri ve arama
    headerClassSelect.addEventListener('change', () => { // Yeni ID
        loadCommentTemplates();
        saveData();
        profileSearchInput.value = '';
        console.log('[comments-tab.js] Header Sınıf seçimi değişti.');
    });
    headerTermSelect.addEventListener('change', () => { // Yeni ID
        loadCommentTemplates();
        saveData();
        profileSearchInput.value = '';
        console.log('[comments-tab.js] Header Dönem seçimi değişti.');
    });
    profileSearchInput.addEventListener('input', loadCommentTemplates);
    commentTextarea.addEventListener('input', updateCharCount);

    // Yeni öğrenci ekle ve öğrenci yönetimi butonları için listener'lar
    if (addNewStudentBtn) addNewStudentBtn.addEventListener('click', () => {
        // Modalı aç ve 'Öğrenci Ekle' sekmesini aktif et
        const studentManagementModal = document.getElementById('student-management-modal');
        if (studentManagementModal) {
            import('./modals.js').then(({ toggleModal, switchModalTab }) => {
                toggleModal(studentManagementModal, true);
                switchModalTab('add-student-section'); // Öğrenci Ekle sekmesini aktif et
                console.log('[comments-tab.js] "Yeni Öğrenci Ekle" butonu tıklandı, öğrenci yönetimi modalı açıldı.');
            }).catch(error => console.error('Modals modülü yüklenemedi:', error));
        }
    });

    if (manageStudentsBtn) manageStudentsBtn.addEventListener('click', () => {
        // Modalı aç ve 'Öğrencileri Görüntüle / Sil' sekmesini aktif et
        const studentManagementModal = document.getElementById('student-management-modal');
        if (studentManagementModal) {
            import('./modals.js').then(({ toggleModal, switchModalTab }) => {
                toggleModal(studentManagementModal, true);
                switchModalTab('view-students-section'); // Öğrencileri Görüntüle / Sil sekmesini aktif et
                console.log('[comments-tab.js] "Öğrenci Yönetimine Git" butonu tıklandı, öğrenci yönetimi modalı açıldı.');
            }).catch(error => console.error('Modals modülü yüklenemedi:', error));
        }
    });
}

console.log('[comments-tab.js] Yorum Atama sekmesi modülü başarıyla yüklendi.');