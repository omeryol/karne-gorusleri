
// Ana uygulama sınıfı
class App {
    constructor() {
        this.storage = null;
        this.students = null;
        this.comments = null;
        this.templates = null;
        this.ui = null;
        this.currentView = 'dashboard';
        this.currentStudent = null;
    }

    async init() {
        try {
            console.log('Uygulama başlatılıyor...');
            
            // Storage'ı başlat
            this.storage = new StorageManager();
            
            // Diğer yöneticileri başlat
            this.students = new StudentManager(this.storage);
            this.comments = new CommentManager(this.storage);
            this.templates = new TemplateManager();
            this.ui = new UIManager();

            // Şablonları yükle
            await this.templates.loadTemplates();
            
            // UI'yi başlat
            this.initializeUI();
            
            // İlk yükleme kontrolü
            this.checkFirstTime();
            
            console.log('Uygulama başarıyla başlatıldı');
        } catch (error) {
            console.error('Uygulama başlatılırken hata:', error);
            this.showError('Uygulama başlatılamadı. Sayfayı yenilemeyi deneyin.');
        }
    }

    initializeUI() {
        // Tema uygula
        this.applyTheme();
        
        // Dashboard'u göster
        this.showDashboard();
        
        // İstatistikleri güncelle
        this.updateStats();
        
        // Event listener'ları ekle
        this.addEventListeners();
    }

    addEventListeners() {
        // Tema değiştirme
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                this.toggleTheme();
            }
        });

        // Modal dışı tıklama
        document.addEventListener('click', (e) => {
            if (e.target.id === 'modalBackdrop') {
                this.closeAllModals();
            }
        });
    }

    checkFirstTime() {
        const settings = this.storage.getSettings();
        if (settings.showWelcome) {
            this.showWelcomeModal();
        }
    }

    showWelcomeModal() {
        const modal = document.getElementById('welcomeModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    closeWelcomeModal() {
        const modal = document.getElementById('welcomeModal');
        if (modal) {
            modal.classList.add('hidden');
            this.storage.saveSetting('showWelcome', false);
        }
    }

    toggleWelcomeModal() {
        const modal = document.getElementById('welcomeModal');
        if (modal) {
            modal.classList.toggle('hidden');
        }
    }

    applyTheme() {
        const settings = this.storage.getSettings();
        const theme = settings.theme || 'light';
        
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            const icon = document.getElementById('themeIcon');
            if (icon) {
                icon.className = 'fas fa-sun text-gray-600 dark:text-gray-300';
            }
        } else {
            document.documentElement.classList.remove('dark');
            const icon = document.getElementById('themeIcon');
            if (icon) {
                icon.className = 'fas fa-moon text-gray-600 dark:text-gray-300';
            }
        }
    }

    toggleTheme() {
        const settings = this.storage.getSettings();
        const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
        this.storage.saveSetting('theme', newTheme);
        this.applyTheme();
    }

    showDashboard() {
        this.hideAllViews();
        document.getElementById('dashboard').classList.remove('hidden');
        this.currentView = 'dashboard';
        this.updateStats();
        this.updateRecentStudents();
    }

    showStudents() {
        this.hideAllViews();
        document.getElementById('studentManagement').classList.remove('hidden');
        this.currentView = 'students';
        this.students.render();
    }

    showTemplates() {
        this.hideAllViews();
        document.getElementById('templateManagement').classList.remove('hidden');
        this.currentView = 'templates';
        this.templates.render();
    }

    showAddStudent() {
        this.students.showAddForm();
    }

    hideAllViews() {
        const views = ['dashboard', 'studentManagement', 'commentManagement', 'templateManagement'];
        views.forEach(view => {
            const element = document.getElementById(view);
            if (element) {
                element.classList.add('hidden');
            }
        });
    }

    updateStats() {
        const stats = this.storage.getStats();
        const templates = this.templates.getAllTemplates();
        
        // İstatistikleri güncelle
        this.updateElement('totalStudents', stats.totalStudents);
        this.updateElement('totalComments', stats.totalComments);
        this.updateElement('weeklyComments', stats.weeklyComments);
        this.updateElement('totalTemplates', templates.length);
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    updateRecentStudents() {
        const students = this.storage.getStudents()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        const container = document.getElementById('recentStudents');
        if (!container) return;

        if (students.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 dark:text-gray-400 py-8">
                    Henüz öğrenci eklenmemiş
                </div>
            `;
            return;
        }

        container.innerHTML = students.map(student => `
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div class="flex items-center">
                    <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <span class="text-white font-semibold">${student.name.charAt(0)}</span>
                    </div>
                    <div class="ml-3">
                        <p class="font-medium text-gray-900 dark:text-white">${student.name}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">${student.grade}/${student.section}</p>
                    </div>
                </div>
                <button onclick="app.viewStudent('${student.id}')" class="text-primary hover:text-blue-600 text-sm">
                    Görüntüle
                </button>
            </div>
        `).join('');
    }

    viewStudent(studentId) {
        this.currentStudent = studentId;
        this.hideAllViews();
        document.getElementById('commentManagement').classList.remove('hidden');
        this.currentView = 'comments';
        this.comments.render(studentId);
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.fixed.inset-0:not(#modalBackdrop)');
        modals.forEach(modal => {
            modal.classList.add('hidden');
        });
        
        const backdrop = document.getElementById('modalBackdrop');
        if (backdrop) {
            backdrop.classList.add('hidden');
        }
    }

    showError(message) {
        console.error(message);
        // Basit bir hata gösterimi
        alert(message);
    }

    showSuccess(message) {
        console.log(message);
        // Basit bir başarı gösterimi
        alert(message);
    }
}

// Global fonksiyonlar
function showDashboard() {
    if (window.app) {
        window.app.showDashboard();
    }
}

function showStudents() {
    if (window.app) {
        window.app.showStudents();
    }
}

function showTemplates() {
    if (window.app) {
        window.app.showTemplates();
    }
}

function showAddStudent() {
    if (window.app) {
        window.app.showAddStudent();
    }
}

function toggleTheme() {
    if (window.app) {
        window.app.toggleTheme();
    }
}

function toggleWelcomeModal() {
    if (window.app) {
        window.app.toggleWelcomeModal();
    }
}

function closeWelcomeModal() {
    if (window.app) {
        window.app.closeWelcomeModal();
    }
}

function closeAllModals() {
    if (window.app) {
        window.app.closeAllModals();
    }
}

function toggleNotifications() {
    const panel = document.getElementById('notificationPanel');
    if (panel) {
        panel.classList.toggle('hidden');
    }
}

// Uygulamayı başlat
document.addEventListener('DOMContentLoaded', async function() {
    try {
        window.app = new App();
        await window.app.init();
    } catch (error) {
        console.error('Uygulama başlatılırken hata:', error);
    }
});
