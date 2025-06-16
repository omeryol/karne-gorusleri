// js/ui-elements.js

// Genel Navigasyon
export const tabButtons = document.querySelectorAll('.tab-button');
export const tabContents = document.querySelectorAll('.tab-content');

// Dashboard Elements
export const totalStudentsCountSpan = document.getElementById('total-students-count');
export const assignedCommentsCountSpan = document.getElementById('assigned-comments-count');
export const pendingCommentsCountSpan = document.getElementById('pending-comments-count');
export const completionRateSpan = document.getElementById('completion-rate');

// Comments Tab (Yorum Atama)
export const sidebarClassFilter = document.getElementById('sidebar-class-filter');
export const sidebarSubClassFilter = document.getElementById('sidebar-subclass-filter');
export const studentSearchInput = document.getElementById('student-search-input');
export const selectedStudentNameDisplay = document.getElementById('selected-student-name-display');

export const classSelect = document.getElementById('class-select');
export const termSelect = document.getElementById('term-select');
export const profileSearchInput = document.getElementById('profile-search-input');
export const profileList = document.getElementById('profile-list');
export const commentTextarea = document.getElementById('comment-textarea');
export const remainingCharsSpan = document.getElementById('remaining-chars');
export const copyCommentBtn = document.getElementById('copy-comment-btn');
export const clearCommentEditorBtn = document.getElementById('clear-comment-editor-btn');
export const autoClearCommentCheckbox = document.getElementById('auto-clear-comment');
export const studentListDiv = document.getElementById('student-list');
// Kenar çubuğundaki bu buton artık kullanılmadığı için dışa aktarılmasına gerek yok
// export const viewAllAssignmentsBtn = document.getElementById('view-all-assignments-btn');
export const appContainer = document.getElementById('app-container');

// Yorum Atama sekmesi filtre butonu
export const filterUnassignedBtn = document.getElementById('filter-unassigned-btn');

// Yorum Düzenleme alanına eklenen yeni butonlar
export const prevStudentBtnEditor = document.getElementById('prev-student-btn-editor');
export const nextStudentBtnEditor = document.getElementById('next-student-btn-editor');
export const assignCommentBtnEditor = document.getElementById('assign-comment-btn-editor');
export const viewAllAssignmentsBtnEditor = document.getElementById('view-all-assignments-btn-editor');


// Yorum Önizleme Modalı
export const commentPreviewModal = document.getElementById('comment-preview-modal');
export const modalCommentTitle = document.getElementById('modal-comment-title');
export const modalCommentText = document.getElementById('modal-comment-text');
export const modalCopyBtn = document.getElementById('modal-copy-btn');
export const modalSelectBtn = document.getElementById('modal-select-btn');
export const modalCancelBtn = document.getElementById('modal-cancel-btn');
export const modalPrevCommentBtn = document.getElementById('modal-prev-comment-btn');
export const modalNextCommentBtn = document.getElementById('modal-next-comment-btn');
export const modalCloseButtons = document.querySelectorAll('.modal .close-button');

// Atanan Tüm Yorumları Görüntüleme Modalı
export const allAssignmentsModal = document.getElementById('all-assignments-modal');
export const allAssignedCommentsList = document.getElementById('all-assigned-comments-list');
export const closeAllAssignmentsModalBtn = document.getElementById('close-all-assignments-modal');
export const closeAllAssignmentsModalBtnBottom = document.getElementById('close-all-assignments-modal-btn');


// Kullanım Kılavuzu Modalı
export const helpModal = document.getElementById('help-modal');
export const openHelpModalBtn = document.getElementById('open-help-modal-btn');
export const closeHelpModalBtn = document.getElementById('close-help-modal');


// Student Management Tab (Öğrenci Yönetimi)
export const studentNamesTextarea = document.getElementById('student-names-textarea');
export const newStudentClassSelect = document.getElementById('new-student-class-select');
export const newStudentSubClassSelect = document.getElementById('new-student-subclass-select');
export const loadNamesFromTextBtn = document.getElementById('load-names-from-text-btn');
export const studentListUpload = document.getElementById('student-list-upload');
export const clearAllStudentsBtn = document.getElementById('clear-all-students-btn');
export const clearLocalStorageBtn = document.getElementById('clear-localstorage-btn');
export const managementClassFilter = document.getElementById('management-class-filter');
export const managementSubClassFilter = document.getElementById('management-subclass-filter');
export const managementStudentSearchInput = document.getElementById('management-student-search-input');
export const managedStudentListDiv = document.getElementById('managed-student-list');

// Bildirim alanı
export const toastContainer = document.getElementById('toast-container');