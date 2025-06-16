// js/data-management.js

import { showToast, getFirstName } from './utils.js';
import {
    headerClassSelect, headerTermSelect, autoClearCommentCheckbox,
    studentListClassFilter, studentListSubClassFilter,
    managementClassFilterModal, managementSubClassFilterModal,
    // studentListContainer, selectedStudentNameDisplay, commentTextarea // Genel UI elementleri (Bu referanslar burada kullanılmıyor, kaldırıldı)
} from './ui-elements.js';

/*
    Hata Ayıklama Notu:
    Bu dosya, uygulamanın tüm önemli verilerini (öğrenciler, yorum atamaları) Local Storage'a kaydeder ve buradan yükler.
    Her 'localStorage.setItem' ve 'localStorage.getItem' çağrısından sonra verilerin doğru bir şekilde
    saklandığını ve yüklendiğini kontrol etmek önemlidir.
    Tarayıcının Geliştirici Araçları'nda (Developer Tools) "Application" (Uygulama) sekmesine gidin
    ve "Local Storage" altındaki `students`, `studentAssignments`, `selectedClass`, `selectedTerm` vb.
    anahtarların değerlerini kontrol edin.
    Fonksiyonların başlangıcında ve önemli veri manipülasyonu adımlarında eklenen `console.log`'ları takip edin.
*/
console.log('[data-management.js] Veri yönetimi modülü yükleniyor...');

// Veri Yapıları (Local Storage'dan yüklenecek)
export let students = []; // Tüm öğrenci verileri: { id: "benzersizID", fullName: "Ali Yılmaz", firstName: "Ali", class: "5", subClass: "A", num: 1 }
export let studentAssignments = {}; // Öğrenciye atanan yorumlar: { "Ali Yılmaz": "Yorum metni" }
export let selectedStudent = null; // Şu anda yorum atama tarafında seçili olan öğrenci objesi
export let currentCommentTemplate = null; // Şu anda modalda veya düzenleyicide seçili olan yorum şablonu


export function saveData() {
    console.log('[data-management.js] saveData çağrıldı: Veriler Local Storage\'a kaydediliyor.');
    localStorage.setItem('students', JSON.stringify(students));
    localStorage.setItem('studentAssignments', JSON.stringify(studentAssignments));

    // Yeni header select'lerini kullanıyoruz
    localStorage.setItem('selectedClass', headerClassSelect.value);
    localStorage.setItem('selectedTerm', headerTermSelect.value);
    localStorage.setItem('autoClearChecked', autoClearCommentCheckbox.checked);

    // Artık sekme butonu olmadığı için 'activeTab' kaydetmiyoruz.
    // Sekme filtreleri için yeni ID'leri kullanıyoruz.
    localStorage.setItem('studentListClassFilter', studentListClassFilter.value);
    localStorage.setItem('studentListSubClassFilter', studentListSubClassFilter.value);
    localStorage.setItem('managementClassFilterModal', managementClassFilterModal.value);
    localStorage.setItem('managementSubClassFilterModal', managementSubClassFilterModal.value);

    if (selectedStudent) {
        localStorage.setItem('selectedStudentId', selectedStudent.id);
        console.log(`[data-management.js] Seçili öğrenci ID'si kaydedildi: ${selectedStudent.id}`);
    } else {
        localStorage.removeItem('selectedStudentId');
        console.log('[data-management.js] Seçili öğrenci yok, ID kaldırıldı.');
    }
    showToast('Veriler otomatik kaydedildi.', 'info');
    console.log('[data-management.js] Veriler Local Storage\'a başarıyla kaydedildi.');
}

