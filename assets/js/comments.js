// Yorum yönetimi sınıfı
class CommentManager {
    constructor(storage) {
        this.storage = storage;
        this.currentPeriodFilter = 'all';
        this.currentToneFilter = 'all';
        this.currentEditingId = null;
        this.init();
    }

    init() {
        debugLog('CommentManager.init() started');
        try {
            this.bindEvents();
            this.render();
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
                this.currentPeriodFilter = e.target.value;
                this.render();
            });
        }

        const commentToneFilter = document.getElementById('commentToneFilter');
        if (commentToneFilter) {
            commentToneFilter.addEventListener('change', (e) => {
                this.currentToneFilter = e.target.value;
                this.render();
            });
        }

        // Tüm yorumları görüntüle
        const viewAllCommentsBtn = document.getElementById('viewAllCommentsBtn');
        if (viewAllCommentsBtn) {
            viewAllCommentsBtn.addEventListener('click', () => {
                this.showAllCommentsModal();
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

        const modal = document.createElement('div');
        modal.id = 'placeholderModal';
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
            const firstName = student.name.split(' ')[0];
            commentData.content = commentData.content.replace(/\[Öğrenci Adı\]/g, firstName);
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
            this.showNavigationConfirmModal(currentContent, newStudent, newIndex, hasComment, comments);
        } else {
            // Değişiklik yoksa direkt geç
            this.performNavigation(newStudent, newIndex, hasComment, comments);
        }
    }

    showNavigationConfirmModal(content, newStudent, newIndex, hasComment, comments) {
        const modal = document.createElement('div');
        modal.id = 'navigationConfirmModal';
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
            }, 300);
        };

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
                const firstName = this.currentEditStudent.name.split(' ')[0];
                commentData.content = commentData.content.replace(/\[Öğrenci Adı\]/g, firstName);
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
