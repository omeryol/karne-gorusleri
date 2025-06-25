
// Yerel depolama yönetimi
class LocalStorage {
    constructor() {
        this.prefix = 'karneAsistani_';
        this.init();
    }

    init() {
        try {
            // Test localStorage availability
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
        } catch (e) {
            console.warn('LocalStorage kullanılamıyor, geçici depolama kullanılacak');
            this.fallbackStorage = new Map();
        }
    }

    getKey(key) {
        return this.prefix + key;
    }

    set(key, value) {
        try {
            if (this.fallbackStorage) {
                this.fallbackStorage.set(this.getKey(key), JSON.stringify(value));
            } else {
                localStorage.setItem(this.getKey(key), JSON.stringify(value));
            }
            return true;
        } catch (e) {
            console.error('Veri kaydedilemedi:', e);
            return false;
        }
    }

    get(key, defaultValue = null) {
        try {
            let data;
            if (this.fallbackStorage) {
                data = this.fallbackStorage.get(this.getKey(key));
            } else {
                data = localStorage.getItem(this.getKey(key));
            }
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Veri okunamadı:', e);
            return defaultValue;
        }
    }

    remove(key) {
        try {
            if (this.fallbackStorage) {
                this.fallbackStorage.delete(this.getKey(key));
            } else {
                localStorage.removeItem(this.getKey(key));
            }
            return true;
        } catch (e) {
            console.error('Veri silinemedi:', e);
            return false;
        }
    }

    clear() {
        try {
            if (this.fallbackStorage) {
                this.fallbackStorage.clear();
            } else {
                const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
                keys.forEach(key => localStorage.removeItem(key));
            }
            return true;
        } catch (e) {
            console.error('Veriler temizlenemedi:', e);
            return false;
        }
    }

    // Students operations
    getStudents() {
        return this.get('students', []);
    }

    saveStudents(students) {
        return this.set('students', students);
    }

    addStudent(student) {
        const students = this.getStudents();
        student.id = Date.now().toString();
        student.createdAt = new Date().toISOString();
        students.push(student);
        return this.saveStudents(students) ? student : null;
    }

    updateStudent(id, updates) {
        const students = this.getStudents();
        const index = students.findIndex(s => s.id === id);
        if (index !== -1) {
            students[index] = { ...students[index], ...updates, updatedAt: new Date().toISOString() };
            return this.saveStudents(students) ? students[index] : null;
        }
        return null;
    }

    deleteStudent(id) {
        const students = this.getStudents();
        const filtered = students.filter(s => s.id !== id);
        return this.saveStudents(filtered);
    }

    // Comments operations
    getComments() {
        return this.get('comments', []);
    }

    saveComments(comments) {
        return this.set('comments', comments);
    }

    addComment(comment) {
        const comments = this.getComments();
        comment.id = Date.now().toString();
        comment.createdAt = new Date().toISOString();
        comments.push(comment);
        return this.saveComments(comments) ? comment : null;
    }

    updateComment(id, updates) {
        const comments = this.getComments();
        const index = comments.findIndex(c => c.id === id);
        if (index !== -1) {
            comments[index] = { ...comments[index], ...updates, updatedAt: new Date().toISOString() };
            return this.saveComments(comments) ? comments[index] : null;
        }
        return null;
    }

    deleteComment(id) {
        const comments = this.getComments();
        const filtered = comments.filter(c => c.id !== id);
        return this.saveComments(filtered);
    }

    getCommentsByStudent(studentId) {
        const comments = this.getComments();
        return comments.filter(c => c.studentId === studentId);
    }

    // Settings operations
    getSettings() {
        return this.get('settings', {
            theme: 'light',
            welcomeShown: false,
            lastBackup: null
        });
    }

    saveSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        return this.set('settings', settings);
    }

    // Statistics
    getStats() {
        const students = this.getStudents();
        const comments = this.getComments();
        
        const totalStudents = students.length;
        const totalComments = comments.length;
        const completedComments = comments.filter(c => c.content && c.content.trim().length > 0).length;
        const pendingComments = totalStudents - completedComments;
        const completionRate = totalStudents > 0 ? Math.round((completedComments / totalStudents) * 100) : 0;

        // Ton analizi
        const toneAnalysis = {
            olumlu: comments.filter(c => c.tone === 'olumlu').length,
            notr: comments.filter(c => c.tone === 'notr').length,
            olumsuz: comments.filter(c => c.tone === 'olumsuz').length
        };

        // Popüler etiketler
        const allTags = comments.flatMap(c => c.tags || []);
        const tagCounts = {};
        allTags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
        const popularTags = Object.entries(tagCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        return {
            totalStudents,
            totalComments,
            completedComments,
            pendingComments,
            completionRate,
            toneAnalysis,
            popularTags
        };
    }

    // Export/Import
    exportData() {
        const data = {
            students: this.getStudents(),
            comments: this.getComments(),
            settings: this.getSettings(),
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };
        return data;
    }

    importData(data) {
        try {
            if (data.students) this.saveStudents(data.students);
            if (data.comments) this.saveComments(data.comments);
            if (data.settings) this.set('settings', data.settings);
            return true;
        } catch (e) {
            console.error('Veri içe aktarılamadı:', e);
            return false;
        }
    }
}

// Global instance
window.storage = new LocalStorage();
