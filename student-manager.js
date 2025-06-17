// Student Management System
class StudentManager {
    constructor() {
        this.students = JSON.parse(localStorage.getItem('students')) || [];
        this.currentStudentIndex = 0;
        this.selectedTerm = 1;
        this.commentTemplates = {};
        this.studentComments = JSON.parse(localStorage.getItem('studentComments')) || {};
        this.gradeFilter = '';
        this.init();
    }

    init() {
        this.loadCommentTemplates();
        this.bindEvents();
        this.updateStudentNavigation();
        this.updateDashboard();
    }

    // Load comment templates from the data file
    loadCommentTemplates() {
        if (typeof commentsData !== 'undefined') {
            this.commentTemplates = commentsData;
        }
    }

    // Student Management
    addStudent(studentData) {
        const student = {
            id: Date.now().toString(),
            name: studentData.name,
            number: studentData.number,
            class: studentData.class,
            dateAdded: new Date().toISOString(),
            ...studentData
        };
        
        this.students.push(student);
        this.saveStudents();
        this.updateStudentList();
        this.updateStudentNavigation();
        return student;
    }

    removeStudent(studentId) {
        this.students = this.students.filter(s => s.id !== studentId);
        // Also remove student comments
        delete this.studentComments[studentId];
        this.saveStudents();
        this.saveStudentComments();
        this.updateStudentList();
        this.updateStudentNavigation();
    }

    updateStudent(studentId, updatedData) {
        const index = this.students.findIndex(s => s.id === studentId);
        if (index !== -1) {
            this.students[index] = { ...this.students[index], ...updatedData };
            this.saveStudents();
            this.updateStudentList();
        }
    }

    getCurrentStudent() {
        return this.students[this.currentStudentIndex] || null;
    }

    // Navigation
    nextStudent() {
        if (this.currentStudentIndex < this.students.length - 1) {
            this.currentStudentIndex++;
            this.updateCurrentStudentView();
        }
    }

    previousStudent() {
        if (this.currentStudentIndex > 0) {
            this.currentStudentIndex--;
            this.updateCurrentStudentView();
        }
    }

    selectStudent(index) {
        if (index >= 0 && index < this.students.length) {
            this.currentStudentIndex = index;
            this.updateCurrentStudentView();
        }
    }

    // Comment Assignment
    assignCommentToStudent(studentId, templateId, term) {
        if (!this.studentComments[studentId]) {
            this.studentComments[studentId] = {};
        }
        if (!this.studentComments[studentId][term]) {
            this.studentComments[studentId][term] = [];
        }

        const template = this.findTemplate(templateId);
        if (template) {
            const assignedComment = {
                id: `${studentId}-${templateId}-${Date.now()}`,
                templateId: templateId,
                term: term,
                assignedDate: new Date().toISOString(),
                customText: template.comment,
                isEdited: false
            };

            this.studentComments[studentId][term].push(assignedComment);
            this.saveStudentComments();
            return assignedComment;
        }
        return null;
    }

    updateStudentComment(studentId, commentId, newText) {
        const student = this.studentComments[studentId];
        if (student) {
            for (let term in student) {
                const comment = student[term].find(c => c.id === commentId);
                if (comment) {
                    comment.customText = newText;
                    comment.isEdited = true;
                    comment.lastModified = new Date().toISOString();
                    this.saveStudentComments();
                    return true;
                }
            }
        }
        return false;
    }

    // Template Management
    findTemplate(templateId) {
        for (let grade in this.commentTemplates) {
            for (let term in this.commentTemplates[grade]) {
                const template = this.commentTemplates[grade][term].find(t => t.id === templateId);
                if (template) return template;
            }
        }
        return null;
    }

    getTemplatesForGrade(grade, term) {
        return this.commentTemplates[grade] && this.commentTemplates[grade][term] 
            ? this.commentTemplates[grade][term] 
            : [];
    }

    personalizeComment(comment, studentName) {
        return comment.replace(/\[Öğrenci Adı\]/g, studentName);
    }

