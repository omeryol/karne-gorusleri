// Ana uygulama koordinatörü
class App {
    constructor() {
        this.currentTab = 'dashboard';
        this.init();
    }

    init() {
        this.initializeComponents();
        this.setupTheme();
        this.setupKeyboardShortcuts();
        this.setupNavigationHandlers();
        this.showWelcomeModal();

        // İlk yükleme
        this.dashboard.updateStats();
    }

    initializeComponents() {
        // Tab yönetimi
        this.tabs = new TabManager();

        // Dashboard yönetimi
        this.dashboard = new DashboardManager();
    }

    setupTheme() {
        const savedTheme = window.storage.getSetting('theme') || 'light';
        const htmlElement = document.documentElement;

        if (savedTheme === 'dark') {
            htmlElement.classList.add('dark');
        }

        const themeToggle = document.getElementById('themeToggle');
        themeToggle.addEventListener('click', () => {
            htmlElement.classList.toggle('dark');
            const isDark = htmlElement.classList.contains('dark');
            window.storage.setSetting('theme', isDark ? 'dark' : 'light');
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // ESC tuşu - modalleri kapat
            if (e.key === 'Escape') {
                const openModals = [
                    'welcomeModal', 'helpModal', 'addStudentModal', 
                    'commentEditModal', 'aiSuggestionsModal', 'allCommentsModal'
                ];

                openModals.forEach(modalId => {
                    const modal = document.getElementById(modalId);
                    if (modal && modal.style.display === 'flex') {
                        window.ui.hideModal(modalId);
                    }
                });
            }

            // Ctrl+Enter - kaydet
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                const activeForm = document.querySelector('form:focus-within');
                if (activeForm) {
                    activeForm.dispatchEvent(new Event('submit'));
                }
            }

            // Tab navigation (Ctrl+1, Ctrl+2, etc.)
            if (e.ctrlKey && ['1', '2', '3', '4'].includes(e.key)) {
                e.preventDefault();
                const tabMap = {
                    '1': 'dashboard',
                    '2': 'students', 
                    '3': 'comments',
                    '4': 'templates'
                };
                this.tabs.switchTo(tabMap[e.key]);
            }
        });
    }

    setupNavigationHandlers() {
        // Yardım butonu
        document.getElementById('helpBtn').addEventListener('click', () => {
            window.ui.showModal('helpModal');
        });

        // Modal kapatma butonları
        document.getElementById('helpCloseBtn').addEventListener('click', () => {
            window.ui.hideModal('helpModal');
        });

        document.getElementById('addStudentCloseBtn').addEventListener('click', () => {
            window.ui.hideModal('addStudentModal');
        });

        document.getElementById('commentEditCloseBtn').addEventListener('click', () => {
            window.ui.hideModal('commentEditModal');
        });

        document.getElementById('allCommentsCloseBtn').addEventListener('click', () => {
            window.ui.hideModal('allCommentsModal');
        });

        // Modal dış alan tıklama
        const modals = [
            'welcomeModal', 'helpModal', 'addStudentModal', 
            'commentEditModal', 'aiSuggestionsModal', 'allCommentsModal'
        ];

        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        window.ui.hideModal(modalId);
                    }
                });
            }
        });
    }

    showWelcomeModal() {
        const hasSeenWelcome = window.storage.getSetting('hasSeenWelcome');
        if (!hasSeenWelcome) {
            setTimeout(() => {
                window.ui.showModal('welcomeModal');
            }, 500);
        }

        // Başlayalım butonu
        document.getElementById('welcomeStartBtn').addEventListener('click', () => {
            window.storage.setSetting('hasSeenWelcome', true);
            window.ui.hideModal('welcomeModal');
        });
    }
}

// Tab yönetimi sınıfı
class TabManager {
    constructor() {
        this.currentTab = 'dashboard';
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        document.querySelectorAll('[data-tab]').forEach(button => {
            button.addEventListener('click', () => {
                this.switchTo(button.dataset.tab);
            });
        });
    }

