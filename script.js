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

// Yeni Eklenen UI Elementleri
const filterUnassignedBtn = document.getElementById('filter-unassigned-btn'); // Yorum Bekleyenler Butonu
const prevStudentBtn = document.getElementById('prev-student-btn'); // Önceki Öğrenci Butonu
const nextStudentBtn = document.getElementById('next-student-btn'); // Sonraki Öğrenci Butonu
const assignCommentBtnEditor = document.getElementById('assign-comment-btn-editor'); // Yorum Düzenle altındaki Yorum Ata/Güncelle tuşu


// Yorum Önizleme Modalı
const commentPreviewModal = document.getElementById('comment-preview-modal');
const modalCommentTitle = document.getElementById('modal-comment-title');
const modalCommentText = document.getElementById('modal-comment-text');
const modalCopyBtn = document.getElementById('modal-copy-btn');
const modalSelectBtn = document.getElementById('modal-select-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn'); // Yeni İptal Butonu
const modalPrevCommentBtn = document.getElementById('modal-prev-comment-btn'); // Yeni Önceki Yorum Butonu
const modalNextCommentBtn = document.getElementById('modal-next-comment-btn'); // Yeni Sonraki Yorum Butonu
const modalCloseButtons = document.querySelectorAll('.modal .close-button'); // Tüm modal kapatma butonları

// Kullanım Kılavuzu Modalı (Eski Welcome Modal yerine)
const helpModal = document.getElementById('help-modal'); // welcomeModal yerine helpModal
const openHelpModalBtn = document.getElementById('open-help-modal-btn'); // Yeni yardım butonu
const closeHelpModalBtn = document.getElementById('close-help-modal'); // Yardım modalı kapatma butonu


// Student Management Tab (Öğrenci Yönetimi)
const studentNamesTextarea = document.getElementById('student-names-textarea');
const newStudentClassSelect = document.getElementById('new-student-class-select'); 
const newStudentSubClassSelect = document.getElementById('new-student-subclass-select'); 
const loadNamesFromTextBtn = document.getElementById('load-names-from-text-btn');
const studentListUpload = document.getElementById('student-list-upload');
const clearAllStudentsBtn = document.getElementById('clear-all-students-btn'); 
const clearLocalStorageBtn = document.getElementById('clear-localstorage-btn'); // Yeni Local Storage temizleme tuşu
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
let currentCommentTemplate = null; // Şu anda modalda veya düzenleyicide seçili olan yorum şablonu

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
    // Yorumu atanmış öğrencileri sayarken, boş string atanmış yorumları hariç tut
    const assignedComments = Object.values(studentAssignments).filter(comment => comment && comment.trim() !== '').length;
    const pendingComments = totalStudents - assignedComments;
    const completionRate = totalStudents > 0 ? ((assignedComments / totalStudents) * 100).toFixed(0) : 0;

    totalStudentsCountSpan.textContent = totalStudents;
    assignedCommentsCountSpan.textContent = assignedComments;
    pendingCommentsCountSpan.textContent = pendingComments;
    completionRateSpan.textContent = `${completionRate}%`;
}


