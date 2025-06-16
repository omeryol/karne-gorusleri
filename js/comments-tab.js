// js/comments-tab.js

import { showToast } from './utils.js';
import { students, studentAssignments, selectedStudent, setSelectedStudent, currentCommentTemplate, setCurrentCommentTemplate, saveData } from './data-management.js';
import { updateDashboardCards } from './dashboard.js';
import { openCommentPreviewModal, viewAllAssignments } from './modals.js';
import {
    sidebarClassFilter, sidebarSubClassFilter, studentSearchInput, studentListDiv,
    filterUnassignedBtn, selectedStudentNameDisplay, commentTextarea, assignCommentBtnEditor,
    classSelect, termSelect, profileSearchInput, profileList,
    copyCommentBtn, clearCommentEditorBtn, autoClearCommentCheckbox,
    prevStudentBtnEditor, nextStudentBtnEditor, viewAllAssignmentsBtnEditor
} from './ui-elements.js';

// commentsData global olarak index.html'den yüklendiği için window objesi üzerinden erişiyoruz.
// Alternatif olarak, comments_templates_data.js dosyasını da bir ES Module yapıp buradan import edebiliriz.
// Şimdilik global erişimi koruyalım.

// Yorum atama sekmesindeki öğrenci listesini yükleme/filtreleme
export function loadStudentListForAssignment(filterUnassigned = false) {
    const filterClass = sidebarClassFilter.value;
    const filterSubClass = sidebarSubClassFilter.value;
    const searchTerm = studentSearchInput.value.toLowerCase();

    studentListDiv.innerHTML = '';

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

    if (filteredStudents.length === 0) {
        studentListDiv.innerHTML = '<p>Filtreye uygun öğrenci bulunamadı.</p>';
        selectedStudentNameDisplay.textContent = 'Yok';
        setSelectedStudent(null);
        commentTextarea.value = '';
        updateCharCount(); // Karakter sayısını güncelle
        assignCommentBtnEditor.textContent = 'Yorumu Ata / Güncelle';
        return;
    }

    filteredStudents.forEach(student => {
        const studentItem = document.createElement('div');
        studentItem.classList.add('student-item');
        studentItem.dataset.id = student.id;

        const assignedComment = studentAssignments[student.fullName] || '';
        const previewText = assignedComment ? assignedComment.substring(0, 50) + (assignedComment.length > 50 ? '...' : '') : 'Yorum atanmadı';
        const buttonText = assignedComment ? 'Güncelle' : 'Ata';

        studentItem.innerHTML = `
            <span class="student-info">
                <span class="student-number">${student.num}</span>
                <span class="student-full-name">${student.fullName} (${student.class}${student.subClass})</span>
            </span>
            <span class="student-comment-preview">${previewText}</span>
            <button class="assign-btn" data-student-id="${student.id}">${buttonText}</button>
        `;

        studentListDiv.appendChild(studentItem);
    });

    // Sayfa yüklendiğinde veya filtre değiştiğinde seçili öğrenciyi vurgula
    if (selectedStudent) {
        const activeItem = studentListDiv.querySelector(`.student-item[data-id="${selectedStudent.id}"]`);
        if (activeItem) {
            activeItem.classList.add('active-student');
            selectedStudentNameDisplay.textContent = `${selectedStudent.fullName} (${selectedStudent.class}${selectedStudent.subClass}. Sınıf)`;
            const assignedCommentForSelected = studentAssignments[selectedStudent.fullName];
            if (assignedCommentForSelected) {
                commentTextarea.value = assignedCommentForSelected.replace(/\[Öğrenci Adı\]/g, selectedStudent.firstName);
                assignCommentBtnEditor.textContent = 'Yorumu Güncelle';
            } else {
                commentTextarea.value = '';
                assignCommentBtnEditor.textContent = 'Yorumu Ata';
            }
            updateCharCount();
        } else {
            selectedStudentNameDisplay.textContent = 'Yok';
            setSelectedStudent(null);
            commentTextarea.value = '';
            updateCharCount();
            assignCommentBtnEditor.textContent = 'Yorumu Ata / Güncelle';
        }
    } else {
        selectedStudentNameDisplay.textContent = 'Yok';
        commentTextarea.value = '';
        updateCharCount();
        assignCommentBtnEditor.textContent = 'Yorumu Ata / Güncelle';
    }
}

