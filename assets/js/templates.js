// Şablon yönetimi sınıfı
class TemplateManager {
    constructor(storage) {
        this.storage = storage;
        this.templates = {};
        this.currentToneFilter = 'olumlu';
        this.selectedTags = [];
        this.aiModalToneFilter = 'all'; // AI modal için ayrı ton filtresi - tümü olarak başlat
        this.selectedGrade = 'all'; // Sınıf filtresi - başlangıç değeri
        this.selectedTerm = 'all'; // Dönem filtresi - başlangıç değeri
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
        const aiSuggestionsBtn = document.getElementById('aiSuggestionsBtn');
        if (aiSuggestionsBtn) {
            aiSuggestionsBtn.addEventListener('click', () => {
                this.showAISuggestions();
            });
        }

        // AI önerileri modal kapatma
        const aiSuggestionsCloseBtn = document.getElementById('aiSuggestionsCloseBtn');
        if (aiSuggestionsCloseBtn) {
            aiSuggestionsCloseBtn.addEventListener('click', () => {
                window.ui.hideModal('aiSuggestionsModal');
            });
        }

        // AI modal ton filtreleri
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('ai-tone-filter')) {
                this.handleAIToneFilterChange(e);
            }
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
        const toneBgColor = this.getToneBackgroundColor(template.ton);

