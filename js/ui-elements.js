// js/ui-elements.js

/*
    Hata Ayıklama Notu:
    Bu dosya, HTML'deki belirli elementlere JavaScript tarafından erişim sağlar.
    Buradaki her 'export const' tanımlamasının, yeni 'index.html' dosyasındaki
    ilgili ID veya sınıf adına doğru bir şekilde karşılık geldiğini doğrulamak kritik öneme sahiptir.
    Tarayıcının Geliştirici Araçları'nı (Developer Tools) kullanarak her bir değişkeni (örn. `headerClassSelect`, `totalStudentsCountSpan`)
    konsolda çağırarak `null` dönüp dönmediğini kontrol edin. Eğer `null` dönüyorsa,
    bu ID'nin HTML'de ya yanlış yazıldığını ya da hiç var olmadığını gösterir.
*/

console.log('[ui-elements.js] UI elementleri tanımlanıyor...');

// HEADER ELEMENTLERİ (Yeni HTML yapısına göre)
export const mainHeader = document.getElementById('main-header');
export const appTitle = document.getElementById('app-title');
export const headerClassSelect = document.getElementById('header-class-select');
export const headerTermSelect = document.getElementById('header-term-select');
export const openHelpModalBtn = document.getElementById('open-help-modal-btn'); // Yardım butonu

// DASHBOARD ELEMENTLERİ
export const dashboardCardsContainer = document.getElementById('dashboard-cards-container'); // Yeni konteyner
export const totalStudentsCountSpan = document.getElementById('total-students-count'); // Mevcut
export const assignedCommentsCountSpan = document.getElementById('assigned-comments-count'); // Mevcut
export const pendingCommentsCountSpan = document.getElementById('pending-comments-count'); // Mevcut
export const completionRateSpan = document.getElementById('completion-rate'); // Mevcut

// YORUM ATAMA PANELİ (ESKİ 'comments-tab'İN YERİNE)
export const studentCommentDashboard = document.getElementById('student-comment-dashboard');

// Öğrenci Listesi Paneli (Sol Panel)
export const studentListPanel = document.querySelector('.student-list-panel'); // Panel kapsayıcısı
export const studentListClassFilter = document.getElementById('student-list-class-filter');
export const studentListSubClassFilter = document.getElementById('student-list-subclass-filter');
export const studentSearchInput = document.getElementById('student-search-input'); // Mevcut
export const filterUnassignedBtn = document.getElementById('filter-unassigned-btn'); // Mevcut
export const studentListContainer = document.getElementById('student-list-container'); // Yeni ID
export const addNewStudentBtn = document.getElementById('add-new-student-btn'); // Yeni buton
export const manageStudentsBtn = document.getElementById('manage-students-btn'); // Yeni buton


// Yorum Düzenleyici Paneli (Sağ Panel)
export const commentEditorPanel = document.querySelector('.comment-editor-panel'); // Panel kapsayıcısı
export const selectedStudentNameDisplay = document.getElementById('selected-student-name-display'); // Mevcut
export const commentTextarea = document.getElementById('comment-textarea'); // Mevcut
export const remainingCharsSpan = document.getElementById('remaining-chars'); // Mevcut
export const autoClearCommentCheckbox = document.getElementById('auto-clear-comment'); // Mevcut
export const assignCommentBtn = document.getElementById('assign-comment-btn'); // Yeni ID
export const copyCommentBtn = document.getElementById('copy-comment-btn'); // Mevcut
export const clearCommentEditorBtn = document.getElementById('clear-comment-editor-btn'); // Mevcut

// Yorum Şablonları Bölümü (Sağ Panel içinde)
export const profileSearchInput = document.getElementById('profile-search-input'); // Mevcut
export const commentProfileList = document.getElementById('comment-profile-list'); // Yeni ID


// MODAL ELEMENTLERİ (Yeni HTML yapısına göre ID'ler ve close butonları)
export const toastContainer = document.getElementById('toast-container'); // Mevcut

// Öğrenci Yönetimi Modalı
export const studentManagementModal = document.getElementById('student-management-modal');
export const studentManagementModalCloseButtons = document.querySelectorAll('#student-management-modal .close-button, #student-management-modal .close-modal-button');
export const modalTabButtons = document.querySelectorAll('.modal-tab-button'); // Öğrenci Yönetimi Modalı içindeki sekme butonları
export const modalTabContents = document.querySelectorAll('.modal-tab-content'); // Öğrenci Yönetimi Modalı içindeki sekme içerikleri

// Öğrenci Ekle Sekmesi (Modal içinde)
export const studentNamesTextareaModal = document.getElementById('student-names-textarea-modal'); // Yeni ID
export const newStudentClassSelectModal = document.getElementById('new-student-class-select-modal'); // Yeni ID
export const newStudentSubClassSelectModal = document.getElementById('new-student-subclass-select-modal'); // Yeni ID
export const loadNamesFromTextBtnModal = document.getElementById('load-names-from-text-btn-modal'); // Yeni ID
export const studentListUploadModal = document.getElementById('student-list-upload-modal'); // Yeni ID

// Öğrencileri Görüntüle/Sil Sekmesi (Modal içinde)
export const managementClassFilterModal = document.getElementById('management-class-filter-modal'); // Yeni ID
export const managementSubClassFilterModal = document.getElementById('management-subclass-filter-modal'); // Yeni ID
export const managementStudentSearchInputModal = document.getElementById('management-student-search-input-modal'); // Yeni ID
export const managedStudentListContainerModal = document.getElementById('managed-student-list-container-modal'); // Yeni ID
export const clearAllStudentsBtnModal = document.getElementById('clear-all-students-btn-modal'); // Yeni ID
export const clearLocalStorageBtnModal = document.getElementById('clear-localstorage-btn-modal'); // Yeni ID


// Yorum Önizleme Modalı
export const commentPreviewModal = document.getElementById('comment-preview-modal'); // Mevcut
export const modalCommentTitle = document.getElementById('modal-comment-title'); // Mevcut
export const modalCommentText = document.getElementById('modal-comment-text'); // Mevcut
export const modalCopyBtn = document.getElementById('modal-copy-btn'); // Mevcut
export const modalSelectBtn = document.getElementById('modal-select-btn'); // Mevcut
export const modalPrevCommentBtn = document.getElementById('modal-prev-comment-btn'); // Mevcut
export const modalNextCommentBtn = document.getElementById('modal-next-comment-btn'); // Mevcut
export const commentPreviewModalCloseButton = document.querySelector('#comment-preview-modal .close-button, #comment-preview-modal .close-modal-button');


// Atanan Tüm Yorumları Görüntüleme Modalı
export const allAssignmentsModal = document.getElementById('all-assignments-modal'); // Mevcut
export const allAssignedCommentsList = document.getElementById('all-assigned-comments-list'); // Mevcut
export const allAssignmentsModalCloseButton = document.querySelector('#all-assignments-modal .close-button, #all-assignments-modal .close-modal-button');


// Kullanım Kılavuzu Modalı
export const helpModal = document.getElementById('help-modal'); // Mevcut
export const helpModalCloseButton = document.querySelector('#help-modal .close-button, #help-modal .close-modal-button');


console.log('[ui-elements.js] UI elementleri tanımlama tamamlandı.');