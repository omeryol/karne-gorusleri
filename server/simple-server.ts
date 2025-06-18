import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { MemStorage } from "./storage";
import path from "path";

const app = express();
const PORT = parseInt(process.env.PORT || "5000");

// Security and performance middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize storage
const storage = new MemStorage();

// API routes - manually defined to avoid router issues
app.get("/api/students", async (req, res) => {
  try {
    const students = await storage.getStudents();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

app.post("/api/students", async (req, res) => {
  try {
    const student = await storage.createStudent(req.body);
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ error: "Failed to create student" });
  }
});

app.post("/api/students/bulk", async (req, res) => {
  try {
    const { students } = req.body;
    if (!Array.isArray(students)) {
      return res.status(400).json({ error: "Students must be an array" });
    }

    const createdStudents = [];
    for (const studentData of students) {
      const student = await storage.createStudent(studentData);
      createdStudents.push(student);
    }

    res.status(201).json(createdStudents);
  } catch (error) {
    res.status(500).json({ error: "Failed to create students" });
  }
});

app.get("/api/comment-templates", async (req, res) => {
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

app.get("/api/student-comments", async (req, res) => {
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

app.post("/api/student-comments", async (req, res) => {
  try {
    const comment = await storage.createStudentComment(req.body);
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: "Failed to create student comment" });
  }
});

app.get("/api/statistics", async (req, res) => {
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

// Serve static files from client directory
app.use(express.static('client'));

// Fallback for client-side routing
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.resolve(__dirname, '../client/index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});