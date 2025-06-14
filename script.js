// script.js

// commentsData objesi 'comment_templates_data.js' dosyasından global olarak yüklenecektir.

// UI Elementlerini Seçme
// Genel Navigasyon
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// Dashboard Elements
const totalStudentsCountSpan = document.getElementById('total-students-count');
const assignedCommentsCountSpan = document.getElementById('assigned-comments-count');
const pendingCommentsCountSpan = document.getElementById('pending-comments-count');
const completionRateSpan = document.getElementById('completion-rate');

// Comments Tab (Yorum Atama)
const sidebarClassFilter = document.getElementById('sidebar-class-filter'); 
const sidebarSubClassFilter = document.getElementById('sidebar-subclass-filter'); 
const studentSearchInput = document.getElementById('student-search-input'); 
const selectedStudentNameDisplay = document.getElementById('selected-student-name-display'); 

const classSelect = document.getElementById('class-select');
const termSelect = document.getElementById('term-select');
const profileSearchInput = document.getElementById('profile-search-input');
const profileList = document.getElementById('profile-list');
const commentTextarea = document.getElementById('comment-textarea');
const remainingCharsSpan = document.getElementById('remaining-chars');
const copyCommentBtn = document.getElementById('copy-comment-btn');
const clearCommentEditorBtn = document.getElementById('clear-comment-editor-btn');
const autoClearCommentCheckbox = document.getElementById('auto-clear-comment');
const studentListDiv = document.getElementById('student-list'); 
const viewAllAssignmentsBtn = document.getElementById('view-all-assignments-btn');
const appContainer = document.getElementById('app-container');

// Student Management Tab (Öğrenci Yönetimi)
const studentNamesTextarea = document.getElementById('student-names-textarea');
const newStudentClassSelect = document.getElementById('new-student-class-select'); 
const newStudentSubClassSelect = document.getElementById('new-student-subclass-select'); 
const loadNamesFromTextBtn = document.getElementById('load-names-from-text-btn');
const studentListUpload = document.getElementById('student-list-upload');
const clearAllStudentsBtn = document.getElementById('clear-all-students-btn'); 
const managementClassFilter = document.getElementById('management-class-filter'); 
const managementSubClassFilter = document.getElementById('management-subclass-filter'); 
const managementStudentSearchInput = document.getElementById('management-student-search-input'); 
const managedStudentListDiv = document.getElementById('managed-student-list'); 

// Bildirim alanı
const toastContainer = document.getElementById('toast-container'); 

// Veri Yapıları (Local Storage'dan yüklenecek)
let students = []; // Tüm öğrenci verileri: { id: "benzersizID", fullName: "Ali Yılmaz", firstName: "Ali", class: "5", subClass: "A", num: 1 }
let studentAssignments = {}; // Öğrenciye atanan yorumlar: { "Ali Yılmaz": "Yorum metni" }
let selectedStudent = null; // Şu anda yorum atama tarafında seçili olan öğrenci objesi

// --- Yardımcı Fonksiyonlar ---

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = message;
    
    if (type === 'success') {
        toast.style.backgroundColor = '#28a745'; 
    } else if (type === 'error') {
        toast.style.backgroundColor = '#dc3545'; 
    } else {
        toast.style.backgroundColor = '#333'; 
    }

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => toast.remove());
    }, 3000); 
}

function getFirstName(fullName) {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');
    return parts[0]; 
}

function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9); 
}

// --- Ana Uygulama Mantığı Fonksiyonları ---

// Dashboard kartlarını güncelleyen fonksiyon
function updateDashboardCards() {
    const totalStudents = students.length;
    const assignedComments = Object.values(studentAssignments).filter(comment => comment !== '').length;
    const pendingComments = totalStudents - assignedComments;
    const completionRate = totalStudents > 0 ? ((assignedComments / totalStudents) * 100).toFixed(0) : 0;

    totalStudentsCountSpan.textContent = totalStudents;
    assignedCommentsCountSpan.textContent = assignedComments;
    pendingCommentsCountSpan.textContent = pendingComments;
    completionRateSpan.textContent = `${completionRate}%`;
}


// Yorum düzenleme alanındaki yorumu seçer ve aktif stili ayarlar
function selectCommentProfile(commentText, clickedElement) {
    commentTextarea.value = commentText;
    updateCharCount();

    const currentActive = profileList.querySelector('.profile-item.active');
    if (currentActive) {
        currentActive.classList.remove('active');
    }
    if (clickedElement) {
        clickedElement.classList.add('active');
    }
}