// Yorum profillerini yükleme/filtreleme
export function loadCommentTemplates() {
    const selectedClass = classSelect.value;
    const selectedTerm = termSelect.value;
    const searchTerm = profileSearchInput.value.toLowerCase();

    profileList.innerHTML = '';

    if (typeof window.commentsData !== 'undefined' && window.commentsData[selectedClass] && window.commentsData[selectedClass][selectedTerm]) { // Global commentsData'ya window.commentsData ile eriş
        const templates = window.commentsData[selectedClass][selectedTerm]; // Global commentsData'ya window.commentsData ile eriş
        const filteredTemplates = templates.filter(template => {
            return template.title.toLowerCase().includes(searchTerm) ||
                   template.comment.toLowerCase().includes(searchTerm);
        });

        if (filteredTemplates.length === 0 && searchTerm.length > 0) {
            profileList.innerHTML = '<p>Aradığınız kriterlere uygun yorum bulunamadı.</p>';
        } else if (filteredTemplates.length === 0) {
            profileList.innerHTML = '<p>Bu sınıf ve dönem için yorum bulunamadı.</p>';
        } else {
            filteredTemplates.forEach(template => {
                const profileItem = document.createElement('div');
                profileItem.classList.add('profile-item');
                profileItem.dataset.id = template.id;
                profileItem.textContent = template.title;
                profileItem.addEventListener('click', () => {
                    openCommentPreviewModal(template);
                });
                profileList.appendChild(profileItem);
            });
        }
    } else {
        profileList.innerHTML = '<p>Lütfen sınıf ve dönem seçin.</p>';
    }
}

// Yorum düzenleme alanındaki karakter sayısını güncelleme
export function updateCharCount() {
    const currentLength = commentTextarea.value.length;
    const remaining = 500 - currentLength;
    remainingCharsSpan.textContent = remaining;
    if (remaining < 0) {
        remainingCharsSpan.style.color = 'red';
    } else {
        remainingCharsSpan.style.color = '#666';
    }
}

// Yorumu panoya kopyalama
function copyCommentToClipboard() {
    commentTextarea.select();
    document.execCommand('copy');
    showToast('Yorum panoya kopyalandı!', 'success');
}

// Yorum düzenleme alanını temizler
function clearCommentEditor() {
    commentTextarea.value = '';
    updateCharCount();
    const currentActive = profileList.querySelector('.profile-item.active');
    if (currentActive) {
        currentActive.classList.remove('active');
    }
    setCurrentCommentTemplate(null); // Temizlendiğinde şablonu sıfırla
    showToast('Yorum alanı temizlendi.', 'info');
}

// Öğrenciye yorum atama işlemini gerçekleştirir
function assignCommentToStudent() {
    if (!selectedStudent) {
        showToast('Lütfen önce sol listeden bir öğrenci seçin.', 'error');
        return;
    }

    let comment = commentTextarea.value.trim();

    if (comment.length === 0) {
        showToast('Lütfen önce bir yorum seçin veya yazın.', 'error');
        return;
    }

    comment = comment.replace(/\[Öğrenci Adı\]/g, selectedStudent.firstName);

    studentAssignments[selectedStudent.fullName] = comment;
    showToast(`${selectedStudent.fullName} öğrencisine yorum atandı/güncellendi.`, 'success');
    saveData();
    loadStudentListForAssignment(filterUnassignedBtn.classList.contains('active-filter'));
    updateDashboardCards();

    if (autoClearCommentCheckbox.checked) {
        clearCommentEditor();
        setSelectedStudent(null);
        selectedStudentNameDisplay.textContent = 'Yok';
    }
}

// Öğrenci listesinde bir öğrenciye tıklandığında
function handleStudentClickInAssignmentList(event) {
    const studentItem = event.target.closest('.student-item');
    if (!studentItem) return;

    if (event.target.closest('.assign-btn')) {
        const studentIdToAssign = event.target.closest('.assign-btn').dataset.studentId;
        const student = students.find(s => s.id === studentIdToAssign);
        if (student) {
            selectStudentForAssignmentItem(studentItem); // Öğrenciyi seç ve vurgula
        }
    } else {
        selectStudentForAssignmentItem(studentItem);
    }
}

