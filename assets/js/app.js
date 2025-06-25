// Ana uygulama sınıfı
class App {
    constructor() {
        this.currentTab = 'dashboard';
        this.storage = window.storage;
        this.init();
    }

    init() {
        try {
            this.initializeComponents();
            this.bindEvents();
            this.showWelcomeIfFirstTime();
            this.updateDashboard();
            console.log('Uygulama başarıyla başlatıldı');
        } catch (error) {
            console.error('Uygulama başlatılırken hata:', error);
            this.showErrorState();
        }
    }

    initializeComponents() {
        // Initialize managers
        window.studentManager = new StudentManager(this.storage);
        window.commentManager = new CommentManager(this.storage);
        window.templateManager = new TemplateManager(this.storage);

        // Initialize tabs
        this.tabs = {
            switchTo: (tabName) => this.switchTab(tabName)
        };
    }

    bindEvents() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Tab navigation
        const tabButtons = document.querySelectorAll('[data-tab]');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.switchTab(button.dataset.tab);
            });
        });

        // Welcome modal
        const welcomeToggleBtn = document.getElementById('welcomeToggleBtn');
        const welcomeModal = document.getElementById('welcomeModal');
        const welcomeStartBtn = document.getElementById('welcomeStartBtn');

        if (welcomeToggleBtn) {
            welcomeToggleBtn.addEventListener('click', () => {
                if (welcomeModal) welcomeModal.style.display = 'flex';
            });
        }

        if (welcomeStartBtn) {
            welcomeStartBtn.addEventListener('click', () => {
                if (welcomeModal) welcomeModal.style.display = 'none';
                this.storage.saveSetting('welcomeShown', true);
            });
        }

        // Help modal
        const helpBtn = document.getElementById('helpBtn');
        const helpModal = document.getElementById('helpModal');
        const helpCloseBtn = document.getElementById('helpCloseBtn');

        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                if (helpModal) helpModal.style.display = 'flex';
            });
        }

        if (helpCloseBtn) {
            helpCloseBtn.addEventListener('click', () => {
                if (helpModal) helpModal.style.display = 'none';
            });
        }

        // Close modals on outside click
        const modals = document.querySelectorAll('.fixed.inset-0');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.switchTab('dashboard');
                        break;
                    case '2':
                        e.preventDefault();
                        this.switchTab('students');
                        break;
                    case '3':
                        e.preventDefault();
                        this.switchTab('comments');
                        break;
                    case '4':
                        e.preventDefault();
                        this.switchTab('templates');
                        break;
                }
            }
            if (e.key === 'Escape') {
                // Close all modals
                modals.forEach(modal => {
                    modal.style.display = 'none';
                });
            }
        });
    }

    switchTab(tabName) {
        this.currentTab = tabName;

        // Update tab buttons
        const tabButtons = document.querySelectorAll('[data-tab]');
        tabButtons.forEach(button => {
            if (button.dataset.tab === tabName) {
                button.classList.add('border-primary', 'text-primary');
                button.classList.remove('border-transparent', 'text-gray-500', 'dark:text-gray-400');
            } else {
                button.classList.remove('border-primary', 'text-primary');
                button.classList.add('border-transparent', 'text-gray-500', 'dark:text-gray-400');
            }
        });

        // Show/hide tab content
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            if (content.id === `${tabName}-tab`) {
                content.classList.remove('hidden');
            } else {
                content.classList.add('hidden');
            }
        });

        // Update content based on tab
        switch (tabName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'students':
                if (window.studentManager) window.studentManager.render();
                break;
            case 'comments':
                if (window.commentManager) window.commentManager.render();
                break;
            case 'templates':
                if (window.templateManager) window.templateManager.render();
                break;
        }
    }

    updateDashboard() {
        const stats = this.storage.getStats();

        // Update stat cards
        const elements = {
            totalStudents: document.getElementById('totalStudents'),
            completedComments: document.getElementById('completedComments'),
            pendingComments: document.getElementById('pendingComments'),
            completionRate: document.getElementById('completionRate')
        };

        if (elements.totalStudents) elements.totalStudents.textContent = stats.totalStudents;
        if (elements.completedComments) elements.completedComments.textContent = stats.completedComments;
        if (elements.pendingComments) elements.pendingComments.textContent = stats.pendingComments;
        if (elements.completionRate) elements.completionRate.textContent = `${stats.completionRate}%`;

        // Update tone analysis
        this.updateToneAnalysis(stats.toneAnalysis);

        // Update popular tags
        this.updatePopularTags(stats.popularTags);
    }

    updateToneAnalysis(toneAnalysis) {
        const container = document.getElementById('toneAnalysis');
        if (!container) return;

        const total = toneAnalysis.olumlu + toneAnalysis.notr + toneAnalysis.olumsuz;

        if (total === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-gray-500 dark:text-gray-400">Henüz yorum bulunmuyor</p>
                </div>
            `;
            return;
        }

        const tones = [
            { name: 'Olumlu', count: toneAnalysis.olumlu, color: 'bg-green-500', icon: 'fas fa-smile' },
            { name: 'Nötr', count: toneAnalysis.notr, color: 'bg-yellow-500', icon: 'fas fa-meh' },
            { name: 'Olumsuz', count: toneAnalysis.olumsuz, color: 'bg-red-500', icon: 'fas fa-frown' }
        ];

        container.innerHTML = tones.map(tone => {
            const percentage = Math.round((tone.count / total) * 100);
            return `
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-4 h-4 ${tone.color} rounded-full"></div>
                        <span class="text-gray-700 dark:text-gray-300">
                            <i class="${tone.icon} mr-2"></i>
                            ${tone.name}
                        </span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="text-sm text-gray-500 dark:text-gray-400">${tone.count}</span>
                        <span class="text-sm font-medium text-gray-900 dark:text-white">${percentage}%</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    updatePopularTags(popularTags) {
        const container = document.getElementById('popularTags');
        if (!container) return;

        if (popularTags.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4 w-full">
                    <p class="text-gray-500 dark:text-gray-400">Henüz etiket bulunmuyor</p>
                </div>
            `;
            return;
        }

        container.innerHTML = popularTags.map(([tag, count]) => `
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                ${tag}
                <span class="ml-2 px-2 py-0.5 rounded-full bg-primary/20 text-xs">${count}</span>
            </span>
        `).join('');
    }

    toggleTheme() {
        const html = document.documentElement;
        const isDark = html.classList.contains('dark');

        if (isDark) {
            html.classList.remove('dark');
            this.storage.saveSetting('theme', 'light');
        } else {
            html.classList.add('dark');
            this.storage.saveSetting('theme', 'dark');
        }
    }

    showWelcomeIfFirstTime() {
        const settings = this.storage.getSettings();
        if (!settings.welcomeShown) {
            const welcomeModal = document.getElementById('welcomeModal');
            if (welcomeModal) {
                setTimeout(() => {
                    welcomeModal.style.display = 'flex';
                }, 500);
            }
        }
    }

    showErrorState() {
        const main = document.querySelector('main');
        if (main) {
            main.innerHTML = `
                <div class="flex items-center justify-center min-h-96">
                    <div class="text-center">
                        <div class="text-red-500 mb-4">
                            <i class="fas fa-exclamation-triangle text-4xl"></i>
                        </div>
                        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Uygulama Yüklenemedi
                        </h2>
                        <p class="text-gray-600 dark:text-gray-400 mb-4">
                            Sayfa yenilenmesi gerekiyor
                        </p>
                        <button onclick="location.reload()" class="bg-primary hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium">
                            Sayfayı Yenile
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Storage'ı önce başlat
        if (!window.storage) {
            window.storage = new KarneStorage();
        }
        window.app = new App();
    } catch (error) {
        console.error('Uygulama başlatılırken hata:', error);
    }
});