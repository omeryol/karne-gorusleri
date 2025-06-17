// js/comments-tab.js

import { showToast } from './utils.js';
import { students, studentAssignments, selectedStudent, setSelectedStudent, currentCommentTemplate, setCurrentCommentTemplate, saveData } from './data-management.js';
import { updateDashboardCards } from './dashboard.js';
import { openCommentPreviewModal, viewAllAssignments, switchModalTab } from './modals.js';
import {
    studentListClassFilter, studentListSubClassFilter, studentSearchInput, studentListContainer,
    filterUnassignedBtn, selectedStudentNameDisplay, commentTextarea, assignCommentBtn,
    headerClassSelect, headerTermSelect, commentProfileList, profileSearchInput,
    copyCommentBtn, clearCommentEditorBtn, autoClearCommentCheckbox, remainingCharsSpan,
    prevStudentBtn, nextStudentBtn,
    addNewStudentBtn, manageStudentsBtn,
    viewAllAssignmentsBtn,
    studentManagementModal // Modal açma butonları için eklendi
} from './ui-elements.js';

console.log('[comments-tab.js] Yorum Atama sekmesi modülü yükleniyor...');


// Yorum atama sekmesindeki öğrenci listesini yükleme/filtreleme
export function loadStudentListForAssignment(filterUnassigned = false) {
    console.log(`[comments-tab.js] loadStudentListForAssignment çağrıldı. Yorum Bekleyenler filtresi: ${filterUnassigned}`);
    const filterClass = studentListClassFilter.value;
    const filterSubClass = studentListSubClassFilter.value;
    const searchTerm = studentSearchInput.value.toLowerCase();

    studentListContainer.innerHTML = '';

    const filteredStudents = students.filter(student => {
        const matchesClass = filterClass === 'all' || student.class === filterClass;
        const matchesSubClass = filterSubClass === 'all' || student.subClass === filterSubClass;
        const matchesSearch = student.fullName.toLowerCase().includes(searchTerm) ||
                              student.firstName.toLowerCase().includes(searchTerm);
        const isAssigned = studentAssignments[student.fullName] && studentAssignments[student.fullName].trim() !== '';

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
        const statusClass = assignedComment ? 'status-assigned' : 'status-pending';

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
            selectStudentForAssignmentItem(activeItem);
            console.log(`[comments-tab.js] Sayfa yüklendiğinde/filtre değiştiğinde seçili öğrenci vurgulandı: ${selectedStudent.fullName}`);
        } else {
            // Eğer seçili öğrenci filtrelenmiş listede yoksa, seçimi kaldır
            setSelectedStudent(null);
            updateCharCount(); // Karakter sayısını sıfırla
            assignCommentBtn.textContent = 'Yorumu Ata / Güncelle';
            console.log('[comments-tab.js] Seçili öğrenci filtrelenmiş listede bulunamadı, seçim kaldırıldı.');
        }
    }
}

