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
            try {
                // Check tab content elements exist
                const dashboardTab = document.getElementById('dashboard-tab');
                debugLog(`[INIT] Dashboard tab element exists: ${!!dashboardTab}`);
                if (dashboardTab) {
                    debugLog(`[INIT] Dashboard tab classes: ${dashboardTab.className}`);
                    debugLog(`[INIT] Dashboard tab display: ${dashboardTab.style.display}`);
                }

                // List all tab content elements
                const allTabContents = document.querySelectorAll('.tab-content');
                debugLog(`[INIT] Found ${allTabContents.length} tab content elements`);
                allTabContents.forEach((tab, index) => {
                    debugLog(`[INIT] Tab ${index}: ${tab.id}, classes: ${tab.className}, display: ${tab.style.display}`);
                });

                if (this.dashboard && typeof this.dashboard.updateStats === 'function') {
                    this.dashboard.updateStats();
                    debugLog('Dashboard stats updated');
                }
                if (this.tabs && typeof this.tabs.switchTo === 'function') {
                    debugLog('Switching to dashboard tab');
                    this.tabs.switchTo('dashboard');
                } else {
                    debugLog('ERROR: tabs.switchTo not available');
                }
                debugLog('Delayed initialization completed successfully');
            } catch (error) {
                debugLog('ERROR in delayed initialization:', error);
                debugLog('Error stack:', error.stack);
            }
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
        try {
            // Tab yönetimi
            this.tabs = new TabManager();
            debugLog('TabManager created successfully');

            // Dashboard yönetimi
            this.dashboard = new DashboardManager();
            debugLog('DashboardManager created successfully');

            // Global referansları ayarla
            window.app = this;

            debugLog('App components initialized', {
                tabs: !!this.tabs,
                dashboard: !!this.dashboard
            });
        } catch (error) {
            debugLog('ERROR in initializeComponents:', error);
            throw error;
        }
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
                e.preventDefault();
                e.stopPropagation();
                
                const openModals = [
                    'welcomeModal', 'helpModal', 'addStudentModal', 
                    'commentEditModal', 'aiSuggestionsModal', 'allCommentsModal'
                ];

                let modalClosed = false;
                openModals.forEach(modalId => {
                    const modal = document.getElementById(modalId);
                    if (modal && modal.style.display === 'flex' && !modalClosed) {
                        debugLog('Closing modal with ESC:', modalId);
                        window.ui.hideModal(modalId);
                        modalClosed = true;
                    }
                });

                if (!modalClosed) {
                    debugLog('No modal found to close with ESC');
                }
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
        // Welcome modal slide functionality
        this.currentSlide = 0;
        this.totalSlides = 5;

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

        // Slide navigation
        const prevSlideBtn = document.getElementById('prevSlideBtn');
        const nextSlideBtn = document.getElementById('nextSlideBtn');

        if (prevSlideBtn) {
            prevSlideBtn.addEventListener('click', () => {
                this.goToPrevSlide();
            });
        }

        if (nextSlideBtn) {
            nextSlideBtn.addEventListener('click', () => {
                this.goToNextSlide();
            });
        }

        // Slide indicators
        document.querySelectorAll('.slide-indicator').forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                this.goToSlide(index);
            });
        });

        // Auto slide (optional)
        this.autoSlideInterval = null;

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
                        debugLog('Modal backdrop clicked:', modalId);
                        window.ui.hideModal(modalId);
                    }
                });

                // Prevent modal content clicks from closing modal
                const modalContent = modal.querySelector('div');
                if (modalContent) {
                    modalContent.addEventListener('click', (e) => {
                        e.stopPropagation();
                    });
                }
            }
        });
    }

    showWelcomeModal() {
        const hasSeenWelcome = window.storage.getSetting('hasSeenWelcome');
        if (!hasSeenWelcome) {
            setTimeout(() => {
                window.ui.showModal('welcomeModal');
                this.resetSlidePosition();
                this.startAutoSlide();
            }, 500);
        }
    }

    goToSlide(slideIndex) {
        this.currentSlide = slideIndex;
        const slidesContainer = document.getElementById('welcomeSlides');
        if (slidesContainer) {
            slidesContainer.style.transform = `translateX(-${slideIndex * 100}%)`;
        }
        this.updateSlideIndicators();
        this.resetAutoSlide();
    }

    goToNextSlide() {
        const nextSlide = (this.currentSlide + 1) % this.totalSlides;
        this.goToSlide(nextSlide);
    }

    goToPrevSlide() {
        const prevSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.goToSlide(prevSlide);
    }

    updateSlideIndicators() {
        document.querySelectorAll('.slide-indicator').forEach((indicator, index) => {
            if (index === this.currentSlide) {
                indicator.classList.add('active');
                indicator.classList.remove('bg-white/40');
                indicator.classList.add('bg-white/80');
            } else {
                indicator.classList.remove('active');
                indicator.classList.remove('bg-white/80');
                indicator.classList.add('bg-white/40');
            }
        });
    }

    startAutoSlide() {
        this.stopAutoSlide();
        this.autoSlideInterval = setInterval(() => {
            this.goToNextSlide();
        }, 8000); // 8 saniyede bir otomatik geçiş
    }

    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }

    resetAutoSlide() {
        this.startAutoSlide();
    }

    resetSlidePosition() {
        this.currentSlide = 0;
        this.goToSlide(0);
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

        // DOM ready olana kadar bekle
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupTabButtons();
            });
        } else {
            this.setupTabButtons();
        }

        debugLog('TabManager.bindEvents() completed');
    }

    setupTabButtons() {
        const tabButtons = document.querySelectorAll('[data-tab]');
        debugLog('Found tab buttons:', tabButtons.length);

        if (tabButtons.length === 0) {
            debugLog('WARNING: No tab buttons found');
            debugLog('Checking for potential tab buttons in DOM...');
            const allButtons = document.querySelectorAll('button');
            debugLog(`Total buttons found: ${allButtons.length}`);
            allButtons.forEach((btn, i) => {
                if (btn.dataset && btn.dataset.tab) {
                    debugLog(`Button ${i} has data-tab: ${btn.dataset.tab}`);
                }
            });
            return;
        }

        tabButtons.forEach((button, index) => {
            const tabName = button.dataset.tab;
            debugLog(`Setting up tab button ${index}: ${tabName}`);

            // Check if corresponding tab content exists
            const correspondingContent = document.getElementById(`${tabName}-tab`);
            debugLog(`  Corresponding content exists for ${tabName}: ${!!correspondingContent}`);

            button.addEventListener('click', () => {
                debugLog(`Tab button clicked: ${tabName}`);
                this.switchTo(tabName);
            });
        });

        debugLog('Tab button setup completed');
    }

    switchTo(tabName) {
        debugLog(`[TAB-SWITCH] Attempting to switch to tab: ${tabName}`);
        debugLog(`[TAB-SWITCH] Current tab: ${this.currentTab}`);

        if (this.currentTab === tabName) {
            debugLog(`[TAB-SWITCH] Already on ${tabName}, skipping`);
            return;
        }

        // Button state güncellemesi
        const allTabButtons = document.querySelectorAll('[data-tab]');
        debugLog(`[TAB-SWITCH] Found ${allTabButtons.length} tab buttons`);

        allTabButtons.forEach(btn => {
            const tab = btn.dataset.tab;
            debugLog(`[TAB-SWITCH] Processing button: ${tab}`);

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
        debugLog(`[TAB-SWITCH] Active button found: ${!!activeButton}`);

        if (activeButton) {
            // Aktif buton için özel renkler
            const colors = {
                'dashboard': 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
                'students': 'bg-gradient-to-r from-green-500 to-green-600 text-white',
                'comments': 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
                'templates': 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
            };

            activeButton.className = `tab-button ${colors[tabName]} px-4 py-3 rounded-lg shadow-lg font-medium transition-all duration-200 transform scale-105 whitespace-nowrap`;
            debugLog(`[TAB-SWITCH] Applied active styles to ${tabName} button`);
        }

        // Content görünürlük güncellemesi
        const allTabContents = document.querySelectorAll('.tab-content');
        debugLog(`[TAB-SWITCH] Found ${allTabContents.length} tab contents`);

        allTabContents.forEach((content, index) => {
            const contentId = content.id;
            const wasHidden = content.classList.contains('hidden');
            content.classList.add('hidden');
            content.style.display = 'none';
            content.style.visibility = 'hidden';
            content.style.opacity = '0';
            content.style.zIndex = '0';
            debugLog(`[TAB-SWITCH] Hidden content ${index}: ${contentId}, was hidden: ${wasHidden}`);
        });

        const targetContent = document.getElementById(`${tabName}-tab`);
        if (targetContent) {
            debugLog(`[TAB-SWITCH] Found target content: ${tabName}-tab`);
            targetContent.classList.remove('hidden');
            targetContent.style.display = 'block';
            targetContent.style.visibility = 'visible';
            targetContent.style.opacity = '1';
            targetContent.style.zIndex = '10';
            targetContent.style.minHeight = 'calc(100vh - 200px)';
            targetContent.style.width = '100%';
            targetContent.style.position = 'relative';

            // Force multiple reflows to ensure changes take effect
            targetContent.offsetHeight;
            targetContent.offsetWidth;
            
            // Additional forcing
            setTimeout(() => {
                targetContent.style.display = 'block';
                targetContent.offsetHeight;
            }, 10);

            debugLog(`[TAB-SWITCH] Applied active styles to ${tabName} content`);
            debugLog(`[TAB-SWITCH] Final visibility check - classes: ${targetContent.className}, display: ${targetContent.style.display}, visibility: ${targetContent.style.visibility}`);
        } else {
            debugLog(`[TAB-SWITCH] WARNING: Target content not found: ${tabName}-tab`);
        }

        this.currentTab = tabName;
        debugLog(`[TAB-SWITCH] Updated current tab to: ${this.currentTab}`);

        // Tab değişikliğinde refresh
        if (tabName === 'dashboard') {
            debugLog(`[TAB-SWITCH] Refreshing dashboard`);
            try {
                window.app.dashboard.updateStats();
                debugLog(`[TAB-SWITCH] Dashboard stats updated successfully`);
            } catch (error) {
                debugLog(`[TAB-SWITCH] Error updating dashboard: ${error.message}`);
            }
        } else if (tabName === 'students') {
            debugLog(`[TAB-SWITCH] Refreshing students`);
            try {
                window.students.render();
                debugLog(`[TAB-SWITCH] Students rendered successfully`);
            } catch (error) {
                debugLog(`[TAB-SWITCH] Error rendering students: ${error.message}`);
            }
        } else if (tabName === 'comments') {
            debugLog(`[TAB-SWITCH] Refreshing comments`);
            try {
                window.comments.render();
                debugLog(`[TAB-SWITCH] Comments rendered successfully`);
            } catch (error) {
                debugLog(`[TAB-SWITCH] Error rendering comments: ${error.message}`);
            }
        } else if (tabName === 'templates') {
            debugLog(`[TAB-SWITCH] Refreshing templates`);
            if (window.templates) {
                try {
                    window.templates.render();
                    debugLog(`[TAB-SWITCH] Templates rendered successfully`);
                } catch (error) {
                    debugLog(`[TAB-SWITCH] Error rendering templates: ${error.message}`);
                }
            } else {
                debugLog(`[TAB-SWITCH] Templates manager not available`);
            }
        }

        debugLog(`[TAB-SWITCH] Tab switch to ${tabName} completed`);
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
        // DOM ready olana kadar bekle
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupGradeFilters();
            });
        } else {
            this.setupGradeFilters();
        }
    }

    setupGradeFilters() {
        // Grade filtreleri
        const gradeFilters = document.querySelectorAll('.grade-filter');
        debugLog('Found grade filters:', gradeFilters.length);

        gradeFilters.forEach(btn => {
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

    // First, let's check what's in the DOM
    debugLog('[DOM-CHECK] Document ready state:', document.readyState);
    debugLog('[DOM-CHECK] Body exists:', !!document.body);
    debugLog('[DOM-CHECK] HTML structure check...');

    // Check for main containers
    const mainContainer = document.querySelector('.max-w-7xl');
    debugLog('[DOM-CHECK] Main container found:', !!mainContainer);

    // Check for tab navigation
    const tabNavigation = document.querySelector('nav[aria-label="Tabs"]');
    debugLog('[DOM-CHECK] Tab navigation found:', !!tabNavigation);

    // Check for all tab content areas
    const dashboardTab = document.getElementById('dashboard-tab');
    const studentsTab = document.getElementById('students-tab');
    const commentsTab = document.getElementById('comments-tab');
    const templatesTab = document.getElementById('templates-tab');

    debugLog('[DOM-CHECK] Dashboard tab exists:', !!dashboardTab);
    debugLog('[DOM-CHECK] Students tab exists:', !!studentsTab);
    debugLog('[DOM-CHECK] Comments tab exists:', !!commentsTab);
    debugLog('[DOM-CHECK] Templates tab exists:', !!templatesTab);

    if (dashboardTab) {
        debugLog('[DOM-CHECK] Dashboard tab initial classes:', dashboardTab.className);
        debugLog('[DOM-CHECK] Dashboard tab initial display:', dashboardTab.style.display);
        debugLog('[DOM-CHECK] Dashboard tab innerHTML length:', dashboardTab.innerHTML.length);
    }

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

        // Manuel tab görünürlük kontrolü
        setTimeout(() => {
            debugLog('[MANUAL-TAB-CHECK] Running manual tab visibility check...');
            const dashboardTab = document.getElementById('dashboard-tab');

            if (dashboardTab) {
                debugLog('[MANUAL-TAB-CHECK] Dashboard tab found');
                debugLog('[MANUAL-TAB-CHECK] Current classes:', dashboardTab.className);
                debugLog('[MANUAL-TAB-CHECK] Current display:', dashboardTab.style.display);
                debugLog('[MANUAL-TAB-CHECK] Has hidden class:', dashboardTab.classList.contains('hidden'));

                if (dashboardTab.classList.contains('hidden')) {
                    dashboardTab.classList.remove('hidden');
                    debugLog('[MANUAL-TAB-CHECK] Removed hidden class');
                }

                dashboardTab.style.display = 'block';
                debugLog('[MANUAL-TAB-CHECK] Set display to block');
                debugLog('[MANUAL-TAB-CHECK] Final classes:', dashboardTab.className);
                debugLog('[MANUAL-TAB-CHECK] Final display:', dashboardTab.style.display);
            } else {
                debugLog('[MANUAL-TAB-CHECK] Dashboard tab NOT found!');
            }
        }, 200);

        // Additional debugging check
        setTimeout(() => {
            debugLog('[FINAL-CHECK] Final visibility check after 1 second...');
            const allTabContents = document.querySelectorAll('.tab-content');
            debugLog('[FINAL-CHECK] Total tab contents found:', allTabContents.length);

            allTabContents.forEach((tab, index) => {
                debugLog(`[FINAL-CHECK] Tab ${index}: ${tab.id}`);
                debugLog(`[FINAL-CHECK]   Classes: ${tab.className}`);
                debugLog(`[FINAL-CHECK]   Display: ${tab.style.display}`);
                debugLog(`[FINAL-CHECK]   Hidden: ${tab.classList.contains('hidden')}`);
                debugLog(`[FINAL-CHECK]   Visible: ${tab.offsetWidth > 0 && tab.offsetHeight > 0}`);
            });
        }, 1000);

    } catch (error) {
        console.error('[ERROR] Failed to initialize:', error);
        console.error('[ERROR] Error details:', error.message, error.stack);

        // Hata durumunda en azından dashboard'u göster
        setTimeout(() => {
            debugLog('[EMERGENCY] Running emergency dashboard display...');
            const dashboardTab = document.getElementById('dashboard-tab');
            if (dashboardTab) {
                dashboardTab.classList.remove('hidden');
                dashboardTab.style.display = 'block';
                dashboardTab.style.visibility = 'visible';
                debugLog('[EMERGENCY] Emergency dashboard display activated');
            } else {
                debugLog('[EMERGENCY] Dashboard tab not found for emergency display');
            }
        }, 500);
    }
});