// Yorum düzenleme alanındaki yorumu seçer ve aktif stili ayarlar
function selectCommentProfile(commentText, clickedElement, templateId = null) {
    commentTextarea.value = commentText;
    updateCharCount();

    const currentActive = profileList.querySelector('.profile-item.active');
    if (currentActive) {
        currentActive.classList.remove('active');
    }
    // Eğer tıklanan bir element varsa (listeden seçim), onu aktif yap
    if (clickedElement) {
        clickedElement.classList.add('active');
    } else if (templateId) { // Modal üzerinden seçim yapıldığında ilgili profili aktif yap
        const profileItem = profileList.querySelector(`.profile-item[data-id="${templateId}"]`);
        if (profileItem) {
            profileItem.classList.add('active');
            profileItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }


    // Seçilen yorum şablonunu kaydet
    if (templateId) {
        const selectedClass = classSelect.value;
        const selectedTerm = termSelect.value;
        if (commentsData[selectedClass] && commentsData[selectedClass][selectedTerm]) {
            currentCommentTemplate = commentsData[selectedClass][selectedTerm].find(t => t.id === templateId);
        }
    } else {
        currentCommentTemplate = null; // Manuel girilen yorumlar için şablon yok
    }
    
    // Modalı kapat (eğer açıksa)
    commentPreviewModal.style.display = 'none';
}

// Yorum düzenleme alanını temizler
function clearCommentEditor() {
    commentTextarea.value = '';
    updateCharCount();
    const currentActive = profileList.querySelector('.profile-item.active');
    if (currentActive) {
        currentActive.classList.remove('active');
    }
    currentCommentTemplate = null; // Temizlendiğinde şablonu sıfırla
    showToast('Yorum alanı temizlendi.', 'info');
}

// Öğrenciye yorum atama işlemini gerçekleştirir
function assignCommentToStudent() { // Artık event parametresi doğrudan alınmıyor, tıklanan butondan değil
                                     // selectedStudent üzerinden işlem yapılıyor
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
    // Öğrenci listesini ve ilgili butonları güncelleyen satırı çağır
    loadStudentListForAssignment(filterUnassignedBtn.classList.contains('active-filter')); 
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
        loadStudentListForAssignment(filterUnassignedBtn.classList.contains('active-filter')); // Filtre durumunu koru
        loadCommentTemplates(); 
    } else if (tabId === 'student-management-tab') {
        updateManagedStudentListUI(); 
    }
    saveData(); 
    updateDashboardCards(); 
}

