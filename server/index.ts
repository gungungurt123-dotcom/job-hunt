import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { OAuth2Client } from 'google-auth-library';
import db, { initializeDB } from './db/database';

const app = express();
const PORT = process.env.PORT || 3001;

// Mock/Fake Client ID for local dev if not provided
const CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID || 'MOCK_CLIENT_ID';
const client = new OAuth2Client(CLIENT_ID);

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database
initializeDB();

// -- API Routes --

// ========== Authentication ==========
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    
    let payload;
    if (CLIENT_ID === 'MOCK_CLIENT_ID') {
      // For local development without a real Client ID, we decode the JWT loosely 
      // instead of strictly verifying the signature against Google's certs.
      // (Do NOT do this in production!)
      const jwtDecoded = JSON.parse(Buffer.from(credential.split('.')[1], 'base64').toString());
      payload = jwtDecoded;
    } else {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: CLIENT_ID,
      });
      payload = ticket.getPayload();
    }
    
    if (!payload) {
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    const { sub: google_id, email, name, picture: avatar } = payload;

    // Check if user exists
    let user = db.prepare('SELECT * FROM users WHERE google_id = ?').get(google_id) as any;
    
    if (!user) {
      // Create new user
      const stmt = db.prepare('INSERT INTO users (google_id, email, name, avatar) VALUES (?, ?, ?, ?)');
      const info = stmt.run(google_id, email, name, avatar);
      user = { id: info.lastInsertRowid, google_id, email, name, avatar };
    } else {
      // Update existing user details just in case they changed
      db.prepare('UPDATE users SET name = ?, avatar = ? WHERE id = ?').run(name, avatar, user.id);
      user.name = name;
      user.avatar = avatar;
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// ========== Companies ==========
app.get('/api/companies', (req, res) => {
  const companies = db.prepare('SELECT * FROM companies ORDER BY created_at DESC').all();
  res.json(companies);
});

app.post('/api/companies', (req, res) => {
  const { name, sector, location, status } = req.body;
  const stmt = db.prepare('INSERT INTO companies (name, sector, location, status) VALUES (?, ?, ?, ?)');
  const info = stmt.run(name, sector, location, status || 'ブックマーク');
  res.status(201).json({ id: info.lastInsertRowid });
});

app.put('/api/companies/:id', (req, res) => {
  const { name, sector, location, status } = req.body;
  const stmt = db.prepare('UPDATE companies SET name = ?, sector = ?, location = ?, status = ? WHERE id = ?');
  stmt.run(name, sector, location, status, req.params.id);
  res.json({ success: true });
});

app.delete('/api/companies/:id', (req, res) => {
  db.prepare('DELETE FROM companies WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ========== ES Repository ==========
app.get('/api/es', (req, res) => {
  const ess = db.prepare(`
    SELECT e.*, c.name as company_name, c.sector as company_sector 
    FROM es_repository e 
    LEFT JOIN companies c ON e.company_id = c.id 
    ORDER BY e.created_at DESC
  `).all();
  res.json(ess);
});

app.post('/api/es', (req, res) => {
  const { company_id, title, category, words, content } = req.body;
  const stmt = db.prepare('INSERT INTO es_repository (company_id, title, category, words, content) VALUES (?, ?, ?, ?, ?)');
  const info = stmt.run(company_id || null, title, category, words, content);
  res.status(201).json({ id: info.lastInsertRowid });
});

app.put('/api/es/:id', (req, res) => {
  const { company_id, title, category, words, content } = req.body;
  const stmt = db.prepare('UPDATE es_repository SET company_id = ?, title = ?, category = ?, words = ?, content = ? WHERE id = ?');
  stmt.run(company_id || null, title, category, words, content, req.params.id);
  res.json({ success: true });
});

app.delete('/api/es/:id', (req, res) => {
  db.prepare('DELETE FROM es_repository WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ========== Tasks ==========
app.get('/api/tasks', (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const { type, title, date, company, completed } = req.body;
  const stmt = db.prepare('INSERT INTO tasks (type, title, date, company, completed) VALUES (?, ?, ?, ?, ?)');
  const info = stmt.run(type, title, date, company, completed ? 1 : 0);
  res.status(201).json({ id: info.lastInsertRowid });
});

app.put('/api/tasks/:id', (req, res) => {
  const { type, title, date, company, completed } = req.body;
  const stmt = db.prepare('UPDATE tasks SET type = ?, title = ?, date = ?, company = ?, completed = ? WHERE id = ?');
  stmt.run(type, title, date, company, completed ? 1 : 0, req.params.id);
  res.json({ success: true });
});

app.delete('/api/tasks/:id', (req, res) => {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Helper function to safely parse completed boolean status
app.put('/api/tasks/:id/toggle', (req, res) => {
  const { id } = req.params;
  const current = db.prepare('SELECT completed FROM tasks WHERE id = ?').get(id) as { completed: number };
  if (!current) {
    return res.status(404).json({ error: 'Task not found' });
  }
  const newStatus = current.completed ? 0 : 1;
  db.prepare('UPDATE tasks SET completed = ? WHERE id = ?').run(newStatus, id);
  res.json({ id, completed: !!newStatus });
});

// GET statistics (Dashboard)
app.get('/api/stats', (req, res) => {
  try {
    // 1. Active companies (excluding 'ブックマーク' and purely '内定' maybe, but let's just count all for now as "選考中" if not just bookmark, or maybe all companies is better?)
    // Actually, let's count companies that are NOT 'ブックマーク' and NOT '内定' as active.
    const activeCompanies = db.prepare(`SELECT count(*) as count FROM companies WHERE status != 'ブックマーク' AND status != '内定'`).get() as { count: number };
    
    // 2. ES Submitted
    const esCount = db.prepare(`SELECT count(*) as count FROM es_repository`).get() as { count: number };
    
    // 3. Upcoming Interviews
    const interviewCount = db.prepare(`SELECT count(*) as count FROM tasks WHERE type = '面接' AND completed = 0`).get() as { count: number };
    
    // 4. Pending Tasks / Deadlines
    const taskCount = db.prepare(`SELECT count(*) as count FROM tasks WHERE type IN ('タスク', '締切') AND completed = 0`).get() as { count: number };

    res.json({
      activeCompanies: activeCompanies.count || 0,
      esSubmitted: esCount.count || 0,
      upcomingInterviews: interviewCount.count || 0,
      pendingTasks: taskCount.count || 0
    });
  } catch (error) {
    console.error('Failed to get stats', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ========== Production Static File Serving ==========
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve Vite-built frontend in production
const distPath = path.resolve(__dirname, '..', 'dist');
app.use(express.static(distPath));

// SPA catch-all: any non-API route serves index.html (for React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