export function loadData() {
    console.log('[data-management.js] loadData çağrıldı: Veriler Local Storage\'dan yükleniyor.');
    const savedStudents = localStorage.getItem('students');
    if (savedStudents) {
        students = JSON.parse(savedStudents);
        console.log(`[data-management.js] Öğrenciler yüklendi: ${students.length} adet.`);
    }

    const savedAssignments = localStorage.getItem('studentAssignments');
    if (savedAssignments) {
        studentAssignments = JSON.parse(savedAssignments);
        console.log(`[data-management.js] Yorum atamaları yüklendi: ${Object.keys(studentAssignments).length} adet.`);
    }

    // Array veya Object boşsa varsayılan değerleri ata
    if (!students || !Array.isArray(students)) {
        students = [];
        console.warn('[data-management.js] students array boş veya geçersiz. Sıfırlandı.');
    }
    if (!studentAssignments || typeof studentAssignments !== 'object') {
        studentAssignments = {};
        console.warn('[data-management.js] studentAssignments object boş veya geçersiz. Sıfırlandı.');
    }

    // Eski kayıtlarda `subClass` veya `firstName` yoksa ekle/düzelt
    students.forEach(s => {
        if (!s.firstName) {
            s.firstName = getFirstName(s.fullName);
            console.log(`[data-management.js] Öğrenci ${s.fullName} için firstName eklendi.`);
        }
        if (!s.subClass) {
            s.subClass = 'A'; // Varsayılan şube
            console.log(`[data-management.js] Öğrenci ${s.fullName} için subClass varsayılan 'A' olarak atandı.`);
        }
    });
    reassignStudentNumbers(); // Öğrenci numaralarını yeniden ata

    // Yeni header select'lerinin değerlerini yükle
    const savedClass = localStorage.getItem('selectedClass');
    const savedTerm = localStorage.getItem('selectedTerm');
    if (savedClass && headerClassSelect) {
        headerClassSelect.value = savedClass;
        console.log(`[data-management.js] Yüklendi: selectedClass = ${savedClass}`);
    }
    if (savedTerm && headerTermSelect) {
        headerTermSelect.value = savedTerm;
        console.log(`[data-management.js] Yüklendi: selectedTerm = ${savedTerm}`);
    }

    const autoClearChecked = localStorage.getItem('autoClearChecked');
    if (autoClearChecked !== null && autoClearCommentCheckbox) {
        autoClearCommentCheckbox.checked = JSON.parse(autoClearChecked);
        console.log(`[data-management.js] Yüklendi: autoClearChecked = ${autoClearCommentCheckbox.checked}`);
    }

    // Filtreleri yükle
    const savedStudentListClassFilter = localStorage.getItem('studentListClassFilter');
    if (savedStudentListClassFilter && studentListClassFilter) {
        studentListClassFilter.value = savedStudentListClassFilter;
        console.log(`[data-management.js] Yüklendi: studentListClassFilter = ${savedStudentListClassFilter}`);
    }
    const savedStudentListSubClassFilter = localStorage.getItem('studentListSubClassFilter');
    if (savedStudentListSubClassFilter && studentListSubClassFilter) {
        studentListSubClassFilter.value = savedStudentListSubClassFilter;
        console.log(`[data-management.js] Yüklendi: studentListSubClassFilter = ${savedStudentListSubClassFilter}`);
    }
    const savedManagementClassFilterModal = localStorage.getItem('managementClassFilterModal');
    if (savedManagementClassFilterModal && managementClassFilterModal) {
        managementClassFilterModal.value = savedManagementClassFilterModal;
        console.log(`[data-management.js] Yüklendi: managementClassFilterModal = ${savedManagementClassFilterModal}`);
    }
    const savedManagementSubClassFilterModal = localStorage.getItem('managementSubClassFilterModal');
    if (savedManagementSubClassFilterModal && managementSubClassFilterModal) {
        managementSubClassFilterModal.value = savedManagementSubClassFilterModal;
        console.log(`[data-management.js] Yüklendi: managementSubClassFilterModal = ${savedManagementSubClassFilterModal}`);
    }

    // Seçili öğrenciyi yükle
    const savedSelectedStudentId = localStorage.getItem('selectedStudentId');
    if (savedSelectedStudentId) {
        selectedStudent = students.find(s => s.id === savedSelectedStudentId);
        if (selectedStudent) {
            console.log(`[data-management.js] Seçili öğrenci yüklendi: ${selectedStudent.fullName}`);
            // UI elementlerini burada güncellemiyoruz, ilgili modül (comments-tab) halledecek.
        } else {
            selectedStudent = null;
            localStorage.removeItem('selectedStudentId');
            console.warn('[data-management.js] Kayıtlı seçili öğrenci ID\'si bulunamadı, sıfırlandı.');
        }
    } else {
        selectedStudent = null;
        console.log('[data-management.js] Seçili öğrenci ID\'si Local Storage\'da yok.');
    }
    console.log('[data-management.js] Veriler Local Storage\'dan başarıyla yüklendi.');
}

// Öğrenci numaralarını sınıf ve şubeye göre yeniden atayan yardımcı fonksiyon
export function reassignStudentNumbers() {
    console.log('[data-management.js] reassignStudentNumbers çağrıldı: Öğrenci numaraları yeniden atanıyor.');
    const classSubClassCombinations = [...new Set(students.map(s => `${s.class}-${s.subClass}`))].sort();

    classSubClassCombinations.forEach(combo => {
        const [cls, subCls] = combo.split('-');
        let currentNum = 1;
        students.filter(s => s.class === cls && s.subClass === subCls)
                .sort((a, b) => a.fullName.localeCompare(b.fullName)) // İsimlere göre sıralama eklendi
                .forEach(student => {
                    if (student.num !== currentNum) { // Sadece değişirse logla
                        console.log(`[data-management.js] Öğrenci ${student.fullName} (${student.class}${student.subClass}) numara güncellendi: ${student.num} -> ${currentNum}`);
                    }
                    student.num = currentNum++;
                });
    });
    console.log('[data-management.js] Öğrenci numaraları yeniden atama tamamlandı.');
}

export function setSelectedStudent(student) {
    console.log(`[data-management.js] setSelectedStudent çağrıldı: ${student ? student.fullName : 'null'}`);
    selectedStudent = student;
    saveData(); // Seçili öğrenci değiştiğinde kaydet
}

export function setCurrentCommentTemplate(template) {
    console.log(`[data-management.js] setCurrentCommentTemplate çağrıldı: ${template ? template.title : 'null'}`);
    currentCommentTemplate = template;
}

console.log('[data-management.js] Veri yönetimi modülü başarıyla yüklendi.');