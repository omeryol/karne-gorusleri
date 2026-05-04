// Şablon yönetimi sınıfı
class TemplateManager {
    constructor(storage) {
        this.storage = storage;
        this.templates = {};
        this.templateById = new Map();
        this.currentToneFilter = 'olumlu';
        this.mainGradeFilter = 'all';
        this.mainTermFilter = 'all';
        this.mainLengthFilter = 'all';
        this.selectedTags = [];
        this.aiModalToneFilter = 'all'; // AI modal için ayrı ton filtresi - tümü olarak başlat
        this.selectedGrade = 'all'; // Sınıf filtresi - başlangıç değeri
        this.selectedTerm = 'all'; // Dönem filtresi - başlangıç değeri
        this.selectedLength = 'all'; // Uzunluk filtresi (AI modal)
        this.aiSuggestionMode = 'classic'; // classic | tag-focused
        this.searchTerm = ''; // Arama terimi
        this.aiTagSearchTerm = '';
        this.isAITagFilterCollapsed = true;
        this.aiSuggestionsVisibleCount = 20;
        this.aiSuggestionsStep = 20;
        this.templateLoadState = {
            loaded: 0,
            failed: 0,
            lastError: null,
        };
        this.init();
    }

    async init() {
        this.loadSuggestionModePreference();
        this.bindEvents();
        this.setupSearch();
        await this.loadTemplates();
        // İlk yükleme için tüm tonları göster
        this.currentToneFilter = 'all';
        this.syncMainToneFilterButtons();
        this.render();
    }

