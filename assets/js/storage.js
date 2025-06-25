// Veri depolama yöneticisi
class StorageManager {
    constructor() {
        this.prefix = 'karneAsistani_';
        this.init();
    }

    init() {
        // İlk kurulum kontrolü
        if (!this.get('initialized')) {
            this.set('initialized', true);
            this.set('students', []);
            this.set('comments', {});
            this.set('settings', {
                theme: 'light',
                showWelcome: true
            });
        }
    }

    // Veri kaydetme
    set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Veri kaydedilemedi:', error);
            return false;
        }
    }

    // Veri okuma
    get(key) {
        try {
            const item = localStorage.getItem(this.prefix + key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Veri okunamadı:', error);
            return null;
        }
    }

    // Veri silme
    remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (error) {
            console.error('Veri silinemedi:', error);
            return false;
        }
    }

    // Tüm verileri temizleme
    clear() {
        try {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            this.init();
            return true;
        } catch (error) {
            console.error('Veriler temizlenemedi:', error);
            return false;
        }
    }

    // Öğrenci işlemleri
    getStudents() {
        return this.get('students') || [];
    }

    saveStudent(student) {
        const students = this.getStudents();
        const existingIndex = students.findIndex(s => s.id === student.id);

        if (existingIndex >= 0) {
            students[existingIndex] = student;
        } else {
            student.id = Date.now().toString();
            student.createdAt = new Date().toISOString();
            students.push(student);
        }

        return this.set('students', students);
    }

    deleteStudent(studentId) {
        const students = this.getStudents();
        const filtered = students.filter(s => s.id !== studentId);

        // Öğrenci yorumlarını da sil
        this.remove(`comments_${studentId}`);

        return this.set('students', filtered);
    }

    // Yorum işlemleri
    getComments(studentId) {
        return this.get(`comments_${studentId}`) || [];
    }

    saveComment(studentId, comment) {
        const comments = this.getComments(studentId);
        const existingIndex = comments.findIndex(c => c.id === comment.id);

        if (existingIndex >= 0) {
            comments[existingIndex] = comment;
        } else {
            comment.id = Date.now().toString();
            comment.createdAt = new Date().toISOString();
            comments.push(comment);
        }

        return this.set(`comments_${studentId}`, comments);
    }

    deleteComment(studentId, commentId) {
        const comments = this.getComments(studentId);
        const filtered = comments.filter(c => c.id !== commentId);
        return this.set(`comments_${studentId}`, filtered);
    }

    // Ayarlar
    getSettings() {
        return this.get('settings') || { theme: 'light', showWelcome: true };
    }

    saveSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        return this.set('settings', settings);
    }

    // İstatistikler
    getStats() {
        const students = this.getStudents();
        let totalComments = 0;
        let weeklyComments = 0;
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        students.forEach(student => {
            const comments = this.getComments(student.id);
            totalComments += comments.length;

            weeklyComments += comments.filter(comment => 
                new Date(comment.createdAt) > oneWeekAgo
            ).length;
        });

        return {
            totalStudents: students.length,
            totalComments,
            weeklyComments
        };
    }

    // Veri dışa aktarma
    exportData() {
        const data = {
            students: this.getStudents(),
            comments: {},
            settings: this.getSettings(),
            exportDate: new Date().toISOString()
        };

        // Tüm yorumları topla
        data.students.forEach(student => {
            data.comments[student.id] = this.getComments(student.id);
        });

        return data;
    }

    // Veri içe aktarma
    importData(data) {
        try {
            if (data.students) {
                this.set('students', data.students);
            }

            if (data.comments) {
                Object.keys(data.comments).forEach(studentId => {
                    this.set(`comments_${studentId}`, data.comments[studentId]);
                });
            }

            if (data.settings) {
                this.set('settings', data.settings);
            }

            return true;
        } catch (error) {
            console.error('Veri içe aktarılamadı:', error);
            return false;
        }
    }
}

// Global instance
window.storage = new StorageManager();