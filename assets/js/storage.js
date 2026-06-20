// Türkçe ünlü uyumu ve çekim ekleri hesaplayıcı yardımcı fonksiyonları
window.getTurkishSuffix = function(name, caseType) {
    if (!name) return '';
    const firstName = name.split(' ')[0];
    if (!firstName) return '';

    const vowels = 'aıoueiöüAIOUEİÖÜ';
    let lastVowel = '';
    for (let i = firstName.length - 1; i >= 0; i--) {
        if (vowels.includes(firstName[i])) {
            lastVowel = firstName[i].toLowerCase();
            break;
        }
    }
    if (!lastVowel) lastVowel = 'a';

    const isBack = 'aıou'.includes(lastVowel);
    let vowel4 = 'i';
    if ('aı'.includes(lastVowel)) vowel4 = 'ı';
    else if ('ei'.includes(lastVowel)) vowel4 = 'i';
    else if ('ou'.includes(lastVowel)) vowel4 = 'u';
    else if ('öü'.includes(lastVowel)) vowel4 = 'ü';

    const vowel2 = isBack ? 'a' : 'e';
    const lastLetter = firstName[firstName.length - 1].toLowerCase();
    const isVowel = vowels.toLowerCase().includes(lastLetter);
    const isVoiceless = 'fstkçşhp'.includes(lastLetter);

    switch (caseType) {
        case 'GENITIVE': // -nın, -nin, -nun, -nün / -ın, -in, -un, -ün
            return isVowel ? `'n${vowel4}n` : `'${vowel4}n`;
        case 'DATIVE': // -ya, -ye / -a, -e
            return isVowel ? `'y${vowel2}` : `'${vowel2}`;
        case 'ACCUSATIVE': // -yı, -yi, -yu, -yü / -ı, -i, -u, -ü
            return isVowel ? `'y${vowel4}` : `'${vowel4}`;
        case 'LOCATIVE': // -da, -de / -ta, -te
            return isVoiceless ? `'t${vowel2}` : `'d${vowel2}`;
        case 'ABLATIVE': // -dan, -den / -tan, -ten
            return isVoiceless ? `'t${vowel2}n` : `'d${vowel2}n`;
        case 'INSTRUMENTAL': // -yla, -yle / -la, -le
            return isVowel ? `'yl${vowel2}` : `'l${vowel2}`;
        default:
            return '';
    }
};

window.replaceStudentName = function(text, studentName) {
    if (!text) return '';
    if (!studentName) {
        return text;
    }
    const firstName = studentName.split(' ')[0];
    
    // Çekim eki alan yer tutucuları yakalamak için düzenli ifade
    // [Öğrenci Adı]'nın, [Öğrenci Adı]'a, [Öğrenci Adı]'e vb.
    const suffixRegex = /\[Öğrenci\s+Adı\]'([nN][ıIiıuUüÜ][nN]|[ıIiıuUüÜ][nN]|[eEaA]|[yY][eEaA]|[ıIiıuUüÜ]|[yY][ıIiıuUüÜ]|[dD][eEaA]|[tT][eEaA]|[dD][eEaA][nN]|[tT][eEaA][nN]|[lL][eEaA]|[yY][lL][eEaA])/gi;
    
    let resolvedText = text.replace(suffixRegex, (match, suffix) => {
        const lowerSuffix = suffix.toLowerCase();
        let caseType = '';
        if (lowerSuffix.startsWith('n') && lowerSuffix.endsWith('n') && lowerSuffix.length === 3) caseType = 'GENITIVE';
        else if (lowerSuffix.endsWith('n') && lowerSuffix.length === 2) caseType = 'GENITIVE';
        else if (lowerSuffix.startsWith('y') && (lowerSuffix.endsWith('a') || lowerSuffix.endsWith('e')) && lowerSuffix.length === 2) caseType = 'DATIVE';
        else if (lowerSuffix === 'a' || lowerSuffix === 'e') caseType = 'DATIVE';
        else if (lowerSuffix.startsWith('y') && lowerSuffix.length === 2) caseType = 'ACCUSATIVE';
        else if (lowerSuffix === 'ı' || lowerSuffix === 'i' || lowerSuffix === 'u' || lowerSuffix === 'ü') caseType = 'ACCUSATIVE';
        else if ((lowerSuffix.startsWith('d') || lowerSuffix.startsWith('t')) && (lowerSuffix.endsWith('a') || lowerSuffix.endsWith('e')) && lowerSuffix.length === 2) caseType = 'LOCATIVE';
        else if ((lowerSuffix.startsWith('d') || lowerSuffix.startsWith('t')) && (lowerSuffix.endsWith('an') || lowerSuffix.endsWith('en')) && lowerSuffix.length === 3) caseType = 'ABLATIVE';
        else if (lowerSuffix.startsWith('y') && lowerSuffix.length === 3) caseType = 'INSTRUMENTAL';
        else if (lowerSuffix.startsWith('l') && lowerSuffix.length === 2) caseType = 'INSTRUMENTAL';
        
        if (caseType) {
            const suffixResult = window.getTurkishSuffix(firstName, caseType);
            return firstName + suffixResult;
        }
        return firstName + "'" + suffix;
    });

    // Çekim eki almayan standart yer tutucuları değiştir
    resolvedText = resolvedText.replace(/\[Öğrenci\s+Adı\]/gi, firstName);
    return resolvedText;
};

