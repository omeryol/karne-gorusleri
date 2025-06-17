// Workflow Setup for Student Management System
class WorkflowSetup {
    constructor() {
        this.init();
    }

    init() {
        this.setupInitialData();
        this.bindEvents();
    }

    setupInitialData() {
        // Check if this is first time setup
        const hasData = localStorage.getItem('students') || localStorage.getItem('studentComments');
        
        if (!hasData) {
            this.showWelcomeSetup();
        }
    }

    showWelcomeSetup() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'welcomeSetupModal';
        modal.setAttribute('data-bs-backdrop', 'static');
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-rocket me-2"></i>
                            Öğrenci Yönetim Sistemine Hoşgeldiniz
                        </h5>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="card h-100">
                                    <div class="card-body text-center">
                                        <i class="fas fa-users fa-3x text-primary mb-3"></i>
                                        <h5>Öğrenci Listesi Yükle</h5>
                                        <p class="text-muted">CSV dosyası veya manuel giriş ile öğrenci listesi oluşturun</p>
                                        <button class="btn btn-primary" onclick="this.startWithImport()">
                                            <i class="fas fa-upload me-1"></i>
                                            Liste Yükle
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="card h-100">
                                    <div class="card-body text-center">
                                        <i class="fas fa-user-plus fa-3x text-success mb-3"></i>
                                        <h5>Manuel Başla</h5>
                                        <p class="text-muted">Tek tek öğrenci ekleyerek başlayın</p>
                                        <button class="btn btn-success" onclick="this.startManual()">
                                            <i class="fas fa-plus me-1"></i>
                                            Manuel Başla
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="mt-4">
                            <h6>Sistem Özellikleri:</h6>
                            <ul class="list-unstyled">
                                <li><i class="fas fa-check text-success me-2"></i>450-500 karakter arası optimize edilmiş yorum şablonları</li>
                                <li><i class="fas fa-check text-success me-2"></i>Öğrenci bazlı yorum atama ve düzenleme</li>
                                <li><i class="fas fa-check text-success me-2"></i>Dönem bazlı yorum yönetimi</li>
                                <li><i class="fas fa-check text-success me-2"></i>Öğrenci navigation (önceki/sonraki)</li>
                                <li><i class="fas fa-check text-success me-2"></i>Dashboard ve istatistikler</li>
                                <li><i class="fas fa-check text-success me-2"></i>Yorum kopyalama ve düzenleme</li>
                            </ul>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline-secondary" onclick="this.skipSetup()">
                            Kurulumu Atla
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();

        // Bind methods to modal
        window.startWithImport = () => {
            bsModal.hide();
            window.location.href = 'student-management.html#import';
        };

        window.startManual = () => {
            bsModal.hide();
            window.location.href = 'student-management.html#add';
        };

        window.skipSetup = () => {
            localStorage.setItem('setupSkipped', 'true');
            bsModal.hide();
        };
    }

    bindEvents() {
        // Setup navigation helpers
        this.setupNavigationHelpers();
    }

    setupNavigationHelpers() {
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        if (window.studentManager) {
                            window.studentManager.previousStudent();
                        }
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        if (window.studentManager) {
                            window.studentManager.nextStudent();
                        }
                        break;
                    case 'n':
                        e.preventDefault();
                        if (window.showAddStudentModal) {
                            window.showAddStudentModal();
                        }
                        break;
                }
            }
        });
    }

    createSampleData() {
        const sampleStudents = [
            { name: 'Ahmet Yılmaz', number: '101', class: '5' },
            { name: 'Ayşe Demir', number: '102', class: '5' },
            { name: 'Mehmet Kaya', number: '103', class: '5' },
            { name: 'Fatma Öz', number: '104', class: '5' },
            { name: 'Ali Çelik', number: '105', class: '5' }
        ];

        if (window.studentManager) {
            sampleStudents.forEach(student => {
                window.studentManager.addStudent(student);
            });
            
            // Assign some sample comments
            const students = window.studentManager.students;
            if (students.length > 0) {
                // Assign first template to first student
                window.studentManager.assignCommentToStudent(students[0].id, '5-1-1', 1);
                window.studentManager.assignCommentToStudent(students[1].id, '5-1-2', 1);
                window.studentManager.updateCurrentStudentView();
            }
        }

        return sampleStudents.length;
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('student-management.html')) {
        new WorkflowSetup();
        
        // Handle URL fragments
        const hash = window.location.hash;
        if (hash === '#import') {
            setTimeout(() => window.showImportModal && window.showImportModal(), 500);
        } else if (hash === '#add') {
            setTimeout(() => window.showAddStudentModal && window.showAddStudentModal(), 500);
        }
    }
});