        return `
            <div class="${toneBgColor} rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 animate-fade-in">
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

    handleAIToneFilterChange(e) {
        const tone = e.target.dataset.tone;

        // Aktif filtreyi güncelle
        document.querySelectorAll('.ai-tone-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');

        this.aiModalToneFilter = tone;
        this.renderSuggestions(); // Önerileri yeniden render et
    }

    showAISuggestions() {
        // Seçili öğrenciyi al (eğer comment edit modundaysak)
        const editModal = document.getElementById('commentEditModal');
        if (editModal && editModal.style.display !== 'none' && window.comments && window.comments.currentEditStudent) {
            this.setCurrentStudent(window.comments.currentEditStudent);
        }
        
        this.renderSelectedGradeInfo();
        this.renderTermFilters();
        this.renderTagFilters();
        this.renderSuggestions();
        window.ui.showModal('aiSuggestionsModal');
    }

    renderSelectedGradeInfo() {
        const container = document.getElementById('gradeFilterButtons');
        if (!container) return;

        // Seçili öğrencinin sınıfına göre otomatik filtreleme
        if (this.currentStudent && this.currentStudent.grade) {
            this.selectedGrade = this.currentStudent.grade;
        } else if (!this.selectedGrade) {
            this.selectedGrade = 'all';
        }

        const gradeText = this.selectedGrade === 'all' ? 'Tüm Sınıflar' : `${this.selectedGrade}. Sınıf`;
        const studentInfo = this.currentStudent ? ` - ${this.currentStudent.name}` : '';

        container.innerHTML = `
            <div class="bg-indigo-50 dark:bg-indigo-900 border border-indigo-200 dark:border-indigo-700 rounded-lg p-3">
                <div class="flex items-center gap-2">
                    <i class="fas fa-graduation-cap text-indigo-600 dark:text-indigo-400"></i>
                    <span class="text-indigo-800 dark:text-indigo-200 font-medium text-sm">
                        Seçili Sınıf: ${gradeText}${studentInfo}
                    </span>
                </div>
            </div>
        `;
    }

    renderTermFilters() {
        const container = document.getElementById('termFilterButtons');
        if (!container) return;

        const terms = [
            { value: 'all', label: 'Tüm Dönemler' },
            { value: '1', label: '1. Dönem' },
            { value: '2', label: '2. Dönem' }
        ];

        // Initialize selectedTerm if not set
        if (!this.selectedTerm) {
            this.selectedTerm = 'all';
        }

        container.innerHTML = `
            <div class="flex flex-wrap gap-1">
                ${terms.map(term => `
                    <button class="term-filter-btn px-2 py-1 rounded text-xs transition-colors duration-200 ${
                        this.selectedTerm === term.value 
                            ? 'bg-orange-500 text-white' 
                            : 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 hover:bg-orange-200 dark:hover:bg-orange-800'
                    }" data-term="${term.value}">
                        ${term.label}
                    </button>
                `).join('')}
            </div>
        `;

        // Term filter event listeners
        container.querySelectorAll('.term-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectedTerm = e.target.dataset.term;
                this.renderTermFilters(); // Re-render to update visual state
                this.renderSuggestions(); // Re-render suggestions
            });
        });
    }

    renderTagFilters() {
        const container = document.getElementById('tagFilterButtons');
        const allTags = this.getAllTags();
        const categorizedTags = this.categorizeTagsForFilters(allTags);

        container.innerHTML = Object.entries(categorizedTags).map(([category, tags]) => `
            <div class="tag-category-group mb-2">
                <button class="category-toggle w-full flex items-center justify-between bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 px-2 py-1 rounded text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200" data-category="${category}">
                    <span class="flex items-center gap-1">
                        <i class="${this.getCategoryIcon(category)} text-xs"></i>
                        ${category} (${tags.length})
                    </span>
                    <i class="fas fa-chevron-down transition-transform duration-200 text-xs"></i>
                </button>
                <div class="category-tags mt-1 hidden">
                    <div class="grid grid-cols-3 gap-1 pl-2">
                        ${tags.map(tag => `
                            <button class="tag-filter-btn px-2 py-1 rounded text-xs transition-colors duration-200 ${
                                this.selectedTags.includes(tag) 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800'
                            }" data-tag="${tag}">
                                ${tag}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');

        // Category toggle event listeners
        container.querySelectorAll('.category-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const categoryTags = btn.nextElementSibling;
                const chevron = btn.querySelector('.fa-chevron-down');

                if (categoryTags.classList.contains('hidden')) {
                    categoryTags.classList.remove('hidden');
                    chevron.style.transform = 'rotate(180deg)';
                } else {
                    categoryTags.classList.add('hidden');
                    chevron.style.transform = 'rotate(0deg)';
                }
            });
        });

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

        // Seçili öğrenci varsa ismi uygula
        let content = suggestion.icerik;
        if (this.currentStudent) {
            const firstName = this.currentStudent.name.split(' ')[0];
            content = content.replace(/\[Öğrenci Adı\]/g, firstName);
        }

        // Sınıf ve dönem bilgisini bul
        const gradeTermInfo = this.getGradeTermFromSuggestion(suggestion);

        const toneBgColor = this.getToneBackgroundColor(suggestion.ton);
        const hoverBgColor = this.getToneHoverColor(suggestion.ton);

        return `
            <div class="${toneBgColor} ${hoverBgColor} rounded-xl p-4 transition-colors duration-200 animate-fade-in cursor-pointer" onclick="window.templates.selectSuggestion('${suggestion.id || Date.now()}')">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex gap-2">
                        <span class="${toneColor} text-white px-2 py-1 rounded-full text-xs font-medium">${toneText}</span>
                        ${gradeTermInfo ? `
                            <span class="bg-indigo-500 text-white px-2 py-1 rounded-full text-xs font-medium">${gradeTermInfo.grade}. Sınıf</span>
                            <span class="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">${gradeTermInfo.term}. Dönem</span>
                        ` : ''}
                    </div>
                    <div class="flex gap-2">
                        <button onclick="event.stopPropagation(); window.templates.copySuggestion('${suggestion.id || Date.now()}')" class="text-gray-400 hover:text-blue-500 transition-colors duration-200" title="Kopyala">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button onclick="event.stopPropagation(); window.templates.selectSuggestion('${suggestion.id || Date.now()}')" class="text-primary hover:text-purple-700 transition-colors duration-200" title="Bu yorumu kullan">
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
                <p class="text-gray-700 dark:text-gray-300 mb-3">${content}</p>
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
        console.log('getFilteredSuggestions called with:', {
            selectedGrade: this.selectedGrade,
            selectedTerm: this.selectedTerm,
            aiModalToneFilter: this.aiModalToneFilter,
            selectedTags: this.selectedTags
        });

        let allTemplates = [];
        
        // Sınıf filtresi kontrolü - önce sınıf filtresini uygula
        const gradeFilter = this.selectedGrade || 'all';
        const termFilter = this.selectedTerm || 'all';
        
        console.log('Applied filters:', { gradeFilter, termFilter });

        // Şablonları topla
        if (gradeFilter === 'all') {
            // Tüm sınıflar seçili
            if (termFilter === 'all') {
                // Tüm dönemler
                ['5_1', '5_2', '6_1', '6_2', '7_1', '7_2', '8_1', '8_2'].forEach(key => {
                    if (this.templates[key] && this.templates[key].yorumlar) {
                        allTemplates.push(...this.templates[key].yorumlar);
                    }
                });
            } else {
                // Belirli dönem, tüm sınıflar
                ['5', '6', '7', '8'].forEach(grade => {
                    const key = `${grade}_${termFilter}`;
                    if (this.templates[key] && this.templates[key].yorumlar) {
                        allTemplates.push(...this.templates[key].yorumlar);
                    }
                });
            }
        } else {
            // Belirli sınıf seçili
            if (termFilter === 'all') {
                // Tüm dönemler, belirli sınıf
                ['1', '2'].forEach(term => {
                    const key = `${gradeFilter}_${term}`;
                    if (this.templates[key] && this.templates[key].yorumlar) {
                        allTemplates.push(...this.templates[key].yorumlar);
                    }
                });
            } else {
                // Belirli sınıf ve dönem
                const key = `${gradeFilter}_${termFilter}`;
                if (this.templates[key] && this.templates[key].yorumlar) {
                    allTemplates = [...this.templates[key].yorumlar];
                }
            }
        }

        console.log(`Total templates collected: ${allTemplates.length}`);

        // Ton filtresini uygula
        if (this.aiModalToneFilter && this.aiModalToneFilter !== 'all') {
            allTemplates = allTemplates.filter(template => template.ton === this.aiModalToneFilter);
            console.log(`After tone filter: ${allTemplates.length}`);
        }

        // Etiket filtresi yoksa ilk 20'yi döndür
        if (this.selectedTags.length === 0) {
            return allTemplates.slice(0, 20);
        }

        // Etiket filtresi uygula
        const tagFilteredResults = allTemplates.filter(template => {
            if (!template.etiketler || template.etiketler.length === 0) return false;
            return this.selectedTags.some(selectedTag => 
                template.etiketler.includes(selectedTag)
            );
        });

        console.log(`Final results after tag filter: ${tagFilteredResults.length}`);
        return tagFilteredResults;
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

    categorizeTagsForFilters(tags) {
        const categories = {
            'Akademik Başarı': [],
            'Davranış': [],
            'Sosyal Beceriler': [],
            'Katılım': [],
            'Çalışma Alışkanlıkları': [],
            'Kişisel Gelişim': [],
            'Diğer': []
        };

        tags.forEach(tag => {
            const lowerTag = tag.toLowerCase();

            if (lowerTag.includes('başarı') || lowerTag.includes('not') || lowerTag.includes('akademik') || 
                lowerTag.includes('ders') || lowerTag.includes('sınav') || lowerTag.includes('ödev') || 
                lowerTag.includes('performans') || lowerTag.includes('yetenek')) {
                categories['Akademik Başarı'].push(tag);
            } else if (lowerTag.includes('davranış') || lowerTag.includes('disiplin') || lowerTag.includes('kurallara') ||
                      lowerTag.includes('saygı') || lowerTag.includes('nezaket') || lowerTag.includes('uyum')) {
                categories['Davranış'].push(tag);
            } else if (lowerTag.includes('sosyal') || lowerTag.includes('arkadaş') || lowerTag.includes('iletişim') ||
                      lowerTag.includes('takım') || lowerTag.includes('işbirliği') || lowerTag.includes('empati')) {
                categories['Sosyal Beceriler'].push(tag);
            } else if (lowerTag.includes('katılım') || lowerTag.includes('aktif') || lowerTag.includes('etkinlik') ||
                      lowerTag.includes('söz') || lowerTag.includes('gönüllü') || lowerTag.includes('ilgi')) {
                categories['Katılım'].push(tag);
            } else if (lowerTag.includes('çalışma') || lowerTag.includes('düzen') || lowerTag.includes('organize') ||
                      lowerTag.includes('plan') || lowerTag.includes('zaman') || lowerTag.includes('düzenli')) {
                categories['Çalışma Alışkanlıkları'].push(tag);
            } else if (lowerTag.includes('gelişim') || lowerTag.includes('güven') || lowerTag.includes('özgüven') ||
                      lowerTag.includes('yaratıcı') || lowerTag.includes('liderlik') || lowerTag.includes('sorumluluk')) {
                categories['Kişisel Gelişim'].push(tag);
            } else {
                categories['Diğer'].push(tag);
            }
        });

        // Boş kategorileri kaldır
        Object.keys(categories).forEach(key => {
            if (categories[key].length === 0) {
                delete categories[key];
            }
        });

        return categories;
    }

    getCategoryIcon(category) {
        const icons = {
            'Akademik Başarı': 'fas fa-graduation-cap text-blue-500',
            'Davranış': 'fas fa-user-check text-green-500',
            'Sosyal Beceriler': 'fas fa-users text-purple-500',
            'Katılım': 'fas fa-hand-paper text-orange-500',
            'Çalışma Alışkanlıkları': 'fas fa-clock text-red-500',
            'Kişisel Gelişim': 'fas fa-star text-yellow-500',
            'Diğer': 'fas fa-tag text-gray-500'
        };
        return icons[category] || 'fas fa-tag text-gray-500';
    }

    setCurrentStudent(student) {
        this.currentStudent = student;
    }

    getGradeTermFromSuggestion(suggestion) {
        // Şablonun hangi sınıf ve dönemden geldiğini bul
        for (const [key, templateData] of Object.entries(this.templates)) {
            if (templateData && templateData.yorumlar) {
                const found = templateData.yorumlar.find(t => 
                    t.icerik === suggestion.icerik && 
                    t.ton === suggestion.ton &&
                    JSON.stringify(t.etiketler || []) === JSON.stringify(suggestion.etiketler || [])
                );
                
                if (found) {
                    const [grade, term] = key.split('_');
                    return { grade, term };
                }
            }
        }
        return null;
    }

    copySuggestion(id) {
        // AI önerilerinden şablonu bul
        const suggestions = this.getFilteredSuggestions();
        const suggestion = suggestions.find(t => (t.id || Date.now().toString()) === id);

        if (suggestion) {
            let content = suggestion.icerik;

            // Seçili öğrenci varsa ismi uygula
            if (this.currentStudent) {
                const firstName = this.currentStudent.name.split(' ')[0];
                content = content.replace(/\[Öğrenci Adı\]/g, firstName);
            }

            navigator.clipboard.writeText(content).then(() => {
                window.ui.showToast('Öneri kopyalandı!', 'success');
            }).catch(() => {
                window.ui.showToast('Kopyalama işlemi başarısız!', 'error');
            });
        }
    }

    selectSuggestion(id) {
        // AI önerilerinden şablonu bul
        const suggestions = this.getFilteredSuggestions();
        const suggestion = suggestions.find(t => (t.id || Date.now().toString()) === id);

        if (suggestion) {
            window.ui.hideModal('aiSuggestionsModal');

            // Check if we're in comment edit mode
            const editModal = document.getElementById('commentEditModal');
            const editTextarea = document.querySelector('#commentEditForm textarea[name="content"]');

            if (editModal && editModal.style.display !== 'none' && editTextarea) {
                // Edit mode - populate edit textarea
                let content = suggestion.icerik;

                // [Öğrenci Adı] yer tutucusunu otomatik olarak değiştir
                if (this.currentStudent) {
                    const firstName = this.currentStudent.name.split(' ')[0];
                    content = content.replace(/\[Öğrenci Adı\]/g, firstName);
                }

                editTextarea.value = content;
                window.comments.updateCharacterCount(content.length);

                const toneSelect = document.querySelector('#commentEditForm select[name="tone"]');
                if (toneSelect) {
                    toneSelect.value = suggestion.ton;
                }

                if (suggestion.etiketler && suggestion.etiketler.length > 0) {
                    window.comments.renderCurrentTags(suggestion.etiketler);
                }

                window.ui.showToast('Öneri aktarıldı ve isim uygulandı!', 'success');
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
            'olumlu': '😊 Olumlu',
            'notr': '😐 Nötr',
            'olumsuz': '😕 Olumsuz'
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

    getToneBackgroundColor(tone) {
        const colors = {
            'olumlu': 'bg-green-50 dark:bg-green-900/20',
            'notr': 'bg-yellow-50 dark:bg-yellow-900/20',
            'olumsuz': 'bg-red-50 dark:bg-red-900/20'
        };
        return colors[tone] || 'bg-white dark:bg-gray-800';
    }

    getToneHoverColor(tone) {
        const colors = {
            'olumlu': 'hover:bg-green-100 dark:hover:bg-green-900/30',
            'notr': 'hover:bg-yellow-100 dark:hover:bg-yellow-900/30',
            'olumsuz': 'hover:bg-red-100 dark:hover:bg-red-900/30'
        };
        return colors[tone] || 'hover:bg-gray-100 dark:hover:bg-gray-600';
    }
}

// Global template manager instance will be created in app.js