// Yorum düzenleme alanını temizler
function clearCommentEditor() {
    commentTextarea.value = '';
    updateCharCount();
    const currentActive = profileList.querySelector('.profile-item.active');
    if (currentActive) {
        currentActive.classList.remove('active');
    }
    showToast('Yorum alanı temizlendi.', 'info');
}

// Öğrenciye yorum atama işlemini gerçekleştirir
function assignCommentToStudent(event) {
    const targetButton = event.target.closest('.assign-btn');
    if (!targetButton) return;

    if (!selectedStudent) {
        showToast('Lütfen önce sol listeden bir öğrenci seçin.', 'error');
        return;
    }

    let comment = commentTextarea.value.trim();

    if (comment.length === 0) {
        showToast('Lütfen önce bir yorum seçin veya yazın.', 'error');
        return;
    }

    // Yorumdaki [Öğrenci Adı] yer tutucusunu öğrencinin sadece adıyla değiştir
    comment = comment.replace(/\[Öğrenci Adı\]/g, selectedStudent.firstName);

    studentAssignments[selectedStudent.fullName] = comment;
    showToast(`${selectedStudent.fullName} öğrencisine yorum atandı/güncellendi.`, 'success');
    saveData();
    loadStudentListForAssignment(); 
    updateDashboardCards(); 

    if (autoClearCommentCheckbox.checked) {
        clearCommentEditor();
        selectedStudent = null; 
        selectedStudentNameDisplay.textContent = 'Yok';
    }
}

// Sekme değiştirme
function switchTab(tabId) {
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });

    document.getElementById(tabId).classList.add('active');
    document.querySelector(`.tab-button[data-tab="${tabId.replace('-tab', '')}"]`).classList.add('active');

    if (tabId === 'comments-tab') {
        loadStudentListForAssignment(); 
        loadCommentTemplates(); 
    } else if (tabId === 'student-management-tab') {
        updateManagedStudentListUI(); 
    }
    saveData(); 
    updateDashboardCards(); 
}

