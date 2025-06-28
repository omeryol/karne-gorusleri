// UI yönetimi sınıfı
class UIManager {
    constructor() {
        this.activeToasts = [];
        this.init();
    }

    init() {
        this.setupStudentModalTabs();
        this.createToastContainer();
    }

    setupStudentModalTabs() {
        const studentTabBtns = document.querySelectorAll('.student-tab-btn');
        const studentTabContents = document.querySelectorAll('.student-tab-content');
        
        studentTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;
                
                // Button state güncellemesi
                studentTabBtns.forEach(button => {
                    button.classList.remove('border-primary', 'text-primary', 'active');
                    button.classList.add('border-transparent', 'text-gray-500', 'dark:text-gray-400');
                });
                
                btn.classList.remove('border-transparent', 'text-gray-500', 'dark:text-gray-400');
                btn.classList.add('border-primary', 'text-primary', 'active');
                
                // Content görünürlük güncellemesi
                studentTabContents.forEach(content => {
                    content.classList.add('hidden');
                });
                
                const targetContent = document.getElementById(`${targetTab}-student-tab`);
                if (targetContent) {
                    targetContent.classList.remove('hidden');
                }
            });
        });
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed top-4 right-2 md:right-4 z-50 space-y-2 max-w-sm';
        document.body.appendChild(container);
    }

    showModal(modalId, keepOthersOpen = false) {
        debugLog('UIManager.showModal called with:', modalId);
        
        const modal = document.getElementById(modalId);
        debugLog('Modal element found:', !!modal);
        
        if (!modal) {
            debugLog('ERROR: Modal not found:', modalId);
            return;
        }

        // Sadece belirtilirse diğer modalleri kapat
        if (!keepOthersOpen) {
            this.hideAllModals();
        }

        modal.style.display = 'flex';
        
        // Eğer başka bir modal açıksa body style'larını tekrar ayarlama
        if (!keepOthersOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.height = '100vh';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        }
        
        // Modal'ın tüm sayfayı kaplamasını engelle
        modal.style.isolation = 'isolate';
        modal.style.contain = 'layout style';
        
        // AI modal ise z-index'ini artır ki edit modalın üzerinde çıksın
        if (modalId === 'aiSuggestionsModal') {
            modal.style.zIndex = '60';
        }
        
        // Geçişli animasyon
        requestAnimationFrame(() => {
            modal.classList.remove('opacity-0');
            modal.classList.add('opacity-100');
            
            const content = modal.querySelector('div');
            if (content) {
                content.classList.remove('scale-90', 'scale-95', 'opacity-0');
                content.classList.add('scale-100', 'opacity-100');
            }
        });

        // Focus management - sadece keepOthersOpen false ise
        if (!keepOthersOpen) {
            const firstInput = modal.querySelector('input, select, textarea, button:not([id*="Close"])');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 300);
            }
        }
        
        debugLog('Modal shown successfully:', modalId);
    }

    hideAllModals() {
        const modals = [
            'welcomeModal', 'helpModal', 'addStudentModal', 
            'commentEditModal', 'aiSuggestionsModal', 'allCommentsModal'
        ];

        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal && modal.style.display === 'flex') {
                modal.style.display = 'none';
                modal.classList.add('opacity-0');
                const content = modal.querySelector('div');
                if (content) {
                    content.classList.add('scale-90', 'opacity-0');
                }
            }
        });

        document.body.style.overflow = '';
        document.body.style.height = '';
        document.body.style.position = '';
        document.body.style.width = '';
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        debugLog('UIManager.hideModal called with:', modalId);

        // Geçişli kapanış animasyonu
        modal.classList.remove('opacity-100');
        modal.classList.add('opacity-0');

        const content = modal.querySelector('div');
        if (content) {
            content.classList.remove('scale-100', 'opacity-100');
            content.classList.add('scale-90', 'scale-95', 'opacity-0');
        }

        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            document.body.style.height = '';
            document.body.style.position = '';
            document.body.style.width = '';
            
            // Form reset
            const forms = modal.querySelectorAll('form');
            forms.forEach(form => {
                if (!form.classList.contains('no-reset')) {
                    form.reset();
                }
            });

            debugLog('Modal hidden successfully:', modalId);
        }, 200);
    }

    hideModalOnly(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        debugLog('UIManager.hideModalOnly called with:', modalId);

        // Sadece belirtilen modalı kapat, body style'ları değiştirme
        modal.classList.remove('opacity-100');
        modal.classList.add('opacity-0');

        const content = modal.querySelector('div');
        if (content) {
            content.classList.remove('scale-100', 'opacity-100');
            content.classList.add('scale-90', 'scale-95', 'opacity-0');
        }

        setTimeout(() => {
            modal.style.display = 'none';
            
            // Form reset
            const forms = modal.querySelectorAll('form');
            forms.forEach(form => {
                if (!form.classList.contains('no-reset')) {
                    form.reset();
                }
            });

            debugLog('Modal hidden successfully (only):', modalId);
        }, 200);
    }

    showToast(message, type = 'info', duration = 4000) {
        const toast = this.createToast(message, type);
        const container = document.getElementById('toast-container');
        
        // Sınırla maksimum toast sayısını
        if (this.activeToasts.length >= 5) {
            this.removeToast(this.activeToasts[0]);
        }
        
        container.appendChild(toast);
        this.activeToasts.push(toast);

        // Show animation
        requestAnimationFrame(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
            toast.classList.add('translate-x-0', 'opacity-100');
        });

        // Auto remove
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);

        return toast;
    }

    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `transform translate-x-full opacity-0 transition-all duration-500 max-w-sm w-full`;

        const colors = {
            success: 'bg-green-50/30 dark:bg-green-900/30 border-green-300/50 dark:border-green-700/50',
            error: 'bg-red-50/30 dark:bg-red-900/30 border-red-300/50 dark:border-red-700/50',
            warning: 'bg-yellow-50/30 dark:bg-yellow-900/30 border-yellow-300/50 dark:border-yellow-700/50',
            info: 'bg-blue-50/30 dark:bg-blue-900/30 border-blue-300/50 dark:border-blue-700/50'
        };

        const iconColors = {
            success: 'from-green-500 to-green-600',
            error: 'from-red-500 to-red-600',
            warning: 'from-yellow-500 to-yellow-600',
            info: 'from-blue-500 to-blue-600'
        };

        const textColors = {
            success: 'text-green-800 dark:text-green-200',
            error: 'text-red-800 dark:text-red-200',
            warning: 'text-yellow-800 dark:text-yellow-200',
            info: 'text-blue-800 dark:text-blue-200'
        };

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <div class="glass-effect ${colors[type]} backdrop-blur-xl rounded-2xl p-4 shadow-2xl border-2 animate-slideIn">
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-gradient-to-br ${iconColors[type]} rounded-xl flex items-center justify-center shadow-lg animate-bounce-light">
                            <i class="${icons[type]} text-white text-sm"></i>
                        </div>
                    </div>
                    <div class="ml-3 flex-1">
                        <p class="text-sm font-semibold ${textColors[type]} leading-tight">${message}</p>
                    </div>
                    <button onclick="window.ui.removeToast(this.closest('.transform'))" class="ml-2 ${textColors[type]} hover:bg-white/20 dark:hover:bg-black/20 rounded-lg p-1 transition-all duration-200 hover:scale-110">
                        <i class="fas fa-times text-xs"></i>
                    </button>
                </div>
            </div>
        `;

        return toast;
    }

    removeToast(toast) {
        if (!toast || !toast.parentNode) return;

        toast.classList.remove('translate-x-0', 'opacity-100');
        toast.classList.add('translate-x-full', 'opacity-0');

        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            const index = this.activeToasts.indexOf(toast);
            if (index > -1) {
                this.activeToasts.splice(index, 1);
            }
        }, 300);
    }

    showLoadingState(element, text = 'Yükleniyor...') {
        if (!element) return;

        element.disabled = true;
        element.classList.add('loading');
        
        const originalText = element.innerHTML;
        element.innerHTML = `
            <i class="fas fa-spinner fa-spin mr-2"></i>
            ${text}
        `;

        return () => {
            element.disabled = false;
            element.classList.remove('loading');
            element.innerHTML = originalText;
        };
    }

    confirmDialog(message, title = 'Onay') {
        return new Promise((resolve) => {
            const dialog = document.createElement('div');
            dialog.className = 'fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4';
            
            dialog.innerHTML = `
                <div class="glass-effect bg-white/10 dark:bg-gray-900/20 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/30 dark:border-gray-700/50 transform scale-95 opacity-0 transition-all duration-300">
                    <div class="flex items-center mb-6">
                        <div class="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg animate-pulse">
                            <i class="fas fa-exclamation-triangle text-white text-2xl animate-bounce"></i>
                        </div>
                        <h3 class="text-xl font-bold text-white drop-shadow-lg">${title}</h3>
                    </div>
                    <p class="text-white/90 mb-8 text-lg leading-relaxed">${message}</p>
                    <div class="flex space-x-4 justify-end">
                        <button id="cancelBtn" class="px-6 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl font-medium transition-all duration-200 border border-white/20">
                            İptal
                        </button>
                        <button id="confirmBtn" class="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-red-500/25 transition-all duration-200 transform hover:scale-105">
                            Onayla
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(dialog);

            // Animasyon efekti
            requestAnimationFrame(() => {
                const dialogContent = dialog.querySelector('div');
                dialogContent.classList.remove('scale-95', 'opacity-0');
                dialogContent.classList.add('scale-100', 'opacity-100');
            });

            const confirmBtn = dialog.querySelector('#confirmBtn');
            const cancelBtn = dialog.querySelector('#cancelBtn');

            const cleanup = () => {
                const dialogContent = dialog.querySelector('div');
                dialogContent.classList.remove('scale-100', 'opacity-100');
                dialogContent.classList.add('scale-95', 'opacity-0');
                
                setTimeout(() => {
                    if (document.body.contains(dialog)) {
                        document.body.removeChild(dialog);
                    }
                }, 300);
            };

            confirmBtn.addEventListener('click', () => {
                cleanup();
                resolve(true);
            });

            cancelBtn.addEventListener('click', () => {
                cleanup();
                resolve(false);
            });

            dialog.addEventListener('click', (e) => {
                if (e.target === dialog) {
                    cleanup();
                    resolve(false);
                }
            });
        });
    }

    // Kırmızı ton uyarı metodu ekleme
    showWarningDialog(message, title = 'Uyarı') {
        return new Promise((resolve) => {
            const dialog = document.createElement('div');
            dialog.className = 'fixed inset-0 bg-black bg-opacity-60 backdrop-blur-lg z-50 flex items-center justify-center p-4';
            
            dialog.innerHTML = `
                <div class="glass-effect bg-red-50/20 dark:bg-red-900/20 backdrop-blur-xl rounded-3xl p-8 max-w-lg w-full shadow-2xl border-2 border-red-300/50 dark:border-red-700/50 transform scale-90 opacity-0 transition-all duration-500">
                    <div class="text-center">
                        <div class="w-20 h-20 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
                            <i class="fas fa-exclamation-triangle text-white text-3xl animate-wiggle"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-red-800 dark:text-red-200 mb-4 drop-shadow-sm">${title}</h3>
                        <p class="text-red-700 dark:text-red-300 mb-8 text-lg leading-relaxed">${message}</p>
                        <button id="warningOkBtn" class="px-8 py-4 bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-red-500/50 transition-all duration-300 transform hover:scale-110 border-2 border-red-400/30">
                            <i class="fas fa-check mr-2"></i>
                            Anladım
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(dialog);

            // Animasyon efekti
            requestAnimationFrame(() => {
                const dialogContent = dialog.querySelector('div');
                dialogContent.classList.remove('scale-90', 'opacity-0');
                dialogContent.classList.add('scale-100', 'opacity-100');
            });

            const okBtn = dialog.querySelector('#warningOkBtn');

            const cleanup = () => {
                const dialogContent = dialog.querySelector('div');
                dialogContent.classList.remove('scale-100', 'opacity-100');
                dialogContent.classList.add('scale-90', 'opacity-0');
                
                setTimeout(() => {
                    if (document.body.contains(dialog)) {
                        document.body.removeChild(dialog);
                    }
                }, 500);
            };

            okBtn.addEventListener('click', () => {
                cleanup();
                resolve(true);
            });

            dialog.addEventListener('click', (e) => {
                if (e.target === dialog) {
                    cleanup();
                    resolve(true);
                }
            });

            // ESC tuşu ile kapatma
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    cleanup();
                    resolve(true);
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            
            document.addEventListener('keydown', handleEscape);
        });
    }

    // Kırmızı ton error toast
    showErrorToast(message, duration = 5000) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 z-50 transform translate-x-full opacity-0 transition-all duration-500 max-w-sm w-full';
        
        toast.innerHTML = `
            <div class="glass-effect bg-red-50/30 dark:bg-red-900/30 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border-2 border-red-300/50 dark:border-red-700/50">
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center animate-pulse">
                            <i class="fas fa-exclamation-circle text-white text-sm"></i>
                        </div>
                    </div>
                    <div class="ml-3 flex-1">
                        <p class="text-sm font-semibold text-red-800 dark:text-red-200 leading-tight">${message}</p>
                    </div>
                    <button onclick="this.closest('.fixed').remove()" class="ml-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 transition-colors">
                        <i class="fas fa-times text-xs"></i>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(toast);

        // Show animation
        requestAnimationFrame(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
            toast.classList.add('translate-x-0', 'opacity-100');
        });

        // Auto remove
        setTimeout(() => {
            if (document.body.contains(toast)) {
                toast.classList.remove('translate-x-0', 'opacity-100');
                toast.classList.add('translate-x-full', 'opacity-0');
                
                setTimeout(() => {
                    if (document.body.contains(toast)) {
                        document.body.removeChild(toast);
                    }
                }, 500);
            }
        }, duration);

        return toast;
    }

    showProgress(progress = 0, text = '') {
        let progressDialog = document.getElementById('progressDialog');
        
        if (!progressDialog) {
            progressDialog = document.createElement('div');
            progressDialog.id = 'progressDialog';
            progressDialog.className = 'fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4';
            
            progressDialog.innerHTML = `
                <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700">
                    <div class="text-center">
                        <div class="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-cog fa-spin text-white text-2xl"></i>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">İşlem Devam Ediyor</h3>
                        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                            <div id="progressBar" class="bg-primary h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                        </div>
                        <p id="progressText" class="text-gray-600 dark:text-gray-300"></p>
                    </div>
                </div>
            `;
            
            document.body.appendChild(progressDialog);
        }

        const progressBar = progressDialog.querySelector('#progressBar');
        const progressText = progressDialog.querySelector('#progressText');
        
        progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        progressText.textContent = text;

        if (progress >= 100) {
            setTimeout(() => {
                this.hideProgress();
            }, 500);
        }
    }

    hideProgress() {
        const progressDialog = document.getElementById('progressDialog');
        if (progressDialog) {
            document.body.removeChild(progressDialog);
        }
    }

    // Accessibility helpers
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // Utility functions
    formatDate(date) {
        return new Intl.DateTimeFormat('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Global UI manager instance will be created in app.js

// Global UI manager instance will be created in app.js