// LocalStorage yönetimi için ana sınıf
class Storage {
    constructor() {
        this.keys = {
            students: 'karne_students',
            comments: 'karne_comments',
            templates: 'karne_templates',
            settings: 'karne_settings'
        };
        this.init();
    }

    init() {
        // İlk kurulum kontrolü
        if (!this.get(this.keys.students)) {
            this.set(this.keys.students, []);
        }
        if (!this.get(this.keys.comments)) {
            this.set(this.keys.comments, []);
        }
        if (!this.get(this.keys.settings)) {
            this.set(this.keys.settings, {
                theme: 'dark',
                hasSeenWelcome: false
            });
        }

        // Eski verilerde kalmis markdown kalintilarini acilista temizle
        this.migrateCommentFormatting();
    }

    sanitizeCommentText(text) {
        return String(text || '')
            .replace(/\*\*/g, '')
            .replace(/\s{2,}/g, ' ')
            .trim();
    }

    migrateCommentFormatting() {
        const comments = this.getComments();
        let changed = false;

        const sanitized = comments.map((comment) => {
            if (!comment || typeof comment.content !== 'string') {
                return comment;
            }

            const normalizedContent = this.sanitizeCommentText(comment.content);
            if (normalizedContent !== comment.content) {
                changed = true;
                return { ...comment, content: normalizedContent };
            }

            return comment;
        });

        if (changed) {
            this.setComments(sanitized);
        }
    }

