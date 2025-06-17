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

// HEADER ELEMENTLERİ
export const mainHeader = document.getElementById('main-header');
export const appTitle = document.getElementById('app-title');
export const headerClassSelect = document.getElementById('header-class-select');
export const headerTermSelect = document.getElementById('header-term-select');
export const openHelpModalBtn = document.getElementById('open-help-modal-btn'); // Yardım butonu

// DASHBOARD ELEMENTLERİ
export const dashboardCardsContainer = document.getElementById('dashboard-cards-container');
export const totalStudentsCountSpan = document.getElementById('total-students-count');
export const assignedCommentsCountSpan = document.getElementById('assigned-comments-count');
export const pendingCommentsCountSpan = document.getElementById('pending-comments-count');
export const completionRateSpan = document.getElementById('completion-rate');

// YORUM ATAMA PANELİ
export const studentCommentDashboard = document.getElementById('student-comment-dashboard');

// Öğrenci Listesi Paneli (Sol Panel)
export const studentListPanel = document.querySelector('.student-list-panel');
export const studentListClassFilter = document.getElementById('student-list-class-filter');
export const studentListSubClassFilter = document.getElementById('student-list-subclass-filter');
export const studentSearchInput = document.getElementById('student-search-input');
export const filterUnassignedBtn = document.getElementById('filter-unassigned-btn');
export const studentListContainer = document.getElementById('student-list-container');
export const prevStudentBtn = document.getElementById('prev-student-btn');
export const nextStudentBtn = document.getElementById('next-student-btn');
export const addNewStudentBtn = document.getElementById('add-new-student-btn');
export const manageStudentsBtn = document.getElementById('manage-students-btn');


// Yorum Düzenleyici Paneli (Sağ Panel)
export const commentEditorPanel = document.querySelector('.comment-editor-panel');
export const selectedStudentNameDisplay = document.getElementById('selected-student-name-display');
export const commentTextarea = document.getElementById('comment-textarea');
export const remainingCharsSpan = document.getElementById('remaining-chars');
export const autoClearCommentCheckbox = document.getElementById('auto-clear-comment');
export const assignCommentBtn = document.getElementById('assign-comment-btn');
export const copyCommentBtn = document.getElementById('copy-comment-btn');
export const clearCommentEditorBtn = document.getElementById('clear-comment-editor-btn');
export const viewAllAssignmentsBtn = document.getElementById('view-all-assignments-btn');

// Yorum Şablonları Bölümü (Sağ Panel içinde)
export const profileSearchInput = document.getElementById('profile-search-input');
export const commentProfileList = document.getElementById('comment-profile-list');

// MODAL ELEMENTLERİ
export const toastContainer = document.getElementById('toast-container');

// Öğrenci Yönetimi Modalı
export const studentManagementModal = document.getElementById('student-management-modal');
export const studentManagementModalCloseButtons = document.querySelectorAll('#student-management-modal .close-button, #student-management-modal .close-modal-button');
export const modalTabButtons = document.querySelectorAll('.modal-tab-button');
export const modalTabContents = document.querySelectorAll('.modal-tab-content');

// Öğrenci Ekle Sekmesi (Modal içinde)
export const studentNamesTextareaModal = document.getElementById('student-names-textarea-modal');
export const newStudentClassSelectModal = document.getElementById('new-student-class-select-modal');
export const newStudentSubClassSelectModal = document.getElementById('new-student-subclass-select-modal');
export const loadNamesFromTextBtnModal = document.getElementById('load-names-from-text-btn-modal');
export const studentListUploadModal = document.getElementById('student-list-upload-modal');

// Öğrencileri Görüntüle/Sil Sekmesi (Modal içinde)
export const managementClassFilterModal = document.getElementById('management-class-filter-modal');
export const managementSubClassFilterModal = document.getElementById('management-subclass-filter-modal');
export const managementStudentSearchInputModal = document.getElementById('management-student-search-input-modal');
export const managedStudentListContainerModal = document.getElementById('managed-student-list-container-modal');
export const clearAllStudentsBtnModal = document.getElementById('clear-all-students-btn-modal');
export const clearLocalStorageBtnModal = document.getElementById('clear-localstorage-btn-modal');


// Yorum Önizleme Modalı
export const commentPreviewModal = document.getElementById('comment-preview-modal');
export const modalCommentTitle = document.getElementById('modal-comment-title');
export const modalCommentText = document.getElementById('modal-comment-text');
export const modalCopyBtn = document.getElementById('modal-copy-btn');
export const modalSelectBtn = document.getElementById('modal-select-btn');
export const modalPrevCommentBtn = document.getElementById('modal-prev-comment-btn');
export const modalNextCommentBtn = document.getElementById('modal-next-comment-btn');
// DÜZELTME: querySelectorAll kullanılarak hem 'x' hem de 'Kapat' butonları seçiliyor.
export const commentPreviewModalCloseButton = document.querySelectorAll('#comment-preview-modal .close-button, #comment-preview-modal .close-modal-button');


// Atanan Tüm Yorumları Görüntüleme Modalı
export const allAssignmentsModal = document.getElementById('all-assignments-modal');
export const allAssignedCommentsList = document.getElementById('all-assigned-comments-list');
// DÜZELTME: querySelectorAll kullanılarak hem 'x' hem de 'Kapat' butonları seçiliyor.
export const allAssignmentsModalCloseButton = document.querySelectorAll('#all-assignments-modal .close-button, #all-assignments-modal .close-modal-button');


// Kullanım Kılavuzu Modalı
export const helpModal = document.getElementById('help-modal');
// DÜZELTME: querySelectorAll kullanılarak hem 'x' hem de 'Anladım' butonları seçiliyor.
export const helpModalCloseButton = document.querySelectorAll('#help-modal .close-button, #help-modal .close-modal-button');

console.log('[ui-elements.js] UI elementleri tanımlama tamamlandı.');