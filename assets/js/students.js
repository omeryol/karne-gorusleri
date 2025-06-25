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
        // Öğrenci ekleme butonları
        document.getElementById('addStudentBtn').addEventListener('click', () => {
            this.showAddModal();
        });

        // Form gönderme olayları
        document.getElementById('singleStudentForm').addEventListener('submit', (e) => {
            this.handleSingleStudentSubmit(e);
        });

        document.getElementById('bulkStudentForm').addEventListener('submit', (e) => {
            this.handleBulkStudentSubmit(e);
        });

        // Sınıf filtreleri
        document.querySelectorAll('.student-grade-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilterChange(e);
            });
        });
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
        
        return `
            <div class="student-card bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-12 h-12 ${gradeColor} rounded-full flex items-center justify-center">
                            <span class="text-white font-semibold text-lg">${initials}</span>
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-900 dark:text-white">${student.name}</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400">${student.grade}-${student.section}</p>
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="window.students.editStudent('${student.id}')" class="text-gray-400 hover:text-primary transition-colors duration-200" title="Düzenle">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="window.students.deleteStudent('${student.id}')" class="text-gray-400 hover:text-red-500 transition-colors duration-200" title="Sil">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="mb-4">
                    <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span>Yorum Durumu</span>
                        <span class="${hasComment ? 'text-positive' : 'text-neutral'} font-medium">
                            ${hasComment ? 'Tamamlandı' : 'Beklemede'}
                        </span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div class="${hasComment ? 'bg-positive' : 'bg-neutral'} h-2 rounded-full" style="width: ${hasComment ? '100' : '0'}%"></div>
                    </div>
                </div>
                
                <div class="flex space-x-2">
                    <button onclick="window.students.handleCommentAction('${student.id}', ${hasComment})" class="flex-1 bg-primary hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200">
                        <i class="fas fa-${hasComment ? 'comment-dots' : 'plus'} mr-1"></i>
                        ${hasComment ? 'Yorum Düzenle' : 'Yorum Ekle'}
                    </button>
                    <button onclick="window.students.copyStudentInfo('${student.id}')" class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-3 rounded-lg text-sm transition-all duration-200" title="Kopyala">
                        <i class="fas fa-copy"></i>
                    </button>
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
                <button onclick="window.students.showAddModal()" class="bg-primary hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
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

    deleteStudent(id) {
        const student = this.storage.getStudentById(id);
        if (!student) return;

        const comments = this.storage.getCommentsByStudentId(id);
        const commentText = comments.length > 0 ? ' ve yorumları' : '';

        if (confirm(`${student.name} adlı öğrenci${commentText} silinecek. Emin misiniz?`)) {
            if (this.storage.deleteStudent(id)) {
                this.render();
                window.app.dashboard.updateStats();
                window.ui.showToast('Öğrenci başarıyla silindi!', 'success');
            } else {
                window.ui.showToast('Silme işlemi sırasında hata oluştu!', 'error');
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
        // comments manager'ın yüklenip yüklenmediğini kontrol et
        if (!window.comments) {
            console.error('Comments manager yüklenmemiş');
            window.ui.showToast('Sistem henüz hazır değil, lütfen bekleyin...', 'warning');
            return;
        }

        try {
            if (hasComment) {
                window.comments.editComment(studentId);
            } else {
                window.comments.addComment(studentId);
            }
        } catch (error) {
            console.error('Yorum işlemi hatası:', error);
            window.ui.showToast('Yorum işleminde hata oluştu!', 'error');
        }
    }
    }
}

// Global student manager instance
window.students = new StudentManager(window.storage);
