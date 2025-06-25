// Öğrenci yönetimi sınıfı
class StudentManager {
    constructor(storage) {
        this.storage = storage;
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        // Öğrenci ekleme modalı
        const addStudentBtn = document.getElementById('addStudentBtn');
        const addStudentModal = document.getElementById('addStudentModal');
        const addStudentCloseBtn = document.getElementById('addStudentCloseBtn');

        if (addStudentBtn) {
            addStudentBtn.addEventListener('click', () => {
                if (addStudentModal) addStudentModal.style.display = 'flex';
            });
        }

        if (addStudentCloseBtn) {
            addStudentCloseBtn.addEventListener('click', () => {
                if (addStudentModal) addStudentModal.style.display = 'none';
            });
        }

        // Modal dışına tıklama
        if (addStudentModal) {
            addStudentModal.addEventListener('click', (e) => {
                if (e.target === addStudentModal) {
                    addStudentModal.style.display = 'none';
                }
            });
        }

        // Tab switching
        const singleStudentTab = document.getElementById('singleStudentTab');
        const bulkStudentTab = document.getElementById('bulkStudentTab');
        const singleStudentForm = document.getElementById('singleStudentForm');
        const bulkStudentForm = document.getElementById('bulkStudentForm');

        if (singleStudentTab) {
            singleStudentTab.addEventListener('click', () => {
                this.switchTab('single');
            });
        }

        if (bulkStudentTab) {
            bulkStudentTab.addEventListener('click', () => {
                this.switchTab('bulk');
            });
        }

        // Form submissions
        if (singleStudentForm) {
            singleStudentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addSingleStudent(e.target);
            });
        }

        if (bulkStudentForm) {
            bulkStudentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addBulkStudents(e.target);
            });
        }

        // Grade filters
        const gradeFilters = document.querySelectorAll('.student-grade-filter');
        gradeFilters.forEach(filter => {
            filter.addEventListener('click', () => {
                this.setGradeFilter(filter.dataset.grade);
            });
        });
    }

    switchTab(tab) {
        const singleStudentTab = document.getElementById('singleStudentTab');
        const bulkStudentTab = document.getElementById('bulkStudentTab');
        const singleStudentForm = document.getElementById('singleStudentForm');
        const bulkStudentForm = document.getElementById('bulkStudentForm');

        if (tab === 'single') {
            singleStudentTab?.classList.add('bg-white', 'dark:bg-gray-600', 'text-gray-900', 'dark:text-white');
            singleStudentTab?.classList.remove('text-gray-600', 'dark:text-gray-300');
            bulkStudentTab?.classList.remove('bg-white', 'dark:bg-gray-600', 'text-gray-900', 'dark:text-white');
            bulkStudentTab?.classList.add('text-gray-600', 'dark:text-gray-300');
            singleStudentForm?.classList.remove('hidden');
            bulkStudentForm?.classList.add('hidden');
        } else {
            bulkStudentTab?.classList.add('bg-white', 'dark:bg-gray-600', 'text-gray-900', 'dark:text-white');
            bulkStudentTab?.classList.remove('text-gray-600', 'dark:text-gray-300');
            singleStudentTab?.classList.remove('bg-white', 'dark:bg-gray-600', 'text-gray-900', 'dark:text-white');
            singleStudentTab?.classList.add('text-gray-600', 'dark:text-gray-300');
            bulkStudentForm?.classList.remove('hidden');
            singleStudentForm?.classList.add('hidden');
        }
    }

    addSingleStudent(form) {
        const formData = new FormData(form);
        const student = {
            name: formData.get('name').trim(),
            grade: formData.get('grade'),
            section: formData.get('section')
        };

        if (!student.name || !student.grade || !student.section) {
            window.ui?.showToast('Lütfen tüm alanları doldurun', 'error');
            return;
        }

        const addedStudent = this.storage.addStudent(student);
        if (addedStudent) {
            window.ui?.showToast('Öğrenci başarıyla eklendi', 'success');
            form.reset();
            document.getElementById('addStudentModal').style.display = 'none';
            this.render();
            window.app?.updateDashboard?.();
        } else {
            window.ui?.showToast('Öğrenci eklenirken hata oluştu', 'error');
        }
    }

    addBulkStudents(form) {
        const formData = new FormData(form);
        const studentList = formData.get('studentList').trim();
        const grade = formData.get('grade');
        const section = formData.get('section');

        if (!studentList || !grade || !section) {
            window.ui?.showToast('Lütfen tüm alanları doldurun', 'error');
            return;
        }

        const names = studentList.split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);

        if (names.length === 0) {
            window.ui?.showToast('Geçerli öğrenci adı bulunamadı', 'error');
            return;
        }

        let successCount = 0;
        names.forEach(name => {
            const student = { name, grade, section };
            if (this.storage.addStudent(student)) {
                successCount++;
            }
        });

        if (successCount > 0) {
            window.ui?.showToast(`${successCount} öğrenci başarıyla eklendi`, 'success');
            form.reset();
            document.getElementById('addStudentModal').style.display = 'none';
            this.render();
            window.app?.updateDashboard?.();
        } else {
            window.ui?.showToast('Öğrenciler eklenirken hata oluştu', 'error');
        }
    }

    setGradeFilter(grade) {
        this.currentFilter = grade;

        // Update filter buttons
        const filters = document.querySelectorAll('.student-grade-filter');
        filters.forEach(filter => {
            if (filter.dataset.grade === grade) {
                filter.classList.add('active', 'bg-primary', 'text-white');
                filter.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
            } else {
                filter.classList.remove('active', 'bg-primary', 'text-white');
                filter.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
            }
        });

        this.render();
    }

    render() {
        const container = document.getElementById('studentsGrid');
        if (!container) return;

        const students = this.storage.getStudents();
        const filteredStudents = this.currentFilter === 'all' 
            ? students 
            : students.filter(s => s.grade === this.currentFilter);

        if (filteredStudents.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-gray-400 mb-4">
                        <i class="fas fa-users text-4xl"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        ${this.currentFilter === 'all' ? 'Henüz öğrenci eklenmemiş' : 'Bu sınıfta öğrenci bulunamadı'}
                    </h3>
                    <p class="text-gray-500 dark:text-gray-400 mb-4">
                        ${this.currentFilter === 'all' ? 'İlk öğrencinizi eklemek için "Öğrenci Ekle" butonuna tıklayın' : 'Farklı bir sınıf seçin veya öğrenci ekleyin'}
                    </p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredStudents.map(student => this.renderStudentCard(student)).join('');

        // Bind events for student cards
        this.bindStudentCardEvents();
    }

    renderStudentCard(student) {
        const comments = this.storage.getCommentsByStudent(student.id);
        const hasComment = comments.length > 0 && comments[0].content;
        const gradeColors = {
            '5': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            '6': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            '7': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
            '8': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
        };

        return `
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 student-card">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">${student.name}</h3>
                        <div class="flex items-center space-x-2">
                            <span class="px-3 py-1 rounded-full text-sm font-medium ${gradeColors[student.grade] || gradeColors['5']}">
                                ${student.grade}. Sınıf ${student.section}
                            </span>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200" 
                                onclick="window.studentManager.editStudent('${student.id}')"
                                title="Düzenle">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="text-red-400 hover:text-red-600 transition-colors duration-200" 
                                onclick="window.studentManager.deleteStudent('${student.id}')"
                                title="Sil">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2 text-sm">
                        ${hasComment ? 
                            '<span class="text-green-600 dark:text-green-400"><i class="fas fa-check-circle mr-1"></i>Yorum Var</span>' :
                            '<span class="text-gray-500 dark:text-gray-400"><i class="fas fa-clock mr-1"></i>Yorum Bekliyor</span>'
                        }
                    </div>
                    <button class="bg-primary hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
                            onclick="window.commentManager.addOrEditComment('${student.id}')">
                        <i class="fas fa-comment-plus mr-1"></i>
                        ${hasComment ? 'Düzenle' : 'Yorum Ekle'}
                    </button>
                </div>
            </div>
        `;
    }

    bindStudentCardEvents() {
        // Events are bound inline in the template
    }

    editStudent(id) {
        // Implementation for editing student
        console.log('Edit student:', id);
    }

    deleteStudent(id) {
        if (confirm('Bu öğrenciyi silmek istediğinizden emin misiniz?')) {
            if (this.storage.deleteStudent(id)) {
                window.ui?.showToast('Öğrenci silindi', 'success');
                this.render();
                window.app?.updateDashboard?.();
            } else {
                window.ui?.showToast('Öğrenci silinirken hata oluştu', 'error');
            }
        }
    }
}

// Global instance will be created in app.js