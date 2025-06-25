// Şablon yönetimi sınıfı
class TemplateManager {
    constructor(storage) {
        this.storage = storage;
        this.templates = {};
        this.currentToneFilter = 'olumlu';
        this.selectedTags = [];
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadTemplates();
        this.render();
    }

    bindEvents() {
        // Ton filtreleri
        document.querySelectorAll('.tone-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleToneFilterChange(e);
            });
        });

        // AI önerileri butonu
        document.getElementById('aiSuggestionsBtn').addEventListener('click', () => {
            this.showAISuggestions();
        });

        // AI önerileri modal kapatma
        document.getElementById('aiSuggestionsCloseBtn').addEventListener('click', () => {
            window.ui.hideModal('aiSuggestionsModal');
        });
    }

    async loadTemplates() {
        // JSON dosyalarından şablonları yükle
        const gradeTerms = [
            '5_1', '5_2', '6_1', '6_2',
            '7_1', '7_2', '8_1', '8_2'
        ];

        for (const gradeTerm of gradeTerms) {
            try {
                const response = await fetch(`./yorumlar/${gradeTerm}.json`);
                if (response.ok) {
                    const data = await response.json();
                    this.templates[gradeTerm] = data;
                }
            } catch (error) {
                console.warn(`Could not load template ${gradeTerm}:`, error);
            }
        }
    }

    handleToneFilterChange(e) {
        const tone = e.target.dataset.tone;
        
        // Aktif filtreyi güncelle
        document.querySelectorAll('.tone-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');

        this.currentToneFilter = tone;
        this.render();
    }

    getFilteredTemplates() {
        const allTemplates = [];
        
        // Tüm şablonları birleştir
        Object.values(this.templates).forEach(gradeTemplates => {
            if (gradeTemplates && gradeTemplates.yorumlar) {
                allTemplates.push(...gradeTemplates.yorumlar);
            }
        });

        // Ton filtresini uygula
        if (this.currentToneFilter !== 'all') {
            return allTemplates.filter(template => template.ton === this.currentToneFilter);
        }

        return allTemplates;
    }

    render() {
        const grid = document.getElementById('templatesGrid');
        const templates = this.getFilteredTemplates();

        if (templates.length === 0) {
            grid.innerHTML = this.renderEmptyState();
            return;
        }

        grid.innerHTML = templates.map(template => this.renderTemplateCard(template)).join('');
    }

    renderTemplateCard(template) {
        const toneColor = this.getToneColor(template.ton);
        const toneText = this.getToneText(template.ton);

        return `
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 animate-fade-in">
                <div class="flex items-center justify-between mb-4">
                    <span class="${toneColor} text-white px-3 py-1 rounded-full text-sm font-medium">${toneText}</span>
                    <div class="flex space-x-2">
                        <button onclick="window.templates.copyTemplate('${template.id || Date.now()}')" class="text-gray-400 hover:text-primary transition-colors duration-200" title="Kopyala">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button onclick="window.templates.useTemplate('${template.id || Date.now()}')" class="text-gray-400 hover:text-primary transition-colors duration-200" title="Kullan">
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
                <p class="text-gray-700 dark:text-gray-300 mb-4">${template.icerik}</p>
                ${template.etiketler && template.etiketler.length > 0 ? `
                    <div class="flex flex-wrap gap-1">
                        ${template.etiketler.map(tag => `
                            <span class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">${tag}</span>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="col-span-full text-center py-12">
                <div class="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <i class="fas fa-file-text text-gray-400 text-3xl"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Şablon bulunamadı</h3>
                <p class="text-gray-500 dark:text-gray-400 mb-4">
                    ${this.currentToneFilter !== 'all' 
                        ? `${this.getToneText(this.currentToneFilter)} tonunda şablon bulunamadı` 
                        : 'Henüz şablon yüklenmemiş'}
                </p>
                <button onclick="window.templates.handleToneFilterChange({target: {dataset: {tone: 'all'}}})" class="bg-primary hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
                    <i class="fas fa-filter mr-2"></i>
                    Tüm Şablonları Göster
                </button>
            </div>
        `;
    }

    showAISuggestions() {
        this.renderTagFilters();
        this.renderSuggestions();
        window.ui.showModal('aiSuggestionsModal');
    }

    renderTagFilters() {
        const container = document.getElementById('tagFilterButtons');
        const allTags = this.getAllTags();

        container.innerHTML = allTags.map(tag => `
            <button class="tag-filter-btn px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                this.selectedTags.includes(tag) 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800'
            }" data-tag="${tag}">
                ${tag}
            </button>
        `).join('');

        // Tag filter event listeners
        container.querySelectorAll('.tag-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.toggleTagFilter(e.target.dataset.tag);
                this.renderTagFilters(); // Re-render to update visual state
                this.renderSuggestions(); // Re-render suggestions
            });
        });
    }

    toggleTagFilter(tag) {
        const index = this.selectedTags.indexOf(tag);
        if (index === -1) {
            this.selectedTags.push(tag);
        } else {
            this.selectedTags.splice(index, 1);
        }
    }

    renderSuggestions() {
        const container = document.getElementById('suggestionsList');
        const suggestions = this.getFilteredSuggestions();

        if (suggestions.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-search text-gray-400 text-3xl mb-4"></i>
                    <p class="text-gray-500 dark:text-gray-400">
                        ${this.selectedTags.length > 0 ? 'Seçili etiketlere uygun öneri bulunamadı.' : 'Etiket seçerek öneriler görebilirsiniz.'}
                    </p>
                </div>
            `;
            return;
        }

        container.innerHTML = suggestions.map(suggestion => this.renderSuggestionCard(suggestion)).join('');
    }

    renderSuggestionCard(suggestion) {
        const toneColor = this.getToneColor(suggestion.ton);
        const toneText = this.getToneText(suggestion.ton);

        return `
            <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer animate-fade-in" onclick="window.templates.selectSuggestion('${suggestion.id || Date.now()}')">
                <div class="flex justify-between items-start mb-3">
                    <span class="${toneColor} text-white px-2 py-1 rounded-full text-xs font-medium">${toneText}</span>
                    <button class="text-primary hover:text-purple-700" title="Bu yorumu kullan">
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
                <p class="text-gray-700 dark:text-gray-300 mb-3">${suggestion.icerik}</p>
                ${suggestion.etiketler && suggestion.etiketler.length > 0 ? `
                    <div class="flex flex-wrap gap-1">
                        ${suggestion.etiketler.map(tag => `
                            <span class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">${tag}</span>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    getFilteredSuggestions() {
        const allTemplates = this.getFilteredTemplates();
        
        if (this.selectedTags.length === 0) {
            return allTemplates.slice(0, 10); // İlk 10 öneriyi göster
        }

        // Seçili etiketlere uygun şablonları filtrele
        return allTemplates.filter(template => {
            if (!template.etiketler || template.etiketler.length === 0) return false;
            
            return this.selectedTags.some(selectedTag => 
                template.etiketler.includes(selectedTag)
            );
        });
    }

    getAllTags() {
        const allTags = new Set();
        
        Object.values(this.templates).forEach(gradeTemplates => {
            if (gradeTemplates && gradeTemplates.yorumlar) {
                gradeTemplates.yorumlar.forEach(template => {
                    if (template.etiketler && template.etiketler.length > 0) {
                        template.etiketler.forEach(tag => allTags.add(tag));
                    }
                });
            }
        });

        return Array.from(allTags).sort();
    }

    setCurrentStudent(student) {
        this.currentStudent = student;
    }

    selectSuggestion(id) {
        const allTemplates = this.getFilteredTemplates();
        const suggestion = allTemplates.find(t => (t.id || Date.now().toString()) === id);
        
        if (suggestion) {
            window.ui.hideModal('aiSuggestionsModal');
            
            // Check if we're in comment edit mode
            const editModal = document.getElementById('commentEditModal');
            const editTextarea = document.querySelector('#commentEditForm textarea[name="content"]');
            
            if (editModal && editModal.style.display !== 'none' && editTextarea) {
                // Edit mode - populate edit textarea
                editTextarea.value = suggestion.icerik;
                window.comments.updateCharacterCount(suggestion.icerik.length);
                
                const toneSelect = document.querySelector('#commentEditForm select[name="tone"]');
                if (toneSelect) {
                    toneSelect.value = suggestion.ton;
                }

                if (suggestion.etiketler && suggestion.etiketler.length > 0) {
                    window.comments.renderCurrentTags(suggestion.etiketler);
                }
                
                window.ui.showToast('Öneri yorum düzenleme alanına aktarıldı!', 'success');
                return;
            }
            
            // Regular comment mode
            const textarea = document.getElementById('commentText');
            if (textarea) {
                textarea.value = suggestion.icerik;
                textarea.focus();
                
                window.comments.updateCharacterCount(suggestion.icerik.length);
                
                if (suggestion.etiketler) {
                    suggestion.etiketler.forEach(tag => window.comments.addTag(tag));
                }
            }
        }
    }

    copyTemplate(id) {
        const allTemplates = this.getFilteredTemplates();
        const template = allTemplates.find(t => (t.id || Date.now().toString()) === id);
        
        if (template) {
            navigator.clipboard.writeText(template.icerik).then(() => {
                window.ui.showToast('Şablon kopyalandı!', 'success');
            }).catch(() => {
                window.ui.showToast('Kopyalama işlemi başarısız!', 'error');
            });
        }
    }

    useTemplate(id) {
        this.selectSuggestion(id);
    }

    getToneColor(tone) {
        const colors = {
            'olumlu': 'bg-positive',
            'notr': 'bg-neutral',
            'olumsuz': 'bg-negative'
        };
        return colors[tone] || 'bg-gray-500';
    }

    getToneText(tone) {
        const texts = {
            'olumlu': 'Olumlu',
            'notr': 'Nötr',
            'olumsuz': 'Olumsuz'
        };
        return texts[tone] || 'Bilinmiyor';
    }

    getTemplateCount() {
        return this.getFilteredTemplates().length;
    }

    getTemplatesByTone(tone) {
        const allTemplates = this.getFilteredTemplates();
        return allTemplates.filter(template => template.ton === tone);
    }
}

// Global template manager instance
window.templates = new TemplateManager(window.storage);
