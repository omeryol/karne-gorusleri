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
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        // Yorum düzenleme formı
        document.getElementById('commentEditForm').addEventListener('submit', (e) => {
            this.handleCommentSubmit(e);
        });

        // Filtreler
        document.getElementById('periodFilter').addEventListener('change', (e) => {
            this.currentPeriodFilter = e.target.value;
            this.render();
        });

        document.getElementById('commentToneFilter').addEventListener('change', (e) => {
            this.currentToneFilter = e.target.value;
            this.render();
        });

        // Tüm yorumları görüntüle
        document.getElementById('viewAllCommentsBtn').addEventListener('click', () => {
            this.showAllCommentsModal();
        });

        // AI önerisi
        document.getElementById('aiSuggestBtn').addEventListener('click', () => {
            window.templates.showAISuggestions();
        });

        // Edit modal AI suggestions and placeholder buttons
        if (document.getElementById('editAISuggestionsBtn')) {
            document.getElementById('editAISuggestionsBtn').addEventListener('click', () => {
                if (this.currentEditStudent) {
                    window.templates.setCurrentStudent(this.currentEditStudent);
                }
                window.templates.showAISuggestions();
            });
        }

        if (document.getElementById('editPlaceholderBtn')) {
            document.getElementById('editPlaceholderBtn').addEventListener('click', () => {
                this.showPlaceholderModal();
            });
        }

        // Karakter sayacı
        const textarea = document.querySelector('#commentEditForm textarea[name="content"]');
        if (textarea) {
            textarea.addEventListener('input', (e) => {
                this.updateCharacterCount(e.target.value.length);
            });
        }

        // Etiket ekleme
        document.getElementById('newTagInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addTag(e.target.value.trim());
                e.target.value = '';
            }
        });

        // İptal butonu
        document.getElementById('cancelEditBtn').addEventListener('click', () => {
            window.ui.hideModal('commentEditModal');
        });
    }

    addComment(studentId) {
        const student = this.storage.getStudentById(studentId);
        if (!student) return;

        this.currentEditingId = null;
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
                    [Öğrenci Adı] yer tutucusu "<strong>${student.name.split(' ')[0]}</strong>" ile değiştirilecek.
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
            const firstName = this.currentEditStudent.name.split(' ')[0];
            textarea.value = textarea.value.replace(/\[Öğrenci Adı\]/g, firstName);
            this.updateCharacterCount(textarea.value.length);
            window.ui.showToast('Yer tutucu başarıyla uygulandı!', 'success');
        }
    }

    showEditModal(student, comment) {
        this.currentEditStudent = student;
        // Öğrenci bilgilerini doldur
        document.getElementById('editStudentName').textContent = student.name;
        document.getElementById('editStudentGradeSection').textContent = `${student.grade}-${student.section}`;
        document.getElementById('editStudentInitials').textContent = window.students.getInitials(student.name);
        
        const avatar = document.getElementById('editStudentAvatar');
        avatar.className = `w-12 h-12 ${window.students.getGradeColor(student.grade)} rounded-full flex items-center justify-center`;

        // Form verilerini doldur
        const form = document.getElementById('commentEditForm');
        if (comment) {
            form.content.value = comment.content;
            form.tone.value = comment.tone;
            form.period.value = comment.period;
            this.updateCharacterCount(comment.content.length);
            this.renderCurrentTags(comment.tags || []);
        } else {
            form.reset();
            form.period.value = '1'; // Varsayılan dönem
            this.updateCharacterCount(0);
            this.renderCurrentTags([]);
        }

        window.ui.showModal('commentEditModal');
    }

    handleCommentSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const commentData = {
            content: formData.get('content').trim(),
            tone: formData.get('tone'),
            period: formData.get('period'),
            tags: this.getCurrentTags()
        };

        // [Öğrenci Adı] placeholder'ını değiştir
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

        if (!comment.tone || !['olumlu', 'notr', 'olumsuz'].includes(comment.tone)) {
            window.ui.showToast('Geçerli bir ton seçin!', 'error');
            return false;
        }

        if (!comment.period || !['1', '2'].includes(comment.period)) {
            window.ui.showToast('Geçerli bir dönem seçin!', 'error');
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
            
            // Renk güncelleme
            const parent = charCount.parentElement;
            parent.classList.remove('text-red-500', 'text-yellow-500', 'text-gray-500');
            
            if (count > 450) {
                parent.classList.add('text-red-500');
            } else if (count > 350) {
                parent.classList.add('text-yellow-500');
            } else {
                parent.classList.add('text-gray-500');
            }
        }
    }

    addTag(tag) {
        if (!tag || tag.length < 2) return;
        
        const currentTags = this.getCurrentTags();
        if (!currentTags.includes(tag.toLowerCase())) {
            currentTags.push(tag.toLowerCase());
            this.renderCurrentTags(currentTags);
        }
    }

    removeTag(tag) {
        const currentTags = this.getCurrentTags();
        const filtered = currentTags.filter(t => t !== tag);
        this.renderCurrentTags(filtered);
    }

    getCurrentTags() {
        const tagElements = document.querySelectorAll('#currentTags .tag');
        return Array.from(tagElements).map(el => el.dataset.tag);
    }

    renderCurrentTags(tags) {
        const container = document.getElementById('currentTags');
        if (!container) return;

        container.innerHTML = tags.map(tag => `
            <span class="tag bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200 flex items-center" data-tag="${tag}">
                ${tag}
                <button onclick="window.comments.removeTag('${tag}')" class="ml-2 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100">
                    <i class="fas fa-times text-xs"></i>
                </button>
            </span>
        `).join('');
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

        return `
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 animate-fade-in">
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
            'olumlu': 'Olumlu',
            'notr': 'Nötr',
            'olumsuz': 'Olumsuz'
        };
        return texts[tone] || 'Bilinmiyor';
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
