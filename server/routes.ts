import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertNoteSchema, insertPostSchema, insertCommentSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  dest: uploadsDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOC files are allowed.'));
    }
  },
});

function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Serve uploaded files
  app.use('/uploads', express.static(uploadsDir));

  // Notes routes
  app.get('/api/notes', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const notes = await storage.getNotes(limit, offset);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.post('/api/notes', requireAuth, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "File is required" });
      }

      const noteData = insertNoteSchema.parse({
        title: req.body.title,
        description: req.body.description,
        subject: req.body.subject,
        tags: req.body.tags ? JSON.parse(req.body.tags) : [],
        filePath: req.file.path,
        fileName: req.file.originalname,
        fileSize: req.file.size,
      });

      const note = await storage.createNote({
        ...noteData,
        authorId: req.user.id,
      });

      res.status(201).json(note);
    } catch (error) {
      res.status(400).json({ message: "Failed to create note", error: error.message });
    }
  });

  app.post('/api/notes/:id/like', requireAuth, async (req, res) => {
    try {
      const noteId = parseInt(req.params.id);
      await storage.likeNote(req.user.id, noteId);
      res.json({ message: "Note liked successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to like note" });
    }
  });

  app.delete('/api/notes/:id/like', requireAuth, async (req, res) => {
    try {
      const noteId = parseInt(req.params.id);
      await storage.unlikeNote(req.user.id, noteId);
      res.json({ message: "Note unliked successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to unlike note" });
    }
  });

  // Posts routes
  app.get('/api/posts', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const posts = await storage.getPosts(limit, offset);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.post('/api/posts', requireAuth, async (req, res) => {
    try {
      const postData = insertPostSchema.parse(req.body);
      const post = await storage.createPost({
        ...postData,
        authorId: req.user.id,
      });
      res.status(201).json(post);
    } catch (error) {
      res.status(400).json({ message: "Failed to create post", error: error.message });
    }
  });

  app.post('/api/posts/:id/like', requireAuth, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      await storage.likePost(req.user.id, postId);
      res.json({ message: "Post liked successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  app.delete('/api/posts/:id/like', requireAuth, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      await storage.unlikePost(req.user.id, postId);
      res.json({ message: "Post unliked successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to unlike post" });
    }
  });

  // Comments routes
  app.get('/api/posts/:id/comments', async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getCommentsByPost(postId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post('/api/posts/:id/comments', requireAuth, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const commentData = insertCommentSchema.parse({
        ...req.body,
        postId,
      });
      
      const comment = await storage.createComment({
        ...commentData,
        authorId: req.user.id,
      });
      
      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ message: "Failed to create comment", error: error.message });
    }
  });

  // User stats routes
  app.get('/api/user/stats', requireAuth, async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.user.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  app.get('/api/user/achievements', requireAuth, async (req, res) => {
    try {
      const achievements = await storage.getUserAchievements(req.user.id);
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  // Leaderboard routes
  app.get('/api/leaderboard', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const topUsers = await storage.getTopUsers(limit);
      res.json(topUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