    switchTo(tabName) {
        if (this.currentTab === tabName) return;

        // Button state güncellemesi
        document.querySelectorAll('[data-tab]').forEach(btn => {
            btn.classList.remove('border-primary', 'text-primary');
            btn.classList.add('border-transparent', 'text-gray-500', 'dark:text-gray-400');
        });

        const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeButton) {
            activeButton.classList.remove('border-transparent', 'text-gray-500', 'dark:text-gray-400');
            activeButton.classList.add('border-primary', 'text-primary');
        }

        // Content görünürlük güncellemesi
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });

        const targetContent = document.getElementById(`${tabName}-tab`);
        if (targetContent) {
            targetContent.classList.remove('hidden');
        }

        this.currentTab = tabName;

        // Tab değişikliğinde refresh
        if (tabName === 'dashboard') {
            window.app.dashboard.updateStats();
        } else if (tabName === 'students') {
            window.students.render();
        } else if (tabName === 'comments') {
            window.comments.render();
        } else if (tabName === 'templates') {
            window.templates.render();
        }
    }
}

// Dashboard yönetimi sınıfı
class DashboardManager {
    constructor() {
        this.currentGradeFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Grade filtreleri
        document.querySelectorAll('.grade-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleGradeFilterChange(e);
            });
        });
    }

    handleGradeFilterChange(e) {
        const grade = e.target.dataset.grade;

        // Aktif filtreyi güncelle
        document.querySelectorAll('.grade-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');

        this.currentGradeFilter = grade;
        this.updateStats();
    }

    updateStats() {
        const stats = window.storage.getStatistics();

        // Temel istatistikler
        document.getElementById('totalStudents').textContent = stats.totalStudents;
        document.getElementById('completedComments').textContent = stats.completedComments;
        document.getElementById('pendingComments').textContent = stats.pendingComments;
        document.getElementById('completionRate').textContent = `${stats.completionRate}%`;

        // Ton analizi
        this.renderToneAnalysis(stats.toneAnalysis);

        // Popüler etiketler
        this.renderPopularTags(stats.popularTags);
    }

    renderToneAnalysis(toneData) {
        const container = document.getElementById('toneAnalysis');
        const total = toneData.olumlu + toneData.notr + toneData.olumsuz;

        if (total === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-gray-500 dark:text-gray-400">Henüz yorum bulunmuyor</p>
                </div>
            `;
            return;
        }

        const tones = [
            { key: 'olumlu', label: 'Olumlu', color: 'bg-positive', count: toneData.olumlu },
            { key: 'notr', label: 'Nötr', color: 'bg-neutral', count: toneData.notr },
            { key: 'olumsuz', label: 'Olumsuz', color: 'bg-negative', count: toneData.olumsuz }
        ];

        container.innerHTML = tones.map(tone => {
            const percentage = Math.round((tone.count / total) * 100);
            return `
                <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-600 dark:text-gray-400">${tone.label}</span>
                    <div class="flex items-center space-x-2">
                        <div class="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div class="${tone.color} h-2 rounded-full transition-all duration-500" style="width: ${percentage}%"></div>
                        </div>
                        <span class="text-sm font-medium text-gray-900 dark:text-white w-8">${tone.count}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderPopularTags(tagsData) {
        const container = document.getElementById('popularTags');
        const tags = Object.entries(tagsData)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);

        if (tags.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-gray-500 dark:text-gray-400">Henüz etiket bulunmuyor</p>
                </div>
            `;
            return;
        }

        const colors = [
            'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
            'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
            'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
            'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
            'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200',
            'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200',
            'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
            'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
        ];

        container.innerHTML = tags.map(([tag, count], index) => `
            <span class="${colors[index % colors.length]} px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:scale-105 transition-transform duration-200" title="${count} kullanım">
                ${tag}
            </span>
        `).join('');
    }
}

// Uygulama başlatma
document.addEventListener('DOMContentLoaded', function() {
    // Storage'ı önce başlat
    if (!window.storage) {
        window.storage = new Storage();
    }

    // Ardından diğer component'leri başlat
    window.app = new App();

    // Comment ve Student manager'ları biraz gecikmeyle başlat
    setTimeout(() => {
        if (!window.comments && window.storage) {
            window.comments = new CommentManager(window.storage);
        }
        if (!window.students && window.storage) {
            window.students = new StudentManager(window.storage);
        }
    }, 100);
});