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
                theme: 'light',
                hasSeenWelcome: false
            });
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
        comment.createdAt = new Date().toISOString();
        comments.push(comment);
        return this.setComments(comments);
    }

    updateComment(id, updates) {
        const comments = this.getComments();
        const index = comments.findIndex(c => c.id === id);
        if (index !== -1) {
            comments[index] = { ...comments[index], ...updates, updatedAt: new Date().toISOString() };
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

    // Yardımcı fonksiyonlar
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    // Veri analizi
    getStatistics() {
        const students = this.getStudents();
        const comments = this.getComments();

        const stats = {
            totalStudents: students.length,
            totalComments: comments.length,
            completedComments: comments.length,
            pendingComments: students.length - comments.length,
            completionRate: students.length > 0 ? Math.round((comments.length / students.length) * 100) : 0,
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
            if (data.students && Array.isArray(data.students)) {
                this.setStudents(data.students);
            }
            if (data.comments && Array.isArray(data.comments)) {
                this.setComments(data.comments);
            }
            return true;
        } catch (error) {
            console.error('Import data error:', error);
            return false;
        }
    }
}

// Global storage instance
window.storage = new Storage();
// Veri depolama yönetimi sınıfı
class Storage {
    constructor() {
        this.init();
    }

    init() {
        // LocalStorage'ın mevcut olup olmadığını kontrol et
        if (typeof Storage === "undefined") {
            console.error("LocalStorage desteklenmiyor!");
            return;
        }
        
        // Varsayılan ayarları oluştur
        this.initDefaults();
    }

    initDefaults() {
        if (!localStorage.getItem('karneAsistani_settings')) {
            const defaultSettings = {
                theme: 'light',
                hasSeenWelcome: false
            };
            localStorage.setItem('karneAsistani_settings', JSON.stringify(defaultSettings));
        }

        if (!localStorage.getItem('karneAsistani_students')) {
            localStorage.setItem('karneAsistani_students', JSON.stringify([]));
        }

        if (!localStorage.getItem('karneAsistani_comments')) {
            localStorage.setItem('karneAsistani_comments', JSON.stringify([]));
        }
    }

    // Öğrenci işlemleri
    getStudents() {
        try {
            return JSON.parse(localStorage.getItem('karneAsistani_students') || '[]');
        } catch (e) {
            console.error('Öğrenci verileri yüklenirken hata:', e);
            return [];
        }
    }

    addStudent(student) {
        try {
            const students = this.getStudents();
            const newStudent = {
                ...student,
                id: Date.now().toString(),
                createdAt: new Date().toISOString()
            };
            students.push(newStudent);
            localStorage.setItem('karneAsistani_students', JSON.stringify(students));
            return true;
        } catch (e) {
            console.error('Öğrenci eklenirken hata:', e);
            return false;
        }
    }

    getStudentById(id) {
        const students = this.getStudents();
        return students.find(s => s.id === id);
    }

    updateStudent(id, updates) {
        try {
            const students = this.getStudents();
            const index = students.findIndex(s => s.id === id);
            if (index !== -1) {
                students[index] = { ...students[index], ...updates };
                localStorage.setItem('karneAsistani_students', JSON.stringify(students));
                return true;
            }
            return false;
        } catch (e) {
            console.error('Öğrenci güncellenirken hata:', e);
            return false;
        }
    }

    deleteStudent(id) {
        try {
            const students = this.getStudents();
            const filtered = students.filter(s => s.id !== id);
            localStorage.setItem('karneAsistani_students', JSON.stringify(filtered));
            
            // Öğrenciye ait yorumları da sil
            const comments = this.getComments();
            const filteredComments = comments.filter(c => c.studentId !== id);
            localStorage.setItem('karneAsistani_comments', JSON.stringify(filteredComments));
            
            return true;
        } catch (e) {
            console.error('Öğrenci silinirken hata:', e);
            return false;
        }
    }

    // Yorum işlemleri
    getComments() {
        try {
            return JSON.parse(localStorage.getItem('karneAsistani_comments') || '[]');
        } catch (e) {
            console.error('Yorum verileri yüklenirken hata:', e);
            return [];
        }
    }

    addComment(comment) {
        try {
            const comments = this.getComments();
            const newComment = {
                ...comment,
                id: Date.now().toString(),
                createdAt: new Date().toISOString()
            };
            comments.push(newComment);
            localStorage.setItem('karneAsistani_comments', JSON.stringify(comments));
            return true;
        } catch (e) {
            console.error('Yorum eklenirken hata:', e);
            return false;
        }
    }

    getCommentById(id) {
        const comments = this.getComments();
        return comments.find(c => c.id === id);
    }

    getCommentsByStudentId(studentId) {
        const comments = this.getComments();
        return comments.filter(c => c.studentId === studentId);
    }

    updateComment(id, updates) {
        try {
            const comments = this.getComments();
            const index = comments.findIndex(c => c.id === id);
            if (index !== -1) {
                comments[index] = { ...comments[index], ...updates };
                localStorage.setItem('karneAsistani_comments', JSON.stringify(comments));
                return true;
            }
            return false;
        } catch (e) {
            console.error('Yorum güncellenirken hata:', e);
            return false;
        }
    }

    deleteComment(id) {
        try {
            const comments = this.getComments();
            const filtered = comments.filter(c => c.id !== id);
            localStorage.setItem('karneAsistani_comments', JSON.stringify(filtered));
            return true;
        } catch (e) {
            console.error('Yorum silinirken hata:', e);
            return false;
        }
    }

    // Ayar işlemleri
    getSetting(key) {
        try {
            const settings = JSON.parse(localStorage.getItem('karneAsistani_settings') || '{}');
            return settings[key];
        } catch (e) {
            console.error('Ayar okunurken hata:', e);
            return null;
        }
    }

    setSetting(key, value) {
        try {
            const settings = JSON.parse(localStorage.getItem('karneAsistani_settings') || '{}');
            settings[key] = value;
            localStorage.setItem('karneAsistani_settings', JSON.stringify(settings));
            return true;
        } catch (e) {
            console.error('Ayar kaydedilirken hata:', e);
            return false;
        }
    }

    // İstatistik işlemleri
    getStatistics() {
        const students = this.getStudents();
        const comments = this.getComments();
        
        const totalStudents = students.length;
        const completedComments = comments.length;
        const pendingComments = totalStudents - completedComments;
        const completionRate = totalStudents > 0 ? Math.round((completedComments / totalStudents) * 100) : 0;
        
        // Ton analizi
        const toneAnalysis = {
            olumlu: comments.filter(c => c.tone === 'olumlu').length,
            notr: comments.filter(c => c.tone === 'notr').length,
            olumsuz: comments.filter(c => c.tone === 'olumsuz').length
        };
        
        // Popüler etiketler
        const allTags = [];
        comments.forEach(comment => {
            if (comment.tags && comment.tags.length > 0) {
                allTags.push(...comment.tags);
            }
        });
        
        const tagCounts = {};
        allTags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
        
        return {
            totalStudents,
            completedComments,
            pendingComments,
            completionRate,
            toneAnalysis,
            popularTags: tagCounts
        };
    }
}

// Global storage instance
window.storage = new Storage();