// Yorum atama sekmesindeki öğrenci listesini yükleme/filtreleme
function loadStudentListForAssignment() {
    const filterClass = sidebarClassFilter.value;
    const filterSubClass = sidebarSubClassFilter.value; 
    const searchTerm = studentSearchInput.value.toLowerCase();

    studentListDiv.innerHTML = ''; 

    const filteredStudents = students.filter(student => {
        const matchesClass = filterClass === 'all' || student.class === filterClass;
        const matchesSubClass = filterSubClass === 'all' || student.subClass === filterSubClass; 
        const matchesSearch = student.fullName.toLowerCase().includes(searchTerm) ||
                              student.firstName.toLowerCase().includes(searchTerm);
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
        selectedStudent = null;
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
                <span class="student-full-name">${student.fullName} (${student.class}${student.subClass})</span> </span>
            <span class="student-comment-preview">${previewText}</span>
            <button class="assign-btn" data-student-name="${student.fullName}">${buttonText}</button>
        `;
        
        studentListDiv.appendChild(studentItem);
    });

    if (selectedStudent && students.some(s => s.id === selectedStudent.id)) { 
        const activeItem = studentListDiv.querySelector(`.student-item[data-id="${selectedStudent.id}"]`);
        if (activeItem) {
            activeItem.classList.add('active-student');
            selectedStudentNameDisplay.textContent = `${selectedStudent.fullName} (${selectedStudent.class}${selectedStudent.subClass}. Sınıf)`; 
        } else { 
             selectedStudentNameDisplay.textContent = 'Yok';
             selectedStudent = null;
        }
    } else {
        selectedStudentNameDisplay.textContent = 'Yok';
        selectedStudent = null;
    }
}

// Yorum profillerini yükleme/filtreleme
function loadCommentTemplates() {
    const selectedClass = classSelect.value;
    const selectedTerm = termSelect.value;
    const searchTerm = profileSearchInput.value.toLowerCase();

    profileList.innerHTML = ''; 

    if (typeof commentsData !== 'undefined' && commentsData[selectedClass] && commentsData[selectedClass][selectedTerm]) {
        const templates = commentsData[selectedClass][selectedTerm];
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
                    const commentToLoad = selectedStudent ? template.comment.replace(/\[Öğrenci Adı\]/g, selectedStudent.firstName) : template.comment;
                    selectCommentProfile(commentToLoad, profileItem);
                });
                profileList.appendChild(profileItem);
            });
        }
    } else {
        profileList.innerHTML = '<p>Lütfen sınıf ve dönem seçin.</p>';
    }
}

function updateCharCount() {
    const currentLength = commentTextarea.value.length;
    const remaining = 500 - currentLength;
    remainingCharsSpan.textContent = remaining;
    if (remaining < 0) {
        remainingCharsSpan.style.color = 'red';
    } else {
        remainingCharsSpan.style.color = '#666';
    }
}

function copyCommentToClipboard() {
    commentTextarea.select(); 
    document.execCommand('copy'); 
    showToast('Yorum panoya kopyalandı!', 'success');
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
        showToast(`${addedCount} öğrenci listeye eklendi!`, 'success');
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

// Öğrenci numaralarını sınıf ve şubeye göre yeniden atayan yardımcı fonksiyon
function reassignStudentNumbers() {
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

// Yorum atama tarafındaki öğrenci listesinde bir öğrenciye tıklandığında (event delegation)
function handleStudentClickInAssignmentList(event) {
    const studentItem = event.target.closest('.student-item');
    if (!studentItem) return;

    if (!event.target.closest('.assign-btn')) {
        selectStudentForAssignmentItem(studentItem); 
    } else { 
        assignCommentToStudent(event);
    }
}

// Öğrenciyi seçme fonksiyonu (studentItemElement parametresi alıyor)
function selectStudentForAssignmentItem(studentItemElement) {
    const previouslySelected = studentListDiv.querySelector('.student-item.active-student');
    if (previouslySelected) {
        previouslySelected.classList.remove('active-student');
    }

    studentItemElement.classList.add('active-student');
    const studentId = studentItemElement.dataset.id;
    selectedStudent = students.find(s => s.id === studentId);

    if (selectedStudent) {
        selectedStudentNameDisplay.textContent = `${selectedStudent.fullName} (${selectedStudent.class}${selectedStudent.subClass}. Sınıf)`; 
        
        const currentCommentValue = commentTextarea.value;
        let isTemplateComment = false;
        if (commentsData) { 
            for (const classKey in commentsData) {
                for (const termKey in commentsData[classKey]) {
                    if (commentsData[classKey][termKey].some(t => t.comment === currentCommentValue)) {
                        isTemplateComment = true;
                        break;
                    }
                }
                if (isTemplateComment) break;
            }
        }
       
        if (isTemplateComment) { 
            commentTextarea.value = currentCommentValue.replace(/\[Öğrenci Adı\]/g, selectedStudent.firstName);
        } else if (studentAssignments[selectedStudent.fullName]) { 
            commentTextarea.value = studentAssignments[selectedStudent.fullName].replace(/\[Öğrenci Adı\]/g, selectedStudent.firstName);
        } else { 
            commentTextarea.value = ''; 
        }
        updateCharCount();
    } else {
        selectedStudentNameDisplay.textContent = 'Yok';
        commentTextarea.value = ''; 
        updateCharCount();
    }
}

// Atanan tüm yorumları görüntüleme (yeni pencerede)
function viewAllAssignments() {
    let output = `
        <!DOCTYPE html>
        <html lang="tr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Atanan Karne Yorumları</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #4CAF50; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
                .student-entry { margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed #ccc; }
                .student-entry:last-child { border-bottom: none; }
                h2 { margin-top: 0; margin-bottom: 5px; color: #333; font-size: 1.2em; }
                p { margin-top: 5px; color: #555; line-height: 1.5; white-space: pre-wrap; }
            </style>
        </head>
        <body>
            <h1>Atanan Karne Yorumları Listesi</h1>
    `;

    const sortedStudentsWithComments = students.filter(student => studentAssignments[student.fullName])
                                               .sort((a, b) => a.class.localeCompare(b.class) || a.subClass.localeCompare(b.subClass) || a.num - b.num); 


    if (sortedStudentsWithComments.length === 0) {
        output += '<p>Henüz hiçbir öğrenciye yorum atanmadı.</p>';
    } else {
        sortedStudentsWithComments.forEach(student => {
            const assignedComment = studentAssignments[student.fullName];
            output += `
                <div class="student-entry">
                    <h2>${student.fullName} (${student.class}${student.subClass}. Sınıf - No: ${student.num})</h2> 
                    <p>${assignedComment}</p>
                </div>
            `;
        });
    }

    output += `
        </body>
        </html>
    `;

    const newWindow = window.open('', '_blank');
    newWindow.document.write(output);
    newWindow.document.close();
}


function updateThemeColors() {
    const selectedClass = classSelect.value;
    const selectedTerm = termSelect.value;

    document.body.className = '';

    if (selectedClass && selectedTerm) {
        document.body.classList.add(`class-${selectedClass}-term-${selectedTerm}`);
    }
}

function saveData() {
    localStorage.setItem('students', JSON.stringify(students));
    localStorage.setItem('studentAssignments', JSON.stringify(studentAssignments));
    localStorage.setItem('selectedClass', classSelect.value);
    localStorage.setItem('selectedTerm', termSelect.value);
    localStorage.setItem('autoClearChecked', autoClearCommentCheckbox.checked);
    localStorage.setItem('activeTab', document.querySelector('.tab-button.active').dataset.tab); 
    
    localStorage.setItem('sidebarClassFilter', sidebarClassFilter.value);
    localStorage.setItem('sidebarSubClassFilter', sidebarSubClassFilter.value);
    localStorage.setItem('managementClassFilter', managementClassFilter.value);
    localStorage.setItem('managementSubClassFilter', managementSubClassFilter.value);

    if (selectedStudent) {
        localStorage.setItem('selectedStudentId', selectedStudent.id);
    } else {
        localStorage.removeItem('selectedStudentId');
    }
}

function loadData() {
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


    const activeTab = localStorage.getItem('activeTab');
    if (activeTab) {
        switchTab(activeTab + '-tab'); 
    } else {
        switchTab('comments-tab'); // Varsayılan sekme
    }

    const savedSelectedStudentId = localStorage.getItem('selectedStudentId');
    if (savedSelectedStudentId) {
        selectedStudent = students.find(s => s.id === savedSelectedStudentId);
    } else {
        selectedStudent = null;
    }

    updateThemeColors(); 
}

// Öğrenci yönetim sekmesindeki listeyi güncelleme (Silme/Numara Güncelleme için)
function updateManagedStudentListUI() {
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
        loadStudentListForAssignment(); 
        updateDashboardCards(); 

        if (selectedStudent && selectedStudent.id === studentIdToDelete) {
            selectedStudent = null;
            selectedStudentNameDisplay.textContent = 'Yok';
            clearCommentEditor();
        }
    }
}

// Tüm öğrenci verilerini temizle
function clearAllStudentData() {
    if (confirm("Tüm öğrenci listesini ve atanan yorumları SİLMEK istediğinize emin misiniz? Bu işlem geri alınamaz!")) {
        students = [];
        studentAssignments = {};
        selectedStudent = null;
        studentNamesTextarea.value = '';
        studentListUpload.value = '';
        saveData();
        updateManagedStudentListUI();
        loadStudentListForAssignment();
        clearCommentEditor();
        selectedStudentNameDisplay.textContent = 'Yok';
        updateDashboardCards(); 
        showToast("Tüm öğrenci verileri başarıyla temizlendi.", 'success');
    }
}


// --- Event Dinleyicileri ---
// Tab Navigasyon
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        switchTab(button.dataset.tab + '-tab');
    });
});

// Comments Tab Listeners
sidebarClassFilter.addEventListener('change', loadStudentListForAssignment);
sidebarSubClassFilter.addEventListener('change', loadStudentListForAssignment); 
studentSearchInput.addEventListener('input', loadStudentListForAssignment);
studentListDiv.addEventListener('click', handleStudentClickInAssignmentList); 
viewAllAssignmentsBtn.addEventListener('click', viewAllAssignments);

classSelect.addEventListener('change', () => {
    updateThemeColors();
    loadCommentTemplates();
    saveData();
    profileSearchInput.value = ''; 
});
termSelect.addEventListener('change', () => {
    updateThemeColors();
    loadCommentTemplates();
    saveData();
    profileSearchInput.value = ''; 
});
profileSearchInput.addEventListener('input', loadCommentTemplates);

commentTextarea.addEventListener('input', updateCharCount);
copyCommentBtn.addEventListener('click', copyCommentToClipboard);
clearCommentEditorBtn.addEventListener('click', clearCommentEditor); 
autoClearCommentCheckbox.addEventListener('change', saveData); 

// Student Management Tab Listeners
loadNamesFromTextBtn.addEventListener('click', addNewStudentsFromTextarea);
studentListUpload.addEventListener('change', loadStudentListFromFile);
newStudentClassSelect.addEventListener('change', saveData); 
newStudentSubClassSelect.addEventListener('change', saveData); 
clearAllStudentsBtn.addEventListener('click', clearAllStudentData); 
managementClassFilter.addEventListener('change', updateManagedStudentListUI);
managementSubClassFilter.addEventListener('change', updateManagedStudentListUI); 
managementStudentSearchInput.addEventListener('input', updateManagedStudentListUI);
managedStudentListDiv.addEventListener('click', deleteStudent); 


// Uygulama yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    loadData(); 
    updateDashboardCards(); 
});