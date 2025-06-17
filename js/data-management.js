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

// Uygulamanın ana veri yapıları (Local Storage'dan yüklenecek)
export let students = []; // Tüm öğrenci verileri: { id: "benzersizID", fullName: "Ali Yılmaz", firstName: "Ali", class: "5", subClass: "A", num: 1 }
export let studentAssignments = {}; // Öğrenciye atanan yorumlar: { "Ali Yılmaz": "Yorum metni" }
export let selectedStudent = null; // Şu anda yorum atama tarafında seçili olan öğrenci objesi
export let currentCommentTemplate = null; // Şu anda modalda veya düzenleyicide seçili olan yorum şablonu


/**
 * Tüm uygulama verilerini ve kullanıcı ayarlarını tarayıcının yerel deposuna (localStorage) kaydeder.
 * Depolama doluysa veya erişim engellenirse hata yakalamak için try-catch bloğu kullanır.
 */
export function saveData() {
    console.log('[data-management.js] saveData çağrıldı: Veriler Local Storage\'a kaydediliyor.');
    try {
        localStorage.setItem('students', JSON.stringify(students));
        localStorage.setItem('studentAssignments', JSON.stringify(studentAssignments));

        if (headerClassSelect) localStorage.setItem('selectedClass', headerClassSelect.value);
        if (headerTermSelect) localStorage.setItem('selectedTerm', headerTermSelect.value);
        if (autoClearCommentCheckbox) localStorage.setItem('autoClearChecked', autoClearCommentCheckbox.checked);
        if (studentListClassFilter) localStorage.setItem('studentListClassFilter', studentListClassFilter.value);
        if (studentListSubClassFilter) localStorage.setItem('studentListSubClassFilter', studentListSubClassFilter.value);
        if (managementClassFilterModal) localStorage.setItem('managementClassFilterModal', managementClassFilterModal.value);
        if (managementSubClassFilterModal) localStorage.setItem('managementSubClassFilterModal', managementSubClassFilterModal.value);

        if (selectedStudent) {
            localStorage.setItem('selectedStudentId', selectedStudent.id);
        } else {
            localStorage.removeItem('selectedStudentId');
        }
        console.log('[data-management.js] Veriler Local Storage\'a başarıyla kaydedildi.');
    } catch (error) {
        console.error('[data-management.js] Verileri Local Storage\'a kaydederken hata oluştu:', error);
        showToast('Veriler kaydedilirken bir hata oluştu! Tarayıcı depolamanız dolu olabilir.', 'error');
    }
}

/**
 * Uygulama verilerini localStorage'dan yükler.
 * Hatalı veya bozuk veriye karşı koruma içerir. Her veri parçası ayrı ayrı yüklenir.
 */
export function loadData() {
    console.log('[data-management.js] loadData çağrıldı: Veriler Local Storage\'dan yükleniyor.');
    
    // İYİLEŞTİRME: Her bir veri parçası için ayrı try-catch bloğu.
    try {
        const savedStudents = localStorage.getItem('students');
        if (savedStudents) {
            const parsedStudents = JSON.parse(savedStudents);
            students = Array.isArray(parsedStudents) ? parsedStudents : [];
        }
    } catch (error) {
        console.error('[data-management.js] Kayıtlı öğrenci verisi yüklenirken hata oluştu (veri bozuk olabilir):', error);
        students = []; // Hata durumunda veriyi güvenli bir şekilde sıfırla
    }

    try {
        const savedAssignments = localStorage.getItem('studentAssignments');
        if (savedAssignments) {
            const parsedAssignments = JSON.parse(savedAssignments);
            studentAssignments = (typeof parsedAssignments === 'object' && parsedAssignments !== null) ? parsedAssignments : {};
        }
    } catch (error) {
        console.error('[data-management.js] Kayıtlı yorum atamaları yüklenirken hata oluştu (veri bozuk olabilir):', error);
        studentAssignments = {}; // Hata durumunda veriyi güvenli bir şekilde sıfırla
    }

    // Eski kayıtlarda `subClass` veya `firstName` gibi alanlar yoksa ekleyerek veri bütünlüğünü sağla
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
    reassignStudentNumbers();

    // UI Ayarlarını yükle (elemanların varlığını kontrol ederek)
    if (headerClassSelect) headerClassSelect.value = localStorage.getItem('selectedClass') || '';
    if (headerTermSelect) headerTermSelect.value = localStorage.getItem('selectedTerm') || '';
    if (autoClearCommentCheckbox) autoClearCommentCheckbox.checked = JSON.parse(localStorage.getItem('autoClearChecked') || 'false');
    if (studentListClassFilter) studentListClassFilter.value = localStorage.getItem('studentListClassFilter') || 'all';
    if (studentListSubClassFilter) studentListSubClassFilter.value = localStorage.getItem('studentListSubClassFilter') || 'all';
    if (managementClassFilterModal) managementClassFilterModal.value = localStorage.getItem('managementClassFilterModal') || 'all';
    if (managementSubClassFilterModal) managementSubClassFilterModal.value = localStorage.getItem('managementSubClassFilterModal') || 'all';

    // Seçili öğrenciyi yükle
    const savedSelectedStudentId = localStorage.getItem('selectedStudentId');
    if (savedSelectedStudentId) {
        selectedStudent = students.find(s => s.id === savedSelectedStudentId) || null;
    }
    
    console.log('[data-management.js] Veriler Local Storage\'dan yükleme işlemi tamamlandı.');
}

/**
 * Öğrenci numaralarını sınıf ve şubeye göre alfabetik olarak yeniden atar.
 * Bu, yeni öğrenci eklendiğinde veya silindiğinde listenin tutarlı kalmasını sağlar.
 */
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

// Global state'i güncelleyen yardımcı fonksiyonlar
export function setSelectedStudent(student) {
    selectedStudent = student;
    saveData(); // Seçili öğrenci değiştiğinde kaydet
}

export function setCurrentCommentTemplate(template) {
    currentCommentTemplate = template;
}

console.log('[data-management.js] Veri yönetimi modülü başarıyla yüklendi.');