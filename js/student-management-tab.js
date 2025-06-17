// js/student-management-tab.js

import { showToast, getFirstName, generateUniqueId } from './utils.js';
import { students, studentAssignments, selectedStudent, setSelectedStudent, saveData, reassignStudentNumbers } from './data-management.js';
import { updateDashboardCards } from './dashboard.js';
import { loadStudentListForAssignment } from './comments-tab.js';
import {
    studentNamesTextareaModal, newStudentClassSelectModal, newStudentSubClassSelectModal,
    loadNamesFromTextBtnModal, studentListUploadModal,
    managementClassFilterModal, managementSubClassFilterModal, managementStudentSearchInputModal,
    managedStudentListContainerModal,
    clearAllStudentsBtnModal, clearLocalStorageBtnModal,
    selectedStudentNameDisplay, commentTextarea, assignCommentBtn // Comments tab'dan etkilenen UI elementleri
} from './ui-elements.js';

/*
    Hata Ayıklama Notu:
    Bu modül, öğrenci ekleme, silme ve genel öğrenci verilerini yönetme işlemlerini kontrol eder.
    Bu dosyadaki fonksiyonların, yeni HTML yapısındaki modal içi elementlerle doğru bir şekilde
    etkileşime girdiğinden ve beklenen davranışları sergilediğinden emin olun.
*/
console.log('[student-management-tab.js] Öğrenci yönetimi sekmesi modülü yükleniyor...');


/**
 * Öğrenci Yönetimi modalındaki "Kaydedilmiş Öğrenciler" listesini günceller.
 * Filtreleme ve arama kriterlerine göre listeyi yeniden oluşturur.
 */
export function updateManagedStudentListUI() {
    console.log('[student-management-tab.js] updateManagedStudentListUI çağrıldı: Yönetilen öğrenci listesi güncelleniyor.');
    const filterClass = managementClassFilterModal.value;
    const filterSubClass = managementSubClassFilterModal.value;
    const searchTerm = managementStudentSearchInputModal.value.toLowerCase();

    managedStudentListContainerModal.innerHTML = '';

    const filteredStudents = students.filter(student => {
        const matchesClass = filterClass === 'all' || student.class === filterClass;
        const matchesSubClass = filterSubClass === 'all' || student.subClass === filterSubClass;
        const matchesSearch = student.fullName.toLowerCase().includes(searchTerm) ||
                              student.firstName.toLowerCase().includes(searchTerm) ||
                              String(student.num).includes(searchTerm);
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
        managedStudentListContainerModal.innerHTML = '<p class="empty-list-message">Bu kriterlere uygun öğrenci bulunamadı.</p>';
    }
}

/**
 * Bir öğrenciyi ve ona ait tüm verileri (yorum ataması vb.) sistemden siler.
 * @param {Event} event - Tıklama olayı.
 */
function deleteStudent(event) {
    const targetButton = event.target.closest('.delete-student-btn');
    if (!targetButton) return;

    const studentIdToDelete = targetButton.dataset.id;
    const studentToDelete = students.find(s => s.id === studentIdToDelete);

    if (studentToDelete && confirm(`${studentToDelete.fullName} (${studentToDelete.class}${studentToDelete.subClass}) öğrencisini listeden silmek istediğinize emin misiniz? Bu işlem, atanan yorumunu da siler.`)) {
        
        // Öğrenciyi 'students' dizisinden çıkar
        const studentIndex = students.findIndex(s => s.id === studentIdToDelete);
        if (studentIndex > -1) {
            students.splice(studentIndex, 1);
        }

        // Öğrencinin yorum atamasını sil
        if (studentAssignments[studentToDelete.fullName]) {
            delete studentAssignments[studentToDelete.fullName];
        }

        // İYİLEŞTİRME: Eğer silinen öğrenci o an seçili ise, seçimi ve arayüzü temizle.
        if (selectedStudent && selectedStudent.id === studentIdToDelete) {
            setSelectedStudent(null);
            if(selectedStudentNameDisplay) selectedStudentNameDisplay.textContent = 'Yok';
            if(commentTextarea) commentTextarea.value = '';
            if(assignCommentBtn) assignCommentBtn.textContent = 'Yorumu Ata / Güncelle';
            console.log('[student-management-tab.js] Seçili öğrenci silindiği için ana ekran arayüzü sıfırlandı.');
        }

        reassignStudentNumbers(); // Numaraları yeniden ata
        saveData();
        updateManagedStudentListUI(); // Yönetim modalındaki listeyi güncelle
        loadStudentListForAssignment(false); // Ana ekrandaki öğrenci listesini güncelle
        updateDashboardCards();

        showToast(`${studentToDelete.fullName} başarıyla silindi.`, 'success');
    }
}

/**
 * Modal'daki metin alanından (textarea) yeni öğrenciler ekler.
 */
function addNewStudentsFromTextarea() {
    const text = studentNamesTextareaModal.value;
    const assignedClass = newStudentClassSelectModal.value;
    const assignedSubClass = newStudentSubClassSelectModal.value;

    if (!assignedClass || !assignedSubClass) {
        showToast('Lütfen öğrencilerin ekleneceği sınıf ve şubeyi seçin!', 'error');
        return;
    }

    const names = text.split('\n').map(name => name.trim()).filter(name => name.length > 0);
    if (names.length === 0) {
        showToast('Lütfen isimleri girin veya yapıştırın.', 'error');
        return;
    }

    let addedCount = 0;
    names.forEach(fullName => {
        const exists = students.some(s => s.fullName === fullName && s.class === assignedClass && s.subClass === assignedSubClass);
        if (!exists) {
            const newStudent = {
                id: generateUniqueId(),
                fullName: fullName,
                firstName: getFirstName(fullName),
                class: assignedClass,
                subClass: assignedSubClass,
                num: 0
            };
            students.push(newStudent);
            addedCount++;
        }
    });

    reassignStudentNumbers();
    saveData();
    updateManagedStudentListUI();
    updateDashboardCards();
    loadStudentListForAssignment(false);

    if (addedCount > 0) {
        showToast(`${addedCount} öğrenci başarıyla eklendi!`, 'success');
        studentNamesTextareaModal.value = ''; // Metin alanını temizle
    } else {
        showToast('Yeni öğrenci eklenmedi (girilen isimler zaten listede mevcut olabilir).', 'info');
    }
}

// ... (loadStudentListFromFile, clearAllStudentData, clearAllLocalStorage gibi diğer fonksiyonlar aynı kalabilir) ...

/**
 * Öğrenci yönetimi sekmesindeki tüm olay dinleyicilerini başlatır.
 */
export function initializeStudentManagementTabListeners() {
    if (loadNamesFromTextBtnModal) loadNamesFromTextBtnModal.addEventListener('click', addNewStudentsFromTextarea);
    if (studentListUploadModal) studentListUploadModal.addEventListener('change', loadStudentListFromFile);
    if (managementClassFilterModal) managementClassFilterModal.addEventListener('change', updateManagedStudentListUI);
    if (managementSubClassFilterModal) managementSubClassFilterModal.addEventListener('change', updateManagedStudentListUI);
    if (managementStudentSearchInputModal) managementStudentSearchInputModal.addEventListener('input', updateManagedStudentListUI);
    if (managedStudentListContainerModal) managedStudentListContainerModal.addEventListener('click', deleteStudent);
    if (clearAllStudentsBtnModal) clearAllStudentsBtnModal.addEventListener('click', clearAllStudentData);
    if (clearLocalStorageBtnModal) clearLocalStorageBtnModal.addEventListener('click', clearAllLocalStorage);
}