    setupSearch() {
        const searchInput = document.getElementById('templateSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase().trim();
                this.resetSuggestionVisibleCount();
                this.renderTagFilters();
                this.renderSuggestions();
            });
        }
    }

    bindEvents() {
        // Ton filtreleri
        document.querySelectorAll('.tone-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleToneFilterChange(e);
            });
        });

        const gradeFilter = document.getElementById('templateGradeFilter');
        if (gradeFilter) {
            gradeFilter.addEventListener('change', (e) => {
                this.mainGradeFilter = e.target.value || 'all';
                this.render();
            });
        }

        const termFilter = document.getElementById('templateTermFilter');
        if (termFilter) {
            termFilter.addEventListener('change', (e) => {
                this.mainTermFilter = e.target.value || 'all';
                this.render();
            });
        }

        const lengthFilter = document.getElementById('templateLengthFilter');
        if (lengthFilter) {
            lengthFilter.addEventListener('change', (e) => {
                this.mainLengthFilter = e.target.value || 'all';
                this.render();
            });
        }

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
                this.resetAITags();
                window.ui.hideModal('aiSuggestionsModal');
            });
        }

        const tagFilterToggleBtn = document.getElementById('tagFilterToggleBtn');
        if (tagFilterToggleBtn) {
            tagFilterToggleBtn.addEventListener('click', () => {
                this.toggleAITagFilterVisibility();
            });
        }

        const aiTagSearchInput = document.getElementById('aiTagSearchInput');
        if (aiTagSearchInput) {
            aiTagSearchInput.addEventListener('input', (e) => {
                this.aiTagSearchTerm = String(e.target?.value || '').toLowerCase().trim();
                this.renderTagFilters();
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
        this.templates = {};
        this.templateById.clear();
        this.templateLoadState = {
            loaded: 0,
            failed: 0,
            lastError: null,
        };

        // JSON dosyalarından şablonları yükle
        const gradeTerms = [
            '5_1', '5_2', '6_1', '6_2',
            '7_1', '7_2', '8_1', '8_2'
        ];

        const bundledTemplateData = window.__KARNE_TEMPLATE_DATA__;

        if (bundledTemplateData && typeof bundledTemplateData === 'object') {
            gradeTerms.forEach((gradeTerm) => {
                const rawTemplates = Array.isArray(bundledTemplateData[gradeTerm])
                    ? bundledTemplateData[gradeTerm]
                    : Array.isArray(bundledTemplateData[gradeTerm]?.yorumlar)
                        ? bundledTemplateData[gradeTerm].yorumlar
                        : [];

                const [grade, term] = gradeTerm.split('_');
                const normalizedTemplates = rawTemplates
                    .map((template, index) => this.normalizeTemplate(template, grade, term, index))
                    .filter(Boolean);

                this.templates[gradeTerm] = { yorumlar: normalizedTemplates };
                normalizedTemplates.forEach((template) => {
                    this.templateById.set(template.id, template);
                });

                this.templateLoadState.loaded += 1;
            });

            this.refreshTagFilters();
            return;
        }

        for (const gradeTerm of gradeTerms) {
            try {
                const response = await fetch(`./yorumlar/${gradeTerm}.json`, {
                    cache: 'no-store'
                });
                if (!response.ok) {
                    this.templateLoadState.failed += 1;
                    this.templateLoadState.lastError = `${gradeTerm}.json yuklenemedi (${response.status})`;
                    continue;
                }

                const data = await response.json();
                const rawTemplates = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.yorumlar)
                        ? data.yorumlar
                        : [];

                const [grade, term] = gradeTerm.split('_');
                const normalizedTemplates = rawTemplates
                    .map((template, index) => this.normalizeTemplate(template, grade, term, index))
                    .filter(Boolean);

                this.templates[gradeTerm] = { yorumlar: normalizedTemplates };

                normalizedTemplates.forEach((template) => {
                    this.templateById.set(template.id, template);
                });

                this.templateLoadState.loaded += 1;
            } catch (error) {
                this.templateLoadState.failed += 1;
                this.templateLoadState.lastError = `${gradeTerm}.json okunurken hata olustu`;
            }
        }

        // Şablonlar yüklendikten sonra etiket filtrelerini güncelle
        this.refreshTagFilters();
    }

    normalizeTemplate(template, grade, term, index) {
        if (!template || typeof template !== 'object') {
            return null;
        }

        const content = (template.content || template.icerik || '')
            .toString()
            .replace(/\*\*/g, '')
            .replace(/\s{2,}/g, ' ')
            .trim();
        if (!content) {
            return null;
        }

        const tone = this.normalizeTone(template.tone || template.ton);
        const lengthType = this.normalizeLengthType(template.lengthType || template.length || template.tip || template.variant);
        const tags = Array.isArray(template.etiketler || template.tags)
            ? (template.etiketler || template.tags)
                .map((tag) => String(tag).trim())
                .filter((tag) => tag.length > 0)
            : [];

        const templateId = `${grade}_${term}_${template.id || index + 1}`;

        return {
            id: templateId,
            content,
            icerik: content,
            tone,
            ton: tone,
            etiketler: tags,
            tags,
            grade,
            term,
            lengthType,
        };
    }

    normalizeTone(tone) {
        const normalized = String(tone || 'notr').trim().toLowerCase();
        if (normalized === 'all') {
            return 'all';
        }
        if (normalized === 'olumlu' || normalized === 'notr' || normalized === 'olumsuz') {
            return normalized;
        }
        if (normalized === 'nötr' || normalized === 'neutral' || normalized === 'orta' || normalized === 'middle') {
            return 'notr';
        }
        return 'notr';
    }

    filterTemplatesByTone(templates, tone, options = {}) {
        const { enableNeutralFallback = true } = options;
        const normalizedTone = this.normalizeTone(tone || 'all');

        if (normalizedTone === 'all') {
            return templates;
        }

        const filtered = templates.filter((template) =>
            this.normalizeTone(template.tone || template.ton) === normalizedTone
        );

        if (normalizedTone !== 'notr' || filtered.length > 0 || !enableNeutralFallback) {
            return filtered;
        }

        return this.buildNeutralFallbackPool(templates);
    }

    buildNeutralFallbackPool(templates) {
        const olumluTemplates = [];
        const olumsuzTemplates = [];

        templates.forEach((template) => {
            const templateTone = this.normalizeTone(template.tone || template.ton);
            if (templateTone === 'olumlu') {
                olumluTemplates.push(template);
            } else if (templateTone === 'olumsuz') {
                olumsuzTemplates.push(template);
            }
        });

        const pairCount = Math.min(olumluTemplates.length, olumsuzTemplates.length);
        if (pairCount === 0) {
            return [];
        }

        const fallback = [];
        for (let i = 0; i < pairCount; i += 1) {
            fallback.push(olumluTemplates[i], olumsuzTemplates[i]);
        }

        return fallback;
    }

    applyTemplateSearchFilter(templates, searchTerm = '') {
        const normalizedSearchTerm = String(searchTerm || '').toLowerCase().trim();
        if (!normalizedSearchTerm) {
            return templates;
        }

        return templates.filter((template) => {
            const content = String(template.content || template.icerik || '').toLowerCase();
            const tags = Array.isArray(template.etiketler || template.tags) ? (template.etiketler || template.tags) : [];
            const tagString = tags.join(' ').toLowerCase();
            return content.includes(normalizedSearchTerm) || tagString.includes(normalizedSearchTerm);
        });
    }

    applyTemplateFilters(filters = {}, options = {}) {
        const {
            sourceTemplates = this.getAllTemplates(),
            grade = 'all',
            term = 'all',
            length = 'all',
            tone = 'all',
            searchTerm = '',
        } = filters;
        const { enableNeutralFallback = true } = options;

        let filteredTemplates = Array.isArray(sourceTemplates) ? sourceTemplates.slice() : [];

        if (String(grade) !== 'all') {
            filteredTemplates = filteredTemplates.filter((template) => template.grade === String(grade));
        }

        if (String(term) !== 'all') {
            filteredTemplates = filteredTemplates.filter((template) => template.term === String(term));
        }

        const normalizedLength = String(length || 'all').toLowerCase();
        if (normalizedLength !== 'all') {
            filteredTemplates = filteredTemplates.filter((template) => this.normalizeLengthType(template.lengthType || 'uzun') === normalizedLength);
        }

        filteredTemplates = this.filterTemplatesByTone(filteredTemplates, tone, { enableNeutralFallback });
        filteredTemplates = this.applyTemplateSearchFilter(filteredTemplates, searchTerm);

        return filteredTemplates;
    }

    getTemplatesBySelectionWithTone({ grade = 'all', term = 'all', length = 'all', tone = 'all', searchTerm = '', enableNeutralFallback = true } = {}) {
        return this.applyTemplateFilters(
            {
                grade,
                term,
                length,
                tone,
                searchTerm,
            },
            { enableNeutralFallback }
        );
    }

    syncMainToneFilterButtons() {
        const normalizedCurrent = this.normalizeTone(this.currentToneFilter);
        document.querySelectorAll('.tone-filter').forEach((btn) => {
            const buttonTone = this.normalizeTone(btn?.dataset?.tone || 'all');
            btn.classList.toggle('active', buttonTone === normalizedCurrent);
        });
    }

    normalizeLengthType(lengthType) {
        const normalized = String(lengthType || 'uzun').toLowerCase();
        if (normalized === 'kisa' || normalized === 'kısa') {
            return 'kisa';
        }
        return 'uzun';
    }

    handleToneFilterChange(e) {
        const target = e.currentTarget || e.target;
        const tone = target?.dataset?.tone;
        if (!tone) return;

        this.currentToneFilter = this.normalizeTone(tone);
        this.syncMainToneFilterButtons();
        this.render();
    }

    getFilteredTemplates() {
        return this.applyTemplateFilters({
            grade: this.mainGradeFilter,
            term: this.mainTermFilter,
            length: this.mainLengthFilter,
            tone: this.currentToneFilter,
        }, {
            enableNeutralFallback: true,
        });
    }

    getAllTemplates() {
        const allTemplates = [];
        Object.values(this.templates).forEach(gradeTemplates => {
            if (gradeTemplates && gradeTemplates.yorumlar) {
                allTemplates.push(...gradeTemplates.yorumlar);
            }
        });
        return allTemplates;
    }

    render() {
        const grid = document.getElementById('templatesGrid');
        const templates = this.getFilteredTemplates();

        // Update template count display
        this.updateTemplateCount(templates.length);

        if (templates.length === 0) {
            grid.innerHTML = this.renderEmptyState();
            return;
        }

        grid.innerHTML = templates.map(template => this.renderTemplateCard(template)).join('');
    }

    updateTemplateCount(count) {
        const counter = document.getElementById('templateCounter');
        if (counter) {
            counter.textContent = count;
        }
    }

    renderTemplateCard(template) {
        // Veri kontrolü
        const templateContent = template.icerik || template.content || 'İçerik bulunamadı';
        const templateTone = template.ton || template.tone || 'olumlu';
        const templateTags = template.etiketler || template.tags || [];

        const toneColor = this.getToneColor(templateTone);
        const toneText = this.getToneText(templateTone);
        const toneBgColor = this.getToneBackgroundColor(templateTone);
        const lengthType = template.lengthType || 'uzun';
        const lengthText = lengthType === 'kisa' ? 'Kısa' : 'Uzun';
        const lengthBadgeClass = lengthType === 'kisa' ? 'bg-emerald-500' : 'bg-slate-500';

        // Sınıf ve dönem bilgisini bul
        const gradeTermInfo = this.getGradeTermFromTemplate(template);
        const templateId = template.id;

        return `
            <div class="${toneBgColor} rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 animate-fade-in cursor-pointer" onclick="window.templates.useTemplate('${templateId}')">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex gap-2">
                        <span class="${toneColor} text-white px-3 py-1 rounded-full text-sm font-medium">${toneText}</span>
                        ${gradeTermInfo ? `
                            <span class="bg-indigo-500 text-white px-2 py-1 rounded-full text-xs font-medium">${gradeTermInfo.grade}. Sınıf</span>
                            <span class="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">${gradeTermInfo.term}. Dönem</span>
                        ` : ''}
                        <span class="${lengthBadgeClass} text-white px-2 py-1 rounded-full text-xs font-medium">${lengthText}</span>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="event.stopPropagation(); window.templates.copyTemplate('${templateId}')" class="text-gray-400 hover:text-primary transition-colors duration-200" title="Kopyala">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button onclick="event.stopPropagation(); window.templates.useTemplate('${templateId}')" class="text-gray-400 hover:text-primary transition-colors duration-200" title="Kullan">
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
                <p class="text-gray-700 dark:text-gray-300 mb-4">${templateContent}</p>
                ${templateTags && templateTags.length > 0 ? `
                    <div class="flex flex-wrap gap-1">
                        ${templateTags.map(tag => `
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
                    ${this.currentToneFilter !== 'all' || this.mainGradeFilter !== 'all' || this.mainTermFilter !== 'all' || this.mainLengthFilter !== 'all'
                        ? 'Secili filtrelere uygun sablon bulunamadi'
                        : 'Henüz şablon yüklenmemiş'}
                </p>
                <button onclick="window.templates.resetMainFilters()" class="bg-primary hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
                    <i class="fas fa-filter mr-2"></i>
                    Filtreleri Temizle
                </button>
            </div>
        `;
    }

    resetMainFilters() {
        this.currentToneFilter = 'all';
        this.mainGradeFilter = 'all';
        this.mainTermFilter = 'all';
        this.mainLengthFilter = 'all';

        const gradeFilter = document.getElementById('templateGradeFilter');
        if (gradeFilter) {
            gradeFilter.value = 'all';
        }

        const termFilter = document.getElementById('templateTermFilter');
        if (termFilter) {
            termFilter.value = 'all';
        }

        const lengthFilter = document.getElementById('templateLengthFilter');
        if (lengthFilter) {
            lengthFilter.value = 'all';
        }

        this.syncMainToneFilterButtons();
        this.render();
    }

    handleAIToneFilterChange(e) {
        const target = e.currentTarget || e.target;
        const tone = target?.dataset?.tone;
        if (!tone) return;

        // Aktif filtreyi güncelle
        document.querySelectorAll('.ai-tone-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        if (target.classList) {
            target.classList.add('active');
        }

        this.aiModalToneFilter = tone;
        this.resetSuggestionVisibleCount();
        this.renderSuggestions(); // Önerileri yeniden render et
    }

    showAISuggestions() {
        // Seçili öğrenciyi al (eğer comment edit modundaysak)
        const editModal = document.getElementById('commentEditModal');
        const isEditModalOpen = editModal && editModal.style.display !== 'none';
        
        if (isEditModalOpen && window.comments && window.comments.currentEditStudent) {
            this.setCurrentStudent(window.comments.currentEditStudent);
        }

        // AI modal ton filtrelerini sıfırla
        this.aiModalToneFilter = 'all';
        this.selectedLength = 'all';
        this.aiTagSearchTerm = '';

        const aiTagSearchInput = document.getElementById('aiTagSearchInput');
        if (aiTagSearchInput) {
            aiTagSearchInput.value = '';
        }

        this.renderSelectedGradeInfo();
        this.renderSuggestionModeButtons();
        this.renderAIToneFilters();
        this.renderTermFilters();
        this.renderLengthFilters();
        this.renderStyleFilters();
        this.renderCurrentTags(); // Etiket gösterimini render et
        
        // Etiket filtrelerini en güncel verilerle yeniden oluştur
        this.refreshTagFilters();
        this.renderTagFilters();
        this.isAITagFilterCollapsed = false;
        this.applyAITagFilterState();
        this.resetSuggestionVisibleCount();
        this.renderSuggestions();
        
        // Eğer edit modal açıksa, diğer modalleri kapatmadan AI modalını aç
        window.ui.showModal('aiSuggestionsModal', isEditModalOpen);
    }

    renderAIToneFilters() {
        const container = document.getElementById('aiToneFilterButtons');
        if (!container) return;

        const tones = [
            { value: 'all', label: '🎯 Tümü', color: 'bg-gray-500' },
            { value: 'olumlu', label: '😊 Olumlu', color: 'bg-positive' },
            { value: 'notr', label: '😐 Nötr', color: 'bg-neutral' },
            { value: 'olumsuz', label: '😕 Olumsuz', color: 'bg-negative' }
        ];

        container.innerHTML = `
            <div class="flex flex-wrap gap-2">
                ${tones.map(tone => `
                    <button class="ai-tone-filter px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                        this.aiModalToneFilter === tone.value 
                            ? `${tone.color} text-white` 
                            : `${tone.color}/20 text-gray-700 dark:text-gray-300 hover:${tone.color}/30`
                    }" data-tone="${tone.value}">
                        ${tone.label}
                    </button>
                `).join('')}
            </div>
        `;

        // Event listeners ekle
        container.querySelectorAll('.ai-tone-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleAIToneFilterChange(e);
            });
        });
    }

    loadSuggestionModePreference() {
        if (!this.storage || typeof this.storage.getSetting !== 'function') {
            this.aiSuggestionMode = 'classic';
            return;
        }

        const storedMode = String(this.storage.getSetting('aiSuggestionMode') || '').trim().toLowerCase();
        this.aiSuggestionMode = storedMode === 'tag-focused' ? 'tag-focused' : 'classic';
    }

    persistSuggestionModePreference() {
        if (!this.storage || typeof this.storage.setSetting !== 'function') {
            return;
        }

        this.storage.setSetting('aiSuggestionMode', this.aiSuggestionMode);
    }

    renderSuggestionModeButtons() {
        const container = document.getElementById('suggestionModeButtons');
        if (!container) return;

        const modes = [
            { value: 'classic', label: 'Standart' },
            { value: 'tag-focused', label: 'Etiket Odakli' },
        ];

        container.innerHTML = `
            <div class="space-y-1">
                <div class="flex flex-wrap gap-1">
                    ${modes.map((mode) => `
                        <button class="suggestion-mode-btn px-2 py-1 rounded text-xs transition-colors duration-200 ${
                            this.aiSuggestionMode === mode.value
                                ? 'bg-fuchsia-600 text-white'
                                : 'bg-fuchsia-100 dark:bg-fuchsia-900 text-fuchsia-800 dark:text-fuchsia-200 hover:bg-fuchsia-200 dark:hover:bg-fuchsia-800'
                        }" data-mode="${mode.value}">
                            ${mode.label}
                        </button>
                    `).join('')}
                </div>
                <p class="text-[11px] text-gray-500 dark:text-gray-400">
                    ${this.aiSuggestionMode === 'tag-focused'
                        ? 'Etiket uyumuna gore onceliklendirir.'
                        : 'Klasik filtreleme ve kalite siralamasini kullanir.'}
                </p>
            </div>
        `;

        container.querySelectorAll('.suggestion-mode-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const mode = e.currentTarget?.dataset?.mode;
                if (!mode) return;

                this.aiSuggestionMode = mode === 'tag-focused' ? 'tag-focused' : 'classic';
                this.persistSuggestionModePreference();
                this.resetSuggestionVisibleCount();
                this.renderSuggestionModeButtons();
                this.renderSuggestions();
            });
        });
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

        const gradeOptions = ['all', '5', '6', '7', '8'];
        const studentInfo = this.currentStudent ? ` (${this.currentStudent.name})` : '';

        container.innerHTML = `
            <div class="space-y-2">
                <div class="text-xs text-indigo-800 dark:text-indigo-200 font-medium">Secili sinif${studentInfo}</div>
                <div class="flex flex-wrap gap-1">
                    ${gradeOptions.map(grade => {
                        const active = this.selectedGrade === grade;
                        const text = grade === 'all' ? 'Tumu' : `${grade}. Sinif`;
                        return `
                            <button class="grade-selector-btn px-2 py-1 rounded text-xs transition-colors duration-200 ${
                                active
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 hover:bg-indigo-200 dark:hover:bg-indigo-800'
                            }" data-grade="${grade}">${text}</button>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        container.querySelectorAll('.grade-selector-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                this.selectedGrade = e.currentTarget.dataset.grade;
                this.selectedTags = [];
                this.resetSuggestionVisibleCount();
                this.renderSelectedGradeInfo();
                this.renderTagFilters();
                this.renderCurrentTags();
                this.renderSuggestions();
            });
        });
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
                this.resetSuggestionVisibleCount();
                this.renderTermFilters(); // Re-render to update visual state
                this.renderTagFilters();
                this.renderSuggestions(); // Re-render suggestions
            });
        });
    }

    renderLengthFilters() {
        const container = document.getElementById('lengthFilterButtons');
        if (!container) return;

        const lengths = [
            { value: 'all', label: 'Tümü' },
            { value: 'kisa', label: 'Kısa' },
            { value: 'uzun', label: 'Uzun' }
        ];

        if (!this.selectedLength) {
            this.selectedLength = 'all';
        }

        container.innerHTML = `
            <div class="flex flex-wrap gap-1">
                ${lengths.map((item) => `
                    <button class="length-filter-btn px-2 py-1 rounded text-xs transition-colors duration-200 ${
                        this.selectedLength === item.value
                            ? 'bg-teal-600 text-white'
                            : 'bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 hover:bg-teal-200 dark:hover:bg-teal-800'
                    }" data-length="${item.value}">
                        ${item.label}
                    </button>
                `).join('')}
            </div>
        `;

        container.querySelectorAll('.length-filter-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                this.selectedLength = e.currentTarget.dataset.length;
                this.resetSuggestionVisibleCount();
                this.renderLengthFilters();
                this.renderTagFilters();
                this.renderSuggestions();
            });
        });
    }

    renderStyleFilters() {
        const container = document.getElementById('styleFilterButtons');
        if (!container) return;

        const styleTags = [
            { tag: 'samimi', label: 'Samimi' },
            { tag: 'hafif-esprili', label: 'Esprili' },
            { tag: 'babacan', label: 'Babacan' },
            { tag: 'şefkatli', label: 'Şefkatli' },
            { tag: 'uyarici', label: 'Uyarıcı' },
        ];

        const availableTags = new Set(this.getTagsForCurrentSelection());

        container.innerHTML = `
            <div class="flex flex-wrap gap-1">
                ${styleTags.map(({ tag, label }) => {
                    const selected = this.selectedTags.includes(tag);
                    const available = availableTags.has(tag);
                    const baseClass = selected
                        ? 'bg-fuchsia-600 text-white ring-1 ring-fuchsia-400/70'
                        : 'bg-fuchsia-100 dark:bg-fuchsia-900 text-fuchsia-800 dark:text-fuchsia-200';
                    const disabledClass = available
                        ? 'hover:bg-fuchsia-200 dark:hover:bg-fuchsia-800 cursor-pointer'
                        : 'opacity-50 cursor-not-allowed';
                    return `
                        <button
                            class="style-filter-btn px-2 py-1 rounded text-xs transition-colors duration-200 ${baseClass} ${disabledClass}"
                            data-tag="${tag}"
                            ${available ? '' : 'disabled'}
                            title="${label}"
                        >
                            ${label}
                        </button>
                    `;
                }).join('')}
            </div>
        `;

        container.querySelectorAll('.style-filter-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const tag = e.currentTarget?.dataset?.tag;
                if (!tag) return;
                this.toggleStyleFilter(tag);
            });
        });
    }

    toggleStyleFilter(tag) {
        const availableTags = new Set(this.getTagsForCurrentSelection());
        if (!availableTags.has(tag)) {
            return;
        }

        this.toggleTagFilter(tag);
    }

    renderCurrentTags() {
        // This function renders the current tags display
        // Currently a placeholder for future tag display functionality
        const container = document.getElementById('selectedTagsDisplay');
        if (container && this.selectedTags.length > 0) {
            container.innerHTML = `
                <div class="mb-3 flex flex-wrap items-center gap-2">
                    ${this.selectedTags.map((tag) => {
                        const tagTone = this.getDominantToneForTag(tag);
                        const toneTheme = this.getToneTagTheme(tagTone);
                        return `
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs ${toneTheme.pillClass}" data-tone="${tagTone}">
                                ${tag}
                                <button class="ml-1 opacity-80 hover:opacity-100" onclick="window.templates.toggleTagFilter('${tag}')">
                                    <i class="fas fa-times text-xs"></i>
                                </button>
                            </span>
                        `;
                    }).join('')}
                    <button class="px-2 py-1 rounded text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600" onclick="window.templates.resetAITags()">
                        Filtreleri Temizle
                    </button>
                </div>
            `;
        } else if (container) {
            container.innerHTML = '';
        }
    }

    renderTagFilters() {
        const container = document.getElementById('tagFilterButtons');
        if (!container) return;

        // Mevcut seçime göre etiketleri al
        let currentTags = this.getTagsForCurrentSelection();

        if (this.aiTagSearchTerm) {
            currentTags = currentTags.filter((tag) => String(tag || '').toLowerCase().includes(this.aiTagSearchTerm));
        }

        this.selectedTags = this.selectedTags.filter(tag => currentTags.includes(tag));

        if (currentTags.length === 0) {
            const emptyText = this.aiTagSearchTerm
                ? 'Arama ile eslesen etiket bulunamadi.'
                : 'Bu secimde etiket bulunamadi.';
            container.innerHTML = `<p class="text-sm text-gray-500 dark:text-gray-400">${emptyText}</p>`;
            this.renderStyleFilters();
            return;
        }

        // Her etiket için şablon sayısını hesapla
        const tagCounts = {};
        const tagTones = {};
        currentTags.forEach(tag => {
            tagCounts[tag] = this.getTemplateCountForTag(tag);
            tagTones[tag] = this.getDominantToneForTag(tag);
        });

        const categorizedTags = this.categorizeTagsForFilters(currentTags);
        const orderedCategoryNames = [
            'Yorum Stili',
            'Akademik Başarı',
            'Davranış',
            'Sosyal Beceriler',
            'Katılım',
            'Çalışma Alışkanlıkları',
            'Kişisel Gelişim',
            'Diğer'
        ].filter((category) => Array.isArray(categorizedTags[category]) && categorizedTags[category].length > 0);

        container.innerHTML = `
            <div class="space-y-2">
                ${orderedCategoryNames.map((category) => {
                    const tags = categorizedTags[category].sort((a, b) => a.localeCompare(b, 'tr'));
                    const icon = this.getCategoryIcon(category);
                    const theme = this.getCategoryTheme(category);
                    const selectedInCategory = tags.filter((tag) => this.selectedTags.includes(tag)).length;

                    return `
                        <div class="rounded-lg border ${theme.groupBorderClass} ${theme.groupBgClass} p-2">
                            <div class="flex items-center justify-between gap-2 mb-1.5">
                                <div class="flex items-center gap-1.5">
                                    <i class="${icon} text-[11px]"></i>
                                    <span class="text-[11px] font-semibold ${theme.groupTextClass}">${category}</span>
                                </div>
                                <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-white/80 dark:bg-slate-900/50 ${theme.groupTextClass}">
                                    ${tags.length} etiket${selectedInCategory > 0 ? ` · ${selectedInCategory} secili` : ''}
                                </span>
                            </div>
                            <div class="flex flex-wrap gap-1">
                                ${tags.map((tag) => {
                                    const selected = this.selectedTags.includes(tag);
                                    const toneTheme = this.getToneTagTheme(tagTones[tag]);
                                    const buttonClass = selected ? toneTheme.selectedButtonClass : toneTheme.buttonClass;
                                    return `
                                        <button
                                            onclick="window.templates.toggleTagFilter('${tag}')"
                                            class="tag-filter-btn px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200 ${buttonClass}"
                                            data-tone="${tagTones[tag]}"
                                            title="${tag} - ${tagCounts[tag]} sablon"
                                        >
                                            ${tag} <span class="ml-1 text-[10px] opacity-80">(${tagCounts[tag]})</span>
                                        </button>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        this.applyAITagFilterState();
        this.renderStyleFilters();
    }

    toggleAITagFilterVisibility() {
        this.isAITagFilterCollapsed = !this.isAITagFilterCollapsed;
        this.applyAITagFilterState();
    }

    applyAITagFilterState() {
        const container = document.getElementById('tagFilterButtons');
        const toggleBtn = document.getElementById('tagFilterToggleBtn');
        if (!container || !toggleBtn) return;

        container.classList.toggle('is-collapsed', this.isAITagFilterCollapsed);
        toggleBtn.setAttribute('aria-expanded', String(!this.isAITagFilterCollapsed));

        const toggleText = toggleBtn.querySelector('.toggle-text');
        const toggleIcon = toggleBtn.querySelector('i');
        if (toggleText) {
            toggleText.textContent = this.isAITagFilterCollapsed ? 'Goster' : 'Daralt';
        }
        if (toggleIcon) {
            toggleIcon.className = this.isAITagFilterCollapsed
                ? 'fas fa-chevron-down text-[10px] mr-1'
                : 'fas fa-chevron-up text-[10px] mr-1';
        }
    }

    toggleTagFilter(tag) {
        const index = this.selectedTags.indexOf(tag);
        if (index === -1) {
            this.selectedTags.push(tag);
        } else {
            this.selectedTags.splice(index, 1);
        }

        this.renderCurrentTags(); // Update current tags display
        this.renderTagFilters(); // Re-render to update visual state
        this.renderStyleFilters();
        this.resetSuggestionVisibleCount();
        this.renderSuggestions(); // Re-render suggestions with new filter
    }

    renderSuggestions() {
        const container = document.getElementById('suggestionsList');
        if (!container) {
            console.error('suggestionsList container not found');
            return;
        }

        const allFilteredSuggestions = this.getFilteredSuggestions({ applyLimit: false });
        const suggestions = allFilteredSuggestions.slice(0, this.aiSuggestionsVisibleCount);
        const remainingCount = Math.max(allFilteredSuggestions.length - suggestions.length, 0);

        // Sayaçta toplam filtrelenmiş öneri sayısını göster
        this.updateSuggestionsCount(allFilteredSuggestions.length);

        if (suggestions.length === 0) {
            const loadFailed = this.templateLoadState.loaded === 0;
            const emptyText = loadFailed
                ? 'Yorum dosyalari yuklenemedi. Sayfayi yenileyip tekrar deneyin.'
                : 'Secili filtrelere uygun yorum bulunamadi.';

            container.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-search text-gray-400 text-3xl mb-4"></i>
                    <p class="text-gray-500 dark:text-gray-400">
                        ${emptyText}
                    </p>
                    <button onclick="window.templates.reloadTemplates()" class="mt-4 bg-primary hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
                        Yorumlari Yeniden Yukle
                    </button>
                </div>
            `;
            return;
        }

        const suggestionCards = suggestions.map(suggestion => this.renderSuggestionCard(suggestion)).join('');
        const loadMoreButton = remainingCount > 0
            ? `
                <div class="pt-2 flex justify-center">
                    <button type="button" onclick="window.templates.loadMoreSuggestions()" class="px-4 py-2 rounded-xl text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white transition-colors duration-200 shadow">
                        Daha fazla goster (${remainingCount} kalan)
                    </button>
                </div>
            `
            : '';

        container.innerHTML = `${suggestionCards}${loadMoreButton}`;
    }

    resetSuggestionVisibleCount() {
        this.aiSuggestionsVisibleCount = this.aiSuggestionsStep;
    }

    loadMoreSuggestions() {
        this.aiSuggestionsVisibleCount += this.aiSuggestionsStep;
        this.renderSuggestions();
    }

    // Etiket filtrelerini yenileme fonksiyonu
    refreshTagFilters() {
        // AI modal açık ise etiket filtrelerini güncelle
        const aiModal = document.getElementById('aiSuggestionsModal');
        if (aiModal && aiModal.style.display !== 'none') {
            this.renderTagFilters();
        }
    }

    // Şablonları yeniden yükleme fonksiyonu
    async reloadTemplates() {
        await this.loadTemplates();
        this.render(); // Ana şablonları yeniden render et
        
        // AI modal açık ise önerileri de güncelle
        const aiModal = document.getElementById('aiSuggestionsModal');
        if (aiModal && aiModal.style.display !== 'none') {
            this.renderSuggestions();
        }
        
    }

    renderSuggestionCard(suggestion) {
        const toneColor = this.getToneColor(suggestion.tone || suggestion.ton);
        const toneText = this.getToneText(suggestion.tone || suggestion.ton);

        // Seçili öğrenci varsa ismi uygula
        let content = suggestion.content || suggestion.icerik;
        if (this.currentStudent) {
            const firstName = this.currentStudent.name.split(' ')[0];
            content = content.replace(/\[Öğrenci Adı\]/g, firstName);
        }

        // Sınıf ve dönem bilgisini bul
        const gradeTermInfo = this.getGradeTermFromSuggestion(suggestion);
        const lengthType = suggestion.lengthType || 'uzun';
        const lengthText = lengthType === 'kisa' ? 'Kısa' : 'Uzun';
        const lengthBadgeClass = lengthType === 'kisa' ? 'bg-emerald-500' : 'bg-slate-500';

        const toneBgColor = this.getToneBackgroundColor(suggestion.tone || suggestion.ton);
        const hoverBgColor = this.getToneHoverColor(suggestion.tone || suggestion.ton);

        // Unique ID oluştur
        const suggestionId = suggestion.id;

        return `
            <div class="${toneBgColor} ${hoverBgColor} rounded-xl p-4 transition-colors duration-200 animate-fade-in cursor-pointer" onclick="window.templates.selectSuggestion('${suggestionId}')">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex gap-2">
                        <span class="${toneColor} text-white px-2 py-1 rounded-full text-xs font-medium">${toneText}</span>
                        ${gradeTermInfo ? `
                            <span class="bg-indigo-500 text-white px-2 py-1 rounded-full text-xs font-medium">${gradeTermInfo.grade}. Sınıf</span>
                            <span class="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">${gradeTermInfo.term}. Dönem</span>
                        ` : ''}
                        <span class="${lengthBadgeClass} text-white px-2 py-1 rounded-full text-xs font-medium">${lengthText}</span>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="event.stopPropagation(); window.templates.copySuggestion('${suggestionId}')" class="text-gray-400 hover:text-blue-500 transition-colors duration-200" title="Kopyala">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button onclick="event.stopPropagation(); window.templates.selectSuggestion('${suggestionId}')" class="text-primary hover:text-purple-700 transition-colors duration-200" title="Bu yorumu kullan">
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
                <p class="text-gray-700 dark:text-gray-300 mb-3">${content}</p>
                ${(suggestion.tags || suggestion.etiketler) && (suggestion.tags || suggestion.etiketler).length > 0 ? `
                    <div class="flex flex-wrap gap-1">
                        ${(suggestion.tags || suggestion.etiketler).map(tag => `
                            <span class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">${tag}</span>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    getFilteredSuggestions(options = {}) {
        const { applyLimit = true } = options;

        const allTemplates = this.getTemplatesBySelectionWithTone({
            grade: this.selectedGrade || 'all',
            term: this.selectedTerm || 'all',
            length: this.selectedLength || 'all',
            tone: this.aiModalToneFilter || 'all',
            searchTerm: this.searchTerm,
            enableNeutralFallback: true,
        });

        const isTagFocusedMode = this.aiSuggestionMode === 'tag-focused';
        let rankedTemplates;

        // Standart modda mevcut davranışı koru.
        if (!isTagFocusedMode) {
            if (this.selectedTags.length === 0) {
                rankedTemplates = this.rankTemplatesByQuality(allTemplates);
                return applyLimit ? rankedTemplates.slice(0, 20) : rankedTemplates;
            }

            const tagFilteredResults = allTemplates.filter((template) => {
                const templateTags = template.etiketler || template.tags;
                if (!templateTags || templateTags.length === 0) return false;
                return this.selectedTags.some((selectedTag) => templateTags.includes(selectedTag));
            });

            rankedTemplates = this.rankTemplatesByQuality(tagFilteredResults);
            return applyLimit ? rankedTemplates.slice(0, 20) : rankedTemplates;
        }

        // Etiket odakli modda secili etiketler sert filtre degil, oncelik puani olur.
        rankedTemplates = this.rankTemplatesByTagPriority(allTemplates);
        return applyLimit ? rankedTemplates.slice(0, 20) : rankedTemplates;
    }

    rankTemplatesByTagPriority(templates) {
        if (!Array.isArray(templates) || templates.length <= 1) {
            return templates;
        }

        const coverageCounts = this.buildCoverageCounts(templates);
        const studentContext = this.getStudentCommentContext();
        const selectedTags = this.selectedTags
            .map((tag) => String(tag || '').trim().toLowerCase())
            .filter(Boolean);

        return templates
            .map((template) => {
                const baseScore = this.getTemplateQualityScore(template, studentContext, coverageCounts);
                const templateTags = Array.isArray(template.etiketler || template.tags)
                    ? (template.etiketler || template.tags).map((tag) => String(tag || '').trim().toLowerCase())
                    : [];

                let tagScore = 0;
                if (selectedTags.length > 0) {
                    const overlap = selectedTags.filter((tag) => templateTags.includes(tag)).length;
                    tagScore += overlap * 2.2;

                    if (overlap === selectedTags.length) {
                        tagScore += 1.2;
                    }

                    if (overlap === 0) {
                        tagScore -= 3.5;
                    }
                }

                return {
                    template,
                    modeScore: baseScore + tagScore,
                };
            })
            .sort((a, b) => {
                if (b.modeScore !== a.modeScore) {
                    return b.modeScore - a.modeScore;
                }

                const aId = String(a.template.id || '');
                const bId = String(b.template.id || '');
                return aId.localeCompare(bId, 'tr');
            })
            .map((entry) => entry.template);
    }

    rankTemplatesByQuality(templates) {
        if (!Array.isArray(templates) || templates.length <= 1) {
            return templates;
        }

        const coverageCounts = this.buildCoverageCounts(templates);
        const studentContext = this.getStudentCommentContext();

        return templates
            .map((template) => {
                const qualityScore = this.getTemplateQualityScore(template, studentContext, coverageCounts);
                return { template, qualityScore };
            })
            .sort((a, b) => {
                if (b.qualityScore !== a.qualityScore) {
                    return b.qualityScore - a.qualityScore;
                }

                const aId = String(a.template.id || '');
                const bId = String(b.template.id || '');
                return aId.localeCompare(bId, 'tr');
            })
            .map((entry) => entry.template);
    }

    getStudentCommentContext() {
        if (!this.currentStudent || !this.currentStudent.id || !this.storage || typeof this.storage.getCommentsByStudentId !== 'function') {
            return null;
        }

        const rawComments = this.storage.getCommentsByStudentId(this.currentStudent.id) || [];
        if (rawComments.length === 0) {
            return null;
        }

        const recentComments = rawComments.slice(-6);
        const toneCounts = { olumlu: 0, notr: 0, olumsuz: 0 };
        const tagCounts = new Map();

        const normalizedComments = recentComments.map((comment) => {
            const tone = String(comment.tone || 'notr').toLowerCase();
            if (Object.prototype.hasOwnProperty.call(toneCounts, tone)) {
                toneCounts[tone] += 1;
            }

            const tags = Array.isArray(comment.tags)
                ? comment.tags
                : Array.isArray(comment.etiketler)
                    ? comment.etiketler
                    : [];

            tags.forEach((tag) => {
                const normalizedTag = String(tag || '').trim().toLowerCase();
                if (!normalizedTag) return;
                tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) || 0) + 1);
            });

            const content = String(comment.content || '').trim();
            return {
                content,
                tokens: this.tokenizeText(content)
            };
        });

        const dominantTone = Object.entries(toneCounts)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'notr';

        return {
            dominantTone,
            tagCounts,
            comments: normalizedComments,
        };
    }

    getTemplateQualityScore(template, studentContext, coverageCounts) {
        let score = 0;
        const templateTone = String(template.tone || template.ton || 'notr');
        const templateTags = Array.isArray(template.etiketler || template.tags)
            ? (template.etiketler || template.tags).map((tag) => String(tag || '').trim().toLowerCase()).filter(Boolean)
            : [];

        const coverageKey = this.getCoverageKey(template);
        const coverageCount = coverageCounts.get(coverageKey) || 1;

        // Dusuk kapsama sahip kombinasyonlari biraz one cekerek cesitlilik artir.
        score += Math.min(2.5, 2 / coverageCount);

        if (studentContext) {
            if (studentContext.dominantTone === templateTone) {
                score += 1.2;
            }

            const overlapCount = templateTags.filter((tag) => studentContext.tagCounts.has(tag)).length;
            score += Math.min(2.2, overlapCount * 0.7);

            const templateTokens = this.tokenizeText(String(template.content || template.icerik || ''));
            const maxSimilarity = studentContext.comments.reduce((max, comment) => {
                const similarity = this.calculateJaccardSimilarity(templateTokens, comment.tokens);
                return Math.max(max, similarity);
            }, 0);

            if (maxSimilarity > 0.62) {
                score -= (maxSimilarity - 0.62) * 6;
            }
        }

        return score;
    }

    getCoverageKey(template) {
        const tone = String(template.tone || template.ton || 'notr');
        const length = String(template.lengthType || 'uzun');
        const focus = this.getPrimaryFocus(template);
        return `${template.grade || 'all'}_${template.term || 'all'}_${tone}_${length}_${focus}`;
    }

    buildCoverageCounts(templates) {
        const counts = new Map();
        templates.forEach((template) => {
            const key = this.getCoverageKey(template);
            counts.set(key, (counts.get(key) || 0) + 1);
        });
        return counts;
    }

    getPrimaryFocus(template) {
        const tags = Array.isArray(template.etiketler || template.tags)
            ? (template.etiketler || template.tags)
            : [];

        if (tags.length === 0) {
            return 'genel';
        }

        const normalized = tags.map((tag) => String(tag || '').toLowerCase());

        if (normalized.some((tag) => /ödev|ders|matematik|okuma|yazma|sınav|akademik|performans/.test(tag))) {
            return 'akademik';
        }
        if (normalized.some((tag) => /davranış|kural|disiplin|saygı|sorumluluk|uyum/.test(tag))) {
            return 'davranis';
        }
        if (normalized.some((tag) => /arkadaş|sosyal|iletişim|işbirliği|takım|empati/.test(tag))) {
            return 'sosyal';
        }
        if (normalized.some((tag) => /dikkat|odak|motivasyon|duygusal|özgüven/.test(tag))) {
            return 'gelisim';
        }

        return 'genel';
    }

    tokenizeText(text) {
        return String(text || '')
            .toLowerCase()
            .replace(/\[öğrenci adı\]/gi, 'ogrenci')
            .replace(/[^a-z0-9çğıöşü\s]/gi, ' ')
            .split(/\s+/)
            .filter((token) => token.length > 2);
    }

    calculateJaccardSimilarity(tokensA, tokensB) {
        const setA = new Set(Array.isArray(tokensA) ? tokensA : []);
        const setB = new Set(Array.isArray(tokensB) ? tokensB : []);

        if (setA.size === 0 || setB.size === 0) {
            return 0;
        }

        let intersection = 0;
        setA.forEach((token) => {
            if (setB.has(token)) {
                intersection += 1;
            }
        });

        const union = setA.size + setB.size - intersection;
        return union > 0 ? intersection / union : 0;
    }

    getTemplatesBySelection(gradeFilter, termFilter, lengthFilter = 'all') {
        let templates = this.getAllTemplates();

        if (gradeFilter !== 'all') {
            templates = templates.filter((template) => template.grade === String(gradeFilter));
        }

        if (termFilter !== 'all') {
            templates = templates.filter((template) => template.term === String(termFilter));
        }

        if (lengthFilter !== 'all') {
            templates = templates.filter((template) => (template.lengthType || 'uzun') === String(lengthFilter));
        }

        return templates;
    }

    getAllTags() {
        const allTags = new Set();

        Object.values(this.templates).forEach(gradeTemplates => {
            if (gradeTemplates && gradeTemplates.yorumlar) {
                gradeTemplates.yorumlar.forEach(template => {
                    const tags = template.etiketler || template.tags;
                    if (tags && Array.isArray(tags)) {
                        tags.forEach(tag => allTags.add(tag));
                    }
                });
            }
        });

        return Array.from(allTags).sort();
    }

    // Seçilen sınıf ve dönemdeki şablonların etiketlerini getir
    getTagsForCurrentSelection() {
        const tags = new Set();
        const filteredTemplates = this.getTemplatesBySelectionWithTone({
            grade: this.selectedGrade || 'all',
            term: this.selectedTerm || 'all',
            length: this.selectedLength || 'all',
            tone: this.aiModalToneFilter || 'all',
            searchTerm: this.searchTerm,
            enableNeutralFallback: true,
        });

        filteredTemplates.forEach((template) => {
            const templateTags = template.etiketler || template.tags;
            if (templateTags && Array.isArray(templateTags)) {
                templateTags.forEach((tag) => tags.add(tag));
            }
        });

        return Array.from(tags);
    }

    getTemplateCountForTag(tag) {
        const baseTemplates = this.getTemplatesBySelectionWithTone({
            grade: this.selectedGrade || 'all',
            term: this.selectedTerm || 'all',
            length: this.selectedLength || 'all',
            tone: this.aiModalToneFilter || 'all',
            searchTerm: this.searchTerm,
            enableNeutralFallback: true,
        });

        // Mevcut secili etiketler varsa, sayimlari aktif filtre mantigina gore daralt
        const filteredTemplates = this.selectedTags.length === 0
            ? baseTemplates
            : baseTemplates.filter((template) => {
                const templateTags = template.etiketler || template.tags || [];
                const activeTags = this.selectedTags.filter((selectedTag) => selectedTag !== tag);
                if (activeTags.length === 0) return true;
                return activeTags.some((selectedTag) => templateTags.includes(selectedTag));
            });

        return filteredTemplates.filter((template) => {
            const templateTags = template.etiketler || template.tags || [];
            return templateTags.includes(tag);
        }).length;
    }

    categorizeTagsForFilters(tags) {
        const categories = {
            'Yorum Stili': [],
            'Akademik Başarı': [],
            'Davranış': [],
            'Sosyal Beceriler': [],
            'Katılım': [],
            'Çalışma Alışkanlıkları': [],
            'Kişisel Gelişim': [],
            'Diğer': []
        };

        tags.forEach(tag => {
            const lowerTag = this.normalizeTagForMatch(tag);

            if (lowerTag.includes('samimi') || lowerTag.includes('babacan') || lowerTag.includes('sefkatli') ||
                lowerTag.includes('uyarici') || lowerTag.includes('hafif-esprili') || lowerTag.includes('esprili')) {
                categories['Yorum Stili'].push(tag);
            } else if (lowerTag.includes('başarı') || lowerTag.includes('not') || lowerTag.includes('akademik') || 
                lowerTag.includes('ders') || lowerTag.includes('sınav') || lowerTag.includes('ödev') || 
                lowerTag.includes('performans') || lowerTag.includes('yetenek') ||
                lowerTag.includes('basari') || lowerTag.includes('sinav') || lowerTag.includes('odev')) {
                categories['Akademik Başarı'].push(tag);
            } else if (lowerTag.includes('davranış') || lowerTag.includes('disiplin') || lowerTag.includes('kurallara') ||
                      lowerTag.includes('saygı') || lowerTag.includes('nezaket') || lowerTag.includes('uyum') ||
                      lowerTag.includes('davranis') || lowerTag.includes('saygi')) {
                categories['Davranış'].push(tag);
            } else if (lowerTag.includes('sosyal') || lowerTag.includes('arkadaş') || lowerTag.includes('iletişim') ||
                      lowerTag.includes('takım') || lowerTag.includes('işbirliği') || lowerTag.includes('empati') ||
                      lowerTag.includes('arkadas') || lowerTag.includes('iletisim') || lowerTag.includes('isbirligi')) {
                categories['Sosyal Beceriler'].push(tag);
            } else if (lowerTag.includes('katılım') || lowerTag.includes('aktif') || lowerTag.includes('etkinlik') ||
                      lowerTag.includes('söz') || lowerTag.includes('gönüllü') || lowerTag.includes('ilgi') ||
                      lowerTag.includes('katilim') || lowerTag.includes('gonullu')) {
                categories['Katılım'].push(tag);
            } else if (lowerTag.includes('çalışma') || lowerTag.includes('düzen') || lowerTag.includes('organize') ||
                      lowerTag.includes('plan') || lowerTag.includes('zaman') || lowerTag.includes('düzenli') ||
                      lowerTag.includes('calisma') || lowerTag.includes('duzen') || lowerTag.includes('duzenli')) {
                categories['Çalışma Alışkanlıkları'].push(tag);
            } else if (lowerTag.includes('gelişim') || lowerTag.includes('güven') || lowerTag.includes('özgüven') ||
                      lowerTag.includes('yaratıcı') || lowerTag.includes('liderlik') || lowerTag.includes('sorumluluk') ||
                      lowerTag.includes('gelisim') || lowerTag.includes('ozguven') || lowerTag.includes('yaratici')) {
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
            'Yorum Stili': 'fas fa-feather-alt text-fuchsia-500',
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

    getCategoryTheme(category) {
        const themes = {
            'Yorum Stili': {
                groupBgClass: 'bg-fuchsia-50/80 dark:bg-fuchsia-950/30',
                groupBorderClass: 'border-fuchsia-200 dark:border-fuchsia-800',
                groupTextClass: 'text-fuchsia-700 dark:text-fuchsia-300',
                buttonClass: 'bg-fuchsia-100 dark:bg-fuchsia-900 text-fuchsia-800 dark:text-fuchsia-100 hover:bg-fuchsia-200 dark:hover:bg-fuchsia-800',
                selectedButtonClass: 'bg-fuchsia-600 text-white shadow-sm ring-1 ring-fuchsia-400/70',
                pillClass: 'bg-fuchsia-100 dark:bg-fuchsia-900 text-fuchsia-800 dark:text-fuchsia-100',
            },
            'Akademik Başarı': {
                groupBgClass: 'bg-blue-50/80 dark:bg-blue-950/30',
                groupBorderClass: 'border-blue-200 dark:border-blue-800',
                groupTextClass: 'text-blue-700 dark:text-blue-300',
                buttonClass: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-800',
                selectedButtonClass: 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/70',
                pillClass: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100',
            },
            'Davranış': {
                groupBgClass: 'bg-emerald-50/80 dark:bg-emerald-950/30',
                groupBorderClass: 'border-emerald-200 dark:border-emerald-800',
                groupTextClass: 'text-emerald-700 dark:text-emerald-300',
                buttonClass: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100 hover:bg-emerald-200 dark:hover:bg-emerald-800',
                selectedButtonClass: 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/70',
                pillClass: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100',
            },
            'Sosyal Beceriler': {
                groupBgClass: 'bg-violet-50/80 dark:bg-violet-950/30',
                groupBorderClass: 'border-violet-200 dark:border-violet-800',
                groupTextClass: 'text-violet-700 dark:text-violet-300',
                buttonClass: 'bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-100 hover:bg-violet-200 dark:hover:bg-violet-800',
                selectedButtonClass: 'bg-violet-600 text-white shadow-sm ring-1 ring-violet-400/70',
                pillClass: 'bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-100',
            },
            'Katılım': {
                groupBgClass: 'bg-amber-50/80 dark:bg-amber-950/30',
                groupBorderClass: 'border-amber-200 dark:border-amber-800',
                groupTextClass: 'text-amber-700 dark:text-amber-300',
                buttonClass: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100 hover:bg-amber-200 dark:hover:bg-amber-800',
                selectedButtonClass: 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400/70',
                pillClass: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100',
            },
            'Çalışma Alışkanlıkları': {
                groupBgClass: 'bg-sky-50/80 dark:bg-sky-950/30',
                groupBorderClass: 'border-sky-200 dark:border-sky-800',
                groupTextClass: 'text-sky-700 dark:text-sky-300',
                buttonClass: 'bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-100 hover:bg-sky-200 dark:hover:bg-sky-800',
                selectedButtonClass: 'bg-sky-600 text-white shadow-sm ring-1 ring-sky-400/70',
                pillClass: 'bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-100',
            },
            'Kişisel Gelişim': {
                groupBgClass: 'bg-rose-50/80 dark:bg-rose-950/30',
                groupBorderClass: 'border-rose-200 dark:border-rose-800',
                groupTextClass: 'text-rose-700 dark:text-rose-300',
                buttonClass: 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-100 hover:bg-rose-200 dark:hover:bg-rose-800',
                selectedButtonClass: 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-400/70',
                pillClass: 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-100',
            },
            'Diğer': {
                groupBgClass: 'bg-slate-50/80 dark:bg-slate-900/50',
                groupBorderClass: 'border-slate-200 dark:border-slate-700',
                groupTextClass: 'text-slate-700 dark:text-slate-300',
                buttonClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700',
                selectedButtonClass: 'bg-slate-600 text-white shadow-sm ring-1 ring-slate-400/70',
                pillClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200',
            }
        };

        return themes[category] || themes['Diğer'];
    }

    normalizeTagForMatch(tag) {
        return String(tag || '')
            .toLowerCase()
            .replace(/ı/g, 'i')
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c');
    }

    getTagCategory(tag) {
        const categorized = this.categorizeTagsForFilters([tag]);
        return Object.keys(categorized)[0] || 'Diğer';
    }

    getDominantToneForTag(tag) {
        const toneCounts = { olumlu: 0, notr: 0, olumsuz: 0 };

        const templates = this.getTemplatesBySelection(
            this.selectedGrade || 'all',
            this.selectedTerm || 'all',
            this.selectedLength || 'all'
        ).filter((template) => {
            if (!this.searchTerm) return true;
            const content = (template.content || template.icerik || '').toLowerCase();
            const templateTags = template.etiketler || template.tags || [];
            const tagString = templateTags.join(' ').toLowerCase();
            return content.includes(this.searchTerm) || tagString.includes(this.searchTerm);
        });

        templates.forEach((template) => {
            const templateTags = template.etiketler || template.tags || [];
            if (!templateTags.includes(tag)) {
                return;
            }

            const tone = this.normalizeTone(template.tone || template.ton);
            if (Object.prototype.hasOwnProperty.call(toneCounts, tone)) {
                toneCounts[tone] += 1;
            }
        });

        return Object.entries(toneCounts)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'notr';
    }

    getToneTagTheme(tone) {
        const themes = {
            olumlu: {
                buttonClass: 'bg-emerald-100 dark:bg-emerald-900/45 text-emerald-800 dark:text-emerald-100 hover:bg-emerald-200 dark:hover:bg-emerald-800/60',
                selectedButtonClass: 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/70',
                pillClass: 'bg-emerald-100 dark:bg-emerald-900/45 text-emerald-800 dark:text-emerald-100',
            },
            notr: {
                buttonClass: 'bg-slate-100 dark:bg-slate-800/65 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700/80',
                selectedButtonClass: 'bg-slate-600 text-white shadow-sm ring-1 ring-slate-400/70',
                pillClass: 'bg-slate-100 dark:bg-slate-800/65 text-slate-700 dark:text-slate-200',
            },
            olumsuz: {
                buttonClass: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-800/60',
                selectedButtonClass: 'bg-red-600 text-white shadow-sm ring-1 ring-red-400/70',
                pillClass: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-100',
            },
        };

        return themes[tone] || themes.notr;
    }

    setCurrentStudent(student) {
        this.currentStudent = student;
    }

    setSelectedGrade(grade) {
        this.selectedGrade = grade;
    }

    getGradeTermFromSuggestion(suggestion) {
        if (suggestion.grade && suggestion.term) {
            return { grade: suggestion.grade, term: suggestion.term };
        }

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

    getGradeTermFromTemplate(template) {
        if (template.grade && template.term) {
            return { grade: template.grade, term: template.term };
        }

        // Şablonun hangi sınıf ve dönemden geldiğini bul
        const templateContent = template.icerik || template.content;
        const templateTone = template.ton || template.tone;
        const templateTags = template.etiketler || template.tags || [];

        for (const [key, templateData] of Object.entries(this.templates)) {
            if (templateData && templateData.yorumlar) {
                const found = templateData.yorumlar.find(t => 
                    (t.icerik || t.content) === templateContent && 
(t.ton || t.tone) === templateTone &&
                    JSON.stringify(t.etiketler || t.tags || []) === JSON.stringify(templateTags)
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
        const suggestion = this.templateById.get(id);

        if (suggestion) {
            let content = suggestion.content || suggestion.icerik;

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
        const suggestion = this.templateById.get(id);

        if (!suggestion) {
            window.ui.showToast('Öneri bulunamadı!', 'error');
            return;
        }
        
        // Check if we're in comment edit mode BEFORE closing any modals
        const editModal = document.getElementById('commentEditModal');
        const editTextarea = document.querySelector('#commentEditForm textarea[name="content"]');
        const isEditMode = editModal && editModal.style.display === 'flex' && editTextarea;

        if (isEditMode) {
            // Edit mode - populate edit textarea
            let content = suggestion.content || suggestion.icerik;

            // [Öğrenci Adı] yer tutucusunu otomatik olarak değiştir
            if (this.currentStudent) {
                const firstName = this.currentStudent.name.split(' ')[0];
                content = content.replace(/\[Öğrenci Adı\]/g, firstName);
            }

            editTextarea.value = content;
            if (window.comments && window.comments.updateCharacterCount) {
                window.comments.updateCharacterCount(content.length);
            }

            const toneSelect = document.querySelector('#commentEditForm select[name="tone"]');
            if (toneSelect) {
                toneSelect.value = suggestion.tone || suggestion.ton;
            }

            if ((suggestion.tags || suggestion.etiketler) && (suggestion.tags || suggestion.etiketler).length > 0) {
                if (window.comments && window.comments.renderCurrentTags) {
                    window.comments.renderCurrentTags(suggestion.tags || suggestion.etiketler);
                }
            }

            // AI modal'ını düzgün şekilde kapat - sadece AI modalını
            window.ui.hideModalOnly('aiSuggestionsModal');
            
            // Focus ver
            setTimeout(() => {
                editTextarea.focus();
                // Textarea'nın sonuna git
                editTextarea.setSelectionRange(editTextarea.value.length, editTextarea.value.length);
            }, 100);

            window.ui.showToast('Öneri aktarıldı!', 'success');
            return;
        }

        // Regular comment mode için AI modal'ını normal şekilde kapat
        window.ui.hideModal('aiSuggestionsModal');

        // Regular comment mode
        const textarea = document.getElementById('commentText');
        if (textarea) {
            let content = suggestion.content || suggestion.icerik;

            // [Öğrenci Adı] yer tutucusunu otomatik olarak değiştir
            if (this.currentStudent) {
                const firstName = this.currentStudent.name.split(' ')[0];
                content = content.replace(/\[Öğrenci Adı\]/g, firstName);
            }

            textarea.value = content;
            textarea.focus();

            if (window.comments && window.comments.updateCharacterCount) {
                window.comments.updateCharacterCount(content.length);
            }

            if (suggestion.tags || suggestion.etiketler) {
                const tags = suggestion.tags || suggestion.etiketler;
                if (window.comments && window.comments.addTag) {
                    tags.forEach(tag => window.comments.addTag(tag));
                }
            }

            window.ui.showToast('Öneri aktarıldı!', 'success');
        }
    }

    copyTemplate(id) {
        const template = this.templateById.get(id);

        if (template) {
            let content = template.content || template.icerik;

            // Seçili öğrenci varsa ismi uygula
            if (this.currentStudent) {
                const firstName = this.currentStudent.name.split(' ')[0];
                content = content.replace(/\[Öğrenci Adı\]/g, firstName);
            }

            navigator.clipboard.writeText(content).then(() => {
                window.ui.showToast('Şablon kopyalandı!', 'success');
            }).catch(() => {
                window.ui.showToast('Kopyalama işlemi başarısız!', 'error');
            });
        } else {
            window.ui.showToast('Şablon bulunamadı!', 'error');
        }
    }

    useTemplate(id) {
        const template = this.templateById.get(id);

        if (!template) {
            window.ui.showToast('Şablon bulunamadı!', 'error');
            return;
        }

        // Template verilerini normalize et
        const templateContent = template.icerik || template.content || '';
        const templateTone = template.ton || template.tone || 'olumlu';
        const templateTags = template.etiketler || template.tags || [];

        // Check if we're in comment edit mode
        const editModal = document.getElementById('commentEditModal');
        const editTextarea = document.querySelector('#commentEditForm textarea[name="content"]');
        const isEditMode = editModal && editModal.style.display !== 'none' && editTextarea;

        if (isEditMode) {
            // Edit mode - populate edit textarea
            let content = templateContent;

            // [Öğrenci Adı] yer tutucusunu otomatik olarak değiştir
            if (this.currentStudent) {
                const firstName = this.currentStudent.name.split(' ')[0];
                content = content.replace(/\[Öğrenci Adı\]/g, firstName);
            }

            editTextarea.value = content;
            if (window.comments && window.comments.updateCharacterCount) {
                window.comments.updateCharacterCount(content.length);
            }

            const toneSelect = document.querySelector('#commentEditForm select[name="tone"]');
            if (toneSelect) {
                toneSelect.value = templateTone;
            }

            if (templateTags && templateTags.length > 0) {
                if (window.comments && window.comments.renderCurrentTags) {
                    window.comments.renderCurrentTags(templateTags);
                }
            }

            // Edit modal focus ver - edit modalı zaten açık olduğu için sadece focus ver
            setTimeout(() => {
                editTextarea.focus();
            }, 100);

            window.ui.showToast('Şablon aktarıldı!', 'success');
            return;
        }

        // Regular comment mode
        const textarea = document.getElementById('commentText');
        if (textarea) {
            let content = templateContent;

            // [Öğrenci Adı] yer tutucusunu otomatik olarak değiştir
            if (this.currentStudent) {
                const firstName = this.currentStudent.name.split(' ')[0];
                content = content.replace(/\[Öğrenci Adı\]/g, firstName);
            }

            textarea.value = content;
            textarea.focus();

            if (window.comments && window.comments.updateCharacterCount) {
                window.comments.updateCharacterCount(content.length);
            }

            if (templateTags && templateTags.length > 0) {
                if (window.comments && window.comments.addTag) {
                    templateTags.forEach(tag => window.comments.addTag(tag));
                }
            }

            window.ui.showToast('Şablon aktarıldı!', 'success');
        }
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
        return this.filterTemplatesByTone(allTemplates, tone, { enableNeutralFallback: false });
    }

    getToneBackgroundColor(tone) {
        const colors = {
            'olumlu': 'bg-green-50 dark:bg-green-900/20',
            'notr': 'bg-slate-100 dark:bg-slate-800/55',
            'olumsuz': 'bg-red-50 dark:bg-red-900/20'
        };
        return colors[tone] || 'bg-white dark:bg-gray-800';
    }

    getToneHoverColor(tone) {
        const colors = {
            'olumlu': 'hover:bg-green-100 dark:hover:bg-green-900/30',
            'notr': 'hover:bg-slate-200 dark:hover:bg-slate-700/60',
            'olumsuz': 'hover:bg-red-100 dark:hover:bg-red-900/30'
        };
        return colors[tone] || 'hover:bg-gray-100 dark:hover:bg-gray-600';
    }

    resetAITags() {
        this.selectedTags = [];
        this.aiModalToneFilter = 'all';
        this.resetSuggestionVisibleCount();
        this.renderCurrentTags();
        this.renderTagFilters();
        this.renderSuggestions();
    }

    updateSuggestionsCount(count) {
        const counter = document.getElementById('suggestionsCounter');
        if (counter) {
            counter.textContent = String(count);
        }
    }

    renderAISuggestions() {
        const container = document.getElementById('aiSuggestionsContent');
        if (!container) return;

        const suggestions = this.getFilteredSuggestions();

        // Render tone filters
        const toneFiltersHtml = `
            <div class="flex flex-wrap gap-2 mb-4">
                <button class="ai-tone-filter ${this.aiModalToneFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} px-3 py-1 rounded text-sm" data-tone="all">Tümü</button>
                <button class="ai-tone-filter ${this.aiModalToneFilter === 'olumlu' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'} px-3 py-1 rounded text-sm" data-tone="olumlu">Olumlu</button>
                <button class="ai-tone-filter ${this.aiModalToneFilter === 'notr' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'} px-3 py-1 rounded text-sm" data-tone="notr">Nötr</button>
                <button class="ai-tone-filter ${this.aiModalToneFilter === 'olumsuz' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'} px-3 py-1 rounded text-sm" data-tone="olumsuz">Olumsuz</button>
            </div>
        `;

        // Seçilen öğrenci/dönemin etiketlerini al
        const availableTags = this.getTagsForCurrentSelection();

        // Seçili etiketleri göster
        const selectedTagsHtml = this.selectedTags.length > 0 ? `
            <div class="mb-3">
                <h4 class="text-sm font-medium mb-1">Seçili Etiketler:</h4>
                <div class="flex flex-wrap gap-1">
                    ${this.selectedTags.map(tag => `
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            ${tag}
                            <button class="ml-1 text-blue-600 hover:text-blue-800" onclick="window.templates.toggleTagFilter('${tag}')">
                                <i class="fas fa-times text-xs"></i>
                            </button>
                        </span>
                    `).join('')}
                </div>
            </div>
        ` : '';

        // Render tag filters
        const tagFiltersHtml = `
            <div class="mb-4">
                <h4 class="text-sm font-medium mb-2">Mevcut Etiketler:</h4>
                <div class="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                    ${availableTags.map(tag => `
                        <button class="tag-filter ${this.selectedTags.includes(tag) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} px-2 py-1 rounded-full text-xs hover:bg-blue-400" 
                                data-tag="${tag}">
                            ${tag}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        container.innerHTML = `
            ${toneFiltersHtml}
            ${selectedTagsHtml}
            ${tagFiltersHtml}
            <div class="grid gap-3">
                ${suggestions.map(suggestion => this.renderSuggestionCard(suggestion)).join('')}
            </div>
        `;

        // Bind tag filter events
        container.querySelectorAll('.tag-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tag = e.target.dataset.tag;
                this.toggleTagFilter(tag);
                this.renderSuggestions(); // Re-render suggestions
            });
        });
    }
}

// Global template manager instance will be created in app.js