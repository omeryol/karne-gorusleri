// js/data-management.js

import { showToast, getFirstName, generateUniqueId } from './utils.js';
import {
    classSelect, termSelect, autoClearCommentCheckbox,
    sidebarClassFilter, sidebarSubClassFilter,
    managementClassFilter, managementSubClassFilter,
    studentListDiv, selectedStudentNameDisplay, commentTextarea
} from './ui-elements.js';

// Veri Yapıları (Local Storage'dan yüklenecek)
export let students = []; // Tüm öğrenci verileri: { id: "benzersizID", fullName: "Ali Yılmaz", firstName: "Ali", class: "5", subClass: "A", num: 1 }
export let studentAssignments = {}; // Öğrenciye atanan yorumlar: { "Ali Yılmaz": "Yorum metni" }
export let selectedStudent = null; // Şu anda yorum atama tarafında seçili olan öğrenci objesi
export let currentCommentTemplate = null; // Şu anda modalda veya düzenleyicide seçili olan yorum şablonu


export function saveData() {
    localStorage.setItem('students', JSON.stringify(students));
    localStorage.setItem('studentAssignments', JSON.stringify(studentAssignments));
    localStorage.setItem('selectedClass', classSelect.value);
    localStorage.setItem('selectedTerm', termSelect.value);
    localStorage.setItem('autoClearChecked', autoClearCommentCheckbox.checked);
    // document.querySelector('.tab-button.active') null olabilir, kontrol ekleyelim
    const activeTabButton = document.querySelector('.tab-button.active');
    if (activeTabButton) {
        localStorage.setItem('activeTab', activeTabButton.dataset.tab);
    }

    localStorage.setItem('sidebarClassFilter', sidebarClassFilter.value);
    localStorage.setItem('sidebarSubClassFilter', sidebarSubClassFilter.value);
    localStorage.setItem('managementClassFilter', managementClassFilter.value);
    localStorage.setItem('managementSubClassFilter', managementSubClassFilter.value);

    if (selectedStudent) {
        localStorage.setItem('selectedStudentId', selectedStudent.id);
    } else {
        localStorage.removeItem('selectedStudentId');
    }
    showToast('Veriler otomatik kaydedildi.', 'info');
}

export function loadData() {
    const savedStudents = localStorage.getItem('students');
    if (savedStudents) {
        students = JSON.parse(savedStudents);
    }

    const savedAssignments = localStorage.getItem('studentAssignments');
    if (savedAssignments) {
        studentAssignments = JSON.parse(savedAssignments);
    }

    if (!students || !Array.isArray(students)) {
        students = [];
    }
    if (!studentAssignments || typeof studentAssignments !== 'object') {
        studentAssignments = {};
    }

    // Eski kayıtlarda `subClass` veya `firstName` yoksa ekle/düzelt
    students.forEach(s => {
        if (!s.firstName) {
            s.firstName = getFirstName(s.fullName);
        }
        if (!s.subClass) { // Eğer `subClass` yoksa varsayılan bir değer ata
            s.subClass = 'A'; // Varsayılan şube
        }
    });
    reassignStudentNumbers();


    const savedClass = localStorage.getItem('selectedClass');
    const savedTerm = localStorage.getItem('selectedTerm');
    if (savedClass) classSelect.value = savedClass;
    if (savedTerm) termSelect.value = savedTerm;

    const autoClearChecked = localStorage.getItem('autoClearChecked');
    if (autoClearChecked !== null) {
        autoClearCommentCheckbox.checked = JSON.parse(autoClearChecked);
    }

    // Filtreleri yükle
    const savedSidebarClassFilter = localStorage.getItem('sidebarClassFilter');
    if (savedSidebarClassFilter) sidebarClassFilter.value = savedSidebarClassFilter;
    const savedSidebarSubClassFilter = localStorage.getItem('sidebarSubClassFilter');
    if (savedSidebarSubClassFilter) sidebarSubClassFilter.value = savedSidebarSubClassFilter;
    const savedManagementClassFilter = localStorage.getItem('managementClassFilter');
    if (savedManagementClassFilter) managementClassFilter.value = savedManagementClassFilter;
    const savedManagementSubClassFilter = localStorage.getItem('managementSubClassFilter');
    if (savedManagementSubClassFilter) managementSubClassFilter.value = savedManagementSubClassFilter;


    // Seçili öğrenciyi yükle
    const savedSelectedStudentId = localStorage.getItem('selectedStudentId');
    if (savedSelectedStudentId) {
        selectedStudent = students.find(s => s.id === savedSelectedStudentId);
        // Seçili öğrenci listesinde aktifse işaretle
        if (selectedStudent) {
            const activeItem = studentListDiv.querySelector(`.student-item[data-id="${selectedStudent.id}"]`);
            if (activeItem) {
                activeItem.classList.add('active-student');
                selectedStudentNameDisplay.textContent = `${selectedStudent.fullName} (${selectedStudent.class}${selectedStudent.subClass}. Sınıf)`;
                // Yorum alanını seçili öğrencinin atanmış yorumuyla güncelle
                const assignedCommentForSelected = studentAssignments[selectedStudent.fullName];
                if (assignedCommentForSelected) {
                    commentTextarea.value = assignedCommentForSelected.replace(/\[Öğrenci Adı\]/g, selectedStudent.firstName);
                } else {
                    commentTextarea.value = '';
                }
            } else {
                selectedStudentNameDisplay.textContent = 'Yok';
                selectedStudent = null;
                commentTextarea.value = '';
            }
        } else {
            selectedStudentNameDisplay.textContent = 'Yok';
            selectedStudent = null;
            commentTextarea.value = '';
        }
    } else {
        selectedStudentNameDisplay.textContent = 'Yok';
        selectedStudent = null;
        commentTextarea.value = '';
    }
}

// Öğrenci numaralarını sınıf ve şubeye göre yeniden atayan yardımcı fonksiyon
export function reassignStudentNumbers() {
    const classSubClassCombinations = [...new Set(students.map(s => `${s.class}-${s.subClass}`))].sort();

    classSubClassCombinations.forEach(combo => {
        const [cls, subCls] = combo.split('-');
        let currentNum = 1;
        students.filter(s => s.class === cls && s.subClass === subCls)
                .sort((a,b) => a.num - b.num)
                .forEach(student => {
                    student.num = currentNum++;
                });
    });
}

export function setSelectedStudent(student) {
    selectedStudent = student;
}

export function setCurrentCommentTemplate(template) {
    currentCommentTemplate = template;
}