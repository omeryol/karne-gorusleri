import express from "express";
import { z } from "zod";
import { insertStudentSchema, insertStudentCommentSchema } from "@shared/schema";
import type { IStorage } from "./storage";

export function createRoutes(storage: IStorage) {
  const router = express.Router();

  // Students routes
  router.get("/api/students", async (req, res) => {
    try {
      const students = await storage.getStudents();
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch students" });
    }
  });

  router.get("/api/students/:id", async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.id);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch student" });
    }
  });

  router.post("/api/students", async (req, res) => {
    try {
      const validatedData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(validatedData);
      res.status(201).json(student);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create student" });
    }
  });

  router.put("/api/students/:id", async (req, res) => {
    try {
      const validatedData = insertStudentSchema.partial().parse(req.body);
      const student = await storage.updateStudent(req.params.id, validatedData);
      res.json(student);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update student" });
    }
  });

  router.delete("/api/students/:id", async (req, res) => {
    try {
      await storage.deleteStudent(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete student" });
    }
  });

  router.delete("/api/students", async (req, res) => {
    try {
      await storage.deleteAllStudents();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete all students" });
    }
  });

  // Comment templates routes
  router.get("/api/comment-templates", async (req, res) => {
    try {
      const { grade, semester } = req.query;
      let templates;
      
      if (grade && semester) {
        templates = await storage.getCommentTemplatesByGradeAndSemester(
          parseInt(grade as string), 
          parseInt(semester as string)
        );
      } else {
        templates = await storage.getCommentTemplates();
      }
      
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comment templates" });
    }
  });

  router.get("/api/comment-templates/:id", async (req, res) => {
    try {
      const template = await storage.getCommentTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: "Comment template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comment template" });
    }
  });

  // Student comments routes
  router.get("/api/student-comments", async (req, res) => {
    try {
      const { studentId } = req.query;
      let comments;
      
      if (studentId) {
        comments = await storage.getStudentCommentsByStudentId(studentId as string);
      } else {
        comments = await storage.getStudentComments();
      }
      
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch student comments" });
    }
  });

  router.post("/api/student-comments", async (req, res) => {
    try {
      const validatedData = insertStudentCommentSchema.parse(req.body);
      const comment = await storage.createStudentComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create student comment" });
    }
  });

  router.delete("/api/student-comments/:id", async (req, res) => {
    try {
      await storage.deleteStudentComment(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete student comment" });
    }
  });

  // Bulk upload students
  router.post("/api/students/bulk", async (req, res) => {
    try {
      const { students } = req.body;
      if (!Array.isArray(students)) {
        return res.status(400).json({ error: "Students must be an array" });
      }

      const createdStudents = [];
      for (const studentData of students) {
        const validatedData = insertStudentSchema.parse(studentData);
        const student = await storage.createStudent(validatedData);
        createdStudents.push(student);
      }

      res.status(201).json(createdStudents);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create students" });
    }
  });

  // Statistics endpoint
  router.get("/api/statistics", async (req, res) => {
    try {
      const students = await storage.getStudents();
      const studentComments = await storage.getStudentComments();
      
      const totalStudents = students.length;
      const studentsWithComments = new Set(studentComments.map(c => c.studentId)).size;
      const studentsWithoutComments = totalStudents - studentsWithComments;
      
      const gradeStats = students.reduce((acc, student) => {
        const grade = student.grade;
        if (!acc[grade]) {
          acc[grade] = { total: 0, withComments: 0 };
        }
        acc[grade].total++;
        
        const hasComment = studentComments.some(c => c.studentId === student.id);
        if (hasComment) {
          acc[grade].withComments++;
        }
        
        return acc;
      }, {} as Record<number, { total: number; withComments: number }>);

      res.json({
        totalStudents,
        studentsWithComments,
        studentsWithoutComments,
        completionRate: totalStudents > 0 ? Math.round((studentsWithComments / totalStudents) * 100) : 0,
        gradeStats
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  return router;
}