// js/student-management-tab.js

import { showToast, getFirstName, generateUniqueId } from './utils.js';
import { students, studentAssignments, selectedStudent, setSelectedStudent, saveData, reassignStudentNumbers } from './data-management.js';
import { updateDashboardCards } from './dashboard.js';
import { loadStudentListForAssignment } from './comments-tab.js';
import {
    studentNamesTextareaModal, newStudentClassSelectModal, newStudentSubClassSelectModal, // Modal içi yeni öğrenci ekleme elementleri
    loadNamesFromTextBtnModal, studentListUploadModal, // Modal içi butonlar
    managementClassFilterModal, managementSubClassFilterModal, managementStudentSearchInputModal, // Modal içi yönetim filtreleri
    managedStudentListContainerModal, // Modal içi öğrenci listesi konteyneri
    clearAllStudentsBtnModal, clearLocalStorageBtnModal, // Modal içi temizleme butonları
    selectedStudentNameDisplay, commentTextarea, assignCommentBtn // Comments tab'dan etkilenen UI elementleri
} from './ui-elements.js';

/*
    Hata Ayıklama Notu:
    Bu modül, öğrenci ekleme, silme ve genel öğrenci verilerini yönetme işlemlerini kontrol eder.
    Bu dosyadaki fonksiyonların, yeni HTML yapısındaki modal içi elementlerle doğru bir şekilde
    etkileşime girdiğinden ve beklenen davranışları sergilediğinden emin olun.
    Tarayıcının Konsol sekmesini açarak `[student-management-tab.js]` ön ekli logları takip edin.
    Özellikle şunları kontrol edin:
    - Metin alanından öğrenci ekleme ve CSV yükleme işlemlerinin verileri doğru kaydettiği.
    - Öğrenci listesinin filtreleme, arama ve güncelleme işlemlerinin sorunsuz olduğu.
    - Öğrenci silme ve tüm verileri temizleme işlemlerinin doğru uyarılarla çalıştığı ve verileri sıfırladığı.
*/
console.log('[student-management-tab.js] Öğrenci yönetimi sekmesi modülü yükleniyor...');


// Öğrenci Yönetimi modalındaki listeyi güncelleme (Silme/Numara Güncelleme için)
export function updateManagedStudentListUI() {
    console.log('[student-management-tab.js] updateManagedStudentListUI çağrıldı: Yönetilen öğrenci listesi güncelleniyor.');
    const filterClass = managementClassFilterModal.value; // Yeni ID
    const filterSubClass = managementSubClassFilterModal.value; // Yeni ID
    const searchTerm = managementStudentSearchInputModal.value.toLowerCase(); // Yeni ID

    managedStudentListContainerModal.innerHTML = ''; // Yeni ID

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

    console.log(`[student-management-tab.js] Yönetilen öğrenci listesi için filtrelenen öğrenci sayısı: ${filteredStudents.length}`);

    if (filteredStudents.length > 0) {
        managedStudentListContainerModal.innerHTML = '';
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
        managedStudentListContainerModal.innerHTML = '<p class="empty-list-message">Kaydedilmiş öğrenci yok.</p>';
    }
}

// Öğrenciyi silme (Yönetim sayfasından)
function deleteStudent(event) {
    console.log('[student-management-tab.js] deleteStudent çağrıldı.');
    const targetButton = event.target.closest('.delete-student-btn');
    if (!targetButton) return;

    const studentIdToDelete = targetButton.dataset.id;
    const studentToDelete = students.find(s => s.id === studentIdToDelete);

    if (studentToDelete && confirm(`${studentToDelete.fullName} (${studentToDelete.class}${studentToDelete.subClass}) öğrencisini listeden silmek istediğinize emin misiniz? Bu işlem, atanan yorumunu da siler.`)) {
        students = students.filter(s => s.id !== studentIdToDelete);
        console.log(`[student-management-tab.js] Öğrenci siliniyor: ${studentToDelete.fullName}`);

        if (studentAssignments[studentToDelete.fullName]) {
            delete studentAssignments[studentToDelete.fullName];
            console.log(`[student-management-tab.js] Atanan yorumu da silindi: ${studentToDelete.fullName}`);
        }

        reassignStudentNumbers(); // Numaraları yeniden ata

        saveData();
        updateManagedStudentListUI(); // Yönetim modalındaki listeyi güncelle
        loadStudentListForAssignment(false); // Ana ekrandaki öğrenci listesini güncelle (filtreyi sıfırla)
        updateDashboardCards();

        if (selectedStudent && selectedStudent.id === studentIdToDelete) {
            setSelectedStudent(null);
            selectedStudentNameDisplay.textContent = 'Yok';
            commentTextarea.value = ''; // Seçili öğrenci silindiğinde yorum alanını temizle
            assignCommentBtn.textContent = 'Yorumu Ata / Güncelle'; // Buton metnini sıfırla
            console.log('[student-management-tab.js] Seçili öğrenci silindiği için UI sıfırlandı.');
        }
        showToast(`${studentToDelete.fullName} başarıyla silindi.`, 'success');
        console.log(`[student-management-tab.js] ${studentToDelete.fullName} başarıyla silindi.`);
    } else if (studentToDelete) {
        console.log('[student-management-tab.js] Öğrenci silme işlemi iptal edildi.');
    }
}

