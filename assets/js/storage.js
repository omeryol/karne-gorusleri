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

// Global storage instance will be created in app.js
