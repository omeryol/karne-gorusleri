// omeryol/karne-gorusleri/karne-gorusleri-7be580864cf894b02555a07c341fcf6344ae8978/shared/schema.ts
import { z } from "zod";

// Student schema
export const studentSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Öğrenci adı gerekli"),
  surname: z.string().min(1, "Öğrenci soyadı gerekli"),
  studentNumber: z.string().optional(), // Öğrenci numarası opsiyonel yapıldı
  grade: z.number().min(5).max(8),
  section: z.enum(["A", "B", "C", "D", "E"]), // Şube A-E arası kısıtlandı
});

export const insertStudentSchema = studentSchema.omit({ id: true });
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = z.infer<typeof studentSchema>;

// Comment template schema
export const commentTemplateSchema = z.object({
  id: z.string(),
  text: z.string().min(400).max(500), // 450-500 karakter arası
  grade: z.number().min(5).max(8),
  semester: z.number().min(1).max(2),
  category: z.string(), // akademik, sosyal, davranış vb.
  number: z.number(), // numara
});

export const insertCommentTemplateSchema = commentTemplateSchema.omit({ id: true });
export type InsertCommentTemplate = z.infer<typeof insertCommentTemplateSchema>;
export type CommentTemplate = z.infer<typeof commentTemplateSchema>;

// Student comment (assigned comment) schema
export const studentCommentSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  commentText: z.string().max(500),
  originalTemplateId: z.string().optional(),
  createdAt: z.date(),
});

export const insertStudentCommentSchema = studentCommentSchema.omit({ id: true, createdAt: true });
export type InsertStudentComment = z.infer<typeof insertStudentCommentSchema>;
export type StudentComment = z.infer<typeof studentCommentSchema>;