// Öğrenci Yönetimi modalından yeni öğrenci ekleme (textarea'dan)
function addNewStudentsFromTextarea() {
    console.log('[student-management-tab.js] addNewStudentsFromTextarea çağrıldı.');
    const text = studentNamesTextareaModal.value; // Yeni ID
    const assignedClass = newStudentClassSelectModal.value; // Yeni ID
    const assignedSubClass = newStudentSubClassSelectModal.value; // Yeni ID

    if (!assignedClass) {
        showToast('Lütfen öğrencilerin sınıfını seçin!', 'error');
        console.warn('[student-management-tab.js] addNewStudentsFromTextarea: Sınıf seçilmedi.');
        return;
    }
    if (!assignedSubClass) {
        showToast('Lütfen öğrencilerin şubesini seçin!', 'error');
        console.warn('[student-management-tab.js] addNewStudentsFromTextarea: Şube seçilmedi.');
        return;
    }

    const names = text.split('\n')
                      .map(name => name.trim())
                      .filter(name => name.length > 0);

    if (names.length === 0) {
        showToast('Lütfen isimleri girin veya yapıştırın.', 'error');
        console.warn('[student-management-tab.js] addNewStudentsFromTextarea: İsim girilmedi.');
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
                num: 0 // Numara reassignStudentNumbers tarafından atanacak
            };
            students.push(newStudent);
            addedCount++;
            console.log(`[student-management-tab.js] Yeni öğrenci eklendi: ${fullName}`);
        } else {
            console.log(`[student-management-tab.js] Öğrenci zaten mevcut, atlandı: ${fullName} (${assignedClass}${assignedSubClass})`);
        }
    });

    reassignStudentNumbers(); // Numaraları yeniden ata

    saveData();
    updateManagedStudentListUI(); // Yönetim modalındaki listeyi güncelle
    updateDashboardCards();
    if (addedCount > 0) {
        showToast(`${addedCount} öğrenci listeye eklendi! (Sınıf: ${assignedClass}${assignedSubClass})`, 'success');
        loadStudentListForAssignment(false); // Ana öğrenci listesini güncelle
    } else {
        showToast('Yeni öğrenci eklenmedi (zaten mevcut olabilirler).', 'info');
    }
    studentNamesTextareaModal.value = ''; // Metin alanını temizle
}

// CSV dosyasından öğrenci listesi yükleme
function loadStudentListFromFile(event) {
    console.log('[student-management-tab.js] loadStudentListFromFile çağrıldı.');
    const file = event.target.files[0];
    if (!file) {
        console.warn('[student-management-tab.js] loadStudentListFromFile: Dosya seçilmedi.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const names = text.split('\n')
                           .map(name => name.trim())
                           .filter(name => name.length > 0);

        if (names.length === 0) {
            showToast('CSV dosyasında geçerli isim bulunamadı.', 'error');
            console.warn('[student-management-tab.js] loadStudentListFromFile: CSV dosyası boş veya geçersiz.');
            return;
        }

        const assignedClass = newStudentClassSelectModal.value || '5'; // Varsayılan sınıf
        const assignedSubClass = newStudentSubClassSelectModal.value || 'A'; // Varsayılan şube

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
                console.log(`[student-management-tab.js] CSV'den yeni öğrenci eklendi: ${fullName}`);
            } else {
                console.log(`[student-management-tab.js] CSV'deki öğrenci zaten mevcut, atlandı: ${fullName} (${assignedClass}${assignedSubClass})`);
            }
        });

        reassignStudentNumbers();

        saveData();
        updateManagedStudentListUI();
        updateDashboardCards();
        if (addedCount > 0) {
            showToast(`${addedCount} öğrenci CSV dosyasından listeye eklendi! (Sınıf: ${assignedClass}${assignedSubClass})`, 'success');
            loadStudentListForAssignment(false); // Ana öğrenci listesini güncelle
        } else {
            showToast('CSV dosyasından yeni öğrenci eklenmedi.', 'info');
        }
        studentListUploadModal.value = ''; // Input'u temizle
    };
    reader.readAsText(file);
}

// Tüm öğrenci verilerini temizle
function clearAllStudentData() {
    console.log('[student-management-tab.js] clearAllStudentData çağrıldı.');
    if (confirm("Tüm öğrenci listesini ve atanan yorumları SİLMEK istediğinize emin misiniz? Bu işlem geri alınamaz!")) {
        students.length = 0; // Array'i boşalt
        for (const key in studentAssignments) { // Objeyi boşalt
            if (studentAssignments.hasOwnProperty(key)) {
                delete studentAssignments[key];
            }
        }
        setSelectedStudent(null);
        studentNamesTextareaModal.value = ''; // Modal textarea'sını temizle
        studentListUploadModal.value = ''; // Modal upload input'unu temizle
        saveData();
        updateManagedStudentListUI();
        loadStudentListForAssignment(false); // Ana öğrenci listesini güncelle
        commentTextarea.value = ''; // Yorum alanını temizle
        selectedStudentNameDisplay.textContent = 'Yok';
        assignCommentBtn.textContent = 'Yorumu Ata / Güncelle'; // Buton metnini sıfırla
        updateDashboardCards();
        showToast("Tüm öğrenci verileri başarıyla temizlendi.", 'success');
        console.log('[student-management-tab.js] Tüm öğrenci verileri başarıyla temizlendi.');
    } else {
        console.log('[student-management-tab.js] Tüm öğrenci verilerini temizleme işlemi iptal edildi.');
    }
}