// Yorum profillerini yükleme/filtreleme
export function loadCommentTemplates() {
    console.log('[comments-tab.js] loadCommentTemplates çağrıldı: Yorum şablonları yükleniyor.');
    const selectedClass = headerClassSelect.value;
    const selectedTerm = headerTermSelect.value;
    const searchTerm = profileSearchInput.value.toLowerCase();

    commentProfileList.innerHTML = '';

    // İYİLEŞTİRME: commentsData nesnesinin var olup olmadığını kontrol et.
    // Bu, comment_templates_data.js dosyasının yüklenememesi durumunda sistemin çökmesini engeller.
    if (typeof window.commentsData === 'undefined') {
        commentProfileList.innerHTML = '<p class="empty-list-message">Yorum şablonları yüklenemedi. Sayfayı yenileyin.</p>';
        showToast('Yorum şablon verisi bulunamadı!', 'error');
        console.error('[comments-tab.js] "commentsData" nesnesi bulunamadı. Lütfen comment_templates_data.js dosyasının yüklendiğinden emin olun.');
        return;
    }

    if (window.commentsData[selectedClass] && window.commentsData[selectedClass][selectedTerm]) {
        const templates = window.commentsData[selectedClass][selectedTerm];
        const filteredTemplates = templates.filter(template => {
            return template.title.toLowerCase().includes(searchTerm) ||
                   template.comment.toLowerCase().includes(searchTerm);
        });

        console.log(`[comments-tab.js] Sınıf: ${selectedClass}, Dönem: ${selectedTerm}, Filtrelenen şablon sayısı: ${filteredTemplates.length}`);

        if (filteredTemplates.length === 0) {
             commentProfileList.innerHTML = searchTerm.length > 0
                ? '<p class="empty-list-message">Aradığınız kriterlere uygun yorum bulunamadı.</p>'
                : '<p class="empty-list-message">Bu sınıf ve dönem için yorum bulunamadı.</p>';
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
        console.warn('[comments-tab.js] Yorum şablonları yüklenemedi: Sınıf veya dönem seçili değil.');
    }
}

// Yorum düzenleme alanındaki karakter sayısını güncelleme
export function updateCharCount() {
    if(!remainingCharsSpan || !commentTextarea) return; // Eleman yoksa dur
    const currentLength = commentTextarea.value.length;
    const remaining = 500 - currentLength;
    remainingCharsSpan.textContent = remaining;
    remainingCharsSpan.style.color = remaining < 0 ? 'var(--accent-color-error)' : 'var(--text-color-light)';
}

// Yorumu panoya kopyalama
function copyCommentToClipboard() {
    console.log('[comments-tab.js] copyCommentToClipboard çağrıldı.');
    const commentToCopy = commentTextarea.value.trim();
    if (commentToCopy.length === 0) {
        showToast('Kopyalanacak yorum metni boş.', 'info');
        return;
    }
    navigator.clipboard.writeText(commentToCopy).then(() => {
        showToast('Yorum panoya kopyalandı!', 'success');
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
    const currentActive = commentProfileList.querySelector('.profile-item.active');
    if (currentActive) {
        currentActive.classList.remove('active');
    }
    setCurrentCommentTemplate(null);
    showToast('Yorum alanı temizlendi.', 'info');
}

// Öğrenciye yorum atama işlemini gerçekleştirir
function assignCommentToStudent() {
    console.log('[comments-tab.js] assignCommentToStudent çağrıldı.');
    if (!selectedStudent) {
        showToast('Lütfen önce sol listeden bir öğrenci seçin.', 'error');
        return;
    }

    const comment = commentTextarea.value.trim();

    // İYİLEŞTİRME: Yorum metninin boş olup olmadığını kontrol et
    if (comment.length === 0) {
        showToast('Lütfen atanacak bir yorum seçin veya yazın.', 'error');
        return;
    }

    const finalComment = comment.replace(/\[Öğrenci Adı\]/g, selectedStudent.firstName);

    studentAssignments[selectedStudent.fullName] = finalComment;
    showToast(`${selectedStudent.fullName} öğrencisine yorum atandı/güncellendi.`, 'success');
    saveData();
    loadStudentListForAssignment(filterUnassignedBtn.classList.contains('active-filter'));
    updateDashboardCards();
    console.log(`[comments-tab.js] Yorum atandı/güncellendi: ${selectedStudent.fullName}`);

    if (autoClearCommentCheckbox.checked) {
        clearCommentEditor();
        const activeStudentItem = studentListContainer.querySelector('.student-item.active-student');
        if (activeStudentItem) activeStudentItem.classList.remove('active-student');
        setSelectedStudent(null);
        selectedStudentNameDisplay.textContent = 'Yok';
        assignCommentBtn.textContent = 'Yorumu Ata / Güncelle';
        console.log('[comments-tab.js] Otomatik temizleme aktif, yorum alanı ve öğrenci seçimi sıfırlandı.');
    }
}

// Öğrenci listesinde bir öğrenciye tıklandığında veya Ata butonuna basıldığında
function handleStudentClickInAssignmentList(event) {
    const studentItem = event.target.closest('.student-item');
    if (!studentItem) return;
    
    // Öğrenci item'ının kendisine veya içindeki bir butona tıklandığında seçimi yap
    selectStudentForAssignmentItem(studentItem);
    console.log(`[comments-tab.js] Öğrenci listeden seçildi: ${studentItem.querySelector('.student-full-name').textContent}`);
}

// Öğrenciyi seçme fonksiyonu (studentItemElement parametresi alıyor)
export function selectStudentForAssignmentItem(studentItemElement) {
    const previouslySelected = studentListContainer.querySelector('.student-item.active-student');
    if (previouslySelected) {
        previouslySelected.classList.remove('active-student');
    }

    studentItemElement.classList.add('active-student');
    const studentId = studentItemElement.dataset.id;
    const student = students.find(s => s.id === studentId);
    setSelectedStudent(student);

    if (selectedStudent) {
        selectedStudentNameDisplay.textContent = `${selectedStudent.fullName} (${selectedStudent.class}${selectedStudent.subClass}. Sınıf - No: ${selectedStudent.num})`;
        const assignedCommentForSelected = studentAssignments[selectedStudent.fullName];
        commentTextarea.value = assignedCommentForSelected ? assignedCommentForSelected.replace(/\[Öğrenci Adı\]/g, selectedStudent.firstName) : '';
        assignCommentBtn.textContent = assignedCommentForSelected ? 'Yorumu Güncelle' : 'Yorumu Ata';
        updateCharCount();
    }
}

// Hızlı öğrenci navigasyonu (Editor panelindeki önceki/sonraki butonları)
export function navigateStudent(direction) {
    console.log(`[comments-tab.js] navigateStudent çağrıldı. Yön: ${direction === 1 ? 'Sonraki' : 'Önceki'}`);
    const currentStudentItems = Array.from(studentListContainer.querySelectorAll('.student-item'));
    if (currentStudentItems.length === 0) {
        showToast('Listede öğrenci bulunamadı.', 'info');
        return;
    }

    const currentIndex = selectedStudent ? currentStudentItems.findIndex(item => item.dataset.id === selectedStudent.id) : -1;
    let nextIndex = currentIndex + direction;

    if (nextIndex < 0) nextIndex = currentStudentItems.length - 1;
    if (nextIndex >= currentStudentItems.length) nextIndex = 0;

    const nextStudentItem = currentStudentItems[nextIndex];
    if (nextStudentItem) {
        selectStudentForAssignmentItem(nextStudentItem);
        nextStudentItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Event dinleyicilerini başlatma fonksiyonu
export function initializeCommentsTabListeners() {
    console.log('[comments-tab.js] initializeCommentsTabListeners çağrıldı.');

    // Filtreler ve Arama
    studentListClassFilter.addEventListener('change', () => loadStudentListForAssignment(filterUnassignedBtn.classList.contains('active-filter')));
    studentListSubClassFilter.addEventListener('change', () => loadStudentListForAssignment(filterUnassignedBtn.classList.contains('active-filter')));
    studentSearchInput.addEventListener('input', () => loadStudentListForAssignment(filterUnassignedBtn.classList.contains('active-filter')));
    studentListContainer.addEventListener('click', handleStudentClickInAssignmentList);

    filterUnassignedBtn.addEventListener('click', () => {
        filterUnassignedBtn.classList.toggle('active-filter');
        loadStudentListForAssignment(filterUnassignedBtn.classList.contains('active-filter'));
        showToast(filterUnassignedBtn.classList.contains('active-filter') ? 'Yorum bekleyen öğrenciler filtrelendi.' : 'Tüm öğrenciler gösteriliyor.', 'info');
    });

    // Navigasyon Butonları
    prevStudentBtn.addEventListener('click', () => navigateStudent(-1));
    nextStudentBtn.addEventListener('click', () => navigateStudent(1));

    // Yorum Düzenleyici Butonları
    assignCommentBtn.addEventListener('click', assignCommentToStudent);
    copyCommentBtn.addEventListener('click', copyCommentToClipboard);
    clearCommentEditorBtn.addEventListener('click', clearCommentEditor);
    autoClearCommentCheckbox.addEventListener('change', saveData);
    viewAllAssignmentsBtn.addEventListener('click', viewAllAssignments);

    // Yorum Şablonları Filtreleri
    profileSearchInput.addEventListener('input', loadCommentTemplates);
    commentTextarea.addEventListener('input', updateCharCount);

    // Modal Açma Butonları
    addNewStudentBtn.addEventListener('click', () => {
        if (studentManagementModal) {
            switchModalTab('add-student-section');
            import('./utils.js').then(({ toggleModal }) => toggleModal(studentManagementModal, true));
        }
    });

    manageStudentsBtn.addEventListener('click', () => {
        if (studentManagementModal) {
            switchModalTab('view-students-section');
            import('./utils.js').then(({ toggleModal }) => toggleModal(studentManagementModal, true));
        }
    });
}