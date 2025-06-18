import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export function getGradeTheme(grade: number): string {
  switch (grade) {
    case 5: return 'grade-theme-5'
    case 6: return 'grade-theme-6'
    case 7: return 'grade-theme-7'
    case 8: return 'grade-theme-8'
    default: return 'grade-theme-5'
  }
}

export function personalizeComment(template: string, studentName: string): string {
  return template.replace(/\[Öğrenci Adı\]/g, studentName)
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}

export function parseStudentData(text: string): Array<{
  name: string
  surname: string
  studentNumber?: string // studentNumber opsiyonel hale getirildi
  grade: number
  section: string
}> {
  const lines = text.split('\n').filter(line => line.trim())
  const students: Array<{
    name: string
    surname: string
    studentNumber?: string // studentNumber opsiyonel hale getirildi
    grade: number
    section: string
  }> = []

  const validSections = ["A", "B", "C", "D", "E"]; // Geçerli şube değerleri

  for (const line of lines) {
    // Parse different formats: "Ad Soyad 123 5A" or "Ad,Soyad,123,5,A" or "Ad Soyad"
    const parts = line.includes(',') 
      ? line.split(',').map(p => p.trim())
      : line.trim().split(/\s+/)

    let name: string, surname: string, studentNumber: string | undefined, grade: number, section: string;

    if (parts.length >= 2) { // Minimum required fields: name, surname
      name = parts[0];
      surname = parts[1];
      
      // Default values if not provided
      studentNumber = undefined;
      grade = 5; // Default grade
      section = 'A'; // Default section

      if (parts.length >= 3) { // Potentially studentNumber, grade, section or just grade, section
        const thirdPart = parts[2];
        const fourthPart = parts[3]; // Could be section or grade

        if (thirdPart.match(/^\d+$/) && parts.length >= 4) { // Assumed StudentNumber, Grade, Section
          studentNumber = thirdPart;
          const gradeMatch = fourthPart.match(/(\d+)/);
          if (gradeMatch) {
            grade = parseInt(gradeMatch[1]);
          }
          section = (parts[4] || 'A').toUpperCase(); // If 5 parts, 5th is section
        } else { // Assumed Grade, Section (studentNumber skipped)
          const gradeMatch = thirdPart.match(/(\d+)/);
          if (gradeMatch) {
            grade = parseInt(gradeMatch[1]);
          }
          section = (fourthPart || 'A').toUpperCase(); // If 4 parts, 4th is section
        }
      }

      // Final validation and default assignment for grade and section
      if (grade < 5 || grade > 8) {
          grade = 5; // Default to 5th grade if invalid
      }
      if (!validSections.includes(section)) {
          section = 'A'; // Default to 'A' section if invalid
      }

      students.push({
        name,
        surname,
        studentNumber,
        grade,
        section
      });
    }
  }

  return students
}