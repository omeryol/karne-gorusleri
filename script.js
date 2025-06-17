// Comment Management System
class CommentManager {
    constructor() {
        this.allComments = [];
        this.filteredComments = [];
        this.currentModal = null;
        this.filterTimeout = null;
        this.init();
    }

    // Initialize the application
    init() {
        this.loadComments();
        this.bindEvents();
        this.updateStatistics();
    }

    // Load comments from the data file with improved loading
    loadComments() {
        this.showLoading();
        this.allComments = [];
        
        // Simulate loading time for better UX
        setTimeout(() => {
            try {
                // Process comments data structure
                Object.keys(commentsData).forEach(grade => {
                    Object.keys(commentsData[grade]).forEach(term => {
                        commentsData[grade][term].forEach(comment => {
                            this.allComments.push({
                                ...comment,
                                grade: parseInt(grade),
                                term: parseInt(term),
                                category: this.categorizeComment(comment.title, comment.comment)
                            });
                        });
                    });
                });

                this.filteredComments = [...this.allComments];
                this.renderComments();
                this.updateStatistics();
                this.hideLoading();
                
                console.log(`${this.allComments.length} yorum başarıyla yüklendi`);
            } catch (error) {
                console.error('Yorumlar yüklenirken hata:', error);
                this.hideLoading();
                this.showError('Yorumlar yüklenirken bir hata oluştu.');
            }
        }, 500);
    }
    
    // Show loading indicator
    showLoading() {
        const loadingElement = document.getElementById('loadingSpinner');
        const container = document.getElementById('commentsContainer');
        if (loadingElement) {
            loadingElement.classList.remove('d-none');
        }
        if (container) {
            container.innerHTML = '';
        }
    }
    
    // Show error message
    showError(message) {
        const container = document.getElementById('commentsContainer');
        container.innerHTML = `
            <div class="alert alert-danger text-center" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${message}
            </div>
        `;
    }

    // Categorize comments based on content
    categorizeComment(title, comment) {
        const positiveKeywords = ['başarılı', 'yüksek', 'güçlü', 'dikkat çek', 'öne çık', 'aktif', 'motivasyon', 'liderlik', 'yaratıcı', 'uyum', 'etkin', 'düzenli'];
        const developmentKeywords = ['gelişim', 'destek', 'potansiyel', 'geliştir', 'ilerlem', 'çalış'];
        const attentionKeywords = ['problem', 'zorluk', 'düşük', 'dağınık', 'uyarı', 'gerileme', 'eksik', 'zorlan'];

        const text = (title + ' ' + comment).toLowerCase();

        if (attentionKeywords.some(keyword => text.includes(keyword))) {
            return 'attention';
        } else if (developmentKeywords.some(keyword => text.includes(keyword))) {
            return 'development';
        } else if (positiveKeywords.some(keyword => text.includes(keyword))) {
            return 'positive';
        } else {
            return 'neutral';
        }
    }

    // Bind event listeners
    bindEvents() {
        // Filter controls
        document.getElementById('gradeSelect').addEventListener('change', () => this.applyFilters());
        document.getElementById('termSelect').addEventListener('change', () => this.applyFilters());
        document.getElementById('searchInput').addEventListener('input', () => this.applyFilters());
        document.getElementById('clearFilters').addEventListener('click', () => this.clearFilters());

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => this.exportComments());

