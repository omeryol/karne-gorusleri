// js/student-management-tab.js

import { showToast, getFirstName, generateUniqueId } from './utils.js';
import { students, studentAssignments, selectedStudent, setSelectedStudent, saveData, reassignStudentNumbers } from './data-management.js';
import { updateDashboardCards } from './dashboard.js';
import { loadStudentListForAssignment } from './comments-tab.js';
import {
    studentNamesTextarea, newStudentClassSelect, newStudentSubClassSelect,
    loadNamesFromTextBtn, studentListUpload, clearAllStudentsBtn, clearLocalStorageBtn,
    managementClassFilter, managementSubClassFilter, managementStudentSearchInput,
    managedStudentListDiv, studentListDiv, commentTextarea, selectedStudentNameDisplay
} from './ui-elements.js';

// Öğrenci Yönetimi sekmesindeki listeyi güncelleme (Silme/Numara Güncelleme için)
export function updateManagedStudentListUI() {
    const filterClass = managementClassFilter.value;
    const filterSubClass = managementSubClassFilter.value;
    const searchTerm = managementStudentSearchInput.value.toLowerCase();

    managedStudentListDiv.innerHTML = '<p>Kaydedilmiş öğrenci yok.</p>';

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
        managedStudentListDiv.innerHTML = '';
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
                    <button class="delete-student-btn" data-id="${student.id}">Sil</button>
                </div>
            `;
            managedStudentListDiv.appendChild(studentItem);
        });
    }
}

// Öğrenciyi silme (Yönetim sayfasından)
function deleteStudent(event) {
    const targetButton = event.target.closest('.delete-student-btn');
    if (!targetButton) return;

    const studentIdToDelete = targetButton.dataset.id;
    const studentToDelete = students.find(s => s.id === studentIdToDelete);

    if (studentToDelete && confirm(`${studentToDelete.fullName} (${studentToDelete.class}${studentToDelete.subClass}) öğrencisini listeden silmek istediğinize emin misiniz? Bu işlem, atanan yorumunu da siler.`)) {
        students = students.filter(s => s.id !== studentIdToDelete);

        if (studentAssignments[studentToDelete.fullName]) {
            delete studentAssignments[studentToDelete.fullName];
        }

        reassignStudentNumbers();

        saveData();
        updateManagedStudentListUI();
        // filterUnassignedBtn durumunu alttaki fonksiyona doğrudan geçirmeyelim, data-management'dan yüklenmeli
        // veya comments-tab modülündeki filtre durumu kontrolüyle tekrar çağrılmalı.
        // Şimdilik varsayılan false ile çağıralım, comments-tab kendi içinde filtre durumunu yönetecek.
        loadStudentListForAssignment(false); // Varsayılan olarak tüm öğrencileri yükle
        updateDashboardCards();

        if (selectedStudent && selectedStudent.id === studentIdToDelete) {
            setSelectedStudent(null);
            selectedStudentNameDisplay.textContent = 'Yok';
            commentTextarea.value = ''; // Seçili öğrenci silindiğinde yorum alanını temizle
            // Yorumu Ata/Güncelle butonunun metnini sıfırla
            document.getElementById('assign-comment-btn-editor').textContent = 'Yorumu Ata / Güncelle';
        }
        showToast(`${studentToDelete.fullName} başarıyla silindi.`, 'success');
    }
}

// Öğrenci Yönetimi sayfasından yeni öğrenci ekleme (textarea'dan)
function addNewStudentsFromTextarea() {
    const text = studentNamesTextarea.value;
    const assignedClass = newStudentClassSelect.value;
    const assignedSubClass = newStudentSubClassSelect.value;

    if (!assignedClass) {
        showToast('Lütfen öğrencilerin sınıfını seçin!', 'error');
        return;
    }
    if (!assignedSubClass) {
        showToast('Lütfen öğrencilerin şubesini seçin!', 'error');
        return;
    }

    const names = text.split('\n')
                      .map(name => name.trim())
                      .filter(name => name.length > 0);

    if (names.length === 0) {
        showToast('Lütfen isimleri girin veya yapıştırın.', 'error');
        return;
    }

    let addedCount = 0;
    names.forEach(fullName => {
        const exists = students.some(s => s.fullName === fullName && s.class === assignedClass && s.subClass === assignedSubClass);
        if (!exists) {
            const firstName = getFirstName(fullName);
            const newStudent = {
                id: generateUniqueId(),
                fullName: fullName,
                firstName: firstName,
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
    if (addedCount > 0) {
        showToast(`${addedCount} öğrenci listeye eklendi! (Sınıf: ${assignedClass}${assignedSubClass})`, 'success');
    } else {
        showToast('Yeni öğrenci eklenmedi (zaten mevcut olabilirler).', 'info');
    }
    studentNamesTextarea.value = '';
}

// CSV dosyasından öğrenci listesi yükleme
function loadStudentListFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const names = text.split('\n')
                           .map(name => name.trim())
                           .filter(name => name.length > 0);

        if (names.length === 0) {
            showToast('CSV dosyasında geçerli isim bulunamadı.', 'error');
            return;
        }

        const assignedClass = newStudentClassSelect.value || '5';
        const assignedSubClass = newStudentSubClassSelect.value || 'A';

        let addedCount = 0;
        names.forEach(fullName => {
            const exists = students.some(s => s.fullName === fullName && s.class === assignedClass && s.subClass === assignedSubClass);
            if (!exists) {
                const firstName = getFirstName(fullName);
                const newStudent = {
                    id: generateUniqueId(),
                    fullName: fullName,
                    firstName: firstName,
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
        if (addedCount > 0) {
            showToast(`${addedCount} öğrenci CSV dosyasından listeye eklendi! (Sınıf: ${assignedClass}${assignedSubClass})`, 'success');
        } else {
            showToast('CSV dosyasından yeni öğrenci eklenmedi.', 'info');
        }
        studentListUpload.value = '';
    };
    reader.readAsText(file);
}

// Tüm öğrenci verilerini temizle
function clearAllStudentData() {
    if (confirm("Tüm öğrenci listesini ve atanan yorumları SİLMEK istediğinize emin misiniz? Bu işlem geri alınamaz!")) {
        students.length = 0; // Array'i boşalt
        for (const key in studentAssignments) { // Objeyi boşalt
            if (studentAssignments.hasOwnProperty(key)) {
                delete studentAssignments[key];
            }
        }
        setSelectedStudent(null);
        studentNamesTextarea.value = '';
        studentListUpload.value = '';
        saveData();
        updateManagedStudentListUI();
        loadStudentListForAssignment(false); // Filtre durumunu sıfırla
        commentTextarea.value = ''; // Yorum alanını temizle
        selectedStudentNameDisplay.textContent = 'Yok';
        document.getElementById('assign-comment-btn-editor').textContent = 'Yorumu Ata / Güncelle'; // Buton metnini sıfırla
        updateDashboardCards();
        showToast("Tüm öğrenci verileri başarıyla temizlendi.", 'success');
    }
}

// Local Storage'ı tamamen temizleme fonksiyonu
function clearAllLocalStorage() {
    if (confirm("UYARI: Bu işlem, tüm öğrenci verileri, atanan yorumlar ve uygulama ayarları dahil olmak üzere tarayıcınızda kayıtlı olan TÜM verileri silecektir. Bu işlem geri alınamaz! Devam etmek istiyor musunuz?")) {
        localStorage.clear();

        // Uygulamayı varsayılan durumuna getirmek için gerekli değişkenleri ve UI'ı sıfırla
        students.length = 0;
        for (const key in studentAssignments) {
            if (studentAssignments.hasOwnProperty(key)) {
                delete studentAssignments[key];
            }
        }
        setSelectedStudent(null);

        // UI elementlerini varsayılan hallerine getir
        sidebarClassFilter.value = 'all';
        sidebarSubClassFilter.value = 'all';
        studentListDiv.querySelector('input[type="text"]').value = ''; // studentSearchInput
        classSelect.value = '';
        termSelect.value = '';
        autoClearCommentCheckbox.checked = false;
        newStudentClassSelect.value = '';
        newStudentSubClassSelect.value = '';
        managementClassFilter.value = 'all';
        managementSubClassFilter.value = 'all';
        managementStudentSearchInput.value = '';

        updateManagedStudentListUI();
        loadStudentListForAssignment(false);
        commentTextarea.value = '';
        selectedStudentNameDisplay.textContent = 'Yok';
        document.getElementById('assign-comment-btn-editor').textContent = 'Yorumu Ata / Güncelle';
        updateDashboardCards();
        // Tema renklerini varsayılana döndür (body class'ını temizler)
        document.body.className = '';

        localStorage.removeItem('doNotShowHelpModalAgain');
        document.getElementById('help-modal').style.display = 'flex'; // Modalı tekrar göster

        showToast("Uygulama başarıyla sıfırlandı. Tüm veriler temizlendi.", 'success');
        // Sayfayı yenilemek daha tutarlı bir sıfırlama sağlayabilir
        // window.location.reload();
    }
}


// Event dinleyicilerini başlatma fonksiyonu
export function initializeStudentManagementTabListeners() {
    loadNamesFromTextBtn.addEventListener('click', addNewStudentsFromTextarea);
    studentListUpload.addEventListener('change', loadStudentListFromFile);
    newStudentClassSelect.addEventListener('change', saveData);
    newStudentSubClassSelect.addEventListener('change', saveData);
    clearAllStudentsBtn.addEventListener('click', clearAllStudentData);
    clearLocalStorageBtn.addEventListener('click', clearAllLocalStorage);
    managementClassFilter.addEventListener('change', updateManagedStudentListUI);
    managementSubClassFilter.addEventListener('change', updateManagedStudentListUI);
    managementStudentSearchInput.addEventListener('input', updateManagedStudentListUI);
    managedStudentListDiv.addEventListener('click', deleteStudent);
}