// Yorum atama sekmesindeki öğrenci listesini yükleme/filtreleme
function loadStudentListForAssignment(filterUnassigned = false) { // filterUnassigned parametresi eklendi
    const filterClass = sidebarClassFilter.value;
    const filterSubClass = sidebarSubClassFilter.value; 
    const searchTerm = studentSearchInput.value.toLowerCase();

    studentListDiv.innerHTML = ''; 

    const filteredStudents = students.filter(student => {
        const matchesClass = filterClass === 'all' || student.class === filterClass;
        const matchesSubClass = filterSubClass === 'all' || student.subClass === filterSubClass; 
        const matchesSearch = student.fullName.toLowerCase().includes(searchTerm) ||
                              student.firstName.toLowerCase().includes(searchTerm);
        const isAssigned = studentAssignments[student.fullName] && studentAssignments[student.fullName].trim() !== '';
        
        // Eğer filterUnassigned true ise, sadece atanmamışları göster
        if (filterUnassigned) {
            return matchesClass && matchesSubClass && matchesSearch && !isAssigned;
        }
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
            <button class="assign-btn" data-student-id="${student.id}">${buttonText}</button> `;
        
        studentListDiv.appendChild(studentItem);
    });

    // Sayfa yüklendiğinde veya filtre değiştiğinde seçili öğrenciyi vurgula
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
            updateCharCount();
        } else {
            // Seçili öğrenci filtrelenmiş listede yoksa seçimi sıfırla
            selectedStudentNameDisplay.textContent = 'Yok';
            selectedStudent = null;
            clearCommentEditor();
        }
    } else {
        selectedStudentNameDisplay.textContent = 'Yok';
        clearCommentEditor(); // Öğrenci yoksa yorum alanını temizle
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
                    // Yorum modalını aç
                    openCommentPreviewModal(template);
                });
                profileList.appendChild(profileItem);
            });
        }
    } else {
        profileList.innerHTML = '<p>Lütfen sınıf ve dönem seçin.</p>';
    }
}

// Yorum Önizleme Modalını Açma
function openCommentPreviewModal(template) {
    currentCommentTemplate = template; // Seçili şablonu kaydet
    modalCommentTitle.textContent = template.title;
    
    // Eğer öğrenci seçili ise, yorumdaki yer tutucuyu doldur
    if (selectedStudent) {
        modalCommentText.textContent = template.comment.replace(/\[Öğrenci Adı\]/g, selectedStudent.firstName);
    } else {
        modalCommentText.textContent = template.comment;
    }
    commentPreviewModal.style.display = 'flex'; // Modalı flex olarak göster
}

// Yorum Önizleme Modalından Yorumu Kopyala
modalCopyBtn.addEventListener('click', () => {
    const commentToCopy = modalCommentText.textContent;
    navigator.clipboard.writeText(commentToCopy).then(() => {
        showToast('Yorum panoya kopyalandı!', 'success');
        commentPreviewModal.style.display = 'none'; // Modalı kapat
    }).catch(err => {
        console.error('Yorum kopyalanamadı:', err);
        showToast('Yorum kopyalanırken bir hata oluştu.', 'error');
    });
});

// Yorum Önizleme Modalından Yorumu Seç ve Düzenle
modalSelectBtn.addEventListener('click', () => {
    if (currentCommentTemplate) {
        selectCommentProfile(modalCommentText.textContent, null, currentCommentTemplate.id); // Yorumu düzenleyiciye aktar
        commentPreviewModal.style.display = 'none'; // Modalı kapat
    }
});

// Yorum Önizleme Modalından İptal Butonu
modalCancelBtn.addEventListener('click', () => {
    commentPreviewModal.style.display = 'none'; // Modalı kapat
});

// Yorum Önizleme Modalında Sonraki/Önceki Yorum Navigasyonu
function navigateCommentModal(direction) {
    const selectedClass = classSelect.value;
    const selectedTerm = termSelect.value;

    if (!selectedClass || !selectedTerm || !commentsData[selectedClass] || !commentsData[selectedClass][selectedTerm]) {
        showToast('Yorumlar arasında gezinmek için lütfen sınıf ve dönem seçin.', 'info');
        return;
    }

    const templates = commentsData[selectedClass][selectedTerm];
    if (templates.length === 0) {
        showToast('Bu sınıf ve dönem için yorum bulunamadı.', 'info');
        return;
    }

    let currentIndex = -1;
    if (currentCommentTemplate) {
        currentIndex = templates.findIndex(t => t.id === currentCommentTemplate.id);
    } 
    // Eğer currentCommentTemplate yoksa veya listeden seçilmemişse,
    // şu anki profil listesindeki aktif yorumu bulmaya çalış
    if (currentIndex === -1) {
        const activeProfileItem = profileList.querySelector('.profile-item.active');
        if (activeProfileItem) {
            currentIndex = templates.findIndex(t => t.id === activeProfileItem.dataset.id);
        }
    }
    // Hala -1 ise, varsayılan olarak ilk veya son yoruma git (eğer hiç yorum seçilmemişse)
    if (currentIndex === -1) {
        currentIndex = (direction === 1) ? 0 : templates.length - 1; 
    }


    let nextIndex = currentIndex + direction;

    if (nextIndex < 0) {
        nextIndex = templates.length - 1; // Başa döner
    } else if (nextIndex >= templates.length) {
        nextIndex = 0; // Sona döner
    }

    const nextTemplate = templates[nextIndex];
    if (nextTemplate) {
        // Modaldaki yorum metnini ve başlığını güncelle
        modalCommentTitle.textContent = nextTemplate.title;
        if (selectedStudent) {
            modalCommentText.textContent = nextTemplate.comment.replace(/\[Öğrenci Adı\]/g, selectedStudent.firstName);
        } else {
            modalCommentText.textContent = nextTemplate.comment;
        }
        currentCommentTemplate = nextTemplate; // currentCommentTemplate'i güncelle
        
        // Yorum listesinde ilgili item'ı aktif yap ve scroll et
        const profileItem = profileList.querySelector(`.profile-item[data-id="${nextTemplate.id}"]`);
        if (profileItem) {
            const currentActive = profileList.querySelector('.profile-item.active');
            if (currentActive) {
                currentActive.classList.remove('active');
            }
            profileItem.classList.add('active');
            profileItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}
modalPrevCommentBtn.addEventListener('click', () => navigateCommentModal(-1));
modalNextCommentBtn.addEventListener('click', () => navigateCommentModal(1));



// Modal kapatma butonları için event listener
modalCloseButtons.forEach(button => {
    button.addEventListener('click', () => {
        commentPreviewModal.style.display = 'none';
        helpModal.style.display = 'none'; // helpModal'ı kapat
    });
});

// Modal dışına tıklayınca kapatma
window.addEventListener('click', (event) => {
    // commentPreviewModal için dış tıklama
    if (event.target === commentPreviewModal) {
        commentPreviewModal.style.display = 'none';
    }
    // helpModal için dış tıklama
    if (event.target === helpModal) {
        helpModal.style.display = 'none';
    }
});


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

    // Eğer tıklanan element assign-btn ise, assignCommentToStudent'i çağır
    if (event.target.closest('.assign-btn')) {
        const studentIdToAssign = event.target.closest('.assign-btn').dataset.studentId;
        selectedStudent = students.find(s => s.id === studentIdToAssign);
        // Bu tuş için direkt atanmış yorumu alıp yorum düzenleyiciye aktaracağız.
        // assignCommentToStudent(event) yerine, yorumu doğrudan aktaralım ve then assign'i çağıralım.
        if (selectedStudent) {
            const assignedComment = studentAssignments[selectedStudent.fullName] || '';
            commentTextarea.value = assignedComment.replace(/\[Öğrenci Adı\]/g, selectedStudent.firstName);
            updateCharCount();
            // Bu click event'i assignCommentToStudent'i tetiklemeyecek, sadece yorumu dolduracak.
            // Ana "Yorumu Ata / Güncelle" butonuyla atama yapılacak.
            // Bu düğme aracılığıyla atama yapılırsa, atanmış yorumu doldurduktan sonra direkt atama yapılmaz.
            // Öğrenciyi seçip yorumu düzenlemesi için fırsat verir.
            // Eğer "Ata" butonuna basınca hemen atama yapmak istersek, bu kısmı değiştirebiliriz.
            // Ancak şu anki mantık, seçili öğrencinin yorumunu yorum alanına getirmek üzerine kurulu.
            // Aslında bu butona tıklayınca doğrudan atama yapmak daha mantıklı olabilir.
            // Şimdilik "selectStudentForAssignmentItem" içinden çağrılacak.

            // Eğer assign-btn'e tıklandığında hemen ata/güncellemek istiyorsak,
            // aşağıdaki yorum satırlarını kaldırıp direkt assignCommentToStudent() çağırabiliriz:
            // assignCommentToStudent();
        }

        // Seçili öğrenciyi vurgula
        selectStudentForAssignmentItem(studentItem);

    } else { 
        // Eğer assign-btn değilse, sadece öğrenciyi seç
        selectStudentForAssignmentItem(studentItem);
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
        
        // Eğer seçili öğrencinin atanmış bir yorumu varsa, onu yükle
        const assignedCommentForSelected = studentAssignments[selectedStudent.fullName];
        if (assignedCommentForSelected) {
            commentTextarea.value = assignedCommentForSelected.replace(/\[Öğrenci Adı\]/g, selectedStudent.firstName);
            // "Yorumu Ata / Güncelle" düğmesinin metnini güncelle
            assignCommentBtnEditor.textContent = 'Yorumu Güncelle';
        } else {
            // Atanmış yorum yoksa, yorum alanını temizle ve düğme metnini "Yorumu Ata" yap
            commentTextarea.value = '';
            assignCommentBtnEditor.textContent = 'Yorumu Ata';
        }
        updateCharCount();
    } else {
        selectedStudentNameDisplay.textContent = 'Yok';
        commentTextarea.value = ''; 
        updateCharCount();
        assignCommentBtnEditor.textContent = 'Yorumu Ata / Güncelle'; // Öğrenci seçili değilse varsayılan
    }
}

// Hızlı öğrenci navigasyonu
function navigateStudent(direction) {
    const currentStudentItems = Array.from(studentListDiv.querySelectorAll('.student-item'));
    if (currentStudentItems.length === 0) return;

    let currentIndex = -1;
    if (selectedStudent) {
        currentIndex = currentStudentItems.findIndex(item => item.dataset.id === selectedStudent.id);
    }

    let nextIndex = currentIndex + direction;

    if (nextIndex < 0) {
        nextIndex = currentStudentItems.length - 1; // Başa döner
    } else if (nextIndex >= currentStudentItems.length) {
        nextIndex = 0; // Sona döner
    }

    selectStudentForAssignmentItem(currentStudentItems[nextIndex]);
    currentStudentItems[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // Seçili öğrenciye kaydır
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

    const sortedStudentsWithComments = students.filter(student => studentAssignments[student.fullName] && studentAssignments[student.fullName].trim() !== '') // Boş yorumları dahil etme
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
    
    // "Uygulamayı Sıfırla" butonu Local Storage'ı temizlediği için burada 'doNotShowWelcomeAgain' kaydını kaldırdık.
    // Ancak, helpModal'ı kapatırken bir ayar kaydetmiyoruz.
    // 'doNotShowWelcomeAgain' Local Storage'dan kaldırılmış olmalı, dolayısıyla her zaman gösterilecektir.

    if (selectedStudent) {
        localStorage.setItem('selectedStudentId', selectedStudent.id);
    } else {
        localStorage.removeItem('selectedStudentId');
    }
    showToast('Veriler otomatik kaydedildi.', 'info'); // Otomatik kaydetme bildirimi
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
            } else {
                selectedStudentNameDisplay.textContent = 'Yok';
                selectedStudent = null;
            }
        } else {
            selectedStudentNameDisplay.textContent = 'Yok';
            selectedStudent = null;
        }
    } else {
        selectedStudentNameDisplay.textContent = 'Yok';
        selectedStudent = null;
    }

    // Kullanım kılavuzu modalının kontrolü:
    // 'doNotShowHelpModalAgain' Local Storage'dan kontrol edilecek.
    const doNotShowHelpAgain = localStorage.getItem('doNotShowHelpModalAgain');
    if (doNotShowHelpAgain === 'true') {
        helpModal.style.display = 'none';
    } else {
        helpModal.style.display = 'flex'; // İlk açılışta veya ayar 'false' ise göster
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
        loadStudentListForAssignment(filterUnassignedBtn.classList.contains('active-filter')); 
        updateDashboardCards(); 

        if (selectedStudent && selectedStudent.id === studentIdToDelete) {
            selectedStudent = null;
            selectedStudentNameDisplay.textContent = 'Yok';
            clearCommentEditor();
        }
        showToast(`${studentToDelete.fullName} başarıyla silindi.`, 'success');
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
        loadStudentListForAssignment(filterUnassignedBtn.classList.contains('active-filter'));
        clearCommentEditor();
        selectedStudentNameDisplay.textContent = 'Yok';
        updateDashboardCards(); 
        showToast("Tüm öğrenci verileri başarıyla temizlendi.", 'success');
    }
}

// Local Storage'ı tamamen temizleme fonksiyonu
function clearAllLocalStorage() {
    if (confirm("UYARI: Bu işlem, tüm öğrenci verileri, atanan yorumlar ve uygulama ayarları dahil olmak üzere tarayıcınızda kayıtlı olan TÜM verileri silecektir. Bu işlem geri alınamaz! Devam etmek istiyor musunuz?")) {
        localStorage.clear(); // Tüm Local Storage'ı temizle
        
        // Uygulamayı varsayılan durumuna getirmek için gerekli değişkenleri ve UI'ı sıfırla
        students = [];
        studentAssignments = {};
        selectedStudent = null;

        // UI elementlerini varsayılan hallerine getir
        sidebarClassFilter.value = 'all';
        sidebarSubClassFilter.value = 'all';
        studentSearchInput.value = '';
        classSelect.value = '';
        termSelect.value = '';
        autoClearCommentCheckbox.checked = false;
        newStudentClassSelect.value = '';
        newStudentSubClassSelect.value = '';
        managementClassFilter.value = 'all';
        managementSubClassFilter.value = 'all';
        managementStudentSearchInput.value = '';
        
        // Öğrenci listelerini ve dashboard'ı güncelle
        updateManagedStudentListUI();
        loadStudentListForAssignment(false); 
        clearCommentEditor();
        selectedStudentNameDisplay.textContent = 'Yok';
        updateDashboardCards();
        updateThemeColors(); // Tema renklerini varsayılana döndür (body class'ını temizler)

        // Yardımcı modalın tekrar gelmesi için Local Storage'daki ayarı kaldır veya 'false' yap
        localStorage.removeItem('doNotShowHelpModalAgain'); // En garantili yol
        helpModal.style.display = 'flex'; // Modalı tekrar göster

        showToast("Uygulama başarıyla sıfırlandı. Tüm veriler temizlendi.", 'success');
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
sidebarClassFilter.addEventListener('change', () => loadStudentListForAssignment(filterUnassignedBtn.classList.contains('active-filter')));
sidebarSubClassFilter.addEventListener('change', () => loadStudentListForAssignment(filterUnassignedBtn.classList.contains('active-filter')));
studentSearchInput.addEventListener('input', () => loadStudentListForAssignment(filterUnassignedBtn.classList.contains('active-filter')));
studentListDiv.addEventListener('click', handleStudentClickInAssignmentList); 
viewAllAssignmentsBtn.addEventListener('click', viewAllAssignments);

// Yorumu Ata / Güncelle butonu için event listener
assignCommentBtnEditor.addEventListener('click', assignCommentToStudent);


// Yeni filtre butonu
filterUnassignedBtn.addEventListener('click', () => {
    // Butonun aktif/pasif durumunu toggle et
    filterUnassignedBtn.classList.toggle('active-filter');
    if (filterUnassignedBtn.classList.contains('active-filter')) {
        loadStudentListForAssignment(true); // Sadece atanmamışları göster
        showToast('Yorum bekleyen öğrenciler filtrelendi.', 'info');
    } else {
        loadStudentListForAssignment(false); // Tüm öğrencileri göster
        showToast('Tüm öğrenciler gösteriliyor.', 'info');
    }
});


// Hızlı öğrenci navigasyon butonları
prevStudentBtn.addEventListener('click', () => navigateStudent(-1));
nextStudentBtn.addEventListener('click', () => navigateStudent(1));


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
clearLocalStorageBtn.addEventListener('click', clearAllLocalStorage); // Local Storage temizleme tuşu event listener'ı
managementClassFilter.addEventListener('change', updateManagedStudentListUI);
managementSubClassFilter.addEventListener('change', updateManagedStudentListUI); 
managementStudentSearchInput.addEventListener('input', updateManagedStudentListUI);
managedStudentListDiv.addEventListener('click', deleteStudent); 

// Kullanım Kılavuzu Modalı için event listener
openHelpModalBtn.addEventListener('click', () => {
    helpModal.style.display = 'flex'; // Modalı göster
});

closeHelpModalBtn.addEventListener('click', () => {
    helpModal.style.display = 'none'; // Modalı kapat
});


// Uygulama yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    loadData(); 
    updateDashboardCards(); 
});