// Öğrenciyi seçme fonksiyonu (studentItemElement parametresi alıyor)
export function selectStudentForAssignmentItem(studentItemElement) {
    const previouslySelected = studentListDiv.querySelector('.student-item.active-student');
    if (previouslySelected) {
        previouslySelected.classList.remove('active-student');
    }

    studentItemElement.classList.add('active-student');
    const studentId = studentItemElement.dataset.id;
    const student = students.find(s => s.id === studentId);
    setSelectedStudent(student);

    if (selectedStudent) {
        selectedStudentNameDisplay.textContent = `${selectedStudent.fullName} (${selectedStudent.class}${selectedStudent.subClass}. Sınıf)`;
        const assignedCommentForSelected = studentAssignments[selectedStudent.fullName];
        if (assignedCommentForSelected) {
            commentTextarea.value = assignedCommentForSelected.replace(/\[Öğrenci Adı\]/g, selectedStudent.firstName);
            assignCommentBtnEditor.textContent = 'Yorumu Güncelle';
        } else {
            commentTextarea.value = '';
            assignCommentBtnEditor.textContent = 'Yorumu Ata';
        }
        updateCharCount();
    } else {
        selectedStudentNameDisplay.textContent = 'Yok';
        commentTextarea.value = '';
        updateCharCount();
        assignCommentBtnEditor.textContent = 'Yorumu Ata / Güncelle';
    }
}

// Hızlı öğrenci navigasyonu
export function navigateStudent(direction) {
    const currentStudentItems = Array.from(studentListDiv.querySelectorAll('.student-item'));
    if (currentStudentItems.length === 0) {
        showToast('Listede öğrenci bulunamadı.', 'info');
        return;
    }

    let currentIndex = -1;
    if (selectedStudent) {
        currentIndex = currentStudentItems.findIndex(item => item.dataset.id === selectedStudent.id);
    }

    let nextIndex = currentIndex + direction;

    if (nextIndex < 0) {
        nextIndex = currentStudentItems.length - 1; // Başa döner
    } else if (nextIndex >= currentStudentItems.length) {
        nextIndex = 0; // Sona döner
    }

    selectStudentForAssignmentItem(currentStudentItems[nextIndex]);
    currentStudentItems[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}


// Event dinleyicilerini başlatma fonksiyonu
export function initializeCommentsTabListeners() {
    sidebarClassFilter.addEventListener('change', () => loadStudentListForAssignment(filterUnassignedBtn.classList.contains('active-filter')));
    sidebarSubClassFilter.addEventListener('change', () => loadStudentListForAssignment(filterUnassignedBtn.classList.contains('active-filter')));
    studentSearchInput.addEventListener('input', () => loadStudentListForAssignment(filterUnassignedBtn.classList.contains('active-filter')));
    studentListDiv.addEventListener('click', handleStudentClickInAssignmentList);

    filterUnassignedBtn.addEventListener('click', () => {
        filterUnassignedBtn.classList.toggle('active-filter');
        if (filterUnassignedBtn.classList.contains('active-filter')) {
            loadStudentListForAssignment(true);
            showToast('Yorum bekleyen öğrenciler filtrelendi.', 'info');
        } else {
            loadStudentListForAssignment(false);
            showToast('Tüm öğrenciler gösteriliyor.', 'info');
        }
    });

    // Yorum düzenleme alanındaki butonlar
    prevStudentBtnEditor.addEventListener('click', () => navigateStudent(-1));
    nextStudentBtnEditor.addEventListener('click', () => navigateStudent(1));
    viewAllAssignmentsBtnEditor.addEventListener('click', viewAllAssignments); // modals.js'den import edildi

    assignCommentBtnEditor.addEventListener('click', assignCommentToStudent);
    copyCommentBtn.addEventListener('click', copyCommentToClipboard);
    clearCommentEditorBtn.addEventListener('click', clearCommentEditor);
    autoClearCommentCheckbox.addEventListener('change', saveData);

    classSelect.addEventListener('change', () => {
        loadCommentTemplates();
        saveData();
        profileSearchInput.value = '';
    });
    termSelect.addEventListener('change', () => {
        loadCommentTemplates();
        saveData();
        profileSearchInput.value = '';
    });
    profileSearchInput.addEventListener('input', loadCommentTemplates);
    commentTextarea.addEventListener('input', updateCharCount);
}