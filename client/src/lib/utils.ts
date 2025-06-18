// omeryol/karne-gorusleri/karne-gorusleri-7be580864cf894b02555a07c341fcf6344ae8978/client/src/lib/utils.ts
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
    // Parse different formats: "Ad Soyad 123 5A" or "Ad,Soyad,123,5,A"
    const parts = line.includes(',') 
      ? line.split(',').map(p => p.trim())
      : line.trim().split(/\s+/)

    // Adjusted logic for optional studentNumber and strict section parsing
    let name: string, surname: string, studentNumber: string | undefined, gradeStr: string, section: string;

    if (parts.length >= 4) { // Minimum required fields: name, surname, grade, section (studentNumber can be missing)
      name = parts[0];
      surname = parts[1];
      
      // Determine if studentNumber is present
      const potentialStudentNumber = parts[2];
      const potentialGradeStr = parts[3];

      if (potentialGradeStr.match(/(\d+)/)) { // Assuming if the 4th part is a grade, then 3rd part is studentNumber
        studentNumber = potentialStudentNumber;
        gradeStr = potentialGradeStr;
        section = parts[4] || ''; // section can be empty if not provided, will default to 'A' later
      } else { // If 4th part is not a grade, then 3rd part is grade, and studentNumber is missing
        studentNumber = undefined; // Student number is optional
        gradeStr = potentialStudentNumber;
        section = parts[3] || ''; // section is 4th part if studentNumber is missing
      }

      // Extract grade number
      const gradeMatch = gradeStr.match(/(\d+)/)
      if (gradeMatch) {
        const grade = parseInt(gradeMatch[1])
        const finalSection = (section.replace(/\d+/, '').toUpperCase() || 'A'); // Extract only alpha part for section and default to 'A'
        
        // Validate section against allowed values
        if (grade >= 5 && grade <= 8 && validSections.includes(finalSection)) {
          students.push({
            name,
            surname,
            studentNumber: studentNumber, // studentNumber could be undefined
            grade,
            section: finalSection
          });
        }
      }
    }
  }

  return students
}