// Local Storage'ı tamamen temizleme fonksiyonu
function clearAllLocalStorage() {
    console.log('[student-management-tab.js] clearAllLocalStorage çağrıldı.');
    if (confirm("UYARI: Bu işlem, tüm öğrenci verileri, atanan yorumlar ve uygulama ayarları dahil olmak üzere tarayıcınızda kayıtlı olan TÜM verileri silecektir. Bu işlem geri alınamaz! Devam etmek istiyor musunuz?")) {
        localStorage.clear();
        console.log('[student-management-tab.js] Local Storage tamamen temizlendi.');

        // Uygulamayı varsayılan durumuna getirmek için gerekli değişkenleri ve UI'ı sıfırla
        students.length = 0;
        for (const key in studentAssignments) {
            if (studentAssignments.hasOwnProperty(key)) {
                delete studentAssignments[key];
            }
        }
        setSelectedStudent(null);

        // UI elementlerini varsayılan hallerine getir (Yeni ID'ler kullanıldı)
        // Header select'leri
        if (newStudentClassSelectModal) newStudentClassSelectModal.value = '';
        if (newStudentSubClassSelectModal) newStudentSubClassSelectModal.value = '';
        if (managementClassFilterModal) managementClassFilterModal.value = 'all';
        if (managementSubClassFilterModal) managementSubClassFilterModal.value = 'all';
        if (managementStudentSearchInputModal) managementStudentSearchInputModal.value = '';
        
        // Comments tab UI
        if (selectedStudentNameDisplay) selectedStudentNameDisplay.textContent = 'Yok';
        if (commentTextarea) commentTextarea.value = '';
        if (assignCommentBtn) assignCommentBtn.textContent = 'Yorumu Ata / Güncelle';

        // Student management tab UI
        if (studentNamesTextareaModal) studentNamesTextareaModal.value = '';
        if (studentListUploadModal) studentListUploadModal.value = '';

        updateManagedStudentListUI(); // Yönetilen listeyi boşalt
        loadStudentListForAssignment(false); // Ana öğrenci listesini sıfırla
        updateDashboardCards();
        
        // Tema renklerini varsayılana döndür (body class'ını temizler)
        document.body.className = '';
        console.log('[student-management-tab.js] Body sınıfı (tema) sıfırlandı.');

        localStorage.removeItem('doNotShowHelpModalAgain');
        // Help modal'ı burada doğrudan açmıyoruz, main.js'deki loadData içinde kontrol edilecek
        console.log('[student-management-tab.js] doNotShowHelpModalAgain ayarı kaldırıldı.');


        showToast("Uygulama başarıyla sıfırlandı. Tüm veriler temizlendi.", 'success');
        console.log('[student-management-tab.js] Uygulama sıfırlama işlemi tamamlandı.');
        // Sayfayı yenilemek daha tutarlı bir sıfırlama sağlayabilir ancak çevrimdışı çalışma için tercih edilmez.
        // window.location.reload();
    } else {
        console.log('[student-management-tab.js] Local Storage temizleme işlemi iptal edildi.');
    }
}


// Event dinleyicilerini başlatma fonksiyonu
export function initializeStudentManagementTabListeners() {
    console.log('[student-management-tab.js] initializeStudentManagementTabListeners çağrıldı: Öğrenci yönetimi dinleyicileri başlatılıyor.');
    
    // Öğrenci Ekle Sekmesi
    loadNamesFromTextBtnModal.addEventListener('click', addNewStudentsFromTextarea);
    studentListUploadModal.addEventListener('change', loadStudentListFromFile);
    newStudentClassSelectModal.addEventListener('change', saveData); // Değişikliklerde kaydet
    newStudentSubClassSelectModal.addEventListener('change', saveData); // Değişikliklerde kaydet

    // Öğrencileri Görüntüle / Sil Sekmesi Filtreleri ve Arama
    managementClassFilterModal.addEventListener('change', updateManagedStudentListUI);
    managementSubClassFilterModal.addEventListener('change', updateManagedStudentListUI);
    managementStudentSearchInputModal.addEventListener('input', updateManagedStudentListUI);
    managedStudentListContainerModal.addEventListener('click', deleteStudent); // Silme butonu için event delegasyonu

    // Temizleme Butonları
    clearAllStudentsBtnModal.addEventListener('click', clearAllStudentData);
    clearLocalStorageBtnModal.addEventListener('click', clearAllLocalStorage);
}

console.log('[student-management-tab.js] Öğrenci yönetimi modülü başarıyla yüklendi.');