    // File Operations
    importStudentList(csvData) {
        try {
            const lines = csvData.split('\n');
            const headers = lines[0].split(',').map(h => h.trim());
            const students = [];

            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim()) {
                    const values = lines[i].split(',').map(v => v.trim());
                    const student = {};
                    headers.forEach((header, index) => {
                        student[header.toLowerCase()] = values[index] || '';
                    });
                    
                    if (student.name || student.ad || student.isim) {
                        students.push({
                            id: Date.now().toString() + i,
                            name: student.name || student.ad || student.isim,
                            number: student.number || student.no || student.numara || i,
                            class: student.class || student.sinif || '5',
                            dateAdded: new Date().toISOString()
                        });
                    }
                }
            }

            this.students = [...this.students, ...students];
            this.saveStudents();
            this.updateStudentList();
            this.updateStudentNavigation();
            return students.length;
        } catch (error) {
            console.error('CSV import error:', error);
            return 0;
        }
    }

    exportStudentComments(studentId, term) {
        const student = this.students.find(s => s.id === studentId);
        const comments = this.studentComments[studentId]?.[term] || [];
        
        if (!student) return null;

        const exportData = {
            student: student,
            term: term,
            comments: comments.map(c => ({
                ...c,
                personalizedText: this.personalizeComment(c.customText, student.name)
            })),
            exportDate: new Date().toISOString()
        };

        return exportData;
    }

    // Storage
    saveStudents() {
        localStorage.setItem('students', JSON.stringify(this.students));
    }

    saveStudentComments() {
        localStorage.setItem('studentComments', JSON.stringify(this.studentComments));
    }

    // UI Updates
    updateStudentList() {
        const container = document.getElementById('studentListContainer');
        if (!container) return;

        if (this.students.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-users fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">Henüz öğrenci eklenmedi</h5>
                    <p class="text-muted">Yukarıdaki "Öğrenci Ekle" butonunu kullanarak öğrenci ekleyin</p>
                </div>
            `;
            return;
        }

        const filteredStudents = this.getFilteredStudents();
        
        const html = filteredStudents.map((student, index) => {
            const actualIndex = this.students.indexOf(student);
            return `
            <div class="card student-card mb-2 ${actualIndex === this.currentStudentIndex ? 'border-primary' : ''}" 
                 onclick="studentManager.selectStudent(${actualIndex})">
                <div class="card-body py-2">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-0">${student.name}</h6>
                            <small class="text-muted">No: ${student.number} - ${student.class}</small>
                        </div>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary btn-sm" onclick="event.stopPropagation(); studentManager.editStudent('${student.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-outline-danger btn-sm" onclick="event.stopPropagation(); studentManager.removeStudent('${student.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;}).join('');

        container.innerHTML = html;
    }

    updateStudentNavigation() {
        const prevBtn = document.getElementById('prevStudentBtn');
        const nextBtn = document.getElementById('nextStudentBtn');
        const studentInfo = document.getElementById('currentStudentInfo');

        if (this.students.length === 0) {
            if (prevBtn) prevBtn.disabled = true;
            if (nextBtn) nextBtn.disabled = true;
            if (studentInfo) studentInfo.textContent = 'Öğrenci seçilmedi';
            return;
        }

        if (prevBtn) prevBtn.disabled = this.currentStudentIndex === 0;
        if (nextBtn) nextBtn.disabled = this.currentStudentIndex === this.students.length - 1;
        
        const current = this.getCurrentStudent();
        if (studentInfo && current) {
            studentInfo.textContent = `${current.name} (${this.currentStudentIndex + 1}/${this.students.length})`;
        }
    }

    updateCurrentStudentView() {
        this.updateStudentNavigation();
        this.updateStudentList();
        this.loadStudentComments();
        this.updateDashboard();
    }

    updateDashboard() {
        const totalStudents = document.getElementById('totalStudents');
        const totalComments = document.getElementById('totalAssignedComments');
        const currentTermComments = document.getElementById('currentTermComments');

        if (totalStudents) totalStudents.textContent = this.students.length;

        let assignedComments = 0;
        let termComments = 0;
        
        for (let studentId in this.studentComments) {
            for (let term in this.studentComments[studentId]) {
                assignedComments += this.studentComments[studentId][term].length;
                if (term == this.selectedTerm) {
                    termComments += this.studentComments[studentId][term].length;
                }
            }
        }

        if (totalComments) totalComments.textContent = assignedComments;
        if (currentTermComments) currentTermComments.textContent = termComments;
    }

    loadStudentComments() {
        const container = document.getElementById('assignedCommentsContainer');
        if (!container) return;

        const current = this.getCurrentStudent();
        if (!current) {
            container.innerHTML = '<p class="text-muted">Öğrenci seçilmedi</p>';
            return;
        }

        const comments = this.studentComments[current.id]?.[this.selectedTerm] || [];
        
        if (comments.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-comment-slash fa-2x text-muted mb-3"></i>
                    <p class="text-muted">${current.name} için ${this.selectedTerm}. dönem yorumu bulunmuyor</p>
                </div>
            `;
            return;
        }

        const html = comments.map((comment, index) => {
            const personalizedText = this.personalizeComment(comment.customText, current.name);
            return `
                <div class="card mb-3 comment-item" style="animation-delay: ${index * 0.1}s">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <small class="text-muted">
                                <i class="fas fa-calendar me-1"></i>
                                ${new Date(comment.assignedDate).toLocaleDateString('tr-TR')}
                                ${comment.isEdited ? '<span class="badge bg-warning ms-2">Düzenlenmiş</span>' : ''}
                                <span class="badge bg-primary ms-2">#${index + 1}</span>
                            </small>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary" onclick="studentManager.editComment('${comment.id}')" title="Düzenle">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-outline-success" onclick="studentManager.copyComment('${comment.id}')" title="Kopyala">
                                    <i class="fas fa-copy"></i>
                                </button>
                                <button class="btn btn-outline-danger" onclick="studentManager.removeComment('${comment.id}')" title="Sil">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="comment-text">${personalizedText}</div>
                        <div class="mt-2 d-flex justify-content-between">
                            <small class="text-muted">
                                <i class="fas fa-text-width me-1"></i>
                                ${personalizedText.length} karakter
                            </small>
                            <button class="btn btn-outline-primary btn-sm" onclick="studentManager.copyComment('${comment.id}')">
                                <i class="fas fa-copy me-1"></i>
                                Kopyala
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    // Event Bindings
    bindEvents() {
        // Navigation events will be bound in the main HTML
    }

    // Modal and UI functions
    editStudent(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (student) {
            // Show edit modal - implementation depends on UI
            console.log('Edit student:', student);
        }
    }

    editComment(commentId) {
        // Find and edit comment - implementation depends on UI
        console.log('Edit comment:', commentId);
    }

    copyComment(commentId) {
        const current = this.getCurrentStudent();
        if (!current) return;

        const comments = this.studentComments[current.id]?.[this.selectedTerm] || [];
        const comment = comments.find(c => c.id === commentId);
        
        if (comment) {
            const personalizedText = this.personalizeComment(comment.customText, current.name);
            navigator.clipboard.writeText(personalizedText).then(() => {
                if (typeof showNotification === 'function') {
                    showNotification('Yorum kopyalandı', 'success');
                } else {
                    console.log('Comment copied to clipboard');
                }
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = personalizedText;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                if (typeof showNotification === 'function') {
                    showNotification('Yorum kopyalandı', 'success');
                }
            });
        }
    }

    removeComment(commentId) {
        const current = this.getCurrentStudent();
        if (!current) return;

        if (confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
            const comments = this.studentComments[current.id]?.[this.selectedTerm] || [];
            this.studentComments[current.id][this.selectedTerm] = comments.filter(c => c.id !== commentId);
            this.saveStudentComments();
            this.loadStudentComments();
            this.updateDashboard();
            if (typeof showNotification === 'function') {
                showNotification('Yorum silindi', 'info');
            }
        }
    }
}

// Initialize when DOM is loaded
let studentManager;