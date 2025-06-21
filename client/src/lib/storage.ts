import { Student, Comment, Template } from "@shared/schema";

class LocalStorage {
  private getKey(type: string, classNum?: string, semester?: string) {
    if (classNum && semester) {
      return `karne_${type}_${classNum}_${semester}`;
    }
    return `karne_${type}`;
  }

  // Students
  getStudents(classNum: string, section: string): Student[] {
    try {
      const data = localStorage.getItem(this.getKey("students", classNum));
      const students = data ? JSON.parse(data) : [];
      return students.filter((s: Student) => s.section === section);
    } catch {
      return [];
    }
  }

  saveStudent(student: Student): void {
    try {
      const key = this.getKey("students", student.class);
      const existing = localStorage.getItem(key);
      const students = existing ? JSON.parse(existing) : [];
      
      const index = students.findIndex((s: Student) => s.id === student.id);
      if (index >= 0) {
        students[index] = student;
      } else {
        students.push(student);
      }
      
      localStorage.setItem(key, JSON.stringify(students));
    } catch (error) {
      console.error("Error saving student:", error);
    }
  }

  deleteStudent(studentId: string, classNum: string): void {
    try {
      const key = this.getKey("students", classNum);
      const existing = localStorage.getItem(key);
      const students = existing ? JSON.parse(existing) : [];
      
      const filtered = students.filter((s: Student) => s.id !== studentId);
      localStorage.setItem(key, JSON.stringify(filtered));
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  }

  // Comments
  getComments(classNum: string, section: string, semester: string): Comment[] {
    try {
      const data = localStorage.getItem(this.getKey("comments", classNum, semester));
      const comments = data ? JSON.parse(data) : [];
      return comments.filter((c: Comment) => c.section === section);
    } catch {
      return [];
    }
  }

  saveComment(comment: Comment): void {
    try {
      const key = this.getKey("comments", comment.class, comment.semester);
      const existing = localStorage.getItem(key);
      const comments = existing ? JSON.parse(existing) : [];
      
      const index = comments.findIndex((c: Comment) => c.id === comment.id);
      if (index >= 0) {
        comments[index] = { ...comment, updatedAt: new Date() };
      } else {
        comments.push(comment);
      }
      
      localStorage.setItem(key, JSON.stringify(comments));
    } catch (error) {
      console.error("Error saving comment:", error);
    }
  }

  deleteComment(commentId: string, classNum: string, semester: string): void {
    try {
      const key = this.getKey("comments", classNum, semester);
      const existing = localStorage.getItem(key);
      const comments = existing ? JSON.parse(existing) : [];
      
      const filtered = comments.filter((c: Comment) => c.id !== commentId);
      localStorage.setItem(key, JSON.stringify(filtered));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  }

  // Templates
  getTemplates(): Template[] {
    try {
      const data = localStorage.getItem(this.getKey("templates"));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveTemplate(template: Template): void {
    try {
      const existing = localStorage.getItem(this.getKey("templates"));
      const templates = existing ? JSON.parse(existing) : [];
      
      const index = templates.findIndex((t: Template) => t.id === template.id);
      if (index >= 0) {
        templates[index] = template;
      } else {
        templates.push(template);
      }
      
      localStorage.setItem(this.getKey("templates"), JSON.stringify(templates));
    } catch (error) {
      console.error("Error saving template:", error);
    }
  }
}

export const storage = new LocalStorage();
