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
  studentNumber: string
  grade: number
  section: string
}> {
  const lines = text.split('\n').filter(line => line.trim())
  const students: Array<{
    name: string
    surname: string
    studentNumber: string
    grade: number
    section: string
  }> = []

  for (const line of lines) {
    // Parse different formats: "Ad Soyad 123 5A" or "Ad,Soyad,123,5,A"
    const parts = line.includes(',') 
      ? line.split(',').map(p => p.trim())
      : line.trim().split(/\s+/)

    if (parts.length >= 4) {
      const name = parts[0]
      const surname = parts[1]
      const studentNumber = parts[2]
      const gradeStr = parts[3]
      const section = parts[4] || 'A'

      // Extract grade number
      const gradeMatch = gradeStr.match(/(\d+)/)
      if (gradeMatch) {
        const grade = parseInt(gradeMatch[1])
        if (grade >= 5 && grade <= 8) {
          students.push({
            name,
            surname,
            studentNumber,
            grade,
            section: section.replace(/\d+/, '').toUpperCase() || 'A'
          })
        }
      }
    }
  }

  return students
}