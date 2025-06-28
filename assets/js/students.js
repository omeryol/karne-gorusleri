// Öğrenci yönetimi sınıfı
class StudentManager {
    constructor(storage) {
        debugLog('StudentManager constructor called');
        this.storage = storage;
        this.currentFilter = 'all';
        this.selectedStudents = new Set();
        this.isSelectionMode = false;
        this.init();
        debugLog('StudentManager constructor completed');
    }

    init() {
        debugLog('StudentManager.init() started');
        try {
            this.bindEvents();
            this.render();
            debugLog('StudentManager.init() completed successfully');
        } catch (error) {
            debugLog('ERROR in StudentManager.init():', error.message);
            throw error;
        }
    }

    bindEvents() {
        // Öğrenci ekleme butonları
        const addStudentBtn = document.getElementById('addStudentBtn');
        if (addStudentBtn) {
            addStudentBtn.addEventListener('click', () => {
                this.showAddModal();
            });
        }

        // Form gönderme olayları
        const singleStudentForm = document.getElementById('singleStudentForm');
        if (singleStudentForm) {
            singleStudentForm.addEventListener('submit', (e) => {
                this.handleSingleStudentSubmit(e);
            });
        }

        const bulkStudentForm = document.getElementById('bulkStudentForm');
        if (bulkStudentForm) {
            bulkStudentForm.addEventListener('submit', (e) => {
                this.handleBulkStudentSubmit(e);
            });
        }

        // Sınıf filtreleri
        document.querySelectorAll('.student-grade-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilterChange(e);
            });
        });

        // Touch ve swipe event'leri için delegasyon
        this.setupTouchEvents();
        
        // Klavye kısayolları
        this.setupKeyboardShortcuts();
        
        debugLog('StudentManager.bindEvents() completed successfully');
    }

    showAddModal() {
        window.ui.showModal('addStudentModal');
    }

    handleSingleStudentSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        const student = {
            name: formData.get('name').trim(),
            grade: formData.get('grade'),
            section: formData.get('section')
        };

        if (this.validateStudent(student)) {
            if (this.storage.addStudent(student)) {
                this.render();
                window.ui.hideModal('addStudentModal');
                e.target.reset();
                window.ui.showToast('Öğrenci başarıyla eklendi!', 'success');
            } else {
                window.ui.showToast('Öğrenci eklenirken hata oluştu!', 'error');
            }
        }
    }

    handleBulkStudentSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        const studentList = formData.get('studentList').trim();
        const grade = formData.get('grade');
        const section = formData.get('section');

        if (!studentList || !grade || !section) {
            window.ui.showToast('Lütfen tüm alanları doldurun!', 'error');
            return;
        }

        const names = studentList.split('\n').filter(name => name.trim());
        let addedCount = 0;

        names.forEach(name => {
            const student = {
                name: name.trim(),
                grade: grade,
                section: section
            };

            if (this.validateStudent(student)) {
                if (this.storage.addStudent(student)) {
                    addedCount++;
                }
            }
        });

        if (addedCount > 0) {
            this.render();
            window.ui.hideModal('addStudentModal');
            e.target.reset();
            window.ui.showToast(`${addedCount} öğrenci başarıyla eklendi!`, 'success');
        } else {
            window.ui.showToast('Hiçbir öğrenci eklenemedi!', 'error');
        }
    }

    validateStudent(student) {
        if (!student.name || student.name.length < 2) {
            window.ui.showToast('Öğrenci adı en az 2 karakter olmalıdır!', 'error');
            return false;
        }

        if (!student.grade || !['5', '6', '7', '8'].includes(student.grade)) {
            window.ui.showToast('Geçerli bir sınıf seçin!', 'error');
            return false;
        }

        if (!student.section || !['A', 'B', 'C', 'D', 'E'].includes(student.section)) {
            window.ui.showToast('Geçerli bir şube seçin!', 'error');
            return false;
        }

        // Aynı isimde öğrenci kontrolü
        const existingStudents = this.storage.getStudents();
        const duplicate = existingStudents.find(s => 
            s.name.toLowerCase() === student.name.toLowerCase() &&
            s.grade === student.grade &&
            s.section === student.section
        );

        if (duplicate) {
            window.ui.showToast('Bu öğrenci zaten mevcut!', 'error');
            return false;
        }

        return true;
    }

    handleFilterChange(e) {
        const grade = e.target.dataset.grade;

        // Aktif filtreyi güncelle
        document.querySelectorAll('.student-grade-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');

        this.currentFilter = grade;
        this.render();
    }

    getFilteredStudents() {
        const students = this.storage.getStudents();

        if (this.currentFilter === 'all') {
            return students;
        }

        return students.filter(student => student.grade === this.currentFilter);
    }

    render() {
        const grid = document.getElementById('studentsGrid');
        const students = this.getFilteredStudents();

        if (students.length === 0) {
            grid.innerHTML = this.renderEmptyState();
            return;
        }

        grid.innerHTML = students.map(student => this.renderStudentCard(student)).join('');
    }

    renderStudentCard(student) {
        const comments = this.storage.getCommentsByStudentId(student.id);
        const hasComment = comments.length > 0;
        const gradeColor = this.getGradeColor(student.grade);
        const initials = this.getInitials(student.name);
        const lastComment = hasComment ? comments[comments.length - 1] : null;

        return `
            <div class="student-card swipeable bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                 data-student-id="${student.id}"
                 onclick="window.students && window.students.handleCommentAction('${student.id}', ${hasComment})"
                 ondblclick="event.stopPropagation(); window.students && window.students.editStudent('${student.id}')"
                 ontouchstart="this.touchStartHandler && this.touchStartHandler(event)"
                 ontouchmove="this.touchMoveHandler && this.touchMoveHandler(event)"
                 ontouchend="this.touchEndHandler && this.touchEndHandler(event)">
                
                <!-- Swipe Indicators -->
                <div class="swipe-indicator left">
                    <i class="fas fa-edit text-sm"></i>
                </div>
                <div class="swipe-indicator right">
                    <i class="fas fa-comment-plus text-sm"></i>
                </div>
                
                <!-- Selection Checkbox -->
                <div class="selection-checkbox absolute top-2 left-2 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs">
                    <i class="fas fa-check"></i>
                </div>

                <!-- Header Section -->
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-14 h-14 ${gradeColor} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <span class="text-white font-bold text-lg">${initials}</span>
                        </div>
                        <div>
                            <h3 class="font-bold text-gray-900 dark:text-white text-lg">${student.name}</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">${student.grade}-${student.section} Sınıfı</p>
                        </div>
                    </div>
                    <div class="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button onclick="event.stopPropagation(); window.students && window.students.editStudent('${student.id}')" 
                                class="touch-target w-10 h-10 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-800 transition-all duration-200 flex items-center justify-center group/btn" 
                                title="Düzenle"
                                ontouchstart="this.classList.add('haptic-light')">
                            <i class="fas fa-edit text-sm group-hover/btn:scale-110 transition-transform"></i>
                        </button>
                        <button onclick="event.stopPropagation(); window.students && window.students.deleteStudent('${student.id}')" 
                                class="touch-target w-10 h-10 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-800 transition-all duration-200 flex items-center justify-center group/btn" 
                                title="Sil"
                                ontouchstart="this.classList.add('haptic-medium')">
                            <i class="fas fa-trash text-sm group-hover/btn:scale-110 transition-transform"></i>
                        </button>
                    </div>
                </div>

                <!-- Progress Section -->
                <div class="mb-4">
                    <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span class="font-medium">Yorum Durumu</span>
                        <span class="${hasComment ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'} font-bold text-sm">
                            ${hasComment ? '✓ Tamamlandı' : '⏳ Beklemede'}
                        </span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div class="${hasComment ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-amber-400 to-amber-500'} h-2 rounded-full transition-all duration-500" 
                             style="width: ${hasComment ? '100' : '25'}%"></div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex space-x-3">
                    <button onclick="window.students && window.students.handleCommentAction('${student.id}', ${hasComment})" 
                            class="touch-target flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg hover:shadow-purple-500/25"
                            ontouchstart="this.classList.add('haptic-light')">
                        <i class="fas fa-${hasComment ? 'edit' : 'plus'} text-sm"></i>
                        <span>${hasComment ? 'Düzenle' : 'Yorum Ekle'}</span>
                    </button>
                    <button onclick="event.stopPropagation(); window.students && window.students.copyStudentInfo('${student.id}')" 
                            class="touch-target bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center shadow-md" 
                            title="Bilgileri Kopyala"
                            ontouchstart="this.classList.add('haptic-light')">
                        <i class="fas fa-copy text-sm"></i>
                    </button>
                </div>

                <!-- Hover Preview Overlay -->
                <div class="preview-overlay">
                    <div class="text-center space-y-3">
                        <div class="w-16 h-16 ${gradeColor} rounded-full flex items-center justify-center mx-auto">
                            <span class="text-white font-bold text-xl">${initials}</span>
                        </div>
                        <h3 class="font-bold text-xl">${student.name}</h3>
                        <p class="text-lg opacity-90">${student.grade}-${student.section} Sınıfı</p>
                        ${hasComment ? `
                            <div class="bg-white/20 rounded-xl p-3 mt-4">
                                <p class="text-sm font-medium mb-2">Son Yorum:</p>
                                <p class="text-xs opacity-80 line-clamp-3">${lastComment ? lastComment.content.substring(0, 120) + '...' : ''}</p>
                            </div>
                        ` : `
                            <div class="bg-white/20 rounded-xl p-3 mt-4">
                                <p class="text-sm">Henüz yorum eklenmemiş</p>
                                <p class="text-xs opacity-80 mt-1">Tıklayarak yorum ekleyin</p>
                            </div>
                        `}
                        <div class="flex space-x-2 justify-center mt-4">
                            <button class="bg-white/30 hover:bg-white/40 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                ${hasComment ? 'Düzenle' : 'Ekle'}
                            </button>
                            <button class="bg-white/30 hover:bg-white/40 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                Kopyala
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="col-span-full text-center py-12">
                <div class="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <i class="fas fa-user-plus text-gray-400 text-3xl"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Henüz öğrenci eklenmemiş</h3>
                <p class="text-gray-500 dark:text-gray-400 mb-4">
                    ${this.currentFilter === 'all' ? 'İlk öğrencinizi ekleyerek başlayın' : `${this.currentFilter}. sınıfta öğrenci bulunmuyor`}
                </p>
                <button onclick="window.students && window.students.showAddModal()" class="bg-primary hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
                    <i class="fas fa-plus mr-2"></i>
                    Öğrenci Ekle
                </button>
            </div>
        `;
    }

    getGradeColor(grade) {
        const colors = {
            '5': 'bg-grade-5',
            '6': 'bg-grade-6',
            '7': 'bg-grade-7',
            '8': 'bg-grade-8'
        };
        return colors[grade] || 'bg-gray-500';
    }

    getInitials(name) {
        return name.split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
    }

    editStudent(id) {
        const student = this.storage.getStudentById(id);
        if (!student) return;

        // Modal içerisine öğrenci bilgilerini doldur
        const form = document.getElementById('singleStudentForm');
        form.name.value = student.name;
        form.grade.value = student.grade;
        form.section.value = student.section;

        // Form submit handler'ını güncelle
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);

        newForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);

            const updates = {
                name: formData.get('name').trim(),
                grade: formData.get('grade'),
                section: formData.get('section')
            };

            if (this.validateStudent(updates)) {
                if (this.storage.updateStudent(id, updates)) {
                    this.render();
                    window.ui.hideModal('addStudentModal');
                    window.ui.showToast('Öğrenci bilgileri güncellendi!', 'success');
                } else {
                    window.ui.showToast('Güncelleme sırasında hata oluştu!', 'error');
                }
            }
        });

        this.showAddModal();
    }

    async deleteStudent(id) {
        const student = this.storage.getStudentById(id);
        if (!student) return;

        const comments = this.storage.getCommentsByStudentId(id);
        const commentText = comments.length > 0 ? ' ve yorumları' : '';

        const confirmed = await window.ui.confirmDialog(
            `${student.name} adlı öğrenci${commentText} kalıcı olarak silinecek. Bu işlem geri alınamaz!`,
            'Öğrenci Sil'
        );

        if (confirmed) {
            if (this.storage.deleteStudent(id)) {
                this.render();
                window.app && window.app.dashboard && window.app.dashboard.updateStats();
                window.ui.showToast('Öğrenci başarıyla silindi!', 'success');
            } else {
                window.ui.showErrorToast('Silme işlemi sırasında hata oluştu!');
            }
        }
    }

    copyStudentInfo(id) {
        const student = this.storage.getStudentById(id);
        if (!student) return;

        const comments = this.storage.getCommentsByStudentId(id);
        let text = `${student.name} (${student.grade}-${student.section})`;

        if (comments.length > 0) {
            text += `\n\nYorum:\n${comments[0].content}`;
        }

        navigator.clipboard.writeText(text).then(() => {
            window.ui.showToast('Öğrenci bilgileri kopyalandı!', 'success');
        }).catch(() => {
            window.ui.showToast('Kopyalama işlemi başarısız!', 'error');
        });
    }

    getStudentCount() {
        return this.storage.getStudents().length;
    }

    getStudentsByGrade(grade) {
        const students = this.storage.getStudents();
        return students.filter(student => student.grade === grade);
    }

    handleCommentAction(studentId, hasComment) {
        debugLog('handleCommentAction called:', { studentId, hasComment });

        if (!window.comments) {
            debugLog('ERROR: Comments manager not available');
            return;
        }

        if (hasComment) {
            debugLog('Editing existing comment');
            window.comments.editComment(studentId);
        } else {
            debugLog('Adding new comment');
            window.comments.addComment(studentId);
        }
    }

    setupTouchEvents() {
        const studentsGrid = document.getElementById('studentsGrid');
        if (!studentsGrid) return;

        studentsGrid.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        studentsGrid.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
        studentsGrid.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+A - Tümünü seç
            if (e.ctrlKey && e.key === 'a' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                this.selectAllStudents();
            }
            // Escape - Seçimi temizle
            if (e.key === 'Escape') {
                this.clearSelection();
            }
        });
    }

    handleTouchStart(e) {
        if (!e.target.closest('.student-card')) return;
        
        const card = e.target.closest('.student-card');
        const touch = e.touches[0];
        
        card.touchStartX = touch.clientX;
        card.touchStartY = touch.clientY;
        card.touchStartTime = Date.now();
        
        // Haptic feedback simülasyonu
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    }

    handleTouchMove(e) {
        if (!e.target.closest('.student-card')) return;
        
        const card = e.target.closest('.student-card');
        if (!card.touchStartX) return;
        
        const touch = e.touches[0];
        const deltaX = touch.clientX - card.touchStartX;
        const deltaY = touch.clientY - card.touchStartY;
        
        // Horizontal swipe threshold
        if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 100) {
            if (deltaX > 0) {
                card.style.transform = `translateX(${Math.min(deltaX, 100)}px)`;
                card.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'; // Blue tint for edit
            } else {
                card.style.transform = `translateX(${Math.max(deltaX, -100)}px)`;
                card.style.backgroundColor = 'rgba(16, 185, 129, 0.1)'; // Green tint for comment
            }
        }
    }

    handleTouchEnd(e) {
        if (!e.target.closest('.student-card')) return;
        
        const card = e.target.closest('.student-card');
        if (!card.touchStartX) return;
        
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - card.touchStartX;
        const deltaY = touch.clientY - card.touchStartY;
        const duration = Date.now() - card.touchStartTime;
        const studentId = card.dataset.studentId;
        
        // Reset visual state
        card.style.transform = '';
        card.style.backgroundColor = '';
        
        // Swipe actions
        if (Math.abs(deltaX) > 80 && Math.abs(deltaY) < 100) {
            if (deltaX > 0) {
                // Right swipe - Edit student
                this.editStudent(studentId);
                if (navigator.vibrate) navigator.vibrate(20);
            } else {
                // Left swipe - Add/Edit comment
                const comments = this.storage.getCommentsByStudentId(studentId);
                this.handleCommentAction(studentId, comments.length > 0);
                if (navigator.vibrate) navigator.vibrate(20);
            }
        }
        // Double tap detection
        else if (duration < 300 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
            if (card.lastTapTime && Date.now() - card.lastTapTime < 300) {
                // Double tap - Toggle selection
                this.toggleStudentSelection(studentId);
                if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
            } else {
                card.lastTapTime = Date.now();
            }
        }
        
        // Cleanup
        delete card.touchStartX;
        delete card.touchStartY;
        delete card.touchStartTime;
    }

    toggleStudentSelection(studentId) {
        if (this.selectedStudents.has(studentId)) {
            this.selectedStudents.delete(studentId);
        } else {
            this.selectedStudents.add(studentId);
        }
        
        this.updateSelectionUI();
        this.updateBulkActionsBar();
    }

    selectAllStudents() {
        const students = this.getFilteredStudents();
        students.forEach(student => this.selectedStudents.add(student.id));
        this.updateSelectionUI();
        this.updateBulkActionsBar();
    }

    clearSelection() {
        this.selectedStudents.clear();
        this.updateSelectionUI();
        this.updateBulkActionsBar();
    }

    updateSelectionUI() {
        const cards = document.querySelectorAll('.student-card');
        cards.forEach(card => {
            const studentId = card.dataset.studentId;
            const checkbox = card.querySelector('.selection-checkbox');
            
            if (this.selectedStudents.has(studentId)) {
                checkbox?.classList.add('visible');
                card.classList.add('selected');
            } else {
                checkbox?.classList.remove('visible');
                card.classList.remove('selected');
            }
        });
    }

    updateBulkActionsBar() {
        let bulkBar = document.getElementById('bulkActionsBar');
        
        if (this.selectedStudents.size > 0) {
            if (!bulkBar) {
                bulkBar = this.createBulkActionsBar();
                document.body.appendChild(bulkBar);
            }
            bulkBar.classList.add('visible');
            bulkBar.querySelector('.selected-count').textContent = this.selectedStudents.size;
        } else {
            if (bulkBar) {
                bulkBar.classList.remove('visible');
            }
        }
    }

    createBulkActionsBar() {
        const bar = document.createElement('div');
        bar.id = 'bulkActionsBar';
        bar.className = 'bulk-actions-bar fixed bottom-4 left-4 right-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 z-50';
        
        bar.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <span class="selected-count text-white font-bold text-sm">0</span>
                    </div>
                    <span class="font-medium text-gray-900 dark:text-white">öğrenci seçildi</span>
                </div>
                <div class="flex space-x-2">
                    <button onclick="window.students.bulkAddComments()" class="touch-target bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2">
                        <i class="fas fa-comment-plus text-sm"></i>
                        <span>Toplu Yorum</span>
                    </button>
                    <button onclick="window.students.bulkDelete()" class="touch-target bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2">
                        <i class="fas fa-trash text-sm"></i>
                        <span>Sil</span>
                    </button>
                    <button onclick="window.students.clearSelection()" class="touch-target bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200">
                        <i class="fas fa-times text-sm"></i>
                    </button>
                </div>
            </div>
        `;
        
        return bar;
    }

    async bulkAddComments() {
        if (this.selectedStudents.size === 0) return;
        
        const selectedIds = Array.from(this.selectedStudents);
        // İlk öğrenci için yorum modalını aç
        const firstStudent = this.storage.getStudentById(selectedIds[0]);
        if (firstStudent) {
            // Toplu yorum modu için flag set et
            window.comments.bulkMode = true;
            window.comments.bulkStudentIds = selectedIds;
            window.comments.currentBulkIndex = 0;
            
            this.handleCommentAction(selectedIds[0], false);
        }
    }

    async bulkDelete() {
        if (this.selectedStudents.size === 0) return;
        
        const confirmed = await window.ui.confirmDialog(
            `${this.selectedStudents.size} öğrenciyi silmek istediğinizden emin misiniz?`,
            'Toplu Silme Onayı'
        );
        
        if (confirmed) {
            for (const studentId of this.selectedStudents) {
                await this.deleteStudent(studentId, false); // Silent delete
            }
            this.clearSelection();
            this.render();
            window.ui.showToast(`${this.selectedStudents.size} öğrenci başarıyla silindi`, 'success');
        }
    }
}

// Global student manager instance will be created in app.js