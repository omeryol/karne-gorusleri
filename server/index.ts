import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { createRoutes } from "./routes";
import { MemStorage } from "./storage";
// Removed vite import due to configuration restrictions

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

// API routes
app.use(createRoutes(storage));

// Serve static files from client directory
app.use(express.static('client'));

// Fallback for client-side routing
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    const path = require('path');
    res.sendFile(path.resolve(__dirname, '../client/index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});