    // Veri okuma
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Storage get error:', error);
            return null;
        }
    }

    // Veri yazma
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    }

    // Veri silme
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    }

    // Tüm verileri temizleme
    clear() {
        try {
            Object.values(this.keys).forEach(key => {
                localStorage.removeItem(key);
            });
            this.init();
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }

    // Öğrenci işlemleri
    getStudents() {
        return this.get(this.keys.students) || [];
    }

    setStudents(students) {
        return this.set(this.keys.students, students);
    }

    addStudent(student) {
        const students = this.getStudents();
        student.id = this.generateId();
        students.push(student);
        return this.setStudents(students);
    }

    updateStudent(id, updates) {
        const students = this.getStudents();
        const index = students.findIndex(s => s.id === id);
        if (index !== -1) {
            students[index] = { ...students[index], ...updates };
            return this.setStudents(students);
        }
        return false;
    }

    deleteStudent(id) {
        const students = this.getStudents();
        const filtered = students.filter(s => s.id !== id);
        
        // Öğrenciye ait yorumları da sil
        const comments = this.getComments();
        const filteredComments = comments.filter(c => c.studentId !== id);
        this.setComments(filteredComments);
        
        return this.setStudents(filtered);
    }

    getStudentById(id) {
        const students = this.getStudents();
        return students.find(s => s.id === id);
    }

    // Yorum işlemleri
    getComments() {
        return this.get(this.keys.comments) || [];
    }

    setComments(comments) {
        return this.set(this.keys.comments, comments);
    }

    addComment(comment) {
        const comments = this.getComments();
        comment.id = this.generateId();
        comment.content = this.sanitizeCommentText(comment.content);
        comment.createdAt = new Date().toISOString();
        comments.push(comment);
        return this.setComments(comments);
    }

    updateComment(id, updates) {
        const comments = this.getComments();
        const index = comments.findIndex(c => c.id === id);
        if (index !== -1) {
            const normalizedUpdates = { ...updates };
            if (Object.prototype.hasOwnProperty.call(normalizedUpdates, 'content')) {
                normalizedUpdates.content = this.sanitizeCommentText(normalizedUpdates.content);
            }
            comments[index] = { ...comments[index], ...normalizedUpdates, updatedAt: new Date().toISOString() };
            return this.setComments(comments);
        }
        return false;
    }

    deleteComment(id) {
        const comments = this.getComments();
        const filtered = comments.filter(c => c.id !== id);
        return this.setComments(filtered);
    }

    getCommentById(id) {
        const comments = this.getComments();
        return comments.find(c => c.id === id);
    }

    getCommentsByStudentId(studentId) {
        const comments = this.getComments();
        return comments.filter(c => c.studentId === studentId);
    }

    // Ayar işlemleri
    getSettings() {
        return this.get(this.keys.settings) || {};
    }

    updateSettings(updates) {
        const settings = this.getSettings();
        const newSettings = { ...settings, ...updates };
        return this.set(this.keys.settings, newSettings);
    }

    getSetting(key) {
        const settings = this.getSettings();
        return settings[key];
    }

    setSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        return this.set(this.keys.settings, settings);
    }

    getCommentFilterPresets() {
        const settings = this.getSettings();
        return Array.isArray(settings.commentFilterPresets) ? settings.commentFilterPresets : [];
    }

    saveCommentFilterPreset(name, filters) {
        const normalizedName = String(name || '').trim();
        if (!normalizedName) {
            return false;
        }

        const presets = this.getCommentFilterPresets();
        const cleanedFilters = {
            period: filters && filters.period ? String(filters.period) : 'all',
            tone: filters && filters.tone ? String(filters.tone) : 'all'
        };

        const existingIndex = presets.findIndex((preset) => preset.name.toLowerCase() === normalizedName.toLowerCase());
        const updatedPreset = {
            id: existingIndex >= 0 ? presets[existingIndex].id : this.generateId(),
            name: normalizedName,
            filters: cleanedFilters,
            updatedAt: new Date().toISOString()
        };

        if (existingIndex >= 0) {
            presets[existingIndex] = updatedPreset;
        } else {
            presets.push(updatedPreset);
        }

        return this.setSetting('commentFilterPresets', presets);
    }

    deleteCommentFilterPreset(id) {
        const presetId = String(id || '').trim();
        if (!presetId) {
            return false;
        }

        const presets = this.getCommentFilterPresets();
        const filtered = presets.filter((preset) => preset.id !== presetId);
        return this.setSetting('commentFilterPresets', filtered);
    }

    // Yardımcı fonksiyonlar
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    // Veri analizi
    getStatistics() {
        const students = this.getStudents();
        const comments = this.getComments();
        const completedStudentIds = new Set(comments.map(c => c.studentId));
        const completedComments = completedStudentIds.size;
        const pendingComments = Math.max(0, students.length - completedComments);

        const stats = {
            totalStudents: students.length,
            totalComments: comments.length,
            completedComments,
            pendingComments,
            completionRate: students.length > 0 ? Math.round((completedComments / students.length) * 100) : 0,
            toneAnalysis: {
                olumlu: comments.filter(c => c.tone === 'olumlu').length,
                notr: comments.filter(c => c.tone === 'notr').length,
                olumsuz: comments.filter(c => c.tone === 'olumsuz').length
            },
            gradeDistribution: {},
            popularTags: {}
        };

        // Sınıf dağılımı
        students.forEach(student => {
            const grade = student.grade;
            stats.gradeDistribution[grade] = (stats.gradeDistribution[grade] || 0) + 1;
        });

        // Popüler etiketler
        comments.forEach(comment => {
            if (comment.tags && comment.tags.length > 0) {
                comment.tags.forEach(tag => {
                    stats.popularTags[tag] = (stats.popularTags[tag] || 0) + 1;
                });
            }
        });

        return stats;
    }

    // Veri dışa aktarma
    exportData() {
        return {
            students: this.getStudents(),
            comments: this.getComments(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }

    // Veri içe aktarma
    importData(data) {
        try {
            const normalized = this.normalizeImportData(data);
            this.setStudents(normalized.students);
            this.setComments(normalized.comments);
            return true;
        } catch (error) {
            console.error('Import data error:', error);
            return false;
        }
    }

    normalizeImportData(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Geçersiz dosya formatı');
        }

        const students = Array.isArray(data.students) ? data.students : [];
        const comments = Array.isArray(data.comments) ? data.comments : [];

        const normalizedStudents = students
            .filter(s => s && s.id && s.name && s.grade && s.section)
            .map(s => ({
                id: String(s.id),
                name: String(s.name).trim(),
                grade: String(s.grade),
                section: String(s.section),
            }));

        const studentIdSet = new Set(normalizedStudents.map(s => s.id));

        const normalizedComments = comments
            .filter(c => c && c.id && c.studentId && c.content && studentIdSet.has(String(c.studentId)))
            .map(c => ({
                id: String(c.id),
                studentId: String(c.studentId),
                content: this.sanitizeCommentText(c.content),
                tone: c.tone || 'olumlu',
                period: c.period || '1',
                tags: Array.isArray(c.tags) ? c.tags : [],
                createdAt: c.createdAt || new Date().toISOString(),
                updatedAt: c.updatedAt || undefined,
            }));

        return {
            students: normalizedStudents,
            comments: normalizedComments,
        };
    }
}

// Global storage instance will be created in app.js
