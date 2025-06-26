// Ana uygulama koordinatörü
class App {
    constructor() {
        this.currentTab = 'dashboard';
        this.init();
    }

    init() {
        debugLog('App.init() started');

        this.initializeComponents();
        this.setupTheme();
        this.setupKeyboardShortcuts();
        this.setupNavigationHandlers();
        this.showWelcomeModal();

        // İlk yükleme ve tab navigation setup
        setTimeout(() => {
            debugLog('Running delayed initialization');
            this.dashboard.updateStats();
            this.tabs.switchTo('dashboard');
        }, 100);

        debugLog('App.init() completed');
    }

    async resetApplication() {
        try {
            const confirmed = await window.ui.confirmDialog(
                'Bu işlem tüm öğrenci verilerini, yorumları ve ayarları kalıcı olarak silecektir. Bu işlem geri alınamaz!\n\nEmin misiniz?',
                'Uygulamayı Sıfırla'
            );

            if (confirmed) {
                // İkinci onay
                const doubleConfirmed = await window.ui.confirmDialog(
                    'Son uyarı! Tüm verileriniz silinecek. Bu işlemi gerçekten yapmak istiyor musunuz?',
                    'Son Onay'
                );

                if (doubleConfirmed) {
                    // Tüm localStorage verilerini sil
                    window.storage.clear();

                    window.ui.showToast('Uygulama başarıyla sıfırlandı!', 'success');

                    // Sayfayı yenile
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
            }
        } catch (error) {
            window.ui.showToast('Sıfırlama sırasında hata oluştu!', 'error');
        }
    }

    exportToExcel() {
        try {
            const data = window.storage.exportData();
            const csvContent = this.convertToCSV(data);
            if (csvContent) {
                const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", `karne_yorumlari_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '_')}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                window.ui.showToast('Veriler Excel dosyasına aktarıldı!', 'success');
            }
        } catch (error) {
            window.ui.showToast('Excel aktarımı başarısız!', 'error');
        }
    }

    exportToPDF() {
        try {
            const data = window.storage.exportData();
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // PDF başlığı
            doc.setFontSize(16);
            doc.text('Karne Yorumları Raporu', 20, 20);
            doc.setFontSize(10);
            doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 20, 30);

            let yPosition = 50;

            // Öğrenci yorumları
            data.comments.forEach((comment, index) => {
                const student = data.students.find(s => s.id === comment.studentId);
                if (student) {
                    if (yPosition > 250) {
                        doc.addPage();
                        yPosition = 20;
                    }

                    doc.setFontSize(12);
                    doc.text(`${index + 1}. ${student.name} (${student.grade}-${student.section})`, 20, yPosition);
                    yPosition += 10;

                    doc.setFontSize(10);
                    const lines = doc.splitTextToSize(comment.content, 170);
                    doc.text(lines, 20, yPosition);
                    yPosition += lines.length * 5 + 10;
                }
            });

            doc.save(`karne_yorumlari_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '_')}.pdf`);
            window.ui.showToast('PDF raporu oluşturuldu!', 'success');
        } catch (error) {
            window.ui.showToast('PDF aktarımı için jsPDF kütüphanesi yüklenemedi!', 'error');
        }
    }

    convertToCSV(data) {
        const headers = ['Öğrenci Adı', 'Sınıf', 'Şube', 'Yorum', 'Ton', 'Dönem', 'Tarih'];
        const csvContent = [headers.join(',')];

        data.comments.forEach(comment => {
            const student = data.students.find(s => s.id === comment.studentId);
            if (student) {
                const row = [
                    `"${student.name}"`,
                    student.grade,
                    `"${student.section}"`,
                    `"${comment.content.replace(/"/g, '""')}"`,
                    comment.tone === 'olumlu' ? 'Olumlu' : comment.tone === 'notr' ? 'Nötr' : 'Olumsuz',
                    `${comment.period}. Dönem`,
                    new Date(comment.createdAt).toLocaleDateString('tr-TR')
                ];
                csvContent.push(row.join(','));
            }
        });

        return csvContent.join('\n');
    }

