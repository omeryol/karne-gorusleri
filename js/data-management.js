// js/data-management.js

import { showToast, getFirstName } from './utils.js';
import {
    headerClassSelect, headerTermSelect, autoClearCommentCheckbox,
    studentListClassFilter, studentListSubClassFilter,
    managementClassFilterModal, managementSubClassFilterModal
} from './ui-elements.js';

/*
    Hata Ayıklama Notu:
    Bu dosya, uygulamanın tüm önemli verilerini (öğrenciler, yorum atamaları) Local Storage'a kaydeder ve buradan yükler.
    loadData fonksiyonundaki JSON.parse işlemleri, bozuk veriye karşı uygulamayı korumak için try-catch blokları içine alınmıştır.
*/
console.log('[data-management.js] Veri yönetimi modülü yükleniyor...');

// Veri Yapıları (Local Storage'dan yüklenecek)
export let students = []; // Tüm öğrenci verileri: { id: "benzersizID", fullName: "Ali Yılmaz", firstName: "Ali", class: "5", subClass: "A", num: 1 }
export let studentAssignments = {}; // Öğrenciye atanan yorumlar: { "Ali Yılmaz": "Yorum metni" }
export let selectedStudent = null; // Şu anda yorum atama tarafında seçili olan öğrenci objesi
export let currentCommentTemplate = null; // Şu anda modalda veya düzenleyicide seçili olan yorum şablonu


export function saveData() {
    console.log('[data-management.js] saveData çağrıldı: Veriler Local Storage\'a kaydediliyor.');
    try {
        localStorage.setItem('students', JSON.stringify(students));
        localStorage.setItem('studentAssignments', JSON.stringify(studentAssignments));

        // Yeni header select'lerini kullanıyoruz
        localStorage.setItem('selectedClass', headerClassSelect.value);
        localStorage.setItem('selectedTerm', headerTermSelect.value);
        localStorage.setItem('autoClearChecked', autoClearCommentCheckbox.checked);

        // Sekme filtreleri için yeni ID'leri kullanıyoruz.
        localStorage.setItem('studentListClassFilter', studentListClassFilter.value);
        localStorage.setItem('studentListSubClassFilter', studentListSubClassFilter.value);
        localStorage.setItem('managementClassFilterModal', managementClassFilterModal.value);
        localStorage.setItem('managementSubClassFilterModal', managementSubClassFilterModal.value);

        if (selectedStudent) {
            localStorage.setItem('selectedStudentId', selectedStudent.id);
        } else {
            localStorage.removeItem('selectedStudentId');
        }
        console.log('[data-management.js] Veriler Local Storage\'a başarıyla kaydedildi.');
    } catch (error) {
        console.error('[data-management.js] Verileri Local Storage\'a kaydederken hata oluştu:', error);
        showToast('Veriler kaydedilirken bir hata oluştu!', 'error');
    }
}

export function loadData() {
    console.log('[data-management.js] loadData çağrıldı: Veriler Local Storage\'dan yükleniyor.');
    
    try {
        const savedStudents = localStorage.getItem('students');
        if (savedStudents) {
            students = JSON.parse(savedStudents);
        }

        const savedAssignments = localStorage.getItem('studentAssignments');
        if (savedAssignments) {
            studentAssignments = JSON.parse(savedAssignments);
        }
    } catch (error) {
        console.error('[data-management.js] Local Storage\'dan veri yüklenirken JSON parse hatası:', error);
        showToast('Kaydedilmiş veriler yüklenemedi, sıfırlanıyor.', 'error');
        // Hata durumunda verileri sıfırla
        students = [];
        studentAssignments = {};
    }


    // Array veya Object boşsa varsayılan değerleri ata
    if (!Array.isArray(students)) {
        students = [];
        console.warn('[data-management.js] students array geçersiz. Sıfırlandı.');
    }
    if (typeof studentAssignments !== 'object' || studentAssignments === null) {
        studentAssignments = {};
        console.warn('[data-management.js] studentAssignments object geçersiz. Sıfırlandı.');
    }

    // Eski kayıtlarda `subClass` veya `firstName` yoksa ekle/düzelt
    students.forEach(s => {
        if (!s.firstName) {
            s.firstName = getFirstName(s.fullName);
        }
        if (!s.subClass) {
            s.subClass = 'A'; // Varsayılan şube
        }
        if (!s.id) {
            s.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 9); // Eksik ID'ler için yeni ID oluştur
        }
    });
    reassignStudentNumbers(); // Öğrenci numaralarını yeniden ata

    // UI Ayarlarını yükle
    const savedClass = localStorage.getItem('selectedClass');
    const savedTerm = localStorage.getItem('selectedTerm');
    if (savedClass && headerClassSelect) headerClassSelect.value = savedClass;
    if (savedTerm && headerTermSelect) headerTermSelect.value = savedTerm;

    const autoClearChecked = localStorage.getItem('autoClearChecked');
    if (autoClearChecked !== null && autoClearCommentCheckbox) {
        autoClearCommentCheckbox.checked = JSON.parse(autoClearChecked);
    }

    // Filtreleri yükle
    const savedStudentListClassFilter = localStorage.getItem('studentListClassFilter');
    if (savedStudentListClassFilter && studentListClassFilter) studentListClassFilter.value = savedStudentListClassFilter;
    
    const savedStudentListSubClassFilter = localStorage.getItem('studentListSubClassFilter');
    if (savedStudentListSubClassFilter && studentListSubClassFilter) studentListSubClassFilter.value = savedStudentListSubClassFilter;

    const savedManagementClassFilterModal = localStorage.getItem('managementClassFilterModal');
    if (savedManagementClassFilterModal && managementClassFilterModal) managementClassFilterModal.value = savedManagementClassFilterModal;

    const savedManagementSubClassFilterModal = localStorage.getItem('managementSubClassFilterModal');
    if (savedManagementSubClassFilterModal && managementSubClassFilterModal) managementSubClassFilterModal.value = savedManagementSubClassFilterModal;

    // Seçili öğrenciyi yükle
    const savedSelectedStudentId = localStorage.getItem('selectedStudentId');
    if (savedSelectedStudentId) {
        selectedStudent = students.find(s => s.id === savedSelectedStudentId) || null;
        if (!selectedStudent) {
            localStorage.removeItem('selectedStudentId');
            console.warn('[data-management.js] Kayıtlı seçili öğrenci ID\'si bulunamadı, sıfırlandı.');
        }
    } else {
        selectedStudent = null;
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
                .sort((a, b) => a.fullName.localeCompare(b.fullName, 'tr', { sensitivity: 'base' })) // Türkçe karakterlere duyarlı sıralama
                .forEach(student => {
                    student.num = currentNum++;
                });
    });
    console.log('[data-management.js] Öğrenci numaraları yeniden atama tamamlandı.');
}

export function setSelectedStudent(student) {
    selectedStudent = student;
    saveData(); // Seçili öğrenci değiştiğinde kaydet
}

export function setCurrentCommentTemplate(template) {
    currentCommentTemplate = template;
}

console.log('[data-management.js] Veri yönetimi modülü başarıyla yüklendi.');