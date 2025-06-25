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
        container.className = 'fixed top-4 right-4 z-50 space-y-2';
        document.body.appendChild(container);
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Animation
        requestAnimationFrame(() => {
            const content = modal.querySelector('div');
            if (content) {
                content.classList.remove('scale-95', 'opacity-0');
                content.classList.add('scale-100', 'opacity-100');
            }
        });

        // Focus management
        const firstInput = modal.querySelector('input, select, textarea, button');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        const content = modal.querySelector('div');
        if (content) {
            content.classList.remove('scale-100', 'opacity-100');
            content.classList.add('scale-95', 'opacity-0');
        }

        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            
            // Form reset
            const forms = modal.querySelectorAll('form');
            forms.forEach(form => {
                if (!form.classList.contains('no-reset')) {
                    form.reset();
                }
            });
        }, 300);
    }

    showToast(message, type = 'info', duration = 4000) {
        const toast = this.createToast(message, type);
        const container = document.getElementById('toast-container');
        
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
        toast.className = `transform translate-x-full opacity-0 transition-all duration-300 max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden`;

        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <div class="p-4">
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        <div class="${colors[type]} w-8 h-8 rounded-full flex items-center justify-center">
                            <i class="${icons[type]} text-white text-sm"></i>
                        </div>
                    </div>
                    <div class="ml-3 w-0 flex-1 pt-0.5">
                        <p class="text-sm font-medium text-gray-900 dark:text-white">${message}</p>
                    </div>
                    <div class="ml-4 flex-shrink-0 flex">
                        <button onclick="window.ui.removeToast(this.closest('.transform'))" class="bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                            <i class="fas fa-times text-sm"></i>
                        </button>
                    </div>
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
                <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700">
                    <div class="flex items-center mb-4">
                        <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mr-4">
                            <i class="fas fa-exclamation-triangle text-yellow-600 dark:text-yellow-400 text-xl"></i>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${title}</h3>
                    </div>
                    <p class="text-gray-600 dark:text-gray-300 mb-6">${message}</p>
                    <div class="flex space-x-3 justify-end">
                        <button id="cancelBtn" class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200">
                            İptal
                        </button>
                        <button id="confirmBtn" class="px-4 py-2 bg-primary hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200">
                            Onayla
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(dialog);

            const confirmBtn = dialog.querySelector('#confirmBtn');
            const cancelBtn = dialog.querySelector('#cancelBtn');

            const cleanup = () => {
                document.body.removeChild(dialog);
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

// Global UI manager instance
window.ui = new UIManager();
