// Yorum yönetimi sınıfı
class CommentManager {
    constructor(storage) {
        this.storage = storage;
        this.currentPeriodFilter = 'all';
        this.currentToneFilter = 'all';
        this.currentEditingId = null;
        this.selectedPresetId = '';
        this.quickWorkflowCollapsed = false;
        this.quickTemplateSearchTerm = '';
        this.quickTemplatePool = [];
        this.init();
    }

    init() {
        debugLog('CommentManager.init() started');
        try {
            this.bindEvents();
            this.render();
            this.initQuickWorkflow();
            debugLog('CommentManager.init() completed successfully');
        } catch (error) {
            debugLog('ERROR in CommentManager.init():', error.message);
            throw error;
        }
    }

    bindEvents() {
        // Yorum düzenleme formı
        const commentEditForm = document.getElementById('commentEditForm');
        if (commentEditForm) {
            commentEditForm.addEventListener('submit', (e) => {
                this.handleCommentSubmit(e);
            });
        }

        // Filtreler
        const periodFilter = document.getElementById('periodFilter');
        if (periodFilter) {
            periodFilter.addEventListener('change', (e) => {
                this.applyFilters(e.target.value, this.currentToneFilter);
            });
        }

        const commentToneFilter = document.getElementById('commentToneFilter');
        if (commentToneFilter) {
            commentToneFilter.addEventListener('change', (e) => {
                this.applyFilters(this.currentPeriodFilter, e.target.value);
            });
        }

        const periodSelect = document.querySelector('#commentEditForm select[name="period"]');
        if (periodSelect) {
            periodSelect.addEventListener('change', (e) => {
                if (this.currentEditStudent) {
                    this.renderStudentHistory(this.currentEditStudent, e.target.value);
                }
            });
        }

        const commentPresetSelect = document.getElementById('commentPresetSelect');
        if (commentPresetSelect) {
            commentPresetSelect.addEventListener('change', (e) => {
                this.applySelectedPreset(e.target.value);
            });
        }

        const saveCommentPresetBtn = document.getElementById('saveCommentPresetBtn');
        if (saveCommentPresetBtn) {
            saveCommentPresetBtn.addEventListener('click', () => {
                this.saveCurrentFilterPreset();
            });
        }

        const deleteCommentPresetBtn = document.getElementById('deleteCommentPresetBtn');
        if (deleteCommentPresetBtn) {
            deleteCommentPresetBtn.addEventListener('click', () => {
                this.deleteSelectedFilterPreset();
            });
        }

        // Tüm yorumları görüntüle
        const viewAllCommentsBtn = document.getElementById('viewAllCommentsBtn');
        if (viewAllCommentsBtn) {
            viewAllCommentsBtn.addEventListener('click', () => {
                this.showAllCommentsModal();
            });
        }

        const toggleQuickWorkflowBtn = document.getElementById('toggleQuickWorkflowBtn');
        if (toggleQuickWorkflowBtn) {
            toggleQuickWorkflowBtn.addEventListener('click', () => {
                this.quickWorkflowCollapsed = !this.quickWorkflowCollapsed;
                this.syncQuickWorkflowVisibility();
            });
        }

        const quickStudentSelect = document.getElementById('quickWorkflowStudentSelect');
        if (quickStudentSelect) {
            quickStudentSelect.addEventListener('change', () => {
                this.syncQuickWorkflowFromExistingComment();
            });
        }

        const quickPeriodSelect = document.getElementById('quickWorkflowPeriod');
        if (quickPeriodSelect) {
            quickPeriodSelect.addEventListener('change', () => {
                this.syncQuickWorkflowFromExistingComment();
            });
        }

        const quickToneSelect = document.getElementById('quickWorkflowTone');
        if (quickToneSelect) {
            quickToneSelect.addEventListener('change', () => {
                this.renderQuickWorkflowTemplates();
            });
        }

        const quickTemplateSearch = document.getElementById('quickWorkflowTemplateSearch');
        if (quickTemplateSearch) {
            quickTemplateSearch.addEventListener('input', (e) => {
                this.quickTemplateSearchTerm = String(e.target.value || '').toLowerCase().trim();
                this.renderQuickWorkflowTemplates();
            });
        }

        const quickApplyTemplateBtn = document.getElementById('quickWorkflowApplyTemplateBtn');
        if (quickApplyTemplateBtn) {
            quickApplyTemplateBtn.addEventListener('click', () => {
                this.applyQuickWorkflowTemplate();
            });
        }

        const quickSaveBtn = document.getElementById('quickWorkflowSaveBtn');
        if (quickSaveBtn) {
            quickSaveBtn.addEventListener('click', () => {
                this.saveQuickWorkflowComment();
            });
        }

        // AI önerisi
        const aiSuggestBtn = document.getElementById('aiSuggestBtn');
        if (aiSuggestBtn) {
            aiSuggestBtn.addEventListener('click', () => {
                window.templates.showAISuggestions();
            });
        }

        // Edit modal AI suggestions and placeholder buttons
        const editAISuggestionsBtn = document.getElementById('editAISuggestionsBtn');
        if (editAISuggestionsBtn) {
            editAISuggestionsBtn.addEventListener('click', () => {
                if (this.currentEditStudent) {
                    window.templates.setCurrentStudent(this.currentEditStudent);
                }
                window.templates.showAISuggestions();
            });
        }

        const editPlaceholderBtn = document.getElementById('editPlaceholderBtn');
        if (editPlaceholderBtn) {
            editPlaceholderBtn.addEventListener('click', () => {
                this.showPlaceholderModal();
            });
        }
        
        debugLog('CommentManager.bindEvents() completed successfully');

        // Karakter sayacı
        const textarea = document.querySelector('#commentEditForm textarea[name="content"]');
        if (textarea) {
            textarea.addEventListener('input', (e) => {
                this.updateCharacterCount(e.target.value.length);
            });
        }

        // İptal butonu
        const cancelEditBtn = document.getElementById('cancelEditBtn');
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => {
                window.ui.hideModal('commentEditModal');
            });
        }

        // Önceki öğrenci butonu
        const prevStudentBtn = document.getElementById('prevStudentBtn');
        if (prevStudentBtn) {
            prevStudentBtn.addEventListener('click', () => {
                this.navigateToStudent('prev');
            });
        }

        // Sonraki öğrenci butonu
        const nextStudentBtn = document.getElementById('nextStudentBtn');
        if (nextStudentBtn) {
            nextStudentBtn.addEventListener('click', () => {
                this.navigateToStudent('next');
            });
        }

        const prevStudentBtnInline = document.getElementById('prevStudentBtnInline');
        if (prevStudentBtnInline) {
            prevStudentBtnInline.addEventListener('click', () => {
                this.navigateToStudent('prev');
            });
        }

        const nextStudentBtnInline = document.getElementById('nextStudentBtnInline');
        if (nextStudentBtnInline) {
            nextStudentBtnInline.addEventListener('click', () => {
                this.navigateToStudent('next');
            });
        }

        this.populatePresetSelect();
        this.syncFilterControls();
    }

    initQuickWorkflow() {
        this.refreshQuickTemplatePool();
        this.renderQuickWorkflowStudents();
        this.renderQuickWorkflowTemplates();
        this.syncQuickWorkflowVisibility();
        this.syncQuickWorkflowFromExistingComment();
    }

    refreshQuickTemplatePool() {
        const templates = window.templates && typeof window.templates.getAllTemplates === 'function'
            ? window.templates.getAllTemplates()
            : [];

        this.quickTemplatePool = templates.map((template) => {
            const content = String(template?.content || template?.icerik || '').trim();
            return {
                id: String(template?.id || ''),
                content,
                tone: String(template?.tone || template?.ton || 'olumlu'),
                grade: String(template?.grade || ''),
                term: String(template?.term || ''),
            };
        }).filter((template) => template.id && template.content);
    }

    renderQuickWorkflowStudents() {
        const select = document.getElementById('quickWorkflowStudentSelect');
        if (!select) return;

        const students = this.storage.getStudents();
        const existingValue = select.value;

        const options = ['<option value="">Öğrenci seçin</option>'];
        students.forEach((student) => {
            options.push(`<option value="${student.id}">${student.name} (${student.grade}-${student.section})</option>`);
        });

        select.innerHTML = options.join('');
        if (existingValue && students.some((student) => student.id === existingValue)) {
            select.value = existingValue;
        }
    }

    renderQuickWorkflowTemplates() {
        const select = document.getElementById('quickWorkflowTemplateSelect');
        const toneSelect = document.getElementById('quickWorkflowTone');
        if (!select) return;

        if (!Array.isArray(this.quickTemplatePool) || this.quickTemplatePool.length === 0) {
            this.refreshQuickTemplatePool();
        }

        const toneFilter = toneSelect ? String(toneSelect.value || 'olumlu') : 'olumlu';
        const searchTerm = this.quickTemplateSearchTerm;

        const filtered = this.quickTemplatePool
            .filter((template) => {
                const toneMatch = toneFilter === 'all' ? true : template.tone === toneFilter;
                if (!toneMatch) return false;

                if (!searchTerm) return true;

                const haystack = `${template.content} ${template.grade} ${template.term} ${template.tone}`.toLowerCase();
                return haystack.includes(searchTerm);
            })
            .slice(0, 160);

        if (filtered.length === 0) {
            select.innerHTML = '<option value="">Uygun şablon bulunamadı</option>';
            return;
        }

        select.innerHTML = filtered.map((template) => {
            const shortContent = template.content.length > 84
                ? `${template.content.slice(0, 84)}...`
                : template.content;
            return `<option value="${template.id}">[${template.grade || '-'} / ${template.term || '-'}] ${shortContent}</option>`;
        }).join('');
    }

    syncQuickWorkflowVisibility() {
        const body = document.getElementById('quickWorkflowBody');
        const toggle = document.getElementById('toggleQuickWorkflowBtn');
        if (!body || !toggle) return;

        body.classList.toggle('hidden', this.quickWorkflowCollapsed);
        toggle.textContent = this.quickWorkflowCollapsed ? 'Genişlet' : 'Daralt';
    }

    syncQuickWorkflowFromExistingComment() {
        const studentSelect = document.getElementById('quickWorkflowStudentSelect');
        const periodSelect = document.getElementById('quickWorkflowPeriod');
        const toneSelect = document.getElementById('quickWorkflowTone');
        const editor = document.getElementById('quickWorkflowEditor');
        if (!studentSelect || !periodSelect || !toneSelect || !editor) return;

        const studentId = studentSelect.value;
        const period = periodSelect.value || '1';
        if (!studentId) {
            editor.value = '';
            return;
        }

        const existingComment = this.storage
            .getCommentsByStudentId(studentId)
            .find((comment) => String(comment.period || '1') === period);

        if (existingComment) {
            editor.value = existingComment.content || '';
            toneSelect.value = existingComment.tone || 'olumlu';
        }

        this.renderQuickWorkflowTemplates();
    }

    applyQuickWorkflowTemplate() {
        const studentSelect = document.getElementById('quickWorkflowStudentSelect');
        const templateSelect = document.getElementById('quickWorkflowTemplateSelect');
        const editor = document.getElementById('quickWorkflowEditor');
        const toneSelect = document.getElementById('quickWorkflowTone');
        if (!studentSelect || !templateSelect || !editor || !toneSelect) return;

        const selectedTemplateId = templateSelect.value;
        if (!selectedTemplateId) {
            window.ui.showToast('Lütfen bir şablon seçin.', 'warning');
            return;
        }

        const template = this.quickTemplatePool.find((item) => item.id === selectedTemplateId);
        if (!template) {
            window.ui.showToast('Şablon bulunamadı.', 'error');
            return;
        }

        const student = this.storage.getStudentById(studentSelect.value);
        editor.value = window.replaceStudentName(template.content, student ? student.name : '');
        toneSelect.value = template.tone || toneSelect.value;
        window.ui.showToast('Şablon editöre eklendi.', 'success');
    }

    saveQuickWorkflowComment() {
        const studentSelect = document.getElementById('quickWorkflowStudentSelect');
        const periodSelect = document.getElementById('quickWorkflowPeriod');
        const toneSelect = document.getElementById('quickWorkflowTone');
        const editor = document.getElementById('quickWorkflowEditor');
        if (!studentSelect || !periodSelect || !toneSelect || !editor) return;

        const studentId = studentSelect.value;
        const period = periodSelect.value || '1';
        const tone = toneSelect.value || 'olumlu';
        const content = String(editor.value || '').trim();

        if (!studentId) {
            window.ui.showToast('Önce öğrenci seçin.', 'warning');
            return;
        }

        if (content.length < 10) {
            window.ui.showToast('Yorum en az 10 karakter olmalıdır.', 'warning');
            return;
        }

        const existingComment = this.storage
            .getCommentsByStudentId(studentId)
            .find((comment) => String(comment.period || '1') === period);

        const payload = {
            content,
            tone,
            period,
            tags: [],
        };

        const success = existingComment
            ? this.storage.updateComment(existingComment.id, payload)
            : this.storage.addComment({ ...payload, studentId });

        if (!success) {
            window.ui.showToast('Yorum kaydedilemedi.', 'error');
            return;
        }

        this.render();
        window.students && window.students.render();
        window.app && window.app.dashboard && window.app.dashboard.updateStats();
        window.ui.showToast(existingComment ? 'Yorum güncellendi.' : 'Yorum kaydedildi.', 'success');
    }

    syncFilterControls() {
        const periodFilter = document.getElementById('periodFilter');
        const commentToneFilter = document.getElementById('commentToneFilter');

        if (periodFilter) {
            periodFilter.value = this.currentPeriodFilter;
        }

        if (commentToneFilter) {
            commentToneFilter.value = this.currentToneFilter;
        }
    }

    applyFilters(period = 'all', tone = 'all', options = {}) {
        this.currentPeriodFilter = period || 'all';
        this.currentToneFilter = tone || 'all';
        this.selectedPresetId = '';

        this.syncFilterControls();

        if (options.render !== false) {
            this.render();
        }

        const presetSelect = document.getElementById('commentPresetSelect');
        if (presetSelect) {
            presetSelect.value = '';
        }
    }

    clearFilters() {
        this.applyFilters('all', 'all');
        window.ui.showToast('Yorum filtreleri sifirlandi.', 'info');
    }

    populatePresetSelect() {
        const presetSelect = document.getElementById('commentPresetSelect');
        if (!presetSelect) {
            return;
        }

        const presets = this.storage.getCommentFilterPresets();
        const options = ['<option value="">Preset secin</option>'];

        presets.forEach((preset) => {
            const periodLabel = preset.filters.period === 'all' ? 'Tum donemler' : `${preset.filters.period}. donem`;
            const toneMap = { olumlu: 'Olumlu', notr: 'Notr', olumsuz: 'Olumsuz', all: 'Tum tonlar' };
            const toneLabel = toneMap[preset.filters.tone] || 'Tum tonlar';
            options.push(`<option value="${preset.id}">${preset.name} (${periodLabel} / ${toneLabel})</option>`);
        });

        presetSelect.innerHTML = options.join('');
        presetSelect.value = this.selectedPresetId || '';
    }

    saveCurrentFilterPreset() {
        const presetName = window.prompt('Preset adi girin:');
        if (!presetName || !presetName.trim()) {
            return;
        }

        const success = this.storage.saveCommentFilterPreset(presetName, {
            period: this.currentPeriodFilter,
            tone: this.currentToneFilter
        });

        if (!success) {
            window.ui.showToast('Preset kaydedilemedi.', 'error');
            return;
        }

        const presets = this.storage.getCommentFilterPresets();
        const current = presets.find((preset) => preset.name.toLowerCase() === presetName.trim().toLowerCase());
        this.selectedPresetId = current ? current.id : '';
        this.populatePresetSelect();
        window.ui.showToast('Preset kaydedildi.', 'success');
    }

    deleteSelectedFilterPreset() {
        const presetSelect = document.getElementById('commentPresetSelect');
        const presetId = presetSelect ? presetSelect.value : '';

        if (!presetId) {
            window.ui.showToast('Silmek icin bir preset secin.', 'warning');
            return;
        }

        const presets = this.storage.getCommentFilterPresets();
        const selected = presets.find((preset) => preset.id === presetId);
        if (!selected) {
            window.ui.showToast('Preset bulunamadi.', 'error');
            return;
        }

        if (!window.confirm(`"${selected.name}" presetini silmek istiyor musunuz?`)) {
            return;
        }

        const success = this.storage.deleteCommentFilterPreset(presetId);
        if (!success) {
            window.ui.showToast('Preset silinemedi.', 'error');
            return;
        }

        this.selectedPresetId = '';
        this.populatePresetSelect();
        window.ui.showToast('Preset silindi.', 'success');
    }

    applySelectedPreset(presetId) {
        if (!presetId) {
            this.selectedPresetId = '';
            return;
        }

        const presets = this.storage.getCommentFilterPresets();
        const selected = presets.find((preset) => preset.id === presetId);
        if (!selected) {
            window.ui.showToast('Preset bulunamadi.', 'error');
            return;
        }

        this.selectedPresetId = presetId;
        this.currentPeriodFilter = selected.filters.period || 'all';
        this.currentToneFilter = selected.filters.tone || 'all';
        this.syncFilterControls();
        this.render();
        window.ui.showToast(`Preset uygulandi: ${selected.name}`, 'info');
    }

    addComment(studentId) {
        debugLog('CommentManager.addComment called with studentId:', studentId);
        
        const student = this.storage.getStudentById(studentId);
        debugLog('Student found:', !!student);
        if (!student) {
            debugLog('ERROR: Student not found');
            return;
        }

        this.currentEditingId = null;
        debugLog('Showing edit modal for new comment');
        this.showEditModal(student, null);
    }

    editComment(studentId) {
        const student = this.storage.getStudentById(studentId);
        const comments = this.storage.getCommentsByStudentId(studentId);
        
        if (!student || comments.length === 0) return;

        this.currentEditingId = comments[0].id;
        this.showEditModal(student, comments[0]);
    }

    showPlaceholderModal() {
        const student = this.currentEditStudent;
        if (!student) return;

        if (window.ui && typeof window.ui.clearBlockingOverlays === 'function') {
            window.ui.clearBlockingOverlays();
        }

        const existing = document.getElementById('placeholderModal');
        if (existing) {
            existing.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'placeholderModal';
        modal.dataset.uiOverlay = 'transient';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Yer Tutucu Yönetimi</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-4">
                    "<strong>${student.name.split(' ')[0]}</strong>" adı yorumdan silinecektir.
                </p>
                <div class="flex gap-3">
                    <button onclick="this.closest('#placeholderModal').remove()" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        İptal
                    </button>
                    <button onclick="window.comments.autoApplyPlaceholder(); this.closest('#placeholderModal').remove()" class="flex-1 bg-primary hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        Otomatik Uygula
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const closeModal = () => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            document.removeEventListener('keydown', onEscape);
        };

        const onEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        };

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        document.addEventListener('keydown', onEscape);
    }

    autoApplyPlaceholder() {
        const textarea = document.querySelector('#commentEditForm textarea[name="content"]');
        if (textarea && this.currentEditStudent) {
            // [Öğrenci Adı] placeholder'ını ve etrafındaki noktalama işaretlerini kaldır
            let content = textarea.value;
            
            // Önce mevcut öğrenci adını kontrol et ve kaldır
            const firstName = this.currentEditStudent.name.split(' ')[0];
            content = content.replace(new RegExp(firstName, 'g'), '[Öğrenci Adı]');
            
            // Farklı kombinasyonları temizle
            content = content.replace(/,\s*\[Öğrenci Adı\]\s*/g, ' ');
            content = content.replace(/\[Öğrenci Adı\]\s*,\s*/g, ' ');
            content = content.replace(/\[Öğrenci Adı\]/g, '');
            
            // Çift boşlukları tek boşluk yap ve trim
            content = content.replace(/\s+/g, ' ').trim();
            
            // İlk harfi büyük yap
            if (content.length > 0) {
                content = content.charAt(0).toUpperCase() + content.slice(1);
            }
            
            textarea.value = content;
            this.updateCharacterCount(content.length);
            this.renderStudentHistory(this.currentEditStudent, document.querySelector('#commentEditForm select[name="period"]')?.value || '1');
            window.ui.showToast(`${firstName} adı yorumdan kaldırıldı`, 'success');
        }
    }

    showEditModal(student, comment) {
        debugLog('CommentManager.showEditModal called', { student: student.name, hasComment: !!comment });
        
        this.currentEditStudent = student;
        
        // Template manager'a current student'ı set et
        if (window.templates) {
            window.templates.setCurrentStudent(student);
        }
        
        // Öğrenci bilgilerini doldur
        const editStudentName = document.getElementById('editStudentName');
        const editStudentGradeSection = document.getElementById('editStudentGradeSection');
        const editStudentInitials = document.getElementById('editStudentInitials');
        const avatar = document.getElementById('editStudentAvatar');
        
        debugLog('Modal elements found:', {
            name: !!editStudentName,
            gradeSection: !!editStudentGradeSection,
            initials: !!editStudentInitials,
            avatar: !!avatar
        });
        
        if (editStudentName) editStudentName.textContent = student.name;
        if (editStudentGradeSection) editStudentGradeSection.textContent = `${student.grade}-${student.section}`;
        if (editStudentInitials) editStudentInitials.textContent = window.students.getInitials(student.name);
        
        if (avatar) {
            avatar.className = `w-12 h-12 ${window.students.getGradeColor(student.grade)} rounded-full flex items-center justify-center`;
        }

        // Form verilerini doldur
        const form = document.getElementById('commentEditForm');
        if (comment) {
            form.content.value = comment.content;
            if (form.tone) form.tone.value = comment.tone || 'olumlu';
            if (form.period) form.period.value = comment.period || '1';
            this.updateCharacterCount(comment.content.length);
            this.renderStudentHistory(student, comment.period || '1');
        } else {
            form.reset();
            
            // Yeni yorum için boş başlat
            form.content.value = '';
            if (form.tone) form.tone.value = 'olumlu';
            if (form.period) form.period.value = '1';
            
            // Placeholder ekle
            const textarea = form.content;
            textarea.placeholder = `${student.name.split(' ')[0]} için yorumu buraya yazın...`;
            
            this.updateCharacterCount(0);
            this.renderStudentHistory(student, '1');
        }

        debugLog('Calling showModal for commentEditModal');
        window.ui.showModal('commentEditModal');
        
        // Navigation butonlarını güncelle
        const students = this.storage.getStudents();
        const currentIndex = students.findIndex(s => s.id === student.id);
        this.updateNavigationButtons(currentIndex, students.length);
    }

    handleCommentSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const commentData = {
            content: formData.get('content').trim(),
            tone: formData.get('tone') || 'olumlu', // Get tone from form or default
            period: formData.get('period') || '1', // Get period from form or default
            tags: [] // No tags
        };

        // [Öğrenci Adı] placeholder'ını otomatik değiştir (kaydetme sırasında)
        const student = this.storage.getStudentById(
            this.currentEditingId ? 
            this.storage.getCommentById(this.currentEditingId).studentId :
            this.getStudentIdFromModal()
        );
        
        if (student) {
            commentData.content = window.replaceStudentName(commentData.content, student.name);
        }

        if (this.validateComment(commentData)) {
            if (this.currentEditingId) {
                // Güncelleme
                if (this.storage.updateComment(this.currentEditingId, commentData)) {
                    this.handleCommentSuccess('Yorum başarıyla güncellendi!');
                } else {
                    window.ui.showToast('Yorum güncellenirken hata oluştu!', 'error');
                }
            } else {
                // Yeni yorum
                commentData.studentId = this.getStudentIdFromModal();
                if (this.storage.addComment(commentData)) {
                    this.handleCommentSuccess('Yorum başarıyla eklendi!');
                } else {
                    window.ui.showToast('Yorum eklenirken hata oluştu!', 'error');
                }
            }
        }
    }

    validateComment(comment) {
        if (!comment.content || comment.content.length < 10) {
            window.ui.showToast('Yorum en az 10 karakter olmalıdır!', 'error');
            return false;
        }

        if (comment.content.length > 500) {
            window.ui.showToast('Yorum en fazla 500 karakter olabilir!', 'error');
            return false;
        }

        

        return true;
    }

    handleCommentSuccess(message) {
        this.render();
        window.students && window.students.render();
        window.app && window.app.dashboard && window.app.dashboard.updateStats();
        window.ui.hideModal('commentEditModal');
        window.ui.showToast(message, 'success');
    }

    getStudentIdFromModal() {
        const studentName = document.getElementById('editStudentName').textContent;
        const gradeSection = document.getElementById('editStudentGradeSection').textContent;
        const [grade, section] = gradeSection.split('-');
        
        const students = this.storage.getStudents();
        const student = students.find(s => 
            s.name === studentName && 
            s.grade === grade && 
            s.section === section
        );
        
        return student ? student.id : null;
    }

    updateCharacterCount(count) {
        const charCount = document.getElementById('charCount');
        if (charCount) {
            charCount.textContent = count;
            
            // Karakter sayısına göre renk değiştir
            charCount.className = 'transition-colors duration-200';
            if (count < 250) {
                charCount.className += ' text-green-600';
            } else if (count < 400) {
                charCount.className += ' text-yellow-600';
            } else {
                charCount.className += ' text-red-600';
            }
        }
    }

    scheduleCommentQualityRender(text) {
        clearTimeout(this.qualityRenderTimer);
        this.qualityRenderTimer = setTimeout(() => {
            this.renderCommentQuality(text);
        }, 130);
    }

    analyzeCommentQuality(text) {
        const content = String(text || '').trim();
        const issues = [];
        const badges = [];
        let score = 100;

        if (!content) {
            return {
                score: 100,
                badges: [{ label: 'Hazir', tone: 'good' }],
                issues: ['Yazmaya başladığında burada canlı öneriler görünecek.']
            };
        }

        const sentences = content.split(/[.!?]+/).map((sentence) => sentence.trim()).filter(Boolean);
        const words = content.split(/\s+/).filter(Boolean);
        const letterOnlyWords = words
            .map((word) => word.replace(/[^a-zA-ZçğıöşüÇĞİÖŞÜ]/g, ''))
            .filter(Boolean);
        const harshPatterns = [
            { pattern: /yetersiz/gi, replacement: 'desteklenirse daha iyi ilerleyebilir' },
            { pattern: /isteksiz/gi, replacement: 'zaman zaman motivasyonu degisken olabiliyor' },
            { pattern: /dikkatsiz/gi, replacement: 'daha dikkatli oldugunda performansi belirgin sekilde gucleniyor' },
            { pattern: /sorumsuz/gi, replacement: 'sorumluluk bilincini gelistirmeye acik bir ogrenci' },
            { pattern: /basarisiz/gi, replacement: 'ek destekle ilerlemesini guclendirebilir' }
        ];
        const typoPatterns = [
            { pattern: /\bherkez\b/gi, suggestion: 'herkes' },
            { pattern: /\byanlız\b|\byanliz\b/gi, suggestion: 'yalniz' },
            { pattern: /\bbir çok\b/gi, suggestion: 'bircok' },
            { pattern: /\bhiç bir\b|\bhic bir\b/gi, suggestion: 'hicbir' },
            { pattern: /\bşeylerde\b|\bseylerde\b/gi, suggestion: 'seylerde' },
            { pattern: /\bşeyleride\b|\bseyleride\b/gi, suggestion: 'seyleri de' }
        ];
        const commonTurkishWords = new Set([
            've', 'bir', 'bu', 'icin', 'daha', 'ile', 'olarak', 'derse', 'derste', 'ogrenci', 'gelisim',
            'katilim', 'performans', 'sorumluluk', 'akademik', 'sinif', 'surec', 'calisma', 'davranis',
            'gostermektedir', 'gosteriyor', 'oldugunda', 'zaman', 'genel', 'duzenli', 'yapiyor', 'ediyor'
        ]);

        const uppercaseWords = letterOnlyWords.filter((word) => word.length >= 4 && word === word.toUpperCase()).length;
        const longRandomWords = letterOnlyWords.filter((word) => word.length >= 11).length;
        const consonantClusterWords = letterOnlyWords.filter((word) => /[bcdfgghjklmnprsştvyz]{5,}/i.test(word)).length;
        const commonWordHits = letterOnlyWords.filter((word) => commonTurkishWords.has(word.toLowerCase())).length;
        const averageWordLength = letterOnlyWords.length > 0
            ? letterOnlyWords.reduce((sum, word) => sum + word.length, 0) / letterOnlyWords.length
            : 0;
        const hasLikelyNoise = (
            letterOnlyWords.length >= 6 &&
            commonWordHits <= 1 &&
            (uppercaseWords >= 2 || longRandomWords >= 3 || consonantClusterWords >= 2 || averageWordLength > 8)
        );

        if (hasLikelyNoise) {
            issues.push('Metin anlamli cumle yapisi tasimiyor gibi gorunuyor; rastgele karakter veya test verisi olabilir.');
            badges.push({ label: 'Anlamsiz metin', tone: 'danger' });
            score -= 42;
        }

        if (uppercaseWords >= 2) {
            issues.push('Tamami buyuk harf olan kelimeler fazla; bu durum yorumu gergin ve yapay gosterebilir.');
            badges.push({ label: 'Buyuk harf', tone: 'warn' });
            score -= 10;
        }

        if (consonantClusterWords >= 2) {
            issues.push('Bazi kelimeler dogal Turkce kelime yapisina benzemiyor; yazim veya anlamsizlik kontrolu gerekli.');
            badges.push({ label: 'Kelime yapisi', tone: 'warn' });
            score -= 12;
        }

        if (words.length < 12) {
            issues.push('Yorum biraz kisa kalmis; bir guclu yon ve bir gelisim alani eklenebilir.');
            badges.push({ label: 'Kisa', tone: 'warn' });
            score -= 10;
        }

        if (content.length > 420) {
            issues.push('Yorum uzamis; daha net ve iki paragrafi gecmeyen bir dil daha okunakli olur.');
            badges.push({ label: 'Uzun', tone: 'warn' });
            score -= 8;
        }

        const longSentence = sentences.find((sentence) => sentence.split(/\s+/).filter(Boolean).length > 24);
        if (longSentence) {
            issues.push('En az bir cumle cok uzun; daha kisa iki cumleye bolmek yorumu daha dogal gosterir.');
            badges.push({ label: 'Uzun cumle', tone: 'warn' });
            score -= 12;
        }

        const sentenceStarts = sentences
            .map((sentence) => sentence.split(/\s+/).slice(0, 3).join(' ').toLowerCase())
            .filter(Boolean);
        const repeatedStart = sentenceStarts.find((start, index) => sentenceStarts.indexOf(start) !== index);
        if (repeatedStart) {
            issues.push('Cumle baslangiclari tekrar ediyor; farkli bir giris kullanmak metni daha insani yapar.');
            badges.push({ label: 'Tekrar', tone: 'warn' });
            score -= 10;
        }

        const foundHarsh = harshPatterns.filter(({ pattern }) => pattern.test(content));
        if (foundHarsh.length > 0) {
            issues.push('Bazi ifadeler fazla sert duruyor; daha yapici bir ton kullanilabilir.');
            badges.push({ label: 'Sert ton', tone: 'danger' });
            score -= 18;
        }

        const typoFindings = typoPatterns
            .map(({ pattern, suggestion }) => {
                const match = content.match(pattern);
                return match ? { found: match[0], suggestion } : null;
            })
            .filter(Boolean);

        if (typoFindings.length > 0) {
            const typoText = typoFindings
                .slice(0, 3)
                .map((item) => `"${item.found}" -> "${item.suggestion}"`)
                .join(', ');
            issues.push(`Yazim taramasi: ${typoText}. Bu kontrol tamamen yerel ve offline calisir.`);
            badges.push({ label: 'Yazim', tone: 'warn' });
            score -= 12;
        }

        if (!/[.!?]$/.test(content)) {
            issues.push('Yorumun sonuna nokta eklemek metni daha temiz bitirir.');
            badges.push({ label: 'Noktalama', tone: 'warn' });
            score -= 6;
        }

        if ((content.match(/!/g) || []).length > 1) {
            issues.push('Fazla unlem resmi tonu zayiflatabilir; daha sakin bir bitis daha uygun olur.');
            badges.push({ label: 'Unlem fazla', tone: 'warn' });
            score -= 5;
        }

        if (issues.length === 0) {
            badges.push({ label: 'Dengeli', tone: 'good' });
            badges.push({ label: 'Akici', tone: 'good' });
            issues.push('Yorum dengeli görünüyor. Şu an belirgin bir dil veya yazim uyarisi yok.');
        }

        return {
            score: Math.max(10, score),
            badges,
            issues,
            harshPatterns,
            typoFindings
        };
    }

    renderCommentQuality(text) {
        const scoreEl = document.getElementById('commentQualityScore');
        const badgesEl = document.getElementById('commentQualityBadges');
        const suggestionsEl = document.getElementById('commentQualitySuggestions');
        if (!scoreEl || !badgesEl || !suggestionsEl) {
            return;
        }

        const analysis = this.analyzeCommentQuality(text);
        const historicalInsight = this.getHistoricalSimilarityInsight(text);
        if (historicalInsight) {
            analysis.badges.unshift({ label: historicalInsight.badge, tone: historicalInsight.tone });
            analysis.issues.unshift(historicalInsight.message);
            analysis.score = Math.max(10, analysis.score - historicalInsight.penalty);
        }
        scoreEl.textContent = `Puan: ${analysis.score}`;

        scoreEl.className = 'px-3 py-1 rounded-full text-xs font-bold border';
        if (analysis.score >= 85) {
            scoreEl.className += ' bg-white/80 dark:bg-slate-800/80 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-700/60';
        } else if (analysis.score >= 70) {
            scoreEl.className += ' bg-white/80 dark:bg-slate-800/80 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-700/60';
        } else {
            scoreEl.className += ' bg-white/80 dark:bg-slate-800/80 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-700/60';
        }

        const badgeClassMap = {
            good: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
            warn: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
            danger: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
        };

        badgesEl.innerHTML = analysis.badges
            .map((badge) => `<span class="px-2.5 py-1 rounded-full text-xs font-semibold ${badgeClassMap[badge.tone] || badgeClassMap.warn}">${badge.label}</span>`)
            .join('');

        suggestionsEl.innerHTML = analysis.issues
            .map((issue) => `<li class="flex items-start gap-2"><i class="fas fa-sparkles text-[11px] mt-1 text-emerald-500"></i><span>${issue}</span></li>`)
            .join('');
    }

    getHistoricalSimilarityInsight(currentText) {
        if (!this.currentEditStudent || !currentText || currentText.trim().length < 20) {
            return null;
        }

        const selectedPeriod = document.querySelector('#commentEditForm select[name="period"]')?.value || '1';
        const previousPeriod = selectedPeriod === '2' ? '1' : '2';
        const previousComment = this.storage
            .getCommentsByStudentId(this.currentEditStudent.id)
            .find((comment) => String(comment.period) === String(previousPeriod));

        if (!previousComment || !previousComment.content) {
            return null;
        }

        const similarity = this.calculateCommentSimilarity(currentText, previousComment.content);
        if (similarity >= 0.76) {
            return {
                badge: 'Cok benzer',
                tone: 'danger',
                penalty: 18,
                message: `${previousPeriod}. donem yorumu ile benzerlik cok yuksek. Yeni bir vurgu veya farkli bir gelisim cizgisi eklemek iyi olur.`
            };
        }

        if (similarity >= 0.58) {
            return {
                badge: 'Benzerlik var',
                tone: 'warn',
                penalty: 8,
                message: `${previousPeriod}. donem yorumu ile belirgin bir benzerlik var. Tekrari azaltmak icin yeni bir gozlem eklenebilir.`
            };
        }

        return null;
    }

    renderStudentHistory(student, activePeriod = '1') {
        const summaryEl = document.getElementById('commentHistorySummary');
        const gridEl = document.getElementById('commentHistoryGrid');
        if (!summaryEl || !gridEl || !student) {
            return;
        }

        const comments = this.storage.getCommentsByStudentId(student.id);
        const firstPeriod = comments.find((comment) => String(comment.period) === '1');
        const secondPeriod = comments.find((comment) => String(comment.period) === '2');

        const similarity = this.calculateCommentSimilarity(firstPeriod?.content, secondPeriod?.content);
        let summaryText = 'Henuz iki donem karsilastirmasi yok';

        if (firstPeriod && secondPeriod) {
            summaryText = similarity >= 0.72
                ? 'Iki donem yorumu birbirine oldukca yakin'
                : 'Iki donem yorumu farkli vurgular tasiyor';
        } else if (firstPeriod || secondPeriod) {
            summaryText = 'Tek donem yorumu var';
        }

        summaryEl.textContent = summaryText;

        const cards = [
            { label: '1. Donem', comment: firstPeriod, period: '1' },
            { label: '2. Donem', comment: secondPeriod, period: '2' }
        ];

        gridEl.innerHTML = cards.map((card) => {
            const isActive = String(activePeriod) === card.period;
            const previewText = card.comment
                ? this.getCompactHistoryText(card.comment.content)
                : 'Bu donem icin kayitli yorum bulunmuyor.';
            return `
                <div class="rounded-xl border ${isActive ? 'border-teal-300 dark:border-teal-700 bg-teal-50/70 dark:bg-teal-900/20' : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60'} p-2.5 space-y-2">
                    <div class="flex items-center justify-between gap-2">
                        <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">${card.label}</p>
                        <span class="text-[11px] px-2 py-1 rounded-full ${card.comment ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}">${card.comment ? 'Mevcut' : 'Bos'}</span>
                    </div>
                    <p class="text-xs leading-5 text-slate-600 dark:text-slate-300 max-h-24 overflow-y-auto">${previewText}</p>
                </div>
            `;
        }).join('');
    }

    getCompactHistoryText(text) {
        const normalized = String(text || '').replace(/\s+/g, ' ').trim();
        if (normalized.length <= 180) {
            return normalized;
        }

        return `${normalized.slice(0, 177)}...`;
    }

    calculateCommentSimilarity(firstContent, secondContent) {
        if (!firstContent || !secondContent) {
            return 0;
        }

        const tokenize = (value) => new Set(
            String(value)
                .toLowerCase()
                .replace(/[^a-zA-ZçğıöşüÇĞİÖŞÜ0-9\s]/g, ' ')
                .split(/\s+/)
                .filter((word) => word.length > 2)
        );

        const firstWords = tokenize(firstContent);
        const secondWords = tokenize(secondContent);
        if (firstWords.size === 0 || secondWords.size === 0) {
            return 0;
        }

        const intersection = [...firstWords].filter((word) => secondWords.has(word)).length;
        const union = new Set([...firstWords, ...secondWords]).size;
        return union === 0 ? 0 : intersection / union;
    }

    navigateToStudent(direction) {
        if (!this.currentEditStudent) return;

        const students = this.storage.getStudents();
        const currentIndex = students.findIndex(s => s.id === this.currentEditStudent.id);
        
        if (currentIndex === -1) return;

        let newIndex;
        if (direction === 'prev') {
            newIndex = currentIndex > 0 ? currentIndex - 1 : students.length - 1;
        } else {
            newIndex = currentIndex < students.length - 1 ? currentIndex + 1 : 0;
        }

        const newStudent = students[newIndex];
        const comments = this.storage.getCommentsByStudentId(newStudent.id);
        const hasComment = comments.length > 0;

        // Mevcut formu kontrol et - gerçekten değişiklik var mı?
        const form = document.getElementById('commentEditForm');
        const currentContent = form.content.value.trim();
        
        // Orijinal içeriği al
        let originalContent = '';
        if (this.currentEditingId) {
            const originalComment = this.storage.getCommentById(this.currentEditingId);
            originalContent = originalComment ? originalComment.content.trim() : '';
        }

        // Gerçekten değişiklik var mı kontrol et
        const hasChanges = currentContent !== originalContent && currentContent.length > 0;
        
        if (hasChanges) {
            const saveSucceeded = this.saveCurrentCommentBeforeNavigation(currentContent);
            if (!saveSucceeded) {
                return;
            }
            this.performNavigation(newStudent, newIndex, hasComment, comments);
        } else {
            // Değişiklik yoksa direkt geç
            this.performNavigation(newStudent, newIndex, hasComment, comments);
        }
    }

    saveCurrentCommentBeforeNavigation(content) {
        const form = document.getElementById('commentEditForm');
        if (!form || !this.currentEditStudent) {
            return true;
        }

        const commentData = {
            content: String(content || '').trim(),
            tone: (form.tone && form.tone.value) || 'olumlu',
            period: (form.period && form.period.value) || '1',
            tags: []
        };

        if (commentData.content.length < 10) {
            window.ui.showToast('Gecmeden once kaydetmek icin yorum en az 10 karakter olmali.', 'warning');
            return false;
        }

        commentData.content = window.replaceStudentName(commentData.content, this.currentEditStudent.name);

        let saveResult = false;
        if (this.currentEditingId) {
            saveResult = this.storage.updateComment(this.currentEditingId, commentData);
        } else {
            saveResult = this.storage.addComment({
                ...commentData,
                studentId: this.currentEditStudent.id
            });
        }

        if (!saveResult) {
            window.ui.showToast('Yorum kaydedilemedi. Ogrenci gecisi iptal edildi.', 'error');
            return false;
        }

        this.render();
        window.students && window.students.render();
        window.app && window.app.dashboard && window.app.dashboard.updateStats();
        window.ui.showToast('Yorum kaydedildi, ogrenciye gecildi.', 'success');
        return true;
    }

    showNavigationConfirmModal(content, newStudent, newIndex, hasComment, comments) {
        if (window.ui && typeof window.ui.clearBlockingOverlays === 'function') {
            window.ui.clearBlockingOverlays();
        }

        const existing = document.getElementById('navigationConfirmModal');
        if (existing) {
            existing.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'navigationConfirmModal';
        modal.dataset.uiOverlay = 'transient';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200 dark:border-gray-700 transform scale-95 opacity-0 transition-all duration-300">
                <div class="flex items-center mb-4">
                    <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mr-4">
                        <i class="fas fa-exclamation-triangle text-yellow-600 dark:text-yellow-400 text-xl"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Kaydedilmemiş Değişiklikler</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Yorum alanında değişiklikler var</p>
                    </div>
                </div>
                <p class="text-gray-600 dark:text-gray-300 mb-6">
                    Mevcut öğrenci için yaptığınız değişiklikler kaydedilmemiş. Nasıl devam etmek istiyorsunuz?
                </p>
                <div class="flex space-x-3">
                    <button id="discardChanges" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                        <i class="fas fa-times mr-2"></i>
                        Değişiklikleri Göz Ardı Et
                    </button>
                    <button id="saveAndContinue" class="flex-1 bg-primary hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                        <i class="fas fa-save mr-2"></i>
                        Kaydet ve Devam Et
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Animation
        requestAnimationFrame(() => {
            const content = modal.querySelector('div');
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        });

        // Event listeners
        const discardBtn = modal.querySelector('#discardChanges');
        const saveBtn = modal.querySelector('#saveAndContinue');

        const cleanup = () => {
            const content = modal.querySelector('div');
            content.classList.remove('scale-100', 'opacity-100');
            content.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                if (modal.parentNode) {
                    document.body.removeChild(modal);
                }
                document.removeEventListener('keydown', onEscape);
            }, 300);
        };

        const onEscape = (e) => {
            if (e.key === 'Escape') {
                cleanup();
            }
        };

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                cleanup();
            }
        });

        document.addEventListener('keydown', onEscape);

        discardBtn.addEventListener('click', () => {
            cleanup();
            this.performNavigation(newStudent, newIndex, hasComment, comments);
        });

        saveBtn.addEventListener('click', () => {
            cleanup();
            
            // Hızlı kaydetme
            const form = document.getElementById('commentEditForm');
            const commentData = {
                content: content,
                tone: (form.tone && form.tone.value) || 'olumlu',
                period: (form.period && form.period.value) || '1',
                tags: []
            };

            // [Öğrenci Adı] placeholder'ını değiştir
            if (this.currentEditStudent) {
                commentData.content = window.replaceStudentName(commentData.content, this.currentEditStudent.name);
            }

            if (this.currentEditingId) {
                this.storage.updateComment(this.currentEditingId, commentData);
            } else {
                commentData.studentId = this.currentEditStudent.id;
                this.storage.addComment(commentData);
            }
            
            this.render();
            window.students && window.students.render();
            window.ui.showToast('Yorum kaydedildi!', 'success');
            
            this.performNavigation(newStudent, newIndex, hasComment, comments);
        });

        // ESC tuşu ile kapatma
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                cleanup();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    }

    performNavigation(newStudent, newIndex, hasComment, comments) {
        // Yeni öğrenciye geç
        if (hasComment) {
            this.currentEditingId = comments[0].id;
        } else {
            this.currentEditingId = null;
        }

        this.showEditModal(newStudent, hasComment ? comments[0] : null);
        
        // Navigation butonlarının durumunu güncelle
        this.updateNavigationButtons(newIndex, this.storage.getStudents().length);
    }

    updateNavigationButtons(currentIndex, totalStudents) {
        const prevBtn = document.getElementById('prevStudentBtn');
        const nextBtn = document.getElementById('nextStudentBtn');
        
        if (prevBtn && nextBtn) {
            // Butonları her zaman aktif tut (döngüsel navigasyon)
            prevBtn.disabled = false;
            nextBtn.disabled = false;
            
            // Tooltip güncelle
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : totalStudents - 1;
            const nextIndex = currentIndex < totalStudents - 1 ? currentIndex + 1 : 0;
            
            prevBtn.title = `Önceki Öğrenci (${prevIndex + 1}/${totalStudents})`;
            nextBtn.title = `Sonraki Öğrenci (${nextIndex + 1}/${totalStudents})`;
        }
    }

    

    getFilteredComments() {
        let comments = this.storage.getComments();

        if (this.currentPeriodFilter !== 'all') {
            comments = comments.filter(c => c.period === this.currentPeriodFilter);
        }

        if (this.currentToneFilter !== 'all') {
            comments = comments.filter(c => c.tone === this.currentToneFilter);
        }

        return comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    render() {
        const container = document.getElementById('commentsList');
        const comments = this.getFilteredComments();

        this.renderQuickWorkflowStudents();

        if (comments.length === 0) {
            container.innerHTML = this.renderEmptyState();
            return;
        }

        container.innerHTML = comments.map(comment => this.renderCommentCard(comment)).join('');
    }

    renderCommentCard(comment) {
        const student = this.storage.getStudentById(comment.studentId);
        if (!student) return '';

        const gradeColor = window.students.getGradeColor(student.grade);
        const initials = window.students.getInitials(student.name);
        const toneColor = this.getToneColor(comment.tone);
        const toneText = this.getToneText(comment.tone);
        const toneBgColor = this.getToneBackgroundColor(comment.tone);

        return `
            <div class="${toneBgColor} rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 animate-fade-in">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center space-x-3 mb-3">
                            <div class="w-10 h-10 ${gradeColor} rounded-full flex items-center justify-center">
                                <span class="text-white font-semibold text-sm">${initials}</span>
                            </div>
                            <div>
                                <h4 class="font-semibold text-gray-900 dark:text-white">${student.name}</h4>
                                <p class="text-sm text-gray-500 dark:text-gray-400">${student.grade}-${student.section} • ${comment.period}. Dönem</p>
                            </div>
                            <span class="${toneColor} text-white px-2 py-1 rounded-full text-xs font-medium">${toneText}</span>
                        </div>
                        <p class="text-gray-700 dark:text-gray-300 mb-3">${comment.content}</p>
                        ${comment.tags && comment.tags.length > 0 ? `
                            <div class="flex flex-wrap gap-1">
                                ${comment.tags.map(tag => `
                                    <span class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">${tag}</span>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                    <div class="flex space-x-2 ml-4">
                        <button onclick="window.comments.copyComment('${comment.id}')" class="text-gray-400 hover:text-primary transition-colors duration-200" title="Kopyala">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button onclick="window.comments.editComment('${comment.studentId}')" class="text-gray-400 hover:text-primary transition-colors duration-200" title="Düzenle">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="window.comments.deleteComment('${comment.id}')" class="text-gray-400 hover:text-red-500 transition-colors duration-200" title="Sil">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="text-center py-12">
                <div class="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <i class="fas fa-comment-slash text-gray-400 text-3xl"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Henüz yorum bulunmuyor</h3>
                <p class="text-gray-500 dark:text-gray-400 mb-4">
                    ${this.currentPeriodFilter !== 'all' || this.currentToneFilter !== 'all' 
                        ? 'Seçili filtrelere uygun yorum bulunamadı' 
                        : 'Öğrenci yorumları ekleyerek başlayın'}
                </p>
                <button onclick="window.app && window.app.tabs && window.app.tabs.switchTo('students')" class="bg-primary hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
                    <i class="fas fa-users mr-2"></i>
                    Öğrencilere Git
                </button>
            </div>
        `;
    }

    getToneColor(tone) {
        const colors = {
            'olumlu': 'bg-positive',
            'notr': 'bg-neutral',
            'olumsuz': 'bg-negative'
        };
        return colors[tone] || 'bg-gray-500';
    }

    getToneText(tone) {
        const texts = {
            'olumlu': '😊 Olumlu',
            'notr': '😐 Nötr',
            'olumsuz': '😕 Olumsuz'
        };
        return texts[tone] || 'Bilinmiyor';
    }

    getToneBackgroundColor(tone) {
        const colors = {
            'olumlu': 'bg-green-50 dark:bg-green-900/20',
            'notr': 'bg-yellow-50 dark:bg-yellow-900/20',
            'olumsuz': 'bg-red-50 dark:bg-red-900/20'
        };
        return colors[tone] || 'bg-white dark:bg-gray-800';
    }

    showAllCommentsModal() {
        const comments = this.storage.getComments();
        const container = document.getElementById('allCommentsList');
        
        if (comments.length === 0) {
            container.innerHTML = this.renderEmptyState();
        } else {
            container.innerHTML = comments.map(comment => this.renderCommentCard(comment)).join('');
        }

        window.ui.showModal('allCommentsModal');
    }

    copyComment(id) {
        const comment = this.storage.getCommentById(id);
        const student = this.storage.getStudentById(comment.studentId);
        
        if (!comment || !student) return;

        const text = `${student.name} (${student.grade}-${student.section}) - ${comment.period}. Dönem\n\n${comment.content}`;
        
        navigator.clipboard.writeText(text).then(() => {
            window.ui.showToast('Yorum kopyalandı!', 'success');
        }).catch(() => {
            window.ui.showToast('Kopyalama işlemi başarısız!', 'error');
        });
    }

    deleteComment(id) {
        const comment = this.storage.getCommentById(id);
        const student = this.storage.getStudentById(comment.studentId);
        
        if (!comment || !student) return;

        if (confirm(`${student.name} için yazılan yorum silinecek. Emin misiniz?`)) {
            if (this.storage.deleteComment(id)) {
                this.render();
                window.students && window.students.render();
                window.app && window.app.dashboard && window.app.dashboard.updateStats();
                window.ui.showToast('Yorum başarıyla silindi!', 'success');
            } else {
                window.ui.showToast('Silme işlemi sırasında hata oluştu!', 'error');
            }
        }
    }

    getCommentCount() {
        return this.storage.getComments().length;
    }

    getCommentsByTone(tone) {
        const comments = this.storage.getComments();
        return comments.filter(comment => comment.tone === tone);
    }

    getAllTags() {
        const comments = this.storage.getComments();
        const allTags = [];
        
        comments.forEach(comment => {
            if (comment.tags && comment.tags.length > 0) {
                allTags.push(...comment.tags);
            }
        });

        // Benzersiz etiketleri ve sayılarını döndür
        const tagCounts = {};
        allTags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });

        return Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10); // En popüler 10 etiketi döndür
    }
}

// Global comment manager instance will be created in app.js