    initializeComponents() {
        // Tab yönetimi
        this.tabs = new TabManager();

        // Dashboard yönetimi
        this.dashboard = new DashboardManager();

        // Global referansları ayarla
        window.app = this;

        debugLog('App components initialized', {
            tabs: !!this.tabs,
            dashboard: !!this.dashboard
        });
    }

    setupTheme() {
        const savedTheme = window.storage.getSetting('theme') || 'dark';
        const htmlElement = document.documentElement;

        if (savedTheme === 'dark') {
            htmlElement.classList.add('dark');
        }

        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                htmlElement.classList.toggle('dark');
                const isDark = htmlElement.classList.contains('dark');
                window.storage.setSetting('theme', isDark ? 'dark' : 'light');
            });
        }
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
        // Welcome modal handlers
        const welcomeStartBtn = document.getElementById('welcomeStartBtn');
        debugLog('Welcome start button found:', !!welcomeStartBtn);
        if (welcomeStartBtn) {
            welcomeStartBtn.addEventListener('click', () => {
                debugLog('Welcome start button clicked');
                window.storage.setSetting('hasSeenWelcome', true);
                window.ui.hideModal('welcomeModal');
            });
        }

        const welcomeCloseBtn = document.getElementById('welcomeCloseBtn');
        if (welcomeCloseBtn) {
            welcomeCloseBtn.addEventListener('click', () => {
                window.storage.setSetting('hasSeenWelcome', true);
                window.ui.hideModal('welcomeModal');
            });
        }

        const welcomeDontShowAgain = document.getElementById('welcomeDontShowAgain');
        if (welcomeDontShowAgain) {
            welcomeDontShowAgain.addEventListener('click', () => {
                window.storage.setSetting('hasSeenWelcome', true);
                window.ui.hideModal('welcomeModal');
            });
        }

        // Welcome butonu
        const showWelcomeBtn = document.getElementById('showWelcomeBtn');
        if (showWelcomeBtn) {
            showWelcomeBtn.addEventListener('click', () => {
                window.ui.showModal('welcomeModal');
            });
        }

        // Export butonu
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportToExcel();
            });
        }

        // Reset butonu
        const resetAppBtn = document.getElementById('resetAppBtn');
        if (resetAppBtn) {
            resetAppBtn.addEventListener('click', () => {
                this.resetApplication();
            });
        }

        // Yardım butonu
        const helpBtn = document.getElementById('helpBtn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                window.ui.showModal('helpModal');
            });
        }

        // Modal kapatma butonları
        const helpCloseBtn = document.getElementById('helpCloseBtn');
        if (helpCloseBtn) {
            helpCloseBtn.addEventListener('click', () => {
                window.ui.hideModal('helpModal');
            });
        }

        const addStudentCloseBtn = document.getElementById('addStudentCloseBtn');
        if (addStudentCloseBtn) {
            addStudentCloseBtn.addEventListener('click', () => {
                window.ui.hideModal('addStudentModal');
            });
        }

        const commentEditCloseBtn = document.getElementById('commentEditCloseBtn');
        if (commentEditCloseBtn) {
            commentEditCloseBtn.addEventListener('click', () => {
                window.ui.hideModal('commentEditModal');
            });
        }

        const allCommentsCloseBtn = document.getElementById('allCommentsCloseBtn');
        if (allCommentsCloseBtn) {
            allCommentsCloseBtn.addEventListener('click', () => {
                window.ui.hideModal('allCommentsModal');
            });
        }

        const aiSuggestionsCloseBtn = document.getElementById('aiSuggestionsCloseBtn');
        if (aiSuggestionsCloseBtn) {
            aiSuggestionsCloseBtn.addEventListener('click', () => {
                window.ui.hideModal('aiSuggestionsModal');
            });
        }

        const cancelEditBtn = document.getElementById('cancelEditBtn');
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => {
                window.ui.hideModal('commentEditModal');
            });
        }

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
        debugLog('TabManager.bindEvents() started');
        const tabButtons = document.querySelectorAll('[data-tab]');
        debugLog('Found tab buttons:', tabButtons.length);

        tabButtons.forEach((button, index) => {
            debugLog(`Setting up tab button ${index}:`, button.dataset.tab);
            button.addEventListener('click', () => {
                debugLog('Tab button clicked:', button.dataset.tab);
                this.switchTo(button.dataset.tab);
            });
        });

        debugLog('TabManager.bindEvents() completed');
    }

    switchTo(tabName) {
        if (this.currentTab === tabName) return;

        // Button state güncellemesi
        document.querySelectorAll('[data-tab]').forEach(btn => {
            const tab = btn.dataset.tab;

            // Base classes for inactive state
            btn.className = 'tab-button bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all duration-200';

            // Add specific hover colors for each tab
            if (tab === 'students') {
                btn.classList.add('hover:bg-green-500', 'hover:text-white');
            } else if (tab === 'comments') {
                btn.classList.add('hover:bg-purple-500', 'hover:text-white');
            } else if (tab === 'templates') {
                btn.classList.add('hover:bg-orange-500', 'hover:text-white');
            } else if (tab === 'dashboard') {
                btn.classList.add('hover:bg-blue-500', 'hover:text-white');
            }
        });

        const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeButton) {
            // Aktif buton için özel renkler
            const colors = {
                'dashboard': 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
                'students': 'bg-gradient-to-r from-green-500 to-green-600 text-white',
                'comments': 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
                'templates': 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
            };

            activeButton.className = `tab-button ${colors[tabName]} px-4 py-3 rounded-lg shadow-lg font-medium transition-all duration-200 transform scale-105 whitespace-nowrap`;
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
            if (window.templates) {
                console.log('Refreshing templates tab');
                window.templates.render();
            }
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

        // Aktif filtreyi güncelle - active class ve görsel belirginleştirme
        document.querySelectorAll('.grade-filter').forEach(btn => {
            btn.classList.remove('active', 'border-yellow-400', 'ring-2', 'ring-yellow-300', 'scale-105');
            btn.classList.add('border-transparent');
        });

        e.target.classList.add('active', 'border-yellow-400', 'ring-2', 'ring-yellow-300', 'scale-105');
        e.target.classList.remove('border-transparent');

        this.currentGradeFilter = grade;
        this.updateStats();

        // Sınıf seçimi yapıldığında öğrenci yönetimi sekmesine git ve o sınıfı filtrele
        if (grade && grade !== 'all') {
            // Öğrenci yönetimi sekmesine geç
            window.app.tabs.switchTo('students');

            // Öğrenci sınıf filtresini ayarla
            if (window.students && typeof window.students.setGradeFilter === 'function') {
                window.students.setGradeFilter(grade);
            }

            // Templates manager'da da sınıf filtresini ayarla (AI öneriler için)
            if (window.templates && typeof window.templates.setSelectedGrade === 'function') {
                window.templates.setSelectedGrade(grade);
            }
        }
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

// Debug function
function debugLog(message, data = null) {
    console.log(`[DEBUG] ${message}`, data);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    debugLog('DOM Content Loaded - Starting initialization');

    try {
        // Create global instances in order
        debugLog('Creating Storage instance');
        window.storage = new Storage();
        debugLog('Storage created successfully');

        debugLog('Creating UI Manager instance');
        window.ui = new UIManager();
        debugLog('UI Manager created successfully');

        debugLog('Creating Student Manager instance');
        window.students = new StudentManager(window.storage);
        debugLog('Student Manager created successfully');

        debugLog('Creating Comment Manager instance');
        window.comments = new CommentManager(window.storage);
        debugLog('Comment Manager created successfully');

        debugLog('Creating Template Manager instance');
        window.templates = new TemplateManager(window.storage);
        debugLog('Template Manager created successfully');

        // Initialize app last
        debugLog('Creating App instance');
        window.app = new App();
        debugLog('App created successfully');

        debugLog('All instances created successfully');
    } catch (error) {
        console.error('[ERROR] Failed to initialize:', error);
        console.error('[ERROR] Error details:', error.message, error.stack);
    }
});