import { z } from "zod";

export const studentSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "İsim gereklidir"),
  class: z.enum(["5", "6", "7", "8"]),
  section: z.enum(["A", "B", "C", "D"]),
  createdAt: z.date().default(() => new Date()),
});

export const commentSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  class: z.enum(["5", "6", "7", "8"]),
  section: z.enum(["A", "B", "C", "D"]),
  semester: z.enum(["1", "2"]),
  text: z.string().min(1, "Yorum metni gereklidir").max(500, "Yorum 500 karakteri geçemez"),
  tone: z.enum(["positive", "neutral", "negative"]),
  tags: z.array(z.string()).default([]),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const templateSchema = z.object({
  id: z.string(),
  text: z.string(),
  tone: z.enum(["positive", "neutral", "negative"]),
  tags: z.array(z.string()),
  category: z.string(),
});

export type Student = z.infer<typeof studentSchema>;
export type Comment = z.infer<typeof commentSchema>;
export type Template = z.infer<typeof templateSchema>;

export type InsertStudent = z.infer<typeof studentSchema>;
export type InsertComment = z.infer<typeof commentSchema>;
export type InsertTemplate = z.infer<typeof templateSchema>;

// User schema for authentication (if needed)
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  password: z.string(),
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = Omit<User, "id">;