        // Modal events
        document.getElementById('previewBtn').addEventListener('click', () => this.previewComment());
        document.getElementById('copyCommentBtn').addEventListener('click', () => this.copyComment());
        document.getElementById('studentNameInput').addEventListener('input', () => this.previewComment());
    }

    // Apply filters to comments with debouncing
    applyFilters() {
        // Clear previous timeout
        if (this.filterTimeout) {
            clearTimeout(this.filterTimeout);
        }
        
        // Debounce filter application for better performance
        this.filterTimeout = setTimeout(() => {
            const grade = document.getElementById('gradeSelect').value;
            const term = document.getElementById('termSelect').value;
            const search = document.getElementById('searchInput').value.toLowerCase().trim();

            this.filteredComments = this.allComments.filter(comment => {
                const matchesGrade = !grade || comment.grade == grade;
                const matchesTerm = !term || comment.term == term;
                const matchesSearch = !search || 
                    comment.title.toLowerCase().includes(search) || 
                    comment.comment.toLowerCase().includes(search);

                return matchesGrade && matchesTerm && matchesSearch;
            });

            this.renderComments();
            this.updateStatistics();
        }, 300); // 300ms debounce delay
    }

    // Clear all filters
    clearFilters() {
        document.getElementById('gradeSelect').value = '';
        document.getElementById('termSelect').value = '';
        document.getElementById('searchInput').value = '';
        this.filteredComments = [...this.allComments];
        this.renderComments();
        this.updateStatistics();
    }

    // Render comments in the UI with optimized performance
    renderComments() {
        const container = document.getElementById('commentsContainer');
        const resultCount = document.getElementById('resultCount');
        const noResults = document.getElementById('noResults');

        resultCount.textContent = `${this.filteredComments.length} sonuç`;

        if (this.filteredComments.length === 0) {
            container.innerHTML = '';
            noResults.classList.remove('d-none');
            return;
        }

        noResults.classList.add('d-none');

        // Use DocumentFragment for performance and add progressive loading
        const fragment = document.createDocumentFragment();
        
        this.filteredComments.forEach((comment, index) => {
            const charCount = comment.comment.length;
            const categoryClass = comment.category;
            const categoryIcon = this.getCategoryIcon(comment.category);
            const excerpt = comment.comment.length > 150 ? 
                comment.comment.substring(0, 150) + '...' : comment.comment;
            
            // Create card element with staggered animation
            const cardDiv = document.createElement('div');
            cardDiv.className = `comment-card card ${categoryClass} mb-3 shadow-sm`;
            cardDiv.setAttribute('data-comment-id', comment.id);
            cardDiv.style.animationDelay = `${index * 0.05}s`;
            
            cardDiv.innerHTML = `
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div class="flex-grow-1">
                            <h6 class="comment-title text-primary fw-bold mb-2">${this.highlightSearch(comment.title)}</h6>
                            <div class="comment-meta">
                                <span class="badge bg-gradient bg-primary me-2">
                                    ${comment.grade}. Sınıf - ${comment.term}. Dönem
                                </span>
                                <small class="text-muted">
                                    <i class="fas fa-text-width me-1"></i>
                                    ${charCount} karakter
                                </small>
                            </div>
                        </div>
                        <div class="comment-actions">
                            <button class="btn btn-outline-primary btn-sm btn-detail" title="Detayları Görüntüle">
                                <i class="fas fa-eye me-1"></i>
                                Detay
                            </button>
                        </div>
                    </div>
                    <div class="comment-content mb-3">
                        <p class="mb-0 text-muted">${this.highlightSearch(excerpt)}</p>
                    </div>
                    <div class="border-top pt-2">
                        <small class="text-muted d-flex align-items-center">
                            <i class="${categoryIcon} me-2"></i>
                            ${this.getCategoryName(comment.category)}
                        </small>
                    </div>
                </div>
            `;
            
            // Add click event for detail button
            const detailBtn = cardDiv.querySelector('.btn-detail');
            detailBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showCommentModal(comment.id);
            });
            
            fragment.appendChild(cardDiv);
        });

        // Clear and append all elements at once
        container.innerHTML = '';
        container.appendChild(fragment);
    }

    // Get category icon
    getCategoryIcon(category) {
        const icons = {
            positive: 'fas fa-thumbs-up text-success',
            development: 'fas fa-chart-line text-warning',
            attention: 'fas fa-exclamation-triangle text-danger',
            neutral: 'fas fa-circle text-info'
        };
        return icons[category] || icons.neutral;
    }

    // Get category name
    getCategoryName(category) {
        const names = {
            positive: 'Olumlu Değerlendirme',
            development: 'Gelişim Odaklı',
            attention: 'Dikkat Gerektiren',
            neutral: 'Genel Değerlendirme'
        };
        return names[category] || names.neutral;
    }

    // Highlight search terms
    highlightSearch(text) {
        const search = document.getElementById('searchInput').value.toLowerCase();
        if (!search) return text;

        const regex = new RegExp(`(${search})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }

    // Show comment modal
    showCommentModal(commentId) {
        const comment = this.allComments.find(c => c.id === commentId);
        if (!comment) return;

        this.currentModal = comment;

        // Populate modal
        document.getElementById('modalGradeTerm').textContent = `${comment.grade}. Sınıf - ${comment.term}. Dönem`;
        document.getElementById('modalCharCount').textContent = `${comment.comment.length} karakter`;
        document.getElementById('modalTitle').textContent = comment.title;
        document.getElementById('modalComment').textContent = comment.comment;
        document.getElementById('studentNameInput').value = '';
        document.getElementById('previewComment').classList.add('d-none');

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('commentModal'));
        modal.show();
    }

    // Preview comment with student name
    previewComment() {
        if (!this.currentModal) return;

        const studentName = document.getElementById('studentNameInput').value.trim();
        const previewDiv = document.getElementById('previewComment');

        if (studentName) {
            const customizedComment = this.currentModal.comment.replace(/\[Öğrenci Adı\]/g, studentName);
            previewDiv.textContent = customizedComment;
            previewDiv.classList.remove('d-none');
        } else {
            previewDiv.classList.add('d-none');
        }
    }

    // Copy comment to clipboard
    async copyComment() {
        if (!this.currentModal) return;

        const studentName = document.getElementById('studentNameInput').value.trim();
        const comment = studentName ? 
            this.currentModal.comment.replace(/\[Öğrenci Adı\]/g, studentName) : 
            this.currentModal.comment;

        try {
            await navigator.clipboard.writeText(comment);
            
            // Show success feedback
            const btn = document.getElementById('copyCommentBtn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check me-1"></i>Kopyalandı!';
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-success');
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.remove('btn-success');
                btn.classList.add('btn-primary');
            }, 2000);
        } catch (err) {
            console.error('Kopyalama hatası:', err);
            alert('Kopyalama başarısız oldu. Lütfen metni manuel olarak seçin.');
        }
    }

    // Update statistics
    updateStatistics() {
        const total = this.filteredComments.length;
        const positive = this.filteredComments.filter(c => c.category === 'positive').length;
        const development = this.filteredComments.filter(c => c.category === 'development').length;
        const attention = this.filteredComments.filter(c => c.category === 'attention').length;

        document.getElementById('totalComments').textContent = total;
        document.getElementById('positiveComments').textContent = positive;
        document.getElementById('developmentComments').textContent = development;
        document.getElementById('attentionComments').textContent = attention;
    }

    // Export comments
    exportComments() {
        const data = {
            exportDate: new Date().toISOString(),
            totalComments: this.filteredComments.length,
            filters: {
                grade: document.getElementById('gradeSelect').value,
                term: document.getElementById('termSelect').value,
                search: document.getElementById('searchInput').value
            },
            comments: this.filteredComments
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ogrenci_yorumlari_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Hide loading spinner
    hideLoading() {
        document.getElementById('loadingSpinner').style.display = 'none';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.commentManager = new CommentManager();
});
