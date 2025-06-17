// js/data-management.js

import { showToast, getFirstName } from './utils.js';
import {
    headerClassSelect, headerTermSelect, autoClearCommentCheckbox,
    studentListClassFilter, studentListSubClassFilter,
    managementClassFilterModal, managementSubClassFilterModal
} from './ui-elements.js';

console.log('[data-management.js] Veri yönetimi modülü yükleniyor...');

// Uygulamanın ana veri yapıları
export let students = []; // Tüm öğrencilerin listesi
export let studentAssignments = {}; // Öğrenci yorum eşleşmeleri
export let selectedStudent = null; // Şu an seçili olan öğrenci
export let currentCommentTemplate = null; // Şu an seçili olan yorum şablonu

/**
 * Tüm uygulama verilerini tarayıcının yerel deposuna (localStorage) kaydeder.
 */
export function saveData() {
    console.log('[data-management.js] saveData çağrıldı: Veriler Local Storage\'a kaydediliyor.');
    // İYİLEŞTİRME: localStorage işlemleri, depolama doluysa veya erişim engellenirse
    // hata verebilir. Bu nedenle try-catch bloğu içine alındı.
    try {
        localStorage.setItem('students', JSON.stringify(students));
        localStorage.setItem('studentAssignments', JSON.stringify(studentAssignments));
        localStorage.setItem('selectedClass', headerClassSelect.value);
        localStorage.setItem('selectedTerm', headerTermSelect.value);
        localStorage.setItem('autoClearChecked', autoClearCommentCheckbox.checked);
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
        showToast('Veriler kaydedilirken bir hata oluştu! Tarayıcı depolamanız dolu olabilir.', 'error');
    }
}

/**
 * Uygulama verilerini localStorage'dan yükler.
 * Hatalı veya bozuk veriye karşı koruma içerir.
 */
export function loadData() {
    console.log('[data-management.js] loadData çağrıldı: Veriler Local Storage\'dan yükleniyor.');
    
    try {
        const savedStudents = localStorage.getItem('students');
        if (savedStudents) {
            // İYİLEŞTİRME: Verinin bir dizi olduğundan emin ol
            const parsedStudents = JSON.parse(savedStudents);
            students = Array.isArray(parsedStudents) ? parsedStudents : [];
        }

        const savedAssignments = localStorage.getItem('studentAssignments');
        if (savedAssignments) {
            // İYİLEŞTİRME: Verinin bir nesne olduğundan emin ol
            const parsedAssignments = JSON.parse(savedAssignments);
            studentAssignments = typeof parsedAssignments === 'object' && parsedAssignments !== null ? parsedAssignments : {};
        }
    } catch (error) {
        console.error('[data-management.js] Local Storage\'dan veri yüklenirken JSON parse hatası:', error);
        showToast('Kaydedilmiş veriler yüklenemedi, varsayılana dönülüyor.', 'error');
        students = [];
        studentAssignments = {};
    }

    // Eski kayıtlarda eksik olabilecek alanlar için veri bütünlüğünü sağla
    students.forEach(s => {
        if (!s.firstName) s.firstName = getFirstName(s.fullName);
        if (!s.subClass) s.subClass = 'A'; // Varsayılan şube
        if (!s.id) s.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    });
    reassignStudentNumbers();

    // UI Ayarlarını yükle
    headerClassSelect.value = localStorage.getItem('selectedClass') || '';
    headerTermSelect.value = localStorage.getItem('selectedTerm') || '';
    autoClearCommentCheckbox.checked = JSON.parse(localStorage.getItem('autoClearChecked') || 'false');
    studentListClassFilter.value = localStorage.getItem('studentListClassFilter') || 'all';
    studentListSubClassFilter.value = localStorage.getItem('studentListSubClassFilter') || 'all';
    managementClassFilterModal.value = localStorage.getItem('managementClassFilterModal') || 'all';
    managementSubClassFilterModal.value = localStorage.getItem('managementSubClassFilterModal') || 'all';

    // Seçili öğrenciyi yükle
    const savedSelectedStudentId = localStorage.getItem('selectedStudentId');
    if (savedSelectedStudentId) {
        selectedStudent = students.find(s => s.id === savedSelectedStudentId) || null;
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
                .sort((a, b) => a.fullName.localeCompare(b.fullName, 'tr', { sensitivity: 'base' }))
                .forEach(student => {
                    student.num = currentNum++;
                });
    });
    console.log('[data-management.js] Öğrenci numaraları yeniden atama tamamlandı.');
}

export function setSelectedStudent(student) {
    selectedStudent = student;
    saveData();
}

export function setCurrentCommentTemplate(template) {
    currentCommentTemplate = template;
}