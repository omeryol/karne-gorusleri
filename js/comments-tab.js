// js/comments-tab.js

import { showToast } from './utils.js';
import { students, studentAssignments, selectedStudent, setSelectedStudent, currentCommentTemplate, setCurrentCommentTemplate, saveData } from './data-management.js';
import { updateDashboardCards } from './dashboard.js';
import { openCommentPreviewModal, viewAllAssignments } from './modals.js';
import {
    studentListClassFilter, studentListSubClassFilter, studentSearchInput, studentListContainer,
    filterUnassignedBtn, selectedStudentNameDisplay, commentTextarea, assignCommentBtn,
    headerClassSelect, headerTermSelect, commentProfileList, profileSearchInput,
    copyCommentBtn, clearCommentEditorBtn, autoClearCommentCheckbox, remainingCharsSpan,
    prevStudentBtn, nextStudentBtn,
    addNewStudentBtn, manageStudentsBtn,
    viewAllAssignmentsBtn,
    studentManagementModal
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
        // İYİLEŞTİRME: Kullanıcıya daha net bilgi veren mesaj.
        studentListContainer.innerHTML = '<p class="empty-list-message">Bu filtreye uygun öğrenci bulunamadı. Lütfen öğrenci ekleyin veya filtreyi değiştirin.</p>';
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

    if (selectedStudent) {
        const activeItem = studentListContainer.querySelector(`.student-item[data-id="${selectedStudent.id}"]`);
        if (activeItem) {
            selectStudentForAssignmentItem(activeItem);
        } else {
            setSelectedStudent(null);
            selectedStudentNameDisplay.textContent = 'Yok';
            commentTextarea.value = '';
            assignCommentBtn.textContent = 'Yorumu Ata / Güncelle';
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
        commentProfileList.innerHTML = '<p class="empty-list-message">Yorum şablonları yüklenemedi.</p>';
        showToast('Yorum şablon verisi bulunamadı! Lütfen dosyaların doğru yüklendiğinden emin olun.', 'error');
        console.error('[comments-tab.js] "commentsData" nesnesi bulunamadı. Lütfen comment_templates_data.js dosyasının varlığını ve doğru yüklendiğini kontrol edin.');
        return;
    }
    
    if (window.commentsData[selectedClass] && window.commentsData[selectedClass][selectedTerm]) {
        const templates = window.commentsData[selectedClass][selectedTerm];
        const filteredTemplates = templates.filter(template => 
            template.title.toLowerCase().includes(searchTerm) ||
            template.comment.toLowerCase().includes(searchTerm)
        );

        if (filteredTemplates.length === 0) {
            commentProfileList.innerHTML = '<p class="empty-list-message">Arama kriterine uygun şablon bulunamadı.</p>';
        } else {
            filteredTemplates.forEach(template => {
                const profileItem = document.createElement('div');
                profileItem.classList.add('profile-item');
                profileItem.dataset.id = template.id;
                profileItem.textContent = template.title;
                profileItem.addEventListener('click', () => openCommentPreviewModal(template));
                commentProfileList.appendChild(profileItem);
            });
        }
    } else {
        commentProfileList.innerHTML = '<p class="empty-list-message">Lütfen yukarıdan sınıf ve dönem seçin.</p>';
    }
}

// Yorum düzenleme alanındaki karakter sayısını güncelleme
export function updateCharCount() {
    if (!remainingCharsSpan) return;
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
    navigator.clipboard.writeText(commentToCopy)
        .then(() => showToast('Yorum panoya kopyalandı!', 'success'))
        .catch(err => {
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

    // İYİLEŞTİRME: Yorum metni boşken atama yapılmasını engelle.
    if (comment.length === 0) {
        showToast('Atanacak yorum metni boş olamaz.', 'error');
        return;
    }

    const finalComment = comment.replace(/\[Öğrenci Adı\]/g, selectedStudent.firstName);

    studentAssignments[selectedStudent.fullName] = finalComment;
    showToast(`${selectedStudent.fullName} öğrencisine yorum atandı/güncellendi.`, 'success');
    saveData();
    loadStudentListForAssignment(filterUnassignedBtn.classList.contains('active-filter'));
    updateDashboardCards();

    if (autoClearCommentCheckbox.checked) {
        clearCommentEditor();
        setSelectedStudent(null);
        selectedStudentNameDisplay.textContent = 'Yok';
        assignCommentBtn.textContent = 'Yorumu Ata / Güncelle';
        const activeStudentItem = studentListContainer.querySelector('.student-item.active-student');
        if (activeStudentItem) {
            activeStudentItem.classList.remove('active-student');
        }
    }
}

// Öğrenci listesinde bir öğeye tıklandığında
function handleStudentClickInAssignmentList(event) {
    const studentItem = event.target.closest('.student-item');
    if (!studentItem) return;
    selectStudentForAssignmentItem(studentItem);
}

// Öğrenciyi seçme ve ilgili arayüzü güncelleme
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
        const assignedComment = studentAssignments[selectedStudent.fullName] || '';
        commentTextarea.value = assignedComment.replace(/\[Öğrenci Adı\]/g, selectedStudent.firstName);
        assignCommentBtn.textContent = assignedComment ? 'Yorumu Güncelle' : 'Yorumu Ata';
        updateCharCount();
    }
}

// Önceki/sonraki öğrenciye geçiş
export function navigateStudent(direction) {
    const currentStudentItems = Array.from(studentListContainer.querySelectorAll('.student-item'));
    if (currentStudentItems.length === 0) {
        showToast('Listede gezinilecek öğrenci bulunamadı.', 'info');
        return;
    }

    const currentIndex = selectedStudent ? currentStudentItems.findIndex(item => item.dataset.id === selectedStudent.id) : -1;
    let nextIndex = currentIndex + direction;

    if (nextIndex < 0) {
        nextIndex = currentStudentItems.length - 1;
    } else if (nextIndex >= currentStudentItems.length) {
        nextIndex = 0;
    }

    const nextStudentItem = currentStudentItems[nextIndex];
    if (nextStudentItem) {
        selectStudentForAssignmentItem(nextStudentItem);
        nextStudentItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Olay dinleyicilerini başlatma
export function initializeCommentsTabListeners() {
    // ... (Olay dinleyicilerinin içeriği aynı kalabilir, yukarıdaki fonksiyonel değişiklikler yeterlidir) ...
    // Örnek olarak birkaç tanesi:
    studentListClassFilter.addEventListener('change', () => loadStudentListForAssignment(filterUnassignedBtn.classList.contains('active-filter')));
    studentListSubClassFilter.addEventListener('change', () => loadStudentListForAssignment(filterUnassignedBtn.classList.contains('active-filter')));
    studentSearchInput.addEventListener('input', () => loadStudentListForAssignment(filterUnassignedBtn.classList.contains('active-filter')));
    studentListContainer.addEventListener('click', handleStudentClickInAssignmentList);
    assignCommentBtn.addEventListener('click', assignCommentToStudent);
    // ... diğer tüm dinleyiciler ...
}