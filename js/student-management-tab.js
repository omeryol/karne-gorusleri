// js/student-management-tab.js

import { showToast, getFirstName, generateUniqueId } from './utils.js';
import { students, studentAssignments, selectedStudent, setSelectedStudent, saveData, reassignStudentNumbers } from './data-management.js';
import { updateDashboardCards } from './dashboard.js';
import { loadStudentListForAssignment, selectStudentForAssignmentItem } from './comments-tab.js';
import {
    studentNamesTextareaModal, newStudentClassSelectModal, newStudentSubClassSelectModal,
    loadNamesFromTextBtnModal, studentListUploadModal,
    managementClassFilterModal, managementSubClassFilterModal, managementStudentSearchInputModal,
    managedStudentListContainerModal,
    clearAllStudentsBtnModal, clearLocalStorageBtnModal,
    selectedStudentNameDisplay, commentTextarea, assignCommentBtn
} from './ui-elements.js';

console.log('[student-management-tab.js] Öğrenci yönetimi sekmesi modülü yükleniyor...');


/**
 * Öğrenci Yönetimi modalındaki "Kaydedilmiş Öğrenciler" listesini günceller.
 * Filtreleme ve arama kriterlerine göre listeyi yeniden oluşturur.
 */
export function updateManagedStudentListUI() {
    console.log('[student-management-tab.js] updateManagedStudentListUI çağrıldı.');
    const filterClass = managementClassFilterModal.value;
    const filterSubClass = managementSubClassFilterModal.value;
    const searchTerm = managementStudentSearchInputModal.value.toLowerCase();

    const filteredStudents = students.filter(student => {
        const matchesClass = filterClass === 'all' || student.class === filterClass;
        const matchesSubClass = filterSubClass === 'all' || student.subClass === filterSubClass;
        const matchesSearch = student.fullName.toLowerCase().includes(searchTerm) ||
                              String(student.num).includes(searchTerm);
        return matchesClass && matchesSubClass && matchesSearch;
    }).sort((a, b) => a.num - b.num);

    managedStudentListContainerModal.innerHTML = '';
    if (filteredStudents.length > 0) {
        filteredStudents.forEach(student => {
            const studentItem = document.createElement('div');
            studentItem.classList.add('managed-student-item');
            studentItem.dataset.id = student.id;

            studentItem.innerHTML = `
                <div class="managed-student-info">
                    <span class="student-number">${student.num}</span>
                    <span>${student.fullName}</span>
                    <span>(${student.class}${student.subClass}. Sınıf)</span>
                </div>
                <div class="managed-student-actions">
                    <button class="delete-student-btn button warn-button" data-id="${student.id}">Sil</button>
                </div>
            `;
            managedStudentListContainerModal.appendChild(studentItem);
        });
    } else {
        managedStudentListContainerModal.innerHTML = '<p class="empty-list-message">Filtreye uygun öğrenci bulunamadı.</p>';
    }
}

// ... (addNewStudentsFromTextarea, loadStudentListFromFile, clearAllStudentData, clearAllLocalStorage gibi diğer fonksiyonlar küçük yorum iyileştirmeleriyle kalabilir, mantıkları zaten doğru çalışıyor) ...
// İYİLEŞTİRME: deleteStudent fonksiyonu, seçili öğrenci silindiğinde ana ekranı da güncelliyor.
function deleteStudent(event) {
    const targetButton = event.target.closest('.delete-student-btn');
    if (!targetButton) return;

    const studentIdToDelete = targetButton.dataset.id;
    const studentToDelete = students.find(s => s.id === studentIdToDelete);

    if (studentToDelete && confirm(`${studentToDelete.fullName} öğrencisini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) {
        // students dizisinden öğrenciyi çıkar
        const studentIndex = students.findIndex(s => s.id === studentIdToDelete);
        if(studentIndex > -1) students.splice(studentIndex, 1);
        
        // Atanan yorumu sil
        delete studentAssignments[studentToDelete.fullName];

        // Eğer silinen öğrenci o an seçili ise, seçimi temizle
        if (selectedStudent && selectedStudent.id === studentIdToDelete) {
            setSelectedStudent(null);
            selectedStudentNameDisplay.textContent = 'Yok';
            commentTextarea.value = '';
            assignCommentBtn.textContent = 'Yorumu Ata / Güncelle';
        }

        reassignStudentNumbers();
        saveData();
        updateManagedStudentListUI(); // Yönetim modalındaki listeyi güncelle
        loadStudentListForAssignment(false); // Ana ekrandaki listeyi güncelle
        updateDashboardCards();
        showToast(`${studentToDelete.fullName} başarıyla silindi.`, 'success');
    }
}

/**
 * Öğrenci yönetimi sekmesindeki tüm olay dinleyicilerini başlatır.
 */
export function initializeStudentManagementTabListeners() {
    console.log('[student-management-tab.js] initializeStudentManagementTabListeners çağrıldı.');

    loadNamesFromTextBtnModal.addEventListener('click', addNewStudentsFromTextarea);
    studentListUploadModal.addEventListener('change', loadStudentListFromFile);
    managementClassFilterModal.addEventListener('change', updateManagedStudentListUI);
    managementSubClassFilterModal.addEventListener('change', updateManagedStudentListUI);
    managementStudentSearchInputModal.addEventListener('input', updateManagedStudentListUI);
    managedStudentListContainerModal.addEventListener('click', deleteStudent);
    clearAllStudentsBtnModal.addEventListener('click', clearAllStudentData);
    clearLocalStorageBtnModal.addEventListener('click', clearAllLocalStorage);
}